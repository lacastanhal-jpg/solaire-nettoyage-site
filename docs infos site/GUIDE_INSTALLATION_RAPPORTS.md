# 📄 SYSTÈME DE RAPPORTS D'INTERVENTION - GUIDE D'INSTALLATION

## 📦 FICHIERS À INSTALLER

### 1. PAGE DÉTAIL INTERVENTION
**Fichier:** `page-detail-intervention.tsx`  
**Destination:** `app/admin/interventions/[id]/page.tsx`

**Ce fichier contient:**
- Page complète de détail d'intervention
- Formulaire d'upload PDF
- Affichage du rapport parsé
- Changement automatique de statut en "Terminée"

### 2. API PARSE PDF
**Fichier:** `route-parse-pdf.ts`  
**Destination:** `app/api/rapports/parse-pdf/route.ts`

**Ce fichier contient:**
- Parsing automatique des PDF Praxedo
- Extraction des données (numéro, date, technicien, matériel, etc.)
- Retour JSON avec données structurées

---

## 📋 DÉPENDANCES À INSTALLER

Installe la librairie pour parser les PDF :

```bash
npm install pdf-parse
```

---

## 🔥 CONFIGURATION FIREBASE STORAGE

Le système stocke les PDF dans Firebase Storage. Assure-toi que Firebase Storage est activé :

### 1. Active Storage dans Firebase Console
- Va sur https://console.firebase.google.com
- Sélectionne ton projet `solaire-dataroom`
- Menu "Storage" → "Get Started"
- Accepte les règles par défaut

### 2. Règles de sécurité Storage (optionnel)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /rapports/{interventionId}/{fileName} {
      // Seuls les admins peuvent uploader
      allow write: if request.auth != null;
      // Tout le monde peut lire (pour affichage)
      allow read: if true;
    }
  }
}
```

---

## 📁 STRUCTURE DES DONNÉES FIRESTORE

### Collection: `interventions_calendar`

**Champ ajouté:** `rapport` (objet optionnel)

```typescript
{
  id: string,
  siteId: string,
  siteName: string,
  clientId: string,
  clientName: string,
  dateDebut: string,
  dateFin: string,
  statut: string, // Passe à "Terminée" après upload rapport
  
  // NOUVEAU CHAMP
  rapport?: {
    numeroIntervention: string,      // "GX0000003079"
    dateIntervention: string,         // "26/11/2025"
    technicien: string,               // "Gely Axel"
    typeIntervention: string,         // "Hangar"
    materiel: string[],               // ["Robot (1)", ...]
    eauUtilisee: string[],            // ["Osmosée"]
    niveauEncrassement: string,       // "Fort"
    typeEncrassement: string[],       // ["Fientes d'oiseaux", ...]
    detailsEncrassement: string,      // "Poussière chemin et pailleuse"
    pdfUrl: string,                   // URL Firebase Storage
    uploadedAt: string                // Date upload ISO
  }
}
```

---

## 🚀 UTILISATION

### 1. ACCÈS À LA PAGE DÉTAIL

**Depuis le calendrier:**
- Clique sur une intervention
- Clique sur "✏️ Modifier" 
- OU ajoute un bouton "👁️ Voir détail" qui pointe vers `/admin/interventions/{id}`

### 2. UPLOAD D'UN RAPPORT

1. Ouvre la page détail d'une intervention
2. Section "📤 Upload rapport PDF"
3. Clique "Choisir fichier PDF"
4. Sélectionne le PDF Praxedo
5. Clique "✅ Envoyer"

**Le système va:**
- ✅ Uploader le PDF vers Firebase Storage
- ✅ Parser automatiquement le PDF
- ✅ Extraire toutes les données
- ✅ Sauvegarder dans Firestore
- ✅ Changer le statut en "Terminée"

### 3. CONSULTATION DU RAPPORT

Une fois uploadé :
- Les données s'affichent dans la page détail
- Bouton "Voir le PDF complet" pour ouvrir le PDF
- Toutes les infos extraites visibles

---

## 📊 DONNÉES EXTRAITES DU PDF PRAXEDO

Le système extrait automatiquement :

✅ **N° Intervention** : GX0000003079  
✅ **Date intervention** : 26/11/2025  
✅ **Technicien** : Gely Axel  
✅ **Type intervention** : Hangar / Toiture / Ombrière / etc.  
✅ **Matériel utilisé** : Robot, Brosse rotative, etc.  
✅ **Nombre de robots** : 1  
✅ **Eau utilisée** : Osmosée, Déionisée, etc.  
✅ **Niveau d'encrassement** : Fort / Moyen / Faible  
✅ **Type d'encrassement** : Pollen, Sable, Fientes, etc.  
✅ **Détails encrassement** : Texte libre  

---

## 🔗 MODIFICATION DU CALENDRIER (OPTIONNEL)

Pour ajouter un bouton "Voir détail" dans chaque carte d'intervention du calendrier :

**Dans:** `app/admin/calendrier/page.tsx`

**Ajoute ce bouton à côté de "✏️ Modifier"** :

```tsx
<a
  href={`/admin/interventions/${inter.id}`}
  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold transition-colors"
>
  👁️ Détail
</a>
```

---

## ❓ DÉPANNAGE

### Erreur "pdf-parse module not found"
```bash
npm install pdf-parse
```

### Erreur "Firebase Storage not initialized"
Active Firebase Storage dans la console Firebase

### PDF non parsé correctement
Vérifie que le format du PDF Praxedo est le même que l'exemple fourni

### Upload échoue
Vérifie les règles de sécurité Firebase Storage

---

## 🎯 PROCHAINES ÉTAPES (PHASE 2 - OPTIONNEL)

Une fois que l'upload manuel fonctionne bien, on peut ajouter :

### AUTOMATISATION IMAP
- Connexion automatique à la boîte mail IONOS
- Détection des emails Praxedo
- Upload automatique des rapports
- Association intelligente aux interventions

**Nécessite :**
- Identifiants IMAP IONOS
- Cron job (toutes les 5-10 minutes)
- Module Node.js `imap`

---

## 📝 RÉSUMÉ

✅ **Phase 1 (MAINTENANT)** : Upload manuel + parsing automatique  
🔄 **Phase 2 (PLUS TARD)** : Synchronisation automatique email IONOS

**Avantages Phase 1:**
- Simple, rapide
- Pas de configuration email
- Contrôle total
- Fonctionne immédiatement

**Temps estimé d'installation:** 15 minutes
