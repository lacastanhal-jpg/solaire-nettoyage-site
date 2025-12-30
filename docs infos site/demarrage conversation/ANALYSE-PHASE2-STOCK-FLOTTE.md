# 📦 ANALYSE COMPLÈTE - APPLICATION STOCK & FLOTTE
## VAGUE 1 - PHASE 2 : Migration vers Next.js + Firestore

**Date d'analyse :** 30 Décembre 2024  
**Projet :** Solaire Nettoyage - Intégration Stock & Flotte  
**Version app existante :** V3.9 (React standalone)

---

## 🎯 OBJECTIF PHASE 2

**Migrer l'application React Stock & Flotte vers le site Next.js principal**
- Firebase Realtime Database → Firestore
- Application React standalone → Module Next.js intégré
- Projet Firebase séparé → Projet Firebase unifié

---

## 📊 ÉTAT DES LIEUX APPLICATION EXISTANTE

### ARCHITECTURE TECHNIQUE

**Framework :** React (CRA - Create React App)  
**Base de données :** Firebase Realtime Database  
**Authentification :** Firebase Auth  
**Projet Firebase :** `gestion-flotte-et-stoks` (SÉPARÉ du site principal)

**Structure :**
```
solaire-v3/
├── src/
│   ├── App.jsx (1202 lignes - gestion état global)
│   ├── Login.jsx (authentification)
│   ├── firebase.config.js (Realtime DB config)
│   └── modules/ (12 modules principaux)
│       ├── Accueil.jsx (294 lignes)
│       ├── Articles.jsx (825 lignes)
│       ├── Stock.jsx (721 lignes)
│       ├── Equipements.jsx (633 lignes)
│       ├── Interventions.jsx (936 lignes)
│       ├── Maintenance.jsx (622 lignes)
│       ├── FicheMateriel.jsx (529 lignes)
│       ├── Inventaire.jsx (498 lignes)
│       ├── Alertes.jsx (363 lignes)
│       ├── FacturesDocuments.jsx (1013 lignes)
│       ├── Facturesex.jsx (630 lignes)
│       └── Statistiques.jsx (557 lignes)
```

**Total code application :** ~7500 lignes

---

## 🗄️ COLLECTIONS FIREBASE REALTIME DATABASE

### 1. **articles** (Stock articles)
```javascript
{
  id: number,
  code: string,              // BAC5X5, HIFSO 8055...
  description: string,
  fournisseur: string,       // LE BON ROULEMENT, RURAL MASTER...
  prixUnitaire: number,
  stockParDepot: {
    'Atelier': number,
    'Porteur 26 T': number,
    'Porteur 32 T': number,
    'Semi Remorque': number
  },
  stockMin: number,
  equipementsAffectes: number[] // IDs équipements
}
```

### 2. **mouvements** (Mouvements stock)
```javascript
{
  id: number,
  articleId: number,
  type: 'entree' | 'sortie' | 'transfert',
  quantite: number,
  date: string,
  raison: string,
  coutTotal: number,
  depot: string,
  operateur?: string
}
```

### 3. **equipements** (Véhicules/machines)
```javascript
{
  id: number,
  immat: string,             // GT-316-FG, DX-780-QN...
  type: string,              // Camion Citerne, Tracteur...
  marque: string,            // IVECO, FARMTRAC...
  modele: string,
  annee: number,
  km: number,
  heures: number,
  carburant: string,
  vin: string,
  ptac: number,
  poids: number,
  proprietaire: string,
  valeurAchat: number,
  valeurActuelle: number,
  typeFinancement: 'Achat' | 'Location',
  coutMensuel: number,
  dateDebut: string,
  dateFin: string,
  assurance: number,
  dateContracteTechnique: string,
  notes: string
}
```

### 4. **accessoires** (Accessoires équipements)
```javascript
{
  [equipementId]: [
    {
      id: number,
      nom: string,
      valeur: number,
      dateAjout: string,
      description: string,
      actif: boolean
    }
  ]
}
```

### 5. **interventions** (Maintenance/réparations)
```javascript
{
  id: number,
  equipementId: number,
  type: string,              // Entretien, Réparation...
  date: string,
  km: number,
  heures: number,
  description: string,
  travauxEffectues: string,
  articlesUtilises: [
    {
      articleId: number,
      code: string,
      description: string,
      quantite: number,
      prixUnitaire: number,
      coutTotal: number
    }
  ],
  depotPrelevement: string,
  coutTotal: number,
  operateur: string,
  statut: string
}
```

### 6. **defauts** (Défauts équipements - non confirmé)

### 7. **factures** (Factures fournisseurs - dans FacturesDocuments.jsx)

---

## 🎨 MODULES FONCTIONNELS

### 1. **Accueil** (Dashboard)
- Vue d'ensemble stock
- Alertes stock bas
- Résumé équipements
- Statistiques générales

### 2. **Articles** (Gestion catalogue)
- Liste articles avec filtres
- Recherche par code/description/fournisseur
- Ajout/modification/suppression articles
- Affectation articles → équipements
- Gestion stock minimum

### 3. **Stock** (Mouvements stock)
- Entrées stock (achats)
- Sorties stock (consommations)
- Transferts entre dépôts
- Historique mouvements
- Scan QR code pour inventaire
- **4 dépôts :** Atelier, Porteur 26 T, Porteur 32 T, Semi Remorque

### 4. **Inventaire** (Vérification stock)
- Scan QR code articles
- Comptage physique
- Ajustements stock
- Rapports écarts

### 5. **Alertes** (Stock bas)
- Articles sous seuil minimum
- Alertes par dépôt
- Filtres par fournisseur
- Actions rapides (transfert, commande)

### 6. **Equipements** (Gestion flotte)
- Liste véhicules/machines
- Fiche détaillée par équipement
- Ajout/modification équipements
- Gestion accessoires (carrosseries, brosses...)
- Valeurs comptables
- Contrats location/assurance

### 7. **FicheMateriel** (Vue détaillée équipement)
- Infos complètes équipement
- Historique interventions
- Articles affectés
- Accessoires
- Coûts cumulés

### 8. **Interventions** (Maintenance)
- Planification interventions
- Saisie travaux effectués
- Consommation articles
- Mise à jour km/heures
- Coûts main d'œuvre + pièces

### 9. **Maintenance** (Suivi maintenance)
- Historique complet interventions
- Recherche par équipement
- Statistiques coûts
- Export données

### 10. **FacturesDocuments** (Factures fournisseurs)
- Gestion factures achats
- Rapprochement factures ↔ mouvements stock
- Pièces jointes PDF
- Suivi paiements

### 11. **Statistiques** (BI)
- Consommation articles par période
- Coûts par équipement
- Analyse fournisseurs
- Graphiques Excel-like

### 12. **Facturesex** (Export factures - à clarifier)

---

## 🔑 FONCTIONNALITÉS CLÉS

### **Opérateurs terrain**
```javascript
['Axel', 'Jérôme', 'Sébastien', 'Joffrey', 'Fabien', 'Angelo']
```
- Sélection opérateur actif (localStorage)
- Traçabilité actions

### **Dépôts stock**
```javascript
['Atelier', 'Porteur 26 T', 'Porteur 32 T', 'Semi Remorque']
```
- Stock multi-dépôts
- Transferts inter-dépôts

### **Scan QR Code**
- Inventaire rapide
- Identification articles
- Vidéo + Canvas pour scan

### **Synchronisation Firebase**
- Écoute temps réel (onValue)
- Mise à jour manuelle (updateArticles, updateEquipements...)

---

## 🎯 PLAN DE MIGRATION - PHASE 2

### **ÉTAPE 1 : Analyse & Préparation (TERMINÉ)**
✅ Structure app existante analysée  
✅ Collections Firebase identifiées  
✅ Fonctionnalités cartographiées  

### **ÉTAPE 2 : Structure Next.js (1-2 jours)**
- Créer `/app/admin/stock-flotte/` dans site principal
- Créer navigation intégrée
- Créer layout stock-flotte

```
/app/admin/stock-flotte/
├── page.tsx              # Dashboard/Accueil
├── articles/
│   ├── page.tsx          # Liste articles
│   ├── nouveau/page.tsx  # Ajouter article
│   └── [id]/page.tsx     # Détail article
├── stock/
│   ├── page.tsx          # Mouvements
│   ├── entree/page.tsx   # Entrée stock
│   ├── sortie/page.tsx   # Sortie stock
│   └── transfert/page.tsx # Transfert
├── inventaire/page.tsx   # Inventaire QR
├── alertes/page.tsx      # Alertes stock bas
├── equipements/
│   ├── page.tsx          # Liste équipements
│   ├── nouveau/page.tsx  # Ajouter équipement
│   └── [id]/
│       ├── page.tsx      # Fiche équipement
│       └── interventions/
│           ├── page.tsx  # Liste interventions
│           └── nouvelle/page.tsx
├── maintenance/page.tsx  # Historique maintenance
├── factures/
│   ├── page.tsx          # Liste factures fournisseurs
│   └── nouveau/page.tsx
└── statistiques/page.tsx # Statistiques/BI
```

**Estimation pages :** ~25 pages

### **ÉTAPE 3 : Migration Firebase (2-3 jours)**

#### A. Créer fichiers lib/firebase/

**lib/firebase/stock-articles.ts**
```typescript
export interface Article {
  id: string
  code: string
  description: string
  fournisseur: string
  prixUnitaire: number
  stockParDepot: {
    [depot: string]: number
  }
  stockMin: number
  equipementsAffectes: string[]
  actif: boolean
  createdAt: string
  updatedAt: string
}

// CRUD complet
export async function getAllArticles(): Promise<Article[]>
export async function getArticleById(id: string): Promise<Article | null>
export async function createArticle(data: ArticleInput): Promise<string>
export async function updateArticle(id: string, data: Partial<ArticleInput>): Promise<void>
export async function deleteArticle(id: string): Promise<void>
```

**lib/firebase/stock-mouvements.ts**
```typescript
export interface MouvementStock {
  id: string
  articleId: string
  articleCode: string
  articleDescription: string
  type: 'entree' | 'sortie' | 'transfert'
  quantite: number
  date: string
  raison: string
  coutTotal: number
  depot: string
  depotDestination?: string // Si transfert
  operateur: string
  factureFournisseurId?: string // Si achat
  interventionId?: string // Si consommation
  createdAt: string
}

// CRUD + fonctions métier
export async function createMouvementEntree(...)
export async function createMouvementSortie(...)
export async function createMouvementTransfert(...)
export async function getMouvementsByArticle(articleId: string)
export async function getMouvementsByPeriode(debut: string, fin: string)
```

**lib/firebase/stock-equipements.ts**
```typescript
export interface Equipement {
  id: string
  immat: string
  type: string
  marque: string
  modele: string
  annee: number
  km: number
  heures: number
  carburant: string
  vin: string
  ptac: number
  poids: number
  proprietaire: string
  valeurAchat: number
  valeurActuelle: number
  typeFinancement: 'Achat' | 'Location' | 'LOA' | 'LLD'
  coutMensuel: number
  dateDebut: string
  dateFin?: string
  assurance: number
  dateContracteTechnique: string
  notes: string
  actif: boolean
  createdAt: string
  updatedAt: string
}

// CRUD + fonctions métier
export async function getAllEquipements(): Promise<Equipement[]>
export async function getEquipementByImmat(immat: string)
export async function updateKmHeures(id: string, km: number, heures: number)
export async function calculerCoutTotal(id: string): Promise<number>
```

**lib/firebase/stock-accessoires.ts**
```typescript
export interface AccessoireEquipement {
  id: string
  equipementId: string
  nom: string
  valeur: number
  dateAjout: string
  description: string
  actif: boolean
  createdAt: string
  updatedAt: string
}

// CRUD
export async function getAccessoiresByEquipement(equipementId: string)
export async function addAccessoire(data: AccessoireInput): Promise<string>
export async function updateAccessoire(id: string, data: Partial<AccessoireInput>)
export async function deleteAccessoire(id: string)
```

**lib/firebase/stock-interventions.ts**
```typescript
export interface Intervention {
  id: string
  equipementId: string
  equipementImmat: string
  type: 'Entretien' | 'Réparation' | 'Diagnostic' | 'Autre'
  date: string
  km: number
  heures: number
  description: string
  travauxEffectues: string
  articlesUtilises: {
    articleId: string
    code: string
    description: string
    quantite: number
    prixUnitaire: number
    coutTotal: number
  }[]
  depotPrelevement: string
  coutPieces: number
  coutMainOeuvre?: number
  coutTotal: number
  operateur: string
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'annulee'
  createdAt: string
  updatedAt: string
}

// CRUD + fonctions métier
export async function createIntervention(data: InterventionInput): Promise<string>
export async function getInterventionsByEquipement(equipementId: string)
export async function terminerIntervention(id: string): Promise<void>
// Lors de la création/fin d'intervention → créer mouvements stock automatiques
```

**lib/firebase/stock-factures-fournisseurs.ts**
```typescript
export interface FactureFournisseur {
  id: string
  numero: string
  fournisseur: string
  date: string
  dateEcheance: string
  lignes: {
    articleId: string
    code: string
    description: string
    quantite: number
    prixUnitaire: number
    totalHT: number
    totalTVA: number
    totalTTC: number
  }[]
  totalHT: number
  totalTVA: number
  totalTTC: number
  statut: 'en_attente' | 'payee'
  datePaiement?: string
  documentURL?: string // PDF facture
  mouvementsStockIds: string[] // Mouvements créés
  notes?: string
  createdAt: string
  updatedAt: string
}

// CRUD + lien avec mouvements stock
```

#### B. Migration données Realtime DB → Firestore

**Script de migration :**
```javascript
// scripts/migrate-stock-flotte.js
// 1. Connexion aux 2 projets Firebase
// 2. Lecture Realtime DB (gestion-flotte-et-stoks)
// 3. Transformation données
// 4. Écriture Firestore (solaire-dataroom)
```

**Collections Firestore finales :**
```
articles_stock
mouvements_stock
equipements
accessoires_equipement
interventions_equipement
factures_fournisseurs_stock
```

### **ÉTAPE 4 : Composants réutilisables (1 jour)**

**components/stock-flotte/**
```
├── ArticleCard.tsx
├── EquipementCard.tsx
├── MouvementStockForm.tsx
├── InterventionForm.tsx
├── StockBadge.tsx (alerte si < min)
├── QRScanner.tsx (scan QR code)
└── StatsWidget.tsx
```

### **ÉTAPE 5 : Pages principales (3-4 jours)**

**Par ordre de priorité :**

1. **Dashboard** (page.tsx)
   - Vue d'ensemble
   - Alertes stock
   - Résumé équipements

2. **Articles** (articles/)
   - Liste + filtres
   - Formulaire création/modification
   - Gestion stock par dépôt

3. **Mouvements Stock** (stock/)
   - Entrées (achats)
   - Sorties (consommations)
   - Transferts inter-dépôts

4. **Équipements** (equipements/)
   - Liste flotte
   - Fiche détaillée
   - Accessoires

5. **Interventions** (equipements/[id]/interventions/)
   - Planification
   - Saisie travaux
   - Consommation articles auto

6. **Alertes** (alertes/)
   - Stock < minimum
   - Actions rapides

7. **Statistiques** (statistiques/)
   - Graphiques consommation
   - Coûts par équipement

### **ÉTAPE 6 : Tests & Ajustements (1-2 jours)**

- Tests CRUD toutes collections
- Tests mouvements stock
- Tests interventions → mouvements auto
- Tests QR code (si maintenu)
- Validation données migrées

---

## 🔗 LIENS AVEC AUTRES MODULES

### **Lien avec FINANCES (Phase 3)**

**Facture Fournisseur → Entrée Stock automatique**
```
Création facture fournisseur
  → Lecture lignes facture
  → Pour chaque ligne avec article stock
  → Créer mouvement entrée automatique
  → Mise à jour stock
```

**Intervention → Sortie Stock automatique**
```
Fin intervention équipement
  → Articles utilisés saisis
  → Créer mouvements sortie automatiques
  → Mise à jour stock
  → Calcul coût intervention réel
```

**Note de Frais → Véhicule**
```
Note frais avec immatriculation
  → Lien automatique avec équipement
  → Suivi coûts réels par véhicule
```

### **Lien avec INTERVENTIONS PRAXEDO (Phase 3)**

**Rapport Praxedo reçu**
```
Intervention site photovoltaïque terminée
  → Si utilisation matériel spécifique
  → Consommation articles enregistrée
  → Mise à jour stock automatique
```

---

## ⚠️ POINTS D'ATTENTION

### **1. Gestion multi-dépôts**
- Maintenir la structure stockParDepot
- Transferts inter-dépôts tracés
- Alertes par dépôt

### **2. QR Code**
- Fonctionnalité scan vidéo à adapter (Next.js server vs client)
- Utiliser composant client avec 'use client'
- Librairie : jsQR ou react-qr-reader

### **3. Opérateurs**
- Liste fixe à migrer en collection ?
- Ou garder en dur dans le code ?

### **4. Temps réel**
- Realtime DB = temps réel natif
- Firestore = onSnapshot pour temps réel
- Adapter les listeners

### **5. Performance**
- ~80 articles actuellement
- ~6 équipements
- Optimiser requêtes si croissance

### **6. Accessoires structurels vs opérationnels**
- Carrosseries (actif: false) = partie intégrante
- Brosses (actif: true) = équipement amovible
- Maintenir cette distinction

---

## 📈 ESTIMATION PHASE 2

**Durée totale :** 2-3 semaines

**Répartition :**
```
Analyse (déjà fait)           : ✅ 0.5 jour
Structure Next.js             : 1-2 jours
Migration Firebase            : 2-3 jours
Composants                    : 1 jour
Pages principales             : 3-4 jours
Tests & ajustements           : 1-2 jours
-----------------------------------
TOTAL                         : 8.5-12.5 jours
```

**Si on travaille en sessions Claude :**
- Session 1 (actuelle) : Analyse ✅
- Session 2 : Structure + Firebase (4-5 jours)
- Session 3 : Pages (3-4 jours)
- Session 4 : Tests + finalisation (1-2 jours)

---

## 🎯 LIVRABLE FIN PHASE 2

**Module Stock & Flotte 100% intégré au site Next.js principal**

✅ 25 pages créées  
✅ 6 collections Firestore migrées  
✅ Toutes fonctionnalités conservées  
✅ Interface modernisée (Tailwind CSS)  
✅ Base de données unifiée (Firestore)  
✅ Prêt pour Phase 3 (liens avec Finances)  

---

## 📝 PROCHAINES ÉTAPES IMMÉDIATES

**POUR LA SESSION 2 :**

1. Créer structure `/app/admin/stock-flotte/`
2. Créer les 6 fichiers lib/firebase/stock-*
3. Créer le script de migration
4. Migrer les données test

**POUR TOI (JEROME) :**

1. Valider ce plan
2. Confirmer que toutes les fonctionnalités sont couvertes
3. Prioriser si besoin (quoi faire en premier)
4. Backup Realtime DB avant migration

---

**FIN ANALYSE PHASE 2**

**Date :** 30 Décembre 2024  
**Status :** PLAN VALIDÉ - PRÊT POUR DÉVELOPPEMENT  
**Prochaine session :** Démarrage développement Phase 2
