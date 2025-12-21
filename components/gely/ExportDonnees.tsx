'use client'

import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { Projet, LigneFinanciere } from '@/lib/gely/types'

interface ExportDonneesProps {
  projets: Projet[]
  lignesFinancieres: Record<string, LigneFinanciere[]>
}

const SOCIETES_LABELS: Record<string, string> = {
  sciGely: 'SCI GELY',
  lexa: 'LEXA',
  lexa2: 'LEXA 2',
  solaireNettoyage: 'SOLAIRE NETTOYAGE'
}

export default function ExportDonnees({ projets, lignesFinancieres }: ExportDonneesProps) {
  const formatNumber = (num: number) => num.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR')

  // Export Excel - Liste projets
  const exportProjetsExcel = () => {
    // Créer les données CSV
    const headers = [
      'Nom',
      'Société',
      'Responsable',
      'Statut',
      'Budget Total (€)',
      'Payé (€)',
      'À Payer (€)',
      'Reste (€)',
      '% Réalisé',
      'Puissance (kWc)',
      'Revenus/an (€)',
      'Date début'
    ]

    const rows = projets.map(p => [
      p.nom,
      SOCIETES_LABELS[p.societe],
      p.responsable,
      p.statut,
      p.budgetTotal,
      p.totalPaye,
      p.totalAPayer,
      p.reste,
      p.budgetTotal > 0 ? ((p.totalPaye / p.budgetTotal) * 100).toFixed(1) : '0',
      p.puissanceKWc || '',
      p.revenusAnnuels || '',
      formatDate(p.dateDebut)
    ])

    const csv = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n')

    // Télécharger
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `GELY_Projets_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Export Excel - Détail financier par projet
  const exportFinancierExcel = (projetId: string) => {
    const projet = projets.find(p => p.id === projetId)
    if (!projet) return

    const lignes = lignesFinancieres[projetId] || []

    const headers = [
      'Type',
      'Fournisseur',
      'N° Facture',
      'Description',
      'Montant HT (€)',
      'Montant TTC (€)',
      'Statut',
      'Date',
      'Échéance',
      'Notes'
    ]

    const rows = lignes.map(l => [
      l.type,
      l.fournisseur,
      l.numero || '',
      l.description,
      l.montantHT,
      l.montantTTC,
      l.statut,
      formatDate(l.date),
      l.echeance ? formatDate(l.echeance) : '',
      l.notes || ''
    ])

    const csv = [
      `Projet: ${projet.nom}`,
      `Société: ${SOCIETES_LABELS[projet.societe]}`,
      '',
      headers.join(';'),
      ...rows.map(row => row.join(';')),
      '',
      `TOTAL PAYÉ;;;;;${projet.totalPaye};;;`,
      `TOTAL À PAYER;;;;;${projet.totalAPayer};;;`,
      `RESTE BUDGET;;;;;${projet.reste};;;`
    ].join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `GELY_Financier_${projet.nom.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Export PDF - Rapport global
  const exportRapportPDF = () => {
    // Calculer totaux
    const totalBudget = projets.reduce((sum, p) => sum + p.budgetTotal, 0)
    const totalPaye = projets.reduce((sum, p) => sum + p.totalPaye, 0)
    const totalAPayer = projets.reduce((sum, p) => sum + p.totalAPayer, 0)
    const totalReste = projets.reduce((sum, p) => sum + p.reste, 0)
    const totalRevenus = projets.reduce((sum, p) => sum + (p.revenusAnnuels || 0), 0)

    // Créer HTML pour impression
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rapport GROUPE GELY - ${new Date().toLocaleDateString('fr-FR')}</title>
  <style>
    @media print {
      @page { margin: 2cm; }
      body { font-family: Arial, sans-serif; }
    }
    body {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #1e40af; border-bottom: 4px solid #1e40af; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #1e40af; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    tr:nth-child(even) { background: #f9fafb; }
    .kpi { display: inline-block; margin: 10px 20px 10px 0; padding: 15px; background: #eff6ff; border-left: 4px solid #1e40af; }
    .kpi-label { font-size: 12px; color: #6b7280; font-weight: bold; }
    .kpi-value { font-size: 24px; font-weight: bold; color: #1e40af; }
  </style>
</head>
<body>
  <h1>📊 RAPPORT GROUPE GELY</h1>
  <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}</p>
  
  <h2>VUE D'ENSEMBLE</h2>
  <div class="kpi">
    <div class="kpi-label">BUDGET TOTAL</div>
    <div class="kpi-value">${formatNumber(totalBudget)} €</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">PAYÉ</div>
    <div class="kpi-value">${formatNumber(totalPaye)} €</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">À PAYER</div>
    <div class="kpi-value">${formatNumber(totalAPayer)} €</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">RESTE</div>
    <div class="kpi-value">${formatNumber(totalReste)} €</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">REVENUS PV/AN</div>
    <div class="kpi-value">${formatNumber(totalRevenus)} €</div>
  </div>

  <h2>LISTE DES PROJETS</h2>
  <table>
    <thead>
      <tr>
        <th>Projet</th>
        <th>Société</th>
        <th>Budget (€)</th>
        <th>Payé (€)</th>
        <th>% Réalisé</th>
        <th>Reste (€)</th>
      </tr>
    </thead>
    <tbody>
      ${projets.map(p => `
        <tr>
          <td><strong>${p.nom}</strong><br><small>${p.description}</small></td>
          <td>${SOCIETES_LABELS[p.societe]}</td>
          <td>${formatNumber(p.budgetTotal)}</td>
          <td>${formatNumber(p.totalPaye)}</td>
          <td><strong>${p.budgetTotal > 0 ? ((p.totalPaye / p.budgetTotal) * 100).toFixed(1) : 0}%</strong></td>
          <td>${formatNumber(p.reste)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>ÉCHÉANCES CRITIQUES</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Projet</th>
        <th>Description</th>
        <th>Montant (€)</th>
        <th>Statut</th>
      </tr>
    </thead>
    <tbody>
      ${projets.flatMap(p => 
        (p.echeancesCritiques || []).map(e => `
          <tr>
            <td><strong>${formatDate(e.date)}</strong></td>
            <td>${p.nom}</td>
            <td>${e.description}</td>
            <td><strong>${formatNumber(e.montant)}</strong></td>
            <td>${e.statut === 'payee' ? '✅ Payée' : e.statut === 'retard' ? '⚠️ Retard' : '⏳ À venir'}</td>
          </tr>
        `)
      ).join('')}
    </tbody>
  </table>

  <p style="margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px;">
    Document généré automatiquement - GROUPE GELY - ${new Date().toLocaleDateString('fr-FR')}
  </p>
</body>
</html>
    `

    // Ouvrir dans nouvelle fenêtre pour impression
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-xl shadow-xl p-8">
        <div className="flex items-center space-x-4">
          <div className="bg-yellow-400 p-3 rounded-xl">
            <Download className="w-12 h-12 text-green-900" />
          </div>
          <div>
            <h2 className="text-4xl font-bold">Export de données</h2>
            <p className="text-green-100 text-lg">Téléchargez vos rapports Excel et PDF</p>
          </div>
        </div>
      </div>

      {/* Export global */}
      <div className="bg-white border-4 border-black rounded-lg p-6">
        <h3 className="text-2xl font-bold text-black mb-4">📊 EXPORTS GLOBAUX</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={exportProjetsExcel}
            className="p-6 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center space-x-3 border-4 border-black"
          >
            <FileSpreadsheet className="w-8 h-8" />
            <div className="text-left">
              <p className="text-xl">LISTE PROJETS (Excel)</p>
              <p className="text-sm font-normal">Tous les projets avec budgets et KPIs</p>
            </div>
          </button>

          <button
            onClick={exportRapportPDF}
            className="p-6 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex items-center space-x-3 border-4 border-black"
          >
            <FileText className="w-8 h-8" />
            <div className="text-left">
              <p className="text-xl">RAPPORT GROUPE (PDF)</p>
              <p className="text-sm font-normal">Vue d'ensemble + échéances critiques</p>
            </div>
          </button>
        </div>
      </div>

      {/* Export par projet */}
      <div className="bg-white border-4 border-black rounded-lg p-6">
        <h3 className="text-2xl font-bold text-black mb-4">📁 EXPORTS PAR PROJET</h3>
        <div className="space-y-3">
          {projets.map(projet => (
            <div key={projet.id} className="bg-blue-50 border-2 border-blue-600 rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-lg font-bold text-black">{projet.nom}</p>
                <p className="text-sm text-black">{SOCIETES_LABELS[projet.societe]} - {formatNumber(projet.budgetTotal)} €</p>
              </div>
              <button
                onClick={() => exportFinancierExcel(projet.id)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center space-x-2 border-2 border-black"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>DÉTAIL FINANCIER</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Informations */}
      <div className="bg-yellow-100 border-4 border-yellow-500 rounded-lg p-6">
        <h3 className="text-lg font-bold text-black mb-2">ℹ️ INFORMATIONS</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-black">
          <li>Les fichiers Excel sont au format <strong>CSV</strong> (compatible Excel, LibreOffice, Google Sheets)</li>
          <li>Le rapport PDF s'ouvre dans une nouvelle fenêtre pour impression ou sauvegarde</li>
          <li>Les exports incluent les données en temps réel de la session</li>
          <li>Pour Excel: Ouvrir avec <strong>délimiteur point-virgule (;)</strong></li>
        </ul>
      </div>
    </div>
  )
}
