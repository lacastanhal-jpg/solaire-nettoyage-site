'use client';

/**
 * Composant Select Société
 * Utilisé dans tous les formulaires nécessitant la sélection d'une société
 */

import { useEffect, useState } from 'react';
import { getSocietesActives } from '@/lib/firebase/societes';
import { Societe } from '@/lib/types/societes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Building2, Loader2 } from 'lucide-react';

interface SelectSocieteProps {
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  showLabel?: boolean;
}

export function SelectSociete({
  value,
  onValueChange,
  required = false,
  disabled = false,
  label = 'Société',
  placeholder = 'Sélectionner une société',
  showLabel = true,
}: SelectSocieteProps) {
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSocietes();
  }, []);

  async function loadSocietes() {
    try {
      setLoading(true);
      const data = await getSocietesActives();
      setSocietes(data);
      
      // Si une seule société active, la sélectionner automatiquement
      if (data.length === 1 && !value) {
        onValueChange(data[0].id);
      }
      
      setError(null);
    } catch (err) {
      console.error('Erreur chargement sociétés:', err);
      setError('Erreur lors du chargement des sociétés');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {showLabel && (
          <Label>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          <span className="text-sm text-gray-500">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        {showLabel && (
          <Label>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div className="p-3 border border-red-200 rounded-md bg-red-50">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (societes.length === 0) {
    return (
      <div className="space-y-2">
        {showLabel && (
          <Label>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div className="p-3 border border-amber-200 rounded-md bg-amber-50">
          <p className="text-sm text-amber-600">
            Aucune société active. Veuillez créer une société dans Administration → Sociétés.
          </p>
        </div>
      </div>
    );
  }

  // Si une seule société, affichage simplifié
  if (societes.length === 1) {
    const societe = societes[0];
    return (
      <div className="space-y-2">
        {showLabel && (
          <Label>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div 
          className="flex items-center gap-3 p-3 border rounded-md bg-gray-50"
          style={{ borderLeftWidth: '4px', borderLeftColor: societe.couleur }}
        >
          <div 
            className="w-8 h-8 rounded flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: societe.couleur }}
          >
            {societe.nom.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{societe.nom}</p>
            <p className="text-xs text-gray-500">{societe.formeJuridique}</p>
          </div>
        </div>
        {/* Champ caché pour le formulaire */}
        <input type="hidden" value={societe.id} />
      </div>
    );
  }

  // Sélection multiple sociétés
  return (
    <div className="space-y-2">
      {showLabel && (
        <Label htmlFor="societe-select">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <Select 
        value={value} 
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger id="societe-select" className="w-full">
          <SelectValue placeholder={placeholder}>
            {value && societes.find(s => s.id === value) && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded flex items-center justify-center text-white font-semibold text-xs"
                  style={{ backgroundColor: societes.find(s => s.id === value)?.couleur }}
                >
                  {societes.find(s => s.id === value)?.nom.substring(0, 2).toUpperCase()}
                </div>
                <span>{societes.find(s => s.id === value)?.nom}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          {societes.map((societe) => (
            <SelectItem key={societe.id} value={societe.id}>
              <div className="flex items-center gap-3 py-1">
                <div 
                  className="w-8 h-8 rounded flex items-center justify-center text-white font-semibold text-xs"
                  style={{ backgroundColor: societe.couleur }}
                >
                  {societe.nom.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{societe.nom}</p>
                  <p className="text-xs text-gray-500">{societe.formeJuridique}</p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Badge société sélectionnée */}
      {value && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Building2 className="h-3 w-3" />
          <span>
            {societes.find(s => s.id === value)?.siret && (
              <>SIRET: {societes.find(s => s.id === value)?.siret}</>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Version compacte du sélecteur (pour les filtres)
 */
export function SelectSocieteCompact({
  value,
  onValueChange,
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <SelectSociete
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      showLabel={false}
      placeholder="Toutes les sociétés"
      required={false}
    />
  );
}
