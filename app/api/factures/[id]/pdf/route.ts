import { NextRequest, NextResponse } from 'next/server'
import { getFactureById } from '@/lib/firebase/factures'
import { getClientById } from '@/lib/firebase/clients'
import { getSiteById } from '@/lib/firebase/sites'
import { getEntrepriseInfo } from '@/lib/firebase/entreprise'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const facture = await getFactureById(params.id)
    
    if (!facture) {
      return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })
    }

    const entreprise = await getEntrepriseInfo()
    const client = facture.clientId ? await getClientById(facture.clientId) : null
    
    // Récupérer les infos des sites pour chaque ligne
    const lignesAvecSites = await Promise.all(
      facture.lignes.map(async (ligne) => {
        const site = ligne.siteId ? await getSiteById(ligne.siteId) : null
        return { ...ligne, site }
      })
    )
    
    // Créer le PDF
    const doc = new jsPDF()
    
    // ============================================
    // EN-TÊTE ENTREPRISE (gauche)
    // ============================================
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(entreprise?.nomCommercial || entreprise?.raisonSociale || 'SOLAIRE NETTOYAGE', 20, 20)
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    let yPos = 27
    
    if (entreprise?.siegeSocial?.rue) {
      doc.text(entreprise.siegeSocial.rue, 20, yPos)
      yPos += 4
    }
    
    if (entreprise?.siegeSocial?.codePostal && entreprise?.siegeSocial?.ville) {
      doc.text(`${entreprise.siegeSocial.codePostal} ${entreprise.siegeSocial.ville}`, 20, yPos)
      yPos += 4
    }
    
    if (entreprise?.siret) {
      doc.text(`SIRET : ${entreprise.siret}`, 20, yPos)
      yPos += 4
    }
    
    if (entreprise?.numeroTVA) {
      doc.text(`TVA : ${entreprise.numeroTVA}`, 20, yPos)
      yPos += 4
    }
    
    if (entreprise?.capitalSocial) {
      doc.text(`Capital social : ${entreprise.capitalSocial.toLocaleString('fr-FR')} €`, 20, yPos)
      yPos += 4
    }
    
    if (entreprise?.telephone) {
      doc.text(`Tél : ${entreprise.telephone}`, 20, yPos)
      yPos += 4
    }
    
    if (entreprise?.email) {
      doc.text(`Email : ${entreprise.email}`, 20, yPos)
      yPos += 4
    }
    
    // ============================================
    // TITRE FACTURE (droite)
    // ============================================
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURE', 150, 25)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(facture.numero, 150, 35)
    doc.text(`Date : ${new Date(facture.date).toLocaleDateString('fr-FR')}`, 150, 42)
    doc.text(`Échéance : ${new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}`, 150, 49)
    
    // N° Bon de commande client (IMPORTANT pour paiement)
    if (facture.numeroBonCommandeClient) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 200)
      doc.text(`N° Commande : ${facture.numeroBonCommandeClient}`, 150, 56)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
    }
    
    // ============================================
    // INFORMATIONS CLIENT
    // ============================================
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURÉ À :', 20, 75)
    
    doc.setFont('helvetica', 'normal')
    let clientY = 82
    
    doc.setFont('helvetica', 'bold')
    doc.text(facture.clientNom, 20, clientY)
    doc.setFont('helvetica', 'normal')
    clientY += 6
    
    if (client?.adresseFacturation) {
      if (client.adresseFacturation.rue) {
        doc.text(client.adresseFacturation.rue, 20, clientY)
        clientY += 5
      }
      if (client.adresseFacturation.codePostal && client.adresseFacturation.ville) {
        doc.text(
          `${client.adresseFacturation.codePostal} ${client.adresseFacturation.ville}`,
          20,
          clientY
        )
        clientY += 5
      }
    }
    
    // SIRET Client (important pour factures B2B)
    if (client?.siret) {
      doc.setFontSize(9)
      doc.text(`SIRET : ${client.siret}`, 20, clientY)
      clientY += 4
    }
    
    if (client?.numeroTVA) {
      doc.setFontSize(9)
      doc.text(`TVA : ${client.numeroTVA}`, 20, clientY)
      clientY += 4
    }
    
    // ============================================
    // TABLEAU LIGNES DE FACTURE
    // ============================================
    const tableStartY = Math.max(clientY + 10, 115)
    
    const lignesData = lignesAvecSites.map(ligne => {
      // Colonne Article avec site
      let articleText = `${ligne.articleCode}\n${ligne.articleNom}`
      if (ligne.siteNom) {
        articleText += `\n📍 ${ligne.siteNom}`
      }
      // Ajouter adresse site si disponible (adresse sur 3 lignes)
      if (ligne.site?.adresse1) {
        articleText += `\n   ${ligne.site.adresse1}`
        if (ligne.site.adresse2) {
          articleText += `\n   ${ligne.site.adresse2}`
        }
        if (ligne.site.adresse3) {
          articleText += `\n   ${ligne.site.adresse3}`
        }
        if (ligne.site.codePostal && ligne.site.ville) {
          articleText += `\n   ${ligne.site.codePostal} ${ligne.site.ville}`
        }
      }
      
      return [
        articleText,
        ligne.quantite.toString(),
        `${ligne.prixUnitaire.toFixed(2)} €`,
        `${ligne.tva}%`,
        `${ligne.totalHT.toFixed(2)} €`,
        `${ligne.totalTVA.toFixed(2)} €`,
        `${ligne.totalTTC.toFixed(2)} €`
      ]
    })
    
    autoTable(doc, {
      startY: tableStartY,
      head: [['Article / Site', 'Qté', 'PU HT', 'TVA', 'Total HT', 'Total TVA', 'Total TTC']],
      body: lignesData,
      theme: 'grid',
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [50, 50, 50],
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 60 }, // Article + Site (plus large)
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 20, halign: 'right' },
        3: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 22, halign: 'right' },
        6: { cellWidth: 23, halign: 'right' }
      }
    })
    
    // ============================================
    // TOTAUX
    // ============================================
    const finalY = (doc as any).lastAutoTable.finalY + 10
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    
    doc.text('Total HT :', 135, finalY)
    doc.text(`${facture.totalHT.toFixed(2)} €`, 185, finalY, { align: 'right' })
    
    doc.text('Total TVA :', 135, finalY + 6)
    doc.text(`${facture.totalTVA.toFixed(2)} €`, 185, finalY + 6, { align: 'right' })
    
    doc.setFontSize(12)
    doc.text('Total TTC :', 135, finalY + 14)
    doc.text(`${facture.totalTTC.toFixed(2)} €`, 185, finalY + 14, { align: 'right' })
    
    // Reste à payer
    if (facture.resteAPayer > 0) {
      doc.setTextColor(220, 38, 38)
      doc.setFontSize(11)
      doc.text('Reste à payer :', 135, finalY + 22)
      doc.text(`${facture.resteAPayer.toFixed(2)} €`, 185, finalY + 22, { align: 'right' })
      doc.setTextColor(0, 0, 0)
    }
    
    // ============================================
    // CONDITIONS DE PAIEMENT
    // ============================================
    let conditionsY = finalY + 35
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('CONDITIONS DE PAIEMENT :', 20, conditionsY)
    
    doc.setFont('helvetica', 'normal')
    doc.text(facture.conditionsPaiement || 'Paiement à 30 jours', 20, conditionsY + 5)
    
    if (facture.modalitesReglement) {
      doc.text(`Modalités : ${facture.modalitesReglement}`, 20, conditionsY + 10)
      conditionsY += 5
    }
    
    // ============================================
    // COORDONNÉES BANCAIRES (RIB)
    // ============================================
    conditionsY += 12
    
    doc.setFont('helvetica', 'bold')
    doc.text('COORDONNÉES BANCAIRES :', 20, conditionsY)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    
    if (entreprise?.informationsBancaires?.iban) {
      doc.text(`IBAN : ${entreprise.informationsBancaires.iban}`, 20, conditionsY + 5)
    } else {
      doc.text('IBAN : FR76 1234 5678 9012 3456 7890 123', 20, conditionsY + 5)
    }
    
    if (entreprise?.informationsBancaires?.bic) {
      doc.text(`BIC : ${entreprise.informationsBancaires.bic}`, 20, conditionsY + 10)
    } else {
      doc.text('BIC : ABCDEFGH', 20, conditionsY + 10)
    }
    
    if (entreprise?.informationsBancaires?.banque) {
      doc.text(`Banque : ${entreprise.informationsBancaires.banque}`, 20, conditionsY + 15)
    }
    
    // ============================================
    // MENTIONS LÉGALES OBLIGATOIRES
    // ============================================
    const mentionsY = 260
    
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    
    // Pénalités de retard
    doc.text(
      'En cas de retard de paiement, une indemnité forfaitaire de 40€ pour frais de recouvrement sera exigible (Art. L441-6 du Code de Commerce).',
      20,
      mentionsY
    )
    
    doc.text(
      `Taux de pénalités de retard : 10% (3 fois le taux d'intérêt légal). Escompte pour paiement anticipé : néant.`,
      20,
      mentionsY + 4
    )
    
    // TVA
    if (facture.totalTVA > 0) {
      doc.text(
        `TVA applicable - Taux : 20%`,
        20,
        mentionsY + 8
      )
    } else {
      doc.text(
        'TVA non applicable, art. 293 B du CGI (Auto-entrepreneur)',
        20,
        mentionsY + 8
      )
    }
    
    // ============================================
    // FOOTER
    // ============================================
    doc.setFontSize(7)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'bold')
    
    const footerParts = []
    if (entreprise?.nomCommercial || entreprise?.raisonSociale) {
      footerParts.push(entreprise.nomCommercial || entreprise.raisonSociale)
    }
    if (entreprise?.siret) {
      footerParts.push(`SIRET ${entreprise.siret}`)
    }
    if (entreprise?.numeroTVA) {
      footerParts.push(`TVA ${entreprise.numeroTVA}`)
    }
    if (entreprise?.capitalSocial) {
      footerParts.push(`Capital ${entreprise.capitalSocial.toLocaleString('fr-FR')} €`)
    }
    
    doc.text(
      footerParts.join(' - '),
      105,
      285,
      { align: 'center' }
    )
    
    // Générer le PDF
    const pdfBuffer = doc.output('arraybuffer')
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture-${facture.numero}.pdf"`
      }
    })
    
  } catch (error) {
    console.error('Erreur génération PDF:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    )
  }
}
