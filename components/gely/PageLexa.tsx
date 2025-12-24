'use client'

import { useState } from 'react'
import { Zap, FileText, Euro, TrendingUp, Leaf, Calendar } from 'lucide-react'

const LEXA_DATA = {
  informations: {
    raisonSociale: "LEXA",
    forme: "SAS (Société par Actions Simplifiée)",
    capital: "1 000 €",
    rcs: "515 232 049 RCS Rodez",
    siege: "Saint Rames, 12220 Vaureilles",
    president: "Jérôme GELY",
    creation: "29/09/2009 (SARL transformée en SAS le 01/03/2016)",
    detention: "100% GELY INVESTISSEMENT HOLDING (depuis 08/01/2025)"
  },
  installation: {
    puissance: "150 kWc",
    localisation: "Saint Rames, 12220 Vaureilles",
    miseEnService: "2009",
    contratEDF: "Jusqu'en 2031",
    productionAnnuelle: "~170 000 kWh",
    co2Economise: "~14,5 tonnes/an"
  },
  finances: {
    ca2024: "142 363 € HT",
    resultatNet2024: "79 156 € HT",
    margeNette: "55,6%",
    emprunts: "Soldés fin 2025",
    tresorerie: "Disponible"
  },
  performance: [
    { annee: "2024", production: "170 000 kWh", ca: "142 363 €", resultat: "79 156 €" },
    { annee: "2023", production: "~170 000 kWh", ca: "~140 000 €", resultat: "~75 000 €" },
    { annee: "2022", production: "~170 000 kWh", ca: "~138 000 €", resultat: "~72 000 €" }
  ]
}

export default function PageLexa() {
  const [activeTab, setActiveTab] = useState('installation')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-900 p-3 rounded-xl">
              <Zap className="w-12 h-12 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-4xl font-bold">LEXA</h2>
              <p className="text-yellow-100 text-lg">Production photovoltaïque depuis 2009</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-yellow-200 text-sm">Président</p>
            <p className="text-xl font-bold">Jérôme GELY</p>
          </div>
        </div>
      </div>

      {/* KPIs rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
          <p className="text-sm text-gray-900 mb-1">Puissance</p>
          <p className="text-3xl font-bold text-yellow-600">{LEXA_DATA.installation.puissance}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600">
          <p className="text-sm text-gray-900 mb-1">CA 2024</p>
          <p className="text-3xl font-bold text-blue-900">{LEXA_DATA.finances.ca2024}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
          <p className="text-sm text-gray-900 mb-1">Marge nette</p>
          <p className="text-3xl font-bold text-green-600">{LEXA_DATA.finances.margeNette}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-600">
          <p className="text-sm text-gray-900 mb-1">CO₂ économisé/an</p>
          <p className="text-3xl font-bold text-green-700">{LEXA_DATA.installation.co2Economise}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-yellow-400">
        <div className="flex space-x-1">
          {[
            { id: 'installation', label: 'Installation', icon: Zap },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'infos', label: 'Informations', icon: FileText },
            { id: 'co2', label: 'Impact CO₂', icon: Leaf }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold flex items-center space-x-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-white border-b-4 border-yellow-500 text-yellow-700'
                    : 'text-gray-900 hover:bg-yellow-50 hover:text-yellow-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Contenu Installation */}
      {activeTab === 'installation' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Installation photovoltaïque</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <p className="text-xs text-gray-900 mb-1 font-medium">Puissance installée</p>
                <p className="text-2xl font-bold text-yellow-700">{LEXA_DATA.installation.puissance}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-400">
                <p className="text-xs text-gray-900 mb-1 font-medium">Production annuelle</p>
                <p className="text-xl font-bold text-blue-900">{LEXA_DATA.installation.productionAnnuelle}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <p className="text-xs text-gray-900 mb-1 font-medium">CO₂ évité/an</p>
                <p className="text-xl font-bold text-green-700">{LEXA_DATA.installation.co2Economise}</p>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <h4 className="font-bold text-gray-900 mb-2">Localisation</h4>
              <p className="text-gray-700">{LEXA_DATA.installation.localisation}</p>
            </div>

            <div className="bg-blue-100 rounded-lg p-4 mb-4">
              <h4 className="font-bold text-blue-900 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Contrat EDF Obligation d'Achat
              </h4>
              <p className="text-blue-800">Actif jusqu'en <strong>2031</strong></p>
              <p className="text-sm text-blue-600 mt-1">Revenus garantis sur 20 ans</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-bold text-green-900 mb-2">Statut emprunts</h4>
              <p className="text-green-800">✅ Emprunts soldés fin 2025</p>
              <p className="text-sm text-green-600 mt-1">Capacité d'autofinancement : ~113 000 €/an disponible dès 2026</p>
            </div>
          </div>
        </div>
      )}

      {/* Contenu Performance */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Performance financière</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <p className="text-sm text-gray-900 mb-1">Chiffre d'affaires 2024</p>
                <p className="text-3xl font-bold text-blue-900">{LEXA_DATA.finances.ca2024}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <p className="text-sm text-gray-900 mb-1">Résultat net 2024</p>
                <p className="text-3xl font-bold text-green-700">{LEXA_DATA.finances.resultatNet2024}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
                <p className="text-sm text-gray-900 mb-1">Marge nette</p>
                <p className="text-3xl font-bold text-yellow-700">{LEXA_DATA.finances.margeNette}</p>
              </div>
            </div>

            <h4 className="text-xl font-bold text-blue-900 mb-4">Historique</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Année</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Production</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">CA</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Résultat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {LEXA_DATA.performance.map((perf, i) => (
                    <tr key={i} className="hover:bg-yellow-50">
                      <td className="px-6 py-4 font-bold text-gray-900">{perf.annee}</td>
                      <td className="px-6 py-4 text-right text-gray-900">{perf.production}</td>
                      <td className="px-6 py-4 text-right font-semibold text-blue-900">{perf.ca}</td>
                      <td className="px-6 py-4 text-right font-semibold text-green-700">{perf.resultat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Contenu Informations */}
      {activeTab === 'infos' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
          <h3 className="text-2xl font-bold text-blue-900 mb-6">Informations légales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-900 mb-1">Raison sociale</p>
              <p className="font-bold text-gray-900">{LEXA_DATA.informations.raisonSociale}</p>
            </div>
            <div>
              <p className="text-sm text-gray-900 mb-1">Forme juridique</p>
              <p className="font-bold text-gray-900">{LEXA_DATA.informations.forme}</p>
            </div>
            <div>
              <p className="text-sm text-gray-900 mb-1">Capital social</p>
              <p className="font-bold text-gray-900">{LEXA_DATA.informations.capital}</p>
            </div>
            <div>
              <p className="text-sm text-gray-900 mb-1">RCS</p>
              <p className="font-bold text-gray-900">{LEXA_DATA.informations.rcs}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-900 mb-1">Siège social</p>
              <p className="font-bold text-gray-900">{LEXA_DATA.informations.siege}</p>
            </div>
            <div>
              <p className="text-sm text-gray-900 mb-1">Président</p>
              <p className="font-bold text-gray-900">{LEXA_DATA.informations.president}</p>
            </div>
            <div>
              <p className="text-sm text-gray-900 mb-1">Création</p>
              <p className="font-bold text-gray-900">{LEXA_DATA.informations.creation}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-900 mb-1">Détention</p>
              <p className="font-bold text-gray-900">{LEXA_DATA.informations.detention}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contenu CO2 */}
      {activeTab === 'co2' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-4 mb-4">
              <Leaf className="w-12 h-12" />
              <div>
                <h3 className="text-3xl font-bold">Impact Environnemental</h3>
                <p className="text-green-100">Contribution à la transition énergétique</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <h4 className="text-2xl font-bold text-green-900 mb-6">CO₂ évité depuis 2009</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-200">
                <p className="text-sm text-gray-900 mb-2">CO₂ évité par an</p>
                <p className="text-4xl font-bold text-green-700 mb-2">14,5 tonnes</p>
                <p className="text-xs text-gray-800">Calcul basé sur 85 g CO₂/kWh (mix énergétique français)</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-200">
                <p className="text-sm text-gray-900 mb-2">CO₂ total évité (2009-2024)</p>
                <p className="text-4xl font-bold text-green-700 mb-2">~218 tonnes</p>
                <p className="text-xs text-gray-800">15 ans de production propre</p>
              </div>
            </div>

            <div className="bg-blue-100 rounded-lg p-6">
              <h5 className="font-bold text-blue-900 mb-4">Équivalences :</h5>
              <div className="space-y-3 text-gray-700">
                <p>🌳 <strong>218 tonnes de CO₂</strong> = Absorption annuelle de <strong>~1 800 arbres</strong></p>
                <p>🚗 <strong>14,5 tonnes/an</strong> = <strong>~65 000 km</strong> en voiture essence par an</p>
                <p>⚡ <strong>170 000 kWh/an</strong> = Consommation de <strong>~50 foyers français</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
