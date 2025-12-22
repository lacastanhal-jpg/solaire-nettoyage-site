'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { Projet, LigneFinanciere, TypeLigneFinanciereType, StatutLigneType } from '@/lib/gely/types'
import { useProjet, useLignesFinancieres, ajouterLigneFinanciere, modifierLigneFinanciere, supprimerLigneFinanciere } from '@/lib/gely/useFirestore'
import DocumentsProjet from './DocumentsProjet'
import VueEnsembleProjet from './VueEnsembleProjet'
import ModalAjoutLigne from './ModalAjoutLigne'

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
  const { projet, loading: loadingProjet } = useProjet(projetId)
  const { lignes: lignesData, loading: loadingLignes } = useLignesFinancieres(projetId)
  const lignes = lignesData as LigneFinanciere[]
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedLigne, setEditedLigne] = useState<LigneFinanciere | null>(null)
  const [activeTab, setActiveTab] = useState<'vue' | 'finances' | 'documents'>('finances')
  const [showModalAjout, setShowModalAjout] = useState(false)
  const [fichiersPDF, setFichiersPDF] = useState<Map<string, File>>(new Map())

  // Loading
  if (loadingProjet || loadingLignes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-semibold">Chargement du projet...</p>
          <p className="text-sm text-gray-500 mt-2">🔥 Firebase</p>
        </div>
      </div>
    )
  }

  // Erreur
  if (!projet) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
        <p className="text-red-800 text-xl font-bold mb-4">❌ Projet non trouvé</p>
        <button 
          onClick={onBack} 
          className="text-blue-600 hover:underline font-semibold"
        >
          ← Retour aux projets
        </button>
      </div>
    )
  }

  // Calculer totaux depuis lignes Firebase
  const calculerTotaux = (lignes: LigneFinanciere[]) => {
    let totalDevis = 0, totalDevisHT = 0
    let totalFactures = 0, totalFacturesHT = 0  
    let totalPaye = 0, totalPayeHT = 0
    let totalAPayer = 0, totalAPayerHT = 0

    lignes.forEach(ligne => {
      if (ligne.type === 'devis' && ligne.statut === 'signe') {
        totalDevis += ligne.montantTTC || 0
        totalDevisHT += ligne.montantHT || 0
      }
      if (ligne.type === 'facture') {
        totalFactures += ligne.montantTTC || 0
        totalFacturesHT += ligne.montantHT || 0
        
        if (ligne.statut === 'paye') {
          totalPaye += ligne.montantTTC || 0
          totalPayeHT += ligne.montantHT || 0
        } else if (ligne.statut === 'a_payer') {
          totalAPayer += ligne.montantTTC || 0
          totalAPayerHT += ligne.montantHT || 0
        }
      }
    })

    return {
      totalDevis, totalDevisHT,
      totalFactures, totalFacturesHT,
      totalPaye, totalPayeHT,
      totalAPayer, totalAPayerHT
    }
  }

  const totaux = calculerTotaux(lignes)

  const handleAjoutLigne = async (nouvelleLigne: LigneFinanciere, fichier?: File) => {
    const result = await ajouterLigneFinanciere(projetId, nouvelleLigne)
    if (result.success) {
      if (fichier) {
        const newMap = new Map(fichiersPDF)
        newMap.set(result.id!, fichier)
        setFichiersPDF(newMap)
      }
      setShowModalAjout(false)
    } else {
      alert('❌ Erreur lors de l\'ajout de la ligne')
    }
  }

  const handleEditStart = (ligne: LigneFinanciere) => {
    setEditingId(ligne.id)
    setEditedLigne({ ...ligne })
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditedLigne(null)
  }

  const handleEditSave = async () => {
    if (editedLigne) {
      const result = await modifierLigneFinanciere(editedLigne.id, editedLigne)
      if (result.success) {
        setEditingId(null)
        setEditedLigne(null)
      } else {
        alert('❌ Erreur lors de la modification')
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette ligne ?')) {
      const result = await supprimerLigneFinanciere(id)
      if (!result.success) {
        alert('❌ Erreur lors de la suppression')
      }
    }
  }

  const handleAddLine = () => {
    setShowModalAjout(true)
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
            <span>Budget: {(projet.budgetTotal || 0).toLocaleString('fr-FR')} €</span>
            <span>•</span>
            <span className="text-yellow-300 font-bold">🔥 Firebase temps réel</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
          <p className="text-sm text-gray-900 mb-1 font-bold">Budget total</p>
          <p className="text-2xl font-bold text-yellow-700">{(projet.budgetTotalHT || 0).toLocaleString('fr-FR')} € HT</p>
          <p className="text-sm text-gray-600">{(projet.budgetTotal || 0).toLocaleString('fr-FR')} € TTC</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
          <p className="text-sm text-gray-900 mb-1 font-bold">Payé</p>
          <p className="text-2xl font-bold text-green-700">{totaux.totalPayeHT.toLocaleString('fr-FR')} € HT</p>
          <p className="text-sm text-gray-600">{totaux.totalPaye.toLocaleString('fr-FR')} € TTC</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
          <p className="text-sm text-gray-900 mb-1 font-bold">À payer</p>
          <p className="text-2xl font-bold text-orange-700">{totaux.totalAPayerHT.toLocaleString('fr-FR')} € HT</p>
          <p className="text-sm text-gray-600">{totaux.totalAPayer.toLocaleString('fr-FR')} € TTC</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
          <p className="text-sm text-gray-900 mb-1 font-bold">Reste budget</p>
          <p className="text-2xl font-bold text-blue-700">
            {((projet.budgetTotalHT || 0) - totaux.totalFacturesHT - totaux.totalDevisHT).toLocaleString('fr-FR')} € HT
          </p>
          <p className="text-sm text-gray-600">
            {((projet.budgetTotal || 0) - totaux.totalFactures - totaux.totalDevis).toLocaleString('fr-FR')} € TTC
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-lg p-6 border-t-4 border-red-900">
          <p className="text-sm text-white font-bold mb-1">💰 À financer</p>
          <p className="text-2xl font-bold text-white">
            {((projet.budgetTotalHT || 0) - totaux.totalPayeHT).toLocaleString('fr-FR')} € HT
          </p>
          <p className="text-sm text-white/80">
            {((projet.budgetTotal || 0) - totaux.totalPaye).toLocaleString('fr-FR')} € TTC
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
          <p className="text-sm text-gray-900 mb-1 font-bold">% Réalisé</p>
          <p className="text-3xl font-bold text-purple-700">
            {((totaux.totalPaye / (projet.budgetTotal || 1)) * 100).toFixed(1)}%
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
                  : 'text-gray-900 hover:bg-blue-200 hover:text-blue-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Finances */}
      {activeTab === 'finances' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-blue-900">Lignes Financières</h3>
            <button
              onClick={handleAddLine}
              className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-all shadow-lg flex items-center space-x-2 border-2 border-black"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter ligne</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">Fournisseur</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">Description</th>
                  <th className="px-4 py-3 text-right text-sm font-bold">Montant HT</th>
                  <th className="px-4 py-3 text-right text-sm font-bold">Montant TTC</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">Date</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lignes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Aucune ligne financière. Cliquez sur "Ajouter ligne" pour commencer.
                    </td>
                  </tr>
                ) : (
                  lignes.map((ligne) => {
                    const isEditing = editingId === ligne.id
                    const displayLigne = isEditing && editedLigne ? editedLigne : ligne

                    return (
                      <tr key={ligne.id} className={isEditing ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <select
                              value={displayLigne.type}
                              onChange={(e) => updateField('type', e.target.value)}
                              className="px-2 py-1 border-4 border-blue-600 bg-white text-black font-bold text-lg rounded w-full"
                            >
                              {Object.entries(TYPES_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-sm font-bold text-gray-900">{TYPES_LABELS[ligne.type]}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={displayLigne.fournisseur}
                              onChange={(e) => updateField('fournisseur', e.target.value)}
                              className="px-2 py-1 border-4 border-blue-600 bg-white text-black font-bold text-lg rounded w-full"
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
                              className="px-2 py-1 border-4 border-blue-600 bg-white text-black font-bold text-lg rounded w-full"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-gray-900">{ligne.description}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={displayLigne.montantHT}
                              onChange={(e) => updateField('montantHT', parseFloat(e.target.value))}
                              className="px-2 py-1 border-4 border-blue-600 bg-white text-black font-bold text-lg rounded w-24 text-right"
                            />
                          ) : (
                            <span className="text-sm font-bold text-gray-900">{(ligne.montantHT || 0).toLocaleString('fr-FR')} €</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={displayLigne.montantTTC}
                              onChange={(e) => updateField('montantTTC', parseFloat(e.target.value))}
                              className="px-2 py-1 border-4 border-blue-600 bg-white text-black font-bold text-lg rounded w-24 text-right"
                            />
                          ) : (
                            <span className="text-sm font-bold text-gray-900">{(ligne.montantTTC || 0).toLocaleString('fr-FR')} €</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <select
                              value={displayLigne.statut}
                              onChange={(e) => updateField('statut', e.target.value)}
                              className="px-2 py-1 border-4 border-blue-600 bg-white text-black font-bold text-lg rounded text-xs"
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
                              className="px-2 py-1 border-4 border-blue-600 bg-white text-black font-bold text-lg rounded text-xs"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-gray-900">{new Date(ligne.date).toLocaleDateString('fr-FR')}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center space-x-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={handleEditSave}
                                  className="p-1 bg-green-600 text-white border-2 border-black rounded hover:bg-green-700"
                                  title="Sauvegarder"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  className="p-1 bg-gray-400 text-white border-2 border-black rounded hover:bg-gray-500"
                                  title="Annuler"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditStart(ligne)}
                                  className="p-1 bg-blue-600 text-white border-2 border-black rounded hover:bg-blue-700"
                                  title="Modifier"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(ligne.id)}
                                  className="p-1 bg-red-600 text-white border-2 border-black rounded hover:bg-red-700"
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
                  })
                )}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr className="font-bold">
                  <td colSpan={3} className="px-4 py-3 text-right">TOTAUX</td>
                  <td className="px-4 py-3 text-right text-blue-900">
                    {lignes.reduce((sum, l) => sum + (l.montantHT || 0), 0).toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-4 py-3 text-right text-blue-900">
                    {lignes.reduce((sum, l) => sum + (l.montantTTC || 0), 0).toLocaleString('fr-FR')} €
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
        <VueEnsembleProjet projet={projet} />
      )}

      {/* Documents */}
      {activeTab === 'documents' && (
        <DocumentsProjet projetId={projet.id} projetNom={projet.nom} />
      )}

      {/* Modal ajout ligne */}
      {showModalAjout && (
        <ModalAjoutLigne
          onClose={() => setShowModalAjout(false)}
          onSubmit={handleAjoutLigne}
        />
      )}
    </div>
  )
}
