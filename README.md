# Mealer PWA

Planificateur de repas en **Progressive Web App** (Vite, React 19, TypeScript), réécriture web de l'app Expo
(`../Mealer`, inchangée). Aucune dépendance à Expo : un site statique qui s'installe sur l'écran d'accueil et
fonctionne hors ligne.

La PWA a **son propre projet Supabase**, distinct de celui de l'app Expo : comptes créés par l'administrateur,
inscriptions fermées, un seul espace de données partagé par tous les comptes.

## Lancer en local

Prérequis : Node.js ≥ 20.19.

```bash
npm install
npm run dev            # http://localhost:5173, et l'adresse réseau pour tester sur le téléphone
npm run dev:offline    # pareil, mais synchro coupée (.env.offline) : à utiliser pour les tests
```

- `npm run build` : vérifie les types puis génère le site dans `dist/`
- `npm run preview` : sert `dist/` (service worker compris) pour tester le mode hors ligne
- `npm run icons` : régénère les icônes de `public/` à partir de `public/icon.svg`

`npm run dev` utilise les clés du `.env`, donc **la vraie base** : il faut se connecter avec un compte, et tout ce
qui est modifié l'est pour tout le monde. Pour cliquer partout sans conséquence, préférer `npm run dev:offline`
(sans clés, l'app fonctionne en local, sans écran de connexion).

## Installer sur iPhone

Ouvrir l'URL du site dans **Safari** › bouton Partager › **Sur l'écran d'accueil**. L'app s'ouvre ensuite en plein
écran, sans barre Safari, et fonctionne sans réseau.

L'app installée a son propre stockage, séparé de Safari : c'est **dans l'app installée** qu'il faut se connecter.
Le trousseau iCloud propose d'enregistrer le mot de passe ; la session dure ensuite tant qu'on ne se déconnecte pas.

Mises à jour : un nouveau déploiement est pris automatiquement au lancement suivant de l'app.

## Mise en place de Supabase (projet neuf)

1. Créer un projet sur [supabase.com](https://supabase.com) (plan gratuit).
2. **Authentication › Sign In / Providers** : désactiver **Allow new users to sign up** ; laisser
   **Allow anonymous sign-ins** désactivé ; garder le fournisseur **Email** activé.
3. **SQL Editor** › coller le contenu de `supabase/schema.sql` › **Run**.
4. **Authentication › Users › Add user › Create new user** : un compte par personne (e-mail + mot de passe, cocher
   **Auto Confirm User**). Aucun e-mail n'est envoyé : pas besoin de configurer d'envoi d'e-mails.
5. **Project Settings › API Keys** : copier l'URL du projet et la clé *publishable* dans `.env` (modèle :
   `.env.example`) sous `VITE_SUPABASE_URL` et `VITE_SUPABASE_KEY`.

Mot de passe oublié : le changer dans **Authentication › Users** (menu de l'utilisateur). Retirer l'accès à quelqu'un :
supprimer son compte au même endroit. Son jeton de connexion reste valable jusqu'à son expiration (1 h par défaut) ;
ensuite son appareil est déconnecté et efface sa copie des données.

## Sécurité

- **Clés** : seules l'URL et la clé *publishable* vont dans l'app (et dans les secrets du build). Elles sont publiques
  par conception. La clé **secrète** (`sb_secret_…`) ne doit jamais apparaître ni dans `.env`, ni dans le dépôt, ni
  dans les secrets GitHub.
- **Accès** : inscriptions fermées, connexions anonymes désactivées. Les règles RLS de `schema.sql` n'autorisent la
  lecture et l'écriture qu'aux comptes permanents connectés, et refusent toute suppression définitive.
- **Historique** : chaque ancienne valeur est gardée dans `entries_history` (Table Editor), avec la date et l'auteur.
- **Taille** : une valeur ne peut pas dépasser 50 Ko, et seuls les types de données de l'app sont acceptés.
- **Données partagées** : tout ce qui vient du serveur est validé avant affichage (`sanitizeRecipe`), et une erreur
  d'affichage montre un écran de secours au lieu d'une page blanche (`ErrorBoundary`).

## Structure

```
index.html                 balises iOS (plein écran, icône), couleur de fond avant le premier rendu
vite.config.ts             alias @/, manifest et service worker (vite-plugin-pwa), BASE_PATH
pwa-assets.config.ts       génération des icônes
public/                    icon.svg (source) + PNG/ICO générés
src/
  main.tsx                 point d'entrée (+ écran de secours ErrorBoundary)
  App.tsx                  écran de connexion ou onglets (#/search, #/recipes, #/shopping), toast, sheets, dialogue
  styles.css               tout le CSS ; les couleurs sont des variables publiées depuis theme.ts
  screens/                 SignIn, My week, Search, Recipes, Shopping
  components/
    Icon.tsx               icônes (lucide-react)
    ui.tsx                 primitives (Button, Card, Chip, Field, Segmented…)
    Toast.tsx, ConfirmDialog.tsx, ErrorBoundary.tsx
    sheets/                bottom sheets (slot, détail, ajout au plan, nouvelle recette, import JSON, compte)
  data/recipes.ts          icônes de recette, exemple d'import JSON
  lib/helpers.ts           semaine, import JSON, validation des recettes reçues
  lib/supabase.ts          client Supabase (session dans localStorage)
  state/store.tsx          état global + persistance localStorage
  state/cloud.ts           connexion et synchro Supabase
  theme/theme.ts           palettes clair / sombre
  types.ts
supabase/schema.sql        schéma complet du projet Supabase
```

## Synchronisation

- Les données (planning, recettes ajoutées, liste de courses) sont partagées par tous les comptes et mises à jour en
  direct sur chaque appareil. Le thème et les ingrédients de recherche restent propres à chaque appareil.
- **Hors ligne** : l'app fonctionne sur sa copie locale et renvoie les changements au retour du réseau.
- **Déconnexion** : la copie locale est effacée ; elle revient du serveur à la connexion suivante.
- **Rien n'est effacé côté serveur** : une suppression marque la ligne `deleted`, l'ancienne valeur reste dans
  l'historique.

Les clés sont intégrées au moment du build : pour un déploiement automatisé, il faudra les fournir à l'outil de build
(par ex. secrets GitHub Actions).

## Hébergement (GitHub Pages)

Site en ligne : **https://garnier5.github.io/mealer/**

Chaque `git push` sur `main` lance `.github/workflows/deploy.yml`, qui construit le site et le publie (onglet
**Actions** du dépôt pour suivre le déploiement, 1 à 2 minutes). Les téléphones prennent la nouvelle version au
lancement suivant de l'app.

Le build lit deux **secrets du dépôt** (Settings › Secrets and variables › Actions) : `VITE_SUPABASE_URL` et
`VITE_SUPABASE_KEY` (clé *publishable* ; le workflow refuse toute autre clé). Pour changer de projet Supabase, mettre à
jour ces deux secrets (et `.env` en local), puis relancer le workflow.

Le site est 100 % statique et servi sous `/<dépôt>/` (`BASE_PATH`, fourni par le workflow). Le routage par `#` évite
toute configuration de réécriture d'URL côté serveur. Build manuel équivalent : `BASE_PATH=/mealer/ npm run build`.
