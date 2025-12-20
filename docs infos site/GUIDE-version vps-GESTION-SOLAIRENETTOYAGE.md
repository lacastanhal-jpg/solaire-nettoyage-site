# 🚀 GUIDE DE GESTION - SOLAIRENETTOYAGE.COM

**Date de déploiement :** 17 décembre 2025  
**Serveur :** VPS IONOS (217.154.170.227)  
**Technicien :** Jérôme Gely

---

## 📍 OÙ SONT LES FICHIERS DU SITE ?

### **Emplacement principal :**
```
/var/www/vhosts/solairenettoyage.com/httpdocs/app/
```

### **Structure des fichiers :**
```
/var/www/vhosts/solairenettoyage.com/httpdocs/app/
├── .env.local              ← Variables d'environnement (Firebase, Resend)
├── .next/                  ← Build Next.js compilé
│   ├── static/             ← CSS, JS, assets statiques
│   └── server/             ← Code serveur compilé
├── node_modules/           ← Dépendances installées
├── package.json            ← Liste des dépendances
├── public/                 ← Images, logos, fichiers publics
├── server.js               ← Serveur Next.js standalone
└── site-standalone-final.tar.gz  ← Archive de backup
```

---

## 🔧 COMMENT ÇA FONCTIONNE ?

### **Architecture du système :**

```
Internet (visiteur)
    ↓
Apache (port 80/443) - Serveur web principal
    ↓ (proxy)
Node.js (port 3000) - Serveur Next.js
    ↑
PM2 - Gestionnaire de processus
```

**Explication simple :**
1. Un visiteur arrive sur **https://solairenettoyage.com**
2. **Apache** reçoit la requête (serveur web)
3. **Apache** redirige vers **Node.js** qui tourne sur le port 3000
4. **Node.js** exécute ton site Next.js
5. **PM2** surveille Node.js et le redémarre automatiquement si problème

---

## 🔄 METTRE À JOUR LE SITE

### **ÉTAPE 1 : Sur ton Mac**

#### 1. Faire les modifications
Modifier le code dans VS Code ou ton éditeur préféré.

#### 2. Builder le site
```bash
cd ~/solaire-nettoyage-site
npm run build
```
⏱️ Attends que le build finisse (1-2 minutes).

#### 3. Créer l'archive de mise à jour
```bash
tar -czf ~/Downloads/site-update.tar.gz \
  .next/standalone/ \
  .next/static/ \
  public/ \
  .env.local
```

#### 4. Uploader l'archive
- Ouvre Plesk → **Gestionnaire de fichiers**
- Va dans `/httpdocs/app/`
- Clique sur **"Téléverser des fichiers"**
- Sélectionne `site-update.tar.gz`
- Attends que l'upload finisse

### **ÉTAPE 2 : Sur le VPS**

#### 1. Ouvre le terminal SSH
- Plesk → **Outils & Paramètres** → **Terminal SSH**

#### 2. Copie-colle ces commandes UNE PAR UNE :

```bash
# Aller dans le dossier
cd /var/www/vhosts/solairenettoyage.com/httpdocs/app

# Arrêter le site
pm2 stop solaire-site

# Supprimer les anciens fichiers
rm -rf .next node_modules package.json server.js public .env.local ._*

# Extraire la nouvelle archive
tar -xzf site-update.tar.gz

# Copier les fichiers static
cp -r .next/static .next/standalone/.next/

# Déplacer les fichiers
mv .next/standalone/* .
mv .next/standalone/.next/* .next/

# Nettoyer
rm -rf .next/standalone

# Redémarrer le site
pm2 restart solaire-site

# Vérifier que ça marche
pm2 status
```

#### 3. Vérifie le site
Va sur **https://solairenettoyage.com** et fais Cmd+Shift+R (hard refresh).

---

## 📊 COMMANDES PM2 ESSENTIELLES

### **Voir l'état du site :**
```bash
pm2 status
```
Tu devrais voir `status: online` en vert.

### **Voir les logs en direct :**
```bash
pm2 logs solaire-site
```
**Appuie sur Ctrl+C pour sortir.**

### **Redémarrer le site :**
```bash
pm2 restart solaire-site
```

### **Arrêter le site :**
```bash
pm2 stop solaire-site
```

### **Démarrer le site :**
```bash
pm2 start solaire-site
```

### **Voir les logs des erreurs :**
```bash
pm2 logs solaire-site --err --lines 50
```

---

## 🆘 EN CAS DE PROBLÈME

### **❌ Le site ne s'affiche pas**

**1. Vérifie PM2 :**
```bash
pm2 status
```
- Si `status: online` (vert) → c'est bon
- Si `status: errored` (rouge) → regarde les logs

**2. Voir les erreurs :**
```bash
pm2 logs solaire-site --err --lines 50
```

**3. Redémarre :**
```bash
pm2 restart solaire-site
```

### **❌ Le site crash en boucle**

**1. Voir les logs :**
```bash
pm2 logs solaire-site --err --lines 50
```

**2. Tuer tous les processus Node et redémarrer :**
```bash
pkill -9 node
pm2 restart solaire-site
pm2 status
```

### **❌ Erreur "Port 3000 déjà utilisé"**

```bash
# Trouver ce qui utilise le port
ss -tulpn | grep :3000

# Tuer le processus
pkill -9 node

# Redémarrer PM2
pm2 restart solaire-site
```

### **✅ Après un redémarrage du serveur**

Le site redémarre **AUTOMATIQUEMENT** grâce à PM2.

Vérifie quand même :
```bash
pm2 status
```

---

## 🔐 ACCÈS ET IDENTIFIANTS

### **VPS SSH :**
- **IP :** 217.154.170.227
- **User :** root
- **Password :** F19TnQ5k
- **Accès :** Plesk → Outils & Paramètres → Terminal SSH

### **Plesk (interface web) :**
- **URL :** https://217.154.170.227:8443
- **User :** root
- **Password :** F19TnQ5k

### **Site web :**
- **URL :** https://solairenettoyage.com

---

## 📁 FICHIERS IMPORTANTS

### **.env.local** (variables d'environnement)
```
/var/www/vhosts/solairenettoyage.com/httpdocs/app/.env.local
```
**Contient :**
- Clés API Firebase
- Clés API Resend
- Configuration production

**⚠️ NE JAMAIS PARTAGER CE FICHIER !**

### **Configuration Apache** (proxy vers Node.js)
**Emplacement :** Plesk → solairenettoyage.com → Apache & nginx

**Directives HTTP et HTTPS :**
```apache
ProxyPreserveHost On
ProxyPass /.well-known !
ProxyPass / http://127.0.0.1:3000/
ProxyPassReverse / http://127.0.0.1:3000/
```

---

## ⚡ OPTIMISATIONS (À FAIRE PLUS TARD)

### **1. Installer Sharp (optimisation d'images)**

⚠️ Ne fais ça que quand tu es prêt, pas tout de suite !

```bash
cd /var/www/vhosts/solairenettoyage.com/httpdocs/app
npm install sharp --save
pm2 restart solaire-site
```

**Ce que ça fait :**
- Compresse automatiquement les images
- Rend le site plus rapide
- Réduit l'utilisation de bande passante

### **2. Activer la compression Gzip**

Dans Plesk → Apache & nginx, ajouter :
```apache
AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
```

---

## 📝 NOTES TECHNIQUES

### **Pourquoi PM2 ?**
PM2 est un gestionnaire de processus Node.js qui :
- Redémarre automatiquement si le site crash
- Redémarre automatiquement au boot du serveur
- Permet de voir les logs facilement
- Gère la mémoire et les ressources

### **Pourquoi le mode standalone ?**
Next.js en mode standalone :
- Contient tout ce qui est nécessaire dans un seul dossier
- N'a pas besoin de `npm install` après déploiement
- Est optimisé pour la production
- Démarre plus rapidement

### **Différence avec Vercel ?**
- **Vercel** : Hébergement automatique, simple mais moins de contrôle
- **VPS IONOS** : Contrôle total, configuration manuelle, plus flexible

---

## ☎️ SUPPORT

**Si tu as des problèmes :**

1. Note bien :
   - Les commandes que tu as lancées
   - Les logs d'erreur (`pm2 logs`)
   - Le statut PM2 (`pm2 status`)

2. Vérifie :
   - Le site est-il accessible ? https://solairenettoyage.com
   - PM2 est-il online ? `pm2 status`
   - Y a-t-il des erreurs dans les logs ? `pm2 logs`

3. Essaye de redémarrer :
   ```bash
   pm2 restart solaire-site
   ```

---

## 📦 BACKUP

### **Créer un backup manuel :**

```bash
cd /var/www/vhosts/solairenettoyage.com/httpdocs/app
tar -czf /root/backup-site-$(date +%Y%m%d).tar.gz .
```

### **Restaurer un backup :**

```bash
cd /var/www/vhosts/solairenettoyage.com/httpdocs/app
pm2 stop solaire-site
rm -rf *
tar -xzf /root/backup-site-XXXXXXXX.tar.gz
pm2 restart solaire-site
```

---

## 🎓 RESSOURCES UTILES

- **Documentation PM2 :** https://pm2.keymetrics.io/docs/usage/quick-start/
- **Documentation Next.js :** https://nextjs.org/docs
- **Plesk Documentation :** https://docs.plesk.com/

---

## ✅ CHECKLIST DE MAINTENANCE

**Toutes les semaines :**
- [ ] Vérifier `pm2 status`
- [ ] Vérifier que le site fonctionne
- [ ] Vérifier les logs : `pm2 logs solaire-site --lines 20`

**Tous les mois :**
- [ ] Créer un backup manuel
- [ ] Vérifier l'espace disque : `df -h`
- [ ] Vérifier la RAM : `free -h`

**Après chaque mise à jour :**
- [ ] Tester toutes les pages du site
- [ ] Vérifier les formulaires
- [ ] Vérifier Firebase (connexions admin/client)
- [ ] Vérifier l'envoi d'emails (Resend)

---

**🎉 FIN DU GUIDE - TON SITE EST EN PRODUCTION !**

**Date de création :** 17 décembre 2025  
**Version :** 1.0
