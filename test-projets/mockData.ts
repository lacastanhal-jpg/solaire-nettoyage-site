import { Projet, LigneFinanciere } from './types'

// Données mockées pour tester
export const PROJETS_MOCK: Projet[] = [
  {
    id: 'proj_1',
    nom: 'Projet 500 kWc (GELY 1 & 2)',
    societe: 'lexa2',
    responsable: 'Axel GELY',
    statut: 'en_cours',
    budgetTotal: 346600,
    description: 'Installation photovoltaïque 500 kWc sur bâtiment Vaureilles',
    puissanceKWc: 500,
    tarifEDF: 0.137,
    revenusAnnuels: 76720,
    totalDevis: 346600,
    totalFactures: 40414,
    totalPaye: 21918,
    totalAPayer: 18496,
    reste: 306186,
    dateDebut: '2021-12-08',
    createdAt: '2021-12-08T10:00:00Z',
    updatedAt: '2025-12-21T10:00:00Z'
  },
  {
    id: 'proj_2',
    nom: 'Projet 100 kWc',
    societe: 'lexa2',
    responsable: 'Axel GELY',
    statut: 'developement',
    budgetTotal: 100000,
    description: 'Installation photovoltaïque 99,88 kWc',
    puissanceKWc: 99.88,
    tarifEDF: 0.1126,
    revenusAnnuels: 12611,
    totalDevis: 0,
    totalFactures: 0,
    totalPaye: 0,
    totalAPayer: 0,
    reste: 100000,
    dateDebut: '2025-01-15',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-12-21T10:00:00Z'
  },
  {
    id: 'proj_3',
    nom: 'Bâtiment photovoltaïque Vaureilles',
    societe: 'sciGely',
    responsable: 'Jerome GELY',
    statut: 'en_cours',
    budgetTotal: 336011,
    description: 'Construction bâtiment 2496 m² pour installation PV et atelier',
    surfaceM2: 2496,
    totalDevis: 291084,
    totalFactures: 44927,
    totalPaye: 44927,
    totalAPayer: 0,
    reste: 291084,
    dateDebut: '2020-01-20',
    createdAt: '2020-01-20T10:00:00Z',
    updatedAt: '2025-12-21T10:00:00Z'
  }
]

export const LIGNES_FINANCIERES_MOCK: Record<string, LigneFinanciere[]> = {
  'proj_1': [
    {
      id: 'ligne_1',
      type: 'facture',
      fournisseur: 'MECOJIT',
      numero: '6442',
      description: 'Lauréat AO',
      montantHT: 3333,
      montantTTC: 4000,
      statut: 'paye',
      date: '2021-12-08',
      notes: ''
    },
    {
      id: 'ligne_2',
      type: 'facture',
      fournisseur: 'ENEDIS',
      numero: '3400002637',
      description: 'Raccordement',
      montantHT: 15641,
      montantTTC: 18770,
      statut: 'paye',
      date: '2023-01-13',
      notes: ''
    },
    {
      id: 'ligne_3',
      type: 'facture',
      fournisseur: 'MECOJIT',
      numero: '12343',
      description: 'Acompte 15% GELY 1',
      montantHT: 21397,
      montantTTC: 25676,
      statut: 'a_payer',
      date: '2025-12-09',
      echeance: '2025-12-25',
      notes: 'Échéance importante'
    }
  ],
  'proj_2': [],
  'proj_3': [
    {
      id: 'ligne_4',
      type: 'facture',
      fournisseur: '1+1 Architecture',
      numero: '',
      description: 'Études permis construction',
      montantHT: 1540,
      montantTTC: 1848,
      statut: 'paye',
      date: '2020-01-20',
      notes: ''
    },
    {
      id: 'ligne_5',
      type: 'facture',
      fournisseur: 'CAB',
      numero: '',
      description: 'Fondations',
      montantHT: 35899,
      montantTTC: 43079,
      statut: 'paye',
      date: '2025-10-15',
      notes: ''
    },
    {
      id: 'ligne_6',
      type: 'devis',
      fournisseur: 'SCMR',
      numero: '',
      description: 'Structure métallique',
      montantHT: 242570,
      montantTTC: 291084,
      statut: 'signe',
      date: '2025-11-01',
      notes: 'Devis signé - À venir'
    }
  ]
}

// Fonction utilitaire pour calculer les totaux
export function calculerTotaux(lignes: LigneFinanciere[]): {
  totalDevis: number
  totalFactures: number
  totalPaye: number
  totalAPayer: number
  totalEnCours: number
} {
  const devis = lignes.filter(l => l.type === 'devis')
  const factures = lignes.filter(l => l.type === 'facture')
  
  return {
    totalDevis: devis.reduce((sum, l) => sum + l.montantTTC, 0),
    totalFactures: factures.reduce((sum, l) => sum + l.montantTTC, 0),
    totalPaye: factures.filter(l => l.statut === 'paye').reduce((sum, l) => sum + l.montantTTC, 0),
    totalAPayer: factures.filter(l => l.statut === 'a_payer').reduce((sum, l) => sum + l.montantTTC, 0),
    totalEnCours: factures.filter(l => l.statut === 'en_cours').reduce((sum, l) => sum + l.montantTTC, 0)
  }
}
