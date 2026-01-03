import { db } from './config'
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { getDevisById, type Devis } from './devis'
import { getClientById } from './clients'

export interface InterventionFromDevis {
  devisId: string
  devisNumero: string
  siteId: string
  siteNom: string
  date: string
  equipeId?: string
  equipeNom?: string
  articles: {
    articleId: string
    articleCode: string
    articleNom: string
    quantite: number
    prixUnitaire: number
  }[]
}

/**
 * Générer le prochain numéro d'intervention
 */
export async function generateInterventionNumero(): Promise<string> {
  try {
    const year = new Date().getFullYear()
    const interventionsRef = collection(db, 'interventions_calendar')  // ✅ Bonne collection
    const q = query(
      interventionsRef,
      orderBy('createdAt', 'desc'),
      limit(1)
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return `INT-${year}-0001`
    }
    
    // Récupérer le dernier numéro depuis l'ID du document
    const lastDoc = snapshot.docs[0]
    const lastNumero = lastDoc.id  // L'ID est le numéro (INT-2026-0002)
    const lastNumber = parseInt(lastNumero.split('-')[2])
    const newNumber = lastNumber + 1
    
    return `INT-${year}-${newNumber.toString().padStart(4, '0')}`
  } catch (error) {
    console.error('Erreur génération numéro intervention:', error)
    return `INT-${new Date().getFullYear()}-0001`
  }
}

/**
 * Grouper les lignes de devis par site
 */
export function grouperLignesParSite(devis: Devis): Map<string, any[]> {
  const sitesMap = new Map<string, any[]>()
  
  devis.lignes.forEach(ligne => {
    if (!sitesMap.has(ligne.siteId)) {
      sitesMap.set(ligne.siteId, [])
    }
    sitesMap.get(ligne.siteId)!.push({
      articleId: ligne.articleId,
      articleCode: ligne.articleCode,
      articleNom: ligne.articleNom,
      articleDescription: ligne.articleDescription,
      quantite: ligne.quantite,
      prixUnitaire: ligne.prixUnitaire,
      tva: ligne.tva
    })
  })
  
  return sitesMap
}

/**
 * Créer les interventions depuis un devis
 */
export async function creerInterventionsDepuisDevis(
  devisId: string,
  configurationsInterventions: {
    siteId: string
    dateDebut: string
    dateFin: string
    equipeId?: string
    equipeNom?: string
  }[]
): Promise<{ success: boolean; interventionsCreees: string[]; errors: string[] }> {
  try {
    const devis = await getDevisById(devisId)
    if (!devis) {
      return { success: false, interventionsCreees: [], errors: ['Devis introuvable'] }
    }
    
    if (devis.statut !== 'accepté') {
      return { success: false, interventionsCreees: [], errors: ['Le devis doit être accepté'] }
    }
    
    // Récupérer le client pour avoir le groupeId
    const client = await getClientById(devis.clientId)
    if (!client) {
      return { success: false, interventionsCreees: [], errors: ['Client introuvable'] }
    }
    
    // Grouper les lignes par site
    const sitesMap = grouperLignesParSite(devis)
    
    const interventionsCreees: string[] = []
    const errors: string[] = []
    
    // ✅ Générer TOUS les numéros AVANT la boucle avec incrément local
    const numeros: string[] = []
    
    // Obtenir le dernier numéro une seule fois
    const premierNumero = await generateInterventionNumero()
    const year = new Date().getFullYear()
    const baseNumber = parseInt(premierNumero.split('-')[2])
    
    // Générer les numéros séquentiels localement
    for (let i = 0; i < configurationsInterventions.length; i++) {
      const newNumber = baseNumber + i
      const numero = `INT-${year}-${newNumber.toString().padStart(4, '0')}`
      numeros.push(numero)
    }
    
    // Créer une intervention par site configuré
    for (let i = 0; i < configurationsInterventions.length; i++) {
      const config = configurationsInterventions[i]
      const numero = numeros[i]  // ✅ Utiliser le numéro pré-généré
      
      try {
        const articlesDevis = sitesMap.get(config.siteId)
        if (!articlesDevis || articlesDevis.length === 0) {
          errors.push(`Aucun article trouvé pour le site ${config.siteId}`)
          continue
        }
        
        // Récupérer TOUTES les lignes du site et sommer les quantités
        const lignesSite = devis.lignes.filter(l => l.siteId === config.siteId)
        const totalSurface = lignesSite.reduce((sum, l) => sum + l.quantite, 0)
        const siteNom = lignesSite[0]?.siteNom || 'Site inconnu'
        
        // Calculer le total
        const totalHT = articlesDevis.reduce((sum, art) => 
          sum + (art.quantite * art.prixUnitaire), 0
        )
        const totalTVA = articlesDevis.reduce((sum, art) => 
          sum + (art.quantite * art.prixUnitaire * art.tva / 100), 0
        )
        const totalTTC = totalHT + totalTVA
        
        // Équipe - convertir en number et gérer valeur par défaut
        let equipeId: number = 1
        if (config.equipeId) {
          const parsed = parseInt(config.equipeId)
          if (!isNaN(parsed) && [1, 2, 3].includes(parsed)) {
            equipeId = parsed
          }
        }
        const equipeName = config.equipeNom || `Équipe ${equipeId}`
        
        const interventionData: any = {
          // Structure conforme à InterventionCalendar
          siteId: config.siteId,
          siteName: siteNom,  // ✅ Utiliser la variable calculée
          clientId: devis.clientId,
          clientName: devis.clientNom, // clientName (pas clientNom)
          groupeId: client.groupeId || '', // ✅ Utiliser le groupeId du client
          
          // Dates et heures (structure attendue)
          dateDebut: config.dateDebut, // Format ISO "2026-01-02"
          dateFin: config.dateFin,     // Format ISO "2026-01-05"
          heureDebut: '08:00',         // Heure par défaut
          heureFin: '17:00',           // Heure par défaut
          
          // Équipe (obligatoire)
          equipeId: equipeId as 1 | 2 | 3,
          equipeName: equipeName,
          
          // Type et surface
          surface: totalSurface,  // ✅ Somme de toutes les lignes du site
          type: 'Standard' as const,
          statut: 'Planifiée' as const, // Avec accent !
          
          // Notes avec infos devis
          notes: `Intervention générée depuis devis ${devis.numero}\n\nArticles:\n${articlesDevis.map(a => `- ${a.articleNom} (x${a.quantite})`).join('\n')}\n\nTotal TTC: ${totalTTC.toFixed(2)}€`,
          
          // Métadonnées supplémentaires
          devisId: devis.id,
          devisNumero: devis.numero,
          createdAt: new Date().toISOString(),
          createdBy: 'workflow-devis',
          
          // Conservation des totaux pour référence
          totalHT,
          totalTVA,
          totalTTC,
          articles: articlesDevis
        }
        
        const interventionRef = doc(db, 'interventions_calendar', numero)
        await setDoc(interventionRef, interventionData)
        
        interventionsCreees.push(numero)
      } catch (error) {
        console.error(`Erreur création intervention pour site ${config.siteId}:`, error)
        errors.push(`Erreur pour site ${config.siteId}: ${error}`)
      }
    }
    
    // Marquer le devis comme ayant généré des interventions
    if (interventionsCreees.length > 0) {
      const devisRef = doc(db, 'devis', devisId)
      await setDoc(devisRef, {
        interventionsGenerees: true,
        interventionsNumeros: interventionsCreees,
        dateGenerationInterventions: new Date().toISOString()
      }, { merge: true })
    }
    
    return {
      success: interventionsCreees.length > 0,
      interventionsCreees,
      errors
    }
  } catch (error) {
    console.error('Erreur création interventions depuis devis:', error)
    return {
      success: false,
      interventionsCreees: [],
      errors: [`Erreur générale: ${error}`]
    }
  }
}

/**
 * Vérifier si un devis a déjà généré des interventions
 */
export async function devisAGeneréInterventions(devisId: string): Promise<boolean> {
  try {
    const devisRef = doc(db, 'devis', devisId)
    const devisSnap = await getDoc(devisRef)
    
    if (!devisSnap.exists()) return false
    
    const data = devisSnap.data()
    return data.interventionsGenerees === true
  } catch (error) {
    console.error('Erreur vérification interventions:', error)
    return false
  }
}

/**
 * NOUVELLE FONCTION : Génération automatique sans configuration manuelle
 * Crée les interventions en statut "brouillon" sans dates/équipes
 */
export async function validerDevisEnCommande(devisId: string): Promise<{
  success: boolean
  interventionsCreees: string[]
  errors: string[]
}> {
  try {
    const devis = await getDevisById(devisId)
    if (!devis) {
      return { success: false, interventionsCreees: [], errors: ['Devis introuvable'] }
    }
    
    // Vérifier que le devis est bien envoyé
    if (devis.statut !== 'envoyé' && devis.statut !== 'accepté') {
      return { 
        success: false, 
        interventionsCreees: [], 
        errors: ['Le devis doit être envoyé ou accepté pour être validé en commande'] 
      }
    }
    
    // Vérifier qu'il n'a pas déjà généré des interventions
    const dejaGenere = await devisAGeneréInterventions(devisId)
    if (dejaGenere) {
      return {
        success: false,
        interventionsCreees: [],
        errors: ['Ce devis a déjà généré des interventions']
      }
    }
    
    // Récupérer le client pour avoir le groupeId
    const client = await getClientById(devis.clientId)
    if (!client) {
      return { success: false, interventionsCreees: [], errors: ['Client introuvable'] }
    }
    
    // Grouper les lignes par site
    const sitesMap = grouperLignesParSite(devis)
    
    const interventionsCreees: string[] = []
    const errors: string[] = []
    
    // Générer tous les numéros d'intervention à l'avance
    const nombreSites = sitesMap.size
    const numeros: string[] = []
    const premierNumero = await generateInterventionNumero()
    const year = new Date().getFullYear()
    const baseNumber = parseInt(premierNumero.split('-')[2])
    
    for (let i = 0; i < nombreSites; i++) {
      const newNumber = baseNumber + i
      const numero = `INT-${year}-${newNumber.toString().padStart(4, '0')}`
      numeros.push(numero)
    }
    
    // Créer une intervention par site
    let index = 0
    const sitesEntries = Array.from(sitesMap.entries())
    for (const [siteId, articlesDevis] of sitesEntries) {
      const numero = numeros[index]
      index++
      
      try {
        // Récupérer les infos du site depuis les lignes
        const lignesSite = devis.lignes.filter(l => l.siteId === siteId)
        const totalSurface = lignesSite.reduce((sum, l) => sum + l.quantite, 0)
        const siteNom = lignesSite[0]?.siteNom || 'Site inconnu'
        
        // Calculer totaux
        const totalHT = articlesDevis.reduce((sum, art) => 
          sum + (art.quantite * art.prixUnitaire), 0
        )
        const totalTVA = articlesDevis.reduce((sum, art) => 
          sum + (art.quantite * art.prixUnitaire * art.tva / 100), 0
        )
        const totalTTC = totalHT + totalTVA
        
        // Créer l'intervention en statut BROUILLON (sans dates/équipes)
        const interventionData: any = {
          // Identifiants
          siteId: siteId,
          siteName: siteNom,
          clientId: devis.clientId,
          clientName: devis.clientNom,
          groupeId: client.groupeId || '',
          
          // Dates NON définies - à affecter plus tard
          dateDebut: null,
          dateFin: null,
          heureDebut: null,
          heureFin: null,
          
          // Équipe NON définie - à affecter plus tard
          equipeId: null,
          equipeName: null,
          
          // Infos intervention
          surface: totalSurface,
          type: 'Standard' as const,
          statut: 'brouillon' as const,  // ⚡ BROUILLON en attente planification
          
          // Notes avec détails devis
          notes: `✅ Intervention générée depuis devis ${devis.numero}\n\n📋 Articles:\n${articlesDevis.map(a => `- ${a.articleNom} (x${a.quantite})`).join('\n')}\n\n💰 Total TTC: ${totalTTC.toFixed(2)}€`,
          
          // Lien devis
          devisId: devis.id,
          devisNumero: devis.numero,
          
          // Métadonnées
          createdAt: new Date().toISOString(),
          createdBy: 'workflow-devis-auto',
          
          // Totaux pour référence
          totalHT,
          totalTVA,
          totalTTC,
          articles: articlesDevis
        }
        
        const interventionRef = doc(db, 'interventions_calendar', numero)
        await setDoc(interventionRef, interventionData)
        
        interventionsCreees.push(numero)
      } catch (error) {
        console.error(`Erreur création intervention ${numero}:`, error)
        errors.push(`Erreur pour site ${siteId}: ${error}`)
      }
    }
    
    // Mettre à jour le devis
    if (interventionsCreees.length > 0) {
      const devisRef = doc(db, 'devis', devisId)
      await setDoc(devisRef, {
        statut: 'validé_commande',  // Nouveau statut
        interventionsGenerees: true,
        interventionsNumeros: interventionsCreees,
        dateValidationCommande: new Date().toISOString()
      }, { merge: true })
    }
    
    return {
      success: interventionsCreees.length > 0,
      interventionsCreees,
      errors
    }
  } catch (error) {
    console.error('Erreur validation commande:', error)
    return {
      success: false,
      interventionsCreees: [],
      errors: [`Erreur générale: ${error}`]
    }
  }
}

/**
 * Récupérer les interventions créées depuis un devis
 */
export async function getInterventionsByDevis(devisId: string): Promise<any[]> {
  try {
    // Récupérer le devis pour avoir les numéros d'interventions
    const devisRef = doc(db, 'devis', devisId)
    const devisSnap = await getDoc(devisRef)
    
    if (!devisSnap.exists()) {
      return []
    }
    
    const devisData = devisSnap.data()
    const numerosInterventions = devisData.interventionsNumeros || []
    
    if (numerosInterventions.length === 0) {
      return []
    }
    
    // Récupérer chaque intervention par son numéro
    const interventionsPromises = numerosInterventions.map(async (numero: string) => {
      const interventionRef = doc(db, 'interventions_calendar', numero)
      const interventionSnap = await getDoc(interventionRef)
      
      if (interventionSnap.exists()) {
        return {
          id: interventionSnap.id,
          ...interventionSnap.data()
        }
      }
      return null
    })
    
    const interventions = await Promise.all(interventionsPromises)
    return interventions.filter(i => i !== null)
  } catch (error) {
    console.error('Erreur récupération interventions par devis:', error)
    return []
  }
}

/**
 * Affectation en masse équipe + dates
 * Met à jour plusieurs interventions en une fois
 */
export async function affecterInterventionsEnMasse(
  affectations: {
    interventionId: string
    dateDebut: string
    dateFin: string
    equipeId: number
    equipeName: string
  }[]
): Promise<{ success: boolean; errors: string[] }> {
  try {
    const errors: string[] = []
    
    // Traiter chaque affectation
    for (const affectation of affectations) {
      try {
        const interventionRef = doc(db, 'interventions_calendar', affectation.interventionId)
        
        await setDoc(interventionRef, {
          dateDebut: affectation.dateDebut,
          dateFin: affectation.dateFin,
          heureDebut: '08:00',  // Par défaut
          heureFin: '17:00',    // Par défaut
          equipeId: affectation.equipeId as 1 | 2 | 3,
          equipeName: affectation.equipeName,
          statut: 'Planifiée' as const,  // Passe de "brouillon" à "Planifiée"
          updatedAt: new Date().toISOString()
        }, { merge: true })
      } catch (error) {
        errors.push(`Erreur intervention ${affectation.interventionId}: ${error}`)
      }
    }
    
    return {
      success: errors.length === 0,
      errors
    }
  } catch (error) {
    console.error('Erreur affectation en masse:', error)
    return {
      success: false,
      errors: [`Erreur générale: ${error}`]
    }
  }
}

