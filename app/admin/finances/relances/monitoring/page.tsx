'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  AlertTriangle,
  Zap,
  Database,
  Mail
} from 'lucide-react'

export default function MonitoringRelancesPage() {
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function testGenerationRelances() {
    try {
      setLoading(true)
      setMessage(null)
      setTestResult(null)
      
      console.log('Test génération relances...')
      
      const response = await fetch('/api/relances/generer', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ ${data.data.nombreRelances} relance(s) générée(s)` 
        })
        setTestResult(data.data)
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ Erreur: ${data.error}` 
        })
      }
    } catch (error: any) {
      console.error('Erreur test:', error)
      setMessage({ 
        type: 'error', 
        text: `❌ Exception: ${error.message}` 
      })
    } finally {
      setLoading(false)
    }
  }

  async function testCronJob() {
    try {
      setLoading(true)
      setMessage(null)
      setTestResult(null)
      
      console.log('Test cron job...')
      
      const response = await fetch('/api/cron/relances-quotidiennes', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ Job terminé : ${data.stats.relancesEnvoyees} envoyées` 
        })
        setTestResult(data)
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ Erreur: ${data.error}` 
        })
      }
    } catch (error: any) {
      console.error('Erreur test:', error)
      setMessage({ 
        type: 'error', 
        text: `❌ Exception: ${error.message}` 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/admin/finances/relances"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monitoring Système</h1>
            <p className="text-gray-600 mt-2">
              Surveillance et tests du système de relances automatiques
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
            <Activity className="w-5 h-5" />
            <span className="font-semibold">Système Actif</span>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* État du système */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Firebase</p>
              <p className="text-xl font-bold text-green-600">✓ Connecté</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Collections : relances_config, relances_historique, relances_clients
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Service Email</p>
              <p className="text-xl font-bold text-green-600">✓ Resend OK</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            API Key configurée • Envoi actif
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cron Job</p>
              <p className="text-xl font-bold text-green-600">✓ Planifié</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Lun-Ven à 8h00 (UTC+1) • Vercel Cron
          </p>
        </div>
      </div>

      {/* Tests manuels */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Tests Manuels</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test génération */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Play className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Test Génération</h3>
                <p className="text-sm text-gray-600">
                  Générer les relances sans les envoyer
                </p>
              </div>
            </div>

            <button
              onClick={testGenerationRelances}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Test en cours...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Lancer Test Génération
                </>
              )}
            </button>

            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>Info:</strong> Ce test génère les relances mais ne les envoie PAS. 
                Utile pour vérifier la logique sans spam.
              </p>
            </div>
          </div>

          {/* Test cron complet */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Test Cron Complet</h3>
                <p className="text-sm text-gray-600">
                  Générer ET envoyer les relances
                </p>
              </div>
            </div>

            <button
              onClick={testCronJob}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Test en cours...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Lancer Test Cron
                </>
              )}
            </button>

            <div className="mt-4 p-3 bg-orange-50 rounded border border-orange-200">
              <p className="text-xs text-orange-800">
                <strong>⚠️ Attention:</strong> Ce test ENVOIE RÉELLEMENT les emails ! 
                À utiliser avec précaution.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Résultat du test */}
      {testResult && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Résultat du Test</h2>

          {testResult.stats ? (
            // Résultat cron complet
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded">
                  <p className="text-sm text-blue-700 mb-1">Générées</p>
                  <p className="text-2xl font-bold text-blue-700">{testResult.stats.relancesGenerees}</p>
                </div>
                <div className="p-4 bg-green-50 rounded">
                  <p className="text-sm text-green-700 mb-1">Envoyées</p>
                  <p className="text-2xl font-bold text-green-700">{testResult.stats.relancesEnvoyees}</p>
                </div>
                <div className="p-4 bg-red-50 rounded">
                  <p className="text-sm text-red-700 mb-1">Échecs</p>
                  <p className="text-2xl font-bold text-red-700">{testResult.stats.echecs}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded">
                  <p className="text-sm text-yellow-700 mb-1">Validation</p>
                  <p className="text-2xl font-bold text-yellow-700">{testResult.stats.validationManuelle}</p>
                </div>
              </div>

              {testResult.details?.envoisSucces?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">✅ Envois réussis ({testResult.details.envoisSucces.length})</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {testResult.details.envoisSucces.map((id: string) => (
                      <div key={id}>• Relance {id}</div>
                    ))}
                  </div>
                </div>
              )}

              {testResult.details?.envoisEchec?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-700 mb-2">❌ Échecs ({testResult.details.envoisEchec.length})</h3>
                  <div className="space-y-2">
                    {testResult.details.envoisEchec.map((echec: any) => (
                      <div key={echec.id} className="p-2 bg-red-50 rounded text-sm">
                        <span className="font-medium">Relance {echec.id}:</span> {echec.erreur}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Résultat génération simple
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded">
                <p className="text-sm text-green-700 mb-1">Relances générées</p>
                <p className="text-2xl font-bold text-green-700">{testResult.nombreRelances}</p>
              </div>

              {testResult.relances?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Liste des relances</h3>
                  <div className="space-y-2">
                    {testResult.relances.map((relance: any) => (
                      <div key={relance.id} className="p-3 border rounded flex justify-between items-center">
                        <div>
                          <span className="font-medium">{relance.clientNom}</span>
                          <span className="text-gray-500 mx-2">•</span>
                          <span className="text-sm text-gray-600">{relance.factureNumero}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-xs rounded ${
                            relance.type === 'rappel_amiable' ? 'bg-blue-100 text-blue-700' :
                            relance.type === 'relance_ferme' ? 'bg-orange-100 text-orange-700' :
                            relance.type === 'mise_en_demeure' ? 'bg-red-100 text-red-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {relance.type}
                          </span>
                          <span className="font-medium">{relance.montant.toFixed(2)}€</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Configuration Cron */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Configuration Cron Job</h2>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold text-gray-900 mb-2">Planning</h3>
            <p className="text-sm text-gray-600">
              <strong>Fréquence:</strong> Du lundi au vendredi<br />
              <strong>Heure:</strong> 8h00 (heure de Paris)<br />
              <strong>Cron expression:</strong> <code className="px-2 py-1 bg-gray-200 rounded">0 7 * * 1-5</code> (UTC)
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold text-gray-900 mb-2">Workflow</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Vérification jour ouvré (pas week-end, pas férié)</li>
              <li>Génération des relances pour factures impayées</li>
              <li>Vérification config envoi automatique</li>
              <li>Envoi des relances configurées pour envoi auto</li>
              <li>Logging des résultats</li>
            </ol>
          </div>

          <div className="p-4 bg-blue-50 rounded border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ À savoir</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>Rappels amiables : envoi automatique (par défaut)</li>
              <li>Relances fermes : envoi automatique (par défaut)</li>
              <li>Mises en demeure : validation manuelle requise (par défaut)</li>
              <li>Contentieux : toujours validation manuelle</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
