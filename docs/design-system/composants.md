# Composants — étape 3

Étape 3 du brief (`docs/design-system/BRIEF.md`) : les composants du site,
construits dans Figma à partir du code et des seules fondations de l'étape 2
(`docs/design-system/fondations.md`).

- **Date** : 8 octobre 2026
- **Branche** : `design-system`
- **Fichier Figma** : `kMLD5Ti9yCpnKU4jdVfWDJ`, page Composants (`113:4`)
- **Statut** : partie 1 (petits composants) validée le 8 octobre 2026, avec
  les arbitrages du §4, appliqués dans Figma. Partie 2 (grands composants) à
  faire, dans une nouvelle session.

## 1. Ce qui existe dans Figma

Relecture du fichier avant de commencer : variables (68 + 26 + 21), 59 styles
de texte, 13 styles d'effet, `effect/grain`, 20 grilles et les 9 planches de la
page Fondations sont identiques à la fin de l'étape 2. Aucune correction
manuelle ni annotation n'a été trouvée.

La page Composants suit le gabarit de la page Fondations : planches de 1440 de
large, retrait `space/112`, écart `space/40`, fond `color/bg/primary`, titre en
`overline` et `heading-2`, légendes en `meta` et `data`.

| Planche | Nœud | Contenu |
|---|---|---|
| `planche/en-tete` | `143:2` | titre et résumé |
| `planche/icones` | `143:6` | 4 icônes de flèche ; tailles d'usage 24, 18, 12, et `↔` à 12 (`155:166`) |
| `planche/roll` | `143:10` | jeu `roll` et légende du mécanisme |
| `planche/bouton` | `143:14` | jeu `button` en grille (`148:26`) ; exemples en clair et en sombre (`153:90`) |
| `planche/lien-nav` | `143:18` | jeu `link/nav` ; nav en clair et en sombre (`155:131`) |
| `planche/tag` | `143:22` | jeu `tag` ; rangée de filtres de l'index Services (`155:106`) |

| Composant | Nœud | Variantes | Propriétés (clés) |
|---|---|---|---|
| `icon/arrow-right` | `144:5` | — | — |
| `icon/arrow-up-right` | `144:11` | — | — |
| `icon/arrow-left-right` | `144:17` | — | — |
| `icon/arrow-left` | `144:23` | — | — |
| `roll` | `145:8` | `state` : default, hover | `label#145:0` |
| `button` | `148:27` | `style` (primary, ink, ghost) × `size` (md, sm) × `state` (default, hover, focus, disabled) : 24 | `label#148:0`, `icon#148:25`, `show icon#148:50`, `icon start#148:75`, `show icon start#148:100` |
| `link/nav` | `154:139` | `state` : default, hover, active, focus, disabled | `label#154:0` |
| `tag` | `155:105` | `state` : default, hover, active, focus, disabled | `label#155:0` |

Contrôle final, après les arbitrages :
- 346 peintures pleines sur 346 liées à une variable, chacune dans son scope ;
- aucun retrait, écart ou rayon en dur, hors épaisseurs de trait (§3) ;
- un style de texte sur chacun des 142 textes ;
- une description sur chaque composant ;
- « pas encore dans le code » sur 3 icônes, 18 variantes (focus et disabled
  partout, plus ghost · sm en default et hover) et les 24 flèches du bouton.

## 2. Composants

### Icônes de flèche (D8)

- Grille 24, trait 1,6, extrémités et angles arrondis, comme les flèches de la
  modale.
- Tracés :
  - `→` et `←` : flèches « suivant » et « précédent » de la modale
    (`Everest.js`) ;
  - `↗` : `→` tournée de −45°, coordonnées calculées
    (`M7.050 16.950L16.950 7.050M8.464 7.050L16.950 7.050L16.950 15.536`) ;
  - `↔` : les deux pointes de la modale, sur une tige allongée de 2 à 22
    (`M2 12H22M8 6L2 12L8 18M16 6L22 12L16 18`, arbitrage du §4).
- Trait lié à `color/text/primary` : les flèches prennent la couleur du texte,
  comme le `currentColor` du code. Le jeton a le scope `STROKE_COLOR`.
- Tailles d'usage par mise à l'échelle, le trait suit comme dans un SVG :
  18 px dans la modale (trait 1,2), 12 px dans un bouton (trait 0,8).
- Annotées « pas encore dans le code » : `arrow-right`, `arrow-up-right`,
  `arrow-left-right`. `arrow-left` existe tel quel dans le code.

### `roll`

- Une fenêtre qui coupe ce qui dépasse, deux copies du libellé alimentées par
  la même propriété `label`.
- `default` : la première copie occupe la fenêtre. `hover` : la pile a monté
  de 100 %.
- Écarts avec le code, documentés dans la description :
  - une seule pile pour tout le libellé, sans les 20 ms de décalage par
    caractère ;
  - la fenêtre prend l'interlignage du style (18 px pour `button`) au lieu de
    1,18 em. Le rendu statique est identique.

### `button` (D4)

| style | default | hover |
|---|---|---|
| primary (`.btn-blue`, `.btnf-blue`, `.cta`) | fond et filet `accent/default`, texte et icône `text/on-accent` | fond et filet `accent/hover` |
| ink (`.btn-ink`, `.btnf-ink`, `.sv2-cta`) | fond et filet `bg/inverse`, texte `text/on-inverse` | fond et filet `accent/default`, texte `text/on-accent` |
| ghost (`.btnf-ghost`) | sans fond, filet `border/strong`, texte `text/primary` | fond et filet `bg/inverse`, texte `text/on-inverse` |

- **focus** : l'apparence de default, plus le contour de focus (§3).
- **disabled** : sans fond, filet `border/default`, texte et icône
  `text/subtle`, quel que soit le style.
- **Tailles** :
  - `md` : retraits `space/12` / `space/24`, bordure de 1 px comprise dans la
    mise en page, comme la bordure CSS : 44 px ;
  - `sm` : retraits `space/8` / `space/16`, sans bordure (`.cta`) : 34 px.
  - Figma arrondit l'interlignage de 160 % à 18 px : 12 + 18 + 12 + 2 = 44 et
    8 + 18 + 8 = 34, les hauteurs validées. Sur le site corrigé : 43,6 et
    33,6.
- Écart `space/8`, rayon `radius/5`, style `text/desktop/button`, libellé
  papier sur aplat (D1).
- **Survol** : le roll monte et la flèche tourne de 45° autour du centre de son
  emplacement de 12 px, sans changer la largeur du bouton, comme un
  `transform` CSS.
- **Modes** :
  - en mode sombre, `ink` devient papier sur encre : c'est `.menu-btn` sur fond
    sombre ;
  - `ghost` se pose en mode sombre : `.btnf-ghost` n'existe que sur fond
    sombre.
- `ghost` · `sm` n'existe pas dans le code. Ses quatre variantes portent
  « pas encore dans le code » ; elles gardent la grille complète, pour que le
  changement de taille fonctionne sur toutes les instances.
- `icon start` : emplacement de tête, masqué par défaut, prévu pour le bouton
  menu (flocon à gauche, partie 2).
- Exemples de la planche : libellés i18n réels (`ab.more`, `ab.cv`, `sv.cta`,
  `cta.together`, `cw.all`, `lt.cta`, `foot.about`).

### `link/nav`

- `.nav-mid a` : libellé en roll, style `text/desktop/nav`, 53 px de large pour
  « Projets » (53,38 mesurés sur le site).
- `default` : `text/label` (`#1111118C` = `--muted` en clair ; papier .5 → .55
  en sombre, COL-09).
- `hover` : `accent/default`, et la pile du roll monte.
- `active` : page courante (`data-active`), bleu, style
  `text/desktop/nav-active` (Space Mono Bold).
- `focus` : contour sans rayon, comme un lien. `disabled` : `text/subtle`.

### `tag`

- `.svx-pill` : style `chip`, retraits `space/8` / `space/12` (6 / 10 dans le
  code), bordure de 1 px comprise, `radius/5` : 52 × 33 px.
- `default` : texte `text/primary`, filet `border/strong` (`--line-2`).
- `hover` : filet et texte `accent/default`.
- `active` : filtre sélectionné (`.on`), fond et filet bleus, texte papier (D1).
- Rangée d'exemple : `.svx-filters`, écart `space/8` (6 dans le code), retraits
  16 / 0 / 12 (14 / 0 / 12), catégories de `lib/services-data.js`.

## 3. Choix et mesures

### Flèche de 12 px dans les boutons

Mesure sur jimmyferon.com en 1440 × 900 (`outils/mesure-petits-composants.mjs`) :

| Glyphe | Boîte | Encre, canevas | Encre, pixels | Icône à 12 px |
|---|---|---|---|---|
| `→` (`.sv2-cta`, Consolas) | 6,72 × 17,59 | 8 × 5 | 6 × 4,25 | 7,8 × 6,8 |
| `↗` (`.cta`, Segoe UI Symbol) | 8,72 × 17,59 | 8 × 6 | 5,63 × 5,63 | 5,75 × 5,75 |

- À 12 px, `↗` a presque exactement l'encre du glyphe actuel ; `→` en a la
  largeur, avec une pointe un peu plus haute, celle du tracé de la modale.
- 12 px est aussi la taille du flocon de `.menu-btn`, seule icône que le code
  pose dans un bouton.
- Conséquence : un bouton s'élargit de 2 à 4 px (écart 8 et icône de 12, contre
  9 et une boîte de glyphe de 6,72 ou 8,72).

### États ajoutés (D5)

- **Focus** : la recette de `.ev-modal-arrow`. Contour de 2 px en
  `color/accent/default`, décalé de 2, posé en calque absolu qui s'étire avec
  le composant. Rayon `radius/5` sur le bouton et le tag : le navigateur
  l'arrondirait à 7 (5 + décalage), et aucun jeton ne vaut 7. Le lien n'a pas
  de rayon.
- **Disabled** : texte et icône `color/text/subtle`, filet
  `color/border/default`, sans fond.
- **« Actif » du brief** :
  - le bouton n'en a pas : le code n'en définit aucun, et D5 n'ouvre que focus
    et désactivé ;
  - il désigne la page courante pour `link/nav` et le filtre sélectionné pour
    `tag`.

### Ce qui n'est pas lié à une variable

- Les épaisseurs de trait : 1 px pour les bordures, 2 px pour le focus.
  Aucune variable d'épaisseur n'existe dans les fondations.
- La géométrie fixe : emplacements d'icône de 12 px, décalage du contour de
  focus, position de la seconde copie du roll.

## 4. Arbitrages de la partie 1 (8 octobre 2026)

1. **Style `nav-active`, ajouté.** Figma détachait le style de l'état
   `active` de `link/nav` dès que la graisse passait en Bold.
   - `text/desktop/nav-active` et `text/mobile/nav-active` reprennent toutes
     les valeurs de `nav` (Space Mono 11, interlignage auto, +8 %, capitales),
     en Bold : aucune valeur nouvelle (D6 : « nav, actif : Bold »).
   - Rangés juste après `nav` ; appliqués aux deux copies de l'état `active`.
   - Page Fondations : un spécimen sous `nav` sur chaque planche typo, et les
     compteurs passés à 61 styles (30 desktop, 31 mobile).
2. **Scope `STROKE_COLOR`, ajouté** à cinq jetons, avec une ligne « Trait : »
   dans leur description. Aucune valeur nouvelle.
   - `color/text/primary`, `on-accent`, `on-inverse`, `subtle` : traits des
     icônes (`currentColor`).
   - `color/bg/inverse` : bordure de la couleur du fond (`.btn-ink`, survol de
     `.btnf-ghost`).
3. **`ghost` · `sm`, gardé** avec l'annotation « pas encore dans le code »,
   pour que la grille de variantes reste complète.
4. **`↔`, redessinée.** Les pointes de la modale, à 2 unités l'une de l'autre,
   se lisaient comme un losange barré. La tige est allongée de 2 à 22 (au lieu
   de 5 à 19) ; pointes et trait de 1,6 inchangés.
   - Essai rendu à 12 px, au pixel près :
     - 5 → 19 : les pointes se referment en boucle ;
     - 3 → 21 : lisible, mais les pointes tombent sur des demi-pixels et
       floutent ;
     - 2 → 22 : pointes et extrémités sur des pixels entiers (1, 4, 8, 11),
       trois colonnes de vide entre les pointes. Retenu.
   - Vérification documentée sur la planche Icônes : `↔` à 12 px.
5. **Bouton icône (CMP-08) et bouton menu** ouvriront la partie 2 : leurs
   icônes ne sont pas des flèches, et ils ne servent que dans les grands
   composants (modale, cartes, mode d'emploi, header).

## 5. Corrections à faire sur le site

Rien de nouveau par rapport à la liste de l'audit (§10). La partie 1 précise
deux lignes existantes :

| Correction | Origine |
|---|---|
| Flèches des boutons en SVG de 12 px (grille 24, trait 1,6 mis à l'échelle), écart 8 | D8, TYP-13 |
| Focus visible : contour de 2 px `--blue` décalé de 2 sur les boutons, les liens de nav et les filtres | D5, CMP-04 |
| Croix de la modale (`.ev-modal-x`) : fond papier .12 et survol des flèches (fond papier, icône encre), au lieu de .1 et .22 | partie 2, arbitrage du 8 octobre |

## 6. Pour la page Motion (étape 4)

- **Effet roll : le site décale chaque lettre de 20 ms.** `Roll.js` pose
  `transition-delay: i × 0,02 s` sur chaque caractère : la montée de .3 s en
  `cubic-bezier(.65,0,.2,1)` balaie le libellé de gauche à droite. Le
  composant `roll` de Figma n'a qu'une pile par libellé et ne reproduit pas ce
  décalage : la page Motion doit le montrer.
- **Flèche des boutons au survol** : rotation de 45° en .3 s, `var(--e)` sur
  `.btnf`, `cubic-bezier(.65,0,.2,1)` sur `.cta`.

## Partie 2 : en cours (8 octobre 2026, interrompue par la limite d’usage)

Construit dans Figma, vérifié par capture, **pas encore validé**. Planches
ajoutées sous `planche/tag`, empilées à x = 0 :

| Planche | Nœud | Composants |
|---|---|---|
| `planche/icones-interface` | `169:134` | `icon/close` `169:141`, `plus` `169:148`, `minus` `169:154`, `fullscreen-enter` `169:160`, `fullscreen-exit` `169:166`, `icon/flake` (open) `170:151`, `chevron-down` `170:156`, `figma` `170:163` |
| `planche/logo` | `171:134` | `logo` `171:144` |
| `planche/surtitre` | `172:149` | `eyebrow` `172:153` |
| `planche/bouton-icone` | `173:161` | `icon-button/solid` `173:185` (38), `tint` `174:204` (40, 36, mode sombre), `bare` `174:251` (30, 26) |
| `planche/bouton-menu` | `175:221` | `menu-button` `175:340` (button ink · sm + flocon) |
| `planche/grain` | `176:338` | `grain` `176:345` (site, card, row) |
| `planche/crete` | `177:344` | `ridge` `177:356` (dark, light × desktop 1200, mobile 390) |
| `planche/langue` | `178:345` | `lang/option` `178:364`, `lang` `178:392`, `lang/toggle` `180:588` |
| `planche/header` | `179:368` | `header/desktop` `179:461` (top, compact), `header/mobile` `181:615` (top, compact, menu-open) |
| `planche/liens` | `180:506` | `link/menu` `180:526`, `link/social` `180:539` |
| `planche/carte-projet` | `183:586` | `card/project` `183:656` (visuel, logo animé, barre) |

Reste à faire : modale, accordéon FAQ, footer (avec `link/footer`, `link/email`,
`link/top`, capture du lac), drapeaux de sommet (étiquette, fanion, indicateur
de bord), altimètre, encadré mode d’emploi, carte et ligne Services ; puis le
contrôle final (peintures liées, styles, descriptions, annotations).

Ajouts validés le 8 octobre 2026 (aucune valeur nouvelle) :

- jeton `color/overlay/button` (papier .12, `.ev-modal-x` .1 fusionné) ;
- scope `SHAPE_FILL` sur `color/text/primary` (logo, marque Figma) et
  `color/text/on-accent` (pastille de la ligne Services) ;
- survol de `.ev-modal-x` aligné sur celui des flèches (correction à faire,
  §5) ; icône par défaut commune à chaque jeu de boutons icônes (flèche,
  plus) ;
- styles `sign` (± de la FAQ, Bricolage Regular 20,8) et `help-strong` (Bold
  du mode d’emploi) ; altimètre sur la hiérarchie du hero clair ; papier .26
  (`.foot-topbtn`) rattaché à `color/text/subtle`.

Notes techniques : les WebP importés ne s’affichent pas dans Figma (convertir
en JPEG avec le navigateur) ; une planche qui grandit recouvre la suivante,
il faut réempiler ; la propriété de permutation d’icône est commune à tout un
jeu. Mesures du site : `outils/mesure-grands-composants.mjs`.

## 7. Notes pour la partie 2

- **Peintures liées.** `setBoundVariableForPaint` ne résout pas la couleur.
  Si un nœud est déjà lié au même jeton, Figma garde la couleur stockée, qui
  vaut alors le noir de base. Il faut poser la valeur résolue
  (`resolveForConsumer`) dans la peinture.
- **Instances.** `use_figma` saute par défaut les enfants invisibles des
  instances : mettre `figma.skipInvisibleInstanceChildren = false` pour
  atteindre l'emplacement d'icône de tête.
- **Permutation d'icône.** Repasser à `icon` la flèche déjà en place
  réinitialise la couleur de la flèche ; une vraie permutation, aller-retour
  compris, la garde.
