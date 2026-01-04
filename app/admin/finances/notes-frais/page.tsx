'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  getAllNotesDeFrais,
  getNotesDeFraisEnAttente,
  getNotesDeFraisARembourser,
  validerNoteDeFrais,
  refuserNoteDeFrais,
  marquerNoteDeFraisRemboursee,
  getStatistiquesDashboard,
  type NoteDeFrais,
  type StatistiquesDashboard
} from '@/lib/firebase/notes-de-frais'
import {
  validerNotesEnMasse,
  refuserNotesEnMasse
} from '@/lib/firebase/notes-frais-validation-masse'
import { Plus, Eye, Check, X, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function NotesFraisPage() {
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<NoteDeFrais[]>([])
  const [notesEnAttente, setNotesEnAttente] = useState<NoteDeFrais[]>([])
  const [notesARembourser, setNotesARembourser] = useState<NoteDeFrais[]>([])
  
  const [stats, setStats] = useState<StatistiquesDashboard | null>(null)
  
  // Filtres
  const [statutFilter, setStatutFilter] = useState<string>('all')
  const [operateurFilter, setOperateurFilter] = useState<string>('all')
  const [moisFilter, setMoisFilter] = useState<string>('all')
  
  // Modal validation individuelle
  const [showModalValidation, setShowModalValidation] = useState(false)
  const [noteSelectionnee, setNoteSelectionnee] = useState<NoteDeFrais | null>(null)
  const [actionType, setActionType] = useState<'valider' | 'refuser' | 'rembourser'>('valider')
  const [commentaire, setCommentaire] = useState('')
  const [modeRemboursement, setModeRemboursement] = useState<'virement' | 'cheque'>('virement')
  const [referenceRemboursement, setReferenceRemboursement] = useState('')

  // Validation en masse
  const [notesSelectionnees, setNotesSelectionnees] = useState<string[]>([])
  const [showModalMasse, setShowModalMasse] = useState(false)
  const [actionMasse, setActionMasse] = useState<'valider' | 'refuser'>('valider')
  const [commentaireMasse, setCommentaireMasse] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [allNotes, enAttente, aRembourser, statsData] = await Promise.all([
        getAllNotesDeFrais(),
        getNotesDeFraisEnAttente(),
        getNotesDeFraisARembourser(),
        getStatistiquesDashboard()
      ])
      
      setNotes(allNotes)
      setNotesEnAttente(enAttente)
      setNotesARembourser(aRembourser)
      setStats(statsData)
    } catch (error) {
      console.error('Erreur chargement notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const operateurs = Array.from(new Set(notes.map(n => n.operateurNom))).sort()
  
  const notesFiltrees = notes.filter(note => {
    if (statutFilter !== 'all' && note.statut !== statutFilter) return false
    if (operateurFilter !== 'all' && note.operateurNom !== operateurFilter) return false
    if (moisFilter !== 'all') {
      const noteMois = note.date.substring(0, 7)
      if (noteMois !== moisFilter) return false
    }
    return true
  })

  const totalMois = notesFiltrees
    .filter(n => n.date.substring(0, 7) === new Date().toISOString().substring(0, 7))
    .reduce((sum, n) => sum + n.montantTTC, 0)

  // VALIDATION INDIVIDUELLE
  function openModal(note: NoteDeFrais, action: 'valider' | 'refuser' | 'rembourser') {
    setNoteSelectionnee(note)
    setActionType(action)
    setCommentaire('')
    setReferenceRemboursement('')
    setShowModalValidation(true)
  }

  async function handleAction() {
    if (!noteSelectionnee) return
    
    try {
      const userName = localStorage.getItem('user_name') || 'Admin'
      const userId = localStorage.getItem('user_id') || 'admin'
      
      if (actionType === 'valider') {
        await validerNoteDeFrais(noteSelectionnee.id, userId, userName, commentaire)
        alert('✅ Note de frais validée')
      } else if (actionType === 'refuser') {
        if (!commentaire.trim()) {
          alert('⚠️ Veuillez indiquer un motif de refus')
          return
        }
        await refuserNoteDeFrais(noteSelectionnee.id, userId, userName, commentaire)
        alert('✅ Note de frais refusée')
      } else if (actionType === 'rembourser') {
        await marquerNoteDeFraisRemboursee(
          noteSelectionnee.id,
          modeRemboursement,
          referenceRemboursement
        )
        alert('✅ Note de frais marquée comme remboursée')
      }
      
      setShowModalValidation(false)
      await loadData()
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de l\'action')
    }
  }

  // VALIDATION EN MASSE
  function toggleSelection(noteId: string) {
    setNotesSelectionnees(prev => {
      if (prev.includes(noteId)) {
        return prev.filter(id => id !== noteId)
      } else {
        return [...prev, noteId]
      }
    })
  }

  function toggleAll() {
    // Sélectionner uniquement les notes soumises
    const notesSoumises = notesFiltrees.filter(n => n.statut === 'soumise')
    if (notesSelectionnees.length === notesSoumises.length) {
      setNotesSelectionnees([])
    } else {
      setNotesSelectionnees(notesSoumises.map(n => n.id))
    }
  }

  async function handleActionMasse() {
    if (notesSelectionnees.length === 0) {
      alert('⚠️ Aucune note sélectionnée')
      return
    }
    
    try {
      const userId = localStorage.getItem('user_id') || 'admin'
      const userName = localStorage.getItem('user_name') || 'Admin'
      
      let resultat
      
      if (actionMasse === 'valider') {
        resultat = await validerNotesEnMasse(
          notesSelectionnees,
          userId,
          userName,
          commentaireMasse
        )
      } else if (actionMasse === 'refuser') {
        if (!commentaireMasse.trim()) {
          alert('⚠️ Motif de refus obligatoire')
          return
        }
        resultat = await refuserNotesEnMasse(
          notesSelectionnees,
          userId,
          userName,
          commentaireMasse
        )
      }
      
      if (resultat && resultat.success) {
        alert(`✅ ${resultat.notesValidees.length} note(s) traitée(s) avec succès !`)
        if (resultat.notesErreur.length > 0) {
          console.warn('Erreurs:', resultat.notesErreur)
          alert(`⚠️ ${resultat.notesErreur.length} erreur(s) - Voir console`)
        }
        setNotesSelectionnees([])
        setShowModalMasse(false)
        setCommentaireMasse('')
        await loadData()
      } else {
        alert('❌ Erreur lors du traitement')
      }
    } catch (error: any) {
      console.error('Erreur action masse:', error)
      alert('❌ Erreur : ' + error.message)
    }
  }

  function getStatutBadge(statut: NoteDeFrais['statut']) {
    const badges = {
      brouillon: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Brouillon' },
      soumise: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'À valider' },
      validee: { bg: 'bg-green-100', text: 'text-green-700', label: 'Validée' },
      refusee: { bg: 'bg-red-100', text: 'text-red-700', label: 'Refusée' },
      remboursee: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Remboursée' }
    }
    const badge = badges[statut]
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  function getCategorieIcon(categorie: string) {
    const icons: Record<string, string> = {
      carburant: '⛽',
      peage: '🛣️',
      repas: '🍽️',
      hebergement: '🏨',
      fournitures: '📦',
      entretien: '🔧',
      autre: '📄'
    }
    return icons[categorie] || '📄'
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
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes de Frais</h1>
          <p className="text-gray-600 mt-2">
            {notes.length} note{notes.length > 1 ? 's' : ''} • Remplace Expensya (300€/mois)
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            ← Retour
          </Link>
          <Link
            href="/admin/finances/notes-frais/nouveau"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Note
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">À Valider</span>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {notesEnAttente.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {notesEnAttente.reduce((sum, n) => sum + n.montantTTC, 0).toFixed(2)} €
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">À Rembourser</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {notesARembourser.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {notesARembourser.reduce((sum, n) => sum + n.montantTTC, 0).toFixed(2)} €
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total Mois</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {totalMois.toFixed(2)} €
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total Notes</span>
            <AlertCircle className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {notes.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Toutes périodes
          </div>
        </div>
      </div>

      {/* STATISTIQUES */}
      {stats && (
        <div className="mb-8 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">📈 Évolution & Statistiques</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="text-sm text-gray-600">Mois actuel</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalMoisActuel.toFixed(2)} €</div>
                <div className="text-sm">
                  {stats.evolutionPourcentage >= 0 ? (
                    <span className="text-green-600">↗ +{stats.evolutionPourcentage.toFixed(1)}%</span>
                  ) : (
                    <span className="text-red-600">↘ {stats.evolutionPourcentage.toFixed(1)}%</span>
                  )}
                  <span className="text-gray-500 ml-1">vs mois dernier</span>
                </div>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <div className="text-sm text-gray-600">Année {new Date().getFullYear()}</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalAnnee.toFixed(2)} €</div>
                <div className="text-sm text-gray-500">{stats.nombreNotesTotal} notes</div>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="text-sm text-gray-600">Moyenne / note</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.nombreNotesTotal > 0 ? (stats.totalAnnee / stats.nombreNotesTotal).toFixed(2) : '0.00'} €
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">6 derniers mois</h3>
              <div className="h-64 flex items-end gap-2 border-b border-l border-gray-300 p-4">
                {stats.evolutionMensuelle.slice(-6).map((mois, i) => {
                  const max = Math.max(...stats.evolutionMensuelle.slice(-6).map(m => m.montant))
                  const hauteur = max > 0 ? (mois.montant / max) * 100 : 0
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full flex flex-col items-center">
                        <span className="text-xs font-semibold text-gray-700 mb-1">
                          {mois.montant.toFixed(0)}€
                        </span>
                        <div
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t hover:from-blue-700 hover:to-blue-500 transition-all cursor-pointer"
                          style={{ height: `${hauteur}%` }}
                          title={`${mois.moisLabel}: ${mois.montant.toFixed(2)}€ (${mois.nombre} notes)`}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{mois.moisLabel.split(' ')[0].slice(0, 3)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🏷️ Par catégorie</h3>
              <div className="space-y-3">
                {stats.parCategorie.map((cat, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 capitalize">{cat.categorie}</span>
                      <span className="font-bold text-gray-900">{cat.montant.toFixed(2)} €</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${cat.pourcentage}%` }} />
                      </div>
                      <span className="text-xs text-gray-600 w-12 text-right">{cat.pourcentage.toFixed(1)}%</span>
                    </div>
                    <span className="text-xs text-gray-500">{cat.nombre} note{cat.nombre > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">👥 Par opérateur</h3>
              <div className="space-y-3">
                {stats.parOperateur.map((op, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-gray-900">{op.operateurNom}</div>
                      <div className="text-xs text-gray-500">{op.nombreNotes} notes • Moy: {op.moyenneParNote.toFixed(2)}€</div>
                    </div>
                    <div className="text-lg font-bold text-gray-900">{op.montantTotal.toFixed(2)} €</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🔥 Top 10 dépenses</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Opérateur</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Catégorie</th>
                    <th className="text-right py-2 px-4 text-sm font-semibold text-gray-700">Montant</th>
                    <th className="text-center py-2 px-4 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topDepenses.map((dep, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 text-sm text-gray-600">{new Date(dep.date).toLocaleDateString('fr-FR')}</td>
                      <td className="py-2 px-4 text-sm font-medium text-gray-900">{dep.operateurNom}</td>
                      <td className="py-2 px-4 text-sm text-gray-700 capitalize">{dep.categorie}</td>
                      <td className="py-2 px-4 text-right text-sm font-bold text-gray-900">{dep.montantTTC.toFixed(2)} €</td>
                      <td className="py-2 px-4 text-center">
                        <Link href={`/admin/finances/notes-frais/${dep.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                          Voir →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">Tous les statuts</option>
              <option value="soumise">À valider</option>
              <option value="validee">Validées</option>
              <option value="refusee">Refusées</option>
              <option value="remboursee">Remboursées</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Opérateur</label>
            <select
              value={operateurFilter}
              onChange={(e) => setOperateurFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">Tous les opérateurs</option>
              {operateurs.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Barre actions en masse */}
      {notesSelectionnees.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium text-blue-900">
                {notesSelectionnees.length} note(s) sélectionnée(s)
              </span>
              <button
                onClick={() => setNotesSelectionnees([])}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Tout désélectionner
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActionMasse('valider')
                  setCommentaireMasse('')
                  setShowModalMasse(true)
                }}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
              >
                <Check className="w-4 h-4" />
                Valider la sélection
              </button>
              <button
                onClick={() => {
                  setActionMasse('refuser')
                  setCommentaireMasse('')
                  setShowModalMasse(true)
                }}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
              >
                <X className="w-4 h-4" />
                Refuser la sélection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    notesFiltrees.filter(n => n.statut === 'soumise').length > 0 &&
                    notesSelectionnees.length === notesFiltrees.filter(n => n.statut === 'soumise').length
                  }
                  onChange={toggleAll}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  title="Sélectionner tout"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opérateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant TTC</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {notesFiltrees.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  Aucune note de frais trouvée
                </td>
              </tr>
            ) : (
              notesFiltrees.map(note => (
                <tr key={note.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {note.statut === 'soumise' && (
                      <input
                        type="checkbox"
                        checked={notesSelectionnees.includes(note.id)}
                        onChange={() => toggleSelection(note.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{note.numero}</div>
                    <div className="text-xs text-gray-500">
                      {note.justificatifs.length} justificatif{note.justificatifs.length > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(note.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {note.operateurNom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getCategorieIcon(note.categorie)}</span>
                      <span className="text-sm text-gray-900 capitalize">{note.categorie}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {note.description}
                    </div>
                    {note.fournisseur && (
                      <div className="text-xs text-gray-500">{note.fournisseur}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {note.montantTTC.toFixed(2)} €
                    </div>
                    <div className="text-xs text-gray-500">
                      HT: {note.montantHT.toFixed(2)} €
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getStatutBadge(note.statut)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/finances/notes-frais/${note.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {note.statut === 'soumise' && (
                        <>
                          <button
                            onClick={() => openModal(note, 'valider')}
                            className="text-green-600 hover:text-green-900"
                            title="Valider"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal(note, 'refuser')}
                            className="text-red-600 hover:text-red-900"
                            title="Refuser"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {note.statut === 'validee' && (
                        <button
                          onClick={() => openModal(note, 'rembourser')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Marquer remboursée"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Validation INDIVIDUELLE */}
      {showModalValidation && noteSelectionnee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">
              {actionType === 'valider' && '✅ Valider la note'}
              {actionType === 'refuser' && '❌ Refuser la note'}
              {actionType === 'rembourser' && '💰 Marquer comme remboursée'}
            </h2>

            <div className="mb-4 p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Note: {noteSelectionnee.numero}</p>
              <p className="text-sm text-gray-600">Opérateur: {noteSelectionnee.operateurNom}</p>
              <p className="text-sm font-bold text-gray-900">Montant: {noteSelectionnee.montantTTC.toFixed(2)} €</p>
            </div>

            {actionType !== 'rembourser' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionType === 'valider' ? 'Commentaire (optionnel)' : 'Motif du refus *'}
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder={actionType === 'valider' ? 'Commentaire...' : 'Précisez le motif du refus...'}
                />
              </div>
            )}

            {actionType === 'rembourser' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode de remboursement
                  </label>
                  <select
                    value={modeRemboursement}
                    onChange={(e) => setModeRemboursement(e.target.value as 'virement' | 'cheque')}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="virement">Virement bancaire</option>
                    <option value="cheque">Chèque</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Référence (optionnel)
                  </label>
                  <input
                    type="text"
                    value={referenceRemboursement}
                    onChange={(e) => setReferenceRemboursement(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ex: Virement du 15/01/2026"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModalValidation(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleAction}
                className={`flex-1 px-4 py-2 rounded text-white ${
                  actionType === 'valider' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : actionType === 'refuser'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {actionType === 'valider' && 'Valider'}
                {actionType === 'refuser' && 'Refuser'}
                {actionType === 'rembourser' && 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation action EN MASSE */}
      {showModalMasse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {actionMasse === 'valider' ? '✅ Valider' : '❌ Refuser'} {notesSelectionnees.length} note(s)
            </h2>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Vous allez {actionMasse === 'valider' ? 'valider' : 'refuser'} les notes suivantes :
              </p>
              <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                {notesFiltrees
                  .filter(n => notesSelectionnees.includes(n.id))
                  .map(n => (
                    <div key={n.id} className="text-sm py-1">
                      • {n.numero} - {n.operateurNom} - {n.montantTTC.toFixed(2)}€
                    </div>
                  ))
                }
              </div>
            </div>
            
            {actionMasse === 'refuser' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif de refus <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={commentaireMasse}
                  onChange={(e) => setCommentaireMasse(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  rows={3}
                  placeholder="Indiquez la raison du refus..."
                  required
                />
              </div>
            )}
            
            {actionMasse === 'valider' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={commentaireMasse}
                  onChange={(e) => setCommentaireMasse(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  rows={2}
                  placeholder="Commentaire..."
                />
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={handleActionMasse}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${
                  actionMasse === 'valider'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmer
              </button>
              <button
                onClick={() => {
                  setShowModalMasse(false)
                  setCommentaireMasse('')
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
