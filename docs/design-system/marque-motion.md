# Marque et Motion — étape 4, partie 1

Étape 4 du brief (`docs/design-system/BRIEF.md`), partie 1 : la page Marque
(logo, favicon, planche « Univers graphique ») et la page Motion, construites
dans Figma à partir du code, des fondations (`fondations.md`) et des
composants (`composants.md`).

- **Date** : 9 octobre 2026
- **Branche** : `design-system`
- **Fichier Figma** : `kMLD5Ti9yCpnKU4jdVfWDJ`, pages Marque (`113:5`) et
  Motion (`113:6`)
- **Statut** : construite et contrôlée, en attente de validation

Avant la partie 1, les 111 annotations de la page Composants ont été réécrites
en une phrase courte (règle « Annotations » du BRIEF).

## 1. Ce qui existe dans Figma

Les deux pages suivent le gabarit des pages Fondations et Composants :
planches de 1440 de large, retrait `space/112`, écart `space/40`, fond
`color/bg/primary`, titre en `overline` et `heading-2`, légendes en `data`.

### Page Marque

| Planche | Nœud | Contenu |
|---|---|---|
| `planche/en-tete` | `247:2` | titre et résumé |
| `planche/construction` | `248:2` | le logo du code à 456 px, cercle de découpe, axes à 72°, une branche en bleu, secteur de 72° ; la mesure du tracé |
| `planche/protection-taille` | `249:7` | zone de protection à l'échelle 4 ; header desktop à l'échelle 1, coté 15 · 13 · 56 ; les tailles du code, 34 à 84 |
| `planche/versions` | `251:109` | encre, papier, bleu, chacun sur son fond, avec son jeton et ses usages |
| `planche/favicon` | `252:124` | composant `favicon`, vue à l'échelle 8, en situation à 16 et 32 px sur papier et sur encre, à côté de `app/icon.svg` |
| `planche/univers-graphique` | `254:179` | motifs (courbes de niveau, trace bleue, neige pixel, grain, crête) et scènes (Everest, Mont Blanc, lac) |

Composant ajouté : `favicon` (`252:131`), avec description et annotation
« Favicon proposé, absent du site. ».

### Page Motion

| Planche | Nœud | Contenu |
|---|---|---|
| `planche/en-tete` | `259:2` | titre et résumé |
| `planche/courbes` | `260:2` | dix courbes tracées dans leur carré unité, poignées comprises ; courbes écrites en JS |
| `planche/durees` | `261:2` | les 23 durées de transition en barres (1 s = 400 px), avec leurs usages ; délais |
| `planche/boucles` | `262:2` | les 13 animations en boucle : durée, courbe, keyframes |
| `planche/roll` | `263:2` | chronologie lettre par lettre de « PROJETS » et rendu à l'échelle 1, image par image |
| `planche/rideau` | `264:2` | montée et levée du rideau en six images chacune, écrans au 1/8 |
| `planche/mouvements-composants` | `265:62` | 28 lignes : ce qui bouge, durée, courbe |
| `planche/page-scenes` | `266:62` | 13 lignes : préchargement, apparitions, défilement, scènes WebGL |

### Contrôle final (9 octobre)

- **Marque** : 113 peintures pleines sur 113 et 10 traits sur 10 liés à une
  variable (hors intérieurs d'instances) ; 9 remplissages image, tous des
  captures ou des visuels du code ; un style sur chacun des 83 textes ; une
  annotation, sur le favicon ; aucun nœud hors planche.
- **Motion** : 560 peintures sur 560 et 112 traits sur 112 liés ; un style
  sur chacun des 489 textes ; aucun nœud hors planche.
- **Composants** : la description du composant `logo` renvoie à la page Marque.

## 2. Logo

### Construction à 72°

Les cinq tracés sont identiques dans `Header.js`, `Footer.js`, `Veil.js`,
`LogoReveal.js` et `app/icon.svg` : viewBox 1140 × 1140, découpe ronde
`rx 570`. Mesure du tracé par `outils/geometrie-logo.mjs` :

| Mesure | Valeur |
|---|---|
| Forme des branches | quatre identiques à 0,01 unité ; celle du haut (branche 4) à 9,85 unités, 0,9 % du diamètre |
| Rotation d'une branche à la suivante | 71,1° · 75,4° · 70,0° · 71,8° · 71,8° (360° au total) |
| Centre qui va le mieux à 72° | à 26 unités du centre du cercle, 2,3 % du diamètre |
| Logo tourné de 72° autour du centre du cercle (le survol) | retombe sur lui-même à 59 unités près : 1,8 px à 34 px, 4,4 px à 84 px |
| Pointes des branches, vues du centre | 200,7 à 260,1 unités du centre |

La planche trace l'intention, cinq axes à 72° depuis le centre du cercle,
calés sur la moyenne des cinq pointes (phase 50,7°). Le tracé du code s'en
écarte de −10,4° à +5,6° ; la branche du haut est la plus loin de son axe.
Le site ne change pas : l'écart est documenté, pas corrigé.

### Zone de protection : 13 px pour 34

Mesure sur jimmyferon.com par `outils/mesure-logo.mjs` :

| Écran | Logo | Au-dessus | Au-dessous | À gauche |
|---|---|---|---|---|
| 1440, haut de page et compact | 34 | 15 | 13 (jusqu'au filet #E5E5E5) | 56 |
| 390, haut de page et compact | 34 | 15 | 15 | 20 |

Le header desktop pose une nav de 64 dans une boîte de 64 bordée d'un pixel :
le logo est centré dans la nav, donc à 15 px du haut et à 13 px du filet bas.
Ces 13 px sont le plus petit vide que le site laisse au logo. La zone de
protection les reprend, proportionnelle au diamètre : 13/34 × D, soit
0,38 D (17 px à 44, 32 px à 84).

Hors header, le vide est plus grand. Le logo du footer (44 px) a au moins
20 px autour de lui : le bord gauche en mobile (`.foot-pad`), 30 px puis 36
jusqu'aux colonnes (`.foot-top`), au moins 40 au-dessus ; la zone en demande
17. Le rideau et les cartes centrent le logo dans un grand fond. Le logo du
menu du footer (54 px à .12, 18 px au-dessus) est un filigrane, pas une
signature : il n'entre pas dans la mesure.

### Taille minimum : 34 px

La taille du logo dans le header, la plus petite de la page. Les autres
tailles du code : 44 (footer), 54 (menu du footer), 64 à 100 (carte
Portfolio, 19,5 % de sa largeur : 68 à 390), 84 (rideau). Dans l'onglet,
16 et 32 px relèvent du favicon.

### Versions

| Version | Jeton | Usages dans le code |
|---|---|---|
| Encre #111111 | `color/text/primary`, mode clair | header sur fond clair ; logo animé de la page About |
| Papier #F5F5F5 | `color/text/primary`, mode sombre | header sur fond sombre, mobile compact et menu ouvert ; footer ; rideau ; menu du footer à .12 |
| Bleu #1E29FF | `color/accent/default` | logo animé des cartes (carte Portfolio de la colonne et de la modale), sur le visuel clair `redesign-bg` |

## 3. Favicon (proposé)

Décision du 7 octobre : le logo papier sur un fond bleu, lisible sur les
onglets clairs comme sombres, forme et marge prises dans les fondations.

- Carré de 32, rayon `radius/5` (le rayon de la marque), marge `space/4`,
  logo de 24 en `color/text/primary` (mode sombre posé sur le composant),
  fond `color/accent/default`.
- Dans l'onglet, le SVG se réduit d'un bloc : à 16 px, rayon 2,5, marge 2,
  logo 12. Les instances mises à l'échelle (`rescale`) gardent leurs
  liaisons ; Figma y applique l'échelle.
- En situation sur papier et sur encre, qui tiennent lieu d'onglets clair et
  sombre, à côté de `app/icon.svg` tel qu'il est servi : le logo blanc
  #FFFFFF sans fond, qui disparaît sur papier.
- Annoté « Favicon proposé, absent du site. ». Le site garde `app/icon.svg`.

## 4. Univers graphique

### Scènes

Capturées sur jimmyferon.com par `outils/capture-scene.mjs`, à l'échelle 2,
sur fond transparent, et posées sur leur fond :

| Scène | Commande (sélecteur, défilement, attente, cadre) | Image |
|---|---|---|
| Everest | `.ev-gl`, sans défilement, 4,5 s, `.ev-gl` | 2880 × 1504, au chargement, sans les étiquettes ni l'altimètre |
| Mont Blanc | `.bn3-gl`, `.bn3@0.95`, 6 s, `.bn3-stick` | 2880 × 1800, fin de l'ascension (P = 1) : relief entier et voie royale |
| Lac | `.lt-3d`, `.foot-dark`, 7 s, `.lt` | 2880 × 1512, recadrée sur le lac |

Le Mont Blanc se dessine avec le défilement (P de 0 à 1 sur la section de
560vh) : l'outil accepte désormais une fraction de la course du bloc.

### Motifs

- **Courbes de niveau** et **trace bleue** : recadrages de la capture du
  Mont Blanc (×1,5 et ×0,9). Rien n'est redessiné : ce sont les lignes du
  code, telles que le site les rend.
- **Neige pixel** : comme sur la carte Portfolio, `redesign-bg` (converti en
  JPEG par `outils/webp-jpeg.mjs`), nuages `clouds.png` à .9, neige
  `pixels.png` en mosaïque de 64 à .65. Seule sur un aplat, la neige se lit
  comme du bruit.
- **Grain** : le composant `grain` (site) sur une moitié papier et une moitié
  encre.
- **Crête** : le composant `ridge`, variante sombre desktop, à 797 px de
  large. `Ridge.js` met tout à l'échelle par k = largeur / 1200 : à 797 px,
  c'est la géométrie exacte du code (k = 0,664).

## 5. Motion

Valeurs lues dans `globals.css` (`outils/extraire-css.mjs`, section
`motion`, et `outils/regles-css.mjs`) et dans les composants.

- **CSS mort écarté** : `.wcard`, `.band-track`, `.burger`, `.btn-dark`,
  `.socials`, `.cursor-badge`. La courbe `cubic-bezier(.2,.7,.2,1)` de
  `.reveal` est écrasée plus bas par `var(--rv-d) var(--rv-e)` : elle ne
  s'applique jamais.
- **`ease`**, absent de l'audit, est vivant : écrit une fois (numéros des
  cartes Services), et surtout courbe par défaut de toute transition écrite
  sans courbe (menu et chevron de langue, puces de filtre, fond du `.cta`,
  couleurs des étiquettes de sommet).
- **Occurrences** : les nombres de la planche Courbes comptent les
  occurrences dans `globals.css`, comme l'audit.
- **Durées** : 23 durées de transition, groupées par ordre de grandeur pour
  la lecture (les six groupes de l'audit, §8.2) ; aucune n'est arrondie. Avec
  les délais .10, .16 et .24 s, ce sont les 26 valeurs de l'audit.
- **Roll** : chaque lettre suit `.3 s cubic-bezier(.65,0,.2,1)` avec 20 ms
  de retard. Les images clés sont calculées avec cette courbe (résolution de
  la bézier en x), lettres dans des fenêtres de 7,626 × 12,98 px : la largeur
  mesurée de « PROJETS » sur le site (53,38 / 7) et la hauteur de ligne 1,18.
- **Rideau** : positions calculées avec `var(--e)` ; à 100 ms, le rideau
  couvre déjà 63 % de l'écran.

## 6. Choix à valider

1. **Zone de protection** : le plus petit vide mesuré sur le site, 13 px pour
   34, rapporté au diamètre (13/34 D). Aucune autre valeur n'existe dans le
   code.
2. **Taille minimum** : 34 px, la plus petite taille de la page ; 16 et
   32 px laissés au favicon.
3. **Favicon** : carré de 32, `radius/5`, marge `space/4`, logo de 24.
4. **Construction** : axes tracés depuis le centre du cercle, calés sur la
   moyenne des pointes ; l'écart du tracé est montré, pas lissé.
5. **Univers graphique** : courbes et trace en recadrages des captures, pas
   redessinées ; neige posée sur le visuel de la carte Portfolio.
6. **Motion** : durées présentées dans les six groupes de l'audit.

## 7. Pour la partie 2

- **Descriptions de composants** : 22 descriptions disent encore « pas encore
  dans le code » pour les focus, les désactivés et les flèches dessinées. La
  règle du 9 octobre ne vise que les annotations ; ces descriptions sont à
  reprendre avec la documentation de chaque composant.
- **Carte projet** : le calque `visuel` du composant `card/project` porte une
  image de projet par défaut. Sur le site, la carte Portfolio pose
  `redesign-bg` sous les nuages et la neige (planche Univers graphique).
- **DESIGN.md** : rangé dans `docs/design-system/` (BRIEF, « Étape 4 en deux
  parties »).

## 8. Notes techniques

- **Logo agrandi** : le composant coupe ses branches avec un rayon d'angle de
  17, qui ne suit pas un redimensionnement. Chaque instance redimensionnée
  prend un rayon égal à la moitié de sa taille (déjà le cas des instances de
  44 à 84).
- **Images** : `upload_assets` avec `nodeIds` remplit directement le calque
  visé, sans cadre temporaire. Un même fichier se réutilise par son
  `imageHash` (recadrages).
- **Peintures liées** : poser la couleur résolue (`resolveForConsumer`) et
  son alpha en opacité, puis lier ; c'est ce que Figma stocke pour un jeton à
  alpha.
- **Script en erreur** : annulé en bloc, comme à l'étape 3 ; ne pas relire un
  nœud supprimé dans le même script.
- **Mise à l'échelle d'une instance** (`rescale`) : liaisons gardées, valeurs
  mises à l'échelle.
