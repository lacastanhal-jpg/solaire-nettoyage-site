/**
 * SCRIPT NETTOYAGE FIREBASE - SUPPRIME TOUT
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore'

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

async function nettoyerFirebase() {
  console.log('🧹 NETTOYAGE FIREBASE...\n')

  try {
    // Supprimer projets
    console.log('🗑️ Suppression projets...')
    const projetsSnap = await getDocs(collection(db, 'projets'))
    let count = 0
    for (const docSnap of projetsSnap.docs) {
      await deleteDoc(doc(db, 'projets', docSnap.id))
      count++
    }
    console.log(`  ✅ ${count} projets supprimés`)

    // Supprimer lignes financières
    console.log('🗑️ Suppression lignes financières...')
    const lignesSnap = await getDocs(collection(db, 'lignesFinancieres'))
    count = 0
    for (const docSnap of lignesSnap.docs) {
      await deleteDoc(doc(db, 'lignesFinancieres', docSnap.id))
      count++
    }
    console.log(`  ✅ ${count} lignes financières supprimées`)

    console.log('\n✅ NETTOYAGE TERMINÉ !')
    console.log('👉 Maintenant relance: node scripts/import-firebase-FINAL.js')

  } catch (error) {
    console.error('❌ ERREUR:', error)
  }
}

nettoyerFirebase()
