'use client'

import { useState } from 'react'
import { Factory, FileText, Euro } from 'lucide-react'

const FACTURES = [
  { date: "08/12/2021", fournisseur: "MECOJIT", numero: "6442", description: "Lauréat AO", ht: "3 333 €", ttc: "4 000 €", statut: "Payé" },
  { date: "13/01/2023", fournisseur: "ENEDIS", numero: "3400002637", description: "Raccordement", ht: "15 641 €", ttc: "18 770 €", statut: "Payé" },
  { date: "09/12/2025", fournisseur: "MECOJIT", numero: "12343", description: "Acompte 15% GELY 1", ht: "21 397 €", ttc: "25 676 €", statut: "Échéance 25/12/2025" }
]

export default function PageLexa2() {
  const [activeTab, setActiveTab] = useState('projets')

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-400 p-3 rounded-xl">
              <Factory className="w-12 h-12 text-blue-900" />
            </div>
            <div>
              <h2 className="text-4xl font-bold">LEXA 2</h2>
              <p className="text-blue-100 text-lg">Production photovoltaïque - Nouveaux projets</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm">Président</p>
            <p className="text-xl font-bold">Axel GELY</p>
          </div>
        </div>
      </div>

      <div className="border-b-2 border-yellow-400">
        <div className="flex space-x-1">
          {[
            { id: 'projets', label: 'Projets', icon: Factory },
            { id: 'finances', label: 'Finances', icon: Euro }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold flex items-center space-x-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-white border-b-4 border-blue-600 text-blue-900'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'projets' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-blue-900">Projet 1 - 500 kWc (GELY 1 & 2)</h3>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                En cours
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1 font-medium">Puissance</p>
                <p className="text-2xl font-bold text-blue-900">500 kWc</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <p className="text-xs text-gray-600 mb-1 font-medium">Tarif EDF</p>
                <p className="text-2xl font-bold text-yellow-700">13,70 c€/kWh</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1 font-medium">Revenu/an</p>
                <p className="text-2xl font-bold text-blue-900">76 720 €</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <p className="text-xs text-gray-600 mb-1 font-medium">Budget</p>
                <p className="text-2xl font-bold text-yellow-700">346 600 €</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-blue-900">Projet 2 - 100 kWc</h3>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                En développement
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1 font-medium">Puissance</p>
                <p className="text-2xl font-bold text-blue-900">99,88 kWc</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <p className="text-xs text-gray-600 mb-1 font-medium">Tarif EDF</p>
                <p className="text-2xl font-bold text-yellow-700">11,26 c€/kWh</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1 font-medium">Revenu/an</p>
                <p className="text-2xl font-bold text-blue-900">12 611 €</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <p className="text-xs text-gray-600 mb-1 font-medium">Statut</p>
                <p className="text-lg font-bold text-yellow-700">Devis en cours</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'finances' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-blue-600">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
            <h3 className="text-2xl font-bold text-blue-900">Factures Projet 500 kWc</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fournisseur</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">HT</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">TTC</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {FACTURES.map((f, i) => (
                  <tr key={i} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{f.date}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-900">{f.fournisseur}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{f.description}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">{f.ht}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">{f.ttc}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        f.statut === 'Payé' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {f.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
