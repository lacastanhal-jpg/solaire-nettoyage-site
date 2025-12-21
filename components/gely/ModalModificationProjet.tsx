'use client'

import { useState, useEffect } from 'react'
import { X, Save, Calculator } from 'lucide-react'
import { Projet, SocieteType, StatutProjetType, ResponsableType } from '@/lib/gely/types'

interface ModalModificationProjetProps {
  projet: Projet
  onClose: () => void
  onSave: (projet: Projet) => void
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

const INPUT_CLASS = "w-full px-4 py-3 bg-white text-black font-bold text-lg border-4 border-black rounded-lg focus:border-blue-600 focus:outline-none placeholder:text-black placeholder:opacity-50"

export default function ModalModificationProjet({ projet, onClose, onSave }: ModalModificationProjetProps) {
  const [formData, setFormData] = useState({
    nom: projet.nom,
    societe: projet.societe,
    responsable: projet.responsable,
    statut: projet.statut,
    budgetTotal: projet.budgetTotal.toString(),
    description: projet.description,
    puissanceKWc: projet.puissanceKWc?.toString() || '',
    tarifEDF: projet.tarifEDF?.toString() || '',
    surfaceM2: projet.surfaceM2?.toString() || ''
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

    const budgetTotal = parseFloat(formData.budgetTotal)
    const ancienBudget = projet.budgetTotal
    const diffBudget = budgetTotal - ancienBudget
    
    const projetModifie: Projet = {
      ...projet,
      nom: formData.nom,
      societe: formData.societe,
      responsable: formData.responsable,
      statut: formData.statut,
      budgetTotal: budgetTotal,
      description: formData.description,
      puissanceKWc: formData.puissanceKWc ? parseFloat(formData.puissanceKWc) : undefined,
      tarifEDF: formData.tarifEDF ? parseFloat(formData.tarifEDF) : undefined,
      surfaceM2: formData.surfaceM2 ? parseFloat(formData.surfaceM2) : undefined,
      revenusAnnuels: revenusCalcules ? parseFloat(revenusCalcules) : undefined,
      reste: projet.reste + diffBudget,
      updatedAt: new Date().toISOString()
    }

    onSave(projetModifie)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-black">
        
        {/* Header */}
        <div className="sticky top-0 bg-yellow-500 text-black p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold">MODIFIER PROJET</h2>
          <button onClick={onClose} className="p-2 hover:bg-yellow-400 rounded-lg">
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
              />
              {errors.budgetTotal && <p className="text-red-600 font-bold mt-1">{errors.budgetTotal}</p>}
              {formData.budgetTotal && parseFloat(formData.budgetTotal) !== projet.budgetTotal && (
                <p className="text-blue-600 font-bold mt-1">
                  Différence: {(parseFloat(formData.budgetTotal) - projet.budgetTotal) > 0 ? '+' : ''}
                  {(parseFloat(formData.budgetTotal) - projet.budgetTotal).toLocaleString('fr-FR')} €
                </p>
              )}
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
            />
            {errors.description && <p className="text-red-600 font-bold mt-1">{errors.description}</p>}
          </div>

          {/* Données techniques */}
          <div className="border-4 border-yellow-500 bg-yellow-100 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-black mb-4">Données techniques (optionnel)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-lg font-bold text-black mb-2">Puissance (kWc)</label>
                <input type="number" step="0.01" value={formData.puissanceKWc} onChange={(e) => updateField('puissanceKWc', e.target.value)} className={INPUT_CLASS} />
              </div>
              <div>
                <label className="block text-lg font-bold text-black mb-2">Tarif EDF (€/kWh)</label>
                <input type="number" step="0.001" value={formData.tarifEDF} onChange={(e) => updateField('tarifEDF', e.target.value)} className={INPUT_CLASS} />
              </div>
              <div>
                <label className="block text-lg font-bold text-black mb-2">Surface (m²)</label>
                <input type="number" value={formData.surfaceM2} onChange={(e) => updateField('surfaceM2', e.target.value)} className={INPUT_CLASS} />
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

          {/* Infos projet */}
          <div className="bg-blue-100 border-4 border-blue-600 rounded-lg p-4">
            <h3 className="text-lg font-bold text-black mb-2">Informations financières actuelles</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-black font-bold">Payé</p>
                <p className="text-green-700 font-bold text-xl">{projet.totalPaye.toLocaleString('fr-FR')} €</p>
              </div>
              <div>
                <p className="text-black font-bold">À payer</p>
                <p className="text-yellow-700 font-bold text-xl">{projet.totalAPayer.toLocaleString('fr-FR')} €</p>
              </div>
              <div>
                <p className="text-black font-bold">Reste</p>
                <p className="text-blue-700 font-bold text-xl">{projet.reste.toLocaleString('fr-FR')} €</p>
              </div>
              <div>
                <p className="text-black font-bold">% Réalisé</p>
                <p className="text-purple-700 font-bold text-xl">
                  {((projet.totalPaye / projet.budgetTotal) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-8 py-6 border-t-4 border-black flex justify-end space-x-4">
          <button onClick={onClose} className="px-8 py-4 bg-white text-black border-4 border-black rounded-lg font-bold text-xl hover:bg-gray-100">
            ANNULER
          </button>
          <button onClick={handleSubmit} className="px-8 py-4 bg-yellow-500 text-black rounded-lg font-bold text-xl hover:bg-yellow-400 flex items-center space-x-2 border-4 border-black">
            <Save className="w-6 h-6" />
            <span>ENREGISTRER</span>
          </button>
        </div>
      </div>
    </div>
  )
}
