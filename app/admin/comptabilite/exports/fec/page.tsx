'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  exportEcrituresFEC
} from '@/lib/firebase/ecritures-comptables'
import { 
  Download, 
  Calendar,
  ChevronLeft,
  FileText,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

export default function ExportFECPage() {
  const [loading, setLoading] = useState(false)
  const [exercice, setExercice] = useState<string>(() => {
    return new Date().getFullYear().toString()
  })
  const [dateDebut, setDateDebut] = useState<string>(`${exercice}-01-01`)
  const [dateFin, setDateFin] = useState<string>(`${exercice}-12-31`)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string>('')

  const societeId = 'solaire-nettoyage' // TODO: Dynamique selon multi-sociétés

  // Mettre à jour les dates quand l'exercice change
  function handleExerciceChange(year: string) {
    setExercice(year)
    setDateDebut(`${year}-01-01`)
    setDateFin(`${year}-12-31`)
  }

  async function genererFEC() {
    try {
      setLoading(true)
      setSuccess(false)
      setError('')
      
      // Générer le contenu FEC
      const contenuFEC = await exportEcrituresFEC(societeId, dateDebut, dateFin)
      
      // Créer un blob
      const blob = new Blob([contenuFEC], { type: 'text/plain;charset=utf-8' })
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Nom du fichier selon la norme DGFiP
      // Format : SIREN + FEC + Exercice + DateFin
      const siren = '123456789' // TODO: Récupérer depuis paramètres société
      const exerciceYear = dateDebut.split('-')[0]
      const dateFin_format = dateFin.replace(/-/g, '')
      const fileName = `${siren}FEC${exerciceYear}${dateFin_format}.txt`
      
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      setSuccess(true)
      
    } catch (err) {
      console.error('Erreur export FEC:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération du FEC')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/admin/comptabilite"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour Comptabilité
            </Link>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Download className="w-8 h-8 text-gray-600" />
              Export FEC
            </h1>
            <p className="text-gray-600 mt-2">
              Fichier des Écritures Comptables - Format légal DGFiP
            </p>
          </div>
        </div>

        {/* Info FEC */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                À propos du FEC
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Le Fichier des Écritures Comptables (FEC) est un fichier informatique obligatoire pour les contrôles fiscaux en France. 
                Il contient l'ensemble des écritures comptables de votre exercice.
              </p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Format : Fichier texte délimité par des pipes (|)</li>
                <li>Norme : Article A47 A-1 du Livre des procédures fiscales</li>
                <li>Obligatoire : Pour toutes les entreprises tenant une comptabilité informatisée</li>
                <li>Contrôles : À fournir sur demande de l'administration fiscale</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Formulaire export */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Paramètres d'export</h2>
          
          <div className="space-y-6">
            {/* Exercice */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Exercice Comptable
              </label>
              <select
                value={exercice}
                onChange={(e) => handleExerciceChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Sélectionnez l'année de l'exercice à exporter
              </p>
            </div>

            {/* Période personnalisée */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Informations sur le fichier généré */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Informations du fichier</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Période :</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(dateDebut).toLocaleDateString('fr-FR')} au {new Date(dateFin).toLocaleDateString('fr-FR')}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Format :</dt>
                  <dd className="font-medium text-gray-900">Fichier texte (.txt)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Encodage :</dt>
                  <dd className="font-medium text-gray-900">UTF-8</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Séparateur :</dt>
                  <dd className="font-medium text-gray-900">Pipe (|)</dd>
                </div>
              </dl>
            </div>

            {/* Bouton génération */}
            <button
              onClick={genererFEC}
              disabled={loading || !dateDebut || !dateFin}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Génération en cours...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Générer et Télécharger le FEC
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message succès */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">
                  ✓ Export FEC réussi
                </h3>
                <p className="text-sm text-green-800 mb-3">
                  Le fichier FEC a été généré et téléchargé avec succès.
                </p>
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-2">Prochaines étapes :</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Vérifiez que le fichier a bien été téléchargé</li>
                    <li>Contrôlez la cohérence des données (optionnel)</li>
                    <li>Conservez le fichier pour d'éventuels contrôles fiscaux</li>
                    <li>Le fichier peut être importé dans votre logiciel comptable</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">
                  Erreur lors de la génération
                </h3>
                <p className="text-sm text-red-800">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informations complémentaires */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Informations complémentaires</h2>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Structure du fichier FEC</h3>
              <p>
                Le fichier contient 18 colonnes obligatoires conformes à la norme DGFiP :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>JournalCode, JournalLib : Identification du journal</li>
                <li>EcritureNum, EcritureDate : Numéro et date de l'écriture</li>
                <li>CompteNum, CompteLib : Numéro et libellé du compte</li>
                <li>CompAuxNum, CompAuxLib : Compte auxiliaire (tiers)</li>
                <li>PieceRef, PieceDate : Référence et date de la pièce</li>
                <li>EcritureLib : Libellé de l'écriture</li>
                <li>Debit, Credit : Montants débit et crédit</li>
                <li>EcritureLet, DateLet : Informations de lettrage</li>
                <li>ValidDate : Date de validation</li>
                <li>Montantdevise, Idevise : Informations devise (optionnel)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Contrôles de conformité</h3>
              <p>Le fichier généré respecte automatiquement :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Format : Fichier texte avec séparateur pipe (|)</li>
                <li>Encodage : UTF-8</li>
                <li>Dates : Format AAAAMMJJ</li>
                <li>Montants : Format avec 2 décimales et virgule comme séparateur</li>
                <li>Équilibre : Total débit = Total crédit</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Conservation</h3>
              <p>
                Le fichier FEC doit être conservé pendant la durée légale de conservation des documents comptables (minimum 10 ans).
                Il doit pouvoir être fourni sur demande de l'administration fiscale lors d'un contrôle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
