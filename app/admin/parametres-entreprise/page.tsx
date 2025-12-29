'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getEntreprise, updateEntreprise, type Entreprise, type Adresse, type InformationsBancaires } from '@/lib/firebase/entreprise'

export default function ParametresEntreprisePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null)

  const [formData, setFormData] = useState({
    // INFORMATIONS GÉNÉRALES
    raisonSociale: '',
    nomCommercial: '',
    formeJuridique: '',
    
    // INFORMATIONS LÉGALES
    siret: '',
    numeroTVA: '',
    codeAPE: '',
    capitalSocial: '',
    rcs: '',
    
    // SIÈGE SOCIAL
    siegeRue: '',
    siegeComplementAdresse: '',
    siegeCodePostal: '',
    siegeVille: '',
    siegePays: 'France',
    
    // CONTACT
    telephone: '',
    email: '',
    siteWeb: '',
    
    // INFORMATIONS BANCAIRES
    bancaireTitulaire: '',
    bancaireBanque: '',
    bancaireIban: '',
    bancaireBic: '',
    
    // ASSURANCE
    assuranceCompagnie: '',
    assuranceNumeroPolice: '',
    assuranceMontantGarantie: '',
    
    // CONDITIONS COMMERCIALES
    conditionsPaiementDefaut: '',
    modalitesReglementDefaut: '',
    
    // PÉNALITÉS
    tauxPenalitesRetard: '10',
    indemniteForfaitaire: '40',
    
    // LOGO
    logoUrl: ''
  })

  useEffect(() => {
    loadEntreprise()
  }, [])

  async function loadEntreprise() {
    try {
      setLoading(true)
      const data = await getEntreprise()
      
      if (data) {
        setEntreprise(data)
        setFormData({
          raisonSociale: data.raisonSociale || '',
          nomCommercial: data.nomCommercial || '',
          formeJuridique: data.formeJuridique || '',
          siret: data.siret || '',
          numeroTVA: data.numeroTVA || '',
          codeAPE: data.codeAPE || '',
          capitalSocial: data.capitalSocial?.toString() || '',
          rcs: data.rcs || '',
          siegeRue: data.siegeSocial?.rue || '',
          siegeComplementAdresse: data.siegeSocial?.complementAdresse || '',
          siegeCodePostal: data.siegeSocial?.codePostal || '',
          siegeVille: data.siegeSocial?.ville || '',
          siegePays: data.siegeSocial?.pays || 'France',
          telephone: data.telephone || '',
          email: data.email || '',
          siteWeb: data.siteWeb || '',
          bancaireTitulaire: data.informationsBancaires?.titulaire || '',
          bancaireBanque: data.informationsBancaires?.banque || '',
          bancaireIban: data.informationsBancaires?.iban || '',
          bancaireBic: data.informationsBancaires?.bic || '',
          assuranceCompagnie: data.assuranceRC?.compagnie || '',
          assuranceNumeroPolice: data.assuranceRC?.numeroPolice || '',
          assuranceMontantGarantie: data.assuranceRC?.montantGarantie?.toString() || '',
          conditionsPaiementDefaut: data.conditionsPaiementDefaut || '',
          modalitesReglementDefaut: data.modalitesReglementDefaut || '',
          tauxPenalitesRetard: data.tauxPenalitesRetard?.toString() || '10',
          indemniteForfaitaire: data.indemniteForfaitaire?.toString() || '40',
          logoUrl: data.logoUrl || ''
        })
      }
    } catch (error) {
      console.error('Erreur chargement entreprise:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validation
    if (!formData.raisonSociale || !formData.siret || !formData.numeroTVA) {
      alert('Veuillez remplir au moins la raison sociale, le SIRET et le numéro de TVA')
      return
    }

    try {
      setSaving(true)

      const siegeSocial: Adresse = {
        rue: formData.siegeRue,
        complementAdresse: formData.siegeComplementAdresse,
        codePostal: formData.siegeCodePostal,
        ville: formData.siegeVille,
        pays: formData.siegePays
      }

      const informationsBancaires: InformationsBancaires = {
        titulaire: formData.bancaireTitulaire,
        banque: formData.bancaireBanque,
        iban: formData.bancaireIban,
        bic: formData.bancaireBic
      }

      await updateEntreprise({
        raisonSociale: formData.raisonSociale,
        nomCommercial: formData.nomCommercial,
        formeJuridique: formData.formeJuridique,
        siret: formData.siret,
        numeroTVA: formData.numeroTVA,
        codeAPE: formData.codeAPE,
        capitalSocial: parseFloat(formData.capitalSocial) || 0,
        rcs: formData.rcs,
        siegeSocial,
        telephone: formData.telephone,
        email: formData.email,
        siteWeb: formData.siteWeb,
        informationsBancaires,
        assuranceRC: {
          compagnie: formData.assuranceCompagnie,
          numeroPolice: formData.assuranceNumeroPolice,
          montantGarantie: parseFloat(formData.assuranceMontantGarantie) || 0
        },
        conditionsPaiementDefaut: formData.conditionsPaiementDefaut,
        modalitesReglementDefaut: formData.modalitesReglementDefaut,
        tauxPenalitesRetard: parseFloat(formData.tauxPenalitesRetard) || 10,
        indemniteForfaitaire: parseFloat(formData.indemniteForfaitaire) || 40,
        logoUrl: formData.logoUrl
      })

      alert('Informations enregistrées avec succès')
      await loadEntreprise()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-800">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Paramètres Entreprise</h1>
          <p className="text-gray-800 mt-1">Informations légales et commerciales de Solaire Nettoyage</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* INFORMATIONS GÉNÉRALES */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations Générales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Raison Sociale <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.raisonSociale}
                  onChange={(e) => setFormData({...formData, raisonSociale: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nom Commercial
                </label>
                <input
                  type="text"
                  value={formData.nomCommercial}
                  onChange={(e) => setFormData({...formData, nomCommercial: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Forme Juridique
                </label>
                <select
                  value={formData.formeJuridique}
                  onChange={(e) => setFormData({...formData, formeJuridique: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Sélectionner</option>
                  <option value="SAS">SAS</option>
                  <option value="SARL">SARL</option>
                  <option value="SASU">SASU</option>
                  <option value="EURL">EURL</option>
                  <option value="SA">SA</option>
                  <option value="SCI">SCI</option>
                  <option value="Auto-entrepreneur">Auto-entrepreneur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Capital Social (€)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.capitalSocial}
                  onChange={(e) => setFormData({...formData, capitalSocial: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* INFORMATIONS LÉGALES */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations Légales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  SIRET <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.siret}
                  onChange={(e) => setFormData({...formData, siret: e.target.value})}
                  placeholder="82050442100018"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Numéro TVA <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.numeroTVA}
                  onChange={(e) => setFormData({...formData, numeroTVA: e.target.value})}
                  placeholder="FR50820504421"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Code APE/NAF
                </label>
                <input
                  type="text"
                  value={formData.codeAPE}
                  onChange={(e) => setFormData({...formData, codeAPE: e.target.value})}
                  placeholder="8122Z"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  RCS
                </label>
                <input
                  type="text"
                  value={formData.rcs}
                  onChange={(e) => setFormData({...formData, rcs: e.target.value})}
                  placeholder="Rodez 820 504 421"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* SIÈGE SOCIAL */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Siège Social</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Rue
                </label>
                <input
                  type="text"
                  value={formData.siegeRue}
                  onChange={(e) => setFormData({...formData, siegeRue: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Complément d'adresse
                </label>
                <input
                  type="text"
                  value={formData.siegeComplementAdresse}
                  onChange={(e) => setFormData({...formData, siegeComplementAdresse: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Code Postal
                  </label>
                  <input
                    type="text"
                    value={formData.siegeCodePostal}
                    onChange={(e) => setFormData({...formData, siegeCodePostal: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.siegeVille}
                    onChange={(e) => setFormData({...formData, siegeVille: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={formData.siegePays}
                    onChange={(e) => setFormData({...formData, siegePays: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CONTACT */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Site Web
                </label>
                <input
                  type="url"
                  value={formData.siteWeb}
                  onChange={(e) => setFormData({...formData, siteWeb: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* INFORMATIONS BANCAIRES */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations Bancaires</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Titulaire
                </label>
                <input
                  type="text"
                  value={formData.bancaireTitulaire}
                  onChange={(e) => setFormData({...formData, bancaireTitulaire: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Banque
                </label>
                <input
                  type="text"
                  value={formData.bancaireBanque}
                  onChange={(e) => setFormData({...formData, bancaireBanque: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  IBAN
                </label>
                <input
                  type="text"
                  value={formData.bancaireIban}
                  onChange={(e) => setFormData({...formData, bancaireIban: e.target.value})}
                  placeholder="FR66 3000 2015 3100 0007 1513 Y94"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  BIC
                </label>
                <input
                  type="text"
                  value={formData.bancaireBic}
                  onChange={(e) => setFormData({...formData, bancaireBic: e.target.value})}
                  placeholder="CRLYFRPP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* ASSURANCE RC */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Assurance RC Professionnelle</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Compagnie
                </label>
                <input
                  type="text"
                  value={formData.assuranceCompagnie}
                  onChange={(e) => setFormData({...formData, assuranceCompagnie: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Numéro de Police
                </label>
                <input
                  type="text"
                  value={formData.assuranceNumeroPolice}
                  onChange={(e) => setFormData({...formData, assuranceNumeroPolice: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Montant Garantie (€)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.assuranceMontantGarantie}
                  onChange={(e) => setFormData({...formData, assuranceMontantGarantie: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* CONDITIONS COMMERCIALES */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Conditions Commerciales par Défaut</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Conditions de Paiement
                </label>
                <input
                  type="text"
                  value={formData.conditionsPaiementDefaut}
                  onChange={(e) => setFormData({...formData, conditionsPaiementDefaut: e.target.value})}
                  placeholder="30 jours fin de mois"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Modalités de Règlement
                </label>
                <input
                  type="text"
                  value={formData.modalitesReglementDefaut}
                  onChange={(e) => setFormData({...formData, modalitesReglementDefaut: e.target.value})}
                  placeholder="Virement bancaire"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* PÉNALITÉS (OBLIGATOIRE) */}
          <div className="bg-yellow-50 rounded-lg shadow-sm p-6 border-2 border-yellow-400">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Pénalités de Retard (Obligatoire)</h2>
            <p className="text-sm text-gray-800 mb-4">Mentions légales obligatoires depuis 2013</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Taux Pénalités de Retard (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.tauxPenalitesRetard}
                  onChange={(e) => setFormData({...formData, tauxPenalitesRetard: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Indemnité Forfaitaire (€)
                </label>
                <input
                  type="number"
                  step="1"
                  min="40"
                  value={formData.indemniteForfaitaire}
                  onChange={(e) => setFormData({...formData, indemniteForfaitaire: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <p className="text-xs text-gray-700 mt-1">Minimum légal : 40€</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {saving ? 'Enregistrement...' : '✓ Enregistrer les paramètres'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
