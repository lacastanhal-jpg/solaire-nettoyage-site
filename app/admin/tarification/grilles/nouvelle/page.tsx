'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  createGrilleTarifaire,
  updateGrilleTarifaire,
  getGrilleTarifaireById
} from '@/lib/firebase/grilles-tarifaires'
import { getPrestationsActives } from '@/lib/firebase/prestations-catalogue'
import { getAllGroupes } from '@/lib/firebase/groupes'
import { getAllClients } from '@/lib/firebase/clients'
import { getAllSites } from '@/lib/firebase/sites'
import type {
  GrilleTarifaireInput,
  GrilleTarifaire,
  TypeGrille,
  LigneGrilleTarifaire,
  TrancheSurface,
  Majoration,
  Remise,
  TypeAjustement,
  PrestationCatalogue
} from '@/lib/types/tarification'

export default function GrilleFormPage() {
  const router = useRouter()
  const params = useParams()
  const grilleId = params?.id as string | undefined
  const isEdit = !!grilleId

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [prestations, setPrestations] = useState<PrestationCatalogue[]>([])
  const [groupes, setGroupes] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])

  // Formulaire
  const [nom, setNom] = useState('')
  const [type, setType] = useState<TypeGrille>('general')
  const [entiteId, setEntiteId] = useState('')
  const [entiteNom, setEntiteNom] = useState('')
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split('T')[0])
  const [dateFin, setDateFin] = useState('')
  const [priorite, setPriorite] = useState(10)
  const [conditionsParticulieres, setConditionsParticulieres] = useState('')
  const [lignes, setLignes] = useState<LigneGrilleTarifaire[]>([])

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'admin') {
      router.push('/intranet/login')
      return
    }
    chargerDonnees()
  }, [router])

  async function chargerDonnees() {
    try {
      setLoading(true)
      
      const [prestationsData, groupesData, clientsData, sitesData] = await Promise.all([
        getPrestationsActives(),
        getAllGroupes(),
        getAllClients(),
        getAllSites()
      ])

      setPrestations(prestationsData)
      setGroupes(groupesData)
      setClients(clientsData)
      setSites(sitesData)

      // Si édition, charger la grille
      if (isEdit && grilleId) {
        const grille = await getGrilleTarifaireById(grilleId)
        if (grille) {
          setNom(grille.nom)
          setType(grille.type)
          setEntiteId(grille.entiteId || '')
          setEntiteNom(grille.entiteNom || '')
          setDateDebut(grille.dateDebut)
          setDateFin(grille.dateFin || '')
          setPriorite(grille.priorite)
          setConditionsParticulieres(grille.conditionsParticulieres || '')
          setLignes(grille.lignes)
        }
      }
    } catch (error) {
      console.error('Erreur chargement:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  function ajouterLigne() {
    if (prestations.length === 0) {
      alert('Aucune prestation disponible')
      return
    }

    const nouvelleLigne: LigneGrilleTarifaire = {
      prestationCode: prestations[0].code,
      tranchesSurface: [
        { min: 0, max: 1000, prix: 0.50 }
      ],
      majorations: [],
      remises: []
    }
    setLignes([...lignes, nouvelleLigne])
  }

  function supprimerLigne(index: number) {
    setLignes(lignes.filter((_, i) => i !== index))
  }

  function updateLigne(index: number, updates: Partial<LigneGrilleTarifaire>) {
    const newLignes = [...lignes]
    newLignes[index] = { ...newLignes[index], ...updates }
    setLignes(newLignes)
  }

  function ajouterTranche(ligneIndex: number) {
    const ligne = lignes[ligneIndex]
    const derniereTranche = ligne.tranchesSurface[ligne.tranchesSurface.length - 1]
    const nouveauMin = derniereTranche.max ? derniereTranche.max + 1 : 0
    
    updateLigne(ligneIndex, {
      tranchesSurface: [
        ...ligne.tranchesSurface,
        { min: nouveauMin, max: nouveauMin + 1000, prix: 0.50 }
      ]
    })
  }

  function supprimerTranche(ligneIndex: number, trancheIndex: number) {
    const ligne = lignes[ligneIndex]
    if (ligne.tranchesSurface.length <= 1) {
      alert('Il faut au moins une tranche')
      return
    }
    updateLigne(ligneIndex, {
      tranchesSurface: ligne.tranchesSurface.filter((_, i) => i !== trancheIndex)
    })
  }

  function updateTranche(ligneIndex: number, trancheIndex: number, field: keyof TrancheSurface, value: any) {
    const ligne = lignes[ligneIndex]
    const newTranches = [...ligne.tranchesSurface]
    newTranches[trancheIndex] = { ...newTranches[trancheIndex], [field]: value }
    updateLigne(ligneIndex, { tranchesSurface: newTranches })
  }

  function ajouterMajoration(ligneIndex: number) {
    const ligne = lignes[ligneIndex]
    updateLigne(ligneIndex, {
      majorations: [
        ...ligne.majorations,
        { code: '', libelle: '', type: 'taux', valeur: 0 }
      ]
    })
  }

  function supprimerMajoration(ligneIndex: number, majorationIndex: number) {
    const ligne = lignes[ligneIndex]
    updateLigne(ligneIndex, {
      majorations: ligne.majorations.filter((_, i) => i !== majorationIndex)
    })
  }

  function updateMajoration(ligneIndex: number, majorationIndex: number, field: keyof Majoration, value: any) {
    const ligne = lignes[ligneIndex]
    const newMajorations = [...ligne.majorations]
    newMajorations[majorationIndex] = { ...newMajorations[majorationIndex], [field]: value }
    updateLigne(ligneIndex, { majorations: newMajorations })
  }

  function ajouterRemise(ligneIndex: number) {
    const ligne = lignes[ligneIndex]
    updateLigne(ligneIndex, {
      remises: [
        ...ligne.remises,
        { code: '', libelle: '', type: 'taux', valeur: 0 }
      ]
    })
  }

  function supprimerRemise(ligneIndex: number, remiseIndex: number) {
    const ligne = lignes[ligneIndex]
    updateLigne(ligneIndex, {
      remises: ligne.remises.filter((_, i) => i !== remiseIndex)
    })
  }

  function updateRemise(ligneIndex: number, remiseIndex: number, field: keyof Remise, value: any) {
    const ligne = lignes[ligneIndex]
    const newRemises = [...ligne.remises]
    newRemises[remiseIndex] = { ...newRemises[remiseIndex], [field]: value }
    updateLigne(ligneIndex, { remises: newRemises })
  }

  async function handleSubmit() {
    if (!nom) {
      alert('Nom obligatoire')
      return
    }

    if (type !== 'general' && !entiteId) {
      alert('Veuillez sélectionner une entité')
      return
    }

    if (lignes.length === 0) {
      alert('Ajoutez au moins une prestation')
      return
    }

    try {
      setSaving(true)

      const data: GrilleTarifaireInput = {
        nom,
        type,
        entiteId: type === 'general' ? undefined : entiteId,
        entiteNom: type === 'general' ? undefined : entiteNom,
        dateDebut,
        dateFin: dateFin || null,
        priorite,
        conditionsParticulieres,
        lignes,
        actif: true
      }

      if (isEdit && grilleId) {
        await updateGrilleTarifaire(grilleId, data)
        alert('✅ Grille modifiée avec succès')
      } else {
        await createGrilleTarifaire(data)
        alert('✅ Grille créée avec succès')
      }

      router.push('/admin/tarification/grilles')
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error)
      alert(`❌ ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/intranet/dashboard" className="hover:text-gray-900">Accueil</Link>
            <span>→</span>
            <Link href="/admin/tarification" className="hover:text-gray-900">Tarification</Link>
            <span>→</span>
            <Link href="/admin/tarification/grilles" className="hover:text-gray-900">Grilles</Link>
            <span>→</span>
            <span className="text-gray-900">{isEdit ? 'Modifier' : 'Nouvelle'}</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEdit ? '✏️ Modifier grille tarifaire' : '➕ Nouvelle grille tarifaire'}
          </h1>
        </div>

        {/* Formulaire */}
        <div className="space-y-6">
          {/* Infos générales */}
          <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Informations générales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Nom de la grille *
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="EDF - Contrat National 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Type de grille *
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value as TypeGrille)
                    setEntiteId('')
                    setEntiteNom('')
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="general" style={{ color: "#000000" }}>Générale (défaut)</option>
                  <option value="groupe" style={{ color: "#000000" }}>Groupe</option>
                  <option value="client" style={{ color: "#000000" }}>Client</option>
                  <option value="site" style={{ color: "#000000" }}>Site</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Priorité *
                </label>
                <input
                  type="number"
                  value={priorite}
                  onChange={(e) => setPriorite(parseInt(e.target.value) || 10)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  min="1"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Plus le chiffre est bas, plus la grille est prioritaire
                </p>
              </div>

              {type !== 'general' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    {type === 'groupe' && 'Groupe *'}
                    {type === 'client' && 'Client *'}
                    {type === 'site' && 'Site *'}
                  </label>
                  <select
                    value={entiteId}
                    onChange={(e) => {
                      setEntiteId(e.target.value)
                      const selected = 
                        type === 'groupe' ? groupes.find(g => g.id === e.target.value) :
                        type === 'client' ? clients.find(c => c.id === e.target.value) :
                        sites.find(s => s.id === e.target.value)
                      setEntiteNom(
                        type === 'groupe' ? (selected?.nom || '') :
                        type === 'client' ? (selected?.company || '') :
                        (selected?.complementNom || '')
                      )
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="" className="text-gray-900">Sélectionner...</option>
                    {type === 'groupe' && groupes.map(g => (
                      <option key={g.id} value={g.id} className="text-gray-900">{g.nom}</option>
                    ))}
                    {type === 'client' && clients.map(c => (
                      <option key={c.id} value={c.id} className="text-gray-900">{c.company}</option>
                    ))}
                    {type === 'site' && sites.map(s => (
                      <option key={s.id} value={s.id} className="text-gray-900">{s.complementNom}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Date début *
                </label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Date fin (optionnel)
                </label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Conditions particulières (optionnel)
                </label>
                <textarea
                  value={conditionsParticulieres}
                  onChange={(e) => setConditionsParticulieres(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Contrat cadre, révision tarifaire..."
                />
              </div>
            </div>
          </div>

          {/* Prestations */}
          <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">📦 Prestations ({lignes.length})</h2>
              <button
                onClick={ajouterLigne}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
              >
                ➕ Ajouter prestation
              </button>
            </div>

            {lignes.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Aucune prestation. Cliquez sur "Ajouter prestation" pour commencer.
              </p>
            )}

            {lignes.map((ligne, ligneIndex) => (
              <div key={ligneIndex} className="border-2 border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Prestation
                    </label>
                    <select
                      value={ligne.prestationCode}
                      onChange={(e) => updateLigne(ligneIndex, { prestationCode: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      {prestations.map(p => (
                        <option key={p.id} value={p.code} className="text-gray-900">
                          {p.code} - {p.libelle}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => supprimerLigne(ligneIndex)}
                    className="ml-4 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold text-sm"
                  >
                    🗑️ Supprimer
                  </button>
                </div>

                {/* Choix : Tranches OU Forfait */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={ligne.tarifForfaitaire !== undefined}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateLigne(ligneIndex, { tarifForfaitaire: 0 })
                        } else {
                          const { tarifForfaitaire, ...rest } = ligne
                          updateLigne(ligneIndex, { ...rest, tarifForfaitaire: undefined })
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-bold text-gray-900">
                      Tarif forfaitaire (sinon tranches de surface)
                    </span>
                  </label>

                  {ligne.tarifForfaitaire !== undefined ? (
                    <input
                      type="number"
                      step="0.01"
                      value={ligne.tarifForfaitaire}
                      onChange={(e) => updateLigne(ligneIndex, { tarifForfaitaire: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="250.00"
                    />
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-900">Tranches de surface</span>
                        <button
                          onClick={() => ajouterTranche(ligneIndex)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 font-bold"
                        >
                          ➕ Ajouter tranche
                        </button>
                      </div>

                      <div className="space-y-2">
                        {ligne.tranchesSurface.map((tranche, trancheIndex) => (
                          <div key={trancheIndex} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                            <input
                              type="number"
                              value={tranche.min}
                              onChange={(e) => updateTranche(ligneIndex, trancheIndex, 'min', parseInt(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Min"
                            />
                            <span className="text-gray-600">→</span>
                            <input
                              type="number"
                              value={tranche.max || ''}
                              onChange={(e) => updateTranche(ligneIndex, trancheIndex, 'max', e.target.value ? parseInt(e.target.value) : null)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Max"
                            />
                            <span className="text-gray-600">m²</span>
                            <span className="text-gray-600">=</span>
                            <input
                              type="number"
                              step="0.01"
                              value={tranche.prix}
                              onChange={(e) => updateTranche(ligneIndex, trancheIndex, 'prix', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Prix"
                            />
                            <span className="text-gray-600">€/m²</span>
                            {ligne.tranchesSurface.length > 1 && (
                              <button
                                onClick={() => supprimerTranche(ligneIndex, trancheIndex)}
                                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Majorations */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-900">Majorations</span>
                    <button
                      onClick={() => ajouterMajoration(ligneIndex)}
                      className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 font-bold"
                    >
                      ➕ Ajouter majoration
                    </button>
                  </div>

                  {ligne.majorations.map((maj, majIndex) => (
                    <div key={majIndex} className="flex gap-2 items-center bg-orange-50 p-2 rounded mb-2">
                      <input
                        type="text"
                        value={maj.code}
                        onChange={(e) => updateMajoration(ligneIndex, majIndex, 'code', e.target.value.toUpperCase())}
                        className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="CODE"
                      />
                      <input
                        type="text"
                        value={maj.libelle}
                        onChange={(e) => updateMajoration(ligneIndex, majIndex, 'libelle', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Libellé"
                      />
                      <select
                        value={maj.type}
                        onChange={(e) => updateMajoration(ligneIndex, majIndex, 'type', e.target.value as TypeAjustement)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="taux" className="text-gray-900">%</option>
                        <option value="montant" className="text-gray-900">€</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={maj.valeur}
                        onChange={(e) => updateMajoration(ligneIndex, majIndex, 'valeur', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Valeur"
                      />
                      <button
                        onClick={() => supprimerMajoration(ligneIndex, majIndex)}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Remises */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-900">Remises</span>
                    <button
                      onClick={() => ajouterRemise(ligneIndex)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 font-bold"
                    >
                      ➕ Ajouter remise
                    </button>
                  </div>

                  {ligne.remises.map((remise, remiseIndex) => (
                    <div key={remiseIndex} className="flex gap-2 items-center bg-green-50 p-2 rounded mb-2">
                      <input
                        type="text"
                        value={remise.code}
                        onChange={(e) => updateRemise(ligneIndex, remiseIndex, 'code', e.target.value.toUpperCase())}
                        className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="CODE"
                      />
                      <input
                        type="text"
                        value={remise.libelle}
                        onChange={(e) => updateRemise(ligneIndex, remiseIndex, 'libelle', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Libellé"
                      />
                      <select
                        value={remise.type}
                        onChange={(e) => updateRemise(ligneIndex, remiseIndex, 'type', e.target.value as TypeAjustement)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="taux" className="text-gray-900">%</option>
                        <option value="montant" className="text-gray-900">€</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={remise.valeur}
                        onChange={(e) => updateRemise(ligneIndex, remiseIndex, 'valeur', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Valeur"
                      />
                      <button
                        onClick={() => supprimerRemise(ligneIndex, remiseIndex)}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold text-gray-900"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:bg-gray-400"
            >
              {saving ? '⏳ Enregistrement...' : (isEdit ? '✓ Modifier' : '✓ Créer la grille')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
