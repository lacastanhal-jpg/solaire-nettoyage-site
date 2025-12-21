'use client'

import { useState } from 'react'
import { FolderKanban, Plus, Building2, TrendingUp, AlertCircle, Edit2, Eye } from 'lucide-react'
import { Projet } from './types'
import { PROJETS_MOCK } from './mockData'

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
  const [projets] = useState<Projet[]>(PROJETS_MOCK)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSociete, setSelectedSociete] = useState<string>('all')

  const projetsFiltres = selectedSociete === 'all' 
    ? projets 
    : projets.filter(p => p.societe === selectedSociete)

  const getTotalBudget = () => projets.reduce((sum, p) => sum + p.budgetTotal, 0)
  const getTotalDepense = () => projets.reduce((sum, p) => sum + p.totalPaye, 0)
  const getTotalReste = () => projets.reduce((sum, p) => sum + p.reste, 0)

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
              <p className="text-blue-100 text-lg">Suivi financier et opérationnel en temps réel</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600">
          <p className="text-sm text-gray-600 mb-1">Projets actifs</p>
          <p className="text-3xl font-bold text-blue-900">{projets.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-1">Budget total</p>
          <p className="text-3xl font-bold text-yellow-700">{getTotalBudget().toLocaleString('fr-FR')} €</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Dépensé</p>
          <p className="text-3xl font-bold text-green-700">{getTotalDepense().toLocaleString('fr-FR')} €</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Reste à engager</p>
          <p className="text-3xl font-bold text-blue-700">{getTotalReste().toLocaleString('fr-FR')} €</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <Building2 className="w-6 h-6 text-gray-600" />
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
          const pourcentageRealisation = ((projet.totalPaye / projet.budgetTotal) * 100).toFixed(1)
          const isEnRetard = projet.totalAPayer > 0 // Simplifié pour l'instant
          
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
                        <span className="text-sm text-gray-600">{SOCIETES_LABELS[projet.societe]}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{projet.responsable}</span>
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
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Puissance</p>
                        <p className="text-lg font-bold text-blue-900">{projet.puissanceKWc} kWc</p>
                      </div>
                    )}
                    {projet.revenusAnnuels && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Revenus/an</p>
                        <p className="text-lg font-bold text-green-700">{projet.revenusAnnuels.toLocaleString('fr-FR')} €</p>
                      </div>
                    )}
                    {projet.surfaceM2 && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Surface</p>
                        <p className="text-lg font-bold text-yellow-700">{projet.surfaceM2} m²</p>
                      </div>
                    )}
                  </div>

                  {/* Indicateurs financiers */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Budget total</p>
                      <p className="text-lg font-bold text-gray-900">{projet.budgetTotal.toLocaleString('fr-FR')} €</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payé</p>
                      <p className="text-lg font-bold text-green-700">{projet.totalPaye.toLocaleString('fr-FR')} €</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">À payer</p>
                      <p className="text-lg font-bold text-yellow-700">{projet.totalAPayer.toLocaleString('fr-FR')} €</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Reste</p>
                      <p className="text-lg font-bold text-blue-700">{projet.reste.toLocaleString('fr-FR')} €</p>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Réalisation</span>
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
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-700" />
                      <span className="text-sm text-yellow-800 font-medium">Factures en attente de paiement</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-6">
                  <button
                    onClick={() => onSelectProjet && onSelectProjet(projet.id)}
                    className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                    title="Voir détails"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    className="p-3 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition"
                    title="Modifier"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal création (à implémenter) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Nouveau Projet</h2>
            <p className="text-gray-600">Formulaire à venir...</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="mt-4 px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
