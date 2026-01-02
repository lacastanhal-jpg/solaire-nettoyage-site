import { db } from './config'
import { doc, updateDoc, writeBatch, getDoc } from 'firebase/firestore'
import type { NoteDeFrais } from './notes-de-frais'

/**
 * Résultat de validation en masse
 */
export interface ResultatValidationMasse {
  success: boolean
  notesValidees: string[] // IDs des notes validées avec succès
  notesErreur: Array<{
    noteId: string
    erreur: string
  }>
  totalTraitees: number
}

/**
 * Valider plusieurs notes de frais en une seule opération
 */
export async function validerNotesEnMasse(
  noteIds: string[],
  validateurId: string,
  validateurNom: string,
  commentaire?: string
): Promise<ResultatValidationMasse> {
  const notesValidees: string[] = []
  const notesErreur: Array<{ noteId: string; erreur: string }> = []
  
  try {
    // Utiliser batch pour transaction atomique
    const batch = writeBatch(db)
    
    // Traiter chaque note
    for (const noteId of noteIds) {
      try {
        // Vérifier que la note existe et est soumise
        const noteRef = doc(db, 'notes_de_frais', noteId)
        const noteSnap = await getDoc(noteRef)
        
        if (!noteSnap.exists()) {
          notesErreur.push({
            noteId,
            erreur: 'Note introuvable'
          })
          continue
        }
        
        const note = noteSnap.data() as NoteDeFrais
        
        if (note.statut !== 'soumise') {
          notesErreur.push({
            noteId,
            erreur: `Note déjà ${note.statut}`
          })
          continue
        }
        
        // Ajouter à la transaction
        batch.update(noteRef, {
          statut: 'validee',
          dateValidation: new Date().toISOString(),
          validateurId: validateurId,
          validateurNom: validateurNom,
          commentaireValidation: commentaire || '',
          updatedAt: new Date().toISOString()
        })
        
        notesValidees.push(noteId)
      } catch (error: any) {
        notesErreur.push({
          noteId,
          erreur: error.message || 'Erreur inconnue'
        })
      }
    }
    
    // Exécuter la transaction
    if (notesValidees.length > 0) {
      await batch.commit()
    }
    
    return {
      success: notesValidees.length > 0,
      notesValidees,
      notesErreur,
      totalTraitees: noteIds.length
    }
  } catch (error: any) {
    console.error('Erreur validation en masse:', error)
    return {
      success: false,
      notesValidees: [],
      notesErreur: noteIds.map(id => ({
        noteId: id,
        erreur: error.message || 'Erreur transaction'
      })),
      totalTraitees: noteIds.length
    }
  }
}

/**
 * Refuser plusieurs notes de frais en une seule opération
 */
export async function refuserNotesEnMasse(
  noteIds: string[],
  validateurId: string,
  validateurNom: string,
  motifRefus: string
): Promise<ResultatValidationMasse> {
  const notesRefusees: string[] = []
  const notesErreur: Array<{ noteId: string; erreur: string }> = []
  
  if (!motifRefus || motifRefus.trim() === '') {
    return {
      success: false,
      notesValidees: [],
      notesErreur: noteIds.map(id => ({
        noteId: id,
        erreur: 'Motif de refus obligatoire'
      })),
      totalTraitees: noteIds.length
    }
  }
  
  try {
    const batch = writeBatch(db)
    
    for (const noteId of noteIds) {
      try {
        const noteRef = doc(db, 'notes_de_frais', noteId)
        const noteSnap = await getDoc(noteRef)
        
        if (!noteSnap.exists()) {
          notesErreur.push({
            noteId,
            erreur: 'Note introuvable'
          })
          continue
        }
        
        const note = noteSnap.data() as NoteDeFrais
        
        if (note.statut !== 'soumise') {
          notesErreur.push({
            noteId,
            erreur: `Note déjà ${note.statut}`
          })
          continue
        }
        
        batch.update(noteRef, {
          statut: 'refusee',
          dateValidation: new Date().toISOString(),
          validateurId: validateurId,
          validateurNom: validateurNom,
          commentaireValidation: motifRefus,
          updatedAt: new Date().toISOString()
        })
        
        notesRefusees.push(noteId)
      } catch (error: any) {
        notesErreur.push({
          noteId,
          erreur: error.message || 'Erreur inconnue'
        })
      }
    }
    
    if (notesRefusees.length > 0) {
      await batch.commit()
    }
    
    return {
      success: notesRefusees.length > 0,
      notesValidees: notesRefusees,
      notesErreur,
      totalTraitees: noteIds.length
    }
  } catch (error: any) {
    console.error('Erreur refus en masse:', error)
    return {
      success: false,
      notesValidees: [],
      notesErreur: noteIds.map(id => ({
        noteId: id,
        erreur: error.message || 'Erreur transaction'
      })),
      totalTraitees: noteIds.length
    }
  }
}

/**
 * Marquer plusieurs notes comme remboursées en une seule opération
 */
export async function rembourserNotesEnMasse(
  noteIds: string[],
  modeRemboursement: 'virement' | 'cheque',
  reference: string
): Promise<ResultatValidationMasse> {
  const notesRemboursees: string[] = []
  const notesErreur: Array<{ noteId: string; erreur: string }> = []
  
  try {
    const batch = writeBatch(db)
    const dateRemboursement = new Date().toISOString()
    
    for (const noteId of noteIds) {
      try {
        const noteRef = doc(db, 'notes_de_frais', noteId)
        const noteSnap = await getDoc(noteRef)
        
        if (!noteSnap.exists()) {
          notesErreur.push({
            noteId,
            erreur: 'Note introuvable'
          })
          continue
        }
        
        const note = noteSnap.data() as NoteDeFrais
        
        if (note.statut !== 'validee') {
          notesErreur.push({
            noteId,
            erreur: `Note doit être validée (actuellement ${note.statut})`
          })
          continue
        }
        
        batch.update(noteRef, {
          statut: 'remboursee',
          dateRemboursement: dateRemboursement,
          modeRemboursement: modeRemboursement,
          referenceRemboursement: reference,
          updatedAt: new Date().toISOString()
        })
        
        notesRemboursees.push(noteId)
      } catch (error: any) {
        notesErreur.push({
          noteId,
          erreur: error.message || 'Erreur inconnue'
        })
      }
    }
    
    if (notesRemboursees.length > 0) {
      await batch.commit()
    }
    
    return {
      success: notesRemboursees.length > 0,
      notesValidees: notesRemboursees,
      notesErreur,
      totalTraitees: noteIds.length
    }
  } catch (error: any) {
    console.error('Erreur remboursement en masse:', error)
    return {
      success: false,
      notesValidees: [],
      notesErreur: noteIds.map(id => ({
        noteId: id,
        erreur: error.message || 'Erreur transaction'
      })),
      totalTraitees: noteIds.length
    }
  }
}
