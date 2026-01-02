'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, Check, AlertCircle } from 'lucide-react'
import {
  getAllComptesBancaires,
  importLignesBancaires,
  categoriserLigneAuto,
  type CompteBancaire,
  type LigneBancaire
} from '@/lib/firebase/lignes-bancaires'

interface LigneCSV {
  date: string
  dateValeur: string
  libelle: string
  montant: number
  reference?: string
}

interface MappingColonnes {
  date: number | null
  dateValeur: number | null
  libelle: number | null
  montant: number | null
  reference: number | null
}

export default function ImportCSVPage() {
  const router = useRouter()
  
  // Étapes du workflow
  const [etape, setEtape] = useState<1 | 2 | 3 | 4>(1)
  
  // Données CSV
  const [fichier, setFichier] = useState<File | null>(null)
  const [lignesCSV, setLignesCSV] = useState<string[][]>([])
  const [mapping, setMapping] = useState<MappingColonnes>({
    date: null,
    dateValeur: null,
    libelle: null,
    montant: null,
    reference: null
  })
  const [lignesParsees, setLignesParsees] = useState<LigneCSV[]>([])
  
  // Compte bancaire
  const [comptes, setComptes] = useState<CompteBancaire[]>([])
  const [compteSelectionne, setCompteSelectionne] = useState<string>('')
  
  // Import
  const [importing, setImporting] = useState(false)
  const [importReussi, setImportReussi] = useState(false)
  const [nombreImporte, setNombreImporte] = useState(0)
  const [erreur, setErreur] = useState<string>('')

  // Charger les comptes au montage
  useEffect(() => {
    chargerComptes()
  }, [])

  const chargerComptes = async () => {
    try {
      const comptesData = await getAllComptesBancaires()
      setComptes(comptesData.filter(c => c.actif))
      if (comptesData.length === 1) {
        setCompteSelectionne(comptesData[0].id)
      }
    } catch (error) {
      console.error('Erreur chargement comptes:', error)
    }
  }

  // Étape 1 : Upload fichier
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFichier(file)
    setErreur('')

    // Vérifier si c'est un PDF ou CSV
    const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf')

    if (isPDF) {
      // Traitement PDF
      await traiterPDF(file)
    } else {
      // Traitement CSV classique
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        const lignes = text.split('\n').map(ligne => 
          ligne.split(/[;,\t]/).map(cell => cell.trim())
        ).filter(ligne => ligne.some(cell => cell.length > 0))

        setLignesCSV(lignes)
        
        // Détection automatique des colonnes
        if (lignes.length > 0) {
          detecterColonnes(lignes[0])
        }
        
        setEtape(2)
      }
      reader.readAsText(file)
    }
  }

  // Traiter PDF relevé bancaire
  const traiterPDF = async (file: File) => {
    try {
      // Appeler l'API pour parser le PDF
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setErreur(data.error || 'Erreur lors de la lecture du PDF')
        return
      }
      
      const transactionsParsees = data.transactions
      
      if (!transactionsParsees || transactionsParsees.length === 0) {
        setErreur('Aucune transaction trouvée dans le PDF. Vérifiez le format du relevé.')
        return
      }
      
      // Convertir en lignes parsées
      setLignesParsees(transactionsParsees)
      setEtape(3) // Passer directement à l'étape 3 (prévisualisation)
      
    } catch (error) {
      console.error('Erreur parsing PDF:', error)
      setErreur('Erreur lors de la lecture du PDF. Veuillez réessayer.')
    }
  }

  // Détection automatique des colonnes
  const detecterColonnes = (enTetes: string[]) => {
    const mappingAuto: MappingColonnes = {
      date: null,
      dateValeur: null,
      libelle: null,
      montant: null,
      reference: null
    }

    enTetes.forEach((enTete, index) => {
      const lower = enTete.toLowerCase()
      
      if (lower.includes('date') && !lower.includes('valeur')) {
        mappingAuto.date = index
      } else if (lower.includes('date') && lower.includes('valeur')) {
        mappingAuto.dateValeur = index
      } else if (lower.includes('libelle') || lower.includes('libellé') || lower.includes('description')) {
        mappingAuto.libelle = index
      } else if (lower.includes('montant') || lower.includes('debit') || lower.includes('crédit')) {
        mappingAuto.montant = index
      } else if (lower.includes('ref') || lower.includes('référence')) {
        mappingAuto.reference = index
      }
    })

    setMapping(mappingAuto)
  }

  // Étape 2 : Valider mapping
  const validerMapping = () => {
    if (mapping.date === null || mapping.libelle === null || mapping.montant === null) {
      setErreur('Les colonnes Date, Libellé et Montant sont obligatoires')
      return
    }

    // Parser les lignes
    const parsed: LigneCSV[] = []
    
    for (let i = 1; i < lignesCSV.length; i++) {
      const ligne = lignesCSV[i]
      
      try {
        const date = ligne[mapping.date!] || ''
        const dateValeur = mapping.dateValeur !== null ? ligne[mapping.dateValeur] : date
        const libelle = ligne[mapping.libelle!] || ''
        const montantStr = ligne[mapping.montant!] || '0'
        const reference = mapping.reference !== null ? ligne[mapping.reference] : undefined
        
        // Parser le montant (gérer les formats français)
        const montant = parseFloat(
          montantStr
            .replace(/\s/g, '')
            .replace(',', '.')
            .replace(/[^\d.-]/g, '')
        )
        
        if (!isNaN(montant) && date && libelle) {
          parsed.push({
            date: formatDateISO(date),
            dateValeur: formatDateISO(dateValeur),
            libelle,
            montant,
            reference
          })
        }
      } catch (error) {
        console.error('Erreur parsing ligne', i, error)
      }
    }

    setLignesParsees(parsed)
    setEtape(3)
  }

  // Formater date en ISO
  const formatDateISO = (dateStr: string): string => {
    // Essayer format DD/MM/YYYY
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const [jour, mois, annee] = parts
      return `${annee}-${mois.padStart(2, '0')}-${jour.padStart(2, '0')}`
    }
    
    // Essayer format YYYY-MM-DD
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr
    }
    
    // Par défaut, retourner la date d'aujourd'hui
    return new Date().toISOString().split('T')[0]
  }

  // Étape 3 : Importer
  const lancerImport = async () => {
    if (!compteSelectionne) {
      setErreur('Veuillez sélectionner un compte bancaire')
      return
    }

    try {
      setImporting(true)
      setErreur('')

      // Préparer les lignes avec catégorisation auto
      const lignesAImporter = lignesParsees.map(ligne => {
        const { categorie, type } = categoriserLigneAuto({
          ...ligne,
          id: '',
          compteBancaireId: compteSelectionne,
          statut: 'a_rapprocher',
          createdAt: '',
          updatedAt: ''
        })

        return {
          date: ligne.date,
          dateValeur: ligne.dateValeur,
          libelle: ligne.libelle,
          montant: ligne.montant,
          reference: ligne.reference,
          categorieAuto: categorie,
          typeTransaction: type,
          statut: 'a_rapprocher' as const
        }
      })

      const nombre = await importLignesBancaires(compteSelectionne, lignesAImporter)
      
      setNombreImporte(nombre)
      setImportReussi(true)
      setEtape(4)
    } catch (error) {
      console.error('Erreur import:', error)
      setErreur('Erreur lors de l\'import. Veuillez réessayer.')
    } finally {
      setImporting(false)
    }
  }

  // Formater montant
  const formatterMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    })
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/tresorerie"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold">Importer un relevé bancaire</h1>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[
            { num: 1, label: 'Upload PDF/CSV' },
            { num: 2, label: 'Mapping colonnes' },
            { num: 3, label: 'Prévisualisation' },
            { num: 4, label: 'Import' }
          ].map((step, index) => (
            <div key={step.num} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                etape >= step.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {etape > step.num ? <Check className="w-5 h-5" /> : step.num}
              </div>
              <span className={`ml-3 font-medium ${etape >= step.num ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.label}
              </span>
              {index < 3 && (
                <div className={`flex-1 h-1 mx-4 ${etape > step.num ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Erreur */}
      {erreur && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{erreur}</p>
        </div>
      )}

      {/* Contenu selon étape */}
      <div className="max-w-5xl mx-auto">
        {/* ÉTAPE 1 : Upload */}
        {etape === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <Upload className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Sélectionnez votre relevé bancaire</h2>
              <p className="text-gray-600 mb-6">
                Formats acceptés : PDF (relevé bancaire) ou CSV
              </p>

              <input
                type="file"
                accept=".csv,.txt,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer"
              >
                <FileText className="w-5 h-5" />
                Choisir un fichier
              </label>

              {fichier && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">{fichier.name}</p>
                  <p className="text-green-600 text-sm">
                    {fichier.type === 'application/pdf' ? 'PDF relevé bancaire' : `CSV - ${lignesCSV.length} lignes détectées`}
                  </p>
                </div>
              )}
            </div>

            {/* Exemple format */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Formats acceptés :</h3>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">📄 PDF - Relevé bancaire</p>
                <p className="text-xs text-gray-600">
                  Relevés LCL, BNP Paribas, Société Générale, etc. (extraction automatique)
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">📊 CSV - Format manuel</p>
                <pre className="text-xs text-gray-700 overflow-x-auto">
{`Date;Libellé;Montant;Référence
01/01/2026;Virement client ABC;1250.50;VIR-123
02/01/2026;Prélèvement URSSAF;-850.00;PREL-456`}
              </pre>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : Mapping */}
        {etape === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Associer les colonnes</h2>

            <div className="space-y-4 mb-6">
              {Object.keys(mapping).map((cle) => {
                const required = ['date', 'libelle', 'montant'].includes(cle)
                return (
                  <div key={cle}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {cle.charAt(0).toUpperCase() + cle.slice(1).replace(/([A-Z])/g, ' $1')}
                      {required && <span className="text-red-600 ml-1">*</span>}
                    </label>
                    <select
                      value={mapping[cle as keyof MappingColonnes] ?? ''}
                      onChange={(e) => setMapping({
                        ...mapping,
                        [cle]: e.target.value === '' ? null : parseInt(e.target.value)
                      })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                      <option value="">-- Non mappé --</option>
                      {lignesCSV[0]?.map((enTete, index) => (
                        <option key={index} value={index}>
                          Colonne {index + 1} : {enTete}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>

            {/* Prévisualisation première ligne */}
            {lignesCSV.length > 1 && (
              <div className="p-4 bg-gray-50 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Prévisualisation (1ère ligne) :</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Date :</span> {mapping.date !== null ? lignesCSV[1][mapping.date] : '-'}</p>
                  <p><span className="font-medium">Libellé :</span> {mapping.libelle !== null ? lignesCSV[1][mapping.libelle] : '-'}</p>
                  <p><span className="font-medium">Montant :</span> {mapping.montant !== null ? lignesCSV[1][mapping.montant] : '-'}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setEtape(1)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Retour
              </button>
              <button
                onClick={validerMapping}
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : Prévisualisation */}
        {etape === 3 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Prévisualisation et sélection du compte</h2>

            {/* Sélection compte */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compte bancaire <span className="text-red-600">*</span>
              </label>
              <select
                value={compteSelectionne}
                onChange={(e) => setCompteSelectionne(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">-- Sélectionner un compte --</option>
                {comptes.map((compte) => (
                  <option key={compte.id} value={compte.id}>
                    {compte.nom} - {compte.banque} ({compte.numeroCompte})
                  </option>
                ))}
              </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Lignes à importer</div>
                <div className="text-2xl font-bold text-blue-600">{lignesParsees.length}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Crédits</div>
                <div className="text-2xl font-bold text-green-600">
                  {lignesParsees.filter(l => l.montant > 0).length}
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-gray-600">Débits</div>
                <div className="text-2xl font-bold text-red-600">
                  {lignesParsees.filter(l => l.montant < 0).length}
                </div>
              </div>
            </div>

            {/* Tableau prévisualisation */}
            <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lignesParsees.slice(0, 10).map((ligne, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{ligne.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{ligne.libelle}</td>
                        <td className={`px-4 py-3 text-sm text-right font-medium whitespace-nowrap ${
                          ligne.montant >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatterMontant(ligne.montant)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {lignesParsees.length > 10 && (
                <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 text-center">
                  ... et {lignesParsees.length - 10} autres lignes
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEtape(2)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Retour
              </button>
              <button
                onClick={lancerImport}
                disabled={importing || !compteSelectionne}
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {importing ? 'Import en cours...' : `Importer ${lignesParsees.length} lignes`}
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 4 : Succès */}
        {etape === 4 && importReussi && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Import réussi !</h2>
            <p className="text-gray-600 mb-6">
              {nombreImporte} transactions ont été importées avec succès
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/admin/tresorerie')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Retour au dashboard
              </button>
              <button
                onClick={() => router.push('/admin/tresorerie/rapprochement')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Rapprocher les transactions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
