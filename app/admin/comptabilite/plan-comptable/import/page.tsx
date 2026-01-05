'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { importPlanComptable } from '@/lib/firebase/plan-comptable'
import { ArrowLeft, Upload, FileJson, FileSpreadsheet, AlertCircle } from 'lucide-react'

export default function ImportPlanComptablePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const societeId = 'solaire-nettoyage'

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(null)

    if (!file.name.endsWith('.json')) {
      setError('Le fichier doit être au format JSON')
      return
    }

    try {
      setLoading(true)
      
      const text = await file.text()
      const data = JSON.parse(text)
      
      // Valider structure
      if (!data.comptes || !Array.isArray(data.comptes)) {
        throw new Error('Format de fichier invalide. Le fichier doit contenir un tableau "comptes".')
      }

      await importPlanComptable(societeId, data)
      
      setSuccess(`✅ Import réussi ! ${data.comptes.length} compte(s) importé(s).`)
      
      setTimeout(() => {
        router.push('/admin/comptabilite/plan-comptable')
      }, 2000)
      
    } catch (err: any) {
      console.error('Erreur import:', err)
      setError('❌ Erreur lors de l\'import : ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const exampleData = {
    societe: "Solaire Nettoyage",
    dateExport: "2026-01-04T15:00:00.000Z",
    comptes: [
      {
        numero: "6068",
        intitule: "Autres matières et fournitures",
        type: "charge",
        classe: "6",
        sousClasse: "60",
        actif: true,
        tvaDeductible: true
      },
      {
        numero: "7088",
        intitule: "Autres produits d'activités annexes",
        type: "produit",
        classe: "7",
        sousClasse: "70",
        actif: true,
        tvaCollectee: true
      }
    ]
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Importer un Plan Comptable</h1>
          <p className="text-gray-600 mt-2">
            Importer des comptes depuis un fichier JSON
          </p>
        </div>
        <Link
          href="/admin/comptabilite/plan-comptable"
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
      </div>

      {/* Zone d'upload */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Téléverser un fichier JSON
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Le fichier doit contenir un tableau de comptes au format JSON
          </p>

          <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
            <FileJson className="w-5 h-5" />
            Sélectionner un fichier
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              disabled={loading}
              className="hidden"
            />
          </label>

          {loading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Import en cours...</span>
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-700">{success}</div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">
          Format du fichier JSON
        </h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-blue-800 mb-2">
              Le fichier JSON doit avoir la structure suivante :
            </p>
            <pre className="bg-white p-4 rounded border border-blue-200 overflow-x-auto text-xs">
{JSON.stringify(exampleData, null, 2)}
            </pre>
          </div>

          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Champs obligatoires par compte :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><code className="bg-white px-1 rounded">numero</code> - Numéro du compte (ex: "6061")</li>
              <li><code className="bg-white px-1 rounded">intitule</code> - Intitulé du compte</li>
              <li><code className="bg-white px-1 rounded">type</code> - "charge", "produit" ou "bilan"</li>
              <li><code className="bg-white px-1 rounded">classe</code> - Classe comptable ("6", "7", etc.)</li>
              <li><code className="bg-white px-1 rounded">actif</code> - true ou false</li>
            </ul>
          </div>

          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Champs optionnels :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><code className="bg-white px-1 rounded">sousClasse</code> - Sous-classe (ex: "60", "61")</li>
              <li><code className="bg-white px-1 rounded">tvaDeductible</code> - true ou false</li>
              <li><code className="bg-white px-1 rounded">tvaCollectee</code> - true ou false</li>
              <li><code className="bg-white px-1 rounded">description</code> - Description du compte</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
            <strong>Note :</strong> Les comptes avec des numéros existants ne seront pas importés (pas de doublon).
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <Link
          href="/admin/comptabilite/plan-comptable"
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-center"
        >
          Annuler
        </Link>
      </div>
    </div>
  )
}
