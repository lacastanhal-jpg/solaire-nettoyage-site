'use client';

/**
 * Page liste des sociétés du groupe GELY
 * /admin/administration/societes
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSocietes, desactiverSociete, reactiverSociete } from '@/lib/firebase/societes';
import { Societe } from '@/lib/types/societes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Building2,
  Plus,
  Edit,
  Power,
  PowerOff,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SocietesPage() {
  const router = useRouter();
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [societeToToggle, setSocieteToToggle] = useState<Societe | null>(null);

  useEffect(() => {
    loadSocietes();
  }, []);

  async function loadSocietes() {
    try {
      setLoading(true);
      const data = await getSocietes();
      setSocietes(data);
      setError(null);
    } catch (err) {
      console.error('Erreur chargement sociétés:', err);
      setError('Erreur lors du chargement des sociétés');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActif(societe: Societe) {
    try {
      setActionLoading(societe.id);
      
      if (societe.actif) {
        await desactiverSociete(societe.id);
      } else {
        await reactiverSociete(societe.id);
      }
      
      await loadSocietes();
      setSocieteToToggle(null);
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la modification de la société');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Chargement des sociétés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            Sociétés du Groupe GELY
          </h1>
          <p className="text-gray-500 mt-1">
            Gestion des sociétés et paramètres comptables
          </p>
        </div>
        
        <Link href="/admin/administration/societes/nouvelle">
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Société
          </Button>
        </Link>
      </div>

      {/* Erreur */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {/* Liste sociétés */}
      {societes.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucune société</h3>
            <p className="text-gray-500 mb-6">
              Commencez par créer votre première société du groupe
            </p>
            <Link href="/admin/administration/societes/nouvelle">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer une société
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {societes.map((societe) => (
            <Card 
              key={societe.id} 
              className="p-6"
              style={{ borderLeftWidth: '4px', borderLeftColor: societe.couleur }}
            >
              {/* En-tête carte */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: societe.couleur }}
                  >
                    {societe.nom.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{societe.nom}</h3>
                    <p className="text-sm text-gray-500">{societe.formeJuridique}</p>
                  </div>
                </div>
                
                <Badge variant={societe.actif ? 'default' : 'secondary'}>
                  {societe.actif ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Informations */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="h-4 w-4" />
                  <span>SIRET: {societe.siret}</span>
                </div>
                
                {societe.adresse && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {societe.adresse.rue}, {societe.adresse.codePostal} {societe.adresse.ville}
                    </span>
                  </div>
                )}
                
                {societe.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{societe.email}</span>
                  </div>
                )}
                
                {societe.telephone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{societe.telephone}</span>
                  </div>
                )}
              </div>

              {/* Paramètres comptables */}
              <div className="bg-gray-50 rounded p-3 mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">PARAMÈTRES COMPTABLES</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Factures:</span>
                    <span className="ml-1 font-mono">{societe.prefixeFacture}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Avoirs:</span>
                    <span className="ml-1 font-mono">{societe.prefixeAvoir}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Devis:</span>
                    <span className="ml-1 font-mono">{societe.prefixeDevis}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link href={`/admin/administration/societes/${societe.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </Link>
                
                <Button
                  variant={societe.actif ? 'destructive' : 'default'}
                  onClick={() => setSocieteToToggle(societe)}
                  disabled={actionLoading === societe.id}
                >
                  {actionLoading === societe.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : societe.actif ? (
                    <PowerOff className="h-4 w-4" />
                  ) : (
                    <Power className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog confirmation activation/désactivation */}
      <AlertDialog open={!!societeToToggle} onOpenChange={() => setSocieteToToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {societeToToggle?.actif ? 'Désactiver' : 'Activer'} la société ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {societeToToggle?.actif ? (
                <>
                  La société <strong>{societeToToggle?.nom}</strong> ne sera plus disponible 
                  dans les formulaires. Les documents existants resteront accessibles.
                </>
              ) : (
                <>
                  La société <strong>{societeToToggle?.nom}</strong> sera à nouveau disponible 
                  dans les formulaires.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => societeToToggle && handleToggleActif(societeToToggle)}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
