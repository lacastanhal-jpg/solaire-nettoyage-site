'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { Projet, LigneFinanciere, TypeLigneFinanciereType, StatutLigneType } from './types'
import { PROJETS_MOCK, LIGNES_FINANCIERES_MOCK, calculerTotaux } from './mockData'

const TYPES_LABELS: Record<TypeLigneFinanciereType, string> = {
  devis: 'Devis',
  facture: 'Facture',
  revenu: 'Revenu',
  autre: 'Autre'
}

const STATUTS_LABELS: Record<StatutLigneType, { label: string; color: string }> = {
  paye: { label: 'Payé', color: 'bg-green-100 text-green-800' },
  a_payer: { label: 'À payer', color: 'bg-yellow-100 text-yellow-800' },
  en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  signe: { label: 'Signé', color: 'bg-purple-100 text-purple-800' },
  annule: { label: 'Annulé', color: 'bg-red-100 text-red-800' }
}

interface ProjetDetailProps {
  projetId: string
  onBack: () => void
}

export default function ProjetDetail({ projetId, onBack }: ProjetDetailProps) {
  const [projet] = useState<Projet | undefined>(PROJETS_MOCK.find(p => p.id === projetId))
  const [lignes, setLignes] = useState<LigneFinanciere[]>(LIGNES_FINANCIERES_MOCK[projetId] || [])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedLigne, setEditedLigne] = useState<LigneFinanciere | null>(null)
  const [activeTab, setActiveTab] = useState<'vue' | 'finances' | 'documents'>('finances')

  if (!projet) {
    return <div>Projet non trouvé</div>
  }

  const totaux = calculerTotaux(lignes)

  const handleEditStart = (ligne: LigneFinanciere) => {
    setEditingId(ligne.id)
    setEditedLigne({ ...ligne })
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditedLigne(null)
  }

  const handleEditSave = () => {
    if (editedLigne) {
      setLignes(lignes.map(l => l.id === editedLigne.id ? editedLigne : l))
      setEditingId(null)
      setEditedLigne(null)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette ligne ?')) {
      setLignes(lignes.filter(l => l.id !== id))
    }
  }

  const handleAddLine = () => {
    const newLigne: LigneFinanciere = {
      id: `ligne_${Date.now()}`,
      type: 'facture',
      fournisseur: '',
      description: '',
      montantHT: 0,
      montantTTC: 0,
      statut: 'a_payer',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    }
    setLignes([...lignes, newLigne])
    setEditingId(newLigne.id)
    setEditedLigne(newLigne)
  }

  const updateField = (field: keyof LigneFinanciere, value: any) => {
    if (editedLigne) {
      setEditedLigne({ ...editedLigne, [field]: value })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-xl p-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-100 hover:text-white mb-4 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour aux projets</span>
        </button>
        <div>
          <h2 className="text-4xl font-bold mb-2">{projet.nom}</h2>
          <div className="flex items-center space-x-4 text-blue-100">
            <span>{projet.responsable}</span>
            <span>•</span>
            <span>Budget: {projet.budgetTotal.toLocaleString('fr-FR')} €</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-1">Budget total</p>
          <p className="text-2xl font-bold text-yellow-700">{projet.budgetTotal.toLocaleString('fr-FR')} €</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Payé</p>
          <p className="text-2xl font-bold text-green-700">{totaux.totalPaye.toLocaleString('fr-FR')} €</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
          <p className="text-sm text-gray-600 mb-1">À payer</p>
          <p className="text-2xl font-bold text-orange-700">{totaux.totalAPayer.toLocaleString('fr-FR')} €</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Reste budget</p>
          <p className="text-2xl font-bold text-blue-700">
            {(projet.budgetTotal - totaux.totalFactures - totaux.totalDevis).toLocaleString('fr-FR')} €
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
          <p className="text-sm text-gray-600 mb-1">Réalisation</p>
          <p className="text-2xl font-bold text-purple-700">
            {((totaux.totalPaye / projet.budgetTotal) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-yellow-400 bg-white rounded-t-xl">
        <div className="flex space-x-1 px-6">
          {[
            { id: 'finances' as const, label: 'Finances' },
            { id: 'vue' as const, label: 'Vue d\'ensemble' },
            { id: 'documents' as const, label: 'Documents' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white border-b-4 border-blue-600 text-blue-900'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu Finances */}
      {activeTab === 'finances' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-blue-900">Tableau Financier</h3>
            <button
              onClick={handleAddLine}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une ligne</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Fournisseur</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">HT</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">TTC</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Statut</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lignes.map((ligne) => {
                  const isEditing = editingId === ligne.id
                  const displayLigne = isEditing ? editedLigne! : ligne

                  return (
                    <tr key={ligne.id} className={`hover:bg-blue-50 transition ${isEditing ? 'bg-yellow-50' : ''}`}>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select
                            value={displayLigne.type}
                            onChange={(e) => updateField('type', e.target.value)}
                            className="px-2 py-1 border rounded w-full"
                          >
                            {Object.entries(TYPES_LABELS).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm font-medium">{TYPES_LABELS[ligne.type]}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={displayLigne.fournisseur}
                            onChange={(e) => updateField('fournisseur', e.target.value)}
                            className="px-2 py-1 border rounded w-full"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-blue-900">{ligne.fournisseur}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={displayLigne.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            className="px-2 py-1 border rounded w-full"
                          />
                        ) : (
                          <span className="text-sm text-gray-700">{ligne.description}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={displayLigne.montantHT}
                            onChange={(e) => updateField('montantHT', parseFloat(e.target.value))}
                            className="px-2 py-1 border rounded w-24 text-right"
                          />
                        ) : (
                          <span className="text-sm font-semibold">{ligne.montantHT.toLocaleString('fr-FR')} €</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={displayLigne.montantTTC}
                            onChange={(e) => updateField('montantTTC', parseFloat(e.target.value))}
                            className="px-2 py-1 border rounded w-24 text-right"
                          />
                        ) : (
                          <span className="text-sm font-semibold">{ligne.montantTTC.toLocaleString('fr-FR')} €</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <select
                            value={displayLigne.statut}
                            onChange={(e) => updateField('statut', e.target.value)}
                            className="px-2 py-1 border rounded text-xs"
                          >
                            {Object.entries(STATUTS_LABELS).map(([key, data]) => (
                              <option key={key} value={key}>{data.label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${STATUTS_LABELS[ligne.statut].color}`}>
                            {STATUTS_LABELS[ligne.statut].label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <input
                            type="date"
                            value={displayLigne.date}
                            onChange={(e) => updateField('date', e.target.value)}
                            className="px-2 py-1 border rounded text-xs"
                          />
                        ) : (
                          <span className="text-sm">{new Date(ligne.date).toLocaleDateString('fr-FR')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={handleEditSave}
                                className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                                title="Sauvegarder"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleEditCancel}
                                className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                title="Annuler"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditStart(ligne)}
                                className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                title="Modifier"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(ligne.id)}
                                className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr className="font-bold">
                  <td colSpan={3} className="px-4 py-3 text-right">TOTAUX</td>
                  <td className="px-4 py-3 text-right text-blue-900">
                    {lignes.reduce((sum, l) => sum + l.montantHT, 0).toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-4 py-3 text-right text-blue-900">
                    {lignes.reduce((sum, l) => sum + l.montantTTC, 0).toLocaleString('fr-FR')} €
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Vue d'ensemble */}
      {activeTab === 'vue' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">Vue d'ensemble</h3>
          <p className="text-gray-600">À venir : timeline, photos, notes...</p>
        </div>
      )}

      {/* Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">Documents</h3>
          <p className="text-gray-600">À venir : gestion documentaire par projet...</p>
        </div>
      )}
    </div>
  )
}
