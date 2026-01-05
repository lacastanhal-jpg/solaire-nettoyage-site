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

const COLLECTION = 'ecritures_comptables'

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
 * 🆕 PHASE 3 - Interface Ligne Écriture
 */
export interface LigneEcriture {
  id: string
  
  // Compte
  compteComptable: string         // 6063, 401, 44566, etc.
  compteIntitule: string
  
  // Montant
  sens: 'debit' | 'credit'
  montant: number
  
  // Détails
  libelle: string
  
  // Tiers (si compte 401, 411)
  tiersType?: 'fournisseur' | 'client'
  tiersId?: string
  tiersNom?: string
  
  // Lettrage (Phase 4)
  lettree: boolean
  lettrageId?: string
  dateLettrage?: string
}

/**
 * 🆕 PHASE 3 - Interface Écriture Comptable
 */
export interface EcritureComptable {
  id: string                      // EC-2026-0001
  
  // Origine
  sourceType: 'facture_fournisseur' | 'facture_client' | 'note_frais' | 'manuel'
  sourceId: string                // ID document source
  
  // Date
  dateEcriture: string            // Date pièce comptable
  dateComptabilisation: string    // Date saisie
  
  // Société
  societeId: string               // Multi-sociétés ready
  
  // Pièce
  numeroPiece: string             // N° facture
  libelle: string                 // Description
  pdfURL?: string                 // Justificatif
  
  // Lignes d'écriture
  lignes: LigneEcriture[]
  
  // Équilibre (vérification)
  totalDebit: number
  totalCredit: number
  equilibre: boolean              // totalDebit === totalCredit
  
  // Traçabilité
  validePar: string               // userId
  dateValidation: string
  
  statut: 'validee' | 'lettree'   // Lettrée après rapprochement bancaire
  
  createdAt: string
  updatedAt: string
}

/**
 * 🆕 PHASE 3 - Input pour création écriture comptable
 */
export interface EcritureComptableInput {
  sourceType: EcritureComptable['sourceType']
  sourceId: string
  dateEcriture: string
  societeId: string
  numeroPiece: string
  libelle: string
  pdfURL?: string
  lignes: Omit<LigneEcriture, 'id' | 'lettree'>[]
  validePar: string
}

/**
 * 🆕 PHASE 3 - Générer le prochain numéro d'écriture comptable
 */
async function genererNumeroEcriture(): Promise<string> {
  try {
    const year = new Date().getFullYear()
    const ecrituresRef = collection(db, COLLECTION)
    const q = query(
      ecrituresRef,
      where('id', '>=', `EC-${year}-0000`),
      where('id', '<=', `EC-${year}-9999`),
      orderBy('id', 'desc')
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return `EC-${year}-0001`
    }
    
    const dernierId = snapshot.docs[0].id
    const dernierIndex = parseInt(dernierId.split('-')[2])
    const nouveauIndex = dernierIndex + 1
    
    return `EC-${year}-${nouveauIndex.toString().padStart(4, '0')}`
  } catch (error) {
    console.error('Erreur génération numéro écriture:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Vérifier l'équilibre d'une écriture comptable
 */
function verifierEquilibreEcriture(lignes: Omit<LigneEcriture, 'id' | 'lettree'>[]): {
  totalDebit: number
  totalCredit: number
  equilibre: boolean
} {
  const totalDebit = lignes
    .filter(l => l.sens === 'debit')
    .reduce((sum, l) => sum + l.montant, 0)
  
  const totalCredit = lignes
    .filter(l => l.sens === 'credit')
    .reduce((sum, l) => sum + l.montant, 0)
  
  // Arrondir pour éviter les problèmes de précision
  const debit = parseFloat(totalDebit.toFixed(2))
  const credit = parseFloat(totalCredit.toFixed(2))
  
  return {
    totalDebit: debit,
    totalCredit: credit,
    equilibre: debit === credit
  }
}

/**
 * 🆕 PHASE 3 - Créer une nouvelle écriture comptable
 */
export async function createEcritureComptable(data: EcritureComptableInput): Promise<string> {
  try {
    // Vérifier l'équilibre
    const equilibreData = verifierEquilibreEcriture(data.lignes)
    
    if (!equilibreData.equilibre) {
      throw new Error(
        `Écriture déséquilibrée: Débit ${equilibreData.totalDebit}€ ≠ Crédit ${equilibreData.totalCredit}€`
      )
    }
    
    // Générer numéro
    const ecritureId = await genererNumeroEcriture()
    
    // Ajouter IDs aux lignes
    const lignesAvecId = data.lignes.map((ligne, index) => ({
      id: `L${(index + 1).toString().padStart(3, '0')}`,
      ...ligne,
      lettree: false
    }))
    
    // Créer l'écriture
    const now = new Date().toISOString()
    const ecriture: EcritureComptable = {
      id: ecritureId,
      sourceType: data.sourceType,
      sourceId: data.sourceId,
      dateEcriture: data.dateEcriture,
      dateComptabilisation: now,
      societeId: data.societeId,
      numeroPiece: data.numeroPiece,
      libelle: data.libelle,
      pdfURL: data.pdfURL,
      lignes: lignesAvecId,
      totalDebit: equilibreData.totalDebit,
      totalCredit: equilibreData.totalCredit,
      equilibre: equilibreData.equilibre,
      validePar: data.validePar,
      dateValidation: now,
      statut: 'validee',
      createdAt: now,
      updatedAt: now
    }
    
    // Sauvegarder (nettoyer les undefined avant Firestore)
    const ecritureRef = doc(db, COLLECTION, ecritureId)
    await setDoc(ecritureRef, cleanUndefined(ecriture))
    
    return ecritureId
  } catch (error) {
    console.error('Erreur création écriture comptable:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Récupérer une écriture comptable par ID
 */
export async function getEcritureComptableById(id: string): Promise<EcritureComptable | null> {
  try {
    const ecritureRef = doc(db, COLLECTION, id)
    const ecritureSnap = await getDoc(ecritureRef)
    
    if (!ecritureSnap.exists()) {
      return null
    }
    
    return ecritureSnap.data() as EcritureComptable
  } catch (error) {
    console.error('Erreur récupération écriture comptable:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Récupérer toutes les écritures comptables
 */
export async function getEcrituresComptables(
  societeId?: string
): Promise<EcritureComptable[]> {
  try {
    const ecrituresRef = collection(db, COLLECTION)
    
    let q
    if (societeId) {
      q = query(
        ecrituresRef,
        where('societeId', '==', societeId),
        orderBy('dateEcriture', 'desc')
      )
    } else {
      q = query(ecrituresRef, orderBy('dateEcriture', 'desc'))
    }
    
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => doc.data() as EcritureComptable)
  } catch (error) {
    console.error('Erreur récupération écritures comptables:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Récupérer les écritures par période
 */
export async function getEcrituresByPeriode(
  dateDebut: string,
  dateFin: string,
  societeId?: string
): Promise<EcritureComptable[]> {
  try {
    const ecrituresRef = collection(db, COLLECTION)
    
    let q
    if (societeId) {
      q = query(
        ecrituresRef,
        where('societeId', '==', societeId),
        where('dateEcriture', '>=', dateDebut),
        where('dateEcriture', '<=', dateFin),
        orderBy('dateEcriture', 'desc')
      )
    } else {
      q = query(
        ecrituresRef,
        where('dateEcriture', '>=', dateDebut),
        where('dateEcriture', '<=', dateFin),
        orderBy('dateEcriture', 'desc')
      )
    }
    
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => doc.data() as EcritureComptable)
  } catch (error) {
    console.error('Erreur récupération écritures par période:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Récupérer les écritures par compte
 */
export async function getEcrituresByCompte(
  compteComptable: string,
  societeId?: string
): Promise<EcritureComptable[]> {
  try {
    // Récupérer toutes les écritures (filtrage en JS car array)
    const ecritures = await getEcrituresComptables(societeId)
    
    // Filtrer celles qui contiennent le compte
    return ecritures.filter(ecriture => 
      ecriture.lignes.some(ligne => ligne.compteComptable === compteComptable)
    )
  } catch (error) {
    console.error('Erreur récupération écritures par compte:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Récupérer les écritures par source
 */
export async function getEcrituresBySource(
  sourceType: EcritureComptable['sourceType'],
  sourceId: string
): Promise<EcritureComptable[]> {
  try {
    const ecrituresRef = collection(db, COLLECTION)
    const q = query(
      ecrituresRef,
      where('sourceType', '==', sourceType),
      where('sourceId', '==', sourceId),
      orderBy('dateEcriture', 'desc')
    )
    
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => doc.data() as EcritureComptable)
  } catch (error) {
    console.error('Erreur récupération écritures par source:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Mettre à jour une écriture comptable
 * ⚠️ Attention : modification d'écritures validées = déconseillé
 */
export async function updateEcritureComptable(
  id: string,
  data: Partial<EcritureComptable>
): Promise<void> {
  try {
    const ecritureRef = doc(db, COLLECTION, id)
    
    // Si modification des lignes, revérifier l'équilibre
    if (data.lignes) {
      const equilibreData = verifierEquilibreEcriture(
        data.lignes.map(l => ({
          compteComptable: l.compteComptable,
          compteIntitule: l.compteIntitule,
          sens: l.sens,
          montant: l.montant,
          libelle: l.libelle,
          tiersType: l.tiersType,
          tiersId: l.tiersId,
          tiersNom: l.tiersNom
        }))
      )
      
      if (!equilibreData.equilibre) {
        throw new Error('Écriture déséquilibrée après modification')
      }
      
      data.totalDebit = equilibreData.totalDebit
      data.totalCredit = equilibreData.totalCredit
      data.equilibre = equilibreData.equilibre
    }
    
    const updateData = cleanUndefined({
      ...data,
      updatedAt: new Date().toISOString()
    })
    
    await updateDoc(ecritureRef, updateData)
  } catch (error) {
    console.error('Erreur mise à jour écriture comptable:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Supprimer une écriture comptable
 * ⚠️ ATTENTION : Suppression = opération sensible !
 */
export async function deleteEcritureComptable(id: string): Promise<void> {
  try {
    const ecritureRef = doc(db, COLLECTION, id)
    await deleteDoc(ecritureRef)
  } catch (error) {
    console.error('Erreur suppression écriture comptable:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Lettrer une ligne d'écriture
 * À IMPLÉMENTER PHASE 4 (Rapprochement bancaire)
 */
export async function lettrerLigneEcriture(
  ecritureId: string,
  ligneId: string,
  lettrageId: string
): Promise<void> {
  try {
    const ecriture = await getEcritureComptableById(ecritureId)
    
    if (!ecriture) {
      throw new Error('Écriture non trouvée')
    }
    
    // Mettre à jour la ligne
    const lignes = ecriture.lignes.map(ligne => {
      if (ligne.id === ligneId) {
        return {
          ...ligne,
          lettree: true,
          lettrageId,
          dateLettrage: new Date().toISOString()
        }
      }
      return ligne
    })
    
    // Vérifier si toutes les lignes sont lettrées
    const toutesLettrees = lignes.every(l => l.lettree)
    
    await updateEcritureComptable(ecritureId, {
      lignes,
      statut: toutesLettrees ? 'lettree' : 'validee'
    })
  } catch (error) {
    console.error('Erreur lettrage ligne écriture:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Calculer le total par compte sur une période
 */
export async function getTotalParCompte(
  compteComptable: string,
  dateDebut: string,
  dateFin: string,
  societeId?: string
): Promise<{
  totalDebit: number
  totalCredit: number
  solde: number
}> {
  try {
    const ecritures = await getEcrituresByPeriode(dateDebut, dateFin, societeId)
    
    let totalDebit = 0
    let totalCredit = 0
    
    ecritures.forEach(ecriture => {
      ecriture.lignes.forEach(ligne => {
        if (ligne.compteComptable === compteComptable) {
          if (ligne.sens === 'debit') {
            totalDebit += ligne.montant
          } else {
            totalCredit += ligne.montant
          }
        }
      })
    })
    
    return {
      totalDebit: parseFloat(totalDebit.toFixed(2)),
      totalCredit: parseFloat(totalCredit.toFixed(2)),
      solde: parseFloat((totalDebit - totalCredit).toFixed(2))
    }
  } catch (error) {
    console.error('Erreur calcul total par compte:', error)
    throw error
  }
}

/**
 * 🆕 PHASE 3 - Obtenir la balance des comptes
 * Balance = Liste des comptes avec totaux débit/crédit/solde
 */
export async function getBalance(
  dateDebut: string,
  dateFin: string,
  societeId?: string
): Promise<Array<{
  compte: string
  intitule: string
  totalDebit: number
  totalCredit: number
  solde: number
}>> {
  try {
    const ecritures = await getEcrituresByPeriode(dateDebut, dateFin, societeId)
    
    // Agréger par compte
    const comptesMap = new Map<string, {
      intitule: string
      totalDebit: number
      totalCredit: number
    }>()
    
    ecritures.forEach(ecriture => {
      ecriture.lignes.forEach(ligne => {
        const compte = ligne.compteComptable
        
        if (!comptesMap.has(compte)) {
          comptesMap.set(compte, {
            intitule: ligne.compteIntitule,
            totalDebit: 0,
            totalCredit: 0
          })
        }
        
        const data = comptesMap.get(compte)!
        
        if (ligne.sens === 'debit') {
          data.totalDebit += ligne.montant
        } else {
          data.totalCredit += ligne.montant
        }
      })
    })
    
    // Transformer en tableau
    const balance = Array.from(comptesMap.entries()).map(([compte, data]) => ({
      compte,
      intitule: data.intitule,
      totalDebit: parseFloat(data.totalDebit.toFixed(2)),
      totalCredit: parseFloat(data.totalCredit.toFixed(2)),
      solde: parseFloat((data.totalDebit - data.totalCredit).toFixed(2))
    }))
    
    // Trier par numéro de compte
    return balance.sort((a, b) => a.compte.localeCompare(b.compte))
  } catch (error) {
    console.error('Erreur calcul balance:', error)
    throw error
  }
}

// ===============================================
// FONCTIONS EXPORT (à implémenter Phase 6)
// ===============================================

/**
 * 🆕 SESSION 6 - Exporter les écritures au format FEC
 * Format légal DGFiP pour contrôles fiscaux
 */
export async function exportEcrituresFEC(
  societeId: string,
  dateDebut: string,
  dateFin: string
): Promise<string> {
  try {
    // Récupérer les écritures
    const ecritures = await getEcrituresByPeriode(dateDebut, dateFin, societeId)
    
    // En-tête FEC (obligatoire)
    const header = [
      'JournalCode',
      'JournalLib',
      'EcritureNum',
      'EcritureDate',
      'CompteNum',
      'CompteLib',
      'CompAuxNum',
      'CompAuxLib',
      'PieceRef',
      'PieceDate',
      'EcritureLib',
      'Debit',
      'Credit',
      'EcritureLet',
      'DateLet',
      'ValidDate',
      'Montantdevise',
      'Idevise'
    ].join('|')
    
    // Construire les lignes FEC
    const lignesFEC: string[] = [header]
    
    ecritures.forEach(ecriture => {
      // Déterminer le code journal selon le type source
      const journalCode = getJournalCode(ecriture.sourceType)
      const journalLib = getJournalLibelle(ecriture.sourceType)
      
      ecriture.lignes.forEach(ligne => {
        // Format date YYYYMMDD
        const ecritureDate = ecriture.dateEcriture.replace(/-/g, '')
        const pieceDate = ecriture.dateEcriture.replace(/-/g, '')
        const validDate = ecriture.dateValidation.split('T')[0].replace(/-/g, '')
        
        // Comptes auxiliaires (fournisseur/client)
        const compAuxNum = ligne.tiersId || ''
        const compAuxLib = ligne.tiersNom || ''
        
        // Lettrage
        const ecrLet = ligne.lettree ? (ligne.lettrageId || '') : ''
        const dateLet = ligne.lettree && ligne.dateLettrage 
          ? ligne.dateLettrage.replace(/-/g, '') 
          : ''
        
        // Montants (format avec 2 décimales, virgule comme séparateur)
        const debit = ligne.sens === 'debit' 
          ? ligne.montant.toFixed(2).replace('.', ',')
          : '0,00'
        const credit = ligne.sens === 'credit' 
          ? ligne.montant.toFixed(2).replace('.', ',')
          : '0,00'
        
        // Ligne FEC
        const ligneFEC = [
          journalCode,
          journalLib,
          ecriture.id,
          ecritureDate,
          ligne.compteComptable,
          ligne.compteIntitule,
          compAuxNum,
          compAuxLib,
          ecriture.numeroPiece,
          pieceDate,
          ligne.libelle || ecriture.libelle,
          debit,
          credit,
          ecrLet,
          dateLet,
          validDate,
          '', // Montant devise (optionnel)
          ''  // Code devise (optionnel)
        ].join('|')
        
        lignesFEC.push(ligneFEC)
      })
    })
    
    return lignesFEC.join('\n')
  } catch (error) {
    console.error('Erreur export FEC:', error)
    throw error
  }
}

/**
 * Déterminer le code journal selon le type de source
 */
function getJournalCode(sourceType: EcritureComptable['sourceType']): string {
  switch (sourceType) {
    case 'facture_client':
      return 'VE'
    case 'facture_fournisseur':
      return 'AC'
    case 'note_frais':
      return 'AC'
    case 'manuel':
      return 'OD'
    default:
      return 'OD'
  }
}

/**
 * Déterminer le libellé journal selon le type de source
 */
function getJournalLibelle(sourceType: EcritureComptable['sourceType']): string {
  switch (sourceType) {
    case 'facture_client':
      return 'Journal des ventes'
    case 'facture_fournisseur':
      return 'Journal des achats'
    case 'note_frais':
      return 'Journal des achats'
    case 'manuel':
      return 'Journal des opérations diverses'
    default:
      return 'Journal des opérations diverses'
  }
}

/**
 * ⏸️ PHASE 6 - Exporter les écritures au format Excel
 * À IMPLÉMENTER PHASE 6
 */
export async function exportEcrituresExcel(
  societeId: string,
  dateDebut: string,
  dateFin: string
): Promise<Blob> {
  // TODO: Phase 6
  throw new Error('Non implémenté - Phase 6')
}
