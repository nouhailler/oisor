# 📌 CONTEXT.md — Application "Oiseaux de France"

## 1. Contexte du Projet & Objectif

L'application **Oiseaux de France** a été conçue pour répondre à un besoin précis des ornithologues amateurs, passionnés de nature et randonneurs : disposer d'un outil d'identification et de suivi des oiseaux de France métropolitaine **100 % autonome et fonctionnel sur le terrain, même en l'absence de réseau cellulaire ou Internet**.

## 2. Principes Fondateurs & Choix d'Architecture

### 🛡️ 1. Architecture Zero-Backend (Client-Side Only)
- Aucun serveur backend centralisé n'est requis.
- L'ensemble du moteur de calcul (algorithme de détermination visuelle), la base de données statiques (`birds.json`), et la base de données utilisateur (carnet d'observations) s'exécutent au sein du navigateur du client.
- Garantit la souveraineté totale et la confidentialité des données de l'utilisateur (aucune observation n'est envoyée vers un serveur tiers).

### 📱 2. Stratégie PWA & Offline-First
- L'application est enregistrée en tant que **Progressive Web App (PWA)** grâce à un Service Worker natif (`public/sw.js`) et un fichier de manifeste W3C (`public/manifest.json`).
- Lors de la première visite avec connexion, l'ensemble des fichiers HTML, JS, CSS, JSON et visuels sont mis en cache.
- Lors des visites ultérieures, l'application démarre instantanément en mode hors-ligne sans aucune dépendance réseau.

### 💾 3. Modèle de Stockage Persistant Haute Capacité (IndexedDB + OPFS + Cache Storage)
- Les observations saisies sur le terrain sont stockées en priorité dans l'API **IndexedDB** du navigateur via la bibliothèque `idb`.
- En cas d'indisponibilité ou d'erreur sur IndexedDB (modes de navigation ultra-stricts), l'application bascule automatiquement sur un moteur de secours à haute capacité s'appuyant sur l'**OPFS (Origin Private File System)** via `navigator.storage.getDirectory()` et l'**API Web Cache Storage**.
- Ce choix technique écarte complètement la limite de 5 Mo imposée par `localStorage` et permet de stocker sans risque des milliers d'observations, données GPS précises, photos et enregistrements sonores (quota d'origine de plusieurs Gigaoctets).
- L'utilisateur possède un suivi en temps réel de l'espace occupé via `navigator.storage.estimate()` ainsi qu'un contrôle total via les fonctions d'exportation (JSON / CSV) et d'importation.

### 🎨 4. Design & Ergonomie Modernes
- Développement avec **Tailwind CSS v4** et **React 18**.
- Thème sombre épuré inspiré de la nature (couleurs d'ardoise, teintes vert émeraude et cyan), effet de verre dépoli (*glassmorphism*), typographie soignée et micro-animations.
- Composants entièrement adaptés aux écrans mobiles (smartphones) et de bureau (tablettes/desktop).

## 3. Structure Générale des Modules

```
oisor/
├── public/
│   ├── data/
│   │   └── birds.json            # Base de données initiale des espèces
│   ├── assets/images/birds/       # Illustrations et photographies des oiseaux
│   ├── icons/                     # Icônes PWA (192x192 et 512x512)
│   ├── manifest.json              # Fichier de manifeste PWA
│   └── sw.js                      # Service Worker (Stratégie Offline)
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Barre de navigation et statut réseau
│   │   ├── IdentificationWizard.tsx # Clé de détermination pas-à-pas
│   │   ├── Catalog.tsx            # Recherche et liste du catalogue
│   │   ├── SpeciesDetailModal.tsx # Fiche complète espèce & confusions
│   │   ├── ObservationNotebook.tsx # Carnet d'observations local & GPS
│   │   ├── ImportModal.tsx        # Menu d'importation & gabarit JSON
│   │   ├── BirdImage.tsx          # Composant image avec fallback SVG
│   │   └── OfflineBanner.tsx      # Bannière d'avertissement mode hors-ligne
│   ├── services/
│   │   ├── db.ts                  # Service IndexedDB & export/import JSON/CSV
│   │   └── pwaService.ts          # Hooks PWA (installation & online/offline)
│   ├── types/
│   │   └── bird.ts                # Interfaces TypeScript (Bird, Observation)
│   ├── App.tsx                    # Composant racine et gestion des états
│   ├── main.tsx                   # Point d'entrée React & enregistrement SW
│   └── index.css                  # Directives Tailwind CSS & scrollbars
├── netlify.toml                   # Configuration de déploiement Netlify
├── README.md                      # Documentation globale
├── CONTEXT.md                     # Contexte d'architecture (ce fichier)
└── CHANGELOG.md                   # Historique des versions
```
