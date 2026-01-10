'use client'

/**
 * PAGE CRÉATION CONTRAT RÉCURRENT - VERSION PROFESSIONNELLE
 * Formulaire multi-étapes complet avec validation temps réel
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  createContratRecurrent,
  validerContrat,
  calculerCAEstime
} from '@/lib/firebase/contrats-recurrents'
import { getAllClients, type Client } from '@/lib/firebase/clients'
import { getAllGroupes } from '@/lib/firebase/groupes'
import { getSitesByClient } from '@/lib/firebase/sites'
import { getAllArticles, type Article } from '@/lib/firebase/articles'
import { getPrestationsActives, type PrestationCatalogue } from '@/lib/firebase/prestations-catalogue'
import type {
  ContratRecurrent,
  FrequenceContrat,
  LigneContrat,
  TypeRenouvellement
} from '@/lib/types/contrats-recurrents'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  Settings,
  Save,
  Calculator
} from 'lucide-react'

interface Site {
  id: string
  nom: string
  adresse: string
}

export default function NouveauContratPage() {
  const router = useRouter()
  
  // Données
  const [clients, setClients] = useState<Client[]>([])
  const [groupes, setGroupes] = useState<any[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [prestations, setPrestations] = useState<PrestationCatalogue[]>([])
  const [typeLigne, setTypeLigne] = useState<'article' | 'prestation'>('article')
  
  // État formulaire
  const [etapeActive, setEtapeActive] = useState(1)
  const [saving, setSaving] = useState(false)
  
  // Données contrat
  const [formData, setFormData] = useState<Partial<ContratRecurrent>>({
    nom: '',
    clientId: '',
    groupeId: '',
    societeId: 'solaire_nettoyage', // Par défaut
    dateDebut: new Date(),
    frequence: 'mensuel',
    jourFacturation: 1,
    lignes: [],
    conditionsPaiement: {
      delaiJours: 30,
      modePaiement: 'virement',
      prelevementAuto: {
        active: false
      }
    },
    renouvellement: {
      type: 'manuel',
      dureeRenouvellement: 12,
      preavisResiliationJours: 60
    },
    notifications: {
      facturationProchaine: {
        active: true,
        joursAvant: [7, 1],
        destinataires: [],
        mode: 'email'
      },
      paiementEnRetard: {
        active: true,
        joursApres: [15, 30],
        destinataires: [],
        mode: 'email'
      },
      finContrat: {
        active: true,
        joursAvant: [90, 30],
        destinataires: [],
        mode: 'email'
      },
      seuilCA: {
        active: false,
        montantSeuil: 0,
        destinataires: []
      }
    },
    contactsPrincipaux: [],
    options: {
      validationManuelle: false,
      genererIntervention: false,
      envoyerEmailAuto: true,
      regrouperAvecAutresFactures: false
    },
    tags: [],
    statut: 'brouillon'
  })
  
  // Ligne en cours d'ajout
  const [nouvelleLigne, setNouvelleLigne] = useState({
    siteId: '',
    articleId: '',
    quantite: 1,
    description: ''
  })
  
  // Validation
  const [erreurs, setErreurs] = useState<any[]>([])
  const [avertissements, setAvertissements] = useState<any[]>([])

  useEffect(() => {
    chargerDonnees()
  }, [])

  useEffect(() => {
    if (formData.clientId) {
      chargerSites(formData.clientId)
    }
  }, [formData.clientId])

  async function chargerDonnees() {
    try {
      const [clientsData, groupesData, articlesData, prestationsData] = await Promise.all([
        getAllClients(),
        getAllGroupes(),
        getAllArticles(),
        getPrestationsActives()
      ])
      
      setClients(clientsData)
      setGroupes(groupesData)
      setArticles(articlesData)
      setPrestations(prestationsData)
    } catch (error) {
      console.error('Erreur chargement données:', error)
    }
  }

  async function chargerSites(clientId: string) {
    try {
      const sitesData = await getSitesByClient(clientId)
      setSites(sitesData)
    } catch (error) {
      console.error('Erreur chargement sites:', error)
    }
  }

  function ajouterLigne() {
    const site = sites.find(s => s.id === nouvelleLigne.siteId)
    const article = articles.find(a => a.id === nouvelleLigne.articleId)
    
    if (!site || !article) return
    
    const montantHT = article.prix * nouvelleLigne.quantite
    const tauxTVA = 20 // TVA par défaut
    const montantTVA = montantHT * (tauxTVA / 100)
    const montantTTC = montantHT + montantTVA
    
    const ligne: LigneContrat = {
      id: `ligne_${Date.now()}`,
      siteId: site.id,
      siteNom: site.nom,
      articleId: article.id,
      articleCode: article.code,
      articleNom: article.nom,
      quantite: nouvelleLigne.quantite,
      prixUnitaireHT: article.prix,
      tauxTVA,
      montantHT,
      montantTVA,
      montantTTC,
      description: nouvelleLigne.description
    }
    
    setFormData(prev => ({
      ...prev,
      lignes: [...(prev.lignes || []), ligne]
    }))
    
    // Reset formulaire ligne
    setNouvelleLigne({
      siteId: '',
      articleId: '',
      quantite: 1,
      description: ''
    })
  }

  function supprimerLigne(ligneId: string) {
    setFormData(prev => ({
      ...prev,
      lignes: prev.lignes?.filter(l => l.id !== ligneId) || []
    }))
  }

  function calculerTotaux() {
    const lignes = formData.lignes || []
    const totalHT = lignes.reduce((sum, l) => sum + l.montantHT, 0)
    const totalTVA = lignes.reduce((sum, l) => sum + l.montantTVA, 0)
    const totalTTC = totalHT + totalTVA
    
    return {
      totalHT: Math.round(totalHT * 100) / 100,
      totalTVA: Math.round(totalTVA * 100) / 100,
      totalTTC: Math.round(totalTTC * 100) / 100
    }
  }

  async function calculerProchaineDate() {
    if (!formData.dateDebut || !formData.frequence) return null
    
    try {
      const response = await fetch('/api/contrats/calculer-prochaine-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateActuelle: formData.dateDebut,
          frequence: formData.frequence,
          jourFacturation: formData.jourFacturation,
          frequencePersonnalisee: formData.frequencePersonnalisee,
          montantFacturation: calculerTotaux().totalHT
        })
      })
      
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Erreur calcul date:', error)
      return null
    }
  }

  function validerEtape(etape: number): boolean {
    const validation = validerContrat(formData)
    setErreurs(validation.erreurs)
    setAvertissements(validation.avertissements)
    
    switch (etape) {
      case 1: // Informations générales
        return !validation.erreurs.some(e => 
          ['nom', 'clientId', 'societeId'].includes(e.champ)
        )
      
      case 2: // Dates & Récurrence
        return !validation.erreurs.some(e => 
          ['dateDebut', 'frequence', 'jourFacturation'].includes(e.champ)
        )
      
      case 3: // Sites & Prestations
        return (formData.lignes?.length || 0) > 0
      
      case 4: // Conditions & Options
        return true // Toujours valide
      
      default:
        return false
    }
  }

  function allerEtapeSuivante() {
    if (validerEtape(etapeActive)) {
      setEtapeActive(prev => Math.min(prev + 1, 5))
    }
  }

  function allerEtapePrecedente() {
    setEtapeActive(prev => Math.max(prev - 1, 1))
  }

  async function sauvegarder() {
    // Validation finale
    const validation = validerContrat(formData)
    if (!validation.valide) {
      setErreurs(validation.erreurs)
      alert('Le formulaire contient des erreurs')
      return
    }
    
    try {
      setSaving(true)
      
      // Calculer montants
      const totaux = calculerTotaux()
      
      // Calculer prochaine date
      const calculDate = await calculerProchaineDate()
      
      // Créer le contrat
      const contrat = await createContratRecurrent({
        ...formData as any,
        ...totaux,
        prochaineDateFacturation: calculDate?.prochaineDateFacturation || formData.dateDebut!,
        caAnnuelEstime: calculDate?.caAnnuelEstime || 0,
        createdBy: 'Jerome' // TODO: Auth user
      })
      
      alert('Contrat créé avec succès !')
      router.push(`/admin/finances/contrats/${contrat.id}`)
      
    } catch (error) {
      console.error('Erreur création contrat:', error)
      alert('Erreur lors de la création du contrat')
    } finally {
      setSaving(false)
    }
  }

  const totaux = calculerTotaux()
  const clientSelectionne = clients.find(c => c.id === formData.clientId)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/finances/contrats"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux contrats
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Nouveau contrat récurrent
          </h1>
          <p className="text-gray-600 mt-2">
            Créez un contrat de facturation automatique
          </p>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, titre: 'Informations', icon: Building2 },
              { num: 2, titre: 'Récurrence', icon: Calendar },
              { num: 3, titre: 'Prestations', icon: FileText },
              { num: 4, titre: 'Options', icon: Settings },
              { num: 5, titre: 'Récapitulatif', icon: Check }
            ].map((etape, index) => {
              const Icon = etape.icon
              const estActive = etapeActive === etape.num
              const estComplete = etapeActive > etape.num
              
              return (
                <div key={etape.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors ${
                        estActive
                          ? 'bg-blue-600 text-white'
                          : estComplete
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {estComplete ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`text-sm mt-2 font-medium ${
                      estActive ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {etape.titre}
                    </span>
                  </div>
                  
                  {index < 4 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      estComplete ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Erreurs globales */}
        {erreurs.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 mb-2">
                  {erreurs.length} erreur(s) détectée(s)
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {erreurs.map((err, i) => (
                    <li key={i} className="text-sm text-red-700">
                      {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Contenu formulaire */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          {/* ÉTAPE 1: Informations générales */}
          {etapeActive === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Informations générales
              </h2>

              {/* Nom du contrat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du contrat *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  placeholder="Ex: Entretien mensuel ENGIE"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.company}
                    </option>
                  ))}
                </select>
              </div>

              {/* Référence externe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Référence externe (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.reference || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="Numéro de référence client"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Description du contrat..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* ÉTAPE 2: Dates & Récurrence */}
          {etapeActive === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Dates et récurrence
              </h2>

              {/* Date début */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début *
                </label>
                <input
                  type="date"
                  value={formData.dateDebut?.toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dateDebut: new Date(e.target.value) 
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date fin (optionnelle) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin (optionnel)
                </label>
                <input
                  type="date"
                  value={formData.dateFin?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dateFin: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Laissez vide pour un contrat sans date de fin
                </p>
              </div>

              {/* Fréquence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence de facturation *
                </label>
                <select
                  value={formData.frequence}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    frequence: e.target.value as FrequenceContrat 
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="hebdomadaire">Hebdomadaire</option>
                  <option value="bimensuel">Bimensuel (tous les 15 jours)</option>
                  <option value="mensuel">Mensuel</option>
                  <option value="bimestriel">Bimestriel (tous les 2 mois)</option>
                  <option value="trimestriel">Trimestriel</option>
                  <option value="quadrimestriel">Quadrimestriel (tous les 4 mois)</option>
                  <option value="semestriel">Semestriel</option>
                  <option value="annuel">Annuel</option>
                </select>
              </div>

              {/* Jour de facturation */}
              {!['hebdomadaire', 'bimensuel'].includes(formData.frequence!) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jour de facturation
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.jourFacturation}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      jourFacturation: parseInt(e.target.value) 
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Entre 1 et 31 (ajusté au dernier jour du mois si nécessaire)
                  </p>
                </div>
              )}

              {/* Renouvellement */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Renouvellement</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de renouvellement
                    </label>
                    <select
                      value={formData.renouvellement?.type}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        renouvellement: {
                          ...prev.renouvellement!,
                          type: e.target.value as TypeRenouvellement
                        }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="manuel">Manuel (nécessite validation)</option>
                      <option value="tacite">Tacite (renouvellement automatique)</option>
                      <option value="aucun">Aucun (fin définitive)</option>
                    </select>
                  </div>

                  {formData.renouvellement?.type === 'tacite' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Durée du renouvellement (mois)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.renouvellement.dureeRenouvellement || 12}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            renouvellement: {
                              ...prev.renouvellement!,
                              dureeRenouvellement: parseInt(e.target.value)
                            }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Préavis de résiliation (jours)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.renouvellement.preavisResiliationJours || 60}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            renouvellement: {
                              ...prev.renouvellement!,
                              preavisResiliationJours: parseInt(e.target.value)
                            }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 3: Sites & Prestations */}
          {etapeActive === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Sites et prestations
              </h2>

              {/* Formulaire ajout ligne */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="font-medium text-gray-900">Ajouter une prestation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site
                    </label>
                    <select
                      value={nouvelleLigne.siteId}
                      onChange={(e) => setNouvelleLigne(prev => ({ ...prev, siteId: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!formData.clientId}
                    >
                      <option value="">Sélectionner</option>
                      {sites.map(site => (
                        <option key={site.id} value={site.id}>
                          {site.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          checked={typeLigne === 'article'}
                          onChange={() => setTypeLigne('article')}
                          className="mr-2"
                        />
                        Article
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          checked={typeLigne === 'prestation'}
                          onChange={() => setTypeLigne('prestation')}
                          className="mr-2"
                        />
                        Prestation
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {typeLigne === 'article' ? 'Article' : 'Prestation'}
                    </label>
                    <select
                      value={nouvelleLigne.articleId}
                      onChange={(e) => setNouvelleLigne(prev => ({ ...prev, articleId: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner</option>
                      {typeLigne === 'article' ? (
                        articles.map(article => (
                          <option key={article.id} value={article.id}>
                            {article.code} - {article.nom}
                          </option>
                        ))
                      ) : (
                        prestations.map(prestation => (
                          <option key={prestation.id} value={prestation.id}>
                            {prestation.code} - {prestation.libelle}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={nouvelleLigne.quantite}
                      onChange={(e) => setNouvelleLigne(prev => ({ ...prev, quantite: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={ajouterLigne}
                  disabled={!nouvelleLigne.siteId || !nouvelleLigne.articleId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Ajouter la ligne
                </button>
              </div>

              {/* Liste des lignes */}
              {formData.lignes && formData.lignes.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Site
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Article
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Qté
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Prix HT
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Total HT
                        </th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.lignes.map(ligne => (
                        <tr key={ligne.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {ligne.siteNom}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {ligne.articleCode} - {ligne.articleNom}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {ligne.quantite}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {ligne.prixUnitaireHT.toLocaleString('fr-FR')}€
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {ligne.montantHT.toLocaleString('fr-FR')}€
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => supprimerLigne(ligne.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">
                          Total HT
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          {totaux.totalHT.toLocaleString('fr-FR')}€
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">
                          TVA 20%
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          {totaux.totalTVA.toLocaleString('fr-FR')}€
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">
                          Total TTC
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-blue-600 text-lg">
                          {totaux.totalTTC.toLocaleString('fr-FR')}€
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune prestation ajoutée</p>
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 4: Options */}
          {etapeActive === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Conditions et options
              </h2>

              {/* Conditions de paiement */}
              <div className="border-b pb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Conditions de paiement</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Délai de paiement (jours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.conditionsPaiement?.delaiJours}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditionsPaiement: {
                          ...prev.conditionsPaiement!,
                          delaiJours: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mode de paiement
                    </label>
                    <select
                      value={formData.conditionsPaiement?.modePaiement}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditionsPaiement: {
                          ...prev.conditionsPaiement!,
                          modePaiement: e.target.value as any
                        }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="virement">Virement</option>
                      <option value="prelevement">Prélèvement</option>
                      <option value="cheque">Chèque</option>
                      <option value="carte">Carte bancaire</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Options génération */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Options de génération</h3>
                
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.options?.validationManuelle}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      options: {
                        ...prev.options!,
                        validationManuelle: e.target.checked
                      }
                    }))}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Validation manuelle</div>
                    <div className="text-sm text-gray-600">
                      Les factures seront générées en brouillon et nécessiteront une validation
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.options?.envoyerEmailAuto}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      options: {
                        ...prev.options!,
                        envoyerEmailAuto: e.target.checked
                      }
                    }))}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Envoi email automatique</div>
                    <div className="text-sm text-gray-600">
                      Les factures seront envoyées automatiquement au client
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.options?.genererIntervention}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      options: {
                        ...prev.options!,
                        genererIntervention: e.target.checked
                      }
                    }))}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Générer intervention automatiquement</div>
                    <div className="text-sm text-gray-600">
                      Une intervention sera créée automatiquement lors de chaque facturation
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ÉTAPE 5: Récapitulatif */}
          {etapeActive === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Récapitulatif
              </h2>

              {/* Informations générales */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Informations</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-600">Nom</dt>
                    <dd className="font-medium text-gray-900">{formData.nom}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Client</dt>
                    <dd className="font-medium text-gray-900">
                      {clients.find(c => c.id === formData.clientId)?.company}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Fréquence</dt>
                    <dd className="font-medium text-gray-900 capitalize">{formData.frequence}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Date début</dt>
                    <dd className="font-medium text-gray-900">
                      {formData.dateDebut?.toLocaleDateString('fr-FR')}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Montants */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Montants
                </h3>
                <dl className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Par facturation (HT)</dt>
                    <dd className="font-medium text-gray-900">
                      {totaux.totalHT.toLocaleString('fr-FR')}€
                    </dd>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <dt className="text-gray-900">CA annuel estimé</dt>
                    <dd className="text-blue-600">
                      {/* Calculé automatiquement selon fréquence */}
                      {(() => {
                        const multiplicateurs: Record<string, number> = {
                          hebdomadaire: 52,
                          bimensuel: 24,
                          mensuel: 12,
                          bimestriel: 6,
                          trimestriel: 4,
                          quadrimestriel: 3,
                          semestriel: 2,
                          annuel: 1
                        }
                        const mult = multiplicateurs[formData.frequence!] || 0
                        return (totaux.totalHT * mult).toLocaleString('fr-FR')
                      })()}€
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Prestations */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Prestations ({formData.lignes?.length})
                </h3>
                <div className="space-y-2">
                  {formData.lignes?.map(ligne => (
                    <div key={ligne.id} className="flex justify-between text-sm bg-gray-50 p-3 rounded">
                      <div>
                        <div className="font-medium text-gray-900">{ligne.siteNom}</div>
                        <div className="text-gray-600">{ligne.articleNom}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {ligne.montantHT.toLocaleString('fr-FR')}€
                        </div>
                        <div className="text-xs text-gray-600">
                          {ligne.quantite}x {ligne.prixUnitaireHT}€
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation boutons */}
        <div className="flex items-center justify-between">
          {etapeActive > 1 ? (
            <button
              onClick={allerEtapePrecedente}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Précédent
            </button>
          ) : (
            <div />
          )}

          {etapeActive < 5 ? (
            <button
              onClick={allerEtapeSuivante}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Suivant
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={sauvegarder}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Créer le contrat
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
