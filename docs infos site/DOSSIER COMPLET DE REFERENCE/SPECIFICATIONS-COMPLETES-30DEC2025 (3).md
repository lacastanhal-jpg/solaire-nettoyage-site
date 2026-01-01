# SPÉCIFICATIONS FINALES - SYSTÈME COMPLET GROUPE GELY
## GESTION FINANCIÈRE + STOCK & FLOTTE + PATRIMOINE

**Date** : 30 décembre 2025  
**Version** : FINALE COMPLÈTE - Mise à jour Phase 3 Jour 2  
**Objectif** : ERP complet multi-sociétés avec gestion patrimoniale

**🎉 MISE À JOUR 30 DÉCEMBRE 2025**
```
Phase 3 - Jour 2 TERMINÉ :
✅ Module Maintenance Avancée complet
✅ Vérification stock temps réel avec alertes
✅ Bons de commande fournisseurs avec workflow
✅ Envoi email automatique
✅ Gestion complète stock interventions
✅ Synchronisation automatique

Fichiers créés/modifiés : 10 fichiers
Code créé : ~2,860 lignes
Collections ajoutées : 1 (bons_commande_fournisseurs)
```

---

**Objectif** : ERP complet multi-sociétés avec gestion patrimoniale

---

## 🎯 VISION GLOBALE DU SYSTÈME

### Architecture Groupe
```
🏢 GELY INVESTISSEMENT HOLDING
   │
   ├── 💼 SAS SOLAIRE NETTOYAGE (SIRET 820 504 421) ⭐ SOCIÉTÉ OPÉRATIONNELLE
   │   ├── CA : Nettoyage photovoltaïque (3600 sites/an)
   │   ├── Clients : 600+ (EDF, ENGIE, TotalEnergies, CGN...)
   │   ├── Équipes terrain : 3
   │   └── Stock atelier + Flotte véhicules
   │
   ├── 🏢 LEXA (Investissement)
   │   └── Flux inter-sociétés
   │
   ├── 🏢 LEXA 2 (Investissement)
   │   └── Flux inter-sociétés
   │
   ├── 🏠 SCI GELY (Immobilier)
   │   └── Patrimoine immobilier
   │
   └── ⚡ PROJETS PHOTOVOLTAÏQUES
       └── Installations diverses puissances
```

### Utilisateurs & Accès
```
👑 JEROME + AXEL (CO-GÉRANTS - MÊME NIVEAU)
   → Accès TOTAL identique
   → Finances complètes (CA, marges, trésorerie)
   → Gestion patrimoine groupe
   → Validation notes frais
   → Exports comptables
   → Comptes courants

👔 MANAGER (futur si embauche)
   → CRM complet
   → Opérations
   → Validation métier notes frais
   → PAS accès trésorerie/marges

👷 SALARIÉS (4 opérateurs terrain)
   → Planning (leurs interventions)
   → Leurs rapports
   → Créer notes de frais
   → Stock : consommer articles

📊 COMPTABLE (externe)
   → Validation comptable notes frais
   → Saisie factures fournisseurs
   → Rapprochement bancaire
   → Exports FEC
```

---

## 🗄️ ARCHITECTURE COMPLÈTE FIREBASE

### 🏢 GESTION MULTI-SOCIÉTÉS

#### societes
```typescript
{
  id: string
  nom: string // "Solaire Nettoyage", "LEXA", etc.
  siret: string
  forme_juridique: 'SAS' | 'SARL' | 'SCI' | 'Holding'
  adresse: {
    rue: string
    ville: string
    codePostal: string
  }
  tva_intracom: string
  rcs: string
  capital: number
  actif: boolean
  couleur: string // Pour dashboards
  logo?: string
  
  // Paramètres comptables
  prefixeFacture: string // "FA" pour Solaire
  prefixeAvoir: string // "AV"
  compteClientDebut: string // "411"
  compteFournisseurDebut: string // "401"
  
  createdAt: string
  updatedAt: string
}
```

---

### 💰 SYSTÈME FINANCIER

#### comptes_bancaires
```typescript
{
  id: string
  societeId: string
  societeNom: string
  banque: string
  nomCompte: string
  iban: string
  bic?: string
  type: 'courant' | 'epargne' | 'professionnel'
  soldeCourant: number
  devise: string
  actif: boolean
  createdAt: string
  updatedAt: string
}
```

#### lignes_bancaires
```typescript
{
  id: string
  compteId: string
  compteBancaireNom: string
  societeId: string
  societeNom: string
  
  // Relevé
  date: string
  dateValeur: string
  libelle: string
  reference?: string
  montant: number // + crédit, - débit
  solde: number
  
  // Catégorisation
  type: 'virement' | 'prelevement' | 'carte' | 'cheque' | 'frais' | 'virement_interne'
  categorie?: string
  
  // Rapprochement
  rapproche: boolean
  rapprochementType?: 'facture_client' | 'facture_fournisseur' | 'note_frais' | 
                       'compte_courant' | 'flux_inter_societe' | 'achat_stock'
  rapprochementId?: string
  rapprochementNumero?: string
  
  notes?: string
  importedAt: string
  createdAt: string
}
```

#### factures (Enrichi multi-sociétés + TVA)
```typescript
{
  id: string
  numero: string
  
  // Multi-sociétés
  societeId: string
  societeNom: string
  
  date: string
  dateEcheance: string
  
  // Client
  clientId: string
  clientNom: string
  groupeNom?: string
  
  // Lignes
  lignes: [{
    siteId?: string
    siteNom?: string
    description: string
    quantite: number
    prixUnitaireHT: number
    tauxTVA: number
    montantHT: number
    montantTVA: number
    montantTTC: number
  }]
  
  // Totaux
  totalHT: number
  totalTVA: number
  totalTTC: number
  
  // TVA
  tvaCollectee: number // = totalTVA
  
  // Paiement
  statut: 'brouillon' | 'envoyee' | 'payee' | 'partiellement_payee' | 'en_retard' | 'annulee'
  paiements: [{
    date: string
    montant: number
    mode: string
    ligneBancaireId?: string
  }]
  resteAPayer: number
  
  // Comptabilité
  compteComptable: string
  exported: boolean
  dateExport?: string
  
  createdAt: string
  updatedAt: string
}
```

#### avoirs
```typescript
{
  id: string
  numero: string
  societeId: string
  societeNom: string
  date: string
  
  factureId?: string
  factureNumero?: string
  
  clientId: string
  clientNom: string
  
  lignes: [...] // Montants négatifs
  
  totalHT: number // Négatif
  totalTVA: number // Négatif
  totalTTC: number // Négatif
  
  tvaADeduire: number
  
  utilisationType: 'deduction' | 'remboursement'
  statut: 'brouillon' | 'envoye' | 'applique' | 'rembourse'
  
  compteComptable: string
  exported: boolean
  
  createdAt: string
  updatedAt: string
}
```

#### notes_frais (Niveau Expensya)
```typescript
{
  id: string
  numero: string // NF-2025-XXX
  
  // Multi-sociétés
  societeId: string
  societeNom: string
  
  // Déclarant
  userId: string
  userName: string
  userEmail: string
  
  // Date & Type
  date: string
  type: 'carburant' | 'peage' | 'repas' | 'hebergement' | 'fournitures' | 'kilometrique' | 'autre'
  
  // Montants & TVA
  montantHT: number
  tauxTVA: number // 0, 5.5, 10, 20
  montantTVA: number
  montantTTC: number
  tvaRecuperable: boolean
  montantTVARecuperable: number
  
  description: string
  
  // Détails spécifiques
  details: {
    // CARBURANT
    litres?: number
    vehiculeId?: string // 🔗 LIEN AVEC FLOTTE
    vehiculeImmat?: string
    kilometrage?: number
    prixLitre?: number
    
    // KILOMÉTRIQUE
    depart?: string
    arrivee?: string
    distance?: number
    vehiculePuissance?: string
    indemniteKm?: number
    
    // PÉAGE
    autoroute?: string
    
    // REPAS
    nombrePersonnes?: number
    clientsInvites?: string[]
    
    // HÉBERGEMENT
    nombreNuits?: number
    ville?: string
    hotel?: string
  }
  
  // Liens
  interventionId?: string
  interventionNom?: string
  siteId?: string
  siteNom?: string
  
  // Justificatifs
  justificatifs: [{
    url: string
    nom: string
    type: 'image' | 'pdf'
    uploadedAt: string
  }]
  
  // Workflow validation
  statut: 'brouillon' | 'soumise' | 'validee_manager' | 'validee_comptable' | 'refusee' | 'payee'
  
  dateValidationManager?: string
  valideParManager?: string
  
  dateValidationComptable?: string
  valideParComptable?: string
  
  dateRefus?: string
  refuseePar?: string
  motifRefus?: string
  
  datePaiement?: string
  modePaiement?: string
  ligneBancaireId?: string
  
  // Comptabilité
  compteComptable: string // 6251, 6256, 6061
  exported: boolean
  
  notes?: string
  createdAt: string
  updatedAt: string
}
```

#### factures_fournisseurs
```typescript
{
  id: string
  numero: string
  numeroFournisseur: string
  
  societeId: string
  societeNom: string
  
  fournisseur: string
  siretFournisseur?: string
  
  dateFacture: string
  dateEcheance: string
  
  montantHT: number
  montantTVA: number
  montantTTC: number
  tauxTVA: number
  tvaDeductible: boolean
  montantTVADeductible: number
  
  categorie: string
  compteComptable: string
  description: string
  
  lignes?: [{
    description: string
    quantite: number
    prixUnitaireHT: number
    montantHT: number
    
    // 🔗 LIEN AVEC STOCK
    articleId?: string // Si achat stock
    articleCode?: string
  }]
  
  pdfURL?: string
  
  statut: 'recue' | 'validee' | 'payee'
  datePaiement?: string
  modePaiement?: string
  ligneBancaireId?: string
  
  // 🔗 LIEN AVEC STOCK
  mouvementStockId?: string // Si génère entrée stock
  
  exported: boolean
  createdAt: string
  updatedAt: string
}
```

#### charges_fixes
```typescript
{
  id: string
  societeId: string
  societeNom: string
  
  nom: string
  type: 'loyer' | 'assurance' | 'abonnement' | 'salaire_fixe' | 'emprunt' | 'autre'
  fournisseur: string
  
  montantHT?: number
  montantTVA?: number
  montantTTC: number
  tauxTVA?: number
  tvaDeductible: boolean
  
  frequence: 'mensuelle' | 'trimestrielle' | 'semestrielle' | 'annuelle'
  jourPrelevement: number
  moisDebut?: number
  
  dateDebut: string
  dateFin?: string
  actif: boolean
  
  autoGenererFacture: boolean
  dernierePeriodeGeneree?: string
  
  compteComptable: string
  createdAt: string
  updatedAt: string
}
```

#### comptes_courants_associes
```typescript
{
  id: string
  societeId: string
  societeNom: string
  
  associeNom: string // "Jerome Gely" ou "Axel"
  associeId: string
  
  soldeCourant: number // Positif = société doit
  
  mouvements: [{
    id: string
    date: string
    type: 'apport' | 'retrait' | 'remboursement'
    montant: number
    description: string
    ligneBancaireId?: string
    createdAt: string
  }]
  
  tauxInteret?: number
  interetsCalcules: boolean
  
  createdAt: string
  updatedAt: string
}
```

#### flux_inter_societes
```typescript
{
  id: string
  numero: string
  
  societeEmettrice: string
  societeEmettriceNom: string
  societeReceptrice: string
  societeReceptriceNom: string
  
  type: 'facturation' | 'prestation' | 'refacturation' | 'avance' | 'remboursement'
  
  montantHT: number
  montantTVA: number
  montantTTC: number
  
  date: string
  description: string
  
  statut: 'en_attente' | 'paye'
  datePaiement?: string
  
  factureEmettriceId?: string
  factureReceptriceId?: string
  
  createdAt: string
  updatedAt: string
}
```

#### tva_declarations
```typescript
{
  id: string
  societeId: string
  societeNom: string
  
  periode: string // "2025-12"
  regime: 'mensuel' | 'trimestriel'
  
  tvaCollectee: number // Factures clients
  factures: string[]
  
  tvaDeductible: number // Fournisseurs + notes frais
  sources: [{
    type: 'facture_fournisseur' | 'note_frais'
    id: string
    montantTVA: number
  }]
  
  tvaAPayer: number
  
  statut: 'brouillon' | 'declaree' | 'payee'
  dateDeclaration?: string
  datePaiement?: string
  ligneBancaireId?: string
  
  createdAt: string
  updatedAt: string
}
```

---

### 📦 STOCK & FLOTTE (Existant - à intégrer)

#### articles (Stock atelier)
```typescript
{
  id: number
  code: string // Scanner QR
  description: string
  fournisseur?: string
  prixUnitaire?: number
  photo?: string // Base64
  
  // Stock par dépôt
  stock: {
    'Atelier': number
    'Porteur 26 T': number
    'Porteur 32 T': number
    'Semi Remorque': number
  }
  
  // Seuils alertes
  seuilMin?: number
  seuilMax?: number
  
  // Comptabilité
  compteComptable?: string // 6064, 6061
  
  createdAt: string
  updatedAt: string
}
```

#### mouvements_stock
```typescript
{
  id: string
  date: string
  type: 'entree' | 'sortie' | 'transfert'
  
  articleId: string
  articleCode: string
  articleDescription: string
  
  quantite: number
  
  // Selon type
  depotOrigine?: string // Pour sortie/transfert
  depotDestination?: string // Pour entrée/transfert
  
  motif: string
  
  // 🔗 LIENS
  interventionId?: string // Si sortie pour intervention
  equipementId?: string // Si affectation véhicule
  factureFournisseurId?: string // Si entrée suite achat
  
  operateur: string
  notes?: string
  
  createdAt: string
}
```

#### equipements (Flotte véhicules + matériel)
```typescript
{
  id: number
  immat: string // Immatriculation
  type: 'Véhicule léger' | 'Porteur' | 'Semi-remorque' | 'Nacelle' | 'Échafaudage' | 'Autre'
  
  // Infos véhicule
  marque?: string
  modele?: string
  annee?: number
  km: number
  heures?: number // Pour nacelles
  carburant?: string
  vin?: string
  ptac?: number
  poids?: number
  
  // Propriété
  proprietaire: string // "SOLAIRE NETTOYAGE", "LEXA", etc.
  
  // Valeurs
  valeurAchat?: number
  valeurActuelle?: number
  
  // Financement
  typeFinancement?: 'Crédit' | 'LOA' | 'LLD' | 'Propriété'
  coutMensuel?: number
  dateDebut?: string
  dateFin?: string
  
  // Assurance
  assurance?: number // Coût annuel
  
  // Légal
  dateControleTechnique?: string
  dateProchainCT?: string
  
  // 🔗 LIEN NOTES FRAIS
  carburantConsomme?: number // Total litres
  coutCarburantTotal?: number // Total €
  
  notes?: string
  actif: boolean
  
  createdAt: string
  updatedAt: string
}
```

#### maintenance (Interventions maintenance)
```typescript
{
  id: string
  date: string
  type: string // 'Vidange', 'Révision', etc.
  
  equipementId: string
  equipementImmat: string
  
  km?: number
  heures?: number
  
  description: string
  cout: number
  
  // Articles utilisés
  articles: [{
    articleId: string
    articleCode: string
    quantite: number
    prixUnitaire: number
  }]
  
  fournisseur?: string
  facture?: string
  
  // 🔗 LIEN AVEC FINANCES
  factureFournisseurId?: string
  
  prochaineMaintenance?: string
  
  operateur: string
  notes?: string
  
  createdAt: string
}
```

#### accessoires_equipement (Affectations articles → véhicules)
```typescript
{
  id: string
  equipementId: string
  equipementImmat: string
  
  articleId: string
  articleCode: string
  articleDescription: string
  
  quantite: number
  dateAffectation: string
  
  permanent: boolean // Ou temporaire
  
  notes?: string
  createdAt: string
}
```

#### alertes_equipements (VGP, CT, maintenances)
```typescript
{
  id: string
  equipementId: string
  equipementImmat: string
  
  type: 'VGP' | 'CT' | 'Maintenance' | 'Assurance'
  
  dateEcheance: string
  statut: 'ok' | 'alerte' | 'urgent' | 'expire'
  
  description: string
  
  rappelEnvoye: boolean
  dateRappel?: string
  
  createdAt: string
}
```

---

### 📊 EXPORTS & ANALYSES

#### exports_comptables
```typescript
{
  id: string
  type: 'fec' | 'csv_compta' | 'excel'
  periode: string
  societeId?: string
  
  lignesEcriture: [{
    date: string
    journal: string
    compteGeneral: string
    compteAuxiliaire?: string
    libelle: string
    debit: number
    credit: number
    reference: string
    type: string
    sourceId: string
  }]
  
  fileURL: string
  fileName: string
  
  createdBy: string
  createdAt: string
}
```

#### categories_depenses (Référentiel)
```typescript
{
  id: string
  code: string // "6251"
  nom: string // "Voyages"
  type: 'charge' | 'immobilisation'
  tvaDeductible: boolean
  actif: boolean
}
```

---

## 🔗 LIENS ENTRE MODULES

### 1. FINANCES ↔ STOCK

**Achat stock → Facture fournisseur**
```
Facture fournisseur créée
  └─ Lignes avec articleId
      └─ Génère automatiquement mouvements_stock (entrée)
          └─ Met à jour articles.stock[depot]
              └─ Rapprochement bancaire possible
```

**Consommation intervention → Sortie stock**
```
Intervention terrain créée
  └─ Articles consommés listés
      └─ Génère mouvements_stock (sortie)
          └─ Diminue articles.stock[depot origine]
              └─ Peut générer ligne facture client
```

### 2. FINANCES ↔ FLOTTE

**Note frais carburant → Véhicule**
```
Note frais type="carburant"
  └─ details.vehiculeId lié
      └─ Met à jour equipements.carburantConsomme
          └─ Met à jour equipements.coutCarburantTotal
              └─ Calcul coût/km automatique
```

**Maintenance → Facture fournisseur**
```
Maintenance créée avec coût
  └─ Articles utilisés
      └─ Sortie stock automatique
          └─ Peut lier facture fournisseur
              └─ Rapprochement bancaire
```

### 3. CONFORMITÉ ↔ FLOTTE

**VGP/CT → Alertes**
```
equipements.dateProchainCT
  └─ Génère alertes_equipements
      └─ Notifications J-30, J-7
          └─ Bloque intervention si expiré
```

### 4. INTERVENTIONS ↔ OPÉRATIONS

**Intervention Praxedo ↔ Stock**
```
Rapport Praxedo reçu
  └─ Intervention matchée
      └─ Articles consommés saisis
          └─ Mouvements stock générés
              └─ Peut facturer client
```

---

## 📊 WORKFLOWS COMPLETS

### WORKFLOW 1 : Achat Stock

```
1. COMMANDE FOURNISSEUR
   → Facture fournisseur reçue
   → Saisie dans système

2. RÉCEPTION MARCHANDISE
   → Scanner QR articles
   → Entrée stock automatique
   → Lien facture ↔ mouvement

3. PAIEMENT FOURNISSEUR
   → Virement effectué
   → Import relevé bancaire
   → Rapprochement auto ligne ↔ facture
   → Trésorerie mise à jour

4. COMPTABILITÉ
   → TVA déductible calculée
   → Export FEC généré
```

### WORKFLOW 2 : Intervention Terrain

```
1. PLANIFICATION
   → Intervention créée (Planning)
   → Équipe + véhicule affectés
   → Articles pré-affectés (anticipation conso)

2. EXÉCUTION
   → Praxedo génère rapport PDF
   → Email automatique reçu
   → Rapport associé intervention

3. CONSOMMATION STOCK
   → Articles utilisés scannés QR
   → Sortie stock automatique
   → Stock véhicule mis à jour

4. FACTURATION CLIENT
   → Articles facturables ajoutés
   → Facture générée automatiquement
   → Email client + PDF

5. ENCAISSEMENT
   → Client paie
   → Import relevé bancaire
   → Rapprochement auto
   → Trésorerie +
```

### WORKFLOW 3 : Note Frais Carburant

```
1. SALARIÉ
   → Plein essence véhicule
   → Photo ticket
   → Crée note frais :
      - Type: carburant
      - Véhicule: sélection
      - Litres: 45L
      - Prix: 75.50€ TTC
      - TVA 20%: calculée auto
   → Soumet pour validation

2. MANAGER (Jerome/Axel)
   → Vérifie justificatif
   → Vérifie montants
   → Valide

3. COMPTABLE (Jerome/Axel)
   → Vérifie TVA récupérable
   → Valide comptablement
   → Note passe en "à payer"

4. PAIEMENT
   → Virement salarié
   → Ligne bancaire créée
   → Rapprochement auto
   → Note marquée "payée"

5. MISE À JOUR FLOTTE
   → equipements.carburantConsomme += 45L
   → equipements.coutCarburantTotal += 75.50€
   → Calcul coût/km actualisé

6. COMPTABILITÉ
   → TVA déductible ajoutée
   → Export FEC incluant note
```

### WORKFLOW 4 : Maintenance Véhicule

```
1. ALERTE MAINTENANCE
   → Système détecte KM ou date
   → Alerte générée
   → Notification Jerome/Axel

2. RENDEZ-VOUS GARAGE
   → Maintenance programmée
   → Intervention créée (type: maintenance)

3. EXÉCUTION MAINTENANCE
   → Garage effectue travaux
   → Articles utilisés (huile, filtres...)
   → Sortie stock si stock interne
   → Ou achat fournisseur externe

4. FACTURE GARAGE
   → Facture fournisseur reçue
   → Saisie système
   → Lien maintenance ↔ facture

5. PAIEMENT
   → Virement garage
   → Rapprochement bancaire
   → Trésorerie -

6. MISE À JOUR ÉQUIPEMENT
   → KM actualisé
   → Heures actualisées
   → Prochaine maintenance calculée
   → Historique enrichi

7. COMPTABILITÉ
   → Coût maintenance ajouté au véhicule
   → TVA déductible
   → Export FEC
```

---

## 📊 DASHBOARDS

### 1. DASHBOARD GÉNÉRAL (Jerome + Axel)

**Vue Patrimoine Global**
```
┌─────────────────────────────────────────────────────────────┐
│ 💎 PATRIMOINE TOTAL GROUPE GELY                             │
│ Valeur nette : 2 450 000 €                                  │
│ Trésorerie totale : 385 000 €                               │
│ Immobilisations : 580 000 € (véhicules + matériel + immo)  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Société              │ Tréso   │ CA Annuel │ Résultat │ CC*     │
├──────────────────────────────────────────────────────────────────┤
│ 💼 Solaire Nettoyage │ 85 K€   │ 1 500 K€  │ +180 K€  │ -50K€   │
│ 🏢 LEXA              │ 120 K€  │ 180 K€    │ +35 K€   │ +80K€   │
│ 🏢 LEXA 2            │ 95 K€   │ 120 K€    │ +18 K€   │ +40K€   │
│ 🏠 SCI GELY          │ 45 K€   │ 50 K€     │ +12 K€   │ +150K€  │
│ ⚡ Projets PV        │ 40 K€   │ -         │ -        │ +200K€  │
└──────────────────────────────────────────────────────────────────┘
* CC = Compte Courant Associé Jerome
```

**Alertes Groupe**
```
⚠️ Solaire : 3 factures impayées > 30j (45 200€)
⚠️ LEXA : TVA à payer 15/01 (12 500€)
⚠️ Flotte : Porteur 26T - CT expire dans 12j
⚠️ Stock : 5 articles sous seuil mini
✅ Notes frais : 3 en attente validation
```

---

### 2. DASHBOARD SOLAIRE NETTOYAGE

**KPIs Opérationnels**
```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│ CA Mois             │ Trésorerie          │ TVA à Payer         │
│ 125 430 € HT        │ 85 230 €            │ 12 500 €            │
│ +15% vs mois-1      │ [Graphique]         │ Échéance: 15/01     │
└─────────────────────┴─────────────────────┴─────────────────────┘

┌─────────────────────┬─────────────────────┬─────────────────────┐
│ Interventions Mois  │ Stock Valorisé      │ Flotte (3 véhicules)│
│ 287 sites           │ 45 230 €            │ Valeur: 180 000 €   │
│ 3 600/an (on track) │ 152 articles        │ Coût/mois: 3 200€   │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**Graphiques**
- CA 12 derniers mois
- Trésorerie évolution
- Top 10 clients CA
- Répartition dépenses
- Coûts flotte
- Consommation stock

---

### 3. DASHBOARD STOCK & FLOTTE

**Stock Atelier**
```
┌──────────────────────────────────────────────────────────────────┐
│ Article         │ Atelier │ P.26T │ P.32T │ Semi │ Total │ Seuil│
├──────────────────────────────────────────────────────────────────┤
│ Produit A       │ 45      │ 12    │ 8     │ 15   │ 80    │ ✅   │
│ Consommable B   │ 8       │ 3     │ 2     │ 1    │ 14    │ ⚠️   │
│ Filtre C        │ 120     │ 20    │ 20    │ 10   │ 170   │ ✅   │
└──────────────────────────────────────────────────────────────────┘

Valeur stock total : 45 230 €
Articles sous seuil : 5
Mouvements mois : 187 (89 sorties, 23 entrées, 75 transferts)
```

**Flotte Véhicules**
```
┌──────────────────────────────────────────────────────────────────┐
│ Véhicule      │ KM      │ Conso  │ Coût/km │ Proch.Maint │ CT   │
├──────────────────────────────────────────────────────────────────┤
│ Porteur 26T   │ 125 430 │ 18L/100│ 0.42€   │ 135 000 km  │ 2 mois│
│ Porteur 32T   │ 98 200  │ 19L/100│ 0.45€   │ Dans 500 km │ ✅    │
│ Semi Remorque │ 210 000 │ 22L/100│ 0.48€   │ ⚠️ Retard   │ 6 mois│
└──────────────────────────────────────────────────────────────────┘

Valeur flotte : 180 000 €
Coût mensuel total : 3 200 € (crédit + assurance + entretien)
Coût carburant mois : 2 450 €
```

**Alertes**
```
🔴 URGENT
- Semi Remorque : maintenance retardée 2500 km
- Article "Filtre spécial" : stock 3 unités (seuil 10)

🟡 ATTENTION
- Porteur 26T : CT dans 2 mois
- 5 articles sous seuil mini
- Commande fournisseur X en retard 7j

✅ OK
- 3 VGP effectuées ce mois
- Tous véhicules assurés
- Stock valorisé conforme
```

---

### 4. DASHBOARD TRÉSORERIE

**Multi-Comptes**
```
┌──────────────────────────────────────────────────────────────────┐
│ Compte                        │ Solde      │ Mouvements 30j      │
├──────────────────────────────────────────────────────────────────┤
│ Solaire - BNP Courant         │ 85 230 €   │ +145K / -162K       │
│ Solaire - CA Livret           │ 150 000 €  │ +50K                │
│ LEXA - BNP Pro                │ 120 000 €  │ +12K / -8K          │
│ SCI GELY - CA                 │ 45 000 €   │ +5K / -3K           │
├──────────────────────────────────────────────────────────────────┤
│ TOTAL GROUPE                  │ 400 230 €  │                     │
└──────────────────────────────────────────────────────────────────┘
```

**Prévisionnel 90 jours**
```
Basé sur :
- Factures clients échéance connue
- Charges fixes programmées
- Notes frais à payer
- Maintenances prévues
- Échéances fournisseurs

[Graphique évolution trésorerie prévisionnelle]
```

---

## 🔧 MODULES À DÉVELOPPER

### PHASE 1 : Fondations Multi-Sociétés (2 semaines)
```
✅ Collection societes
✅ Collection comptes_bancaires
✅ Modifier collections existantes :
   - Ajouter societeId partout (factures, avoirs, devis)
   - Migrer données Solaire Nettoyage
✅ Interface gestion sociétés
✅ Sélecteur société dans formulaires
✅ Couleurs par société
```

### PHASE 2 : Intégration Stock & Flotte (2-3 semaines)
```
✅ Migrer appli React existante → Next.js
✅ Adapter collections Firebase Realtime → Firestore
✅ Refaire interfaces avec design cohérent
✅ Intégrer dans navigation principale
✅ Modules :
   - Articles (avec QR code)
   - Stock (entrées/sorties/transferts)
   - Équipements (flotte)
   - Maintenance
   - Interventions maintenance
   - Affectations articles → véhicules
   - Alertes (VGP, CT, stock mini)
```

### PHASE 3 : Liens Finances ↔ Stock (1-2 semaines)
```
✅ Facture fournisseur → Entrée stock auto
✅ Intervention → Sortie stock auto
✅ Note frais carburant → Mise à jour véhicule
✅ Maintenance → Facture fournisseur + Stock
✅ Coûts flotte dans dashboard finances
```

### PHASE 4 : Trésorerie & Banque (2 semaines)
```
✅ Collection lignes_bancaires
✅ Import CSV relevés
✅ Rapprochement bancaire auto
✅ Interface rapprochement manuel
✅ Dashboard trésorerie multi-sociétés
✅ Prévisionnel 90 jours
```

### PHASE 5 : Notes de Frais PRO (2 semaines)
```
✅ Refonte complète notes_frais
✅ TVA HT/TVA/TTC
✅ Types détaillés (carburant avec véhicule)
✅ Workflow validation 2 niveaux
✅ Upload justificatifs Firebase Storage
✅ Barème kilométrique
✅ Lien avec flotte
```

### PHASE 6 : Fournisseurs & Charges (1-2 semaines)
```
✅ Collection factures_fournisseurs
✅ Collection charges_fixes
✅ Interface saisie fournisseurs
✅ Lien avec stock (achat articles)
✅ Auto-génération charges fixes
✅ Rapprochement paiements
```

### PHASE 7 : Comptes Courants & Flux (1-2 semaines)
```
✅ Collection comptes_courants_associes
✅ Collection flux_inter_societes
✅ Interface mouvements CC
✅ Génération factures inter-sociétés auto
✅ Dashboard CC Jerome + Axel
```

### PHASE 8 : TVA & Comptabilité (2 semaines)
```
✅ Collection tva_declarations
✅ Calcul auto TVA collectée/déductible
✅ Génération déclarations
✅ Export FEC légal
✅ Export Excel comptable
✅ Interface exports par société
```

### PHASE 9 : Dashboards Groupe (2 semaines)
```
✅ Dashboard consolidé patrimoine
✅ Dashboard par société
✅ Dashboard trésorerie global
✅ Dashboard stock & flotte
✅ Graphiques évolution
✅ Alertes automatiques
```

### PHASE 10 : Utilisateurs & Sécurité (1 semaine)
```
✅ Firebase Authentication
✅ Collection utilisateurs
✅ Rôles : admin (Jerome+Axel), manager, salarié, comptable
✅ Permissions par module
✅ Logs actions sensibles
```

---

## 📊 RÉCAPITULATIF

**TEMPS TOTAL ESTIMÉ : 16-20 semaines**

**Collections Firebase Totales : 25**
- 5 multi-sociétés (societes, comptes, lignes bancaires, CC, flux)
- 9 finances (factures, avoirs, devis, notes frais, fournisseurs, charges, TVA, exports, catégories)
- 6 stock & flotte (articles, mouvements, equipements, maintenance, accessoires, alertes)
- 5 opérations (interventions, sites, clients, groupes, rapports)

**Modules Interface : 30+**
- Finances : 10
- Stock & Flotte : 8
- CRM : 5
- Opérations : 4
- Administration : 3

**Utilisateurs Types : 4**
- Admin (Jerome + Axel) : accès total identique
- Manager : CRM + Opérations
- Salarié : Planning + Notes frais + Stock
- Comptable : Validation + Exports

---

## 🎯 POINTS CRITIQUES

### 1. Migration Stock & Flotte
```
Appli React existante → Next.js 14
Firebase Realtime → Firestore
Préserver toutes fonctionnalités :
- Scanner QR code
- Photos articles
- Affectations véhicules
- Alertes VGP/CT
```

### 2. TVA Complète
```
Toutes opérations avec TVA :
- Factures clients (collectée)
- Factures fournisseurs (déductible)
- Notes frais (déductible si pro)
- Avoirs (à déduire)
→ Calcul automatique déclarations
→ Export FEC conforme
```

### 3. Rapprochement Bancaire
```
Import CSV relevés
↓
Matching automatique intelligent :
- Montant exact + date proche
- Libellé contient N° facture
- Pattern reconnu (NDF, CC)
↓
Validation manuelle restant
↓
Statuts mis à jour partout
```

### 4. Comptes Courants Associés
```
Jerome peut :
- Apporter argent → Société
- Retirer argent → Personnel
- Voir solde CC chaque société
- Calculer intérêts (optionnel)
→ Traçabilité complète
→ Pièces justificatives
```

### 5. Dashboards Temps Réel
```
Tous dashboards doivent refléter :
- Trésorerie actuelle
- CA temps réel
- Stock valorisé
- Alertes critiques
→ Pas de décalage
→ Calculs instantanés
```

---

## 📁 STRUCTURE FICHIERS FINALE

```
/app/admin/
├── dashboard/                    # Dashboard général Jerome+Axel
├── dashboard-groupe/             # Consolidé patrimoine
│
├── finances/
│   ├── dashboard/                # Dashboard finances société
│   ├── tresorerie/
│   │   ├── comptes/              # Multi-comptes
│   │   ├── rapprochement/
│   │   └── previsionnel/
│   ├── devis/                    # ✅ Existant
│   ├── factures/                 # ✅ Existant + enrichir TVA
│   ├── avoirs/                   # ✅ Existant + enrichir TVA
│   ├── notes-frais/              # Refaire complet
│   ├── fournisseurs/
│   ├── charges-fixes/
│   ├── comptes-courants/         # CC associés
│   ├── flux-inter-societes/
│   ├── tva/
│   └── exports/
│
├── stock-flotte/                 # Nouveau mega-module
│   ├── dashboard/
│   ├── articles/                 # Migré React
│   ├── stock/                    # Entrées/sorties/transferts
│   ├── equipements/              # Flotte véhicules
│   ├── maintenance/
│   ├── affectations/             # Articles → véhicules
│   ├── alertes/                  # VGP, CT, stock
│   └── statistiques/
│
├── crm/                          # ✅ Existant
├── operations/                   # ✅ Existant
├── conformite/                   # ✅ Existant
│
└── administration/
    ├── societes/                 # Nouveau
    ├── utilisateurs/             # Nouveau
    ├── gely/                     # ✅ Existant
    └── parametres/
```

---

---

## 📚 MODULES COMPLÉMENTAIRES ESSENTIELS

### 1. GED - GESTION ÉLECTRONIQUE DOCUMENTS 🔥 PRIORITÉ 0

**Besoin critique :**
```
Documents par CLIENT :
- Contrats signés
- Assurances
- KBIS
- Conditions générales
- Correspondances

Documents par SITE :
- Plans installations
- Photos avant/après interventions
- Schémas techniques
- Autorisations accès
- Fiches sécurité

Documents par VÉHICULE/ÉQUIPEMENT :
- Carte grise
- Attestation assurance
- Contrôle technique PDF
- Factures garage
- Rapports VGP

Documents par EMPLOYÉ :
- Contrat de travail
- Certificats CACES PDF
- Attestations formation
- Visites médicales PDF
- Diplômes
```

#### documents
```typescript
{
  id: string
  nom: string
  type: 'pdf' | 'image' | 'word' | 'excel' | 'autre'
  
  // Catégorisation
  categorie: 'contrat' | 'assurance' | 'juridique' | 'technique' | 
             'facturation' | 'rh' | 'certification' | 'autre'
  
  // Attachement (polymorphe)
  attacheTo: 'client' | 'site' | 'equipement' | 'employe' | 'facture' | 'intervention'
  attacheId: string
  
  // Fichier
  fileURL: string
  fileSize: number
  mimeType: string
  
  // Expiration/Renouvellement
  dateExpiration?: string
  alerteExpiration: boolean
  joursAlerte?: number // Alerter X jours avant
  
  // Métadonnées
  description?: string
  tags: string[]
  version?: string
  
  // Sécurité
  confidentiel: boolean
  accesRestreint: string[] // userIds autorisés
  
  uploadedBy: string
  uploadedAt: string
  updatedAt: string
}
```

**Fonctionnalités :**
- Upload multi-fichiers (drag & drop)
- Visualisation PDF/images dans l'interface
- Génération vignettes automatique
- Recherche par nom/tags/catégorie
- Alertes expiration automatiques (ex: CT expire dans 15j)
- Historique versions documents
- Export ZIP documents par entité

---

### 2. CONTRATS CLIENTS RÉCURRENTS 🔥 PRIORITÉ 1

**Besoin stratégique :**
```
Client EDF : Contrat cadre 1000 sites
→ Facturation mensuelle automatique 125 000€ HT
→ X interventions incluses/mois
→ Renouvellement annuel
→ Alertes renouvellement J-60, J-30, J-7
→ Suivi consommation vs contrat

Avantages :
- Facturation automatique (gain temps)
- Prévisibilité trésorerie
- Pas d'oubli facturation
- Suivi performance vs engagement
```

#### contrats_clients
```typescript
{
  id: string
  numero: string // CONT-2025-001
  
  // Client
  clientId: string
  clientNom: string
  groupeId?: string
  
  // Société
  societeId: string
  societeNom: string
  
  // Type contrat
  type: 'mensuel' | 'trimestriel' | 'semestriel' | 'annuel'
  typePrestation: 'forfait' | 'regie' | 'mixte'
  
  // Montants
  montantHT: number
  tauxTVA: number
  montantTTC: number
  
  // Prestations incluses
  prestationsIncluses: [{
    type: string // "Nettoyage modules"
    quantite: number
    unite: string // "sites", "interventions", "heures"
    prixUnitaire?: number
  }]
  
  // Période
  dateDebut: string
  dateFin: string
  duree: number // En mois
  
  // Renouvellement
  autoRenouvellement: boolean
  typeRenouvellement?: 'tacite' | 'explicite'
  preavis?: number // Jours de préavis
  alertesRenouvellement: number[] // [60, 30, 7] jours avant
  
  // Facturation automatique
  facturationAutomatique: boolean
  jourFacturation: number // 1-31
  moisDebut?: number // Pour annuelle
  prochaineDateFacturation?: string
  
  // Suivi
  factures: string[] // IDs factures générées
  interventionsRealisees: number
  consommation: number // vs prestations incluses
  
  // Conditions spéciales
  conditionsParticulieres?: string
  penalitesRetard?: number
  bonusFidelite?: number
  
  statut: 'brouillon' | 'actif' | 'suspendu' | 'termine' | 'resilie'
  
  // Documents
  contratSigneURL?: string
  avenants: [{
    date: string
    description: string
    documentURL?: string
  }]
  
  createdBy: string
  createdAt: string
  updatedAt: string
}
```

**Workflow automatique :**
```
1. Contrat créé et activé
2. Système génère facture automatique chaque mois
3. Email envoi auto au client
4. Suivi paiement classique
5. Alertes renouvellement J-60, J-30, J-7
6. Jerome/Axel valident renouvellement
7. Nouveau contrat généré automatiquement
```

---

### 3. RELANCES CLIENTS AUTOMATIQUES 🔥 PRIORITÉ 1

**Besoin opérationnel :**
```
Facture impayée → Workflow relance automatique

J+15 après échéance : Relance 1 (courtoise)
→ Email auto "Rappel échéance passée"

J+30 : Relance 2 (ferme)
→ Email auto "2ème rappel - Merci de régulariser"

J+45 : Relance 3 (ultimatum) + Notification Jerome/Axel
→ Email auto "Dernière relance avant mesures"

J+60 : Blocage client automatique
→ Impossible créer nouvelle intervention
→ Flag "Client bloqué" visible partout
```

#### relances_clients
```typescript
{
  id: string
  factureId: string
  factureNumero: string
  
  clientId: string
  clientNom: string
  
  montantDu: number
  dateEcheance: string
  joursRetard: number
  
  // Relances effectuées
  relances: [{
    niveau: 1 | 2 | 3
    date: string
    type: 'email' | 'sms' | 'courrier' | 'telephone'
    template: string
    envoyePar: string // "Système" ou userId
    statut: 'envoyee' | 'lue' | 'reponse'
  }]
  
  // Configuration
  prochaineRelance?: string
  niveauRelanceCourant: number
  
  // Résolution
  statut: 'en_cours' | 'reglee' | 'contentieux' | 'abandonnee'
  dateResolution?: string
  montantRecupere?: number
  
  // Actions
  clientBloque: boolean
  dateBlockage?: string
  
  notes?: string
  createdAt: string
  updatedAt: string
}
```

#### templates_relances
```typescript
{
  id: string
  nom: string
  niveau: 1 | 2 | 3
  type: 'email' | 'sms'
  
  // Email
  sujet?: string
  corps: string // Template avec variables {{factureNumero}}, {{montant}}, etc.
  
  // SMS
  message?: string // Max 160 caractères
  
  delaiJours: number // Envoyer X jours après échéance
  actif: boolean
  
  createdAt: string
}
```

**Fonctionnalités :**
- Templates personnalisables (variables dynamiques)
- Planning relances automatique
- Historique complet par facture
- Dashboard relances en cours
- Statistiques taux recouvrement
- Désactivation manuelle si besoin
- Notes/commentaires par relance

---

### 4. ANALYSES & RENTABILITÉ AVANCÉES 🔥 PRIORITÉ 1

**Besoin stratégique :**
```
Prendre décisions basées sur données réelles

Par CLIENT :
- CA total
- Nombre interventions
- Coût réel (carburant + temps + stock)
- Marge réelle
- Délai paiement moyen
→ Top 10 clients rentables
→ Flop 10 clients à renégocier

Par SITE :
- Coût intervention moyen
- Temps moyen
- Distance atelier
- Fréquence nettoyage
→ Ajuster prix si pas rentable

Par VÉHICULE :
- Coût/km réel (carburant + entretien + amortissement)
- Rentabilité utilisation
- Ratio km/CA généré
→ Décision renouvellement

Par EMPLOYÉ :
- CA généré
- Nombre interventions
- Efficacité (temps moyen)
- Coûts associés
→ Performance équipes
```

#### analyses_rentabilite
```typescript
{
  id: string
  type: 'client' | 'site' | 'equipement' | 'employe'
  entityId: string
  entityNom: string
  
  periode: string // "2025-12"
  
  // CA
  chiffreAffaires: number
  nombreFactures: number
  panierMoyen: number
  
  // Coûts
  couts: {
    main_oeuvre: number
    carburant: number
    stock_consomme: number
    maintenance: number
    amortissement: number
    autres: number
    total: number
  }
  
  // Rentabilité
  margeHT: number
  tauxMarge: number // %
  rentabilite: 'excellente' | 'bonne' | 'moyenne' | 'faible' | 'negative'
  
  // KPIs spécifiques
  kpis: {
    // CLIENT
    delaiPaiementMoyen?: number
    tauxImpaye?: number
    nombreInterventions?: number
    
    // SITE
    coutInterventionMoyen?: number
    tempsMoyen?: number
    distanceKm?: number
    frequenceJours?: number
    
    // VÉHICULE
    coutKm?: number
    kmParcourus?: number
    nombreInterventions?: number
    ratioKmCA?: number
    
    // EMPLOYÉ
    nombreInterventions?: number
    tempsMoyenIntervention?: number
    caParHeure?: number
  }
  
  // Évolution
  evolutionVsPeriodePrecedente: {
    ca: number // %
    marge: number // %
    couts: number // %
  }
  
  // Recommandations auto
  recommandations: string[]
  alertes: string[]
  
  calculatedAt: string
}
```

**Dashboards BI :**
```
/admin/analyses/
├── rentabilite-clients/
│   → Graphique clients par rentabilité
│   → Top 10 / Flop 10
│   → Évolution marges
│   → Prévisions CA
│
├── rentabilite-sites/
│   → Carte sites par rentabilité
│   → Analyse distance/coût
│   → Optimisation tournées
│
├── performance-flotte/
│   → Coût/km par véhicule
│   → Utilisation (%)
│   → Recommandations renouvellement
│
├── performance-equipes/
│   → CA par employé
│   → Efficacité interventions
│   → Comparaisons
│
└── previsions/
    → Prévisions CA 3 mois
    → Prévisions trésorerie
    → Saisonnalité
```

---

### 5. ACHATS & APPROVISIONNEMENT 💡 PRIORITÉ 2

**Besoin opérationnel :**
```
Stock article < seuil mini
→ Génération bon commande auto
→ Email fournisseur
→ Suivi livraison
→ Réception → Entrée stock automatique
→ Rapprochement facture fournisseur

Historique prix fournisseurs
→ Négociation
→ Comparaison
```

#### bons_commande
```typescript
{
  id: string
  numero: string // BC-2025-001
  
  societeId: string
  societeNom: string
  
  fournisseur: string
  fournisseurId?: string
  contactFournisseur?: string
  emailFournisseur?: string
  
  dateCommande: string
  dateLivraisonPrevue?: string
  
  // Articles
  lignes: [{
    articleId: string
    articleCode: string
    articleDescription: string
    quantite: number
    prixUnitaireHT: number
    tauxTVA: number
    montantHT: number
    montantTVA: number
    montantTTC: number
    
    // Stock
    depotDestination: string
  }]
  
  totalHT: number
  totalTVA: number
  totalTTC: number
  
  statut: 'brouillon' | 'envoye' | 'confirme' | 'livre_partiel' | 'livre' | 'annule'
  
  // Suivi
  dateEnvoi?: string
  dateConfirmation?: string
  dateLivraisonReelle?: string
  
  // Réception
  receptions: [{
    date: string
    articleId: string
    quantiteRecue: number
    mouvementStockId: string
  }]
  
  // Lien facture
  factureFournisseurId?: string
  
  pdfURL?: string
  notes?: string
  
  createdBy: string
  createdAt: string
  updatedAt: string
}
```

**Workflow :**
```
1. Article atteint seuil mini
   → Alerte générée
   
2. Jerome/Axel crée bon commande
   → Sélection articles
   → Quantités
   → Fournisseur
   
3. Envoi email fournisseur avec BC PDF
   
4. Réception marchandise
   → Scanner articles
   → Entrée stock automatique
   → Lien BC ↔ Mouvement stock
   
5. Réception facture fournisseur
   → Rapprochement BC ↔ Facture
   → Vérification prix/quantités
   
6. Paiement
   → Ligne bancaire
   → Rapprochement complet
```

---

### 6. COMMUNICATION AUTOMATIQUE 💡 PRIORITÉ 2

**Besoin satisfaction client :**
```
SMS automatiques :
- Veille intervention : "RDV demain 9h site X"
- Fin intervention : "Intervention terminée, rapport en ligne"
- Facture disponible : "Nouvelle facture FA-2025-XXX"

Emails automatiques :
- Confirmation RDV
- Envoi rapport PDF
- Facture mensuelle
- Rappel échéance contrat
- Alertes importantes
```

#### messages_automatiques
```typescript
{
  id: string
  type: 'sms' | 'email'
  
  // Déclencheur
  trigger: 'intervention_veille' | 'intervention_termine' | 'facture_disponible' | 
           'rapport_disponible' | 'relance_paiement' | 'alerte_contrat' | 'autre'
  
  // Destinataire
  destinataireType: 'client' | 'employe'
  destinataireId: string
  destinataireNom: string
  destinataireContact: string // Email ou téléphone
  
  // Contenu
  template: string
  sujet?: string // Email uniquement
  contenu: string
  
  // Données contexte
  contexte: {
    factureId?: string
    interventionId?: string
    siteId?: string
    // ... autres variables
  }
  
  // Envoi
  statut: 'planifie' | 'envoye' | 'delivre' | 'erreur'
  dateEnvoi?: string
  dateDelivraison?: string
  
  // Erreurs
  erreur?: string
  tentatives: number
  
  createdAt: string
}
```

#### templates_communication
```typescript
{
  id: string
  nom: string
  type: 'sms' | 'email'
  trigger: string
  
  sujet?: string
  contenu: string // Variables: {{clientNom}}, {{dateIntervention}}, etc.
  
  actif: boolean
  delaiEnvoi?: number // Minutes avant/après trigger
  
  createdAt: string
  updatedAt: string
}
```

**API intégration :**
- SMS : Twilio, OVH SMS, ou autre
- Email : Resend (déjà utilisé) ou SendGrid

---

### 7. RH LÉGER - CONGÉS/ABSENCES 💡 OPTIONNEL

**Besoin SI pas logiciel externe :**
```
4 opérateurs terrain :
- Solde congés (25 jours/an)
- Demandes congés → Validation Jerome/Axel
- Planning absences
- Impact planning interventions
- Alertes conflit planning

Heures travaillées :
- Pointage début/fin intervention
- Calcul heures sup
- Export pour paie
```

#### conges_absences
```typescript
{
  id: string
  employeId: string
  employeNom: string
  
  type: 'conge_paye' | 'rtt' | 'maladie' | 'sans_solde' | 'formation'
  
  dateDebut: string
  dateFin: string
  nombreJours: number
  
  motif?: string
  certificatURL?: string // Si maladie
  
  statut: 'demande' | 'validee' | 'refusee' | 'annulee'
  
  // Validation
  dateValidation?: string
  valideePar?: string
  motifRefus?: string
  
  // Impact
  interventionsImpactees: string[]
  conflitPlanning: boolean
  
  createdAt: string
}
```

#### employes
```typescript
{
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  
  poste: string
  dateEmbauche: string
  
  // Congés
  soldeConges: number
  soldeRTT: number
  
  // Certifications
  certifications: string[] // IDs certifications
  
  actif: boolean
  
  createdAt: string
}
```

---

### 8. SOUS-TRAITANCE 💡 SI APPLICABLE

**Si vous sous-traitez parfois :**

#### sous_traitants
```typescript
{
  id: string
  nom: string
  siret: string
  contact: string
  telephone: string
  email: string
  
  specialites: string[]
  tarifHoraire?: number
  
  notes?: string
  actif: boolean
}
```

#### missions_sous_traitance
```typescript
{
  id: string
  sousTraitantId: string
  interventionId?: string
  
  description: string
  dateDebut: string
  dateFin?: string
  
  montantHT: number
  tauxTVA: number
  montantTTC: number
  
  // Refacturation client
  refactureClient: boolean
  factureClientId?: string
  margeHT?: number
  
  // Paiement
  factureSousTraitantId?: string
  statut: 'en_cours' | 'termine' | 'facture' | 'paye'
  
  createdAt: string
}
```

---

### 9. PROJETS PHOTOVOLTAÏQUES 💡 À CLARIFIER

**Option A : Installation panneaux**
```typescript
{
  id: string
  nom: string
  client: string
  site: string
  
  puissance: number // kWc
  nombreModules: number
  
  dateDebut: string
  dateFin?: string
  
  budget: number
  coutReel: number
  marge: number
  
  statut: 'etude' | 'en_cours' | 'termine'
}
```

**Option B : Production électricité**
```typescript
{
  id: string
  nom: string
  puissance: number
  
  production: [{
    mois: string
    kwh: number
    revente: number
  }]
  
  maintenance: string[]
}
```

**À définir selon activité réelle**

---

### 10. QUALITÉ / RÉCLAMATIONS 💡 SI ISO

**Si certification qualité :**

#### reclamations
```typescript
{
  id: string
  numero: string
  
  clientId: string
  interventionId?: string
  
  dateReclamation: string
  type: 'qualite' | 'delai' | 'facturation' | 'technique' | 'autre'
  
  description: string
  gravite: 'faible' | 'moyenne' | 'grave'
  
  // Traitement
  enquete?: string
  causesIdentifiees?: string
  actionsCorrectives: [{
    action: string
    responsable: string
    dateEcheance: string
    statut: 'planifiee' | 'en_cours' | 'terminee'
  }]
  
  statut: 'ouverte' | 'en_cours' | 'resolue' | 'close'
  dateResolution?: string
  
  satisfactionClient?: number // 1-5
  
  createdAt: string
}
```

---

## 📊 PLAN DE DÉVELOPPEMENT COMPLET FINAL

### VAGUE 1 : Système Financier Multi-Sociétés (16-20 semaines)
```
Phase 1 : Fondations multi-sociétés (2 sem)
Phase 2 : Intégration Stock & Flotte (2-3 sem)
Phase 3 : Liens Finances ↔ Stock (1-2 sem)
Phase 4 : Trésorerie & Banque (2 sem)
Phase 5 : Notes Frais PRO (2 sem)
Phase 6 : Fournisseurs & Charges (1-2 sem)
Phase 7 : Comptes Courants & Flux (1-2 sem)
Phase 8 : TVA & Comptabilité (2 sem)
Phase 9 : Dashboards Groupe (2 sem)
Phase 10 : Utilisateurs & Sécurité (1 sem)
```

### VAGUE 2 : Modules Business Critiques (4-6 semaines)
```
Phase 11 : GED - Documents (1-2 sem) 🔥
Phase 12 : Contrats Récurrents (1 sem) 🔥
Phase 13 : Relances Automatiques (1 sem) 🔥
Phase 14 : Analyses Rentabilité (1-2 sem) 🔥
```

### VAGUE 3 : Optimisation & Confort (2-4 semaines)
```
Phase 15 : Achats/Approvisionnement (1-2 sem)
Phase 16 : Communication Auto (1-2 sem)
```

### VAGUE 4 : Modules Optionnels (selon besoins)
```
Phase 17 : RH Léger (1 sem) - SI BESOIN
Phase 18 : Sous-traitance (1 sem) - SI BESOIN
Phase 19 : Projets PV (1-2 sem) - À CLARIFIER
Phase 20 : Qualité (1 sem) - SI ISO
```

**TOTAL ESTIMÉ : 22-30 semaines pour système ULTRA-COMPLET**

---

## 📊 COLLECTIONS FIREBASE FINALES

**TOTAL : 40 collections**

### Multi-sociétés (5)
societes, comptes_bancaires, lignes_bancaires, comptes_courants_associes, flux_inter_societes

### Finances (10)
factures, avoirs, devis, notes_frais, factures_fournisseurs, charges_fixes, tva_declarations, exports_comptables, categories_depenses, contrats_clients

### Relances & Communication (5)
relances_clients, templates_relances, messages_automatiques, templates_communication, bons_commande

### Stock & Flotte (6)
articles, mouvements_stock, equipements, maintenance, accessoires_equipement, alertes_equipements

### CRM (3)
groupes, clients, sites

### Opérations (2)
interventions, rapports

### Conformité (3)
certifications, visites_medicales, vgp

### Analyses (1)
analyses_rentabilite

### Documents (1)
documents

### RH (2 - optionnel)
employes, conges_absences

### Sous-traitance (2 - optionnel)
sous_traitants, missions_sous_traitance

### Qualité (1 - optionnel)
reclamations

---

**FIN DES SPÉCIFICATIONS FINALES ULTRA-COMPLÈTES**

✅ **VERSION DÉFINITIVE AVEC TOUS LES MODULES**

Ce document est LA référence absolue et définitive pour le développement.
Toute modification doit être documentée ici.

**Prochaine étape :** 
1. Validation Jerome + Axel
2. Priorisation phases et vagues
3. Début développement Vague 1

**Date** : 30 décembre 2025
**Version** : 2.0 FINALE ULTRA-COMPLÈTE
