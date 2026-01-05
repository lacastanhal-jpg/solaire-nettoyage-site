import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './config'

// Uploader un rapport PDF
export async function uploadRapport(
  file: File,
  clientId: string,
  interventionNumero: string
): Promise<string> {
  try {
    // Chemin: rapports/{clientId}/{interventionNumero}.pdf
    const filePath = `rapports/${clientId}/${interventionNumero}.pdf`
    const storageRef = ref(storage, filePath)
    
    // Upload le fichier
    await uploadBytes(storageRef, file)
    
    // Récupérer l'URL de téléchargement
    const downloadURL = await getDownloadURL(storageRef)
    
    return downloadURL
  } catch (error) {
    console.error('Erreur upload rapport:', error)
    throw error
  }
}

// Uploader une photo
export async function uploadPhoto(
  file: File,
  clientId: string,
  interventionNumero: string,
  photoIndex: number
): Promise<string> {
  try {
    const extension = file.name.split('.').pop()
    const filePath = `photos/${clientId}/${interventionNumero}/photo_${photoIndex}.${extension}`
    const storageRef = ref(storage, filePath)
    
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    
    return downloadURL
  } catch (error) {
    console.error('Erreur upload photo:', error)
    throw error
  }
}

// Supprimer un rapport
export async function deleteRapport(rapportUrl: string): Promise<void> {
  try {
    const storageRef = ref(storage, rapportUrl)
    await deleteObject(storageRef)
  } catch (error) {
    console.error('Erreur suppression rapport:', error)
    throw error
  }
}

// Supprimer une photo
export async function deletePhoto(photoUrl: string): Promise<void> {
  try {
    const storageRef = ref(storage, photoUrl)
    await deleteObject(storageRef)
  } catch (error) {
    console.error('Erreur suppression photo:', error)
    throw error
  }
}

// Uploader plusieurs photos à la fois
export async function uploadMultiplePhotos(
  files: File[],
  clientId: string,
  interventionNumero: string
): Promise<string[]> {
  try {
    const uploadPromises = files.map((file, index) => 
      uploadPhoto(file, clientId, interventionNumero, index)
    )
    
    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error) {
    console.error('Erreur upload multiple photos:', error)
    throw error
  }
}

// Fonction générique pour uploader n'importe quel fichier
export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error('Erreur upload fichier:', error)
    throw error
  }
}

// Uploader PDF facture fournisseur
export async function uploadFactureFournisseurPDF(
  file: File,
  factureNumero: string
): Promise<string> {
  try {
    // Chemin: factures-fournisseurs/{factureNumero}.pdf
    const filePath = `factures-fournisseurs/${factureNumero}.pdf`
    const storageRef = ref(storage, filePath)
    
    // Upload le fichier
    await uploadBytes(storageRef, file)
    
    // Récupérer l'URL de téléchargement
    const downloadURL = await getDownloadURL(storageRef)
    
    return downloadURL
  } catch (error) {
    console.error('Erreur upload PDF facture fournisseur:', error)
    throw error
  }
}

// Supprimer PDF facture fournisseur
export async function deleteFactureFournisseurPDF(pdfUrl: string): Promise<void> {
  try {
    const storageRef = ref(storage, pdfUrl)
    await deleteObject(storageRef)
  } catch (error) {
    console.error('Erreur suppression PDF facture:', error)
    throw error
  }
}
