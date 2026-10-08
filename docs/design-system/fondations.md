# Fondations — étape 2

Étape 2 du brief (`docs/design-system/BRIEF.md`) : variables, styles de texte,
espacements, rayons, effets et grilles, construits dans Figma à partir de
l'audit validé (`docs/design-system/audit.md`).

- **Date** : 7 octobre 2026
- **Branche** : `design-system`
- **Fichier Figma** : `kMLD5Ti9yCpnKU4jdVfWDJ`, page Fondations (`113:3`)
- **Statut** : validé le 7 octobre 2026, avec les arbitrages du §4, appliqués
  dans Figma

## 1. Ce qui existe dans Figma

| Élément | Contenu |
|---|---|
| Pages | Fondations `113:3`, Composants `113:4`, Marque `113:5`, Motion `113:6`, ajoutées après Matière et Templates, qui n'ont pas été touchées |
| Collection `primitives` | mode `valeur` · 68 variables : 49 couleurs, 14 pas d'espacement `space/…`, 5 `radius/…` |
| Collection `semantic` | modes `clair` et `sombre` · 27 couleurs, toutes en alias de primitives (26 à l'étape 2 ; `overlay/button` ajouté à l'étape 3, partie 2) |
| Collection `responsive` | modes `desktop` (1440 × 900) et `mobile` (390 × 844) · 21 jetons |
| Styles de texte | 64 : 32 `text/desktop/…`, 32 `text/mobile/…` (59 à l'étape 2 ; `nav-active` ajouté à la partie 1 de l'étape 3, `sign` et `help-strong` à la partie 2, voir `composants.md`) |
| Styles d'effet | 13 : 9 `shadow/…`, 4 `blur/…` |
| Style de remplissage | 1 : `effect/grain` |
| Styles de grille | 20 : `grid/{largeur}/{usage}` |

Contrôle final :
- aucune variable en `ALL_SCOPES`, aucun alias cassé ;
- toutes les variables et tous les styles ont une description ;
- sur la page Fondations, aucun remplissage plein en dur ni aucune barre
  d'espacement détachée de sa variable.

### Page Fondations

Neuf planches de 1440 de large, empilées, construites avec le système
lui-même (fonds et textes en jetons sémantiques, styles de texte, `space/…`) :

| Planche | Nœud | Contenu |
|---|---|---|
| `planche/en-tete` | `120:2` | titre et résumé |
| `planche/couleurs-primitives` | `120:6` | 49 pastilles liées ; paliers du papier dans un panneau en mode sombre |
| `planche/couleurs-semantiques` | `120:225` | les 26 rôles, en clair et en sombre côte à côte |
| `planche/typo-desktop` | `121:2` | 29 spécimens sur de vrais textes du site (`lib/i18n.js`) |
| `planche/typo-mobile` | `122:2` | 30 spécimens, texte d'essai sur 350 px |
| `planche/espacements` | `122:157` | échelle de 14 pas, avec les valeurs du code rattachées ; jetons `responsive` en desktop et en mobile |
| `planche/rayons-effets` | `123:2` | rayons, 9 ombres (dont `shadow/menu` en sombre), flous, lueur |
| `planche/grain` | `125:2` | test D11, mesures, style `effect/grain` retenu |
| `planche/grilles` | `129:2` | écrans 1440, 1400, 1024, 900, 760, 390 avec leurs grilles |

## 2. Variables

### `primitives`

- **Couleurs pleines (11)** : `color/paper`, `ink`, `blue` (marque) ; `white`,
  `blue-hover`, `blue-light`, `grey-card`, `grey-line`, `grain-accent`,
  `grain-accent-dark`, `veil` (interface).
- **Paliers d'alpha (38)** :
  - `color/ink/…`, 14 : a05, a13, a22, a25, a26, a35, a38, a45, a50, a55,
    a70, a72, a86, a97 ;
  - `color/paper/…`, 18 : a05 à a92 ;
  - `color/blue/a15`, `a50`, `a55`, `a80` ;
  - `color/black/a60`, `a90`.

  Ce sont les rôles, les voiles, les ombres et les valeurs de composant encore
  vivantes après les alignements validés. Les 49 couleurs sont masquées des
  sélecteurs : on utilise les sémantiques.
- **Échelle d'espacement `space/…` (14 pas, base 4)**, scope `GAP` : voir le
  §2.4.
- **`radius/…` (5)** : 2, 3, 5 (rayon de la marque), 20 et 38 (masqués,
  utilisés par `radius/footer`).

### `semantic` (clair / sombre)

| Groupe | Jetons |
|---|---|
| Fond | `bg/primary`, `bg/surface`, `bg/card`, `bg/inverse`, `bg/hover` |
| Texte | `text/primary`, `muted`, `label`, `subtle`, `on-accent`, `on-accent-muted`, `on-accent-subtle`, `on-inverse` |
| Accent | `accent/default`, `hover`, `on-dark` |
| Bordure | `border/default`, `strong`, `header` |
| Voile | `overlay/header`, `header-compact`, `header-mobile` (.97), `modal`, `dim` (.7), `flag`, `button` (papier .12, boutons de la modale ; étape 3, partie 2) |
| Ombre | `shadow/menu` |

### `responsive` (desktop / mobile)

- **Marges et header.** `layout/page-pad` vaut 60 / 20 (`var(--pad)`).
  `layout/section-inset` vaut 112 / 20, en alias de `space/112` et
  `space/20`. `layout/header-height` vaut 64, en alias de `space/64`
  (`var(--hh)`). `radius/footer` vaut 38 / 20 (`clamp(20px,3vw,38px)`).
- **Rythme vertical (ESP-06).** Valeurs à 900 et 844 de haut, formule en
  description : `section/hero/height`, et `top` / `bottom` pour `manif`,
  `services`, `client-work`, `about`, `faq`, `lets-talk`, `footer`, `page`.
- **Hors échelle.** Les marges et les rythmes gardent leurs valeurs (60 ; 30,
  50 et 90 en mobile ; les valeurs en vh) : ils suivent D3 ou la hauteur
  d'écran, pas l'échelle.

### 2.4 Échelle d'espacement

Quatorze pas sur une base de 4, de plus en plus espacés : de 4 en 4 jusqu'à
24, de 8 en 8 jusqu'à 64, puis 80, 96 et 112.

Le code avait 32 valeurs fixes, sans échelle. Chaque valeur est rattachée au
pas le plus proche ; à égale distance, au pas supérieur.

| Pas | Valeurs du code rattachées (écart) |
|---|---|
| `space/4` | 1 (+3), 2 (+2), 3 (+1), 4, 5 (−1) |
| `space/8` | 6 (+2), 7 (+1), 8, 9 (−1) |
| `space/12` | 10 (+2), 11 (+1), 12, 13 (−1) |
| `space/16` | 14 (+2), 15 (+1), 16 |
| `space/20` | 18 (+2), 19 (+1), 20 ; marge de page mobile |
| `space/24` | 22 (+2), 24, 26 (−2) |
| `space/32` | 30 (+2), 32, 34 (−2) |
| `space/40` | 36 (+4), 38 (+2), 40 |
| `space/48` | aucune valeur fixe du code |
| `space/56` | aucune valeur fixe ; retrait de la modale à 1440 (`clamp(16px,4vw,56px)`) |
| `space/64` | hauteur du header (`--hh`) |
| `space/80` | aucune valeur fixe du code |
| `space/96` | aucune valeur fixe du code |
| `space/112` | retrait des sections desktop |

Les pas 48, 80 et 96 servent aux valeurs fluides des composants
(`clamp(…)`), qui seront résolues aux largeurs de référence à l'étape 3.

## 3. Styles

- **Texte.**
  - Les 33 styles du §3.4, en deux jeux (D6), plus `nav-active` à l'étape 3
    (les valeurs de `nav` en Bold), puis `sign` (± de la FAQ, Bricolage
    Regular 20,8, desktop et mobile) et `help-strong` (les valeurs de `help`
    en Bold) à la partie 2.
  - `display` porte le retrait de première ligne du code (`text-indent`,
    144 en desktop, 56 en mobile), ajouté à la partie 2 (à valider).
  - Scopes ajoutés aux jetons de texte pour les icônes et le logo en
    currentColor : `STROKE_COLOR` sur `primary`, `on-accent`, `on-inverse`,
    `subtle` (partie 1), `label` et `muted` (partie 2, à valider) ;
    `SHAPE_FILL` sur `primary` et `on-accent` (partie 2).
  - Bricolage porte son axe `opsz` réglé sur la taille, borné à 12–96 (D9).
  - Les huit titres de D7 prennent l'interlignage retenu.
  - Classes CSS et formules en description (D10).
  - `text/mobile/button` est aligné sur le desktop : 11 px, 160 %, +6 %.
- **Ombres.** `shadow/header`, `header-menu`, `menu`, `card`, `card-bar`,
  `flag`, `flag-hover`, `modal`, `text`. Leur couleur est liée à une primitive.
  Celle de `shadow/menu` est liée à `color/shadow/menu`, qui passe d'encre .25
  à noir .6 en mode sombre.
- **Flous.** `blur/header` 28, `blur/flag` 16, `blur/overlay` 8, `blur/glow`
  116. Le rayon de flou Figma vaut le double du flou CSS : `blur(14px)` donne
  28 dans Figma, et Dev Mode divise par deux à l'export. La valeur CSS est en
  description.
- **Grain.** `effect/grain` est un style de remplissage : le motif du code
  (PNG 240 × 240) en mosaïque à l'échelle 1, opacité .21, fusion
  `difference`. L'opacité et la fusion sont portées par le remplissage. Il
  suffit donc d'un calque normal posé au-dessus du contenu.
- **Grilles.**
  - `grid/{largeur}/page` pour les six largeurs : marge `--pad`, une colonne.
  - `services`, `about` et `client-work` à 1440, 1400, 1024 et 900.
  - `hero` (4 colonnes) à 1440 et 1400.
  - Les colonnes inégales du code (`1.05fr / .95fr`, `1fr / 1.05fr`) sont
    exactes : deux grilles d'une colonne, calées à gauche et à droite.
  - À 760 et 390, tout passe sur une colonne.

## 4. Arbitrages de l'étape 2 (7 octobre 2026)

1. **Grain (D11) : motif image.** Le style `effect/grain`, posé sur un calque
   normal, mesure exactement comme le motif du test (§5).
2. **Bouton mobile : un seul style, 11 px et .06em.** Le double CTA du hero
   tient en 390 px avec ce style :
   - « Book A Call → » demande 123 px, « Get in touch ↗ » 132 px, pour 170
     disponibles chacun, en FR comme en EN ;
   - il tient jusqu'à 314 px de large.

   Il n'y a donc pas de variante `button-compact`. Le passage à 11 px est une
   correction à faire sur le site (§6).
3. **Code syntax.** Elle n'est posée que lorsqu'une seule expression CSS vaut
   dans tous les modes. 30 jetons dont la valeur CSS change avec le mode n'en
   ont pas ; leur description donne les deux valeurs.
4. **Rôles sémantiques ajoutés : validés**, avec fusion des voiles dont
   l'opacité diffère de 5 % ou moins.

   Règle appliquée : deux voiles fusionnent s'ils ont la même couleur de base
   dans chaque mode et une opacité à 5 % ou moins d'écart. On garde l'opacité
   la plus forte, la plus sûre pour le texte posé dessus.
   - `header-mobile` .94 + `menu` .97 → `overlay/header-mobile` à .97.
   - `cal` .65 + `edge` .7 → `overlay/dim` à .7.
   - Non fusionnés : `flag` (papier .88) et `header-compact` (papier .92 en
     clair, encre .86 en sombre), dont la base diffère en sombre. Le voile de
     la modale garde sa base `#0A0A0A` (§1 de l'audit).

   Les primitives `ink/a94` et `ink/a65` sont retirées.
5. **Papier .26** (`#f4f6f542`, `.foot-topbtn`) : à rattacher au rôle le plus
   proche à l'étape 3.
6. **Espacements.** Les 32 valeurs étaient l'inventaire du code, pas une
   échelle. Elles laissent place à l'échelle de 14 pas sur une base de 4
   (§2.4). Marges et rythmes de section restent dans `responsive`. Chaque
   valeur est rattachée au pas le plus proche, et les écarts sont listés en
   §6, comme pour les rayons.

Choix de l'étape 2 toujours valables :
- flous saisis au double de la valeur CSS ;
- une seule lueur (`blur/glow`, celle du hero ; le footer est à 66, soit 132) ;
- apostrophe typographique ’ dans les descriptions, parce que Figma réécrit
  l'apostrophe droite en `&#39;`.

## 5. Test du grain (D11)

Trois échantillons de 400 × 260, à l'échelle 1, sur papier :

- une capture de `/work` en 1440 × 900 ;
- le bruit natif de Figma ;
- le motif du code, rendu en PNG et posé en mosaïque de 240 à .21, en
  `difference`.

| Échantillon | Luminance | Écart-type | Écart entre voisins | Chroma |
|---|---|---|---|---|
| Site, capture | 234,1 | 2,28 | 2,28 | 1,71 |
| Motif image | 234,3 | 2,72 | 3,09 | 2,04 |
| Style `effect/grain` sur un calque normal | 234,3 | 2,73 | 3,11 | 2,04 |
| Bruit natif multicolore .21, densité 1 | 232,0 | 7,73 | 8,83 | 7,57 |
| Bruit natif monochrome encre .12, densité .5 | 242,5 | 3,61 | 3,41 | 0 |

Le bruit natif ne sait pas à la fois assombrir le papier comme la fusion
`difference` et garder un grain aussi fin. Le motif image reproduit le site.
Aucun des deux n'accepte de variable.

## 6. Corrections à faire sur le site (étape 2)

Elles complètent la liste de l'audit (§10). Chacune relève de sa propre
branche, avec diagnostic et validation visuelle avant modification.

| Correction | Origine |
|---|---|
| Double CTA du hero mobile : `.hero-mcta .btnf` à 11px et .06em, au lieu de 10px et .05em | arbitrage 2 |
| Header compact mobile (≤ 900) : `rgba(17,17,17,.94)` → `.97`, comme le menu ouvert | arbitrage 4 |
| Voile cal.com : `cal-modal-box` `rgba(17,17,17,.65)` → `.7`, comme l'indicateur de bord | arbitrage 4 |
| Espacements alignés sur l'échelle base 4 : 115 règles, 20 valeurs, tableau ci-dessous | arbitrage 6 |

Conséquences visibles à vérifier à l'étape 3 et sur la preview :

- **`.btnf`** passe de 13 / 24 à 12 / 24 : le bouton `md` de D4 passe de 46 à
  44 px de haut. Son écart icône passe de 9 à 8.
- **`.cta`** passe de 9 / 14 à 8 / 16 : le bouton `sm` passe de 36 à 34 px.
- **Question FAQ** : 20 / 26 devient 20 / 24.
- **Surtitres** : l'écart du flocon passe de 7 à 8.

Tableau des écarts, produit par `outils/ecarts-espacement.mjs`. Il couvre les
règles vivantes : CSS mort, marges et rythmes de section et mécanique de la
crête sont écartés.

| Code | Pas | Écart | Où (règles vivantes) |
|---|---|---|---|
| 1 | 4 | +3 | `.pcard-bar-txt {gap}` · `[(min-width:1025px)] .ev-mark {gap}` |
| 2 | 4 | +2 | `.lang-trigger {padding}` · `.hb-lbl {margin-bottom}` · `.fq-item {padding}` · `.hx-lang button {padding}` · `[(max-width:760px)] .cw-row {padding}` · `[(max-width:760px)] .fq-item {padding}` |
| 3 | 4 | +1 | `.hx-links {gap}` · `.hx-contact {gap}` |
| 5 | 4 | −1 | `.lang-trigger {gap}` |
| 6 | 8 | +2 | `.lang-trigger {padding}` · `.lang-menu {margin-top}` · `.hero-scroll {margin-bottom}` · `.svx-toggle {padding}` · `.svx-filters {gap}` · `.svx-pill {padding}` · `.svx-go {gap}` · `[(max-width:1024px)] .hero-meyebrow {gap}` · `[(max-width:620px)] .svx-pill {padding}` · `[(max-width:760px)] .bn3-campalt {margin-bottom}` · `[(max-width:760px)] .bn3-camp p, .bn3-summit p {margin}` · `[(min-width:1025px)] .ev-help .ev-eq {margin}` · `[(min-width:1025px)] .ev-help.docked .ev-help-body {gap}` |
| 7 | 8 | +1 | `.lang-menu button {padding}` · `.cta {gap}` · `.sv2-eyebrow {gap}` · `.lt-eyebrow {gap}` · `.uc-eyebrow {gap}` · `[(min-width:1025px)] .ev-mark {padding}` · `[(min-width:1025px)] .ev-edge {padding}` · `[(min-width:1025px)] .ev-edge-t {padding}` · `.ev-modal-cat {margin-top}` |
| 9 | 8 | −1 | `.cta {padding}` · `.hb-val {gap}` · `.sv2-list li {gap}` · `.svx-row {padding}` · `.btnf {gap}` · `.foot-figma {gap}` · `.menu-btn {padding}` · `.pcard-bar {padding}` |
| 10 | 12 | +2 | `.lang-menu button {padding}` · `.hero-scroll {gap}` · `.svx-pill {padding}` · `.svx-head {gap}` · `.svx-head {padding}` · `.svx-row {gap}` · `.svx-row {padding}` · `.bn3-summit h3 {margin}` · `.ab-figs {margin-top}` · `.hx-lang {gap}` · `[(max-width:1024px)] .hero-mcta {gap}` · `[(max-width:620px)] .svx-pill {padding}` · `.hero-mscroll {padding}` · `[(max-width:760px)] .ab-figs {gap}` · `[(max-width:760px)] .ab-ctas {gap}` · `[(min-width:1025px)] .ev-mark {padding}` · `[(min-width:1025px)] .ev-edge {padding}` · `.ev-modal-txt h3 {margin-top}` |
| 11 | 12 | +1 | `[(min-width:1025px)] .ev-help-body {gap}` |
| 13 | 12 | −1 | `.sv2-title {margin}` · `.btnf {padding}` · `.hx-nav a {padding}` |
| 14 | 16 | +2 | `.cta {padding}` · `.sv2-lead {margin}` · `.sv2-body {margin-top}` · `.svx-filters {padding}` · `.ab-ctas {gap}` · `.uc-sub {margin-top}` · `.uc-cv {gap}` · `.foot-col h4 {margin-bottom}` · `.f-hook {margin-bottom}` · `.foot-cta-row {gap}` · `.foot-cta-pair {gap}` · `.foot-bot {gap}` · `.menu-btn {padding}` · `[(max-width:1024px)] .hero-mcta .btnf {padding}` · `.pcard-bar {padding}` · `[(max-width:760px)] .cw-row {gap}` · `[(max-width:760px)] .bn3-title {margin-top}` · `[(max-width:760px)] .bn3-sub {margin-top}` · `[(min-width:1025px)] .ev-edge-t {padding}` · `[(min-width:1025px)] .ev-help.docked .ev-help-body {padding}` · `.ev-modal-over {margin-top}` · `.ev-modal-nav {gap}` |
| 15 | 16 | +1 | `.svx-row:hover .svx-name {padding-left}` |
| 18 | 20 | +2 | `.bn3-sub {margin}` · `.fq-q {gap}` · `.menu-logo {margin-top}` · `.foot-bot {padding-top}` · `[(max-width:760px)] .sv2-card {margin-top}` · `[(max-width:760px)] .cw-row {padding}` · `[(max-width:760px)] .fq-item {padding}` · `[(max-width:760px)] .fq-q {padding}` · `.ev-modal-wrap {gap}` |
| 19 | 20 | +1 | `.hx-body {padding}` |
| 22 | 24 | +2 | `.sv2-card+.sv2-card {margin-top}` · `.fq-a p {padding}` · `.hx-body {padding}` · `.hx-grid {gap}` |
| 26 | 24 | −2 | `.fq-title {margin}` · `.fq-item {padding}` · `.uc-cv {margin-top}` · `[(max-width:760px)] .uc-art {margin-top}` |
| 30 | 32 | +2 | `.ab-ctas {padding-top}` · `.foot-top {gap}` · `[(min-width:1025px)] .ev-help-body {padding}` |
| 34 | 32 | −2 | `.cw-all {margin-top}` · `.lt-cta {margin-top}` · `.uc-art {margin}` · `.hx-bot {margin-top}` |
| 36 | 40 | +4 | `[(max-width:760px)] .sv2-grid {gap}` · `[(max-width:900px)] .foot-top {gap}` · `.ev-modal-meta {gap}` |
| 38 | 40 | +2 | `[(min-width:1025px)] .ev-help.docked .ev-help-body {padding}` |

## 7. À faire à l'étape 3

- **Papier .26** (`.foot-topbtn`) : le rattacher au rôle le plus proche.
- **Grain** : un composant calque, plus les variantes des cartes et lignes
  Services. Les cartes sont à .6, fusion normale, motif à 300 px ; les lignes
  à .4, fusion normale.
- **Tailles de bouton après l'échelle** : `md` 44, `sm` 34, à confirmer avec
  D4.
- **Valeurs fluides des composants** (`clamp(…)`) : les résoudre à 1440 et
  390, puis les rattacher aux pas.
- **Crête** : ses décalages (470, −604,8…) iront avec le composant.
- **États focus et désactivé** (D5).

Tout est fait à l'étape 3 (`composants.md`) : papier .26 rattaché à
`color/text/subtle` ; composant `grain` (site, card, row) ; tailles `md` 44
et `sm` 34 validées ; valeurs fluides résolues (§10 de `composants.md`) ;
composant `ridge` avec ses décalages ; états focus et désactivé sur tous les
éléments cliquables.

## 8. Outils

Tout est rejouable avec les scripts de [`outils/`](outils/README.md) :

- `grain-rendu.mjs` : rend le SVG de `body::after` seul, sur fond transparent
  en 240 × 240, et capture `/work` en 1440 × 900 ;
- `grain-mesure.mjs` : calcule luminance, écart-type, écart entre voisins et
  chroma sur des captures d'échantillons ;
- `cta-mobile.mjs` : mesure le double CTA du hero en 390 px, en FR et en EN ;
- `ecarts-espacement.mjs` : produit le tableau des écarts du §6.
