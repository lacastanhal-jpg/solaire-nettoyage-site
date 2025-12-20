import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Lire le fichier Excel
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    const interventions = [];

    // Parser les lignes (format basé sur ton fichier DEVIS)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Ligne d'intervention (a une Ref et pas "Total")
      if (row[0] && row[0] !== '' && !String(row[1]).includes('Total')) {
        // Convertir les dates Excel en dates JS
        const dateDebut = row[8] 
          ? excelDateToJSDate(row[8])
          : null;
        const dateFin = row[9] 
          ? excelDateToJSDate(row[9])
          : null;

        const intervention = {
          ref: row[0], // Ex: NMSO
          designation: row[1], // Ex: Nettoyage Modules de centrale au sol
          site: {
            nom: row[2], // Nom du site
            surface: row[10] || row[4], // Surface site ou quantité
          },
          client: row[3], // Ex: ENGIE GREEN FRANCE
          quantite: row[4], // Surface en m²
          unite: row[5] || 'm2', // Unité
          prixUnitaire: row[6], // Prix au m²
          montant: row[7], // Montant total
          dateDebut: dateDebut,
          dateFin: dateFin,
          description: row[11] || '', // Description
        };

        interventions.push(intervention);
      }
    }

    return NextResponse.json({
      success: true,
      interventions,
      total: interventions.length,
    });
  } catch (error: any) {
    console.error('Erreur parsing Excel:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la lecture du fichier', details: error.message },
      { status: 500 }
    );
  }
}

// Fonction pour convertir les dates Excel en dates JavaScript
function excelDateToJSDate(excelDate: any): string | null {
  if (!excelDate) return null;
  
  // Si c'est déjà un nombre (date Excel)
  if (typeof excelDate === 'number') {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString();
  }
  
  // Si c'est déjà une date
  if (excelDate instanceof Date) {
    return excelDate.toISOString();
  }
  
  return null;
}
