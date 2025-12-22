'use client'

import { useState } from 'react'
import { FolderKanban, Plus, Building2, TrendingUp, AlertCircle, Edit2, Eye, Trash2 } from 'lucide-react'
import { Projet } from '@/lib/gely/types'
import { useProjets, ajouterProjet, modifierProjet, supprimerProjet } from '@/lib/gely/useFirestore'
import ModalCreationProjet from './ModalCreationProjet'
import ModalModificationProjet from './ModalModificationProjet'

const SOCIETES_LABELS: Record<string, string> = {
  sciGely: 'SCI GELY',
  lexa: 'LEXA',
  lexa2: 'LEXA 2',
  solaireNettoyage: 'SOLAIRE NETTOYAGE'
}

const STATUTS_CONFIG: Record<string, { label: string; color: string }> = {
  en_cours: { label: 'En cours', color: 'bg-green-100 text-green-800' },
  developement: { label: 'Développement', color: 'bg-blue-100 text-blue-800' },
  termine: { label: 'Terminé', color: 'bg-gray-100 text-gray-800' },
  suspendu: { label: 'Suspendu', color: 'bg-red-100 text-red-800' }
}

interface PageProjetsProps {
  onSelectProjet?: (projetId: string) => void
}

export default function PageProjets({ onSelectProjet }: PageProjetsProps) {
  const { projets, loading, error } = useProjets()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [projetEnModification, setProjetEnModification] = useState<Projet | null>(null)
  const [selectedSociete, setSelectedSociete] = useState<string>('all')

  // Afficher loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-semibold">Chargement des projets...</p>
          <p className="text-sm text-gray-500 mt-2">Connexion à Firebase</p>
        </div>
      </div>
    )
  }

  // Afficher erreur
  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 shadow-lg">
        <div className="flex items-center space-x-4">
          <AlertCircle className="w-12 h-12 text-red-600" />
          <div>
            <h3 className="text-xl font-bold text-red-800 mb-2">❌ Erreur de chargement</h3>
            <p className="text-red-700">{error.message}</p>
            <p className="text-sm text-red-600 mt-2">Vérifiez votre connexion Firebase</p>
          </div>
        </div>
      </div>
    )
  }

  const projetsFiltres = selectedSociete === 'all' 
    ? projets 
    : projets.filter(p => p.societe === selectedSociete)

  // Totaux TTC avec protection
  const getTotalBudget = () => projets.reduce((sum, p) => sum + (p.budgetTotal || 0), 0)
  const getTotalDepense = () => projets.reduce((sum, p) => sum + (p.totalPaye || 0), 0)
  const getTotalReste = () => projets.reduce((sum, p) => sum + (p.reste || 0), 0)
  const getTotalAPayer = () => projets.reduce((sum, p) => sum + (p.totalAPayer || 0), 0)
  const getTotalAFinancer = () => projets.reduce((sum, p) => sum + ((p.budgetTotal || 0) - (p.totalPaye || 0)), 0)

  // Totaux HT avec protection
  const getTotalBudgetHT = () => projets.reduce((sum, p) => sum + (p.budgetTotalHT || 0), 0)
  const getTotalDepenseHT = () => projets.reduce((sum, p) => sum + (p.totalPayeHT || 0), 0)
  const getTotalResteHT = () => projets.reduce((sum, p) => sum + (p.resteHT || 0), 0)
  const getTotalAPayerHT = () => projets.reduce((sum, p) => sum + (p.totalAPayerHT || 0), 0)
  const getTotalAFinancerHT = () => projets.reduce((sum, p) => sum + ((p.budgetTotalHT || 0) - (p.totalPayeHT || 0)), 0)

  const handleCreateProjet = async (nouveauProjet: Projet) => {
    const result = await ajouterProjet(nouveauProjet)
    if (result.success) {
      setShowCreateModal(false)
    } else {
      alert('Erreur lors de la création du projet')
    }
  }

  const handleModifyProjet = async (projetModifie: Projet) => {
    const result = await modifierProjet(projetModifie.id, projetModifie)
    if (result.success) {
      setProjetEnModification(null)
    } else {
      alert('Erreur lors de la modification du projet')
    }
  }

  const handleDeleteProjet = async (projetId: string, projetNom: string) => {
    if (confirm(`SUPPRIMER LE PROJET "${projetNom}" ?\n\nCette action est irréversible !`)) {
      const result = await supprimerProjet(projetId)
      if (!result.success) {
        alert('Erreur lors de la suppression du projet')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-400 p-3 rounded-xl">
              <FolderKanban className="w-12 h-12 text-blue-900" />
            </div>
            <div>
              <h2 className="text-4xl font-bold">Gestion des Projets</h2>
              <p className="text-blue-100 text-lg">Suivi financier et opérationnel en temps réel - 🔥 Firebase</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-all shadow-lg flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau Projet</span>
          </button>
        </div>
      </div>

      {/* KPIs Globaux */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600">
          <p className="text-sm text-gray-900 mb-1">Projets actifs</p>
          <p className="text-3xl font-bold text-blue-900">{projets.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
          <p className="text-sm text-gray-900 mb-1 font-bold">💼 Budget total</p>
          <p className="text-3xl font-bold text-yellow-700">{getTotalBudgetHT().toLocaleString('fr-FR')} € HT</p>
          <p className="text-sm text-gray-600">{getTotalBudget().toLocaleString('fr-FR')} € TTC</p>
          <p className="text-xs text-gray-500 mt-1">TVA: {(getTotalBudget() - getTotalBudgetHT()).toLocaleString('fr-FR')} €</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
          <p className="text-sm text-gray-900 mb-1 font-bold">✅ Payé</p>
          <p className="text-3xl font-bold text-green-700">{getTotalDepenseHT().toLocaleString('fr-FR')} € HT</p>
          <p className="text-sm text-gray-600">{getTotalDepense().toLocaleString('fr-FR')} € TTC</p>
          <p className="text-xs text-gray-500 mt-1">TVA: {(getTotalDepense() - getTotalDepenseHT()).toLocaleString('fr-FR')} €</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
          <p className="text-sm text-gray-900 mb-1 font-bold">⏳ À payer</p>
          <p className="text-3xl font-bold text-orange-700">{getTotalAPayerHT().toLocaleString('fr-FR')} € HT</p>
          <p className="text-sm text-gray-600">{getTotalAPayer().toLocaleString('fr-FR')} € TTC</p>
          <p className="text-xs text-gray-500 mt-1">TVA: {(getTotalAPayer() - getTotalAPayerHT()).toLocaleString('fr-FR')} €</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-lg p-6 border-t-4 border-red-900">
          <p className="text-sm text-white font-bold mb-1">💰 Reste à financer</p>
          <p className="text-3xl font-bold text-white">{getTotalAFinancerHT().toLocaleString('fr-FR')} € HT</p>
          <p className="text-sm text-white/80">{getTotalAFinancer().toLocaleString('fr-FR')} € TTC</p>
          <p className="text-xs text-white/60 mt-1">TVA: {(getTotalAFinancer() - getTotalAFinancerHT()).toLocaleString('fr-FR')} €</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <Building2 className="w-6 h-6 text-gray-900" />
          <span className="font-semibold text-gray-700">Filtrer par société :</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSociete('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedSociete === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            {Object.entries(SOCIETES_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedSociete(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedSociete === key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des projets */}
      <div className="grid grid-cols-1 gap-4">
        {projetsFiltres.map((projet) => {
          const budgetTotal = projet.budgetTotal || 1 // Éviter division par 0
          const totalPaye = projet.totalPaye || 0
          const pourcentageRealisation = ((totalPaye / budgetTotal) * 100).toFixed(1)
          const isEnRetard = (projet.totalAPayer || 0) > 0 // Simplifié pour l'instant
          
          return (
            <div
              key={projet.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border-l-4 border-blue-600"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-blue-900">{projet.nom}</h3>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="text-sm text-gray-900">{SOCIETES_LABELS[projet.societe]}</span>
                        <span className="text-gray-700">•</span>
                        <span className="text-sm text-gray-900">{projet.responsable}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUTS_CONFIG[projet.statut].color}`}>
                          {STATUTS_CONFIG[projet.statut].label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{projet.description}</p>

                  {/* Données techniques */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {projet.puissanceKWc && (
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <p className="text-xs text-gray-900">Puissance</p>
                        <p className="text-lg font-bold text-blue-900">{projet.puissanceKWc} kWc</p>
                      </div>
                    )}
                    {projet.revenusAnnuels && (
                      <div className="bg-green-100 p-3 rounded-lg">
                        <p className="text-xs text-gray-900">Revenus/an</p>
                        <p className="text-lg font-bold text-green-700">{projet.revenusAnnuels.toLocaleString('fr-FR')} €</p>
                      </div>
                    )}
                    {projet.surfaceM2 && (
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <p className="text-xs text-gray-900">Surface</p>
                        <p className="text-lg font-bold text-yellow-700">{projet.surfaceM2} m²</p>
                      </div>
                    )}
                  </div>

                  {/* Indicateurs financiers */}
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    <div className="bg-gray-50 p-2 rounded-lg border-2 border-gray-300">
                      <p className="text-xs text-gray-900 font-bold">Budget total</p>
                      <p className="text-xl font-bold text-gray-900">{(projet.budgetTotalHT || 0).toLocaleString('fr-FR')} € HT</p>
                      <p className="text-xs text-gray-600">{(projet.budgetTotal || 0).toLocaleString('fr-FR')} € TTC</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg border-2 border-green-500">
                      <p className="text-xs text-gray-900 font-bold">Payé</p>
                      <p className="text-xl font-bold text-green-700">{(projet.totalPayeHT || 0).toLocaleString('fr-FR')} € HT</p>
                      <p className="text-xs text-gray-600">{(projet.totalPaye || 0).toLocaleString('fr-FR')} € TTC</p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded-lg border-2 border-orange-500">
                      <p className="text-xs text-gray-900 font-bold">À payer</p>
                      <p className="text-xl font-bold text-orange-700">{(projet.totalAPayerHT || 0).toLocaleString('fr-FR')} € HT</p>
                      <p className="text-xs text-gray-600">{(projet.totalAPayer || 0).toLocaleString('fr-FR')} € TTC</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg border-2 border-blue-500">
                      <p className="text-xs text-gray-900 font-bold">Reste budget</p>
                      <p className="text-xl font-bold text-blue-700">{(projet.resteHT || 0).toLocaleString('fr-FR')} € HT</p>
                      <p className="text-xs text-gray-600">{(projet.reste || 0).toLocaleString('fr-FR')} € TTC</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded-lg border-2 border-red-600">
                      <p className="text-xs text-red-900 font-bold">💰 Reste à financer</p>
                      <p className="text-xl font-bold text-red-700">{((projet.budgetTotalHT || 0) - (projet.totalPayeHT || 0)).toLocaleString('fr-FR')} € HT</p>
                      <p className="text-xs text-gray-600">{((projet.budgetTotal || 0) - (projet.totalPaye || 0)).toLocaleString('fr-FR')} € TTC</p>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-900">Réalisation</span>
                      <span className="text-sm font-bold text-gray-900">{pourcentageRealisation}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(parseFloat(pourcentageRealisation), 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Alertes */}
                  {isEnRetard && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-700" />
                      <span className="text-sm text-yellow-800 font-medium">Factures en attente de paiement</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-6">
                  <button
                    onClick={() => onSelectProjet && onSelectProjet(projet.id)}
                    className="p-3 bg-blue-600 text-white border-2 border-black rounded-lg hover:bg-blue-700 transition"
                    title="Voir détails"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setProjetEnModification(projet)}
                    className="p-3 bg-yellow-500 text-black border-2 border-black rounded-lg hover:bg-yellow-400 transition"
                    title="Modifier"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProjet(projet.id, projet.nom)}
                    className="p-3 bg-red-600 text-white border-2 border-black rounded-lg hover:bg-red-700 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal création */}
      {showCreateModal && (
        <ModalCreationProjet
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateProjet}
        />
      )}

      {/* Modal modification */}
      {projetEnModification && (
        <ModalModificationProjet
          projet={projetEnModification}
          onClose={() => setProjetEnModification(null)}
          onSave={handleModifyProjet}
        />
      )}
    </div>
  )
}
