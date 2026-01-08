import { db } from '../firebase/config'
import { collection, getDocs, setDoc, doc, query, where } from 'firebase/firestore'

interface FichierLog {
  date: string
  facturesMigrees: number
  erreursCount: number
  erreurs: Array<{ factureId: string, erreur: string, collection: string }>
  details: {
    stock: { total: number, migrees: number, erreurs: number }
    compta: { total: number, migrees: number, erreurs: number }
  }
}

/**
 * 🔄 MIGRATION - Migrer toutes les factures fournisseurs vers collection unifiée
 */
export async function migrerFacturesFournisseurs(): Promise<FichierLog> {
  const log: FichierLog = {
    date: new Date().toISOString(),
    facturesMigrees: 0,
    erreursCount: 0,
    erreurs: [],
    details: {
      stock: { total: 0, migrees: 0, erreurs: 0 },
      compta: { total: 0, migrees: 0, erreurs: 0 }
    }
  }

  try {
    console.log('🔄 DÉBUT MIGRATION FACTURES FOURNISSEURS')
    console.log('========================================')
    
    // ===================================
    // 1. MIGRER factures_fournisseurs_stock
    // ===================================
    
    console.log('\n📦 Migration factures_fournisseurs_stock...')
    
    const facturesStockSnap = await getDocs(
      collection(db, 'factures_fournisseurs_stock')
    )
    
    log.details.stock.total = facturesStockSnap.size
    console.log(`   Trouvées : ${facturesStockSnap.size} factures`)
    
    for (const docSnap of facturesStockSnap.docs) {
      try {
        const oldData = docSnap.data()
        
        // Convertir format stock → format unifié
        const newData = {
          ...oldData,
          
          // ===== CHAMPS À AJOUTER =====
          origine: 'stock_flotte',  // 🔄 Identifier l'origine
          
          // Harmoniser les noms de champs
          numeroFournisseur: oldData.numero || oldData.numeroFournisseur,
          siretFournisseur: oldData.siretFournisseur || undefined,
          
          // Harmoniser les montants
          montantHT: oldData.montantHT || oldData.totalHT,
          montantTVA: oldData.montantTVA || oldData.totalTVA,
          montantTTC: oldData.montantTTC || oldData.totalTTC,
          
          // Harmoniser le PDF
          pdfURL: oldData.pdfURL || oldData.documentUrl,
          
          // Harmoniser le statut
          statut: oldData.statut === 'en_attente' ? 'brouillon' : 
                  oldData.statut === 'stock_genere' ? 'validee' : 
                  oldData.statut || 'brouillon',
          
          // Ajouter champs manquants
          ecrituresComptablesIds: oldData.ecrituresComptablesIds || [],
          
          // Harmoniser dateFacture
          dateFacture: oldData.dateFacture || oldData.date,
          
          // Convertir lignes si nécessaire
          lignes: (oldData.lignes || []).map((ligne: any, index: number) => ({
            id: ligne.id || `L${(index + 1).toString().padStart(3, '0')}`,
            articleStockId: ligne.articleStockId || ligne.articleId,
            articleCode: ligne.articleCode || ligne.code,
            designation: ligne.designation || ligne.description || ligne.articleDescription,
            quantite: ligne.quantite,
            prixUnitaireHT: ligne.prixUnitaireHT || ligne.prixUnitaire,
            tauxTVA: ligne.tauxTVA,
            montantHT: ligne.montantHT || ligne.totalHT,
            montantTVA: ligne.montantTVA || ligne.totalTVA,
            montantTTC: ligne.montantTTC || ligne.totalTTC,
            compteComptable: ligne.compteComptable || '6063',  // Par défaut
            compteIntitule: ligne.compteIntitule || 'Fournitures d\'entretien',
            depotDestination: ligne.depotDestination || 'Atelier',
            genererMouvementStock: ligne.genererMouvementStock !== undefined ? ligne.genererMouvementStock : true,
            mouvementStockId: ligne.mouvementStockId
          })),
          
          // Traçabilité
          createdBy: oldData.createdBy || 'MIGRATION',
          
          // Générer numéro interne si manquant
          numero: oldData.numero && oldData.numero.startsWith('FF-') ? 
                  oldData.numero : 
                  `FF-MIGR-${docSnap.id.substring(0, 8)}`
        }
        
        // Nettoyer les champs en double (garder nouveaux noms)
        delete (newData as any).date
        delete (newData as any).totalHT
        delete (newData as any).totalTVA
        delete (newData as any).totalTTC
        delete (newData as any).documentUrl
        
        // 🔧 CORRECTION : Nettoyer tous les undefined pour Firestore
        const cleanData = Object.fromEntries(
          Object.entries(newData).filter(([_, v]) => v !== undefined)
        )
        
        // Nettoyer aussi dans les sous-objets (lignes)
        if (cleanData.lignes && Array.isArray(cleanData.lignes)) {
          cleanData.lignes = cleanData.lignes.map((ligne: any) => 
            Object.fromEntries(
              Object.entries(ligne).filter(([_, v]) => v !== undefined)
            )
          )
        }
        
        // Créer dans nouvelle collection (CONSERVER L'ID ORIGINAL)
        await setDoc(doc(db, 'factures_fournisseurs', docSnap.id), cleanData)
        
        log.facturesMigrees++
        log.details.stock.migrees++
        
        if (log.details.stock.migrees % 10 === 0) {
          console.log(`   ✅ ${log.details.stock.migrees}/${log.details.stock.total} migrées`)
        }
        
      } catch (error: any) {
        log.erreursCount++
        log.details.stock.erreurs++
        log.erreurs.push({
          factureId: docSnap.id,
          erreur: error.message,
          collection: 'stock'
        })
        console.error(`   ❌ Erreur facture ${docSnap.id}:`, error.message)
      }
    }
    
    console.log(`   ✅ Stock terminé : ${log.details.stock.migrees}/${log.details.stock.total}`)
    if (log.details.stock.erreurs > 0) {
      console.log(`   ⚠️  Erreurs : ${log.details.stock.erreurs}`)
    }
    
    // ===================================
    // 2. MIGRER factures_fournisseurs_compta
    // ===================================
    
    console.log('\n💼 Migration factures_fournisseurs_compta...')
    
    const facturesComptaSnap = await getDocs(
      collection(db, 'factures_fournisseurs_compta')
    )
    
    log.details.compta.total = facturesComptaSnap.size
    console.log(`   Trouvées : ${facturesComptaSnap.size} factures`)
    
    for (const docSnap of facturesComptaSnap.docs) {
      try {
        const oldData = docSnap.data()
        
        // Pour compta, juste ajouter le champ origine
        const newData = {
          ...oldData,
          origine: 'comptabilite'  // 🔄 Identifier l'origine
        }
        
        // Créer dans nouvelle collection (CONSERVER L'ID ORIGINAL)
        await setDoc(doc(db, 'factures_fournisseurs', docSnap.id), newData)
        
        log.facturesMigrees++
        log.details.compta.migrees++
        
        if (log.details.compta.migrees % 10 === 0) {
          console.log(`   ✅ ${log.details.compta.migrees}/${log.details.compta.total} migrées`)
        }
        
      } catch (error: any) {
        log.erreursCount++
        log.details.compta.erreurs++
        log.erreurs.push({
          factureId: docSnap.id,
          erreur: error.message,
          collection: 'compta'
        })
        console.error(`   ❌ Erreur facture ${docSnap.id}:`, error.message)
      }
    }
    
    console.log(`   ✅ Compta terminé : ${log.details.compta.migrees}/${log.details.compta.total}`)
    if (log.details.compta.erreurs > 0) {
      console.log(`   ⚠️  Erreurs : ${log.details.compta.erreurs}`)
    }
    
    // ===================================
    // 3. RÉSUMÉ FINAL
    // ===================================
    
    console.log('\n========================================')
    console.log('✅ MIGRATION TERMINÉE')
    console.log(`📊 Total migré : ${log.facturesMigrees}/${log.details.stock.total + log.details.compta.total}`)
    console.log(`   • Stock : ${log.details.stock.migrees}/${log.details.stock.total}`)
    console.log(`   • Compta : ${log.details.compta.migrees}/${log.details.compta.total}`)
    
    if (log.erreursCount > 0) {
      console.log(`⚠️  Erreurs : ${log.erreursCount}`)
      console.log('   Détails dans le rapport')
    }
    
    return log
    
  } catch (error) {
    console.error('❌ ERREUR CRITIQUE MIGRATION:', error)
    throw error
  }
}

/**
 * 🔍 Vérifier l'état de la migration
 */
export async function verifierMigration(): Promise<{
  anciennes: { stock: number, compta: number, total: number }
  nouvelle: number
  ok: boolean
  message: string
}> {
  try {
    const stockCount = (await getDocs(collection(db, 'factures_fournisseurs_stock'))).size
    const comptaCount = (await getDocs(collection(db, 'factures_fournisseurs_compta'))).size
    const nouvelleCount = (await getDocs(collection(db, 'factures_fournisseurs'))).size
    
    const totalAnciennes = stockCount + comptaCount
    const ok = nouvelleCount >= totalAnciennes
    
    let message = ''
    if (nouvelleCount === 0) {
      message = '⚪ Migration pas encore lancée'
    } else if (nouvelleCount < totalAnciennes) {
      message = `⚠️  Migration incomplète (${nouvelleCount}/${totalAnciennes})`
    } else if (nouvelleCount === totalAnciennes) {
      message = '✅ Migration complète et correcte'
    } else {
      message = `⚠️  Plus de factures dans nouvelle collection (${nouvelleCount}) que dans anciennes (${totalAnciennes})`
    }
    
    return {
      anciennes: { stock: stockCount, compta: comptaCount, total: totalAnciennes },
      nouvelle: nouvelleCount,
      ok,
      message
    }
  } catch (error) {
    console.error('Erreur vérification:', error)
    throw error
  }
}

/**
 * 🔍 Vérifier les doublons potentiels AVANT migration
 */
export async function verifierDoublons(): Promise<{
  doublons: Array<{
    numeroFournisseur: string
    fournisseur: string
    facturesStock: string[]
    facturesCompta: string[]
  }>
  total: number
}> {
  try {
    console.log('🔍 Vérification doublons...')
    
    const stockSnap = await getDocs(collection(db, 'factures_fournisseurs_stock'))
    const comptaSnap = await getDocs(collection(db, 'factures_fournisseurs_compta'))
    
    // Créer index
    const index = new Map<string, {
      stock: string[]
      compta: string[]
    }>()
    
    // Indexer stock
    stockSnap.forEach(doc => {
      const data = doc.data()
      const key = `${data.numero || data.numeroFournisseur}||${data.fournisseur}`.toUpperCase()
      if (!index.has(key)) {
        index.set(key, { stock: [], compta: [] })
      }
      index.get(key)!.stock.push(doc.id)
    })
    
    // Indexer compta
    comptaSnap.forEach(doc => {
      const data = doc.data()
      const key = `${data.numeroFournisseur}||${data.fournisseur}`.toUpperCase()
      if (!index.has(key)) {
        index.set(key, { stock: [], compta: [] })
      }
      index.get(key)!.compta.push(doc.id)
    })
    
    // Trouver doublons
    const doublons: any[] = []
    index.forEach((value, key) => {
      if (value.stock.length > 0 && value.compta.length > 0) {
        const [numeroFournisseur, fournisseur] = key.split('||')
        doublons.push({
          numeroFournisseur,
          fournisseur,
          facturesStock: value.stock,
          facturesCompta: value.compta
        })
      }
    })
    
    console.log(`   ${doublons.length > 0 ? '⚠️' : '✅'} ${doublons.length} doublon(s) détecté(s)`)
    
    return {
      doublons,
      total: doublons.length
    }
  } catch (error) {
    console.error('Erreur vérification doublons:', error)
    throw error
  }
}
