'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  getTemplatesRelances,
  updateTemplate
} from '@/lib/firebase/relances'
import type { TemplateRelance, TypeRelance } from '@/lib/firebase/relances-types'
import { 
  ArrowLeft,
  Plus,
  Edit,
  Eye,
  Mail,
  BarChart,
  FileText,
  AlertTriangle,
  Gavel,
  Search,
  Filter
} from 'lucide-react'

export default function TemplatesRelancesPage() {
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<TemplateRelance[]>([])
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    try {
      setLoading(true)
      const data = await getTemplatesRelances()
      setTemplates(data)
    } catch (error) {
      console.error('Erreur chargement templates:', error)
      alert('❌ Erreur chargement des templates')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActif(templateId: string, actif: boolean) {
    try {
      await updateTemplate(templateId, { actif })
      await loadTemplates()
    } catch (error) {
      console.error('Erreur toggle actif:', error)
      alert('❌ Erreur lors de la modification')
    }
  }

  const templatesFiltres = templates.filter(template => {
    if (typeFilter !== 'all' && template.type !== typeFilter) return false
    if (searchTerm && !template.nom.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const typeLabels: Record<string, { label: string, icon: any, color: string }> = {
    rappel_amiable: { 
      label: 'Rappel Amiable', 
      icon: Mail, 
      color: 'blue' 
    },
    relance_ferme: { 
      label: 'Relance Ferme', 
      icon: AlertTriangle, 
      color: 'orange' 
    },
    mise_en_demeure: { 
      label: 'Mise en Demeure', 
      icon: FileText, 
      color: 'red' 
    },
    contentieux: { 
      label: 'Contentieux', 
      icon: Gavel, 
      color: 'purple' 
    }
  }

  const statsParType = templates.reduce((acc, template) => {
    acc[template.type] = (acc[template.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/admin/finances/relances"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Templates de Relances</h1>
            <p className="text-gray-600 mt-2">
              {templates.length} template{templates.length > 1 ? 's' : ''} • {templates.filter(t => t.actif).length} actif{templates.filter(t => t.actif).length > 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/admin/finances/relances/templates/nouveau"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            Nouveau Template
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(typeLabels).map(([type, info]) => {
          const Icon = info.icon
          const count = statsParType[type] || 0
          
          return (
            <div key={type} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-${info.color}-100`}>
                  <Icon className={`w-5 h-5 text-${info.color}-600`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{info.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 items-center flex-wrap">
          {/* Recherche */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Filtre type */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tous les types</option>
              <option value="rappel_amiable">Rappel Amiable</option>
              <option value="relance_ferme">Relance Ferme</option>
              <option value="mise_en_demeure">Mise en Demeure</option>
              <option value="contentieux">Contentieux</option>
            </select>
          </div>

          {/* Reset */}
          {(typeFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setTypeFilter('all')
                setSearchTerm('')
              }}
              className="text-sm text-indigo-600 hover:underline"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Liste templates */}
      {templatesFiltres.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun template trouvé</p>
          {(typeFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setTypeFilter('all')
                setSearchTerm('')
              }}
              className="mt-4 text-indigo-600 hover:underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {templatesFiltres.map((template) => {
            const typeInfo = typeLabels[template.type]
            const Icon = typeInfo.icon
            
            return (
              <div
                key={template.id}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
                  !template.actif ? 'opacity-60' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-lg bg-${typeInfo.color}-100 flex-shrink-0`}>
                      <Icon className={`w-6 h-6 text-${typeInfo.color}-600`} />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{template.nom}</h3>
                          {template.description && (
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Statut */}
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            template.actif
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {template.actif ? 'Actif' : 'Inactif'}
                          </span>

                          {/* Type badge */}
                          <span className={`px-3 py-1 text-xs font-medium rounded-full bg-${typeInfo.color}-100 text-${typeInfo.color}-700`}>
                            {typeInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Détails */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-600">Objet</p>
                          <p className="text-sm font-medium text-gray-900 truncate" title={template.objet}>
                            {template.objet}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Langue</p>
                          <p className="text-sm font-medium text-gray-900">
                            {template.langue === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Priorité</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {template.priorite}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Envois</p>
                          <p className="text-sm font-medium text-gray-900">
                            {template.nombreEnvois || 0}
                          </p>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                        {template.inclureFacturePDF && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            📎 Facture PDF
                          </span>
                        )}
                        {template.inclureCopieEmail && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded">
                            📧 Copie email
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Link
                        href={`/admin/finances/relances/templates/${template.id}/preview`}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                        title="Prévisualiser"
                      >
                        <Eye className="w-4 h-4" />
                        Prévisualiser
                      </Link>
                      
                      <Link
                        href={`/admin/finances/relances/templates/${template.id}`}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </Link>
                      
                      <button
                        onClick={() => handleToggleActif(template.id, !template.actif)}
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
                          template.actif
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        title={template.actif ? 'Désactiver' : 'Activer'}
                      >
                        {template.actif ? 'Désactiver' : 'Activer'}
                      </button>

                      {template.nombreEnvois > 0 && (
                        <Link
                          href={`/admin/finances/relances/templates/${template.id}/stats`}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                          title="Statistiques"
                        >
                          <BarChart className="w-4 h-4" />
                          Stats
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info templates par défaut */}
      {templates.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Initialiser les templates par défaut
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Le système peut créer automatiquement 4 templates professionnels pour vous :
              </p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside mb-4">
                <li>Rappel Amiable (J+15)</li>
                <li>Relance Ferme (J+30)</li>
                <li>Mise en Demeure (J+45)</li>
                <li>Contentieux (J+60)</li>
              </ul>
              <button
                onClick={async () => {
                  try {
                    // TODO: Appeler initialiserTemplatesDefaut()
                    alert('Fonction à implémenter : initialiserTemplatesDefaut()')
                    await loadTemplates()
                  } catch (error) {
                    alert('❌ Erreur lors de l\'initialisation')
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Initialiser les templates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
