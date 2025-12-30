import { db } from './config'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where 
} from 'firebase/firestore'

export interface ArticleFactureFournisseur {
  articleId?: string
  articleCode?: string
  description: string
  quantite: number
  prixUnitaire: number
  montantHT: number
  tauxTVA: number
  montantTVA: number
  montantTTC: number
}

export interface FactureFournisseur {
  id: string
  numero: string
  date: string
  dateReception: string
  dateEcheance: string
  datePaiement?: string
  
  // FOURNISSEUR
  fournisseur: string
  fournisseurSiret?: string
  fournisseurAdresse?: string
  
  // CATÉGORIE COMPTABLE
  categorie: 'carburant' | 'entretien' | 'pieces' | 'fournitures' | 'prestations' | 'assurances' | 'autre'
  
  // MONTANTS
  montantHT: number
  montantTVA: number
  montantTTC: number
  
  // ARTICLES (si applicable)
  articles: ArticleFactureFournisseur[]
  
  // LIEN AVEC STOCK/MAINTENANCE
  mouvementStockId?: string // Si entrée stock
  interventionMaintenanceId?: string // Si réparation véhicule
  
  // DOCUMENT
  documentUrl?: string // PDF facture uploadé
  documentNom?: string
  
  // PAIEMENT
  modePaiement?: 'virement' | 'cheque' | 'carte' | 'prelevement'
  referencePaiement?: string
  ligneBancaireId?: string // Lien avec ligne bancaire (rapprochement)
  
  // STATUT
  statut: 'a_payer' | 'payee' | 'en_retard' | 'annulee'
  
  // NOTES
  notes?: string
  
  // METADATA
  createdAt: string
  updatedAt: string
}

export interface FactureFournisseurInput {
  numero: string
  date: string
  dateReception?: string
  dateEcheance?: string
  fournisseur: string
  fournisseurSiret?: string
  fournisseurAdresse?: string
  categorie: FactureFournisseur['categorie']
  montantHT: number
  montantTVA: number
  montantTTC: number
  articles?: ArticleFactureFournisseur[]
  mouvementStockId?: string
  interventionMaintenanceId?: string
  documentUrl?: string
  documentNom?: string
  notes?: string
  statut?: FactureFournisseur['statut']
}

/**
 * Récupérer toutes les factures fournisseurs
 */
export async function getAllFacturesFournisseurs(): Promise<FactureFournisseur[]> {
  try {
    const facturesRef = collection(db, 'factures_fournisseurs')
    const q = query(facturesRef, orderBy('date', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FactureFournisseur))
  } catch (error) {
    console.error('Erreur récupération factures fournisseurs:', error)
    throw error
  }
}

/**
 * Récupérer une facture fournisseur par ID
 */
export async function getFactureFournisseurById(id: string): Promise<FactureFournisseur | null> {
  try {
    const factureRef = doc(db, 'factures_fournisseurs', id)
    const factureSnap = await getDoc(factureRef)
    
    if (!factureSnap.exists()) {
      return null
    }
    
    return {
      id: factureSnap.id,
      ...factureSnap.data()
    } as FactureFournisseur
  } catch (error) {
    console.error('Erreur récupération facture fournisseur:', error)
    throw error
  }
}

/**
 * Récupérer les factures d'un fournisseur
 */
export async function getFacturesByFournisseur(fournisseur: string): Promise<FactureFournisseur[]> {
  try {
    const facturesRef = collection(db, 'factures_fournisseurs')
    const q = query(
      facturesRef,
      where('fournisseur', '==', fournisseur),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FactureFournisseur))
  } catch (error) {
    console.error('Erreur récupération factures fournisseur:', error)
    throw error
  }
}

/**
 * Créer une nouvelle facture fournisseur
 */
export async function createFactureFournisseur(factureData: FactureFournisseurInput): Promise<string> {
  try {
    // Date réception = aujourdhui si pas fournie
    const dateReception = factureData.dateReception || new Date().toISOString().split('T')[0]
    
    // Date échéance = date facture + 30 jours si pas fournie
    let dateEcheance = factureData.dateEcheance
    if (!dateEcheance) {
      const echeance = new Date(factureData.date)
      echeance.setDate(echeance.getDate() + 30)
      dateEcheance = echeance.toISOString().split('T')[0]
    }
    
    const facture: any = {
      numero: factureData.numero,
      date: factureData.date,
      dateReception,
      dateEcheance,
      fournisseur: factureData.fournisseur,
      categorie: factureData.categorie,
      montantHT: factureData.montantHT,
      montantTVA: factureData.montantTVA,
      montantTTC: factureData.montantTTC,
      articles: factureData.articles || [],
      statut: factureData.statut || 'a_payer',
      notes: factureData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Champs optionnels
    if (factureData.fournisseurSiret) facture.fournisseurSiret = factureData.fournisseurSiret
    if (factureData.fournisseurAdresse) facture.fournisseurAdresse = factureData.fournisseurAdresse
    if (factureData.mouvementStockId) facture.mouvementStockId = factureData.mouvementStockId
    if (factureData.interventionMaintenanceId) facture.interventionMaintenanceId = factureData.interventionMaintenanceId
    if (factureData.documentUrl) facture.documentUrl = factureData.documentUrl
    if (factureData.documentNom) facture.documentNom = factureData.documentNom
    
    const factureRef = doc(collection(db, 'factures_fournisseurs'))
    await setDoc(factureRef, facture)
    
    return factureRef.id
  } catch (error) {
    console.error('Erreur création facture fournisseur:', error)
    throw error
  }
}

/**
 * Modifier une facture fournisseur
 */
export async function updateFactureFournisseur(
  id: string,
  factureData: Partial<FactureFournisseurInput>
): Promise<void> {
  try {
    const factureRef = doc(db, 'factures_fournisseurs', id)
    const updates: any = {
      updatedAt: new Date().toISOString()
    }
    
    if (factureData.numero !== undefined) updates.numero = factureData.numero
    if (factureData.date !== undefined) updates.date = factureData.date
    if (factureData.dateReception !== undefined) updates.dateReception = factureData.dateReception
    if (factureData.dateEcheance !== undefined) updates.dateEcheance = factureData.dateEcheance
    if (factureData.fournisseur !== undefined) updates.fournisseur = factureData.fournisseur
    if (factureData.fournisseurSiret !== undefined) updates.fournisseurSiret = factureData.fournisseurSiret
    if (factureData.fournisseurAdresse !== undefined) updates.fournisseurAdresse = factureData.fournisseurAdresse
    if (factureData.categorie !== undefined) updates.categorie = factureData.categorie
    if (factureData.montantHT !== undefined) updates.montantHT = factureData.montantHT
    if (factureData.montantTVA !== undefined) updates.montantTVA = factureData.montantTVA
    if (factureData.montantTTC !== undefined) updates.montantTTC = factureData.montantTTC
    if (factureData.articles !== undefined) updates.articles = factureData.articles
    if (factureData.mouvementStockId !== undefined) updates.mouvementStockId = factureData.mouvementStockId
    if (factureData.interventionMaintenanceId !== undefined) updates.interventionMaintenanceId = factureData.interventionMaintenanceId
    if (factureData.documentUrl !== undefined) updates.documentUrl = factureData.documentUrl
    if (factureData.documentNom !== undefined) updates.documentNom = factureData.documentNom
    if (factureData.notes !== undefined) updates.notes = factureData.notes
    if (factureData.statut !== undefined) updates.statut = factureData.statut
    
    await updateDoc(factureRef, updates)
  } catch (error) {
    console.error('Erreur modification facture fournisseur:', error)
    throw error
  }
}

/**
 * Supprimer une facture fournisseur
 */
export async function deleteFactureFournisseur(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'factures_fournisseurs', id))
  } catch (error) {
    console.error('Erreur suppression facture fournisseur:', error)
    throw error
  }
}

/**
 * Marquer une facture comme payée
 */
export async function marquerFactureFournisseurPayee(
  id: string,
  datePaiement: string,
  modePaiement: 'virement' | 'cheque' | 'carte' | 'prelevement',
  referencePaiement?: string,
  ligneBancaireId?: string
): Promise<void> {
  try {
    const updates: any = {
      statut: 'payee',
      datePaiement,
      modePaiement,
      updatedAt: new Date().toISOString()
    }
    
    if (referencePaiement) updates.referencePaiement = referencePaiement
    if (ligneBancaireId) updates.ligneBancaireId = ligneBancaireId
    
    await updateDoc(doc(db, 'factures_fournisseurs', id), updates)
  } catch (error) {
    console.error('Erreur marquage facture payée:', error)
    throw error
  }
}

/**
 * Récupérer les factures à payer
 */
export async function getFacturesFournisseursAPayer(): Promise<FactureFournisseur[]> {
  try {
    const facturesRef = collection(db, 'factures_fournisseurs')
    const q = query(
      facturesRef,
      where('statut', 'in', ['a_payer', 'en_retard']),
      orderBy('dateEcheance', 'asc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FactureFournisseur))
  } catch (error) {
    console.error('Erreur récupération factures à payer:', error)
    throw error
  }
}

/**
 * Récupérer les factures en retard
 */
export async function getFacturesFournisseursEnRetard(): Promise<FactureFournisseur[]> {
  try {
    const factures = await getFacturesFournisseursAPayer()
    const aujourdhui = new Date()
    
    return factures.filter(f => {
      const echeance = new Date(f.dateEcheance)
      return aujourdhui > echeance && f.statut === 'a_payer'
    })
  } catch (error) {
    console.error('Erreur récupération factures en retard:', error)
    throw error
  }
}

/**
 * Calculer statistiques factures fournisseurs
 */
export async function getStatistiquesFacturesFournisseurs(
  dateDebut?: string,
  dateFin?: string
): Promise<{
  totalMontant: number
  totalPaye: number
  totalAPayer: number
  parCategorie: Record<string, number>
  parFournisseur: Record<string, number>
}> {
  try {
    let factures = await getAllFacturesFournisseurs()
    
    // Filtrer par dates si spécifiées
    if (dateDebut || dateFin) {
      factures = factures.filter(facture => {
        const dateFacture = new Date(facture.date)
        if (dateDebut && dateFacture < new Date(dateDebut)) return false
        if (dateFin && dateFacture > new Date(dateFin)) return false
        return true
      })
    }
    
    const stats = {
      totalMontant: 0,
      totalPaye: 0,
      totalAPayer: 0,
      parCategorie: {} as Record<string, number>,
      parFournisseur: {} as Record<string, number>
    }
    
    factures.forEach(facture => {
      stats.totalMontant += facture.montantTTC
      
      if (facture.statut === 'payee') {
        stats.totalPaye += facture.montantTTC
      } else if (facture.statut === 'a_payer' || facture.statut === 'en_retard') {
        stats.totalAPayer += facture.montantTTC
      }
      
      // Par catégorie
      if (!stats.parCategorie[facture.categorie]) {
        stats.parCategorie[facture.categorie] = 0
      }
      stats.parCategorie[facture.categorie] += facture.montantTTC
      
      // Par fournisseur
      if (!stats.parFournisseur[facture.fournisseur]) {
        stats.parFournisseur[facture.fournisseur] = 0
      }
      stats.parFournisseur[facture.fournisseur] += facture.montantTTC
    })
    
    return stats
  } catch (error) {
    console.error('Erreur calcul statistiques:', error)
    throw error
  }
}
