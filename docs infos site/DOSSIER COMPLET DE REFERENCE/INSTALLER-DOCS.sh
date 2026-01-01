#!/bin/bash
# INSTALLATION DOCUMENTS DE RÉFÉRENCE
# Pour nouvelle conversation Claude

echo "📚 Installation documents de référence..."

# Aller dans le projet
cd /Users/jeromegely/solaire-nettoyage-site

# Créer dossier docs s'il n'existe pas
mkdir -p docs/reference

# Copier les documents
echo "✅ Copie REFERENCE-COMPLETE-PROJET.md"
cp ~/Downloads/REFERENCE-COMPLETE-PROJET.md \
   docs/reference/

echo "✅ Copie AIDE-MEMOIRE-RAPIDE.md"
cp ~/Downloads/AIDE-MEMOIRE-RAPIDE.md \
   docs/reference/

echo "✅ Copie documents projet existants"
cp ~/Downloads/SPECIFICATIONS-COMPLETES-30DEC2025.md \
   docs/reference/ 2>/dev/null || echo "⚠️  Specs non trouvées (optionnel)"

cp ~/Downloads/STRUCTURE-COMPLETE-PROJET-30DEC2025.md \
   docs/reference/ 2>/dev/null || echo "⚠️  Structure non trouvée (optionnel)"

echo ""
echo "✅ Installation terminée !"
echo ""
echo "📂 Documents installés dans :"
echo "   docs/reference/"
echo ""
echo "📋 Fichiers :"
ls -lh docs/reference/ | grep -v "^total" | awk '{print "   " $9 " (" $5 ")"}'
echo ""
echo "🎯 Pour nouvelle conversation :"
echo "   1. Upload REFERENCE-COMPLETE-PROJET.md"
echo "   2. Upload AIDE-MEMOIRE-RAPIDE.md"
echo "   3. Ou pointer Claude vers docs/reference/"
echo ""
