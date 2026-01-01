import { db } from './config'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc,
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy 
} from 'firebase/firestore'
import type { 
  GrilleTarifaire, 
  GrilleTarifaireInput,
  TypeGrille
} from '@/lib/types/tarification'

const COLLECTION = 'grilles_tarifaires'

/**
 * Créer une nouvelle grille tarifaire
 */
export async function createGrilleTarifaire(
  data: GrilleTarifaireInput
): Promise<string> {
  try {
    const grille: any = {
      nom: data.nom,
      type: data.type,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin || null,
      lignes: data.lignes,
      priorite: data.priorite || 10,
      actif: data.actif !== undefined ? data.actif : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Ajouter entiteId et entiteNom seulement s'ils sont définis
    if (data.entiteId) {
      grille.entiteId = data.entiteId
    }
    if (data.entiteNom) {
      grille.entiteNom = data.entiteNom
    }
    if (data.conditionsParticulieres) {
      grille.conditionsParticulieres = data.conditionsParticulieres
    }
    
    const docRef = await addDoc(collection(db, COLLECTION), grille)
    return docRef.id
  } catch (error) {
    console.error('Erreur création grille tarifaire:', error)
    throw error
  }
}

/**
 * Récupérer toutes les grilles tarifaires
 */
export async function getAllGrillesTarifaires(): Promise<GrilleTarifaire[]> {
  try {
    const grillesRef = collection(db, COLLECTION)
    const q = query(grillesRef, orderBy('priorite', 'asc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GrilleTarifaire))
  } catch (error) {
    console.error('Erreur récupération grilles tarifaires:', error)
    throw error
  }
}

/**
 * Récupérer les grilles actives
 */
export async function getGrillesActives(): Promise<GrilleTarifaire[]> {
  try {
    const grillesRef = collection(db, COLLECTION)
    const q = query(
      grillesRef,
      where('actif', '==', true),
      orderBy('priorite', 'asc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GrilleTarifaire))
  } catch (error) {
    console.error('Erreur récupération grilles actives:', error)
    throw error
  }
}

/**
 * Récupérer une grille par ID
 */
export async function getGrilleTarifaireById(
  id: string
): Promise<GrilleTarifaire | null> {
  try {
    const grilleRef = doc(db, COLLECTION, id)
    const grilleSnap = await getDoc(grilleRef)
    
    if (!grilleSnap.exists()) {
      return null
    }
    
    return {
      id: grilleSnap.id,
      ...grilleSnap.data()
    } as GrilleTarifaire
  } catch (error) {
    console.error('Erreur récupération grille tarifaire:', error)
    throw error
  }
}

/**
 * Récupérer les grilles par type
 */
export async function getGrillesParType(
  type: TypeGrille
): Promise<GrilleTarifaire[]> {
  try {
    const grillesRef = collection(db, COLLECTION)
    const q = query(
      grillesRef,
      where('type', '==', type),
      where('actif', '==', true),
      orderBy('priorite', 'asc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GrilleTarifaire))
  } catch (error) {
    console.error('Erreur récupération grilles par type:', error)
    throw error
  }
}

/**
 * Récupérer les grilles pour une entité spécifique
 */
export async function getGrillesParEntite(
  entiteId: string
): Promise<GrilleTarifaire[]> {
  try {
    const grillesRef = collection(db, COLLECTION)
    const q = query(
      grillesRef,
      where('entiteId', '==', entiteId),
      where('actif', '==', true),
      orderBy('priorite', 'asc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GrilleTarifaire))
  } catch (error) {
    console.error('Erreur récupération grilles par entité:', error)
    throw error
  }
}

/**
 * FONCTION CLÉ : Trouver la grille tarifaire applicable
 * Hiérarchie : Site > Client > Groupe > Général
 */
export async function getGrilleApplicable(
  siteId?: string,
  clientId?: string,
  groupeId?: string,
  dateReference?: string
): Promise<GrilleTarifaire | null> {
  try {
    const dateRef = dateReference || new Date().toISOString()
    const grillesActives = await getGrillesActives()
    
    // Filtrer par validité de date
    const grillesValides = grillesActives.filter(grille => {
      const dateDebut = new Date(grille.dateDebut)
      const dateFin = grille.dateFin ? new Date(grille.dateFin) : null
      const refDate = new Date(dateRef)
      
      const apresDebut = refDate >= dateDebut
      const avantFin = !dateFin || refDate <= dateFin
      
      return apresDebut && avantFin
    })
    
    // Chercher par ordre de priorité : Site > Client > Groupe > Général
    
    // 1. Grille SITE
    if (siteId) {
      const grilleSite = grillesValides.find(
        g => g.type === 'site' && g.entiteId === siteId
      )
      if (grilleSite) return grilleSite
    }
    
    // 2. Grille CLIENT
    if (clientId) {
      const grilleClient = grillesValides.find(
        g => g.type === 'client' && g.entiteId === clientId
      )
      if (grilleClient) return grilleClient
    }
    
    // 3. Grille GROUPE
    if (groupeId) {
      const grilleGroupe = grillesValides.find(
        g => g.type === 'groupe' && g.entiteId === groupeId
      )
      if (grilleGroupe) return grilleGroupe
    }
    
    // 4. Grille GÉNÉRALE (fallback)
    const grilleGenerale = grillesValides.find(g => g.type === 'general')
    if (grilleGenerale) return grilleGenerale
    
    return null
  } catch (error) {
    console.error('Erreur recherche grille applicable:', error)
    throw error
  }
}

/**
 * Mettre à jour une grille tarifaire
 */
export async function updateGrilleTarifaire(
  id: string,
  data: Partial<GrilleTarifaireInput>
): Promise<void> {
  try {
    const updates: any = {
      updatedAt: new Date().toISOString()
    }
    
    // Ajouter seulement les champs définis
    if (data.nom !== undefined) updates.nom = data.nom
    if (data.type !== undefined) updates.type = data.type
    if (data.entiteId !== undefined) updates.entiteId = data.entiteId
    if (data.entiteNom !== undefined) updates.entiteNom = data.entiteNom
    if (data.dateDebut !== undefined) updates.dateDebut = data.dateDebut
    if (data.dateFin !== undefined) updates.dateFin = data.dateFin
    if (data.lignes !== undefined) updates.lignes = data.lignes
    if (data.conditionsParticulieres !== undefined) updates.conditionsParticulieres = data.conditionsParticulieres
    if (data.priorite !== undefined) updates.priorite = data.priorite
    if (data.actif !== undefined) updates.actif = data.actif
    
    await updateDoc(doc(db, COLLECTION, id), updates)
  } catch (error) {
    console.error('Erreur mise à jour grille tarifaire:', error)
    throw error
  }
}

/**
 * Désactiver une grille (soft delete)
 */
export async function desactiverGrilleTarifaire(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      actif: false,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur désactivation grille tarifaire:', error)
    throw error
  }
}

/**
 * Activer une grille
 */
export async function activerGrilleTarifaire(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      actif: true,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur activation grille tarifaire:', error)
    throw error
  }
}

/**
 * Supprimer une grille (hard delete)
 */
export async function deleteGrilleTarifaire(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id))
  } catch (error) {
    console.error('Erreur suppression grille tarifaire:', error)
    throw error
  }
}

/**
 * Dupliquer une grille tarifaire
 */
export async function dupliquerGrilleTarifaire(
  id: string,
  nouveauNom: string
): Promise<string> {
  try {
    const grilleSource = await getGrilleTarifaireById(id)
    
    if (!grilleSource) {
      throw new Error('Grille source non trouvée')
    }
    
    const nouvelleGrille: GrilleTarifaireInput = {
      nom: nouveauNom,
      type: grilleSource.type,
      entiteId: grilleSource.entiteId,
      entiteNom: grilleSource.entiteNom,
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: null,
      lignes: grilleSource.lignes,
      conditionsParticulieres: grilleSource.conditionsParticulieres,
      priorite: grilleSource.priorite,
      actif: false // Créée inactive par défaut
    }
    
    return await createGrilleTarifaire(nouvelleGrille)
  } catch (error) {
    console.error('Erreur duplication grille tarifaire:', error)
    throw error
  }
}

/**
 * Obtenir les statistiques grilles tarifaires
 */
export async function getStatistiquesGrilles() {
  try {
    const grilles = await getAllGrillesTarifaires()
    
    const stats = {
      total: grilles.length,
      actives: grilles.filter(g => g.actif).length,
      inactives: grilles.filter(g => !g.actif).length,
      parType: {
        general: grilles.filter(g => g.type === 'general').length,
        groupe: grilles.filter(g => g.type === 'groupe').length,
        client: grilles.filter(g => g.type === 'client').length,
        site: grilles.filter(g => g.type === 'site').length
      },
      expirantProchainement: 0
    }
    
    // Grilles expirant dans les 30 jours
    const dans30Jours = new Date()
    dans30Jours.setDate(dans30Jours.getDate() + 30)
    
    stats.expirantProchainement = grilles.filter(g => {
      if (!g.dateFin) return false
      const dateFin = new Date(g.dateFin)
      return dateFin <= dans30Jours && g.actif
    }).length
    
    return stats
  } catch (error) {
    console.error('Erreur statistiques grilles:', error)
    throw error
  }
}
