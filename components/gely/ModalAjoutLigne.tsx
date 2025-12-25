'use client'

import { useState } from 'react'
import { X, Upload, FileText } from 'lucide-react'
import { LigneFinanciere, TypeLigneFinanciereType, StatutLigneType } from '@/lib/gely/types'

const INPUT_CLASS = "px-3 py-2 border-2 border-black bg-white text-black font-semibold rounded-lg w-full placeholder-gray-500"
const LABEL_CLASS = "block text-sm font-bold text-black mb-1"

const TYPES_LABELS: Record<TypeLigneFinanciereType, string> = {
  devis: 'Devis',
  facture: 'Facture',
  revenu: 'Revenu',
  autre: 'Autre'
}

const STATUTS_LABELS: Record<StatutLigneType, string> = {
  paye: 'Payé',
  a_payer: 'À payer',
  en_cours: 'En cours',
  signe: 'Signé',
  annule: 'Annulé'
}

interface ModalAjoutLigneProps {
  onClose: () => void
  onSubmit: (ligne: LigneFinanciere, fichier?: File) => void
}

export default function ModalAjoutLigne({ onClose, onSubmit }: ModalAjoutLigneProps) {
  const [formData, setFormData] = useState({
    type: 'facture' as TypeLigneFinanciereType,
    fournisseur: '',
    numero: '',
    description: '',
    montantHT: '',
    montantTTC: '',
    statut: 'a_payer' as StatutLigneType,
    date: new Date().toISOString().split('T')[0],
    echeance: '',
    notes: ''
  })

  const [fichier, setFichier] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier que c'est un PDF
      if (file.type !== 'application/pdf') {
        setErrors({ ...errors, fichier: 'Seuls les fichiers PDF sont acceptés' })
        return
      }
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, fichier: 'Le fichier ne doit pas dépasser 10 MB' })
        return
      }
      setFichier(file)
      setErrors({ ...errors, fichier: '' })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fournisseur.trim()) {
      newErrors.fournisseur = 'Le fournisseur est obligatoire'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire'
    }
    if (!formData.montantHT || parseFloat(formData.montantHT) <= 0) {
      newErrors.montantHT = 'Le montant HT doit être supérieur à 0'
    }
    if (!formData.montantTTC || parseFloat(formData.montantTTC) <= 0) {
      newErrors.montantTTC = 'Le montant TTC doit être supérieur à 0'
    }
    if (!formData.date) {
      newErrors.date = 'La date est obligatoire'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const nouvelleLigne: any = {
      id: `ligne_${Date.now()}`,
      type: formData.type,
      fournisseur: formData.fournisseur.trim(),
      description: formData.description.trim(),
      montantHT: parseFloat(formData.montantHT),
      montantTTC: parseFloat(formData.montantTTC),
      statut: formData.statut,
      date: formData.date
    }

    // Ajouter les champs optionnels SEULEMENT s'ils sont remplis
    if (formData.numero.trim()) {
      nouvelleLigne.numero = formData.numero.trim()
    }
    if (formData.echeance) {
      nouvelleLigne.echeance = formData.echeance
    }
    if (formData.notes.trim()) {
      nouvelleLigne.notes = formData.notes.trim()
    }

    onSubmit(nouvelleLigne, fichier || undefined)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl flex items-center justify-between">
          <h2 className="text-2xl font-bold">➕ Ajouter une ligne financière</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Type et Statut */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Type *</label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className={INPUT_CLASS}
              >
                {Object.entries(TYPES_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Statut *</label>
              <select
                value={formData.statut}
                onChange={(e) => handleChange('statut', e.target.value)}
                className={INPUT_CLASS}
              >
                {Object.entries(STATUTS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fournisseur et Numéro */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Fournisseur *</label>
              <input
                type="text"
                value={formData.fournisseur}
                onChange={(e) => handleChange('fournisseur', e.target.value)}
                placeholder="Ex: MECOJIT"
                className={INPUT_CLASS}
              />
              {errors.fournisseur && (
                <p className="text-red-600 text-sm mt-1 font-bold">{errors.fournisseur}</p>
              )}
            </div>
            <div>
              <label className={LABEL_CLASS}>N° Facture/Devis</label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) => handleChange('numero', e.target.value)}
                placeholder="Ex: 12345"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={LABEL_CLASS}>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Ex: Installation panneaux solaires 250 kWc"
              rows={3}
              className={INPUT_CLASS}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1 font-bold">{errors.description}</p>
            )}
          </div>

          {/* Montants */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Montant HT (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.montantHT}
                onChange={(e) => handleChange('montantHT', e.target.value)}
                placeholder="0.00"
                className={INPUT_CLASS}
              />
              {errors.montantHT && (
                <p className="text-red-600 text-sm mt-1 font-bold">{errors.montantHT}</p>
              )}
            </div>
            <div>
              <label className={LABEL_CLASS}>Montant TTC (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.montantTTC}
                onChange={(e) => handleChange('montantTTC', e.target.value)}
                placeholder="0.00"
                className={INPUT_CLASS}
              />
              {errors.montantTTC && (
                <p className="text-red-600 text-sm mt-1 font-bold">{errors.montantTTC}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={INPUT_CLASS}
              />
              {errors.date && (
                <p className="text-red-600 text-sm mt-1 font-bold">{errors.date}</p>
              )}
            </div>
            <div>
              <label className={LABEL_CLASS}>Échéance (si applicable)</label>
              <input
                type="date"
                value={formData.echeance}
                onChange={(e) => handleChange('echeance', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={LABEL_CLASS}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Notes supplémentaires..."
              rows={2}
              className={INPUT_CLASS}
            />
          </div>

          {/* Upload PDF */}
          <div className="bg-blue-100 border-2 border-blue-600 rounded-lg p-4">
            <label className={LABEL_CLASS}>
              <FileText className="w-5 h-5 inline mr-2" />
              Document PDF (facultatif)
            </label>
            <div className="mt-2">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                <Upload className="w-5 h-5" />
                <span>Choisir un fichier PDF</span>
              </label>
              {fichier && (
                <div className="mt-2 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-black">{fichier.name}</span>
                  <button
                    onClick={() => setFichier(null)}
                    className="text-red-600 hover:text-red-800 font-bold text-sm"
                  >
                    ✕ Supprimer
                  </button>
                </div>
              )}
              {errors.fichier && (
                <p className="text-red-600 text-sm mt-1 font-bold">{errors.fichier}</p>
              )}
              <p className="text-xs text-gray-900 mt-1">Max 10 MB - Format PDF uniquement</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 p-6 rounded-b-xl flex items-center justify-end space-x-3 border-t-2 border-gray-500">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-1000 text-white rounded-lg font-bold hover:bg-gray-600 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition flex items-center space-x-2"
          >
            <span>✓ Ajouter</span>
          </button>
        </div>
      </div>
    </div>
  )
}