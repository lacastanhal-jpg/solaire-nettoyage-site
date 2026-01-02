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
  
  // VÉHICULE (si carburant ou péage)
  vehiculeId?: string
  vehiculeImmat?: string
  kmParcourus?: number
  
  // JUSTIFICATIFS
  justificatifs: JustificatifNoteFrais[]
  
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
  vehiculeId?: string
  vehiculeImmat?: string
  kmParcourus?: number
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
 * Générer le prochain numéro de note de frais
 */
export async function generateNoteFraisNumero(): Promise<string> {
  try {
    const year = new Date().getFullYear()
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
    const notesRef = collection(db, 'notes_de_frais')
    const q = query(
      notesRef,
      where('numero', '>=', `NF-${year}${month}-`),
      where('numero', '<', `NF-${year}${month + 1}-`),
      orderBy('numero', 'desc')
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return `NF-${year}${month}-001`
    }
    
    const lastNumero = snapshot.docs[0].data().numero
    const lastNumber = parseInt(lastNumero.split('-')[1])
    const nextNumber = (lastNumber + 1).toString().padStart(3, '0')
    
    return `NF-${year}${month}-${nextNumber}`
  } catch (error) {
    console.error('Erreur génération numéro note de frais:', error)
    return `NF-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Date.now().toString().slice(-3)}`
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
    const numero = await generateNoteFraisNumero()
    const tauxTVA = noteData.tauxTVA || 20
    const montants = calculateMontantsNoteFrais(noteData.montantTTC, tauxTVA)
    
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
      statut: noteData.statut || 'brouillon',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Champs optionnels
    if (noteData.fournisseur) note.fournisseur = noteData.fournisseur
    if (noteData.vehiculeId) note.vehiculeId = noteData.vehiculeId
    if (noteData.vehiculeImmat) note.vehiculeImmat = noteData.vehiculeImmat
    if (noteData.kmParcourus) note.kmParcourus = noteData.kmParcourus
    
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
    if (noteData.categorie !== undefined) updates.categorie = noteData.categorie
    if (noteData.description !== undefined) updates.description = noteData.description
    if (noteData.fournisseur !== undefined) updates.fournisseur = noteData.fournisseur
    if (noteData.vehiculeId !== undefined) updates.vehiculeId = noteData.vehiculeId
    if (noteData.vehiculeImmat !== undefined) updates.vehiculeImmat = noteData.vehiculeImmat
    if (noteData.kmParcourus !== undefined) updates.kmParcourus = noteData.kmParcourus
    if (noteData.tvaRecuperable !== undefined) updates.tvaRecuperable = noteData.tvaRecuperable
    if (noteData.statut !== undefined) updates.statut = noteData.statut
    if (noteData.justificatifs !== undefined) updates.justificatifs = noteData.justificatifs
    
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
 */
export async function deleteNoteDeFrais(id: string): Promise<void> {
  try {
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
