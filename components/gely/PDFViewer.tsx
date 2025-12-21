'use client'

import { X, Download } from 'lucide-react'
import { Document } from '@/lib/firebase/documents'

interface PDFViewerProps {
  document: Document | null
  onClose: () => void
}

export default function PDFViewer({ document, onClose }: PDFViewerProps) {
  if (!document) return null

  const isPDF = document.fileType === 'application/pdf'
  const isImage = document.fileType?.startsWith('image/')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-t-xl flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{document.nom}</h2>
            <p className="text-sm text-blue-100">
              {document.fournisseur && `${document.fournisseur} - `}
              {document.numero && `N° ${document.numero}`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={document.fileUrl}
              download
              className="p-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition"
              title="Télécharger"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-700 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {isPDF ? (
            <iframe
              src={document.fileUrl}
              className="w-full h-full"
              title={document.nom}
            />
          ) : isImage ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={document.fileUrl}
                alt={document.nom}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Prévisualisation non disponible</p>
                <a
                  href={document.fileUrl}
                  download
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Télécharger le fichier</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer avec infos */}
        <div className="bg-gray-50 p-4 rounded-b-xl border-t">
          <div className="grid grid-cols-4 gap-4 text-sm">
            {document.montantHT && document.montantHT > 0 && (
              <div>
                <p className="text-gray-600">Montant HT</p>
                <p className="font-bold text-gray-900">{document.montantHT.toLocaleString('fr-FR')} €</p>
              </div>
            )}
            {document.montantTTC && document.montantTTC > 0 && (
              <div>
                <p className="text-gray-600">Montant TTC</p>
                <p className="font-bold text-gray-900">{document.montantTTC.toLocaleString('fr-FR')} €</p>
              </div>
            )}
            {document.date && (
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-bold text-gray-900">{new Date(document.date).toLocaleDateString('fr-FR')}</p>
              </div>
            )}
            {document.echeance && (
              <div>
                <p className="text-gray-600">Échéance</p>
                <p className="font-bold text-yellow-700">{new Date(document.echeance).toLocaleDateString('fr-FR')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
