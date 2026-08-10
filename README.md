# 🐦 Oiseaux de France — Progressive Web App (PWA)

[![Netlify Status](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=flat-square&logo=netlify)](https://www.netlify.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline-0d9488?style=flat-square&logo=pwa)](https://developer.mozilla.org/fr/docs/Web/Progressive_web_apps)
[![Zero Backend](https://img.shields.io/badge/Backend-Zero%20(Client--side)-emerald?style=flat-square)](https://indexeddb.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

**Oiseaux de France** est une Progressive Web App (PWA) d'inventaire, de clé d'identification visuelle et de carnet de terrain pour les oiseaux de France métropolitaine. Elle fonctionne à **100 % côté client (sans backend)**, est totalement autonome et **hors-ligne** après le premier chargement, et est prête à être déployée sur Netlify.

---

## ✨ Fonctionnalités Principales

### 🧭 1. Clé de Détermination Visuelle Pas-à-Pas (Wizard)
- Assistant interactif guidant l'utilisateur pour identifier un oiseau observé en 4 critères combinables :
  - **Taille estimée** (Très petit <15cm, Petit 15-25cm, Moyen 25-45cm, Grand 45-70cm, Très grand >70cm).
  - **Couleurs principales** (Sélection visuelle par pastilles de couleurs).
  - **Forme du bec** (Court & fin, Conique/Épais, Crochu, Long & poignard, Plat & large).
  - **Habitat d'observation** (Jardins, Forêts, Champs, Zones humides, Littoral, Villes, Montagnes).
- **Algorithme de calcul de score de correspondance** en temps réel triant instantanément les candidats avec affichage du pourcentage de match (`95% match`).

### 📚 2. Catalogue Général & Recherche Instantanée
- Moteur de recherche textuel ultra-réactif sur les nom communs, noms latins, familles et descriptions.
- Filtrage rapide par milieu (habitat) et par famille taxonomique.
- Modes de visualisation au choix : **Vue Grille** ou **Vue Liste**.

### 📖 3. Fiches Espèces Détaillées
- Visuels optimisés avec chargement différé (*lazy loading*), illustration vectorielle SVG de secours, et visionneuse photo HD plein écran.
- Fiche de synthèse : mensurations (taille et envergure), habitats, période de présence (sédentaire, nicheur, hivernant), régime alimentaire.
- Section **"Confusions possibles"** redirigeant directement vers les espèces proches du catalogue.
- Bouton d'action direct **"Ajouter à mes observations"**.

### 📝 4. Carnet d'Observation Personnel (100% Local)
- Formulaire de saisie d'observation avec :
  - Date, heure, nombre d'individus et notes de terrain.
  - **Géolocalisation GPS automatique** via l'API navigateur `navigator.geolocation`.
- **Stockage 100% privé et persistant** sur l'appareil via **IndexedDB** (avec secours LocalStorage).
- Module d'**Exportation** au format **JSON** et **CSV** (Excel).
- Module d'**Importation** pour restaurer des sauvegardes d'observations.

### 📄 5. Menu d'Importation & Gabarits JSON (Espèces & Observations)
- Interface dédiée documentant la **structure précise du Gabarit JSON attendu** pour importer de nouvelles espèces ou des observations.
- Bouton **"Copier le gabarit"** en 1 clic et **"Télécharger le modèle .json"**.
- Importation directe par glisser-déposer de fichier `.json` ou par copier-coller du texte JSON avec validation de schéma.

### 📶 6. PWA & Fonctionnement 100% Hors-Ligne
- **Service Worker (`sw.js`)** utilisant la stratégie *Stale-While-Revalidate* pour le code et *Cache-First* pour les médias.
- Indicateur visuel d'état réseau en temps réel (**En Ligne** / **Hors-Ligne**).
- Fichier `manifest.json` complet permettant l'installation directe sur smartphone (Android/iOS) et ordinateur.

---

## 📋 Gabarits JSON Attendus

### Gabarit 1 : Import d'une Espèce d'Oiseau (`birds.json`)

> 📸 **Note importante concernant les images :** Il est recommandé d'utiliser des liens d'images **libres de droit** hébergées sur des plateformes ouvertes comme **Wikimedia Commons** ou **Wikipédia** (ex: `https://upload.wikimedia.org/...`).

```json
[
  {
    "id": "grosbec-casse-noyaux",
    "name_common": "Grosbec casse-noyaux",
    "name_latin": "Coccothraustes coccothraustes",
    "family": "Fringillidae",
    "habitat": ["Forêts", "Jardins", "Vergers"],
    "size_category": "petit",
    "size_cm": "16-18 cm",
    "main_colors": ["brun", "orange", "gris", "noir"],
    "beak_type": "conique",
    "wingspan_cm": "29-33 cm",
    "seasons": ["toute-annee"],
    "description": "Passereau massif au bec triangulaire extrêmement puissant capable d'écraser des noyaux de cerises.",
    "diet": "Granivore & graines dures",
    "similar_species": ["chardonneret-elegant"],
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Erithacus_rubecula_with_cocked_head.jpg/800px-Erithacus_rubecula_with_cocked_head.jpg"
  }
]
```

### Gabarit 2 : Import d'Observations (`observations.json`)

```json
[
  {
    "id": "obs_1723456789012_a1b2",
    "bird_id": "rouge-gorge-familier",
    "bird_name": "Rouge-gorge familier",
    "bird_latin": "Erithacus rubecula",
    "date": "2026-08-10",
    "time": "14:30",
    "location": "Jardin des Tuileries, Paris",
    "coordinates": {
      "latitude": 48.8635,
      "longitude": 2.3275
    },
    "count": 2,
    "notes": "Aperçu au sol près d'une haie, chant très clair.",
    "created_at": 1723456789012
  }
]
```

---

## 🛠️ Stack Technique

- **Framework Web :** [React 18](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Bundler :** [Vite 6](https://vitejs.dev/)
- **Styling :** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icônes :** [Lucide React](https://lucide.dev/)
- **Stockage Client :** [IndexedDB (via library idb)](https://github.com/jakearchibald/idb) + LocalStorage
- **Service Worker & PWA :** Service Worker natif ES6+ & Manifest W3C
- **Hébergement :** Configuré pour [Netlify](https://www.netlify.com/) (`netlify.toml`)

---

## 🚀 Installation & Développement Local

### Prérequis
- Node.js v18+ et npm v9+

### Commande d'installation
```bash
# Cloner le dépôt
git clone https://github.com/nouhailler/oisor.git
cd oisor

# Installer les dépendances
npm install

# Lancer le serveur de développement local
npm run dev
```

Ouvrez ensuite votre navigateur sur `http://localhost:3000`.

### Compilation Production
```bash
npm run build
```
Les fichiers statiques optimisés seront générés dans le dossier `dist/`.

---

## 🌐 Déploiement sur Netlify

Le fichier [`netlify.toml`](file:///home/homardsheriff/gemini-workspace/oisor/netlify.toml) présent à la racine est déjà préconfiguré :

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/sw.js"
    [headers.values]
      Cache-Control = "no-cache, no-store, must-revalidate"
```

1. Poussez votre code sur GitHub : `https://github.com/nouhailler/oisor`
2. Sur **Netlify**, cliquez sur **"Add new site"** > **"Import an existing project"**.
3. Sélectionnez le dépôt `oisor`. Netlify appliquera automatiquement la commande de build `npm run build` et le dossier de publication `dist`.

---

## 📄 Licence

Ce projet est sous licence MIT.
