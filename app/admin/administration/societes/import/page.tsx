'use client';

/**
 * Page d'import automatique des sociétés GELY
 * /admin/administration/societes/import
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSociete, siretExists } from '@/lib/firebase/societes';
import { SocieteFormData } from '@/lib/types/societes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Download, Loader2, CheckCircle, XCircle } from 'lucide-react';

const SOCIETES_GELY: SocieteFormData[] = [
  {
    nom: 'SAS SOLAIRE NETTOYAGE',
    siret: '820 504 421 00000',
    formeJuridique: 'SAS',
    rue: '511 Impasse de Saint Rames',
    ville: 'Vaureilles',
    codePostal: '12220',
    pays: 'France',
    tvaIntracom: 'FR09820504421',
    rcs: 'RCS Rodez 820 504 421',
    capital: 1000,
    actif: true,
    couleur: '#3B82F6',
    prefixeFacture: 'FA',
    prefixeAvoir: 'AV',
    prefixeDevis: 'DE',
    compteClientDebut: '411',
    compteFournisseurDebut: '401',
    email: 'contact@solairenettoyage.fr',
    telephone: '05 65 80 45 25',
  },
  {
    nom: 'GELY INVESTISSEMENT HOLDING',
    siret: '123 456 789 00001',
    formeJuridique: 'Holding',
    rue: '511 Impasse de Saint Rames',
    ville: 'Vaureilles',
    codePostal: '12220',
    pays: 'France',
    tvaIntracom: 'FR12123456789',
    rcs: 'RCS Rodez 123 456 789',
    capital: 1000,
    actif: true,
    couleur: '#8B5CF6',
    prefixeFacture: 'FH',
    prefixeAvoir: 'AH',
    prefixeDevis: 'DH',
    compteClientDebut: '411',
    compteFournisseurDebut: '401',
    email: '',
    telephone: '',
  },
  {
    nom: 'LEXA',
    siret: '234 567 890 00002',
    formeJuridique: 'SAS',
    rue: '511 Impasse de Saint Rames',
    ville: 'Vaureilles',
    codePostal: '12220',
    pays: 'France',
    tvaIntracom: 'FR34234567890',
    rcs: 'RCS Rodez 234 567 890',
    capital: 1000,
    actif: true,
    couleur: '#10B981',
    prefixeFacture: 'FL1',
    prefixeAvoir: 'AL1',
    prefixeDevis: 'DL1',
    compteClientDebut: '411',
    compteFournisseurDebut: '401',
    email: '',
    telephone: '',
  },
  {
    nom: 'LEXA 2',
    siret: '345 678 901 00003',
    formeJuridique: 'SAS',
    rue: '511 Impasse de Saint Rames',
    ville: 'Vaureilles',
    codePostal: '12220',
    pays: 'France',
    tvaIntracom: 'FR45345678901',
    rcs: 'RCS Rodez 345 678 901',
    capital: 1000,
    actif: true,
    couleur: '#F59E0B',
    prefixeFacture: 'FL2',
    prefixeAvoir: 'AL2',
    prefixeDevis: 'DL2',
    compteClientDebut: '411',
    compteFournisseurDebut: '401',
    email: '',
    telephone: '',
  },
  {
    nom: 'SCI GELY',
    siret: '456 789 012 00004',
    formeJuridique: 'SCI',
    rue: '511 Impasse de Saint Rames',
    ville: 'Vaureilles',
    codePostal: '12220',
    pays: 'France',
    tvaIntracom: 'FR56456789012',
    rcs: 'RCS Rodez 456 789 012',
    capital: 1000,
    actif: true,
    couleur: '#EF4444',
    prefixeFacture: 'FS',
    prefixeAvoir: 'AS',
    prefixeDevis: 'DS',
    compteClientDebut: '411',
    compteFournisseurDebut: '401',
    email: '',
    telephone: '',
  },
];

export default function ImportSocietesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resultats, setResultats] = useState<Array<{
    nom: string;
    statut: 'success' | 'error' | 'skip';
    message: string;
  }>>([]);

  async function handleImport() {
    if (!confirm('Importer les 5 sociétés du groupe GELY ?\n\nATTENTION : À faire UNE SEULE FOIS !')) {
      return;
    }

    setLoading(true);
    const nouveauxResultats: typeof resultats = [];

    for (const societe of SOCIETES_GELY) {
      try {
        // Vérifier si le SIRET existe déjà
        const exists = await siretExists(societe.siret);
        
        if (exists) {
          nouveauxResultats.push({
            nom: societe.nom,
            statut: 'skip',
            message: 'Déjà existante (SIRET identique)',
          });
          continue;
        }

        // Créer la société
        await createSociete(societe);
        
        nouveauxResultats.push({
          nom: societe.nom,
          statut: 'success',
          message: 'Créée avec succès',
        });

      } catch (error: any) {
        nouveauxResultats.push({
          nom: societe.nom,
          statut: 'error',
          message: error.message || 'Erreur inconnue',
        });
      }
    }

    setResultats(nouveauxResultats);
    setLoading(false);

    // Si tout s'est bien passé, rediriger après 3 secondes
    const erreurs = nouveauxResultats.filter(r => r.statut === 'error');
    if (erreurs.length === 0) {
      setTimeout(() => {
        router.push('/admin/administration/societes');
      }, 3000);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <Link href="/admin/administration/societes">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux sociétés
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold">Import automatique des sociétés</h1>
        <p className="text-gray-500 mt-1">
          Créer automatiquement les 5 sociétés du groupe GELY
        </p>
      </div>

      {/* Liste des sociétés à importer */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Sociétés qui seront créées :</h3>
        
        <div className="space-y-3">
          {SOCIETES_GELY.map((societe) => (
            <div 
              key={societe.siret}
              className="flex items-center gap-3 p-3 border rounded"
              style={{ borderLeftWidth: '4px', borderLeftColor: societe.couleur }}
            >
              <div 
                className="w-10 h-10 rounded flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: societe.couleur }}
              >
                {societe.nom.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{societe.nom}</p>
                <p className="text-sm text-gray-500">{societe.formeJuridique} - {societe.siret}</p>
              </div>
              <div className="text-xs font-mono text-gray-500">
                {societe.prefixeFacture}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleImport}
            disabled={loading || resultats.length > 0}
            size="lg"
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Importer les 5 sociétés
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Résultats */}
      {resultats.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Résultats de l'import :</h3>
          
          <div className="space-y-2">
            {resultats.map((resultat, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded ${
                  resultat.statut === 'success'
                    ? 'bg-green-50 text-green-900'
                    : resultat.statut === 'skip'
                    ? 'bg-gray-50 text-gray-900'
                    : 'bg-red-50 text-red-900'
                }`}
              >
                {resultat.statut === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : resultat.statut === 'skip' ? (
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{resultat.nom}</p>
                  <p className="text-sm">{resultat.message}</p>
                </div>
              </div>
            ))}
          </div>

          {resultats.filter(r => r.statut === 'error').length === 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-900 font-medium">
                ✅ Import terminé avec succès !
              </p>
              <p className="text-sm text-green-700 mt-1">
                Redirection vers la liste des sociétés dans 3 secondes...
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
