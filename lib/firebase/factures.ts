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
  where,
  Timestamp 
} from 'firebase/firestore'

export interface LigneFacture {
  siteId: string
  siteNom: string
  articleId: string
  articleCode: string
  articleNom: string
  articleDescription?: string
  quantite: number
  prixUnitaire: number
  tva: number
  totalHT: number
  totalTVA: number
  totalTTC: number
}

export interface PaiementFacture {
  id: string
  date: string
  montant: number
  mode: 'virement' | 'cheque' | 'carte' | 'especes' | 'prelevement'
  reference?: string
  notes?: string
  ligneBancaireId?: string // Lien avec ligne bancaire (rapprochement)
}

export interface RelanceFacture {
  id: string
  type: 'rappel_amiable' | 'relance_1' | 'relance_2' | 'mise_en_demeure'
  date: string
  envoyee: boolean
  destinataire?: string
  objet?: string
  contenu?: string
}

export interface Facture {
  id: string
  numero: string
  societeId: string  // AJOUT : Société émettrice
  date: string
  dateEcheance: string
  datePaiement?: string
  
  // INFORMATIONS CLIENT
  clientId: string
  clientNom: string
  groupeNom?: string
  
  // LIEN AVEC DEVIS (optionnel)
  devisId?: string
  devisNumero?: string
  
  // ACOMPTE
  estAcompte: boolean // true si c'est une facture d'acompte
  pourcentageAcompte?: number // 30% par exemple
  factureAcompteId?: string // Si facture solde, référence vers l'acompte
  montantAcompte?: number // Montant acompte déjà payé (pour facture solde)
  
  // LIGNES
  lignes: LigneFacture[]
  
  // TOTAUX
  totalHT: number
  totalTVA: number
  totalTTC: number
  resteAPayer: number // TTC - paiements effectués
  
  // PAIEMENTS
  paiements: PaiementFacture[]
  
  // RELANCES
  relances: RelanceFacture[]
  
  // STATUT
  statut: 'brouillon' | 'envoyee' | 'partiellement_payee' | 'payee' | 'en_retard' | 'annulee'
  
  // CONDITIONS COMMERCIALES
  conditionsPaiement?: string
  modalitesReglement?: string
  
  // NOTES
  notes?: string
  
  // METADATA
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface FactureInput {
  societeId: string  // AJOUT : Société émettrice
  clientId: string
  clientNom: string
  groupeNom?: string
  devisId?: string
  devisNumero?: string
  dateEcheance?: string
  estAcompte?: boolean
  pourcentageAcompte?: number
  factureAcompteId?: string
  montantAcompte?: number
  lignes: LigneFacture[]
  conditionsPaiement?: string
  modalitesReglement?: string
  notes?: string
  statut?: Facture['statut']
}

/**
 * Générer le prochain numéro de facture
 */
export async function generateFactureNumero(estAcompte: boolean = false): Promise<string> {
  try {
    const year = new Date().getFullYear()
    const prefix = estAcompte ? 'FAC-ACOMPTE' : 'FAC'
    const facturesRef = collection(db, 'factures')
    const q = query(
      facturesRef,
      where('numero', '>=', `${prefix}-${year}-`),
      where('numero', '<', `${prefix}-${year + 1}-`),
      orderBy('numero', 'desc')
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return `${prefix}-${year}-001`
    }
    
    const lastNumero = snapshot.docs[0].data().numero
    const parts = lastNumero.split('-')
    const lastNumber = parseInt(parts[parts.length - 1])
    const nextNumber = (lastNumber + 1).toString().padStart(3, '0')
    
    return `${prefix}-${year}-${nextNumber}`
  } catch (error) {
    console.error('Erreur génération numéro facture:', error)
    return `FAC-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`
  }
}

/**
 * Calculer les totaux d'une facture
 */
export function calculateFactureTotals(lignes: LigneFacture[]): {
  totalHT: number
  totalTVA: number
  totalTTC: number
} {
  const totalHT = lignes.reduce((sum, ligne) => sum + ligne.totalHT, 0)
  const totalTVA = lignes.reduce((sum, ligne) => sum + ligne.totalTVA, 0)
  const totalTTC = lignes.reduce((sum, ligne) => sum + ligne.totalTTC, 0)
  
  return {
    totalHT: Math.round(totalHT * 100) / 100,
    totalTVA: Math.round(totalTVA * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100
  }
}

/**
 * Calculer une ligne de facture
 */
export function calculateLigneFacture(
  quantite: number,
  prixUnitaire: number,
  tva: number
): { totalHT: number; totalTVA: number; totalTTC: number } {
  const totalHT = quantite * prixUnitaire
  const totalTVA = (totalHT * tva) / 100
  const totalTTC = totalHT + totalTVA
  
  return {
    totalHT: Math.round(totalHT * 100) / 100,
    totalTVA: Math.round(totalTVA * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100
  }
}

/**
 * Calculer le reste à payer
 */
export function calculateResteAPayer(totalTTC: number, paiements: PaiementFacture[]): number {
  const totalPaye = paiements.reduce((sum, p) => sum + p.montant, 0)
  return Math.round((totalTTC - totalPaye) * 100) / 100
}

/**
 * Déterminer le statut automatique
 */
export function determineStatut(
  resteAPayer: number,
  dateEcheance: string,
  statutActuel: Facture['statut']
): Facture['statut'] {
  // Garder brouillon et annulée si déjà définis
  if (statutActuel === 'brouillon' || statutActuel === 'annulee') {
    return statutActuel
  }
  
  // Payée complètement
  if (resteAPayer <= 0) {
    return 'payee'
  }
  
  // Partiellement payée
  if (resteAPayer > 0 && resteAPayer < calculateFactureTotals([]).totalTTC) {
    return 'partiellement_payee'
  }
  
  // En retard si échéance dépassée
  const echeance = new Date(dateEcheance)
  const aujourdhui = new Date()
  if (aujourdhui > echeance && resteAPayer > 0) {
    return 'en_retard'
  }
  
  return 'envoyee'
}

/**
 * Récupérer toutes les factures
 */
export async function getAllFactures(): Promise<Facture[]> {
  try {
    const facturesRef = collection(db, 'factures')
    const q = query(facturesRef, orderBy('date', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Facture))
  } catch (error) {
    console.error('Erreur récupération factures:', error)
    throw error
  }
}

/**
 * Récupérer une facture par ID
 */
export async function getFactureById(id: string): Promise<Facture | null> {
  try {
    const factureRef = doc(db, 'factures', id)
    const factureSnap = await getDoc(factureRef)
    
    if (!factureSnap.exists()) {
      return null
    }
    
    return {
      id: factureSnap.id,
      ...factureSnap.data()
    } as Facture
  } catch (error) {
    console.error('Erreur récupération facture:', error)
    throw error
  }
}

/**
 * Récupérer les factures d'un client
 */
export async function getFacturesByClient(clientId: string): Promise<Facture[]> {
  try {
    const facturesRef = collection(db, 'factures')
    const q = query(
      facturesRef,
      where('clientId', '==', clientId),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Facture))
  } catch (error) {
    console.error('Erreur récupération factures client:', error)
    throw error
  }
}

/**
 * Créer une nouvelle facture
 */
export async function createFacture(factureData: FactureInput): Promise<string> {
  try {
    const numero = await generateFactureNumero(factureData.estAcompte || false)
    const totals = calculateFactureTotals(factureData.lignes)
    
    // Calculer date échéance si pas fournie (30 jours par défaut)
    let dateEcheance = factureData.dateEcheance
    if (!dateEcheance) {
      const echeance = new Date()
      echeance.setDate(echeance.getDate() + 30)
      dateEcheance = echeance.toISOString().split('T')[0]
    }
    
    const facture: any = {
      numero,
      societeId: factureData.societeId,  // AJOUT : Société émettrice
      date: new Date().toISOString().split('T')[0],
      dateEcheance,
      clientId: factureData.clientId,
      clientNom: factureData.clientNom,
      lignes: factureData.lignes,
      totalHT: totals.totalHT,
      totalTVA: totals.totalTVA,
      totalTTC: totals.totalTTC,
      resteAPayer: totals.totalTTC - (factureData.montantAcompte || 0),
      paiements: [],
      relances: [],
      statut: factureData.statut || 'brouillon',
      notes: factureData.notes || '',
      estAcompte: factureData.estAcompte || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Champs optionnels
    if (factureData.groupeNom) facture.groupeNom = factureData.groupeNom
    if (factureData.devisId) facture.devisId = factureData.devisId
    if (factureData.devisNumero) facture.devisNumero = factureData.devisNumero
    if (factureData.conditionsPaiement) facture.conditionsPaiement = factureData.conditionsPaiement
    if (factureData.modalitesReglement) facture.modalitesReglement = factureData.modalitesReglement
    if (factureData.pourcentageAcompte) facture.pourcentageAcompte = factureData.pourcentageAcompte
    if (factureData.factureAcompteId) facture.factureAcompteId = factureData.factureAcompteId
    if (factureData.montantAcompte) facture.montantAcompte = factureData.montantAcompte
    
    const factureRef = doc(collection(db, 'factures'))
    await setDoc(factureRef, facture)
    
    return factureRef.id
  } catch (error) {
    console.error('Erreur création facture:', error)
    throw error
  }
}

/**
 * Modifier une facture
 */
export async function updateFacture(id: string, factureData: Partial<FactureInput>): Promise<void> {
  try {
    const factureRef = doc(db, 'factures', id)
    const updates: any = {
      updatedAt: new Date().toISOString()
    }
    
    if (factureData.societeId !== undefined) updates.societeId = factureData.societeId
    if (factureData.clientId !== undefined) updates.clientId = factureData.clientId
    if (factureData.clientNom !== undefined) updates.clientNom = factureData.clientNom
    if (factureData.groupeNom !== undefined) updates.groupeNom = factureData.groupeNom
    if (factureData.dateEcheance !== undefined) updates.dateEcheance = factureData.dateEcheance
    if (factureData.conditionsPaiement !== undefined) updates.conditionsPaiement = factureData.conditionsPaiement
    if (factureData.modalitesReglement !== undefined) updates.modalitesReglement = factureData.modalitesReglement
    if (factureData.notes !== undefined) updates.notes = factureData.notes
    if (factureData.statut !== undefined) updates.statut = factureData.statut
    
    // Recalculer totaux si lignes changent
    if (factureData.lignes) {
      const totals = calculateFactureTotals(factureData.lignes)
      updates.lignes = factureData.lignes
      updates.totalHT = totals.totalHT
      updates.totalTVA = totals.totalTVA
      updates.totalTTC = totals.totalTTC
      
      // Recalculer reste à payer
      const facture = await getFactureById(id)
      if (facture) {
        updates.resteAPayer = calculateResteAPayer(totals.totalTTC, facture.paiements)
      }
    }
    
    await updateDoc(factureRef, updates)
  } catch (error) {
    console.error('Erreur modification facture:', error)
    throw error
  }
}

/**
 * Supprimer une facture
 */
export async function deleteFacture(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'factures', id))
  } catch (error) {
    console.error('Erreur suppression facture:', error)
    throw error
  }
}

/**
 * Ajouter un paiement
 */
export async function addPaiement(
  factureId: string,
  paiement: Omit<PaiementFacture, 'id'>
): Promise<void> {
  try {
    const facture = await getFactureById(factureId)
    if (!facture) throw new Error('Facture introuvable')
    
    const nouveauPaiement: PaiementFacture = {
      id: `pmt_${Date.now()}`,
      ...paiement
    }
    
    const nouveauxPaiements = [...facture.paiements, nouveauPaiement]
    const resteAPayer = calculateResteAPayer(facture.totalTTC, nouveauxPaiements)
    const nouveauStatut = determineStatut(resteAPayer, facture.dateEcheance, facture.statut)
    
    const updates: any = {
      paiements: nouveauxPaiements,
      resteAPayer,
      statut: nouveauStatut,
      updatedAt: new Date().toISOString()
    }
    
    // Si payée complètement, enregistrer date paiement
    if (resteAPayer <= 0) {
      updates.datePaiement = paiement.date
    }
    
    await updateDoc(doc(db, 'factures', factureId), updates)
  } catch (error) {
    console.error('Erreur ajout paiement:', error)
    throw error
  }
}

/**
 * Supprimer un paiement
 */
export async function deletePaiement(factureId: string, paiementId: string): Promise<void> {
  try {
    const facture = await getFactureById(factureId)
    if (!facture) throw new Error('Facture introuvable')
    
    const nouveauxPaiements = facture.paiements.filter(p => p.id !== paiementId)
    const resteAPayer = calculateResteAPayer(facture.totalTTC, nouveauxPaiements)
    const nouveauStatut = determineStatut(resteAPayer, facture.dateEcheance, facture.statut)
    
    await updateDoc(doc(db, 'factures', factureId), {
      paiements: nouveauxPaiements,
      resteAPayer,
      statut: nouveauStatut,
      datePaiement: null,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur suppression paiement:', error)
    throw error
  }
}

/**
 * Ajouter une relance
 */
export async function addRelance(
  factureId: string,
  relance: Omit<RelanceFacture, 'id'>
): Promise<void> {
  try {
    const facture = await getFactureById(factureId)
    if (!facture) throw new Error('Facture introuvable')
    
    const nouvelleRelance: RelanceFacture = {
      id: `rel_${Date.now()}`,
      ...relance
    }
    
    await updateDoc(doc(db, 'factures', factureId), {
      relances: [...facture.relances, nouvelleRelance],
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur ajout relance:', error)
    throw error
  }
}

/**
 * Changer le statut d'une facture
 */
export async function updateFactureStatut(
  id: string,
  statut: Facture['statut']
): Promise<void> {
  try {
    await updateDoc(doc(db, 'factures', id), {
      statut,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur changement statut facture:', error)
    throw error
  }
}

/**
 * Récupérer les factures impayées
 */
export async function getFacturesImpayees(): Promise<Facture[]> {
  try {
    const facturesRef = collection(db, 'factures')
    const q = query(
      facturesRef,
      where('statut', 'in', ['envoyee', 'partiellement_payee', 'en_retard']),
      orderBy('dateEcheance', 'asc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Facture))
  } catch (error) {
    console.error('Erreur récupération factures impayées:', error)
    throw error
  }
}

/**
 * Récupérer les factures nécessitant une relance
 */
export async function getFacturesARelancer(): Promise<Facture[]> {
  try {
    const factures = await getFacturesImpayees()
    const aujourdhui = new Date()
    
    return factures.filter(f => {
      const echeance = new Date(f.dateEcheance)
      const joursRetard = Math.floor((aujourdhui.getTime() - echeance.getTime()) / (1000 * 60 * 60 * 24))
      
      // Relance si échéance dépassée de plus de 8 jours
      return joursRetard >= 8
    })
  } catch (error) {
    console.error('Erreur récupération factures à relancer:', error)
    throw error
  }
}
