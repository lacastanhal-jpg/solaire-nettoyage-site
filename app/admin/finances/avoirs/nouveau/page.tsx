'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createAvoir, LigneAvoir } from '@/lib/firebase/avoirs'
import { getAllClients } from '@/lib/firebase/clients'
import { getAllFactures } from '@/lib/firebase/factures'
import { SelectSociete } from '@/components/finances/SelectSociete'

export default function NouvelAvoirPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [factures, setFactures] = useState<any[]>([])
  const [lignes, setLignes] = useState<LigneAvoir[]>([])
  
  const [formData, setFormData] = useState({
    societeId: '',
    clientId: '',
    clientNom: '',
    factureOrigineId: '',
    factureOrigineNumero: '',
    motif: '',
    notes: '',
    utilisationType: 'deduction' as 'deduction' | 'remboursement'
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [clientsData, facturesData] = await Promise.all([
        getAllClients(),
        getAllFactures()
      ])
      setClients(clientsData)
      setFactures(facturesData)
    } catch (error) {
      console.error('Erreur chargement données:', error)
    }
  }

  function handleClientChange(clientId: string) {
    const client = clients.find(c => c.id === clientId)
    setFormData({
      ...formData,
      clientId,
      clientNom: client ? client.company : '',
      factureOrigineId: '',
      factureOrigineNumero: ''
    })
  }

  function handleFactureChange(factureId: string) {
    const facture = factures.find(f => f.id === factureId)
    if (facture) {
      setFormData({
        ...formData,
        factureOrigineId: facture.id,
        factureOrigineNumero: facture.numero,
        clientId: facture.clientId,
        clientNom: facture.clientNom,
        societeId: facture.societeId || formData.societeId
      })
      
      // Pré-remplir les lignes avec les lignes de la facture
      const lignesFromFacture: LigneAvoir[] = facture.lignes.map((ligne: any) => ({
        description: `${ligne.articleCode} - ${ligne.articleNom}`,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        tva: ligne.tva,
        montantHT: ligne.totalHT,
        montantTVA: ligne.totalTVA,
        montantTTC: ligne.totalTTC
      }))
      setLignes(lignesFromFacture)
    }
  }

  function ajouterLigne() {
    const nouvelleLigne: LigneAvoir = {
      description: '',
      quantite: 1,
      prixUnitaire: 0,
      tva: 20,
      montantHT: 0,
      montantTVA: 0,
      montantTTC: 0
    }
    setLignes([...lignes, nouvelleLigne])
  }

  function modifierLigne(index: number, field: string, value: any) {
    const nouvellesLignes = [...lignes]
    const ligne = { ...nouvellesLignes[index] }
    
    ligne[field] = value
    
    if (field === 'quantite' || field === 'prixUnitaire' || field === 'tva') {
      const montantHT = ligne.quantite * ligne.prixUnitaire
      const montantTVA = montantHT * (ligne.tva / 100)
      const montantTTC = montantHT + montantTVA
      
      ligne.montantHT = montantHT
      ligne.montantTVA = montantTVA
      ligne.montantTTC = montantTTC
    }
    
    nouvellesLignes[index] = ligne
    setLignes(nouvellesLignes)
  }

  function supprimerLigne(index: number) {
    setLignes(lignes.filter((_, i) => i !== index))
  }

  const totalHT = lignes.reduce((sum, l) => sum + l.montantHT, 0)
  const totalTVA = lignes.reduce((sum, l) => sum + l.montantTVA, 0)
  const totalTTC = lignes.reduce((sum, l) => sum + l.montantTTC, 0)

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
    
    if (!formData.motif.trim()) {
      alert('Veuillez saisir un motif')
      return
    }
    
    setLoading(true)
    
    try {
      const avoirId = await createAvoir({
        societeId: formData.societeId,
        clientId: formData.clientId,
        clientNom: formData.clientNom,
        factureOrigineId: formData.factureOrigineId || undefined,
        factureOrigineNumero: formData.factureOrigineNumero || undefined,
        lignes,
        motif: formData.motif,
        notes: formData.notes,
        utilisationType: formData.utilisationType,
        statut: 'brouillon'
      })
      
      alert('✅ Avoir créé avec succès !')
      router.push(`/admin/finances/avoirs/${avoirId}`)
    } catch (error) {
      console.error('Erreur création avoir:', error)
      alert('❌ Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const facturesClient = formData.clientId 
    ? factures.filter(f => f.clientId === formData.clientId)
    : []

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nouvel Avoir</h1>
        <p className="text-gray-700 mt-1">Créer un avoir client (note de crédit)</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* INFORMATIONS CLIENT */}
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-300">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informations</h2>
          
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
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Facture d'origine (optionnel)
              </label>
              <select
                value={formData.factureOrigineId}
                onChange={(e) => handleFactureChange(e.target.value)}
                disabled={!formData.clientId}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-600 disabled:bg-gray-200"
              >
                <option value="">Aucune facture liée</option>
                {facturesClient.map(facture => (
                  <option key={facture.id} value={facture.id}>
                    {facture.numero} - {facture.totalTTC.toFixed(2)} €
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Type d'utilisation *
              </label>
              <select
                value={formData.utilisationType}
                onChange={(e) => setFormData({...formData, utilisationType: e.target.value as any})}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-600"
              >
                <option value="deduction">Déduction sur prochaine facture</option>
                <option value="remboursement">Remboursement au client</option>
              </select>
            </div>
          </div>

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
              placeholder="Ex: Erreur de facturation, retour produit..."
            />
          </div>
        </div>

        {/* LIGNES D'AVOIR */}
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Lignes d'avoir</h2>
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
                  <label className="block text-xs font-bold text-gray-900 mb-1">Description</label>
                  <input
                    type="text"
                    value={ligne.description}
                    onChange={(e) => modifierLigne(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-400 rounded text-gray-900 text-sm"
                    placeholder="Description de la ligne"
                  />
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
                    {ligne.montantTTC.toFixed(2)} €
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
                  <span className="text-red-700 font-bold">-{totalTTC.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NOTES */}
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-300">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Notes internes</h2>
          
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={3}
            className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900"
            placeholder="Notes visibles uniquement en interne..."
          />
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
            {loading ? 'Création...' : '✅ Créer l\'avoir'}
          </button>
        </div>
      </form>
    </div>
  )
}
