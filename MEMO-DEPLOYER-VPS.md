# 🚀 MÉMO - DÉPLOYER SUR LE VPS

## 📍 LOCALISATION
- **Site VPS :** `/var/www/vhosts/solairenettoyage.com/httpdocs/app-git/`
- **Site local :** `~/solaire-nettoyage-site/`

---

## 🔄 DÉPLOYER UNE MISE À JOUR

### **1️⃣ SUR TON MAC**

```bash
cd ~/solaire-nettoyage-site

# Ajouter les fichiers modifiés
git add .

# Commiter avec un message
git commit -m "Description de tes modifications"

# Pousser sur GitHub
git push origin main
```

---

### **2️⃣ SUR LE VPS**

```bash
# Se connecter
ssh root@217.154.170.227

# Aller dans le dossier
cd /var/www/vhosts/solairenettoyage.com/httpdocs/app-git

# Récupérer les changements
git pull origin main

# Installer nouvelles dépendances (si besoin)
npm install

# Rebuild
npm run build

# Redémarrer
pm2 restart solaire-site
```

---

## ⚡ VERSION ULTRA-COURTE

**Mac :**
```bash
cd ~/solaire-nettoyage-site
git add .
git commit -m "update"
git push origin main
```

**VPS :**
```bash
ssh root@217.154.170.227
cd /var/www/vhosts/solairenettoyage.com/httpdocs/app-git
git pull origin main
npm install
npm run build
pm2 restart solaire-site
```

---

## 🔐 INFOS CONNEXION VPS
- **IP :** 217.154.170.227
- **User :** root
- **Password :** (ton mot de passe VPS)

---

## ✅ VÉRIFIER QUE ÇA MARCHE

```bash
pm2 status
```

Doit afficher : **status: online** ✅

---

**C'EST TOUT ! 🎉**
