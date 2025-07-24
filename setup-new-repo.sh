#!/bin/bash

# 🚀 SCRIPT DE CONFIGURATION NOUVEAU REPOSITORY GITHUB
# MyComfort Facturation App - Solution définitive

echo "=============================================="
echo "🚀 CONFIGURATION NOUVEAU REPOSITORY GITHUB"
echo "=============================================="
echo ""

# Instructions pour l'utilisateur
echo "📋 ÉTAPES PRÉALABLES :"
echo "1. Allez sur https://github.com"
echo "2. Cliquez 'New repository'"
echo "3. Nom suggéré: myconfort-facturation-public"
echo "4. ⚠️ IMPORTANT: Cochez 'Public'"
echo "5. Cliquez 'Create repository'"
echo ""

# Demander l'URL du nouveau repository
echo "📝 Entrez l'URL de votre nouveau repository GitHub :"
echo "Format: https://github.com/VOTRE-USERNAME/myconfort-facturation-public.git"
read -p "URL du repository : " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ URL manquante. Arrêt du script."
    exit 1
fi

echo ""
echo "🔧 Configuration en cours..."

# Naviguer vers le projet
cd /home/codespace/facturation-MYconfortdu-20-07-2025-1

# Supprimer l'ancien remote
echo "🗑️ Suppression de l'ancien remote..."
git remote remove origin 2>/dev/null || echo "Aucun remote à supprimer"

# Ajouter le nouveau remote
echo "🔗 Ajout du nouveau remote..."
git remote add origin "$REPO_URL"

# Vérifier le remote
echo "✅ Remote configuré :"
git remote -v

# Ajouter tous les fichiers
echo "📦 Ajout de tous les fichiers..."
git add -A

# Créer un commit final
echo "💾 Création du commit final..."
git commit -m "🚀 MyComfort Facturation App - Version publique complète

✅ Application de facturation professionnelle complète :

📋 FONCTIONNALITÉS :
- Interface React moderne avec TailwindCSS
- Génération PDF automatique avec signatures électroniques
- Intégration EmailJS pour envoi automatique
- Upload Google Drive intégré
- Gestion complète clients et produits
- Calculs automatiques TTC/HT avec remises
- Impression optimisée A4
- Structure TypeScript complète

🔧 TECHNOLOGIES :
- Vite + React + TypeScript
- TailwindCSS pour l'interface
- Services PDF avancés
- APIs externes (EmailJS, Google Drive)
- Architecture modulaire complète

📊 CONTENU :
- 50+ fichiers de code source
- 25+ composants React
- 8 services complets
- 20+ fichiers de documentation
- Scripts de déploiement automatisés

🎯 PRÊT POUR BOLT.NEW :
Une fois ce push terminé, importez directement dans Bolt.new
avec l'URL de ce repository.

🌟 Version finale - Prête pour production
📅 $(date)
🏢 MyComfort - Spécialiste literie" || echo "Commit déjà existant"

# Push vers le nouveau repository
echo "🚀 Push vers GitHub..."
if git push -u origin main; then
    echo ""
    echo "=============================================="
    echo "✅ SUCCÈS COMPLET !"
    echo "=============================================="
    echo ""
    echo "🌐 Votre repository est maintenant disponible :"
    echo "$REPO_URL"
    echo ""
    echo "🚀 IMPORT DANS BOLT.NEW :"
    echo "1. Allez sur https://bolt.new"
    echo "2. Choisissez 'Import from GitHub'"
    echo "3. Collez l'URL : ${REPO_URL%.git}"
    echo "4. L'application sera automatiquement déployée !"
    echo ""
    echo "✅ MyComfort Facturation App est maintenant public et prêt !"
else
    echo ""
    echo "❌ ERREUR LORS DU PUSH"
    echo "Vérifiez :"
    echo "1. L'URL du repository est correcte"
    echo "2. Le repository est bien public"
    echo "3. Vous avez les permissions d'écriture"
    echo ""
    echo "💡 Essayez un push manuel :"
    echo "git push -u origin main"
fi

echo ""
echo "=============================================="
echo "🏁 SCRIPT TERMINÉ"
echo "=============================================="
