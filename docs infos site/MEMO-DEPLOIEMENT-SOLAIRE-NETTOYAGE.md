# MÉMO : PROCÉDURE DE DÉPLOIEMENT SOLAIRE NETTOYAGE

**Date :** 26 décembre 2025  
**Site :** solairenettoyage.com  
**Serveur :** IONOS VPS (217.154.170.227)

---

## 📂 CHEMINS IMPORTANTS

### Sur ton Mac (Local)
```
/Users/jeromegely/solaire-nettoyage-site/
```

### Sur le VPS
```
Dossier Git : /var/www/vhosts/solairenettoyage.com/httpdocs/app-git/
Dossier App : /var/www/vhosts/solairenettoyage.com/httpdocs/app/
```

---

## 🚀 DÉPLOIEMENT COMPLET

### ÉTAPE 1 : LOCAL → VERCEL (via Git)

**Sur ton Mac, dans le Terminal :**

```bash
# 1. Aller dans le dossier du projet
cd /Users/jeromegely/solaire-nettoyage-site

# 2. Ajouter tous les fichiers modifiés
git add .

# 3. Vérifier ce qui va être commité (optionnel)
git status

# 4. Commit avec un message clair
git commit -m "Description des modifications"

# 5. Push vers GitHub (Vercel déploie automatiquement)
git push origin main
```

**Exemple de messages de commit :**
- `"Fix: correction bug m² import interventions"`
- `"Feature: ajout header admin global"`
- `"Update: modification page clients"`

**Résultat :** Vercel détecte le push et déploie automatiquement en 2-3 minutes.

---

### ÉTAPE 2 : VERCEL → VPS

**Dans Plesk, ouvre le Terminal SSH :**

Plesk → Outils & Paramètres → Terminal SSH

**Puis tape ces commandes :**

```bash
# 1. Aller dans le dossier git
cd /var/www/vhosts/solairenettoyage.com/httpdocs/app-git

# 2. Pull les modifications depuis GitHub
git pull origin main

# 3. Rebuild Next.js (2-3 minutes)
npm run build

# 4. Copier le build vers le dossier app
rsync -av --delete .next/ ../app/.next/

# 5. Redémarrer le serveur Node.js
pm2 restart solaire-site

# 6. Vérifier que ça tourne
pm2 status
```

**Résultat attendu après `pm2 status` :**
```
│ solaire-site │ online │
```

---

## 🔧 COMMANDES PM2 UTILES

```bash
# Voir les processus en cours
pm2 list

# Redémarrer l'application
pm2 restart solaire-site

# Voir les logs en temps réel
pm2 logs solaire-site

# Voir le statut
pm2 status
```

---

## 📝 WORKFLOW COMPLET RÉSUMÉ

### LOCAL (Mac)
```bash
cd /Users/jeromegely/solaire-nettoyage-site
git add .
git commit -m "ton message"
git push origin main
```

### VPS (SSH via Plesk)
```bash
cd /var/www/vhosts/solairenettoyage.com/httpdocs/app-git
git pull origin main
npm run build
rsync -av --delete .next/ ../app/.next/
pm2 restart solaire-site
```

---

## ⚠️ ERREURS FRÉQUENTES ET SOLUTIONS

### Erreur : "fatal: not a git repository"
**Solution :** Tu es dans le mauvais dossier
```bash
cd /var/www/vhosts/solairenettoyage.com/httpdocs/app-git
```

### Erreur : "Process solaire-nettoyage not found"
**Solution :** Le processus s'appelle **solaire-site**, pas solaire-nettoyage
```bash
pm2 restart solaire-site
```

### Erreur : "npm run build échoue"
**Solution :** Vérifier les erreurs TypeScript/ESLint, corriger en local, puis push à nouveau

### Le site ne se met pas à jour après pm2 restart
**Solution :** Vérifier que rsync a bien copié les fichiers
```bash
rsync -av --delete .next/ ../app/.next/
pm2 restart solaire-site
```

---

## 🎯 BONNES PRATIQUES

1. **Toujours tester en local avant de push**
   - `npm run dev` sur ton Mac
   - Vérifier que tout marche
   
2. **Commit messages clairs**
   - Bon : `"Fix: bug m² import"`
   - Mauvais : `"update"`
   
3. **Pull avant de modifier sur le VPS**
   - Toujours faire `git pull` en premier
   
4. **Vérifier après déploiement**
   - Tester le site en HTTPS
   - Vérifier `pm2 status`

---

## 🔍 VÉRIFICATIONS POST-DÉPLOIEMENT

### Après déploiement Vercel
✅ Aller sur https://solairenettoyage.vercel.app  
✅ Vérifier que les modifications sont visibles  

### Après déploiement VPS
✅ `pm2 status` doit afficher "online"  
✅ Aller sur https://solairenettoyage.com  
✅ Tester les fonctionnalités modifiées  
✅ Vérifier la console navigateur (F12) pour les erreurs  

---

## 📊 INFORMATIONS TECHNIQUES

**Repository GitHub :**
- URL : https://github.com/lacastanhal-jpg/solaire-nettoyage-site
- Branche : main

**Vercel :**
- URL preview : https://solairenettoyage.vercel.app
- Déploiement : Automatique via GitHub

**VPS IONOS :**
- IP : 217.154.170.227
- URL production : https://solairenettoyage.com
- Accès SSH : Via Plesk (Terminal SSH)
- Processus PM2 : solaire-site
- Port : 3000 (interne)

**Stack technique :**
- Next.js 14.2.0
- Node.js (version sur VPS)
- PM2 pour le process management
- Nginx (reverse proxy)
- Apache (backend proxy)

---

## 🚨 EN CAS DE PROBLÈME

### Le site ne charge plus après déploiement

**1. Vérifier PM2 :**
```bash
pm2 status
pm2 logs solaire-site
```

**2. Redémarrer si nécessaire :**
```bash
pm2 restart solaire-site
```

**3. Si ça ne marche toujours pas :**
```bash
# Revenir à la version précédente sur le VPS
cd /var/www/vhosts/solairenettoyage.com/httpdocs/app-git
git log --oneline  # Voir les commits
git reset --hard COMMIT_ID  # Revenir à un commit précédent
npm run build
rsync -av --delete .next/ ../app/.next/
pm2 restart solaire-site
```

### Erreur "EADDRINUSE: port 3000 already in use"

**Solution :**
```bash
pm2 delete solaire-site
pm2 start npm --name "solaire-site" -- start
```

---

## 📅 HISTORIQUE DES DÉPLOIEMENTS

**26 décembre 2025 :**
- ✅ Correction bug m² import (utilisait `quantite` au lieu de `site.surface`)
- ✅ Ajout header admin global (layout.tsx dans app/admin/)
- ✅ Nettoyage fichiers copie
- ✅ Installation certificat SSL Sectigo (valide jusqu'au 26 déc 2026)

---

## 💡 ASTUCES

**Déploiement rapide sans message long :**
```bash
git add . && git commit -m "update" && git push origin main
```

**Déploiement VPS en une seule commande :**
```bash
cd /var/www/vhosts/solairenettoyage.com/httpdocs/app-git && git pull origin main && npm run build && rsync -av --delete .next/ ../app/.next/ && pm2 restart solaire-site
```

**Voir les modifications avant de commiter :**
```bash
git diff
```

**Annuler le dernier commit (avant push) :**
```bash
git reset HEAD~1
```

---

**Document créé le :** 26 décembre 2025  
**Dernière mise à jour :** 26 décembre 2025  
**Version :** 1.0
