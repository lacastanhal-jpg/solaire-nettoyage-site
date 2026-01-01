/**
 * FONCTIONS UTILITAIRES AFFICHAGE ÉQUIPEMENTS
 * 
 * Source unique de vérité pour l'affichage des équipements
 * Utilisé dans TOUTES les pages équipements/affectations
 */

export interface Equipement {
  id: string
  type: 'vehicule' | 'accessoire' | 'machine'
  // Véhicule
  immatriculation?: string
  typeVehicule?: string
  marque?: string
  modele?: string
  // Accessoire
  nom?: string
  typeAccessoire?: string
  numero?: string
  // Machine
  typeMachine?: string
  // Commun
  statut: string
  notes?: string
  [key: string]: any
}

/**
 * Obtenir le nom/identifiant d'un équipement
 * Véhicules : immatriculation || numero || nom
 * Machines : nom || numero
 * Accessoires : nom || numero || immatriculation
 */
export function getEquipementDisplayName(equipement: Equipement): string {
  if (!equipement) return 'N/A'
  
  if (equipement.type === 'vehicule') {
    return equipement.immatriculation || equipement.numero || equipement.nom || 'N/A'
  } else if (equipement.type === 'machine') {
    return equipement.nom || equipement.numero || 'N/A'
  } else {
    return equipement.nom || equipement.numero || equipement.immatriculation || 'N/A'
  }
}

/**
 * Obtenir le type d'un équipement
 * Véhicules : typeVehicule || 'Véhicule'
 * Machines : typeMachine || 'Machine'
 * Accessoires : typeAccessoire || 'Accessoire'
 */
export function getEquipementDisplayType(equipement: Equipement): string {
  if (!equipement) return 'Équipement'
  
  if (equipement.type === 'vehicule') {
    return equipement.typeVehicule || 'Véhicule'
  } else if (equipement.type === 'machine') {
    return equipement.typeMachine || 'Machine'
  } else {
    return equipement.typeAccessoire || 'Accessoire'
  }
}

/**
 * Obtenir l'affichage complet d'un équipement
 * Format : "NOM - TYPE"
 * Ex: "AB-123-CD - Porteur 26T" ou "Nacelle XYZ - Nacelle"
 */
export function getEquipementFullDisplay(equipement: Equipement): string {
  if (!equipement) return 'N/A'
  
  const name = getEquipementDisplayName(equipement)
  const type = getEquipementDisplayType(equipement)
  return `${name} - ${type}`
}

/**
 * Obtenir l'affichage avec marque/modèle (si présents)
 * Format : "NOM - TYPE (Marque Modèle)"
 * Ex: "AB-123-CD - Porteur 26T (Mercedes Actros)"
 */
export function getEquipementFullDisplayWithBrand(equipement: Equipement): string {
  if (!equipement) return 'N/A'
  
  const base = getEquipementFullDisplay(equipement)
  
  if (equipement.marque && equipement.modele) {
    return `${base} (${equipement.marque} ${equipement.modele})`
  } else if (equipement.marque) {
    return `${base} (${equipement.marque})`
  } else if (equipement.modele) {
    return `${base} (${equipement.modele})`
  }
  
  return base
}

/**
 * Vérifier si un équipement est un véhicule
 */
export function isVehicule(equipement: Equipement): boolean {
  return equipement?.type === 'vehicule'
}

/**
 * Vérifier si un équipement est un accessoire
 */
export function isAccessoire(equipement: Equipement): boolean {
  return equipement?.type === 'accessoire'
}

/**
 * Vérifier si un équipement est une machine
 */
export function isMachine(equipement: Equipement): boolean {
  return equipement?.type === 'machine'
}
