'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createFacture, calculateLigneFacture, LigneFacture } from '@/lib/firebase/factures'
import { getAllClients } from '@/lib/firebase/clients'
import { getAllArticles } from '@/lib/firebase/articles'
import { SelectSociete } from '@/components/finances/SelectSociete'

export default function NouvelleFacturePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [lignes, setLignes] = useState<LigneFacture[]>([])
  
  const [formData, setFormData] = useState({
    societeId: '',
    clientId: '',
    clientNom: '',
    dateEcheance: '',
    notes: '',
    conditionsPaiement: 'Paiement à 30 jours',
    modalitesReglement: 'Virement bancaire'
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [clientsData, articlesData] = await Promise.all([
        getAllClients(),
        getAllArticles()
      ])
      setClients(clientsData)
      setArticles(articlesData)
    } catch (error) {
      console.error('Erreur chargement données:', error)
    }
  }

  function handleClientChange(clientId: string) {
    const client = clients.find(c => c.id === clientId)
    setFormData({
      ...formData,
      clientId,
      clientNom: client ? client.company : ''
    })
  }

  function ajouterLigne() {
    const nouvelleLigne: LigneFacture = {
      siteId: 'temp_' + Date.now(),
      siteNom: '',
      articleId: '',
      articleCode: '',
      articleNom: '',
      articleDescription: '',
      quantite: 1,
      prixUnitaire: 0,
      tva: 20,
      totalHT: 0,
      totalTVA: 0,
      totalTTC: 0
    }
    setLignes([...lignes, nouvelleLigne])
  }

  function modifierLigne(index: number, field: string, value: any) {
    const nouvellesLignes = [...lignes]
    const ligne = { ...nouvellesLignes[index] }
    
    if (field === 'articleId') {
      const article = articles.find(a => a.id === value)
      if (article) {
        ligne.articleId = article.id
        ligne.articleCode = article.code
        ligne.articleNom = article.nom
        ligne.articleDescription = article.description
        ligne.prixUnitaire = article.prixUnitaire || 0
      }
    } else {
      (ligne as any)[field] = value
    }
    
    // Recalculer totaux
    if (field === 'quantite' || field === 'prixUnitaire' || field === 'tva') {
      const totaux = calculateLigneFacture(ligne.quantite, ligne.prixUnitaire, ligne.tva)
      ligne.totalHT = totaux.totalHT
      ligne.totalTVA = totaux.totalTVA
      ligne.totalTTC = totaux.totalTTC
    }
    
    nouvellesLignes[index] = ligne
    setLignes(nouvellesLignes)
  }

  function supprimerLigne(index: number) {
    setLignes(lignes.filter((_, i) => i !== index))
  }

  const totalHT = lignes.reduce((sum, l) => sum + l.totalHT, 0)
  const totalTVA = lignes.reduce((sum, l) => sum + l.totalTVA, 0)
  const totalTTC = lignes.reduce((sum, l) => sum + l.totalTTC, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.societeId) {
      alert('Veuillez sélectionner une société')
      return
    }
    
    if (!formData.clientId) {
      alert('Veuillez sélectionner un client')
      return
    }
    
    if (lignes.length === 0) {
      alert('Ajoutez au moins une ligne')
      return
    }
    
    setLoading(true)
    
    try {
      const factureId = await createFacture({
        societeId: formData.societeId,
        clientId: formData.clientId,
        clientNom: formData.clientNom,
        dateEcheance: formData.dateEcheance,
        lignes,
        notes: formData.notes,
        conditionsPaiement: formData.conditionsPaiement,
        modalitesReglement: formData.modalitesReglement,
        statut: 'brouillon'
      })
      
      alert('✅ Facture créée avec succès !')
      router.push(`/admin/finances/factures/${factureId}`)
    } catch (error) {
      console.error('Erreur création facture:', error)
      alert('❌ Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nouvelle Facture</h1>
        <p className="text-gray-700 mt-1">Créer une nouvelle facture client</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* INFORMATIONS CLIENT */}
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-300">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informations Client</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* SELECT SOCIÉTÉ - NOUVEAU */}
            <div>
              <SelectSociete
                value={formData.societeId}
                onValueChange={(value) => setFormData({...formData, societeId: value})}
                required
                label="Société émettrice"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Client *
              </label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Sélectionner un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.company}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Date d'échéance
              </label>
              <input
                type="date"
                value={formData.dateEcheance}
                onChange={(e) => setFormData({...formData, dateEcheance: e.target.value})}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* LIGNES DE FACTURE */}
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Lignes de facture</h2>
            <button
              type="button"
              onClick={ajouterLigne}
              className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 font-semibold"
            >
              ➕ Ajouter une ligne
            </button>
          </div>

          {lignes.map((ligne, index) => (
            <div key={index} className="border border-gray-400 p-4 rounded-lg mb-4 bg-gray-50">
              <div className="grid grid-cols-6 gap-3 mb-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-900 mb-1">Article</label>
                  <select
                    value={ligne.articleId}
                    onChange={(e) => modifierLigne(index, 'articleId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-400 rounded text-gray-900 text-sm"
                  >
                    <option value="">Sélectionner</option>
                    {articles.map(article => (
                      <option key={article.id} value={article.id}>
                        {article.code} - {article.nom}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">Quantité</label>
                  <input
                    type="number"
                    min="1"
                    value={ligne.quantite}
                    onChange={(e) => modifierLigne(index, 'quantite', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-400 rounded text-gray-900 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">Prix unitaire HT</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={ligne.prixUnitaire}
                    onChange={(e) => modifierLigne(index, 'prixUnitaire', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-400 rounded text-gray-900 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">TVA %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={ligne.tva}
                    onChange={(e) => modifierLigne(index, 'tva', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-400 rounded text-gray-900 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">Total TTC</label>
                  <div className="px-3 py-2 bg-gray-200 border border-gray-400 rounded text-gray-900 font-bold text-sm">
                    {ligne.totalTTC.toFixed(2)} €
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => supprimerLigne(index)}
                className="text-red-700 hover:text-red-900 text-sm font-semibold"
              >
                🗑️ Supprimer
              </button>
            </div>
          ))}

          {/* TOTAUX */}
          <div className="border-t-2 border-gray-400 pt-4 mt-6">
            <div className="flex justify-end">
              <div className="w-80">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-900 font-semibold">Total HT :</span>
                  <span className="text-gray-900 font-bold">{totalHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-900 font-semibold">Total TVA :</span>
                  <span className="text-gray-900 font-bold">{totalTVA.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-xl border-t-2 border-gray-400 pt-2">
                  <span className="text-gray-900 font-bold">Total TTC :</span>
                  <span className="text-blue-700 font-bold">{totalTTC.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NOTES ET CONDITIONS */}
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-300">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Conditions et notes</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Conditions de paiement
              </label>
              <input
                type="text"
                value={formData.conditionsPaiement}
                onChange={(e) => setFormData({...formData, conditionsPaiement: e.target.value})}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Modalités de règlement
              </label>
              <input
                type="text"
                value={formData.modalitesReglement}
                onChange={(e) => setFormData({...formData, modalitesReglement: e.target.value})}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Notes internes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900"
              placeholder="Notes visibles uniquement en interne..."
            />
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
            disabled={loading}
            className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-semibold disabled:bg-gray-500"
          >
            {loading ? 'Création...' : '✅ Créer la facture'}
          </button>
        </div>
      </form>
    </div>
  )
}
