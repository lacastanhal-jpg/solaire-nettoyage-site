# 🚀 GESTION PROJETS GELY - VERSION 2 (MOCKÉE)

## 📦 CONTENU

**4 fichiers TypeScript prêts à tester en local :**

1. **types.ts** - Types TypeScript (Projet, LigneFinanciere, etc.)
2. **mockData.ts** - Données de test (3 projets + factures)
3. **PageProjets.tsx** - Liste des projets avec KPIs
4. **ProjetDetail.tsx** - Vue détaillée + tableau financier ÉDITABLE

---

## ✅ CE QUI FONCTIONNE

### **Page Liste Projets**
- ✅ Voir tous les projets du groupe
- ✅ Filtrer par société
- ✅ KPIs globaux (budget, dépensé, reste)
- ✅ Barre de progression par projet
- ✅ Alertes factures en attente
- ✅ Bouton "Nouveau Projet" (modal vide pour l'instant)

### **Page Détail Projet**
- ✅ KPIs détaillés (budget, payé, à payer, reste, %)
- ✅ **TABLEAU FINANCIER ÉDITABLE**
  - Double-clic sur ligne → édition
  - Modifier : type, fournisseur, montant, statut, date
  - Sauvegarder/Annuler
  - Ajouter ligne
  - Supprimer ligne
- ✅ **CALCULS AUTOMATIQUES**
  - Totaux HT/TTC
  - Total payé
  - Total à payer
  - Reste budget
  - % réalisation

---

## 🧪 INSTALLATION ET TEST

### **1. Extraire**
```bash
cd ~/Downloads
tar -xzf gely-projets-v2.tar.gz
```

### **2. Intégrer dans ton projet**

**Option A - Test isolé (recommandé)** :
```bash
# Copier dans un dossier temporaire
mkdir ~/solaire-nettoyage-site/test-projets
cp -r gely-v2/* ~/solaire-nettoyage-site/test-projets/
```

**Option B - Intégration directe** :
```bash
# Copier dans components/gely
cp gely-v2/*.ts ~/solaire-nettoyage-site/lib/gely/
cp gely-v2/*.tsx ~/solaire-nettoyage-site/components/gely/
```

### **3. Ajouter à la navigation**

Dans `app/admin/gely/page.tsx`, ajoute :
```typescript
import PageProjets from '@/components/gely/PageProjets'
import ProjetDetail from '@/components/gely/ProjetDetail'

// Dans la navigation :
{ id: 'projets', label: 'Projets', icon: FolderKanban }

// Dans le renderPage() :
case 'projets':
  return selectedProjet 
    ? <ProjetDetail projetId={selectedProjet} onBack={() => setSelectedProjet(null)} />
    : <PageProjets onSelectProjet={setSelectedProjet} />
```

---

## 🎮 COMMENT TESTER

### **1. Lance le site**
```bash
cd ~/solaire-nettoyage-site
npm run dev
```

### **2. Va sur la page**
`http://localhost:3000/admin/gely` → Onglet "Projets"

### **3. Teste les fonctionnalités**

**Liste :**
- Filtre par société
- Clique sur 👁️ pour voir détails

**Détail :**
- Clique sur ✏️ pour éditer une ligne
- Change un montant → vois les totaux se recalculer
- Clique sur ➕ pour ajouter une ligne
- Clique sur 🗑️ pour supprimer

---

## 📝 DONNÉES DE TEST

**3 projets mockés :**

1. **Projet 500 kWc (LEXA 2)**
   - Budget: 346 600 €
   - 3 factures (MECOJIT, ENEDIS)
   - Statut: En cours

2. **Projet 100 kWc (LEXA 2)**
   - Budget: 100 000 €
   - Aucune facture
   - Statut: Développement

3. **Bâtiment Vaureilles (SCI GELY)**
   - Budget: 336 011 €
   - 3 lignes (Architecture, Fondations, Devis structure)
   - Statut: En cours

---

## ✅ CE QU'IL FAUT VALIDER

1. **Design** - Les couleurs, la présentation, c'est bon ?
2. **Tableau éditable** - Ça marche comme tu veux ?
3. **Calculs** - Les totaux sont corrects ?
4. **Workflow** - Ajouter/Modifier/Supprimer c'est fluide ?

**DIS-MOI CE QUI MANQUE OU CE QUI VA PAS !**

---

## 🔜 APRÈS VALIDATION

Une fois que tu valides le design et le fonctionnement :

1. Je crée le formulaire "Nouveau Projet"
2. Je branche Firebase
3. J'ajoute le simulateur
4. J'ajoute la gestion documents par projet
5. J'ajoute les photos timeline

**TESTE ET DIS-MOI ! 💪**
