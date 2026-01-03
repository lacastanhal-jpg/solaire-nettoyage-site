import { db } from './config'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { getAllComptesBancaires, getAllLignesBancaires } from './lignes-bancaires'
import type { Facture } from './factures'
import type { FactureFournisseur } from './factures-fournisseurs'

/**
 * Interface pour une ligne de prévision journalière
 */
export interface PrevisionJour {
  date: string // Format ISO "2026-01-03"
  soldeReel: number // Solde réel connu (ou 0 si dans le futur)
  encaissementsPrevisionnels: number
  decaissementsPrevisionnels: number
  soldePrevu: number
  alerte: 'aucune' | 'warning' | 'critique'
  details: {
    facturesClientsAttendues: Array<{
      numero: string
      clientNom: string
      montant: number
      dateEcheance: string
    }>
    facturesFournisseursAttendues: Array<{
      numero: string
      fournisseurNom: string
      montant: number
      dateEcheance: string
    }>
  }
}

/**
 * Interface pour les statistiques du prévisionnel
 */
export interface StatistiquesPrevisionnel {
  soldeActuel: number
  soldeDans30Jours: number
  soldeDans60Jours: number
  soldeDans90Jours: number
  totalEncaissementsPrevisionnels: number
  totalDecaissementsPrevisionnels: number
  nombreFacturesClientsEnAttente: number
  nombreFacturesFournisseursEnAttente: number
  joursAvantSoldeNegatif: number | null // null si jamais négatif
  alertes: Array<{
    type: 'warning' | 'critique'
    message: string
    date: string
  }>
}

/**
 * Récupérer les factures clients non payées avec date échéance
 */
async function getFacturesClientsEnAttente(): Promise<Array<{
  id: string
  numero: string
  clientNom: string
  montantTTC: number
  dateEcheance: string
  dateEmission: string  // Date d'émission de la facture
}>> {
  try {
    const facturesRef = collection(db, 'factures')
    const q = query(
      facturesRef,
      where('statut', 'in', ['envoyée', 'relancée'])
    )
    
    const snapshot = await getDocs(q)
    const factures: any[] = []
    
    snapshot.docs.forEach(doc => {
      const data = doc.data() as Facture
      
      // Calculer date échéance (30 jours après émission par défaut)
      let dateEcheance = data.dateEcheance
      if (!dateEcheance && data.date) {
        const emission = new Date(data.date)
        emission.setDate(emission.getDate() + 30) // +30 jours par défaut
        dateEcheance = emission.toISOString().split('T')[0]
      }
      
      if (dateEcheance) {
        factures.push({
          id: doc.id,
          numero: data.numero || doc.id,
          clientNom: data.clientNom || 'Client inconnu',
          montantTTC: data.totalTTC || 0,
          dateEcheance: dateEcheance,
          dateEmission: data.date || ''  // Date d'émission
        })
      }
    })
    
    return factures
  } catch (error) {
    console.error('Erreur récupération factures clients:', error)
    return []
  }
}

/**
 * Récupérer les factures fournisseurs non payées avec date échéance
 */
async function getFacturesFournisseursEnAttente(): Promise<Array<{
  id: string
  numero: string
  fournisseurNom: string
  montantTTC: number
  dateEcheance: string
  dateFacture: string
}>> {
  try {
    const facturesRef = collection(db, 'factures_fournisseurs')
    const q = query(
      facturesRef,
      where('statut', 'in', ['en_attente', 'validée'])
    )
    
    const snapshot = await getDocs(q)
    const factures: any[] = []
    
    snapshot.docs.forEach(doc => {
      const data = doc.data() as any
      
      // Calculer date échéance (30 jours après facture par défaut)
      let dateEcheance = data.dateEcheance || data.datePaiementPrevue
      if (!dateEcheance && data.dateFacture) {
        const facture = new Date(data.dateFacture)
        facture.setDate(facture.getDate() + 30) // +30 jours par défaut
        dateEcheance = facture.toISOString().split('T')[0]
      }
      
      if (dateEcheance) {
        factures.push({
          id: doc.id,
          numero: data.numeroFacture || data.numero || doc.id,
          fournisseurNom: data.fournisseurNom || 'Fournisseur inconnu',
          montantTTC: data.montantTTC || data.totalTTC || 0,
          dateEcheance: dateEcheance,
          dateFacture: data.dateFacture || ''
        })
      }
    })
    
    return factures
  } catch (error) {
    console.error('Erreur récupération factures fournisseurs:', error)
    return []
  }
}

/**
 * Générer le prévisionnel de trésorerie sur N jours
 */
export async function genererPrevisionnelTresorerie(
  nombreJours: number = 90
): Promise<PrevisionJour[]> {
  try {
    // 1. Récupérer solde actuel
    const comptes = await getAllComptesBancaires()
    const soldeActuel = comptes
      .filter(c => c.actif)
      .reduce((sum, c) => sum + c.solde, 0)
    
    // 2. Récupérer historique transactions (pour solde réel passé)
    const lignes = await getAllLignesBancaires()
    const lignesTriees = lignes.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    // 3. Récupérer factures en attente
    const [facturesClients, facturesFournisseurs] = await Promise.all([
      getFacturesClientsEnAttente(),
      getFacturesFournisseursEnAttente()
    ])
    
    // 4. Construire prévision jour par jour
    const previsions: PrevisionJour[] = []
    const aujourdhui = new Date()
    aujourdhui.setHours(0, 0, 0, 0)
    
    let soldeCourant = soldeActuel
    
    for (let i = 0; i <= nombreJours; i++) {
      const dateJour = new Date(aujourdhui)
      dateJour.setDate(dateJour.getDate() + i)
      const dateStr = dateJour.toISOString().split('T')[0]
      
      // Solde réel (si jour passé ou aujourd'hui)
      let soldeReel = 0
      if (i === 0) {
        soldeReel = soldeActuel
      } else if (dateJour <= aujourdhui) {
        // Calculer solde réel depuis l'historique
        const transactionsJusquaCeJour = lignesTriees.filter(l => 
          new Date(l.date) <= dateJour
        )
        soldeReel = transactionsJusquaCeJour.reduce((sum, l) => sum + l.montant, 0)
      }
      
      // Encaissements prévisionnels ce jour
      const facturesClientsCeJour = facturesClients.filter(f => f.dateEcheance === dateStr)
      const encaissementsPrevisionnels = facturesClientsCeJour.reduce((sum, f) => sum + f.montantTTC, 0)
      
      // Décaissements prévisionnels ce jour
      const facturesFournisseursCeJour = facturesFournisseurs.filter(f => f.dateEcheance === dateStr)
      const decaissementsPrevisionnels = facturesFournisseursCeJour.reduce((sum, f) => sum + f.montantTTC, 0)
      
      // Calculer solde prévu
      soldeCourant = soldeCourant + encaissementsPrevisionnels - decaissementsPrevisionnels
      
      // Déterminer niveau d'alerte
      let alerte: 'aucune' | 'warning' | 'critique' = 'aucune'
      if (soldeCourant < 0) {
        alerte = 'critique'
      } else if (soldeCourant < 10000) {
        alerte = 'warning'
      }
      
      previsions.push({
        date: dateStr,
        soldeReel: soldeReel,
        encaissementsPrevisionnels,
        decaissementsPrevisionnels,
        soldePrevu: soldeCourant,
        alerte,
        details: {
          facturesClientsAttendues: facturesClientsCeJour.map(f => ({
            numero: f.numero,
            clientNom: f.clientNom,
            montant: f.montantTTC,
            dateEcheance: f.dateEcheance
          })),
          facturesFournisseursAttendues: facturesFournisseursCeJour.map(f => ({
            numero: f.numero,
            fournisseurNom: f.fournisseurNom,
            montant: f.montantTTC,
            dateEcheance: f.dateEcheance
          }))
        }
      })
    }
    
    return previsions
  } catch (error) {
    console.error('Erreur génération prévisionnel:', error)
    return []
  }
}

/**
 * Obtenir les statistiques du prévisionnel
 */
export async function getStatistiquesPrevisionnel(): Promise<StatistiquesPrevisionnel> {
  try {
    const previsions = await genererPrevisionnelTresorerie(90)
    
    if (previsions.length === 0) {
      throw new Error('Aucune prévision disponible')
    }
    
    // Soldes à différentes échéances
    const soldeActuel = previsions[0]?.soldePrevu || 0
    const soldeDans30Jours = previsions[30]?.soldePrevu || 0
    const soldeDans60Jours = previsions[60]?.soldePrevu || 0
    const soldeDans90Jours = previsions[89]?.soldePrevu || 0
    
    // Totaux encaissements et décaissements
    const totalEncaissementsPrevisionnels = previsions.reduce(
      (sum, p) => sum + p.encaissementsPrevisionnels, 0
    )
    const totalDecaissementsPrevisionnels = previsions.reduce(
      (sum, p) => sum + p.decaissementsPrevisionnels, 0
    )
    
    // Nombre de factures en attente
    const [facturesClients, facturesFournisseurs] = await Promise.all([
      getFacturesClientsEnAttente(),
      getFacturesFournisseursEnAttente()
    ])
    
    // Jours avant solde négatif
    let joursAvantSoldeNegatif: number | null = null
    for (let i = 0; i < previsions.length; i++) {
      if (previsions[i].soldePrevu < 0) {
        joursAvantSoldeNegatif = i
        break
      }
    }
    
    // Alertes
    const alertes: Array<{ type: 'warning' | 'critique'; message: string; date: string }> = []
    
    if (joursAvantSoldeNegatif !== null && joursAvantSoldeNegatif <= 30) {
      alertes.push({
        type: 'critique',
        message: `Solde négatif prévu dans ${joursAvantSoldeNegatif} jours`,
        date: previsions[joursAvantSoldeNegatif].date
      })
    } else if (soldeDans30Jours < 10000) {
      alertes.push({
        type: 'warning',
        message: `Solde bas prévu dans 30 jours: ${soldeDans30Jours.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`,
        date: previsions[30].date
      })
    }
    
    return {
      soldeActuel,
      soldeDans30Jours,
      soldeDans60Jours,
      soldeDans90Jours,
      totalEncaissementsPrevisionnels,
      totalDecaissementsPrevisionnels,
      nombreFacturesClientsEnAttente: facturesClients.length,
      nombreFacturesFournisseursEnAttente: facturesFournisseurs.length,
      joursAvantSoldeNegatif,
      alertes
    }
  } catch (error) {
    console.error('Erreur calcul statistiques prévisionnel:', error)
    throw error
  }
}
