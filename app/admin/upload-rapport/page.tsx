'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminUploadRapport() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  // Formulaire
  const [selectedClient, setSelectedClient] = useState('')
  const [numeroIntervention, setNumeroIntervention] = useState('')
  const [site, setSite] = useState('')
  const [date, setDate] = useState('')
  const [technicien, setTechnicien] = useState('')
  const [prix, setPrix] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  // Liste des clients (à synchroniser avec le login client)
  const clients = [
    { id: 'mecojit', name: 'MECOJIT' },
    { id: 'edf', name: 'EDF Solutions Solaires' },
    { id: 'engie', name: 'ENGIE Green France' },
    { id: 'totalenergies', name: 'TotalEnergies' },
    { id: 'cgn', name: 'CGN Europe Energy' },
    // Ajouter d'autres clients ici
  ]

  useEffect(() => {
    // Vérifier si c'est un admin de l'intranet
    const userRole = localStorage.getItem('user_role')
    if (userRole === 'admin') {
      setIsAdmin(true)
      setLoading(false)
    } else {
      router.push('/intranet/login')
    }
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setMessage('❌ Veuillez sélectionner un fichier PDF')
      return
    }

    if (!selectedClient) {
      setMessage('❌ Veuillez sélectionner un client')
      return
    }

    setUploading(true)
    setMessage('⏳ Upload en cours...')

    try {
      // TODO: Implémenter l'upload réel
      // Pour l'instant, simulation
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Ajouter l'intervention dans la base de données
      const intervention = {
        numero: numeroIntervention,
        client: selectedClient,
        site: site,
        date: date,
        technicien: technicien,
        statut: 'Terminé',
        rapport: `/rapports/clients/${selectedClient}/${file.name}`,
        prix: parseFloat(prix)
      }

      console.log('Intervention créée:', intervention)
      console.log('Fichier à uploader:', file.name)

      setMessage('✅ Rapport uploadé avec succès !')
      
      // Réinitialiser le formulaire
      setNumeroIntervention('')
      setSite('')
      setDate('')
      setTechnicien('')
      setPrix('')
      setFile(null)
      setSelectedClient('')
      
      // Effacer le message après 3 secondes
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Erreur upload:', error)
      setMessage('❌ Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-blue-900 text-xl">Chargement...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">Administration</h1>
                <p className="text-sm text-blue-600">Upload de rapports clients</p>
              </div>
            </div>
            <a
              href="/intranet/dashboard"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              ← Retour Intranet
            </a>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Nouveau Rapport d'Intervention</h2>

          {message && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.includes('✅') 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : message.includes('❌')
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Client *
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                required
              >
                <option value="">-- Sélectionner un client --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Numéro d'intervention */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Numéro d'intervention *
              </label>
              <input
                type="text"
                value={numeroIntervention}
                onChange={(e) => setNumeroIntervention(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                placeholder="GX0000002830"
                required
              />
            </div>

            {/* Site */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Site / Centrale *
              </label>
              <input
                type="text"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                placeholder="19-0226 CANTALOUBE 2"
                required
              />
            </div>

            {/* Date et Technicien */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Date d'intervention *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Technicien *
                </label>
                <input
                  type="text"
                  value={technicien}
                  onChange={(e) => setTechnicien(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                  placeholder="Gely Axel"
                  required
                />
              </div>
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Prix HT (€) *
              </label>
              <input
                type="number"
                step="0.01"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                placeholder="350.00"
                required
              />
            </div>

            {/* Fichier PDF */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Rapport PDF *
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                required
              />
              {file && (
                <p className="mt-2 text-sm text-blue-600">
                  📄 Fichier sélectionné : {file.name}
                </p>
              )}
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? '⏳ Upload en cours...' : '📤 Uploader le rapport'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
