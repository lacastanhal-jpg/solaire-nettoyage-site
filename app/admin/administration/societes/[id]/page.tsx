'use client';

/**
 * Page détail société (lecture seule)
 * /admin/administration/societes/[id]
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSocieteById } from '@/lib/firebase/societes';
import { Societe } from '@/lib/types/societes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Building2,
  MapPin,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  FileText,
  CreditCard,
} from 'lucide-react';

export default function SocieteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [societe, setSociete] = useState<Societe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSociete();
  }, [id]);

  async function loadSociete() {
    try {
      setLoading(true);
      const data = await getSocieteById(id);
      
      if (!data) {
        setError('Société introuvable');
      } else {
        setSociete(data);
      }
    } catch (err) {
      console.error('Erreur chargement société:', err);
      setError('Erreur lors du chargement de la société');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !societe) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/administration/societes">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux sociétés
          </Button>
        </Link>
        
        <Card className="p-8 text-center border-red-200 bg-red-50">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-900 mb-2">
            {error || 'Société introuvable'}
          </h3>
          <p className="text-red-700 mb-6">
            Cette société n'existe pas ou a été supprimée.
          </p>
          <Link href="/admin/administration/societes">
            <Button>Retour à la liste</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <Link href="/admin/administration/societes">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux sociétés
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
              style={{ backgroundColor: societe.couleur }}
            >
              {societe.nom.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{societe.nom}</h1>
              <p className="text-gray-500 mt-1">{societe.formeJuridique}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge variant={societe.actif ? 'default' : 'secondary'} className="text-sm">
              {societe.actif ? '✓ Active' : '✗ Inactive'}
            </Badge>
            
            <Link href={`/admin/administration/societes/${id}/modifier`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations générales */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informations générales
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">SIRET</label>
              <p className="font-mono font-medium">{societe.siret}</p>
            </div>
            
            {societe.tvaIntracom && (
              <div>
                <label className="text-sm text-gray-500">N° TVA Intracommunautaire</label>
                <p className="font-mono font-medium">{societe.tvaIntracom}</p>
              </div>
            )}
            
            {societe.rcs && (
              <div>
                <label className="text-sm text-gray-500">RCS</label>
                <p className="font-medium">{societe.rcs}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm text-gray-500">Capital social</label>
              <p className="font-medium">{societe.capital.toLocaleString('fr-FR')} €</p>
            </div>
            
            <div>
              <label className="text-sm text-gray-500">Couleur d'affichage</label>
              <div className="flex items-center gap-2 mt-1">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: societe.couleur }}
                />
                <span className="font-mono text-sm">{societe.couleur}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Adresse et contact */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Adresse et contact
          </h3>
          
          <div className="space-y-3">
            {societe.adresse && (
              <div>
                <label className="text-sm text-gray-500">Adresse</label>
                <p className="font-medium">{societe.adresse.rue}</p>
                <p className="font-medium">
                  {societe.adresse.codePostal} {societe.adresse.ville}
                </p>
                {societe.adresse.pays && (
                  <p className="text-sm text-gray-500">{societe.adresse.pays}</p>
                )}
              </div>
            )}
            
            {societe.email && (
              <div>
                <label className="text-sm text-gray-500 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </label>
                <a 
                  href={`mailto:${societe.email}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {societe.email}
                </a>
              </div>
            )}
            
            {societe.telephone && (
              <div>
                <label className="text-sm text-gray-500 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Téléphone
                </label>
                <a 
                  href={`tel:${societe.telephone}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {societe.telephone}
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* Paramètres comptables */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Paramètres comptables
          </h3>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-500 mb-3">PRÉFIXES DOCUMENTS</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Factures:</span>
                  <p className="font-mono font-bold text-lg">{societe.prefixeFacture}</p>
                </div>
                <div>
                  <span className="text-gray-500">Avoirs:</span>
                  <p className="font-mono font-bold text-lg">{societe.prefixeAvoir}</p>
                </div>
                <div>
                  <span className="text-gray-500">Devis:</span>
                  <p className="font-mono font-bold text-lg">{societe.prefixeDevis}</p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-500">Comptes clients</label>
              <p className="font-mono font-medium">{societe.compteClientDebut}xxx</p>
            </div>
            
            <div>
              <label className="text-sm text-gray-500">Comptes fournisseurs</label>
              <p className="font-mono font-medium">{societe.compteFournisseurDebut}xxx</p>
            </div>
          </div>
        </Card>

        {/* Banque */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Informations bancaires
          </h3>
          
          <div className="space-y-3">
            {societe.compteBancaireDefaut ? (
              <div>
                <label className="text-sm text-gray-500">Compte bancaire par défaut</label>
                <p className="font-medium">{societe.compteBancaireDefaut}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Aucun compte bancaire configuré
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Dates */}
      <Card className="p-4 bg-gray-50">
        <div className="flex justify-between text-sm text-gray-600">
          <div>
            <span className="text-gray-500">Créée le:</span>{' '}
            <span className="font-medium">
              {new Date(societe.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Modifiée le:</span>{' '}
            <span className="font-medium">
              {new Date(societe.updatedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
