'use client'

import { useState, useEffect } from 'react'
import { doc, updateDoc, getDocs, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useLignesFinancieres } from '@/lib/gely/useFirestore'
import { LigneFinanciere } from '@/lib/gely/types'

interface Charge {
  id: string
  nom: string
  montantAnnuel: number
  type: 'fixe' | 'pourcentage'
  valeurPourcentage?: number
  avecInflation: boolean
}

interface FluxInterSociete {
  id: string
  nom: string
  type: 'loyer' | 'prestation' | 'autre'
  societeSource: string
  societeCible: string
  montantAnnuel: number
  avecInflation: boolean
}

interface LigneFinanciereParams {
  ligneId: string
  inclus: boolean
  type: 'ponctuel' | 'amortissable' | 'recurrent'
  duree: number
}

interface ParamsProjet {
  puissanceKWc: number
  productionAnnuelleKWh: number
  tarifEDF: number
  investissement: number
  apport: number
  tauxEmprunt: number
  dureeEmprunt: number
  differePremierAn: boolean
  tauxIS: number
  dureeAmortissement: number
  inflationGenerale: number
  baisseProductionAnnuelle: number
  charges: Charge[]
  lignesFinancieresParams: Record<string, LigneFinanciereParams>
  utiliserAmortissementGlobal: boolean
}

interface PlanPrevisionnelProps {
  projetId: string
  projetData: any
}

export default function PlanPrevisionnel20ans({ projetId, projetData }: PlanPrevisionnelProps) {
  const [modeEdition, setModeEdition] = useState(false)
  
  // CORRECTION: Utiliser la société du projet (pas de dropdown)
  const societeMap: Record<string, string> = {
    'sciGely': 'SCI GELY',
    'lexa': 'LEXA',
    'lexa2': 'LEXA 2',
    'solaireNettoyage': 'SOLAIRE NETTOYAGE'
  }
  const societeSelectionnee = societeMap[projetData?.societe] || 'LEXA 2'
  
  const [flux, setFlux] = useState<FluxInterSociete[]>([])
  const [loadingFlux, setLoadingFlux] = useState(true)
  
  const { lignes: lignesData } = useLignesFinancieres(projetId)
  const lignes = (lignesData as LigneFinanciere[]) || []
  
  // CALCUL DE LA DURÉE ET ANNÉE DE DÉBUT
  const dateDebut = projetData?.dateDebutProjet || new Date().toISOString().split('T')[0]
  const dateFin = projetData?.dateFinProjet || new Date(new Date().setFullYear(new Date().getFullYear() + 20)).toISOString().split('T')[0]
  
  const anneeDebut = new Date(dateDebut).getFullYear()
  const anneeFin = new Date(dateFin).getFullYear()
  const dureeProjet = Math.max(1, anneeFin - anneeDebut) // Durée réelle (18 ans)
  const nbAnneesTableau = Math.max(1, anneeFin - anneeDebut + 1) // Nombre de lignes (19 lignes: 2026 à 2044)
  
  const [params, setParams] = useState<ParamsProjet>({
    puissanceKWc: projetData?.puissanceKWc || 500,
    productionAnnuelleKWh: projetData?.productionAnnuelleKWh || 560000,
    tarifEDF: projetData?.tarifEDF || 0.137,
    investissement: projetData?.budgetTotalHT || 395416,
    apport: projetData?.totalPayeHT || 67331,
    tauxEmprunt: 0.035,
    dureeEmprunt: 15,
    differePremierAn: true,
    tauxIS: 0.15,
    dureeAmortissement: nbAnneesTableau,
    inflationGenerale: 0.006,
    baisseProductionAnnuelle: 0.008,
    charges: projetData?.paramsFinanciers?.charges || [
      { id: '1', nom: 'Maintenance (6% CA)', type: 'pourcentage', valeurPourcentage: 0.06, montantAnnuel: 0, avecInflation: false },
      { id: '2', nom: 'IFER', type: 'fixe', montantAnnuel: 2000, avecInflation: true }
    ],
    lignesFinancieresParams: projetData?.paramsFinanciers?.lignesFinancieresParams || {},
    utiliserAmortissementGlobal: projetData?.paramsFinanciers?.utiliserAmortissementGlobal || false
  })

  const [nouvelleCharge, setNouvelleCharge] = useState({
    nom: '',
    type: 'fixe' as 'fixe' | 'pourcentage',
    montantAnnuel: 0,
    valeurPourcentage: 0,
    avecInflation: false
  })
  const [chargeEnEdition, setChargeEnEdition] = useState<string | null>(null)

  // Charger les flux inter-sociétés DE TOUS LES PROJETS
  useEffect(() => {
    const chargerFlux = async () => {
      try {
        setLoadingFlux(true)
        
        // CORRECTION: Charger TOUS les projets pour avoir TOUS les flux
        const projetsSnapshot = await getDocs(collection(db, 'projets'))
        const tousLesFlux: FluxInterSociete[] = []
        
        projetsSnapshot.forEach(doc => {
          const projetData = doc.data()
          if (projetData.fluxInterSocietes && Array.isArray(projetData.fluxInterSocietes)) {
            tousLesFlux.push(...projetData.fluxInterSocietes)
          }
        })
        
        // Filtrer pour garder uniquement les flux qui concernent CE projet
        const societeProjet = projetData?.societe || 'lexa2'
        const societeMap: Record<string, string> = {
          'sciGely': 'SCI GELY',
          'lexa': 'LEXA',
          'lexa2': 'LEXA 2',
          'solaireNettoyage': 'SOLAIRE NETTOYAGE'
        }
        const nomSocieteProjet = societeMap[societeProjet]
        
        const fluxConcernes = tousLesFlux.filter(f => 
          f.societeSource === nomSocieteProjet || f.societeCible === nomSocieteProjet
        )
        
        setFlux(fluxConcernes)
      } catch (error) {
        console.error('Erreur chargement flux:', error)
        setFlux([])
      } finally {
        setLoadingFlux(false)
      }
    }
    
    chargerFlux()
  }, [projetId, projetData])

  // Initialiser les paramètres des lignes financières si pas existants
  useEffect(() => {
    const newParams = { ...params.lignesFinancieresParams }
    let hasChanges = false

    lignes.forEach(ligne => {
      if (!newParams[ligne.id]) {
        newParams[ligne.id] = {
          ligneId: ligne.id,
          inclus: true,
          type: 'ponctuel',
          duree: 1
        }
        hasChanges = true
      }
    })

    if (hasChanges) {
      setParams({ ...params, lignesFinancieresParams: newParams })
    }
  }, [lignes])

  // Calculer les charges réelles par année selon les paramètres
  const calculerChargesReellesParAnnee = (annee: number) => {
    let total = 0

    lignes.forEach(ligne => {
      const ligneParams = params.lignesFinancieresParams[ligne.id]
      if (!ligneParams || !ligneParams.inclus) return

      // Ne compter que les charges
      if (ligne.type !== 'facture' && ligne.type !== 'devis') return
      if (ligne.type === 'facture' && ligne.statut !== 'paye' && ligne.statut !== 'a_payer') return
      if (ligne.type === 'devis' && ligne.statut !== 'signe') return

      const montant = ligne.montantHT || 0

      if (ligneParams.type === 'ponctuel') {
        // Année 1 uniquement
        if (annee === 0) {
          total += montant
        }
      } else if (ligneParams.type === 'amortissable') {
        // Réparti sur X années
        if (annee < ligneParams.duree) {
          total += montant / ligneParams.duree
        }
      } else if (ligneParams.type === 'recurrent') {
        // Chaque année avec inflation
        total += montant * Math.pow(1 + params.inflationGenerale, annee)
      }
    })

    return total
  }

  // Calculer les revenus réels par année
  const calculerRevenusReelsParAnnee = (annee: number) => {
    let total = 0

    lignes.forEach(ligne => {
      const ligneParams = params.lignesFinancieresParams[ligne.id]
      if (!ligneParams || !ligneParams.inclus) return

      if (ligne.type !== 'revenu') return

      const montant = ligne.montantHT || 0

      if (ligneParams.type === 'ponctuel') {
        if (annee === 0) {
          total += montant
        }
      } else if (ligneParams.type === 'amortissable') {
        if (annee < ligneParams.duree) {
          total += montant / ligneParams.duree
        }
      } else if (ligneParams.type === 'recurrent') {
        total += montant * Math.pow(1 + params.inflationGenerale, annee)
      }
    })

    return total
  }

  // Calculer les prévisions
  const calculerPrevisions = () => {
    const emprunt = params.investissement - params.apport
    const tauxMensuel = params.tauxEmprunt / 12
    const nbMensualites = params.dureeEmprunt * 12
    const annuiteEmprunt = emprunt * (tauxMensuel * Math.pow(1 + tauxMensuel, nbMensualites)) / (Math.pow(1 + tauxMensuel, nbMensualites) - 1) * 12

    const annees = []
    let capitalRestant = emprunt
    let deficitReportable = 0

    // CORRECTION: Utiliser TOUS les flux du projet
    // Les flux du projet sont ceux qui concernent ce projet
    const societeProjet = projetData?.societe || 'lexa2'
    const societeMap: Record<string, string> = {
      'sciGely': 'SCI GELY',
      'lexa': 'LEXA',
      'lexa2': 'LEXA 2',
      'solaireNettoyage': 'SOLAIRE NETTOYAGE'
    }
    const nomSocieteProjet = societeMap[societeProjet]
    
    // Flux revenus: ce projet REÇOIT de l'argent (societeCible = ce projet)
    const fluxRevenus = flux.filter(f => f.societeCible === nomSocieteProjet)
    // Flux charges: ce projet PAIE de l'argent (societeSource = ce projet)  
    const fluxCharges = flux.filter(f => f.societeSource === nomSocieteProjet)

    for (let annee = 0; annee < nbAnneesTableau; annee++) {
      let reventeElec = 0
      
      if (societeSelectionnee === 'LEXA 2' || societeSelectionnee === 'LEXA') {
        const productible = params.productionAnnuelleKWh * Math.pow(1 - params.baisseProductionAnnuelle, annee)
        const tarifRachat = params.tarifEDF * Math.pow(1 + params.inflationGenerale, annee)
        reventeElec = productible * tarifRachat
      }
      
      let autresRevenus = 0
      fluxRevenus.forEach(f => {
        autresRevenus += f.montantAnnuel * (f.avecInflation ? Math.pow(1 + params.inflationGenerale, annee) : 1)
      })

      const revenusReels = calculerRevenusReelsParAnnee(annee)
      autresRevenus += revenusReels
      
      const revenusTotal = reventeElec + autresRevenus

      // CHARGES PRÉVISIONNELLES
      let chargesPrevisionnelles = 0
      params.charges.forEach(charge => {
        if (charge.type === 'fixe') {
          chargesPrevisionnelles += charge.montantAnnuel * (charge.avecInflation ? Math.pow(1 + params.inflationGenerale, annee) : 1)
        } else if (charge.type === 'pourcentage' && charge.valeurPourcentage) {
          chargesPrevisionnelles += reventeElec * charge.valeurPourcentage
        }
      })
      
      // CHARGES FLUX
      let chargesFlux = 0
      fluxCharges.forEach(f => {
        chargesFlux += f.montantAnnuel * (f.avecInflation ? Math.pow(1 + params.inflationGenerale, annee) : 1)
      })

      // CHARGES RÉELLES
      const chargesReelles = calculerChargesReellesParAnnee(annee)

      const chargesExternes = chargesPrevisionnelles + chargesFlux + chargesReelles

      const ebe = revenusTotal - chargesExternes

      let amortissements = 0
      if (params.utiliserAmortissementGlobal) {
        amortissements = params.investissement / params.dureeAmortissement
      }

      const resultatExploitation = ebe - amortissements

      let chargesFinancieres = 0
      chargesFinancieres = annee < params.dureeEmprunt ? capitalRestant * params.tauxEmprunt : 0

      const resultatAvantIS = resultatExploitation - chargesFinancieres
      
      // CALCUL VRAIS AMORTISSEMENTS pour CAF
      let vraisAmortissements = 0
      if (params.utiliserAmortissementGlobal) {
        vraisAmortissements = amortissements
      } else {
        // Calculer depuis les lignes financières (charges uniquement)
        lignes.forEach(ligne => {
          // Ne compter que les charges
          if (ligne.type !== 'facture' && ligne.type !== 'devis') return
          if (ligne.type === 'facture' && ligne.statut !== 'paye' && ligne.statut !== 'a_payer') return
          if (ligne.type === 'devis' && ligne.statut !== 'signe') return
          
          const ligneParams = params.lignesFinancieresParams[ligne.id]
          if (ligneParams?.inclus && ligneParams.type === 'amortissable') {
            if (annee < ligneParams.duree) {
              vraisAmortissements += (ligne.montantHT || 0) / ligneParams.duree
            }
          }
        })
      }
      
      // CALCUL IS PROGRESSIF + DÉFICIT REPORTABLE
      let is = 0
      let resultatImposable = 0
      
      if (resultatAvantIS < 0) {
        deficitReportable += Math.abs(resultatAvantIS)
        is = 0
      } else {
        resultatImposable = Math.max(0, resultatAvantIS - deficitReportable)
        
        if (resultatImposable > 0) {
          const tranche1 = Math.min(resultatImposable, 42500)
          const tranche2 = Math.max(0, resultatImposable - 42500)
          is = (tranche1 * 0.15) + (tranche2 * 0.25)
          
          deficitReportable = Math.max(0, deficitReportable - resultatAvantIS)
        }
      }
      
      const resultatNet = resultatAvantIS - is
      const caf = resultatNet + vraisAmortissements

      let remboursementCapital = 0
      if (annee < params.dureeEmprunt) {
        if (annee === 0 && params.differePremierAn) {
          remboursementCapital = 0
        } else {
          remboursementCapital = annuiteEmprunt - chargesFinancieres
        }
        capitalRestant -= remboursementCapital
      }

      const tresorerie = caf - remboursementCapital

      annees.push({
        annee: anneeDebut + annee,
        productible: societeSelectionnee === 'LEXA 2' || societeSelectionnee === 'LEXA' 
          ? Math.round(params.productionAnnuelleKWh * Math.pow(1 - params.baisseProductionAnnuelle, annee)) 
          : 0,
        tarifRachat: societeSelectionnee === 'LEXA 2' || societeSelectionnee === 'LEXA'
          ? (params.tarifEDF * Math.pow(1 + params.inflationGenerale, annee)).toFixed(4)
          : '0.0000',
        reventeElec: Math.round(reventeElec),
        autresRevenus: Math.round(autresRevenus),
        revenusTotal: Math.round(revenusTotal),
        chargesPrevisionnelles: Math.round(chargesPrevisionnelles),
        chargesFlux: Math.round(chargesFlux),
        chargesReelles: Math.round(chargesReelles),
        chargesExternes: Math.round(chargesExternes),
        ebe: Math.round(ebe),
        amortissements: Math.round(amortissements),
        vraisAmortissements: Math.round(vraisAmortissements),
        resultatExploitation: Math.round(resultatExploitation),
        chargesFinancieres: Math.round(chargesFinancieres),
        resultatAvantIS: Math.round(resultatAvantIS),
        deficitReportable: Math.round(deficitReportable),
        resultatImposable: Math.round(resultatImposable),
        is: Math.round(is),
        resultatNet: Math.round(resultatNet),
        caf: Math.round(caf),
        remboursementCapital: Math.round(remboursementCapital),
        capitalRestant: Math.round(capitalRestant),
        tresorerie: Math.round(tresorerie)
      })
    }

    return annees
  }

  const previsions = calculerPrevisions()

  const totaux = {
    reventeElec: previsions.reduce((sum, a) => sum + a.reventeElec, 0),
    autresRevenus: previsions.reduce((sum, a) => sum + a.autresRevenus, 0),
    revenusTotal: previsions.reduce((sum, a) => sum + a.revenusTotal, 0),
    chargesPrevisionnelles: previsions.reduce((sum, a) => sum + a.chargesPrevisionnelles, 0),
    chargesFlux: previsions.reduce((sum, a) => sum + a.chargesFlux, 0),
    chargesReelles: previsions.reduce((sum, a) => sum + a.chargesReelles, 0),
    chargesExternes: previsions.reduce((sum, a) => sum + a.chargesExternes, 0),
    ebe: previsions.reduce((sum, a) => sum + a.ebe, 0),
    resultatNet: previsions.reduce((sum, a) => sum + a.resultatNet, 0),
    caf: previsions.reduce((sum, a) => sum + a.caf, 0),
    tresorerie: previsions.reduce((sum, a) => sum + a.tresorerie, 0)
  }

  const ajouterCharge = () => {
    if (!nouvelleCharge.nom) return
    
    if (chargeEnEdition) {
      // Mode ÉDITION: modifier la charge existante
      setParams({
        ...params,
        charges: params.charges.map(c =>
          c.id === chargeEnEdition
            ? {
                id: c.id,
                nom: nouvelleCharge.nom,
                type: nouvelleCharge.type,
                montantAnnuel: nouvelleCharge.type === 'fixe' ? nouvelleCharge.montantAnnuel : 0,
                valeurPourcentage: nouvelleCharge.type === 'pourcentage' ? nouvelleCharge.valeurPourcentage / 100 : undefined,
                avecInflation: nouvelleCharge.avecInflation
              }
            : c
        )
      })
      setChargeEnEdition(null)
    } else {
      // Mode AJOUT: créer nouvelle charge
      const charge: Charge = {
        id: Date.now().toString(),
        nom: nouvelleCharge.nom,
        type: nouvelleCharge.type,
        montantAnnuel: nouvelleCharge.type === 'fixe' ? nouvelleCharge.montantAnnuel : 0,
        valeurPourcentage: nouvelleCharge.type === 'pourcentage' ? nouvelleCharge.valeurPourcentage / 100 : undefined,
        avecInflation: nouvelleCharge.avecInflation
      }
      setParams({ ...params, charges: [...params.charges, charge] })
    }
    
    setNouvelleCharge({ nom: '', type: 'fixe', montantAnnuel: 0, valeurPourcentage: 0, avecInflation: false })
  }

  const modifierCharge = (charge: Charge) => {
    setChargeEnEdition(charge.id)
    setNouvelleCharge({
      nom: charge.nom,
      type: charge.type,
      montantAnnuel: charge.montantAnnuel,
      valeurPourcentage: charge.valeurPourcentage ? charge.valeurPourcentage * 100 : 0,
      avecInflation: charge.avecInflation
    })
  }

  const annulerEdition = () => {
    setChargeEnEdition(null)
    setNouvelleCharge({ nom: '', type: 'fixe', montantAnnuel: 0, valeurPourcentage: 0, avecInflation: false })
  }

  const supprimerCharge = (id: string) => {
    setParams({ ...params, charges: params.charges.filter(c => c.id !== id) })
    if (chargeEnEdition === id) {
      annulerEdition()
    }
  }

  const updateLigneFinanciereParam = (ligneId: string, updates: Partial<LigneFinanciereParams>) => {
    setParams({
      ...params,
      lignesFinancieresParams: {
        ...params.lignesFinancieresParams,
        [ligneId]: {
          ...params.lignesFinancieresParams[ligneId],
          ...updates
        }
      }
    })
  }

  const sauvegarderParams = async () => {
    try {
      await updateDoc(doc(db, 'projets', projetId), {
        puissanceKWc: params.puissanceKWc,
        productionAnnuelleKWh: params.productionAnnuelleKWh,
        tarifEDF: params.tarifEDF,
        paramsFinanciers: {
          investissement: params.investissement,
          apport: params.apport,
          tauxEmprunt: params.tauxEmprunt,
          dureeEmprunt: params.dureeEmprunt,
          differePremierAn: params.differePremierAn,
          tauxIS: params.tauxIS,
          dureeAmortissement: params.dureeAmortissement,
          inflationGenerale: params.inflationGenerale,
          baisseProductionAnnuelle: params.baisseProductionAnnuelle,
          charges: params.charges,
          lignesFinancieresParams: params.lignesFinancieresParams,
          utiliserAmortissementGlobal: params.utiliserAmortissementGlobal
        },
        updatedAt: new Date().toISOString()
      })
      alert('✅ Paramètres sauvegardés !')
      setModeEdition(false)
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('❌ Erreur lors de la sauvegarde')
    }
  }

  const lignesCharges = lignes.filter(l => 
    (l.type === 'facture' && (l.statut === 'paye' || l.statut === 'a_payer')) || 
    (l.type === 'devis' && l.statut === 'signe')
  )

  const lignesRevenus = lignes.filter(l => l.type === 'revenu')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plan Prévisionnel ({anneeDebut} - {anneeFin})</h2>
          <p className="text-sm text-gray-700">Durée: {dureeProjet} an{dureeProjet > 1 ? 's' : ''}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="text-sm font-bold text-black">🏢 Société:</label>
          <div className="px-4 py-2 border-2 border-blue-600 rounded-lg bg-blue-50">
            <span className="text-black font-bold">{societeSelectionnee}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {modeEdition ? (
            <>
              <button
                onClick={sauvegarderParams}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                💾 Enregistrer
              </button>
              <button
                onClick={() => setModeEdition(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                ✕ Annuler
              </button>
            </>
          ) : (
            <button
              onClick={() => setModeEdition(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              ✏️ Modifier les paramètres
              </button>
          )}
        </div>
      </div>

      {/* Formulaire d'édition */}
      {modeEdition && (
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-500 space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Paramètres du projet</h3>

          {/* Paramètres techniques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Puissance (kWc)</label>
              <input
                type="number"
                value={params.puissanceKWc}
                onChange={(e) => setParams({ ...params, puissanceKWc: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border-2 border-black text-black font-semibold bg-white rounded-lg focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Production annuelle (kWh)</label>
              <input
                type="number"
                value={params.productionAnnuelleKWh}
                onChange={(e) => setParams({ ...params, productionAnnuelleKWh: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border-2 border-black text-black font-semibold bg-white rounded-lg focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Tarif EDF (€/kWh)</label>
              <input
                type="number"
                step="0.001"
                value={params.tarifEDF}
                onChange={(e) => setParams({ ...params, tarifEDF: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border-2 border-black text-black font-semibold bg-white rounded-lg focus:border-blue-500"
              />
            </div>
          </div>

          {/* Paramètres financiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Investissement total HT (€)</label>
              <input
                type="number"
                value={params.investissement}
                onChange={(e) => setParams({ ...params, investissement: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border-2 border-black text-black font-semibold bg-white rounded-lg focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Apport déjà payé HT (€)</label>
              <input
                type="number"
                value={params.apport}
                onChange={(e) => setParams({ ...params, apport: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border-2 border-black text-black font-semibold bg-white rounded-lg focus:border-blue-500"
              />
            </div>
          </div>

          {/* Paramètres emprunt */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Taux emprunt (%)</label>
              <input
                type="number"
                step="0.01"
                value={params.tauxEmprunt * 100}
                onChange={(e) => setParams({ ...params, tauxEmprunt: parseFloat(e.target.value) / 100 })}
                className="w-full px-3 py-2 border-2 border-black text-black font-semibold bg-white rounded-lg focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Durée emprunt (années)</label>
              <input
                type="number"
                value={params.dureeEmprunt}
                onChange={(e) => setParams({ ...params, dureeEmprunt: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border-2 border-black text-black font-semibold bg-white rounded-lg focus:border-blue-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={params.differePremierAn}
                  onChange={(e) => setParams({ ...params, differePremierAn: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-sm font-semibold text-gray-900">Différé 1ère année</span>
              </label>
            </div>
          </div>

          {/* Paramètres fiscaux */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Taux IS (%)</label>
              <input
                type="number"
                step="0.01"
                value={params.tauxIS * 100}
                onChange={(e) => setParams({ ...params, tauxIS: parseFloat(e.target.value) / 100 })}
                className="w-full px-3 py-2 border-2 border-black text-black font-semibold bg-white rounded-lg focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Amortissement (années)</label>
              <input
                type="number"
                value={params.dureeAmortissement}
                onChange={(e) => setParams({ ...params, dureeAmortissement: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border-2 border-black text-black font-semibold bg-white rounded-lg focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Inflation (%)</label>
              <input
                type="number"
                step="0.01"
                value={params.inflationGenerale * 100}
                onChange={(e) => setParams({ ...params, inflationGenerale: parseFloat(e.target.value) / 100 })}
                className="w-full px-3 py-2 border-2 border-black text-black font-semibold bg-white rounded-lg focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Baisse production (%/an)</label>
              <input
                type="number"
                step="0.01"
                value={params.baisseProductionAnnuelle * 100}
                onChange={(e) => setParams({ ...params, baisseProductionAnnuelle: parseFloat(e.target.value) / 100 })}
                className="w-full px-3 py-2 border-2 border-black text-black font-semibold bg-white rounded-lg focus:border-blue-500"
              />
            </div>
          </div>

          {/* Checkbox amortissement global */}
          <div className="bg-yellow-50 border-2 border-yellow-600 rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={params.utiliserAmortissementGlobal}
                onChange={(e) => setParams({ ...params, utiliserAmortissementGlobal: e.target.checked })}
                className="w-6 h-6 mt-1"
              />
              <div className="flex-1">
                <span className="text-base font-bold text-black">Utiliser l'amortissement global</span>
                <p className="text-sm text-gray-700 mt-1">
                  ⚠️ Si coché: amortissement = {params.investissement.toLocaleString('fr-FR')} € / {params.dureeAmortissement} ans = <strong>{Math.round(params.investissement / params.dureeAmortissement).toLocaleString('fr-FR')} €/an</strong>
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  ℹ️ Si décoché: amortissement = 0 €, utiliser les charges réelles ligne par ligne (évite le double comptage)
                </p>
              </div>
            </label>
          </div>

          {/* Gestion des charges prévisionnelles */}
          <div className="border-t-2 border-gray-600 pt-4">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Charges d'exploitation prévisionnelles</h4>
            
            <div className="space-y-2 mb-4">
              {params.charges.map((charge) => (
                <div key={charge.id} className={`flex items-center gap-2 p-3 rounded-lg ${chargeEnEdition === charge.id ? 'bg-blue-700' : 'bg-gray-800'}`}>
                  <span className="flex-1 font-semibold text-white">{charge.nom}</span>
                  <span className="text-sm text-white">
                    {charge.type === 'fixe' 
                      ? `${charge.montantAnnuel.toLocaleString('fr-FR')} €/an`
                      : `${(charge.valeurPourcentage! * 100).toFixed(1)}% CA`
                    }
                  </span>
                  {charge.avecInflation && <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Inflation</span>}
                  <button
                    onClick={() => modifierCharge(charge)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-bold"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => supprimerCharge(charge.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-blue-800 p-4 rounded-lg space-y-3">
              <h5 className="font-semibold text-white">
                {chargeEnEdition ? '✏️ Modifier la charge' : '➕ Ajouter une charge prévisionnelle'}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <input
                  type="text"
                  placeholder="Nom de la charge"
                  value={nouvelleCharge.nom}
                  onChange={(e) => setNouvelleCharge({ ...nouvelleCharge, nom: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-gray-900"
                />
                <select
                  value={nouvelleCharge.type}
                  onChange={(e) => setNouvelleCharge({ ...nouvelleCharge, type: e.target.value as 'fixe' | 'pourcentage' })}
                  className="px-3 py-2 border rounded-lg text-gray-900"
                >
                  <option value="fixe">Montant fixe</option>
                  <option value="pourcentage">% du CA</option>
                </select>
                {nouvelleCharge.type === 'fixe' ? (
                  <input
                    type="number"
                    placeholder="Montant €"
                    value={nouvelleCharge.montantAnnuel}
                    onChange={(e) => setNouvelleCharge({ ...nouvelleCharge, montantAnnuel: parseFloat(e.target.value) || 0 })}
                    className="px-3 py-2 border rounded-lg text-gray-900"
                  />
                ) : (
                  <input
                    type="number"
                    placeholder="% CA"
                    step="0.1"
                    value={nouvelleCharge.valeurPourcentage}
                    onChange={(e) => setNouvelleCharge({ ...nouvelleCharge, valeurPourcentage: parseFloat(e.target.value) || 0 })}
                    className="px-3 py-2 border rounded-lg text-gray-900"
                  />
                )}
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nouvelleCharge.avecInflation}
                    onChange={(e) => setNouvelleCharge({ ...nouvelleCharge, avecInflation: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-bold text-white">Inflation</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={ajouterCharge}
                    className={`flex-1 px-4 py-2 text-white rounded-lg font-semibold ${
                      chargeEnEdition 
                        ? 'bg-yellow-600 hover:bg-yellow-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {chargeEnEdition ? '💾 Enregistrer' : '➕ Ajouter'}
                  </button>
                  {chargeEnEdition && (
                    <button
                      onClick={annulerEdition}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                    >
                      ❌
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gestion des lignes financières CHARGES */}
          {lignesCharges.length > 0 && (
            <div className="border-t-2 border-orange-600 pt-4">
              <h4 className="text-lg font-bold text-orange-900 mb-4">📋 Charges réelles (depuis lignes financières)</h4>
              
              <div className="space-y-3">
                {lignesCharges.map((ligne) => {
                  const ligneParams = params.lignesFinancieresParams[ligne.id] || {
                    ligneId: ligne.id,
                    inclus: true,
                    type: 'ponctuel',
                    duree: 1
                  }

                  return (
                    <div key={ligne.id} className="bg-orange-50 p-4 rounded-lg border-2 border-orange-600">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={ligneParams.inclus}
                          onChange={(e) => updateLigneFinanciereParam(ligne.id, { inclus: e.target.checked })}
                          className="w-5 h-5 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-black">{ligne.fournisseur || 'Sans fournisseur'}</p>
                              <p className="text-sm text-gray-700">{ligne.description}</p>
                            </div>
                            <p className="text-xl font-bold text-orange-900">{(ligne.montantHT || 0).toLocaleString('fr-FR')} €</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-bold text-black mb-1">Type</label>
                              <select
                                value={ligneParams.type}
                                onChange={(e) => updateLigneFinanciereParam(ligne.id, { type: e.target.value as any })}
                                className="w-full px-2 py-1 border-2 border-orange-600 rounded text-sm font-semibold text-black"
                                disabled={!ligneParams.inclus}
                              >
                                <option value="ponctuel">Ponctuel (année 1)</option>
                                <option value="amortissable">Amortissable</option>
                                <option value="recurrent">Récurrent ({nbAnneesTableau} ans)</option>
                              </select>
                            </div>

                            {ligneParams.type === 'amortissable' && (
                              <div>
                                <label className="block text-xs font-bold text-black mb-1">Durée (années)</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={ligneParams.duree}
                                  onChange={(e) => updateLigneFinanciereParam(ligne.id, { duree: parseInt(e.target.value) || 1 })}
                                  className="w-full px-2 py-1 border-2 border-orange-600 rounded text-sm font-semibold text-black"
                                  disabled={!ligneParams.inclus}
                                  placeholder="Ex: 15"
                                />
                              </div>
                            )}
                          </div>

                          {ligneParams.inclus && (
                            <p className="text-xs text-orange-800 mt-2 font-semibold">
                              {ligneParams.type === 'ponctuel' && '→ 1 fois en année 1'}
                              {ligneParams.type === 'amortissable' && `→ ${((ligne.montantHT || 0) / ligneParams.duree).toLocaleString('fr-FR')} €/an sur ${ligneParams.duree} ans`}
                              {ligneParams.type === 'recurrent' && '→ Chaque année avec inflation'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Gestion des lignes financières REVENUS */}
          {lignesRevenus.length > 0 && (
            <div className="border-t-2 border-green-600 pt-4">
              <h4 className="text-lg font-bold text-green-900 mb-4">💰 Revenus réels (depuis lignes financières)</h4>
              
              <div className="space-y-3">
                {lignesRevenus.map((ligne) => {
                  const ligneParams = params.lignesFinancieresParams[ligne.id] || {
                    ligneId: ligne.id,
                    inclus: true,
                    type: 'ponctuel',
                    duree: 1
                  }

                  return (
                    <div key={ligne.id} className="bg-green-50 p-4 rounded-lg border-2 border-green-600">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={ligneParams.inclus}
                          onChange={(e) => updateLigneFinanciereParam(ligne.id, { inclus: e.target.checked })}
                          className="w-5 h-5 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-black">{ligne.fournisseur || 'Sans source'}</p>
                              <p className="text-sm text-gray-700">{ligne.description}</p>
                            </div>
                            <p className="text-xl font-bold text-green-900">{(ligne.montantHT || 0).toLocaleString('fr-FR')} €</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-bold text-black mb-1">Type</label>
                              <select
                                value={ligneParams.type}
                                onChange={(e) => updateLigneFinanciereParam(ligne.id, { type: e.target.value as any })}
                                className="w-full px-2 py-1 border-2 border-green-600 rounded text-sm font-semibold text-black"
                                disabled={!ligneParams.inclus}
                              >
                                <option value="ponctuel">Ponctuel (année 1)</option>
                                <option value="amortissable">Amortissable</option>
                                <option value="recurrent">Récurrent ({nbAnneesTableau} ans)</option>
                              </select>
                            </div>

                            {ligneParams.type === 'amortissable' && (
                              <div>
                                <label className="block text-xs font-bold text-black mb-1">Durée (années)</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={ligneParams.duree}
                                  onChange={(e) => updateLigneFinanciereParam(ligne.id, { duree: parseInt(e.target.value) || 1 })}
                                  className="w-full px-2 py-1 border-2 border-green-600 rounded text-sm font-semibold text-black"
                                  disabled={!ligneParams.inclus}
                                  placeholder="Ex: 15"
                                />
                              </div>
                            )}
                          </div>

                          {ligneParams.inclus && (
                            <p className="text-xs text-green-800 mt-2 font-semibold">
                              {ligneParams.type === 'ponctuel' && '→ 1 fois en année 1'}
                              {ligneParams.type === 'amortissable' && `→ ${((ligne.montantHT || 0) / ligneParams.duree).toLocaleString('fr-FR')} €/an sur ${ligneParams.duree} ans`}
                              {ligneParams.type === 'recurrent' && '→ Chaque année avec inflation'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Synthèse */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-4">📊 Synthèse sur {dureeProjet} an{dureeProjet > 1 ? "s" : ""}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm opacity-90">Revenus Totaux</p>
            <p className="text-2xl font-bold">{totaux.revenusTotal.toLocaleString('fr-FR')} €</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Charges Totales</p>
            <p className="text-2xl font-bold">{totaux.chargesExternes.toLocaleString('fr-FR')} €</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Résultat Net Total</p>
            <p className="text-2xl font-bold">{totaux.resultatNet.toLocaleString('fr-FR')} €</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Trésorerie Finale</p>
            <p className={`text-3xl font-bold ${totaux.tresorerie >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {totaux.tresorerie.toLocaleString('fr-FR')} €
            </p>
          </div>
        </div>
      </div>

      {/* Tableau détaillé */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="p-3 text-left">Année</th>
                <th className="p-3 text-right">Production<br/>(kWh)</th>
                <th className="p-3 text-right">Tarif<br/>(€/kWh)</th>
                <th className="p-3 text-right">Vente Élec<br/>(€)</th>
                <th className="p-3 text-right">Autres Rev.<br/>(€)</th>
                <th className="p-3 text-right">Total Rev.<br/>(€)</th>
                <th className="p-3 text-right">Ch. Prév.<br/>(€)</th>
                <th className="p-3 text-right">Ch. Flux<br/>(€)</th>
                <th className="p-3 text-right">Ch. Réelles<br/>(€)</th>
                <th className="p-3 text-right">Total Ch.<br/>(€)</th>
                <th className="p-3 text-right">EBE<br/>(€)</th>
                <th className="p-3 text-right">Amort.Compta<br/>(€)</th>
                <th className="p-3 text-right">Amort.Réels<br/>(€)</th>
                <th className="p-3 text-right">Rés. Expl.<br/>(€)</th>
                <th className="p-3 text-right">Ch. Fin.<br/>(€)</th>
                <th className="p-3 text-right">Rés. av. IS<br/>(€)</th>
                <th className="p-3 text-right">Déficit Rep.<br/>(€)</th>
                <th className="p-3 text-right">Rés. Impos.<br/>(€)</th>
                <th className="p-3 text-right">IS<br/>(€)</th>
                <th className="p-3 text-right">Rés. Net<br/>(€)</th>
                <th className="p-3 text-right">CAF<br/>(€)</th>
                <th className="p-3 text-right">Rembours.<br/>Capital (€)</th>
                <th className="p-3 text-right">Trésorerie<br/>(€)</th>
              </tr>
            </thead>
            <tbody>
              {previsions.map((annee) => (
                <tr key={annee.annee} className="border-b border-gray-600 hover:bg-gray-200">
                  <td className="p-3 font-bold text-gray-900">{annee.annee}</td>
                  <td className="p-3 text-right text-gray-900">{annee.productible.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right text-gray-900">{annee.tarifRachat}</td>
                  <td className="p-3 text-right font-semibold text-green-900">{annee.reventeElec.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right font-semibold text-blue-900">{annee.autresRevenus.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right font-bold text-green-900">{annee.revenusTotal.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right font-semibold text-orange-900">{annee.chargesPrevisionnelles.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right font-semibold text-purple-900">{annee.chargesFlux.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right font-semibold text-pink-900">{annee.chargesReelles.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right font-bold text-red-900">{annee.chargesExternes.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right font-semibold text-gray-900">{annee.ebe.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right text-gray-700">{annee.amortissements.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right font-semibold text-blue-900">{annee.vraisAmortissements.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right text-gray-900">{annee.resultatExploitation.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right font-semibold text-red-900">{annee.chargesFinancieres.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right text-gray-900">{annee.resultatAvantIS.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right text-orange-700">{annee.deficitReportable.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right font-semibold text-purple-900">{annee.resultatImposable.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right font-semibold text-red-900">{annee.is.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right font-bold text-blue-900">{annee.resultatNet.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right font-semibold text-gray-900">{annee.caf.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right font-semibold text-red-900">{annee.remboursementCapital.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right font-bold text-green-900">{annee.tresorerie.toLocaleString('fr-FR')}</td>
                </tr>
              ))}
              <tr className="bg-gray-900 text-white font-bold">
                <td className="p-3" colSpan={3}>TOTAL 20 ANS</td>
                <td className="p-3 text-right">{totaux.reventeElec.toLocaleString('fr-FR')}</td>
                <td className="p-3 text-right">{totaux.autresRevenus.toLocaleString('fr-FR')}</td>
                <td className="p-3 text-right">{totaux.revenusTotal.toLocaleString('fr-FR')}</td>
                <td className="p-3 text-right">{totaux.chargesPrevisionnelles.toLocaleString('fr-FR')}</td>
                <td className="p-3 text-right">{totaux.chargesFlux.toLocaleString('fr-FR')}</td>
                <td className="p-3 text-right">{totaux.chargesReelles.toLocaleString('fr-FR')}</td>
                <td className="p-3 text-right">{totaux.chargesExternes.toLocaleString('fr-FR')}</td>
                <td className="p-3 text-right">{totaux.ebe.toLocaleString('fr-FR')}</td>
                <td className="p-3" colSpan={8}></td>
                <td className="p-3 text-right">{totaux.resultatNet.toLocaleString('fr-FR')}</td>
                <td className="p-3 text-right">{totaux.caf.toLocaleString('fr-FR')}</td>
                <td className="p-3"></td>
                <td className="p-3 text-right">{totaux.tresorerie.toLocaleString('fr-FR')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}