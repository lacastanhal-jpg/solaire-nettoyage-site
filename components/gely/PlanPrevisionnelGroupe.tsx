'use client'

import { useState, useEffect } from 'react'
import { useProjets } from '@/lib/gely/useFirestore'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

interface AnneeConsolidee {
  annee: number
  productible: number
  tarifRachat: number
  reventeElec: number
  autresRevenus: number
  revenusTotal: number
  chargesPrevisionnelles: number
  chargesFlux: number
  chargesTotal: number
  ebe: number
  amortissements: number
  vraisAmortissements: number
  resultatExploitation: number
  chargesFinancieres: number
  resultatAvantIS: number
  deficitReportable: number
  resultatImposable: number
  is: number
  resultatNet: number
  caf: number
  remboursementCapital: number
  tresorerie: number
  tresorerieCumulee: number
}

const explications = {
  van: {
    titre: "VAN (Valeur Actualisée Nette)",
    definition: "La valeur de ton projet aujourd'hui, en tenant compte que l'argent perd de la valeur avec le temps.",
    calcul: "VAN = Somme des flux actualisés à 5%/an - Investissement initial",
    interpretation: "VAN > 0 € → Projet RENTABLE ✅\nVAN < 0 € → Projet NON RENTABLE ❌\nPlus la VAN est élevée, meilleur c'est"
  },
  payback: {
    titre: "Payback Period",
    definition: "Le nombre d'années pour récupérer ton investissement initial.",
    calcul: "Année où la CAF cumulée ≥ Investissement",
    interpretation: "Plus c'est court, mieux c'est.\nPhotovoltaïque: 5-10 ans typiquement"
  },
  roi: {
    titre: "ROI (Return on Investment)",
    definition: "Le pourcentage de gain par rapport à ton investissement.",
    calcul: "ROI = (Trésorerie Cumulée 20 ans / Investissement) × 100",
    interpretation: "ROI 150% = Tu récupères 1,5 fois ton investissement\nROI 200% = Tu récupères 2 fois ton investissement"
  },
  tri: {
    titre: "TRI (Taux de Rentabilité Interne)",
    definition: "Le taux de rendement annuel de ton projet.",
    calcul: "Taux qui annule la VAN (calcul itératif)",
    interpretation: "TRI 8% = Ton projet rapporte 8%/an\nComparer avec: Livret A (3%), Immobilier (4-6%)"
  },
  detteCapitaux: {
    titre: "Ratio Dette/Capitaux",
    definition: "Le levier financier - Combien tu empruntes par rapport à ton apport.",
    calcul: "Ratio = Dette / Apport",
    interpretation: "Ratio 4 = 4€ de dette pour 1€ d'apport\nPlus c'est élevé, plus tu es endetté"
  },
  margeEBE: {
    titre: "Marge EBE",
    definition: "Le pourcentage de rentabilité opérationnelle (avant impôts et amortissements).",
    calcul: "Marge EBE = (EBE Total / Revenus Total) × 100",
    interpretation: "Marge 70% = Sur 100€ de revenus, tu gardes 70€\nPhotovoltaïque: 60-80% est bon"
  },
  margeNette: {
    titre: "Marge Nette",
    definition: "Le pourcentage de rentabilité finale (après TOUT).",
    calcul: "Marge Nette = (Résultat Net Total / Revenus Total) × 100",
    interpretation: "Marge 30% = Sur 100€ de revenus, 30€ de bénéfice\nPhotovoltaïque: 20-40% est bon"
  },
  dscr: {
    titre: "DSCR (Couverture de Dette)",
    definition: "Ta capacité à rembourser tes dettes.",
    calcul: "DSCR = CAF Moyenne / Annuité Emprunt Moyenne",
    interpretation: "DSCR > 1,5 → Très bon ✅\nDSCR 1,2-1,5 → Bon\nDSCR < 1,2 → Risque ⚠️"
  },
  prixRevient: {
    titre: "Prix de Revient par kWh",
    definition: "Combien te coûte chaque kWh que tu produis.",
    calcul: "Prix = Charges Totales 20 ans / Production Totale 20 ans",
    interpretation: "Comparer avec ton tarif de vente\nSi prix revient < tarif vente → Rentable"
  },
  productivite: {
    titre: "Productivité (kWh/kWc/an)",
    definition: "Performance de ton installation.",
    calcul: "Productivité = Production Annuelle Moyenne / Puissance Installée",
    interpretation: "Sud France: 1200-1400 kWh/kWc/an\nNord France: 900-1100 kWh/kWc/an"
  },
  tauxEndettement: {
    titre: "Taux d'Endettement",
    definition: "Pourcentage de ton investissement financé par emprunt.",
    calcul: "Taux = (Dette / Investissement) × 100",
    interpretation: "80% = Bon équilibre\n> 90% = Trop endetté\n< 50% = Peu endetté"
  },
  breakEven: {
    titre: "Break-Even Year",
    definition: "L'année où tu commences à être rentable (Résultat Net positif).",
    calcul: "Première année où Résultat Net > 0",
    interpretation: "Plus tôt, mieux c'est\nPhotovoltaïque: An 3-5 typiquement"
  }
}

export default function PlanPrevisionnelGroupe() {
  const { projets, loading } = useProjets()
  const [projetsSelectionnes, setProjetsSelectionnes] = useState<Record<string, boolean>>({})
  const [consolidation, setConsolidation] = useState<AnneeConsolidee[]>([])
  const [ongletActif, setOngletActif] = useState<'tableau' | 'kpis'>('tableau')
  const [kpiExplique, setKpiExplique] = useState<string | null>(null)
  const [legendeVisible, setLegendeVisible] = useState(false)
  const [fluxGlobaux, setFluxGlobaux] = useState<any[]>([])

  // Charger tous les flux depuis la collection globale
  useEffect(() => {
    const chargerFlux = async () => {
      try {
        const fluxSnapshot = await getDocs(collection(db, 'flux_intersocietes'))
        const flux: any[] = []
        fluxSnapshot.forEach(doc => {
          flux.push({ id: doc.id, ...doc.data() })
        })
        setFluxGlobaux(flux)
      } catch (error) {
        console.error('Erreur chargement flux:', error)
        setFluxGlobaux([])
      }
    }
    chargerFlux()
  }, [])

  useEffect(() => {
    if (projets.length > 0) {
      const initial: Record<string, boolean> = {}
      projets.forEach(p => {
        initial[p.id] = true
      })
      setProjetsSelectionnes(initial)
    }
  }, [projets])

  useEffect(() => {
    calculerConsolidation()
  }, [projetsSelectionnes, projets])

  const toggleProjet = (projetId: string) => {
    setProjetsSelectionnes({
      ...projetsSelectionnes,
      [projetId]: !projetsSelectionnes[projetId]
    })
  }

  const calculerConsolidation = () => {
    const annees: AnneeConsolidee[] = Array.from({ length: 20 }, (_, i) => ({
      annee: i + 1,
      productible: 0,
      tarifRachat: 0,
      reventeElec: 0,
      autresRevenus: 0,
      revenusTotal: 0,
      chargesPrevisionnelles: 0,
      chargesFlux: 0,
      chargesTotal: 0,
      ebe: 0,
      amortissements: 0,
      vraisAmortissements: 0,
      resultatExploitation: 0,
      chargesFinancieres: 0,
      resultatAvantIS: 0,
      deficitReportable: 0,
      resultatImposable: 0,
      is: 0,
      resultatNet: 0,
      caf: 0,
      remboursementCapital: 0,
      tresorerie: 0,
      tresorerieCumulee: 0
    }))

    projets.forEach(projet => {
      if (!projetsSelectionnes[projet.id]) return

      const previsionsProjet = calculerPrevisionsProjet(projet)
      
      previsionsProjet.forEach((prevision, index) => {
        if (index < 20) {
          annees[index].productible += prevision.productible
          annees[index].reventeElec += prevision.reventeElec
          annees[index].autresRevenus += prevision.autresRevenus
          annees[index].revenusTotal += prevision.revenusTotal
          annees[index].chargesPrevisionnelles += prevision.chargesPrevisionnelles
          annees[index].chargesFlux += prevision.chargesFlux
          annees[index].chargesTotal += prevision.chargesTotal
          annees[index].ebe += prevision.ebe
          annees[index].amortissements += prevision.amortissements
          annees[index].vraisAmortissements += prevision.vraisAmortissements
          annees[index].resultatExploitation += prevision.resultatExploitation
          annees[index].chargesFinancieres += prevision.chargesFinancieres
          annees[index].resultatAvantIS += prevision.resultatAvantIS
          annees[index].deficitReportable += prevision.deficitReportable
          annees[index].resultatImposable += prevision.resultatImposable
          annees[index].is += prevision.is
          annees[index].resultatNet += prevision.resultatNet
          annees[index].caf += prevision.caf
          annees[index].remboursementCapital += prevision.remboursementCapital
          annees[index].tresorerie += prevision.tresorerie
        }
      })
    })

    let tresorerieCumulee = 0
    annees.forEach(annee => {
      annee.tarifRachat = annee.productible > 0 ? annee.reventeElec / annee.productible : 0
      tresorerieCumulee += annee.tresorerie
      annee.tresorerieCumulee = tresorerieCumulee
    })

    setConsolidation(annees)
  }

  const calculerPrevisionsProjet = (projet: any) => {
    const params = {
      productionAnnuelleKWh: projet.productionAnnuelleKWh || 0,
      tarifEDF: projet.tarifEDF || 0.137,
      investissement: projet.budgetTotalHT || 0,
      apport: projet.totalPayeHT || 0,
      tauxEmprunt: projet.paramsFinanciers?.tauxEmprunt || 0.035,
      dureeEmprunt: projet.paramsFinanciers?.dureeEmprunt || 15,
      differePremierAn: projet.paramsFinanciers?.differePremierAn || true,
      dureeAmortissement: projet.paramsFinanciers?.dureeAmortissement || 20,
      inflationGenerale: projet.paramsFinanciers?.inflationGenerale || 0.006,
      baisseProductionAnnuelle: projet.paramsFinanciers?.baisseProductionAnnuelle || 0.008,
      charges: projet.paramsFinanciers?.charges || []
    }

    const societeMap: Record<string, string> = {
      'sciGely': 'SCI GELY',
      'lexa': 'LEXA',
      'lexa2': 'LEXA 2',
      'solaireNettoyage': 'Solaire Nettoyage'
    }
    const societe = societeMap[projet.societe] || projet.societe || 'LEXA'

    const emprunt = params.investissement - params.apport
    const tauxMensuel = params.tauxEmprunt / 12
    const nbMensualites = params.dureeEmprunt * 12
    const annuiteEmprunt = emprunt > 0 
      ? emprunt * (tauxMensuel * Math.pow(1 + tauxMensuel, nbMensualites)) / (Math.pow(1 + tauxMensuel, nbMensualites) - 1) * 12
      : 0

    const annees = []
    let capitalRestant = emprunt
    let deficitReportable = 0

    // Filtrer les flux globaux pour cette société
    const fluxRevenus = fluxGlobaux.filter((f: any) => f.societeCible === societe)
    const fluxCharges = fluxGlobaux.filter((f: any) => f.societeSource === societe)

    for (let i = 0; i < 20; i++) {
      let productible = 0
      let tarifRachat = 0
      let reventeElec = 0
      
      if (params.productionAnnuelleKWh > 0) {
        productible = params.productionAnnuelleKWh * Math.pow(1 - params.baisseProductionAnnuelle, i)
        tarifRachat = params.tarifEDF * Math.pow(1 + params.inflationGenerale, i)
        reventeElec = productible * tarifRachat
      }

      let autresRevenus = 0
      fluxRevenus.forEach((f: any) => {
        autresRevenus += f.montantAnnuel * (f.avecInflation ? Math.pow(1 + params.inflationGenerale, i) : 1)
      })

      const revenusTotal = reventeElec + autresRevenus

      let chargesPrevisionnelles = 0
      params.charges.forEach((charge: any) => {
        if (charge.type === 'fixe') {
          chargesPrevisionnelles += charge.montantAnnuel * (charge.avecInflation ? Math.pow(1 + params.inflationGenerale, i) : 1)
        } else if (charge.type === 'pourcentage' && charge.valeurPourcentage) {
          chargesPrevisionnelles += reventeElec * charge.valeurPourcentage
        }
      })

      let chargesFlux = 0
      fluxCharges.forEach((f: any) => {
        chargesFlux += f.montantAnnuel * (f.avecInflation ? Math.pow(1 + params.inflationGenerale, i) : 1)
      })

      const chargesTotal = chargesPrevisionnelles + chargesFlux
      const ebe = revenusTotal - chargesTotal

      const amortissements = params.dureeAmortissement > 0 
        ? params.investissement / params.dureeAmortissement 
        : 0
      const vraisAmortissements = amortissements

      const resultatExploitation = ebe - amortissements
      const chargesFinancieres = i <= params.dureeEmprunt ? capitalRestant * params.tauxEmprunt : 0
      const resultatAvantIS = resultatExploitation - chargesFinancieres
      
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
      if (i <= params.dureeEmprunt && annuiteEmprunt > 0) {
        if (i === 0 && params.differePremierAn) {
          remboursementCapital = 0
        } else {
          remboursementCapital = annuiteEmprunt - chargesFinancieres
        }
        capitalRestant -= remboursementCapital
      }

      const tresorerie = caf - remboursementCapital

      annees.push({
        productible: Math.round(productible),
        tarifRachat,
        reventeElec: Math.round(reventeElec),
        autresRevenus: Math.round(autresRevenus),
        revenusTotal: Math.round(revenusTotal),
        chargesPrevisionnelles: Math.round(chargesPrevisionnelles),
        chargesFlux: Math.round(chargesFlux),
        chargesTotal: Math.round(chargesTotal),
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
        tresorerie: Math.round(tresorerie)
      })
    }

    return annees
  }

  const calculerKPIs = () => {
    const projetsSelectionnesArray = projets.filter(p => projetsSelectionnes[p.id])
    
    const investissementTotal = projetsSelectionnesArray.reduce((sum, p) => sum + (p.budgetTotalHT || 0), 0)
    const apportTotal = projetsSelectionnesArray.reduce((sum, p) => sum + (p.totalPayeHT || 0), 0)
    const detteTotal = investissementTotal - apportTotal
    const puissanceTotale = projetsSelectionnesArray.reduce((sum, p) => sum + (p.puissanceKWc || 0), 0)

    const totaux = {
      revenusTotal: consolidation.reduce((sum, a) => sum + a.revenusTotal, 0),
      chargesTotal: consolidation.reduce((sum, a) => sum + a.chargesTotal, 0),
      ebe: consolidation.reduce((sum, a) => sum + a.ebe, 0),
      resultatNet: consolidation.reduce((sum, a) => sum + a.resultatNet, 0),
      caf: consolidation.reduce((sum, a) => sum + a.caf, 0),
      tresorerie: consolidation.reduce((sum, a) => sum + a.tresorerie, 0),
      tresorerieCumulee: consolidation[consolidation.length - 1]?.tresorerieCumulee || 0,
      productionTotale: consolidation.reduce((sum, a) => sum + a.productible, 0),
      chargesFinancieres: consolidation.reduce((sum, a) => sum + a.chargesFinancieres, 0),
      remboursements: consolidation.reduce((sum, a) => sum + a.remboursementCapital, 0)
    }

    let van = -investissementTotal
    const tauxActu = 0.05
    consolidation.forEach((annee, index) => {
      van += annee.caf / Math.pow(1 + tauxActu, index + 1)
    })

    let cumulCashFlow = -investissementTotal
    let paybackPeriod = 0
    for (let i = 0; i < consolidation.length; i++) {
      cumulCashFlow += consolidation[i].caf
      if (cumulCashFlow >= 0) {
        paybackPeriod = i + 1
        break
      }
    }

    // TRI (calcul simplifié par approximation)
    let tri = 0
    for (let taux = 0; taux <= 0.30; taux += 0.001) {
      let vanTest = -investissementTotal
      consolidation.forEach((annee, index) => {
        vanTest += annee.caf / Math.pow(1 + taux, index + 1)
      })
      if (Math.abs(vanTest) < 1000) {
        tri = taux
        break
      }
    }

    // Break-even year
    let breakEven = 0
    for (let i = 0; i < consolidation.length; i++) {
      if (consolidation[i].resultatNet > 0) {
        breakEven = i + 1
        break
      }
    }

    // DSCR moyen
    const cafMoyenne = totaux.caf / 20
    const annuiteMoyenne = (totaux.chargesFinancieres + totaux.remboursements) / 20
    const dscr = annuiteMoyenne > 0 ? cafMoyenne / annuiteMoyenne : 0

    // Prix de revient par kWh
    const prixRevientKWh = totaux.productionTotale > 0 ? (totaux.chargesTotal / totaux.productionTotale) * 1000 : 0

    // Productivité moyenne
    const productionMoyenne = totaux.productionTotale / 20
    const productivite = puissanceTotale > 0 ? productionMoyenne / puissanceTotale : 0

    return {
      investissementTotal,
      apportTotal,
      detteTotal,
      ...totaux,
      van,
      paybackPeriod,
      tri,
      breakEven,
      dscr,
      prixRevientKWh,
      productivite,
      puissanceTotale,
      ratioDetteCapitaux: apportTotal > 0 ? detteTotal / apportTotal : 0,
      tauxEndettement: investissementTotal > 0 ? (detteTotal / investissementTotal) * 100 : 0,
      margeEBE: totaux.revenusTotal > 0 ? (totaux.ebe / totaux.revenusTotal) * 100 : 0,
      margeNette: totaux.revenusTotal > 0 ? (totaux.resultatNet / totaux.revenusTotal) * 100 : 0,
      roi: investissementTotal > 0 ? (totaux.tresorerieCumulee / investissementTotal) * 100 : 0
    }
  }

  const kpis = calculerKPIs()

  const exporterExcel = () => {
    const csv = [
      ['Année', 'Productible', 'Tarif', 'Revente Élec', 'Autres Rev', 'Total Rev', 'Ch.Prévi', 'Ch.Flux', 'Total Ch', 'EBE', 'Amort.Compta', 'Amort.Réels', 'Rés.Expl', 'Ch.Fin', 'Rés.av.IS', 'Déficit Rep.', 'Rés.Impos.', 'IS', 'Rés.Net', 'CAF', 'Rembours.', 'Tréso', 'Tréso Cumul'].join(';'),
      ...consolidation.map(a => [
        a.annee,
        a.productible,
        a.tarifRachat.toFixed(4),
        a.reventeElec,
        a.autresRevenus,
        a.revenusTotal,
        a.chargesPrevisionnelles,
        a.chargesFlux,
        a.chargesTotal,
        a.ebe,
        a.amortissements,
        a.vraisAmortissements,
        a.resultatExploitation,
        a.chargesFinancieres,
        a.resultatAvantIS,
        a.deficitReportable,
        a.resultatImposable,
        a.is,
        a.resultatNet,
        a.caf,
        a.remboursementCapital,
        a.tresorerie,
        a.tresorerieCumulee
      ].join(';'))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `plan-previsionnel-groupe-${new Date().toISOString().slice(0,10)}.csv`
    link.click()
  }

  const KPICard = ({ titre, valeur, couleur, kpiKey, unite = '' }: any) => (
    <>
      <div className={`bg-${couleur}-50 p-6 rounded-xl border-2 border-${couleur}-600 relative`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-gray-900">{titre}</p>
          <button
            onClick={() => setKpiExplique(kpiExplique === kpiKey ? null : kpiKey)}
            className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center justify-center"
          >
            ℹ️
          </button>
        </div>
        <p className={`text-3xl font-bold text-${couleur}-900`}>{valeur}{unite}</p>
      </div>
      
      {kpiExplique === kpiKey && (
        <>
          {/* Overlay sombre */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setKpiExplique(null)}
          />
          
          {/* Modal centré */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white border-4 border-blue-600 rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xl font-bold text-gray-900">{explications[kpiKey as keyof typeof explications]?.titre}</h4>
              <button
                onClick={() => setKpiExplique(null)}
                className="text-gray-600 hover:text-gray-900 font-bold text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold text-blue-900 mb-1">📖 Définition:</p>
                <p className="text-sm text-gray-800">{explications[kpiKey as keyof typeof explications]?.definition}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900 mb-1">🧮 Calcul:</p>
                <p className="text-sm text-gray-800">{explications[kpiKey as keyof typeof explications]?.calcul}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900 mb-1">💡 Interprétation:</p>
                <p className="text-sm text-gray-800 whitespace-pre-line">{explications[kpiKey as keyof typeof explications]?.interpretation}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )

  const nbProjetsSelectionnes = Object.values(projetsSelectionnes).filter(Boolean).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-900 font-semibold">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">📊 Plan Prévisionnel Groupe COMPLET</h2>
        <p className="text-white">{nbProjetsSelectionnes} projet{nbProjetsSelectionnes > 1 ? 's' : ''} • {kpis.puissanceTotale} kWc</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Projets à inclure</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projets.map(projet => (
            <div
              key={projet.id}
              className={`p-4 rounded-lg border-2 cursor-pointer ${
                projetsSelectionnes[projet.id] ? 'bg-blue-50 border-blue-600' : 'bg-gray-50 border-gray-300'
              }`}
              onClick={() => toggleProjet(projet.id)}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={projetsSelectionnes[projet.id] || false}
                  onChange={() => toggleProjet(projet.id)}
                  className="w-5 h-5 mt-1"
                />
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{projet.nom}</p>
                  {projet.puissanceKWc && <p className="text-sm text-gray-800">{projet.puissanceKWc} kWc</p>}
                  <p className="text-xs text-gray-700 mt-1">{projet.budgetTotalHT?.toLocaleString('fr-FR')} € HT</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setOngletActif('tableau')}
            className={`flex-1 px-6 py-4 font-bold text-lg ${
              ongletActif === 'tableau' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            📋 Tableau Détaillé
          </button>
          <button
            onClick={() => setOngletActif('kpis')}
            className={`flex-1 px-6 py-4 font-bold text-lg ${
              ongletActif === 'kpis' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            💰 KPIs
          </button>
        </div>

        <div className="p-6">
          {ongletActif === 'tableau' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setLegendeVisible(!legendeVisible)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2"
                >
                  📖 {legendeVisible ? 'Masquer' : 'Afficher'} la légende des colonnes
                </button>
                <button
                  onClick={exporterExcel}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
                >
                  📥 Exporter Excel
                </button>
              </div>

              {legendeVisible && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-600 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📖 Légende des colonnes du tableau</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* PRODUCTION */}
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-blue-900">Productible</p>
                      <p className="text-sm text-gray-800">Production électrique annuelle en kWh</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-blue-900">Tarif</p>
                      <p className="text-sm text-gray-800">Tarif de rachat EDF par kWh (€/kWh)</p>
                    </div>

                    {/* REVENUS */}
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-green-900">Revente</p>
                      <p className="text-sm text-gray-800">Revente électricité = Productible × Tarif</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-green-900">Autres</p>
                      <p className="text-sm text-gray-800">Autres revenus (flux inter-sociétés reçus)</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-green-900">Rev Total</p>
                      <p className="text-sm text-gray-800">Revenus Totaux = Revente + Autres</p>
                    </div>

                    {/* CHARGES */}
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-red-900">Ch.Prévi</p>
                      <p className="text-sm text-gray-800">Charges Prévisionnelles (IFER, Maintenance...)</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-red-900">Ch.Flux</p>
                      <p className="text-sm text-gray-800">Charges Flux (loyers inter-sociétés payés)</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-red-900">Total Ch</p>
                      <p className="text-sm text-gray-800">Charges Totales = Ch.Prévi + Ch.Flux</p>
                    </div>

                    {/* RÉSULTATS */}
                    <div className="bg-blue-100 p-3 rounded-lg border-2 border-blue-800">
                      <p className="font-bold text-blue-900">EBE</p>
                      <p className="text-sm text-gray-800">Excédent Brut d'Exploitation = Rev Total - Total Ch</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-gray-900">Amort.C</p>
                      <p className="text-sm text-gray-800">Amortissements Comptables (pour le bilan)</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-blue-900">Amort.R</p>
                      <p className="text-sm text-gray-800">Amortissements Réels (pour le calcul CAF)</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-gray-900">Rés.Expl</p>
                      <p className="text-sm text-gray-800">Résultat d'Exploitation = EBE - Amort.C</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-red-900">Ch.Fin</p>
                      <p className="text-sm text-gray-800">Charges Financières (intérêts d'emprunt)</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-gray-900">Av.IS</p>
                      <p className="text-sm text-gray-800">Résultat Avant IS = Rés.Expl - Ch.Fin</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-orange-900">Déf.Rep</p>
                      <p className="text-sm text-gray-800">Déficit Reportable (pertes des années précédentes)</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-purple-900">Impos</p>
                      <p className="text-sm text-gray-800">Résultat Imposable = Av.IS - Déf.Rep</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-red-900">IS</p>
                      <p className="text-sm text-gray-800">Impôt sur les Sociétés (15% puis 25%)</p>
                    </div>
                    
                    <div className="bg-purple-100 p-3 rounded-lg border-2 border-purple-800">
                      <p className="font-bold text-purple-900">Net</p>
                      <p className="text-sm text-gray-800">Résultat Net = Av.IS - IS</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-blue-900">CAF</p>
                      <p className="text-sm text-gray-800">Capacité d'AutoFinancement = Net + Amort.R</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-red-900">Remb</p>
                      <p className="text-sm text-gray-800">Remboursement du Capital emprunté</p>
                    </div>
                    
                    <div className="bg-green-100 p-3 rounded-lg border-2 border-green-800">
                      <p className="font-bold text-green-900">Tréso</p>
                      <p className="text-sm text-gray-800">Trésorerie = CAF - Remb</p>
                    </div>
                    
                    <div className="bg-green-200 p-3 rounded-lg border-2 border-green-900">
                      <p className="font-bold text-green-900">Cumul</p>
                      <p className="text-sm text-gray-800">Trésorerie Cumulée (somme progressive)</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-yellow-50 border-2 border-yellow-600 rounded-lg p-4">
                    <p className="text-sm text-gray-900">
                      <strong>💡 Astuce:</strong> Les colonnes en gras et colorées (EBE, Net, Tréso, Cumul) sont les plus importantes pour évaluer la rentabilité.
                    </p>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-900 text-white">
                    <tr>
                      <th className="p-2 text-left sticky left-0 bg-gray-900">Année</th>
                      <th className="p-2 text-right">Productible<br/>(kWh)</th>
                      <th className="p-2 text-right">Tarif<br/>(€/kWh)</th>
                      <th className="p-2 text-right">Revente<br/>(€)</th>
                      <th className="p-2 text-right">Autres<br/>(€)</th>
                      <th className="p-2 text-right font-bold">Rev Total<br/>(€)</th>
                      <th className="p-2 text-right">Ch.Prévi<br/>(€)</th>
                      <th className="p-2 text-right">Ch.Flux<br/>(€)</th>
                      <th className="p-2 text-right font-bold">Total Ch<br/>(€)</th>
                      <th className="p-2 text-right font-bold bg-blue-800">EBE<br/>(€)</th>
                      <th className="p-2 text-right">Amort.C<br/>(€)</th>
                      <th className="p-2 text-right">Amort.R<br/>(€)</th>
                      <th className="p-2 text-right">Rés.Expl<br/>(€)</th>
                      <th className="p-2 text-right">Ch.Fin<br/>(€)</th>
                      <th className="p-2 text-right">Av.IS<br/>(€)</th>
                      <th className="p-2 text-right">Déf.Rep<br/>(€)</th>
                      <th className="p-2 text-right">Impos<br/>(€)</th>
                      <th className="p-2 text-right">IS<br/>(€)</th>
                      <th className="p-2 text-right font-bold bg-purple-800">Net<br/>(€)</th>
                      <th className="p-2 text-right font-bold">CAF<br/>(€)</th>
                      <th className="p-2 text-right">Remb<br/>(€)</th>
                      <th className="p-2 text-right font-bold bg-green-800">Tréso<br/>(€)</th>
                      <th className="p-2 text-right font-bold bg-green-900">Cumul<br/>(€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consolidation.map(a => (
                      <tr key={a.annee} className="border-b hover:bg-gray-100">
                        <td className="p-2 font-bold sticky left-0 bg-white">{a.annee}</td>
                        <td className="p-2 text-right text-gray-700">{a.productible.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right text-gray-700">{a.tarifRachat.toFixed(4)}</td>
                        <td className="p-2 text-right text-green-700">{a.reventeElec.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right text-green-700">{a.autresRevenus.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right font-bold text-green-900">{a.revenusTotal.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right text-red-700">{a.chargesPrevisionnelles.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right text-red-700">{a.chargesFlux.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right font-bold text-red-900">{a.chargesTotal.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right font-bold text-blue-900">{a.ebe.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right text-gray-700">{a.amortissements.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right text-blue-700">{a.vraisAmortissements.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right text-gray-700">{a.resultatExploitation.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right text-red-700">{a.chargesFinancieres.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right text-gray-700">{a.resultatAvantIS.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right text-orange-700">{a.deficitReportable.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right text-purple-700">{a.resultatImposable.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right text-red-700">{a.is.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right font-bold text-purple-900">{a.resultatNet.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right font-bold text-blue-900">{a.caf.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right text-red-700">{a.remboursementCapital.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right font-bold text-green-900">{a.tresorerie.toLocaleString('fr-FR')}</td>
                        <td className={`p-2 text-right font-bold ${a.tresorerieCumulee >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                          {a.tresorerieCumulee.toLocaleString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {ongletActif === 'kpis' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">💰 Indicateurs Clés</h3>
                <p className="text-sm text-gray-700">Cliquez sur ℹ️ pour voir les explications</p>
              </div>

              {/* Investissement */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-600">
                  <p className="text-sm font-bold mb-2 text-gray-900">Investissement</p>
                  <p className="text-3xl font-bold text-blue-900">{kpis.investissementTotal.toLocaleString('fr-FR')} €</p>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border-2 border-green-600">
                  <p className="text-sm font-bold mb-2 text-gray-900">Apport</p>
                  <p className="text-3xl font-bold text-green-900">{kpis.apportTotal.toLocaleString('fr-FR')} €</p>
                </div>
                <div className="bg-red-50 p-6 rounded-xl border-2 border-red-600">
                  <p className="text-sm font-bold mb-2 text-gray-900">Dette</p>
                  <p className="text-3xl font-bold text-red-900">{kpis.detteTotal.toLocaleString('fr-FR')} €</p>
                </div>
              </div>

              {/* Résultats 20 ans */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 rounded-xl text-white">
                <h4 className="text-xl font-bold mb-4">📊 Résultats 20 ans</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Revenus</p>
                    <p className="text-2xl font-bold">{kpis.revenusTotal.toLocaleString('fr-FR')} €</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Charges</p>
                    <p className="text-2xl font-bold">{kpis.chargesTotal.toLocaleString('fr-FR')} €</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">EBE</p>
                    <p className="text-2xl font-bold">{kpis.ebe.toLocaleString('fr-FR')} €</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Résultat Net</p>
                    <p className="text-2xl font-bold">{kpis.resultatNet.toLocaleString('fr-FR')} €</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">CAF</p>
                    <p className="text-2xl font-bold">{kpis.caf.toLocaleString('fr-FR')} €</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm font-semibold text-white">Trésorerie Cumulée</p>
                    <p className={`text-3xl font-bold ${kpis.tresorerieCumulee >= 0 ? 'text-white' : 'text-white'}`}>
                      {kpis.tresorerieCumulee.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                </div>
              </div>

              {/* KPIs Principaux */}
              <h4 className="text-xl font-bold text-gray-900">🎯 Indicateurs de Rentabilité</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard 
                  titre="VAN (5%)"
                  valeur={kpis.van.toLocaleString('fr-FR')}
                  couleur="yellow"
                  kpiKey="van"
                  unite=" €"
                />
                <KPICard 
                  titre="TRI"
                  valeur={(kpis.tri * 100).toFixed(2)}
                  couleur="purple"
                  kpiKey="tri"
                  unite=" %"
                />
                <KPICard 
                  titre="Payback"
                  valeur={kpis.paybackPeriod}
                  couleur="orange"
                  kpiKey="payback"
                  unite=" ans"
                />
                <KPICard 
                  titre="ROI"
                  valeur={kpis.roi.toFixed(1)}
                  couleur="indigo"
                  kpiKey="roi"
                  unite=" %"
                />
              </div>

              {/* Ratios Financiers */}
              <h4 className="text-xl font-bold text-gray-900">📊 Ratios Financiers</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard 
                  titre="Dette/Capitaux"
                  valeur={kpis.ratioDetteCapitaux.toFixed(2)}
                  couleur="gray"
                  kpiKey="detteCapitaux"
                />
                <KPICard 
                  titre="Taux Endettement"
                  valeur={kpis.tauxEndettement.toFixed(1)}
                  couleur="red"
                  kpiKey="tauxEndettement"
                  unite=" %"
                />
                <KPICard 
                  titre="DSCR"
                  valeur={kpis.dscr.toFixed(2)}
                  couleur="green"
                  kpiKey="dscr"
                />
                <KPICard 
                  titre="Break-Even"
                  valeur={kpis.breakEven || 'N/A'}
                  couleur="blue"
                  kpiKey="breakEven"
                  unite={kpis.breakEven ? ' ans' : ''}
                />
              </div>

              {/* Marges */}
              <h4 className="text-xl font-bold text-gray-900">💹 Marges</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <KPICard 
                  titre="Marge EBE"
                  valeur={kpis.margeEBE.toFixed(1)}
                  couleur="teal"
                  kpiKey="margeEBE"
                  unite=" %"
                />
                <KPICard 
                  titre="Marge Nette"
                  valeur={kpis.margeNette.toFixed(1)}
                  couleur="pink"
                  kpiKey="margeNette"
                  unite=" %"
                />
              </div>

              {/* Indicateurs Photovoltaïque */}
              <h4 className="text-xl font-bold text-gray-900">☀️ Indicateurs Photovoltaïque</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <KPICard 
                  titre="Productivité"
                  valeur={Math.round(kpis.productivite)}
                  couleur="yellow"
                  kpiKey="productivite"
                  unite=" kWh/kWc/an"
                />
                <KPICard 
                  titre="Prix Revient"
                  valeur={kpis.prixRevientKWh.toFixed(3)}
                  couleur="orange"
                  kpiKey="prixRevient"
                  unite=" €/kWh"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}