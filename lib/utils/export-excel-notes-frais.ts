import * as XLSX from 'xlsx'
import type { NoteDeFrais } from '@/lib/firebase/notes-de-frais'

/**
 * Options d'export Excel
 */
export interface ExportExcelOptions {
  notes: NoteDeFrais[]
  mois?: string // Format: YYYY-MM
  operateur?: string
  statut?: string
  nomFichier?: string
}

/**
 * Exporter les notes de frais en Excel format comptable
 */
export function exporterNotesExcel(options: ExportExcelOptions): void {
  const { notes, mois, operateur, statut } = options

  // Filtrer les notes selon les options
  let notesFiltrees = [...notes]
  
  if (mois && mois !== 'all') {
    notesFiltrees = notesFiltrees.filter(n => n.date.startsWith(mois))
  }
  
  if (operateur && operateur !== 'all') {
    notesFiltrees = notesFiltrees.filter(n => n.operateurNom === operateur)
  }
  
  if (statut && statut !== 'all') {
    notesFiltrees = notesFiltrees.filter(n => n.statut === statut)
  }

  // Trier par date
  notesFiltrees.sort((a, b) => a.date.localeCompare(b.date))

  // Préparer les données pour Excel
  const donnees = notesFiltrees.map(note => ({
    'Date': formatDateFr(note.date),
    'Opérateur': note.operateurNom,
    'Catégorie': getCategorieLabel(note.categorie),
    'Description': note.description,
    'Montant HT': note.montantHT.toFixed(2),
    'TVA': note.montantTVA.toFixed(2),
    'Montant TTC': note.montantTTC.toFixed(2),
    'Statut': getStatutLabel(note.statut),
    'Date validation': note.dateValidation ? formatDateFr(note.dateValidation) : '',
    'Valideur': note.validateurNom || ''
  }))

  // Ajouter ligne de totaux
  const totalHT = notesFiltrees.reduce((sum, n) => sum + n.montantHT, 0)
  const totalTVA = notesFiltrees.reduce((sum, n) => sum + n.montantTVA, 0)
  const totalTTC = notesFiltrees.reduce((sum, n) => sum + n.montantTTC, 0)

  donnees.push({
    'Date': '',
    'Opérateur': '',
    'Catégorie': '',
    'Description': 'TOTAL',
    'Montant HT': totalHT.toFixed(2),
    'TVA': totalTVA.toFixed(2),
    'Montant TTC': totalTTC.toFixed(2),
    'Statut': '',
    'Date validation': '',
    'Valideur': ''
  })

  // Créer le workbook
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(donnees)

  // Définir les largeurs de colonnes
  ws['!cols'] = [
    { wch: 12 }, // Date
    { wch: 20 }, // Opérateur
    { wch: 15 }, // Catégorie
    { wch: 40 }, // Description
    { wch: 12 }, // Montant HT
    { wch: 10 }, // TVA
    { wch: 12 }, // Montant TTC
    { wch: 12 }, // Statut
    { wch: 15 }, // Date validation
    { wch: 20 }  // Valideur
  ]

  // Ajouter la feuille au workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Notes de Frais')

  // Générer le nom du fichier
  const maintenant = new Date()
  const dateStr = maintenant.toISOString().split('T')[0]
  let nomFichier = options.nomFichier || `notes_frais_${dateStr}`
  
  if (mois && mois !== 'all') {
    nomFichier = `notes_frais_${mois}`
  }
  
  if (operateur && operateur !== 'all') {
    nomFichier += `_${operateur.replace(/\s+/g, '_')}`
  }

  // Télécharger le fichier
  XLSX.writeFile(wb, `${nomFichier}.xlsx`)
}

/**
 * Formater une date ISO en format français
 */
function formatDateFr(dateISO: string): string {
  const date = new Date(dateISO)
  return date.toLocaleDateString('fr-FR')
}

/**
 * Obtenir le label d'une catégorie
 */
function getCategorieLabel(categorie: string): string {
  const categories: Record<string, string> = {
    'carburant': 'Carburant',
    'peage': 'Péage',
    'parking': 'Parking',
    'repas': 'Repas',
    'hebergement': 'Hébergement',
    'fournitures': 'Fournitures',
    'materiel': 'Matériel',
    'autre': 'Autre'
  }
  return categories[categorie] || categorie
}

/**
 * Obtenir le label d'un statut
 */
function getStatutLabel(statut: string): string {
  const statuts: Record<string, string> = {
    'brouillon': 'Brouillon',
    'soumise': 'Soumise',
    'validee': 'Validée',
    'refusee': 'Refusée',
    'remboursee': 'Remboursée'
  }
  return statuts[statut] || statut
}

/**
 * Exporter statistiques par opérateur en Excel
 */
export function exporterStatistiquesOperateurs(notes: NoteDeFrais[]): void {
  // Grouper par opérateur
  const statsParOperateur = new Map<string, {
    nbNotes: number
    totalHT: number
    totalTVA: number
    totalTTC: number
    moyenne: number
  }>()

  notes.forEach(note => {
    const current = statsParOperateur.get(note.operateurNom) || {
      nbNotes: 0,
      totalHT: 0,
      totalTVA: 0,
      totalTTC: 0,
      moyenne: 0
    }

    current.nbNotes++
    current.totalHT += note.montantHT
    current.totalTVA += note.montantTVA
    current.totalTTC += note.montantTTC

    statsParOperateur.set(note.operateurNom, current)
  })

  // Calculer moyennes et préparer données
  const donnees = Array.from(statsParOperateur.entries()).map(([operateur, stats]) => ({
    'Opérateur': operateur,
    'Nombre de notes': stats.nbNotes,
    'Total HT': stats.totalHT.toFixed(2),
    'Total TVA': stats.totalTVA.toFixed(2),
    'Total TTC': stats.totalTTC.toFixed(2),
    'Moyenne TTC': (stats.totalTTC / stats.nbNotes).toFixed(2)
  }))

  // Trier par total décroissant
  donnees.sort((a, b) => parseFloat(b['Total TTC']) - parseFloat(a['Total TTC']))

  // Ajouter totaux
  const totalNotes = Array.from(statsParOperateur.values()).reduce((sum, s) => sum + s.nbNotes, 0)
  const totalHT = Array.from(statsParOperateur.values()).reduce((sum, s) => sum + s.totalHT, 0)
  const totalTVA = Array.from(statsParOperateur.values()).reduce((sum, s) => sum + s.totalTVA, 0)
  const totalTTC = Array.from(statsParOperateur.values()).reduce((sum, s) => sum + s.totalTTC, 0)

  donnees.push({
    'Opérateur': 'TOTAL',
    'Nombre de notes': totalNotes,
    'Total HT': totalHT.toFixed(2),
    'Total TVA': totalTVA.toFixed(2),
    'Total TTC': totalTTC.toFixed(2),
    'Moyenne TTC': (totalTTC / totalNotes).toFixed(2)
  })

  // Créer et télécharger
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(donnees)

  ws['!cols'] = [
    { wch: 20 }, // Opérateur
    { wch: 15 }, // Nombre
    { wch: 12 }, // Total HT
    { wch: 12 }, // Total TVA
    { wch: 12 }, // Total TTC
    { wch: 12 }  // Moyenne
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Stats Opérateurs')

  const dateStr = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `stats_operateurs_${dateStr}.xlsx`)
}

/**
 * Exporter statistiques par catégorie en Excel
 */
export function exporterStatistiquesCategories(notes: NoteDeFrais[]): void {
  // Grouper par catégorie
  const statsParCategorie = new Map<string, {
    nbNotes: number
    totalTTC: number
  }>()

  notes.forEach(note => {
    const categorie = getCategorieLabel(note.categorie)
    const current = statsParCategorie.get(categorie) || {
      nbNotes: 0,
      totalTTC: 0
    }

    current.nbNotes++
    current.totalTTC += note.montantTTC

    statsParCategorie.set(categorie, current)
  })

  // Calculer total pour les pourcentages
  const totalGeneral = Array.from(statsParCategorie.values()).reduce((sum, s) => sum + s.totalTTC, 0)

  // Préparer données
  const donnees = Array.from(statsParCategorie.entries()).map(([categorie, stats]) => ({
    'Catégorie': categorie,
    'Nombre de notes': stats.nbNotes,
    'Montant total': stats.totalTTC.toFixed(2),
    'Pourcentage': ((stats.totalTTC / totalGeneral) * 100).toFixed(1) + ' %'
  }))

  // Trier par montant décroissant
  donnees.sort((a, b) => parseFloat(b['Montant total']) - parseFloat(a['Montant total']))

  // Ajouter totaux
  const totalNotes = Array.from(statsParCategorie.values()).reduce((sum, s) => sum + s.nbNotes, 0)

  donnees.push({
    'Catégorie': 'TOTAL',
    'Nombre de notes': totalNotes,
    'Montant total': totalGeneral.toFixed(2),
    'Pourcentage': '100.0 %'
  })

  // Créer et télécharger
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(donnees)

  ws['!cols'] = [
    { wch: 20 }, // Catégorie
    { wch: 15 }, // Nombre
    { wch: 15 }, // Montant
    { wch: 15 }  // Pourcentage
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Stats Catégories')

  const dateStr = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `stats_categories_${dateStr}.xlsx`)
}
