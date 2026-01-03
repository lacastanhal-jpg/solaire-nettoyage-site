'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getDevisById, updateDevisStatut, updateNumeroCommandeClient, type Devis } from '@/lib/firebase/devis'
import { getEmailsHistorique, type EmailHistorique } from '@/lib/firebase/emails'
import { devisAGeneréInterventions, getInterventionsByDevis, validerDevisEnCommande } from '@/lib/firebase/workflow-devis-intervention'
import ModalGenererInterventions from '@/components/ModalGenererInterventions'
import { Calendar, FileText, CheckCircle2 } from 'lucide-react'

const STATUT_LABELS = {
  brouillon: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
  envoyé: { label: 'Envoyé', color: 'bg-blue-100 text-blue-800' },
  accepté: { label: 'Accepté', color: 'bg-green-100 text-green-800' },
  refusé: { label: 'Refusé', color: 'bg-red-100 text-red-800' },
  validé_commande: { label: 'Validé en Commande', color: 'bg-purple-100 text-purple-800' }
}

export default function VoirDevisPage() {
  const router = useRouter()
  const params = useParams()
  const devisId = params.id as string

  const [loading, setLoading] = useState(true)
  const [devis, setDevis] = useState<Devis | null>(null)
  const [changingStatut, setChangingStatut] = useState(false)
  const [emailsHistorique, setEmailsHistorique] = useState<EmailHistorique[]>([])
  
  // Modal email
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailDestinataire, setEmailDestinataire] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  
  // N° Bon de Commande Client
  const [showModalNumeroBCClient, setShowModalNumeroBCClient] = useState(false)
  const [numeroBCClient, setNumeroBCClient] = useState('')
  const [savingNumeroBCClient, setSavingNumeroBCClient] = useState(false)
  
  // Workflow interventions
  const [showModalInterventions, setShowModalInterventions] = useState(false)
  const [interventionsGenerees, setInterventionsGenerees] = useState(false)
  const [interventions, setInterventions] = useState<any[]>([])

  useEffect(() => {
    loadDevis()
    loadEmailsHistorique()
    loadInterventions()
  }, [devisId])

  async function loadDevis() {
    try {
      setLoading(true)
      const data = await getDevisById(devisId)
      
      if (!data) {
        alert('Devis introuvable')
        router.push('/admin/devis')
        return
      }

      setDevis(data)
      
      // Vérifier si interventions générées
      const aGenere = await devisAGeneréInterventions(devisId)
      setInterventionsGenerees(aGenere)
    } catch (error) {
      console.error('Erreur chargement devis:', error)
      alert('Erreur lors du chargement du devis')
    } finally {
      setLoading(false)
    }
  }

  async function loadEmailsHistorique() {
    try {
      const historique = await getEmailsHistorique(devisId)
      setEmailsHistorique(historique)
    } catch (error) {
      console.error('Erreur chargement historique:', error)
    }
  }
  
  async function loadInterventions() {
    try {
      const ints = await getInterventionsByDevis(devisId)
      setInterventions(ints)
    } catch (error) {
      console.error('Erreur chargement interventions:', error)
    }
  }

  async function handleValiderEnCommande() {
    if (!devis) return

    const nombreSites = Array.from(new Set(devis.lignes.map(l => l.siteId))).length
    
    if (!window.confirm(
      `✅ VALIDER CE DEVIS EN COMMANDE ?\n\n` +
      `Cela va créer automatiquement ${nombreSites} intervention(s) en statut "brouillon".\n\n` +
      `Vous pourrez ensuite affecter les équipes et dates.`
    )) {
      return
    }

    try {
      setChangingStatut(true)
      
      const result = await validerDevisEnCommande(devisId)
      
      if (result.success) {
        alert(
          `✅ DEVIS VALIDÉ EN COMMANDE !\n\n` +
          `${result.interventionsCreees.length} intervention(s) créée(s) :\n` +
          `${result.interventionsCreees.join(', ')}\n\n` +
          `Redirection vers les interventions...`
        )
        
        // Redirection vers la liste des interventions avec filtre devisId
        router.push(`/admin/interventions?devisId=${devisId}&mode=affectation`)
      } else {
        alert(`❌ Erreur :\n${result.errors.join('\n')}`)
      }
    } catch (error) {
      console.error('Erreur validation commande:', error)
      alert('❌ Erreur lors de la validation en commande')
    } finally {
      setChangingStatut(false)
    }
  }

  async function handleSaveNumeroBCClient() {
    if (!devis) return

    try {
      setSavingNumeroBCClient(true)
      await updateNumeroCommandeClient(devisId, numeroBCClient)
      await loadDevis()
      setShowModalNumeroBCClient(false)
      alert('✅ N° de commande client enregistré')
    } catch (error) {
      console.error('Erreur sauvegarde N° BC:', error)
      alert('❌ Erreur lors de la sauvegarde')
    } finally {
      setSavingNumeroBCClient(false)
    }
  }

  async function handleChangeStatut(newStatut: 'brouillon' | 'envoyé' | 'accepté' | 'refusé' | 'validé_commande') {
    if (!devis) return

    try {
      setChangingStatut(true)
      await updateDevisStatut(devisId, newStatut)
      await loadDevis()
      alert(`Statut changé en "${STATUT_LABELS[newStatut].label}"`)
    } catch (error) {
      console.error('Erreur changement statut:', error)
      alert('Erreur lors du changement de statut')
    } finally {
      setChangingStatut(false)
    }
  }

  function handleDownloadPDF() {
    // Créer un lien temporaire et le cliquer
    const link = document.createElement('a')
    link.href = `/api/devis/${devisId}/pdf`
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function openEmailModal() {
    setEmailDestinataire('')
    setEmailMessage('')
    setShowEmailModal(true)
  }

  async function handleSendEmail() {
    if (!emailDestinataire) {
      alert('Veuillez saisir une adresse email')
      return
    }

    try {
      setSendingEmail(true)
      
      const response = await fetch(`/api/devis/${devisId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinataire: emailDestinataire,
          message: emailMessage
        })
      })

      if (!response.ok) {
        throw new Error('Erreur envoi email')
      }

      alert('Email envoyé avec succès !')
      setShowEmailModal(false)
      await loadEmailsHistorique()
      
      // Changer le statut en "envoyé" si c'est un brouillon
      if (devis?.statut === 'brouillon') {
        await handleChangeStatut('envoyé')
      }
      
    } catch (error) {
      console.error('Erreur envoi email:', error)
      alert('Erreur lors de l\'envoi de l\'email')
    } finally {
      setSendingEmail(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-800">Chargement du devis...</div>
      </div>
    )
  }

  if (!devis) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/devis')}
            className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-flex items-center gap-2"
          >
            ← Retour aux devis
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{devis.numero}</h1>
              <p className="text-gray-800 mt-1">
                {new Date(devis.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadPDF}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                📄 Télécharger PDF
              </button>
              <button
                onClick={openEmailModal}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                📧 Envoyer par email
              </button>
              <button
                onClick={() => router.push(`/admin/devis/${devisId}/modifier`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                ✏️ Modifier
              </button>
            </div>
          </div>
        </div>

        {/* Historique des envois */}
        {emailsHistorique.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Historique des envois</h2>
            <div className="space-y-2">
              {emailsHistorique.map((email) => (
                <div key={email.id} className="flex items-center gap-3 text-sm">
                  <span className={`w-2 h-2 rounded-full ${email.statut === 'envoyé' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-gray-900 font-medium">
                    {new Date(email.date).toLocaleString('fr-FR')}
                  </span>
                  <span className="text-gray-700">→</span>
                  <span className="text-gray-900">{email.destinataire}</span>
                  {email.statut === 'erreur' && email.erreur && (
                    <span className="text-red-600 text-xs">({email.erreur})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statut et actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-800 mb-2">Statut actuel</div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${STATUT_LABELS[devis.statut].color}`}>
                {STATUT_LABELS[devis.statut].label}
              </span>
            </div>
            <div className="flex gap-2">
              {devis.statut !== 'brouillon' && (
                <button
                  onClick={() => handleChangeStatut('brouillon')}
                  disabled={changingStatut}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  → Brouillon
                </button>
              )}
              {devis.statut !== 'envoyé' && (
                <button
                  onClick={() => handleChangeStatut('envoyé')}
                  disabled={changingStatut}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  → Envoyé
                </button>
              )}
              {devis.statut !== 'accepté' && (
                <button
                  onClick={() => handleChangeStatut('accepté')}
                  disabled={changingStatut}
                  className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  → Accepté
                </button>
              )}
              {devis.statut !== 'refusé' && (
                <button
                  onClick={() => handleChangeStatut('refusé')}
                  disabled={changingStatut}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  → Refusé
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Validation Commande - Visible si envoyé ou accepté */}
        {(devis.statut === 'envoyé' || devis.statut === 'accepté') && !interventionsGenerees && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6 mb-6 border-2 border-green-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  Valider en Commande
                </h3>
                <p className="text-sm text-gray-700 mt-2">
                  Créer automatiquement {Array.from(new Set(devis.lignes.map(l => l.siteId))).length} intervention(s) en statut "brouillon"
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  ⚡ Les interventions seront créées sans dates ni équipes. Vous pourrez les affecter ensuite.
                </p>
              </div>
              <button
                onClick={handleValiderEnCommande}
                disabled={changingStatut}
                className="px-8 py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-3"
              >
                <CheckCircle2 className="w-6 h-6" />
                VALIDER EN COMMANDE
              </button>
            </div>
          </div>
        )}

        {/* Interventions déjà créées */}
        {interventionsGenerees && interventions.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6 mb-6 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Interventions Créées
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  ✅ {interventions.length} intervention(s) créée(s) depuis ce devis
                </p>
              </div>
              <Link
                href={`/admin/interventions?devisId=${devisId}`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Voir les Interventions
              </Link>
            </div>
            
            {/* Liste interventions */}
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {interventions.map((int: any) => (
                  <Link
                    key={int.id}
                    href={`/admin/interventions/${int.id}`}
                    className="bg-white border-2 border-blue-200 rounded-lg px-4 py-3 hover:bg-blue-50 hover:border-blue-400 transition-all"
                  >
                    <div className="font-semibold text-gray-900">{int.id}</div>
                    <div className="text-sm text-gray-700 mt-1">{int.siteName}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        int.statut === 'brouillon' 
                          ? 'bg-gray-100 text-gray-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {int.statut || 'brouillon'}
                      </span>
                      {int.totalTTC && (
                        <span className="text-sm font-medium text-gray-900">
                          {int.totalTTC.toFixed(2)}€
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Génération Interventions - Visible si accepté */}
        {devis.statut === 'accepté' && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-sm p-6 mb-6 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Générer les Interventions
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {interventionsGenerees 
                    ? `✅ ${interventions.length} intervention(s) déjà créée(s) depuis ce devis`
                    : "Créer automatiquement les interventions depuis ce devis"}
                </p>
              </div>
              <div className="flex gap-3">
                {interventionsGenerees && interventions.length > 0 && (
                  <Link
                    href="/admin/calendrier"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Voir Planning
                  </Link>
                )}
                {!interventionsGenerees && (
                  <button
                    onClick={() => setShowModalInterventions(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg flex items-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Générer Interventions
                  </button>
                )}
              </div>
            </div>
            
            {/* Liste interventions créées */}
            {interventionsGenerees && interventions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Interventions créées :</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {interventions.map((int: any) => (
                    <Link
                      key={int.id}
                      href={`/admin/interventions/${int.id}`}
                      className="text-sm bg-white border border-green-200 rounded px-3 py-2 hover:bg-green-50 transition-colors"
                    >
                      <span className="font-medium text-green-700">{int.id}</span>
                      <span className="text-gray-600 mx-2">•</span>
                      <span className="text-gray-700">{int.siteName}</span>
                      <span className="text-gray-500 block text-xs mt-1">
                        📅 {int.dateDebut ? new Date(int.dateDebut).toLocaleDateString('fr-FR') : 'Date invalide'}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informations client */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Client</h2>
          <div className="grid grid-cols-2 gap-4 text-gray-900">
            <div>
              <div className="text-sm text-gray-700">Nom</div>
              <div className="font-medium">{devis.clientNom}</div>
            </div>
            {devis.groupeNom && (
              <div>
                <div className="text-sm text-gray-700">Groupe</div>
                <div className="font-medium">{devis.groupeNom}</div>
              </div>
            )}
          </div>
        </div>

        {/* N° Bon de Commande Client */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">N° Bon de Commande Client</h2>
            {(devis.statut === 'envoyé' || devis.statut === 'accepté' || devis.statut === 'validé_commande') && (
              <button
                onClick={() => {
                  setNumeroBCClient(devis.numeroCommandeClient || '')
                  setShowModalNumeroBCClient(true)
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {devis.numeroCommandeClient ? '✏️ Modifier' : '➕ Ajouter'}
              </button>
            )}
          </div>
          
          {devis.numeroCommandeClient ? (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">📋</div>
                <div className="flex-1">
                  <div className="text-sm text-gray-700">Référence client</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {devis.numeroCommandeClient}
                  </div>
                  {devis.dateCommandeClient && (
                    <div className="text-xs text-gray-600 mt-1">
                      Enregistré le {new Date(devis.dateCommandeClient).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">⚠️</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">N° de commande non renseigné</div>
                  <div className="text-sm text-gray-700 mt-1">
                    Pour les gros comptes (ENGIE, EDF, TotalEnergies...), pensez à ajouter le N° de commande client pour faciliter la facturation.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lignes du devis */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Détail du devis</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Site</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Article</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Qté</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">P.U. HT</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Total HT</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">TVA</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Total TTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {devis.lignes.map((ligne, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-gray-900 font-medium">{ligne.siteNom}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 font-medium">{ligne.articleCode} - {ligne.articleNom}</div>
                      {ligne.articleDescription && (
                        <div className="text-sm text-gray-700 mt-1">{ligne.articleDescription}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{ligne.quantite.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{ligne.prixUnitaire.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">{ligne.totalHT.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-right text-gray-900">{ligne.totalTVA.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-bold">{ligne.totalTTC.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {devis.notes && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>
            <p className="text-gray-900 whitespace-pre-wrap">{devis.notes}</p>
          </div>
        )}

        {/* Totaux */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Totaux</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-lg text-gray-900">
              <span>Total HT</span>
              <span className="font-bold">{devis.totalHT.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-lg text-gray-900">
              <span>Total TVA</span>
              <span className="font-bold">{devis.totalTVA.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-blue-600 pt-3 border-t">
              <span>Total TTC</span>
              <span>{devis.totalTTC.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Infos création */}
        <div className="mt-6 text-sm text-gray-700 space-y-1">
          <div>Créé le : {new Date(devis.createdAt).toLocaleString('fr-FR')}</div>
          <div>Dernière modification : {new Date(devis.updatedAt).toLocaleString('fr-FR')}</div>
        </div>
      </div>

      {/* Modal Email */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Envoyer le devis par email</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Adresse email du destinataire *
                </label>
                <input
                  type="email"
                  value={emailDestinataire}
                  onChange={(e) => setEmailDestinataire(e.target.value)}
                  placeholder="contact@exemple.fr"
                  className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg text-black font-semibold"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Message personnalisé (optionnel)
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={4}
                  placeholder="Message qui sera ajouté dans l'email..."
                  className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg text-black font-semibold"
                  style={{ color: '#000000' }}
                />
                <p className="text-sm text-gray-700 mt-1">
                  Si vide, un message par défaut sera utilisé
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  📎 Le PDF du devis sera automatiquement joint à l'email
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail || !emailDestinataire}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {sendingEmail ? 'Envoi en cours...' : '📧 Envoyer'}
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                disabled={sendingEmail}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Génération Interventions */}
      {showModalInterventions && devis && (
        <ModalGenererInterventions
          devis={devis}
          onClose={() => setShowModalInterventions(false)}
          onSuccess={() => {
            loadDevis()
            loadInterventions()
          }}
        />
      )}

      {/* Modal N° Bon de Commande Client */}
      {showModalNumeroBCClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              N° Bon de Commande Client
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Numéro de commande client (optionnel)
              </label>
              <input
                type="text"
                value={numeroBCClient}
                onChange={(e) => setNumeroBCClient(e.target.value)}
                placeholder="BC-ENGIE-2026-12345"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <p className="text-sm text-gray-600 mt-2">
                Ce numéro sera visible sur les interventions et les factures liées à ce devis.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Requis pour : ENGIE, EDF, TotalEnergies, CGN...
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveNumeroBCClient}
                disabled={savingNumeroBCClient}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {savingNumeroBCClient ? 'Enregistrement...' : '✅ Enregistrer'}
              </button>
              <button
                onClick={() => setShowModalNumeroBCClient(false)}
                disabled={savingNumeroBCClient}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
