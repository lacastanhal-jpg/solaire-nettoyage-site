'use client'

import { useState, ChangeEvent, FormEvent, DragEvent } from 'react'
import { Upload, X, FileText } from 'lucide-react'
import { uploadDocument, SocieteType, DocumentType, StatutType, DocumentMetadata } from '@/lib/firebase/documents'

const SOCIETES = [
  { id: 'sciGely' as SocieteType, nom: 'SCI GELY' },
  { id: 'lexa' as SocieteType, nom: 'LEXA' },
  { id: 'lexa2' as SocieteType, nom: 'LEXA 2' },
  { id: 'solaireNettoyage' as SocieteType, nom: 'SOLAIRE NETTOYAGE' }
]

const TYPES = [
  { id: 'facture' as DocumentType, nom: 'Facture' },
  { id: 'devis' as DocumentType, nom: 'Devis' },
  { id: 'contrat' as DocumentType, nom: 'Contrat' },
  { id: 'administratif' as DocumentType, nom: 'Administratif' },
  { id: 'permis' as DocumentType, nom: 'Permis / Autorisation' },
  { id: 'autre' as DocumentType, nom: 'Autre' }
]

const STATUTS = [
  { id: 'paye' as StatutType, nom: 'Payé ✅' },
  { id: 'a_payer' as StatutType, nom: 'À payer ⏰' },
  { id: 'en_cours' as StatutType, nom: 'En cours 🔄' },
  { id: 'signe' as StatutType, nom: 'Signé ✍️' },
  { id: 'brouillon' as StatutType, nom: 'Brouillon 📝' }
]

interface FormDataType {
  societe: SocieteType
  projet: string
  type: DocumentType
  statut: StatutType
  nom: string
  fournisseur: string
  numero: string
  montantHT: string
  montantTTC: string
  date: string
  echeance: string
  notes: string
}

interface UploadDocumentProps {
  onClose: () => void
  onSuccess: () => void
}

export default function UploadDocument({ onClose, onSuccess }: UploadDocumentProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormDataType>({
    societe: 'lexa2',
    projet: '',
    type: 'facture',
    statut: 'a_payer',
    nom: '',
    fournisseur: '',
    numero: '',
    montantHT: '',
    montantTTC: '',
    date: new Date().toISOString().split('T')[0],
    echeance: '',
    notes: ''
  })

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (!formData.nom) {
        setFormData({ ...formData, nom: selectedFile.name.replace(/\.[^/.]+$/, '') })
      }
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      if (!formData.nom) {
        setFormData({ ...formData, nom: droppedFile.name.replace(/\.[^/.]+$/, '') })
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      alert('Veuillez sélectionner un fichier')
      return
    }

    setLoading(true)

    try {
      const metadata: DocumentMetadata = {
        ...formData,
        montantHT: parseFloat(formData.montantHT) || undefined,
        montantTTC: parseFloat(formData.montantTTC) || undefined,
        uploadedBy: 'admin'
      }

      await uploadDocument(file, metadata)
      
      alert('Document uploadé avec succès !')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erreur upload:', error)
      alert('Erreur lors de l\'upload du document')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl flex justify-between items-center">
          <h2 className="text-2xl font-bold">Ajouter un document</h2>
          <button onClick={onClose} className="hover:bg-blue-700 p-2 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            {file ? (
              <div className="flex items-center justify-center space-x-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">Cliquez ou glissez un fichier ici</p>
                <p className="text-sm text-gray-500 mt-1">PDF, JPG, PNG (max 10MB)</p>
              </div>
            )}
            <input
              id="file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du document *</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Facture MECOJIT 12343"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Société *</label>
              <select
                required
                value={formData.societe}
                onChange={(e) => setFormData({ ...formData, societe: e.target.value as SocieteType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {SOCIETES.map(s => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as DocumentType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut *</label>
              <select
                required
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as StatutType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {STATUTS.map(s => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Projet (optionnel)</label>
              <input
                type="text"
                value={formData.projet}
                onChange={(e) => setFormData({ ...formData, projet: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Projet 500 kWc"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
              <input
                type="text"
                value={formData.fournisseur}
                onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: MECOJIT"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° Document</label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 12343"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant HT (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.montantHT}
                onChange={(e) => setFormData({ ...formData, montantHT: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant TTC (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.montantTTC}
                onChange={(e) => setFormData({ ...formData, montantTTC: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Échéance (si applicable)</label>
              <input
                type="date"
                value={formData.echeance}
                onChange={(e) => setFormData({ ...formData, echeance: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Remarques, détails supplémentaires..."
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Upload en cours...' : 'Ajouter le document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
