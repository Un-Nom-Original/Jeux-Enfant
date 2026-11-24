# 🎮 Jeux Enfant

Portail de mini-jeux colorés, ludiques et sans publicité conçu pour les tablettes Android (PWA installable en plein écran et jouable hors-ligne).

## Jeux disponibles

- **🐣 2048** :
  - 4 thèmes sélectionnables depuis le bouton **Paramètres (⚙️)** : *Animaux*, *Fruits & Douceurs*, *Espace* et *Chiffres seuls*.
  - 3 tailles de grille : **3×3 (Facile)**, **4×4 (Classique)** et **5×5 (Grand)**.
  - Bouton **Annuler (Undo)**, sauvegarde automatique par taille de grille, mode infini après 2048, effets sonores joyeux (avec bouton muet) et confettis !

## Installer sur la tablette Android

1. Ouvrez l'URL GitHub Pages dans **Google Chrome** sur la tablette.
2. Appuyez sur le menu `⋮` en haut à droite puis sur **« Ajouter à l'écran d'accueil »** / **« Installer l'application »**.
3. L'icône apparaît sur l'écran d'accueil : le jeu s'ouvre en plein écran et fonctionne même sans connexion Internet.

## Développement local

```bash
npm install
npm run dev
```

Tests unitaires et compilation de production :

```bash
npm test
npm run build
```

## Ajouter un nouveau jeu

1. Créez un dossier `src/games/<nom-du-jeu>/` contenant le composant React du jeu.
2. Enregistrez-le dans `src/games/registry.ts` avec `status: 'ready'`.
3. Il apparaîtra automatiquement dans le menu latéral adaptatif !
