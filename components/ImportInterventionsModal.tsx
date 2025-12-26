'use client'

import { useState } from 'react'
import { X, Upload, FileSpreadsheet, Edit2, Trash2, Check } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore'

interface Intervention {
  ref: string
  designation: string
  site: {
    nom: string
    surface: number
  }
  client: string
  quantite: number
  unite: string
  prixUnitaire: number
  montant: number
  dateDebut: string | null
  dateFin: string | null
  description: string
}

interface ImportInterventionsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ImportInterventionsModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportInterventionsModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'results'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [importResults, setImportResults] = useState<{
    created: string[]
    updated: string[]
    errors: { site: string; reason: string }[]
  }>({ created: [], updated: [], errors: [] })

  // Fonction pour normaliser les noms de sites
  const normalizeSiteName = (name: string): string => {
    return name
      .trim() // Supprimer espaces début/fin
      .replace(/\s+/g, ' ') // Remplacer espaces multiples par un seul
      .toLowerCase() // Tout en minuscules
  }

  if (!isOpen) return null

  const handleFileUpload = async () => {
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/interventions/parse-excel', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setInterventions(data.interventions)
        setStep('preview')
      } else {
        setError(data.error || 'Erreur')
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('upload')
    setFile(null)
    setInterventions([])
    setError('')
    setImportResults({ created: [], updated: [], errors: [] })
    onClose()
  }

  const handleCloseWithRefresh = () => {
    onSuccess() // Rafraîchir le calendrier
    handleClose()
  }

  const handleExportReport = () => {
    const timestamp = new Date().toLocaleString('fr-FR')
    let report = `RAPPORT D'IMPORT INTERVENTIONS
Date : ${timestamp}
===========================================

RÉSUMÉ
------
✅ Interventions créées : ${importResults.created.length}
🔄 Interventions mises à jour : ${importResults.updated.length}
❌ Erreurs : ${importResults.errors.length}

`

    if (importResults.created.length > 0) {
      report += `\nINTERVENTIONS CRÉÉES (${importResults.created.length})
${'='.repeat(50)}\n`
      importResults.created.forEach((site, idx) => {
        report += `${idx + 1}. ${site}\n`
      })
    }

    if (importResults.updated.length > 0) {
      report += `\n\nINTERVENTIONS MISES À JOUR (${importResults.updated.length})
${'='.repeat(50)}\n`
      importResults.updated.forEach((site, idx) => {
        report += `${idx + 1}. ${site}\n`
      })
    }

    if (importResults.errors.length > 0) {
      report += `\n\nERREURS DÉTAILLÉES (${importResults.errors.length})
${'='.repeat(50)}\n`
      importResults.errors.forEach((error, idx) => {
        report += `\n${idx + 1}. ${error.site}\n   → ${error.reason}\n`
      })
    }

    // Créer un blob et télécharger
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rapport-import-interventions-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleCreateInterventions = async () => {
    setLoading(true)

    const created: string[] = []
    const updated: string[] = []
    const errors: { site: string; reason: string }[] = []

    try {
      // Charger TOUS les sites UNE FOIS pour optimiser
      const allSitesQuery = query(collection(db, 'sites'))
      const allSitesSnapshot = await getDocs(allSitesQuery)
      
      // Créer un index des sites normalisés
      const sitesIndex = new Map<string, any>()
      allSitesSnapshot.docs.forEach(doc => {
        const site = doc.data()
        const normalizedComplementNom = normalizeSiteName(site.complementNom || '')
        const normalizedNomSite = normalizeSiteName(site.nomSite || '')
        
        const siteData = { id: doc.id, ...site }
        
        // Indexer par les deux noms possibles
        if (normalizedComplementNom) sitesIndex.set(normalizedComplementNom, siteData)
        if (normalizedNomSite) sitesIndex.set(normalizedNomSite, siteData)
      })

      for (const interv of interventions) {
        try {
          // Normaliser le nom du site recherché
          const searchName = normalizeSiteName(interv.site.nom)

          // Chercher dans l'index
          const siteData = sitesIndex.get(searchName)

          if (!siteData) {
            errors.push({
              site: interv.site.nom,
              reason: 'Site non trouvé dans la base de données (vérifier espaces et majuscules)'
            })
            continue
          }

          // Récupérer clientId et groupeId du site
          const clientId = siteData.clientId
          const groupeId = siteData.groupeId

          if (!clientId || !groupeId) {
            errors.push({
              site: interv.site.nom,
              reason: 'Site sans client ou groupe (données incomplètes)'
            })
            continue
          }

          // Date début pour la recherche de doublon
          const dateDebut = interv.dateDebut
            ? new Date(interv.dateDebut).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]

          // DÉTECTION DE DOUBLON : siteId + dateDebut
          const existingQuery = query(
            collection(db, 'interventions_calendar'),
            where('siteId', '==', siteData.id),
            where('dateDebut', '==', dateDebut)
          )
          const existingSnapshot = await getDocs(existingQuery)

          const interventionData = {
            siteId: siteData.id,
            siteName: interv.site.nom,
            clientId: clientId,
            groupeId: groupeId,
            clientName: interv.client,
            surface: interv.site.surface || 0,
            dateDebut: dateDebut,
            dateFin: interv.dateFin
              ? new Date(interv.dateFin).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            heureDebut: '08:00',
            heureFin: '17:00',
            type: 'Standard',
            statut: 'Planifiée',
            equipeId: 1,
            notes: interv.description || '',
          }

          if (!existingSnapshot.empty) {
            // DOUBLON DÉTECTÉ → MISE À JOUR
            const existingDoc = existingSnapshot.docs[0]
            await updateDoc(existingDoc.ref, {
              ...interventionData,
              updatedAt: new Date(),
            })
            updated.push(interv.site.nom)
          } else {
            // NOUVELLE INTERVENTION → CRÉATION
            await addDoc(collection(db, 'interventions_calendar'), {
              ...interventionData,
              createdAt: new Date(),
            })
            created.push(interv.site.nom)
          }
        } catch (err: any) {
          console.error('Erreur intervention:', err)
          errors.push({
            site: interv.site.nom,
            reason: err.message || 'Erreur inconnue'
          })
        }
      }

      // Stocker les résultats et passer à l'étape results
      setImportResults({ created, updated, errors })
      setStep('results')
      // Ne PAS appeler onSuccess() ici - on le fera à la fermeture
    } catch (err: any) {
      console.error('Erreur:', err)
      alert('❌ Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Importer interventions</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-400 rounded-lg p-12 text-center">
                <Upload className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Sélectionner un fichier Excel
                </h3>
                <p className="text-gray-900 font-semibold mb-4">
                  Format DEVIS avec colonnes Ref, Désignation, Site, Client
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 font-bold"
                >
                  <Upload className="w-5 h-5" />
                  Choisir fichier
                </label>
              </div>

              {file && (
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                  <p className="font-bold text-blue-900">Fichier:</p>
                  <p className="text-blue-900 font-semibold">{file.name}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                  <p className="text-red-900 font-bold">{error}</p>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                <p className="font-bold text-blue-900 text-lg">
                  {interventions.length} interventions trouvées
                </p>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {interventions.map((interv, index) => (
                  <div key={index} className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{interv.designation}</h3>
                    <p className="text-base text-gray-900 font-semibold mb-3">
                      {interv.site.nom} • {interv.client}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-900 font-bold">Surface: </span>
                        <span className="font-bold text-gray-900">
                          {interv.quantite} {interv.unite}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-900 font-bold">Montant: </span>
                        <span className="font-bold text-gray-900">{interv.montant} €</span>
                      </div>
                      <div>
                        <span className="text-gray-900 font-bold">Dates: </span>
                        <span className="font-bold text-gray-900">
                          {interv.dateDebut
                            ? new Date(interv.dateDebut).toLocaleDateString('fr-FR')
                            : '—'}{' '}
                          →{' '}
                          {interv.dateFin
                            ? new Date(interv.dateFin).toLocaleDateString('fr-FR')
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'results' && (
            <div className="space-y-4">
              {/* Résumé */}
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 text-lg mb-2">📊 Résultats de l'import</h3>
                <div className="space-y-1 text-sm">
                  {importResults.created.length > 0 && (
                    <p className="text-green-700 font-bold">
                      ✅ {importResults.created.length} intervention(s) créée(s)
                    </p>
                  )}
                  {importResults.updated.length > 0 && (
                    <p className="text-blue-700 font-bold">
                      🔄 {importResults.updated.length} intervention(s) mise(s) à jour
                    </p>
                  )}
                  {importResults.errors.length > 0 && (
                    <p className="text-red-700 font-bold">
                      ❌ {importResults.errors.length} erreur(s)
                    </p>
                  )}
                </div>
              </div>

              {/* Interventions créées */}
              {importResults.created.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-900 mb-2">
                    ✅ Interventions créées ({importResults.created.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResults.created.slice(0, 10).map((site, idx) => (
                      <p key={idx} className="text-sm text-green-800">{site}</p>
                    ))}
                    {importResults.created.length > 10 && (
                      <p className="text-xs text-green-600 mt-1">
                        ... et {importResults.created.length - 10} autre(s)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Interventions mises à jour */}
              {importResults.updated.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-2">
                    🔄 Interventions mises à jour ({importResults.updated.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResults.updated.slice(0, 10).map((site, idx) => (
                      <p key={idx} className="text-sm text-blue-800">{site}</p>
                    ))}
                    {importResults.updated.length > 10 && (
                      <p className="text-xs text-blue-600 mt-1">
                        ... et {importResults.updated.length - 10} autre(s)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ERREURS DÉTAILLÉES */}
              {importResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-bold text-red-900 mb-3">
                    ❌ Erreurs détaillées ({importResults.errors.length})
                  </h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {importResults.errors.map((error, idx) => (
                      <div key={idx} className="bg-white border border-red-200 rounded p-3">
                        <p className="font-bold text-red-900 text-sm">{error.site}</p>
                        <p className="text-xs text-red-700 mt-1">→ {error.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t p-6 flex items-center justify-between bg-gray-50">
          {step === 'results' ? (
            <div className="flex gap-3 w-full">
              <button
                onClick={handleExportReport}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2"
              >
                📥 Télécharger rapport
              </button>
              <button
                onClick={handleCloseWithRefresh}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2 border-2 border-gray-400 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-gray-900 font-bold"
              >
                Annuler
              </button>

          {step === 'upload' && (
            <button
              onClick={handleFileUpload}
              disabled={!file || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold"
            >
              {loading ? 'Lecture...' : 'Analyser fichier'}
            </button>
          )}

          {step === 'preview' && (
            <button
              onClick={handleCreateInterventions}
              disabled={interventions.length === 0 || loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold"
            >
              <Check className="w-5 h-5" />
              {loading ? 'Création...' : `Créer ${interventions.length} intervention(s)`}
            </button>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}