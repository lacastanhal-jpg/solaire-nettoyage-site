'use client'

import { useState } from 'react'
import { Building2, FileText, Euro, MapPin, Calendar, Users } from 'lucide-react'

const SCI_GELY_DATA = {
  informations: {
    raisonSociale: "SCI GELY",
    forme: "SCI (Société Civile Immobilière)",
    capital: "1 000 €",
    rcs: "984 994 749 RCS Rodez",
    siege: "511 Impasse de Saint Rames, 12220 Vaureilles",
    gerant: "GELY INVESTISSEMENT HOLDING (représentée par Jérôme GELY)",
    dateCreation: "2025"
  },
  actionnariat: [
    { nom: "GELY INVESTISSEMENT HOLDING", parts: "998", pourcentage: "99,8%" },
    { nom: "Jérôme GELY", parts: "1", pourcentage: "0,1%" },
    { nom: "Axel GELY", parts: "1", pourcentage: "0,1%" }
  ],
  projetBatiment: {
    nom: "Bâtiment photovoltaïque Vaureilles",
    localisation: "Saint Rame, 12220 Vaureilles",
    surface: "2 496 m²",
    type: "Structure métallique",
    permis: "PC 012290 20 G0003",
    usage: [
      "Support installation photovoltaïque LEXA 2 (500 kWc)",
      "Atelier et stockage SOLAIRE NETTOYAGE (location)"
    ],
    budgetTotal: "280 009 € HT (336 011 € TTC)",
    paye: "37 439 € HT (44 927 € TTC)",
    reste: "242 570 € HT (291 084 € TTC)"
  },
  depenses: [
    { date: "20/01/2020", poste: "Études permis construction", fournisseur: "1+1 Architecture", ht: "1 540 €", ttc: "1 848 €", statut: "Payé" },
    { date: "Oct 2025", poste: "Fondations", fournisseur: "CAB", ht: "35 899 €", ttc: "43 079 €", statut: "Payé" },
    { date: "À venir", poste: "Structure métallique", fournisseur: "SCMR", ht: "242 570 €", ttc: "291 084 €", statut: "Devis signé" }
  ]
}

export default function PageSciGely() {
  const [activeTab, setActiveTab] = useState('projet')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-400 p-3 rounded-xl">
              <Building2 className="w-12 h-12 text-blue-900" />
            </div>
            <div>
              <h2 className="text-4xl font-bold">SCI GELY</h2>
              <p className="text-blue-100 text-lg">Société Civile Immobilière</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm">Gérant</p>
            <p className="text-xl font-bold">Jérôme GELY</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-yellow-400">
        <div className="flex space-x-1">
          {[
            { id: 'projet', label: 'Projet Bâtiment', icon: Building2 },
            { id: 'infos', label: 'Informations', icon: FileText },
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

      {/* Contenu Projet Bâtiment */}
      {activeTab === 'projet' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">{SCI_GELY_DATA.projetBatiment.nom}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1 font-medium">Surface</p>
                <p className="text-2xl font-bold text-blue-900">{SCI_GELY_DATA.projetBatiment.surface}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <p className="text-xs text-gray-600 mb-1 font-medium">Type</p>
                <p className="text-xl font-bold text-yellow-700">{SCI_GELY_DATA.projetBatiment.type}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1 font-medium">Permis</p>
                <p className="text-sm font-bold text-blue-900">{SCI_GELY_DATA.projetBatiment.permis}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Localisation
              </h4>
              <p className="text-gray-700">{SCI_GELY_DATA.projetBatiment.localisation}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-gray-900 mb-2">Utilisation prévue</h4>
              <ul className="space-y-2">
                {SCI_GELY_DATA.projetBatiment.usage.map((usage, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-700">{usage}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <p className="text-xs text-gray-600 mb-1">Payé</p>
                <p className="text-lg font-bold text-green-700">{SCI_GELY_DATA.projetBatiment.paye}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <p className="text-xs text-gray-600 mb-1">Reste à payer</p>
                <p className="text-lg font-bold text-yellow-700">{SCI_GELY_DATA.projetBatiment.reste}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Budget total</p>
                <p className="text-lg font-bold text-blue-900">{SCI_GELY_DATA.projetBatiment.budgetTotal}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu Informations */}
      {activeTab === 'infos' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Informations légales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Raison sociale</p>
                <p className="font-bold text-gray-900">{SCI_GELY_DATA.informations.raisonSociale}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Forme juridique</p>
                <p className="font-bold text-gray-900">{SCI_GELY_DATA.informations.forme}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Capital social</p>
                <p className="font-bold text-gray-900">{SCI_GELY_DATA.informations.capital}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">RCS</p>
                <p className="font-bold text-gray-900">{SCI_GELY_DATA.informations.rcs}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Siège social</p>
                <p className="font-bold text-gray-900">{SCI_GELY_DATA.informations.siege}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Gérant</p>
                <p className="font-bold text-gray-900">{SCI_GELY_DATA.informations.gerant}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-400">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Actionnariat
            </h3>
            <div className="space-y-3">
              {SCI_GELY_DATA.actionnariat.map((act, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                  <span className="font-semibold text-gray-900">{act.nom}</span>
                  <div className="text-right">
                    <span className="font-bold text-blue-900">{act.pourcentage}</span>
                    <span className="text-sm text-gray-600 ml-2">({act.parts} parts)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contenu Finances */}
      {activeTab === 'finances' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-blue-600">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
            <h3 className="text-2xl font-bold text-blue-900">Dépenses Projet Bâtiment</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Poste</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Fournisseur</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">HT</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">TTC</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {SCI_GELY_DATA.depenses.map((dep, i) => (
                  <tr key={i} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{dep.date}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-900">{dep.poste}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{dep.fournisseur}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">{dep.ht}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">{dep.ttc}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        dep.statut === 'Payé' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {dep.statut}
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
