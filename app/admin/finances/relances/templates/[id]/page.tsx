'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  getTemplatesRelances,
  updateTemplate
} from '@/lib/firebase/relances'
import type { TemplateRelance } from '@/lib/firebase/relances-types'
import { 
  ArrowLeft,
  Save,
  Eye,
  Code,
  Type,
  Mail,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function EditTemplateRelancePage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [template, setTemplate] = useState<TemplateRelance | null>(null)
  const [modePreview, setModePreview] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadTemplate()
  }, [templateId])

  async function loadTemplate() {
    try {
      setLoading(true)
      const templates = await getTemplatesRelances()
      const found = templates.find(t => t.id === templateId)
      
      if (found) {
        setTemplate(found)
      } else {
        setMessage({ type: 'error', text: 'Template non trouvé' })
      }
    } catch (error) {
      console.error('Erreur chargement template:', error)
      setMessage({ type: 'error', text: 'Erreur chargement du template' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!template) return

    try {
      setSaving(true)
      await updateTemplate(template.id, {
        nom: template.nom,
        description: template.description,
        objet: template.objet,
        contenuHTML: template.contenuHTML,
        contenuTexte: template.contenuTexte,
        inclureFacturePDF: template.inclureFacturePDF,
        inclureCopieEmail: template.inclureCopieEmail,
        langue: template.langue,
        priorite: template.priorite
      })
      
      setMessage({ type: 'success', text: '✅ Template enregistré avec succès' })
      
      // Recharger
      await loadTemplate()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      setMessage({ type: 'error', text: '❌ Erreur lors de la sauvegarde' })
    } finally {
      setSaving(false)
    }
  }

  function updateTemplateField(field: keyof TemplateRelance, value: any) {
    if (!template) return
    setTemplate({ ...template, [field]: value })
  }

  const variablesDisponibles = [
    { var: '{{clientNom}}', desc: 'Nom du client' },
    { var: '{{clientEmail}}', desc: 'Email du client' },
    { var: '{{factureNumero}}', desc: 'Numéro de facture' },
    { var: '{{factureDate}}', desc: 'Date émission' },
    { var: '{{factureDateEcheance}}', desc: 'Date échéance' },
    { var: '{{factureMontant}}', desc: 'Montant TTC' },
    { var: '{{factureResteAPayer}}', desc: 'Reste à payer' },
    { var: '{{joursRetard}}', desc: 'Jours de retard' },
    { var: '{{entrepriseNom}}', desc: 'Nom entreprise' },
    { var: '{{entrepriseEmail}}', desc: 'Email entreprise' },
    { var: '{{entrepriseTelephone}}', desc: 'Téléphone' },
    { var: '{{dateRelance}}', desc: 'Date de la relance' }
  ]

  function insertVariable(variable: string) {
    if (!template) return
    
    // Insérer dans le HTML à la position du curseur
    // Pour simplifier, on ajoute à la fin
    const newHTML = template.contenuHTML + ' ' + variable
    updateTemplateField('contenuHTML', newHTML)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Template non trouvé</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/admin/finances/relances/templates"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Templates
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{template.nom}</h1>
            <p className="text-gray-600 mt-2">
              Édition du template - {template.type.replace('_', ' ')}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setModePreview(!modePreview)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {modePreview ? <Code className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              {modePreview ? 'Mode Code' : 'Prévisualiser'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale : Éditeur */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du template
                </label>
                <input
                  type="text"
                  value={template.nom}
                  onChange={(e) => updateTemplateField('nom', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={template.description || ''}
                  onChange={(e) => updateTemplateField('description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Description courte..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Objet de l'email
                </label>
                <input
                  type="text"
                  value={template.objet}
                  onChange={(e) => updateTemplateField('objet', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Utilisez les variables {{...}}"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Exemple : Rappel - Facture {`{{factureNumero}}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Langue
                  </label>
                  <select
                    value={template.langue}
                    onChange={(e) => updateTemplateField('langue', e.target.value as 'fr' | 'en')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="fr">🇫🇷 Français</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={template.priorite}
                    onChange={(e) => updateTemplateField('priorite', e.target.value as 'normale' | 'haute')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="normale">Normale</option>
                    <option value="haute">Haute</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Inclure facture PDF</p>
                    <p className="text-xs text-gray-600">Joindre la facture en pièce jointe</p>
                  </div>
                  <button
                    onClick={() => updateTemplateField('inclureFacturePDF', !template.inclureFacturePDF)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      template.inclureFacturePDF ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      template.inclureFacturePDF ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Envoyer copie</p>
                    <p className="text-xs text-gray-600">Copie au responsable comptabilité</p>
                  </div>
                  <button
                    onClick={() => updateTemplateField('inclureCopieEmail', !template.inclureCopieEmail)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      template.inclureCopieEmail ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      template.inclureCopieEmail ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Template actif</p>
                    <p className="text-xs text-gray-600">Utilisé par le système</p>
                  </div>
                  <button
                    onClick={() => updateTemplateField('actif', !template.actif)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      template.actif ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      template.actif ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Éditeur HTML */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Code className="w-6 h-6 text-indigo-600" />
              Contenu Email
            </h2>

            {modePreview ? (
              /* Prévisualisation */
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-600 mb-4">Prévisualisation :</p>
                <div 
                  className="bg-white p-6 rounded shadow"
                  dangerouslySetInnerHTML={{ __html: template.contenuHTML }}
                />
              </div>
            ) : (
              /* Éditeur code */
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">HTML</label>
                  <span className="text-xs text-gray-500">
                    {template.contenuHTML.length} caractères
                  </span>
                </div>
                <textarea
                  value={template.contenuHTML}
                  onChange={(e) => updateTemplateField('contenuHTML', e.target.value)}
                  className="w-full h-96 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  placeholder="Code HTML de l'email..."
                  spellCheck={false}
                />

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version texte (fallback)
                  </label>
                  <textarea
                    value={template.contenuTexte}
                    onChange={(e) => updateTemplateField('contenuTexte', e.target.value)}
                    className="w-full h-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Version texte brut de l'email..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale : Variables */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Type className="w-5 h-5 text-indigo-600" />
              Variables Disponibles
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {variablesDisponibles.map((v) => (
                <button
                  key={v.var}
                  onClick={() => insertVariable(v.var)}
                  className="w-full text-left p-2 hover:bg-indigo-50 rounded transition-colors"
                >
                  <code className="text-sm font-mono text-indigo-600">{v.var}</code>
                  <p className="text-xs text-gray-600 mt-0.5">{v.desc}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                💡 Cliquez sur une variable pour l'insérer dans le template
              </p>
            </div>
          </div>

          {/* Stats template */}
          {template.nombreEnvois > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Statistiques</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Envois totaux</p>
                  <p className="text-2xl font-bold text-gray-900">{template.nombreEnvois}</p>
                </div>
                {template.tauxOuverture && (
                  <div>
                    <p className="text-sm text-gray-600">Taux d'ouverture</p>
                    <p className="text-2xl font-bold text-green-600">
                      {template.tauxOuverture.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
