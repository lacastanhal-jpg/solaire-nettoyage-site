'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAvoirById, updateAvoir } from '@/lib/firebase/avoirs'

export default function ModifierAvoirPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avoir, setAvoir] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    motif: '',
    notes: '',
    statut: 'brouillon' as 'brouillon' | 'envoye' | 'applique' | 'rembourse'
  })

  useEffect(() => {
    loadAvoir()
  }, [params.id])

  async function loadAvoir() {
    try {
      const data = await getAvoirById(params.id as string)
      if (!data) {
        router.push('/admin/finances/avoirs')
        return
      }
      setAvoir(data)
      setFormData({
        motif: data.motif,
        notes: data.notes || '',
        statut: data.statut
      })
    } catch (error) {
      console.error('Erreur chargement avoir:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.motif.trim()) {
      alert('Le motif est obligatoire')
      return
    }
    
    setSaving(true)
    
    try {
      await updateAvoir(avoir.id, {
        motif: formData.motif,
        notes: formData.notes,
        statut: formData.statut
      })
      
      alert('✅ Avoir modifié avec succès !')
      router.push(`/admin/finances/avoirs/${avoir.id}`)
    } catch (error) {
      console.error('Erreur modification avoir:', error)
      alert('❌ Erreur lors de la modification')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-xl text-gray-900 font-semibold">Chargement...</div>
      </div>
    )
  }

  if (!avoir) {
    return (
      <div className="p-8">
        <div className="text-xl text-red-700 font-semibold">Avoir introuvable</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Modifier Avoir {avoir.numero}</h1>
        <p className="text-gray-700 mt-1">Client : {avoir.clientNom}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* INFORMATIONS */}
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-300">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informations</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Motif de l'avoir *
              </label>
              <input
                type="text"
                required
                value={formData.motif}
                onChange={(e) => setFormData({...formData, motif: e.target.value})}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Statut *
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({...formData, statut: e.target.value as any})}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-600"
              >
                <option value="brouillon">Brouillon</option>
                <option value="envoye">Envoyé</option>
                <option value="applique">Appliqué</option>
                <option value="rembourse">Remboursé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Notes internes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900"
                placeholder="Notes visibles uniquement en interne..."
              />
            </div>
          </div>
        </div>

        {/* RÉCAPITULATIF (non modifiable) */}
        <div className="bg-gray-100 p-6 rounded-lg border border-gray-400 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Récapitulatif (non modifiable)</h2>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-700 font-medium">Date :</span>
              <span className="text-gray-900 ml-2">{new Date(avoir.date).toLocaleDateString('fr-FR')}</span>
            </div>
            <div>
              <span className="text-gray-700 font-medium">Montant TTC :</span>
              <span className="text-red-700 font-bold ml-2">
                {Math.abs(avoir.totalTTC).toFixed(2)} €
              </span>
            </div>
            <div>
              <span className="text-gray-700 font-medium">Type :</span>
              <span className="text-gray-900 ml-2">
                {avoir.utilisationType === 'deduction' ? 'Déduction' : 'Remboursement'}
              </span>
            </div>
            {avoir.factureOrigineNumero && (
              <div>
                <span className="text-gray-700 font-medium">Facture origine :</span>
                <span className="text-gray-900 ml-2">{avoir.factureOrigineNumero}</span>
              </div>
            )}
          </div>
        </div>

        {/* BOUTONS */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-gray-400 text-gray-900 rounded-lg hover:bg-gray-100 font-semibold"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-semibold disabled:bg-gray-500"
          >
            {saving ? 'Enregistrement...' : '✅ Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}
