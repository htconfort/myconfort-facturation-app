# 📋 COMMANDES GIT À COPIER-COLLER UNE PAR UNE

## 🎯 RÉSOLUTION PROBLÈME GITHUB - MyComfort Facturation App

### 1. Navigation vers le projet
```bash
cd /home/codespace/facturation-MYconfortdu-20-07-2025-1
```

### 2. Vérification de l'état actuel
```bash
pwd
ls -la
```

### 3. Configuration Git
```bash
git config --global user.name "MyComfort App"
git config --global user.email "mycomfort@example.com"
```

### 4. Re-initialisation propre (optionnel si problème)
```bash
rm -rf .git
git init
git branch -M main
```

### 5. Ajout du remote GitHub
```bash
git remote add origin https://github.com/htconfort/myconfort-facturation-app.git
```

### 6. Vérification du remote
```bash
git remote -v
```

### 7. Ajout de tous les fichiers
```bash
git add -A
```

### 8. Vérification des fichiers ajoutés
```bash
git status
```

### 9. Création du commit
```bash
git commit -m "🚀 MyComfort Facturation App - Version finale complète

✅ Application complète de facturation:
- Interface React moderne avec TailwindCSS  
- Génération PDF automatique avec signatures
- Intégration EmailJS et Google Drive
- Structure TypeScript complète
- 50+ fichiers de code et documentation

📦 Prêt pour import dans Bolt.new
🔧 Technologies: Vite + React + TypeScript + TailwindCSS"
```

### 10. Push vers GitHub (FORCE)
```bash
git push --force --set-upstream origin main
```

### 11. Vérification finale
```bash
git log --oneline -3
```

## 🌐 VÉRIFICATION FINALE

Après avoir exécuté ces commandes, allez sur :
**https://github.com/htconfort/myconfort-facturation-app**

Vous devriez voir tous les fichiers du projet !

## 🚀 IMPORT DANS BOLT.NEW

Une fois le repository visible sur GitHub :
1. Aller sur **https://bolt.new**
2. Choisir **"Import from GitHub"** 
3. Coller l'URL : `https://github.com/htconfort/myconfort-facturation-app`
4. L'application sera automatiquement importée et déployée !

---

## ⚠️ SI LES COMMANDES NE FONCTIONNENT PAS

### Alternative 1: Nouveau terminal
1. Ouvrir un **nouveau terminal** dans VSCode
2. Essayer les commandes une par une

### Alternative 2: Nouveau repository
1. Créer un nouveau repository sur GitHub
2. Nommer le : `myconfort-facturation-final`
3. Utiliser la nouvelle URL dans les commandes

### Alternative 3: Upload manuel
1. Télécharger tous les fichiers du workspace
2. Créer un nouveau repository sur GitHub
3. Upload via l'interface web GitHub

---

**🎯 OBJECTIF : Avoir le code visible sur GitHub pour l'import dans Bolt.new**
