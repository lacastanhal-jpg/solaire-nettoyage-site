import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from './config'

// Types
export type SocieteType = 'sciGely' | 'lexa' | 'lexa2' | 'solaireNettoyage'
export type DocumentType = 'facture' | 'devis' | 'contrat' | 'administratif' | 'permis' | 'autre'
export type StatutType = 'paye' | 'a_payer' | 'en_cours' | 'signe' | 'brouillon'

export interface DocumentMetadata {
  nom: string
  societe: SocieteType
  projet?: string
  type: DocumentType
  statut: StatutType
  montantHT?: number
  montantTTC?: number
  fournisseur: string
  numero?: string
  date: string
  echeance?: string
  uploadedBy?: string
}

export interface Document extends DocumentMetadata {
  id: string
  fileUrl: string
  fileName: string
  fileType: string
  fileSize?: number
  uploadedAt: string
}

export interface ProjetFinancials {
  devisTotal: number
  devisSigne: number
  facturesTotal: number
  facturesPaye: number
  facturesAPayer: number
  totalEngage: number
  totalPaye: number
  totalReste: number
}

/**
 * Upload un document vers Firebase Storage et Firestore
 */
export async function uploadDocument(file: File, metadata: DocumentMetadata): Promise<Document> {
  try {
    // 1. Upload le fichier vers Storage
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const storageRef = ref(storage, `documents/${metadata.societe}/${metadata.type}/${fileName}`)
    
    await uploadBytes(storageRef, file)
    const fileUrl = await getDownloadURL(storageRef)

    // 2. Créer l'entrée dans Firestore
    const docData = {
      ...metadata,
      fileUrl,
      fileName,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date().toISOString()
    }

    const docRef = await addDoc(collection(db, 'documents'), docData)

    return {
      id: docRef.id,
      ...docData
    }
  } catch (error) {
    console.error('Erreur upload document:', error)
    throw error
  }
}

/**
 * Récupérer tous les documents d'une société
 */
export async function getDocumentsBySociete(societe: SocieteType): Promise<Document[]> {
  try {
    const q = query(
      collection(db, 'documents'),
      where('societe', '==', societe),
      orderBy('uploadedAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const documents: Document[] = []
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      } as Document)
    })
    
    return documents
  } catch (error) {
    console.error('Erreur récupération documents:', error)
    throw error
  }
}

/**
 * Récupérer les documents d'un projet spécifique
 */
export async function getDocumentsByProjet(societe: SocieteType, projet: string): Promise<Document[]> {
  try {
    const q = query(
      collection(db, 'documents'),
      where('societe', '==', societe),
      where('projet', '==', projet),
      orderBy('uploadedAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const documents: Document[] = []
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      } as Document)
    })
    
    return documents
  } catch (error) {
    console.error('Erreur récupération documents projet:', error)
    throw error
  }
}

/**
 * Supprimer un document
 */
export async function deleteDocument(documentId: string, fileUrl: string): Promise<boolean> {
  try {
    // 1. Supprimer le fichier de Storage
    const fileRef = ref(storage, fileUrl)
    await deleteObject(fileRef)

    // 2. Supprimer l'entrée Firestore
    await deleteDoc(doc(db, 'documents', documentId))

    return true
  } catch (error) {
    console.error('Erreur suppression document:', error)
    throw error
  }
}

/**
 * Calculer les totaux financiers d'un projet
 */
export async function getProjetFinancials(societe: SocieteType, projet: string): Promise<ProjetFinancials> {
  try {
    const documents = await getDocumentsByProjet(societe, projet)
    
    const totals: ProjetFinancials = {
      devisTotal: 0,
      devisSigne: 0,
      facturesTotal: 0,
      facturesPaye: 0,
      facturesAPayer: 0,
      totalEngage: 0,
      totalPaye: 0,
      totalReste: 0
    }

    documents.forEach(doc => {
      const montant = doc.montantHT || 0

      if (doc.type === 'devis') {
        totals.devisTotal += montant
        if (doc.statut === 'signe') {
          totals.devisSigne += montant
          totals.totalEngage += montant
        }
      }

      if (doc.type === 'facture') {
        totals.facturesTotal += montant
        if (doc.statut === 'paye') {
          totals.facturesPaye += montant
          totals.totalPaye += montant
        } else if (doc.statut === 'a_payer') {
          totals.facturesAPayer += montant
        }
      }
    })

    totals.totalReste = totals.totalEngage - totals.totalPaye

    return totals
  } catch (error) {
    console.error('Erreur calcul financier:', error)
    throw error
  }
}
