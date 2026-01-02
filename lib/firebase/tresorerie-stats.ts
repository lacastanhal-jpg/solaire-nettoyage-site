import { 
  getAllComptesBancaires, 
  getAllLignesBancaires,
  getLignesARapprocher,
  type CompteBancaire,
  type LigneBancaire 
} from './lignes-bancaires'

export interface StatistiquesTresorerie {
  soldeTotal: number
  aRapprocher: number
  encaissementsMois: number
  decaissementsMois: number
}

export interface EvolutionSolde {
  date: string
  solde: number
}

/**
 * Calculer les statistiques globales de trésorerie
 */
export async function getStatistiquesTresorerie(): Promise<StatistiquesTresorerie> {
  try {
    // 1. Solde total de tous les comptes
    const comptes = await getAllComptesBancaires()
    const soldeTotal = comptes
      .filter(c => c.actif)
      .reduce((sum, c) => sum + c.solde, 0)
    
    // 2. Nombre de transactions à rapprocher
    const lignesARapprocher = await getLignesARapprocher()
    const aRapprocher = lignesARapprocher.length
    
    // 3. Encaissements et décaissements du mois en cours
    const lignes = await getAllLignesBancaires()
    const maintenant = new Date()
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)
    const finMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0)
    
    const lignesMois = lignes.filter(l => {
      const dateLigne = new Date(l.date)
      return dateLigne >= debutMois && dateLigne <= finMois
    })
    
    const encaissementsMois = lignesMois
      .filter(l => l.montant > 0)
      .reduce((sum, l) => sum + l.montant, 0)
    
    const decaissementsMois = Math.abs(
      lignesMois
        .filter(l => l.montant < 0)
        .reduce((sum, l) => sum + l.montant, 0)
    )
    
    return {
      soldeTotal,
      aRapprocher,
      encaissementsMois,
      decaissementsMois
    }
  } catch (error) {
    console.error('Erreur calcul statistiques trésorerie:', error)
    throw error
  }
}

/**
 * Calculer l'évolution du solde sur les N derniers jours
 */
export async function getEvolutionSolde(nombreJours: number = 30): Promise<EvolutionSolde[]> {
  try {
    const comptes = await getAllComptesBancaires()
    const lignes = await getAllLignesBancaires()
    
    // Trier les lignes par date croissante
    const lignesTriees = lignes.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    // Date de début
    const aujourdhui = new Date()
    const dateDebut = new Date(aujourdhui)
    dateDebut.setDate(dateDebut.getDate() - nombreJours)
    
    // Calculer le solde initial (avant la période)
    let soldeInitial = 0
    lignesTriees.forEach(ligne => {
      if (new Date(ligne.date) < dateDebut) {
        soldeInitial += ligne.montant
      }
    })
    
    // Construire l'évolution jour par jour
    const evolution: EvolutionSolde[] = []
    let soldeCourant = soldeInitial
    
    for (let i = 0; i <= nombreJours; i++) {
      const dateJour = new Date(dateDebut)
      dateJour.setDate(dateJour.getDate() + i)
      const dateStr = dateJour.toISOString().split('T')[0]
      
      // Ajouter toutes les transactions de ce jour
      const transactionsJour = lignesTriees.filter(l => 
        l.date === dateStr
      )
      
      transactionsJour.forEach(t => {
        soldeCourant += t.montant
      })
      
      evolution.push({
        date: dateStr,
        solde: soldeCourant
      })
    }
    
    return evolution
  } catch (error) {
    console.error('Erreur calcul évolution solde:', error)
    return []
  }
}

/**
 * Obtenir les transactions non rapprochées récentes
 */
export async function getTransactionsNonRapprochees(limite: number = 10): Promise<LigneBancaire[]> {
  try {
    const lignes = await getLignesARapprocher()
    
    // Trier par date décroissante
    const lignesTriees = lignes.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    return lignesTriees.slice(0, limite)
  } catch (error) {
    console.error('Erreur récupération transactions non rapprochées:', error)
    return []
  }
}

/**
 * Calculer la variation du solde (mois actuel vs mois précédent)
 */
export async function getVariationSoldeMensuelle(): Promise<{
  moisActuel: number
  moisPrecedent: number
  variation: number
  variationPourcentage: number
}> {
  try {
    const lignes = await getAllLignesBancaires()
    const maintenant = new Date()
    
    // Mois actuel
    const debutMoisActuel = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)
    const finMoisActuel = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0)
    
    // Mois précédent
    const debutMoisPrecedent = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1)
    const finMoisPrecedent = new Date(maintenant.getFullYear(), maintenant.getMonth(), 0)
    
    const lignesMoisActuel = lignes.filter(l => {
      const date = new Date(l.date)
      return date >= debutMoisActuel && date <= finMoisActuel
    })
    
    const lignesMoisPrecedent = lignes.filter(l => {
      const date = new Date(l.date)
      return date >= debutMoisPrecedent && date <= finMoisPrecedent
    })
    
    const moisActuel = lignesMoisActuel.reduce((sum, l) => sum + l.montant, 0)
    const moisPrecedent = lignesMoisPrecedent.reduce((sum, l) => sum + l.montant, 0)
    
    const variation = moisActuel - moisPrecedent
    const variationPourcentage = moisPrecedent !== 0 
      ? ((variation / Math.abs(moisPrecedent)) * 100)
      : 0
    
    return {
      moisActuel,
      moisPrecedent,
      variation,
      variationPourcentage
    }
  } catch (error) {
    console.error('Erreur calcul variation solde:', error)
    throw error
  }
}
