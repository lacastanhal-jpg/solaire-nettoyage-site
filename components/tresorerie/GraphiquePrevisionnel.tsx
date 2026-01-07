'use client'

import { useEffect, useState } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts'
import { 
  genererPrevisionnelTresorerie,
  getStatistiquesPrevisionnel,
  type PrevisionJour,
  type StatistiquesPrevisionnel
} from '@/lib/firebase/tresorerie-previsionnel'
import { AlertCircle, TrendingDown, TrendingUp, Calendar } from 'lucide-react'

export default function GraphiquePrevisionnel() {
  const [loading, setLoading] = useState(true)
  const [previsions, setPrevisions] = useState<PrevisionJour[]>([])
  const [stats, setStats] = useState<StatistiquesPrevisionnel | null>(null)
  const [periodeAffichee, setPeriodeAffichee] = useState<30 | 60 | 90>(90)

  useEffect(() => {
    chargerPrevisions()
  }, [])

  async function chargerPrevisions() {
    try {
      setLoading(true)
      const [previsionsData, statsData] = await Promise.all([
        genererPrevisionnelTresorerie(90),
        getStatistiquesPrevisionnel()
      ])
      setPrevisions(previsionsData)
      setStats(statsData)
    } catch (error) {
      console.error('Erreur chargement prévisions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatterMontant = (value: number) => {
    return value.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  const formatterDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    })
  }

  // Filtrer les prévisions selon la période affichée
  const previsionsAffichees = previsions.slice(0, periodeAffichee)

  // Préparer les données pour le graphique
  const donneesGraphique = previsionsAffichees.map(p => ({
    date: formatterDate(p.date),
    dateComplete: p.date,
    'Solde Prévu': p.soldePrevu,
    'Encaissements': p.encaissementsPrevisionnels,
    'Décaissements': -p.decaissementsPrevisionnels,
    alerte: p.alerte
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Impossible de charger le prévisionnel</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alertes */}
      {stats.alertes.length > 0 && (
        <div className="space-y-2">
          {stats.alertes.map((alerte, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                alerte.type === 'critique'
                  ? 'bg-red-50 border-red-500'
                  : 'bg-yellow-50 border-yellow-500'
              }`}
            >
              <div className="flex items-start">
                <AlertCircle className={`w-5 h-5 mt-0.5 mr-3 ${
                  alerte.type === 'critique' ? 'text-red-600' : 'text-yellow-600'
                }`} />
                <div>
                  <p className={`font-medium ${
                    alerte.type === 'critique' ? 'text-red-900' : 'text-yellow-900'
                  }`}>
                    {alerte.message}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Date prévue : {new Date(alerte.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPIs Prévisions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Solde Actuel */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600 font-medium">Solde Actuel</span>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <div className={`text-xl font-bold ${
            stats.soldeActuel >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatterMontant(stats.soldeActuel)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Aujourd'hui</div>
        </div>

        {/* Solde dans 30j */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600 font-medium">Dans 30 jours</span>
            {stats.soldeDans30Jours >= stats.soldeActuel ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className={`text-xl font-bold ${
            stats.soldeDans30Jours >= 0 ? 'text-gray-900' : 'text-red-600'
          }`}>
            {formatterMontant(stats.soldeDans30Jours)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Prévu</div>
        </div>

        {/* Solde dans 60j */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600 font-medium">Dans 60 jours</span>
            {stats.soldeDans60Jours >= stats.soldeDans30Jours ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className={`text-xl font-bold ${
            stats.soldeDans60Jours >= 0 ? 'text-gray-900' : 'text-red-600'
          }`}>
            {formatterMontant(stats.soldeDans60Jours)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Prévu</div>
        </div>

        {/* Solde dans 90j */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600 font-medium">Dans 90 jours</span>
            {stats.soldeDans90Jours >= stats.soldeDans60Jours ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className={`text-xl font-bold ${
            stats.soldeDans90Jours >= 0 ? 'text-gray-900' : 'text-red-600'
          }`}>
            {formatterMontant(stats.soldeDans90Jours)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Prévu</div>
        </div>
      </div>

      {/* Filtres Période */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Évolution prévisionnelle du solde
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriodeAffichee(30)}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              periodeAffichee === 30
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            30 jours
          </button>
          <button
            onClick={() => setPeriodeAffichee(60)}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              periodeAffichee === 60
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            60 jours
          </button>
          <button
            onClick={() => setPeriodeAffichee(90)}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              periodeAffichee === 90
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            90 jours
          </button>
        </div>
      </div>

      {/* Graphique */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={donneesGraphique}>
            <defs>
              <linearGradient id="colorSolde" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }}
              stroke="#999"
            />
            <YAxis 
              tickFormatter={formatterMontant}
              tick={{ fontSize: 11 }}
              stroke="#999"
            />
            <Tooltip 
              formatter={(value: any) => formatterMontant(Number(value))}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '8px 12px'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            
            {/* Ligne à zéro pour référence */}
            <ReferenceLine 
              y={0} 
              stroke="#ef4444" 
              strokeDasharray="3 3"
              label={{ value: 'Solde 0', position: 'right', fill: '#ef4444', fontSize: 11 }}
            />
            
            {/* Zone remplie sous la courbe */}
            <Area
              type="monotone"
              dataKey="Solde Prévu"
              fill="url(#colorSolde)"
              stroke="none"
            />
            
            {/* Ligne principale solde prévu */}
            <Line 
              type="monotone" 
              dataKey="Solde Prévu" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Légende informative */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Encaissements prévisionnels</p>
              <p className="text-lg font-semibold text-green-600">
                + {formatterMontant(stats.totalEncaissementsPrevisionnels)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.nombreFacturesClientsEnAttente} facture(s) client(s) en attente
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Décaissements prévisionnels</p>
              <p className="text-lg font-semibold text-red-600">
                - {formatterMontant(stats.totalDecaissementsPrevisionnels)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.nombreFacturesFournisseursEnAttente} facture(s) fournisseur(s) en attente
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Variation nette prévue</p>
              <p className={`text-lg font-semibold ${
                (stats.totalEncaissementsPrevisionnels - stats.totalDecaissementsPrevisionnels) >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {formatterMontant(
                  stats.totalEncaissementsPrevisionnels - stats.totalDecaissementsPrevisionnels
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Sur {periodeAffichee} jours
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Note explicative */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>ℹ️ Comment fonctionne le prévisionnel ?</strong>
        </p>
        <p className="text-sm text-blue-800 mt-2">
          Le solde prévu est calculé en partant du solde actuel et en ajoutant les encaissements prévisionnels 
          (factures clients non payées) et en retirant les décaissements prévisionnels (factures fournisseurs non payées).
          Les dates d'échéance sont utilisées pour répartir les montants dans le temps.
        </p>
      </div>

      {/* Détail des encaissements prévisionnels */}
      {stats.nombreFacturesClientsEnAttente > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  💰 Factures Clients à Encaisser
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.nombreFacturesClientsEnAttente} facture(s) en attente • {formatterMontant(stats.totalEncaissementsPrevisionnels)}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facture</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Échéance</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Retard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previsions.flatMap(p => 
                  p.details.facturesClientsAttendues.map((facture, idx) => {
                    const dateEcheance = new Date(facture.dateEcheance)
                    const aujourd_hui = new Date()
                    const joursRetard = Math.floor((aujourd_hui.getTime() - dateEcheance.getTime()) / (1000 * 60 * 60 * 24))
                    const enRetard = joursRetard > 0

                    return (
                      <tr key={`${facture.numero}-${idx}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {facture.clientNom}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {facture.numero}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                          {formatterMontant(facture.montant)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {dateEcheance.toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {enRetard ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {joursRetard}j
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ OK
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                ).slice(0, 20)}
              </tbody>
            </table>
          </div>

          {previsions.flatMap(p => p.details.facturesClientsAttendues).length > 20 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                + {previsions.flatMap(p => p.details.facturesClientsAttendues).length - 20} autres factures...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Détail des décaissements prévisionnels */}
      {stats.nombreFacturesFournisseursEnAttente > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  📤 Factures Fournisseurs à Payer
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.nombreFacturesFournisseursEnAttente} facture(s) en attente • {formatterMontant(stats.totalDecaissementsPrevisionnels)}
                </p>
              </div>
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facture</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Échéance</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Retard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previsions.flatMap(p => 
                  p.details.facturesFournisseursAttendues.map((facture, idx) => {
                    const dateEcheance = new Date(facture.dateEcheance)
                    const aujourd_hui = new Date()
                    const joursRetard = Math.floor((aujourd_hui.getTime() - dateEcheance.getTime()) / (1000 * 60 * 60 * 24))
                    const enRetard = joursRetard > 0

                    return (
                      <tr key={`${facture.numero}-${idx}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {facture.fournisseurNom}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {facture.numero}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">
                          {formatterMontant(facture.montant)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {dateEcheance.toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {enRetard ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {joursRetard}j
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ OK
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                ).slice(0, 20)}
              </tbody>
            </table>
          </div>

          {previsions.flatMap(p => p.details.facturesFournisseursAttendues).length > 20 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                + {previsions.flatMap(p => p.details.facturesFournisseursAttendues).length - 20} autres factures...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Notes de frais à rembourser */}
      {stats.nombreNotesFraisEnAttente > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  🧾 Notes de Frais à Rembourser
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.nombreNotesFraisEnAttente} note(s) en attente de remboursement
                </p>
              </div>
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opérateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remb. Prévu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previsions.flatMap(p => 
                  p.details.notesDeFraisARembouser.map((note, idx) => (
                    <tr key={`${note.operateurNom}-${idx}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {note.operateurNom}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {note.categorie}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-orange-600">
                        {formatterMontant(note.montant)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(note.dateRemboursementPrevue).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))
                ).slice(0, 10)}
              </tbody>
            </table>
          </div>

          {previsions.flatMap(p => p.details.notesDeFraisARembouser).length > 10 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                + {previsions.flatMap(p => p.details.notesDeFraisARembouser).length - 10} autres notes...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Résumé si aucune donnée */}
      {stats.nombreFacturesClientsEnAttente === 0 && 
       stats.nombreFacturesFournisseursEnAttente === 0 && 
       stats.nombreNotesFraisEnAttente === 0 && (
        <div className="bg-green-50 rounded-lg p-8 border border-green-200 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Aucune échéance à venir
          </h3>
          <p className="text-sm text-green-700">
            Toutes les factures sont à jour. Aucun paiement ou encaissement en attente.
          </p>
        </div>
      )}
    </div>
  )
}
