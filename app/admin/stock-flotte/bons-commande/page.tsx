'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  getAllBonsCommande,
  getBonsCommandeParStatut,
  deleteBonCommande,
  changerStatutBonCommande,
  type BonCommandeFournisseur
} from '@/lib/firebase/bons-commande-fournisseurs'
import ModalEnvoiEmail from '@/components/ModalEnvoiEmail'

export default function BonsCommandePage() {
  const [loading, setLoading] = useState(true)
  const [bonsCommande, setBonsCommande] = useState<BonCommandeFournisseur[]>([])
  const [filtreStatut, setFiltreStatut] = useState<'tous' | 'brouillon' | 'envoye' | 'recu' | 'annule'>('tous')
  const [showModalEmail, setShowModalEmail] = useState(false)
  const [bonSelectionne, setBonSelectionne] = useState<BonCommandeFournisseur | null>(null)

  useEffect(() => {
    loadBonsCommande()
  }, [filtreStatut])

  async function loadBonsCommande() {
    try {
      setLoading(true)
      let data: BonCommandeFournisseur[]
      
      if (filtreStatut === 'tous') {
        data = await getAllBonsCommande()
      } else {
        data = await getBonsCommandeParStatut(filtreStatut)
      }
      
      setBonsCommande(data)
    } catch (error) {
      console.error('Erreur chargement bons de commande:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleChangerStatut(id: string, nouveauStatut: 'brouillon' | 'envoye' | 'recu' | 'annule') {
    if (!confirm(`Changer le statut en "${nouveauStatut}" ?`)) return

    try {
      await changerStatutBonCommande(id, nouveauStatut)
      alert('✅ Statut modifié !')
      loadBonsCommande()
    } catch (error) {
      console.error('Erreur changement statut:', error)
      alert('❌ Erreur lors du changement de statut')
    }
  }

  async function handleSupprimer(id: string, numero: string) {
    if (!confirm(`Supprimer définitivement le bon de commande ${numero} ?`)) return

    try {
      await deleteBonCommande(id)
      alert('✅ Bon de commande supprimé !')
      loadBonsCommande()
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('❌ Erreur lors de la suppression')
    }
  }

  function handleEnvoyerEmail(bon: BonCommandeFournisseur) {
    setBonSelectionne(bon)
    setShowModalEmail(true)
  }

  const stats = {
    total: bonsCommande.length,
    brouillon: bonsCommande.filter(b => b.statut === 'brouillon').length,
    envoye: bonsCommande.filter(b => b.statut === 'envoye').length,
    recu: bonsCommande.filter(b => b.statut === 'recu').length,
    annule: bonsCommande.filter(b => b.statut === 'annule').length,
    totalEstime: bonsCommande.reduce((sum, b) => sum + b.totalEstime, 0)
  }

  function getBadgeStatut(statut: string) {
    const badges = {
      brouillon: 'bg-gray-100 text-gray-700',
      envoye: 'bg-blue-100 text-blue-700',
      recu: 'bg-green-100 text-green-700',
      annule: 'bg-red-100 text-red-700'
    }
    const emojis = {
      brouillon: '📝',
      envoye: '📧',
      recu: '✅',
      annule: '❌'
    }
    return { classe: badges[statut as keyof typeof badges], emoji: emojis[statut as keyof typeof emojis] }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <span className="text-gray-900">Bons de Commande</span>
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">📝 Bons de Commande Fournisseurs</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-2 border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Bons</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-gray-50 rounded-lg shadow p-4 border-2 border-gray-200">
          <div className="text-sm text-gray-600 mb-1">📝 Brouillons</div>
          <div className="text-2xl font-bold text-gray-700">{stats.brouillon}</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 border-2 border-blue-200">
          <div className="text-sm text-blue-600 mb-1">📧 Envoyés</div>
          <div className="text-2xl font-bold text-blue-700">{stats.envoye}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 border-2 border-green-200">
          <div className="text-sm text-green-600 mb-1">✅ Reçus</div>
          <div className="text-2xl font-bold text-green-700">{stats.recu}</div>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4 border-2 border-purple-200">
          <div className="text-sm text-purple-600 mb-1">💰 Total Estimé</div>
          <div className="text-xl font-bold text-purple-700">
            {stats.totalEstime.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFiltreStatut('tous')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filtreStatut === 'tous'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({stats.total})
          </button>
          <button
            onClick={() => setFiltreStatut('brouillon')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filtreStatut === 'brouillon'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📝 Brouillons ({stats.brouillon})
          </button>
          <button
            onClick={() => setFiltreStatut('envoye')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filtreStatut === 'envoye'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            📧 Envoyés ({stats.envoye})
          </button>
          <button
            onClick={() => setFiltreStatut('recu')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filtreStatut === 'recu'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            ✅ Reçus ({stats.recu})
          </button>
          <button
            onClick={() => setFiltreStatut('annule')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filtreStatut === 'annule'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            ❌ Annulés ({stats.annule})
          </button>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      ) : bonsCommande.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-200">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl text-gray-600 mb-2">Aucun bon de commande</p>
          <p className="text-sm text-gray-500">
            {filtreStatut === 'tous' 
              ? 'Créez un bon de commande depuis une intervention'
              : `Aucun bon de commande en statut "${filtreStatut}"`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bonsCommande.map(bon => {
            const badge = getBadgeStatut(bon.statut)
            return (
              <div key={bon.id} className="bg-white rounded-lg shadow border-2 border-gray-200 p-6 hover:border-blue-300 transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{bon.numero}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.classe}`}>
                        {badge.emoji} {bon.statut.charAt(0).toUpperCase() + bon.statut.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>🏢 <strong>{bon.fournisseur}</strong></span>
                      <span>📅 {new Date(bon.date).toLocaleDateString('fr-FR')}</span>
                      <span>👤 {bon.createdBy}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {bon.totalEstime.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                    <div className="text-xs text-gray-500">Total estimé</div>
                  </div>
                </div>

                {/* Articles */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    📦 Articles ({bon.lignes.length})
                  </h4>
                  <div className="space-y-2">
                    {bon.lignes.map((ligne, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{ligne.articleCode}</span>
                          <span className="text-gray-600"> - {ligne.articleDescription}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">
                            <strong>{ligne.quantiteSuggere}</strong> unités
                          </span>
                          <span className="font-semibold text-gray-900">
                            {(ligne.quantiteSuggere * ligne.prixUnitaireEstime).toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {bon.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>📝 Notes :</strong> {bon.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {bon.statut === 'brouillon' && (
                    <>
                      <button
                        onClick={() => handleEnvoyerEmail(bon)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-sm"
                      >
                        📧 Envoyer Email
                      </button>
                      <button
                        onClick={() => handleChangerStatut(bon.id, 'envoye')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
                      >
                        ✅ Marquer comme Envoyé
                      </button>
                      <button
                        onClick={() => handleSupprimer(bon.id, bon.numero)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold text-sm"
                      >
                        🗑️ Supprimer
                      </button>
                    </>
                  )}
                  {bon.statut === 'envoye' && (
                    <>
                      <button
                        onClick={() => handleChangerStatut(bon.id, 'recu')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm"
                      >
                        ✅ Marquer comme Reçu
                      </button>
                      <button
                        onClick={() => handleChangerStatut(bon.id, 'annule')}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold text-sm"
                      >
                        ❌ Annuler
                      </button>
                    </>
                  )}
                  {bon.statut === 'recu' && (
                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">
                      ✅ Commande reçue
                    </div>
                  )}
                  {bon.statut === 'annule' && (
                    <button
                      onClick={() => handleSupprimer(bon.id, bon.numero)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold text-sm"
                    >
                      🗑️ Supprimer
                    </button>
                  )}
                </div>

                {/* Raison suggestion */}
                {bon.lignes.length > 0 && bon.lignes[0].raisonSuggestion && (
                  <div className="mt-3 text-xs text-gray-500 italic">
                    💡 {bon.lignes[0].raisonSuggestion}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Envoi Email */}
      {showModalEmail && bonSelectionne && (
        <ModalEnvoiEmail
          bonCommande={bonSelectionne}
          onClose={() => {
            setShowModalEmail(false)
            setBonSelectionne(null)
          }}
          onSuccess={() => {
            setShowModalEmail(false)
            setBonSelectionne(null)
            // Optionnel: changer le statut en "envoyé"
            // handleChangerStatut(bonSelectionne.id, 'envoye')
          }}
        />
      )}
    </div>
  )
}
