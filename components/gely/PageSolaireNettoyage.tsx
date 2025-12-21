'use client'

import { useState } from 'react'
import { Wrench, FileText, Euro, TrendingUp, Users, Calendar } from 'lucide-react'

const SOLAIRE_NETTOYAGE_DATA = {
  informations: {
    raisonSociale: "SOLAIRE NETTOYAGE",
    forme: "SAS (Société par Actions Simplifiée)",
    capital: "1 000 €",
    rcs: "842 716 743 RCS Rodez",
    siege: "511 Impasse de Saint Rames, 12220 Vaureilles",
    president: "Axel GELY",
    objet: "Nettoyage et maintenance installations photovoltaïques",
    detention: "100% GELY INVESTISSEMENT HOLDING (depuis 08/01/2025)"
  },
  finances: {
    ca2024: "851 882 € HT",
    resultatNet2024: "113 081 € HT",
    margeNette: "13,3%",
    tresorerie: "121 103 €"
  },
  activite: {
    description: "Nettoyage et maintenance d'installations photovoltaïques",
    services: [
      "Nettoyage panneaux solaires",
      "Maintenance préventive",
      "Inspection installations",
      "Dépannage",
      "Conseils optimisation"
    ],
    clients: "Particuliers, entreprises, collectivités",
    zone: "Aveyron et départements limitrophes"
  },
  projetsFuturs: {
    batiment: {
      nom: "Futur atelier et stockage",
      localisation: "Bâtiment SCI GELY (Vaureilles)",
      surface: "À définir",
      type: "Location auprès de SCI GELY",
      statut: "En cours de construction"
    }
  },
  performance: [
    { annee: "2024-2025", ca: "851 882 €", resultat: "113 081 €", marge: "13,3%" },
    { annee: "2023-2024", ca: "~800 000 €", resultat: "~100 000 €", marge: "~12,5%" },
    { annee: "2022-2023", ca: "~750 000 €", resultat: "~90 000 €", marge: "~12%" }
  ]
}

export default function PageSolaireNettoyage() {
  const [activeTab, setActiveTab] = useState('activite')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-900 p-3 rounded-xl">
              <Wrench className="w-12 h-12 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-4xl font-bold">SOLAIRE NETTOYAGE</h2>
              <p className="text-yellow-100 text-lg">Nettoyage et maintenance photovoltaïque</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-yellow-200 text-sm">Président</p>
            <p className="text-xl font-bold">Axel GELY</p>
          </div>
        </div>
      </div>

      {/* KPIs rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-600">
          <p className="text-sm text-gray-600 mb-1">CA 2024-2025</p>
          <p className="text-3xl font-bold text-yellow-700">{SOLAIRE_NETTOYAGE_DATA.finances.ca2024}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Résultat net</p>
          <p className="text-3xl font-bold text-green-600">{SOLAIRE_NETTOYAGE_DATA.finances.resultatNet2024}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600">
          <p className="text-sm text-gray-600 mb-1">Marge nette</p>
          <p className="text-3xl font-bold text-blue-900">{SOLAIRE_NETTOYAGE_DATA.finances.margeNette}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-1">Trésorerie</p>
          <p className="text-3xl font-bold text-yellow-600">{SOLAIRE_NETTOYAGE_DATA.finances.tresorerie}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-yellow-400">
        <div className="flex space-x-1">
          {[
            { id: 'activite', label: 'Activité', icon: Wrench },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'infos', label: 'Informations', icon: FileText },
            { id: 'projets', label: 'Projets', icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold flex items-center space-x-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-white border-b-4 border-yellow-600 text-yellow-700'
                    : 'text-gray-600 hover:bg-yellow-50 hover:text-yellow-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Contenu Activité */}
      {activeTab === 'activite' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-600">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Notre activité</h3>
            
            <div className="bg-yellow-50 rounded-lg p-6 mb-6">
              <p className="text-gray-800 text-lg">{SOLAIRE_NETTOYAGE_DATA.activite.description}</p>
            </div>

            <h4 className="text-xl font-bold text-blue-900 mb-4">Services proposés</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {SOLAIRE_NETTOYAGE_DATA.activite.services.map((service, i) => (
                <div key={i} className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200 flex items-center">
                  <span className="text-yellow-600 text-2xl mr-3">✓</span>
                  <span className="font-semibold text-gray-900">{service}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-bold text-blue-900 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Clients
                </h5>
                <p className="text-gray-700">{SOLAIRE_NETTOYAGE_DATA.activite.clients}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-bold text-blue-900 mb-2">Zone d'intervention</h5>
                <p className="text-gray-700">{SOLAIRE_NETTOYAGE_DATA.activite.zone}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu Performance */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-600">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Performance financière</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Chiffre d'affaires 2024-2025</p>
                <p className="text-3xl font-bold text-yellow-700">{SOLAIRE_NETTOYAGE_DATA.finances.ca2024}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Résultat net 2024-2025</p>
                <p className="text-3xl font-bold text-green-700">{SOLAIRE_NETTOYAGE_DATA.finances.resultatNet2024}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Trésorerie disponible</p>
                <p className="text-3xl font-bold text-blue-900">{SOLAIRE_NETTOYAGE_DATA.finances.tresorerie}</p>
              </div>
            </div>

            <h4 className="text-xl font-bold text-blue-900 mb-4">Historique</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Exercice</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">CA</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Résultat</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Marge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {SOLAIRE_NETTOYAGE_DATA.performance.map((perf, i) => (
                    <tr key={i} className="hover:bg-yellow-50">
                      <td className="px-6 py-4 font-bold text-gray-900">{perf.annee}</td>
                      <td className="px-6 py-4 text-right font-semibold text-yellow-700">{perf.ca}</td>
                      <td className="px-6 py-4 text-right font-semibold text-green-700">{perf.resultat}</td>
                      <td className="px-6 py-4 text-right font-semibold text-blue-900">{perf.marge}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 bg-green-50 rounded-lg p-4">
              <h5 className="font-bold text-green-900 mb-2">🎯 Croissance soutenue</h5>
              <p className="text-green-800">Progression constante du CA et du résultat sur les 3 derniers exercices</p>
            </div>
          </div>
        </div>
      )}

      {/* Contenu Informations */}
      {activeTab === 'infos' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-600">
          <h3 className="text-2xl font-bold text-blue-900 mb-6">Informations légales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Raison sociale</p>
              <p className="font-bold text-gray-900">{SOLAIRE_NETTOYAGE_DATA.informations.raisonSociale}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Forme juridique</p>
              <p className="font-bold text-gray-900">{SOLAIRE_NETTOYAGE_DATA.informations.forme}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Capital social</p>
              <p className="font-bold text-gray-900">{SOLAIRE_NETTOYAGE_DATA.informations.capital}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">RCS</p>
              <p className="font-bold text-gray-900">{SOLAIRE_NETTOYAGE_DATA.informations.rcs}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-1">Siège social</p>
              <p className="font-bold text-gray-900">{SOLAIRE_NETTOYAGE_DATA.informations.siege}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Président</p>
              <p className="font-bold text-gray-900">{SOLAIRE_NETTOYAGE_DATA.informations.president}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Objet social</p>
              <p className="font-bold text-gray-900">{SOLAIRE_NETTOYAGE_DATA.informations.objet}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-1">Détention</p>
              <p className="font-bold text-gray-900">{SOLAIRE_NETTOYAGE_DATA.informations.detention}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contenu Projets */}
      {activeTab === 'projets' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-600">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Projets futurs</h3>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-xl font-bold text-blue-900">{SOLAIRE_NETTOYAGE_DATA.projetsFuturs.batiment.nom}</h4>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {SOLAIRE_NETTOYAGE_DATA.projetsFuturs.batiment.statut}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Localisation</p>
                  <p className="font-semibold text-gray-900">{SOLAIRE_NETTOYAGE_DATA.projetsFuturs.batiment.localisation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold text-gray-900">{SOLAIRE_NETTOYAGE_DATA.projetsFuturs.batiment.type}</p>
                </div>
              </div>

              <div className="mt-4 bg-white rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  📍 Futur espace de travail dans le bâtiment construit par SCI GELY à Vaureilles, 
                  permettant d'optimiser les opérations de maintenance et de stockage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
