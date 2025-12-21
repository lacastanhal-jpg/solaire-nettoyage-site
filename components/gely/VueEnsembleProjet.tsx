'use client'

import { Building2, Zap, FileText, Users, AlertCircle, Calendar, TrendingUp } from 'lucide-react'
import { Projet } from '@/lib/gely/types'

interface VueEnsembleProjetProps {
  projet: Projet
}

export default function VueEnsembleProjet({ projet }: VueEnsembleProjetProps) {
  const formatNumber = (num: number) => num.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR')

  // Calculer ROI si données PV
  const roi = projet.revenusAnnuels ? (projet.budgetTotal / projet.revenusAnnuels).toFixed(1) : null

  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <div className="bg-white border-4 border-blue-600 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
          <Building2 className="w-6 h-6 mr-2" />
          INFORMATIONS GÉNÉRALES
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-bold text-black">Nom du projet</p>
            <p className="text-xl font-bold text-black">{projet.nom}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-black">Responsable</p>
            <p className="text-xl font-bold text-black">{projet.responsable}</p>
          </div>
          {projet.adresse && (
            <div className="col-span-2">
              <p className="text-sm font-bold text-black">Adresse</p>
              <p className="text-lg font-bold text-black">{projet.adresse}</p>
            </div>
          )}
          <div className="col-span-2">
            <p className="text-sm font-bold text-black">Description</p>
            <p className="text-lg text-black">{projet.description}</p>
          </div>
        </div>
      </div>

      {/* Données techniques PV */}
      {projet.puissanceKWc && (
        <div className="bg-yellow-100 border-4 border-yellow-500 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
            <Zap className="w-6 h-6 mr-2" />
            DONNÉES TECHNIQUES PHOTOVOLTAÏQUE
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border-2 border-yellow-500">
              <p className="text-sm font-bold text-black">Puissance installée</p>
              <p className="text-3xl font-bold text-yellow-700">{projet.puissanceKWc} kWc</p>
            </div>
            {projet.productionAnnuelleKWh && (
              <div className="bg-white p-4 rounded-lg border-2 border-yellow-500">
                <p className="text-sm font-bold text-black">Production estimée</p>
                <p className="text-3xl font-bold text-green-700">{formatNumber(projet.productionAnnuelleKWh)} kWh/an</p>
              </div>
            )}
            {projet.revenusAnnuels && (
              <div className="bg-white p-4 rounded-lg border-2 border-yellow-500">
                <p className="text-sm font-bold text-black">Revenus annuels</p>
                <p className="text-3xl font-bold text-green-700">{formatNumber(projet.revenusAnnuels)} €/an</p>
              </div>
            )}
            {roi && (
              <div className="bg-white p-4 rounded-lg border-2 border-yellow-500">
                <p className="text-sm font-bold text-black">ROI estimé</p>
                <p className="text-3xl font-bold text-blue-700">{roi} ans</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Données immobilier */}
      {projet.surfaceM2 && (
        <div className="bg-green-100 border-4 border-green-500 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
            <Building2 className="w-6 h-6 mr-2" />
            DONNÉES IMMOBILIER
          </h3>
          <div className="bg-white p-4 rounded-lg border-2 border-green-500">
            <p className="text-sm font-bold text-black">Surface totale</p>
            <p className="text-3xl font-bold text-green-700">{formatNumber(projet.surfaceM2)} m²</p>
          </div>
        </div>
      )}

      {/* Contrats EDF OA */}
      {projet.contratsEDF && projet.contratsEDF.length > 0 && (
        <div className="bg-blue-100 border-4 border-blue-600 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            CONTRATS EDF OBLIGATION D'ACHAT
          </h3>
          <div className="space-y-3">
            {projet.contratsEDF.map((contrat, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border-2 border-blue-600">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-bold text-black">N° Contrat</p>
                    <p className="text-lg font-bold text-blue-700">{contrat.numero}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-black">Tarif</p>
                    <p className="text-lg font-bold text-green-700">{contrat.tarif} c€/kWh</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-black">Durée</p>
                    <p className="text-lg font-bold text-black">{contrat.duree} ans</p>
                  </div>
                  {contrat.dateDebut && (
                    <div>
                      <p className="text-xs font-bold text-black">Début</p>
                      <p className="text-lg font-bold text-black">{formatDate(contrat.dateDebut)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Autorisations */}
      {projet.autorisations && projet.autorisations.length > 0 && (
        <div className="bg-purple-100 border-4 border-purple-600 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            AUTORISATIONS ADMINISTRATIVES
          </h3>
          <div className="space-y-3">
            {projet.autorisations.map((auth, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border-2 border-purple-600">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-3 py-1 bg-purple-600 text-white font-bold rounded-lg text-sm">
                        {auth.type}
                      </span>
                      <span className="text-lg font-bold text-black">{auth.numero}</span>
                    </div>
                    {auth.notes && (
                      <p className="text-sm text-black mt-2">{auth.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {auth.dateDepot && (
                      <p className="text-xs text-black"><span className="font-bold">Dépôt:</span> {formatDate(auth.dateDepot)}</p>
                    )}
                    {auth.dateObtention && (
                      <p className="text-xs text-black"><span className="font-bold">Obtention:</span> {formatDate(auth.dateObtention)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partenaires */}
      {projet.partenaires && projet.partenaires.length > 0 && (
        <div className="bg-gray-100 border-4 border-gray-600 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2" />
            PARTENAIRES CLÉS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projet.partenaires.map((part, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border-2 border-gray-600">
                <p className="text-lg font-bold text-black">{part.nom}</p>
                <p className="text-sm font-semibold text-blue-700">{part.role}</p>
                {part.contact && (
                  <p className="text-sm text-black mt-2">👤 {part.contact}</p>
                )}
                {part.telephone && (
                  <p className="text-sm text-black">📞 {part.telephone}</p>
                )}
                {part.email && (
                  <p className="text-sm text-black">✉️ {part.email}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Échéances critiques */}
      {projet.echeancesCritiques && projet.echeancesCritiques.length > 0 && (
        <div className="bg-red-100 border-4 border-red-600 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
            <AlertCircle className="w-6 h-6 mr-2" />
            ❗ ÉCHÉANCES CRITIQUES
          </h3>
          <div className="space-y-3">
            {projet.echeancesCritiques.map((ech) => {
              const isUrgent = new Date(ech.date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              return (
                <div 
                  key={ech.id} 
                  className={`p-4 rounded-lg border-2 ${
                    isUrgent ? 'bg-red-200 border-red-700' : 'bg-white border-red-600'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-5 h-5 text-red-700" />
                        <span className="text-lg font-bold text-black">{formatDate(ech.date)}</span>
                        {isUrgent && (
                          <span className="px-2 py-1 bg-red-700 text-white font-bold rounded text-xs animate-pulse">
                            URGENT !
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-black">{ech.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-700">{formatNumber(ech.montant)} €</p>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        ech.statut === 'payee' ? 'bg-green-200 text-green-800' :
                        ech.statut === 'retard' ? 'bg-red-700 text-white' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {ech.statut === 'payee' ? '✅ Payée' : ech.statut === 'retard' ? '⚠️ Retard' : '⏳ À venir'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Calendrier projet */}
      <div className="bg-white border-4 border-black rounded-lg p-6">
        <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
          <Calendar className="w-6 h-6 mr-2" />
          CALENDRIER PROJET
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-bold text-black">Démarrage</p>
            <p className="text-xl font-bold text-green-700">{formatDate(projet.dateDebut)}</p>
          </div>
          {projet.dateFin && (
            <div>
              <p className="text-sm font-bold text-black">Fin</p>
              <p className="text-xl font-bold text-blue-700">{formatDate(projet.dateFin)}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-black">Dernière mise à jour</p>
            <p className="text-lg font-bold text-black">{formatDate(projet.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
