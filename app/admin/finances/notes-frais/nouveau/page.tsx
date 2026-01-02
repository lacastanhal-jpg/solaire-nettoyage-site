'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createNoteDeFrais } from '@/lib/firebase/notes-de-frais'
import { getAllOperateurs, type Operateur } from '@/lib/firebase/operateurs'
import { getAllEquipements } from '@/lib/firebase/stock-equipements'
import { uploadFile } from '@/lib/firebase/storage'

// ✨ NOUVEAU - Imports OCR
interface OCRResult {
  success: boolean
  confidence: number
  data: {
    montantTTC?: number
    date?: string
    fournisseur?: string
    categorie?: 'carburant' | 'peage' | 'repas' | 'hebergement' | 'fournitures' | 'entretien' | 'autre'
  }
  texteComplet: string
  erreur?: string
}

export default function NouvelleNoteFraisPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [operateurs, setOperateurs] = useState<Operateur[]>([])
  const [equipements, setEquipements] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    operateurId: '',
    operateurNom: '',
    date: new Date().toISOString().split('T')[0],
    categorie: 'carburant' as const,
    montantTTC: 0,
    tauxTVA: 20,
    tvaRecuperable: true,
    description: '',
    fournisseur: '',
    vehiculeId: '',
    vehiculeImmat: '',
    kmParcourus: 0,
    statut: 'brouillon' as const
  })
  
  const [fichiers, setFichiers] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  // ✨ NOUVEAU - États OCR
  const [modeOCR, setModeOCR] = useState(false)
  const [ocrEnCours, setOcrEnCours] = useState(false)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [photoBase64, setPhotoBase64] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [ops, equips] = await Promise.all([
        getAllOperateurs(),
        getAllEquipements()
      ])
      setOperateurs(ops)
      setEquipements(equips.filter((e: any) => e.type === 'vehicule'))
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.operateurId) {
      alert('⚠️ Sélectionnez un opérateur')
      return
    }
    
    if (formData.montantTTC <= 0) {
      alert('⚠️ Le montant doit être supérieur à 0')
      return
    }
    
    try {
      setLoading(true)
      
      // Upload justificatifs
      let justificatifs: any[] = []
      if (fichiers.length > 0) {
        setUploading(true)
        for (const fichier of fichiers) {
          const url = await uploadFile(fichier, `notes-frais/${Date.now()}_${fichier.name}`)
          justificatifs.push({
            type: fichier.type.includes('pdf') ? 'pdf' : 'image',
            url,
            nom: fichier.name
          })
        }
        setUploading(false)
      }
      
      const noteId = await createNoteDeFrais({
        ...formData,
        justificatifs
      })
      
      alert('✅ Note de frais créée')
      router.push(`/admin/finances/notes-frais/${noteId}`)
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la création')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  // ✨ NOUVEAU - Handler OCR
  async function handlePhotoOCR(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      setOcrEnCours(true)
      
      // 1. Convertir en base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      const base64 = await base64Promise
      setPhotoBase64(base64)
      
      // 2. Appeler API OCR
      const response = await fetch('/api/ocr/analyze-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setOcrResult(result)
        
        // 3. Pré-remplir le formulaire avec les données OCR
        if (result.data.date) {
          setFormData(prev => ({ ...prev, date: result.data.date }))
        }
        if (result.data.montantTTC) {
          setFormData(prev => ({ ...prev, montantTTC: result.data.montantTTC }))
        }
        if (result.data.fournisseur) {
          setFormData(prev => ({ ...prev, fournisseur: result.data.fournisseur }))
        }
        if (result.data.categorie) {
          setFormData(prev => ({ ...prev, categorie: result.data.categorie }))
        }
        
        // 4. Ajouter le fichier aux justificatifs
        setFichiers([file])
        
        alert(`✅ OCR terminé (confiance: ${result.confidence}%)`)
      } else {
        alert('⚠️ OCR échoué: ' + (result.erreur || 'Erreur inconnue'))
        setOcrResult(null)
      }
    } catch (error) {
      console.error('Erreur OCR:', error)
      alert('❌ Erreur OCR')
      setOcrResult(null)
    } finally {
      setOcrEnCours(false)
    }
  }

  const handleOperateurChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const opId = e.target.value
    const op = operateurs.find(o => o.id === opId)
    setFormData({
      ...formData,
      operateurId: opId,
      operateurNom: op ? `${op.prenom} ${op.nom}` : ''
    })
  }

  const handleVehiculeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vId = e.target.value
    const v = equipements.find((eq: any) => eq.id === vId)
    setFormData({
      ...formData,
      vehiculeId: vId,
      vehiculeImmat: v ? v.immatriculation : ''
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          Nouvelle Note de Frais
          <span className="text-sm font-normal bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            ✨ OCR Activé
          </span>
        </h1>
        <p className="text-gray-600 mt-2">Créer une nouvelle demande de remboursement</p>
      </div>

      {/* ✨ NOUVEAU - SECTION OCR */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
              📸 Création rapide par photo (OCR)
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Prenez une photo du ticket → Données extraites automatiquement en 2 secondes
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModeOCR(!modeOCR)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              modeOCR 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
            }`}
          >
            {modeOCR ? '🔼 Masquer OCR' : '📸 Activer OCR'}
          </button>
        </div>
        
        {modeOCR && (
          <div className="space-y-4">
            {/* Zone upload photo */}
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-white hover:bg-blue-50 transition-all">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoOCR}
                disabled={ocrEnCours}
                className="hidden"
                id="photo-ocr"
              />
              <label
                htmlFor="photo-ocr"
                className="cursor-pointer block"
              >
                {ocrEnCours ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-blue-900 font-medium text-lg">
                      Analyse en cours...
                    </p>
                    <p className="text-blue-600 text-sm mt-2">
                      Google Vision traite votre ticket
                    </p>
                  </div>
                ) : photoBase64 ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={photoBase64} 
                      alt="Ticket" 
                      className="max-h-48 rounded-lg mb-4 border-2 border-blue-200"
                    />
                    <p className="text-sm text-blue-600 font-medium">
                      ✅ Photo chargée - Cliquez pour en prendre une autre
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-100 rounded-full p-6 mb-4">
                      <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-xl font-bold text-blue-900 mb-2">
                      Prendre une photo du ticket
                    </p>
                    <p className="text-sm text-blue-600 mb-4">
                      📱 Sur mobile : Ouvre l&apos;appareil photo<br />
                      💻 Sur PC : Sélectionne un fichier
                    </p>
                    <div className="flex gap-4 text-xs text-blue-700 bg-blue-50 rounded-lg p-3">
                      <span>✅ Bon éclairage</span>
                      <span>✅ Ticket à plat</span>
                      <span>✅ Texte lisible</span>
                    </div>
                  </div>
                )}
              </label>
            </div>
            
            {/* Résultat OCR */}
            {ocrResult && (
              <div className="bg-white border-2 border-blue-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-blue-900 text-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Résultat OCR
                  </h4>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    ocrResult.confidence >= 80 ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                    ocrResult.confidence >= 60 ? 'bg-orange-100 text-orange-700 border-2 border-orange-300' :
                    'bg-red-100 text-red-700 border-2 border-red-300'
                  }`}>
                    Confiance: {ocrResult.confidence}%
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">📅 Date :</span>
                    <span className={`font-bold ${ocrResult.data.date ? 'text-green-700' : 'text-red-700'}`}>
                      {ocrResult.data.date ? new Date(ocrResult.data.date).toLocaleDateString('fr-FR') : '❌ Non détectée'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">💰 Montant TTC :</span>
                    <span className={`font-bold ${ocrResult.data.montantTTC ? 'text-green-700' : 'text-red-700'}`}>
                      {ocrResult.data.montantTTC ? `${ocrResult.data.montantTTC.toFixed(2)} €` : '❌ Non détecté'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">🏪 Fournisseur :</span>
                    <span className={`font-bold ${ocrResult.data.fournisseur ? 'text-green-700' : 'text-red-700'}`}>
                      {ocrResult.data.fournisseur || '❌ Non détecté'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">📂 Catégorie :</span>
                    <span className={`font-bold capitalize ${ocrResult.data.categorie && ocrResult.data.categorie !== 'autre' ? 'text-green-700' : 'text-orange-700'}`}>
                      {ocrResult.data.categorie || '❌ Non détectée'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-blue-100">
                  <p className="text-xs text-blue-700 bg-blue-50 rounded p-3 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>
                      <strong>Les champs ci-dessus ont été pré-remplis automatiquement.</strong><br />
                      Vérifiez attentivement les données et complétez si nécessaire avant de soumettre.
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORMULAIRE MANUEL */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {modeOCR && ocrResult ? '✅ Vérifier et compléter' : 'Informations'}
        </h3>

        {/* Opérateur */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opérateur *
          </label>
          <select
            required
            value={formData.operateurId}
            onChange={handleOperateurChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Sélectionner un opérateur</option>
            {operateurs.map(op => (
              <option key={op.id} value={op.id}>
                {op.prenom} {op.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
              <option value="autre">📄 Autre</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Montant TTC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant TTC *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.montantTTC}
              onChange={(e) => setFormData({...formData, montantTTC: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Taux TVA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taux TVA (%)
            </label>
            <select
              value={formData.tauxTVA}
              onChange={(e) => setFormData({...formData, tauxTVA: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="0">0%</option>
              <option value="5.5">5.5%</option>
              <option value="10">10%</option>
              <option value="20">20%</option>
            </select>
          </div>

          {/* TVA récupérable */}
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.tvaRecuperable}
                onChange={(e) => setFormData({...formData, tvaRecuperable: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">
                TVA récupérable
              </span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            placeholder="Décrivez la dépense..."
          />
        </div>

        {/* Fournisseur */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fournisseur (optionnel)
          </label>
          <input
            type="text"
            value={formData.fournisseur}
            onChange={(e) => setFormData({...formData, fournisseur: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Ex: Total, Auchan, Vinci Autoroutes..."
          />
        </div>

        {/* Section Véhicule (si carburant ou péage) */}
        {(formData.categorie === 'carburant' || formData.categorie === 'peage') && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-4">Informations Véhicule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Véhicule
                </label>
                <select
                  value={formData.vehiculeId}
                  onChange={handleVehiculeChange}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="">Sélectionner un véhicule</option>
                  {equipements.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.immatriculation} - {v.modele}
                    </option>
                  ))}
                </select>
              </div>

              {formData.categorie === 'carburant' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Km parcourus
                  </label>
                  <input
                    type="number"
                    value={formData.kmParcourus}
                    onChange={(e) => setFormData({...formData, kmParcourus: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload justificatifs */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Justificatifs (photos ou PDF)
          </label>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={(e) => setFichiers(Array.from(e.target.files || []))}
            className="w-full px-3 py-2 border rounded-lg"
          />
          {fichiers.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {fichiers.length} fichier{fichiers.length > 1 ? 's' : ''} sélectionné{fichiers.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Statut */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            value={formData.statut}
            onChange={(e) => setFormData({...formData, statut: e.target.value as any})}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="brouillon">💾 Brouillon (modifier plus tard)</option>
            <option value="soumise">📤 Soumettre pour validation</option>
          </select>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? '📤 Upload en cours...' : loading ? 'Création...' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  )
}
