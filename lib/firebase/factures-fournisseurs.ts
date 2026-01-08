import { db } from './config'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore'
import { createMouvementStock } from './stock-mouvements'
import { createEcritureComptable } from './ecritures-comptables'
import { getArticleStockById, updateArticleStock } from './stock-articles'

const COLLECTION = 'factures_fournisseurs_compta'

/**
 * Utilitaire : Nettoyer les champs undefined (Firestore ne les accepte pas)
 */
function cleanUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {}
  
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    
    if (value !== undefined) {
      if (Array.isArray(value)) {
        // Nettoyer les objets dans les tableaux
        cleaned[key] = value.map(item => 
          typeof item === 'object' && item !== null 
            ? cleanUndefined(item) 
            : item
        )
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = cleanUndefined(value)
      } else {
        cleaned[key] = value
      }
    }
  })
  
  return cleaned
}

/**
 * 🆕 PHASE 3 - Interface Ligne Facture Fournisseur
 */
export interface LigneFactureFournisseur {
  id: string                      // Unique dans la facture
  
  // Option 1 : Article du catalogue
  articleStockId?: string         // ID dans articles_stock
  articleCode?: string            // Code article
  
  // Option 2 : Saisie manuelle
  designation?: string            // Si pas d'article
  
  quantite: number
  prixUnitaireHT: number
  tauxTVA: number                 // 20, 10, 5.5, 0
  
  montantHT: number               // quantite * prixUnitaire
  montantTVA: number              // montantHT * tauxTVA
  montantTTC: number              // montantHT + montantTVA
  
  // Comptabilité (auto si article, sinon saisie)
  compteComptable: string         // 6063, 6061, etc.
  compteIntitule: string
  
  // Stock
  depotDestination: string        // "Atelier" (défaut)
  genererMouvementStock: boolean  // true si article stock
  
  mouvementStockId?: string       // Généré après validation
}

/**
 * 🆕 PHASE 3 - Interface Facture Fournisseur
 */
export interface FactureFournisseur {
  id: string                      // FF-2026-0001
  numero: string                  // Numéro interne auto
  numeroFournisseur: string       // N° facture du fournisseur
  fournisseur: string             // Nom fournisseur
  siretFournisseur?: string
  dateFacture: string             // YYYY-MM-DD
  dateEcheance: string
  
  lignes: LigneFactureFournisseur[]
  
  montantHT: number               // Calculé auto
  montantTVA: number              // Calculé auto
  montantTTC: number              // Calculé auto
  
  pdfURL?: string                 // Firebase Storage
  
  statut: 'brouillon' | 'validee' | 'payee'
  
  // Traçabilité validation
  validePar?: string              // userId (Jerome ou Axel)
  dateValidation?: string
  
  // Traçabilité paiement
  datePaiement?: string
  modePaiement?: 'virement' | 'cheque' | 'cb'
  referencePaiement?: string
  
  // Liens
  mouvementsStockIds: string[]    // IDs mouvements générés
  ecrituresComptablesIds: string[] // IDs écritures générées
  
  notes?: string
  createdAt: string
  createdBy: string               // userId
  updatedAt: string
}

/**
 * 🆕 PHASE 3 - Input pour création facture fournisseur
 */
export interface FactureFournisseurInput {
  numeroFournisseur: string
  fournisseur: string
  siretFournisseur?: string
  dateFacture: string
  dateEcheance: string
  lignes: Omit<LigneFactureFournisseur, 'id' | 'mouvementStockId'>[]
  pdfURL?: string
  statut?: 'brouillon' | 'validee' | 'payee'  // ✅ Ajouté - optionnel, défaut = 'brouillon'
  notes?: string
  createdBy: string
}

/**
 * 🆕 PHASE 3 - Générer le prochain numéro de facture fournisseur
 */
async function genererNumeroFacture(): Promise<string> {
  try {
    const year = new Date().getFullYear()
    const facturesRef = collection(db, COLLECTION)
    const q = query(
      facturesRef,
      where('numero', '>=', `FF-${year}-0000`),
      where('numero', '<=', `FF-${year}-9999`),
      orderBy('numero', 'desc')
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return `FF-${year}-0001`
    }
    
    const dernierNumero = snapshot.docs[0].data().numero as string
    const dernierIndex = parseInt(dernierNumero.split('-')[2])
    const nouveauIndex = dernierIndex + 1
    
    return `FF-${year}-${nouveauIndex.toString().padStart(4, '0')}`
  } catch (error) {
    console.error('Erreur génération numéro facture:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Calculer les montants d'une ligne
 */
function calculerMontantsLigne(ligne: Omit<LigneFactureFournisseur, 'id' | 'montantHT' | 'montantTVA' | 'montantTTC' | 'mouvementStockId'>): {
  montantHT: number
  montantTVA: number
  montantTTC: number
} {
  const montantHT = ligne.quantite * ligne.prixUnitaireHT
  const montantTVA = montantHT * (ligne.tauxTVA / 100)
  const montantTTC = montantHT + montantTVA
  
  return {
    montantHT: parseFloat(montantHT.toFixed(2)),
    montantTVA: parseFloat(montantTVA.toFixed(2)),
    montantTTC: parseFloat(montantTTC.toFixed(2))
  }
}

/**
 * 🆕 PHASE 3 - Créer une nouvelle facture fournisseur
 */
export async function createFactureFournisseur(data: FactureFournisseurInput): Promise<string> {
  try {
    // Générer numéro
    const numero = await genererNumeroFacture()
    const factureId = numero.replace(/-/g, '_')
    
    // Calculer montants pour chaque ligne
    const lignesAvecMontants = data.lignes.map((ligne, index) => {
      const montants = calculerMontantsLigne(ligne)
      return {
        id: `L${(index + 1).toString().padStart(3, '0')}`,
        ...ligne,
        ...montants
      }
    })
    
    // Calculer totaux
    const montantHT = lignesAvecMontants.reduce((sum, l) => sum + l.montantHT, 0)
    const montantTVA = lignesAvecMontants.reduce((sum, l) => sum + l.montantTVA, 0)
    const montantTTC = lignesAvecMontants.reduce((sum, l) => sum + l.montantTTC, 0)
    
    // Créer la facture
    const now = new Date().toISOString()
    const facture: FactureFournisseur = {
      id: factureId,
      numero,
      numeroFournisseur: data.numeroFournisseur,
      fournisseur: data.fournisseur,
      siretFournisseur: data.siretFournisseur,
      dateFacture: data.dateFacture,
      dateEcheance: data.dateEcheance,
      lignes: lignesAvecMontants,
      montantHT: parseFloat(montantHT.toFixed(2)),
      montantTVA: parseFloat(montantTVA.toFixed(2)),
      montantTTC: parseFloat(montantTTC.toFixed(2)),
      pdfURL: data.pdfURL,
      statut: data.statut || 'brouillon',  // ✅ Utilise le statut fourni ou 'brouillon' par défaut
      mouvementsStockIds: [],
      ecrituresComptablesIds: [],
      notes: data.notes,
      createdAt: now,
      createdBy: data.createdBy,
      updatedAt: now
    }
    
    // Sauvegarder (nettoyer les undefined avant Firestore)
    const factureRef = doc(db, COLLECTION, factureId)
    await setDoc(factureRef, cleanUndefined(facture))
    
    return factureId
  } catch (error) {
    console.error('Erreur création facture fournisseur:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Récupérer une facture fournisseur par ID
 */
export async function getFactureFournisseurById(id: string): Promise<FactureFournisseur | null> {
  try {
    const factureRef = doc(db, COLLECTION, id)
    const factureSnap = await getDoc(factureRef)
    
    if (!factureSnap.exists()) {
      return null
    }
    
    return factureSnap.data() as FactureFournisseur
  } catch (error) {
    console.error('Erreur récupération facture fournisseur:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Récupérer toutes les factures fournisseurs
 */
export async function getAllFacturesFournisseurs(): Promise<FactureFournisseur[]> {
  try {
    const facturesRef = collection(db, COLLECTION)
    const q = query(facturesRef, orderBy('dateFacture', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => doc.data() as FactureFournisseur)
  } catch (error) {
    console.error('Erreur récupération factures fournisseurs:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Récupérer les factures fournisseurs par statut
 */
export async function getFacturesFournisseursByStatut(statut: FactureFournisseur['statut']): Promise<FactureFournisseur[]> {
  try {
    const facturesRef = collection(db, COLLECTION)
    const q = query(
      facturesRef,
      where('statut', '==', statut),
      orderBy('dateFacture', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => doc.data() as FactureFournisseur)
  } catch (error) {
    console.error('Erreur récupération factures par statut:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Récupérer les factures fournisseurs par fournisseur
 */
export async function getFacturesFournisseursByFournisseur(fournisseur: string): Promise<FactureFournisseur[]> {
  try {
    const facturesRef = collection(db, COLLECTION)
    const q = query(
      facturesRef,
      where('fournisseur', '==', fournisseur),
      orderBy('dateFacture', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => doc.data() as FactureFournisseur)
  } catch (error) {
    console.error('Erreur récupération factures par fournisseur:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Récupérer les factures fournisseurs par période
 */
export async function getFacturesFournisseursByPeriode(
  dateDebut: string,
  dateFin: string
): Promise<FactureFournisseur[]> {
  try {
    const facturesRef = collection(db, COLLECTION)
    const q = query(
      facturesRef,
      where('dateFacture', '>=', dateDebut),
      where('dateFacture', '<=', dateFin),
      orderBy('dateFacture', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => doc.data() as FactureFournisseur)
  } catch (error) {
    console.error('Erreur récupération factures par période:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Mettre à jour une facture fournisseur
 */
export async function updateFactureFournisseur(
  id: string,
  data: Partial<FactureFournisseur>
): Promise<void> {
  try {
    const factureRef = doc(db, COLLECTION, id)
    
    // Recalculer les montants si les lignes sont modifiées
    if (data.lignes) {
      const montantHT = data.lignes.reduce((sum, l) => sum + l.montantHT, 0)
      const montantTVA = data.lignes.reduce((sum, l) => sum + l.montantTVA, 0)
      const montantTTC = data.lignes.reduce((sum, l) => sum + l.montantTTC, 0)
      
      data.montantHT = parseFloat(montantHT.toFixed(2))
      data.montantTVA = parseFloat(montantTVA.toFixed(2))
      data.montantTTC = parseFloat(montantTTC.toFixed(2))
    }
    
    const updateData = cleanUndefined({
      ...data,
      updatedAt: new Date().toISOString()
    })
    
    await updateDoc(factureRef, updateData)
  } catch (error) {
    console.error('Erreur mise à jour facture fournisseur:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Supprimer une facture fournisseur
 * ⚠️ Uniquement si statut = brouillon
 */
export async function deleteFactureFournisseur(id: string): Promise<void> {
  try {
    // Vérifier le statut
    const facture = await getFactureFournisseurById(id)
    
    if (!facture) {
      throw new Error('Facture non trouvée')
    }
    
    if (facture.statut !== 'brouillon') {
      throw new Error('Impossible de supprimer une facture validée ou payée')
    }
    
    const factureRef = doc(db, COLLECTION, id)
    await deleteDoc(factureRef)
  } catch (error) {
    console.error('Erreur suppression facture fournisseur:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Récupérer la liste des fournisseurs uniques
 */
export async function getListeFournisseurs(): Promise<string[]> {
  try {
    const factures = await getAllFacturesFournisseurs()
    const fournisseurs = Array.from(new Set(factures.map(f => f.fournisseur)))
    return fournisseurs.sort()
  } catch (error) {
    console.error('Erreur récupération liste fournisseurs:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Calculer les statistiques des factures fournisseurs
 */
export async function getStatistiquesFacturesFournisseurs(): Promise<{
  totalMois: { count: number; montant: number }
  enAttenteValidation: { count: number; montant: number }
  aPayer: { count: number; montant: number }
  payees: { count: number; montant: number }
}> {
  try {
    const factures = await getAllFacturesFournisseurs()
    
    // Factures du mois en cours
    const debutMois = new Date()
    debutMois.setDate(1)
    const debutMoisStr = debutMois.toISOString().split('T')[0]
    
    const facturesMois = factures.filter(f => f.dateFacture >= debutMoisStr)
    
    // Statistiques
    const stats = {
      totalMois: {
        count: facturesMois.length,
        montant: facturesMois.reduce((sum, f) => sum + f.montantTTC, 0)
      },
      enAttenteValidation: {
        count: factures.filter(f => f.statut === 'brouillon').length,
        montant: factures.filter(f => f.statut === 'brouillon').reduce((sum, f) => sum + f.montantTTC, 0)
      },
      aPayer: {
        count: factures.filter(f => f.statut === 'validee').length,
        montant: factures.filter(f => f.statut === 'validee').reduce((sum, f) => sum + f.montantTTC, 0)
      },
      payees: {
        count: factures.filter(f => f.statut === 'payee').length,
        montant: factures.filter(f => f.statut === 'payee').reduce((sum, f) => sum + f.montantTTC, 0)
      }
    }
    
    return stats
  } catch (error) {
    console.error('Erreur calcul statistiques:', error)
    throw error
  }
}

// ===============================================
// FONCTIONS MÉTIER (à implémenter Jour 3)
// ===============================================

/**
 * ✅ JOUR 3 - Valider une facture fournisseur
 * → Génère mouvements stock
 * → Génère écritures comptables
 */
export async function validerFactureFournisseur(
  factureId: string,
  validePar: string
): Promise<void> {
  try {
    // 1. Récupérer la facture
    const facture = await getFactureFournisseurById(factureId)
    if (!facture) {
      throw new Error('Facture introuvable')
    }

    // 2. Vérifier le statut
    if (facture.statut !== 'brouillon') {
      throw new Error('Seules les factures en brouillon peuvent être validées')
    }

    const mouvementsIds: string[] = []
    const ecrituresIds: string[] = []

    // 3. Générer les mouvements stock
    for (const ligne of facture.lignes) {
      if (ligne.genererMouvementStock && ligne.articleStockId) {
        // Récupérer l'article pour avoir le code et la description
        const article = await getArticleStockById(ligne.articleStockId)
        if (!article) continue

        // Créer le mouvement stock
        const mouvementId = await createMouvementStock({
          articleId: ligne.articleStockId,
          articleCode: article.code,
          articleDescription: article.description,
          type: 'entree',
          quantite: ligne.quantite,
          date: facture.dateFacture,
          raison: `Facture fournisseur ${facture.numero}`,
          coutUnitaire: ligne.prixUnitaireHT,
          coutTotal: ligne.montantHT,
          depotDestination: ligne.depotDestination,
          operateur: validePar,
          factureId: factureId,
          sourceType: 'facture_fournisseur',
          sourceId: factureId
        })

        mouvementsIds.push(mouvementId)

        // Mettre à jour le stock de l'article
        const newStockParDepot = { ...article.stockParDepot }
        newStockParDepot[ligne.depotDestination] = 
          (newStockParDepot[ligne.depotDestination] || 0) + ligne.quantite

        await updateArticleStock(ligne.articleStockId, {
          stockParDepot: newStockParDepot
        })
      }
    }

    // 4. Générer l'écriture comptable
    const lignesEcriture: any[] = []

    // Débiter les comptes de charges par ligne
    facture.lignes.forEach(ligne => {
      lignesEcriture.push({
        compteNumero: ligne.compteComptable,
        compteIntitule: ligne.compteIntitule,
        debit: ligne.montantHT,
        credit: 0,
        libelle: ligne.designation
      })
    })

    // Débiter la TVA déductible
    if (facture.montantTVA > 0) {
      lignesEcriture.push({
        compteNumero: '44566',
        compteIntitule: 'TVA déductible',
        debit: facture.montantTVA,
        credit: 0,
        libelle: 'TVA déductible'
      })
    }

    // Créditer le compte fournisseur
    lignesEcriture.push({
      compteNumero: '401',
      compteIntitule: `Fournisseur - ${facture.fournisseur}`,
      debit: 0,
      credit: facture.montantTTC,
      libelle: `Facture ${facture.numeroFournisseur}`
    })

    // Créer l'écriture comptable
    const ecritureId = await createEcritureComptable({
      sourceType: 'facture_fournisseur',
      sourceId: factureId,
      dateEcriture: facture.dateFacture,
      societeId: 'solaire-nettoyage', // TODO: Multi-sociétés
      numeroPiece: facture.numeroFournisseur,
      libelle: `Facture fournisseur ${facture.fournisseur} - ${facture.numeroFournisseur}`,
      lignes: lignesEcriture,
      validePar
    })

    ecrituresIds.push(ecritureId)

    // 5. Mettre à jour la facture
    await updateFactureFournisseur(factureId, {
      statut: 'validee',
      mouvementsStockIds: mouvementsIds,
      ecrituresComptablesIds: ecrituresIds,
      validePar,
      dateValidation: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur validation facture fournisseur:', error)
    throw error
  }
}

/**
 * ✅ JOUR 3 - Marquer une facture comme payée
 */
export async function marquerCommePaye(
  factureId: string,
  datePaiement: string,
  modePaiement: FactureFournisseur['modePaiement'],
  referencePaiement?: string
): Promise<void> {
  try {
    // Récupérer la facture
    const facture = await getFactureFournisseurById(factureId)
    if (!facture) {
      throw new Error('Facture introuvable')
    }

    // Vérifier le statut
    if (facture.statut !== 'validee') {
      throw new Error('Seules les factures validées peuvent être marquées comme payées')
    }

    // Mettre à jour
    await updateFactureFournisseur(factureId, {
      statut: 'payee',
      datePaiement,
      modePaiement,
      referencePaiement
    })

  } catch (error) {
    console.error('Erreur marquage paiement:', error)
    throw error
  }
}

/**
 * 🆕 QUICK FIX - Vérifier l'existence d'un doublon de facture fournisseur
 * Recherche par numéro fournisseur + nom fournisseur
 */
export interface DoublonFactureFournisseur {
  existe: boolean
  factures: Array<{
    id: string
    numero: string
    numeroFournisseur: string
    fournisseur: string
    dateFacture: string
    montantTTC: number
    statut: string
  }>
}

export async function checkDoublonFactureFournisseur(
  numeroFournisseur: string,
  fournisseur: string,
  excludeId?: string // Pour exclure la facture en cours de modification
): Promise<DoublonFactureFournisseur> {
  try {
    // Nettoyer et normaliser les inputs
    const numClean = numeroFournisseur.trim().toUpperCase()
    const fournClean = fournisseur.trim().toUpperCase()
    
    // Query Firestore
    const q = query(
      collection(db, COLLECTION),
      where('numeroFournisseur', '==', numeroFournisseur),
      where('fournisseur', '==', fournisseur)
    )
    
    const snapshot = await getDocs(q)
    
    // Filtrer les résultats
    const doublons: DoublonFactureFournisseur['factures'] = []
    
    snapshot.forEach(doc => {
      const data = doc.data() as FactureFournisseur
      
      // Exclure la facture en cours de modification si nécessaire
      if (excludeId && doc.id === excludeId) {
        return
      }
      
      // Vérifier correspondance exacte (case insensitive)
      const dataNumClean = data.numeroFournisseur.trim().toUpperCase()
      const dataFournClean = data.fournisseur.trim().toUpperCase()
      
      if (dataNumClean === numClean && dataFournClean === fournClean) {
        doublons.push({
          id: data.id,
          numero: data.numero,
          numeroFournisseur: data.numeroFournisseur,
          fournisseur: data.fournisseur,
          dateFacture: data.dateFacture,
          montantTTC: data.montantTTC,
          statut: data.statut
        })
      }
    })
    
    return {
      existe: doublons.length > 0,
      factures: doublons
    }
  } catch (error) {
    console.error('Erreur vérification doublon:', error)
    // En cas d'erreur, on retourne pas de doublon pour ne pas bloquer
    return {
      existe: false,
      factures: []
    }
  }
}

/**
 * ⏸️ JOUR 3 - Annuler une facture validée
 * → Supprime mouvements stock
 * → Supprime écritures
 * À IMPLÉMENTER JOUR 3
 */
export async function annulerFactureFournisseur(factureId: string): Promise<void> {
  // TODO: Jour 3
  throw new Error('Non implémenté - Jour 3')
}
