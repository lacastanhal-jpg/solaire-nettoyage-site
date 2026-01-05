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
  where,
  orderBy 
} from 'firebase/firestore'

/**
 * Interface Compte Comptable
 */
export interface CompteComptable {
  numero: string           // "6061", "706000"
  intitule: string         // "Fournitures - Énergie"
  type: 'charge' | 'produit' | 'bilan'
  classe: string           // "6", "7", "4"
  sousClasse?: string      // "60", "70", "41"
  actif: boolean
  tvaDeductible?: boolean  // Si charge
  tvaCollectee?: boolean   // Si produit
  description?: string
  createdAt: string
  updatedAt: string
}

/**
 * Interface Plan Comptable par Société
 */
export interface PlanComptable {
  id: string               // = societeId
  societeId: string
  societeNom: string
  comptes: CompteComptable[]
  createdAt: string
  updatedAt: string
}

/**
 * PCG STANDARD - Comptes par défaut
 */
export const PCG_STANDARD: Omit<CompteComptable, 'createdAt' | 'updatedAt'>[] = [
  // CLASSE 6 - CHARGES
  { numero: '60', intitule: 'Achats (sauf 603)', type: 'charge', classe: '6', actif: true },
  { numero: '601', intitule: 'Achats stockés - Matières premières', type: 'charge', classe: '6', sousClasse: '60', actif: true, tvaDeductible: true },
  { numero: '602', intitule: 'Achats stockés - Autres approvisionnements', type: 'charge', classe: '6', sousClasse: '60', actif: true, tvaDeductible: true },
  { numero: '606', intitule: 'Achats non stockés de matières et fournitures', type: 'charge', classe: '6', sousClasse: '60', actif: true, tvaDeductible: true },
  { numero: '6061', intitule: 'Fournitures non stockables (eau, énergie)', type: 'charge', classe: '6', sousClasse: '60', actif: true, tvaDeductible: true },
  { numero: '6063', intitule: 'Fournitures d\'entretien et de petit équipement', type: 'charge', classe: '6', sousClasse: '60', actif: true, tvaDeductible: true },
  { numero: '6064', intitule: 'Fournitures administratives', type: 'charge', classe: '6', sousClasse: '60', actif: true, tvaDeductible: true },
  { numero: '607', intitule: 'Achats de marchandises', type: 'charge', classe: '6', sousClasse: '60', actif: true, tvaDeductible: true },
  
  { numero: '61', intitule: 'Services extérieurs', type: 'charge', classe: '6', actif: true },
  { numero: '611', intitule: 'Sous-traitance générale', type: 'charge', classe: '6', sousClasse: '61', actif: true, tvaDeductible: true },
  { numero: '613', intitule: 'Locations', type: 'charge', classe: '6', sousClasse: '61', actif: true, tvaDeductible: true },
  { numero: '6132', intitule: 'Locations immobilières', type: 'charge', classe: '6', sousClasse: '61', actif: true, tvaDeductible: true },
  { numero: '6135', intitule: 'Locations mobilières', type: 'charge', classe: '6', sousClasse: '61', actif: true, tvaDeductible: true },
  { numero: '614', intitule: 'Charges locatives et de copropriété', type: 'charge', classe: '6', sousClasse: '61', actif: true, tvaDeductible: true },
  { numero: '615', intitule: 'Entretien et réparations', type: 'charge', classe: '6', sousClasse: '61', actif: true, tvaDeductible: true },
  { numero: '6155', intitule: 'Entretien et réparations sur biens mobiliers', type: 'charge', classe: '6', sousClasse: '61', actif: true, tvaDeductible: true },
  { numero: '616', intitule: 'Primes d\'assurances', type: 'charge', classe: '6', sousClasse: '61', actif: true, tvaDeductible: false },
  { numero: '6161', intitule: 'Multirisques', type: 'charge', classe: '6', sousClasse: '61', actif: true, tvaDeductible: false },
  { numero: '6168', intitule: 'Autres assurances', type: 'charge', classe: '6', sousClasse: '61', actif: true, tvaDeductible: false },
  { numero: '618', intitule: 'Divers', type: 'charge', classe: '6', sousClasse: '61', actif: true, tvaDeductible: true },
  
  { numero: '62', intitule: 'Autres services extérieurs', type: 'charge', classe: '6', actif: true },
  { numero: '621', intitule: 'Personnel extérieur à l\'entreprise', type: 'charge', classe: '6', sousClasse: '62', actif: true, tvaDeductible: true },
  { numero: '622', intitule: 'Rémunérations d\'intermédiaires et honoraires', type: 'charge', classe: '6', sousClasse: '62', actif: true, tvaDeductible: true },
  { numero: '6226', intitule: 'Honoraires', type: 'charge', classe: '6', sousClasse: '62', actif: true, tvaDeductible: true },
  { numero: '623', intitule: 'Publicité, publications, relations publiques', type: 'charge', classe: '6', sousClasse: '62', actif: true, tvaDeductible: true },
  { numero: '624', intitule: 'Transports de biens et transports collectifs du personnel', type: 'charge', classe: '6', sousClasse: '62', actif: true, tvaDeductible: true },
  { numero: '625', intitule: 'Déplacements, missions et réceptions', type: 'charge', classe: '6', sousClasse: '62', actif: true, tvaDeductible: true },
  { numero: '6251', intitule: 'Voyages et déplacements', type: 'charge', classe: '6', sousClasse: '62', actif: true, tvaDeductible: true },
  { numero: '6256', intitule: 'Missions', type: 'charge', classe: '6', sousClasse: '62', actif: true, tvaDeductible: true },
  { numero: '6257', intitule: 'Réceptions', type: 'charge', classe: '6', sousClasse: '62', actif: true, tvaDeductible: true },
  { numero: '626', intitule: 'Frais postaux et de télécommunications', type: 'charge', classe: '6', sousClasse: '62', actif: true, tvaDeductible: true },
  { numero: '6261', intitule: 'Frais postaux', type: 'charge', classe: '6', sousClasse: '62', actif: true, tvaDeductible: true },
  { numero: '6263', intitule: 'Téléphone', type: 'charge', classe: '6', sousClasse: '62', actif: true, tvaDeductible: true },
  { numero: '627', intitule: 'Services bancaires et assimilés', type: 'charge', classe: '6', sousClasse: '62', actif: true, tvaDeductible: false },
  { numero: '628', intitule: 'Divers', type: 'charge', classe: '6', sousClasse: '62', actif: true, tvaDeductible: true },
  
  { numero: '63', intitule: 'Impôts, taxes et versements assimilés', type: 'charge', classe: '6', actif: true },
  { numero: '631', intitule: 'Impôts, taxes et versements sur rémunérations', type: 'charge', classe: '6', sousClasse: '63', actif: true, tvaDeductible: false },
  { numero: '633', intitule: 'Impôts, taxes et versements sur rémunérations (autres)', type: 'charge', classe: '6', sousClasse: '63', actif: true, tvaDeductible: false },
  { numero: '635', intitule: 'Autres impôts, taxes et versements (hors TVA)', type: 'charge', classe: '6', sousClasse: '63', actif: true, tvaDeductible: false },
  
  { numero: '64', intitule: 'Charges de personnel', type: 'charge', classe: '6', actif: true },
  { numero: '641', intitule: 'Rémunérations du personnel', type: 'charge', classe: '6', sousClasse: '64', actif: true, tvaDeductible: false },
  { numero: '645', intitule: 'Charges de sécurité sociale et de prévoyance', type: 'charge', classe: '6', sousClasse: '64', actif: true, tvaDeductible: false },
  { numero: '647', intitule: 'Autres charges sociales', type: 'charge', classe: '6', sousClasse: '64', actif: true, tvaDeductible: false },
  { numero: '648', intitule: 'Autres charges de personnel', type: 'charge', classe: '6', sousClasse: '64', actif: true, tvaDeductible: false },
  
  { numero: '65', intitule: 'Autres charges de gestion courante', type: 'charge', classe: '6', actif: true },
  { numero: '651', intitule: 'Redevances pour concessions, brevets, licences', type: 'charge', classe: '6', sousClasse: '65', actif: true, tvaDeductible: true },
  { numero: '658', intitule: 'Charges diverses de gestion courante', type: 'charge', classe: '6', sousClasse: '65', actif: true, tvaDeductible: false },
  
  { numero: '66', intitule: 'Charges financières', type: 'charge', classe: '6', actif: true },
  { numero: '661', intitule: 'Charges d\'intérêts', type: 'charge', classe: '6', sousClasse: '66', actif: true, tvaDeductible: false },
  { numero: '666', intitule: 'Pertes de change', type: 'charge', classe: '6', sousClasse: '66', actif: true, tvaDeductible: false },
  
  { numero: '68', intitule: 'Dotations aux amortissements', type: 'charge', classe: '6', actif: true },
  { numero: '681', intitule: 'Dotations aux amortissements', type: 'charge', classe: '6', sousClasse: '68', actif: true, tvaDeductible: false },
  
  // CLASSE 7 - PRODUITS
  { numero: '70', intitule: 'Ventes de produits fabriqués, prestations', type: 'produit', classe: '7', actif: true },
  { numero: '706', intitule: 'Prestations de services', type: 'produit', classe: '7', sousClasse: '70', actif: true, tvaCollectee: true },
  { numero: '706000', intitule: 'Prestations de services - Nettoyage', type: 'produit', classe: '7', sousClasse: '70', actif: true, tvaCollectee: true },
  { numero: '707', intitule: 'Ventes de marchandises', type: 'produit', classe: '7', sousClasse: '70', actif: true, tvaCollectee: true },
  { numero: '708', intitule: 'Produits des activités annexes', type: 'produit', classe: '7', sousClasse: '70', actif: true, tvaCollectee: true },
  
  { numero: '71', intitule: 'Production stockée', type: 'produit', classe: '7', actif: true },
  { numero: '75', intitule: 'Autres produits de gestion courante', type: 'produit', classe: '7', actif: true },
  { numero: '76', intitule: 'Produits financiers', type: 'produit', classe: '7', actif: true },
  { numero: '78', intitule: 'Reprises sur amortissements et provisions', type: 'produit', classe: '7', actif: true },
  
  // CLASSE 4 - TIERS
  { numero: '401', intitule: 'Fournisseurs', type: 'bilan', classe: '4', actif: true },
  { numero: '411', intitule: 'Clients', type: 'bilan', classe: '4', actif: true },
  { numero: '421', intitule: 'Personnel - Rémunérations dues', type: 'bilan', classe: '4', actif: true },
  { numero: '431', intitule: 'Sécurité sociale', type: 'bilan', classe: '4', actif: true },
  { numero: '44566', intitule: 'TVA déductible', type: 'bilan', classe: '4', actif: true },
  { numero: '44571', intitule: 'TVA collectée', type: 'bilan', classe: '4', actif: true },
  { numero: '455', intitule: 'Associés - Comptes courants', type: 'bilan', classe: '4', actif: true },
  
  // CLASSE 5 - FINANCIER
  { numero: '512', intitule: 'Banques', type: 'bilan', classe: '5', actif: true },
  { numero: '530', intitule: 'Caisse', type: 'bilan', classe: '5', actif: true },
]

/**
 * Récupérer le plan comptable d'une société
 */
export async function getPlanComptable(societeId: string): Promise<PlanComptable | null> {
  try {
    const planRef = doc(db, 'plans_comptables', societeId)
    const planSnap = await getDoc(planRef)
    
    if (!planSnap.exists()) {
      return null
    }
    
    return {
      id: planSnap.id,
      ...planSnap.data()
    } as PlanComptable
  } catch (error) {
    console.error('Erreur récupération plan comptable:', error)
    throw error
  }
}

/**
 * Créer le plan comptable pour une société (avec PCG par défaut)
 */
export async function createPlanComptable(
  societeId: string,
  societeNom: string
): Promise<void> {
  try {
    const now = new Date().toISOString()
    
    // Nettoyer les comptes PCG pour supprimer undefined
    const comptes: CompteComptable[] = PCG_STANDARD.map(compte => {
      const cleanCompte = Object.entries(compte).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {} as any)
      
      return {
        ...cleanCompte,
        createdAt: now,
        updatedAt: now
      }
    })
    
    const planData: PlanComptable = {
      id: societeId,
      societeId,
      societeNom,
      comptes,
      createdAt: now,
      updatedAt: now
    }
    
    await setDoc(doc(db, 'plans_comptables', societeId), planData)
  } catch (error) {
    console.error('Erreur création plan comptable:', error)
    throw error
  }
}

/**
 * Ajouter un compte au plan comptable
 */
export async function addCompte(
  societeId: string,
  compte: Omit<CompteComptable, 'createdAt' | 'updatedAt'>
): Promise<void> {
  try {
    const plan = await getPlanComptable(societeId)
    if (!plan) {
      throw new Error('Plan comptable introuvable')
    }
    
    // Vérifier que le numéro n'existe pas déjà
    const existe = plan.comptes.some(c => c.numero === compte.numero)
    if (existe) {
      throw new Error(`Le compte ${compte.numero} existe déjà`)
    }
    
    // Nettoyer les undefined (Firebase ne les accepte pas)
    const cleanCompte = Object.entries(compte).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {} as any)
    
    const now = new Date().toISOString()
    const nouveauCompte: CompteComptable = {
      ...cleanCompte,
      createdAt: now,
      updatedAt: now
    }
    
    plan.comptes.push(nouveauCompte)
    plan.updatedAt = now
    
    await setDoc(doc(db, 'plans_comptables', societeId), plan)
  } catch (error) {
    console.error('Erreur ajout compte:', error)
    throw error
  }
}

/**
 * Modifier un compte
 */
export async function updateCompte(
  societeId: string,
  numeroCompte: string,
  updates: Partial<Omit<CompteComptable, 'numero' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const plan = await getPlanComptable(societeId)
    if (!plan) {
      throw new Error('Plan comptable introuvable')
    }
    
    const index = plan.comptes.findIndex(c => c.numero === numeroCompte)
    if (index === -1) {
      throw new Error(`Compte ${numeroCompte} introuvable`)
    }
    
    // Nettoyer les undefined (Firebase ne les accepte pas)
    const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {} as any)
    
    const now = new Date().toISOString()
    plan.comptes[index] = {
      ...plan.comptes[index],
      ...cleanUpdates,
      updatedAt: now
    }
    plan.updatedAt = now
    
    await setDoc(doc(db, 'plans_comptables', societeId), plan)
  } catch (error) {
    console.error('Erreur modification compte:', error)
    throw error
  }
}

/**
 * Supprimer un compte
 */
export async function deleteCompte(
  societeId: string,
  numeroCompte: string
): Promise<void> {
  try {
    const plan = await getPlanComptable(societeId)
    if (!plan) {
      throw new Error('Plan comptable introuvable')
    }
    
    // TODO: Vérifier que le compte n'est pas utilisé
    
    plan.comptes = plan.comptes.filter(c => c.numero !== numeroCompte)
    plan.updatedAt = new Date().toISOString()
    
    await setDoc(doc(db, 'plans_comptables', societeId), plan)
  } catch (error) {
    console.error('Erreur suppression compte:', error)
    throw error
  }
}

/**
 * Récupérer un compte par son numéro
 */
export async function getCompteByNumero(
  societeId: string,
  numeroCompte: string
): Promise<CompteComptable | null> {
  try {
    const plan = await getPlanComptable(societeId)
    if (!plan) return null
    
    return plan.comptes.find(c => c.numero === numeroCompte) || null
  } catch (error) {
    console.error('Erreur récupération compte:', error)
    throw error
  }
}

/**
 * Rechercher des comptes
 */
export async function searchComptes(
  societeId: string,
  filters: {
    query?: string
    type?: 'charge' | 'produit' | 'bilan'
    classe?: string
    actifOnly?: boolean
  }
): Promise<CompteComptable[]> {
  try {
    const plan = await getPlanComptable(societeId)
    if (!plan) return []
    
    let comptes = plan.comptes
    
    if (filters.type) {
      comptes = comptes.filter(c => c.type === filters.type)
    }
    
    if (filters.classe) {
      comptes = comptes.filter(c => c.classe === filters.classe)
    }
    
    if (filters.actifOnly) {
      comptes = comptes.filter(c => c.actif)
    }
    
    if (filters.query) {
      const q = filters.query.toLowerCase()
      comptes = comptes.filter(c => 
        c.numero.includes(q) || 
        c.intitule.toLowerCase().includes(q)
      )
    }
    
    // Tri par numéro
    comptes.sort((a, b) => a.numero.localeCompare(b.numero))
    
    return comptes
  } catch (error) {
    console.error('Erreur recherche comptes:', error)
    throw error
  }
}

/**
 * Exporter le plan comptable en JSON
 */
export async function exportPlanComptable(societeId: string): Promise<any> {
  try {
    const plan = await getPlanComptable(societeId)
    if (!plan) {
      throw new Error('Plan comptable introuvable')
    }
    
    return {
      societe: plan.societeNom,
      dateExport: new Date().toISOString(),
      comptes: plan.comptes
    }
  } catch (error) {
    console.error('Erreur export plan comptable:', error)
    throw error
  }
}

/**
 * Importer un plan comptable depuis JSON
 */
export async function importPlanComptable(
  societeId: string,
  data: any
): Promise<void> {
  try {
    const plan = await getPlanComptable(societeId)
    if (!plan) {
      throw new Error('Plan comptable introuvable')
    }
    
    // Valider les données
    if (!Array.isArray(data.comptes)) {
      throw new Error('Format de données invalide')
    }
    
    const now = new Date().toISOString()
    
    // Fusionner avec les comptes existants (pas de doublons)
    const nouveauxComptes = data.comptes.filter((nc: any) => 
      !plan.comptes.some(c => c.numero === nc.numero)
    )
    
    nouveauxComptes.forEach((compte: any) => {
      plan.comptes.push({
        ...compte,
        createdAt: compte.createdAt || now,
        updatedAt: now
      })
    })
    
    plan.updatedAt = now
    
    await setDoc(doc(db, 'plans_comptables', societeId), plan)
  } catch (error) {
    console.error('Erreur import plan comptable:', error)
    throw error
  }
}

/**
 * Récupérer tous les comptes actifs (pour sélecteurs)
 */
export async function getComptesActifs(): Promise<CompteComptable[]> {
  try {
    // TODO: Gérer multi-sociétés - pour l'instant on prend la première
    const snapshot = await getDocs(collection(db, 'plans_comptables'))
    
    if (snapshot.empty) {
      return []
    }
    
    const plan = snapshot.docs[0].data() as PlanComptable
    return plan.comptes.filter(c => c.actif)
  } catch (error) {
    console.error('Erreur récupération comptes actifs:', error)
    return []
  }
}
