# Fondations — étape 2

Étape 2 du brief (`docs/design-system/BRIEF.md`) : variables, styles de texte,
espacements, rayons, effets et grilles, construits dans Figma à partir de
l'audit validé (`docs/design-system/audit.md`).

> **Règle du 8 octobre 2026, prioritaire.** Le site ne change pas : les
> valeurs du code sont les bonnes, et le design system les reproduit
> exactement. Les fondations ont été reprises ce jour-là : plus d'échelle
> d'espacement, plus de rôles fusionnés, un style de texte par classe. Les
> arbitrages de l'étape 2 que la règle remplace sont marqués au §4.

- **Date** : 7 octobre 2026 ; reprise aux valeurs exactes le 8 octobre 2026
- **Branche** : `design-system`
- **Fichier Figma** : `kMLD5Ti9yCpnKU4jdVfWDJ`, page Fondations (`113:3`)
- **Statut** : validé le 7 octobre 2026 ; reprise du 8 octobre construite et
  contrôlée, en attente de validation

## 1. Ce qui existe dans Figma

| Élément | Contenu |
|---|---|
| Pages | Fondations `113:3`, Composants `113:4`, Marque `113:5`, Motion `113:6`, ajoutées après Matière et Templates, qui n'ont pas été touchées |
| Collection `primitives` | mode `valeur` · 105 variables : 67 couleurs, 31 espacements `space/…`, 7 `radius/…` |
| Collection `semantic` | modes `clair` et `sombre` · 50 couleurs, toutes en alias de primitives |
| Collection `responsive` | modes `desktop` (1440 × 900) et `mobile` (390 × 844) · 36 jetons |
| Styles de texte | 118, un par classe du code : 66 `text/desktop/…`, 52 `text/mobile/…` |
| Styles d'effet | 14 : 9 `shadow/…`, 5 `blur/…` |
| Style de remplissage | 1 : `effect/grain` |
| Styles de grille | 20 : `grid/{largeur}/{usage}` |

Contrôle final (8 octobre) :
- aucune variable en `ALL_SCOPES`, aucun alias cassé ;
- toutes les variables et tous les styles ont une description ;
- sur la page Fondations, 1 671 peintures pleines sur 1 671 liées à une
  variable, aucune liaison vers une variable supprimée, un style sur chaque
  texte. Les 114 écarts des spécimens qui pointaient encore vers les pas 14 et
  2 supprimés à l'étape 2 sont reliés aux nouveaux `space/14` et `space/2`.

### Page Fondations

Neuf planches de 1440 de large, empilées, construites avec le système
lui-même (fonds et textes en jetons sémantiques, styles de texte, `space/…`) :

| Planche | Nœud | Contenu |
|---|---|---|
| `planche/en-tete` | `120:2` | titre et résumé |
| `planche/couleurs-primitives` | `120:6` | 67 pastilles liées ; paliers du papier, du blanc et du blanc cassé dans un panneau en mode sombre |
| `planche/couleurs-semantiques` | `120:225` | les 50 rôles, en clair et en sombre côte à côte |
| `planche/typo-desktop` | `121:2` | 66 spécimens sur de vrais textes du site (`lib/i18n.js`) |
| `planche/typo-mobile` | `122:2` | 52 spécimens, texte d'essai sur 350 px |
| `planche/espacements` | `122:157` | les 31 valeurs du code, avec leurs usages ; jetons `responsive` en desktop et en mobile |
| `planche/rayons-effets` | `123:2` | rayons (2, 3, 4, 5, 8, footer), 9 ombres (dont `shadow/menu` en sombre), flous, lueurs du hero et du footer |
| `planche/grain` | `125:2` | test D11, mesures, style `effect/grain` retenu |
| `planche/grilles` | `129:2` | écrans 1440, 1400, 1024, 900, 760, 390 avec leurs grilles |

## 2. Variables

### `primitives`

- **Couleurs pleines (15)** : `color/paper`, `ink`, `blue` (marque) ; `white`,
  `blue-hover`, `blue-light`, `grey-card`, `grey-line`, `grain-accent`,
  `grain-accent-dark`, `veil`, `ink-soft` (#161616), `ink-deep` (#0E0E0E),
  `ink-particle` (#141414), `ink-scroll` (rgba(16,19,18,.45)) (interface).
- **Paliers d'alpha (52)**, tous ceux que le code utilise :
  - `color/ink/…`, 16 : a05, a13, a22, a25, a26, a35, a38, a45, a50, a55,
    a65, a70, a72, a86, a94, a97 ;
  - `color/paper/…`, 25 : a05, a08, a10, a12, a14, a16, a20, a22, a28, a30,
    a34, a42, a45, a50, a55, a60, a65, a72, a74, a75, a78, a80, a85, a88,
    a92 ;
  - `color/white/a10`, `a50`, `a75` ; `color/off-white/a45` (`#f4f6f573`) et
    `a26` (`#f4f6f542`) ;
  - `color/blue/a15`, `a50`, `a55`, `a80` ; `color/black/a60`, `a90`.

  Les 67 couleurs sont masquées des sélecteurs : on utilise les sémantiques.
- **Espacements `space/…` (31)**, scope `GAP` : les valeurs fixes du code, une
  par primitive, avec leurs usages en description (§2.4).
- **`radius/…` (7)** : 2, 3, 4 (mode d'emploi), 5 (rayon de la marque), 8
  (menu de langue), 20 et 38 (masqués, utilisés par `radius/footer`).

### `semantic` (clair / sombre)

Chaque jeton reprend les valeurs exactes d'un usage du code, en clair et en
sombre. Un usage qui n'existe que sur fond sombre a la même valeur dans les
deux modes.

| Groupe | Jeton : clair · sombre |
|---|---|
| Fond | `bg/primary` papier · encre ; `bg/surface` blanc ; `bg/card` #E0E2E8 ; `bg/inverse` encre · papier ; `bg/hover` encre .05 · papier .08 ; `bg/menu` papier · #161616 ; `bg/modal-shot` #0E0E0E ; `bg/ink` encre (boutons encre) |
| Texte | `text/primary` encre · papier ; `muted` encre .55 · papier .6 ; `label` encre .55 · papier .55 ; `label-dim` encre .55 · papier .5 ; `label-faint` papier .42 ; `subtle` encre .38 · papier .45 ; `on-accent` blanc ; `on-accent-muted` blanc .75 ; `on-accent-subtle` blanc .5 ; `cta` papier ; `on-inverse` papier · encre ; `menu-link` papier .85 ; `menu-separator` papier .3 ; `modal-summary` papier .74 ; `help` papier .72 ; `footer` #F4F6F5 .45 ; `footer-top` #F4F6F5 .26 ; `ridge` papier .34 |
| Accent | `accent/default` bleu ; `hover` #0F17C2 ; `on-dark` #7D86FF |
| Bordure | `border/default` encre .13 · papier .14 ; `strong` encre .26 · papier .28 ; `header` #E5E5E5 · papier .14 ; `menu` encre .13 · papier .16 ; `header-mobile` blanc .1 ; `footer` papier .16 ; `menu-rule` papier .1 ; `flagpole` papier .8 |
| Voile | `overlay/header` papier .78 · encre .72 ; `header-compact` papier .92 · encre .86 ; `header-mobile` encre .94 ; `menu` encre .97 ; `modal` rgba(10,10,10,.86) ; `dim` encre .7 ; `cal` encre .65 ; `flag` papier .88 ; `button` papier .12 ; `close` papier .1 ; `close-hover` papier .22 |
| Ombre | `shadow/menu` encre .25 · noir .6 |
| Lueur | `glow` bleu .5 (hero, clair) · bleu .55 (footer, sombre) |

### `responsive` (desktop / mobile)

- **Marges et header.** `layout/page-pad` vaut 60 / 20 (`var(--pad)` : hero,
  `.wrap`, scène). `layout/nav-pad` (nav) et `layout/footer-pad` (`.foot-pad`)
  valent 56 / 20. `layout/section-inset` vaut 112 / 20. `layout/header-height`
  vaut 64 (`var(--hh)`). `radius/footer` vaut 38 / 20 (`clamp(20px,3vw,38px)`).
- **Rythme vertical (ESP-06).** Valeurs à 900 et 844 de haut, formule en
  description : `section/hero/height`, et `top` / `bottom` pour `manif`,
  `services`, `client-work`, `about`, `faq`, `lets-talk`, `footer`, `page`.
- **Valeurs fluides des composants**, résolues à 1440 × 900 et 390 × 844 :
  `section/lets-talk/rule-inset` (112 / 40), `eyebrow-gap` (— / 46,42),
  `inner-right` (43,2 / 0) ; `section/services/card-pad` (37,44 / 26), `gap`
  (100,8 / 36) ; `section/footer/cols-gap` (86,4 / 32), `mid` (45 / 42,2),
  `cta-top` (30,6 / 28,7), `ridge-top` (22,5 / 21,1), `ridge-height`
  (144 / 135,04), `bot-top` (27 / 25,32), `glow-width` (660 / 360),
  `glow-height` (420 / 230).

### 2.4 Espacements : les valeurs du code

Chaque padding, margin et gap fixe du code a sa primitive, à sa valeur
exacte : rien n'est arrondi. Usages relevés par
`outils/usages-espacement.mjs` (règles vivantes ; les marges et rythmes de
section sont dans `responsive`).

| Primitive | Usages |
|---|---|
| `space/1` | `.pcard-bar-txt`, `.ev-mark` (gap) |
| `space/2` | `.lang-trigger`, `.fq-item`, `.hx-lang button` (padding) ; `.hb-lbl` (margin-bottom) |
| `space/3` | `.hx-links`, `.hx-contact` (gap) |
| `space/4` | `.lang-menu`, `.foot-col a` (padding) ; `.ev-modal-meta dt` (margin-bottom) |
| `space/5` | `.lang-trigger` (gap) |
| `space/6` | `.lang-trigger`, `.svx-toggle`, `.svx-pill` (padding) ; `.lang-menu` (margin-top) ; `.svx-filters`, `.svx-go`, mode d'emploi rangé (gap) ; `.ev-eq` (margin) |
| `space/7` | `.lang-menu button`, `.ev-mark`, `.ev-edge` (padding) ; `.cta`, surtitres (gap) ; `.ev-modal-cat` (margin-top) |
| `space/8` | `.menu-btn`, `.svx-toggle`, `.bn3-campalt` (gap) ; `.svx-head`, `.ev-mark` (padding) ; `.hx-label` (margin) |
| `space/9` | `.btnf`, `.sv2-list li`, `.foot-figma` (gap) ; `.cta`, `.menu-btn`, `.svx-row`, `.pcard-bar` (padding) |
| `space/10` | `.lang-menu button`, `.svx-pill`, `.svx-head`, `.svx-row` (padding) ; `.svx-row`, `.hx-lang` (gap) ; titres de la modale et des sommets (margin-top) |
| `space/11` | `.ev-help-body` (gap) |
| `space/12` | `.pcard-bar`, `.fq-list` (gap) ; `.svx-filters` (padding-bottom) ; `.ev-edge-t` (padding) |
| `space/13` | `.btnf`, `.hx-nav a` (padding) ; `.sv2-title` (margin-top) |
| `space/14` | `.cta`, `.menu-btn`, `.pcard-bar` (padding) ; `.foot-cta-row`, `.foot-bot`, `.ev-modal-nav` (gap) ; `.foot-col h4`, `.f-hook` (margin-bottom) ; `.sv2-body`, `.ev-modal-over` (margin-top) |
| `space/15` | `.svx-row:hover .svx-name` (padding-left) |
| `space/16` | `.fq-title` (margin-top), `.fq-a p` (padding-top), `.hx-bot` (gap), `.ev-edge-l` / `-r` (padding) |
| `space/18` | `.fq-q`, `.ev-modal-wrap` (gap) ; `.menu-logo` (margin-top) ; `.foot-bot` (padding-top) |
| `space/19` | `.hx-body` (padding-top) |
| `space/20` | `.fq-q` (padding), `.hx-grid` (gap en ligne), `.ev-modal-meta` (margin-top) |
| `space/22` | `.sv2-card + .sv2-card` (margin-top), `.fq-a p` (padding-bottom), `.hx-body` (padding-bottom), `.hx-grid` (gap en colonne) |
| `space/24` | `.btnf` (padding), `.nav-mid` (gap), `.nav-cta` (margin-left), `.ev-help-body` (padding) |
| `space/26` | `.fq-item` (padding), `.fq-title` (margin-bottom) |
| `space/30` | `.foot-top` (gap), `.ev-help-body` (padding) |
| `space/32` | `.foot-cols` ≤ 560 (gap en colonne) |
| `space/34` | `.lt-cta`, `.cw-all`, `.hx-bot` (margin-top) |
| `space/36` | `.ev-modal-meta` (gap), `.foot-top` ≤ 900, `.sv2-grid` ≤ 760 |
| `space/38` | mode d'emploi rangé (padding-top) |
| `space/40` | `.sv2-cta` (margin-top) |
| `space/56` | nav, `.foot-pad` (padding) ; `.ev-modal` (padding à 1440) |
| `space/64` | hauteur du header (`--hh`) |
| `space/112` | retrait des sections desktop |

## 3. Styles

- **Texte.**
  - 118 styles, un par classe du code, en deux jeux (D6) : la table est au
    §3.4 de l'audit. Deux classes ne partagent un style que si toutes leurs
    valeurs sont identiques.
  - Les titres sans `line-height` propre gardent le 160 % hérité du body (D7).
  - Les lettres du roll ont leur interlignage du code, 1.18 (`.roll .rl`) :
    `button-roll`, `nav-roll`, `nav-active-roll`.
  - Le mode d'emploi garde son approche de 1,512 px, héritée de la taille du
    body ; rangé ouvert, il passe en 8 px (`help-docked`,
    `help-docked-strong`).
  - `display` et `display-lt` portent le retrait de première ligne du code
    (`text-indent`, 144 en desktop, 56 en mobile).
  - Scopes ajoutés aux jetons de texte pour les icônes et le logo en
    currentColor : `STROKE_COLOR` sur `primary`, `on-accent`, `on-inverse`,
    `subtle`, `label`, `label-dim` et `muted` ; `SHAPE_FILL` sur `primary` et
    `on-accent`.
  - Bricolage porte son axe `opsz` réglé sur la taille, borné à 12–96 (D9).
  - Classes CSS et formules en description (D10).
  - Figma arrondit la hauteur d'une ligne de texte au pixel le plus proche
    (17,6 → 18) et ne compte pas l'approche après la dernière lettre : les
    valeurs sont exactes, les boîtes peuvent différer d'une fraction de pixel
    par ligne.
- **Ombres.** `shadow/header`, `header-menu`, `menu`, `card`, `card-bar`,
  `flag`, `flag-hover`, `modal`, `text`. Leur couleur est liée à une primitive.
  Celle de `shadow/menu` est liée à `color/shadow/menu`, qui passe d'encre .25
  à noir .6 en mode sombre.
- **Flous.** `blur/header` 28, `blur/flag` 16, `blur/overlay` 8,
  `blur/glow-hero` 116, `blur/glow-footer` 132. Le rayon de flou Figma vaut le
  double du flou CSS : `blur(14px)` donne 28 dans Figma, et Dev Mode divise
  par deux à l'export. La valeur CSS est en description.
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

La règle du 8 octobre en remplace plusieurs ; chacun est marqué.

1. **Grain (D11) : motif image.** Le style `effect/grain`, posé sur un calque
   normal, mesure exactement comme le motif du test (§5). *Toujours valable.*
2. **Bouton mobile.** `text/mobile/button` reste à 11 px et .06em, les
   valeurs de `.btnf` en mobile. *Remplacé le 8 octobre* pour le double CTA
   du hero, qui garde ses 10 px et .05em : style `button-hero`.
3. **Code syntax.** Elle n'est posée que lorsqu'une seule expression CSS vaut
   dans tous les modes ; sinon, la description donne les deux valeurs.
   *Toujours valable.*
4. **Voiles.** *Remplacé le 8 octobre* : les voiles fusionnés sont séparés,
   chacun à sa valeur. `overlay/header-mobile` (header compact, .94) et
   `overlay/menu` (menu ouvert, .97) ; `overlay/dim` (indicateur de bord, .7)
   et `overlay/cal` (modale cal.com, .65). Les primitives `ink/a94` et
   `ink/a65` sont revenues.
5. **Papier .26** (`#f4f6f542`, `.foot-topbtn`) : *remplacé le 8 octobre*,
   c'est le blanc cassé du code, jeton `color/text/footer-top`.
6. **Espacements.** *Remplacé le 8 octobre* : l'échelle de 14 pas sur une
   base de 4 laisse place aux 31 valeurs du code (§2.4). Les pas 48, 80 et
   96, qui n'existaient pas dans le code, sont supprimés.

Choix de l'étape 2 toujours valables :
- flous saisis au double de la valeur CSS ;
- apostrophe typographique ’ dans les descriptions, parce que Figma réécrit
  l'apostrophe droite en `&#39;` (de même `>` en `&gt;` : écrire « au-dessus
  de 1024 »).

*Remplacé le 8 octobre* : une seule lueur. Les deux lueurs du code ont chacune
leur valeur, réunies dans le rôle `color/glow` (§2).

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

## 6. Ce que l'étape 2 laissait à l'étape 3

Tout est fait (`composants.md`) :

- `.foot-topbtn` : son blanc cassé exact, `color/text/footer-top` ;
- composant `grain` (site, card, row) ;
- tailles des boutons : celles du code, 45,6 (`.btnf`), 35,6 (`.cta`) et 34
  (`.menu-btn`) ;
- valeurs fluides des composants : résolues à 1440 et à 390 dans la
  collection `responsive` (§2) ;
- composant `ridge` avec ses décalages ;
- états focus et désactivé sur tous les éléments cliquables (D5).

## 7. Outils

Tout est rejouable avec les scripts de [`outils/`](outils/README.md) :

- `grain-rendu.mjs` : rend le SVG de `body::after` seul, sur fond transparent
  en 240 × 240, et capture `/work` en 1440 × 900 ;
- `grain-mesure.mjs` : calcule luminance, écart-type, écart entre voisins et
  chroma sur des captures d'échantillons ;
- `cta-mobile.mjs` : mesure le double CTA du hero en 390 px, en FR et en EN ;
- `usages-espacement.mjs` : liste, pour chaque valeur fixe d'espacement du
  code, les règles qui l'utilisent (descriptions des `space/…`, §2.4) ;
- `regles-css.mjs` : toutes les règles d'un sélecteur, @media compris ; c'est
  la lecture du code exact de chaque composant ;
- `ecarts-espacement.mjs` : historique, les écarts à l'échelle de l'étape 2,
  abandonnée le 8 octobre.
