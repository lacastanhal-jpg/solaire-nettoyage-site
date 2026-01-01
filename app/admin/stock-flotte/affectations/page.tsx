'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  getAllAffectations,
  createAffectation,
  updateAffectation,
  deleteAffectation,
  type AffectationEquipement
} from '@/lib/firebase/stock-affectations'
import {
  getAllAffectationsAccessoires,
  createAffectationAccessoire,
  updateAffectationAccessoire,
  deleteAffectationAccessoire,
  type AffectationAccessoire
} from '@/lib/firebase/stock-affectations-accessoires'
import { getAllEquipements } from '@/lib/firebase/stock-equipements'
import type { Equipement } from '@/lib/types/stock-flotte'
import { getAllArticlesStock } from '@/lib/firebase/stock-articles'
import type { ArticleStock } from '@/lib/types/stock-flotte'
import { getEquipementDisplayName, getEquipementFullDisplay } from '@/lib/utils/equipement-display'

type MainTab = 'accessoires' | 'stock'
type ViewMode = 'vehicule' | 'item'

export default function AffectationsPage() {
  const [loading, setLoading] = useState(true)
  const [mainTab, setMainTab] = useState<MainTab>('accessoires')
  const [viewMode, setViewMode] = useState<ViewMode>('vehicule')
  
  const [affectationsArticles, setAffectationsArticles] = useState<AffectationEquipement[]>([])
  const [affectationsAccessoires, setAffectationsAccessoires] = useState<AffectationAccessoire[]>([])
  const [equipements, setEquipements] = useState<Equipement[]>([])
  const [articles, setArticles] = useState<ArticleStock[]>([])
  
  const [showModalAccessoire, setShowModalAccessoire] = useState(false)
  const [showModalArticle, setShowModalArticle] = useState(false)
  const [editingAccessoire, setEditingAccessoire] = useState<AffectationAccessoire | null>(null)
  const [editingArticle, setEditingArticle] = useState<AffectationEquipement | null>(null)

  const [formAccessoire, setFormAccessoire] = useState({
    accessoireId: '',
    vehiculeId: '',
    permanent: true,
    notes: ''
  })

  const [formArticle, setFormArticle] = useState({
    equipementId: '',
    articleId: '',
    quantite: 1,
    permanent: true,
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [articlesData, accessoiresData, equipementsData, articlesStockData] = await Promise.all([
        getAllAffectations(),
        getAllAffectationsAccessoires(),
        getAllEquipements(),
        getAllArticlesStock()
      ])
      
      setAffectationsArticles(articlesData)
      setAffectationsAccessoires(accessoiresData)
      setEquipements(equipementsData)
      setArticles(articlesStockData)
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

  const equipementsPrincipaux = equipements.filter(e => e.type === 'vehicule')
  const equipementsAccessoires = equipements.filter(e => e.type === 'accessoire')

  async function handleSubmitAccessoire(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formAccessoire.accessoireId || !formAccessoire.vehiculeId) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      const accessoire = equipements.find(e => e.id === formAccessoire.accessoireId)
      const vehicule = equipements.find(e => e.id === formAccessoire.vehiculeId)

      if (!accessoire || !vehicule) {
        alert('Équipement introuvable')
        return
      }

      const affectationData: any = {
        accessoireId: formAccessoire.accessoireId,
        accessoireImmat: getEquipementDisplayName(accessoire as any),
        accessoireType: accessoire.type,
        vehiculeId: formAccessoire.vehiculeId,
        vehiculeImmat: getEquipementDisplayName(vehicule as any),
        dateAffectation: new Date().toISOString(),
        permanent: formAccessoire.permanent
      }

      if (formAccessoire.notes) {
        affectationData.notes = formAccessoire.notes
      }

      if (editingAccessoire) {
        await updateAffectationAccessoire(editingAccessoire.id, affectationData)
      } else {
        await createAffectationAccessoire(affectationData)
      }

      await loadData()
      resetFormAccessoire()
      setShowModalAccessoire(false)
    } catch (error) {
      console.error('Erreur sauvegarde affectation:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  function resetFormAccessoire() {
    setFormAccessoire({
      accessoireId: '',
      vehiculeId: '',
      permanent: true,
      notes: ''
    })
    setEditingAccessoire(null)
  }

  function openEditModalAccessoire(affectation: AffectationAccessoire) {
    setEditingAccessoire(affectation)
    setFormAccessoire({
      accessoireId: affectation.accessoireId,
      vehiculeId: affectation.vehiculeId,
      permanent: affectation.permanent,
      notes: affectation.notes || ''
    })
    setShowModalAccessoire(true)
  }

  async function handleDeleteAccessoire(id: string) {
    if (!confirm('Retirer cet accessoire de l\'équipement ?')) return
    
    try {
      await deleteAffectationAccessoire(id)
      await loadData()
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  async function handleSubmitArticle(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formArticle.equipementId || !formArticle.articleId || formArticle.quantite <= 0) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      const equipement = equipements.find(e => e.id === formArticle.equipementId)
      const article = articles.find(a => a.id === formArticle.articleId)

      if (!equipement || !article) {
        alert('Équipement ou article introuvable')
        return
      }

      const affectationData: any = {
        equipementId: formArticle.equipementId,
        equipementImmat: getEquipementDisplayName(equipement as any),
        articleId: formArticle.articleId,
        articleCode: article.code,
        articleDescription: article.description,
        quantite: formArticle.quantite,
        dateAffectation: new Date().toISOString(),
        permanent: formArticle.permanent
      }

      if (formArticle.notes) {
        affectationData.notes = formArticle.notes
      }

      if (editingArticle) {
        await updateAffectation(editingArticle.id, affectationData)
      } else {
        await createAffectation(affectationData)
      }

      await loadData()
      resetFormArticle()
      setShowModalArticle(false)
    } catch (error) {
      console.error('Erreur sauvegarde affectation:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  function resetFormArticle() {
    setFormArticle({
      equipementId: '',
      articleId: '',
      quantite: 1,
      permanent: true,
      notes: ''
    })
    setEditingArticle(null)
  }

  function openEditModalArticle(affectation: AffectationEquipement) {
    setEditingArticle(affectation)
    setFormArticle({
      equipementId: affectation.equipementId,
      articleId: affectation.articleId,
      quantite: 1,
      permanent: affectation.permanent,
      notes: affectation.notes || ''
    })
    setShowModalArticle(true)
  }

  async function handleDeleteArticle(id: string) {
    if (!confirm('Retirer cet article de l\'équipement ?')) return
    
    try {
      await deleteAffectation(id)
      await loadData()
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const accessoiresParVehicule = equipementsPrincipaux.map(equipement => ({
    vehicule: equipement,
    accessoires: affectationsAccessoires.filter(a => a.vehiculeId === equipement.id)
  }))

  const accessoiresParItem = equipementsAccessoires.map(accessoire => ({
    accessoire,
    affectation: affectationsAccessoires.find(a => a.accessoireId === accessoire.id)
  }))

  const articlesParVehicule = equipementsPrincipaux.map(equipement => ({
    vehicule: equipement,
    articles: affectationsArticles.filter(a => a.equipementId === equipement.id),
    stockTotal: affectationsArticles
      .filter(a => a.equipementId === equipement.id)
      .reduce((sum, a) => sum + 1, 0)
  }))

  const articlesParItem = articles.map(article => ({
    article,
    affectations: affectationsArticles.filter(a => a.articleId === article.id),
    quantiteEmbarquee: affectationsArticles
      .filter(a => a.articleId === article.id)
      .reduce((sum, a) => sum + 1, 0)
  })).filter(item => item.quantiteEmbarquee > 0)

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Affectations Équipements</h1>
            <p className="text-gray-600 mt-2">Gérer les accessoires et le stock embarqué</p>
          </div>
          <button
            onClick={() => {
              if (mainTab === 'accessoires') {
                resetFormAccessoire()
                setShowModalAccessoire(true)
              } else {
                resetFormArticle()
                setShowModalArticle(true)
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Nouvelle Affectation
          </button>
        </div>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setMainTab('accessoires')
              setViewMode('vehicule')
            }}
            className={`pb-4 px-2 border-b-2 font-medium text-lg ${
              mainTab === 'accessoires'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🚜 Accessoires
          </button>
          <button
            onClick={() => {
              setMainTab('stock')
              setViewMode('vehicule')
            }}
            className={`pb-4 px-2 border-b-2 font-medium text-lg ${
              mainTab === 'stock'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📦 Stock Embarqué
          </button>
        </div>
      </div>

      {mainTab === 'accessoires' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Accessoires Affectés</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{affectationsAccessoires.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Équipements avec Accessoires</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {accessoiresParVehicule.filter(v => v.accessoires.length > 0).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Accessoires Libres</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {accessoiresParItem.filter(a => !a.affectation).length}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Affectations</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{affectationsArticles.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Équipements avec Stock</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {articlesParVehicule.filter(v => v.articles.length > 0).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Articles Embarqués</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{articlesParItem.length}</p>
          </div>
        </div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setViewMode('vehicule')}
            className={`pb-4 px-2 border-b-2 font-medium ${
              viewMode === 'vehicule'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Par Équipement
          </button>
          <button
            onClick={() => setViewMode('item')}
            className={`pb-4 px-2 border-b-2 font-medium ${
              viewMode === 'item'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Par {mainTab === 'accessoires' ? 'Accessoire' : 'Article'}
          </button>
        </div>
      </div>

      {mainTab === 'accessoires' ? (
        viewMode === 'vehicule' ? (
          <div className="space-y-4">
            {accessoiresParVehicule.map(({ vehicule, accessoires: accs }) => (
              <div key={vehicule.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{getEquipementDisplayName(vehicule as any)}</h3>
                      <p className="text-sm text-gray-600">{getEquipementFullDisplay(vehicule as any)} - {accs.length} accessoires</p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/stock-flotte/equipements/${vehicule.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Voir équipement →
                  </Link>
                </div>
                
                {accs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Aucun accessoire affecté à cet équipement
                  </div>
                ) : (
                  <div className="divide-y">
                    {accs.map(aff => (
                      <div key={aff.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              aff.permanent 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {aff.permanent ? 'Permanent' : 'Temporaire'}
                            </span>
                            <p className="font-medium text-gray-900">{aff.accessoireImmat}</p>
                            <span className="text-xs text-gray-500">({aff.accessoireType})</span>
                          </div>
                          {aff.notes && <p className="text-sm text-gray-600 mt-1">{aff.notes}</p>}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => openEditModalAccessoire(aff)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteAccessoire(aff.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {accessoiresParItem.map(({ accessoire, affectation }) => (
              <div key={accessoire.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{getEquipementDisplayName(accessoire as any)}</h3>
                      <p className="text-sm text-gray-600">{getEquipementFullDisplay(accessoire as any)}</p>
                      {affectation ? (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ Affecté à {affectation.vehiculeImmat}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 mt-1">
                          ○ Non affecté (libre)
                        </p>
                      )}
                    </div>
                  </div>
                  {affectation && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModalAccessoire(affectation)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteAccessoire(affectation.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                      >
                        Retirer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        viewMode === 'vehicule' ? (
          <div className="space-y-4">
            {articlesParVehicule.map(({ vehicule, articles: arts, stockTotal }) => (
              <div key={vehicule.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{getEquipementDisplayName(vehicule as any)}</h3>
                      <p className="text-sm text-gray-600">{getEquipementFullDisplay(vehicule as any)} - {arts.length} articles ({stockTotal} unités)</p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/stock-flotte/equipements/${vehicule.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Voir équipement →
                  </Link>
                </div>
                
                {arts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Aucun article embarqué dans cet équipement
                  </div>
                ) : (
                  <div className="divide-y">
                    {arts.map(aff => (
                      <div key={aff.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              aff.permanent 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {aff.permanent ? 'Permanent' : 'Temporaire'}
                            </span>
                            <p className="font-medium text-gray-900">{aff.articleCode}</p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{aff.articleDescription}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {aff.permanent ? 'Permanent' : 'Temporaire'} {aff.notes && `• ${aff.notes}`}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => openEditModalArticle(aff)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(aff.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {articlesParItem.map(({ article, affectations: affs, quantiteEmbarquee }) => (
              <div key={article.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{article.code}</h3>
                      <p className="text-sm text-gray-600">{article.description} - {quantiteEmbarquee} embarqués sur {affs.length} équipements</p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/stock-flotte/articles/${article.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Voir article →
                  </Link>
                </div>
                
                <div className="divide-y">
                  {affs.map(aff => {
                    const vehicule = equipementsPrincipaux.find(v => v.id === aff.equipementId)
                    return (
                      <div key={aff.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{aff.equipementImmat}</p>
                            <span className={`px-2 py-1 text-xs rounded ${
                              aff.permanent 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {aff.permanent ? 'Permanent' : 'Temporaire'}
                            </span>
                          </div>
                          {vehicule && (
                            <p className="text-sm text-gray-600 mt-1">{getEquipementFullDisplay(vehicule as any)}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {aff.permanent ? 'Permanent' : 'Temporaire'} {aff.notes && `• ${aff.notes}`}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => openEditModalArticle(aff)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(aff.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            
            {articlesParItem.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">Aucun article embarqué actuellement</p>
              </div>
            )}
          </div>
        )
      )}

      {showModalAccessoire && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingAccessoire ? 'Modifier Affectation' : 'Affecter Accessoire'}
            </h2>
            
            <form onSubmit={handleSubmitAccessoire} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accessoire *
                </label>
                <select
                  value={formAccessoire.accessoireId}
                  onChange={(e) => setFormAccessoire({ ...formAccessoire, accessoireId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  disabled={!!editingAccessoire}
                >
                  <option value="">Sélectionner un accessoire</option>
                  {equipementsAccessoires.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {getEquipementFullDisplay(acc as any)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Équipement Principal *
                </label>
                <select
                  value={formAccessoire.vehiculeId}
                  onChange={(e) => setFormAccessoire({ ...formAccessoire, vehiculeId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  disabled={!!editingAccessoire}
                >
                  <option value="">Sélectionner un équipement</option>
                  {equipementsPrincipaux.map(veh => (
                    <option key={veh.id} value={veh.id}>
                      {getEquipementFullDisplay(veh as any)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formAccessoire.permanent}
                    onChange={(e) => setFormAccessoire({ ...formAccessoire, permanent: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Affectation permanente</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formAccessoire.notes}
                  onChange={(e) => setFormAccessoire({ ...formAccessoire, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModalAccessoire(false)
                    resetFormAccessoire()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingAccessoire ? 'Modifier' : 'Affecter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModalArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingArticle ? 'Modifier Affectation' : 'Embarquer Article'}
            </h2>
            
            <form onSubmit={handleSubmitArticle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Équipement *
                </label>
                <select
                  value={formArticle.equipementId}
                  onChange={(e) => setFormArticle({ ...formArticle, equipementId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  disabled={!!editingArticle}
                >
                  <option value="">Sélectionner un équipement</option>
                  {equipementsPrincipaux.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {getEquipementFullDisplay(eq as any)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Article *
                </label>
                <select
                  value={formArticle.articleId}
                  onChange={(e) => setFormArticle({ ...formArticle, articleId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  disabled={!!editingArticle}
                >
                  <option value="">Sélectionner un article</option>
                  {articles.map(art => (
                    <option key={art.id} value={art.id}>
                      {art.code} - {art.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formArticle.quantite}
                  onChange={(e) => setFormArticle({ ...formArticle, quantite: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formArticle.permanent}
                    onChange={(e) => setFormArticle({ ...formArticle, permanent: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Affectation permanente</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formArticle.notes}
                  onChange={(e) => setFormArticle({ ...formArticle, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModalArticle(false)
                    resetFormArticle()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingArticle ? 'Modifier' : 'Embarquer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
