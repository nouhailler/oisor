# 📜 CHANGELOG — Oiseaux de France

Toutes les modifications notables apportées au projet **Oiseaux de France** seront consignées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Gestion de Version Sémantique](https://semver.org/lang/fr/).

## [1.1.0] - 2026-08-21

### ✨ Ajouté
- **Guide & Explorateur « Oiseaux par Famille » (`FamilyExplorer.tsx`) :**
  - Nouvel onglet de navigation dédié à la classification des oiseaux par grands groupes : **Rapaces**, **Hirondelles et martinets**, **Passereaux**, **Oiseaux d'eau**, **Oiseaux marins**, **Échassiers**, **Oiseaux de montagne**, **Pics & Corvidés**.
  - Filtre dynamique par groupe dans le Catalogue général.
- **Guide & Explorateur « Oiseaux par Région » (`RegionExplorer.tsx`) :**
  - Nouvel onglet de navigation dédié à la faune aviaire par région métropolitaine (Auvergne-Rhône-Alpes, Bretagne, Île-de-France...).
- **Extension Majeure de la Base de Données Ornithologique (`birds.json`) :**
  - Base enrichie à **44 espèces** emblématiques avec l'ajout de l'Aigle de Bonelli, Balbuzard pêcheur, Buse variable, Milan noir, Hirondelle de fenêtre, Hirondelle de rivage, Martinet à ventre blanc, Grive musicienne, Cygne tuberculé, Foulque macroule, Grèbe huppé, Grande Aigrette, Puffin des Baléares, Cigogne blanche, Cigogne noire, Spatule blanche, Ibis falcinelle, etc.

---

## [1.0.0] - 2026-08-10

### ✨ Ajouté
- **Clé de Détermination Visuelle Pas-à-Pas (Wizard) :**
  - Moteur interactif d'identification basé sur 4 étapes : Taille, Pastilles de couleurs, Forme du bec, et Habitat.
  - Algorithme de calcul du score de correspondance dynamique (`95% match`) avec tri automatique par pertinence.
- **Catalogue Général & Recherche Instantanée :**
  - Barre de recherche textuelle réactive sur les noms communs, latins, familles et descriptions.
  - Filtres par milieux (habitats) et familles taxonomiques.
  - Bascule de mise en page entre **Vue Grille** et **Vue Liste**.
- **Fiche Espèce Détaillée :**
  - Visionneuse d'image avec support *lazy loading*, illustration vectorielle SVG de secours, et mode zoom photo HD.
  - Fiche synthétique complète : mensurations, envergure, habitats, périodes de présence, régime alimentaire.
  - Section **Confusions possibles** proposant des fiches d'espèces similaires navigables en 1 clic.
  - Raccourci d'action direct "Ajouter à mes observations".
- **Carnet d'Observation Personnel (100% Local) :**
  - Formulaire de saisie d'observation (espèce, date, heure, lieu, comptage d'individus, notes).
  - Bouton de **Géolocalisation GPS automatique** via l'API `navigator.geolocation`.
  - Persistence locale sécurisée et Haute Capacité via **IndexedDB** couplé à l'**OPFS (Origin Private File System)** et l'**API Web Cache Storage**, supprimant la limite de 5 Mo du LocalStorage.
  - Affichage en temps réel de la consommation du quota de stockage de l'appareil (`navigator.storage.estimate()`).
  - Module d'**Exportation** au format **JSON** et **CSV** (Excel).
  - Module d'**Importation** de sauvegardes JSON.
- **Menu d'Importation & Gabarits JSON :**
  - Interface dédiée documentant la structure complète du **Gabarit JSON attendu** pour les espèces d'oiseaux et les observations.
  - Boutons d'action "Copier le gabarit" et "Télécharger le modèle .json".
  - Zone d'importation par glisser-déposer de fichier `.json` ou par copier-coller de texte.
  - Prise en charge de l'ajout d'espèces personnalisées directement dans le catalogue et IndexedDB.
- **Optimisation PWA & Hors-Ligne :**
  - Service Worker (`sw.js`) avec stratégie de cache *Stale-While-Revalidate* pour les actifs/JSON et *Cache-First* pour les images.
  - Manifest PWA (`manifest.json`) avec nom, couleur de thème (`#0d9488`), mode standalone et icônes 192x192 et 512x512.
  - Bouton/Bannière d'incitation à l'installation PWA sur mobile et desktop.
  - Indicateur visuel d'état réseau en temps réel (**En Ligne** / **Hors-Ligne**).
- **Déploiement Netlify :**
  - Fichier `netlify.toml` configuré avec commande de build (`npm run build`), dossier de publication (`dist`), réécriture SPA (`/*` -> `/index.html`), et en-têtes HTTP de cache pour `sw.js`.
