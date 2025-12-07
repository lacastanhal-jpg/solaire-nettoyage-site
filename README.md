# Solaire Nettoyage - Site Web Professionnel

Site web Next.js 14 pour Solaire Nettoyage, leader français du nettoyage de panneaux photovoltaïques.

## 🚀 Technologies

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React 18**

## 📋 Prérequis

- Node.js 18.17 ou supérieur
- npm ou yarn

## 🛠️ Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le site sera accessible sur `http://localhost:3000`

## 📦 Structure du Projet

```
solaire-nettoyage-site/
├── app/
│   ├── components/
│   │   ├── Header.tsx          # Navigation principale
│   │   ├── Hero.tsx            # Section hero
│   │   ├── Stats.tsx           # Chiffres clés
│   │   ├── Clients.tsx         # Références clients
│   │   ├── Services.tsx        # Services et expertise
│   │   └── Footer.tsx          # Pied de page
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Page d'accueil
│   └── globals.css             # Styles globaux
├── public/
│   └── images/                 # Images et assets
├── tailwind.config.ts          # Configuration Tailwind
└── package.json
```

## 🎨 Design

**Palette de couleurs Corporate Dark:**
- Fond principal: `#0D1117` (dark-bg)
- Surfaces: `#161B22` (dark-surface)
- Navy: `#0A2540`
- Gold accent: `#C9A961`
- Blanc: `#FFFFFF`

**Typographie:**
- Titres: Playfair Display (serif)
- Corps: IBM Plex Sans (sans-serif)

## 🚀 Build & Déploiement

```bash
# Build de production
npm run build

# Démarrer en production
npm start
```

### Déploiement sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

## 📝 To-Do

- [ ] Ajouter photos chantiers réelles
- [ ] Ajouter logos clients HD
- [ ] Compléter informations de contact
- [ ] Ajouter formulaire de devis
- [ ] Configurer domaine solairenettoyage.fr
- [ ] Optimiser SEO
- [ ] Ajouter Google Analytics

## 📞 Contact

SAS Solaire Nettoyage  
SIRET: 820 504 421 00028  
Email: contact@solairenettoyage.fr

## 📄 Licence

Propriétaire - © 2024 Solaire Nettoyage
