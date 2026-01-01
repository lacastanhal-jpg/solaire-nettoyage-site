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
  orderBy,
  limit
} from 'firebase/firestore'
import type { 
  InterventionMaintenance, 
  InterventionMaintenanceInput,
  ArticleUtilise,
  TypeIntervention
} from '@/lib/types/stock-flotte'
import { getEquipementById, updateKmHeures } from './stock-equipements'
import { createMouvementStock } from './stock-mouvements'

const COLLECTION = 'interventions_equipement'

/**
 * Créer une nouvelle intervention
 */
export async function createInterventionMaintenance(
  data: InterventionMaintenanceInput
): Promise<string> {
  try {
    // Récupérer l'équipement
    const equipement = await getEquipementById(data.equipementId)
    if (!equipement) {
      throw new Error('Équipement non trouvé')
    }
    
    // Calculer les coûts
    const coutPieces = (data.articlesUtilises || []).reduce(
      (sum, article) => sum + article.coutTotal, 
      0
    )
    const coutMainOeuvre = data.coutMainOeuvre || 0
    const coutTotal = coutPieces + coutMainOeuvre
    
    const intervention: Omit<InterventionMaintenance, 'id'> = {
      equipementId: data.equipementId,
      equipementNom: equipement.nom,
      type: data.type,
      date: data.date,
      km: data.km,
      heures: data.heures,
      description: data.description,
      travauxEffectues: data.travauxEffectues,
      articlesUtilises: data.articlesUtilises || [],
      coutPieces,
      coutMainOeuvre,
      coutTotal,
      operateur: data.operateur,
      statut: data.statut || 'planifiee',
      notes: data.notes,
      photosUrls: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const docRef = await addDoc(collection(db, COLLECTION), intervention)
    
    // Si intervention terminée, mettre à jour km/heures équipement et créer mouvements stock
    if (data.statut === 'terminee') {
      await finaliserIntervention(docRef.id)
    }
    
    return docRef.id
  } catch (error) {
    console.error('Erreur création intervention:', error)
    throw error
  }
}

/**
 * Finaliser une intervention (mettre à jour stock et km/heures)
 */
export async function finaliserIntervention(interventionId: string): Promise<void> {
  try {
    const intervention = await getInterventionMaintenanceById(interventionId)
    if (!intervention) {
      throw new Error('Intervention non trouvée')
    }
    
    // Mettre à jour km/heures de l'équipement
    if (intervention.km || intervention.heures) {
      await updateKmHeures(
        intervention.equipementId,
        intervention.km,
        intervention.heures
      )
    }
    
    // Récupérer les articles (peut être articlesUtilises OU articlesConsommes selon la source)
    const articles = (intervention as any).articlesConsommes || intervention.articlesUtilises || []
    
    // Créer les mouvements de stock pour chaque article utilisé
    for (const article of articles) {
      await createMouvementStock({
        articleId: article.articleId,
        articleCode: article.code || article.articleCode || 'N/A',
        articleDescription: article.description || article.articleDescription || 'Article',
        type: 'sortie',
        quantite: article.quantite,
        date: intervention.date,
        raison: `Intervention ${intervention.type} - ${intervention.equipementNom || 'Équipement'}`,
        coutUnitaire: article.prixUnitaire,
        coutTotal: article.prixUnitaire * article.quantite,
        depotSource: article.depotPrelevement || 'Atelier',
        operateur: intervention.operateur,
        equipementId: intervention.equipementId,
        interventionId: interventionId
      })
    }
    
    // Mettre à jour le statut
    await updateDoc(doc(db, COLLECTION, interventionId), {
      statut: 'terminee',
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur finalisation intervention:', error)
    throw error
  }
}

/**
 * Récupérer toutes les interventions
 */
export async function getAllInterventionsMaintenance(): Promise<InterventionMaintenance[]> {
  try {
    const interventionsRef = collection(db, COLLECTION)
    const q = query(interventionsRef, orderBy('date', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InterventionMaintenance))
  } catch (error) {
    console.error('Erreur récupération interventions:', error)
    throw error
  }
}

/**
 * Récupérer une intervention par ID
 */
export async function getInterventionMaintenanceById(
  id: string
): Promise<InterventionMaintenance | null> {
  try {
    const interventionRef = doc(db, COLLECTION, id)
    const interventionSnap = await getDoc(interventionRef)
    
    if (!interventionSnap.exists()) {
      return null
    }
    
    return {
      id: interventionSnap.id,
      ...interventionSnap.data()
    } as InterventionMaintenance
  } catch (error) {
    console.error('Erreur récupération intervention:', error)
    throw error
  }
}

/**
 * Récupérer les interventions d'un équipement
 */
export async function getInterventionsParEquipement(
  equipementId: string
): Promise<InterventionMaintenance[]> {
  try {
    const interventionsRef = collection(db, COLLECTION)
    const q = query(
      interventionsRef,
      where('equipementId', '==', equipementId),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InterventionMaintenance))
  } catch (error) {
    console.error('Erreur récupération interventions équipement:', error)
    throw error
  }
}

/**
 * Récupérer les interventions par type
 */
export async function getInterventionsParType(
  type: TypeIntervention
): Promise<InterventionMaintenance[]> {
  try {
    const interventionsRef = collection(db, COLLECTION)
    const q = query(
      interventionsRef,
      where('type', '==', type),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InterventionMaintenance))
  } catch (error) {
    console.error('Erreur récupération interventions par type:', error)
    throw error
  }
}

/**
 * Récupérer les interventions planifiées
 */
export async function getInterventionsPlanifiees(): Promise<InterventionMaintenance[]> {
  try {
    const interventionsRef = collection(db, COLLECTION)
    const q = query(
      interventionsRef,
      where('statut', '==', 'planifiee'),
      orderBy('date', 'asc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InterventionMaintenance))
  } catch (error) {
    console.error('Erreur récupération interventions planifiées:', error)
    throw error
  }
}

/**
 * Récupérer les dernières interventions
 */
export async function getDernieresInterventions(
  count: number = 10
): Promise<InterventionMaintenance[]> {
  try {
    const interventionsRef = collection(db, COLLECTION)
    const q = query(
      interventionsRef,
      orderBy('date', 'desc'),
      limit(count)
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InterventionMaintenance))
  } catch (error) {
    console.error('Erreur récupération dernières interventions:', error)
    throw error
  }
}

/**
 * Récupérer les interventions d'une période
 */
export async function getInterventionsPeriode(
  dateDebut: string,
  dateFin: string
): Promise<InterventionMaintenance[]> {
  try {
    const interventionsRef = collection(db, COLLECTION)
    const q = query(
      interventionsRef,
      where('date', '>=', dateDebut),
      where('date', '<=', dateFin),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InterventionMaintenance))
  } catch (error) {
    console.error('Erreur récupération interventions période:', error)
    throw error
  }
}

/**
 * Mettre à jour une intervention
 */
export async function updateInterventionMaintenance(
  id: string,
  data: Partial<InterventionMaintenanceInput>
): Promise<void> {
  try {
    const updates: any = {
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    // Recalculer les coûts si articles modifiés
    if (updates.articlesUtilises) {
      updates.coutPieces = updates.articlesUtilises.reduce(
        (sum: number, article: ArticleUtilise) => sum + article.coutTotal,
        0
      )
    }
    
    if (updates.coutMainOeuvre !== undefined || updates.coutPieces !== undefined) {
      const intervention = await getInterventionMaintenanceById(id)
      if (intervention) {
        const coutPieces = updates.coutPieces ?? intervention.coutPieces
        const coutMainOeuvre = updates.coutMainOeuvre ?? intervention.coutMainOeuvre
        updates.coutTotal = coutPieces + coutMainOeuvre
      }
    }
    
    await updateDoc(doc(db, COLLECTION, id), updates)
    
    // Si passage au statut terminée, finaliser
    if (updates.statut === 'terminee') {
      await finaliserIntervention(id)
    }
  } catch (error) {
    console.error('Erreur mise à jour intervention:', error)
    throw error
  }
}

/**
 * Ajouter une photo à une intervention
 */
export async function ajouterPhotoIntervention(
  id: string,
  photoUrl: string
): Promise<void> {
  try {
    const intervention = await getInterventionMaintenanceById(id)
    if (!intervention) {
      throw new Error('Intervention non trouvée')
    }
    
    const photosUrls = [...(intervention.photosUrls || []), photoUrl]
    
    await updateDoc(doc(db, COLLECTION, id), {
      photosUrls,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur ajout photo:', error)
    throw error
  }
}

/**
 * Supprimer une intervention
 */
export async function deleteInterventionMaintenance(id: string): Promise<void> {
  try {
    const intervention = await getInterventionMaintenanceById(id)
    if (!intervention) {
      throw new Error('Intervention non trouvée')
    }
    
    // Récupérer les articles (peut être articlesUtilises OU articlesConsommes)
    const articles = (intervention as any).articlesConsommes || intervention.articlesUtilises || []
    
    // Empêcher la suppression si intervention terminée avec mouvements stock
    if (intervention.statut === 'terminee' && articles.length > 0) {
      throw new Error(
        'Impossible de supprimer une intervention terminée avec consommation de stock. ' +
        'Annulez d\'abord les mouvements de stock associés.'
      )
    }
    
    await deleteDoc(doc(db, COLLECTION, id))
  } catch (error) {
    console.error('Erreur suppression intervention:', error)
    throw error
  }
}

/**
 * Calculer le coût total maintenance d'un équipement
 */
export async function getCoutMaintenanceEquipement(
  equipementId: string
): Promise<number> {
  try {
    const interventions = await getInterventionsParEquipement(equipementId)
    return interventions
      .filter(i => i.statut === 'terminee')
      .reduce((sum, i) => sum + i.coutTotal, 0)
  } catch (error) {
    console.error('Erreur calcul coût maintenance:', error)
    throw error
  }
}

/**
 * Récupérer les statistiques maintenance du mois
 */
export async function getStatistiquesMaintenanceMois() {
  try {
    const now = new Date()
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
    
    const interventions = await getInterventionsPeriode(debutMois, finMois)
    
    const coutMaintenanceMois = interventions
      .filter(i => i.statut === 'terminee')
      .reduce((sum, i) => sum + i.coutTotal, 0)
    
    return {
      nombreInterventionsMois: interventions.length,
      coutMaintenanceMois,
      interventionsPlanifiees: interventions.filter(i => i.statut === 'planifiee').length,
      interventionsTerminees: interventions.filter(i => i.statut === 'terminee').length
    }
  } catch (error) {
    console.error('Erreur statistiques maintenance:', error)
    throw error
  }
}
