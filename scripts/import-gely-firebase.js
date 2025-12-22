// Script d'import des données GELY vers Firebase
// À exécuter UNE SEULE FOIS pour peupler la base

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, setDoc, doc } = require('firebase/firestore');

// Configuration Firebase (depuis .env.local)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Données GELY à importer
const PROJETS_MOCK = [
  {
    id: 'gely1-gely2-500kwc',
    nom: 'GELY 1 & 2 - 500 kWc',
    societe: 'lexa2',
    statut: 'en_cours',
    puissanceKWc: 500,
    budgetInitial: 346600,
    budgetTotal: 474499,
    budgetTotalHT: 395416,
    totalDevis: 342350,
    totalDevisHT: 285292,
    totalFactures: 132149,
    totalFacturesHT: 110124,
    totalPaye: 80797,
    totalPayeHT: 67331,
    totalAPayer: 51352,
    totalAPayerHT: 42794,
    reste: 0,
    resteHT: 0,
    revenusAnnuels: 76720,
    responsable: 'Jerome GELY',
    description: 'Centrales photovoltaïques GELY 1 (250 kWc) + GELY 2 (250 kWc)',
    dateDebut: '2023-01-15',
    localisation: 'Vaureilles (31)',
    contratsEDF: [
      { numero: 'BTA0947265', tarif: 13.70, duree: 20, dateDebut: '2024-06-15', dateFin: '2044-06-14' },
      { numero: 'BTA0930385', tarif: 13.70, duree: 20, dateDebut: '2024-05-20', dateFin: '2044-05-19' }
    ],
    autorisations: [
      { type: 'PC', numero: '012290 20 G0002', dateDepot: '2020-12-10', dateObtention: '2021-01-09' }
    ],
    partenaires: [
      { nom: 'MECOJIT', role: 'Développement PV + Installation', contact: 'Michel JOLY', telephone: '05 61 91 34 56' },
      { nom: 'ENEDIS', role: 'Raccordement réseau' }
    ],
    echeancesCritiques: [
      { id: 'ech1', date: '2025-12-25', description: 'Factures MECOJIT 12343 + 12344', montant: 51352, statut: 'a_venir' }
    ]
  },
  {
    id: 'lexa2-100kwc',
    nom: 'LEXA 2 - 100 kWc',
    societe: 'lexa2',
    statut: 'en_cours',
    puissanceKWc: 99.88,
    budgetInitial: 100000,
    budgetTotal: 100000,
    budgetTotalHT: 83333,
    totalDevis: 0,
    totalDevisHT: 0,
    totalFactures: 1200,
    totalFacturesHT: 1000,
    totalPaye: 1200,
    totalPayeHT: 1000,
    totalAPayer: 0,
    totalAPayerHT: 0,
    reste: 98800,
    resteHT: 82333,
    revenusAnnuels: 12611,
    responsable: 'Jerome GELY',
    description: 'Centrale photovoltaïque 100 kWc',
    dateDebut: '2024-01-10',
    localisation: 'Vaureilles (31)',
    contratsEDF: [
      { numero: 'BTA1524230', tarif: 11.26, duree: 20, dateDebut: '2025-03-01', dateFin: '2045-02-28' }
    ],
    autorisations: [
      { type: 'DP', numero: '012290 24 D0015', dateDepot: '2024-01-15', dateObtention: '2024-02-20' }
    ],
    partenaires: [
      { nom: 'MECOJIT', role: 'Études préalables' }
    ],
    echeancesCritiques: []
  },
  {
    id: 'batiment-vaureilles',
    nom: 'Bâtiment Vaureilles',
    societe: 'sciGely',
    statut: 'en_cours',
    surfaceM2: 2496,
    budgetInitial: 300000,
    budgetTotal: 361623,
    budgetTotalHT: 301353,
    totalDevis: 291084,
    totalDevisHT: 242570,
    totalFactures: 70539,
    totalFacturesHT: 58783,
    totalPaye: 70539,
    totalPayeHT: 58783,
    totalAPayer: 0,
    totalAPayerHT: 0,
    reste: 0,
    resteHT: 0,
    responsable: 'Axel GELY',
    description: 'Construction bâtiment agricole/stockage',
    dateDebut: '2020-12-01',
    localisation: 'Vaureilles (31)',
    autorisations: [
      { type: 'PC', numero: '012290 20 G0003', dateDepot: '2020-11-15', dateObtention: '2021-01-09' }
    ],
    partenaires: [
      { nom: '1+1 Architecture', role: 'Architecte - Études permis construction', contact: 'Nicolas FRANCES (DPLG)', telephone: '05 81 39 18 01' },
      { nom: 'CAB', role: 'Travaux fondations' },
      { nom: 'SCMR', role: 'Structure métallique', notes: 'Devis VTN25062305' },
      { nom: 'CCG BÉTON', role: 'Départs carrière (refacturé depuis SOLAIRE NETTOYAGE)' }
    ],
    echeancesCritiques: []
  }
];

const LIGNES_FINANCIERES_MOCK = {
  'gely1-gely2-500kwc': [
    // FACTURES PAYÉES
    { type: 'facture', fournisseur: 'MECOJIT', numero: '6442', description: 'Acompte chantier', montantHT: 5000, montantTTC: 6000, statut: 'paye', date: '2024-03-15', datePaiement: '2024-03-20' },
    { type: 'facture', fournisseur: 'ENEDIS', numero: 'RAC-2024-001', description: 'Raccordement GELY 1', montantHT: 15000, montantTTC: 18000, statut: 'paye', date: '2024-05-10', datePaiement: '2024-05-25' },
    { type: 'facture', fournisseur: 'ENEDIS', numero: 'RAC-2024-002', description: 'Raccordement GELY 2', montantHT: 15000, montantTTC: 18000, statut: 'paye', date: '2024-06-01', datePaiement: '2024-06-15' },
    { type: 'facture', fournisseur: 'ENEDIS', numero: 'FACT-2024-125', description: 'Travaux complémentaires', montantHT: 15000, montantTTC: 18000, statut: 'paye', date: '2024-07-20', datePaiement: '2024-08-05' },
    { type: 'facture', fournisseur: 'ENEDIS', numero: 'FACT-2024-156', description: 'Mise en service réseau', montantHT: 17331, montantTTC: 20797, statut: 'paye', date: '2024-08-30', datePaiement: '2024-09-10' },
    // FACTURES À PAYER
    { type: 'facture', fournisseur: 'MECOJIT', numero: '12343', description: 'Solde installation GELY 1', montantHT: 21397, montantTTC: 25676, statut: 'a_payer', date: '2024-11-20', dateEcheance: '2025-12-25' },
    { type: 'facture', fournisseur: 'MECOJIT', numero: '12344', description: 'Solde installation GELY 2', montantHT: 21397, montantTTC: 25676, statut: 'a_payer', date: '2024-11-20', dateEcheance: '2025-12-25' },
    // DEVIS SIGNÉS
    { type: 'devis', fournisseur: 'MECOJIT', numero: 'MJ-250711-01', description: 'Installation PV GELY 1 (250 kWc)', montantHT: 142646, montantTTC: 171175, statut: 'signe', date: '2023-07-25' },
    { type: 'devis', fournisseur: 'MECOJIT', numero: 'MJ-250711-02', description: 'Installation PV GELY 2 (250 kWc)', montantHT: 142646, montantTTC: 171175, statut: 'signe', date: '2023-07-25' }
  ],
  'lexa2-100kwc': [
    { type: 'facture', fournisseur: 'MECOJIT', numero: '11976', description: 'Études préalables 100 kWc', montantHT: 1000, montantTTC: 1200, statut: 'paye', date: '2024-02-10', datePaiement: '2024-02-20' }
  ],
  'batiment-vaureilles': [
    // FACTURES PAYÉES
    { type: 'facture', fournisseur: '1+1 Architecture', numero: 'ARCH-2021-01', description: 'Études permis construction', montantHT: 5000, montantTTC: 6000, statut: 'paye', date: '2021-01-15', datePaiement: '2021-01-30' },
    { type: 'facture', fournisseur: 'CAB', numero: 'CAB-2021-045', description: 'Travaux fondations', montantHT: 25000, montantTTC: 30000, statut: 'paye', date: '2021-03-20', datePaiement: '2021-04-15' },
    { type: 'facture', fournisseur: 'CCG BÉTON', numero: 'CCG-2021-078', description: 'Départs carrière (refacturé)', montantHT: 8783, montantTTC: 10539, statut: 'paye', date: '2021-04-10', datePaiement: '2021-04-25' },
    { type: 'facture', fournisseur: 'CCG BÉTON', numero: 'CCG-2021-089', description: 'Complément béton', montantHT: 10000, montantTTC: 12000, statut: 'paye', date: '2021-05-05', datePaiement: '2021-05-20' },
    { type: 'facture', fournisseur: 'CCG BÉTON', numero: 'CCG-2021-102', description: 'Finitions dalle', montantHT: 10000, montantTTC: 12000, statut: 'paye', date: '2021-06-12', datePaiement: '2021-06-30' },
    // DEVIS SIGNÉ
    { type: 'devis', fournisseur: 'SCMR', numero: 'VTN25062305', description: 'Structure métallique complète', montantHT: 242570, montantTTC: 291084, statut: 'signe', date: '2025-06-23' }
  ]
};

// Fonction d'import
async function importerDonnees() {
  console.log('🚀 DÉBUT IMPORT DONNÉES GELY...\n');

  try {
    // 1. IMPORTER LES PROJETS
    console.log('📊 Import des projets...');
    for (const projet of PROJETS_MOCK) {
      const projetId = projet.id;
      delete projet.id; // Retirer l'ID des données
      
      await setDoc(doc(db, 'projets', projetId), projet);
      console.log(`  ✅ Projet "${projet.nom}" importé`);
    }

    // 2. IMPORTER LES LIGNES FINANCIÈRES
    console.log('\n💰 Import des lignes financières...');
    for (const [projetId, lignes] of Object.entries(LIGNES_FINANCIERES_MOCK)) {
      for (const ligne of lignes) {
        await addDoc(collection(db, 'lignesFinancieres'), {
          ...ligne,
          projetId: projetId
        });
      }
      console.log(`  ✅ ${lignes.length} lignes importées pour ${projetId}`);
    }

    console.log('\n✅ IMPORT TERMINÉ AVEC SUCCÈS ! 🎉');
    console.log('\n📊 Résumé :');
    console.log(`  - ${PROJETS_MOCK.length} projets importés`);
    console.log(`  - ${Object.values(LIGNES_FINANCIERES_MOCK).flat().length} lignes financières importées`);
    console.log('\n🔥 Va sur Firebase Console pour voir tes données !');
    
  } catch (error) {
    console.error('❌ ERREUR lors de l\'import :', error);
  }

  process.exit(0);
}

// Lancer l'import
importerDonnees();
