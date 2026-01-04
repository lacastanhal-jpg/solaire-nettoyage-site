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

export interface JustificatifNoteFrais {
  id: string
  type: 'image' | 'pdf'
  url: string
  nom: string
  dateUpload: string
}

/**
 * DONNÉES CARBURANT (extraction OCR)
 */
export interface DonneesCarburant {
  quantiteLitres: number          // 86.84 L
  prixUnitaire: number            // 1.639 €/L
  typeCarburant: string           // Gasoil, SP95, SP98, E10, GPL
  numeroPompe?: string            // Numéro pompe
  immatriculation?: string        // Plaque véhicule
  kmDebut?: number                // Km compteur début
  kmFin?: number                  // Km compteur fin
  kmParcourus?: number            // Calcul auto: kmFin - kmDebut
  consommationL100km?: number     // Calcul auto: (litres / km) × 100
  coutAuKm?: number               // Calcul auto: montant / km
}

/**
 * DONNÉES OCR (métadonnées analyse)
 */
export interface DonneesOCR {
  confiance: number               // 0-100
  typeTicket: string              // essence, restaurant, peage, etc.
  dateAnalyse: string             // Date extraction OCR
  texteComplet?: string           // Texte brut extrait
  validation?: {
    calculCorrect: boolean
    champsManquants: string[]
    avertissements: string[]
  }
}

/**
 * DONNÉES RESTAURANT (extraction OCR)
 */
export interface DonneesRestaurant {
  nombrePersonnes?: number
  articles?: Array<{
    nom: string
    quantite: number
    prixUnitaire: number
    total: number
  }>
}

/**
 * DONNÉES PÉAGE (extraction OCR)
 */
export interface DonneesPeage {
  entree?: string
  sortie?: string
  classe?: string
  trajet?: string
  societe?: string  // VINCI, SANEF, etc.
}

export interface NoteDeFrais {
  id: string
  numero: string
  date: string
  
  // OPÉRATEUR (toi + Axel)
  operateurId: string
  operateurNom: string
  
  // CATÉGORIE
  categorie: 'carburant' | 'peage' | 'repas' | 'hebergement' | 'fournitures' | 'entretien' | 'autre'
  
  // MONTANTS
  montantTTC: number
  montantHT: number
  tauxTVA: number
  montantTVA: number
  tvaRecuperable: boolean // Si oui, déductible en compta
  
  // DÉTAILS
  description: string
  fournisseur?: string
  numeroTicket?: string  // Numéro ticket fournisseur (détection doublons)
  
  // VÉHICULE (si carburant ou péage)
  vehiculeId?: string
  vehiculeImmat?: string
  kmParcourus?: number
  
  // DONNÉES SPÉCIFIQUES PAR TYPE (extraction OCR)
  donneesCarburant?: DonneesCarburant
  donneesRestaurant?: DonneesRestaurant
  donneesPeage?: DonneesPeage
  
  // MÉTADONNÉES OCR
  donneesOCR?: DonneesOCR
  
  // JUSTIFICATIFS
  justificatifs: JustificatifNoteFrais[]
  
  // COMPTABILITÉ
  compteComptable: string  // "6061", "6251", "6256", etc.
  exported: boolean        // Exporté vers comptabilité
  dateExport?: string      // Date export FEC
  
  // WORKFLOW
  statut: 'brouillon' | 'soumise' | 'validee' | 'refusee' | 'remboursee'
  
  // VALIDATION
  dateValidation?: string
  validateurId?: string
  validateurNom?: string
  commentaireValidation?: string
  
  // REMBOURSEMENT
  dateRemboursement?: string
  modeRemboursement?: 'virement' | 'cheque'
  referenceRemboursement?: string
  
  // METADATA
  createdAt: string
  updatedAt: string
}

export interface NoteDeFraisInput {
  operateurId: string
  operateurNom: string
  date: string
  categorie: NoteDeFrais['categorie']
  montantTTC: number
  tauxTVA?: number
  tvaRecuperable?: boolean
  description: string
  fournisseur?: string
  numeroTicket?: string  // Numéro ticket (détection doublons)
  vehiculeId?: string
  vehiculeImmat?: string
  kmParcourus?: number
  
  // DONNÉES STRUCTURÉES (depuis OCR)
  donneesCarburant?: DonneesCarburant
  donneesRestaurant?: DonneesRestaurant
  donneesPeage?: DonneesPeage
  donneesOCR?: DonneesOCR
  
  justificatifs?: JustificatifNoteFrais[]
  statut?: NoteDeFrais['statut']
}

/**
 * Calculer HT et TVA depuis TTC
 */
export function calculateMontantsNoteFrais(
  montantTTC: number,
  tauxTVA: number
): { montantHT: number; montantTVA: number } {
  const montantHT = montantTTC / (1 + tauxTVA / 100)
  const montantTVA = montantTTC - montantHT
  
  return {
    montantHT: Math.round(montantHT * 100) / 100,
    montantTVA: Math.round(montantTVA * 100) / 100
  }
}

/**
 * Obtenir le compte comptable PCG selon la catégorie
 */
export function getCompteComptable(
  categorie: NoteDeFrais['categorie'],
  donneesCarburant?: DonneesCarburant
): string {
  // Si carburant ET type renseigné → sous-compte spécifique
  if (categorie === 'carburant' && donneesCarburant?.typeCarburant) {
    return getCompteComptableCarburant(donneesCarburant.typeCarburant)
  }
  
  // Sinon, comptes standards
  const comptes: Record<string, string> = {
    'carburant': '6061',      // Fournitures non stockables (eau, énergie, carburant)
    'peage': '6251',          // Voyages et déplacements
    'repas': '6256',          // Missions
    'hebergement': '6256',    // Missions
    'fournitures': '6064',    // Fournitures administratives
    'entretien': '6155',      // Entretien et réparations sur biens mobiliers
    'autre': '6288'           // Autres services divers
  }
  return comptes[categorie] || '6288'
}

/**
 * Obtenir le sous-compte carburant selon le type
 */
export function getCompteComptableCarburant(typeCarburant: string): string {
  const type = typeCarburant.toUpperCase().trim()
  const comptes: Record<string, string> = {
    'GASOIL': '606100',      // Gasoil véhicules
    'GAZOLE': '606100',      // Gasoil (synonyme)
    'DIESEL': '606100',      // Diesel (synonyme)
    'SP95': '606101',        // Essence SP95
    'SP98': '606101',        // Essence SP98
    'E10': '606101',         // Essence E10
    'SANS_PLOMB': '606101',  // Sans plomb (générique)
    'E85': '606102',         // Bioéthanol E85
    'GPL': '606103',         // GPL
    'ADBLUE': '606104',      // AdBlue (urée)
    'FUEL': '606105',        // Fuel domestique (cuves)
    'FIOUL': '606105',       // Fioul (synonyme)
    'ELECTRIQUE': '606106',  // Électricité véhicules
    'HYBRIDE': '606101',     // Hybride → essence par défaut
  }
  
  return comptes[type] || '6061'  // Par défaut carburant générique
}

/**
 * Détecter un doublon par numéro de ticket
 */
export async function detecterDoublonParTicket(
  numeroTicket: string,
  fournisseur?: string
): Promise<NoteDeFrais | null> {
  try {
    // Si pas de numéro ticket → impossible détecter
    if (!numeroTicket || numeroTicket.trim() === '') {
      return null
    }
    
    const notesRef = collection(db, 'notes_de_frais')
    const allNotes = await getDocs(notesRef)
    
    for (const docSnap of allNotes.docs) {
      const note = { id: docSnap.id, ...docSnap.data() } as NoteDeFrais
      
      // Vérifier numéro ticket exact
      if (note.numeroTicket === numeroTicket) {
        // Si fournisseur renseigné, vérifier aussi pour confirmation
        if (fournisseur && note.fournisseur) {
          const fournisseur1 = fournisseur.toLowerCase().trim()
          const fournisseur2 = note.fournisseur.toLowerCase().trim()
          if (fournisseur1 === fournisseur2) {
            return note // DOUBLON CONFIRMÉ
          }
        } else {
          return note // DOUBLON DÉTECTÉ (même sans fournisseur)
        }
      }
    }
    
    return null // Pas de doublon
  } catch (error) {
    console.error('Erreur détection doublon:', error)
    return null
  }
}

/**
 * Générer le prochain numéro de note de frais
 * Format: NF-AAAAMMJJ-NNN (ex: NF-20260104-001)
 */
export async function generateNoteFraisNumero(): Promise<string> {
  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const datePrefix = `${year}${month}${day}`  // 20260104
    
    const notesRef = collection(db, 'notes_de_frais')
    const q = query(
      notesRef,
      where('numero', '>=', `NF-${datePrefix}-`),
      where('numero', '<', `NF-${datePrefix}-999`),
      orderBy('numero', 'desc')
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return `NF-${datePrefix}-001`
    }
    
    const lastNumero = snapshot.docs[0].data().numero
    const lastNumber = parseInt(lastNumero.split('-')[2])  // Prend le compteur (3ème partie)
    const nextNumber = (lastNumber + 1).toString().padStart(3, '0')
    
    return `NF-${datePrefix}-${nextNumber}`
  } catch (error) {
    console.error('Erreur génération numéro note de frais:', error)
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const timestamp = Date.now().toString().slice(-3)
    return `NF-${year}${month}${day}-${timestamp}`
  }
}

/**
 * Récupérer toutes les notes de frais
 */
export async function getAllNotesDeFrais(): Promise<NoteDeFrais[]> {
  try {
    const notesRef = collection(db, 'notes_de_frais')
    const q = query(notesRef, orderBy('date', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NoteDeFrais))
  } catch (error) {
    console.error('Erreur récupération notes de frais:', error)
    throw error
  }
}

/**
 * Récupérer une note de frais par ID
 */
export async function getNoteDeFraisById(id: string): Promise<NoteDeFrais | null> {
  try {
    const noteRef = doc(db, 'notes_de_frais', id)
    const noteSnap = await getDoc(noteRef)
    
    if (!noteSnap.exists()) {
      return null
    }
    
    return {
      id: noteSnap.id,
      ...noteSnap.data()
    } as NoteDeFrais
  } catch (error) {
    console.error('Erreur récupération note de frais:', error)
    throw error
  }
}

/**
 * Récupérer les notes de frais d'un opérateur
 */
export async function getNotesDeFraisByOperateur(operateurId: string): Promise<NoteDeFrais[]> {
  try {
    const notesRef = collection(db, 'notes_de_frais')
    const q = query(
      notesRef,
      where('operateurId', '==', operateurId),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NoteDeFrais))
  } catch (error) {
    console.error('Erreur récupération notes opérateur:', error)
    throw error
  }
}

/**
 * Créer une nouvelle note de frais
 */
export async function createNoteDeFrais(noteData: NoteDeFraisInput): Promise<string> {
  try {
    // ⚠️ VÉRIFIER DOUBLON PAR NUMÉRO TICKET AVANT CRÉATION
    if (noteData.numeroTicket) {
      const doublon = await detecterDoublonParTicket(
        noteData.numeroTicket,
        noteData.fournisseur
      )
      
      if (doublon) {
        throw new Error(`DOUBLON DÉTECTÉ : Ce ticket a déjà été enregistré dans la note ${doublon.numero}`)
      }
    }
    
    const numero = await generateNoteFraisNumero()
    const tauxTVA = noteData.tauxTVA || 20
    const montants = calculateMontantsNoteFrais(noteData.montantTTC, tauxTVA)
    const compteComptable = getCompteComptable(noteData.categorie, noteData.donneesCarburant)
    
    const note: any = {
      numero,
      date: noteData.date,
      operateurId: noteData.operateurId,
      operateurNom: noteData.operateurNom,
      categorie: noteData.categorie,
      montantTTC: noteData.montantTTC,
      montantHT: montants.montantHT,
      tauxTVA,
      montantTVA: montants.montantTVA,
      tvaRecuperable: noteData.tvaRecuperable !== false, // Par défaut true
      description: noteData.description,
      justificatifs: noteData.justificatifs || [],
      
      // COMPTABILITÉ
      compteComptable,
      exported: false,
      
      statut: noteData.statut || 'brouillon',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Champs optionnels
    if (noteData.fournisseur) note.fournisseur = noteData.fournisseur
    if (noteData.numeroTicket) note.numeroTicket = noteData.numeroTicket  // Stockage numéro ticket
    if (noteData.vehiculeId) note.vehiculeId = noteData.vehiculeId
    if (noteData.vehiculeImmat) note.vehiculeImmat = noteData.vehiculeImmat
    if (noteData.kmParcourus) note.kmParcourus = noteData.kmParcourus
    
    // DONNÉES STRUCTURÉES (depuis OCR)
    if (noteData.donneesCarburant) note.donneesCarburant = noteData.donneesCarburant
    if (noteData.donneesRestaurant) note.donneesRestaurant = noteData.donneesRestaurant
    if (noteData.donneesPeage) note.donneesPeage = noteData.donneesPeage
    if (noteData.donneesOCR) note.donneesOCR = noteData.donneesOCR
    
    const noteRef = doc(collection(db, 'notes_de_frais'))
    await setDoc(noteRef, note)
    
    return noteRef.id
  } catch (error) {
    console.error('Erreur création note de frais:', error)
    throw error
  }
}

/**
 * Modifier une note de frais
 */
export async function updateNoteDeFrais(id: string, noteData: Partial<NoteDeFraisInput>): Promise<void> {
  try {
    const noteRef = doc(db, 'notes_de_frais', id)
    const updates: any = {
      updatedAt: new Date().toISOString()
    }
    
    if (noteData.date !== undefined) updates.date = noteData.date
    if (noteData.categorie !== undefined) {
      updates.categorie = noteData.categorie
      // Recalculer compte avec données carburant si modifiées
      updates.compteComptable = getCompteComptable(noteData.categorie, noteData.donneesCarburant)
    }
    if (noteData.description !== undefined) updates.description = noteData.description
    if (noteData.fournisseur !== undefined) updates.fournisseur = noteData.fournisseur
    if (noteData.vehiculeId !== undefined) updates.vehiculeId = noteData.vehiculeId
    if (noteData.vehiculeImmat !== undefined) updates.vehiculeImmat = noteData.vehiculeImmat
    if (noteData.kmParcourus !== undefined) updates.kmParcourus = noteData.kmParcourus
    if (noteData.tvaRecuperable !== undefined) updates.tvaRecuperable = noteData.tvaRecuperable
    if (noteData.statut !== undefined) updates.statut = noteData.statut
    if (noteData.justificatifs !== undefined) updates.justificatifs = noteData.justificatifs
    
    // DONNÉES STRUCTURÉES
    if (noteData.donneesCarburant !== undefined) updates.donneesCarburant = noteData.donneesCarburant
    if (noteData.donneesRestaurant !== undefined) updates.donneesRestaurant = noteData.donneesRestaurant
    if (noteData.donneesPeage !== undefined) updates.donneesPeage = noteData.donneesPeage
    if (noteData.donneesOCR !== undefined) updates.donneesOCR = noteData.donneesOCR
    
    // Recalculer montants si montantTTC change
    if (noteData.montantTTC !== undefined) {
      const tauxTVA = noteData.tauxTVA || 20
      const montants = calculateMontantsNoteFrais(noteData.montantTTC, tauxTVA)
      updates.montantTTC = noteData.montantTTC
      updates.montantHT = montants.montantHT
      updates.tauxTVA = tauxTVA
      updates.montantTVA = montants.montantTVA
    }
    
    await updateDoc(noteRef, updates)
  } catch (error) {
    console.error('Erreur modification note de frais:', error)
    throw error
  }
}

/**
 * Supprimer une note de frais
 * @param id - ID de la note
 * @param force - Si true, permet de supprimer même une note validée/remboursée
 */
export async function deleteNoteDeFrais(id: string, force: boolean = false): Promise<void> {
  try {
    // Vérifier le statut avant suppression (sauf si force = true)
    if (!force) {
      const note = await getNoteDeFraisById(id)
      if (note) {
        if (note.statut === 'validee' || note.statut === 'remboursee') {
          throw new Error(
            `Impossible de supprimer une note ${note.statut}. ` +
            `Utilisez la suppression forcée si nécessaire.`
          )
        }
        if (note.exported) {
          throw new Error(
            'Impossible de supprimer une note déjà exportée en comptabilité. ' +
            'Utilisez la suppression forcée si nécessaire.'
          )
        }
      }
    }
    
    await deleteDoc(doc(db, 'notes_de_frais', id))
  } catch (error) {
    console.error('Erreur suppression note de frais:', error)
    throw error
  }
}

/**
 * Soumettre une note de frais (brouillon → soumise)
 */
export async function soumettreNoteDeFrais(id: string): Promise<void> {
  try {
    const noteRef = doc(db, 'notes_de_frais', id)
    const noteSnap = await getDoc(noteRef)
    
    if (!noteSnap.exists()) {
      throw new Error('Note de frais introuvable')
    }
    
    const note = noteSnap.data() as NoteDeFrais
    
    if (note.statut !== 'brouillon') {
      throw new Error('Seules les notes en brouillon peuvent être soumises')
    }
    
    await updateDoc(noteRef, {
      statut: 'soumise',
      dateSoumission: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur soumission note de frais:', error)
    throw error
  }
}

/**
 * Valider une note de frais
 */
export async function validerNoteDeFrais(
  id: string,
  validateurId: string,
  validateurNom: string,
  commentaire?: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'notes_de_frais', id), {
      statut: 'validee',
      dateValidation: new Date().toISOString().split('T')[0],
      validateurId,
      validateurNom,
      commentaireValidation: commentaire || '',
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur validation note de frais:', error)
    throw error
  }
}

/**
 * Refuser une note de frais
 */
export async function refuserNoteDeFrais(
  id: string,
  validateurId: string,
  validateurNom: string,
  motif: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'notes_de_frais', id), {
      statut: 'refusee',
      dateValidation: new Date().toISOString().split('T')[0],
      validateurId,
      validateurNom,
      commentaireValidation: motif,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur refus note de frais:', error)
    throw error
  }
}

/**
 * Marquer une note de frais comme remboursée
 */
export async function marquerNoteDeFraisRemboursee(
  id: string,
  modeRemboursement: 'virement' | 'cheque',
  referenceRemboursement?: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'notes_de_frais', id), {
      statut: 'remboursee',
      dateRemboursement: new Date().toISOString().split('T')[0],
      modeRemboursement,
      referenceRemboursement: referenceRemboursement || '',
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur marquage remboursement:', error)
    throw error
  }
}

/**
 * Récupérer les notes de frais en attente de validation
 */
export async function getNotesDeFraisEnAttente(): Promise<NoteDeFrais[]> {
  try {
    const notesRef = collection(db, 'notes_de_frais')
    const q = query(
      notesRef,
      where('statut', '==', 'soumise'),
      orderBy('date', 'asc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NoteDeFrais))
  } catch (error) {
    console.error('Erreur récupération notes en attente:', error)
    throw error
  }
}

/**
 * Récupérer les notes de frais validées non remboursées
 */
export async function getNotesDeFraisARembourser(): Promise<NoteDeFrais[]> {
  try {
    const notesRef = collection(db, 'notes_de_frais')
    const q = query(
      notesRef,
      where('statut', '==', 'validee'),
      orderBy('dateValidation', 'asc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NoteDeFrais))
  } catch (error) {
    console.error('Erreur récupération notes à rembourser:', error)
    throw error
  }
}

/**
 * Ajouter un justificatif
 */
export async function addJustificatif(
  noteFraisId: string,
  justificatif: Omit<JustificatifNoteFrais, 'id'>
): Promise<void> {
  try {
    const note = await getNoteDeFraisById(noteFraisId)
    if (!note) throw new Error('Note de frais introuvable')
    
    const nouveauJustificatif: JustificatifNoteFrais = {
      id: `just_${Date.now()}`,
      ...justificatif,
      dateUpload: new Date().toISOString()
    }
    
    await updateDoc(doc(db, 'notes_de_frais', noteFraisId), {
      justificatifs: [...note.justificatifs, nouveauJustificatif],
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur ajout justificatif:', error)
    throw error
  }
}

/**
 * Supprimer un justificatif
 */
export async function deleteJustificatif(
  noteFraisId: string,
  justificatifId: string
): Promise<void> {
  try {
    const note = await getNoteDeFraisById(noteFraisId)
    if (!note) throw new Error('Note de frais introuvable')
    
    const nouveauxJustificatifs = note.justificatifs.filter(j => j.id !== justificatifId)
    
    await updateDoc(doc(db, 'notes_de_frais', noteFraisId), {
      justificatifs: nouveauxJustificatifs,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur suppression justificatif:', error)
    throw error
  }
}

/**
 * Calculer statistiques notes de frais
 */
export async function getStatistiquesNotesDeFrais(
  operateurId?: string,
  dateDebut?: string,
  dateFin?: string
): Promise<{
  totalMontant: number
  totalTVARecuperable: number
  parCategorie: Record<string, number>
  parStatut: Record<string, number>
}> {
  try {
    let notes: NoteDeFrais[]
    
    if (operateurId) {
      notes = await getNotesDeFraisByOperateur(operateurId)
    } else {
      notes = await getAllNotesDeFrais()
    }
    
    // Filtrer par dates si spécifiées
    if (dateDebut || dateFin) {
      notes = notes.filter(note => {
        const dateNote = new Date(note.date)
        if (dateDebut && dateNote < new Date(dateDebut)) return false
        if (dateFin && dateNote > new Date(dateFin)) return false
        return true
      })
    }
    
    const stats = {
      totalMontant: 0,
      totalTVARecuperable: 0,
      parCategorie: {} as Record<string, number>,
      parStatut: {} as Record<string, number>
    }
    
    notes.forEach(note => {
      stats.totalMontant += note.montantTTC
      
      if (note.tvaRecuperable) {
        stats.totalTVARecuperable += note.montantTVA
      }
      
      // Par catégorie
      if (!stats.parCategorie[note.categorie]) {
        stats.parCategorie[note.categorie] = 0
      }
      stats.parCategorie[note.categorie] += note.montantTTC
      
      // Par statut
      if (!stats.parStatut[note.statut]) {
        stats.parStatut[note.statut] = 0
      }
      stats.parStatut[note.statut] += note.montantTTC
    })
    
    return stats
  } catch (error) {
    console.error('Erreur calcul statistiques:', error)
    throw error
  }
}

/**
 * CALCULS AUTOMATIQUES CARBURANT
 */

/**
 * Calculer consommation L/100km
 */
export function calculerConsommationCarburant(
  quantiteLitres: number,
  kmParcourus: number
): number {
  if (kmParcourus <= 0) return 0
  return (quantiteLitres / kmParcourus) * 100
}

/**
 * Calculer coût au km
 */
export function calculerCoutAuKm(
  montantTTC: number,
  kmParcourus: number
): number {
  if (kmParcourus <= 0) return 0
  return montantTTC / kmParcourus
}

/**
 * Enrichir données carburant avec calculs automatiques
 */
export function enrichirDonneesCarburant(
  donneesCarburant: DonneesCarburant,
  montantTTC: number
): DonneesCarburant {
  const enrichi = { ...donneesCarburant }
  
  // Calculer km parcourus si début et fin renseignés
  if (enrichi.kmDebut && enrichi.kmFin) {
    enrichi.kmParcourus = enrichi.kmFin - enrichi.kmDebut
  }
  
  // Calculer consommation si km et litres disponibles
  if (enrichi.kmParcourus && enrichi.kmParcourus > 0 && enrichi.quantiteLitres > 0) {
    enrichi.consommationL100km = calculerConsommationCarburant(
      enrichi.quantiteLitres,
      enrichi.kmParcourus
    )
  }
  
  // Calculer coût/km si km disponibles
  if (enrichi.kmParcourus && enrichi.kmParcourus > 0) {
    enrichi.coutAuKm = calculerCoutAuKm(montantTTC, enrichi.kmParcourus)
  }
  
  return enrichi
}

/**
 * Valider cohérence données carburant
 */
export function validerDonneesCarburant(
  donneesCarburant: DonneesCarburant,
  montantTTC: number
): { valide: boolean; erreurs: string[] } {
  const erreurs: string[] = []
  
  // Vérifier calcul quantité × prix ≈ montant
  if (donneesCarburant.quantiteLitres && donneesCarburant.prixUnitaire) {
    const montantCalcule = donneesCarburant.quantiteLitres * donneesCarburant.prixUnitaire
    const difference = Math.abs(montantCalcule - montantTTC)
    
    if (difference > 0.50) { // Tolérance 0.50€
      erreurs.push(
        `Incohérence montant: ${donneesCarburant.quantiteLitres}L × ${donneesCarburant.prixUnitaire}€ = ${montantCalcule.toFixed(2)}€ ≠ ${montantTTC}€`
      )
    }
  }
  
  // Vérifier km cohérents
  if (donneesCarburant.kmDebut && donneesCarburant.kmFin) {
    if (donneesCarburant.kmFin <= donneesCarburant.kmDebut) {
      erreurs.push('Km fin doit être > Km début')
    }
    
    const kmParcourus = donneesCarburant.kmFin - donneesCarburant.kmDebut
    if (kmParcourus > 1000) {
      erreurs.push(`Km parcourus anormalement élevé: ${kmParcourus} km`)
    }
  }
  
  // Vérifier consommation cohérente
  if (donneesCarburant.consommationL100km) {
    if (donneesCarburant.consommationL100km < 3 || donneesCarburant.consommationL100km > 30) {
      erreurs.push(
        `Consommation anormale: ${donneesCarburant.consommationL100km.toFixed(1)} L/100km`
      )
    }
  }
  
  return {
    valide: erreurs.length === 0,
    erreurs
  }
}



/**
 * ========================================
 * STATISTIQUES AVANCÉES DASHBOARD
 * ========================================
 */

/**
 * Interface statistiques dashboard complètes
 */
export interface StatistiquesDashboard {
  totalMoisActuel: number
  totalMoisPrecedent: number
  evolutionPourcentage: number
  totalAnnee: number
  nombreNotesTotal: number
  
  parCategorie: Array<{
    categorie: string
    montant: number
    pourcentage: number
    nombre: number
  }>
  
  parOperateur: Array<{
    operateurId: string
    operateurNom: string
    montantTotal: number
    nombreNotes: number
    moyenneParNote: number
  }>
  
  evolutionMensuelle: Array<{
    mois: string
    moisLabel: string
    montant: number
    nombre: number
  }>
  
  topDepenses: Array<{
    id: string
    date: string
    operateurNom: string
    categorie: string
    fournisseur: string
    montantTTC: number
  }>
  
  parStatut: Record<string, {
    nombre: number
    montant: number
  }>
}

function formatMoisLabel(mois: string): string {
  const [annee, moisNum] = mois.split('-')
  const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  return `${moisNoms[parseInt(moisNum) - 1]} ${annee}`
}

export async function getStatistiquesDashboard(): Promise<StatistiquesDashboard> {
  const toutesLesNotes = await getAllNotesDeFrais()
  const maintenant = new Date()
  const moisActuelDebut = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)
  const moisActuelFin = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0, 23, 59, 59)
  const moisPrecedentDebut = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1)
  const moisPrecedentFin = new Date(maintenant.getFullYear(), maintenant.getMonth(), 0, 23, 59, 59)
  const debutAnnee = new Date(maintenant.getFullYear(), 0, 1)
  
  const notesMoisActuel = toutesLesNotes.filter(n => {
    const d = new Date(n.date)
    return d >= moisActuelDebut && d <= moisActuelFin
  })
  const totalMoisActuel = notesMoisActuel.reduce((s, n) => s + n.montantTTC, 0)
  
  const notesMoisPrecedent = toutesLesNotes.filter(n => {
    const d = new Date(n.date)
    return d >= moisPrecedentDebut && d <= moisPrecedentFin
  })
  const totalMoisPrecedent = notesMoisPrecedent.reduce((s, n) => s + n.montantTTC, 0)
  
  const evolutionPourcentage = totalMoisPrecedent > 0 ? ((totalMoisActuel - totalMoisPrecedent) / totalMoisPrecedent) * 100 : 0
  
  const notesAnnee = toutesLesNotes.filter(n => new Date(n.date) >= debutAnnee)
  const totalAnnee = notesAnnee.reduce((s, n) => s + n.montantTTC, 0)
  
  const categoriesMap = new Map<string, { montant: number; nombre: number }>()
  toutesLesNotes.forEach(n => {
    const ex = categoriesMap.get(n.categorie) || { montant: 0, nombre: 0 }
    categoriesMap.set(n.categorie, { montant: ex.montant + n.montantTTC, nombre: ex.nombre + 1 })
  })
  const totalGeneral = toutesLesNotes.reduce((s, n) => s + n.montantTTC, 0)
  const parCategorie = Array.from(categoriesMap.entries()).map(([categorie, data]) => ({
    categorie,
    montant: data.montant,
    nombre: data.nombre,
    pourcentage: totalGeneral > 0 ? (data.montant / totalGeneral) * 100 : 0
  })).sort((a, b) => b.montant - a.montant)
  
  const operateursMap = new Map<string, { nom: string; montant: number; nombre: number }>()
  toutesLesNotes.forEach(n => {
    const ex = operateursMap.get(n.operateurId) || { nom: n.operateurNom, montant: 0, nombre: 0 }
    operateursMap.set(n.operateurId, { nom: n.operateurNom, montant: ex.montant + n.montantTTC, nombre: ex.nombre + 1 })
  })
  const parOperateur = Array.from(operateursMap.entries()).map(([operateurId, data]) => ({
    operateurId,
    operateurNom: data.nom,
    montantTotal: data.montant,
    nombreNotes: data.nombre,
    moyenneParNote: data.nombre > 0 ? data.montant / data.nombre : 0
  })).sort((a, b) => b.montantTotal - a.montantTotal)
  
  const evolutionMensuelle: Array<{ mois: string; moisLabel: string; montant: number; nombre: number }> = []
  for (let i = 11; i >= 0; i--) {
    const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1)
    const moisDebut = new Date(date.getFullYear(), date.getMonth(), 1)
    const moisFin = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
    const moisKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const notesMois = toutesLesNotes.filter(n => {
      const d = new Date(n.date)
      return d >= moisDebut && d <= moisFin
    })
    evolutionMensuelle.push({
      mois: moisKey,
      moisLabel: formatMoisLabel(moisKey),
      montant: notesMois.reduce((s, n) => s + n.montantTTC, 0),
      nombre: notesMois.length
    })
  }
  
  const topDepenses = toutesLesNotes.sort((a, b) => b.montantTTC - a.montantTTC).slice(0, 10).map(n => ({
    id: n.id,
    date: n.date,
    operateurNom: n.operateurNom,
    categorie: n.categorie,
    fournisseur: n.fournisseur || '-',
    montantTTC: n.montantTTC
  }))
  
  const parStatut: Record<string, { nombre: number; montant: number }> = {}
  toutesLesNotes.forEach(n => {
    if (!parStatut[n.statut]) parStatut[n.statut] = { nombre: 0, montant: 0 }
    parStatut[n.statut].nombre++
    parStatut[n.statut].montant += n.montantTTC
  })
  
  return {
    totalMoisActuel,
    totalMoisPrecedent,
    evolutionPourcentage,
    totalAnnee,
    nombreNotesTotal: toutesLesNotes.length,
    parCategorie,
    parOperateur,
    evolutionMensuelle,
    topDepenses,
    parStatut
  }
}
