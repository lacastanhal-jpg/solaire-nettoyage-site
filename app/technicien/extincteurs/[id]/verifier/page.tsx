'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getExtincteurById, createVerification, type Extincteur, type VerificationExtincteur } from '@/lib/firebase/extincteurs'
import SignatureCanvas from 'react-signature-canvas'

export default function VerifierExtincteurPage() {
  const router = useRouter()
  const params = useParams()
  const signatureRef = useRef<any>(null)
  const [extincteur, setExtincteur] = useState<(Extincteur & { id: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [technicienNom, setTechnicienNom] = useState('')
  const [technicienEntreprise, setTechnicienEntreprise] = useState('')
  
  const [formData, setFormData] = useState({
    typeControle: 'Annuel' as VerificationExtincteur['typeControle'],
    manometreOk: true,
    manometreObservation: '',
    plombageOk: true,
    plombageObservation: '',
    signalisationOk: true,
    signalisationObservation: '',
    etatGeneralOk: true,
    etatGeneralObservation: '',
    accessibiliteOk: true,
    accessibiliteObservation: '',
    marquageOk: true,
    marquageObservation: '',
    poidsOk: true,
    poidsObservation: '',
    observations: '',
    actionsRecommandees: '',
    prochainControle: '',
    prochaineMaintenance: ''
  })

  const [photos, setPhotos] = useState<string[]>([])
  const [showSignature, setShowSignature] = useState(false)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('technicien_logged_in')
    if (!isLoggedIn) {
      router.push('/technicien/login')
      return
    }
    
    setTechnicienNom(localStorage.getItem('technicien_nom') || '')
    setTechnicienEntreprise(localStorage.getItem('technicien_entreprise') || '')
    loadExtincteur()
  }, [params.id, router])

  const loadExtincteur = async () => {
    try {
      setLoading(true)
      const data = await getExtincteurById(params.id as string)
      if (data) {
        setExtincteur(data)
        
        // Calculer la prochaine date de contrôle (1 an par défaut)
        const nextDate = new Date()
        nextDate.setFullYear(nextDate.getFullYear() + 1)
        setFormData(prev => ({
          ...prev,
          prochainControle: nextDate.toISOString().split('T')[0]
        }))
      } else {
        alert('Extincteur introuvable')
        router.push('/technicien/extincteurs')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos(prev => [...prev, event.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.prochainControle) {
      alert('Veuillez indiquer la date du prochain contrôle')
      return
    }

    setSaving(true)

    try {
      // Récupérer la signature si présente
      let signatureUrl = ''
      if (showSignature && signatureRef.current && !signatureRef.current.isEmpty()) {
        signatureUrl = signatureRef.current.toDataURL()
      }

      // Calculer si conforme
      const conforme = formData.manometreOk && 
                       formData.plombageOk && 
                       formData.signalisationOk && 
                       formData.etatGeneralOk && 
                       formData.accessibiliteOk && 
                       formData.marquageOk && 
                       formData.poidsOk

      const verification: Omit<VerificationExtincteur, 'id' | 'createdAt'> = {
        extincteurId: extincteur!.id!,
        extincteurNumero: extincteur!.numero,
        technicienNom,
        technicienEntreprise,
        dateVerification: new Date().toISOString().split('T')[0],
        typeControle: formData.typeControle,
        manometreOk: formData.manometreOk,
        manometreObservation: formData.manometreObservation,
        plombageOk: formData.plombageOk,
        plombageObservation: formData.plombageObservation,
        signalisationOk: formData.signalisationOk,
        signalisationObservation: formData.signalisationObservation,
        etatGeneralOk: formData.etatGeneralOk,
        etatGeneralObservation: formData.etatGeneralObservation,
        accessibiliteOk: formData.accessibiliteOk,
        accessibiliteObservation: formData.accessibiliteObservation,
        marquageOk: formData.marquageOk,
        marquageObservation: formData.marquageObservation,
        poidsOk: formData.poidsOk,
        poidsObservation: formData.poidsObservation,
        conforme,
        observations: formData.observations,
        actionsRecommandees: formData.actionsRecommandees,
        photos: photos.length > 0 ? photos : undefined,
        signatureUrl: signatureUrl || undefined,
        prochainControle: formData.prochainControle,
        prochaineMaintenance: formData.prochaineMaintenance || undefined
      }

      await createVerification(verification)
      
      alert('✅ Vérification enregistrée avec succès !')
      router.push('/technicien/extincteurs')
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    )
  }

  if (!extincteur) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-orange-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/technicien/extincteurs')}
              className="text-2xl hover:opacity-80"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">
                🧯 Vérification EXT-{extincteur.numero}
              </h1>
              <p className="text-sm opacity-90">{extincteur.emplacement}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Infos extincteur */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Informations</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium">{extincteur.type}</span>
              </div>
              <div>
                <span className="text-gray-600">Capacité:</span>
                <span className="ml-2 font-medium">{extincteur.capacite}</span>
              </div>
              <div>
                <span className="text-gray-600">Installation:</span>
                <span className="ml-2 font-medium">
                  {new Date(extincteur.dateInstallation).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Statut actuel:</span>
                <span className={`ml-2 font-medium ${
                  extincteur.statut === 'Conforme' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {extincteur.statut}
                </span>
              </div>
            </div>
          </div>

          {/* Type de contrôle */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🔧 Type de contrôle</h2>
            <select
              value={formData.typeControle}
              onChange={(e) => setFormData({ ...formData, typeControle: e.target.value as any })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
            >
              <option value="Annuel">Annuel</option>
              <option value="Semestriel">Semestriel</option>
              <option value="Trimestriel">Trimestriel</option>
              <option value="Mise en service">Mise en service</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Recharge">Recharge</option>
            </select>
          </div>

          {/* Points de contrôle */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">✅ Points de contrôle</h2>
            <div className="space-y-6">
              {/* Manomètre */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-gray-900">1. Manomètre</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.manometreOk === true}
                        onChange={() => setFormData({ ...formData, manometreOk: true })}
                        className="mr-2"
                      />
                      <span className="text-green-700 font-medium">✅ OK</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.manometreOk === false}
                        onChange={() => setFormData({ ...formData, manometreOk: false })}
                        className="mr-2"
                      />
                      <span className="text-red-700 font-medium">❌ NOK</span>
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Observation (optionnel)"
                  value={formData.manometreObservation}
                  onChange={(e) => setFormData({ ...formData, manometreObservation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Plombage */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-gray-900">2. Plombage / Goupille</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.plombageOk === true}
                        onChange={() => setFormData({ ...formData, plombageOk: true })}
                        className="mr-2"
                      />
                      <span className="text-green-700 font-medium">✅ OK</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.plombageOk === false}
                        onChange={() => setFormData({ ...formData, plombageOk: false })}
                        className="mr-2"
                      />
                      <span className="text-red-700 font-medium">❌ NOK</span>
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Observation (optionnel)"
                  value={formData.plombageObservation}
                  onChange={(e) => setFormData({ ...formData, plombageObservation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Signalisation */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-gray-900">3. Signalisation</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.signalisationOk === true}
                        onChange={() => setFormData({ ...formData, signalisationOk: true })}
                        className="mr-2"
                      />
                      <span className="text-green-700 font-medium">✅ OK</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.signalisationOk === false}
                        onChange={() => setFormData({ ...formData, signalisationOk: false })}
                        className="mr-2"
                      />
                      <span className="text-red-700 font-medium">❌ NOK</span>
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Observation (optionnel)"
                  value={formData.signalisationObservation}
                  onChange={(e) => setFormData({ ...formData, signalisationObservation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* État général */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-gray-900">4. État général</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.etatGeneralOk === true}
                        onChange={() => setFormData({ ...formData, etatGeneralOk: true })}
                        className="mr-2"
                      />
                      <span className="text-green-700 font-medium">✅ OK</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.etatGeneralOk === false}
                        onChange={() => setFormData({ ...formData, etatGeneralOk: false })}
                        className="mr-2"
                      />
                      <span className="text-red-700 font-medium">❌ NOK</span>
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Observation (optionnel)"
                  value={formData.etatGeneralObservation}
                  onChange={(e) => setFormData({ ...formData, etatGeneralObservation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Accessibilité */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-gray-900">5. Accessibilité</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.accessibiliteOk === true}
                        onChange={() => setFormData({ ...formData, accessibiliteOk: true })}
                        className="mr-2"
                      />
                      <span className="text-green-700 font-medium">✅ OK</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.accessibiliteOk === false}
                        onChange={() => setFormData({ ...formData, accessibiliteOk: false })}
                        className="mr-2"
                      />
                      <span className="text-red-700 font-medium">❌ NOK</span>
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Observation (optionnel)"
                  value={formData.accessibiliteObservation}
                  onChange={(e) => setFormData({ ...formData, accessibiliteObservation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Marquage */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-gray-900">6. Marquage / Étiquette</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.marquageOk === true}
                        onChange={() => setFormData({ ...formData, marquageOk: true })}
                        className="mr-2"
                      />
                      <span className="text-green-700 font-medium">✅ OK</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.marquageOk === false}
                        onChange={() => setFormData({ ...formData, marquageOk: false })}
                        className="mr-2"
                      />
                      <span className="text-red-700 font-medium">❌ NOK</span>
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Observation (optionnel)"
                  value={formData.marquageObservation}
                  onChange={(e) => setFormData({ ...formData, marquageObservation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Poids */}
              <div className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-gray-900">7. Poids / Charge</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.poidsOk === true}
                        onChange={() => setFormData({ ...formData, poidsOk: true })}
                        className="mr-2"
                      />
                      <span className="text-green-700 font-medium">✅ OK</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.poidsOk === false}
                        onChange={() => setFormData({ ...formData, poidsOk: false })}
                        className="mr-2"
                      />
                      <span className="text-red-700 font-medium">❌ NOK</span>
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Observation (optionnel)"
                  value={formData.poidsObservation}
                  onChange={(e) => setFormData({ ...formData, poidsObservation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Observations générales */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📝 Observations</h2>
            <textarea
              placeholder="Observations générales (optionnel)..."
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            
            <div className="mt-4">
              <label className="block font-medium text-gray-900 mb-2">
                Actions recommandées (optionnel)
              </label>
              <textarea
                placeholder="Actions à prévoir..."
                value={formData.actionsRecommandees}
                onChange={(e) => setFormData({ ...formData, actionsRecommandees: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📸 Photos (optionnel)</h2>
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handlePhotoCapture}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
            />
            
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Signature */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🖊️ Signature (optionnel)</h2>
            <button
              type="button"
              onClick={() => setShowSignature(!showSignature)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mb-4"
            >
              {showSignature ? 'Masquer' : 'Ajouter'} la signature
            </button>
            
            {showSignature && (
              <div>
                <div className="border border-gray-300 rounded-lg mb-2">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: 'w-full h-48',
                      style: { touchAction: 'none' }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm"
                >
                  Effacer la signature
                </button>
              </div>
            )}
          </div>

          {/* Prochains contrôles */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📅 Prochains contrôles</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  Prochain contrôle * <span className="text-red-600">Obligatoire</span>
                </label>
                <input
                  type="date"
                  value={formData.prochainControle}
                  onChange={(e) => setFormData({ ...formData, prochainControle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  Prochaine maintenance (optionnel)
                </label>
                <input
                  type="date"
                  value={formData.prochaineMaintenance}
                  onChange={(e) => setFormData({ ...formData, prochaineMaintenance: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-lg font-bold text-lg disabled:opacity-50"
            >
              {saving ? '⏳ Enregistrement...' : '✅ Valider la vérification'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/technicien/extincteurs')}
              className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
            >
              Annuler
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
