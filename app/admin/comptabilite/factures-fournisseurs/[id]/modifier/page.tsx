'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  getFactureFournisseurById, 
  updateFactureFournisseur,
  type FactureFournisseur,
  type LigneFactureFournisseur
} from '@/lib/firebase/factures-fournisseurs-unifie'
import { getFournisseursActifs, type Fournisseur } from '@/lib/firebase/fournisseurs'
import { getAllArticlesStock, type ArticleStock } from '@/lib/firebase/stock-articles'
import { getComptesActifs, type CompteComptable } from '@/lib/firebase/plan-comptable'
import { uploadFactureFournisseurPDF } from '@/lib/firebase/storage'

interface LigneForm {
  id: string
  type: 'article' | 'manuel'
  articleStockId?: string
  articleCode?: string
  designation: string
  quantite: number
  prixUnitaireHT: number
  tauxTVA: number
  compteComptable: string
  compteIntitule: string
  depotDestination: string
  genererMouvementStock: boolean
  montantHT: number
  montantTVA: number
  montantTTC: number
}

export default function ModifierFactureFournisseurPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [facture, setFacture] = useState<FactureFournisseur | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploadingPdf, setUploadingPdf] = useState(false)

  // Données de référence
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([])
  const [articlesStock, setArticlesStock] = useState<ArticleStock[]>([])
  const [comptes, setComptes] = useState<CompteComptable[]>([])
  const [depots, setDepots] = useState<string[]>([])

  // Formulaire
  const [formData, setFormData] = useState({
    fournisseurId: '',
    fournisseurNom: '',
    numeroFournisseur: '',
    dateFacture: '',
    dateEcheance: '',
    notes: ''
  })

  const [lignes, setLignes] = useState<LigneForm[]>([])

  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
    if (!params.id || typeof params.id !== 'string') return
    
    setLoading(true)
    try {
      const [factureData, fournisseursData, articlesData, comptesData] = await Promise.all([
        getFactureFournisseurById(params.id),
        getFournisseursActifs(),
        getAllArticlesStock(),
        getComptesActifs()
      ])

      if (!factureData) {
        alert('Facture introuvable')
        router.push('/admin/comptabilite/factures-fournisseurs')
        return
      }

      if (factureData.statut !== 'brouillon') {
        alert('Seules les factures en brouillon peuvent être modifiées')
        router.push(`/admin/comptabilite/factures-fournisseurs/${params.id}`)
        return
      }

      setFacture(factureData)
      setFournisseurs(fournisseursData)
      setArticlesStock(articlesData)
      setComptes(comptesData)

      // Extraire les dépôts
      const depotsSet = new Set<string>()
      articlesData.forEach(article => {
        Object.keys(article.stockParDepot || {}).forEach(depot => {
          depotsSet.add(depot)
        })
      })
      setDepots(['Atelier', ...Array.from(depotsSet).filter(d => d !== 'Atelier')])

      // Remplir le formulaire
      setFormData({
        fournisseurId: '', // Pas de fournisseurId dans FactureFournisseur
        fournisseurNom: factureData.fournisseur,
        numeroFournisseur: factureData.numeroFournisseur,
        dateFacture: factureData.dateFacture,
        dateEcheance: factureData.dateEcheance,
        notes: factureData.notes || ''
      })

      // Convertir les lignes
      const lignesForm: LigneForm[] = factureData.lignes.map(ligne => ({
        id: ligne.id,
        type: ligne.articleStockId ? 'article' : 'manuel',
        articleStockId: ligne.articleStockId,
        articleCode: ligne.articleCode,
        designation: ligne.designation || '', // Valeur par défaut si undefined
        quantite: ligne.quantite,
        prixUnitaireHT: ligne.prixUnitaireHT,
        tauxTVA: ligne.tauxTVA,
        compteComptable: ligne.compteComptable,
        compteIntitule: ligne.compteIntitule,
        depotDestination: ligne.depotDestination,
        genererMouvementStock: ligne.genererMouvementStock,
        montantHT: ligne.montantHT,
        montantTVA: ligne.montantTVA,
        montantTTC: ligne.montantTTC
      }))
      
      setLignes(lignesForm)

    } catch (error) {
      console.error('Erreur chargement:', error)
      alert('Erreur lors du chargement de la facture')
    } finally {
      setLoading(false)
    }
  }

  function handleLigneTypeChange(ligneId: string, type: 'article' | 'manuel') {
    setLignes(lignes.map(ligne => {
      if (ligne.id === ligneId) {
        return {
          ...ligne,
          type,
          articleStockId: undefined,
          articleCode: undefined,
          designation: '',
          compteComptable: '',
          compteIntitule: '',
          prixUnitaireHT: 0,
          genererMouvementStock: type === 'article'
        }
      }
      return ligne
    }))
  }

  function handleArticleChange(ligneId: string, articleId: string) {
    const article = articlesStock.find(a => a.id === articleId)
    if (!article) return

    setLignes(lignes.map(ligne => {
      if (ligne.id === ligneId) {
        const updatedLigne = {
          ...ligne,
          articleStockId: articleId,
          articleCode: article.code,
          designation: article.description,
          prixUnitaireHT: article.prixUnitaire || 0,
          compteComptable: article.compteComptable || '',
          compteIntitule: article.compteIntitule || ''
        }
        return calculerMontantsLigne(updatedLigne)
      }
      return ligne
    }))
  }

  function handleCompteChange(ligneId: string, compteNumero: string) {
    const compte = comptes.find(c => c.numero === compteNumero)
    if (!compte) return

    setLignes(lignes.map(ligne => {
      if (ligne.id === ligneId) {
        return {
          ...ligne,
          compteComptable: compte.numero,
          compteIntitule: compte.intitule
        }
      }
      return ligne
    }))
  }

  function handleLigneChange(ligneId: string, field: string, value: any) {
    setLignes(lignes.map(ligne => {
      if (ligne.id === ligneId) {
        const updatedLigne = { ...ligne, [field]: value }
        return calculerMontantsLigne(updatedLigne)
      }
      return ligne
    }))
  }

  function calculerMontantsLigne(ligne: LigneForm): LigneForm {
    const montantHT = ligne.quantite * ligne.prixUnitaireHT
    const montantTVA = montantHT * (ligne.tauxTVA / 100)
    const montantTTC = montantHT + montantTVA

    return {
      ...ligne,
      montantHT: Number(montantHT.toFixed(2)),
      montantTVA: Number(montantTVA.toFixed(2)),
      montantTTC: Number(montantTTC.toFixed(2))
    }
  }

  function ajouterLigne() {
    const maxId = Math.max(...lignes.map(l => parseInt(l.id.replace('L', ''))))
    const newId = `L${(maxId + 1).toString().padStart(3, '0')}`
    
    setLignes([
      ...lignes,
      {
        id: newId,
        type: 'article',
        designation: '',
        quantite: 1,
        prixUnitaireHT: 0,
        tauxTVA: 20,
        compteComptable: '',
        compteIntitule: '',
        depotDestination: 'Atelier',
        genererMouvementStock: true,
        montantHT: 0,
        montantTVA: 0,
        montantTTC: 0
      }
    ])
  }

  function supprimerLigne(ligneId: string) {
    if (lignes.length === 1) {
      alert('Impossible de supprimer la dernière ligne')
      return
    }
    setLignes(lignes.filter(l => l.id !== ligneId))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validation
    if (!formData.fournisseurNom) {
      alert('Veuillez sélectionner un fournisseur')
      return
    }

    if (!formData.numeroFournisseur) {
      alert('Veuillez saisir le numéro de facture fournisseur')
      return
    }

    if (lignes.some(l => !l.designation || !l.compteComptable)) {
      alert('Toutes les lignes doivent avoir une désignation et un compte comptable')
      return
    }

    if (lignes.some(l => l.quantite <= 0 || l.prixUnitaireHT < 0)) {
      alert('Quantités et prix doivent être valides')
      return
    }

    setSaving(true)

    try {
      const lignesFacture = lignes.map(ligne => ({
        id: ligne.id,
        articleStockId: ligne.type === 'article' ? ligne.articleStockId : undefined,
        articleCode: ligne.articleCode,
        designation: ligne.designation,
        quantite: ligne.quantite,
        prixUnitaireHT: ligne.prixUnitaireHT,
        tauxTVA: ligne.tauxTVA,
        montantHT: ligne.montantHT,
        montantTVA: ligne.montantTVA,
        montantTTC: ligne.montantTTC,
        compteComptable: ligne.compteComptable,
        compteIntitule: ligne.compteIntitule,
        depotDestination: ligne.depotDestination,
        genererMouvementStock: ligne.genererMouvementStock
      }))

      // 1. Mettre à jour la facture
      await updateFactureFournisseur(params.id as string, {
        fournisseur: formData.fournisseurNom,
        siretFournisseur: formData.fournisseurId 
          ? fournisseurs.find(f => f.id === formData.fournisseurId)?.siret 
          : undefined,
        numeroFournisseur: formData.numeroFournisseur,
        dateFacture: formData.dateFacture,
        dateEcheance: formData.dateEcheance,
        lignes: lignesFacture as any,
        notes: formData.notes
      })

      // 2. Upload nouveau PDF si présent
      if (pdfFile) {
        setUploadingPdf(true)
        try {
          const pdfURL = await uploadFactureFournisseurPDF(pdfFile, params.id as string)
          await updateFactureFournisseur(params.id as string, { pdfURL })
        } catch (pdfError) {
          console.error('Erreur upload PDF:', pdfError)
          alert('Facture modifiée mais erreur lors de l\'upload du PDF')
        } finally {
          setUploadingPdf(false)
        }
      }

      alert('Facture modifiée avec succès')
      router.push(`/admin/comptabilite/factures-fournisseurs/${params.id}`)
    } catch (error: any) {
      console.error('Erreur modification facture:', error)
      alert(error.message || 'Erreur lors de la modification de la facture')
    } finally {
      setSaving(false)
    }
  }

  const totaux = lignes.reduce((acc, ligne) => ({
    ht: acc.ht + ligne.montantHT,
    tva: acc.tva + ligne.montantTVA,
    ttc: acc.ttc + ligne.montantTTC
  }), { ht: 0, tva: 0, ttc: 0 })

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!facture) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Facture introuvable</h2>
          <Link href="/admin/comptabilite/factures-fournisseurs" className="text-blue-600">
            ← Retour à la liste
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href={`/admin/comptabilite/factures-fournisseurs/${params.id}`}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          ← Retour à la facture
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Modifier Facture {facture.numero}</h1>
        <p className="text-gray-600 mt-1">Module Comptabilité - Phase 3</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Informations générales */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informations générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fournisseur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fournisseur *
              </label>
              <select
                value={formData.fournisseurId}
                onChange={(e) => {
                  const fournisseur = fournisseurs.find(f => f.id === e.target.value)
                  setFormData({
                    ...formData,
                    fournisseurId: e.target.value,
                    fournisseurNom: fournisseur?.nom || ''
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionner un fournisseur</option>
                {fournisseurs.map(f => (
                  <option key={f.id} value={f.id}>{f.nom}</option>
                ))}
              </select>
            </div>

            {/* N° Facture Fournisseur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                N° Facture Fournisseur *
              </label>
              <input
                type="text"
                value={formData.numeroFournisseur}
                onChange={(e) => setFormData({ ...formData, numeroFournisseur: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Date Facture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Facture *
              </label>
              <input
                type="date"
                value={formData.dateFacture}
                onChange={(e) => setFormData({ ...formData, dateFacture: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Date Échéance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Échéance *
              </label>
              <input
                type="date"
                value={formData.dateEcheance}
                onChange={(e) => setFormData({ ...formData, dateEcheance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* PDF actuel */}
          {facture?.pdfURL && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">📄</span>
                <span className="text-sm text-gray-700">PDF actuel disponible</span>
                <a
                  href={facture.pdfURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm ml-auto"
                >
                  Télécharger
                </a>
              </div>
            </div>
          )}

          {/* Upload nouveau PDF */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📄 {facture?.pdfURL ? 'Remplacer le PDF' : 'Ajouter PDF Facture'}
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  if (file.type !== 'application/pdf') {
                    alert('Seuls les fichiers PDF sont acceptés')
                    e.target.value = ''
                    return
                  }
                  if (file.size > 10 * 1024 * 1024) { // 10 MB max
                    alert('Le fichier ne doit pas dépasser 10 MB')
                    e.target.value = ''
                    return
                  }
                  setPdfFile(file)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {pdfFile && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-600">✓</span>
                <span>{pdfFile.name}</span>
                <span className="text-gray-400">({(pdfFile.size / 1024).toFixed(0)} KB)</span>
                <button
                  type="button"
                  onClick={() => setPdfFile(null)}
                  className="text-red-600 hover:text-red-800 ml-2"
                >
                  ✕ Retirer
                </button>
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Format accepté : PDF • Taille max : 10 MB
            </p>
          </div>
        </div>

        {/* Lignes de facture */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Lignes de facture</h2>
            <button
              type="button"
              onClick={ajouterLigne}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + Ajouter ligne
            </button>
          </div>

          <div className="space-y-4">
            {lignes.map((ligne, index) => (
              <div key={ligne.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-gray-700">Ligne {index + 1}</span>
                  {lignes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => supprimerLigne(ligne.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️ Supprimer
                    </button>
                  )}
                </div>

                {/* Toggle Article / Manuel */}
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => handleLigneTypeChange(ligne.id, 'article')}
                    className={`flex-1 py-2 rounded-lg font-medium ${
                      ligne.type === 'article'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📦 Article Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLigneTypeChange(ligne.id, 'manuel')}
                    className={`flex-1 py-2 rounded-lg font-medium ${
                      ligne.type === 'manuel'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ✏️ Saisie Manuelle
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Article Stock OU Désignation */}
                  {ligne.type === 'article' ? (
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Article Stock *
                      </label>
                      <select
                        value={ligne.articleStockId || ''}
                        onChange={(e) => handleArticleChange(ligne.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        <option value="">Sélectionner un article</option>
                        {articlesStock.filter(a => a.actif).map(article => (
                          <option key={article.id} value={article.id}>
                            {article.code} - {article.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Désignation *
                      </label>
                      <input
                        type="text"
                        value={ligne.designation}
                        onChange={(e) => handleLigneChange(ligne.id, 'designation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                  )}

                  {/* Quantité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantité *
                    </label>
                    <input
                      type="number"
                      value={ligne.quantite}
                      onChange={(e) => handleLigneChange(ligne.id, 'quantite', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Prix unitaire HT */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix unitaire HT *
                    </label>
                    <input
                      type="number"
                      value={ligne.prixUnitaireHT}
                      onChange={(e) => handleLigneChange(ligne.id, 'prixUnitaireHT', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Compte Comptable */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compte Comptable *
                    </label>
                    <select
                      value={ligne.compteComptable}
                      onChange={(e) => handleCompteChange(ligne.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                      disabled={ligne.type === 'article' && !!ligne.articleStockId}
                    >
                      <option value="">Sélectionner un compte</option>
                      {comptes.filter(c => c.actif).map(compte => (
                        <option key={compte.numero} value={compte.numero}>
                          {compte.numero} - {compte.intitule}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* TVA */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TVA (%) *
                    </label>
                    <select
                      value={ligne.tauxTVA}
                      onChange={(e) => handleLigneChange(ligne.id, 'tauxTVA', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value={20}>20%</option>
                      <option value={10}>10%</option>
                      <option value={5.5}>5.5%</option>
                      <option value={0}>0%</option>
                    </select>
                  </div>

                  {/* Dépôt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dépôt *
                    </label>
                    <select
                      value={ligne.depotDestination}
                      onChange={(e) => handleLigneChange(ligne.id, 'depotDestination', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      {depots.map(depot => (
                        <option key={depot} value={depot}>{depot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Montants calculés */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-6 text-sm">
                  <div>
                    <span className="text-gray-600">Montant HT:</span>
                    <span className="ml-2 font-medium">{ligne.montantHT.toFixed(2)} €</span>
                  </div>
                  <div>
                    <span className="text-gray-600">TVA:</span>
                    <span className="ml-2 font-medium">{ligne.montantTVA.toFixed(2)} €</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Montant TTC:</span>
                    <span className="ml-2 font-bold text-lg">{ligne.montantTTC.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totaux */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Totaux</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-lg">
              <span className="text-gray-700">Total HT:</span>
              <span className="font-medium">{totaux.ht.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-700">Total TVA:</span>
              <span className="font-medium">{totaux.tva.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-2xl font-bold pt-2 border-t border-gray-300">
              <span className="text-gray-900">Total TTC:</span>
              <span className="text-orange-600">{totaux.ttc.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href={`/admin/comptabilite/factures-fournisseurs/${params.id}`}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving || uploadingPdf}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingPdf ? '📤 Upload PDF...' : saving ? 'Enregistrement...' : '💾 Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}
