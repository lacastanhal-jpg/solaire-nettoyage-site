'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, RefreshCw, AlertTriangle } from 'lucide-react'
import { Projet } from '@/lib/gely/types'

interface SimulateurImpactProps {
  projets: Projet[]
}

const SOCIETES_LABELS: Record<string, string> = {
  sciGely: 'SCI GELY',
  lexa: 'LEXA',
  lexa2: 'LEXA 2',
  solaireNettoyage: 'SOLAIRE NETTOYAGE'
}

export default function SimulateurImpact({ projets }: SimulateurImpactProps) {
  const [selectedProjetId, setSelectedProjetId] = useState<string>(projets[0]?.id || '')
  const [simulatedBudget, setSimulatedBudget] = useState<string>('')
  const [simulatedPaye, setSimulatedPaye] = useState<string>('')
  const [simulatedAPayer, setSimulatedAPayer] = useState<string>('')
  const [isSimulating, setIsSimulating] = useState(false)

  const selectedProjet = projets.find(p => p.id === selectedProjetId)

  // Calculs AVANT simulation
  const statsAvant = useMemo(() => {
    if (!selectedProjet) return null

    const projetsSociete = projets.filter(p => p.societe === selectedProjet.societe)
    const totalGroupe = projets.reduce((sum, p) => sum + p.budgetTotal, 0)
    const totalSociete = projetsSociete.reduce((sum, p) => sum + p.budgetTotal, 0)
    const payeGroupe = projets.reduce((sum, p) => sum + p.totalPaye, 0)
    const payeSociete = projetsSociete.reduce((sum, p) => sum + p.totalPaye, 0)
    const resteGroupe = projets.reduce((sum, p) => sum + p.reste, 0)
    const resteSociete = projetsSociete.reduce((sum, p) => sum + p.reste, 0)

    return {
      projet: {
        budget: selectedProjet.budgetTotal,
        paye: selectedProjet.totalPaye,
        aPayer: selectedProjet.totalAPayer,
        reste: selectedProjet.reste,
        pourcentage: (selectedProjet.totalPaye / selectedProjet.budgetTotal * 100).toFixed(1)
      },
      societe: {
        budget: totalSociete,
        paye: payeSociete,
        reste: resteSociete
      },
      groupe: {
        budget: totalGroupe,
        paye: payeGroupe,
        reste: resteGroupe
      }
    }
  }, [selectedProjet, projets])

  // Calculs APRÈS simulation
  const statsApres = useMemo(() => {
    if (!isSimulating || !selectedProjet || !statsAvant) return null

    const newBudget = simulatedBudget ? parseFloat(simulatedBudget) : selectedProjet.budgetTotal
    const newPaye = simulatedPaye ? parseFloat(simulatedPaye) : selectedProjet.totalPaye
    const newAPayer = simulatedAPayer ? parseFloat(simulatedAPayer) : selectedProjet.totalAPayer
    const newReste = newBudget - newPaye - newAPayer

    // Différences
    const diffBudget = newBudget - selectedProjet.budgetTotal
    const diffPaye = newPaye - selectedProjet.totalPaye
    const diffAPayer = newAPayer - selectedProjet.totalAPayer
    const diffReste = newReste - selectedProjet.reste

    return {
      projet: {
        budget: newBudget,
        paye: newPaye,
        aPayer: newAPayer,
        reste: newReste,
        pourcentage: (newPaye / newBudget * 100).toFixed(1)
      },
      societe: {
        budget: statsAvant.societe.budget + diffBudget,
        paye: statsAvant.societe.paye + diffPaye,
        reste: statsAvant.societe.reste + diffReste
      },
      groupe: {
        budget: statsAvant.groupe.budget + diffBudget,
        paye: statsAvant.groupe.paye + diffPaye,
        reste: statsAvant.groupe.reste + diffReste
      },
      diff: {
        budget: diffBudget,
        paye: diffPaye,
        aPayer: diffAPayer,
        reste: diffReste
      }
    }
  }, [isSimulating, selectedProjet, simulatedBudget, simulatedPaye, simulatedAPayer, statsAvant])

  const handleSimuler = () => {
    if (!simulatedBudget && !simulatedPaye && !simulatedAPayer) {
      alert('Modifie au moins une valeur pour simuler !')
      return
    }
    setIsSimulating(true)
  }

  const handleReset = () => {
    setSimulatedBudget('')
    setSimulatedPaye('')
    setSimulatedAPayer('')
    setIsSimulating(false)
  }

  const formatNumber = (num: number) => num.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
  const formatDiff = (num: number) => {
    if (num === 0) return '±0 €'
    const sign = num > 0 ? '+' : ''
    return `${sign}${formatNumber(num)} €`
  }

  if (!selectedProjet || !statsAvant) {
    return <div className="text-black font-bold">Aucun projet disponible</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl shadow-xl p-8">
        <div className="flex items-center space-x-4">
          <div className="bg-yellow-400 p-3 rounded-xl">
            <TrendingUp className="w-12 h-12 text-purple-900" />
          </div>
          <div>
            <h2 className="text-4xl font-bold">Simulateur d'Impact</h2>
            <p className="text-purple-100 text-lg">Testez l'impact des modifications sur vos finances</p>
          </div>
        </div>
      </div>

      {/* Sélection projet */}
      <div className="bg-white border-4 border-black rounded-lg p-6">
        <label className="block text-2xl font-bold text-black mb-3">PROJET À SIMULER</label>
        <select
          value={selectedProjetId}
          onChange={(e) => {
            setSelectedProjetId(e.target.value)
            handleReset()
          }}
          className="w-full px-4 py-3 bg-white text-black font-bold text-lg border-4 border-black rounded-lg focus:border-purple-600 focus:outline-none"
        >
          {projets.map(p => (
            <option key={p.id} value={p.id}>
              {p.nom} - {SOCIETES_LABELS[p.societe]} - {formatNumber(p.budgetTotal)} €
            </option>
          ))}
        </select>
      </div>

      {/* Formulaire simulation */}
      <div className="bg-yellow-100 border-4 border-yellow-500 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-2" />
          MODIFIER LES VALEURS (simulation uniquement)
        </h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-lg font-bold text-black mb-2">
              Budget Total (€)
            </label>
            <input
              type="number"
              value={simulatedBudget}
              onChange={(e) => setSimulatedBudget(e.target.value)}
              placeholder={formatNumber(selectedProjet.budgetTotal)}
              className="w-full px-4 py-3 bg-white text-black font-bold text-lg border-4 border-black rounded-lg focus:border-purple-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-lg font-bold text-black mb-2">
              Montant Payé (€)
            </label>
            <input
              type="number"
              value={simulatedPaye}
              onChange={(e) => setSimulatedPaye(e.target.value)}
              placeholder={formatNumber(selectedProjet.totalPaye)}
              className="w-full px-4 py-3 bg-white text-black font-bold text-lg border-4 border-black rounded-lg focus:border-purple-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-lg font-bold text-black mb-2">
              À Payer (€)
            </label>
            <input
              type="number"
              value={simulatedAPayer}
              onChange={(e) => setSimulatedAPayer(e.target.value)}
              placeholder={formatNumber(selectedProjet.totalAPayer)}
              className="w-full px-4 py-3 bg-white text-black font-bold text-lg border-4 border-black rounded-lg focus:border-purple-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleSimuler}
            className="px-8 py-4 bg-purple-600 text-white rounded-lg font-bold text-xl hover:bg-purple-700 flex items-center space-x-2 border-4 border-black"
          >
            <TrendingUp className="w-6 h-6" />
            <span>SIMULER L'IMPACT</span>
          </button>
          <button
            onClick={handleReset}
            className="px-8 py-4 bg-white text-black rounded-lg font-bold text-xl hover:bg-gray-100 flex items-center space-x-2 border-4 border-black"
          >
            <RefreshCw className="w-6 h-6" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Résultats */}
      <div className="grid grid-cols-2 gap-6">
        {/* AVANT */}
        <div className="bg-white border-4 border-blue-600 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-blue-600 mb-4">📊 SITUATION ACTUELLE</h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-600">
              <p className="text-sm font-bold text-black mb-2">PROJET : {selectedProjet.nom}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-black font-semibold">Budget</p>
                  <p className="text-xl font-bold text-black">{formatNumber(statsAvant.projet.budget)} €</p>
                </div>
                <div>
                  <p className="text-black font-semibold">Payé</p>
                  <p className="text-xl font-bold text-green-700">{formatNumber(statsAvant.projet.paye)} €</p>
                </div>
                <div>
                  <p className="text-black font-semibold">À payer</p>
                  <p className="text-xl font-bold text-yellow-700">{formatNumber(statsAvant.projet.aPayer)} €</p>
                </div>
                <div>
                  <p className="text-black font-semibold">Reste</p>
                  <p className="text-xl font-bold text-blue-700">{formatNumber(statsAvant.projet.reste)} €</p>
                </div>
              </div>
              <p className="text-black font-bold mt-2">Réalisation: {statsAvant.projet.pourcentage}%</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-600">
              <p className="text-sm font-bold text-black mb-2">SOCIÉTÉ : {SOCIETES_LABELS[selectedProjet.societe]}</p>
              <div className="space-y-1 text-sm">
                <p className="text-black font-semibold">Budget: <span className="font-bold">{formatNumber(statsAvant.societe.budget)} €</span></p>
                <p className="text-black font-semibold">Payé: <span className="font-bold text-green-700">{formatNumber(statsAvant.societe.paye)} €</span></p>
                <p className="text-black font-semibold">Reste: <span className="font-bold text-blue-700">{formatNumber(statsAvant.societe.reste)} €</span></p>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-600">
              <p className="text-sm font-bold text-black mb-2">GROUPE GELY</p>
              <div className="space-y-1 text-sm">
                <p className="text-black font-semibold">Budget: <span className="font-bold">{formatNumber(statsAvant.groupe.budget)} €</span></p>
                <p className="text-black font-semibold">Payé: <span className="font-bold text-green-700">{formatNumber(statsAvant.groupe.paye)} €</span></p>
                <p className="text-black font-semibold">Reste: <span className="font-bold text-blue-700">{formatNumber(statsAvant.groupe.reste)} €</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* APRÈS */}
        <div className={`border-4 rounded-lg p-6 ${isSimulating ? 'bg-yellow-50 border-yellow-600' : 'bg-gray-100 border-gray-400'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isSimulating ? 'text-yellow-700' : 'text-gray-500'}`}>
            🎯 {isSimulating ? 'APRÈS SIMULATION' : 'Simulez pour voir l\'impact'}
          </h3>
          
          {isSimulating && statsApres ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-yellow-600">
                <p className="text-sm font-bold text-black mb-2">PROJET : {selectedProjet.nom}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-black font-semibold">Budget</p>
                    <p className="text-xl font-bold text-black">{formatNumber(statsApres.projet.budget)} €</p>
                    <p className="text-xs font-bold text-yellow-700">{formatDiff(statsApres.diff.budget)}</p>
                  </div>
                  <div>
                    <p className="text-black font-semibold">Payé</p>
                    <p className="text-xl font-bold text-green-700">{formatNumber(statsApres.projet.paye)} €</p>
                    <p className="text-xs font-bold text-yellow-700">{formatDiff(statsApres.diff.paye)}</p>
                  </div>
                  <div>
                    <p className="text-black font-semibold">À payer</p>
                    <p className="text-xl font-bold text-yellow-700">{formatNumber(statsApres.projet.aPayer)} €</p>
                    <p className="text-xs font-bold text-yellow-700">{formatDiff(statsApres.diff.aPayer)}</p>
                  </div>
                  <div>
                    <p className="text-black font-semibold">Reste</p>
                    <p className="text-xl font-bold text-blue-700">{formatNumber(statsApres.projet.reste)} €</p>
                    <p className="text-xs font-bold text-yellow-700">{formatDiff(statsApres.diff.reste)}</p>
                  </div>
                </div>
                <p className="text-black font-bold mt-2">Réalisation: {statsApres.projet.pourcentage}%</p>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-yellow-600">
                <p className="text-sm font-bold text-black mb-2">SOCIÉTÉ : {SOCIETES_LABELS[selectedProjet.societe]}</p>
                <div className="space-y-1 text-sm">
                  <p className="text-black font-semibold">Budget: <span className="font-bold">{formatNumber(statsApres.societe.budget)} €</span> <span className="text-xs font-bold text-yellow-700">{formatDiff(statsApres.diff.budget)}</span></p>
                  <p className="text-black font-semibold">Payé: <span className="font-bold text-green-700">{formatNumber(statsApres.societe.paye)} €</span> <span className="text-xs font-bold text-yellow-700">{formatDiff(statsApres.diff.paye)}</span></p>
                  <p className="text-black font-semibold">Reste: <span className="font-bold text-blue-700">{formatNumber(statsApres.societe.reste)} €</span> <span className="text-xs font-bold text-yellow-700">{formatDiff(statsApres.diff.reste)}</span></p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-yellow-600">
                <p className="text-sm font-bold text-black mb-2">GROUPE GELY</p>
                <div className="space-y-1 text-sm">
                  <p className="text-black font-semibold">Budget: <span className="font-bold">{formatNumber(statsApres.groupe.budget)} €</span> <span className="text-xs font-bold text-yellow-700">{formatDiff(statsApres.diff.budget)}</span></p>
                  <p className="text-black font-semibold">Payé: <span className="font-bold text-green-700">{formatNumber(statsApres.groupe.paye)} €</span> <span className="text-xs font-bold text-yellow-700">{formatDiff(statsApres.diff.paye)}</span></p>
                  <p className="text-black font-semibold">Reste: <span className="font-bold text-blue-700">{formatNumber(statsApres.groupe.reste)} €</span> <span className="text-xs font-bold text-yellow-700">{formatDiff(statsApres.diff.reste)}</span></p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 font-bold text-xl">Modifiez les valeurs et cliquez sur SIMULER</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
