'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAllExtincteurs, getHistoriqueExtincteur, type Extincteur } from '@/lib/firebase/extincteurs'

export default function TechnicienExtincteursPage() {
  const router = useRouter()
  const [extincteurs, setExtincteurs] = useState<(Extincteur & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [technicienNom, setTechnicienNom] = useState('')
  const [technicienEntreprise, setTechnicienEntreprise] = useState('')
  const [verifications, setVerifications] = useState<{ [key: string]: any }>({})

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('technicien_logged_in')
    if (!isLoggedIn) {
      router.push('/technicien/login')
      return
    }
    
    setTechnicienNom(localStorage.getItem('technicien_nom') || '')
    setTechnicienEntreprise(localStorage.getItem('technicien_entreprise') || '')
    loadExtincteurs()
  }, [router])

  const loadExtincteurs = async () => {
    try {
      setLoading(true)
      const data = await getAllExtincteurs()
      setExtincteurs(data)
      
      // Charger la dernière vérification de chaque extincteur
      const verificationsData: { [key: string]: any } = {}
      for (const ext of data) {
        const historique = await getHistoriqueExtincteur(ext.id!)
        if (historique.length > 0) {
          verificationsData[ext.id!] = historique[0]
        }
      }
      setVerifications(verificationsData)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('technicien_logged_in')
    localStorage.removeItem('technicien_id')
    localStorage.removeItem('technicien_nom')
    localStorage.removeItem('technicien_entreprise')
    router.push('/technicien/login')
  }

  const joursAvantExpiration = (date: string) => {
    const today = new Date()
    const expiration = new Date(date)
    const diff = expiration.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const stats = {
    total: extincteurs.length,
    conformes: extincteurs.filter(e => e.statut === 'Conforme').length,
    aVerifier: extincteurs.filter(e => e.statut === 'À vérifier').length,
    nonConformes: extincteurs.filter(e => e.statut === 'Non conforme').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-orange-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                🧯 Vérification Extincteurs
              </h1>
              <p className="text-sm opacity-90 mt-1">{technicienNom} - {technicienEntreprise}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">✅ Conformes</div>
            <div className="text-2xl font-bold text-green-600">{stats.conformes}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">⚠️ À vérifier</div>
            <div className="text-2xl font-bold text-orange-600">{stats.aVerifier}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">❌ Non conformes</div>
            <div className="text-2xl font-bold text-red-600">{stats.nonConformes}</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-medium text-blue-900 mb-2">📋 Instructions</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Vérifiez chaque extincteur en suivant les points de contrôle</li>
            <li>• Prenez des photos si nécessaire (optionnel)</li>
            <li>• Signez numériquement votre intervention (optionnel)</li>
            <li>• Enregistrez vos observations</li>
          </ul>
        </div>

        {/* Titre */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Extincteurs à vérifier</h2>
          <p className="text-gray-600 mt-1">{extincteurs.length} extincteur{extincteurs.length > 1 ? 's' : ''} au total</p>
        </div>

        {/* Liste des extincteurs */}
        <div className="space-y-4">
          {extincteurs.map((ext) => {
            const jours = joursAvantExpiration(ext.prochainControle)
            const derniereVerif = verifications[ext.id!]
            
            return (
              <div key={ext.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* En-tête extincteur */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-3xl font-bold text-orange-600">
                          EXT-{ext.numero}
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          ext.statut === 'Conforme' ? 'bg-green-100 text-green-800' :
                          ext.statut === 'À vérifier' ? 'bg-orange-100 text-orange-800' :
                          ext.statut === 'Non conforme' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ext.statut}
                        </span>
                      </div>
                      
                      <div className="text-lg font-medium text-gray-900 mb-1">
                        📍 {ext.emplacement}
                      </div>
                      
                      {ext.batiment && (
                        <div className="text-sm text-gray-600">
                          Bâtiment: {ext.batiment}
                          {ext.etage && ` - Étage: ${ext.etage}`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Détails */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium mb-1">Type</div>
                      <div className="text-sm font-medium text-gray-900">{ext.type}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium mb-1">Capacité</div>
                      <div className="text-sm font-medium text-gray-900">{ext.capacite}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium mb-1">Prochain contrôle</div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(ext.prochainControle).toLocaleDateString('fr-FR')}
                      </div>
                      {jours < 30 && (
                        <div className={`text-xs mt-1 ${jours < 0 ? 'text-red-600' : jours < 7 ? 'text-orange-600' : 'text-yellow-600'}`}>
                          {jours < 0 ? `⚠️ Expiré depuis ${Math.abs(jours)} jour${Math.abs(jours) > 1 ? 's' : ''}` : 
                           jours < 7 ? `🔴 Dans ${jours} jour${jours > 1 ? 's' : ''}` :
                           `⚠️ Dans ${jours} jours`}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium mb-1">Installation</div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(ext.dateInstallation).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>

                  {/* Dernière vérification */}
                  {derniereVerif && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="text-xs text-gray-600 mb-1">
                        Dernière vérification: {new Date(derniereVerif.dateVerification).toLocaleDateString('fr-FR')}
                        {' par '}{derniereVerif.technicienNom}
                      </div>
                      <div className={`text-xs font-medium ${derniereVerif.conforme ? 'text-green-700' : 'text-red-700'}`}>
                        {derniereVerif.conforme ? '✅ Conforme' : '❌ Non conforme'}
                      </div>
                    </div>
                  )}

                  {/* Observations */}
                  {ext.observations && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="text-xs font-medium text-yellow-900 mb-1">📝 Observations:</div>
                      <div className="text-sm text-yellow-800">{ext.observations}</div>
                    </div>
                  )}

                  {/* Bouton vérification */}
                  <button
                    onClick={() => router.push(`/technicien/extincteurs/${ext.id}/verifier`)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <span>✅</span>
                    <span>Effectuer la vérification</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {extincteurs.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-4xl mb-4">🧯</div>
            <div className="text-xl font-medium text-gray-900 mb-2">
              Aucun extincteur enregistré
            </div>
            <div className="text-gray-600">
              Contactez l'administrateur pour ajouter des extincteurs
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
