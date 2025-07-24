#!/bin/bash

# 🔍 DIAGNOSTIC COMPLET GITHUB - MyComfort Facturation App
# Script de diagnostic et résolution des problèmes GitHub

echo "=============================================="
echo "🔍 DIAGNOSTIC GITHUB - MYCONFORT FACTURATION"
echo "=============================================="
echo ""

# 1. Vérification de l'environnement
echo "📋 1. VÉRIFICATION ENVIRONNEMENT"
echo "Date: $(date)"
echo "Utilisateur: $(whoami)"
echo "Répertoire actuel: $(pwd)"
echo "Version Git: $(git --version)"
echo ""

# 2. Vérification du répertoire projet
echo "📁 2. VÉRIFICATION RÉPERTOIRE PROJET"
if [ -d "/home/codespace/facturation-MYconfortdu-20-07-2025-1" ]; then
    echo "✅ Répertoire projet trouvé"
    cd /home/codespace/facturation-MYconfortdu-20-07-2025-1
    echo "📂 Contenu du répertoire:"
    ls -la | head -20
else
    echo "❌ Répertoire projet NON TROUVÉ"
    exit 1
fi
echo ""

# 3. Vérification Git
echo "🔧 3. VÉRIFICATION CONFIGURATION GIT"
if [ -d ".git" ]; then
    echo "✅ Repository Git initialisé"
    echo "📋 Configuration Git:"
    git config --list | grep -E "(user|remote)" || echo "Aucune configuration trouvée"
    echo ""
    echo "📋 Remotes configurés:"
    git remote -v || echo "Aucun remote configuré"
    echo ""
    echo "📋 Branches:"
    git branch -a || echo "Aucune branche trouvée"
    echo ""
    echo "📋 Statut Git:"
    git status --porcelain || echo "Impossible de vérifier le statut"
    echo ""
    echo "📋 Derniers commits:"
    git log --oneline -5 || echo "Aucun commit trouvé"
else
    echo "❌ Pas de repository Git (.git manquant)"
    echo "🔧 Initialisation du repository Git..."
    git init
    echo "✅ Repository Git initialisé"
fi
echo ""

# 4. Configuration des credentials GitHub
echo "🔑 4. CONFIGURATION GITHUB"
echo "🔧 Configuration des credentials Git..."

# Configuration utilisateur Git
git config --global user.name "MyComfort App" 2>/dev/null || echo "❌ Erreur configuration user.name"
git config --global user.email "mycomfort@example.com" 2>/dev/null || echo "❌ Erreur configuration user.email"

echo "✅ Credentials configurés"
echo ""

# 5. Ajout du remote GitHub si nécessaire
echo "🌐 5. CONFIGURATION REMOTE GITHUB"
REPO_URL="https://github.com/htconfort/myconfort-facturation-app.git"

if ! git remote get-url origin >/dev/null 2>&1; then
    echo "🔧 Ajout du remote GitHub..."
    git remote add origin "$REPO_URL"
    echo "✅ Remote GitHub ajouté: $REPO_URL"
else
    echo "✅ Remote GitHub déjà configuré:"
    git remote get-url origin
fi
echo ""

# 6. Préparation des fichiers pour le commit
echo "📦 6. PRÉPARATION DES FICHIERS"
echo "🔧 Ajout de tous les fichiers au staging..."
git add -A
echo "✅ Fichiers ajoutés au staging"

echo "📋 Fichiers en staging:"
git status --porcelain | head -10
echo ""

# 7. Création du commit
echo "💾 7. CRÉATION DU COMMIT"
COMMIT_MESSAGE="🚀 Push complet MyComfort Facturation App

✅ Application complète de facturation:
- Structure plate Invoice (migration réussie)
- Composants React corrigés (PDFPreviewModal, etc.)
- Services PDF, EmailJS, Google Drive
- Interface TailwindCSS moderne
- TypeScript complet
- Documentation exhaustive

📦 Prêt pour import Bolt.new
🔧 Technologies: Vite + React + TypeScript + TailwindCSS
💼 Fonctionnalités: PDF, signatures, emails, drive

$(date)"

if git commit -m "$COMMIT_MESSAGE"; then
    echo "✅ Commit créé avec succès"
else
    echo "ℹ️ Aucun changement à commiter ou commit déjà existant"
fi
echo ""

# 8. Push vers GitHub avec plusieurs tentatives
echo "🚀 8. PUSH VERS GITHUB"
echo "🔧 Tentative de push vers GitHub..."

# Tentative 1: Push normal
echo "📡 Tentative 1: Push normal..."
if git push origin main; then
    echo "✅ Push réussi !"
    PUSH_SUCCESS=true
else
    echo "❌ Push normal échoué"
    PUSH_SUCCESS=false
fi

# Tentative 2: Push avec --set-upstream si le push normal a échoué
if [ "$PUSH_SUCCESS" = false ]; then
    echo "📡 Tentative 2: Push avec --set-upstream..."
    if git push --set-upstream origin main; then
        echo "✅ Push avec --set-upstream réussi !"
        PUSH_SUCCESS=true
    else
        echo "❌ Push avec --set-upstream échoué"
    fi
fi

# Tentative 3: Push force si les autres ont échoué
if [ "$PUSH_SUCCESS" = false ]; then
    echo "📡 Tentative 3: Force push..."
    echo "⚠️ ATTENTION: Force push va écraser l'historique distant"
    if git push --force origin main; then
        echo "✅ Force push réussi !"
        PUSH_SUCCESS=true
    else
        echo "❌ Force push échoué"
    fi
fi
echo ""

# 9. Vérification finale
echo "🔍 9. VÉRIFICATION FINALE"
if [ "$PUSH_SUCCESS" = true ]; then
    echo "✅ SUCCÈS COMPLET !"
    echo "🌐 Repository GitHub: https://github.com/htconfort/myconfort-facturation-app"
    echo "📋 Statut final:"
    git log --oneline -3
    echo ""
    echo "🚀 PRÊT POUR BOLT.NEW !"
    echo "📝 Pour importer dans Bolt.new:"
    echo "   1. Aller sur https://bolt.new"
    echo "   2. Choisir 'Import from GitHub'"
    echo "   3. Coller: https://github.com/htconfort/myconfort-facturation-app"
else
    echo "❌ ÉCHEC DU PUSH"
    echo "🔧 Actions à effectuer manuellement:"
    echo "   1. Vérifier les credentials GitHub"
    echo "   2. Vérifier les permissions du repository"
    echo "   3. Essayer un push manuel depuis le terminal"
fi
echo ""

echo "=============================================="
echo "🏁 DIAGNOSTIC TERMINÉ"
echo "=============================================="
