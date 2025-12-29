import { 
  collection, 
  doc, 
  setDoc, 
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { db } from './config'

export interface EmailHistorique {
  id: string
  devisId: string
  date: string
  destinataire: string
  objet: string
  statut: 'envoyé' | 'erreur'
  erreur?: string
  utilisateur: string
}

const EMAILS_COLLECTION = 'emails_historique'

/**
 * Enregistrer un envoi d'email
 */
export async function enregistrerEnvoiEmail(emailData: Omit<EmailHistorique, 'id'>): Promise<string> {
  try {
    const emailRef = doc(collection(db, EMAILS_COLLECTION))
    await setDoc(emailRef, emailData)
    return emailRef.id
  } catch (error) {
    console.error('Erreur enregistrement email:', error)
    throw error
  }
}

/**
 * Récupérer l'historique des emails pour un devis
 */
export async function getEmailsHistorique(devisId: string): Promise<EmailHistorique[]> {
  try {
    const emailsRef = collection(db, EMAILS_COLLECTION)
    const q = query(
      emailsRef, 
      where('devisId', '==', devisId),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as EmailHistorique))
  } catch (error) {
    console.error('Erreur récupération historique emails:', error)
    return []
  }
}
