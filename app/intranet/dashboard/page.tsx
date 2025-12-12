'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import IntranetHeader from '../components/IntranetHeader'
import WeatherWidget from '../components/WeatherWidget'

export default function DashboardPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Vérifier authentification
    const isLoggedIn = localStorage.getItem('intranet_logged_in')
    if (!isLoggedIn) {
      router.push('/intranet/login')
      return
    }

    // Vérifier si admin (Jérôme ou Axel)
    const userRole = localStorage.getItem('user_role')
    setIsAdmin(userRole === 'admin')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <IntranetHeader />

      <main className="max-w-[1600px] mx-auto px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue sur l'intranet Solaire Nettoyage</p>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Widget Météo - 2 colonnes */}
          <WeatherWidget />

          {/* Matériel opérationnel */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-gray-600">Matériel opérationnel</span>
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-xl">
                ✅
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">100%</div>
            <div className="text-xs text-gray-500">Toutes les VGP à jour</div>
          </div>

          {/* Alertes */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-gray-600">Alertes en cours</span>
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-xl">
                ⚠️
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">3</div>
            <div className="text-xs text-orange-600">2 CACES à renouveler sous 30j</div>
          </div>
        </div>

        {/* Modules principaux */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Modules & Outils</h2>
          
          <div className="grid grid-cols-3 gap-6">
            {/* Praxedo - ACTIF */}
            <a
              href="https://eu6.praxedo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border-2 border-green-500 rounded-xl p-8 hover:shadow-lg transition-all relative overflow-hidden bg-gradient-to-br from-green-50/50 to-white"
            >
              <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded text-xs font-semibold uppercase">
                Actif
              </span>
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Praxedo</h3>
              <p className="text-sm text-gray-600 mb-4">
                Planning interventions, tournées, rapports terrain, facturation automatique
              </p>
              <div className="pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                <span>👥 6 utilisateurs</span>
                <span>🔗 Externe</span>
              </div>
            </a>

            {/* Flotte & Stock - ACTIF */}
            <a
              href="https://solaire-v3.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border-2 border-green-500 rounded-xl p-8 hover:shadow-lg transition-all relative overflow-hidden bg-gradient-to-br from-green-50/50 to-white"
            >
              <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded text-xs font-semibold uppercase">
                Actif
              </span>
              <div className="text-4xl mb-4">🚛</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flotte & Stock</h3>
              <p className="text-sm text-gray-600 mb-4">
                Gestion véhicules, nacelles, robots, cuves, osmoseurs, planning VGP
              </p>
              <div className="pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                <span>👥 6 utilisateurs</span>
                <span>🔗 Firebase</span>
              </div>
            </a>

            {/* Certifications - ACTIF */}
            <Link
              href="/intranet/certifications"
              className="bg-white border-2 border-green-500 rounded-xl p-8 hover:shadow-lg transition-all relative overflow-hidden bg-gradient-to-br from-green-50/50 to-white"
            >
              <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded text-xs font-semibold uppercase">
                Actif
              </span>
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Certifications & Conformité</h3>
              <p className="text-sm text-gray-600 mb-4">
                CACES, SST, habilitations, visites médicales, VGP matériel, alertes automatiques
              </p>
              <div className="pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                <span>👥 6 collaborateurs</span>
                <span>🔧 5 VGP</span>
              </div>
            </Link>

            {/* NOUVEAU : Gestion Clients - ACTIF (Seulement pour admins) */}
            {isAdmin && (
              <Link
                href="/admin/gestion-clients"
                className="bg-white border-2 border-green-500 rounded-xl p-8 hover:shadow-lg transition-all relative overflow-hidden bg-gradient-to-br from-green-50/50 to-white"
              >
                <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded text-xs font-semibold uppercase">
                  Actif
                </span>
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestion Clients</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Créer, modifier et supprimer les accès clients à l'espace dataroom
                </p>
                <div className="pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                  <span>🔐 Admins uniquement</span>
                  <span>💼 Espace Client</span>
                </div>
              </Link>
            )}

            {/* NOUVEAU : Calendrier Interventions - ACTIF (Seulement pour admins) */}
            {isAdmin && (
              <Link
                href="/admin/init-equipes"
                className="bg-white border-2 border-green-500 rounded-xl p-8 hover:shadow-lg transition-all relative overflow-hidden bg-gradient-to-br from-purple-50/50 to-white"
              >
                <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded text-xs font-semibold uppercase">
                  Actif
                </span>
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Calendrier Interventions</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Planifier et gérer les interventions terrain par équipe
                </p>
                <div className="pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                  <span>🔐 Admins uniquement</span>
                  <span>👷 3 Équipes</span>
                </div>
              </Link>
            )}

            {/* NOUVEAU : Gestion Opérateurs - ACTIF (Seulement pour admins) */}
            {isAdmin && (
              <Link
                href="/admin/init-operateurs"
                className="bg-white border-2 border-green-500 rounded-xl p-8 hover:shadow-lg transition-all relative overflow-hidden bg-gradient-to-br from-indigo-50/50 to-white"
              >
                <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded text-xs font-semibold uppercase">
                  Actif
                </span>
                <div className="text-4xl mb-4">👷</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestion Opérateurs</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Gérer les 6 opérateurs terrain et leur composition d'équipes
                </p>
                <div className="pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                  <span>🔐 Admins uniquement</span>
                  <span>👥 6 Opérateurs</span>
                </div>
              </Link>
            )}

            {/* NOUVEAU : Gestion Équipes - ACTIF (Seulement pour admins) */}
            {isAdmin && (
              <Link
                href="/admin/gestion-equipes"
                className="bg-white border-2 border-green-500 rounded-xl p-8 hover:shadow-lg transition-all relative overflow-hidden bg-gradient-to-br from-purple-50/50 to-white"
              >
                <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded text-xs font-semibold uppercase">
                  Actif
                </span>
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestion Équipes</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Composer les 3 équipes terrain avec les opérateurs disponibles
                </p>
                <div className="pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                  <span>🔐 Admins uniquement</span>
                  <span>🔴🔵🟢 3 Équipes</span>
                </div>
              </Link>
            )}

            {/* NOUVEAU : Demandes Modifications - ACTIF (Seulement pour admins) */}
            {isAdmin && (
              <Link
                href="/admin/demandes-modifications"
                className="bg-white border-2 border-orange-500 rounded-xl p-8 hover:shadow-lg transition-all relative overflow-hidden bg-gradient-to-br from-orange-50/50 to-white"
              >
                <span className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded text-xs font-semibold uppercase">
                  Actif
                </span>
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Demandes Modifications</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Traiter les demandes de changement de date clients
                </p>
                <div className="pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                  <span>🔐 Admins uniquement</span>
                  <span>📅 Clients</span>
                </div>
              </Link>
            )}

            {/* Documents - BIENTÔT */}
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 opacity-60 cursor-not-allowed relative">
              <span className="absolute top-4 right-4 bg-gray-200 text-gray-600 px-3 py-1 rounded text-xs font-semibold uppercase">
                Bientôt
              </span>
              <div className="text-4xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Base Documentaire</h3>
              <p className="text-sm text-gray-600 mb-4">
                Procédures, fiches techniques, contrats, rapports, certifications scannées
              </p>
              <div className="pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                <span>📅 Phase 3</span>
              </div>
            </div>

            {/* Dashboard Stats - BIENTÔT */}
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 opacity-60 cursor-not-allowed relative">
              <span className="absolute top-4 right-4 bg-gray-200 text-gray-600 px-3 py-1 rounded text-xs font-semibold uppercase">
                Bientôt
              </span>
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Consolidé</h3>
              <p className="text-sm text-gray-600 mb-4">
                Métriques globales, KPIs, performance équipes, statistiques interventions
              </p>
              <div className="pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                <span>📅 Phase 3</span>
              </div>
            </div>

            {/* Formation - BIENTÔT */}
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 opacity-60 cursor-not-allowed relative">
              <span className="absolute top-4 right-4 bg-gray-200 text-gray-600 px-3 py-1 rounded text-xs font-semibold uppercase">
                Bientôt
              </span>
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Centre de Formation</h3>
              <p className="text-sm text-gray-600 mb-4">
                Modules e-learning, suivi formations, quiz, vidéos procédures
              </p>
              <div className="pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                <span>📅 Phase 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alertes */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alertes & Notifications</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-l-4 border-orange-500 rounded-lg p-5 flex gap-4">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">CACES R486 à renouveler</h3>
                <p className="text-sm text-gray-600 mb-2">
                  2 collaborateurs : Renouvellement dans 28 jours
                </p>
                <button className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                  Voir les détails →
                </button>
              </div>
            </div>

            <div className="bg-white border-l-4 border-yellow-500 rounded-lg p-5 flex gap-4">
              <div className="text-2xl">🔧</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">VGP Nacelle HA16 #2</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Prochaine vérification prévue dans 45 jours
                </p>
                <button className="text-xs font-semibold text-yellow-600 hover:text-yellow-700">
                  Planifier RDV →
                </button>
              </div>
            </div>

            <div className="bg-white border-l-4 border-blue-500 rounded-lg p-5 flex gap-4">
              <div className="text-2xl">🏥</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Visite médicale périodique</h3>
                <p className="text-sm text-gray-600 mb-2">
                  1 collaborateur : À planifier sous 3 mois
                </p>
                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  Voir planning →
                </button>
              </div>
            </div>

            <div className="bg-white border-l-4 border-green-500 rounded-lg p-5 flex gap-4">
              <div className="text-2xl">✅</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Tout est conforme</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Aucune action urgente requise pour le moment
                </p>
                <button className="text-xs font-semibold text-green-600 hover:text-green-700">
                  Voir tableau de bord →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
          
          <div className="grid grid-cols-4 gap-4">
            <a 
              href="https://eu6.praxedo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left block"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold text-gray-900 text-sm">Ouvrir Praxedo</div>
            </a>

            <a 
              href="https://solaire-v3.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left block"
            >
              <div className="text-2xl mb-2">🚛</div>
              <div className="font-semibold text-gray-900 text-sm">Gestion Flotte</div>
            </a>

            <Link
              href="/intranet/certifications"
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left block"
            >
              <div className="text-2xl mb-2">🎓</div>
              <div className="font-semibold text-gray-900 text-sm">Certifications</div>
            </Link>

            {isAdmin && (
              <Link
                href="/admin/gestion-clients"
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left block"
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold text-gray-900 text-sm">Gestion Clients</div>
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin/init-equipes"
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-purple-500 hover:shadow-md transition-all text-left block"
              >
                <div className="text-2xl mb-2">📅</div>
                <div className="font-semibold text-gray-900 text-sm">Calendrier</div>
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin/init-operateurs"
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition-all text-left block"
              >
                <div className="text-2xl mb-2">👷</div>
                <div className="font-semibold text-gray-900 text-sm">Opérateurs</div>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
