'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getBonCommandeById,
  changerStatutBonCommande,
  deleteBonCommande,
  type BonCommandeFournisseur
} from '@/lib/firebase/bons-commande-fournisseurs'
import {
  Edit,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  User,
  Building2,
  Package,
  DollarSign,
  AlertCircle,
  ArrowLeft,
  Mail,
  Phone
} from 'lucide-react'

export default function DetailBonCommandePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [bon, setBon] = useState<BonCommandeFournisseur | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadBonCommande()
  }, [id])

  async function loadBonCommande() {
    try {
      setLoading(true)
      const data = await getBonCommandeById(id)
      if (!data) {
        alert('❌ Bon de commande introuvable')
        router.push('/admin/stock-flotte/bons-commande')
        return
      }
      setBon(data)
    } catch (error) {
      console.error('Erreur chargement bon de commande:', error)
      alert('❌ Erreur lors du chargement')
      router.push('/admin/stock-flotte/bons-commande')
    } finally {
      setLoading(false)
    }
  }

  async function handleChangerStatut(nouveauStatut: 'brouillon' | 'envoye' | 'recu' | 'annule') {
    if (!bon) return

    const messages = {
      brouillon: 'Remettre en brouillon',
      envoye: 'Marquer comme envoyé',
      recu: 'Marquer comme reçu',
      annule: 'Annuler ce bon de commande'
    }

    if (!confirm(`${messages[nouveauStatut]} ?\n\nBon de commande: ${bon.numero}`)) {
      return
    }

    try {
      setActionLoading(true)
      await changerStatutBonCommande(id, nouveauStatut)
      alert('✅ Statut modifié avec succès !')
      loadBonCommande()
    } catch (error) {
      console.error('Erreur changement statut:', error)
      alert('❌ Erreur lors du changement de statut')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSupprimer() {
    if (!bon) return

    if (!confirm(`⚠️ ATTENTION : Supprimer définitivement le bon de commande ${bon.numero} ?\n\nCette action est irréversible.`)) {
      return
    }

    // Double confirmation
    if (!confirm('Êtes-vous vraiment sûr ? Cette suppression est définitive.')) {
      return
    }

    try {
      setActionLoading(true)
      await deleteBonCommande(id)
      alert('✅ Bon de commande supprimé !')
      router.push('/admin/stock-flotte/bons-commande')
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('❌ Erreur lors de la suppression')
      setActionLoading(false)
    }
  }

  function handleModifier() {
    router.push(`/admin/stock-flotte/bons-commande/${id}/modifier`)
  }

  function getBadgeStatut(statut: string) {
    const configs = {
      brouillon: {
        classe: 'bg-gray-100 text-gray-700 border-gray-300',
        emoji: '📝',
        label: 'Brouillon'
      },
      envoye: {
        classe: 'bg-blue-100 text-blue-700 border-blue-300',
        emoji: '📧',
        label: 'Envoyé'
      },
      recu: {
        classe: 'bg-green-100 text-green-700 border-green-300',
        emoji: '✅',
        label: 'Reçu'
      },
      annule: {
        classe: 'bg-red-100 text-red-700 border-red-300',
        emoji: '❌',
        label: 'Annulé'
      }
    }
    return configs[statut as keyof typeof configs] || configs.brouillon
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Chargement du bon de commande...</p>
        </div>
      </div>
    )
  }

  if (!bon) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-600">Bon de commande introuvable</p>
        </div>
      </div>
    )
  }

  const badge = getBadgeStatut(bon.statut)
  const quantiteTotale = bon.lignes.reduce((sum, l) => sum + l.quantiteDemandee, 0)
  const peutModifier = bon.statut === 'brouillon'
  const peutSupprimer = bon.statut === 'brouillon' || bon.statut === 'annule'

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <Link href="/admin/stock-flotte/bons-commande" className="hover:text-gray-900">Bons de Commande</Link>
          <span>→</span>
          <span className="text-gray-900">{bon.numero}</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{bon.numero}</h1>
              <span className={`px-4 py-2 rounded-full text-lg font-bold border-2 ${badge.classe}`}>
                {badge.emoji} {badge.label}
              </span>
            </div>
            <p className="text-gray-600">
              Créé le {new Date(bon.createdAt).toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <Link
            href="/admin/stock-flotte/bons-commande"
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Link>
        </div>
      </div>

      {/* Actions Principales */}
      <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ Actions</h2>
        <div className="flex gap-3 flex-wrap">
          {/* Modifier */}
          {peutModifier && (
            <button
              onClick={handleModifier}
              disabled={actionLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2 disabled:bg-gray-400"
            >
              <Edit className="w-5 h-5" />
              Modifier
            </button>
          )}

          {/* Envoyer (si brouillon) */}
          {bon.statut === 'brouillon' && (
            <button
              onClick={() => handleChangerStatut('envoye')}
              disabled={actionLoading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold flex items-center gap-2 disabled:bg-gray-400"
            >
              <Send className="w-5 h-5" />
              Marquer Envoyé
            </button>
          )}

          {/* Reçu (si envoyé) */}
          {bon.statut === 'envoye' && (
            <button
              onClick={() => handleChangerStatut('recu')}
              disabled={actionLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center gap-2 disabled:bg-gray-400"
            >
              <CheckCircle2 className="w-5 h-5" />
              Marquer Reçu
            </button>
          )}

          {/* Annuler (si brouillon ou envoyé) */}
          {(bon.statut === 'brouillon' || bon.statut === 'envoye') && (
            <button
              onClick={() => handleChangerStatut('annule')}
              disabled={actionLoading}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold flex items-center gap-2 disabled:bg-gray-400"
            >
              <XCircle className="w-5 h-5" />
              Annuler
            </button>
          )}

          {/* Supprimer */}
          {peutSupprimer && (
            <button
              onClick={handleSupprimer}
              disabled={actionLoading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold flex items-center gap-2 disabled:bg-gray-400 ml-auto"
            >
              <Trash2 className="w-5 h-5" />
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Informations Générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Fournisseur */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Fournisseur
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">Nom</div>
              <div className="text-xl font-bold text-gray-900">{bon.fournisseur}</div>
            </div>
          </div>
        </div>

        {/* Détails Commande */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Détails
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Date</div>
                <div className="font-semibold text-gray-900">
                  {new Date(bon.date).toLocaleDateString('fr-FR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Créé par</div>
                <div className="font-semibold text-gray-900">{bon.createdBy}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {bon.notes && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-yellow-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Notes / Instructions
          </h3>
          <p className="text-yellow-800 whitespace-pre-wrap">{bon.notes}</p>
        </div>
      )}

      {/* Articles */}
      <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          Articles ({bon.lignes.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Code</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Description</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Qté Demandée</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Qté Suggérée</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Prix Unit. (€)</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Total (€)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bon.lignes.map((ligne, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-mono font-bold text-gray-900">{ligne.articleCode}</td>
                  <td className="px-4 py-4">
                    <div className="text-gray-900">{ligne.articleDescription}</div>
                    {ligne.raisonSuggestion && (
                      <div className="text-xs text-blue-600 italic mt-1 flex items-start gap-1">
                        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{ligne.raisonSuggestion}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-gray-900 text-lg">
                    {ligne.quantiteDemandee}
                  </td>
                  <td className="px-4 py-4 text-center text-gray-600">
                    {ligne.quantiteSuggere}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-gray-900">
                    {ligne.prixUnitaireEstime.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-blue-600 text-lg">
                    {(ligne.quantiteDemandee * ligne.prixUnitaireEstime).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-blue-50 border-t-2 border-blue-300">
              <tr>
                <td colSpan={2} className="px-4 py-4 text-right font-bold text-gray-900 text-lg">
                  TOTAL
                </td>
                <td className="px-4 py-4 text-center font-bold text-gray-900 text-lg">
                  {quantiteTotale}
                </td>
                <td colSpan={2}></td>
                <td className="px-4 py-4 text-right font-bold text-blue-600 text-2xl">
                  {bon.totalEstime.toFixed(2)} €
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Total Recap */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg border-2 border-blue-300 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-blue-600" />
              Total Estimé
            </h3>
            <p className="text-gray-600">
              {bon.lignes.length} article(s) • {quantiteTotale} unité(s)
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-blue-600">
              {bon.totalEstime.toFixed(2)} €
            </div>
            <div className="text-lg text-gray-600 mt-2">HT</div>
          </div>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Dernière modification : {new Date(bon.updatedAt).toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>
    </div>
  )
}
