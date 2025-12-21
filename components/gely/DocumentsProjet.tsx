'use client'

import { useState } from 'react'
import { Upload, FileText, Download, Trash2, X, Image as ImageIcon, File } from 'lucide-react'

interface DocumentProjet {
  id: string
  nom: string
  type: 'devis' | 'facture' | 'contrat' | 'photo' | 'permis' | 'autre'
  fichier: string
  taille: string
  date: string
  uploadedBy: string
}

interface DocumentsProjetProps {
  projetId: string
  projetNom: string
}

const TYPES_DOCS = [
  { value: 'devis', label: 'Devis', icon: '📋' },
  { value: 'facture', label: 'Facture', icon: '💰' },
  { value: 'contrat', label: 'Contrat', icon: '📝' },
  { value: 'photo', label: 'Photo chantier', icon: '📷' },
  { value: 'permis', label: 'Permis/Admin', icon: '🏛️' },
  { value: 'autre', label: 'Autre', icon: '📄' }
]

// Données mockées par projet
const DOCS_MOCK: Record<string, DocumentProjet[]> = {
  'proj_1': [
    { id: 'doc_1', nom: 'Facture MECOJIT 6442', type: 'facture', fichier: 'facture_mecojit_6442.pdf', taille: '245 Ko', date: '2021-12-08', uploadedBy: 'Axel GELY' },
    { id: 'doc_2', nom: 'Devis installation', type: 'devis', fichier: 'devis_500kwc.pdf', taille: '1.2 Mo', date: '2021-10-15', uploadedBy: 'Axel GELY' },
    { id: 'doc_3', nom: 'Photo chantier - Début', type: 'photo', fichier: 'photo_debut.jpg', taille: '3.5 Mo', date: '2025-01-10', uploadedBy: 'Technicien' }
  ],
  'proj_3': [
    { id: 'doc_4', nom: 'Permis de construire', type: 'permis', fichier: 'permis_construire.pdf', taille: '890 Ko', date: '2020-01-20', uploadedBy: 'Jerome GELY' }
  ]
}

export default function DocumentsProjet({ projetId, projetNom }: DocumentsProjetProps) {
  const [documents, setDocuments] = useState<DocumentProjet[]>(DOCS_MOCK[projetId] || [])
  const [showUpload, setShowUpload] = useState(false)
  const [filtreType, setFiltreType] = useState<string>('all')
  
  // Upload form
  const [uploadForm, setUploadForm] = useState({
    nom: '',
    type: 'devis' as DocumentProjet['type']
  })

  const documentsFiltres = filtreType === 'all' 
    ? documents 
    : documents.filter(d => d.type === filtreType)

  const handleUpload = () => {
    if (!uploadForm.nom.trim()) {
      alert('Le nom du document est obligatoire')
      return
    }

    const newDoc: DocumentProjet = {
      id: `doc_${Date.now()}`,
      nom: uploadForm.nom,
      type: uploadForm.type,
      fichier: `${uploadForm.nom.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      taille: '1.2 Mo',
      date: new Date().toISOString().split('T')[0],
      uploadedBy: 'Jérôme GELY'
    }

    setDocuments([...documents, newDoc])
    setUploadForm({ nom: '', type: 'devis' })
    setShowUpload(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce document ?')) {
      setDocuments(documents.filter(d => d.id !== id))
    }
  }

  const getTypeIcon = (type: string) => {
    return TYPES_DOCS.find(t => t.value === type)?.icon || '📄'
  }

  const getTypeLabel = (type: string) => {
    return TYPES_DOCS.find(t => t.value === type)?.label || 'Autre'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-black">Documents du projet</h3>
          <p className="text-black font-semibold">{projetNom}</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center space-x-2 border-4 border-black"
        >
          <Upload className="w-5 h-5" />
          <span>AJOUTER DOCUMENT</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white border-4 border-black rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltreType('all')}
            className={`px-4 py-2 rounded-lg font-bold border-2 border-black ${
              filtreType === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-black'
            }`}
          >
            📂 Tous ({documents.length})
          </button>
          {TYPES_DOCS.map(type => {
            const count = documents.filter(d => d.type === type.value).length
            return (
              <button
                key={type.value}
                onClick={() => setFiltreType(type.value)}
                className={`px-4 py-2 rounded-lg font-bold border-2 border-black ${
                  filtreType === type.value ? 'bg-blue-600 text-white' : 'bg-white text-black'
                }`}
              >
                {type.icon} {type.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Liste documents */}
      {documentsFiltres.length === 0 ? (
        <div className="bg-white border-4 border-black rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-black mx-auto mb-4" />
          <p className="text-2xl font-bold text-black">Aucun document</p>
          <p className="text-lg text-black mt-2">Cliquez sur "AJOUTER DOCUMENT" pour commencer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentsFiltres.map(doc => (
            <div key={doc.id} className="bg-white border-4 border-black rounded-lg p-4 hover:bg-blue-50 transition">
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{getTypeIcon(doc.type)}</div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => alert('Télécharger : ' + doc.fichier)}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 border-2 border-black"
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 border-2 border-black"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h4 className="text-lg font-bold text-black mb-2">{doc.nom}</h4>
              
              <div className="space-y-1 text-sm">
                <p className="text-black font-semibold">
                  <span className="font-bold">Type:</span> {getTypeLabel(doc.type)}
                </p>
                <p className="text-black font-semibold">
                  <span className="font-bold">Taille:</span> {doc.taille}
                </p>
                <p className="text-black font-semibold">
                  <span className="font-bold">Date:</span> {new Date(doc.date).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-black font-semibold">
                  <span className="font-bold">Par:</span> {doc.uploadedBy}
                </p>
              </div>
              
              <div className="mt-3 pt-3 border-t-2 border-black">
                <p className="text-xs font-bold text-black truncate">{doc.fichier}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Upload */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full border-4 border-black">
            <div className="bg-blue-600 text-white p-6 flex justify-between items-center rounded-t-xl">
              <h3 className="text-2xl font-bold">AJOUTER UN DOCUMENT</h3>
              <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-blue-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xl font-bold text-black mb-2">Nom du document *</label>
                <input
                  type="text"
                  value={uploadForm.nom}
                  onChange={(e) => setUploadForm({ ...uploadForm, nom: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-black font-bold text-lg border-4 border-black rounded-lg focus:border-blue-600 focus:outline-none"
                  placeholder="Ex: Facture MECOJIT"
                />
              </div>

              <div>
                <label className="block text-xl font-bold text-black mb-2">Type de document *</label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as DocumentProjet['type'] })}
                  className="w-full px-4 py-3 bg-white text-black font-bold text-lg border-4 border-black rounded-lg focus:border-blue-600 focus:outline-none"
                >
                  {TYPES_DOCS.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xl font-bold text-black mb-2">Fichier *</label>
                <div className="border-4 border-dashed border-black rounded-lg p-8 text-center bg-blue-50">
                  <Upload className="w-12 h-12 text-black mx-auto mb-3" />
                  <p className="text-lg font-bold text-black mb-2">Cliquez ou glissez-déposez</p>
                  <p className="text-sm font-semibold text-black">PDF, JPG, PNG (max 10 Mo)</p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white px-8 py-6 border-t-4 border-black flex justify-end space-x-4 rounded-b-xl">
              <button
                onClick={() => setShowUpload(false)}
                className="px-8 py-4 bg-white text-black border-4 border-black rounded-lg font-bold text-xl hover:bg-gray-100"
              >
                ANNULER
              </button>
              <button
                onClick={handleUpload}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-xl hover:bg-blue-700 flex items-center space-x-2 border-4 border-black"
              >
                <Upload className="w-6 h-6" />
                <span>AJOUTER</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
