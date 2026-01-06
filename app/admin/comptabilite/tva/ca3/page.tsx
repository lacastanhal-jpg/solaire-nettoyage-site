'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  calculerTVAPeriode,
  type CalculTVA
} from '@/lib/firebase/tva-calculs'
import { 
  FileText, 
  Calendar,
  ChevronLeft,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function DeclarationCA3Page() {
  const [loading, setLoading] = useState(true)
  const [calculTVA, setCalculTVA] = useState<CalculTVA | null>(null)
  
  // Période sélectionnée
  const [periode, setPeriode] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const societeId = 'solaire-nettoyage' // TODO: Dynamique selon multi-sociétés

  useEffect(() => {
    loadDonneesCA3()
  }, [periode])

  async function loadDonneesCA3() {
    try {
      setLoading(true)
      
      // Calculer début et fin du mois
      const [year, month] = periode.split('-')
      const dateDebut = `${year}-${month}-01`
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
      const dateFin = `${year}-${month}-${String(lastDay).padStart(2, '0')}`
      
      // Charger calcul TVA période
      const calculData = await calculerTVAPeriode(dateDebut, dateFin, societeId)
      setCalculTVA(calculData)
      
    } catch (error) {
      console.error('Erreur chargement données CA3:', error)
    } finally {
      setLoading(false)
    }
  }

  async function exporterPDF() {
    try {
      const response = await fetch('/api/comptabilite/ca3/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          periode,
          societeId
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF')
      }

      // Télécharger le PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CA3-${periode}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Erreur export PDF:', error)
      alert('❌ Erreur lors de la génération du PDF CA3')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des données CA3...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/admin/comptabilite/tva"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour TVA
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-600" />
                Déclaration CA3
              </h1>
              <p className="text-gray-600 mt-2">
                Déclaration mensuelle de TVA - Régime réel normal
              </p>
            </div>
            
            <button
              onClick={exporterPDF}
              disabled={!calculTVA}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-5 h-5" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Sélection période */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Période de déclaration :
            </label>
            <input
              type="month"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-900">
              {new Date(periode + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {calculTVA && (
          <>
            {/* Info entreprise */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Informations Entreprise</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Raison sociale :</p>
                  <p className="font-medium text-gray-900">SOLAIRE NETTOYAGE</p>
                </div>
                <div>
                  <p className="text-gray-600">SIREN :</p>
                  <p className="font-medium text-gray-900">123 456 789</p>
                </div>
                <div>
                  <p className="text-gray-600">Adresse :</p>
                  <p className="font-medium text-gray-900">Toulouse, France</p>
                </div>
                <div>
                  <p className="text-gray-600">Régime TVA :</p>
                  <p className="font-medium text-gray-900">Réel Normal</p>
                </div>
              </div>
            </div>

            {/* Formulaire CA3 */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Formulaire CA3 - Données Calculées</h2>
              
              <div className="space-y-6">
                {/* SECTION 1 : OPÉRATIONS IMPOSABLES */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    A - OPÉRATIONS IMPOSABLES
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-700">01 - Ventes, prestations de services (20%)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {calculTVA.caHT.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-700">02 - TVA brute au taux normal (20%)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          {calculTVA.tvaCollectee20.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-700">03 - TVA brute au taux réduit (10%)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          {calculTVA.tvaCollectee10.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-700">04 - TVA brute au taux réduit (5,5%)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          {calculTVA.tvaCollectee55.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 p-3 bg-green-100 rounded border-l-4 border-green-600">
                      <div className="col-span-2">
                        <p className="text-sm font-bold text-gray-900">08 - TOTAL TVA BRUTE (lignes 02+03+04)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {calculTVA.totalTVACollectee.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2 : TVA DÉDUCTIBLE */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    B - TVA DÉDUCTIBLE
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-700">19 - TVA déductible sur biens et services (20%)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">
                          {calculTVA.tvaDeductible20.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-700">20 - TVA déductible sur immobilisations (10%)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">
                          {calculTVA.tvaDeductible10.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-700">21 - Autres biens et services (5,5%)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">
                          {calculTVA.tvaDeductible55.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 p-3 bg-red-100 rounded border-l-4 border-red-600">
                      <div className="col-span-2">
                        <p className="text-sm font-bold text-gray-900">23 - TOTAL TVA DÉDUCTIBLE</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">
                          {calculTVA.totalTVADeductible.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3 : TVA NETTE DUE */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    C - TVA NETTE DUE
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-700">24 - TVA brute (ligne 08)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {calculTVA.totalTVACollectee.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-700">25 - TVA déductible (ligne 23)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {calculTVA.totalTVADeductible.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                    
                    {calculTVA.soldeTVA >= 0 ? (
                      <div className="grid grid-cols-3 gap-4 p-4 bg-indigo-100 rounded border-l-4 border-indigo-600">
                        <div className="col-span-2">
                          <p className="text-sm font-bold text-gray-900">28 - TVA NETTE À PAYER</p>
                          <p className="text-xs text-gray-600 mt-1">À régler avant le 24 du mois suivant</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-indigo-600">
                            {calculTVA.soldeTVA.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4 p-4 bg-green-100 rounded border-l-4 border-green-600">
                        <div className="col-span-2">
                          <p className="text-sm font-bold text-gray-900">29 - CRÉDIT DE TVA</p>
                          <p className="text-xs text-gray-600 mt-1">Report sur la période suivante</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {Math.abs(calculTVA.soldeTVA).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700 mb-1">TVA Collectée</p>
                <p className="text-2xl font-bold text-green-600">
                  {calculTVA.totalTVACollectee.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-sm text-red-700 mb-1">TVA Déductible</p>
                <p className="text-2xl font-bold text-red-600">
                  {calculTVA.totalTVADeductible.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <div className={`border rounded-lg p-4 text-center ${
                calculTVA.soldeTVA >= 0 
                  ? 'bg-indigo-50 border-indigo-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <p className={`text-sm mb-1 ${
                  calculTVA.soldeTVA >= 0 ? 'text-indigo-700' : 'text-green-700'
                }`}>
                  {calculTVA.soldeTVA >= 0 ? 'À Payer' : 'Crédit'}
                </p>
                <p className={`text-2xl font-bold ${
                  calculTVA.soldeTVA >= 0 ? 'text-indigo-600' : 'text-green-600'
                }`}>
                  {Math.abs(calculTVA.soldeTVA).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
            </div>

            {/* Infos légales */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Déclaration prête
                  </h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Les données sont calculées automatiquement à partir de vos factures clients et fournisseurs.
                    Vérifiez les montants avant de télédéclarer sur impots.gouv.fr.
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Date limite de déclaration : 24 du mois suivant</li>
                    <li>Date limite de paiement : 24 du mois suivant</li>
                    <li>Mode de paiement : Prélèvement ou virement</li>
                    <li>Télédéclaration obligatoire sur impots.gouv.fr</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={exporterPDF}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                Exporter en PDF
              </button>
              <Link
                href="/admin/comptabilite/tva"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Retour Dashboard TVA
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
