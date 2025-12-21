'use client'

import { useState } from 'react'
import { X, Save, Calculator } from 'lucide-react'
import { SocieteType, StatutProjetType, ResponsableType } from '@/lib/gely/types'

interface ModalCreationProjetProps {
  onClose: () => void
  onSave: (projet: any) => void
}

const SOCIETES: { value: SocieteType; label: string }[] = [
  { value: 'sciGely', label: 'SCI GELY' },
  { value: 'lexa', label: 'LEXA' },
  { value: 'lexa2', label: 'LEXA 2' },
  { value: 'solaireNettoyage', label: 'SOLAIRE NETTOYAGE' }
]

const STATUTS: { value: StatutProjetType; label: string }[] = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'developement', label: 'Développement' },
  { value: 'termine', label: 'Terminé' },
  { value: 'suspendu', label: 'Suspendu' }
]

const RESPONSABLES: { value: ResponsableType; label: string }[] = [
  { value: 'Jerome GELY', label: 'Jérôme GELY' },
  { value: 'Axel GELY', label: 'Axel GELY' }
]

// CLASSE UNIQUE POUR TOUS LES INPUTS - NOIR SUR BLANC
const INPUT_CLASS = "w-full px-4 py-3 bg-white text-black font-bold text-lg border-4 border-black rounded-lg focus:border-blue-600 focus:outline-none placeholder:text-black placeholder:opacity-50"

export default function ModalCreationProjet({ onClose, onSave }: ModalCreationProjetProps) {
  const [formData, setFormData] = useState({
    nom: '',
    societe: 'lexa2' as SocieteType,
    responsable: 'Axel GELY' as ResponsableType,
    statut: 'developement' as StatutProjetType,
    budgetTotal: '',
    description: '',
    puissanceKWc: '',
    tarifEDF: '',
    surfaceM2: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const revenusCalcules = formData.puissanceKWc && formData.tarifEDF
    ? (parseFloat(formData.puissanceKWc) * parseFloat(formData.tarifEDF) * 1120).toFixed(0)
    : null

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.nom.trim()) newErrors.nom = 'Obligatoire'
    if (!formData.budgetTotal || parseFloat(formData.budgetTotal) <= 0) newErrors.budgetTotal = 'Obligatoire'
    if (!formData.description.trim()) newErrors.description = 'Obligatoire'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const nouveauProjet = {
      id: `proj_${Date.now()}`,
      nom: formData.nom,
      societe: formData.societe,
      responsable: formData.responsable,
      statut: formData.statut,
      budgetTotal: parseFloat(formData.budgetTotal),
      description: formData.description,
      ...(formData.puissanceKWc && { puissanceKWc: parseFloat(formData.puissanceKWc) }),
      ...(formData.tarifEDF && { tarifEDF: parseFloat(formData.tarifEDF) }),
      ...(formData.surfaceM2 && { surfaceM2: parseFloat(formData.surfaceM2) }),
      ...(revenusCalcules && { revenusAnnuels: parseFloat(revenusCalcules) }),
      totalDevis: 0,
      totalFactures: 0,
      totalPaye: 0,
      totalAPayer: 0,
      reste: parseFloat(formData.budgetTotal),
      dateDebut: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onSave(nouveauProjet)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-black">
        
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold">NOUVEAU PROJET</h2>
          <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded-lg">
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Form */}
        <div className="p-8 space-y-8">
          
          {/* Nom */}
          <div>
            <label className="block text-xl font-bold text-black mb-2">Nom du projet *</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => updateField('nom', e.target.value)}
              className={INPUT_CLASS}
              placeholder="Ex: Projet 500 kWc"
            />
            {errors.nom && <p className="text-red-600 font-bold mt-1">{errors.nom}</p>}
          </div>

          {/* Société + Responsable */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xl font-bold text-black mb-2">Société *</label>
              <select value={formData.societe} onChange={(e) => updateField('societe', e.target.value)} className={INPUT_CLASS}>
                {SOCIETES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xl font-bold text-black mb-2">Responsable *</label>
              <select value={formData.responsable} onChange={(e) => updateField('responsable', e.target.value)} className={INPUT_CLASS}>
                {RESPONSABLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>

          {/* Statut + Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xl font-bold text-black mb-2">Statut *</label>
              <select value={formData.statut} onChange={(e) => updateField('statut', e.target.value)} className={INPUT_CLASS}>
                {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xl font-bold text-black mb-2">Budget (€) *</label>
              <input
                type="number"
                value={formData.budgetTotal}
                onChange={(e) => updateField('budgetTotal', e.target.value)}
                className={INPUT_CLASS}
                placeholder="346600"
              />
              {errors.budgetTotal && <p className="text-red-600 font-bold mt-1">{errors.budgetTotal}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xl font-bold text-black mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className={INPUT_CLASS}
              placeholder="Description du projet..."
            />
            {errors.description && <p className="text-red-600 font-bold mt-1">{errors.description}</p>}
          </div>

          {/* Données techniques */}
          <div className="border-4 border-yellow-500 bg-yellow-100 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-black mb-4">Données techniques (optionnel)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-lg font-bold text-black mb-2">Puissance (kWc)</label>
                <input type="number" step="0.01" value={formData.puissanceKWc} onChange={(e) => updateField('puissanceKWc', e.target.value)} className={INPUT_CLASS} placeholder="500" />
              </div>
              <div>
                <label className="block text-lg font-bold text-black mb-2">Tarif EDF (€/kWh)</label>
                <input type="number" step="0.001" value={formData.tarifEDF} onChange={(e) => updateField('tarifEDF', e.target.value)} className={INPUT_CLASS} placeholder="0.137" />
              </div>
              <div>
                <label className="block text-lg font-bold text-black mb-2">Surface (m²)</label>
                <input type="number" value={formData.surfaceM2} onChange={(e) => updateField('surfaceM2', e.target.value)} className={INPUT_CLASS} placeholder="2496" />
              </div>
            </div>

            {revenusCalcules && (
              <div className="mt-4 bg-green-200 border-4 border-green-600 rounded-lg p-4">
                <p className="text-xl font-bold text-black">
                  Revenus annuels : <span className="text-green-700">{parseFloat(revenusCalcules).toLocaleString('fr-FR')} € / an</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-8 py-6 border-t-4 border-black flex justify-end space-x-4">
          <button onClick={onClose} className="px-8 py-4 bg-white text-black border-4 border-black rounded-lg font-bold text-xl hover:bg-gray-100">
            ANNULER
          </button>
          <button onClick={handleSubmit} className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-xl hover:bg-blue-700 flex items-center space-x-2">
            <Save className="w-6 h-6" />
            <span>CRÉER</span>
          </button>
        </div>
      </div>
    </div>
  )
}
