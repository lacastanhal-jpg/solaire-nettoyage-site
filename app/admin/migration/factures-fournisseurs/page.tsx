'use client'

import { useState } from 'react'
import Link from 'next/link'
import { migrerFacturesFournisseurs, verifierMigration, verifierDoublons } from '@/lib/scripts/migrer-factures-fournisseurs'

export default function MigrationFacturesFournisseursPage() {
  const [migrationEnCours, setMigrationEnCours] = useState(false)
  const [verificationEnCours, setVerificationEnCours] = useState(false)
  const [resultat, setResultat] = useState<any>(null)
  const [verification, setVerification] = useState<any>(null)
  const [doublons, setDoublons] = useState<any>(null)
  
  async function handleVerifier() {
    setVerificationEnCours(true)
    try {
      const verif = await verifierMigration()
      setVerification(verif)
      
      // Vérifier doublons aussi
      const doublonsResult = await verifierDoublons()
      setDoublons(doublonsResult)
      
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message)
    } finally {
      setVerificationEnCours(false)
    }
  }
  
  async function handleLancerMigration() {
    if (!confirm(
      '⚠️ ATTENTION : Lancer la migration ?\n\n' +
      'Cette action va créer toutes les factures dans la nouvelle collection.\n\n' +
      'Les anciennes collections ne seront PAS supprimées (backup).\n\n' +
      'Continuer ?'
    )) {
      return
    }
    
    setMigrationEnCours(true)
    setResultat(null)
    
    try {
      const log = await migrerFacturesFournisseurs()
      setResultat(log)
      
      if (log.erreursCount === 0) {
        alert(`✅ Migration réussie !\n\n${log.facturesMigrees} factures migrées sans erreur.`)
      } else {
        alert(
          `⚠️ Migration terminée avec erreurs\n\n` +
          `Migrées : ${log.facturesMigrees}\n` +
          `Erreurs : ${log.erreursCount}\n\n` +
          `Voir détails ci-dessous.`
        )
      }
      
      // Rafraîchir vérification
      await handleVerifier()
      
    } catch (error: any) {
      alert('❌ Erreur critique : ' + error.message)
    } finally {
      setMigrationEnCours(false)
    }
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin" className="hover:text-gray-900">Admin</Link>
          <span>→</span>
          <Link href="/admin/migration" className="hover:text-gray-900">Migration</Link>
          <span>→</span>
          <span className="text-gray-900">Factures Fournisseurs</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">🔄 Migration Factures Fournisseurs</h1>
        <p className="text-gray-600 mt-1">
          Unification des 2 collections en 1 seule collection
        </p>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-blue-900 mb-2">📋 Objectif</h2>
        <p className="text-blue-800 mb-4">
          Cette migration va fusionner :
        </p>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li><code className="bg-blue-100 px-2 py-1 rounded">factures_fournisseurs_stock</code> (Stock & Flotte)</li>
          <li><code className="bg-blue-100 px-2 py-1 rounded">factures_fournisseurs_compta</code> (Comptabilité)</li>
        </ul>
        <p className="text-blue-800 mt-4">
          En une seule collection :
        </p>
        <div className="bg-blue-100 px-4 py-2 rounded font-mono text-blue-900 mt-2">
          factures_fournisseurs
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleVerifier}
          disabled={verificationEnCours || migrationEnCours}
          className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {verificationEnCours ? '🔄 Vérification...' : '🔍 Vérifier état actuel'}
        </button>
        
        <button
          onClick={handleLancerMigration}
          disabled={migrationEnCours || verificationEnCours}
          className="px-6 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {migrationEnCours ? '⏳ Migration en cours...' : '🚀 Lancer migration'}
        </button>
      </div>

      {/* Vérification */}
      {verification && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 État des collections</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Stock & Flotte</div>
              <div className="text-3xl font-bold text-yellow-600">{verification.anciennes.stock}</div>
              <div className="text-xs text-gray-500 mt-1">factures_fournisseurs_stock</div>
            </div>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Comptabilité</div>
              <div className="text-3xl font-bold text-blue-600">{verification.anciennes.compta}</div>
              <div className="text-xs text-gray-500 mt-1">factures_fournisseurs_compta</div>
            </div>
            
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Collection unifiée</div>
              <div className="text-3xl font-bold text-green-600">{verification.nouvelle}</div>
              <div className="text-xs text-gray-500 mt-1">factures_fournisseurs</div>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${
            verification.ok ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'
          }`}>
            <p className={`font-semibold ${verification.ok ? 'text-green-900' : 'text-orange-900'}`}>
              {verification.message}
            </p>
            {!verification.ok && verification.nouvelle === 0 && (
              <p className="text-orange-700 mt-2 text-sm">
                → Cliquez sur "Lancer migration" pour commencer
              </p>
            )}
          </div>
        </div>
      )}

      {/* Doublons */}
      {doublons && doublons.total > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-orange-900 mb-4">
            ⚠️ Doublons détectés ({doublons.total})
          </h2>
          <p className="text-orange-800 mb-4">
            Ces factures existent dans les 2 collections avec le même numéro fournisseur :
          </p>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {doublons.doublons.map((doublon: any, index: number) => (
              <div key={index} className="bg-white border border-orange-300 rounded p-3">
                <div className="font-semibold text-gray-900">
                  {doublon.numeroFournisseur} - {doublon.fournisseur}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  • Stock : {doublon.facturesStock.length} facture(s)
                </div>
                <div className="text-sm text-gray-600">
                  • Compta : {doublon.facturesCompta.length} facture(s)
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-orange-800 mt-4 text-sm">
            ℹ️ Ces doublons seront conservés dans la nouvelle collection avec un champ "origine" 
            pour les différencier. Vous pourrez les nettoyer manuellement après migration.
          </p>
        </div>
      )}

      {/* Résultat migration */}
      {resultat && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📝 Résultat migration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Factures migrées</div>
              <div className="text-3xl font-bold text-green-600">{resultat.facturesMigrees}</div>
              <div className="text-sm text-gray-600 mt-2">
                • Stock : {resultat.details.stock.migrees}/{resultat.details.stock.total}
              </div>
              <div className="text-sm text-gray-600">
                • Compta : {resultat.details.compta.migrees}/{resultat.details.compta.total}
              </div>
            </div>
            
            <div className={`border-2 rounded-lg p-4 ${
              resultat.erreursCount === 0 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="text-sm text-gray-600 mb-1">Erreurs</div>
              <div className={`text-3xl font-bold ${
                resultat.erreursCount === 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {resultat.erreursCount}
              </div>
              {resultat.erreursCount > 0 && (
                <>
                  <div className="text-sm text-gray-600 mt-2">
                    • Stock : {resultat.details.stock.erreurs}
                  </div>
                  <div className="text-sm text-gray-600">
                    • Compta : {resultat.details.compta.erreurs}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {resultat.erreurs.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <h3 className="font-bold text-red-900 mb-3">Détail des erreurs :</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {resultat.erreurs.map((err: any, i: number) => (
                  <div key={i} className="text-sm bg-white border border-red-300 rounded p-2">
                    <span className="font-mono text-red-600">{err.factureId}</span>
                    <span className="text-gray-500 mx-2">({err.collection})</span>
                    <div className="text-gray-700 mt-1">{err.erreur}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {resultat.erreursCount === 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-green-900 font-semibold text-lg">
                Migration réussie sans aucune erreur !
              </p>
              <p className="text-green-700 mt-2">
                Toutes les factures ont été migrées avec succès.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">📖 Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Cliquez sur <strong>"Vérifier état actuel"</strong> pour voir combien de factures seront migrées</li>
          <li>Notez les chiffres affichés</li>
          <li>Cliquez sur <strong>"Lancer migration"</strong> pour commencer</li>
          <li>Attendez la fin (peut prendre 2-5 minutes)</li>
          <li>Vérifiez que le nombre de factures dans la collection unifiée = Stock + Compta</li>
          <li>Testez les pages Stock & Flotte et Comptabilité</li>
        </ol>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Important :</strong> Les anciennes collections ne seront PAS supprimées. 
            Elles servent de backup et pourront être supprimées manuellement après validation complète.
          </p>
        </div>
      </div>
    </div>
  )
}
