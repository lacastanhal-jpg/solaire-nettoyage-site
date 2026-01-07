'use client'

/**
 * DASHBOARD CONTRATS RÉCURRENTS - VERSION PROFESSIONNELLE
 * Interface complète de gestion des contrats de facturation automatique
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  getAllContrats,
  getStatistiquesContrats,
  getPrevisionFacturation,
  getAlertesContrats
} from '@/lib/firebase/contrats-recurrents'
import type {
  ContratRecurrent,
  StatistiquesContrats,
  PrevisionFacturation as PrevisionType,
  AlerteContrat,
  StatutContrat,
  FrequenceContrat
} from '@/lib/types/contrats-recurrents'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Pause,
  Ban,
  Plus,
  Search,
  Filter,
  Download,
  ArrowLeft,
  BarChart3,
  Target,
  Users,
  Zap
} from 'lucide-react'

export default function ContratsRecurrentsPage() {
  const [loading, setLoading] = useState(true)
  const [contrats, setContrats] = useState<ContratRecurrent[]>([])
  const [statistiques, setStatistiques] = useState<StatistiquesContrats | null>(null)
  const [previsions, setPrevisions] = useState<PrevisionType[]>([])
  const [alertes, setAlertes] = useState<AlerteContrat[]>([])
  
  // Filtres
  const [filtreStatut, setFiltreStatut] = useState<StatutContrat | 'tous'>('tous')
  const [filtreFrequence, setFiltreFrequence] = useState<FrequenceContrat | 'tous'>('tous')
  const [recherche, setRecherche] = useState('')
  
  // Vue
  const [vueActive, setVueActive] = useState<'liste' | 'previsions' | 'alertes'>('liste')

  useEffect(() => {
    chargerDonnees()
  }, [])

  async function chargerDonnees() {
    try {
      setLoading(true)
      
      const [contratsData, statsData, previsionsData, alertesData] = await Promise.all([
        getAllContrats(),
        getStatistiquesContrats(),
        getPrevisionFacturation(3),
        getAlertesContrats()
      ])
      
      setContrats(contratsData)
      setStatistiques(statsData)
      setPrevisions(previsionsData)
      setAlertes(alertesData)
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrage
  const contratsFiltres = contrats.filter(contrat => {
    // Filtre statut
    if (filtreStatut !== 'tous' && contrat.statut !== filtreStatut) {
      return false
    }
    
    // Filtre fréquence
    if (filtreFrequence !== 'tous' && contrat.frequence !== filtreFrequence) {
      return false
    }
    
    // Recherche
    if (recherche) {
      const terme = recherche.toLowerCase()
      return (
        contrat.numero.toLowerCase().includes(terme) ||
        contrat.nom.toLowerCase().includes(terme) ||
        contrat.clientNom?.toLowerCase().includes(terme)
      )
    }
    
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/admin"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Admin
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contrats Récurrents</h1>
            <p className="text-gray-600 mt-2">
              Facturation automatique - {statistiques?.nombreActifs} contrat(s) actif(s)
            </p>
          </div>
          
          <Link
            href="/admin/finances/contrats/nouveau"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Nouveau contrat
          </Link>
        </div>
      </div>

      {/* KPIs Principaux */}
      {statistiques && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* CA Récurrent Annuel */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-sm opacity-90">Annuel</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {statistiques.caRecurrentAnnuel.toLocaleString('fr-FR')}€
            </div>
            <div className="text-sm opacity-90">
              {statistiques.caRecurrentMensuel.toLocaleString('fr-FR')}€ / mois
            </div>
          </div>

          {/* Contrats Actifs */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-sm opacity-90">Actifs</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {statistiques.nombreActifs}
            </div>
            <div className="text-sm opacity-90">
              sur {statistiques.nombreTotal} total
            </div>
          </div>

          {/* Factures ce mois */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Zap className="w-6 h-6" />
              </div>
              {statistiques.evolutionFactures >= 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
            <div className="text-3xl font-bold mb-1">
              {statistiques.nombreFacturesGenereesMois}
            </div>
            <div className="text-sm opacity-90">
              {statistiques.evolutionFactures >= 0 ? '+' : ''}
              {statistiques.evolutionFactures.toFixed(1)}% vs mois dernier
            </div>
          </div>

          {/* Prochaines Générations */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-sm opacity-90">7 jours</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {statistiques.nombreGenerationsProchains7Jours}
            </div>
            <div className="text-sm opacity-90">
              {statistiques.nombreGenerationsProchains30Jours} sur 30 jours
            </div>
          </div>
        </div>
      )}

      {/* Alertes Importantes */}
      {alertes.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 mb-2">
                {alertes.length} alerte(s) importante(s)
              </h3>
              <div className="space-y-2">
                {alertes.slice(0, 3).map(alerte => (
                  <div key={alerte.id} className="text-sm text-red-700">
                    <strong>{alerte.contratNumero}</strong> - {alerte.message}
                  </div>
                ))}
              </div>
              {alertes.length > 3 && (
                <button
                  onClick={() => setVueActive('alertes')}
                  className="text-sm text-red-600 hover:text-red-700 font-medium mt-2"
                >
                  Voir toutes les alertes ({alertes.length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Onglets */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setVueActive('liste')}
          className={`px-4 py-3 font-medium transition-colors relative ${
            vueActive === 'liste'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Liste des contrats
          </div>
        </button>
        
        <button
          onClick={() => setVueActive('previsions')}
          className={`px-4 py-3 font-medium transition-colors relative ${
            vueActive === 'previsions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Prévisions
          </div>
        </button>
        
        <button
          onClick={() => setVueActive('alertes')}
          className={`px-4 py-3 font-medium transition-colors relative ${
            vueActive === 'alertes'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Alertes
            {alertes.length > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                {alertes.length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Vue Liste Contrats */}
      {vueActive === 'liste' && (
        <>
          {/* Filtres & Recherche */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Recherche */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher (numéro, nom, client)..."
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtre Statut */}
              <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="tous">Tous les statuts</option>
                <option value="brouillon">Brouillon</option>
                <option value="actif">Actif</option>
                <option value="suspendu">Suspendu</option>
                <option value="expire">Expiré</option>
                <option value="resilie">Résilié</option>
              </select>

              {/* Filtre Fréquence */}
              <select
                value={filtreFrequence}
                onChange={(e) => setFiltreFrequence(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="tous">Toutes fréquences</option>
                <option value="hebdomadaire">Hebdomadaire</option>
                <option value="mensuel">Mensuel</option>
                <option value="trimestriel">Trimestriel</option>
                <option value="semestriel">Semestriel</option>
                <option value="annuel">Annuel</option>
              </select>
            </div>
          </div>

          {/* Tableau Contrats */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contrat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fréquence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prochaine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contratsFiltres.map(contrat => (
                    <tr key={contrat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {contrat.numero}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contrat.nom}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {contrat.clientNom || 'Client inconnu'}
                        </div>
                        {contrat.groupeNom && (
                          <div className="text-xs text-gray-500">
                            {contrat.groupeNom}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                          {contrat.frequence}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {contrat.totalHT.toLocaleString('fr-FR')}€
                        </div>
                        <div className="text-xs text-gray-500">
                          {contrat.caAnnuelEstime.toLocaleString('fr-FR')}€/an
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contrat.prochaineDateFacturation.toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatutBadge(contrat.statut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/finances/contrats/${contrat.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {contratsFiltres.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun contrat trouvé</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Vue Prévisions */}
      {vueActive === 'previsions' && (
        <div className="space-y-6">
          {previsions.map(prevision => (
            <div key={prevision.date.toISOString()} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {prevision.date.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {prevision.nombreFactures} facture(s) à générer
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {prevision.montantTotalHT.toLocaleString('fr-FR')}€
                  </div>
                  <div className="text-sm text-gray-600">HT</div>
                </div>
              </div>

              <div className="space-y-2">
                {prevision.contrats.map(contrat => (
                  <div key={contrat.contratId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{contrat.numero}</div>
                      <div className="text-sm text-gray-600">{contrat.clientNom}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {contrat.montantHT.toLocaleString('fr-FR')}€
                      </div>
                      <div className="text-xs text-gray-500">HT</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vue Alertes */}
      {vueActive === 'alertes' && (
        <div className="space-y-4">
          {alertes.map(alerte => (
            <div
              key={alerte.id}
              className={`p-4 rounded-lg border-l-4 ${
                alerte.gravite === 'critique' ? 'bg-red-50 border-red-500' :
                alerte.gravite === 'error' ? 'bg-red-50 border-red-400' :
                alerte.gravite === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {alerte.contratNumero}
                    </span>
                    <span className="text-gray-600">-</span>
                    <span className="text-gray-700">{alerte.clientNom}</span>
                  </div>
                  <p className="text-gray-900 mb-1">{alerte.message}</p>
                  {alerte.details && (
                    <p className="text-sm text-gray-600">{alerte.details}</p>
                  )}
                </div>
                {alerte.actionUrl && (
                  <Link
                    href={alerte.actionUrl}
                    className="ml-4 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  >
                    Voir
                  </Link>
                )}
              </div>
            </div>
          ))}

          {alertes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>Aucune alerte</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Fonctions utilitaires
function getStatutBadge(statut: StatutContrat) {
  const configs = {
    brouillon: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
    actif: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    suspendu: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Pause },
    expire: { bg: 'bg-gray-100', text: 'text-gray-600', icon: Clock },
    resilie: { bg: 'bg-red-100', text: 'text-red-800', icon: Ban },
    termine: { bg: 'bg-gray-100', text: 'text-gray-600', icon: CheckCircle }
  }

  const config = configs[statut]
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {statut.charAt(0).toUpperCase() + statut.slice(1)}
    </span>
  )
}
