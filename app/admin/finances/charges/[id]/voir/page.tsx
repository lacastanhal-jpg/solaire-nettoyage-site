'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  getChargeFixeById,
  deleteChargeFixe,
  toggleChargeFixeActif,
  type ChargeFixe
} from '@/lib/firebase/charges-fixes'
import { ArrowLeft, Edit, Trash2, Eye, EyeOff, Calendar, DollarSign, User, Building2, CreditCard } from 'lucide-react'

export default function VoirChargePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [charge, setCharge] = useState<ChargeFixe | null>(null)

  useEffect(() => {
    if (params.id) {
      loadCharge()
    }
  }, [params.id])

  async function loadCharge() {
    try {
      setLoading(true)
      const data = await getChargeFixeById(params.id as string)
      if (!data) {
        alert('❌ Charge introuvable')
        router.push('/admin/finances/charges')
        return
      }
      setCharge(data)
    } catch (error) {
      console.error('Erreur chargement charge:', error)
      alert('❌ Erreur lors du chargement')
      router.push('/admin/finances/charges')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActif() {
    if (!charge) return
    
    if (!confirm(`${charge.actif ? 'Désactiver' : 'Activer'} cette charge ?`)) {
      return
    }

    try {
      await toggleChargeFixeActif(charge.id, !charge.actif)
      await loadCharge()
    } catch (error) {
      console.error('Erreur toggle actif:', error)
      alert('❌ Erreur lors du changement de statut')
    }
  }

  async function handleDelete() {
    if (!charge) return
    
    if (!confirm(`Supprimer définitivement la charge "${charge.nom}" ?\n\nCette action est irréversible.`)) {
      return
    }

    try {
      await deleteChargeFixe(charge.id)
      alert('✅ Charge supprimée')
      router.push('/admin/finances/charges')
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('❌ Erreur lors de la suppression')
    }
  }

  function getTypeLabel(type: ChargeFixe['type']): string {
    const labels: Record<ChargeFixe['type'], string> = {
      salaire: '💰 Salaire',
      loyer: '🏠 Loyer',
      assurance: '🛡️ Assurance',
      abonnement: '📱 Abonnement',
      location_vehicule: '🚗 Location Véhicule',
      credit: '🏦 Crédit',
      autre: '📋 Autre'
    }
    return labels[type] || type
  }

  function getRecurrenceLabel(recurrence: ChargeFixe['recurrence']): string {
    const labels: Record<ChargeFixe['recurrence'], string> = {
      mensuel: 'Mensuel',
      trimestriel: 'Trimestriel',
      annuel: 'Annuel'
    }
    return labels[recurrence]
  }

  function calculateMontantMensuel(charge: ChargeFixe): number {
    switch (charge.recurrence) {
      case 'mensuel':
        return charge.montant
      case 'trimestriel':
        return charge.montant / 3
      case 'annuel':
        return charge.montant / 12
      default:
        return charge.montant
    }
  }

  function calculateMontantAnnuel(charge: ChargeFixe): number {
    switch (charge.recurrence) {
      case 'mensuel':
        return charge.montant * 12
      case 'trimestriel':
        return charge.montant * 4
      case 'annuel':
        return charge.montant
      default:
        return charge.montant * 12
    }
  }

  function getProchaineEcheance(charge: ChargeFixe): string {
    if (!charge.actif) return 'Charge inactive'
    
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    let nextDate: Date
    
    switch (charge.recurrence) {
      case 'mensuel':
        const jourPrelevement = charge.jourPrelevement || 1
        nextDate = new Date(currentYear, currentMonth, jourPrelevement)
        if (nextDate < today) {
          nextDate = new Date(currentYear, currentMonth + 1, jourPrelevement)
        }
        break
      
      case 'trimestriel':
        const moisTrimestre = [0, 3, 6, 9]
        let nextTrimestre = moisTrimestre.find(m => m > currentMonth)
        if (nextTrimestre === undefined) {
          nextDate = new Date(currentYear + 1, 0, charge.jourPrelevement || 1)
        } else {
          nextDate = new Date(currentYear, nextTrimestre, charge.jourPrelevement || 1)
        }
        break
      
      case 'annuel':
        const dateDebut = new Date(charge.dateDebut)
        const moisAnnuel = dateDebut.getMonth()
        const jourAnnuel = charge.jourPrelevement || dateDebut.getDate()
        nextDate = new Date(currentYear, moisAnnuel, jourAnnuel)
        if (nextDate < today) {
          nextDate = new Date(currentYear + 1, moisAnnuel, jourAnnuel)
        }
        break
      
      default:
        return 'N/A'
    }
    
    return nextDate.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!charge) {
    return null
  }

  const montantMensuel = calculateMontantMensuel(charge)
  const montantAnnuel = calculateMontantAnnuel(charge)
  const prochaineEcheance = getProchaineEcheance(charge)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{charge.nom}</h1>
            <p className="text-gray-600 mt-1">{getTypeLabel(charge.type)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                charge.actif
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {charge.actif ? '✓ Active' : '✗ Inactive'}
            </span>
          </div>
        </div>

        {/* Boutons actions */}
        <div className="flex gap-3">
          <Link
            href="/admin/finances/charges"
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
          <Link
            href={`/admin/finances/charges/${charge.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
          <button
            onClick={handleToggleActif}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              charge.actif
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {charge.actif ? (
              <>
                <EyeOff className="w-4 h-4" />
                Désactiver
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Activer
              </>
            )}
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Montant Mensuel</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {montantMensuel.toFixed(2)} €
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Par mois
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Montant Annuel</span>
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {montantAnnuel.toFixed(2)} €
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Par an
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Prochaine Échéance</span>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-sm font-medium text-purple-600">
            {prochaineEcheance}
          </div>
        </div>
      </div>

      {/* Informations détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Détails charge */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails de la charge</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="text-sm text-gray-900 mt-1">{getTypeLabel(charge.type)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Montant</dt>
              <dd className="text-sm text-gray-900 mt-1 font-semibold">
                {charge.montant.toFixed(2)} € ({getRecurrenceLabel(charge.recurrence)})
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Récurrence</dt>
              <dd className="text-sm text-gray-900 mt-1">{getRecurrenceLabel(charge.recurrence)}</dd>
            </div>
            {charge.jourPrelevement && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Jour de prélèvement</dt>
                <dd className="text-sm text-gray-900 mt-1">Le {charge.jourPrelevement} du mois</dd>
              </div>
            )}
            {charge.categorie && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Catégorie comptable</dt>
                <dd className="text-sm text-gray-900 mt-1">{charge.categorie}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Bénéficiaire */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bénéficiaire</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nom</dt>
              <dd className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                {charge.beneficiaire}
              </dd>
            </div>
            {charge.siret && (
              <div>
                <dt className="text-sm font-medium text-gray-500">SIRET</dt>
                <dd className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  {charge.siret}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Période */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Période</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Date de début</dt>
              <dd className="text-sm text-gray-900 mt-1">
                {new Date(charge.dateDebut).toLocaleDateString('fr-FR')}
              </dd>
            </div>
            {charge.dateFin && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Date de fin</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {new Date(charge.dateFin).toLocaleDateString('fr-FR')}
                </dd>
              </div>
            )}
            {!charge.dateFin && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Durée</dt>
                <dd className="text-sm text-gray-900 mt-1">Indéterminée</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Notes */}
        {charge.notes && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{charge.notes}</p>
          </div>
        )}
      </div>

      {/* Métadonnées */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Créée le:</span>
            <span className="ml-2 text-gray-900">
              {new Date(charge.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Modifiée le:</span>
            <span className="ml-2 text-gray-900">
              {new Date(charge.updatedAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
