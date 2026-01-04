'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createChargeFixe } from '@/lib/firebase/charges-fixes'
import { getCategoriesActives, type CategorieDepense } from '@/lib/firebase/categories-depenses'
import { ArrowLeft, Save } from 'lucide-react'

export default function NouvelleChargePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CategorieDepense[]>([])
  
  const [formData, setFormData] = useState({
    nom: '',
    type: 'autre' as const,
    montant: 0,
    recurrence: 'mensuel' as const,
    jourPrelevement: 1,
    beneficiaire: '',
    siret: '',
    categorie: '',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    actif: true,
    notes: ''
  })

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const cats = await getCategoriesActives()
      setCategories(cats.filter(c => c.type === 'fixe'))
    } catch (error) {
      console.error('Erreur chargement catégories:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.nom.trim()) {
      alert('⚠️ Le nom est obligatoire')
      return
    }

    if (!formData.beneficiaire.trim()) {
      alert('⚠️ Le bénéficiaire est obligatoire')
      return
    }

    if (formData.montant <= 0) {
      alert('⚠️ Le montant doit être supérieur à 0')
      return
    }

    try {
      setLoading(true)
      await createChargeFixe(formData)
      alert('✅ Charge créée avec succès')
      router.push('/admin/finances/charges')
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  function getMontantMensuel(): number {
    if (formData.recurrence === 'mensuel') return formData.montant
    if (formData.recurrence === 'trimestriel') return formData.montant / 3
    if (formData.recurrence === 'annuel') return formData.montant / 12
    return formData.montant
  }

  function getMontantAnnuel(): number {
    if (formData.recurrence === 'mensuel') return formData.montant * 12
    if (formData.recurrence === 'trimestriel') return formData.montant * 4
    if (formData.recurrence === 'annuel') return formData.montant
    return formData.montant
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle Charge Fixe</h1>
          <p className="text-gray-600 mt-2">Créer une nouvelle charge récurrente</p>
        </div>
        <Link
          href="/admin/finances/charges"
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Informations de base */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Informations de base</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la charge *
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Loyer bureau, Assurance flotte, EDF..."
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="salaire">👥 Salaires</option>
                <option value="loyer">🏢 Loyer</option>
                <option value="assurance">🛡️ Assurance</option>
                <option value="abonnement">📱 Abonnement</option>
                <option value="location_vehicule">🚗 Location véhicule</option>
                <option value="credit">🏦 Crédit</option>
                <option value="autre">📋 Autre</option>
              </select>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie comptable
              </label>
              <select
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Aucune</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Montant et récurrence */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Montant et récurrence</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.montant || ''}
                  onChange={(e) => setFormData({ ...formData, montant: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
                <span className="absolute right-3 top-2.5 text-gray-500">€</span>
              </div>
            </div>

            {/* Récurrence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Récurrence *
              </label>
              <select
                value={formData.recurrence}
                onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mensuel">📅 Mensuel</option>
                <option value="trimestriel">📅 Trimestriel</option>
                <option value="annuel">📅 Annuel</option>
              </select>
            </div>

            {/* Jour de prélèvement */}
            {formData.recurrence === 'mensuel' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jour de prélèvement
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.jourPrelevement || ''}
                  onChange={(e) => setFormData({ ...formData, jourPrelevement: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-1">Jour du mois (1-31)</p>
              </div>
            )}

            {/* Calculs automatiques */}
            <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Coût mensuel</p>
                  <p className="text-xl font-bold text-blue-600">
                    {getMontantMensuel().toFixed(2)} €
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Coût annuel</p>
                  <p className="text-xl font-bold text-blue-600">
                    {getMontantAnnuel().toFixed(2)} €
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bénéficiaire */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Bénéficiaire</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom bénéficiaire */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du bénéficiaire *
              </label>
              <input
                type="text"
                value={formData.beneficiaire}
                onChange={(e) => setFormData({ ...formData, beneficiaire: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: EDF, BNP Paribas, Orange..."
                required
              />
            </div>

            {/* SIRET */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SIRET (optionnel)
              </label>
              <input
                type="text"
                value={formData.siret}
                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123 456 789 00012"
              />
            </div>
          </div>
        </div>

        {/* Période */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Période</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Date fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin (optionnelle)
              </label>
              <input
                type="date"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Laisser vide si charge permanente
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes / Description
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Informations complémentaires..."
          />
        </div>

        {/* Actif */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="actif"
            checked={formData.actif}
            onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
            className="w-5 h-5 text-blue-600"
          />
          <label htmlFor="actif" className="text-sm font-medium text-gray-700">
            Charge active (générera des écritures en trésorerie)
          </label>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 pt-4 border-t">
          <Link
            href="/admin/finances/charges"
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Création...' : 'Créer la charge'}
          </button>
        </div>
      </form>
    </div>
  )
}
