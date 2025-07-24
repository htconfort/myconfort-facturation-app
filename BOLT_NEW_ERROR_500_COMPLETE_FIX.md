# GUIDE DE CORRECTION POUR BOLT.NEW - Erreur 500 PDFPreviewModal

## 🚨 PROBLÈMES IDENTIFIÉS

### 1. Erreurs d'imports de dépendances
- `lucide-react` : Version trop récente (0.400.0) incompatible avec Bolt.new
- `html2canvas` : Peut causer des erreurs d'import dans certains environnements
- `jspdf-autotable` : Version 5.0.2 peut être problématique
- `zod` : Version 4.0.5 très récente, peut causer des conflits

### 2. Imports complexes dans PDFPreviewModal
- Services complexes (`advancedPdfService`, `googleDriveService`)
- Dépendances lourdes (`html2canvas`)
- Icônes multiples de `lucide-react`

## 🔧 SOLUTIONS ÉTAPE PAR ÉTAPE

### SOLUTION 1 : Remplacer PDFPreviewModal par la version compatible

1. **Dans Bolt.new, remplacez le contenu de `src/components/PDFPreviewModal.tsx`** par le contenu du fichier `PDFPreviewModal_BOLT_COMPATIBLE.tsx` :

```bash
# Copiez le contenu de PDFPreviewModal_BOLT_COMPATIBLE.tsx
# Cette version évite les imports problématiques et utilise des SVG inline
```

### SOLUTION 2 : Mettre à jour package.json avec des versions compatibles

1. **Remplacez votre `package.json`** par le contenu du fichier `package_BOLT_COMPATIBLE.json` :

```json
{
  "dependencies": {
    "lucide-react": "^0.263.1",  // Version plus stable
    "jspdf-autotable": "^3.8.2", // Version LTS
    "zod": "^3.22.4",            // Version stable
    "signature_pad": "^4.1.7"    // Version compatible
  }
}
```

### SOLUTION 3 : Supprimer les imports problématiques temporairement

Si les solutions précédentes ne fonctionnent pas, **supprimez temporairement** ces lignes du fichier PDFPreviewModal.tsx :

```typescript
// SUPPRIMEZ CES LIGNES :
import { X, Download, Printer, FileText, Share2, Loader, UploadCloud as CloudUpload } from 'lucide-react';
import html2canvas from 'html2canvas';
import { AdvancedPDFService } from '../services/advancedPdfService';
import { GoogleDriveService } from '../services/googleDriveService';
```

**Et remplacez-les par :**

```typescript
// Version sans dépendances externes
import React, { useState } from 'react';
import { InvoicePreview } from './InvoicePreview';
import { Invoice } from '../types';
```

## 🎯 ÉTAPES DE DÉBOGAGE DANS BOLT.NEW

### 1. Vérifier les erreurs de console
```javascript
// Ouvrez la console du navigateur (F12)
// Recherchez les erreurs spécifiques :
// - "Cannot resolve module"
// - "Unexpected token"
// - "Module not found"
```

### 2. Vérifier les imports manquants
```bash
# Dans le terminal de Bolt.new :
npm install
# ou
npm install --force
```

### 3. Redémarrer le serveur de développement
```bash
# Ctrl+C pour arrêter
# Puis relancer :
npm run dev
```

## 🔍 DIAGNOSTIC AVANCÉ

### Si l'erreur 500 persiste :

1. **Vérifiez les types TypeScript** :
```typescript
// Assurez-vous que tous les types sont bien définis dans src/types/index.ts
export interface Invoice {
  // ... structure plate comme définie
}
```

2. **Vérifiez l'import dans App.tsx** :
```typescript
// Doit être un import par défaut :
import PDFPreviewModal from './components/PDFPreviewModal';
// PAS un import nommé :
// import { PDFPreviewModal } from './components/PDFPreviewModal';
```

3. **Vérifiez l'export dans PDFPreviewModal.tsx** :
```typescript
// À la fin du fichier :
export default PDFPreviewModal;
// PAS :
// export { PDFPreviewModal };
```

## 🚀 VERSION MINIMALE DE SECOURS

Si rien ne fonctionne, voici une version ultra-minimale de PDFPreviewModal :

```typescript
import React from 'react';
import { InvoicePreview } from './InvoicePreview';
import { Invoice } from '../types';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onDownload: () => void;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onDownload
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Aperçu Facture</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <div className="p-4">
          <button onClick={onDownload} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">
            Télécharger PDF
          </button>
          <InvoicePreview invoice={invoice} />
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
```

## ✅ VÉRIFICATION FINALE

1. **L'application se charge** sans erreur 500
2. **Le modal s'ouvre** quand on clique sur "Aperçu"
3. **Les boutons fonctionnent** (même s'ils sont simplifiés)
4. **Aucune erreur de console** dans le navigateur

## 📝 NOTES IMPORTANTES

- Ces solutions privilégient la **compatibilité** sur les fonctionnalités avancées
- Une fois l'application fonctionnelle, vous pourrez réintroduire progressivement les fonctionnalités
- Testez chaque modification individuellement dans Bolt.new
- Gardez une sauvegarde de votre version complète sur GitHub

---

*Guide créé pour résoudre les erreurs d'import et de compilation dans Bolt.new*
