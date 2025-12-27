'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Download, Plus, AlertCircle, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

interface SiteInfo {
  name: string
  exists: boolean
  siteId?: string
  clientId?: string
}

export default function SyncRapportsButton() {
  const [syncing, setSyncing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [sitesInfo, setSitesInfo] = useState<SiteInfo[]>([])
  const [checkingSites, setCheckingSites] = useState(false)
  const router = useRouter()

  // Fonction pour vérifier si les sites existent dans Firebase
  const checkSitesExistence = async (siteNames: string[]) => {
    setCheckingSites(true)
    const sitesStatus: SiteInfo[] = []

    for (const siteName of siteNames) {
      try {
        const sitesRef = collection(db, 'sites')
        const normalizedName = siteName.toLowerCase().trim()
        
        // Chercher le site
        const snapshot = await getDocs(sitesRef)
        let found = false
        let siteData: any = null

        for (const doc of snapshot.docs) {
          const data = doc.data()
          const dbName = (data.name || '').toLowerCase().trim()
          
          if (dbName === normalizedName || dbName.includes(normalizedName) || normalizedName.includes(dbName)) {
            found = true
            siteData = { id: doc.id, ...data }
            break
          }
        }

        sitesStatus.push({
          name: siteName,
          exists: found,
          siteId: siteData?.id,
          clientId: siteData?.clientId
        })
      } catch (error) {
        console.error('Erreur vérification site:', siteName, error)
        sitesStatus.push({
          name: siteName,
          exists: false
        })
      }
    }

    setSitesInfo(sitesStatus)
    setCheckingSites(false)
  }

  const handleSync = async () => {
    setSyncing(true)
    setResults(null)
    setSitesInfo([])

    try {
      const response = await fetch('/api/rapports/sync-emails', {
        method: 'POST',
      })

      const data = await response.json()
      setResults(data)

      // Extraire les sites non trouvés
      const sitesNonTrouves = data.results?.errors
        ?.filter((e: any) => e.reason?.includes('Aucune intervention trouvée'))
        ?.map((e: any) => {
          const match = e.reason.match(/pour le site: (.+)$/)
          return match ? match[1] : null
        })
        ?.filter(Boolean) || []

      // Vérifier si ces sites existent dans Firebase
      if (sitesNonTrouves.length > 0) {
        await checkSitesExistence(sitesNonTrouves)
      }

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

  // Séparer les sites en 2 catégories
  const sitesExistants = sitesInfo.filter(s => s.exists)
  const sitesManquants = sitesInfo.filter(s => !s.exists)

  // Export PDF
  const exportToPDF = () => {
    const content = generatePDFContent()
    const printWindow = window.open('', '', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(content)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const generatePDFContent = () => {
    const date = new Date().toLocaleString('fr-FR')
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rapport Synchronisation Praxedo</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
          h2 { color: #059669; margin-top: 30px; }
          .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
          .success { background-color: #ecfdf5; border-color: #10b981; }
          .error { background-color: #fef2f2; border-color: #ef4444; }
          .warning { background-color: #fffbeb; border-color: #f59e0b; }
          ul { list-style: none; padding-left: 0; }
          li { padding: 5px 0; }
          .stats { display: flex; gap: 30px; margin: 20px 0; }
          .stat { text-align: center; }
          .stat-value { font-size: 32px; font-weight: bold; color: #1e40af; }
          .stat-label { color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>📊 Rapport de Synchronisation Praxedo</h1>
        <p><strong>Date :</strong> ${date}</p>
        <p><strong>Entreprise :</strong> Solaire Nettoyage</p>
        
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${results.results?.processed || 0}</div>
            <div class="stat-label">Emails traités</div>
          </div>
          <div class="stat">
            <div class="stat-value" style="color: #10b981;">${results.results?.success?.length || 0}</div>
            <div class="stat-label">Succès</div>
          </div>
          <div class="stat">
            <div class="stat-value" style="color: #ef4444;">${results.results?.errors?.length || 0}</div>
            <div class="stat-label">Erreurs</div>
          </div>
        </div>

        ${results.results?.success?.length > 0 ? `
        <div class="section success">
          <h2>✅ Rapports traités (${results.results.success.length})</h2>
          <ul>
            ${results.results.success.map((item: any) => `
              <li>• <strong>${item.site || item.intervention}</strong></li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        ${sitesExistants.length > 0 ? `
        <div class="section success" style="background-color: #ecfdf5; border-color: #10b981;">
          <h2>✅ Sites existants - Interventions à créer (${sitesExistants.length})</h2>
          <p><strong>Ces sites existent dans l'intranet. Créez les interventions :</strong></p>
          <ul>
            ${sitesExistants.map((site) => `
              <li>• ${site.name}</li>
            `).join('')}
          </ul>
          <p style="margin-top: 15px; color: #065f46;"><strong>Action :</strong> Créer les interventions, puis relancer la synchronisation.</p>
        </div>
        ` : ''}

        ${sitesManquants.length > 0 ? `
        <div class="section warning" style="background-color: #fff7ed; border-color: #f97316;">
          <h2>⚠️ Sites à créer dans l'intranet (${sitesManquants.length})</h2>
          <p><strong>Ces sites n'existent pas encore dans l'intranet :</strong></p>
          <ul>
            ${sitesManquants.map((site) => `
              <li>• ${site.name}</li>
            `).join('')}
          </ul>
          <div style="margin-top: 15px; padding: 15px; background-color: #fed7aa; border: 1px solid #f97316; border-radius: 8px;">
            <p style="color: #9a3412; font-weight: bold; margin-bottom: 10px;">📋 Pour ces sites, créez d'abord :</p>
            <ol style="color: #9a3412; margin-left: 20px;">
              <li>Le <strong>CLIENT</strong> dans "Gestion Clients"</li>
              <li>Le <strong>SITE</strong> dans "Gestion Sites" (rattaché au client)</li>
              <li>Relancez la synchronisation</li>
              <li>Le site apparaîtra alors dans "Sites existants"</li>
            </ol>
          </div>
        </div>
        ` : ''}

        ${results.results?.errors?.length > 0 ? `
        <div class="section error">
          <h2>❌ Erreurs détaillées (${results.results.errors.length})</h2>
          <ul>
            ${results.results.errors.map((item: any) => `
              <li>• ${item.email}: <em>${item.reason}</em></li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; color: #6b7280; font-size: 12px;">
          <p>Rapport généré automatiquement par le système de synchronisation Praxedo</p>
          <p>Solaire Nettoyage - ${date}</p>
        </div>
      </body>
      </html>
    `
  }

  return (
    <div className="space-y-4">
      {/* Boutons d'actions */}
      <div className="flex gap-4">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Synchronisation en cours...' : 'Synchroniser les rapports Praxedo'}
        </button>

        {results && (
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            Télécharger le rapport PDF
          </button>
        )}
      </div>

      {/* Résultats */}
      {results && (
        <div className="bg-white border-2 border-blue-200 rounded-lg p-6 space-y-4">
          <h3 className="font-bold text-blue-900 text-lg">
            Résultats de la synchronisation
          </h3>

          {/* Sites existants - Interventions à créer */}
          {checkingSites && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                <p className="text-blue-800">Vérification des sites dans la base...</p>
              </div>
            </div>
          )}

          {!checkingSites && sitesExistants.length > 0 && (
            <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h4 className="font-semibold text-green-900 text-lg">
                    ✅ Sites existants - Interventions à créer ({sitesExistants.length})
                  </h4>
                </div>
              </div>
              <p className="text-green-800 mb-3 font-medium">
                Ces sites existent dans l'intranet. Vous pouvez créer les interventions :
              </p>
              <div className="bg-white border border-green-200 rounded-lg p-3 space-y-2">
                {sitesExistants.map((site, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-green-50 rounded">
                    <span className="text-green-900 font-medium">• {site.name}</span>
                    <button
                      onClick={() => router.push(`/admin/nouvelle-intervention?site=${encodeURIComponent(site.siteId || '')}&client=${encodeURIComponent(site.clientId || '')}`)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded text-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Créer l'intervention
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-green-800 mt-3 text-sm italic">
                💡 Après avoir créé les interventions, relancez la synchronisation pour attacher les rapports automatiquement.
              </p>
            </div>
          )}

          {/* Sites manquants - Client + Site à créer */}
          {!checkingSites && sitesManquants.length > 0 && (
            <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                  <h4 className="font-semibold text-orange-900 text-lg">
                    ⚠️ Sites à créer dans l'intranet ({sitesManquants.length})
                  </h4>
                </div>
              </div>
              <p className="text-orange-800 mb-3 font-medium">
                Ces sites n'existent pas encore dans l'intranet :
              </p>
              <div className="bg-white border border-orange-200 rounded-lg p-3">
                <ul className="space-y-2">
                  {sitesManquants.map((site, index) => (
                    <li key={index} className="text-orange-900 font-medium">
                      • {site.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 bg-orange-100 border border-orange-300 rounded-lg p-4">
                <p className="text-orange-900 font-semibold mb-2">📋 Pour ces sites, créez d'abord :</p>
                <ol className="text-orange-800 space-y-1 ml-4">
                  <li>1. Le <strong>CLIENT</strong> dans "Gestion Clients"</li>
                  <li>2. Le <strong>SITE</strong> dans "Gestion Sites" (rattaché au client)</li>
                  <li>3. Relancez la synchronisation</li>
                  <li>4. Le site apparaîtra alors dans "Sites existants" ci-dessus</li>
                </ol>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => router.push('/admin/gestion-clients')}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded text-sm transition-colors"
                  >
                    Gestion Clients
                  </button>
                  <button
                    onClick={() => router.push('/admin/gestion-sites')}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded text-sm transition-colors"
                  >
                    Gestion Sites
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Succès */}
          {results.results?.success?.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">
                ✅ Rapports traités ({results.results.success.length})
              </h4>
              <ul className="space-y-2">
                {results.results.success.map((item: any, index: number) => (
                  <li key={index} className="text-green-800 text-sm">
                    • <strong>{item.site || item.intervention}</strong>
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
          <li>• Lit tous les emails Praxedo des 15 derniers jours (lus ou non lus)</li>
          <li>• Télécharge les PDF automatiquement</li>
          <li>• Associe aux interventions via le nom du site</li>
          <li>• Change le statut en "Terminée"</li>
        </ul>
      </div>
    </div>
  )
}
