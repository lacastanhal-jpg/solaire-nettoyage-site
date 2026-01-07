'use client'

/**
 * PAGE DÉTAIL CONTRAT RÉCURRENT - VERSION PROFESSIONNELLE
 * Vue complète avec historique, factures, statistiques et actions
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getContratById,
  suspendreContrat,
  reactiverContrat,
  resilierContrat
} from '@/lib/firebase/contrats-recurrents'
import type { ContratRecurrent } from '@/lib/types/contrats-recurrents'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Edit,
  Pause,
  Play,
  Ban,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Send,
  Eye
} from 'lucide-react'

interface PageProps {
  params: {
    id: string
  }
}

export default function DetailContratPage({ params }: PageProps) {
  const router = useRouter()
  const [contrat, setContrat] = useState<ContratRecurrent | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionEnCours, setActionEnCours] = useState(false)
  const [ongletActif, setOngletActif] = useState<'details' | 'factures' | 'historique'>('details')

  useEffect(() => {
    chargerContrat()
  }, [params.id])

  async function chargerContrat() {
    try {
      setLoading(true)
      const data = await getContratById(params.id)
      setContrat(data)
    } catch (error) {
      console.error('Erreur chargement contrat:', error)
    } finally {
      setLoading(false)
    }
  }

  async function genererFactureManuelle() {
    if (!confirm('Générer une facture maintenant ?')) return
    
    try {
      setActionEnCours(true)
      
      const response = await fetch(`/api/contrats/${params.id}/generer-facture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genereePar: 'Jerome', // TODO: Auth user
          forcer: true,
          envoyerEmail: true,
          validerAutomatiquement: true
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Facture ${data.data.factureNumero} générée avec succès !`)
        chargerContrat() // Recharger
      } else {
        alert(`Erreur: ${data.error}`)
      }
    } catch (error) {
      console.error('Erreur génération:', error)
      alert('Erreur lors de la génération')
    } finally {
      setActionEnCours(false)
    }
  }

  async function suspendre() {
    const raison = prompt('Raison de la suspension :')
    if (!raison) return
    
    try {
      setActionEnCours(true)
      await suspendreContrat(params.id, raison, 'Jerome') // TODO: Auth
      alert('Contrat suspendu')
      chargerContrat()
    } catch (error) {
      console.error('Erreur suspension:', error)
      alert('Erreur lors de la suspension')
    } finally {
      setActionEnCours(false)
    }
  }

  async function reactiver() {
    if (!confirm('Réactiver ce contrat ?')) return
    
    try {
      setActionEnCours(true)
      await reactiverContrat(params.id, 'Jerome') // TODO: Auth
      alert('Contrat réactivé')
      chargerContrat()
    } catch (error) {
      console.error('Erreur réactivation:', error)
      alert('Erreur lors de la réactivation')
    } finally {
      setActionEnCours(false)
    }
  }

  async function resilier() {
    const raison = prompt('Raison de la résiliation :')
    if (!raison) return
    
    if (!confirm('Confirmer la résiliation définitive ?')) return
    
    try {
      setActionEnCours(true)
      await resilierContrat(params.id, raison, 'Jerome') // TODO: Auth
      alert('Contrat résilié')
      chargerContrat()
    } catch (error) {
      console.error('Erreur résiliation:', error)
      alert('Erreur lors de la résiliation')
    } finally {
      setActionEnCours(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!contrat) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Contrat non trouvé</p>
        </div>
      </div>
    )
  }

  const facturesPayees = contrat.facturesGenerees?.filter(f => f.statut === 'payee').length || 0
  const facturesEnRetard = contrat.facturesGenerees?.filter(f => f.statut === 'en_retard').length || 0
  const tauxPaiement = contrat.facturesGenerees && contrat.facturesGenerees.length > 0
    ? (facturesPayees / contrat.facturesGenerees.length) * 100
    : 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/finances/contrats"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux contrats
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {contrat.numero}
                </h1>
                {getStatutBadge(contrat.statut)}
              </div>
              <h2 className="text-xl text-gray-700 mb-2">
                {contrat.nom}
              </h2>
              <p className="text-gray-600">
                {contrat.clientNom}
                {contrat.groupeNom && ` · ${contrat.groupeNom}`}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {contrat.statut === 'actif' && (
                <>
                  <button
                    onClick={genererFactureManuelle}
                    disabled={actionEnCours}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    <Zap className="w-4 h-4" />
                    Générer facture
                  </button>
                  
                  <button
                    onClick={suspendre}
                    disabled={actionEnCours}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    <Pause className="w-4 h-4" />
                    Suspendre
                  </button>
                  
                  <button
                    onClick={resilier}
                    disabled={actionEnCours}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Ban className="w-4 h-4" />
                    Résilier
                  </button>
                </>
              )}

              {contrat.statut === 'suspendu' && (
                <button
                  onClick={reactiver}
                  disabled={actionEnCours}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Play className="w-4 h-4" />
                  Réactiver
                </button>
              )}

              <Link
                href={`/admin/finances/contrats/${contrat.id}/modifier`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </Link>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Montant par facturation */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Par facturation</div>
                <div className="text-2xl font-bold text-gray-900">
                  {contrat.totalHT.toLocaleString('fr-FR')}€
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {contrat.totalTTC.toLocaleString('fr-FR')}€ TTC
            </div>
          </div>

          {/* CA Annuel */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">CA annuel estimé</div>
                <div className="text-2xl font-bold text-gray-900">
                  {contrat.caAnnuelEstime.toLocaleString('fr-FR')}€
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 capitalize">
              {contrat.frequence}
            </div>
          </div>

          {/* Factures générées */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Factures</div>
                <div className="text-2xl font-bold text-gray-900">
                  {contrat.nombreFacturesGenerees || 0}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {facturesPayees} payées · {facturesEnRetard} en retard
            </div>
          </div>

          {/* Prochaine facturation */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Prochaine</div>
                <div className="text-lg font-bold text-gray-900">
                  {contrat.prochaineDateFacturation.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {Math.ceil((contrat.prochaineDateFacturation.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jours
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setOngletActif('details')}
            className={`px-4 py-3 font-medium transition-colors relative ${
              ongletActif === 'details'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Détails
          </button>
          
          <button
            onClick={() => setOngletActif('factures')}
            className={`px-4 py-3 font-medium transition-colors relative ${
              ongletActif === 'factures'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Factures ({contrat.facturesGenerees?.length || 0})
          </button>
          
          <button
            onClick={() => setOngletActif('historique')}
            className={`px-4 py-3 font-medium transition-colors relative ${
              ongletActif === 'historique'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Historique
          </button>
        </div>

        {/* Contenu onglets */}
        {ongletActif === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations générales */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations générales
              </h3>
              
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600">Client</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {contrat.clientNom}
                  </dd>
                </div>
                
                {contrat.groupeNom && (
                  <div>
                    <dt className="text-sm text-gray-600">Groupe</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {contrat.groupeNom}
                    </dd>
                  </div>
                )}
                
                <div>
                  <dt className="text-sm text-gray-600">Société</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {contrat.societeNom || contrat.societeId}
                    </dd>
                </div>
                
                {contrat.reference && (
                  <div>
                    <dt className="text-sm text-gray-600">Référence</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {contrat.reference}
                    </dd>
                  </div>
                )}
                
                {contrat.description && (
                  <div>
                    <dt className="text-sm text-gray-600">Description</dt>
                    <dd className="text-sm text-gray-700">
                      {contrat.description}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Dates & Récurrence */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dates et récurrence
              </h3>
              
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600">Date début</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {contrat.dateDebut.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </dd>
                </div>
                
                {contrat.dateFin && (
                  <div>
                    <dt className="text-sm text-gray-600">Date fin</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {contrat.dateFin.toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </dd>
                  </div>
                )}
                
                <div>
                  <dt className="text-sm text-gray-600">Fréquence</dt>
                  <dd className="text-sm font-medium text-gray-900 capitalize">
                    {contrat.frequence}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm text-gray-600">Jour de facturation</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    Le {contrat.jourFacturation} de chaque période
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm text-gray-600">Prochaine facturation</dt>
                  <dd className="text-sm font-bold text-blue-600">
                    {contrat.prochaineDateFacturation.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </dd>
                </div>
                
                {contrat.derniereDateFacturation && (
                  <div>
                    <dt className="text-sm text-gray-600">Dernière facturation</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {contrat.derniereDateFacturation.toLocaleDateString('fr-FR')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Conditions paiement */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Conditions de paiement
              </h3>
              
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600">Délai</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {contrat.conditionsPaiement.delaiJours} jours
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm text-gray-600">Mode de paiement</dt>
                  <dd className="text-sm font-medium text-gray-900 capitalize">
                    {contrat.conditionsPaiement.modePaiement}
                  </dd>
                </div>
                
                {contrat.conditionsPaiement.prelevementAuto?.active && (
                  <div>
                    <dt className="text-sm text-gray-600">Prélèvement</dt>
                    <dd className="text-sm font-medium text-green-600">
                      ✓ Actif
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Renouvellement */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Renouvellement
              </h3>
              
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600">Type</dt>
                  <dd className="text-sm font-medium text-gray-900 capitalize">
                    {contrat.renouvellement.type}
                  </dd>
                </div>
                
                {contrat.renouvellement.type === 'tacite' && (
                  <>
                    <div>
                      <dt className="text-sm text-gray-600">Durée renouvellement</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {contrat.renouvellement.dureeRenouvellement} mois
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm text-gray-600">Préavis résiliation</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {contrat.renouvellement.preavisResiliationJours} jours
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>

            {/* Prestations */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Prestations ({contrat.lignes.length})
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Site
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Article
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Qté
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Prix HT
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total HT
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contrat.lignes.map(ligne => (
                      <tr key={ligne.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {ligne.siteNom}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {ligne.articleCode} - {ligne.articleNom}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {ligne.quantite}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {ligne.prixUnitaireHT.toLocaleString('fr-FR')}€
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          {ligne.montantHT.toLocaleString('fr-FR')}€
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">
                        Total HT
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {contrat.totalHT.toLocaleString('fr-FR')}€
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Factures */}
        {ongletActif === 'factures' && (
          <div className="bg-white rounded-lg border border-gray-200">
            {contrat.facturesGenerees && contrat.facturesGenerees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Numéro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Échéance
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Montant HT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Méthode
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contrat.facturesGenerees.map(facture => (
                      <tr key={facture.factureId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {facture.numero}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {facture.date.toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {facture.dateEcheance.toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                          {facture.montantHT.toLocaleString('fr-FR')}€
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatutFactureBadge(facture.statut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {facture.methodeGeneration === 'automatique' ? (
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              Auto
                            </span>
                          ) : (
                            'Manuelle'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Link
                            href={`/admin/finances/factures/${facture.factureId}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Voir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune facture générée</p>
              </div>
            )}
          </div>
        )}

        {/* Onglet Historique */}
        {ongletActif === 'historique' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {contrat.historiqueModifications && contrat.historiqueModifications.length > 0 ? (
              <div className="space-y-4">
                {contrat.historiqueModifications.map((modif, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{modif.action}</span>
                      <span className="text-sm text-gray-600">
                        par {modif.utilisateur}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mb-1">
                      {modif.details}
                    </div>
                    <div className="text-xs text-gray-500">
                      {modif.date.toLocaleString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun historique</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Fonctions utilitaires
function getStatutBadge(statut: string) {
  const configs: Record<string, any> = {
    brouillon: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
    actif: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    suspendu: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Pause },
    expire: { bg: 'bg-gray-100', text: 'text-gray-600', icon: Clock },
    resilie: { bg: 'bg-red-100', text: 'text-red-800', icon: Ban }
  }

  const config = configs[statut] || configs.brouillon
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-4 h-4" />
      {statut.charAt(0).toUpperCase() + statut.slice(1)}
    </span>
  )
}

function getStatutFactureBadge(statut: string) {
  const configs: Record<string, any> = {
    envoyee: { bg: 'bg-blue-100', text: 'text-blue-800' },
    payee: { bg: 'bg-green-100', text: 'text-green-800' },
    en_retard: { bg: 'bg-red-100', text: 'text-red-800' },
    annulee: { bg: 'bg-gray-100', text: 'text-gray-600' }
  }

  const config = configs[statut] || configs.envoyee

  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {statut.replace('_', ' ')}
    </span>
  )
}
