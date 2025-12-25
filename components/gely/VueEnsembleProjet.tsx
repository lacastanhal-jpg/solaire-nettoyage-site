'use client'

import { useState, useEffect } from 'react'
import { doc, updateDoc, collection, addDoc, getDocs, deleteDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Building2, Zap, FileText, Users, AlertCircle, Calendar, TrendingUp, ArrowRightLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import { Projet } from '@/lib/gely/types'

interface VueEnsembleProjetProps {
  projet: Projet
  onUpdate?: () => void
}

interface FluxInterSociete {
  id: string
  nom: string
  type: 'loyer' | 'prestation' | 'autre'
  societeSource: string  // Société qui REÇOIT l'argent
  societeCible: string   // Société qui PAIE l'argent
  montantAnnuel: number
  avecInflation: boolean
}

export default function VueEnsembleProjet({ projet, onUpdate }: VueEnsembleProjetProps) {
  const formatNumber = (num: number) => num.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR')

  // Calculer ROI si données PV
  const roi = projet.revenusAnnuels ? (projet.budgetTotal / projet.revenusAnnuels).toFixed(1) : null

  // ✅ CORRECTION: Charger les flux depuis la collection GLOBALE Firebase
  const [flux, setFlux] = useState<FluxInterSociete[]>([])
  const [loading, setLoading] = useState(true)
  const [showModalFlux, setShowModalFlux] = useState(false)
  const [fluxEnEdition, setFluxEnEdition] = useState<FluxInterSociete | null>(null)
  const [nouveauFlux, setNouveauFlux] = useState<Partial<FluxInterSociete>>({
    nom: '',
    type: 'loyer',
    societeSource: '',
    societeCible: '',
    montantAnnuel: 0,
    avecInflation: true
  })

  const societes = ['SCI GELY', 'LEXA', 'LEXA 2', 'Solaire Nettoyage', 'GELY INVESTISSEMENT']

  // Charger TOUS les flux depuis Firebase
  useEffect(() => {
    const chargerFlux = async () => {
      try {
        setLoading(true)
        const fluxSnapshot = await getDocs(collection(db, 'flux_intersocietes'))
        const tousLesFlux: FluxInterSociete[] = []
        
        fluxSnapshot.forEach(doc => {
          tousLesFlux.push({ id: doc.id, ...doc.data() } as FluxInterSociete)
        })
        
        setFlux(tousLesFlux)
      } catch (error) {
        console.error('Erreur chargement flux:', error)
        setFlux([])
      } finally {
        setLoading(false)
      }
    }
    
    chargerFlux()
  }, [])

  const ouvrirModalAjout = () => {
    setFluxEnEdition(null)
    setNouveauFlux({
      nom: '',
      type: 'loyer',
      societeSource: '',
      societeCible: '',
      montantAnnuel: 0,
      avecInflation: true
    })
    setShowModalFlux(true)
  }

  const ouvrirModalEdition = (f: FluxInterSociete) => {
    setFluxEnEdition(f)
    setNouveauFlux(f)
    setShowModalFlux(true)
  }

  // ✅ CORRECTION: Sauvegarder dans la collection GLOBALE Firebase
  const enregistrerFlux = async () => {
    if (!nouveauFlux.nom || !nouveauFlux.societeSource || !nouveauFlux.societeCible || !nouveauFlux.montantAnnuel) {
      alert('❌ Remplissez tous les champs')
      return
    }

    try {
      if (fluxEnEdition) {
        // Modifier un flux existant
        await setDoc(doc(db, 'flux_intersocietes', fluxEnEdition.id), {
          nom: nouveauFlux.nom,
          type: nouveauFlux.type,
          societeSource: nouveauFlux.societeSource,
          societeCible: nouveauFlux.societeCible,
          montantAnnuel: nouveauFlux.montantAnnuel,
          avecInflation: nouveauFlux.avecInflation,
          updatedAt: new Date().toISOString()
        })
        
        // Mettre à jour l'état local
        setFlux(flux.map(f => 
          f.id === fluxEnEdition.id 
            ? { ...nouveauFlux, id: f.id } as FluxInterSociete 
            : f
        ))
      } else {
        // Créer un nouveau flux
        const docRef = await addDoc(collection(db, 'flux_intersocietes'), {
          nom: nouveauFlux.nom,
          type: nouveauFlux.type,
          societeSource: nouveauFlux.societeSource,
          societeCible: nouveauFlux.societeCible,
          montantAnnuel: nouveauFlux.montantAnnuel,
          avecInflation: nouveauFlux.avecInflation,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        
        // Ajouter à l'état local
        const newFlux: FluxInterSociete = {
          id: docRef.id,
          nom: nouveauFlux.nom!,
          type: nouveauFlux.type!,
          societeSource: nouveauFlux.societeSource!,
          societeCible: nouveauFlux.societeCible!,
          montantAnnuel: nouveauFlux.montantAnnuel!,
          avecInflation: nouveauFlux.avecInflation!
        }
        setFlux([...flux, newFlux])
      }

      setShowModalFlux(false)
      
      if (onUpdate) onUpdate()
      
      alert('✅ Flux sauvegardé !')
    } catch (error) {
      console.error('Erreur sauvegarde flux:', error)
      alert('❌ Erreur lors de la sauvegarde')
    }
  }

  // ✅ CORRECTION: Supprimer depuis la collection GLOBALE Firebase
  const supprimerFlux = async (id: string) => {
    if (!confirm('Supprimer ce flux ?')) return

    try {
      await deleteDoc(doc(db, 'flux_intersocietes', id))
      setFlux(flux.filter(f => f.id !== id))
      
      if (onUpdate) onUpdate()
      
      alert('✅ Flux supprimé !')
    } catch (error) {
      console.error('Erreur suppression flux:', error)
      alert('❌ Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-6">
      {/* INFORMATIONS GÉNÉRALES */}
      <div className="bg-blue-100 border-4 border-blue-500 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          INFORMATIONS GÉNÉRALES
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-bold text-black">Nom du projet</p>
            <p className="text-xl font-bold text-black">{projet.nom}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-black">Responsable</p>
            <p className="text-xl font-bold text-black">{projet.responsable}</p>
          </div>
          {projet.adresse && (
            <div className="col-span-2">
              <p className="text-sm font-bold text-black">Adresse</p>
              <p className="text-lg font-bold text-black">{projet.adresse}</p>
            </div>
          )}
          <div className="col-span-2">
            <p className="text-sm font-bold text-black">Description</p>
            <p className="text-lg text-black">{projet.description}</p>
          </div>
        </div>
      </div>

      {/* Données techniques PV - seulement si projet photovoltaïque */}
      {projet.puissanceKWc && projet.puissanceKWc > 0 && (
        <div className="bg-yellow-100 border-4 border-yellow-500 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
            <Zap className="w-6 h-6 mr-2" />
            DONNÉES TECHNIQUES PHOTOVOLTAÏQUE
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border-2 border-yellow-500">
              <p className="text-sm font-bold text-black">Puissance installée</p>
              <p className="text-3xl font-bold text-yellow-700">{projet.puissanceKWc} kWc</p>
            </div>
            {projet.productionAnnuelleKWh && (
              <div className="bg-white p-4 rounded-lg border-2 border-yellow-500">
                <p className="text-sm font-bold text-black">Production estimée</p>
                <p className="text-3xl font-bold text-green-700">{formatNumber(projet.productionAnnuelleKWh)} kWh/an</p>
              </div>
            )}
            {projet.revenusAnnuels && (
              <div className="bg-white p-4 rounded-lg border-2 border-yellow-500">
                <p className="text-sm font-bold text-black">Revenus annuels</p>
                <p className="text-3xl font-bold text-green-700">{formatNumber(projet.revenusAnnuels)} €/an</p>
              </div>
            )}
            {roi && (
              <div className="bg-white p-4 rounded-lg border-2 border-yellow-500">
                <p className="text-sm font-bold text-black">ROI estimé</p>
                <p className="text-3xl font-bold text-blue-700">{roi} ans</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Données immobilier */}
      {projet.surfaceM2 && (
        <div className="bg-green-100 border-4 border-green-500 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
            <Building2 className="w-6 h-6 mr-2" />
            DONNÉES IMMOBILIER
          </h3>
          <div className="bg-white p-4 rounded-lg border-2 border-green-500">
            <p className="text-sm font-bold text-black">Surface totale</p>
            <p className="text-3xl font-bold text-green-700">{formatNumber(projet.surfaceM2)} m²</p>
          </div>
        </div>
      )}

      {/* FLUX INTER-SOCIÉTÉS */}
      <div className="bg-orange-100 border-4 border-orange-600 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-black flex items-center">
            <ArrowRightLeft className="w-6 h-6 mr-2" />
            FLUX INTER-SOCIÉTÉS (TOUS)
          </h3>
          <button
            onClick={ouvrirModalAjout}
            className="px-4 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un flux</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white p-6 rounded-lg border-2 border-orange-600 text-center">
            <p className="text-gray-600">Chargement des flux...</p>
          </div>
        ) : flux.length === 0 ? (
          <div className="bg-white p-6 rounded-lg border-2 border-orange-600 text-center">
            <p className="text-gray-600">Aucun flux inter-sociétés défini</p>
            <p className="text-sm text-gray-500 mt-2">Cliquez sur "Ajouter un flux" pour commencer</p>
          </div>
        ) : (
          <div className="space-y-3">
            {flux.map((f) => (
              <div key={f.id} className="bg-white p-4 rounded-lg border-2 border-orange-600">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-orange-600 text-white font-bold rounded-lg text-sm uppercase">
                        {f.type}
                      </span>
                      <span className="text-xl font-bold text-black">{f.nom}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-lg">
                      <span className="font-bold text-red-700">{f.societeCible}</span>
                      <span className="text-gray-600">→ paie →</span>
                      <span className="font-bold text-green-700">{f.societeSource}</span>
                    </div>
                    {f.avecInflation && (
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                        📈 Avec inflation
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <p className="text-3xl font-bold text-orange-600">{formatNumber(f.montantAnnuel)} €/an</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => ouvrirModalEdition(f)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
                      >
                        <Pencil className="w-4 h-4" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => supprimerFlux(f.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL FLUX */}
      {showModalFlux && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {fluxEnEdition ? 'Modifier' : 'Ajouter'} un flux inter-sociétés
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Nom du flux</label>
                <input
                  type="text"
                  value={nouveauFlux.nom}
                  onChange={(e) => setNouveauFlux({ ...nouveauFlux, nom: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black rounded-lg text-black font-bold"
                  placeholder="Ex: Loyer toiture"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">Type</label>
                <select
                  value={nouveauFlux.type}
                  onChange={(e) => setNouveauFlux({ ...nouveauFlux, type: e.target.value as any })}
                  className="w-full px-3 py-2 border-2 border-black rounded-lg text-black font-bold"
                >
                  <option value="loyer">Loyer</option>
                  <option value="prestation">Prestation</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">
                    Société qui PAIE ❌
                    <span className="block text-xs text-gray-600 font-normal">(societeCible = charge)</span>
                  </label>
                  <select
                    value={nouveauFlux.societeCible}
                    onChange={(e) => setNouveauFlux({ ...nouveauFlux, societeCible: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-red-500 rounded-lg text-black font-bold"
                  >
                    <option value="">-- Choisir --</option>
                    {societes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-1">
                    Société qui REÇOIT ✅
                    <span className="block text-xs text-gray-600 font-normal">(societeSource = revenu)</span>
                  </label>
                  <select
                    value={nouveauFlux.societeSource}
                    onChange={(e) => setNouveauFlux({ ...nouveauFlux, societeSource: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-green-500 rounded-lg text-black font-bold"
                  >
                    <option value="">-- Choisir --</option>
                    {societes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">Montant annuel (€)</label>
                <input
                  type="number"
                  value={nouveauFlux.montantAnnuel}
                  onChange={(e) => setNouveauFlux({ ...nouveauFlux, montantAnnuel: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border-2 border-black rounded-lg text-black font-bold"
                  placeholder="30000"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nouveauFlux.avecInflation}
                    onChange={(e) => setNouveauFlux({ ...nouveauFlux, avecInflation: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-bold text-black">Avec inflation (0.6%/an)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModalFlux(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={enregistrerFlux}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
              >
                💾 Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}