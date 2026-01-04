'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  getNoteDeFraisById, 
  updateNoteDeFrais,
  type NoteDeFrais 
} from '@/lib/firebase/notes-de-frais'
import { getAllEquipements } from '@/lib/firebase/stock-equipements'
import { ArrowLeft, Save } from 'lucide-react'

export default function ModifierNoteFraisPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [note, setNote] = useState<NoteDeFrais | null>(null)
  const [equipements, setEquipements] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    date: '',
    categorie: 'carburant' as 'carburant' | 'peage' | 'repas' | 'hebergement' | 'fournitures' | 'entretien' | 'autre',
    montantTTC: 0,
    tauxTVA: 20,
    tvaRecuperable: true,
    description: '',
    fournisseur: '',
    vehiculeId: '',
    vehiculeImmat: '',
    kmParcourus: 0,
  })

  useEffect(() => {
    if (params.id) {
      loadData()
    }
  }, [params.id])

  async function loadData() {
    try {
      setLoading(true)
      const [noteData, equips] = await Promise.all([
        getNoteDeFraisById(params.id as string),
        getAllEquipements()
      ])
      
      if (noteData) {
        setNote(noteData)
        setFormData({
          date: noteData.date,
          categorie: noteData.categorie,
          montantTTC: noteData.montantTTC,
          tauxTVA: noteData.tauxTVA,
          tvaRecuperable: noteData.tvaRecuperable,
          description: noteData.description,
          fournisseur: noteData.fournisseur || '',
          vehiculeId: noteData.vehiculeId || '',
          vehiculeImmat: noteData.vehiculeImmat || '',
          kmParcourus: noteData.kmParcourus || 0,
        })
      }
      
      setEquipements(equips.filter((e: any) => e.type === 'vehicule'))
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!note) return
    
    try {
      setSaving(true)
      await updateNoteDeFrais(note.id, formData)
      alert('✅ Note de frais modifiée')
      router.push(`/admin/finances/notes-frais/${note.id}`)
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('❌ Erreur : ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  function handleVehiculeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const vehiculeId = e.target.value
    const vehicule = equipements.find(v => v.id === vehiculeId)
    
    setFormData({
      ...formData,
      vehiculeId,
      vehiculeImmat: vehicule?.immatriculation || ''
    })
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
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-red-600">Note de frais introuvable</p>
        <Link href="/admin/finances/notes-frais" className="text-blue-600 hover:underline">
          ← Retour
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Modifier Note de Frais
          </h1>
          <p className="text-gray-600 mt-1">{note.numero}</p>
        </div>
        <Link
          href={`/admin/finances/notes-frais/${note.id}`}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Annuler
        </Link>
      </div>

      {/* Avertissement si validée/remboursée */}
      {(note.statut === 'validee' || note.statut === 'remboursee') && (
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-6">
          <p className="font-medium text-orange-800">
            ⚠️ Attention : Cette note est {note.statut}
          </p>
          <p className="text-sm text-orange-700 mt-1">
            Les modifications peuvent impacter les validations et remboursements déjà effectués.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        
        {/* Opérateur (lecture seule) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opérateur
          </label>
          <div className="w-full px-4 py-3 bg-gray-50 border rounded-lg">
            <p className="font-medium text-gray-900">{note.operateurNom}</p>
            <p className="text-sm text-gray-500">Non modifiable</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              required
              value={formData.categorie}
              onChange={(e) => setFormData({...formData, categorie: e.target.value as any})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="carburant">⛽ Carburant</option>
              <option value="peage">🛣️ Péage</option>
              <option value="repas">🍽️ Repas</option>
              <option value="hebergement">🏨 Hébergement</option>
              <option value="fournitures">📦 Fournitures</option>
              <option value="entretien">🔧 Entretien</option>
              <option value="autre">📋 Autre</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Montant TTC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant TTC (€) *
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.montantTTC}
              onChange={(e) => setFormData({...formData, montantTTC: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* TVA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taux TVA (%) *
            </label>
            <select
              required
              value={formData.tauxTVA}
              onChange={(e) => setFormData({...formData, tauxTVA: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="20">20% (Taux normal)</option>
              <option value="10">10% (Taux intermédiaire)</option>
              <option value="5.5">5.5% (Taux réduit)</option>
              <option value="0">0% (Non soumis)</option>
            </select>
          </div>
        </div>

        {/* Fournisseur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fournisseur
          </label>
          <input
            type="text"
            value={formData.fournisseur}
            onChange={(e) => setFormData({...formData, fournisseur: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Nom du fournisseur"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            placeholder="Description de la dépense"
          />
        </div>

        {/* Véhicule (si carburant ou péage) */}
        {(formData.categorie === 'carburant' || formData.categorie === 'peage') && (
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">🚗 Informations véhicule</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Véhicule
                </label>
                <select
                  value={formData.vehiculeId}
                  onChange={handleVehiculeChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Sélectionner un véhicule</option>
                  {equipements.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.immatriculation} - {v.marque} {v.modele}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Km parcourus
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.kmParcourus}
                  onChange={(e) => setFormData({...formData, kmParcourus: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* TVA récupérable */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="tvaRecuperable"
            checked={formData.tvaRecuperable}
            onChange={(e) => setFormData({...formData, tvaRecuperable: e.target.checked})}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <label htmlFor="tvaRecuperable" className="ml-2 text-sm text-gray-700">
            TVA récupérable
          </label>
        </div>

        {/* Boutons */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
          <Link
            href={`/admin/finances/notes-frais/${note.id}`}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
