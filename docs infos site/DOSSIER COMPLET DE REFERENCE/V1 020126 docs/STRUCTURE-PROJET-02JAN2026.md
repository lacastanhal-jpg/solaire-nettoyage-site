# 🏗️ STRUCTURE PROJET ERP - ARCHITECTURE COMPLÈTE

**Date :** 2 Janvier 2026, 15h40  
**Version :** v1.2 (Session 2)

---

## 📁 ARCHITECTURE DOSSIERS

```
solaire-nettoyage-site/
├── app/                          # Next.js 14 App Router
│   ├── (public)/                 # Routes publiques
│   │   ├── page.tsx             # Accueil site vitrine
│   │   ├── entreprise/          # Page entreprise
│   │   ├── services/            # Page services
│   │   └── contact/             # Page contact
│   │
│   ├── admin/                    # Intranet (Jerome + Axel)
│   │   ├── page.tsx             # Dashboard principal
│   │   │
│   │   ├── crm/                 # MODULE CRM
│   │   │   ├── groupes/         # Gestion groupes clients
│   │   │   ├── clients/         # Gestion clients
│   │   │   └── sites/           # Gestion sites
│   │   │
│   │   ├── finances/            # MODULE FINANCES
│   │   │   ├── devis/           # Gestion devis
│   │   │   ├── factures/        # Gestion factures
│   │   │   ├── avoirs/          # Gestion avoirs
│   │   │   ├── notes-frais/     # Notes de frais ⭐ Session 2
│   │   │   └── tresorerie/      # Trésorerie ⭐ Session 2
│   │   │
│   │   ├── operations/          # MODULE OPÉRATIONS
│   │   │   ├── interventions/   # Planning interventions
│   │   │   ├── equipes/         # Gestion équipes
│   │   │   ├── operateurs/      # Gestion opérateurs
│   │   │   └── rapports/        # Rapports Praxedo
│   │   │
│   │   ├── stock-flotte/        # MODULE STOCK & FLOTTE
│   │   │   ├── equipements/     # Catalogue équipements
│   │   │   ├── mouvements/      # Mouvements stock
│   │   │   └── maintenance/     # Maintenance préventive
│   │   │
│   │   └── conformite/          # MODULE CONFORMITÉ
│   │       └── certifications/  # Certifications CACES/Médical/VGP
│   │
│   ├── dataroom/                # Portail clients
│   │   ├── login/              # Authentification
│   │   ├── dashboard/          # Dashboard client
│   │   └── interventions/      # Consultation interventions
│   │
│   └── operateur/               # App mobile (future)
│       └── interventions/       # Interventions terrain
│
├── components/                   # Composants React réutilisables
│   ├── ui/                      # Composants UI de base
│   ├── crm/                     # Composants CRM
│   ├── finances/                # Composants Finances
│   ├── tresorerie/              # ⭐ Session 2
│   │   ├── GraphiqueEvolutionSolde.tsx
│   │   └── GraphiquePrevisionnel.tsx
│   └── shared/                  # Composants partagés
│
├── lib/                         # Bibliothèques et utilitaires
│   ├── firebase/                # Firebase Firestore
│   │   ├── config.ts           # Configuration Firebase
│   │   ├── groupes.ts          # Fonctions groupes
│   │   ├── clients.ts          # Fonctions clients
│   │   ├── sites.ts            # Fonctions sites
│   │   ├── devis.ts            # Fonctions devis
│   │   ├── factures.ts         # Fonctions factures
│   │   ├── avoirs.ts           # Fonctions avoirs
│   │   ├── interventions.ts    # Fonctions interventions
│   │   ├── stock.ts            # Fonctions stock
│   │   ├── notes-de-frais.ts   # ⭐ Session 2 (fonction soumettre)
│   │   ├── notes-frais-validation-masse.ts  # ⭐ Session 2
│   │   ├── tresorerie-stats.ts # Statistiques trésorerie
│   │   ├── tresorerie-previsionnel.ts  # ⭐ Session 2
│   │   ├── lignes-bancaires.ts # Lignes bancaires
│   │   └── workflow-devis-intervention.ts  # ⭐ Session 2 (corrigé)
│   │
│   ├── pdf/                     # Génération PDF
│   │   ├── devis-pdf.ts        # PDF devis
│   │   ├── facture-pdf.ts      # PDF factures
│   │   └── avoir-pdf.ts        # PDF avoirs
│   │
│   ├── email/                   # Envoi emails
│   │   └── smtp.ts             # Configuration SMTP IONOS
│   │
│   └── utils/                   # Utilitaires
│       ├── formatters.ts       # Formatage dates/montants
│       ├── validators.ts       # Validations
│       └── calculators.ts      # Calculs TVA/TTC
│
├── public/                      # Assets statiques
│   ├── logo.png                # Logo Solaire Nettoyage
│   └── images/                 # Images site
│
└── styles/                      # Styles globaux
    └── globals.css             # Tailwind CSS

```

---

## 🗄️ COLLECTIONS FIREBASE (16 ACTIVES)

### 1. **groupes_clients**
```typescript
{
  id: string                    // Auto-généré
  nom: string                   // "ENGIE"
  description: string
  logo?: string                 // URL Firebase Storage
  actif: boolean
  createdAt: string
  updatedAt: string
}
```

**Exemples :**
- ENGIE (150 clients)
- EDF (120 clients)
- TotalEnergies (80 clients)
- CGN Europe Energy (50 clients)
- Voltalia (40 clients)
- RES (Renewable Energy Systems) (30 clients)
- Q.ENERGY (25 clients)

---

### 2. **clients**
```typescript
{
  id: string
  numero: string                // CLI-2026-XXXX
  
  // HIÉRARCHIE
  groupeId: string             // ⚠️ CRITIQUE - Lien groupe
  groupeNom: string            // Dénormalisé
  
  // IDENTITÉ
  raisonSociale: string
  siret: string
  tvaIntra?: string
  
  // CONTACT
  adresse: string
  codePostal: string
  ville: string
  telephone: string
  email: string
  
  // COMMERCIAL
  contactPrincipal: string
  emailFacturation: string
  
  // FACTURATION
  conditionsPaiement: string    // "30 jours fin de mois"
  delaiPaiement: number         // 30
  
  actif: boolean
  createdAt: string
  updatedAt: string
}
```

**Volume :** 600+ clients

---

### 3. **sites**
```typescript
{
  id: string
  numero: string                // SITE-2026-XXXX
  
  // HIÉRARCHIE
  clientId: string             // ⚠️ CRITIQUE
  clientNom: string            // Dénormalisé
  groupeNom: string            // Dénormalisé
  
  // IDENTITÉ
  nom: string                   // "Site Lyon Gerland"
  adresse: string
  codePostal: string
  ville: string
  
  // TECHNIQUE
  puissanceMWc: number         // Puissance installation
  surfacePanneaux: number      // m²
  coordonneesGPS: {            // ⚠️ OBLIGATOIRE
    lat: number
    lng: number
  }
  
  // CONTACT
  contactSite?: string
  telephoneSite?: string
  instructions?: string         // "Clé au gardien"
  
  actif: boolean
  createdAt: string
  updatedAt: string
}
```

**Volume :** 3600+ sites  
**Validation :** GPS obligatoire

---

### 4. **articles**
```typescript
{
  id: string
  reference: string             // "ART-2026-XXXX"
  designation: string           // "Nettoyage panneaux PV"
  
  type: 'service' | 'produit' | 'main_oeuvre'
  unite: 'm²' | 'forfait' | 'heure'
  
  // TARIFICATION DE BASE
  prixUnitaireHT: number
  tauxTVA: number               // 20, 10, 5.5, 0
  
  actif: boolean
  createdAt: string
  updatedAt: string
}
```

---

### 5. **tarifs**
```typescript
{
  id: string
  articleId: string
  
  // NIVEAU HIÉRARCHIQUE (1 seul rempli)
  groupeId?: string             // Tarif groupe
  clientId?: string             // Tarif client
  siteId?: string              // Tarif site spécifique
  
  prixUnitaireHT: number
  tauxTVA: number
  
  dateDebut: string
  dateFin?: string
  
  actif: boolean
  createdAt: string
}
```

**Logique application :**
```
1. Site spécifique ? → tarif site
2. Sinon Client ? → tarif client  
3. Sinon Groupe ? → tarif groupe
4. Sinon → tarif général (article)
```

---

### 6. **devis**
```typescript
{
  id: string
  numero: string                // DEV-2026-XXXX
  date: string
  
  // HIÉRARCHIE
  clientId: string
  clientNom: string            // Dénormalisé
  groupeNom: string            // Dénormalisé
  
  // LIGNES DEVIS (multi-sites)
  lignes: [{
    siteId: string
    siteNom: string
    articleId: string
    designation: string
    quantite: number            // Surface ou forfait
    prixUnitaireHT: number
    montantHT: number
    tauxTVA: number
    montantTVA: number
    montantTTC: number
  }]
  
  // TOTAUX
  totalHT: number
  totalTVA: number
  totalTTC: number
  
  // WORKFLOW
  statut: 'brouillon' | 'en_attente' | 'valide' | 'refuse' | 'envoye'
  
  // EMAIL
  emailEnvoyeA: string[]
  historique: [{
    action: string
    date: string
    email?: string
  }]
  
  createdAt: string
  updatedAt: string
}
```

---

### 7. **factures**
```typescript
{
  id: string
  numero: string                // FA-2026-XXXX
  date: string
  dateEcheance: string
  
  // HIÉRARCHIE
  clientId: string
  clientNom: string
  groupeNom: string
  
  // LIGNES (multi-sites)
  lignes: [...]                 // Même structure que devis
  
  // TOTAUX
  totalHT: number
  totalTVA: number
  totalTTC: number
  
  // PAIEMENT
  statut: 'brouillon' | 'envoyee' | 'payee' | 'partiellement_payee' | 'en_retard' | 'annulee'
  paiements: [{
    date: string
    montant: number
    mode: string
  }]
  resteAPayer: number
  
  // COMPTABILITÉ
  compteComptable: string
  exported: boolean
  dateExport?: string
  
  createdAt: string
  updatedAt: string
}
```

---

### 8. **avoirs**
```typescript
{
  id: string
  numero: string                // AV-2026-XXXX
  date: string
  
  clientId: string
  clientNom: string
  
  // LIEN FACTURE ORIGINE (optionnel)
  factureId?: string
  factureNumero?: string
  
  // LIGNES (montants négatifs)
  lignes: [...]
  
  // TOTAUX (négatifs)
  totalHT: number               // < 0
  totalTVA: number              // < 0
  totalTTC: number              // < 0
  
  tvaADeduire: number
  
  utilisationType: 'deduction' | 'remboursement'
  statut: 'brouillon' | 'envoye' | 'applique' | 'rembourse'
  
  createdAt: string
}
```

---

### 9. **interventions**
```typescript
{
  id: string
  numero: string                // INT-2026-XXXX
  
  // DEVIS ORIGINE
  devisId?: string
  devisNumero?: string
  
  // HIÉRARCHIE
  siteId: string
  siteNom: string
  clientNom: string
  groupeNom: string
  
  // TECHNIQUE
  surface: number               // m²
  typeIntervention: string      // "Nettoyage standard"
  
  // PLANNING
  datePrevue: string
  heureDebut?: string
  heureFin?: string
  
  // ÉQUIPE
  equipeId: string
  equipeNom: string
  operateurIds: string[]
  
  // WORKFLOW
  statut: 'brouillon' | 'planifiee' | 'en_cours' | 'terminee' | 'annulee'
  
  // RAPPORT PRAXEDO
  rapportId?: string
  rapportURL?: string
  
  // FACTURATION
  facturee: boolean
  factureId?: string
  
  createdAt: string
  updatedAt: string
}
```

---

### 10. **equipes**
```typescript
{
  id: string
  nom: string                   // "Équipe 1", "Équipe 2", "Équipe 3"
  couleur: string              // Code couleur planning
  operateurIds: string[]        // IDs opérateurs affectés
  actif: boolean
  createdAt: string
}
```

**Volume :** 3 équipes terrain

---

### 11. **operateurs**
```typescript
{
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  
  equipeId: string
  equipeNom: string
  
  // CERTIFICATIONS
  certifications: [{
    type: 'caces' | 'medical'
    numero?: string
    dateObtention: string
    dateExpiration: string
    actif: boolean
  }]
  
  actif: boolean
  createdAt: string
}
```

**Volume :** 6-8 opérateurs

---

### 12. **rapports_praxedo**
```typescript
{
  id: string
  emailId: string               // ID email IMAP
  
  // PARSING
  nomSite: string              // Extrait du PDF
  dateIntervention: string
  pdfURL: string               // Firebase Storage
  
  // MATCHING
  interventionId?: string       // Association automatique
  interventionNumero?: string
  matchingScore: number         // 0-100
  
  statut: 'nouveau' | 'associe' | 'manuel'
  
  createdAt: string
}
```

---

### 13. **stock_equipements**
```typescript
{
  id: string
  reference: string             // "NM04", "BROSSE-001"
  designation: string
  
  type: 'materiel_mobile' | 'consommable' | 'piece_detachee'
  
  // QUANTITÉS
  quantiteStock: number
  seuilAlerte: number
  unite: string
  
  // COÛTS
  coutAcquisition: number
  coutMaintenance: number
  
  // MAINTENANCE (si matériel)
  dateAchat?: string
  prochainEntretien?: string
  
  emplacement: string
  actif: boolean
  createdAt: string
}
```

**Exemples :**
- NM04 : Nacelle 40m (500k€)
- NM05 : Nacelle 50m (600k€)
- FOURGON : Véhicule utilitaire
- BROSSE-ROT : Brosse rotative
- EAU-OSMO : Système eau osmosée 8000L

---

### 14. **stock_mouvements**
```typescript
{
  id: string
  
  equipementId: string
  equipementNom: string
  
  type: 'entree' | 'sortie' | 'transfert' | 'inventaire'
  quantite: number
  
  // ORIGINE/DESTINATION
  origine?: string
  destination?: string
  
  // CONTEXTE
  interventionId?: string
  motif: string
  
  operateurId: string
  operateurNom: string
  
  date: string
  createdAt: string
}
```

---

### 15. **notes_de_frais** ⭐ Session 2
```typescript
{
  id: string
  numero: string                // NF-2026-XXXX
  date: string
  
  // OPÉRATEUR
  operateurId: string
  operateurNom: string
  
  // CATÉGORIE
  categorie: 'carburant' | 'peage' | 'repas' | 'hebergement' | 'fournitures' | 'entretien' | 'autre'
  
  // MONTANTS
  montantTTC: number
  montantHT: number
  tauxTVA: number
  montantTVA: number
  tvaRecuperable: boolean
  
  // DÉTAILS
  description: string
  fournisseur?: string
  
  // VÉHICULE (si carburant/péage)
  vehiculeId?: string
  vehiculeImmat?: string
  kmParcourus?: number
  
  // JUSTIFICATIFS
  justificatifs: [{
    id: string
    type: 'image' | 'pdf'
    url: string                 // Firebase Storage
    nom: string
    dateUpload: string
  }]
  
  // WORKFLOW ⭐ Session 2
  statut: 'brouillon' | 'soumise' | 'validee' | 'refusee' | 'remboursee'
  dateSoumission?: string       // ⭐ Nouveau
  
  // VALIDATION
  dateValidation?: string
  validateurId?: string
  validateurNom?: string
  commentaireValidation?: string
  
  // REMBOURSEMENT
  dateRemboursement?: string
  modeRemboursement?: 'virement' | 'cheque'
  referenceRemboursement?: string
  
  createdAt: string
  updatedAt: string
}
```

**Workflow ⭐ Session 2 :**
```
brouillon → [Soumettre] → soumise → [Valider masse] → validee → remboursee
```

---

### 16. **certifications**
```typescript
{
  id: string
  type: 'caces' | 'medical' | 'vgp'
  
  // SI CACES/MEDICAL
  operateurId?: string
  operateurNom?: string
  
  // SI VGP
  equipementId?: string
  equipementNom?: string
  
  categorie?: string            // "R486" pour CACES nacelle
  numero?: string
  
  dateObtention: string
  dateExpiration: string
  
  // ALERTES
  alerteJ30: boolean
  alerteJ7: boolean
  
  documentURL?: string
  actif: boolean
  createdAt: string
}
```

---

## 🔗 DÉPENDANCES CRITIQUES

### Hiérarchie Groupes → Clients → Sites
```
⚠️ NE JAMAIS CASSER CES LIENS

Groupes
  └── Clients (groupeId, groupeNom)
       └── Sites (clientId, clientNom, groupeNom)
            ├── Interventions (siteId, clientNom, groupeNom)
            ├── Devis lignes (siteId, siteNom)
            └── Factures lignes (siteId, siteNom)
```

### Workflow Devis → Intervention ⭐ Session 2
```
Devis validé
  └── Créer interventions automatiquement
       ├── 1 ligne devis = 1 intervention
       ├── Transfert : site, surface, date
       └── Numérotation séquentielle correcte
```

### Notes de Frais ⭐ Session 2
```
Note brouillon
  └── [Soumettre] → soumise
       └── [Valider masse] → validee
            └── [Rembourser] → remboursee
```

### Trésorerie Prévisionnel ⭐ Session 2
```
Factures clients (statut='envoyee')
  └── Encaissements prévisionnels (échéance +30j)

Factures fournisseurs (statut='en_attente')
  └── Décaissements prévisionnels (échéance due)

Calcul quotidien :
  Solde prévu = Solde actuel + Encaissements - Décaissements
```

---

## 📐 RÈGLES MÉTIER

### Tarification (4 niveaux)
```
Priorité décroissante :
1. Tarif site spécifique
2. Tarif client
3. Tarif groupe
4. Tarif général (article)
```

### Numérotation automatique
```
DEV-2026-0001 (devis)
FA-2026-0001 (factures)
AV-2026-0001 (avoirs)
INT-2026-0001 (interventions) ⭐ Séquentiel corrigé Session 2
NF-2026-0001 (notes de frais)
```

### Validation données
```
⚠️ GPS obligatoire pour sites
⚠️ Surface > 0 pour interventions ⭐ Corrigé Session 2
⚠️ Montant TTC > 0 pour factures
⚠️ Client actif pour nouveau devis
```

---

**Date architecture :** 2 Janvier 2026, 15h40  
**Version :** v1.2 (Session 2)
