'use client';

/**
 * Page modification société
 * /admin/administration/societes/[id]/modifier
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSocieteById, updateSociete, siretExists } from '@/lib/firebase/societes';
import { Societe, SocieteFormData, FORMES_JURIDIQUES, COULEURS_SOCIETES } from '@/lib/types/societes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ModifierSocietePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [societe, setSociete] = useState<Societe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<SocieteFormData>({
    nom: '',
    siret: '',
    formeJuridique: 'SAS',
    rue: '',
    ville: '',
    codePostal: '',
    pays: 'France',
    tvaIntracom: '',
    rcs: '',
    capital: 0,
    actif: true,
    couleur: '#3B82F6',
    prefixeFacture: 'FA',
    prefixeAvoir: 'AV',
    prefixeDevis: 'DE',
    compteClientDebut: '411',
    compteFournisseurDebut: '401',
    email: '',
    telephone: '',
  });

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
        setFormData({
          nom: data.nom,
          siret: data.siret,
          formeJuridique: data.formeJuridique,
          rue: data.adresse.rue,
          ville: data.adresse.ville,
          codePostal: data.adresse.codePostal,
          pays: data.adresse.pays || 'France',
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
        });
      }
    } catch (err) {
      console.error('Erreur chargement société:', err);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof SocieteFormData, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      setError('Le nom est obligatoire');
      return;
    }
    
    if (!formData.siret.trim()) {
      setError('Le SIRET est obligatoire');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Vérifier si le SIRET existe déjà (sauf pour cette société)
      if (societe && formData.siret !== societe.siret) {
        const exists = await siretExists(formData.siret, id);
        if (exists) {
          setError('Ce SIRET existe déjà pour une autre société');
          setSaving(false);
          return;
        }
      }
      
      await updateSociete(id, formData);
      router.push('/admin/administration/societes');
    } catch (err) {
      console.error('Erreur modification société:', err);
      setError('Erreur lors de la modification');
      setSaving(false);
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

  if (error && !societe) {
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
          <h3 className="text-xl font-semibold text-red-900 mb-2">Société introuvable</h3>
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <Link href={`/admin/administration/societes/${id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au détail
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold">Modifier {societe?.nom}</h1>
        <p className="text-gray-500 mt-1">Mise à jour des informations de la société</p>
      </div>

      {/* Erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* Informations générales */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Informations générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nom">
                  Nom de la société <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="siret">
                  SIRET <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="siret"
                  value={formData.siret}
                  onChange={(e) => handleChange('siret', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="formeJuridique">Forme juridique</Label>
                <Select
                  value={formData.formeJuridique}
                  onValueChange={(value) => handleChange('formeJuridique', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMES_JURIDIQUES.map((forme) => (
                      <SelectItem key={forme.value} value={forme.value}>
                        {forme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="capital">Capital (€)</Label>
                <Input
                  id="capital"
                  type="number"
                  value={formData.capital}
                  onChange={(e) => handleChange('capital', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="couleur">Couleur</Label>
                <Select
                  value={formData.couleur}
                  onValueChange={(value) => handleChange('couleur', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COULEURS_SOCIETES.map((couleur) => (
                      <SelectItem key={couleur.value} value={couleur.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: couleur.value }}
                          />
                          {couleur.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-3">
                <Switch
                  id="actif"
                  checked={formData.actif}
                  onCheckedChange={(checked) => handleChange('actif', checked)}
                />
                <Label htmlFor="actif" className="cursor-pointer">
                  Société active
                </Label>
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Adresse</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="rue">Rue</Label>
                <Input
                  id="rue"
                  value={formData.rue}
                  onChange={(e) => handleChange('rue', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="codePostal">Code postal</Label>
                <Input
                  id="codePostal"
                  value={formData.codePostal}
                  onChange={(e) => handleChange('codePostal', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="ville">Ville</Label>
                <Input
                  id="ville"
                  value={formData.ville}
                  onChange={(e) => handleChange('ville', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Informations légales */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Informations légales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tvaIntracom">N° TVA Intracommunautaire</Label>
                <Input
                  id="tvaIntracom"
                  value={formData.tvaIntracom}
                  onChange={(e) => handleChange('tvaIntracom', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="rcs">RCS</Label>
                <Input
                  id="rcs"
                  value={formData.rcs}
                  onChange={(e) => handleChange('rcs', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => handleChange('telephone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Paramètres comptables */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Paramètres comptables</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="prefixeFacture">Préfixe factures</Label>
                <Input
                  id="prefixeFacture"
                  value={formData.prefixeFacture}
                  onChange={(e) => handleChange('prefixeFacture', e.target.value)}
                  maxLength={5}
                />
              </div>
              
              <div>
                <Label htmlFor="prefixeAvoir">Préfixe avoirs</Label>
                <Input
                  id="prefixeAvoir"
                  value={formData.prefixeAvoir}
                  onChange={(e) => handleChange('prefixeAvoir', e.target.value)}
                  maxLength={5}
                />
              </div>
              
              <div>
                <Label htmlFor="prefixeDevis">Préfixe devis</Label>
                <Input
                  id="prefixeDevis"
                  value={formData.prefixeDevis}
                  onChange={(e) => handleChange('prefixeDevis', e.target.value)}
                  maxLength={5}
                />
              </div>
              
              <div>
                <Label htmlFor="compteClientDebut">Compte client</Label>
                <Input
                  id="compteClientDebut"
                  value={formData.compteClientDebut}
                  onChange={(e) => handleChange('compteClientDebut', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="compteFournisseurDebut">Compte fournisseur</Label>
                <Input
                  id="compteFournisseurDebut"
                  value={formData.compteFournisseurDebut}
                  onChange={(e) => handleChange('compteFournisseurDebut', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Link href={`/admin/administration/societes/${id}`}>
              <Button type="button" variant="outline" disabled={saving}>
                Annuler
              </Button>
            </Link>
            
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
