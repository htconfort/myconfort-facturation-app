#!/bin/bash
# Script de synchronisation avec repository secondaire MyComfort

echo "🔄 SYNCHRONISATION REPOSITORY SECONDAIRE"
echo "========================================"

# Vérifier si nous sommes dans le bon répertoire
if [ ! -d ".git" ]; then
    echo "❌ Erreur: Pas de repository Git trouvé"
    echo "Assurez-vous d'être dans le répertoire du projet"
    exit 1
fi

echo "📍 Répertoire actuel: $(pwd)"
echo "🌐 Repository principal: $(git remote get-url origin)"

# Demander l'URL du repository secondaire
echo ""
echo "🔗 AJOUT DU REPOSITORY SECONDAIRE"
echo "Veuillez fournir l'URL du repository 'my-comfort 20-07':"
echo "Format attendu: https://github.com/[USER]/[REPO].git"
echo ""

# Pour utilisation manuelle, décommentez la ligne suivante:
# read -p "URL du repository secondaire: " SECONDARY_REPO_URL

# Pour utilisation avec URL fournie directement, utilisez:
SECONDARY_REPO_URL="$1"

if [ -z "$SECONDARY_REPO_URL" ]; then
    echo "❌ URL du repository secondaire non fournie"
    echo "Usage: $0 <URL_REPOSITORY_SECONDAIRE>"
    echo "Exemple: $0 https://github.com/htconfort/my-comfort-20-07.git"
    exit 1
fi

echo "🔧 URL du repository secondaire: $SECONDARY_REPO_URL"

# Vérifier si le remote 'secondary' existe déjà
if git remote get-url secondary >/dev/null 2>&1; then
    echo "⚠️ Remote 'secondary' existe déjà, suppression..."
    git remote remove secondary
fi

# Ajouter le remote secondaire
echo "➕ Ajout du remote secondaire..."
if git remote add secondary "$SECONDARY_REPO_URL"; then
    echo "✅ Remote secondaire ajouté avec succès"
else
    echo "❌ Erreur lors de l'ajout du remote secondaire"
    exit 1
fi

# Vérifier les remotes
echo ""
echo "📋 REMOTES CONFIGURÉS:"
git remote -v

# Afficher l'état actuel
echo ""
echo "📊 ÉTAT ACTUEL:"
echo "Branche actuelle: $(git branch --show-current)"
echo "Dernier commit: $(git log --oneline -1)"
echo "Nombre total de commits: $(git rev-list --count HEAD)"

# Pousser vers le repository secondaire
echo ""
echo "🚀 PUSH VERS REPOSITORY SECONDAIRE"
echo "Pushing tous les commits vers 'secondary'..."

if git push secondary main --force; then
    echo "✅ Push vers repository secondaire réussi !"
    
    # Afficher le résumé
    echo ""
    echo "🎉 SYNCHRONISATION TERMINÉE AVEC SUCCÈS"
    echo "======================================"
    echo "✅ Repository principal: $(git remote get-url origin)"
    echo "✅ Repository secondaire: $(git remote get-url secondary)"
    echo "✅ Commits synchronisés: $(git rev-list --count HEAD)"
    echo "✅ Branche: main"
    echo ""
    echo "🌐 Les deux repositories contiennent maintenant:"
    echo "   - Code source React/TypeScript complet"
    echo "   - 25+ composants UI fonctionnels"
    echo "   - Services: PDF, EmailJS, Google Drive, N8N"
    echo "   - Documentation exhaustive (20+ fichiers .md)"
    echo "   - Configuration: Vite, TailwindCSS, TypeScript"
    echo "   - Corrections Bolt.new (PDFPreviewModal)"
    echo ""
    echo "🚀 Import Bolt.new possible depuis les deux repositories:"
    echo "   - Repository principal: $(git remote get-url origin | sed 's/ghp_[^@]*@//')"
    echo "   - Repository secondaire: $(git remote get-url secondary | sed 's/ghp_[^@]*@//')"
    
else
    echo "❌ Erreur lors du push vers repository secondaire"
    echo "Vérifiez:"
    echo "  - L'URL du repository est correcte"
    echo "  - Vous avez les permissions d'écriture"
    echo "  - Le repository existe sur GitHub"
    exit 1
fi

echo ""
echo "🏁 SYNCHRONISATION GLOBALE TERMINÉE"
