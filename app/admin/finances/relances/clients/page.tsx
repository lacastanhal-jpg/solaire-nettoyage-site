'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { 
  upsertConfigClient,
  calculerScoreFiabilite
} from '@/lib/firebase/relances'
import type { ConfigRelanceClient, CategorieClient } from '@/lib/firebase/relances-types'
import { 
  ArrowLeft,
  Users,
  Star,
  ShieldAlert,
  ShieldCheck,
  Crown,
  Ban,
  Search,
  Filter,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function ConfigClientsRelancesPage() {
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<any[]>([])
  const [configs, setConfigs] = useState<Map<string, ConfigRelanceClient>>(new Map())
  const [filteredClients, setFilteredClients] = useState<any[]>([])
  
  // Filtres
  const [categorieFilter, setCategorieFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const [editingConfig, setEditingConfig] = useState<Partial<ConfigRelanceClient> | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [clients, categorieFilter, searchTerm])

  async function loadClients() {
    try {
      setLoading(true)
      
      // Charger tous les clients
      const clientsRef = collection(db, 'clients')
      const clientsSnapshot = await getDocs(clientsRef)
      const clientsData = clientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Charger toutes les configs relances
      const configsRef = collection(db, 'relances_clients')
      const configsSnapshot = await getDocs(configsRef)
      const configsMap = new Map<string, ConfigRelanceClient>()
      
      configsSnapshot.docs.forEach(doc => {
        configsMap.set(doc.id, { id: doc.id, ...doc.data() } as ConfigRelanceClient)
      })
      
      setClients(clientsData)
      setConfigs(configsMap)
    } catch (error) {
      console.error('Erreur chargement clients:', error)
      alert('❌ Erreur chargement des clients')
    } finally {
      setLoading(false)
    }
  }

  function applyFilters() {
    let filtered = [...clients]

    // Filtre catégorie
    if (categorieFilter !== 'all') {
      filtered = filtered.filter(c => {
        const config = configs.get(c.id)
        return config?.categorie === categorieFilter
      })
    }

    // Recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c => 
        c.nom.toLowerCase().includes(term)
      )
    }

    setFilteredClients(filtered)
  }

  function openEditModal(client: any) {
    setSelectedClient(client)
    const existingConfig = configs.get(client.id)
    
    if (existingConfig) {
      setEditingConfig(existingConfig)
    } else {
      // Config par défaut
      setEditingConfig({
        clientId: client.id,
        clientNom: client.company,
        categorie: 'standard',
        relancesDesactivees: false,
        delaisPersonnalises: false,
        scoreFiabilite: 50,
        delaiPaiementMoyen: 0,
        nombreRetardsPaiement: 0,
        montantTotalImpaye: 0
      })
    }
  }

  async function handleSaveConfig() {
    if (!editingConfig || !selectedClient) return

    try {
      setSaving(true)
      
      // Calculer le score de fiabilité
      const score = await calculerScoreFiabilite(selectedClient.id)
      
      await upsertConfigClient({
        ...editingConfig as any,
        scoreFiabilite: score
      })
      
      setMessage({ type: 'success', text: '✅ Configuration enregistrée' })
      
      // Recharger
      await loadClients()
      
      // Fermer modal après 1s
      setTimeout(() => {
        setSelectedClient(null)
        setEditingConfig(null)
        setMessage(null)
      }, 1000)
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      setMessage({ type: 'error', text: '❌ Erreur lors de la sauvegarde' })
    } finally {
      setSaving(false)
    }
  }

  function updateEditingConfig(field: string, value: any) {
    if (!editingConfig) return
    setEditingConfig({ ...editingConfig, [field]: value })
  }

  const categorieInfo: Record<CategorieClient, { label: string, icon: any, color: string, desc: string }> = {
    vip: {
      label: 'VIP',
      icon: Crown,
      color: 'purple',
      desc: 'Aucune relance automatique'
    },
    standard: {
      label: 'Standard',
      icon: ShieldCheck,
      color: 'blue',
      desc: 'Workflow normal'
    },
    risque: {
      label: 'Risque',
      icon: ShieldAlert,
      color: 'orange',
      desc: 'Relances renforcées'
    },
    bloque: {
      label: 'Bloqué',
      icon: Ban,
      color: 'red',
      desc: 'Plus de nouvelles factures'
    }
  }

  const stats = {
    total: clients.length,
    vip: Array.from(configs.values()).filter(c => c.categorie === 'vip').length,
    standard: Array.from(configs.values()).filter(c => c.categorie === 'standard').length,
    risque: Array.from(configs.values()).filter(c => c.categorie === 'risque').length,
    bloque: Array.from(configs.values()).filter(c => c.categorie === 'bloque').length,
    desactives: Array.from(configs.values()).filter(c => c.relancesDesactivees).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    )
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
            <h1 className="text-3xl font-bold text-gray-900">Configuration Clients</h1>
            <p className="text-gray-600 mt-2">
              {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-gray-600" />
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-purple-50 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-purple-600" />
            <p className="text-sm text-purple-700">VIP</p>
          </div>
          <p className="text-2xl font-bold text-purple-700">{stats.vip}</p>
        </div>

        <div className="bg-blue-50 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-700">Standard</p>
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.standard}</p>
        </div>

        <div className="bg-orange-50 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-orange-600" />
            <p className="text-sm text-orange-700">Risque</p>
          </div>
          <p className="text-2xl font-bold text-orange-700">{stats.risque}</p>
        </div>

        <div className="bg-red-50 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <Ban className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">Bloqués</p>
          </div>
          <p className="text-2xl font-bold text-red-700">{stats.bloque}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 items-center flex-wrap">
          {/* Recherche */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Filtre catégorie */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={categorieFilter}
              onChange={(e) => setCategorieFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Toutes catégories</option>
              <option value="vip">VIP</option>
              <option value="standard">Standard</option>
              <option value="risque">Risque</option>
              <option value="bloque">Bloqué</option>
            </select>
          </div>

          {/* Reset */}
          {(categorieFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setCategorieFilter('all')
                setSearchTerm('')
              }}
              className="text-sm text-indigo-600 hover:underline"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Liste clients */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun client trouvé</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score Fiabilité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relances
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => {
                  const config = configs.get(client.id)
                  const categorieData = config ? categorieInfo[config.categorie] : categorieInfo.standard
                  const CategorieIcon = categorieData.icon
                  const score = config?.scoreFiabilite ?? 50

                  return (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{client.company}</div>
                        {client.groupe && (
                          <div className="text-xs text-gray-500">{client.groupe}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-${categorieData.color}-100 text-${categorieData.color}-700`}>
                          <CategorieIcon className="w-3 h-3" />
                          {categorieData.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Star className={`w-4 h-4 ${score >= 70 ? 'text-green-500' : score >= 40 ? 'text-yellow-500' : 'text-red-500'}`} />
                          <span className="font-medium">{score}/100</span>
                        </div>
                        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                          <div 
                            className={`h-full rounded-full ${score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {config?.relancesDesactivees ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            <Ban className="w-3 h-3" />
                            Désactivées
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3" />
                            Actives
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openEditModal(client)}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-900"
                        >
                          <Settings className="w-4 h-4" />
                          Configurer
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Configuration */}
      {selectedClient && editingConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                Configuration - {selectedClient.company}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Message */}
              {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${
                  message.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Catégorie Client
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.entries(categorieInfo) as [CategorieClient, typeof categorieInfo[CategorieClient]][]).map(([key, info]) => {
                    const Icon = info.icon
                    const selected = editingConfig.categorie === key
                    
                    return (
                      <button
                        key={key}
                        onClick={() => updateEditingConfig('categorie', key)}
                        className={`p-4 border-2 rounded-lg transition-colors ${
                          selected
                            ? `border-${info.color}-500 bg-${info.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-5 h-5 ${selected ? `text-${info.color}-600` : 'text-gray-600'}`} />
                          <span className={`font-semibold ${selected ? `text-${info.color}-700` : 'text-gray-900'}`}>
                            {info.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 text-left">{info.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Désactiver relances */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Désactiver les relances</p>
                  <p className="text-sm text-gray-600">Aucune relance automatique pour ce client</p>
                </div>
                <button
                  onClick={() => updateEditingConfig('relancesDesactivees', !editingConfig.relancesDesactivees)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    editingConfig.relancesDesactivees ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    editingConfig.relancesDesactivees ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Raison désactivation */}
              {editingConfig.relancesDesactivees && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison de la désactivation
                  </label>
                  <textarea
                    value={editingConfig.raisonDesactivation || ''}
                    onChange={(e) => updateEditingConfig('raisonDesactivation', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Ex: Client VIP avec accord spécial..."
                  />
                </div>
              )}

              {/* Délais personnalisés */}
              <div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-3">
                  <div>
                    <p className="font-medium text-gray-900">Délais personnalisés</p>
                    <p className="text-sm text-gray-600">Définir des délais spécifiques pour ce client</p>
                  </div>
                  <button
                    onClick={() => updateEditingConfig('delaisPersonnalises', !editingConfig.delaisPersonnalises)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      editingConfig.delaisPersonnalises ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      editingConfig.delaisPersonnalises ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {editingConfig.delaisPersonnalises && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Rappel Amiable (jours)</label>
                      <input
                        type="number"
                        min="1"
                        value={editingConfig.delaiRappelAmiable || 15}
                        onChange={(e) => updateEditingConfig('delaiRappelAmiable', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Relance Ferme (jours)</label>
                      <input
                        type="number"
                        min="1"
                        value={editingConfig.delaiRelanceFerme || 30}
                        onChange={(e) => updateEditingConfig('delaiRelanceFerme', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Mise en Demeure (jours)</label>
                      <input
                        type="number"
                        min="1"
                        value={editingConfig.delaiMiseEnDemeure || 45}
                        onChange={(e) => updateEditingConfig('delaiMiseEnDemeure', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Contentieux (jours)</label>
                      <input
                        type="number"
                        min="1"
                        value={editingConfig.delaiContentieux || 60}
                        onChange={(e) => updateEditingConfig('delaiContentieux', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes internes
                </label>
                <textarea
                  value={editingConfig.notes || ''}
                  onChange={(e) => updateEditingConfig('notes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Notes privées sur ce client..."
                />
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setSelectedClient(null)
                  setEditingConfig(null)
                  setMessage(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
