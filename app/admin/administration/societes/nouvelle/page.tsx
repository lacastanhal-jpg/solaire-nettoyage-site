'use client';

/**
 * Page création nouvelle société
 * /admin/administration/societes/nouvelle
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSociete, siretExists } from '@/lib/firebase/societes';
import { SocieteFormData, FORMES_JURIDIQUES, COULEURS_SOCIETES, SOCIETES_GROUPE_GELY } from '@/lib/types/societes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Building2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NouvelleSocietePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  function handleChange(field: keyof SocieteFormData, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  }

  function loadSocietePreconfiguree(index: number) {
    const societe = SOCIETES_GROUPE_GELY[index];
    if (societe) {
      setFormData(prev => ({
        ...prev,
        ...societe,
        nom: societe.nom || '',
        siret: societe.siret || '',
        formeJuridique: societe.formeJuridique || 'SAS',
        couleur: societe.couleur || '#3B82F6',
        prefixeFacture: societe.prefixeFacture || 'FA',
        prefixeAvoir: societe.prefixeAvoir || 'AV',
        prefixeDevis: societe.prefixeDevis || 'DE',
        compteClientDebut: societe.compteClientDebut || '411',
        compteFournisseurDebut: societe.compteFournisseurDebut || '401',
        actif: societe.actif !== undefined ? societe.actif : true,
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!formData.nom.trim()) {
      setError('Le nom est obligatoire');
      return;
    }
    
    if (!formData.siret.trim()) {
      setError('Le SIRET est obligatoire');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Vérifier si le SIRET existe déjà
      const exists = await siretExists(formData.siret);
      if (exists) {
        setError('Ce SIRET existe déjà');
        setLoading(false);
        return;
      }
      
      const id = await createSociete(formData);
      router.push('/admin/administration/societes');
    } catch (err) {
      console.error('Erreur création société:', err);
      setError('Erreur lors de la création de la société');
      setLoading(false);
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
        
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Building2 className="h-8 w-8" />
          Nouvelle Société
        </h1>
        <p className="text-gray-500 mt-1">
          Créer une nouvelle société du groupe GELY
        </p>
      </div>

      {/* Modèles pré-configurés */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-3">Sociétés pré-configurées du groupe GELY</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {SOCIETES_GROUPE_GELY.map((societe, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => loadSocietePreconfiguree(index)}
              className="justify-start"
              style={{ borderLeft: `4px solid ${societe.couleur}` }}
            >
              <span className="text-xs">{societe.nom}</span>
            </Button>
          ))}
        </div>
      </Card>

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
                  placeholder="SAS SOLAIRE NETTOYAGE"
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
                  placeholder="820 504 421 00000"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="formeJuridique">
                  Forme juridique <span className="text-red-500">*</span>
                </Label>
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
                  placeholder="10000"
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
                  placeholder="123 Rue de la République"
                />
              </div>
              
              <div>
                <Label htmlFor="codePostal">Code postal</Label>
                <Input
                  id="codePostal"
                  value={formData.codePostal}
                  onChange={(e) => handleChange('codePostal', e.target.value)}
                  placeholder="31000"
                />
              </div>
              
              <div>
                <Label htmlFor="ville">Ville</Label>
                <Input
                  id="ville"
                  value={formData.ville}
                  onChange={(e) => handleChange('ville', e.target.value)}
                  placeholder="Toulouse"
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
                  placeholder="FR12345678901"
                />
              </div>
              
              <div>
                <Label htmlFor="rcs">RCS</Label>
                <Input
                  id="rcs"
                  value={formData.rcs}
                  onChange={(e) => handleChange('rcs', e.target.value)}
                  placeholder="RCS Toulouse 820 504 421"
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
                  placeholder="contact@solairenettoyage.fr"
                />
              </div>
              
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => handleChange('telephone', e.target.value)}
                  placeholder="05 XX XX XX XX"
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
                  placeholder="FA"
                  maxLength={5}
                />
              </div>
              
              <div>
                <Label htmlFor="prefixeAvoir">Préfixe avoirs</Label>
                <Input
                  id="prefixeAvoir"
                  value={formData.prefixeAvoir}
                  onChange={(e) => handleChange('prefixeAvoir', e.target.value)}
                  placeholder="AV"
                  maxLength={5}
                />
              </div>
              
              <div>
                <Label htmlFor="prefixeDevis">Préfixe devis</Label>
                <Input
                  id="prefixeDevis"
                  value={formData.prefixeDevis}
                  onChange={(e) => handleChange('prefixeDevis', e.target.value)}
                  placeholder="DE"
                  maxLength={5}
                />
              </div>
              
              <div>
                <Label htmlFor="compteClientDebut">Compte client</Label>
                <Input
                  id="compteClientDebut"
                  value={formData.compteClientDebut}
                  onChange={(e) => handleChange('compteClientDebut', e.target.value)}
                  placeholder="411"
                />
              </div>
              
              <div>
                <Label htmlFor="compteFournisseurDebut">Compte fournisseur</Label>
                <Input
                  id="compteFournisseurDebut"
                  value={formData.compteFournisseurDebut}
                  onChange={(e) => handleChange('compteFournisseurDebut', e.target.value)}
                  placeholder="401"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Link href="/admin/administration/societes">
              <Button type="button" variant="outline" disabled={loading}>
                Annuler
              </Button>
            </Link>
            
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Créer la société
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
