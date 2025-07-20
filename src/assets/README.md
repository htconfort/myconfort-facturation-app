# Assets MyComfort

Ce dossier contient les ressources statiques de l'application MyComfort.

## Structure

```
/assets
  /images
    logo-mycomfort.png      # Logo principal
    logo-mycomfort.svg      # Logo vectoriel
    favicon.ico             # Icône du site
  /fonts
    (polices personnalisées si nécessaire)
  /documents
    template-facture.pdf    # Template PDF de base
    conditions-generales.pdf
```

## Logos

### Logo principal
- **Format** : PNG et SVG
- **Taille recommandée** : 200x80px pour PNG
- **Couleurs** : Vert MyComfort (#477A0C) sur fond transparent

### Favicon
- **Format** : ICO, PNG
- **Tailles** : 16x16, 32x32, 48x48px

## Images de stock

Pour les images de démonstration, utiliser :
- **Pexels** : https://www.pexels.com/
- **Unsplash** : https://unsplash.com/
- **Pixabay** : https://pixabay.com/

## Optimisation

- Compresser les images avec TinyPNG
- Utiliser WebP quand possible
- Lazy loading pour les images non critiques

## Usage

```typescript
// Import d'images
import logoMyComfort from '../assets/images/logo-mycomfort.png';

// Dans le composant
<img src={logoMyComfort} alt="MyComfort" className="w-16 h-16" />
```