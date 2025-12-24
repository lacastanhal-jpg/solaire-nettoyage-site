/**
 * SCRIPT IMPORT FIREBASE FINAL - AVEC IDS FIXES
 * Utilise setDoc() partout pour éviter les doublons
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBRpg61WI9-I-RcnhVJehTDCbUJPP8oAno",
  authDomain: "solaire-dataroom.firebaseapp.com",
  projectId: "solaire-dataroom",
  storageBucket: "solaire-dataroom.firebasestorage.app",
  messagingSenderId: "780021902254",
  appId: "1:780021902254:web:9af0711d07f877babaf63f"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const PROJETS = [
  {
    id: 'gely1-gely2-500kwc',
    nom: 'GELY 1 & 2 - 500 kWc',
    societe: 'lexa2',
    statut: 'en_cours',
    puissanceKWc: 500,
    tarifEDF: 0.137,
    productionAnnuelleKWh: 560000,
    revenusAnnuels: 76720,
    budgetInitial: 346600,
    budgetTotalHT: 395416,
    budgetTotal: 474499,
    totalPayeHT: 67331,
    totalPaye: 80797,
    totalAPayerHT: 42794,
    totalAPayer: 51352,
    resteHT: 0,
    reste: 0,
    responsable: 'Axel GELY',
    description: 'Centrales photovoltaïques GELY 1 + GELY 2',
    adresse: 'Saint Rame, 12220 Vaureilles',
    dateDebut: '2021-12-08',
    createdAt: new Date('2021-12-08').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lexa2-100kwc',
    nom: 'LEXA 2 - 100 kWc',
    societe: 'lexa2',
    statut: 'developement',
    puissanceKWc: 99.88,
    tarifEDF: 0.1126,
    productionAnnuelleKWh: 112000,
    revenusAnnuels: 12611,
    budgetInitial: 100000,
    budgetTotalHT: 83333,
    budgetTotal: 100000,
    totalPayeHT: 1000,
    totalPaye: 1200,
    totalAPayerHT: 0,
    totalAPayer: 0,
    resteHT: 82333,
    reste: 98800,
    responsable: 'Axel GELY',
    description: 'Installation photovoltaïque 99,88 kWc',
    adresse: 'Rames, 12220 Vaureilles',
    dateDebut: '2025-01-15',
    createdAt: new Date('2025-01-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'batiment-vaureilles',
    nom: 'Bâtiment photovoltaïque Vaureilles',
    societe: 'sciGely',
    statut: 'en_cours',
    surfaceM2: 2496,
    budgetInitial: 300000,
    budgetTotalHT: 301353,
    budgetTotal: 361623,
    totalPayeHT: 58783,
    totalPaye: 70539,
    totalAPayerHT: 0,
    totalAPayer: 0,
    resteHT: 0,
    reste: 0,
    responsable: 'Jerome GELY',
    description: 'Construction bâtiment 2496 m²',
    adresse: '511 Impasse de Saint Rames, 12220 Vaureilles',
    dateDebut: '2020-01-20',
    createdAt: new Date('2020-01-20').toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const LIGNES_FINANCIERES = [
  // PROJET 500 kWc
  {
    id: 'ligne-mecojit-6442',
    projetId: 'gely1-gely2-500kwc',
    type: 'facture',
    fournisseur: 'MECOJIT',
    numero: '6442',
    description: 'Lauréat AO + caution',
    montantHT: 3333,
    montantTTC: 4000,
    statut: 'paye',
    date: '2021-12-08',
    datePaiement: '2021-12-08'
  },
  {
    id: 'ligne-enedis-3400002637',
    projetId: 'gely1-gely2-500kwc',
    type: 'facture',
    fournisseur: 'ENEDIS',
    numero: '3400002637',
    description: 'Raccordement acompte 001003',
    montantHT: 15641,
    montantTTC: 18770,
    statut: 'paye',
    date: '2023-01-13',
    datePaiement: '2023-01-13'
  },
  {
    id: 'ligne-enedis-3400002636',
    projetId: 'gely1-gely2-500kwc',
    type: 'facture',
    fournisseur: 'ENEDIS',
    numero: '3400002636',
    description: 'Raccordement acompte 001004',
    montantHT: 17073,
    montantTTC: 20487,
    statut: 'paye',
    date: '2023-01-13',
    datePaiement: '2023-01-13'
  },
  {
    id: 'ligne-enedis-690896472',
    projetId: 'gely1-gely2-500kwc',
    type: 'facture',
    fournisseur: 'ENEDIS',
    numero: '0326-690896472',
    description: 'Solde raccordement 001004',
    montantHT: 15641,
    montantTTC: 18770,
    statut: 'paye',
    date: '2024-10-23',
    datePaiement: '2024-10-23'
  },
  {
    id: 'ligne-enedis-690897877',
    projetId: 'gely1-gely2-500kwc',
    type: 'facture',
    fournisseur: 'ENEDIS',
    numero: '0326-690897877',
    description: 'Solde raccordement 001003',
    montantHT: 15641,
    montantTTC: 18770,
    statut: 'paye',
    date: '2024-11-04',
    datePaiement: '2024-11-04'
  },
  {
    id: 'ligne-mecojit-12343',
    projetId: 'gely1-gely2-500kwc',
    type: 'facture',
    fournisseur: 'MECOJIT',
    numero: '12343',
    description: 'Acompte 15% GELY 1',
    montantHT: 21397,
    montantTTC: 25676,
    statut: 'a_payer',
    date: '2025-12-09',
    echeance: '2025-12-25'
  },
  {
    id: 'ligne-mecojit-12344',
    projetId: 'gely1-gely2-500kwc',
    type: 'facture',
    fournisseur: 'MECOJIT',
    numero: '12344',
    description: 'Acompte 15% GELY 2',
    montantHT: 21397,
    montantTTC: 25676,
    statut: 'a_payer',
    date: '2025-12-09',
    echeance: '2025-12-25'
  },
  {
    id: 'devis-mecojit-250711-02',
    projetId: 'gely1-gely2-500kwc',
    type: 'devis',
    fournisseur: 'MECOJIT',
    numero: 'MJ-250711-02',
    description: 'Installation GELY 1 (250 kWc)',
    montantHT: 142574,
    montantTTC: 171175,
    statut: 'signe',
    date: '2025-10-13'
  },
  {
    id: 'devis-mecojit-250711-01',
    projetId: 'gely1-gely2-500kwc',
    type: 'devis',
    fournisseur: 'MECOJIT',
    numero: 'MJ-250711-01',
    description: 'Installation GELY 2 (250 kWc)',
    montantHT: 142646,
    montantTTC: 171175,
    statut: 'signe',
    date: '2025-10-13'
  },
  
  // PROJET 100 kWc
  {
    id: 'ligne-mecojit-11976',
    projetId: 'lexa2-100kwc',
    type: 'facture',
    fournisseur: 'MECOJIT',
    numero: '11976',
    description: 'Développement 100 kWc',
    montantHT: 1000,
    montantTTC: 1200,
    statut: 'paye',
    date: '2025-10-13',
    datePaiement: '2025-10-13'
  },
  
  // BÂTIMENT VAUREILLES
  {
    id: 'ligne-1plus1-202003',
    projetId: 'batiment-vaureilles',
    type: 'facture',
    fournisseur: '1+1 Architecture',
    numero: '202003',
    description: 'Études permis construction',
    montantHT: 1540,
    montantTTC: 1848,
    statut: 'paye',
    date: '2020-01-20',
    datePaiement: '2020-01-20'
  },
  {
    id: 'ligne-cab-483',
    projetId: 'batiment-vaureilles',
    type: 'facture',
    fournisseur: 'CAB',
    numero: '483',
    description: 'Fondations',
    montantHT: 35899,
    montantTTC: 43079,
    statut: 'paye',
    date: '2025-10-15',
    datePaiement: '2025-12-18'
  },
  {
    id: 'ligne-ccg-3100040',
    projetId: 'batiment-vaureilles',
    type: 'facture',
    fournisseur: 'CCG BÉTON',
    numero: '3100040',
    description: 'Départs carrière (363,55 T)',
    montantHT: 2181,
    montantTTC: 2931,
    statut: 'paye',
    date: '2023-10-31',
    datePaiement: '2023-10-31'
  },
  {
    id: 'ligne-ccg-3110039',
    projetId: 'batiment-vaureilles',
    type: 'facture',
    fournisseur: 'CCG BÉTON',
    numero: '3110039',
    description: 'Départs carrière (2026,80 T)',
    montantHT: 12161,
    montantTTC: 16324,
    statut: 'paye',
    date: '2023-11-30',
    datePaiement: '2023-11-30'
  },
  {
    id: 'ligne-ccg-3120034',
    projetId: 'batiment-vaureilles',
    type: 'facture',
    fournisseur: 'CCG BÉTON',
    numero: '3120034',
    description: 'Départs carrière (789 T)',
    montantHT: 4734,
    montantTTC: 6357,
    statut: 'paye',
    date: '2023-12-31',
    datePaiement: '2023-12-31'
  },
  {
    id: 'devis-scmr-vtn25062305',
    projetId: 'batiment-vaureilles',
    type: 'devis',
    fournisseur: 'SCMR',
    numero: 'VTN25062305',
    description: 'Structure métallique complète',
    montantHT: 242570,
    montantTTC: 291084,
    statut: 'signe',
    date: '2025-06-23'
  }
]

async function importerDonnees() {
  console.log('🚀 IMPORT FIREBASE FINAL...\n')

  try {
    // Importer projets
    console.log('📊 Import projets...')
    for (const projet of PROJETS) {
      const { id, ...data } = projet
      await setDoc(doc(db, 'projets', id), data)
      console.log(`  ✅ ${projet.nom}`)
    }

    // Importer lignes financières
    console.log('\n💰 Import lignes financières...')
    for (const ligne of LIGNES_FINANCIERES) {
      const { id, ...data } = ligne
      await setDoc(doc(db, 'lignesFinancieres', id), data)
    }
    console.log(`  ✅ ${LIGNES_FINANCIERES.length} lignes importées`)

    console.log('\n✅ IMPORT TERMINÉ !')
    console.log('\n📊 RÉSUMÉ :')
    console.log(`  - ${PROJETS.length} projets`)
    console.log(`  - ${LIGNES_FINANCIERES.length} lignes financières`)

  } catch (error) {
    console.error('❌ ERREUR:', error)
  }
}

importerDonnees()
