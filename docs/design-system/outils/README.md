# Outils de l'audit

Les scripts qui ont produit les mesures de [`../audit.md`](../audit.md), puis
celles des étapes suivantes : [`../fondations.md`](../fondations.md),
[`../composants.md`](../composants.md),
[`../marque-motion.md`](../marque-motion.md) et
[`../documentation.md`](../documentation.md), avec le contrôle de
[`../DESIGN.md`](../DESIGN.md).

Ils ne font que lire : ni le code du site ni le fichier Figma ne sont modifiés.
Aucune dépendance à installer. Il faut Node 24 (voir `.nvmrc`), et un
navigateur Chromium installé (Chrome, Edge ou Brave) pour les scripts qui
pilotent un navigateur : mesure des styles, polices rendues, grain, CTA mobile.

## Les scripts

Toutes les commandes se lancent depuis la racine du dépôt.

| Script | Ce qu'il fait |
|---|---|
| `extraire-css.mjs` | Inventaire de `globals.css` par catégorie : chaque valeur avec son contexte `@media` et son nombre d'usages. |
| `classes-mortes.mjs` | Classes déclarées dans `globals.css` qui n'apparaissent dans aucune chaîne du JS (`app/`, `components/`, `lib/`). |
| `mesurer-styles.mjs` | Styles calculés de chaque élément porteur de texte et de chaque boîte à classe. Pages `/`, `/work` et `/about`, en 1440 × 900 (souris) et en 390 × 844 (tactile émulé). Écrit `mesures.json`. |
| `tableau-typo.mjs` | Tableau typographique desktop / mobile, construit à partir de `mesures.json`. |
| `polices-rendues.mjs` | Police qui dessine réellement chaque texte témoin. C'est lui qui révèle les glyphes tombés sur une police système. |
| `nom-police.mjs` | Table `name` d'un fichier WOFF2 : famille, style, version, licence. |
| `grain-rendu.mjs` | Étape 2, test D11 : rend seul le motif de grain de `body::after` (PNG transparent 240 × 240) et capture `/work` en 1440 × 900. |
| `grain-mesure.mjs` | Étape 2, test D11 : luminance, écart-type, écart entre voisins et chroma de PNG (captures d'échantillons de grain). |
| `cta-mobile.mjs` | Étape 2 : le double CTA du hero tient-il en 11 px / .06em à 390 px ? Place attribuée et largeur naturelle de chaque bouton, en FR et en EN, et plus petite largeur d'écran qui tient. |
| `ecarts-espacement.mjs` | Historique, étape 2 : rattache chaque padding, margin et gap en px fixe au pas le plus proche de l'échelle base 4, abandonnée le 8 octobre 2026, et liste les écarts. Sans réseau ni navigateur. |
| `usages-espacement.mjs` | Depuis le 8 octobre 2026 : pour chaque valeur fixe de padding, margin ou gap du code, les règles vivantes qui l'utilisent (tableau Markdown, ou JSON avec `--json`). Sert aux descriptions des primitives `space/…`. |
| `regles-css.mjs` | Toutes les règles de `globals.css` dont un sélecteur correspond à un motif, avec ligne et contexte `@media` : le code exact d'un composant, états et points de rupture compris. |
| `mesure-petits-composants.mjs` | Étape 3 : boîtes des boutons, du CTA du header, des liens de nav et des filtres Services en 1440 × 900, et encre réelle des flèches → et ↗ (métriques du canevas, puis pixels d'une capture à l'échelle 8). Sert à dimensionner les icônes de flèche dans les boutons. |
| `capture-scene.mjs` | Étape 3, partie 2 (et étape 4) : capture un élément du site sur fond transparent, tout le reste de la page masqué (fonds et grain compris). Sert aux scènes WebGL (lac de Let's talk, Everest, Mont Blanc), à poser dans Figma sur leurs propres fonds. Le cadre de découpe peut être un parent, quand la scène déborde de la page (le lac sort à −100,8 px). Le défilement accepte une fraction de la course d'un bloc (`.bn3@0.95`), pour les scènes pilotées par le défilement. |
| `mesure-grands-composants.mjs` | Étape 3, partie 2 : boîtes et styles calculés des grands composants (header, menu mobile, boutons icônes, carte projet, modale, FAQ, footer, étiquettes de sommet, altimètres, mode d'emploi, cartes et lignes Services, crête), en 1440 × 900 à la souris puis en 390 × 844 au doigt. En option, captures de référence (header, modale, FAQ, Let's talk, footer, menu mobile). |
| `geometrie-logo.mjs` | Étape 4 : géométrie du logo, lue dans le SVG du code. Les cinq branches sont-elles la même forme, de combien tourne-t-on de l'une à la suivante et autour de quel point, de combien le logo tourné de 72° s'écarte de lui-même ; phase des axes à 72° de la page Marque. Sans réseau ni navigateur. |
| `mesure-logo.mjs` | Étape 4 : vide autour du logo du header, en haut de page et en compact, en 1440 × 900 puis en 390 × 844 au doigt. C'est la mesure qui fixe la zone de protection. |
| `webp-jpeg.mjs` | Étape 4 : convertit une image WebP du site en JPEG avec le navigateur, car Figma n'affiche pas les WebP importés. |
| `verifier-design-md.mjs` | Étape 4, partie 2 : contrôle de structure du `DESIGN.md`, sans dépendance ni réseau. Clés en double, couleurs et dimensions au format CSS, propriétés connues du format, références `{groupe.jeton}` résolues, ordre des huit sections canoniques. Les jetons qu'aucun composant ne cite sont comptés à part : le lint du format ne les signale qu'en avertissement. Sort en erreur s'il trouve un problème. |

Commandes :

```sh
# Inventaire de globals.css. Sections : colors, type, motion, radius,
# shadow, effects, media, spacing, z, all
node docs/design-system/outils/extraire-css.mjs app/globals.css colors

# Classes mortes
node docs/design-system/outils/classes-mortes.mjs .

# Mesure des styles calculés (environ une minute), puis tableau typo
node docs/design-system/outils/mesurer-styles.mjs <chemin du navigateur> <dossier de sortie>
node docs/design-system/outils/tableau-typo.mjs <dossier de sortie>/mesures.json

# Police réellement utilisée pour chaque texte témoin
node docs/design-system/outils/polices-rendues.mjs <chemin du navigateur> <dossier de profil>

# Nom interne d'une police
node docs/design-system/outils/nom-police.mjs public/fonts/chopin.woff2

# Grain (étape 2) : motif rendu et capture du site, puis mesures
node docs/design-system/outils/grain-rendu.mjs <chemin du navigateur> <dossier de sortie>
node docs/design-system/outils/grain-mesure.mjs <chemin du navigateur> <dossier de profil> <png> [<png>…]

# CTA du hero mobile en 11 px (étape 2)
node docs/design-system/outils/cta-mobile.mjs <chemin du navigateur> <dossier de profil>

# Écarts entre les espacements du code et l'échelle base 4 (étape 2, historique)
node docs/design-system/outils/ecarts-espacement.mjs app/globals.css .

# Usages de chaque valeur d'espacement du code (règle du 8 octobre)
node docs/design-system/outils/usages-espacement.mjs app/globals.css . [--json]

# Règles d'un composant, @media compris (ici les boutons)
node docs/design-system/outils/regles-css.mjs app/globals.css '\.(btnf|cta|menu-btn)\b'

# Boîtes des petits composants et encre des flèches (étape 3)
node docs/design-system/outils/mesure-petits-composants.mjs <chemin du navigateur> <dossier de profil>

# Grands composants, desktop et mobile, captures en option (étape 3, partie 2)
node docs/design-system/outils/mesure-grands-composants.mjs <chemin du navigateur> <dossier de profil> [<dossier de captures>]

# Scène sur fond transparent : ici le lac, découpé sur le bloc Let's talk
# (sous Git Bash, préfixer par MSYS_NO_PATHCONV=1, sinon « / » devient un chemin)
node docs/design-system/outils/capture-scene.mjs <chemin du navigateur> <dossier de profil> lac.png / .lt-3d .foot-dark 6000 .lt 1

# Les trois scènes de la planche « Univers graphique » (étape 4), à l'échelle 2 :
# Everest au chargement, Mont Blanc en fin d'ascension (95 % de la course de .bn3), lac
node docs/design-system/outils/capture-scene.mjs <chemin du navigateur> <dossier de profil> everest.png / .ev-gl "" 4500 .ev-gl 2
node docs/design-system/outils/capture-scene.mjs <chemin du navigateur> <dossier de profil> montblanc.png / .bn3-gl .bn3@0.95 6000 .bn3-stick 2
node docs/design-system/outils/capture-scene.mjs <chemin du navigateur> <dossier de profil> lac.png / .lt-3d .foot-dark 7000 .lt 2

# Géométrie du logo (étape 4)
node docs/design-system/outils/geometrie-logo.mjs app/icon.svg

# Vide autour du logo du header, desktop et mobile (étape 4)
node docs/design-system/outils/mesure-logo.mjs <chemin du navigateur> <dossier de profil>

# WebP du site en JPEG, pour l'importer dans Figma
node docs/design-system/outils/webp-jpeg.mjs <chemin du navigateur> <dossier de profil> public/images/redesign-bg-1600.webp redesign-bg-1600.jpg

# Structure du DESIGN.md (étape 4, partie 2)
node docs/design-system/outils/verifier-design-md.mjs docs/design-system/DESIGN.md
```

`grain-rendu.mjs` utilise le port 9336, `grain-mesure.mjs` le 9337,
`cta-mobile.mjs` le 9338, `mesure-petits-composants.mjs` le 9339,
`mesure-grands-composants.mjs` le 9340, `capture-scene.mjs` le 9342,
`mesure-logo.mjs` le 9343, `webp-jpeg.mjs` le 9344.

## Mesurer une preview plutôt que la prod

`mesurer-styles.mjs` et `polices-rendues.mjs` prennent l'URL en dernier
argument (par défaut `https://jimmyferon.com`). Pour comparer une preview
Vercel à la prod, lancer la mesure deux fois, avec deux dossiers de sortie,
puis comparer les deux `mesures.json`.

## Bon à savoir

- **Dossier de sortie hors du dépôt.** Les scripts de mesure lancent le
  navigateur sans fenêtre, avec un profil temporaire créé dans le dossier
  indiqué. Ce profil pèse plusieurs dizaines de Mo : prendre par exemple le
  dossier temporaire du système.
- Chaque page est mesurée 4,5 s après son chargement, le temps du
  préchargement (3 s) et de la levée du rideau.
- Ports utilisés : 9333 (mesure) et 9334 (polices). Si une mesure s'arrête en
  cours, fermer le navigateur resté ouvert sur ces ports.
- Les polices de secours dépendent du système. Sous Windows, les flèches
  tombent sur Consolas et Segoe UI Symbol ; sous macOS, sur d'autres polices.
