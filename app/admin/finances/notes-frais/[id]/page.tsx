'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  getNoteDeFraisById,
  validerNoteDeFrais,
  refuserNoteDeFrais,
  marquerNoteDeFraisRemboursee,
  soumettreNoteDeFrais,
  deleteNoteDeFrais,
  type NoteDeFrais
} from '@/lib/firebase/notes-de-frais'
import { Eye, Download, Check, X, DollarSign, ArrowLeft, Send, Edit, Trash2 } from 'lucide-react'

export default function DetailNoteFraisPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState<NoteDeFrais | null>(null)
  
  const [showModal, setShowModal] = useState(false)
  const [action, setAction] = useState<'valider' | 'refuser' | 'rembourser'>('valider')
  const [commentaire, setCommentaire] = useState('')
  const [modeRemboursement, setModeRemboursement] = useState<'virement' | 'cheque'>('virement')
  const [reference, setReference] = useState('')

  useEffect(() => {
    if (params.id) {
      loadNote()
    }
  }, [params.id])

  async function loadNote() {
    try {
      setLoading(true)
      const data = await getNoteDeFraisById(params.id as string)
      setNote(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction() {
    if (!note) return
    
    try {
      const userName = localStorage.getItem('user_name') || 'Admin'
      const userId = localStorage.getItem('user_id') || 'admin'
      
      if (action === 'valider') {
        await validerNoteDeFrais(note.id, userId, userName, commentaire)
        alert('✅ Note validée')
      } else if (action === 'refuser') {
        if (!commentaire.trim()) {
          alert('⚠️ Motif requis')
          return
        }
        await refuserNoteDeFrais(note.id, userId, userName, commentaire)
        alert('✅ Note refusée')
      } else {
        await marquerNoteDeFraisRemboursee(note.id, modeRemboursement, reference)
        alert('✅ Marquée remboursée')
      }
      
      setShowModal(false)
      await loadNote()
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur')
    }
  }

  async function handleModifier() {
    if (!note) return
    router.push(`/admin/finances/notes-frais/${note.id}/modifier`)
  }

  async function handleSupprimer() {
    if (!note) return
    
    const confirmation = note.statut === 'validee' || note.statut === 'remboursee' || note.exported
      ? confirm(
          `⚠️ ATTENTION : Cette note est ${note.statut} ${note.exported ? 'et exportée en comptabilité' : ''}.\n\n` +
          'Êtes-vous VRAIMENT sûr de vouloir la supprimer ?\n\n' +
          'Cette action est irréversible !'
        )
      : confirm('Supprimer cette note de frais ?')
    
    if (!confirmation) return
    
    try {
      // Suppression forcée si validée/remboursée/exportée
      const force = note.statut === 'validee' || note.statut === 'remboursee' || note.exported
      await deleteNoteDeFrais(note.id, force)
      alert('✅ Note supprimée')
      router.push('/admin/finances/notes-frais')
    } catch (error: any) {
      console.error('Erreur suppression:', error)
      alert('❌ Erreur : ' + error.message)
    }
  }

  async function handleSoumettre() {
    if (!note) return
    
    if (!confirm('Soumettre cette note de frais pour validation ?')) {
      return
    }
    
    try {
      await soumettreNoteDeFrais(note.id)
      alert('✅ Note soumise pour validation')
      router.push('/admin/finances/notes-frais')
    } catch (error: any) {
      console.error('Erreur soumission:', error)
      alert('❌ Erreur : ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600">Note de frais introuvable</p>
          <Link href="/admin/finances/notes-frais" className="text-blue-600 mt-4 inline-block">
            ← Retour à la liste
          </Link>
        </div>
      </div>
    )
  }

  const statutColors = {
    brouillon: 'bg-gray-100 text-gray-700',
    soumise: 'bg-orange-100 text-orange-700',
    validee: 'bg-green-100 text-green-700',
    refusee: 'bg-red-100 text-red-700',
    remboursee: 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{note.numero}</h1>
            <span className={`px-3 py-1 text-sm rounded-full font-medium ${statutColors[note.statut]}`}>
              {note.statut.charAt(0).toUpperCase() + note.statut.slice(1)}
            </span>
          </div>
          <p className="text-gray-600 mt-2">
            {note.operateurNom} • {new Date(note.date).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/finances/notes-frais"
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
          
          {/* ✅ NOUVEAUX BOUTONS - Toujours visibles */}
          <button
            onClick={handleModifier}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
          <button
            onClick={handleSupprimer}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
          
          {note.statut === 'brouillon' && (
            <button
              onClick={handleSoumettre}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              <Send className="w-4 h-4" />
              Soumettre pour validation
            </button>
          )}
          {note.statut === 'soumise' && (
            <>
              <button
                onClick={() => { setAction('valider'); setShowModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Check className="w-4 h-4" />
                Valider
              </button>
              <button
                onClick={() => { setAction('refuser'); setShowModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <X className="w-4 h-4" />
                Refuser
              </button>
            </>
          )}
          {note.statut === 'validee' && (
            <button
              onClick={() => { setAction('rembourser'); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <DollarSign className="w-4 h-4" />
              Rembourser
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Informations</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Catégorie</p>
                <p className="font-medium capitalize">{note.categorie}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Montant TTC</p>
                <p className="text-2xl font-bold text-gray-900">{note.montantTTC.toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Montant HT</p>
                <p className="font-medium">{note.montantHT.toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">TVA ({note.tauxTVA}%)</p>
                <p className="font-medium">{note.montantTVA.toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">TVA récupérable</p>
                <p className="font-medium">{note.tvaRecuperable ? 'Oui ✅' : 'Non ❌'}</p>
              </div>
              {note.fournisseur && (
                <div>
                  <p className="text-sm text-gray-600">Fournisseur</p>
                  <p className="font-medium">{note.fournisseur}</p>
                </div>
              )}
              
              {/* ✅ NOUVEAU - Comptabilité */}
              <div>
                <p className="text-sm text-gray-600">Compte comptable</p>
                <p className="font-medium font-mono text-blue-600">{note.compteComptable}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Exporté comptabilité</p>
                <p className="font-medium">{note.exported ? '✅ Oui' : '❌ Non'}</p>
              </div>
              
              {note.numeroTicket && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">N° Ticket</p>
                  <p className="font-medium font-mono">{note.numeroTicket}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-gray-900">{note.description}</p>
            </div>
            
            {/* ✅ NOUVEAU - Détails Carburant */}
            {note.donneesCarburant && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-3">⛽ Détails Carburant</p>
                <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium text-blue-900">{note.donneesCarburant.typeCarburant}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quantité</p>
                    <p className="font-medium text-blue-900">{note.donneesCarburant.quantiteLitres} L</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prix unitaire</p>
                    <p className="font-medium text-blue-900">{note.donneesCarburant.prixUnitaire.toFixed(3)} €/L</p>
                  </div>
                  {note.donneesCarburant.numeroPompe && (
                    <div>
                      <p className="text-sm text-gray-600">Pompe n°</p>
                      <p className="font-medium text-blue-900">{note.donneesCarburant.numeroPompe}</p>
                    </div>
                  )}
                  <div className="col-span-2 pt-2 border-t border-blue-200">
                    <p className="text-sm text-gray-600">Total calculé</p>
                    <p className="font-bold text-blue-900 text-lg">
                      {(note.donneesCarburant.quantiteLitres * note.donneesCarburant.prixUnitaire).toFixed(2)} €
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* ✅ NOUVEAU - Métadonnées OCR */}
            {note.donneesOCR && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-3">📊 Métadonnées OCR</p>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Confiance</p>
                    <p className="font-medium">{note.donneesOCR.confiance}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Analysé le</p>
                    <p className="font-medium">
                      {new Date(note.donneesOCR.dateAnalyse).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  {note.donneesOCR.dateHeureTicket && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Date/heure du ticket</p>
                      <p className="font-medium text-blue-900">{note.donneesOCR.dateHeureTicket}</p>
                    </div>
                  )}
                  {note.donneesOCR.texteComplet && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Texte brut extrait</p>
                      <details className="text-xs text-gray-700 bg-white p-2 rounded border">
                        <summary className="cursor-pointer font-medium">Afficher le texte</summary>
                        <pre className="mt-2 whitespace-pre-wrap">{note.donneesOCR.texteComplet}</pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(note.vehiculeImmat || note.kmParcourus) && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">🚗 Véhicule</p>
                <div className="grid grid-cols-2 gap-4">
                  {note.vehiculeImmat && (
                    <div>
                      <p className="text-sm text-gray-600">Immatriculation</p>
                      <p className="font-medium">{note.vehiculeImmat}</p>
                    </div>
                  )}
                  {note.kmParcourus && (
                    <div>
                      <p className="text-sm text-gray-600">Km parcourus</p>
                      <p className="font-medium">{note.kmParcourus} km</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Justificatifs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              Justificatifs ({note.justificatifs.length})
            </h2>
            
            {note.justificatifs.length === 0 ? (
              <p className="text-gray-500">Aucun justificatif</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {note.justificatifs.map(just => (
                  <div key={just.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium truncate">{just.nom}</span>
                      <a
                        href={just.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {just.type === 'pdf' ? <Download className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </a>
                    </div>
                    {just.type === 'image' && (
                      <img src={just.url} alt={just.nom} className="w-full h-32 object-cover rounded" />
                    )}
                    {just.type === 'pdf' && (
                      <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                        <p className="text-gray-600">📄 PDF</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Historique */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Historique</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Créée</p>
                  <p className="text-xs text-gray-600">
                    {new Date(note.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              
              {note.dateValidation && (
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${note.statut === 'validee' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {note.statut === 'validee' ? 'Validée' : 'Refusée'}
                    </p>
                    <p className="text-xs text-gray-600">{note.validateurNom}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(note.dateValidation).toLocaleDateString('fr-FR')}
                    </p>
                    {note.commentaireValidation && (
                      <p className="text-xs text-gray-700 mt-1 italic">
                        "{note.commentaireValidation}"
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {note.dateRemboursement && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Remboursée</p>
                    <p className="text-xs text-gray-600">
                      {note.modeRemboursement === 'virement' ? '💳 Virement' : '📄 Chèque'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(note.dateRemboursement).toLocaleDateString('fr-FR')}
                    </p>
                    {note.referenceRemboursement && (
                      <p className="text-xs text-gray-700 mt-1">
                        {note.referenceRemboursement}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Action */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">
              {action === 'valider' && '✅ Valider'}
              {action === 'refuser' && '❌ Refuser'}
              {action === 'rembourser' && '💰 Rembourser'}
            </h2>

            {action !== 'rembourser' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {action === 'valider' ? 'Commentaire (optionnel)' : 'Motif *'}
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            )}

            {action === 'rembourser' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                  <select
                    value={modeRemboursement}
                    onChange={(e) => setModeRemboursement(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="virement">Virement</option>
                    <option value="cheque">Chèque</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Référence</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleAction}
                className={`flex-1 px-4 py-2 rounded text-white ${
                  action === 'valider' ? 'bg-green-600 hover:bg-green-700' :
                  action === 'refuser' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
