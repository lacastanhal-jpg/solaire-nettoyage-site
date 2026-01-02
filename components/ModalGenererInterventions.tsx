'use client'

import { useState, useEffect } from 'react'
import { 
  creerInterventionsDepuisDevis,
  grouperLignesParSite,
  devisAGeneréInterventions,
  getInterventionsByDevis
} from '@/lib/firebase/workflow-devis-intervention'
import { getAllEquipes, type Equipe } from '@/lib/firebase/equipes'
import { Calendar, Users, CheckCircle, AlertCircle } from 'lucide-react'
import type { Devis } from '@/lib/firebase/devis'

interface ModalGenererInterventionsProps {
  devis: Devis
  onClose: () => void
  onSuccess: () => void
}

export default function ModalGenererInterventions({ devis, onClose, onSuccess }: ModalGenererInterventionsProps) {
  const [loading, setLoading] = useState(false)
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [configurations, setConfigurations] = useState<{
    [siteId: string]: {
      dateDebut: string
      dateFin: string
      equipeId: string
      equipeNom: string
    }
  }>({})

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Charger les équipes
      const equip = await getAllEquipes()
      setEquipes(equip)

      // Grouper les sites
      const sitesMap = grouperLignesParSite(devis)
      const sitesArray = Array.from(sitesMap.entries()).map(([siteId, articles]) => {
        const ligneSite = devis.lignes.find(l => l.siteId === siteId)
        return {
          siteId,
          siteNom: ligneSite?.siteNom || 'Site inconnu',
          nbArticles: articles.length,
          articles
        }
      })
      setSites(sitesArray)

      // Initialiser les configurations avec date du jour
      const initConfig: any = {}
      const aujourdhui = new Date().toISOString().split('T')[0]
      sitesArray.forEach(site => {
        initConfig[site.siteId] = {
          dateDebut: aujourdhui,
          dateFin: aujourdhui,  // Par défaut même jour
          equipeId: '',
          equipeNom: ''
        }
      })
      setConfigurations(initConfig)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  function handleDateDebutChange(siteId: string, date: string) {
    setConfigurations(prev => ({
      ...prev,
      [siteId]: { ...prev[siteId], dateDebut: date }
    }))
  }

  function handleDateFinChange(siteId: string, date: string) {
    setConfigurations(prev => ({
      ...prev,
      [siteId]: { ...prev[siteId], dateFin: date }
    }))
  }

  function handleEquipeChange(siteId: string, equipeId: string) {
    const equipe = equipes.find(e => e.id === equipeId)
    setConfigurations(prev => ({
      ...prev,
      [siteId]: {
        ...prev[siteId],
        equipeId,
        equipeNom: equipe ? equipe.nom : ''
      }
    }))
  }

  function appliquerDateATous() {
    const premiereDates = configurations[sites[0]?.siteId]
    if (!premiereDates?.dateDebut || !premiereDates?.dateFin) return

    const newConfig = { ...configurations }
    sites.forEach(site => {
      newConfig[site.siteId] = {
        ...newConfig[site.siteId],
        dateDebut: premiereDates.dateDebut,
        dateFin: premiereDates.dateFin
      }
    })
    setConfigurations(newConfig)
  }

  function appliquerEquipeATous() {
    const premiereEquipe = configurations[sites[0]?.siteId]
    if (!premiereEquipe?.equipeId) return

    const newConfig = { ...configurations }
    sites.forEach(site => {
      newConfig[site.siteId] = {
        ...newConfig[site.siteId],
        equipeId: premiereEquipe.equipeId,
        equipeNom: premiereEquipe.equipeNom
      }
    })
    setConfigurations(newConfig)
  }

  async function handleGenerer() {
    if (!window.confirm(`Générer ${sites.length} intervention(s) ?`)) {
      return
    }

    try {
      setLoading(true)
      
      const aujourdhui = new Date().toISOString().split('T')[0]
      const configsArray = sites.map(site => ({
        siteId: site.siteId,
        dateDebut: configurations[site.siteId]?.dateDebut || aujourdhui,
        dateFin: configurations[site.siteId]?.dateFin || aujourdhui,
        equipeId: configurations[site.siteId]?.equipeId,
        equipeNom: configurations[site.siteId]?.equipeNom
      }))

      const result = await creerInterventionsDepuisDevis(devis.id, configsArray)

      if (result.success) {
        alert(`✅ ${result.interventionsCreees.length} intervention(s) créée(s) !\n\nNuméros: ${result.interventionsCreees.join(', ')}`)
        onSuccess()
        onClose()
      } else {
        alert(`❌ Erreurs:\n${result.errors.join('\n')}`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la génération')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            Générer les Interventions
          </h2>
          <p className="text-gray-600 mt-2">
            Devis {devis.numero} • {sites.length} site(s) • {devis.lignes.length} article(s)
          </p>
        </div>

        <div className="p-6">
          {/* Actions rapides */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={appliquerDateATous}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
            >
              📅 Même date pour tous
            </button>
            <button
              onClick={appliquerEquipeATous}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
            >
              👷 Même équipe pour tous
            </button>
          </div>

          {/* Liste des sites */}
          <div className="space-y-4">
            {sites.map((site, index) => (
              <div key={site.siteId} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{site.siteNom}</h3>
                    <p className="text-sm text-gray-600">
                      {site.nbArticles} article{site.nbArticles > 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Site {index + 1}/{sites.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Dates début et fin */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Date début *
                      </label>
                      <input
                        type="date"
                        value={configurations[site.siteId]?.dateDebut || ''}
                        onChange={(e) => handleDateDebutChange(site.siteId, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Date fin *
                      </label>
                      <input
                        type="date"
                        value={configurations[site.siteId]?.dateFin || ''}
                        onChange={(e) => handleDateFinChange(site.siteId, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  {/* Équipe */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Équipe (optionnel)
                    </label>
                    <select
                      value={configurations[site.siteId]?.equipeId || ''}
                      onChange={(e) => handleEquipeChange(site.siteId, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Non assignée</option>
                      {equipes.map(equipe => (
                        <option key={equipe.id} value={equipe.id}>
                          {equipe.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Liste articles */}
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-600 mb-2">Articles à intervenir :</p>
                  <div className="grid grid-cols-2 gap-2">
                    {site.articles.map((art: any, i: number) => (
                      <div key={i} className="text-xs text-gray-700">
                        • {art.articleNom} (x{art.quantite})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleGenerer}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Génération...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Générer {sites.length} Intervention(s)
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
