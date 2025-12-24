/**
 * SCRIPT D'IMPORT FIREBASE - DONNÉES EXACTES JEROME GELY
 * 
 * TOUS LES CHIFFRES SONT LES VRAIS - AUCUNE MODIFICATION
 * 
 * Source: Conversations précédentes + Documents Jerome
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, addDoc } from 'firebase/firestore'

// Configuration Firebase (solaire-dataroom)
const firebaseConfig = {
  apiKey: "AIzaSyBRpg61WI9-I-RcnhVJehTDCbUJPP8oAno",
  authDomain: "solaire-dataroom.firebaseapp.com",
  projectId: "solaire-dataroom",
  storageBucket: "solaire-dataroom.firebasestorage.app",
  messagingSenderId: "780021902254",
  appId: "1:780021902254:web:9af0711d07f877babaf63f",
  measurementId: "G-TSFH9H1DR9"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// ============================================
// PROJETS - CHIFFRES EXACTS
// ============================================

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
    description: 'Installation photovoltaïque 99,88 kWc sur toiture existante Rames',
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
    description: 'Construction bâtiment 2496 m² pour installation PV et atelier SOLAIRE NETTOYAGE',
    adresse: '511 Impasse de Saint Rames, 12220 Vaureilles',
    dateDebut: '2020-01-20',
    createdAt: new Date('2020-01-20').toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// ============================================
// LIGNES FINANCIÈRES - CHIFFRES EXACTS
// ============================================

const LIGNES_FINANCIERES = {
  'gely1-gely2-500kwc': [
    // FACTURES PAYÉES
    {
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
      type: 'facture',
      fournisseur: 'ENEDIS',
      numero: '3400002637 (001003)',
      description: 'Raccordement acompte',
      montantHT: 15641,
      montantTTC: 18770,
      statut: 'paye',
      date: '2023-01-13',
      datePaiement: '2023-01-13'
    },
    {
      type: 'facture',
      fournisseur: 'ENEDIS',
      numero: '3400002636 (001004)',
      description: 'Raccordement acompte',
      montantHT: 17073,
      montantTTC: 20487,
      statut: 'paye',
      date: '2023-01-13',
      datePaiement: '2023-01-13'
    },
    {
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
    // FACTURES À PAYER
    {
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
    // DEVIS SIGNÉS
    {
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
      type: 'devis',
      fournisseur: 'MECOJIT',
      numero: 'MJ-250711-01',
      description: 'Installation GELY 2 (250 kWc)',
      montantHT: 142646,
      montantTTC: 171175,
      statut: 'signe',
      date: '2025-10-13'
    }
  ],
  
  'lexa2-100kwc': [
    {
      type: 'facture',
      fournisseur: 'MECOJIT',
      numero: '11976',
      description: 'Développement 100 kWc',
      montantHT: 1000,
      montantTTC: 1200,
      statut: 'paye',
      date: '2025-10-13',
      datePaiement: '2025-10-13'
    }
  ],
  
  'batiment-vaureilles': [
    // FACTURES PAYÉES
    {
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
      type: 'facture',
      fournisseur: 'CCG BÉTON',
      numero: '3100040',
      description: 'Départs carrière (363,55 T) - Refacturé SOLAIRE NETTOYAGE',
      montantHT: 2181,
      montantTTC: 2931,
      statut: 'paye',
      date: '2023-10-31',
      datePaiement: '2023-10-31'
    },
    {
      type: 'facture',
      fournisseur: 'CCG BÉTON',
      numero: '3110039',
      description: 'Départs carrière (2026,80 T) - Refacturé SOLAIRE NETTOYAGE',
      montantHT: 12161,
      montantTTC: 16324,
      statut: 'paye',
      date: '2023-11-30',
      datePaiement: '2023-11-30'
    },
    {
      type: 'facture',
      fournisseur: 'CCG BÉTON',
      numero: '3120034',
      description: 'Départs carrière (789 T) - Refacturé SOLAIRE NETTOYAGE',
      montantHT: 4734,
      montantTTC: 6357,
      statut: 'paye',
      date: '2023-12-31',
      datePaiement: '2023-12-31'
    },
    // DEVIS SIGNÉ
    {
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
}

// ============================================
// FONCTION D'IMPORT
// ============================================

async function importerDonnees() {
  console.log('🚀 DÉBUT IMPORT DONNÉES GELY...\n')

  try {
    // 1. IMPORTER LES PROJETS
    console.log('📊 Import des projets...')
    for (const projet of PROJETS) {
      const projetId = projet.id
      const { id, ...projetData } = projet
      
      await setDoc(doc(db, 'projets', projetId), projetData)
      console.log(`  ✅ Projet "${projet.nom}" importé`)
    }

    // 2. IMPORTER LES LIGNES FINANCIÈRES
    console.log('\n💰 Import des lignes financières...')
    for (const [projetId, lignes] of Object.entries(LIGNES_FINANCIERES)) {
      for (const ligne of lignes) {
        await addDoc(collection(db, 'lignesFinancieres'), {
          ...ligne,
          projetId: projetId,
          createdAt: new Date().toISOString()
        })
      }
      console.log(`  ✅ ${lignes.length} lignes importées pour ${projetId}`)
    }

    console.log('\n✅ IMPORT TERMINÉ AVEC SUCCÈS !')
    console.log('\n📊 RÉSUMÉ :')
    console.log(`  - ${PROJETS.length} projets importés`)
    console.log(`  - ${Object.values(LIGNES_FINANCIERES).flat().length} lignes financières importées`)

  } catch (error) {
    console.error('❌ ERREUR LORS DE L\'IMPORT :', error)
  }
}

// Lancer l'import
importerDonnees()
