import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './config'
import { Adresse } from './clients'

// Ré-exporter Adresse pour que les pages puissent l'utiliser
export type { Adresse }

// Interface pour les informations bancaires
export interface InformationsBancaires {
  titulaire: string
  banque: string
  iban: string
  bic: string
}

// Interface pour les informations de l'entreprise
export interface Entreprise {
  id: string
  
  // INFORMATIONS GÉNÉRALES
  raisonSociale: string
  nomCommercial?: string
  formeJuridique: string  // SARL, SAS, etc.
  
  // INFORMATIONS LÉGALES OBLIGATOIRES
  siret: string
  numeroTVA: string
  codeAPE: string
  capitalSocial: number
  rcs: string  // Ex: "Toulouse 123 456 789"
  
  // ADRESSES
  siegeSocial: Adresse
  adresseFacturation?: Adresse  // Si différente du siège
  
  // CONTACT
  telephone: string
  email: string
  siteWeb?: string
  
  // INFORMATIONS BANCAIRES
  informationsBancaires: InformationsBancaires
  
  // ASSURANCE
  assuranceRC: {
    compagnie: string
    numeroPolice: string
    montantGarantie: number
  }
  
  // CONDITIONS COMMERCIALES PAR DÉFAUT
  conditionsPaiementDefaut: string  // Ex: "30 jours fin de mois"
  modalitesReglementDefaut: string  // Ex: "Virement bancaire"
  
  // MENTIONS LÉGALES
  mentionsLegales?: string
  
  // PÉNALITÉS DE RETARD (obligatoire depuis 2013)
  tauxPenalitesRetard: number  // Ex: 10 (pour 10%)
  indemniteForfaitaire: number  // 40€ obligatoire
  
  // LOGO
  logoUrl?: string
  
  updatedAt: string
}

const ENTREPRISE_DOC_ID = 'solaire-nettoyage'

// Récupérer les informations de l'entreprise
export async function getEntreprise(): Promise<Entreprise | null> {
  try {
    const entrepriseRef = doc(db, 'entreprise', ENTREPRISE_DOC_ID)
    const entrepriseSnap = await getDoc(entrepriseRef)
    
    if (!entrepriseSnap.exists()) {
      return null
    }
    
    return {
      id: entrepriseSnap.id,
      ...entrepriseSnap.data()
    } as Entreprise
  } catch (error) {
    console.error('Erreur récupération entreprise:', error)
    return null
  }
}

// Mettre à jour les informations de l'entreprise
export async function updateEntreprise(
  updates: Partial<Omit<Entreprise, 'id'>>
): Promise<void> {
  try {
    const entrepriseRef = doc(db, 'entreprise', ENTREPRISE_DOC_ID)
    await setDoc(entrepriseRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true })
  } catch (error) {
    console.error('Erreur mise à jour entreprise:', error)
    throw error
  }
}

// Créer/Initialiser les informations de l'entreprise
export async function initializeEntreprise(data: Omit<Entreprise, 'id' | 'updatedAt'>): Promise<void> {
  try {
    const entrepriseRef = doc(db, 'entreprise', ENTREPRISE_DOC_ID)
    await setDoc(entrepriseRef, {
      ...data,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur initialisation entreprise:', error)
    throw error
  }
}

// Formater les informations pour affichage sur facture/devis
export function formatEntrepriseForDocument(entreprise: Entreprise): string {
  const lines = [
    entreprise.raisonSociale,
    entreprise.formeJuridique,
    `Capital social : ${entreprise.capitalSocial.toLocaleString('fr-FR')} €`,
    `SIRET : ${formatSiret(entreprise.siret)}`,
    `TVA : ${entreprise.numeroTVA}`,
    `${entreprise.rcs}`,
    '',
    entreprise.siegeSocial.rue,
    entreprise.siegeSocial.complementAdresse,
    `${entreprise.siegeSocial.codePostal} ${entreprise.siegeSocial.ville}`,
    '',
    `Tél : ${entreprise.telephone}`,
    `Email : ${entreprise.email}`
  ].filter(Boolean)
  
  return lines.join('\n')
}

// Formater SIRET
function formatSiret(siret: string): string {
  return siret.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4')
}

// Obtenir les mentions légales pour facture
export function getMentionsLegalesFacture(entreprise: Entreprise): string[] {
  return [
    `${entreprise.raisonSociale} - ${entreprise.formeJuridique} au capital de ${entreprise.capitalSocial.toLocaleString('fr-FR')} €`,
    `SIRET : ${formatSiret(entreprise.siret)} - APE : ${entreprise.codeAPE}`,
    `TVA intracommunautaire : ${entreprise.numeroTVA}`,
    `${entreprise.rcs}`,
    `Siège social : ${entreprise.siegeSocial.rue}, ${entreprise.siegeSocial.codePostal} ${entreprise.siegeSocial.ville}`,
    '',
    `Assurance RC Professionnelle : ${entreprise.assuranceRC.compagnie} - Police n°${entreprise.assuranceRC.numeroPolice}`,
    '',
    `Conditions de paiement : ${entreprise.conditionsPaiementDefaut}`,
    `En cas de retard de paiement, seront exigibles, conformément à l'article L 441-6 du Code de commerce :`,
    `- une indemnité calculée sur la base de ${entreprise.tauxPenalitesRetard}% par an`,
    `- une indemnité forfaitaire pour frais de recouvrement de ${entreprise.indemniteForfaitaire.toFixed(2)} €`
  ]
}

// Alias pour compatibilité avec les routes API
export const getEntrepriseInfo = getEntreprise
