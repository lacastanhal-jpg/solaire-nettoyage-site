# 📘 RÉFÉRENCE COMPLÈTE PROJET - Solaire Nettoyage ERP
## Document de Démarrage pour Nouvelle Conversation

**Date création** : 31 Décembre 2025 - 20h30  
**Version** : 1.0 - État Phase 2 à 80%  
**Objectif** : Document unique contenant TOUT le contexte projet

---

## 🎯 CONTEXTE GLOBAL

### **Entreprise**
- **Nom** : SAS Solaire Nettoyage (SIRET 820 504 421)
- **Activité** : Nettoyage de panneaux photovoltaïques
- **Chiffres clés** :
  - 600+ clients (EDF, ENGIE, TotalEnergies, CGN...)
  - 3600 sites/an
  - 3 équipes terrain
  - 4 opérateurs
  
### **Groupe**
```
🏢 GELY INVESTISSEMENT HOLDING
├─ 💼 SAS SOLAIRE NETTOYAGE (opérationnelle)
├─ 🏢 LEXA (investissement)
├─ 🏢 LEXA 2 (investissement)
├─ 🏠 SCI GELY (immobilier)
└─ ⚡ Projets PV (500 kWc + 100 kWc)
```

### **Utilisateurs**
- **Jerome + Axel** : Co-gérants (accès TOTAL identique)
- **4 opérateurs** : Terrain
- **1 comptable** : Externe

### **Chemin projet**
```
/Users/jeromegely/solaire-nettoyage-site
```

---

## 🎯 OBJECTIF DU PROJET

### **Remplacer 3 systèmes externes**

| Actuel | Coût | → Remplacer par | État |
|--------|------|-----------------|------|
| **Everwin** (ERP/Compta) | 500€/mois | Module Finances | 30% |
| **Praxedo** (Terrain) | 300€/mois | Module Opérations | 95% |
| **Expensya** (Notes frais) | 200€/mois | Module Notes Frais | 0% |

**Économie prévue** : ~1000€/mois + gain temps énorme

### **Vision**
UN SEUL système intégré qui gère :
- CRM (clients/sites)
- Finances (devis/factures/trésorerie)
- Stock & Flotte (articles/véhicules/maintenance)
- Opérations (planning/interventions)
- Conformité (CACES/VGP/CT)
- Administration (multi-sociétés)

---

## 📊 ÉTAT ACTUEL DU PROJET

### **Progression globale : 50%**

```
✅ FAIT (50%)
├─ CRM complet (100%)
├─ Opérations/Interventions (95%)
├─ Stock & Flotte base (80%)
├─ Devis/Factures/Avoirs (100%)
├─ Conformité base (70%)
└─ GELY Management (100%)

⏳ EN COURS (20%)
├─ Intégrations modules
├─ Conformité ↔ Équipements
└─ Stock ↔ Finances

❌ À FAIRE (30%)
├─ Trésorerie/Banque
├─ Notes Frais PRO
├─ Fournisseurs/Charges
├─ Comptes courants
├─ TVA/Exports comptables
├─ Dashboards Groupe
└─ Utilisateurs/Rôles
```

---

## 🗂️ VAGUE 1 - PLAN 10 PHASES

**Phase actuelle : PHASE 2 (80%)**

### **Phase 1 : Fondations Multi-Sociétés** ✅ 100%
- Module Sociétés CRUD complet
- Import automatique 5 sociétés
- Sélection société dans Devis/Factures/Avoirs

### **Phase 2 : Stock & Flotte** ⏳ 80%
**✅ Terminé** :
- Articles CRUD + Mouvements stock
- Équipements CRUD + Interventions maintenance
- Factures fournisseurs + Bons commande
- Affectations accessoires véhicules
- Affectations stock embarqué ← NOUVEAU 31/12
- Filtre articles affectés interventions ← NOUVEAU 31/12
- Gestion stock interventions (finalisation/annulation)
- Alertes stock temps réel
- Dashboard basique
- Navigation complète menu ← NOUVEAU 31/12

**❌ Reste à faire** :
- Alertes CT/VGP/Maintenance (à améliorer)
- Dashboard avancé (graphiques)
- Statistiques consommation
- Lien Conformité ↔ Stock-Flotte

### **Phase 3 : Liens Finances ↔ Stock** ❌ 0%
- Facture fournisseur → Entrée stock AUTO
- Intervention → Facturation client AUTO
- Note frais carburant → Véhicule AUTO
- Maintenance → Facture → Paiement → KM AUTO

### **Phase 4 : Trésorerie** ❌ 0%
- Import CSV relevés bancaires
- Rapprochement automatique
- Dashboard trésorerie
- Prévisionnel 90 jours

### **Phase 5 : Notes Frais PRO** ❌ 0%
- Système niveau Expensya
- Photo justificatifs
- Workflow validation 2 niveaux
- TVA HT/TTC
- Lien avec véhicules

### **Phase 6 : Fournisseurs & Charges** ❌ 0%
- Factures fournisseurs finances
- Charges fixes
- Auto-génération charges

### **Phase 7 : Comptes Courants** ❌ 0%
- CC Jerome + Axel
- Flux inter-sociétés

### **Phase 8 : TVA & Compta** ❌ 0%
- Déclarations TVA automatiques
- Export FEC légal
- Export Excel comptable

### **Phase 9 : Dashboards Groupe** ❌ 0%
- Dashboard consolidé patrimoine
- Alertes centralisées TOUT

### **Phase 10 : Utilisateurs** ❌ 0%
- Rôles : Admin/Manager/Salarié/Comptable
- Permissions par module

---

## 🔗 WORKFLOWS INTERCONNECTÉS

### **PRINCIPE FONDAMENTAL**
**Tout est connecté - Pas de double saisie**

### **Workflow 1 : Intervention → Facturation**
```
1. PLANNING créé
   ↓
2. INTERVENTION terrain
   ↓ Rapport Praxedo reçu auto (email)
   ↓ Match auto avec planning
   ↓
3. STOCK mis à jour AUTO ✅ (31/12)
   ↓ Sortie stock automatique
   ↓ Alerte si stock bas
   ↓
4. FACTURATION cliente AUTO ❌ (Phase 3)
   ↓ Ligne facture générée
   ↓ Envoi email client
   ↓
5. RELANCE auto si impayé ❌ (Phase 4)
   ↓
6. TRÉSORERIE mise à jour ❌ (Phase 4)
```

### **Workflow 2 : Achat Stock → Paiement**
```
1. ALERTE stock bas ✅
   ↓ Système propose commande
   ↓
2. BON DE COMMANDE créé ✅
   ↓ Envoi fournisseur
   ↓
3. RÉCEPTION marchandise
   ↓ Entrée stock manuelle ✅
   ↓ (AUTO en Phase 3 ❌)
   ↓
4. FACTURE fournisseur reçue ✅
   ↓ Saisie système
   ↓
5. PAIEMENT ❌ (Phase 4)
   ↓
6. COMPTABILITÉ ❌ (Phase 8)
```

### **Workflow 3 : Maintenance Équipement**
```
1. ALERTE maintenance ⚠️ (existe, à améliorer)
   ↓
2. INTERVENTION créée ✅
   ↓ Articles consommés
   ↓ Stock déduit AUTO ✅
   ↓
3. FACTURE garage ❌ (Phase 3)
   ↓
4. PAIEMENT ❌ (Phase 4)
   ↓
5. KM/HEURES actualisés ❌ (Phase 3)
```

---

## 🗄️ COLLECTIONS FIREBASE

### **Collections existantes (15)**

**CRM** :
- `groupes` - Groupes clients
- `clients` - 600+ clients
- `sites` - 3600 sites

**Finances** :
- `societes` - 5 sociétés groupe
- `devis` - Devis
- `factures` - Factures clients
- `avoirs` - Avoirs

**Stock & Flotte** :
- `articles_stock` - Catalogue + stock par dépôt
- `mouvements_stock` - Historique mouvements
- `equipements` - Véhicules/machines
- `affectations_accessoires` - Accessoires véhicules
- `affectations_articles_embarques` - Stock embarqué ← NOUVEAU 31/12
- `interventions_equipement` - Maintenance
- `factures_fournisseurs` - Factures fournisseurs stock
- `bons_commande_fournisseurs` - Bons commande

**Opérations** :
- `interventions` - Interventions Praxedo
- `rapports_praxedo` - Sync email

**Conformité** :
- (Données hardcodées à migrer)

---

## 📂 STRUCTURE STOCK PAR DÉPÔT

### **4 DÉPÔTS FIXES (zones de stockage)**
```typescript
stockParDepot: {
  'Atelier': number,        // Dépôt principal
  'Porteur 26T': number,    // Camion 26T
  'Porteur 32T': number,    // Camion 32T
  'Semi Remorque': number   // Semi-remorque
}
```

**IMPORTANT** : Ces 4 dépôts sont FIXES
- Ce sont des zones de stockage physique
- PAS des véhicules individuels
- Stock ne sort JAMAIS de ces 4 dépôts

### **Affectations = Tags/Favoris**
```typescript
// Affectation article → équipement
{
  articleId: 'HVB_46',
  equipementId: 'FOURGON_123',
  equipementImmat: 'FOURGON',
  permanent: true,
  dateAffectation: '2025-12-31'
}
```

**Workflow** :
1. Affecter HVB 46 → FOURGON (tag favori)
2. Intervention sur FOURGON
3. ☑️ Checkbox "Articles affectés uniquement"
4. → Filtre intelligent montre HVB 46
5. Consommation → Stock déduit Atelier

---

## 🛠️ STACK TECHNIQUE

**Frontend** :
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form
- shadcn/ui (10 composants)

**Backend** :
- Firebase Firestore
- Firebase Auth
- Nodemailer (emails)

**Déploiement** :
- Vercel (production)
- IONOS VPS + Plesk (backup)
- PM2 (process manager VPS)

**Intégrations** :
- Praxedo (email IMAP sync)
- Excel (imports/exports)

---

## 📍 FICHIERS CLÉS

### **lib/firebase/ (Backend)**
```
config.ts                    - Config Firebase
clients.ts                   - CRUD clients
sites.ts                     - CRUD sites
devis.ts                     - CRUD devis
factures.ts                  - CRUD factures
avoirs.ts                    - CRUD avoirs
societes.ts                  - CRUD sociétés

stock-articles.ts            - CRUD articles + stock
stock-mouvements.ts          - Mouvements stock
stock-interventions.ts       - Finalisation/Stock
interventions-gestion-stock.ts - Annulation/Restauration
stock-affectations.ts        - Affectations embarqué
equipements.ts               - CRUD équipements
factures-fournisseurs.ts     - Factures fournisseurs
bons-commande.ts             - Bons commande
```

### **app/admin/stock-flotte/ (Frontend)**
```
page.tsx                     - Dashboard
alertes/page.tsx             - Alertes (à améliorer)
articles/                    - CRUD articles
mouvements/                  - Mouvements stock
affectations/                - Affectations embarqué
equipements/                 - CRUD équipements
interventions/               - Maintenance
  nouveau/page.tsx           - Avec filtre affectés ✅
  [id]/modifier/page.tsx     - Avec filtre affectés ✅
bons-commande/               - Bons commande
factures-fournisseurs/       - Factures fournisseurs
```

### **Navigation**
```
app/intranet/components/IntranetHeader.tsx
```
**Dernière mise à jour** : 31/12 - Toutes pages accessibles

---

## 🚨 POINTS D'ATTENTION

### **1. Structure Stock**
- ✅ Toujours `stockParDepot` (jamais `stock`)
- ✅ 4 dépôts fixes uniquement
- ✅ Affectations = tags (pas mouvements physiques)

### **2. Nommage Champs**
**Cohérence critique** :
- `depotSource` / `depotDestination` (pas `depotOrigine`)
- `raison` (pas `motif`)
- `interventionId` dans mouvements_stock

### **3. Workflows**
- Intervention finalisée → Stock déduit AUTO ✅
- Intervention modifiée → Annule ancien stock + Crée nouveau ✅
- Intervention supprimée → Restaure stock ✅

### **4. Firebase**
- Éviter `orderBy` + `where` (index requis)
- Préférer tri en mémoire JavaScript

### **5. Multi-Sociétés**
- Chaque document financier a `societeId`
- Filtrage automatique par société

---

## 🎯 PROCHAINES ÉTAPES LOGIQUES

### **Immédiat (Court terme)**

**Option A : Finir Phase 2 (2-3 jours)**
1. Améliorer page Alertes (CT/VGP/Maintenance)
2. Dashboard avancé (graphiques)
3. Statistiques consommation
4. Lien Conformité ↔ Stock-Flotte

**Option B : Commencer Phase 3 (1-2 semaines)**
1. Facture fournisseur → Entrée stock AUTO
2. Intervention → Facturation client AUTO
3. Note frais carburant → Véhicule AUTO
4. Maintenance → Facture → KM AUTO

### **Moyen terme**
- Phase 4 : Trésorerie (2 sem)
- Phase 5 : Notes Frais PRO (2 sem)

### **Long terme**
- Phases 6-10 : Comptabilité complète

---

## 📝 HISTORIQUE RÉCENT (31 DÉC 2025)

### **Session matin (6h-12h)**
- Corrections bugs stock (restauration interventions)
- Clarifications scope projet
- Structure `stockParDepot` uniformisée

### **Session après-midi (12h-18h)**
- Compteurs stock temps réel
- Système affectations stock embarqué
- Confusion dépôts vs équipements résolue

### **Session soir (18h-20h30)**
- Filtre articles affectés interventions
- Corrections bugs export/index Firebase
- Navigation complète (5 pages ajoutées)
- **Phase 2 : 60% → 80%**

---

## 💡 COMMANDES UTILES

### **Lancement**
```bash
cd /Users/jeromegely/solaire-nettoyage-site
npm run dev
```

### **Build test**
```bash
npm run build
```

### **Déploiement Vercel**
```bash
git add .
git commit -m "Description"
git push
```

### **Structure projet**
```bash
# Voir fichiers Stock & Flotte
ls -la app/admin/stock-flotte/

# Voir lib Firebase
ls -la lib/firebase/
```

---

## 🔑 PHRASES CLÉS

### **Principes directeurs**
1. **"Tout est interconnecté"** - Une page seule ne sert à rien
2. **"Workflows automatiques"** - Facture → Stock → Trésorerie AUTO
3. **"Multi-sociétés"** - Chaque entité comptable séparée
4. **"Remplacer Everwin"** - Niveau professionnel attendu
5. **"Jerome + Axel = même niveau"** - Co-gérants égaux

### **Règles techniques**
1. **Ne JAMAIS utiliser `stock`** - Toujours `stockParDepot`
2. **4 dépôts fixes** - Atelier, Porteur 26T, Porteur 32T, Semi
3. **Affectations = Tags** - Pas de mouvements physiques
4. **Cohérence nommage** - depotSource, raison, interventionId

---

## 📧 CONTACT & CONTEXTE

**Propriétaire** : Jerome Gely
**Co-gérant** : Axel
**Entreprise** : SAS Solaire Nettoyage
**SIRET** : 820 504 421

**Communication** :
- Direct et efficace
- Pas de questions inutiles
- Propositions concrètes
- Solutions complètes (pas partielles)

**Attentes** :
- Comprendre le système global
- Proposer la suite logique
- Fichiers complets (pas snippets)
- Tests avant installation

---

## 🎯 POUR DÉMARRER UNE NOUVELLE CONVERSATION

### **Message type**
```
Bonjour Claude,

Je suis Jerome, propriétaire de Solaire Nettoyage.

Je travaille sur un ERP complet Next.js + Firebase pour remplacer 
Everwin, Praxedo et Expensya.

Lis le document REFERENCE-COMPLETE-PROJET.md que je t'envoie.

Puis dis-moi :
1. Tu as compris le contexte ?
2. On est à quelle phase ?
3. Quelle est la prochaine étape logique ?

Allons-y !
```

### **Documents à joindre**
1. ✅ **REFERENCE-COMPLETE-PROJET.md** (ce document)
2. ✅ **SPECIFICATIONS-COMPLETES-30DEC2025.md** (specs détaillées)
3. ✅ **STRUCTURE-COMPLETE-PROJET-30DEC2025.md** (arborescence)
4. ⚠️ **solaire-code-COMPLET.zip** (si besoin code source)

---

## ✅ VALIDATION

**Ce document contient** :
- ✅ Contexte complet projet
- ✅ État actuel précis (80% Phase 2)
- ✅ Structure technique
- ✅ Collections Firebase
- ✅ Workflows interconnectés
- ✅ Points d'attention critiques
- ✅ Prochaines étapes
- ✅ Historique récent
- ✅ Commandes utiles

**Un nouveau Claude avec CE SEUL document peut** :
- ✅ Comprendre le projet
- ✅ Connaître l'état actuel
- ✅ Proposer la suite logique
- ✅ Éviter les erreurs connues
- ✅ Continuer le travail

---

**Date** : 31 Décembre 2025 - 20h30  
**Version** : 1.0  
**Statut** : ✅ Prêt pour nouvelle conversation

**PROJET SOUS CONTRÔLE !** 💪
