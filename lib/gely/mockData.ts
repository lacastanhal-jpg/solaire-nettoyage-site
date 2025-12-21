import { Projet, LigneFinanciere } from './types'

// DONNÉES RÉELLES - BUDGET AUTO-CALCULÉ AVEC HT/TTC
export const PROJETS_MOCK: Projet[] = [
  {
    id: 'proj_1',
    nom: 'Projet 500 kWc (GELY 1 & 2)',
    societe: 'lexa2',
    responsable: 'Axel GELY',
    statut: 'en_cours',
    // Budget TTC
    budgetTotal: 474499,
    budgetTotalHT: 395416,
    description: 'Installation photovoltaïque 500 kWc (2×250 kWc) sur bâtiment neuf Vaureilles',
    puissanceKWc: 500,
    tarifEDF: 0.137,
    productionAnnuelleKWh: 560000,
    revenusAnnuels: 76720,
    adresse: 'Saint Rame, 12220 Vaureilles',
    contratsEDF: [
      { numero: 'BTA0947265', tarif: 13.70, duree: 20, dateDebut: '2021-12-08' },
      { numero: 'BTA0930385', tarif: 13.70, duree: 20, dateDebut: '2021-12-08' }
    ],
    autorisations: [
      { type: 'DCR', numero: '20-0163 (GELY 1)', dateObtention: '2021-12-08', notes: 'Installation 250 kWc' },
      { type: 'DCR', numero: '20-0234 (GELY 2)', dateObtention: '2021-12-08', notes: 'Installation 250 kWc' }
    ],
    partenaires: [
      { nom: 'MECOJIT', role: 'Développement et installation PV', contact: 'Yanis DESANGLES', telephone: '05.65.43.35.03', email: 'contact@mecojit.com' },
      { nom: 'ENEDIS', role: 'Raccordement réseau', contact: 'Service raccordement' }
    ],
    echeancesCritiques: [
      { id: 'ech_1', date: '2025-12-25', description: 'Acompte 15% GELY 1 + GELY 2', montant: 51352, statut: 'a_venir' },
      { id: 'ech_2', date: '2026-06-30', description: 'Solde 85% GELY 1 (estimé)', montant: 145499, statut: 'a_venir' },
      { id: 'ech_3', date: '2026-06-30', description: 'Solde 85% GELY 2 (estimé)', montant: 145499, statut: 'a_venir' }
    ],
    // Totaux TTC
    totalDevis: 342350,
    totalFactures: 132149,
    totalPaye: 80797,
    totalAPayer: 51352,
    reste: 0,
    // Totaux HT
    totalDevisHT: 285220,
    totalFacturesHT: 110123,
    totalPayeHT: 67331,
    totalAPayerHT: 42794,
    resteHT: 0,
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
    // Budget
    budgetTotal: 100000,
    budgetTotalHT: 83333,
    description: 'Installation photovoltaïque 99,88 kWc sur toiture existante Rames',
    puissanceKWc: 99.88,
    tarifEDF: 0.1126,
    productionAnnuelleKWh: 112000,
    revenusAnnuels: 12611,
    adresse: 'Rames, 12220 Vaureilles',
    contratsEDF: [
      { numero: 'BTA1524230', tarif: 11.26, duree: 20, dateDebut: '2025-07-29' }
    ],
    autorisations: [
      { type: 'DP', numero: 'DP0122902500017', dateDepot: '2025-05-05', dateObtention: '2025-05-23', notes: 'Décision non-opposition - Maire Claude HENRY' },
      { type: 'DCR', numero: 'rac-nmp-25-003743', dateDepot: '2025-06-30', notes: 'Demande de raccordement ENEDIS' }
    ],
    partenaires: [
      { nom: 'MECOJIT', role: 'Développement et installation PV', contact: 'Yanis DESANGLES', telephone: '05.65.43.35.03', email: 'contact@mecojit.com' }
    ],
    echeancesCritiques: [],
    // Totaux TTC
    totalDevis: 0,
    totalFactures: 1200,
    totalPaye: 1200,
    totalAPayer: 0,
    reste: 98800,
    // Totaux HT
    totalDevisHT: 0,
    totalFacturesHT: 1000,
    totalPayeHT: 1000,
    totalAPayerHT: 0,
    resteHT: 82333,
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
    // Budget
    budgetTotal: 361623,
    budgetTotalHT: 301353,
    description: 'Construction bâtiment 2496 m² pour installation PV et atelier SOLAIRE NETTOYAGE',
    surfaceM2: 2496,
    adresse: '511 Impasse de Saint Rames, 12220 Vaureilles',
    autorisations: [
      { type: 'PC', numero: 'PC 012290 20 G0003', dateDepot: '2020-01-20', dateObtention: '2021-01-09', notes: 'Ouverture chantier : 09/01/2021 - Certification CERFA : 22/08/2023' }
    ],
    partenaires: [
      { nom: '1+1 Architecture', role: 'Architecte - Études permis construction', contact: 'Nicolas FRANCES (DPLG)', telephone: '05 81 39 18 01' },
      { nom: 'CAB', role: 'Travaux fondations' },
      { nom: 'SCMR', role: 'Structure métallique', notes: 'Devis VTN25062305' },
      { nom: 'CCG BÉTON', role: 'Départs carrière (refacturé depuis SOLAIRE NETTOYAGE)' }
    ],
    echeancesCritiques: [
      { id: 'ech_4', date: '2026-03-01', description: 'Paiement structure SCMR (estimé)', montant: 291084, statut: 'a_venir' }
    ],
    // Totaux TTC
    totalDevis: 291084,
    totalFactures: 70539,
    totalPaye: 70539,
    totalAPayer: 0,
    reste: 0,
    // Totaux HT
    totalDevisHT: 242570,
    totalFacturesHT: 58783,
    totalPayeHT: 58783,
    totalAPayerHT: 0,
    resteHT: 0,
    dateDebut: '2020-01-20',
    createdAt: '2020-01-20T10:00:00Z',
    updatedAt: '2025-12-21T10:00:00Z'
  }
]

export const LIGNES_FINANCIERES_MOCK: Record<string, LigneFinanciere[]> = {
  'proj_1': [
    // FACTURES PAYÉES
    {
      id: 'ligne_1',
      type: 'facture',
      fournisseur: 'MECOJIT',
      numero: '6442',
      description: 'Lauréat AO + caution',
      montantHT: 3333,
      montantTTC: 4000,
      statut: 'paye',
      date: '2021-12-08',
      notes: 'Payé'
    },
    {
      id: 'ligne_2a',
      type: 'facture',
      fournisseur: 'ENEDIS',
      numero: '3400002637 (001003)',
      description: 'Raccordement acompte',
      montantHT: 15641,
      montantTTC: 18770,
      statut: 'paye',
      date: '2023-01-13',
      notes: 'Payé'
    },
    {
      id: 'ligne_2b',
      type: 'facture',
      fournisseur: 'ENEDIS',
      numero: '3400002636 (001004)',
      description: 'Raccordement acompte',
      montantHT: 17073,
      montantTTC: 20487,
      statut: 'paye',
      date: '2023-01-13',
      notes: 'Payé'
    },
    {
      id: 'ligne_2c',
      type: 'facture',
      fournisseur: 'ENEDIS',
      numero: '0326-690896472',
      description: 'Solde raccordement 001004',
      montantHT: 15641,
      montantTTC: 18770,
      statut: 'paye',
      date: '2024-10-23',
      notes: 'Payé'
    },
    {
      id: 'ligne_2d',
      type: 'facture',
      fournisseur: 'ENEDIS',
      numero: '0326-690897877',
      description: 'Solde raccordement 001003',
      montantHT: 15641,
      montantTTC: 18770,
      statut: 'paye',
      date: '2024-11-04',
      notes: 'Payé'
    },
    // FACTURES À PAYER
    {
      id: 'ligne_3a',
      type: 'facture',
      fournisseur: 'MECOJIT',
      numero: '12343',
      description: 'Acompte 15% GELY 1',
      montantHT: 21397,
      montantTTC: 25676,
      statut: 'a_payer',
      date: '2025-12-09',
      echeance: '2025-12-25',
      notes: '❗ ÉCHÉANCE CRITIQUE 25/12/2025'
    },
    {
      id: 'ligne_3b',
      type: 'facture',
      fournisseur: 'MECOJIT',
      numero: '12344',
      description: 'Acompte 15% GELY 2',
      montantHT: 21397,
      montantTTC: 25676,
      statut: 'a_payer',
      date: '2025-12-09',
      echeance: '2025-12-25',
      notes: '❗ ÉCHÉANCE CRITIQUE 25/12/2025'
    },
    // DEVIS SIGNÉS
    {
      id: 'ligne_4a',
      type: 'devis',
      fournisseur: 'MECOJIT',
      numero: 'MJ-250711-02',
      description: 'Installation GELY 1 (250 kWc)',
      montantHT: 142574,
      montantTTC: 171175,
      statut: 'signe',
      date: '2025-10-13',
      notes: 'Bon de commande signé'
    },
    {
      id: 'ligne_4b',
      type: 'devis',
      fournisseur: 'MECOJIT',
      numero: 'MJ-250711-01',
      description: 'Installation GELY 2 (250 kWc)',
      montantHT: 142646,
      montantTTC: 171175,
      statut: 'signe',
      date: '2025-10-13',
      notes: 'Bon de commande signé'
    }
  ],
  
  'proj_2': [
    {
      id: 'ligne_5',
      type: 'facture',
      fournisseur: 'MECOJIT',
      numero: '11976',
      description: 'Développement 100 kWc',
      montantHT: 1000,
      montantTTC: 1200,
      statut: 'paye',
      date: '2025-10-13',
      notes: 'Payé'
    }
  ],
  
  'proj_3': [
    // FACTURES PAYÉES
    {
      id: 'ligne_6',
      type: 'facture',
      fournisseur: '1+1 Architecture',
      numero: '202003',
      description: 'Études permis construction',
      montantHT: 1540,
      montantTTC: 1848,
      statut: 'paye',
      date: '2020-01-20',
      notes: 'Payé'
    },
    {
      id: 'ligne_7',
      type: 'facture',
      fournisseur: 'CAB',
      numero: '483',
      description: 'Fondations',
      montantHT: 35899,
      montantTTC: 43079,
      statut: 'paye',
      date: '2025-10-15',
      notes: 'Payé le 18/12/2025'
    },
    {
      id: 'ligne_7a',
      type: 'facture',
      fournisseur: 'CCG BÉTON',
      numero: '3100040',
      description: 'Départs carrière (363,55 T) - Refacturé SOLAIRE NETTOYAGE',
      montantHT: 2181,
      montantTTC: 2931,
      statut: 'paye',
      date: '2023-10-31',
      notes: 'Payé - Refacturation interne'
    },
    {
      id: 'ligne_7b',
      type: 'facture',
      fournisseur: 'CCG BÉTON',
      numero: '3110039',
      description: 'Départs carrière (2026,80 T) - Refacturé SOLAIRE NETTOYAGE',
      montantHT: 12161,
      montantTTC: 16324,
      statut: 'paye',
      date: '2023-11-30',
      notes: 'Payé - Refacturation interne'
    },
    {
      id: 'ligne_7c',
      type: 'facture',
      fournisseur: 'CCG BÉTON',
      numero: '3120034',
      description: 'Départs carrière (789 T) - Refacturé SOLAIRE NETTOYAGE',
      montantHT: 4734,
      montantTTC: 6357,
      statut: 'paye',
      date: '2023-12-31',
      notes: 'Payé - Refacturation interne'
    },
    // DEVIS SIGNÉ
    {
      id: 'ligne_8',
      type: 'devis',
      fournisseur: 'SCMR',
      numero: 'VTN25062305',
      description: 'Structure métallique',
      montantHT: 242570,
      montantTTC: 291084,
      statut: 'signe',
      date: '2025-06-20',
      notes: 'Devis signé - Travaux 2026'
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
  totalDevisHT: number
  totalFacturesHT: number
  totalPayeHT: number
  totalAPayerHT: number
  totalEnCoursHT: number
} {
  const devis = lignes.filter(l => l.type === 'devis')
  const factures = lignes.filter(l => l.type === 'facture')
  
  return {
    totalDevis: devis.reduce((sum, l) => sum + l.montantTTC, 0),
    totalFactures: factures.reduce((sum, l) => sum + l.montantTTC, 0),
    totalPaye: factures.filter(l => l.statut === 'paye').reduce((sum, l) => sum + l.montantTTC, 0),
    totalAPayer: factures.filter(l => l.statut === 'a_payer').reduce((sum, l) => sum + l.montantTTC, 0),
    totalEnCours: factures.filter(l => l.statut === 'en_cours').reduce((sum, l) => sum + l.montantTTC, 0),
    totalDevisHT: devis.reduce((sum, l) => sum + l.montantHT, 0),
    totalFacturesHT: factures.reduce((sum, l) => sum + l.montantHT, 0),
    totalPayeHT: factures.filter(l => l.statut === 'paye').reduce((sum, l) => sum + l.montantHT, 0),
    totalAPayerHT: factures.filter(l => l.statut === 'a_payer').reduce((sum, l) => sum + l.montantHT, 0),
    totalEnCoursHT: factures.filter(l => l.statut === 'en_cours').reduce((sum, l) => sum + l.montantHT, 0)
  }
}
