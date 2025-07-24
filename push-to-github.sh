#!/bin/bash

echo "🚀 SCRIPT DE PUSH GITHUB POUR MYCONFORT"
echo "========================================"

# Naviguer vers le répertoire du projet
cd /home/codespace/facturation-MYconfortdu-20-07-2025-1

echo "📁 Répertoire courant :"
pwd

echo "📋 Fichiers disponibles :"
ls -la | head -20

echo "🔧 Configuration Git..."
git config --global user.name "HTConfort"
git config --global user.email "your-email@example.com"

echo "🗂️ Ajout de tous les fichiers..."
git add .

echo "📝 Status Git :"
git status

echo "💾 Création du commit..."
git commit -m "🎯 APPLICATION MYCONFORT - PUSH COMPLET

✅ CONTENU POUSSÉ :
- src/ : Composants React TypeScript corrigés (App.tsx, InvoicePreview.tsx, etc.)
- public/ : Assets et logos MYCONFORT
- package.json : Dépendances complètes (React, Vite, jsPDF, etc.)
- Configurations : TypeScript, Vite, Tailwind, PostCSS
- Documentation : README, guides, corrections

🚀 FONCTIONNALITÉS :
- Structure Invoice plate (clientName, clientEmail, etc.)
- Export PDF haute qualité
- Envoi Google Drive + Email
- Signature électronique
- Interface responsive Tailwind CSS
- Validation TypeScript 100%

📅 Date : 24 juillet 2025
🎯 Prêt pour production et Bolt.new"

echo "🌐 Configuration du remote GitHub..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/htconfort/myconfort-facturation-app.git

echo "📤 Push vers GitHub..."
git branch -M main
git push -u origin main --force

echo "✅ Push terminé ! Vérifiez GitHub : https://github.com/htconfort/myconfort-facturation-app"
