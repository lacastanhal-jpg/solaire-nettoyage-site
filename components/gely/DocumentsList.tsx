'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Trash2, Eye, Filter } from 'lucide-react'
import { getDocumentsBySociete, deleteDocument, Document, SocieteType } from '@/lib/firebase/documents'

const TYPES_LABELS: Record<string, string> = {
  facture: 'Facture',
  devis: 'Devis',
  contrat: 'Contrat',
  administratif: 'Administratif',
  permis: 'Permis',
  autre: 'Autre'
}

const STATUTS_LABELS: Record<string, { label: string; color: string }> = {
  paye: { label: 'Payé', color: 'bg-green-100 text-green-800' },
  a_payer: { label: 'À payer', color: 'bg-yellow-100 text-yellow-800' },
  en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  signe: { label: 'Signé', color: 'bg-purple-100 text-purple-800' },
  brouillon: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' }
}

interface DocumentsListProps {
  societe: SocieteType
  onDocumentClick?: (doc: Document) => void
}

export default function DocumentsList({ societe, onDocumentClick }: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterStatut, setFilterStatut] = useState('all')

  useEffect(() => {
    loadDocuments()
  }, [societe])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const docs = await getDocumentsBySociete(societe)
      setDocuments(docs)
    } catch (error) {
      console.error('Erreur chargement documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Supprimer "${doc.nom}" ?`)) return

    try {
      await deleteDocument(doc.id, doc.fileUrl)
      alert('Document supprimé')
      loadDocuments()
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const filteredDocuments = documents.filter(doc => {
    if (filterType !== 'all' && doc.type !== filterType) return false
    if (filterStatut !== 'all' && doc.statut !== filterStatut) return false
    return true
  })

  const totalHT = filteredDocuments.reduce((sum, doc) => sum + (doc.montantHT || 0), 0)

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Chargement des documents...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les types</option>
          {Object.entries(TYPES_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUTS_LABELS).map(([key, data]) => (
            <option key={key} value={key}>{data.label}</option>
          ))}
        </select>
        <div className="ml-auto text-right">
          <p className="text-sm text-gray-600">Total HT</p>
          <p className="text-xl font-bold text-blue-900">{totalHT.toLocaleString('fr-FR')} €</p>
        </div>
      </div>

      {/* Liste des documents */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Aucun document trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{doc.nom}</h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-sm text-gray-600">{TYPES_LABELS[doc.type]}</span>
                          {doc.fournisseur && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600">{doc.fournisseur}</span>
                            </>
                          )}
                          {doc.numero && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600">N° {doc.numero}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUTS_LABELS[doc.statut].color}`}>
                        {STATUTS_LABELS[doc.statut].label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mt-3">
                      {doc.montantHT && doc.montantHT > 0 && (
                        <div>
                          <p className="text-xs text-gray-500">Montant HT</p>
                          <p className="font-semibold text-gray-900">{doc.montantHT.toLocaleString('fr-FR')} €</p>
                        </div>
                      )}
                      {doc.montantTTC && doc.montantTTC > 0 && (
                        <div>
                          <p className="text-xs text-gray-500">Montant TTC</p>
                          <p className="font-semibold text-gray-900">{doc.montantTTC.toLocaleString('fr-FR')} €</p>
                        </div>
                      )}
                      {doc.date && (
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="font-semibold text-gray-900">{new Date(doc.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      )}
                      {doc.echeance && (
                        <div>
                          <p className="text-xs text-gray-500">Échéance</p>
                          <p className="font-semibold text-yellow-700">{new Date(doc.echeance).toLocaleDateString('fr-FR')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onDocumentClick && onDocumentClick(doc)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                    title="Visualiser"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <a
                    href={doc.fileUrl}
                    download
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                    title="Télécharger"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
