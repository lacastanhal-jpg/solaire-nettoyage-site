'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import IntranetHeader from '../components/IntranetHeader'
import { getAllExtincteurs, createExtincteur, updateExtincteur, deleteExtincteur, getAlertesExtincteurs, type Extincteur } from '@/lib/firebase/extincteurs'

export default function ExtincteursPage() {
  const router = useRouter()
  const [extincteurs, setExtincteurs] = useState<(Extincteur & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    numero: '',
    type: 'Poudre ABC' as Extincteur['type'],
    capacite: '',
    emplacement: '',
    batiment: '',
    etage: '',
    dateInstallation: '',
    dateAchat: '',
    fabricant: '',
    numeroSerie: '',
    prochainControle: '',
    prochaineMaintenance: '',
    statut: 'Conforme' as Extincteur['statut'],
    observations: ''
  })

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('intranet_logged_in')
    if (!isLoggedIn) {
      router.push('/intranet/login')
      return
    }
    loadExtincteurs()
  }, [router])

  const loadExtincteurs = async () => {
    try {
      setLoading(true)
      const data = await getAllExtincteurs()
      setExtincteurs(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateExtincteur(editingId, formData)
      } else {
        await createExtincteur(formData)
      }
      setShowForm(false)
      resetForm()
      loadExtincteurs()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (ext: Extincteur & { id: string }) => {
    setEditingId(ext.id)
    setFormData({
      numero: ext.numero,
      type: ext.type,
      capacite: ext.capacite,
      emplacement: ext.emplacement,
      batiment: ext.batiment || '',
      etage: ext.etage || '',
      dateInstallation: ext.dateInstallation,
      dateAchat: ext.dateAchat || '',
      fabricant: ext.fabricant || '',
      numeroSerie: ext.numeroSerie || '',
      prochainControle: ext.prochainControle,
      prochaineMaintenance: ext.prochaineMaintenance || '',
      statut: ext.statut,
      observations: ext.observations || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cet extincteur ?')) {
      try {
        await deleteExtincteur(id)
        loadExtincteurs()
      } catch (error) {
        console.error('Erreur:', error)
        alert('Erreur lors de la suppression')
      }
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      numero: '',
      type: 'Poudre ABC',
      capacite: '',
      emplacement: '',
      batiment: '',
      etage: '',
      dateInstallation: '',
      dateAchat: '',
      fabricant: '',
      numeroSerie: '',
      prochainControle: '',
      prochaineMaintenance: '',
      statut: 'Conforme',
      observations: ''
    })
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Conforme': return 'bg-green-100 text-green-800'
      case 'À vérifier': return 'bg-orange-100 text-orange-800'
      case 'Non conforme': return 'bg-red-100 text-red-800'
      case 'Hors service': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const joursAvantExpiration = (date: string) => {
    const today = new Date()
    const expiration = new Date(date)
    const diff = expiration.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const alertes = getAlertesExtincteurs(extincteurs)
  const stats = {
    total: extincteurs.length,
    conformes: extincteurs.filter(e => e.statut === 'Conforme').length,
    aVerifier: extincteurs.filter(e => e.statut === 'À vérifier').length,
    nonConformes: extincteurs.filter(e => e.statut === 'Non conforme').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <IntranetHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <IntranetHeader />

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* En-tête */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🧯 Extincteurs</h1>
            <p className="text-gray-600">Registre de sécurité incendie</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/gestion-techniciens')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              🔧 Gérer techniciens
            </button>
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              ➕ Ajouter un extincteur
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="text-sm font-medium text-gray-600 mb-2">Total</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="text-sm font-medium text-gray-600 mb-2">✅ Conformes</div>
            <div className="text-3xl font-bold text-green-600">{stats.conformes}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="text-sm font-medium text-gray-600 mb-2">⚠️ À vérifier</div>
            <div className="text-3xl font-bold text-orange-600">{stats.aVerifier}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="text-sm font-medium text-gray-600 mb-2">❌ Non conformes</div>
            <div className="text-3xl font-bold text-red-600">{stats.nonConformes}</div>
          </div>
        </div>

        {/* Alertes */}
        {(alertes.critiques.length > 0 || alertes.importantes.length > 0) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🚨 Alertes</h2>
            {alertes.critiques.map((alerte, i) => (
              <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                <span className="font-medium text-red-900">{alerte.extincteur}</span>
                <span className="text-red-700 ml-2">{alerte.message}</span>
              </div>
            ))}
            {alertes.importantes.map((alerte, i) => (
              <div key={i} className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
                <span className="font-medium text-orange-900">{alerte.extincteur}</span>
                <span className="text-orange-700 ml-2">{alerte.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingId ? '✏️ Modifier' : '➕ Nouvel'} extincteur
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Numéro *</label>
                      <input
                        type="text"
                        value={formData.numero}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as Extincteur['type'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="Poudre ABC">Poudre ABC</option>
                        <option value="Poudre BC">Poudre BC</option>
                        <option value="CO2">CO2</option>
                        <option value="Eau pulvérisée">Eau pulvérisée</option>
                        <option value="Eau + additif">Eau + additif</option>
                        <option value="Mousse">Mousse</option>
                        <option value="Classe D">Classe D</option>
                        <option value="Classe F">Classe F</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacité *</label>
                      <input
                        type="text"
                        value={formData.capacite}
                        onChange={(e) => setFormData({ ...formData, capacite: e.target.value })}
                        placeholder="6kg, 9L..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                      <select
                        value={formData.statut}
                        onChange={(e) => setFormData({ ...formData, statut: e.target.value as Extincteur['statut'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="Conforme">Conforme</option>
                        <option value="À vérifier">À vérifier</option>
                        <option value="Non conforme">Non conforme</option>
                        <option value="Hors service">Hors service</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement *</label>
                    <input
                      type="text"
                      value={formData.emplacement}
                      onChange={(e) => setFormData({ ...formData, emplacement: e.target.value })}
                      placeholder="Atelier principal - Entrée"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bâtiment</label>
                      <input
                        type="text"
                        value={formData.batiment}
                        onChange={(e) => setFormData({ ...formData, batiment: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Étage</label>
                      <input
                        type="text"
                        value={formData.etage}
                        onChange={(e) => setFormData({ ...formData, etage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date installation *</label>
                      <input
                        type="date"
                        value={formData.dateInstallation}
                        onChange={(e) => setFormData({ ...formData, dateInstallation: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date achat</label>
                      <input
                        type="date"
                        value={formData.dateAchat}
                        onChange={(e) => setFormData({ ...formData, dateAchat: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fabricant</label>
                      <input
                        type="text"
                        value={formData.fabricant}
                        onChange={(e) => setFormData({ ...formData, fabricant: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Numéro série</label>
                      <input
                        type="text"
                        value={formData.numeroSerie}
                        onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prochain contrôle *</label>
                      <input
                        type="date"
                        value={formData.prochainControle}
                        onChange={(e) => setFormData({ ...formData, prochainControle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prochaine maintenance</label>
                      <input
                        type="date"
                        value={formData.prochaineMaintenance}
                        onChange={(e) => setFormData({ ...formData, prochaineMaintenance: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
                    <textarea
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium"
                    >
                      {editingId ? '💾 Enregistrer' : '➕ Créer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        resetForm()
                      }}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Liste extincteurs */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Liste des extincteurs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emplacement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prochain contrôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {extincteurs.map((ext) => {
                  const jours = joursAvantExpiration(ext.prochainControle)
                  return (
                    <tr key={ext.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900">EXT-{ext.numero}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ext.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ext.capacite}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{ext.emplacement}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div>{new Date(ext.prochainControle).toLocaleDateString('fr-FR')}</div>
                        {jours < 30 && (
                          <div className={`text-xs ${jours < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                            {jours < 0 ? `Expiré depuis ${Math.abs(jours)}j` : `Dans ${jours}j`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutColor(ext.statut)}`}>
                          {ext.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => router.push(`/intranet/extincteurs/${ext.id}/historique`)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          📋 Historique
                        </button>
                        <button
                          onClick={() => handleEdit(ext)}
                          className="text-orange-600 hover:text-orange-800 mr-3"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(ext.id!)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
