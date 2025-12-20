# 🚀 RÉCAPITULATIF COMPLET - MIGRATION VPS IONOS

**Date :** 16 décembre 2024
**Projet :** Migration site Next.js vers VPS IONOS avec Plesk

---

## 📋 ÉTAT ACTUEL

**✅ Terminé :**
1. VPS commandé et activé
2. Plesk installé et configuré
3. Node.js installé (v25.2.1 et v24.12.0)
4. Domaine solairenettoyage.com ajouté à Plesk
5. DNS configuré pour pointer vers le VPS
6. Archive du site créée (260M)

**⏳ En cours :**
- Activation Node.js sur le domaine (dernier bouton à cliquer)

**❌ À faire :**
1. Activer Node.js sur le domaine
2. Uploader l'archive sur le VPS
3. Configurer les variables d'environnement
4. Démarrer l'application avec PM2
5. Activer SSL/HTTPS
6. Tester le site sur solairenettoyage.com

---

## 🔐 IDENTIFIANTS IMPORTANTS

### **VPS IONOS :**
- **IP :** `217.154.170.227`
- **Login root :** `root`
- **Mot de passe root :** `F19TnQ5k`

### **PLESK :**
- **URL :** `https://217.154.170.227:8443`
- **Login :** `root`
- **Mot de passe :** `F19TnQ5k` (même que root, mais ça ne marche pas - utiliser la console pour reset)

### **FTP/SSH du domaine :**
- **Host :** `217.154.170.227`
- **Username :** `solairenettoyage.com_swv2i`
- **Password :** `Zz69s4jr_Y`
- **Port SSH :** 22 (actuellement bloqué, nécessite config)

---

## 🌐 CONFIGURATION DNS

### **solairenettoyage.com :**
**✅ Configuré le 16/12/2024 :**
- `A` | `@` | `217.154.170.227`
- `A` | `www` | `217.154.170.227`
- **Propagation :** 10-60 minutes

### **solairenettoyage.fr :**
**❌ Non modifié :**
- Reste sur webhosting IONOS (page MyWebsite)
- À migrer APRÈS les tests sur .com
- **Important :** Ce domaine a 10 ans d'ancienneté = excellent SEO !

---

## 📦 FICHIERS CRÉÉS

### **Archive du site :**
**Fichier :** `site-deploy-20251216-172047.tar.gz` (260M)
**Location :** `~/solaire-nettoyage-site/`

**Contenu :**
- `.next/` (build production)
- `package.json`
- `package-lock.json`
- `public/`
- `next.config.js`
- `.env.local`

**Variables d'environnement incluses :**
- Firebase config (toutes les clés)
- `RESEND_API_KEY=re_dummy_key_for_build` (clé bidon pour compilation)

---

## 🎯 CONFIGURATION PLESK ACTUELLE

### **Node.js sur solairenettoyage.com :**
- **Node.js Version :** 25.2.1
- **Package Manager :** npm
- **Document Root :** `/httpdocs`
- **Application Root :** `/httpdocs` `[open]`
- **Application Mode :** production
- **Application URL :** http://solairenettoyage.com
- **Application Startup File :** `app.js` ⚠️ (n'existe pas encore)

**⚠️ Action nécessaire :**
- Cliquer sur "Enable Node.js" dans Plesk
- Changer le startup file en `npm start` ou configurer PM2

---

## 🚀 PROCHAINES ÉTAPES DÉTAILLÉES

### **ÉTAPE 1 - ACTIVER NODE.JS :**
1. Dans Plesk, sur la page "Node.js on solairenettoyage.com"
2. Cliquer sur "Enable Node.js"
3. Modifier "Application Startup File" : `npm start`
4. Sauvegarder

### **ÉTAPE 2 - UPLOADER LE SITE :**
**Option A - Via File Manager Plesk :**
1. Cliquer sur "File Manager"
2. Aller dans `/httpdocs/`
3. Supprimer les fichiers par défaut
4. Uploader `site-deploy-20251216-172047.tar.gz`
5. Extraire l'archive

**Option B - Via SCP (plus rapide) :**
```bash
# Sur Mac
scp ~/solaire-nettoyage-site/site-deploy-20251216-172047.tar.gz \
  solairenettoyage.com_swv2i@217.154.170.227:/httpdocs/

# Puis via SSH ou console Plesk :
cd /httpdocs
tar -xzf site-deploy-20251216-172047.tar.gz
rm site-deploy-20251216-172047.tar.gz
```

### **ÉTAPE 3 - INSTALLER DÉPENDANCES :**
```bash
cd /var/www/vhosts/solairenettoyage.com/httpdocs
npm install --production
```

### **ÉTAPE 4 - CONFIGURER PM2 :**
```bash
npm install -g pm2
pm2 start npm --name "solaire-site" -- start
pm2 save
pm2 startup
```

### **ÉTAPE 5 - CONFIGURER NGINX (dans Plesk) :**
**Apache & nginx Settings → Additional nginx directives :**
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### **ÉTAPE 6 - ACTIVER SSL :**
1. Dans Plesk, aller dans "SSL/TLS Certificates"
2. Cliquer sur "Install a free basic certificate provided by Let's Encrypt"
3. Cocher "Secure the domain and its www subdomain"
4. Installer

### **ÉTAPE 7 - CONFIGURER FIREBASE :**
**Dans Firebase Console :**
1. Aller dans "Authentication" → "Settings"
2. Ajouter dans "Authorized domains" :
   - `solairenettoyage.com`
   - `217.154.170.227` (temporaire pour tests)

---

## 🔧 COMMANDES UTILES

### **Accès SSH (quand configuré) :**
```bash
ssh root@217.154.170.227
# ou
ssh solairenettoyage.com_swv2i@217.154.170.227
```

### **Voir les logs PM2 :**
```bash
pm2 logs solaire-site
```

### **Redémarrer l'application :**
```bash
pm2 restart solaire-site
```

### **Voir le statut :**
```bash
pm2 status
```

### **Redémarrer Nginx :**
```bash
systemctl restart nginx
```

---

## ⚠️ PROBLÈMES CONNUS

### **SSH bloqué :**
**Symptôme :** `Connection closed by 217.154.170.227 port 22`
**Solution :** Utiliser la console web Plesk pour l'instant
**Fix permanent :** Via console, éditer `/etc/ssh/sshd_config` et activer `PermitRootLogin yes`

### **Mot de passe Plesk incorrect :**
**Solution :** Via console web Plesk, taper :
```bash
plesk login
# Ou
plesk admin --set-admin-password -passwd "NouveauMotDePasse123!"
```

---

## 💰 COÛTS

**Mensuels :**
- VPS Linux L : 5€/mois
- Plesk Web Host Edition : 5€/mois
- **Total : 10€/mois (120€/an)**

**Vs Vercel gratuit mais VPS = contrôle total**

---

## 🎯 OBJECTIFS

### **Phase 1 - Test (solairenettoyage.com) :**
✅ Vérifier que tout fonctionne
✅ Tester les extincteurs
✅ Tester le client dataroom
✅ Tester Firebase
✅ Tester les performances

### **Phase 2 - Production (après tests OK) :**
✅ Migrer solairenettoyage.fr vers le VPS
✅ Configurer solairenettoyage.com → Redirect 301 vers .fr (SEO)
✅ Abandonner l'ancien webhosting IONOS

---

## 📞 SUPPORT

**IONOS Support :**
- Depuis interface IONOS
- Chat disponible

**Plesk Documentation :**
- https://docs.plesk.com

**Si problème :**
1. Vérifier les logs PM2
2. Vérifier les logs Nginx : `/var/log/nginx/`
3. Utiliser la console web Plesk

---

## 📝 NOTES IMPORTANTES

1. **Le .fr reste intact** jusqu'aux tests complets sur .com
2. **Backup automatique Plesk** : Configuré daily à 00:00
3. **Firewall** : Configuré par défaut, ports 80, 443, 8443 ouverts
4. **Updates** : Penser à updater régulièrement Ubuntu et Plesk

---

## ✅ CHECKLIST FINALE

**Avant de dire "C'est bon" :**
- [ ] Site accessible sur http://solairenettoyage.com
- [ ] Site accessible sur https://solairenettoyage.com (SSL)
- [ ] Dashboard fonctionne
- [ ] Login admin fonctionne
- [ ] Firebase fonctionne (extincteurs, certifications)
- [ ] Client dataroom fonctionne
- [ ] Technicien extincteurs fonctionne
- [ ] Images/assets chargent correctement
- [ ] Performances OK (temps de chargement < 3s)
- [ ] Pas d'erreurs dans la console navigateur

---

## 🔄 POUR REPRENDRE CETTE CONVERSATION

**Dis simplement :**
- "On configurait le VPS Plesk"
- "On en était à l'étape X"
- "Continue la migration VPS"

**Claude retrouvera automatiquement grâce à :**
- La mémoire du projet
- Les transcripts de conversation
- Ce document

---

## 📧 CONTACT

**Ton projet Solaire Nettoyage :**
- Site actuel : solairenettoyage.fr (MyWebsite IONOS)
- Nouveau site : Next.js + Firebase + Vercel (à migrer sur VPS)
- Système extincteurs : Complet et fonctionnel
- Client dataroom : Opérationnel

**VPS prêt à recevoir le site !**

---

**DERNIÈRE ACTION À FAIRE :**
**→ Cliquer sur "Enable Node.js" dans Plesk !**
