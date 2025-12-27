'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

export default function SyncRapportsButton() {
  const [syncing, setSyncing] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleSync = async () => {
    setSyncing(true)
    setResults(null)

    try {
      const response = await fetch('/api/rapports/sync-emails', {
        method: 'POST',
      })

      const data = await response.json()
      setResults(data)

      if (data.success) {
        if (data.results.success.length > 0) {
          alert(`✅ ${data.results.success.length} rapport(s) synchronisé(s) !`)
        } else {
          alert('ℹ️ Aucun nouveau rapport à synchroniser')
        }
      } else {
        alert(`❌ Erreur: ${data.error}`)
      }
    } catch (error: any) {
      console.error('Erreur sync:', error)
      alert(`❌ Erreur: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Bouton de synchronisation */}
      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Synchronisation en cours...' : 'Synchroniser les rapports Praxedo'}
      </button>

      {/* Résultats */}
      {results && (
        <div className="bg-white border-2 border-blue-200 rounded-lg p-6 space-y-4">
          <h3 className="font-bold text-blue-900 text-lg">
            Résultats de la synchronisation
          </h3>

          {/* Succès */}
          {results.results?.success?.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">
                ✅ Rapports traités ({results.results.success.length})
              </h4>
              <ul className="space-y-2">
                {results.results.success.map((item: any, index: number) => (
                  <li key={index} className="text-green-800 text-sm">
                    • <strong>{item.numero}</strong> - {item.site}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Erreurs */}
          {results.results?.errors?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">
                ❌ Erreurs ({results.results.errors.length})
              </h4>
              <ul className="space-y-2">
                {results.results.errors.map((item: any, index: number) => (
                  <li key={index} className="text-red-800 text-sm">
                    • {item.email}: {item.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Statistiques */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {results.results?.processed || 0}
                </div>
                <div className="text-sm text-blue-600">Emails traités</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-900">
                  {results.results?.success?.length || 0}
                </div>
                <div className="text-sm text-green-600">Succès</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-900">
                  {results.results?.errors?.length || 0}
                </div>
                <div className="text-sm text-red-600">Erreurs</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">ℹ️ Comment ça marche ?</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Se connecte à rapports@solairenettoyage.fr</li>
          <li>• Lit les nouveaux emails de Praxedo</li>
          <li>• Télécharge les PDF automatiquement</li>
          <li>• Associe aux interventions via le numéro GX</li>
          <li>• Change le statut en "Terminée"</li>
        </ul>
      </div>
    </div>
  )
}
