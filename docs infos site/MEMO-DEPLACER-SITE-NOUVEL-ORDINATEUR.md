# 💻 MÉMO : DÉPLACER LE SITE SUR UN NOUVEL ORDINATEUR

**Date :** 17 décembre 2025  
**Site :** Solaire Nettoyage  
**Par :** Jérôme Gely

---

## 📦 PRÉPARATION SUR L'ANCIEN MAC

### **ÉTAPE 1 : Vérifier que .env.local existe**

**Dans le Terminal, tape :**
```bash
cd ~/solaire-nettoyage-site
ls -la | grep .env
```

**Tu dois voir :**
```
.env.local
```

✅ Si tu le vois → Continue  
❌ Si tu ne le vois pas → STOP ! Il faut le trouver d'abord !

---

### **ÉTAPE 2 : Créer un dossier pour la copie**

```bash
# Créer un dossier sur le Bureau
mkdir ~/Desktop/solaire-nettoyage-COPIE

# Copier tout le projet SAUF node_modules et .next
cd ~/solaire-nettoyage-site
rsync -av --exclude 'node_modules' --exclude '.next' --exclude '.git' . ~/Desktop/solaire-nettoyage-COPIE/
```

---

### **ÉTAPE 3 : Vérifier que .env.local est copié**

```bash
# Vérifier le contenu
ls -la ~/Desktop/solaire-nettoyage-COPIE/ | grep .env

# Afficher le contenu (pour vérifier les clés)
cat ~/Desktop/solaire-nettoyage-COPIE/.env.local
```

**Tu dois voir tes clés Firebase et Resend.**

---

### **ÉTAPE 4 : Créer une archive complète**

```bash
# Créer une archive ZIP avec TOUS les fichiers cachés
cd ~/Desktop
tar -czf solaire-nettoyage-COMPLET.tar.gz solaire-nettoyage-COPIE/

# Vérifier la taille (doit faire environ 5-10 Mo)
ls -lh solaire-nettoyage-COMPLET.tar.gz
```

✅ **Archive créée : `~/Desktop/solaire-nettoyage-COMPLET.tar.gz`**

---

### **ÉTAPE 5 : Transférer sur clé USB**

```bash
# Copier sur clé USB (remplace "USB" par le nom de ta clé)
cp ~/Desktop/solaire-nettoyage-COMPLET.tar.gz /Volumes/NOMDECLÉ/
```

**Ou envoie-toi l'archive par email / Dropbox / Google Drive.**

---

## 💻 INSTALLATION SUR LE NOUVEL ORDINATEUR

### **PRÉREQUIS : Installer Node.js**

1. Va sur **https://nodejs.org**
2. Télécharge la version **LTS (Long Term Support)**
3. Installe-la (suivre l'assistant)
4. Vérifie dans le Terminal :
   ```bash
   node -v
   npm -v
   ```

---

### **ÉTAPE 1 : Extraire l'archive**

**Dans le Terminal du nouvel ordinateur :**

```bash
# Si c'est depuis une clé USB
cd /Volumes/NOMDECLÉ
cp solaire-nettoyage-COMPLET.tar.gz ~/Downloads/

# Extraire dans ton dossier utilisateur
cd ~
tar -xzf ~/Downloads/solaire-nettoyage-COMPLET.tar.gz

# Renommer le dossier
mv solaire-nettoyage-COPIE solaire-nettoyage-site
```

---

### **ÉTAPE 2 : Vérifier que .env.local est là**

```bash
cd ~/solaire-nettoyage-site
ls -la | grep .env
cat .env.local
```

**Tu dois voir tes clés API !**

---

### **ÉTAPE 3 : Installer les dépendances**

```bash
cd ~/solaire-nettoyage-site
npm install
```

⏱️ **Ça prend 2-3 minutes.**

---

### **ÉTAPE 4 : Tester en local**

```bash
npm run dev
```

**Ouvre ton navigateur sur :** http://localhost:3000

✅ **Si le site s'affiche → PARFAIT !**

---

### **ÉTAPE 5 : Builder pour tester**

```bash
# Arrête le serveur dev (Ctrl+C)
npm run build
```

✅ **Si le build réussit → Tout est bon !**

---

## 🔐 FICHIER .env.local - COMMANDES UTILES

### **Voir le contenu :**
```bash
cat ~/solaire-nettoyage-site/.env.local
```

### **Copier .env.local manuellement (si besoin) :**
```bash
# Depuis l'ancien Mac
cat ~/solaire-nettoyage-site/.env.local

# Copie le contenu affiché
```

**Sur le nouvel Mac :**
```bash
cd ~/solaire-nettoyage-site
nano .env.local
```

**Colle le contenu, puis :**
- Ctrl+O (enregistrer)
- Entrée
- Ctrl+X (quitter)

---

## 📋 CHECKLIST COMPLÈTE

### **Sur l'ancien Mac :**
- [ ] Vérifier `.env.local` existe : `ls -la | grep .env`
- [ ] Créer l'archive : `tar -czf solaire-nettoyage-COMPLET.tar.gz`
- [ ] Copier sur clé USB ou cloud

### **Sur le nouvel Mac :**
- [ ] Installer Node.js (version LTS)
- [ ] Extraire l'archive : `tar -xzf`
- [ ] Vérifier `.env.local` est là : `ls -la | grep .env`
- [ ] Installer dépendances : `npm install`
- [ ] Tester en dev : `npm run dev`
- [ ] Tester le build : `npm run build`

---

## ⚠️ FICHIERS À NE JAMAIS PERDRE

### **CRITIQUES :**
1. **`.env.local`** ← Clés API (Firebase, Resend)
2. **`app/`** ← Tout ton code
3. **`lib/`** ← Tes fonctions
4. **`public/`** ← Images, logos

### **Régénérables (pas grave si perdus) :**
- `node_modules/` ← Régénéré avec `npm install`
- `.next/` ← Régénéré avec `npm run build`

---

## 🌐 LE VPS NE CHANGE PAS

**Important :**
- Le VPS IONOS reste identique
- Le site en production ne change pas
- Tu peux travailler depuis n'importe quel Mac
- Les mises à jour se font pareil (build + upload)

---

## 🆘 EN CAS DE PROBLÈME

### **`.env.local` introuvable ?**

**Cherche partout :**
```bash
cd ~/solaire-nettoyage-site
find . -name ".env*" -type f
```

**Si vraiment perdu, tu peux le recréer :**
1. Récupère-le depuis le VPS :
   - SSH → `/var/www/vhosts/solairenettoyage.com/httpdocs/app/.env.local`
2. Ou récupère les clés depuis Firebase Console et Resend

---

### **Erreurs après `npm install` ?**

```bash
# Supprimer node_modules et recommencer
rm -rf node_modules package-lock.json
npm install
```

---

### **Le build échoue ?**

```bash
# Voir les erreurs détaillées
npm run build

# Vérifier que .env.local est là
cat .env.local
```

---

## 📝 NOTES IMPORTANTES

### **Différence Mac Intel vs Mac Silicon (M1/M2/M3) :**
- Pas de problème ! Node.js fonctionne sur les deux
- Juste `npm install` va compiler les bonnes versions

### **Si tu utilises Git/GitHub :**
- ⚠️ **NE METS JAMAIS `.env.local` sur GitHub !**
- Ajoute `.env.local` dans `.gitignore`
- Copie `.env.local` manuellement entre les ordinateurs

### **Backup de sécurité :**
- Garde une copie de `.env.local` dans un endroit sûr
- Password manager (1Password, Bitwarden, etc.)
- Ou fichier texte crypté sur clé USB

---

## ✅ RÉSUMÉ EN 3 ÉTAPES

### **1. Sur l'ancien Mac :**
```bash
cd ~/solaire-nettoyage-site
tar -czf ~/Desktop/solaire-nettoyage-COMPLET.tar.gz \
  --exclude='node_modules' --exclude='.next' .
```

### **2. Transférer l'archive**
Clé USB, Dropbox, email, etc.

### **3. Sur le nouvel Mac :**
```bash
cd ~
tar -xzf ~/Downloads/solaire-nettoyage-COMPLET.tar.gz
cd solaire-nettoyage-COPIE
npm install
npm run dev
```

---

**🎉 C'EST TOUT ! TON SITE EST PORTABLE !**

**Date de création :** 17 décembre 2025  
**Version :** 1.0
