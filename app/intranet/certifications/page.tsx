'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import IntranetHeader from '../components/IntranetHeader'
import Link from 'next/link'

// Types
type Status = 'ok' | 'warning' | 'expired'

interface Certification {
  name: string
  dateExpiration: string
  status: Status
  rapports?: { label: string; url: string }[]
}

interface Collaborateur {
  id: string
  nom: string
  poste: string
  certifications: Certification[]
}

interface VGPItem {
  id: string
  nom: string
  type: string
  derniereVerif: string
  prochaineVerif: string
  status: Status
  rapport?: string
}

export default function CertificationsPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<'personnel' | 'materiel'>('personnel')

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('intranet_logged_in')
    if (!isLoggedIn) {
      router.push('/intranet/login')
    }
  }, [router])

  // Fonction pour calculer le statut
  const getStatus = (dateExp: string): Status => {
    const today = new Date()
    const expDate = new Date(dateExp)
    const diffDays = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'expired'
    if (diffDays <= 60) return 'warning'
    return 'ok'
  }

  // Données collaborateurs
  const collaborateurs: Collaborateur[] = [
    {
      id: '1',
      nom: 'Jérôme Gely',
      poste: 'Gérant',
      certifications: [
        { name: 'CACES R486 (PEMP)', dateExpiration: '2025-08-15', status: getStatus('2025-08-15') },
        { name: 'CACES R482 Cat A', dateExpiration: '2025-09-20', status: getStatus('2025-09-20') },
        { name: 'CACES R482 Cat F', dateExpiration: '2025-09-20', status: getStatus('2025-09-20') },
        { name: 'SST', dateExpiration: '2025-11-30', status: getStatus('2025-11-30') },
        { name: 'Habilitation électrique B0 H0V BP', dateExpiration: '2026-03-15', status: getStatus('2026-03-15') },
        { name: 'GIES 1 & 2', dateExpiration: '2026-01-10', status: getStatus('2026-01-10') },
        { name: 'Travail en hauteur', dateExpiration: '2025-12-20', status: getStatus('2025-12-20') },
        { name: 'Visite médicale', dateExpiration: '2026-10-18', status: getStatus('2026-10-18'), rapports: [
          { label: 'Avis aptitude', url: '/documents/visites/GELY_JEROME_-_18_11_2024_-_Avis_d_aptitude.pdf' },
          { label: 'Proposition aménagement', url: '/documents/visites/GELY_JEROME_-_18_11_2024_-_Proposition_d_ame_nagement.pdf' }
        ]},
      ]
    },
    {
      id: '2',
      nom: 'Axel',
      poste: 'Chef d\'équipe',
      certifications: [
        { name: 'CACES R486 (PEMP)', dateExpiration: '2025-07-10', status: getStatus('2025-07-10') },
        { name: 'CACES R482 Cat A', dateExpiration: '2025-10-05', status: getStatus('2025-10-05') },
        { name: 'CACES R482 Cat F', dateExpiration: '2025-10-05', status: getStatus('2025-10-05') },
        { name: 'SST', dateExpiration: '2026-02-15', status: getStatus('2026-02-15') },
        { name: 'Habilitation électrique B0 H0V BP', dateExpiration: '2025-09-30', status: getStatus('2025-09-30') },
        { name: 'Chef de manœuvre', dateExpiration: '2026-04-20', status: getStatus('2026-04-20') },
        { name: 'Travail en hauteur', dateExpiration: '2025-11-15', status: getStatus('2025-11-15') },
        { name: 'Visite médicale', dateExpiration: '2026-10-25', status: getStatus('2026-10-25'), rapports: [
          { label: 'Avis aptitude', url: '/documents/visites/GELY_AXEL_-_25_11_2024_-_Avis_d_aptitude.pdf' },
          { label: 'Proposition aménagement', url: '/documents/visites/GELY_AXEL_-_25_11_2024_-_Proposition_d_ame_nagement.pdf' }
        ]},
      ]
    },
    {
      id: '3',
      nom: 'Sébastien',
      poste: 'Technicien',
      certifications: [
        { name: 'CACES R486 (PEMP)', dateExpiration: '2026-01-15', status: getStatus('2026-01-15') },
        { name: 'CACES R482 Cat A', dateExpiration: '2025-12-10', status: getStatus('2025-12-10') },
        { name: 'SST', dateExpiration: '2025-10-25', status: getStatus('2025-10-25') },
        { name: 'Habilitation électrique B0 H0V BP', dateExpiration: '2026-05-15', status: getStatus('2026-05-15') },
        { name: 'Travail en hauteur', dateExpiration: '2026-02-28', status: getStatus('2026-02-28') },
        { name: 'Visite médicale', dateExpiration: '2026-10-25', status: getStatus('2026-10-25'), rapports: [
          { label: 'Avis aptitude', url: '/documents/visites/HENRY_SEBASTIEN_-_25_11_2024_-_Avis_d_aptitude.pdf' },
          { label: 'Proposition aménagement', url: '/documents/visites/HENRY_SEBASTIEN_-_25_11_2024_-_Proposition_d_ame_nagement.pdf' }
        ]},
      ]
    },
    {
      id: '4',
      nom: 'Joffrey',
      poste: 'Technicien',
      certifications: [
        { name: 'CACES R486 (PEMP)', dateExpiration: '2025-06-20', status: getStatus('2025-06-20') },
        { name: 'CACES R482 Cat A', dateExpiration: '2025-11-30', status: getStatus('2025-11-30') },
        { name: 'SST', dateExpiration: '2026-03-10', status: getStatus('2026-03-10') },
        { name: 'Habilitation électrique B0 H0V BP', dateExpiration: '2025-08-25', status: getStatus('2025-08-25') },
        { name: 'Travail en hauteur', dateExpiration: '2025-12-05', status: getStatus('2025-12-05') },
        { name: 'Visite médicale', dateExpiration: '2026-10-18', status: getStatus('2026-10-18'), rapports: [
          { label: 'Avis aptitude', url: '/documents/visites/BELVEZE_JOFFREY_-_18_11_2024_-_Avis_d_aptitude.pdf' },
          { label: 'Proposition aménagement', url: '/documents/visites/BELVEZE_JOFFREY_-_18_11_2024_-_Proposition_d_ame_nagement.pdf' }
        ]},
      ]
    },
    {
      id: '5',
      nom: 'Fabien',
      poste: 'Technicien',
      certifications: [
        { name: 'CACES R486 (PEMP)', dateExpiration: '2025-09-15', status: getStatus('2025-09-15') },
        { name: 'CACES R482 Cat F', dateExpiration: '2026-01-20', status: getStatus('2026-01-20') },
        { name: 'SST', dateExpiration: '2025-12-30', status: getStatus('2025-12-30') },
        { name: 'Habilitation électrique B0 H0V BP', dateExpiration: '2026-04-10', status: getStatus('2026-04-10') },
        { name: 'Travail en hauteur', dateExpiration: '2026-03-15', status: getStatus('2026-03-15') },
        { name: 'Visite médicale', dateExpiration: '2025-10-20', status: getStatus('2025-10-20') },
      ]
    },
    {
      id: '6',
      nom: 'Angelo',
      poste: 'Technicien',
      certifications: [
        { name: 'CACES R486 (PEMP)', dateExpiration: '2025-11-25', status: getStatus('2025-11-25') },
        { name: 'CACES R482 Cat A', dateExpiration: '2026-02-15', status: getStatus('2026-02-15') },
        { name: 'SST', dateExpiration: '2025-08-30', status: getStatus('2025-08-30') },
        { name: 'Habilitation électrique B0 H0V BP', dateExpiration: '2025-10-10', status: getStatus('2025-10-10') },
        { name: 'Travail en hauteur', dateExpiration: '2026-01-05', status: getStatus('2026-01-05') },
        { name: 'Visite médicale', dateExpiration: '2025-12-15', status: getStatus('2025-12-15') },
      ]
    },
  ]

  // VGP Matériel
  const vgpMateriel: VGPItem[] = [
    {
      id: '1',
      nom: 'Nacelle HA16 RT JPRO',
      type: 'Équipe 2 - N° 2079390',
      derniereVerif: '2025-06-30',
      prochaineVerif: '2025-12-30',
      status: getStatus('2025-12-30'),
      rapport: '/documents/vgp/PEMP_HAULOTTE_HA16RTJPRO_30062025-1.pdf'
    },
    {
      id: '2',
      nom: 'Nacelle HA20 RT JPRO',
      type: 'Équipe 1 - N° 2066198',
      derniereVerif: '2025-06-30',
      prochaineVerif: '2025-12-30',
      status: getStatus('2025-12-30'),
      rapport: '/documents/vgp/PEMP_HAULOTTE_HA20RTJPRO_30062025-1.pdf'
    },
    {
      id: '3',
      nom: 'Nacelle Matilsa 17m',
      type: 'Remorque - N° 1R1000028',
      derniereVerif: '2025-06-30',
      prochaineVerif: '2025-12-30',
      status: getStatus('2025-12-30'),
      rapport: '/documents/vgp/PEMP_MATILSA_VWCPARMA1R1000028_30062025-2.pdf'
    },
    {
      id: '4',
      nom: 'Dumper ROBOKLIN 25',
      type: 'N° 036-V2403-M-T-EU4',
      derniereVerif: '2025-01-02',
      prochaineVerif: '2025-07-02',
      status: getStatus('2025-07-02'),
      rapport: '/documents/vgp/Dumper_ROBOKLIN_25.pdf'
    },
    {
      id: '5',
      nom: 'Tracteur Cochet GJ-415-BW',
      type: 'T2A - N° 4365',
      derniereVerif: '2025-01-02',
      prochaineVerif: '2026-01-02',
      status: getStatus('2026-01-02'),
      rapport: '/documents/vgp/Tracteur_Cochet_GJ-415-BW.pdf'
    },
    {
      id: '6',
      nom: 'Tracteur Cochet GM-843-SW',
      type: 'T2A - N° E5*167/2013*00031',
      derniereVerif: '2025-01-02',
      prochaineVerif: '2026-01-02',
      status: getStatus('2026-01-02'),
      rapport: '/documents/vgp/Tracteur_Cochet_GM-843-SW.pdf'
    },
    {
      id: '7',
      nom: 'Harnais de sécurité - Lots 1 & 2',
      type: 'Équipement collectif',
      derniereVerif: '2025-01-02',
      prochaineVerif: '2026-01-02',
      status: getStatus('2026-01-02'),
      rapport: '/documents/vgp/Harnais_et_Longes_02012025.pdf'
    },
    {
      id: '8',
      nom: 'Longes de sécurité',
      type: 'Équipement collectif',
      derniereVerif: '2025-01-02',
      prochaineVerif: '2026-01-02',
      status: getStatus('2026-01-02'),
      rapport: '/documents/vgp/Harnais_et_Longes_02012025.pdf'
    },
  ]

  // Fonction status badge
  const StatusBadge = ({ status }: { status: Status }) => {
    const styles = {
      ok: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-orange-100 text-orange-800 border-orange-200',
      expired: 'bg-red-100 text-red-800 border-red-200'
    }
    const labels = {
      ok: 'Valide',
      warning: 'Expire bientôt',
      expired: 'Expiré'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold border ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  // Calcul alertes
  const totalAlertes = [...collaborateurs.flatMap(c => c.certifications), ...vgpMateriel.map(v => ({status: v.status}))].filter(c => c.status === 'warning' || c.status === 'expired').length

  return (
    <div className="min-h-screen bg-gray-50">
      <IntranetHeader />

      <main className="max-w-[1600px] mx-auto px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/intranet/dashboard" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
              ← Retour au tableau de bord
            </Link>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Certifications & Conformité</h1>
              <p className="text-gray-600">Suivi des certifications personnel et VGP matériel</p>
            </div>
            {totalAlertes > 0 && (
              <div className="bg-orange-100 border border-orange-200 rounded-lg px-6 py-3">
                <div className="text-2xl font-bold text-orange-800">{totalAlertes}</div>
                <div className="text-xs text-orange-600 font-semibold uppercase">Alertes actives</div>
              </div>
            )}
          </div>
        </div>

        {/* Onglets */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setSelectedTab('personnel')}
              className={`pb-4 px-2 font-semibold text-sm transition-colors relative ${
                selectedTab === 'personnel'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👥 Personnel (6 collaborateurs)
            </button>
            <button
              onClick={() => setSelectedTab('materiel')}
              className={`pb-4 px-2 font-semibold text-sm transition-colors relative ${
                selectedTab === 'materiel'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔧 Matériel VGP (8 équipements)
            </button>
          </div>
        </div>

        {/* Contenu Personnel */}
        {selectedTab === 'personnel' && (
          <div className="space-y-6">
            {collaborateurs.map((collab) => (
              <div key={collab.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* En-tête collaborateur */}
                <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{collab.nom}</h3>
                      <p className="text-sm text-gray-600">{collab.poste}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {collab.certifications.filter(c => c.status === 'ok').length}/{collab.certifications.length}
                      </div>
                      <div className="text-xs text-gray-500">Conformes</div>
                    </div>
                  </div>
                </div>

                {/* Tableau certifications */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Certification</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Date d'expiration</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Jours restants</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Statut</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Rapport médical</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collab.certifications.map((cert, idx) => {
                        const joursRestants = Math.floor((new Date(cert.dateExpiration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                        return (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{cert.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(cert.dateExpiration).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`font-semibold ${
                                joursRestants < 0 ? 'text-red-600' :
                                joursRestants <= 60 ? 'text-orange-600' :
                                'text-green-600'
                              }`}>
                                {joursRestants < 0 ? 'Expiré' : `${joursRestants}j`}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={cert.status} />
                            </td>
                            <td className="px-6 py-4">
                              {cert.rapports && cert.rapports.length > 0 && (
                                <div className="flex flex-col gap-1">
                                  {cert.rapports.map((rapport, rIdx) => (
                                    <a
                                      key={rIdx}
                                      href={rapport.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                      📄 {rapport.label}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contenu Matériel VGP */}
        {selectedTab === 'materiel' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Équipement</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Type / Équipe</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Dernière vérif</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Prochaine vérif</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Jours restants</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Statut</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Rapport VGP</th>
                  </tr>
                </thead>
                <tbody>
                  {vgpMateriel.map((item) => {
                    const joursRestants = Math.floor((new Date(item.prochaineVerif).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nom}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(item.derniereVerif).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(item.prochaineVerif).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`font-semibold ${
                            joursRestants < 0 ? 'text-red-600' :
                            joursRestants <= 60 ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {joursRestants < 0 ? 'Expiré' : `${joursRestants}j`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4">
                          {item.rapport && (
                            <a
                              href={item.rapport}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Voir PDF
                            </a>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Légende */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Légende des statuts</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <StatusBadge status="ok" />
              <span className="text-sm text-gray-600">Plus de 60 jours avant expiration</span>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status="warning" />
              <span className="text-sm text-gray-600">Expire dans moins de 60 jours</span>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status="expired" />
              <span className="text-sm text-gray-600">Certification expirée</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}