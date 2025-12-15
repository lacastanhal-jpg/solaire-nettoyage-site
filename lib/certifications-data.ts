// Fonction pour récupérer les données de certifications hardcodées
// Cette fonction copie les données du fichier page.tsx

type Status = 'ok' | 'warning' | 'expired'

interface Certification {
  name: string
  dateExpiration: string
  status: Status
}

interface Collaborateur {
  nom: string
  poste: string
  certifications: Certification[]
}

interface VGPItem {
  nom: string
  type: string
  prochaineVerif: string
  status: Status
}

// Fonction pour calculer le statut
const getStatus = (dateExp: string): Status => {
  const today = new Date()
  const expDate = new Date(dateExp)
  const diffDays = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'expired'
  if (diffDays <= 60) return 'warning'
  return 'ok'
}

// Données collaborateurs (copiées depuis page.tsx)
export function getCertificationsData() {
  const collaborateurs: Collaborateur[] = [
    {
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
        { name: 'Visite médicale', dateExpiration: '2026-10-18', status: getStatus('2026-10-18') },
      ]
    },
    {
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
        { name: 'Visite médicale', dateExpiration: '2026-10-25', status: getStatus('2026-10-25') },
      ]
    },
    {
      nom: 'Sébastien',
      poste: 'Technicien',
      certifications: [
        { name: 'CACES R486 (PEMP)', dateExpiration: '2026-01-15', status: getStatus('2026-01-15') },
        { name: 'CACES R482 Cat A', dateExpiration: '2025-12-10', status: getStatus('2025-12-10') },
        { name: 'SST', dateExpiration: '2025-10-25', status: getStatus('2025-10-25') },
        { name: 'Habilitation électrique B0 H0V BP', dateExpiration: '2026-05-15', status: getStatus('2026-05-15') },
        { name: 'Travail en hauteur', dateExpiration: '2026-02-28', status: getStatus('2026-02-28') },
        { name: 'Visite médicale', dateExpiration: '2026-10-25', status: getStatus('2026-10-25') },
      ]
    },
    {
      nom: 'Joffrey',
      poste: 'Technicien',
      certifications: [
        { name: 'CACES R486 (PEMP)', dateExpiration: '2025-06-20', status: getStatus('2025-06-20') },
        { name: 'CACES R482 Cat A', dateExpiration: '2025-11-30', status: getStatus('2025-11-30') },
        { name: 'SST', dateExpiration: '2026-03-10', status: getStatus('2026-03-10') },
        { name: 'Habilitation électrique B0 H0V BP', dateExpiration: '2025-08-25', status: getStatus('2025-08-25') },
        { name: 'Travail en hauteur', dateExpiration: '2025-12-05', status: getStatus('2025-12-05') },
        { name: 'Visite médicale', dateExpiration: '2026-10-18', status: getStatus('2026-10-18') },
      ]
    },
    {
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

  const vgpMateriel: VGPItem[] = [
    { nom: 'Nacelle HA16 RT JPRO', type: 'Équipe 2', prochaineVerif: '2025-12-30', status: getStatus('2025-12-30') },
    { nom: 'Nacelle HA20 RT JPRO', type: 'Équipe 1', prochaineVerif: '2025-12-30', status: getStatus('2025-12-30') },
    { nom: 'Nacelle Matilsa 17m', type: 'Remorque', prochaineVerif: '2025-12-30', status: getStatus('2025-12-30') },
    { nom: 'Dumper ROBOKLIN 25', type: 'Équipement', prochaineVerif: '2025-07-02', status: getStatus('2025-07-02') },
    { nom: 'Tracteur Cochet GJ-415-BW', type: 'T2A', prochaineVerif: '2026-01-02', status: getStatus('2026-01-02') },
    { nom: 'Tracteur Cochet GM-843-SW', type: 'T2A', prochaineVerif: '2026-01-02', status: getStatus('2026-01-02') },
    { nom: 'Harnais de sécurité - Lots 1 & 2', type: 'EPI', prochaineVerif: '2026-01-02', status: getStatus('2026-01-02') },
  ]

  return { collaborateurs, vgpMateriel }
}

// Fonction pour calculer les alertes à partir des données hardcodées
export function getAlertesFromData() {
  const { collaborateurs, vgpMateriel } = getCertificationsData()
  
  const alertes = {
    critiques: [] as { type: string; message: string; jours: number }[],
    importantes: [] as { type: string; message: string; jours: number }[],
    info: [] as { type: string; message: string }[]
  }

  const aujourdhui = new Date()

  // Fonction pour calculer jours restants
  const joursAvantExpiration = (dateExpiration: string): number => {
    const today = new Date()
    const expiration = new Date(dateExpiration)
    const diff = expiration.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  // Parcourir toutes les certifications de tous les collaborateurs
  collaborateurs.forEach(collab => {
    collab.certifications.forEach(cert => {
      const jours = joursAvantExpiration(cert.dateExpiration)
      
      if (jours < 0) {
        alertes.critiques.push({
          type: 'Certification expirée',
          message: `${collab.nom} - ${cert.name} expiré depuis ${Math.abs(jours)} jours`,
          jours
        })
      } else if (jours <= 15) {
        alertes.critiques.push({
          type: 'Certification < 15j',
          message: `${collab.nom} - ${cert.name} expire dans ${jours}j`,
          jours
        })
      } else if (jours <= 30) {
        alertes.importantes.push({
          type: 'Certification < 30j',
          message: `${collab.nom} - ${cert.name} expire dans ${jours}j`,
          jours
        })
      }
    })
  })

  // Parcourir VGP
  vgpMateriel.forEach(vgp => {
    const jours = joursAvantExpiration(vgp.prochaineVerif)
    
    if (jours < 0) {
      alertes.critiques.push({
        type: 'VGP expiré',
        message: `${vgp.nom} - VGP expiré depuis ${Math.abs(jours)} jours`,
        jours
      })
    } else if (jours <= 7) {
      alertes.critiques.push({
        type: 'VGP < 7j',
        message: `${vgp.nom} - VGP expire dans ${jours}j`,
        jours
      })
    } else if (jours <= 30) {
      alertes.importantes.push({
        type: 'VGP < 30j',
        message: `${vgp.nom} - VGP expire dans ${jours}j`,
        jours
      })
    }
  })

  return alertes
}
