import { db } from './config'
import { 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore'

/**
 * Interface pour les résultats de calcul TVA
 */
export interface CalculTVA {
  // TVA Collectée (ventes)
  tvaCollectee20: number
  tvaCollectee10: number
  tvaCollectee55: number
  totalTVACollectee: number
  
  // TVA Déductible (achats)
  tvaDeductible20: number
  tvaDeductible10: number
  tvaDeductible55: number
  totalTVADeductible: number
  
  // Solde TVA
  soldeTVA: number  // Positif = à payer, Négatif = crédit
  
  // Détails
  nombreFacturesVentes: number
  nombreFacturesAchats: number
  caHT: number
  achatsHT: number
}

/**
 * Interface pour les détails d'une facture
 */
interface FactureDetail {
  id: string
  numero: string
  date: string
  montantHT: number
  tauxTVA: number
  montantTVA: number
  montantTTC: number
}

/**
 * Calculer la TVA pour une période donnée
 */
export async function calculerTVAPeriode(
  dateDebut: string,
  dateFin: string,
  societeId?: string
): Promise<CalculTVA> {
  try {
    // Calculer TVA collectée (factures clients)
    const tvaCollectee = await calculerTVACollectee(dateDebut, dateFin, societeId)
    
    // Calculer TVA déductible (factures fournisseurs + notes de frais)
    const tvaDeductible = await calculerTVADeductible(dateDebut, dateFin, societeId)
    
    // Calculer le solde TVA
    const soldeTVA = tvaCollectee.total - tvaDeductible.total
    
    return {
      // TVA Collectée
      tvaCollectee20: tvaCollectee.tva20,
      tvaCollectee10: tvaCollectee.tva10,
      tvaCollectee55: tvaCollectee.tva55,
      totalTVACollectee: tvaCollectee.total,
      
      // TVA Déductible
      tvaDeductible20: tvaDeductible.tva20,
      tvaDeductible10: tvaDeductible.tva10,
      tvaDeductible55: tvaDeductible.tva55,
      totalTVADeductible: tvaDeductible.total,
      
      // Solde
      soldeTVA,
      
      // Détails
      nombreFacturesVentes: tvaCollectee.nombreFactures,
      nombreFacturesAchats: tvaDeductible.nombreFactures,
      caHT: tvaCollectee.baseHT,
      achatsHT: tvaDeductible.baseHT
    }
  } catch (error) {
    console.error('Erreur calcul TVA période:', error)
    throw error
  }
}

/**
 * Calculer la TVA collectée (factures clients)
 */
async function calculerTVACollectee(
  dateDebut: string,
  dateFin: string,
  societeId?: string
): Promise<{
  tva20: number
  tva10: number
  tva55: number
  total: number
  baseHT: number
  nombreFactures: number
}> {
  try {
    const facturesRef = collection(db, 'factures')
    
    let q = query(
      facturesRef,
      where('date', '>=', dateDebut),
      where('date', '<=', dateFin),
      where('statut', '!=', 'brouillon'),
      orderBy('statut'),
      orderBy('date', 'desc')
    )
    
    if (societeId) {
      q = query(q, where('societeId', '==', societeId))
    }
    
    const snapshot = await getDocs(q)
    
    let tva20 = 0
    let tva10 = 0
    let tva55 = 0
    let baseHT = 0
    
    snapshot.docs.forEach(doc => {
      const facture = doc.data()
      
      // Base HT totale
      baseHT += facture.totalHT || 0
      
      // Parcourir les lignes pour calculer TVA par taux
      if (facture.lignes && Array.isArray(facture.lignes)) {
        facture.lignes.forEach((ligne: any) => {
          const tauxTVA = ligne.tva || 20
          const montantTVA = ligne.totalTVA || 0
          
          if (tauxTVA === 20) {
            tva20 += montantTVA
          } else if (tauxTVA === 10) {
            tva10 += montantTVA
          } else if (tauxTVA === 5.5) {
            tva55 += montantTVA
          }
        })
      }
    })
    
    return {
      tva20: parseFloat(tva20.toFixed(2)),
      tva10: parseFloat(tva10.toFixed(2)),
      tva55: parseFloat(tva55.toFixed(2)),
      total: parseFloat((tva20 + tva10 + tva55).toFixed(2)),
      baseHT: parseFloat(baseHT.toFixed(2)),
      nombreFactures: snapshot.size
    }
  } catch (error) {
    console.error('Erreur calcul TVA collectée:', error)
    throw error
  }
}

/**
 * Calculer la TVA déductible (factures fournisseurs + notes de frais)
 */
async function calculerTVADeductible(
  dateDebut: string,
  dateFin: string,
  societeId?: string
): Promise<{
  tva20: number
  tva10: number
  tva55: number
  total: number
  baseHT: number
  nombreFactures: number
}> {
  try {
    let tva20 = 0
    let tva10 = 0
    let tva55 = 0
    let baseHT = 0
    let nombreFactures = 0
    
    // 1. TVA déductible des factures fournisseurs
    const facturesFournisseursRef = collection(db, 'factures_fournisseurs')
    
    let qFactures = query(
      facturesFournisseursRef,
      where('dateFacture', '>=', dateDebut),
      where('dateFacture', '<=', dateFin),
      where('statut', 'in', ['validee', 'payee']),
      orderBy('dateFacture', 'desc')
    )
    
    if (societeId) {
      qFactures = query(qFactures, where('societeId', '==', societeId))
    }
    
    const snapshotFactures = await getDocs(qFactures)
    
    snapshotFactures.docs.forEach(doc => {
      const facture = doc.data()
      
      // Base HT totale
      baseHT += facture.montantHT || 0
      
      // Parcourir les lignes pour calculer TVA par taux
      if (facture.lignes && Array.isArray(facture.lignes)) {
        facture.lignes.forEach((ligne: any) => {
          const tauxTVA = ligne.tauxTVA || 20
          const montantTVA = ligne.montantTVA || 0
          
          if (tauxTVA === 20) {
            tva20 += montantTVA
          } else if (tauxTVA === 10) {
            tva10 += montantTVA
          } else if (tauxTVA === 5.5) {
            tva55 += montantTVA
          }
        })
      }
    })
    
    nombreFactures += snapshotFactures.size
    
    // 2. TVA déductible des notes de frais
    const notesFraisRef = collection(db, 'notes_de_frais')
    
    let qNotes = query(
      notesFraisRef,
      where('date', '>=', dateDebut),
      where('date', '<=', dateFin),
      where('statut', 'in', ['validee', 'remboursee']),
      where('tvaRecuperable', '==', true),
      orderBy('date', 'desc')
    )
    
    if (societeId) {
      qNotes = query(qNotes, where('societeId', '==', societeId))
    }
    
    const snapshotNotes = await getDocs(qNotes)
    
    snapshotNotes.docs.forEach(doc => {
      const note = doc.data()
      
      // Base HT
      baseHT += note.montantHT || 0
      
      // TVA par taux
      const tauxTVA = note.tauxTVA || 20
      const montantTVA = note.montantTVA || 0
      
      if (tauxTVA === 20) {
        tva20 += montantTVA
      } else if (tauxTVA === 10) {
        tva10 += montantTVA
      } else if (tauxTVA === 5.5) {
        tva55 += montantTVA
      }
    })
    
    nombreFactures += snapshotNotes.size
    
    return {
      tva20: parseFloat(tva20.toFixed(2)),
      tva10: parseFloat(tva10.toFixed(2)),
      tva55: parseFloat(tva55.toFixed(2)),
      total: parseFloat((tva20 + tva10 + tva55).toFixed(2)),
      baseHT: parseFloat(baseHT.toFixed(2)),
      nombreFactures
    }
  } catch (error) {
    console.error('Erreur calcul TVA déductible:', error)
    throw error
  }
}

/**
 * Obtenir les détails des factures clients pour une période
 */
export async function getDetailsFacturesClients(
  dateDebut: string,
  dateFin: string,
  societeId?: string
): Promise<FactureDetail[]> {
  try {
    const facturesRef = collection(db, 'factures')
    
    let q = query(
      facturesRef,
      where('date', '>=', dateDebut),
      where('date', '<=', dateFin),
      where('statut', '!=', 'brouillon'),
      orderBy('statut'),
      orderBy('date', 'desc')
    )
    
    if (societeId) {
      q = query(q, where('societeId', '==', societeId))
    }
    
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        numero: data.numero || '',
        date: data.date || '',
        montantHT: data.totalHT || 0,
        tauxTVA: 20, // Approximation
        montantTVA: data.totalTVA || 0,
        montantTTC: data.totalTTC || 0
      }
    })
  } catch (error) {
    console.error('Erreur récupération détails factures clients:', error)
    throw error
  }
}

/**
 * Obtenir les détails des factures fournisseurs pour une période
 */
export async function getDetailsFacturesFournisseurs(
  dateDebut: string,
  dateFin: string,
  societeId?: string
): Promise<FactureDetail[]> {
  try {
    const facturesRef = collection(db, 'factures_fournisseurs')
    
    let q = query(
      facturesRef,
      where('dateFacture', '>=', dateDebut),
      where('dateFacture', '<=', dateFin),
      where('statut', 'in', ['validee', 'payee']),
      orderBy('dateFacture', 'desc')
    )
    
    if (societeId) {
      q = query(q, where('societeId', '==', societeId))
    }
    
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        numero: data.numero || '',
        date: data.dateFacture || '',
        montantHT: data.montantHT || 0,
        tauxTVA: 20, // Approximation
        montantTVA: data.montantTVA || 0,
        montantTTC: data.montantTTC || 0
      }
    })
  } catch (error) {
    console.error('Erreur récupération détails factures fournisseurs:', error)
    throw error
  }
}

/**
 * Calculer la TVA sur 12 mois glissants pour graphique
 */
export async function calculerTVA12Mois(
  societeId?: string
): Promise<Array<{
  mois: string
  tvaCollectee: number
  tvaDeductible: number
  soldeTVA: number
}>> {
  try {
    const resultats: Array<{
      mois: string
      tvaCollectee: number
      tvaDeductible: number
      soldeTVA: number
    }> = []
    
    const now = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      
      const dateDebut = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const dateFin = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      
      const calcul = await calculerTVAPeriode(dateDebut, dateFin, societeId)
      
      resultats.push({
        mois: `${year}-${String(month).padStart(2, '0')}`,
        tvaCollectee: calcul.totalTVACollectee,
        tvaDeductible: calcul.totalTVADeductible,
        soldeTVA: calcul.soldeTVA
      })
    }
    
    return resultats
  } catch (error) {
    console.error('Erreur calcul TVA 12 mois:', error)
    throw error
  }
}
