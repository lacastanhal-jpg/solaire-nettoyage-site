'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getDevisById, updateDevis, calculateLigneDevis, type LigneDevis } from '@/lib/firebase/devis'
import { getAllClients, type Client } from '@/lib/firebase/clients'
import { getSitesByClient, type Site } from '@/lib/firebase/sites'
import { getAllArticles, type Article } from '@/lib/firebase/articles'

interface LigneFormData {
  siteId: string
  siteNom: string
  surfaceM2: number
  articleId: string
  articleCode: string
  articleNom: string
  articleDescription: string
  quantite: string
  prixUnitaire: number
  tva: number
  totalHT: number
  totalTVA: number
  totalTTC: number
}

export default function ModifierDevisPage() {
  const router = useRouter()
  const params = useParams()
  const devisId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [lignes, setLignes] = useState<LigneFormData[]>([])
  const [notes, setNotes] = useState('')
  const [statut, setStatut] = useState<'brouillon' | 'envoyé' | 'accepté' | 'refusé'>('brouillon')

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedClientId && clients.length > 0) {
      loadClientData()
    }
  }, [selectedClientId, clients])

  async function loadInitialData() {
    try {
      setLoading(true)
      const [clientsData, articlesData, devisData] = await Promise.all([
        getAllClients(),
        getAllArticles(),
        getDevisById(devisId)
      ])

      if (!devisData) {
        alert('Devis introuvable')
        router.push('/admin/devis')
        return
      }

      setClients(clientsData.filter(c => c.active !== false)) // Affiche tous sauf ceux explicitement désactivés
      setArticles(articlesData.filter(a => a.actif))
      
      // Charger les données du devis
      setSelectedClientId(devisData.clientId)
      setNotes(devisData.notes || '')
      setStatut(devisData.statut)

      // Convertir les lignes du devis en LigneFormData
      const lignesForm: LigneFormData[] = devisData.lignes.map(ligne => ({
        siteId: ligne.siteId,
        siteNom: ligne.siteNom,
        surfaceM2: 0,
        articleId: ligne.articleId,
        articleCode: ligne.articleCode,
        articleNom: ligne.articleNom,
        articleDescription: ligne.articleDescription || '',
        quantite: ligne.quantite.toString(),
        prixUnitaire: ligne.prixUnitaire,
        tva: ligne.tva,
        totalHT: ligne.totalHT,
        totalTVA: ligne.totalTVA,
        totalTTC: ligne.totalTTC
      }))
      setLignes(lignesForm)
    } catch (error) {
      console.error('Erreur chargement données:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  async function loadClientData() {
    try {
      const client = clients.find(c => c.id === selectedClientId)
      if (client) {
        setSelectedClient(client)
        const sitesData = await getSitesByClient(selectedClientId)
        setSites(sitesData)
      }
    } catch (error) {
      console.error('Erreur chargement sites:', error)
    }
  }

  function addLigne() {
    const newLigne: LigneFormData = {
      siteId: '',
      siteNom: '',
      surfaceM2: 0,
      articleId: '',
      articleCode: '',
      articleNom: '',
      articleDescription: '',
      quantite: '',
      prixUnitaire: 0,
      tva: 20,
      totalHT: 0,
      totalTVA: 0,
      totalTTC: 0
    }
    setLignes([...lignes, newLigne])
  }

  function removeLigne(index: number) {
    setLignes(lignes.filter((_, i) => i !== index))
  }

  function updateLigne(index: number, field: string, value: any) {
    const newLignes = [...lignes]
    const ligne = newLignes[index]
    
    if (field === 'siteId') {
      const site = sites.find(s => s.id === value)
      if (site) {
        ligne.siteId = site.id
        ligne.siteNom = site.nomSite || site.complementNom || site.nom
        ligne.surfaceM2 = site.surface || 0
        ligne.quantite = (site.surface || 0).toString()
      }
    } else if (field === 'articleId') {
      const article = articles.find(a => a.id === value)
      if (article) {
        ligne.articleId = article.id
        ligne.articleCode = article.code
        ligne.articleNom = article.nom
        ligne.articleDescription = article.description || ''
        ligne.prixUnitaire = article.prix
        ligne.tva = article.tva
      }
    } else if (field === 'quantite') {
      ligne.quantite = value
    }
    
    // Recalculer les totaux
    const quantite = parseFloat(ligne.quantite) || 0
    if (quantite > 0 && ligne.prixUnitaire > 0) {
      const totaux = calculateLigneDevis(quantite, ligne.prixUnitaire, ligne.tva)
      ligne.totalHT = totaux.totalHT
      ligne.totalTVA = totaux.totalTVA
      ligne.totalTTC = totaux.totalTTC
    } else {
      ligne.totalHT = 0
      ligne.totalTVA = 0
      ligne.totalTTC = 0
    }
    
    setLignes(newLignes)
  }

  function calculateTotals() {
    const totalHT = lignes.reduce((sum, l) => sum + l.totalHT, 0)
    const totalTVA = lignes.reduce((sum, l) => sum + l.totalTVA, 0)
    const totalTTC = lignes.reduce((sum, l) => sum + l.totalTTC, 0)
    return { totalHT, totalTVA, totalTTC }
  }

  async function handleSubmit() {
    // Validation
    if (!selectedClientId) {
      alert('Veuillez sélectionner un client')
      return
    }

    if (lignes.length === 0) {
      alert('Veuillez ajouter au moins une ligne')
      return
    }

    const incomplete = lignes.some(l => !l.siteId || !l.articleId || !l.quantite || parseFloat(l.quantite) <= 0)
    if (incomplete) {
      alert('Toutes les lignes doivent avoir un site, un article et une quantité valide')
      return
    }

    try {
      setSaving(true)

      const lignesDevis: LigneDevis[] = lignes.map(l => ({
        siteId: l.siteId,
        siteNom: l.siteNom,
        articleId: l.articleId,
        articleCode: l.articleCode,
        articleNom: l.articleNom,
        articleDescription: l.articleDescription,
        quantite: parseFloat(l.quantite),
        prixUnitaire: l.prixUnitaire,
        tva: l.tva,
        totalHT: l.totalHT,
        totalTVA: l.totalTVA,
        totalTTC: l.totalTTC
      }))

      await updateDevis(devisId, {
        clientId: selectedClientId,
        clientNom: selectedClient!.company,
        groupeNom: selectedClient!.groupeNom,
        lignes: lignesDevis,
        notes,
        statut
      })

      alert('Devis modifié avec succès')
      router.push(`/admin/devis/${devisId}`)
    } catch (error) {
      console.error('Erreur modification devis:', error)
      alert('Erreur lors de la modification du devis')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-800">Chargement du devis...</div>
      </div>
    )
  }

  const totals = calculateTotals()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/admin/devis/${devisId}`)}
            className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-flex items-center gap-2"
          >
            ← Retour au devis
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Modifier le devis</h1>
          <p className="text-gray-800 mt-1">Modification du devis</p>
        </div>

        <div className="space-y-6">
          {/* Sélection client */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Client</h2>
            
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-600 text-black font-semibold bg-white"
              style={{ color: '#000000' }}
            >
              <option value="" className="text-black font-semibold" style={{ color: '#000000' }}>Sélectionner un client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id} className="text-black font-semibold" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                  {client.company} {client.groupeNom && `(${client.groupeNom})`}
                </option>
              ))}
            </select>

            {selectedClient && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-900">
                  <div><strong>Client:</strong> {selectedClient.company}</div>
                  {selectedClient.groupeNom && <div><strong>Groupe:</strong> {selectedClient.groupeNom}</div>}
                  <div><strong>Sites disponibles:</strong> {sites.length}</div>
                </div>
              </div>
            )}
          </div>

          {/* Statut */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Statut</h2>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="brouillon">Brouillon</option>
              <option value="envoyé">Envoyé</option>
              <option value="accepté">Accepté</option>
              <option value="refusé">Refusé</option>
            </select>
          </div>

          {/* Lignes */}
          {selectedClientId && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Lignes du devis</h2>
                <button
                  onClick={addLigne}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ➕ Ajouter une ligne
                </button>
              </div>

              {lignes.length === 0 ? (
                <div className="text-center py-12 text-gray-800">
                  Cliquez sur "Ajouter une ligne" pour commencer
                </div>
              ) : (
                <div className="space-y-4">
                  {lignes.map((ligne, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="font-semibold text-gray-900">Ligne {index + 1}</div>
                        <button
                          onClick={() => removeLigne(index)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Site <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={ligne.siteId}
                            onChange={(e) => updateLigne(index, 'siteId', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-600 text-black font-semibold bg-white"
                            style={{ color: '#000000' }}
                          >
                            <option value="" className="text-black font-semibold" style={{ color: '#000000' }}>Sélectionner un site</option>
                            {sites.map(site => (
                              <option key={site.id} value={site.id} className="text-black font-semibold" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                                {site.nomSite || site.complementNom || site.nom} ({site.surface ? site.surface : 0} m²)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Article <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={ligne.articleId}
                            onChange={(e) => updateLigne(index, 'articleId', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-600 text-black font-semibold bg-white"
                            style={{ color: '#000000' }}
                          >
                            <option value="" className="text-black font-semibold" style={{ color: '#000000' }}>Sélectionner un article</option>
                            {articles.map(article => (
                              <option key={article.id} value={article.id} className="text-black font-semibold" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                                {article.code} - {article.nom} ({article.prix}€/{article.unite})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Quantité <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={ligne.quantite}
                            onChange={(e) => updateLigne(index, 'quantite', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Prix unitaire HT
                          </label>
                          <input
                            type="text"
                            value={ligne.prixUnitaire ? `${ligne.prixUnitaire.toFixed(2)} €` : ''}
                            readOnly
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
                          />
                        </div>
                      </div>

                      {ligne.totalHT > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">Total HT</div>
                              <div className="text-lg font-bold">{ligne.totalHT.toFixed(2)} €</div>
                            </div>
                            <div>
                              <div className="font-medium">TVA ({ligne.tva}%)</div>
                              <div className="text-lg font-bold">{ligne.totalTVA.toFixed(2)} €</div>
                            </div>
                            <div>
                              <div className="font-medium">Total TTC</div>
                              <div className="text-lg font-bold text-blue-600">{ligne.totalTTC.toFixed(2)} €</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {selectedClientId && lignes.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes complémentaires..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600 resize-none"
              />
            </div>
          )}

          {/* Totaux */}
          {lignes.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Totaux</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-lg text-gray-900">
                  <span>Total HT</span>
                  <span className="font-bold">{totals.totalHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-lg text-gray-900">
                  <span>Total TVA</span>
                  <span className="font-bold">{totals.totalTVA.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-blue-600 pt-3 border-t">
                  <span>Total TTC</span>
                  <span>{totals.totalTTC.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {lignes.length > 0 && (
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {saving ? 'Enregistrement...' : '✓ Enregistrer les modifications'}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/admin/devis/${devisId}`)}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}