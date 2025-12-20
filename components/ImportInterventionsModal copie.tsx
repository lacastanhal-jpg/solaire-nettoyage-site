'use client'

import { useState } from 'react'
import { X, Upload, FileSpreadsheet, Edit2, Trash2, Check } from 'lucide-react'

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
  const [step, setStep] = useState<'upload' | 'preview'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)

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
    onClose()
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
        </div>

        <div className="border-t p-6 flex items-center justify-between bg-gray-50">
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
              onClick={() => alert('Création des interventions - à implémenter')}
              disabled={interventions.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold"
            >
              <Check className="w-5 h-5" />
              Créer {interventions.length} intervention(s)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
