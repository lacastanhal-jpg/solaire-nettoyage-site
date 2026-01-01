'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { db, storage } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { ArrowLeft, Upload, FileText, Calendar, MapPin, User, DollarSign } from 'lucide-react'
import { calculerPrixIntervention, genererFactureFromIntervention } from '@/lib/workflows/intervention-to-facture'
import { getPrestationsActives } from '@/lib/firebase/prestations-catalogue'
import type { PrestationCatalogue } from '@/lib/types/tarification'
import type { ResultatCalculPrix } from '@/lib/types/tarification'

interface Rapport {
  numeroIntervention: string
  dateIntervention: string
  technicien: string
  typeIntervention: string
  materiel: string[]
  eauUtilisee: string[]
  niveauEncrassement: string
  typeEncrassement: string[]
  detailsEncrassement: string
  pdfUrl: string
  uploadedAt: string
}

interface Intervention {
  id: string
  siteId: string
  siteName: string
  clientId: string
  clientName: string
  groupeId: string
  dateDebut: string
  dateFin: string
  heureDebut: string
  heureFin: string
  surface: number
  type: string
  statut: string
  equipeId: number
  notes?: string
  rapport?: Rapport
  factureId?: string
  factureNumero?: string
  factureLe?: string
  facturePar?: string
}

export default function DetailInterventionPage() {
  const router = useRouter()
  const params = useParams()
  const interventionId = params.id as string

  const [intervention, setIntervention] = useState<Intervention | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // États génération facture
  const [showModalFacture, setShowModalFacture] = useState(false)
  const [prestations, setPrestations] = useState<PrestationCatalogue[]>([])
  const [prestationSelectionnee, setPrestationSelectionnee] = useState<string>('NETT-STANDARD')
  const [calculEnCours, setCalculEnCours] = useState(false)
  const [resultatCalcul, setResultatCalcul] = useState<ResultatCalculPrix | null>(null)
  const [prixManuel, setPrixManuel] = useState<number | null>(null)
  const [generationEnCours, setGenerationEnCours] = useState(false)

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'admin') {
      router.push('/intranet/login')
      return
    }
    loadIntervention()
    loadPrestations()
  }, [interventionId, router])

  const loadPrestations = async () => {
    try {
      const data = await getPrestationsActives()
      setPrestations(data)
    } catch (error) {
      console.error('Erreur chargement prestations:', error)
    }
  }

  const loadIntervention = async () => {
    try {
      const docRef = doc(db, 'interventions_calendar', interventionId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        setIntervention({ id: docSnap.id, ...docSnap.data() } as Intervention)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      alert('⚠️ Veuillez sélectionner un fichier PDF')
    }
  }

  const handleUploadRapport = async () => {
    if (!selectedFile || !intervention) return

    setUploading(true)

    try {
      // 1. Upload PDF vers Firebase Storage
      const storageRef = ref(storage, `rapports/${interventionId}/${selectedFile.name}`)
      await uploadBytes(storageRef, selectedFile)
      const pdfUrl = await getDownloadURL(storageRef)

      // 2. Parser le PDF
      const formData = new FormData()
      formData.append('file', selectedFile)

      const parseResponse = await fetch('/api/rapports/parse-pdf', {
        method: 'POST',
        body: formData,
      })

      const parseData = await parseResponse.json()

      if (!parseData.success) {
        throw new Error(parseData.error || 'Erreur parsing PDF')
      }

      // 3. Sauvegarder les données dans Firestore
      const rapport: Rapport = {
        ...parseData.data,
        pdfUrl,
        uploadedAt: new Date().toISOString(),
      }

      await updateDoc(doc(db, 'interventions_calendar', interventionId), {
        rapport,
        statut: 'Terminée',
        updatedAt: new Date(),
      })

      alert('✅ Rapport uploadé avec succès !')
      setSelectedFile(null)
      loadIntervention()
    } catch (error: any) {
      console.error('Erreur upload:', error)
      alert(`❌ Erreur: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleOuvrirModalFacture = async () => {
    if (!intervention) return
    
    setShowModalFacture(true)
    setResultatCalcul(null)
    setPrixManuel(null)
    
    // Calculer le prix automatiquement
    await handleCalculerPrix()
  }

  const handleCalculerPrix = async () => {
    if (!intervention) return
    
    try {
      setCalculEnCours(true)
      
      const userName = localStorage.getItem('user_name') || 'Admin'
      
      const resultat = await calculerPrixIntervention(
        interventionId,
        prestationSelectionnee,
        [], // Majorations (TODO: permettre sélection)
        [], // Remises (TODO: permettre sélection)
        userName
      )
      
      setResultatCalcul(resultat)
      setPrixManuel(resultat.detail.totalHT)
      
    } catch (error: any) {
      console.error('Erreur calcul prix:', error)
      alert(`❌ ${error.message || 'Erreur lors du calcul du prix'}`)
    } finally {
      setCalculEnCours(false)
    }
  }

  const handleGenererFacture = async () => {
    if (!intervention || !resultatCalcul) return
    
    if (!confirm(
      `Générer la facture pour cette intervention ?\n\n` +
      `Montant HT: ${prixManuel?.toFixed(2)}€\n` +
      `Total TTC: ${((prixManuel || 0) * (1 + resultatCalcul.detail.tauxTVA / 100)).toFixed(2)}€`
    )) {
      return
    }
    
    try {
      setGenerationEnCours(true)
      
      const userName = localStorage.getItem('user_name') || 'Admin'
      
      const factureId = await genererFactureFromIntervention(
        interventionId,
        resultatCalcul.detail,
        prixManuel || undefined,
        [], // Lignes supplémentaires (TODO: permettre ajout)
        userName
      )
      
      alert('✅ Facture générée avec succès !')
      setShowModalFacture(false)
      
      // Recharger l'intervention pour afficher la facture liée
      await loadIntervention()
      
      // Rediriger vers la facture
      router.push(`/admin/factures/${factureId}`)
      
    } catch (error: any) {
      console.error('Erreur génération facture:', error)
      alert(`❌ ${error.message || 'Erreur lors de la génération'}`)
    } finally {
      setGenerationEnCours(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-gray-900 text-xl font-bold">⏳ Chargement...</div>
      </div>
    )
  }

  if (!intervention) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-red-900 text-xl font-bold">❌ Intervention non trouvée</div>
      </div>
    )
  }

  const getEquipeCouleur = (equipeId: number) => {
    switch (equipeId) {
      case 1: return 'bg-red-100 text-red-900 border-red-300'
      case 2: return 'bg-blue-100 text-blue-900 border-blue-300'
      case 3: return 'bg-green-100 text-green-900 border-green-300'
      default: return 'bg-gray-100 text-gray-900 border-gray-300'
    }
  }

  const getStatutCouleur = (statut: string) => {
    switch (statut) {
      case 'Planifiée': return 'bg-blue-100 text-blue-900'
      case 'En cours': return 'bg-yellow-100 text-yellow-900'
      case 'Terminée': return 'bg-green-100 text-green-900'
      default: return 'bg-gray-100 text-gray-900'
    }
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/calendrier')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-6 h-6 text-gray-900" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Détail Intervention</h1>
                <p className="text-sm text-gray-900 font-medium">{intervention.siteName}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte principale */}
            <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-1 rounded-full text-sm font-bold border-2 ${getEquipeCouleur(intervention.equipeId)}`}>
                  {intervention.equipeId === 1 ? '🔴' : intervention.equipeId === 2 ? '🔵' : '🟢'} Équipe {intervention.equipeId}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatutCouleur(intervention.statut)}`}>
                  {intervention.statut}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {intervention.clientName} - {intervention.siteName}
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Période</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(intervention.dateDebut).toLocaleDateString('fr-FR')}
                      {intervention.dateDebut !== intervention.dateFin && (
                        <> → {new Date(intervention.dateFin).toLocaleDateString('fr-FR')}</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Surface</p>
                    <p className="text-gray-900 font-medium">{intervention.surface}m²</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Horaires</p>
                    <p className="text-gray-900 font-medium">
                      {intervention.heureDebut} - {intervention.heureFin}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Type</p>
                    <p className="text-gray-900 font-medium">{intervention.type}</p>
                  </div>
                </div>
              </div>

              {intervention.notes && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-bold text-blue-900 mb-1">📝 Notes</p>
                  <p className="text-gray-900">{intervention.notes}</p>
                </div>
              )}
            </div>

            {/* Rapport PDF */}
            {intervention.rapport ? (
              <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📄 Rapport d'intervention</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-bold text-gray-900">N° Intervention:</span>
                      <p className="text-gray-900">{intervention.rapport.numeroIntervention}</p>
                    </div>
                    <div>
                      <span className="font-bold text-gray-900">Date:</span>
                      <p className="text-gray-900">{intervention.rapport.dateIntervention}</p>
                    </div>
                    <div>
                      <span className="font-bold text-gray-900">Technicien:</span>
                      <p className="text-gray-900">{intervention.rapport.technicien}</p>
                    </div>
                    <div>
                      <span className="font-bold text-gray-900">Type:</span>
                      <p className="text-gray-900">{intervention.rapport.typeIntervention}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-bold text-gray-900">Matériel:</span>
                      <p className="text-gray-900">{intervention.rapport.materiel.join(', ')}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-bold text-gray-900">Eau utilisée:</span>
                      <p className="text-gray-900">{intervention.rapport.eauUtilisee.join(', ')}</p>
                    </div>
                    <div>
                      <span className="font-bold text-gray-900">Encrassement:</span>
                      <p className="text-gray-900">{intervention.rapport.niveauEncrassement}</p>
                    </div>
                    <div>
                      <span className="font-bold text-gray-900">Type encrassement:</span>
                      <p className="text-gray-900">{intervention.rapport.typeEncrassement.join(', ')}</p>
                    </div>
                    {intervention.rapport.detailsEncrassement && (
                      <div className="col-span-2">
                        <span className="font-bold text-gray-900">Détails:</span>
                        <p className="text-gray-900">{intervention.rapport.detailsEncrassement}</p>
                      </div>
                    )}
                  </div>

                  <a
                    href={intervention.rapport.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
                  >
                    <FileText className="w-5 h-5" />
                    Voir le PDF complet
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📤 Upload rapport PDF</h3>
                
                <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                        <p className="font-bold text-blue-900">Fichier sélectionné:</p>
                        <p className="text-blue-900 font-medium">{selectedFile.name}</p>
                      </div>
                      
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="px-6 py-2 border-2 border-gray-400 rounded-lg hover:bg-gray-100 text-gray-900 font-bold"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleUploadRapport}
                          disabled={uploading}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:opacity-50"
                        >
                          {uploading ? '⏳ Upload...' : '✅ Envoyer'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-900 font-bold mb-4">
                        Sélectionnez le rapport PDF Praxedo
                      </p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label
                        htmlFor="pdf-upload"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 font-bold"
                      >
                        <Upload className="w-5 h-5" />
                        Choisir fichier PDF
                      </label>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar actions */}
          <div className="space-y-4">
            {/* Facture */}
            {intervention.factureId ? (
              <div className="bg-green-50 rounded-xl shadow-lg border-2 border-green-200 p-6">
                <h3 className="text-lg font-bold text-green-900 mb-2">✅ Facturée</h3>
                <p className="text-sm text-green-800 mb-3">
                  Facture {intervention.factureNumero}
                </p>
                <p className="text-xs text-green-700 mb-4">
                  Générée le {intervention.factureLe ? new Date(intervention.factureLe).toLocaleDateString('fr-FR') : ''}
                </p>
                <a
                  href={`/admin/factures/${intervention.factureId}`}
                  className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 font-bold"
                >
                  📄 Voir facture
                </a>
              </div>
            ) : intervention.statut === 'Terminée' && (
              <div className="bg-blue-50 rounded-xl shadow-lg border-2 border-blue-200 p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-2">💰 Facturation</h3>
                <p className="text-sm text-blue-800 mb-4">
                  Cette intervention peut être facturée
                </p>
                <button
                  onClick={handleOuvrirModalFacture}
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 font-bold"
                >
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Générer facture
                </button>
              </div>
            )}
            
            <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">⚙️ Actions</h3>
              <div className="space-y-2">
                <a
                  href={`/admin/interventions/${interventionId}/modifier`}
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 font-bold"
                >
                  ✏️ Modifier
                </a>
                <button
                  onClick={() => router.push('/admin/calendrier')}
                  className="block w-full px-4 py-2 bg-gray-600 text-white text-center rounded-lg hover:bg-gray-700 font-bold"
                >
                  ← Retour calendrier
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Modal Génération Facture */}
      {showModalFacture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">💰 Génération Facture Client</h2>
              <p className="text-gray-600 mt-1">
                {intervention?.siteName} - {intervention?.surface} m²
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Sélection prestation */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Type de prestation
                </label>
                <select
                  value={prestationSelectionnee}
                  onChange={(e) => {
                    setPrestationSelectionnee(e.target.value)
                    setResultatCalcul(null)
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  {prestations.map(p => (
                    <option key={p.id} value={p.code}>
                      {p.code} - {p.libelle} ({p.prixBase}€/{p.unite})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bouton calcul */}
              <button
                onClick={handleCalculerPrix}
                disabled={calculEnCours}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:bg-gray-400"
              >
                {calculEnCours ? '⏳ Calcul en cours...' : '🔄 (Re)calculer le prix'}
              </button>

              {/* Résultat calcul */}
              {resultatCalcul && (
                <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-blue-900 mb-4">📊 Détail du calcul</h3>
                  
                  {/* Grille utilisée */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600">Grille tarifaire appliquée</p>
                    <p className="font-bold text-gray-900">{resultatCalcul.detail.grilleNom}</p>
                    {resultatCalcul.messageInfo && (
                      <p className="text-sm text-blue-700 mt-1">ℹ️ {resultatCalcul.messageInfo}</p>
                    )}
                  </div>

                  {/* Éléments calcul */}
                  <div className="space-y-2 mb-4">
                    {resultatCalcul.detail.elements.map((elem, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <div>
                          <div className="font-medium text-gray-900">{elem.libelle}</div>
                          {elem.base && elem.prix && (
                            <div className="text-xs text-gray-600">
                              {elem.base.toLocaleString()} × {elem.prix.toFixed(2)}€
                            </div>
                          )}
                        </div>
                        <div className={`font-bold ${elem.type === 'remise' ? 'text-green-600' : elem.type === 'majoration' ? 'text-orange-600' : 'text-gray-900'}`}>
                          {elem.montant >= 0 ? '+' : ''}{elem.montant.toFixed(2)}€
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Prix modifiable */}
                  <div className="bg-white rounded-lg p-4">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Prix HT (modifiable)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={prixManuel || ''}
                      onChange={(e) => setPrixManuel(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-bold text-lg"
                    />
                  </div>

                  {/* Totaux */}
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-900">
                        <span>Total HT:</span>
                        <span className="font-bold">{(prixManuel || 0).toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between text-gray-900">
                        <span>TVA ({resultatCalcul.detail.tauxTVA}%):</span>
                        <span className="font-bold">
                          {((prixManuel || 0) * (resultatCalcul.detail.tauxTVA / 100)).toFixed(2)}€
                        </span>
                      </div>
                      <div className="flex justify-between text-lg border-t-2 border-blue-300 pt-2">
                        <span className="font-bold text-gray-900">Total TTC:</span>
                        <span className="font-black text-blue-600 text-xl">
                          {((prixManuel || 0) * (1 + resultatCalcul.detail.tauxTVA / 100)).toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t-2 border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModalFacture(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold text-gray-900"
              >
                Annuler
              </button>
              <button
                onClick={handleGenererFacture}
                disabled={!resultatCalcul || generationEnCours}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:bg-gray-400"
              >
                {generationEnCours ? '⏳ Génération...' : '✅ Créer la facture'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
