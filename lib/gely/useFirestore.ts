// Hook custom pour gérer les données GELY avec Firebase
import { useState, useEffect } from 'react'
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Projet } from './types'

// Hook pour récupérer tous les projets en temps réel
export function useProjets() {
  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    try {
      const q = query(collection(db, 'projets'))
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const data = snapshot.docs.map(doc => {
            const projetData = doc.data()
            return {
              id: doc.id,
              ...projetData,
              // Valeurs par défaut pour HT/TTC
              budgetTotal: projetData.budgetTotal || 0,
              budgetTotalHT: projetData.budgetTotalHT || 0,
              totalPaye: projetData.totalPaye || 0,
              totalPayeHT: projetData.totalPayeHT || 0,
              totalAPayer: projetData.totalAPayer || 0,
              totalAPayerHT: projetData.totalAPayerHT || 0,
              reste: projetData.reste || 0,
              resteHT: projetData.resteHT || 0,
              totalDevis: projetData.totalDevis || 0,
              totalDevisHT: projetData.totalDevisHT || 0,
              totalFactures: projetData.totalFactures || 0,
              totalFacturesHT: projetData.totalFacturesHT || 0,
            }
          }) as Projet[]
          
          setProjets(data)
          setLoading(false)
        },
        (err) => {
          console.error('Erreur Firestore:', err)
          setError(err as Error)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error('Erreur hook:', err)
      setError(err as Error)
      setLoading(false)
    }
  }, [])

  return { projets, loading, error }
}

// Hook pour récupérer un projet spécifique
export function useProjet(projetId: string) {
  const [projet, setProjet] = useState<Projet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!projetId) {
      setLoading(false)
      return
    }

    try {
      const docRef = doc(db, 'projets', projetId)
      
      const unsubscribe = onSnapshot(docRef,
        (doc) => {
          if (doc.exists()) {
            setProjet({ id: doc.id, ...doc.data() } as Projet)
          } else {
            setProjet(null)
          }
          setLoading(false)
        },
        (err) => {
          console.error('Erreur Firestore:', err)
          setError(err as Error)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error('Erreur hook:', err)
      setError(err as Error)
      setLoading(false)
    }
  }, [projetId])

  return { projet, loading, error }
}

// Hook pour récupérer les lignes financières d'un projet
export function useLignesFinancieres(projetId: string) {
  const [lignes, setLignes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!projetId) {
      setLoading(false)
      return
    }

    try {
      const q = query(
        collection(db, 'lignesFinancieres'),
        where('projetId', '==', projetId)
      )
      
      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          
          setLignes(data)
          setLoading(false)
        },
        (err) => {
          console.error('Erreur Firestore:', err)
          setError(err as Error)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error('Erreur hook:', err)
      setError(err as Error)
      setLoading(false)
    }
  }, [projetId])

  return { lignes, loading, error }
}

// Fonction pour ajouter un projet
export async function ajouterProjet(projet: Omit<Projet, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'projets'), projet)
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Erreur ajout projet:', error)
    return { success: false, error }
  }
}

// Fonction pour modifier un projet
export async function modifierProjet(projetId: string, data: Partial<Projet>) {
  try {
    await updateDoc(doc(db, 'projets', projetId), data)
    return { success: true }
  } catch (error) {
    console.error('Erreur modification projet:', error)
    return { success: false, error }
  }
}

// Fonction pour supprimer un projet
export async function supprimerProjet(projetId: string) {
  try {
    await deleteDoc(doc(db, 'projets', projetId))
    return { success: true }
  } catch (error) {
    console.error('Erreur suppression projet:', error)
    return { success: false, error }
  }
}

// Fonction pour ajouter une ligne financière
export async function ajouterLigneFinanciere(projetId: string, ligne: any) {
  try {
    const docRef = await addDoc(collection(db, 'lignesFinancieres'), {
      ...ligne,
      projetId
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Erreur ajout ligne:', error)
    return { success: false, error }
  }
}

// Fonction pour modifier une ligne financière
export async function modifierLigneFinanciere(ligneId: string, data: any) {
  try {
    await updateDoc(doc(db, 'lignesFinancieres', ligneId), data)
    return { success: true }
  } catch (error) {
    console.error('Erreur modification ligne:', error)
    return { success: false, error }
  }
}

// Fonction pour supprimer une ligne financière
export async function supprimerLigneFinanciere(ligneId: string) {
  try {
    await deleteDoc(doc(db, 'lignesFinancieres', ligneId))
    return { success: true }
  } catch (error) {
    console.error('Erreur suppression ligne:', error)
    return { success: false, error }
  }
}

// Fonction pour recalculer les totaux d'un projet
export async function recalculerTotauxProjet(projetId: string) {
  try {
    // Récupérer toutes les lignes du projet
    const q = query(
      collection(db, 'lignesFinancieres'),
      where('projetId', '==', projetId)
    )
    const snapshot = await getDocs(q)
    const lignes = snapshot.docs.map(doc => doc.data())

    // Calculer les totaux
    let totalDevis = 0, totalDevisHT = 0
    let totalFactures = 0, totalFacturesHT = 0
    let totalPaye = 0, totalPayeHT = 0
    let totalAPayer = 0, totalAPayerHT = 0

    lignes.forEach(ligne => {
      if (ligne.type === 'devis' && ligne.statut === 'signe') {
        totalDevis += ligne.montantTTC || 0
        totalDevisHT += ligne.montantHT || 0
      }
      if (ligne.type === 'facture') {
        totalFactures += ligne.montantTTC || 0
        totalFacturesHT += ligne.montantHT || 0
        
        if (ligne.statut === 'paye') {
          totalPaye += ligne.montantTTC || 0
          totalPayeHT += ligne.montantHT || 0
        } else if (ligne.statut === 'a_payer') {
          totalAPayer += ligne.montantTTC || 0
          totalAPayerHT += ligne.montantHT || 0
        }
      }
    })

    // Récupérer le budget initial du projet
    const projetDoc = await getDocs(query(collection(db, 'projets'), where('__name__', '==', projetId)))
    const projetData = projetDoc.docs[0]?.data()
    const budgetInitial = projetData?.budgetInitial || 0
    const budgetInitialHT = projetData?.budgetInitialHT || (budgetInitial / 1.2)

    // Budget auto-ajusté
    const budgetTotal = Math.max(budgetInitial, totalDevis + totalFactures)
    const budgetTotalHT = Math.max(budgetInitialHT, totalDevisHT + totalFacturesHT)

    // Reste budget
    const reste = budgetTotal - totalDevis - totalFactures
    const resteHT = budgetTotalHT - totalDevisHT - totalFacturesHT

    // Mettre à jour le projet
    await updateDoc(doc(db, 'projets', projetId), {
      budgetTotal,
      budgetTotalHT,
      totalDevis,
      totalDevisHT,
      totalFactures,
      totalFacturesHT,
      totalPaye,
      totalPayeHT,
      totalAPayer,
      totalAPayerHT,
      reste,
      resteHT
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur recalcul totaux:', error)
    return { success: false, error }
  }
}
