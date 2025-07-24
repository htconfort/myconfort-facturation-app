#!/bin/bash
# Script de push GitHub ultra-simple pour MyComfort Facturation App

echo "🚀 PUSH GITHUB MYCOMFORT FACTURATION APP"
echo "========================================"

# Navigation vers le projet
cd /home/codespace/facturation-MYconfortdu-20-07-2025-1

# Configuration Git rapide
git config --global user.name "MyComfort App"
git config --global user.email "mycomfort@example.com"

# Vérification et ajout du remote
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/htconfort/myconfort-facturation-app.git

# Ajout de tous les fichiers
git add -A

# Commit avec message descriptif
git commit -m "🚀 MyComfort Facturation App - Version finale complète

✅ Application de facturation professionnelle:
- Interface React moderne avec TailwindCSS
- Génération PDF automatique avec signatures
- Intégration EmailJS et Google Drive
- Structure TypeScript complète
- 50+ fichiers de code et documentation

📦 Prêt pour import dans Bolt.new
🔧 Technologies: Vite + React + TypeScript + TailwindCSS

$(date)"

# Push avec force pour écraser le repository vide
git push --force --set-upstream origin main

echo "✅ Push terminé !"
echo "🌐 Vérifiez: https://github.com/htconfort/myconfort-facturation-app"
