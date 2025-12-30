/**
 * Types pour la gestion multi-sociétés groupe GELY
 */

export type FormJuridique = 'SAS' | 'SARL' | 'SCI' | 'Holding' | 'SA' | 'SASU' | 'EURL';

export interface Adresse {
  rue: string;
  ville: string;
  codePostal: string;
  pays?: string;
}

export interface Societe {
  id: string;
  nom: string;
  siret: string;
  formeJuridique: FormJuridique;
  
  adresse: Adresse;
  
  tvaIntracom: string;
  rcs: string;
  capital: number;
  
  actif: boolean;
  couleur: string; // Pour dashboards (ex: "#3B82F6")
  logo?: string; // URL Firebase Storage
  
  // Paramètres comptables
  prefixeFacture: string; // "FA" pour Solaire
  prefixeAvoir: string; // "AV"
  prefixeDevis: string; // "DE"
  compteClientDebut: string; // "411"
  compteFournisseurDebut: string; // "401"
  
  // Contact
  email?: string;
  telephone?: string;
  
  // Banque par défaut
  compteBancaireDefaut?: string; // ID du compte bancaire principal
  
  createdAt: string;
  updatedAt: string;
}

export interface SocieteFormData {
  nom: string;
  siret: string;
  formeJuridique: FormJuridique;
  
  // Adresse
  rue: string;
  ville: string;
  codePostal: string;
  pays?: string;
  
  tvaIntracom: string;
  rcs: string;
  capital: number;
  
  actif: boolean;
  couleur: string;
  
  // Paramètres comptables
  prefixeFacture: string;
  prefixeAvoir: string;
  prefixeDevis: string;
  compteClientDebut: string;
  compteFournisseurDebut: string;
  
  // Contact
  email?: string;
  telephone?: string;
}

// Sociétés pré-configurées du groupe GELY
export const SOCIETES_GROUPE_GELY: Partial<Societe>[] = [
  {
    nom: 'SAS SOLAIRE NETTOYAGE',
    siret: '820 504 421 00000',
    formeJuridique: 'SAS',
    couleur: '#3B82F6', // Bleu
    prefixeFacture: 'FA',
    prefixeAvoir: 'AV',
    prefixeDevis: 'DE',
    compteClientDebut: '411',
    compteFournisseurDebut: '401',
    actif: true,
  },
  {
    nom: 'GELY INVESTISSEMENT HOLDING',
    formeJuridique: 'Holding',
    couleur: '#8B5CF6', // Violet
    prefixeFacture: 'FH',
    prefixeAvoir: 'AH',
    prefixeDevis: 'DH',
    compteClientDebut: '411',
    compteFournisseurDebut: '401',
    actif: true,
  },
  {
    nom: 'LEXA',
    formeJuridique: 'SAS',
    couleur: '#10B981', // Vert
    prefixeFacture: 'FL1',
    prefixeAvoir: 'AL1',
    prefixeDevis: 'DL1',
    compteClientDebut: '411',
    compteFournisseurDebut: '401',
    actif: true,
  },
  {
    nom: 'LEXA 2',
    formeJuridique: 'SAS',
    couleur: '#F59E0B', // Orange
    prefixeFacture: 'FL2',
    prefixeAvoir: 'AL2',
    prefixeDevis: 'DL2',
    compteClientDebut: '411',
    compteFournisseurDebut: '401',
    actif: true,
  },
  {
    nom: 'SCI GELY',
    formeJuridique: 'SCI',
    couleur: '#EF4444', // Rouge
    prefixeFacture: 'FS',
    prefixeAvoir: 'AS',
    prefixeDevis: 'DS',
    compteClientDebut: '411',
    compteFournisseurDebut: '401',
    actif: true,
  },
];

// Couleurs disponibles pour les sociétés
export const COULEURS_SOCIETES = [
  { value: '#3B82F6', label: 'Bleu' },
  { value: '#8B5CF6', label: 'Violet' },
  { value: '#10B981', label: 'Vert' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Rouge' },
  { value: '#EC4899', label: 'Rose' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#84CC16', label: 'Vert Lime' },
  { value: '#F97316', label: 'Orange Foncé' },
  { value: '#6366F1', label: 'Indigo' },
];

// Formes juridiques disponibles
export const FORMES_JURIDIQUES: { value: FormJuridique; label: string }[] = [
  { value: 'SAS', label: 'SAS - Société par Actions Simplifiée' },
  { value: 'SARL', label: 'SARL - Société à Responsabilité Limitée' },
  { value: 'SCI', label: 'SCI - Société Civile Immobilière' },
  { value: 'Holding', label: 'Holding' },
  { value: 'SA', label: 'SA - Société Anonyme' },
  { value: 'SASU', label: 'SASU - Société par Actions Simplifiée Unipersonnelle' },
  { value: 'EURL', label: 'EURL - Entreprise Unipersonnelle à Responsabilité Limitée' },
];
