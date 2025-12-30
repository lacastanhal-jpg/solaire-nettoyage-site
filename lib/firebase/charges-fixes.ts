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

export interface ChargeFixe {
  id: string
  
  // INFORMATIONS
  nom: string
  type: 'salaire' | 'loyer' | 'assurance' | 'abonnement' | 'location_vehicule' | 'credit' | 'autre'
  
  // MONTANT
  montant: number
  
  // RÉCURRENCE
  recurrence: 'mensuel' | 'trimestriel' | 'annuel'
  jourPrelevement?: number // Jour du mois (1-31)
  
  // BÉNÉFICIAIRE
  beneficiaire: string
  siret?: string
  
  // CATÉGORIE COMPTABLE
  categorie?: string
  
  // PÉRIODE
  dateDebut: string
  dateFin?: string // Si temporaire
  
  // STATUT
  actif: boolean
  
  // NOTES
  notes?: string
  
  // METADATA
  createdAt: string
  updatedAt: string
}

export interface ChargeFixeInput {
  nom: string
  type: ChargeFixe['type']
  montant: number
  recurrence: ChargeFixe['recurrence']
  jourPrelevement?: number
  beneficiaire: string
  siret?: string
  categorie?: string
  dateDebut: string
  dateFin?: string
  actif?: boolean
  notes?: string
}

/**
 * Récupérer toutes les charges fixes
 */
export async function getAllChargesFixes(): Promise<ChargeFixe[]> {
  try {
    const chargesRef = collection(db, 'charges_fixes')
    const q = query(chargesRef, orderBy('nom', 'asc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChargeFixe))
  } catch (error) {
    console.error('Erreur récupération charges fixes:', error)
    throw error
  }
}

/**
 * Récupérer une charge fixe par ID
 */
export async function getChargeFixeById(id: string): Promise<ChargeFixe | null> {
  try {
    const chargeRef = doc(db, 'charges_fixes', id)
    const chargeSnap = await getDoc(chargeRef)
    
    if (!chargeSnap.exists()) {
      return null
    }
    
    return {
      id: chargeSnap.id,
      ...chargeSnap.data()
    } as ChargeFixe
  } catch (error) {
    console.error('Erreur récupération charge fixe:', error)
    throw error
  }
}

/**
 * Récupérer les charges fixes actives
 */
export async function getChargesFixesActives(): Promise<ChargeFixe[]> {
  try {
    const chargesRef = collection(db, 'charges_fixes')
    const q = query(
      chargesRef,
      where('actif', '==', true),
      orderBy('nom', 'asc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChargeFixe))
  } catch (error) {
    console.error('Erreur récupération charges actives:', error)
    throw error
  }
}

/**
 * Créer une nouvelle charge fixe
 */
export async function createChargeFixe(chargeData: ChargeFixeInput): Promise<string> {
  try {
    const charge: any = {
      nom: chargeData.nom,
      type: chargeData.type,
      montant: chargeData.montant,
      recurrence: chargeData.recurrence,
      beneficiaire: chargeData.beneficiaire,
      dateDebut: chargeData.dateDebut,
      actif: chargeData.actif !== false, // Par défaut true
      notes: chargeData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Champs optionnels
    if (chargeData.jourPrelevement) charge.jourPrelevement = chargeData.jourPrelevement
    if (chargeData.siret) charge.siret = chargeData.siret
    if (chargeData.categorie) charge.categorie = chargeData.categorie
    if (chargeData.dateFin) charge.dateFin = chargeData.dateFin
    
    const chargeRef = doc(collection(db, 'charges_fixes'))
    await setDoc(chargeRef, charge)
    
    return chargeRef.id
  } catch (error) {
    console.error('Erreur création charge fixe:', error)
    throw error
  }
}

/**
 * Modifier une charge fixe
 */
export async function updateChargeFixe(id: string, chargeData: Partial<ChargeFixeInput>): Promise<void> {
  try {
    const chargeRef = doc(db, 'charges_fixes', id)
    const updates: any = {
      updatedAt: new Date().toISOString()
    }
    
    if (chargeData.nom !== undefined) updates.nom = chargeData.nom
    if (chargeData.type !== undefined) updates.type = chargeData.type
    if (chargeData.montant !== undefined) updates.montant = chargeData.montant
    if (chargeData.recurrence !== undefined) updates.recurrence = chargeData.recurrence
    if (chargeData.jourPrelevement !== undefined) updates.jourPrelevement = chargeData.jourPrelevement
    if (chargeData.beneficiaire !== undefined) updates.beneficiaire = chargeData.beneficiaire
    if (chargeData.siret !== undefined) updates.siret = chargeData.siret
    if (chargeData.categorie !== undefined) updates.categorie = chargeData.categorie
    if (chargeData.dateDebut !== undefined) updates.dateDebut = chargeData.dateDebut
    if (chargeData.dateFin !== undefined) updates.dateFin = chargeData.dateFin
    if (chargeData.actif !== undefined) updates.actif = chargeData.actif
    if (chargeData.notes !== undefined) updates.notes = chargeData.notes
    
    await updateDoc(chargeRef, updates)
  } catch (error) {
    console.error('Erreur modification charge fixe:', error)
    throw error
  }
}

/**
 * Supprimer une charge fixe
 */
export async function deleteChargeFixe(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'charges_fixes', id))
  } catch (error) {
    console.error('Erreur suppression charge fixe:', error)
    throw error
  }
}

/**
 * Activer/Désactiver une charge fixe
 */
export async function toggleChargeFixeActif(id: string, actif: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, 'charges_fixes', id), {
      actif,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur toggle charge fixe:', error)
    throw error
  }
}

/**
 * Calculer le montant mensuel total des charges fixes actives
 */
export async function calculateChargesFixesMensuelles(): Promise<number> {
  try {
    const charges = await getChargesFixesActives()
    
    return charges.reduce((total, charge) => {
      let montantMensuel = charge.montant
      
      // Convertir en montant mensuel selon récurrence
      if (charge.recurrence === 'trimestriel') {
        montantMensuel = charge.montant / 3
      } else if (charge.recurrence === 'annuel') {
        montantMensuel = charge.montant / 12
      }
      
      return total + montantMensuel
    }, 0)
  } catch (error) {
    console.error('Erreur calcul charges mensuelles:', error)
    throw error
  }
}

/**
 * Calculer le montant annuel total des charges fixes actives
 */
export async function calculateChargesFixesAnnuelles(): Promise<number> {
  try {
    const charges = await getChargesFixesActives()
    
    return charges.reduce((total, charge) => {
      let montantAnnuel = charge.montant
      
      // Convertir en montant annuel selon récurrence
      if (charge.recurrence === 'mensuel') {
        montantAnnuel = charge.montant * 12
      } else if (charge.recurrence === 'trimestriel') {
        montantAnnuel = charge.montant * 4
      }
      
      return total + montantAnnuel
    }, 0)
  } catch (error) {
    console.error('Erreur calcul charges annuelles:', error)
    throw error
  }
}

/**
 * Récupérer les charges par type
 */
export async function getChargesFixesByType(type: ChargeFixe['type']): Promise<ChargeFixe[]> {
  try {
    const chargesRef = collection(db, 'charges_fixes')
    const q = query(
      chargesRef,
      where('type', '==', type),
      orderBy('montant', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChargeFixe))
  } catch (error) {
    console.error('Erreur récupération charges par type:', error)
    throw error
  }
}

/**
 * Calculer statistiques charges fixes
 */
export async function getStatistiquesChargesFixes(): Promise<{
  totalMensuel: number
  totalAnnuel: number
  parType: Record<string, number>
  actives: number
  inactives: number
}> {
  try {
    const toutesCharges = await getAllChargesFixes()
    const chargesActives = toutesCharges.filter(c => c.actif)
    
    const stats = {
      totalMensuel: 0,
      totalAnnuel: 0,
      parType: {} as Record<string, number>,
      actives: chargesActives.length,
      inactives: toutesCharges.length - chargesActives.length
    }
    
    chargesActives.forEach(charge => {
      let montantMensuel = charge.montant
      let montantAnnuel = charge.montant
      
      // Convertir selon récurrence
      if (charge.recurrence === 'trimestriel') {
        montantMensuel = charge.montant / 3
        montantAnnuel = charge.montant * 4
      } else if (charge.recurrence === 'annuel') {
        montantMensuel = charge.montant / 12
        montantAnnuel = charge.montant
      } else if (charge.recurrence === 'mensuel') {
        montantAnnuel = charge.montant * 12
      }
      
      stats.totalMensuel += montantMensuel
      stats.totalAnnuel += montantAnnuel
      
      // Par type
      if (!stats.parType[charge.type]) {
        stats.parType[charge.type] = 0
      }
      stats.parType[charge.type] += montantMensuel
    })
    
    // Arrondir
    stats.totalMensuel = Math.round(stats.totalMensuel * 100) / 100
    stats.totalAnnuel = Math.round(stats.totalAnnuel * 100) / 100
    
    return stats
  } catch (error) {
    console.error('Erreur calcul statistiques:', error)
    throw error
  }
}

/**
 * Prévoir les charges pour les N prochains mois
 */
export async function prevoirChargesFixes(nbMois: number): Promise<{
  mois: string
  montant: number
}[]> {
  try {
    const charges = await getChargesFixesActives()
    const previsions: { mois: string; montant: number }[] = []
    
    for (let i = 0; i < nbMois; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() + i)
      const mois = date.toISOString().slice(0, 7) // Format YYYY-MM
      
      let montantMois = 0
      
      charges.forEach(charge => {
        // Vérifier si la charge est active ce mois-là
        const dateDebutCharge = new Date(charge.dateDebut)
        const dateFinCharge = charge.dateFin ? new Date(charge.dateFin) : null
        
        if (date >= dateDebutCharge && (!dateFinCharge || date <= dateFinCharge)) {
          if (charge.recurrence === 'mensuel') {
            montantMois += charge.montant
          } else if (charge.recurrence === 'trimestriel') {
            // Tous les 3 mois
            const moisDepuisDebut = Math.floor(
              (date.getTime() - dateDebutCharge.getTime()) / (1000 * 60 * 60 * 24 * 30)
            )
            if (moisDepuisDebut % 3 === 0) {
              montantMois += charge.montant
            }
          } else if (charge.recurrence === 'annuel') {
            // Une fois par an
            if (date.getMonth() === dateDebutCharge.getMonth()) {
              montantMois += charge.montant
            }
          }
        }
      })
      
      previsions.push({
        mois,
        montant: Math.round(montantMois * 100) / 100
      })
    }
    
    return previsions
  } catch (error) {
    console.error('Erreur prévision charges:', error)
    throw error
  }
}
