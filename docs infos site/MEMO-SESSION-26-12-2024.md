# 📋 MÉMO SESSION - 26 DÉCEMBRE 2024

## 🎯 OBJECTIF PRINCIPAL
Ajout système de demande de changement/annulation d'interventions côté client avec gestion admin.

---

## ✅ FONCTIONNALITÉS DÉVELOPPÉES

### 1. **PAGE CLIENT - DEMANDE CHANGEMENT/ANNULATION**
**Fichier :** `app/client/interventions/[id]/modifier/page.tsx`

**Fonctionnalités :**
- ✅ Choix type demande : Changement de date OU Annulation
- ✅ Calendrier adaptatif :
  - 7 colonnes si ≤31 jours
  - 10 colonnes si >31 jours
  - Cases compactes (56px x 56px)
  - Clic pour marquer indisponibilités (jour entier, AM, PM)
- ✅ Header dynamique avec emoji selon type demande
- ✅ Validation : alerte si changement sans indisponibilités
- ✅ Textarea adaptatif selon type demande
- ✅ Bouton submit adaptatif (rouge annulation / orange changement)

**Interface TypeScript :**
```typescript
type TypeDemande = 'changement' | 'annulation'

interface demandeChangement {
  raison: string
  indisponibilites?: Indisponibilite[]
  typeDemande?: TypeDemande
  dateEnvoi?: number
}
```

---

### 2. **PAGE ADMIN - GESTION DEMANDES**
**Fichier :** `app/admin/demandes-modifications/page.tsx`

**Fonctionnalités :**
- ✅ Liste des demandes avec tri par date (plus récentes en premier)
- ✅ Badge type demande (orange changement / rouge annulation)
- ✅ Encadré alerte rouge pour annulations
- ✅ Affichage conditionnel indisponibilités (si changement)
- ✅ Boutons adaptatifs :
  - Vert "Modifier l'intervention" (changement)
  - Rouge "Annuler l'intervention" (annulation)
- ✅ Bouton "Refuser" pour toutes demandes
- ✅ Affichage nom entreprise client

**Actions admin :**
- **Accepter changement :** Redirige vers page modification intervention
- **Accepter annulation :** Change statut → "Annulée" + dateAnnulation
- **Refuser :** Supprime la demande, intervention inchangée

---

### 3. **FIREBASE - MODIFICATIONS**
**Fichier :** `lib/firebase/interventions-calendar.ts`

**Modifications :**
```typescript
// Interface étendue
interface demandeChangement {
  raison: string
  indisponibilites?: Indisponibilite[]
  typeDemande?: 'changement' | 'annulation'  // ✅ AJOUTÉ
  dateEnvoi?: number                         // ✅ AJOUTÉ
}

// Fonction modifiée
export async function demanderChangementDate(
  interventionId: string,
  raison: string,
  indisponibilites: Indisponibilite[],
  typeDemande?: 'changement' | 'annulation'  // ✅ AJOUTÉ
)
```

---

## 🔧 CORRECTIONS TECHNIQUES

### **PROBLÈME 1 : Erreur syntaxe JSX récurrente**
**Fichier :** `app/client/interventions/[id]/modifier/page.tsx`  
**Ligne :** 187-460

**Cause :** Balise `<form>` ouverte DANS bloc conditionnel, fermée EN DEHORS
```typescript
{typeDemande === 'changement' && (
  <form>  // ❌ Ouverte ICI
)}         // ❌ Fermeture bloc conditionnel
</form>   // ❌ Fermée EN DEHORS = ERREUR
```

**Solution :** Déplacer `<form>` AVANT le bloc conditionnel
```typescript
<form>
  {typeDemande === 'changement' && (
    // Calendrier...
  )}
  <textarea />
  <button />
</form>
```

**Fichier corrigé :** `page-CLIENT-CORRIGE.tsx` → `page-CLIENT-PETIT.tsx` (avec calendrier compact)

---

### **PROBLÈME 2 : Type Client.entreprise inexistant**
**Fichier :** `app/admin/demandes-modifications/page.tsx`  
**Ligne :** 60

**Erreur :**
```typescript
const client = clients.find(c => c.id === clientId)
return client?.entreprise  // ❌ 'entreprise' n'existe pas
```

**Solution :** Utiliser `inter.clientName` directement
```typescript
<p>{inter.clientName}</p>  // ✅ clientName existe dans InterventionCalendar
```

**Suppression :**
- Import `getAllClients` et `type Client`
- State `clients`
- Fonction `getClientName`

---

### **PROBLÈME 3 : Propriété rapport inexistante**
**Fichiers concernés :**
- `app/client/dashboard/page.tsx` (lignes 113-114)
- `app/client/interventions/page.tsx` (lignes 127, 129, 362, 416-520)

**Erreur :**
```typescript
inter.rapport?.technicien           // ❌
inter.rapport?.numeroIntervention   // ❌
inter.rapport                        // ❌
```

**Solution :** Remplacer par `inter.rapportUrl`
```typescript
inter.rapportUrl  // ✅ string URL du PDF
```

**Actions :**
- Dashboard : Supprimé recherche `rapport.technicien`
- Liste interventions : Simplifié section rapport (juste bouton télécharger)

---

### **PROBLÈME 4 : Types MapView incompatibles**
**Fichier :** `components/MapView.tsx`

**Erreur :**
```typescript
onMarkerClick?: (site: SiteComplet & { id: string }) => void  // ❌ id obligatoire
selectedSite?: (SiteComplet & { id: string }) | null          // ❌
```

**Solution :** Types simplifiés
```typescript
onMarkerClick?: (site: SiteComplet) => void  // ✅ id optionnel
selectedSite?: SiteComplet | null            // ✅
```

**Ajouts MapView :**
- ✅ Props `onMarkerClick` et `selectedSite`
- ✅ Icône bleue pour marker sélectionné
- ✅ EventHandler `click` sur markers

---

### **PROBLÈME 5 : Fichiers backup cassent compilation**
**Fichiers supprimés :**
- `app/client/interventions/[id]/modifier/page 2.tsx`
- `app/client/interventions/[id]/modifier/zcopiepage2.tsx`
- `app/client/interventions/page 2.tsx`
- `app/admin/demandes-modifications/page 2.tsx`

**Cause :** Next.js compile TOUS les fichiers `.tsx` dans `app/`

**Solution :** Suppression fichiers backup + utilisation Git pour historique

---

## 📦 DÉPLOIEMENT

### **VERCEL**
**Statut :** ✅ Déployé avec succès  
**Commit final :** `4c45f5b`  
**Build :** ✓ Compiled successfully (42 routes)

### **VPS IONOS**
**Chemin :** `/var/www/vhosts/solairenettoyage.com/httpdocs/app-git`  
**Process PM2 :** `solaire-site` (PID 724393)  

**Étapes déploiement :**
```bash
git stash
git pull origin main
npm install              # Installation pdf2json + autres dépendances
npm run build            # ✓ Compiled successfully
pm2 restart solaire-site # ✓ Online
```

**Statut :** ✅ En ligne sur solairenettoyage.com

---

## 📊 STATISTIQUES

**Nombre de commits :** ~15  
**Fichiers modifiés :** 8 principaux
- `app/client/interventions/[id]/modifier/page.tsx`
- `app/admin/demandes-modifications/page.tsx`
- `app/client/dashboard/page.tsx`
- `app/client/interventions/page.tsx`
- `components/MapView.tsx`
- `lib/firebase/interventions-calendar.ts`

**Lignes de code :**
- Ajoutées : ~600 lignes
- Supprimées : ~150 lignes (fichiers backup + code obsolète)

**Temps session :** ~2h30

---

## 🎯 RÉSULTAT FINAL

### **CÔTÉ CLIENT**
✅ Peut demander changement de date avec calendrier interactif  
✅ Peut demander annulation avec formulaire simplifié  
✅ Validation avant envoi  
✅ Statut intervention passe en "Demande modification"

### **CÔTÉ ADMIN**
✅ Voit toutes les demandes en attente  
✅ Distingue visuellement changement vs annulation  
✅ Peut accepter (modifier ou annuler intervention)  
✅ Peut refuser (intervention reste inchangée)

### **TECHNIQUE**
✅ Code TypeScript type-safe  
✅ Interface Firebase bien structurée  
✅ Aucune erreur compilation  
✅ Déployé Vercel + VPS  
✅ Compatible Next.js 14

---

## 📝 FICHIERS GÉNÉRÉS SESSION

1. **page-CLIENT-PETIT.tsx** - Page client avec calendrier compact final
2. **page-ADMIN-DEPUIS-TOI.tsx** - Page admin corrigée
3. **page-DASHBOARD-TYPE-FIX.tsx** - Dashboard avec types corrigés
4. **page-INTERVENTIONS-FINAL.tsx** - Liste interventions corrigée
5. **MapView-FIX-TYPE.tsx** - MapView avec props click
6. **interventions-calendar-NOUVEAU.ts** - Firebase avec typeDemande

---

## 🚀 PROCHAINES ÉTAPES POSSIBLES

### **Améliorations UX**
- [ ] Notifications push admin quand nouvelle demande
- [ ] Email automatique client quand demande acceptée/refusée
- [ ] Historique demandes (acceptées/refusées)

### **Fonctionnalités avancées**
- [ ] Proposer dates alternatives (admin → client)
- [ ] Chat admin ↔ client sur demande
- [ ] Export Excel demandes

### **Optimisations**
- [ ] Cache Firebase pour demandes
- [ ] Pagination liste demandes (si >50)
- [ ] Compression images calendrier

---

## 🔑 POINTS CLÉS À RETENIR

1. **Structure JSX stricte :** Balises ouvertes/fermées doivent respecter portée blocs conditionnels
2. **Types TypeScript :** Utiliser types existants plutôt que recréer (ex: `clientName` au lieu de charger `Client`)
3. **Fichiers backup :** Utiliser Git, pas de fichiers `.tsx` dans `app/`
4. **Firebase :** Toujours étendre interfaces proprement avec types optionnels
5. **Déploiement VPS :** `git stash` avant `git pull` si conflits locaux

---

## 📞 SUPPORT

**Documentation Firebase :**  
`lib/firebase/interventions-calendar.ts` → Fonction `demanderChangementDate()`

**Composants réutilisables :**
- Calendrier indisponibilités : `app/client/interventions/[id]/modifier/page.tsx` (lignes 346-399)
- Badge type demande : `app/admin/demandes-modifications/page.tsx` (lignes 160-166)

**Tests recommandés :**
1. Client crée demande changement avec indisponibilités
2. Client crée demande annulation
3. Admin accepte changement
4. Admin accepte annulation
5. Admin refuse demande

---

**FIN DU MÉMO**

*Générée le 26 décembre 2024*  
*Session: Système changement/annulation interventions*
