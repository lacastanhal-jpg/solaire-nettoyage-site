/**
 * Fonctions CRUD Firebase pour la gestion des sociétés
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Societe, SocieteFormData } from '../types/societes';

const COLLECTION_NAME = 'societes';

/**
 * Récupérer toutes les sociétés
 */
export async function getSocietes(): Promise<Societe[]> {
  try {
    const societesRef = collection(db, COLLECTION_NAME);
    const q = query(societesRef, orderBy('nom', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as Societe[];
  } catch (error) {
    console.error('Erreur lors de la récupération des sociétés:', error);
    throw error;
  }
}

/**
 * Récupérer uniquement les sociétés actives
 */
export async function getSocietesActives(): Promise<Societe[]> {
  try {
    const societesRef = collection(db, COLLECTION_NAME);
    const q = query(
      societesRef,
      where("actif", "==", true)
    );
    const snapshot = await getDocs(q);
    
    const societes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as Societe[];
    
    // Tri côté client pour éviter l'index Firebase
    return societes.sort((a, b) => a.nom.localeCompare(b.nom));
  } catch (error) {
    console.error("Erreur lors de la récupération des sociétés actives:", error);
    throw error;
  }
}

/**
 * Récupérer une société par ID
 */
export async function getSocieteById(id: string): Promise<Societe | null> {
  try {
    const societeRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(societeRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as Societe;
  } catch (error) {
    console.error('Erreur lors de la récupération de la société:', error);
    throw error;
  }
}

/**
 * Créer une nouvelle société
 */
export async function createSociete(data: SocieteFormData): Promise<string> {
  try {
    const societeData = {
      nom: data.nom,
      siret: data.siret,
      formeJuridique: data.formeJuridique,
      
      adresse: {
        rue: data.rue,
        ville: data.ville,
        codePostal: data.codePostal,
        pays: data.pays || 'France',
      },
      
      tvaIntracom: data.tvaIntracom,
      rcs: data.rcs,
      capital: data.capital,
      
      actif: data.actif,
      couleur: data.couleur,
      
      prefixeFacture: data.prefixeFacture,
      prefixeAvoir: data.prefixeAvoir,
      prefixeDevis: data.prefixeDevis,
      compteClientDebut: data.compteClientDebut,
      compteFournisseurDebut: data.compteFournisseurDebut,
      
      email: data.email || '',
      telephone: data.telephone || '',
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), societeData);
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de la société:', error);
    throw error;
  }
}

/**
 * Mettre à jour une société
 */
export async function updateSociete(id: string, data: Partial<SocieteFormData>): Promise<void> {
  try {
    const societeRef = doc(db, COLLECTION_NAME, id);
    
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };
    
    if (data.nom !== undefined) updateData.nom = data.nom;
    if (data.siret !== undefined) updateData.siret = data.siret;
    if (data.formeJuridique !== undefined) updateData.formeJuridique = data.formeJuridique;
    
    // Adresse
    if (data.rue !== undefined || data.ville !== undefined || data.codePostal !== undefined || data.pays !== undefined) {
      updateData.adresse = {};
      if (data.rue !== undefined) updateData.adresse.rue = data.rue;
      if (data.ville !== undefined) updateData.adresse.ville = data.ville;
      if (data.codePostal !== undefined) updateData.adresse.codePostal = data.codePostal;
      if (data.pays !== undefined) updateData.adresse.pays = data.pays;
    }
    
    if (data.tvaIntracom !== undefined) updateData.tvaIntracom = data.tvaIntracom;
    if (data.rcs !== undefined) updateData.rcs = data.rcs;
    if (data.capital !== undefined) updateData.capital = data.capital;
    if (data.actif !== undefined) updateData.actif = data.actif;
    if (data.couleur !== undefined) updateData.couleur = data.couleur;
    
    // Paramètres comptables
    if (data.prefixeFacture !== undefined) updateData.prefixeFacture = data.prefixeFacture;
    if (data.prefixeAvoir !== undefined) updateData.prefixeAvoir = data.prefixeAvoir;
    if (data.prefixeDevis !== undefined) updateData.prefixeDevis = data.prefixeDevis;
    if (data.compteClientDebut !== undefined) updateData.compteClientDebut = data.compteClientDebut;
    if (data.compteFournisseurDebut !== undefined) updateData.compteFournisseurDebut = data.compteFournisseurDebut;
    
    // Contact
    if (data.email !== undefined) updateData.email = data.email;
    if (data.telephone !== undefined) updateData.telephone = data.telephone;
    
    await updateDoc(societeRef, updateData);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la société:', error);
    throw error;
  }
}

/**
 * Désactiver une société (soft delete)
 */
export async function desactiverSociete(id: string): Promise<void> {
  try {
    const societeRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(societeRef, {
      actif: false,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erreur lors de la désactivation de la société:', error);
    throw error;
  }
}

/**
 * Réactiver une société
 */
export async function reactiverSociete(id: string): Promise<void> {
  try {
    const societeRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(societeRef, {
      actif: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erreur lors de la réactivation de la société:', error);
    throw error;
  }
}

/**
 * Supprimer définitivement une société (à utiliser avec précaution)
 */
export async function deleteSociete(id: string): Promise<void> {
  try {
    // ATTENTION : Vérifier qu'il n'y a pas de factures/devis/etc. liés
    // avant de supprimer définitivement
    const societeRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(societeRef);
  } catch (error) {
    console.error('Erreur lors de la suppression de la société:', error);
    throw error;
  }
}

/**
 * Vérifier si un SIRET existe déjà
 */
export async function siretExists(siret: string, excludeId?: string): Promise<boolean> {
  try {
    const societesRef = collection(db, COLLECTION_NAME);
    const q = query(societesRef, where('siret', '==', siret));
    const snapshot = await getDocs(q);
    
    if (excludeId) {
      // Exclure la société en cours de modification
      return snapshot.docs.some(doc => doc.id !== excludeId);
    }
    
    return !snapshot.empty;
  } catch (error) {
    console.error('Erreur lors de la vérification du SIRET:', error);
    throw error;
  }
}

/**
 * Récupérer la société par défaut (Solaire Nettoyage)
 */
export async function getSocieteDefaut(): Promise<Societe | null> {
  try {
    const societesRef = collection(db, COLLECTION_NAME);
    const q = query(
      societesRef,
      where('nom', '==', 'SAS SOLAIRE NETTOYAGE'),
      where('actif', '==', true)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as Societe;
  } catch (error) {
    console.error('Erreur lors de la récupération de la société par défaut:', error);
    throw error;
  }
}
