# Outils de l'audit

Les scripts qui ont produit les mesures de [`../audit.md`](../audit.md) et
celles de l'étape 2, dans [`../fondations.md`](../fondations.md).

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
| `ecarts-espacement.mjs` | Étape 2 : rattache chaque padding, margin et gap en px fixe au pas le plus proche de l'échelle Figma (base 4) et liste les écarts, règle par règle, en tableau Markdown. Sans réseau ni navigateur. |
| `mesure-petits-composants.mjs` | Étape 3 : boîtes des boutons, du CTA du header, des liens de nav et des filtres Services en 1440 × 900, et encre réelle des flèches → et ↗ (métriques du canevas, puis pixels d'une capture à l'échelle 8). Sert à dimensionner les icônes de flèche dans les boutons. |
| `mesure-grands-composants.mjs` | Étape 3, partie 2 : boîtes et styles calculés des grands composants (header, menu mobile, boutons icônes, carte projet, modale, FAQ, footer, étiquettes de sommet, altimètres, mode d'emploi, cartes et lignes Services, crête), en 1440 × 900 à la souris puis en 390 × 844 au doigt. En option, captures de référence (header, modale, FAQ, Let's talk, footer, menu mobile). |

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

# Écarts entre les espacements du code et l'échelle base 4 (étape 2)
node docs/design-system/outils/ecarts-espacement.mjs app/globals.css .

# Boîtes des petits composants et encre des flèches (étape 3)
node docs/design-system/outils/mesure-petits-composants.mjs <chemin du navigateur> <dossier de profil>

# Grands composants, desktop et mobile, captures en option (étape 3, partie 2)
node docs/design-system/outils/mesure-grands-composants.mjs <chemin du navigateur> <dossier de profil> [<dossier de captures>]
```

`grain-rendu.mjs` utilise le port 9336, `grain-mesure.mjs` le 9337,
`cta-mobile.mjs` le 9338, `mesure-petits-composants.mjs` le 9339,
`mesure-grands-composants.mjs` le 9340.

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
