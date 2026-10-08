# Composants — étape 3

Étape 3 du brief (`docs/design-system/BRIEF.md`) : les composants du site,
construits dans Figma à partir du code et des fondations
(`docs/design-system/fondations.md`).

> **Règle du 8 octobre 2026, prioritaire.** Le site ne change pas : les
> valeurs du code sont les bonnes, et les composants les reproduisent
> exactement. Les deux parties ont été reprises ce jour-là (§5 et §12) ; les
> listes « corrections à faire sur le site » n'existent plus.

- **Date** : 8 octobre 2026
- **Branche** : `design-system`
- **Fichier Figma** : `kMLD5Ti9yCpnKU4jdVfWDJ`, page Composants (`113:4`)
- **Statut** : partie 1 (petits composants) validée le 8 octobre 2026 ; partie
  2 (grands composants) construite le même jour ; les deux reprises aux
  valeurs exactes du code le 8 octobre (§5, §12), en attente de validation

## 1. Ce qui existe dans Figma

La page Composants suit le gabarit de la page Fondations : planches de 1440 de
large, retrait `space/112`, écart `space/40`, fond `color/bg/primary`, titre en
`overline` et `heading-2`, légendes en `meta` et `data`.

| Planche | Nœud | Contenu |
|---|---|---|
| `planche/en-tete` | `143:2` | titre et résumé |
| `planche/icones` | `143:6` | 4 icônes de flèche ; tailles d'usage 24, 18, 12, et `↔` à 12 (`155:166`) |
| `planche/roll` | `143:10` | jeu `roll` et légende du mécanisme |
| `planche/bouton` | `143:14` | jeu `button` en grille de huit rangées (`148:26`) ; exemples en clair et en sombre (`153:90`) |
| `planche/lien-nav` | `143:18` | jeu `link/nav` ; nav en clair et en sombre (`155:131`) |
| `planche/tag` | `143:22` | jeu `tag` ; rangée de filtres de l'index Services (`155:106`) |

| Composant | Nœud | Variantes | Propriétés (clés) |
|---|---|---|---|
| `icon/arrow-right` | `144:5` | — | — |
| `icon/arrow-up-right` | `144:11` | — | — |
| `icon/arrow-left-right` | `144:17` | — | — |
| `icon/arrow-left` | `144:23` | — | — |
| `roll` | `145:8` | `state` : default, hover | `label#145:0` |
| `button` | `148:27` | `family` (btnf, btn) × `style` (primary, ink, ghost) × `size` (md, sm) × `state` (default, hover, focus, disabled) : 32 ; la famille `btn` n'a que primary et ink en md, comme le code | `label#148:0`, `icon#148:25`, `show icon#148:50`, `icon start#148:75`, `show icon start#148:100` |
| `link/nav` | `154:139` | `state` : default, hover, active, focus, disabled | `label#154:0` |
| `tag` | `155:105` | `state` : default, hover, active, focus, disabled | `label#155:0` |

Le contrôle de toute la page est au §8.

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
- Propres à Figma, annotées « pas encore dans le code » : `arrow-right`,
  `arrow-up-right`, `arrow-left-right`. `arrow-left` existe tel quel dans le
  code.

### `roll`

- Une fenêtre qui coupe ce qui dépasse, deux copies du libellé alimentées par
  la même propriété `label`.
- `default` : la première copie occupe la fenêtre. `hover` : la pile a monté
  de 100 %.
- La fenêtre a la hauteur de ligne du code, `.roll .rl{line-height:1.18}` :
  style `button-roll` (13 px pour 11 px), `nav-roll` dans la nav.
- Écart avec le code, documenté dans la description : une seule pile pour tout
  le libellé, sans les 20 ms de décalage par caractère (page Motion).

### `button` (D4)

Deux familles, comme le code. `.btn-blue` et `.btn-ink` s'emploient toujours
avec `.btnf`, dont ils ne changent que les survols.

| family · style | Classes | default | hover |
|---|---|---|---|
| btnf · primary | `.btnf-blue` | fond et filet `accent/default`, texte et icône `text/on-accent` (#fff) | fond `accent/hover`, filet bleu gardé |
| btnf · ink | `.btnf-ink` | fond et filet `bg/ink`, texte #fff | aucun changement de couleur |
| btnf · ghost | `.btnf-ghost` | sans fond, filet `border/strong`, texte `text/primary` | fond et filet `bg/inverse`, texte `text/on-inverse` |
| btn · primary | `.btn-blue` | comme btnf · primary | fond et filet `accent/hover` |
| btn · ink | `.btn-ink`, `.sv2-cta` | comme btnf · ink | fond et filet `accent/default`, texte #fff |

- **Tailles** :
  - `md` = `.btnf` : padding 13px 24px (`space/13`, `space/24`), gap 9px,
    bordure de 1 px comprise : 45,6 px, comme le site (45,59) ;
  - `sm` · primary = `.cta` (CTA du header) : padding 9px 14px, gap 7px, sans
    bordure, libellé papier (`text/cta`), flèche #fff : 35,6 px ;
  - `sm` · ink = `.menu-btn` : padding 9px 14px, gap 8px, sans bordure, style
    `nav` (.08em, line-height normal), papier sur encre, encre sur papier en
    mode sombre, pas de survol : 34 px sans flèche ;
  - `sm` · ghost : propre à Figma (annoté), padding 9px 14px, gap 7px, filet
    intérieur.
- **Roll** : lettres en `button-roll` (13 px de haut). La flèche dessinée se
  place dans un emplacement de 12 × 17,6, la boîte de ligne du glyphe du code
  (`.arr`, 11 px × 1,6) : c'est lui qui donne la hauteur du bouton.
- Rayon `radius/5`.
- **Survol** : le roll monte et la flèche tourne de 45° autour du centre de son
  emplacement, sans changer la largeur du bouton, comme un `transform` CSS.
- **Modes** : `ghost` se pose en mode sombre (`.btnf-ghost` n'existe que sur
  fond sombre) ; `ink` · `md` garde son encre dans les deux modes, comme le
  code ; `ink` · `sm` s'inverse en mode sombre, comme `.menu-btn` dans le
  header compact.
- `icon start` : emplacement de tête, masqué par défaut, pour le flocon du
  bouton menu.
- Exemples de la planche : libellés i18n réels ; About en famille `btn`
  (`ab.more`, `ab.cv`), Services au survol (`sv.cta`, `.sv2-cta`), CTA du
  header ; en sombre, `cw.all`, `lt.cta`, `cta.together`, `foot.about`.

### `link/nav`

- `.nav-mid a` : libellé en roll, lettres en `nav-roll` (Space Mono 11, .08em,
  line-height 1.18 : 13 de haut), 53 px de large pour « Projets » (53,38 sur
  le site).
- `default` : `color/text/label-dim` (`#1111118C` en clair,
  rgba(245,245,245,.5) sur fond sombre).
- `hover` : `accent/default`, et la pile du roll monte.
- `active` : page courante (`data-active`), bleu, `nav-active-roll`.
- `focus` : contour sans rayon, comme un lien. `disabled` : `text/subtle`.

### `tag`

- `.svx-pill` : style `chip`, padding 6px 10px (`space/6`, `space/10`),
  bordure de 1 px comprise, `radius/5` : 29 px de haut.
- `default` : texte `text/primary`, filet `border/strong` (`--line-2`).
- `hover` : filet et texte `accent/default`.
- `active` : filtre sélectionné (`.on`), fond et filet bleus, texte #fff.
- Rangée d'exemple : `.svx-filters`, gap 6px, padding 14px 0 12px, catégories
  de `lib/services-data.js`.

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
- L'icône vit dans un emplacement de 12 × 17,6, la boîte de ligne du glyphe :
  le bouton garde la hauteur du site. Il s'élargit de 3,3 à 5,3 px (12 contre
  6,72 ou 8,72) : c'est le seul écart, propre à la flèche dessinée. Les écarts
  sont ceux du code, 9 (`.btnf`) et 7 (`.cta`).

### États ajoutés (D5)

- **Focus**, là où le code n'en a pas : la recette de `.ev-modal-arrow`.
  Contour de 2 px en `color/accent/default`, décalé de 2, posé en calque
  absolu qui s'étire avec le composant. Rayon `radius/5` sur le bouton et le
  tag (le navigateur l'arrondirait à 7, rayon et décalage). Le lien n'a pas de
  rayon. Annoté « pas encore dans le code ».
- **Focus du code** (scène Everest), repris tel quel, sans annotation :
  étiquette de sommet (décalage 3), flèches de la modale (2), bouton du mode
  d'emploi (−3, rayon 4), plein écran (4, rayon 3). Le contour de l'indicateur
  de bord est coupé par son `clip-path` : seul le fond bleu se voit.
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
- La géométrie fixe : emplacements d'icône (12 × 17,6 dans les boutons),
  décalage du contour de focus, position de la seconde copie du roll.

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
   - `color/bg/inverse` : bordure de la couleur du fond (survol de
     `.btnf-ghost` ; `.btn-ink` est passé sur `color/bg/ink` le 8 octobre).
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

## 5. Reprise du 8 octobre (partie 1)

La liste « corrections à faire sur le site » de la partie 1 est supprimée ;
chacune de ses lignes est revenue dans Figma à la valeur du site :

- flèches des boutons : la flèche dessinée reste (D8), avec les écarts du
  code, 9 et 7, et l'emplacement de 12 × 17,6 ;
- focus visible : propre à Figma là où le code n'en a pas (D5) ;
- croix de la modale : fond .1, survol .22 (`icon-button/tint` 36, §12).

Ce que la reprise a changé dans les petits composants :

- `button` : deux familles (`family`), leurs survols, texte #fff, libellé
  papier du `.cta`, hauteurs 45,6 / 35,6 / 34, `ink` · `sm` aux valeurs de
  `.menu-btn` (nav, .08em, écart 8), fond `bg/ink` pour l'encre ;
- `roll` et `link/nav` : lettres à line-height 1.18 (`button-roll`,
  `nav-roll`, `nav-active-roll`) ; nav en `color/text/label-dim` ;
- `tag` : padding 6px 10px, rangée à 6, padding 14px 0 12px.

*Jusqu'au 8 octobre : un seul bouton à survols alignés, 44 et 34 px, écart 8,
roll à la hauteur de ligne du style.*

## 6. Pour la page Motion (étape 4)

- **Effet roll : le site décale chaque lettre de 20 ms.** `Roll.js` pose
  `transition-delay: i × 0,02 s` sur chaque caractère : la montée de .3 s en
  `cubic-bezier(.65,0,.2,1)` balaie le libellé de gauche à droite. Le
  composant `roll` de Figma n'a qu'une pile par libellé et ne reproduit pas ce
  décalage : la page Motion doit le montrer.
- **Flèche des boutons au survol** : rotation de 45° en .3 s, `var(--e)` sur
  `.btnf`, `cubic-bezier(.65,0,.2,1)` sur `.cta`.

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
- **Clonage d'une variante.** `clone()` perd les liens de propriétés
  (`componentPropertyReferences`) : les reposer sur le clone, sinon une
  instance qui bascule vers lui perd son libellé et son icône.
- **Jeu créé à partir d'un composant.** `combineAsVariants` renomme les clés
  de propriétés (`label#172:0` devient `label#222:0`) ; les instances gardent
  leurs valeurs.

---

# Partie 2 — grands composants

Construite le 8 octobre 2026, à partir du code et des mesures du site
(`outils/mesure-grands-composants.mjs`, 1440 × 900 à la souris et
390 × 844 au doigt), puis reprise le même jour aux valeurs exactes du code
(§12). Dix-huit planches sous `planche/tag`, au même gabarit que la partie 1,
empilées à x = 0.

## 8. Ce qui existe dans Figma

| Planche | Nœud | Composants (nœud) | Variantes | Propriétés |
|---|---|---|---|---|
| `planche/icones-interface` | `169:134` | `icon/close` `169:141`, `icon/plus` `169:148`, `icon/minus` `169:154`, `icon/fullscreen-enter` `169:160`, `icon/fullscreen-exit` `169:166`, `icon/flake` `170:151`, `icon/chevron-down` `170:156`, `icon/figma` `170:163` | flake : `open` false, true | — |
| `planche/logo` | `171:134` | `logo` `171:144` | — | — |
| `planche/surtitre` | `172:149` | `eyebrow` `222:1070` | `class` : sv2-eyebrow, lt-eyebrow | `label#222:0` |
| `planche/bouton-icone` | `173:161` | `icon-button/solid` `173:185`, `tint` `174:204`, `bare` `174:251` | solid : 38 × default, focus, disabled ; tint : 40, 36 × 4 états ; bare : 30, 26 × 4 états | `icone#173:0`, `icone#174:0`, `icone#174:9` |
| `planche/bouton-menu` | `175:221` | `menu-button` `175:340` | `open` × default, focus, disabled | — |
| `planche/grain` | `176:338` | `grain` `176:345` | `usage` site, card, row | — |
| `planche/crete` | `177:344` | `ridge` `177:356` | `theme` dark, light × `breakpoint` desktop, mobile | — |
| `planche/langue` | `178:345` | `lang/option` `178:364`, `lang` `178:392`, `lang/toggle` `180:588` | option : 5 états ; lang : default, open, focus, disabled ; toggle : `current` fr, en × 3 états | `label#178:0` |
| `planche/header` | `179:368` | `header/desktop` `179:461`, `header/mobile` `181:615` | desktop : top, compact ; mobile : top, compact, menu-open | — |
| `planche/liens` | `180:506` | `link/menu` `180:526`, `link/social` `180:539`, `link/footer` `199:899`, `link/email` `199:932`, `link/top` `199:945` | menu, social : default, active, focus, disabled ; footer, top : default, hover, focus, disabled ; email : `breakpoint` × 4 états | `label#180:0`, `label#180:5`, `label#199:0`, `label#199:5` |
| `planche/carte-projet` | `183:586` | `card/project` `183:656` | default, focus, disabled | `titre#183:0`, `catégorie#183:4`, `logo animé#183:8` |
| `planche/modale` | `188:650` | `modal/project` `188:654` | — | `camp`, `titre`, `catégorie`, `résumé`, `rôle`, `année`, `compteur` (`#188:0` à `#188:6`) |
| `planche/faq` | `189:670` | `faq/item` `189:738` | `breakpoint` × default, open, focus, disabled | `numéro#190:0`, `question#190:9`, `réponse#190:18` |
| `planche/altimetre` | `191:709` | `altimeter` `228:1069` | `type` : bn3-alt, ev-meta | `parcours#228:0`, `flèche#228:1`, `arrivée#228:2`, `altitude#228:3` |
| `planche/mode-emploi` | `192:736` | `help` `192:792` | centered, docked, docked-open | — |
| `planche/drapeaux` | `193:794` | `flag/label` `193:822`, `flag/pin` `193:829`, `flag/edge` `193:890` | label : 4 états ; pin : `scene` everest, mont-blanc ; edge : `side` left, right, top × 4 états | `altitude#193:0`, `sommet#193:5`, `projet#193:10`, `projet#193:15` |
| `planche/services` | `195:815` | `card/service` `195:913`, `row/service` `196:878` | card : `breakpoint` × default, hover ; row : 4 états | `titre#198:0`, `description#198:5` ; `service#196:0`, `type#196:5`, `durée#196:10`, `afficher le type#196:15` |
| `planche/footer` | `201:878` | `footer` `204:1101` | `breakpoint` desktop (1440, avec lac), mobile (390) | — |

Chaque planche montre le jeu de variantes, puis les composants en contexte
(fond clair, fond sombre, section reconstituée). La page Fondations montre
les fondations de la reprise : 50 rôles sémantiques, 118 styles de texte,
31 espacements.

**Contrôle final de la page Composants** (8 octobre, après la reprise) :

- 863 peintures pleines sur 863 liées à une variable (hors intérieurs
  d'instances), aucune liée directement à une primitive, aucune hors de son
  scope ;
- un style de texte sur chacun des 466 textes ; deux portent deux styles, le
  « Figma® Expert » du footer ;
- aucun retrait, écart ou rayon en dur ; un seul rayon non lié, la découpe
  ronde du logo (géométrie) ;
- une description sur les 45 composants (181 avec les variantes) ;
- 107 nœuds annotés « pas encore dans le code » : focus et disabled là où le
  code n'en a pas, flèches dessinées, `ghost` · `sm` ;
- aucun nœud hors planche.

## 9. Composants de la partie 2

Le détail de chaque composant (classes, valeurs, durées) est dans sa
description Figma. L'essentiel, aux valeurs du code :

- **Icônes d'interface** : tracés des SVG du code, grille 24 (le chevron
  garde sa grille 10 × 6, la marque Figma sa forme pleine), traits en
  currentColor liés à `color/text/primary`. Flocon : trois axes (2,6), puis
  les branches (2,2) et une rotation de 90° à l'ouverture.
- **Logo** : les cinq tracés dans leur cercle, remplissage
  `color/text/primary` ; tailles d'usage 34, 44, 54 (à .12) et 84.
- **Surtitre** : pastille de 7 px relevée de 0,5 px, libellé Bold 11 px
  .08em, écart 7. Deux variantes : `sv2-eyebrow` (line-height 1) et
  `lt-eyebrow` (interlignage hérité 1,6, aussi `.uc-eyebrow`).
- **Bouton icône** (CMP-08) : `solid` 38 (cartes ; encre en clair, papier en
  sombre, avec `shadow/card-bar` pour `.cw-shot-btn`) ; `tint` 40 (flèches de
  la modale : fond .12, survol et focus papier et icône encre, focus du code)
  et 36 (fermer : fond .1, survol .22) ; `bare` 30 (mode d'emploi, focus −3
  rayon 4) et 26 (plein écran, focus 4 rayon 3). Icônes de 18, 16, 15 et
  26 px ; le glyphe → de 15 px des cartes devient une icône de 16 (D8).
- **Bouton menu** : une instance de `button` btnf · ink · sm, soit
  `.menu-btn` : padding 9px 14px, gap 8px, Space Mono .08em, flocon en tête ;
  78 × 34 fermé, 93 × 34 ouvert (78,45 et 93,69 sur le site).
- **Grain** : le motif du code en trois réglages (site .21 difference ;
  carte .6 à 300 px ; ligne .4), à poser étiré au-dessus du contenu.
- **Crête** : le polygone de `Ridge.js` à pleine amplitude, largeur nominale
  1200 (k = 1) et 390 (k = .55), remplissage `color/bg/primary` dans le mode
  du bloc ; décalages (−604,8 / 470 ; −105 / 260 et −160 / 200) en
  description.
- **Langue** : déclencheur padding 6px 2px, gap 5px ; menu rayon 8px, padding
  4px, bordure `color/border/menu`, fond `color/bg/menu` (#161616 sur fond
  sombre), 66 × 70 comme le site ; options padding 7px 10px en
  `color/text/label-dim` ; bascule FR / EN du menu mobile en 12 px .08em,
  gap 10px, boutons padding 2px, séparateur .3.
- **Header** : une bordure de 1 px autour d'une nav de 64, comme le code :
  tout le contenu est décalé d'un pixel (logo à 57, 16). nav padding 0 56px
  en desktop, 0 20px en mobile. Mobile : 66 de haut ; compact en encre .94,
  bordure blanche .1 ; menu ouvert en encre .97, bordure blanche .1, corps
  padding 19px 20px 22px, grille gap 22px, libellés Bold .12em à .42, liens
  principaux padding 13px 0 avec filet court .1, réseaux et contact à .85
  (gap 3px), bas à 34px (gap 16px) : 370 × 398 (397,72 sur le site).
- **Liens** : menu mobile (`link/menu`, `link/social`), footer (`link/footer`,
  12 px, padding 4px 0, ↗ en icône), e-mail (soulignement bleu au survol),
  « Haut de page » (`link/top`, #f4f6f542, `color/text/footer-top`).
- **Carte projet** : la carte de la colonne (≤ 1024), 350 × 217 ; barre à 10px
  des bords, 330 × 58, padding 9px 9px 9px 14px, gap 12px ; titre `title-sm`,
  catégorie `caption-card` (12 px, 1,3), gap 1px, min-height 40px ; bouton
  `icon-button/solid`.
- **Modale** : 1440 × 900, padding 56px ; fiche 1180 × 423,66 (1,35fr / 1fr),
  visuel sur #0E0E0E ; texte padding 30px : camp, titre `heading-3-modal`
  (33,6, 1,6) à 10px, catégorie `label-sm` en .5 à 7px, résumé
  `body-xs-modal` (1,65) en .74 à 14px, méta à 20px (gap 36px, intitulés .42,
  margin 4px) ; fermer à 12px du coin ; navigation à 18px de la fiche, gap
  14px, compteur `label-count` (min-width 52px).
- **Accordéon FAQ** : question blanche, padding 2px 26px (2px 18px en
  mobile), question padding 20px 0, gap 18px (18px 0 et 12px en mobile),
  réponse padding 16px 0 22px : 1216 × 69 fermée et 156 ouverte, comme le
  site ; titre de section `heading-2-fq`, margin 16px 0 26px.
- **Altimètre** : deux variantes. `ev-meta` (scène Everest) : 10 px, 2,
  .18em, capitales ; parcours en `--muted`, « ALT. » et « M » en `--muted-2`,
  altitude en encre. `bn3-alt` (Benefits, Let's talk) : 11 px, 1,9, .14em,
  tout en papier .55, parcours à opacité .6. La ligne d'altitude est un seul
  texte, avec les espaces du code.
- **Mode d'emploi** : rayon 4px ; centré padding 24px 30px, gap 11px, texte
  .72 ; « ou » en .5 (espaces insécables, pour qu'elles comptent), « = » en
  .5 avec margin 0 6px ; rangé 30 × 30 ; rangé ouvert en 8 px (`help-docked`),
  padding 38px 14px 12px, gap 6px.
- **Drapeaux** : étiquette padding 7px 10px 8px, gap 1px, altitude
  `micro-alt`, projet `micro-proj`, focus du code à 3px : 113 × 55 (112,11 ×
  54,89 sur le site) ; indicateur de bord en Bold 8 px, padding 7px 10px avec
  la pointe de 10 (16 côté pointe ; 14px 12px 7px en haut), 22 de haut comme
  le site, focus = survol ; fanion du Mont Blanc, mât en papier .8.
- **Services** : carte padding 37,44 (26 en mobile), corps à 14px, liste gap
  9px (`data-list` en blanc .5, `body-md-list` en #fff) ; ligne padding 9px
  10px, gap 10px, 585 × 40 comme le site ; exemple : colonnes à 100,8, cartes
  à 22px, en-tête padding 8px 10px, gap 10px.
- **Footer** : corps padding 56px (20px en mobile), haut gap 30px (36px),
  colonnes à 86,4 (32), titres `label-sm-col` en #f4f6f573 à 14px des liens,
  logo du menu à 18px ; bloc e-mail à 45 (42,2), accroche `label-hook`,
  e-mail à 14px, boutons à 30,6 (28,7), gap 14px ; marque Figma gap 9px, un
  texte à deux styles ; crête à 22,5, boîte min 150 (90), dessin 144
  (135,04), trait .16, altitudes .34 ; bas à 27, padding 18px, filet .16.
  Let's talk : texte de 705,28 à 43,2 de la marge, bouton à 34px, filet .16 à
  112 (40 en mobile), altimètre à 36 du bas ; en mobile, surtitre à 46,42 et
  accroche `display-lt`. Lueur `color/glow` 660 × 420 (360 × 230), centrée sur
  l'ensemble, opacité .5, `blur/glow-footer`.

## 10. Choix et mesures

### Valeurs exactes

Chaque retrait, écart, couleur, style et rayon est celui de la classe du
code ; les valeurs fluides sont résolues à 1440 × 900 et 390 × 844, dans la
collection `responsive`. Seuls ajouts propres à Figma : flèches dessinées
(D8), focus et désactivé là où le code n'en a pas (D5), `ghost` · `sm`.

Limites de Figma, sans écart de valeur :

- la hauteur d'une ligne de texte est arrondie au pixel le plus proche
  (17,6 → 18 ; 28,67 → 29) ; quand le code fixe une hauteur, un cadre de
  taille exacte la garde (emplacement de flèche de 12 × 17,6) ;
- l'approche après la dernière lettre n'est pas comptée : les textes très
  espacés sont 1 à 3 px plus étroits qu'à l'écran (mode d'emploi) ;
- l'interligne « normal » de Bricolage à 16,32 px vaut 21 dans Figma contre
  19,5 dans le navigateur : la question FAQ mobile sur deux lignes fait 82 au
  lieu de 79 ;
- pas de flex 1,25 / 1 : le type d'une ligne Services a la largeur qu'il
  prend à 585 ;
- `translateX(4px)` d'un lien du footer au survol : rendu par un retrait
  gauche de 4 ;
- le texte SVG de la crête du footer est étiré par
  `preserveAspectRatio="none"` (×1,107 en largeur, ×0,847 en hauteur à 1440) :
  les altitudes sont placées sur leurs coordonnées, sans l'étirement ;
- le roll décale chaque lettre de 20 ms, la lueur du footer change de forme
  (footMorph) : documentés sur la page Motion.

### Mesures comparées

| Élément | Site | Figma |
|---|---|---|
| Header desktop, compact | 1440 × 64 et 980 × 64, logo à 57, 16 | idem |
| Header mobile, compact | 390 × 66 et 370 × 66 | idem |
| Menu de langue | 66 × 70 | 66 × 70 |
| Bouton `.btnf`, `.cta` | hauteur 45,59 et 35,59 | 45,6 et 35,6 |
| Bouton menu fermé, ouvert | 78,45 × 34, 93,69 × 34 | 78 × 34, 93 × 34 |
| Menu mobile ouvert | 370 × 397,72 | 370 × 398 |
| Carte projet, barre | 350 × 217, 330 × 58 | idem |
| Fiche de la modale, avec la navigation | 1180 × 423,66, 1180 × 481,66 | idem |
| Question FAQ fermée, ouverte | 1216 × 69 et 156 | idem |
| Étiquette de sommet, indicateur de bord | 112,11 × 54,89, hauteur 22 | 113 × 55, hauteur 22 |
| Mode d'emploi centré, rangé ouvert | 261,23 × 112,81, 187,42 × 95,56 | 257 × 115, 183 × 95 |
| Carte Services desktop, ligne Services | 529,73 × 320, 585,47 × 40 | 529,73 × 320, 585 × 40 |
| Accroche de Let's talk | 705,27 × 285,55 | 705,28 × 285 |
| Footer desktop, mobile | 1440 × 1494,7, 390 × 1381,5 | 1440 × 1493,7, 390 × 1379,3 |

### Images

- Les visuels de projet viennent de `public/images`. Figma n'affiche pas les
  WebP importés : ils sont convertis en JPEG avec le navigateur avant import
  (Anya, Team Coin, Portfolio).
- Le lac d'Allos est une capture du canevas WebGL de `Lake3D.js` sur fond
  transparent, à sa place dans le bloc Let's talk
  (`outils/capture-scene.mjs`, cadre `.lt`, échelle 1).
- `pixels.png` (64 × 64) et `clouds.png` sont repris tels quels.

## 11. Arbitrages de la partie 2

Validés le 8 octobre 2026, en cours de partie :

- jeton `color/overlay/button` (papier .12, flèches de la modale) ; scope
  `SHAPE_FILL` sur `color/text/primary` (logo, marque Figma) et
  `color/text/on-accent` (pastille de la ligne Services) ;
- icône par défaut commune à chaque jeu de boutons icônes (flèche, plus) ;
- styles `sign` (± de la FAQ, Bricolage Regular 20,8) et `help-strong` (Bold
  du mode d'emploi).

Remplacés par la règle du 8 octobre : la croix de la modale garde son fond
.1 et son survol .22 ; l'altimètre sombre garde sa couleur unique (.55) et
son parcours à .6 ; « Haut de page » garde son #f4f6f542.

Réponses du 8 octobre aux six points ouverts :

1. **Scope `STROKE_COLOR` sur `color/text/label` et `color/text/muted`** :
   validé (et posé aussi sur `label-dim`, pour le chevron de langue).
2. **Retrait de première ligne dans `display`** (144 / 56) : validé ; aussi
   sur `display-lt`.
3. **« Expert » de la marque Figma** : nouveau style `label-sm-strong`, aux
   valeurs de `.foot-figma b` (Bold 10 px, .12em, capitales) ; il sert aussi
   aux libellés du menu mobile (`.hx-label`).
4. **Lueurs** : nouveau rôle sémantique `color/glow`, bleu .5 en clair (hero)
   et .55 en sombre (footer), avec `blur/glow-hero` et `blur/glow-footer`.
5. **Mode d'emploi rangé ouvert** : les 8 px du site, styles `help-docked` et
   `help-docked-strong`.
6. **Rayon des cadres de jeux de variantes** lié à `radius/5` : validé.

## 12. Reprise du 8 octobre (partie 2)

La liste « corrections à faire sur le site » de la partie 2 est supprimée ;
chacune de ses lignes est revenue dans Figma à la valeur du site :
altimètres sombres (.55, parcours à .6), « Haut de page » (#f4f6f542),
menu mobile (.85, .42, .3, .1, bordures blanc .1), crête du footer (trait
.16, altitudes .34 ; la règle .3 des textes est recouverte par `.peak`),
espacements exacts. Les glyphes restent dessinés (D8) et les focus et
désactivés propres à Figma (D5).

Ce que la reprise a changé, en plus des valeurs du §9 :

- styles de texte par classe : `display-lt`, `heading-2-fq`,
  `heading-3-modal`, `body-xs-modal`, `body-md-list`, `caption-name`,
  `caption-type`, `caption-card`, `overline-lt`, `overline-go`, `label-count`,
  `label-hook`, `label-sm-col`, `label-sm-figma`, `label-sm-strong`,
  `micro-alt`, `micro-proj`, `micro-edge`, `micro-ridge`, `data-time`,
  `data-list`, `meta-lang`, `altimeter-ev`, `help-docked` ;
- couleurs : texte #fff sur les aplats, voiles .94 et .97 séparés, fond
  #161616 du menu de langue, #0E0E0E du visuel de la modale, bordures .16,
  textes du footer en #F4F6F5, rôles `label-dim`, `label-faint`, `menu-link`,
  `modal-summary`, `help`, `ridge`… (fondations, §2) ;
- deux nouveaux jeux : `eyebrow` (`class`) et `altimeter` (`type`) ;
- headers restructurés comme le code (bordure autour d'une nav de 64) ;
- espacements fluides exacts : carte Services 37,44, colonnes du footer 86,4,
  marge de Let's talk 43,2, surtitre mobile 46,42, colonnes Services 100,8.

*Jusqu'au 8 octobre, ces valeurs étaient rattachées à l'échelle et aux rôles
fusionnés, avec une liste de corrections à faire sur le site.*

## 13. Pour la page Motion (étape 4)

- **Header** : compact au-delà de 70 px (.6 s var(--e)), couleurs en .5 s ;
  détection du fond sombre (`Header.js`) ; menu mobile qui s'étend
  (grid-template-rows .55 s var(--e)), liens en cascade (.45 s, délais .10 /
  .16 / .22 s), colonne de droite en fondu (.45 s après .24 s).
- **Bouton menu** : flocon tourné de 90° (.55 s), branches en .4 s.
- **Langue** : menu en .2 s (opacité, translateY de −6 à 0), chevron .25 s.
- **Modale** : voile en fondu .3 s, fiche et navigation qui montent (evPop
  .38 s var(--e)) ; vol vers le drapeau (ease-in-out quad) avant ouverture.
- **FAQ** : hauteur en .5 s var(--e), signe en .35 s.
- **Mode d'emploi** : du centre au coin en .85 s cubic-bezier(.65,0,.35,1),
  barre du + qui se rétracte (.35 s).
- **Drapeaux** : étiquettes .25 s, survol .2 s ; indicateurs .3 s et suivi
  .18 s linéaire.
- **Services** : carte (.7 s, liste .55 s, numéros .4 s après .15 s), ligne
  (.7 à .9 s), grain `cardGrain` .4 s steps(4).
- **Footer** : lueur (footDrift 12,5 s, footMorph 8,5 s), logo du menu
  (44 s), lien décalé de 4 px (.3 s), soulignement de l'e-mail (.5 s).
- **Crête** : ligne plate à 385 × k au repos, déploiement au défilement
  (ease-out 1 − (1 − p)²).
- **Carte projet** : défilement automatique de la colonne, logo animé
  (LogoReveal, 4 s).

## 14. Notes techniques (partie 2)

- **Images** : `upload_assets` pose un cadre temporaire par image sur la
  page, à supprimer après usage ; les WebP y sont illisibles (taille d'image
  introuvable), d'où la conversion en JPEG.
- **Planches** : une planche qui grandit recouvre la suivante ; réempiler
  après chaque ajout (tri par y, à x = 0).
- **Permutation d'icône** : la propriété est commune à tout un jeu ; une
  permutation dans une variante change la valeur par défaut du jeu.
- **Calques absolus étirés** : construits avant que le parent ait sa taille,
  ils dérivent ; vérifier leurs bornes en fin de construction.
- **Texte** : l'espace final d'un texte en largeur auto ne compte pas ;
  mettre une marge. Un retrait de première ligne posé sur le nœud détache le
  style.
- **Git Bash** : il convertit un argument « / » en chemin Windows ; préfixer
  par `MSYS_NO_PATHCONV=1`.
- **Hauteur de texte** : Figma arrondit la hauteur d'une ligne au pixel. Un
  texte de hauteur fixe garde une valeur fractionnaire mais ne suit plus son
  contenu : pour tenir une hauteur du code, préférer un cadre de taille exacte
  (emplacement de flèche de 12 × 17,6).
- **Espaces** : un texte en largeur auto ignore une espace finale ordinaire,
  mais compte une espace insécable (« ou » du mode d'emploi).
- **Descriptions** : Figma réécrit l'apostrophe droite, `>` et le guillemet
  droit en entités HTML : écrire ’, « au-dessus de 1024 », « ».
- **Script en erreur** : il est annulé en bloc ; vérifier l'état, corriger,
  relancer.
