# Guide de Déploiement sur Vercel

## 🚀 Étapes de déploiement

### 1. Créer un compte Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. S'inscrire avec GitHub (recommandé) ou email
3. Vérifier l'email

### 2. Préparer le projet pour GitHub

```bash
# Initialiser Git dans le projet
cd solaire-nettoyage-site
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Site Solaire Nettoyage"

# Créer un repo sur GitHub et le lier
git remote add origin https://github.com/VOTRE-USERNAME/solaire-nettoyage.git
git branch -M main
git push -u origin main
```

### 3. Déployer sur Vercel

**Option A: Via l'interface Vercel (Recommandé)**

1. Se connecter sur [vercel.com/new](https://vercel.com/new)
2. Cliquer sur "Import Git Repository"
3. Sélectionner le repo `solaire-nettoyage`
4. Configurer le projet:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Cliquer sur "Deploy"

**Option B: Via CLI**

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Déploiement production
vercel --prod
```

### 4. Configurer le domaine solairenettoyage.fr

1. Dans le dashboard Vercel, aller dans **Settings** > **Domains**
2. Ajouter le domaine: `solairenettoyage.fr`
3. Ajouter également: `www.solairenettoyage.fr`
4. Vercel vous donnera les DNS à configurer

### 5. Configurer les DNS (chez votre registrar)

Ajouter ces enregistrements DNS:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

⏳ **Délai de propagation**: 24-48h maximum

### 6. Configurer HTTPS

✅ Automatique avec Vercel (Let's Encrypt)

### 7. Variables d'environnement

Dans Vercel Dashboard > Settings > Environment Variables:

```
NEXT_PUBLIC_SITE_URL = https://www.solairenettoyage.fr
NEXT_PUBLIC_PHONE = 06XXXXXXXX
NEXT_PUBLIC_EMAIL = contact@solairenettoyage.fr
```

### 8. Redéploiement automatique

✅ Chaque `git push` sur `main` déclenche un nouveau déploiement

## 📊 Monitoring

- **Analytics**: Vercel Analytics (inclus)
- **Logs**: Vercel Dashboard > Logs
- **Performance**: Web Vitals automatiques

## 💰 Coûts

- **Plan Hobby** (gratuit):
  - Bande passante: 100 GB/mois
  - Serverless Functions: 100 GB-Heures
  - Largement suffisant pour ce site

- **Plan Pro** (20$/mois):
  - Si besoin de plus de performance
  - Support prioritaire
  - Analytics avancés

## ✅ Checklist post-déploiement

- [ ] Site accessible sur solairenettoyage.fr
- [ ] HTTPS actif (cadenas vert)
- [ ] Redirection www → non-www (ou inverse)
- [ ] Tester sur mobile
- [ ] Vérifier performance avec Lighthouse
- [ ] Configurer Google Analytics
- [ ] Soumettre à Google Search Console

## 🔄 Workflow de mise à jour

```bash
# Faire vos modifications
# Puis:

git add .
git commit -m "Description des changements"
git push

# Vercel déploie automatiquement!
```

## 🆘 Support

- Documentation: [vercel.com/docs](https://vercel.com/docs)
- Support: support@vercel.com
- Status: [status.vercel.com](https://status.vercel.com)
