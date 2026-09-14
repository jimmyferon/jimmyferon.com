# CLAUDE.md

Instructions pour Claude Code sur ce dépôt.

## Langue

**Réponds toujours en français**, y compris dans les messages de commit, les
descriptions de PR et les commentaires de code.

## Règles de travail

### Ne jamais toucher au Preloader

`components/Preloader.js` **ne doit jamais être modifié**. Le compteur de trois
secondes, les six mots qui défilent et la barre de progression sont un choix de
design assumé, pas un reliquat à optimiser.

Cela vaut aussi pour ce qui le sert indirectement : la police Chopin
(`.pre-word`) et son préchargement existent pour lui. Une modification qui
changerait son apparence — même sans éditer le fichier — doit être signalée
avant, pas découverte après.

### Jamais de push direct sur `main`

`main` est protégée et déclenche le déploiement de production. Le circuit est
toujours le même :

1. une branche dédiée ;
2. des commits séparés par sujet ;
3. une PR, poussée mais **jamais fusionnée** par Claude ;
4. Jimmy vérifie la preview Vercel, puis fusionne lui-même.

Après fusion : revenir sur `main`, `git pull`, supprimer la branche locale — et
la distante seulement si c'est demandé, GitHub la supprimant souvent tout seul.

### Un chantier par branche

Une branche, un sujet. Ne pas mélanger une montée de version avec une correction
de bug ou un allègement de bundle : les régressions deviennent impossibles à
isoler, et la preview ne dit plus laquelle des deux choses a cassé.

Si un problème sans rapport est découvert en chemin, le signaler et le traiter
séparément plutôt que de l'embarquer.

### Tout changement visuel se valide avant

Pour toute modification susceptible de changer le rendu — CSS, police, mise en
page, animation, montée de version qui change le bundler — **montrer le
diagnostic et la correction envisagée avant de modifier**, et attendre l'accord.

Ce qui rend un diagnostic recevable ici : des mesures, pas des suppositions.
Comparer les CSS produits avant et après, lire le style calculé dans le
navigateur, capturer une référence visuelle avant de toucher au code.

### Déploiement

Le site est en production sur **[jimmyferon.com](https://jimmyferon.com)**,
déployé automatiquement par Vercel depuis `main`. Chaque PR génère une preview :
c'est là que se vérifie un changement visuel, pas seulement en local.

Projet Vercel `portfolio-next`, Node 24 (aligné dans `.nvmrc`).

## Le projet

Portfolio de Jimmy Feron, brand designer & UI/UX. Next.js App Router, React,
Three.js pour les scènes WebGL, CSS natif sans framework, aucune dépendance
d'interface — chaque composant est écrit à la main.

```
app/         Routes (App Router), layout, globals.css, sitemap, robots
components/  Une section ou un effet par fichier
lib/         Traductions, données de projets, contexte de langue, hooks
data/        evmarks.json — les six sommets de la scène Everest
public/      Images, CV, polices, et les trois jeux de relief chargés à la demande
```

Trois scènes WebGL chargent leur relief depuis `public/` par `fetch` :
`evdata.json` (Everest), `mbdata.json` (Mont Blanc), `lacdata.json` (lac d'Allos).
Elles dépendent donc d'un dossier `public/` complet au déploiement — si un
fichier manque, la section garde sa mise en page et perd son rendu 3D, sans
erreur visible.

Three.js est chargé depuis cdnjs en **r128**, épinglé, via un marqueur
`script[data-three]` partagé pour ne pas le télécharger plusieurs fois.

## État actuel

Versions : **Next 16.3.5**, **React / React-DOM 19.3.0**, `@vercel/analytics`
1.6.1, Node 24. `npm audit` : 0 vulnérabilité.

Turbopack est le bundler par défaut depuis la v16 et remplace webpack. Le CSS
passe donc par **Lightning CSS** et non plus Autoprefixer — voir le piège des
préfixes plus bas.

Quatre chantiers fusionnés le 14/09/2026 :

- **PR #11** — mise sous git, `package-lock.json`, fins de ligne LF, fusion des
  deux `<head>` de `RootLayout`, `.nvmrc` aligné sur Node 24.
- **PR #12** — allègement du chemin critique. Police Chopin sortie du base64 et
  servie en woff2, reliefs chargés à la demande. CSS render-bloquant 100 622 →
  15 994 o gzippés, route `/` 132 → 21,8 kB, First Load JS 232 → 122 kB.
- **PR #13** — montée Next 14 → 16 et React 18 → 19, plus deux régressions
  corrigées après vérification sur la preview (voir ci-dessous).

### Deux pièges rencontrés, à ne pas réintroduire

**Préfixes CSS écrits à la main.** Lightning CSS déduplique les paires
préfixe/standard en gardant la **dernière** déclaration. Écrire
`backdrop-filter:…;-webkit-backdrop-filter:…;` fait disparaître la propriété
standard du build, et Chrome 153 ayant retiré l'alias `-webkit-`, le flou
disparaît partout. **Ne pas écrire de préfixes à la main** : c'est le travail de
l'outil, qui les ajoute selon les cibles.

**Scroll fluide au changement de route.** `globals.css` pose
`html{scroll-behavior:smooth}`. Next 16 ne neutralise plus ce comportement
pendant une navigation sans l'opt-in `data-scroll-behavior="smooth"` sur
`<html>`, présent dans `app/layout.js`. **Ne pas retirer cet attribut** : sans
lui, une navigation depuis une page défilée fait remonter la nouvelle page en
s'animant, et le rideau de `Veil.js` se relève avant la fin.

## Chantiers restants

- **`/work` et `/about` sont des pages « en construction »** — les deux rendent
  le bloc `uc-title` (« Sentier fermé, ça déneige »). C'est le chantier de fond.
- **Le README est décalé** depuis la montée de version : badges Next 14 et
  React 18, « Node 18.17 ou plus récent », et `data/` décrit comme contenant les
  données d'élévation, qui sont désormais dans `public/`.
- **`@vercel/analytics` 1.6.1 → 2.0.1** disponible. Ce n'est pas une faille ; la
  contrainte `^1.4.0` de `package.json` bloque le passage en majeure, dont les
  implications n'ont pas été évaluées.
- **Pas de lint.** `next lint` a été supprimé en v16 et le script retiré. ESLint
  n'a jamais été configuré sur ce projet ; le mettre en place est une décision à
  prendre, pas un reliquat.
- **Three.js en r128**, une version de 2021. Fonctionne, mais l'épinglage mérite
  d'être réexaminé un jour — en mesurant, les scènes sont écrites contre cette API.
- **Aucun test automatisé.** La vérification se fait par build, lecture du CSS
  produit et contrôle visuel dans le navigateur.
