# Composants — étape 3

Étape 3 du brief (`docs/design-system/BRIEF.md`) : les composants du site,
construits dans Figma à partir du code et des seules fondations de l'étape 2
(`docs/design-system/fondations.md`).

- **Date** : 8 octobre 2026
- **Branche** : `design-system`
- **Fichier Figma** : `kMLD5Ti9yCpnKU4jdVfWDJ`, page Composants (`113:4`)
- **Statut** : partie 1 (petits composants) validée le 8 octobre 2026, avec
  les arbitrages du §4, appliqués dans Figma. Partie 2 (grands composants)
  construite et contrôlée le 8 octobre 2026 (§8 à §14), en attente de
  validation pour les points du §11.

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

---

# Partie 2 — grands composants

Construite le 8 octobre 2026, à partir du code et des mesures du site
(`outils/mesure-grands-composants.mjs`, 1440 × 900 à la souris et
390 × 844 au doigt). Dix-huit planches ajoutées sous `planche/tag`, au même
gabarit que la partie 1, empilées à x = 0.

## 8. Ce qui existe dans Figma

| Planche | Nœud | Composants (nœud) | Variantes | Propriétés |
|---|---|---|---|---|
| `planche/icones-interface` | `169:134` | `icon/close` `169:141`, `icon/plus` `169:148`, `icon/minus` `169:154`, `icon/fullscreen-enter` `169:160`, `icon/fullscreen-exit` `169:166`, `icon/flake` `170:151`, `icon/chevron-down` `170:156`, `icon/figma` `170:163` | flake : `open` false, true | — |
| `planche/logo` | `171:134` | `logo` `171:144` | — | — |
| `planche/surtitre` | `172:149` | `eyebrow` `172:153` | — | `label#172:0` |
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
| `planche/altimetre` | `191:709` | `altimeter` `191:713` | — | `parcours#191:0`, `flèche#191:1`, `arrivée#191:2`, `altitude#191:3` |
| `planche/mode-emploi` | `192:736` | `help` `192:792` | centered, docked, docked-open | — |
| `planche/drapeaux` | `193:794` | `flag/label` `193:822`, `flag/pin` `193:829`, `flag/edge` `193:890` | label : 4 états ; pin : `scene` everest, mont-blanc ; edge : `side` left, right, top × 4 états | `altitude#193:0`, `sommet#193:5`, `projet#193:10`, `projet#193:15` |
| `planche/services` | `195:815` | `card/service` `195:913`, `row/service` `196:878` | card : `breakpoint` × default, hover ; row : 4 états | `titre#198:0`, `description#198:5` ; `service#196:0`, `type#196:5`, `durée#196:10`, `afficher le type#196:15` |
| `planche/footer` | `201:878` | `footer` `204:1101` | `breakpoint` desktop (1440, avec lac), mobile (390) | — |

Chaque planche montre le jeu de variantes, puis les composants en contexte
(fond clair, fond sombre, section reconstituée). La page Fondations montre
les ajouts du §11 (27 rôles sémantiques, 64 styles de texte).

**Contrôle final de la page Composants**, après les corrections du §11 :

- 1 749 peintures pleines sur 1 749 liées à une variable, aucune hors de son
  scope ; deux seulement liées à une primitive, les lueurs du footer
  (`color/blue/a55`), comme le spécimen de lueur de la page Fondations ;
- un style de texte sur chacun des 737 textes ;
- aucun retrait ni écart en dur ; un seul rayon non lié, la découpe ronde du
  logo (géométrie) ;
- une description sur les 45 composants (171 avec les variantes) ;
- 98 nœuds annotés « pas encore dans le code » ;
- 7 images, toutes lisibles ; aucun nœud hors planche.

## 9. Composants de la partie 2

Le détail de chaque composant (classes, valeurs, durées, écarts) est dans sa
description Figma. L'essentiel :

- **Icônes d'interface** : tracés des SVG du code, grille 24 (le chevron
  garde sa grille 10 × 6, la marque Figma sa forme pleine), traits en
  currentColor liés à `color/text/primary`. Flocon : trois axes (2,6), puis
  les branches (2,2) et une rotation de 90° à l'ouverture.
- **Logo** : les cinq tracés dans leur cercle, remplissage
  `color/text/primary` ; tailles d'usage 34, 44, 54 (à .12) et 84.
- **Surtitre** : pastille de 7 px et libellé `overline`, écart 8 (7).
- **Bouton icône** (CMP-08) : trois jeux selon le fond, aux tailles du code.
  `solid` 38 (cartes ; encre en clair, papier en sombre ; pas de survol, il
  ne vit que sous 1025 px), `tint` 40 et 36 (modale, mode sombre posé, fond
  `color/overlay/button`), `bare` 30 et 26 (scène Everest). Icônes de 18,
  16, 15 et 26 px ; le glyphe → de 15 px des cartes devient une icône de 16.
- **Bouton menu** : une instance de `button` ink · sm, flocon en tête,
  « Menu » puis « Fermer » ; papier sur encre en mode sombre, comme le code.
- **Grain** : le motif du code en trois réglages (site .21 difference ;
  carte .6 à 300 px ; ligne .4), à poser étiré au-dessus du contenu.
- **Crête** : le polygone de `Ridge.js` à pleine amplitude, largeur nominale
  1200 (k = 1) et 390 (k = .55), remplissage `color/bg/primary` dans le mode
  du bloc ; décalages (−604,8 / 470 ; −105 / 260 et −160 / 200) en
  description.
- **Langue** : déclencheur et menu de 66 (rayon 5 au lieu de 8, RAY-01) et
  ses options ; bascule FR / EN du menu mobile.
- **Header** : desktop en haut de page (1440) et compact (980, ombre), clair
  ou sombre selon le mode ; mobile en barre, compact et menu ouvert, toujours
  sombre (`color/overlay/header-mobile`). Fond et flou en calque séparé,
  grain par-dessus.
- **Liens** : menu mobile (`link/menu`, `link/social`), footer
  (`link/footer`, ↗ en icône), e-mail (soulignement bleu au survol),
  « Haut de page » (`link/top`, `color/text/subtle`).
- **Carte projet** : la carte de la colonne (≤ 1024), visuel en remplissage,
  montage « logo animé » (nuages, neige pixel, logo bleu), barre papier avec
  titre, catégorie et `icon-button/solid`.
- **Modale** : 1440 × 900, fiche de 1180 (1,35fr / 1fr), mode sombre,
  voile, grain, croix `tint` 36, navigation `tint` 40 et compteur.
- **Accordéon FAQ** : question blanche (`color/bg/surface`), numéro, ± en
  `sign`, réponse sous filet ; desktop et mobile ; section complète en
  exemple.
- **Altimètre** : un composant pour `.ev-meta`, `.bn3-alt` et `.lt-alt`,
  hiérarchie du hero clair, flèche en option pour « Chamonix → Mont Blanc ».
- **Mode d'emploi** : centré, rangé (30 × 30) et rangé ouvert ; touches en
  `help-strong`, bouton `bare` 30.
- **Drapeaux** : étiquette de sommet (fond translucide flouté, bleu au
  survol), fanions Everest et Mont Blanc, indicateur de bord à pointe.
- **Services** : carte (desktop 529,73 × 320, mobile 350) et ligne de
  l'index, bleues et grainées au survol ; exemples de la colonne des cartes
  et de l'index.
- **Footer** : Let's talk et corps, desktop avec le lac et mobile sans lac ;
  lueur, grain, crête en polyligne, liens, e-mail, paire de boutons et
  marque Figma.

## 10. Choix et mesures

### Rattachements

Les valeurs du code suivent les règles déjà validées :

- **Espacements** : rattachés au pas le plus proche de l'échelle (étape 2,
  §2.4). Les valeurs fluides sont résolues à 1440 et à 390 : retrait des
  cartes Services 37,44 → 40 et 26 → 24 ; retrait de la modale 30 → 32 ;
  écart des colonnes du footer 86,4 → 80 ; marge du texte de Let's talk
  43,2 → 40 ; écart entre surtitre et texte en mobile 46,4 → 48.
- **Textes** : chaque classe prend le style auquel le §3.4 de l'audit la
  rattache (D6). Exemples : catégorie de la barre de carte en `caption`
  (barre de 60 au lieu de 58), étiquette de sommet en `micro` à 160 %
  (69 de haut au lieu de 55), titre de la modale en `heading-3`, `.lt-big`
  mobile en `display` (TYP-05).
- **Couleurs** : rôles du mode sombre (D2, COL-09), papier au lieu du blanc
  sur aplat (D1), noirs voisins fondus dans l'encre (COL-10).
- **Rayons** : 5 partout (RAY-01).

### Mesures comparées

| Élément | Site | Figma | Écart |
|---|---|---|---|
| Header desktop, compact | 1440 × 64, 980 × 64 | 1440 × 64, 980 × 64 | — |
| Bouton menu fermé, ouvert | 78,45 × 34, 93,69 × 34 | 81 × 34, 96 × 34 | retraits 8 / 16 (9 / 14) |
| Menu mobile ouvert | 370 × 397,72 | 370 × 379 | retraits et écarts à l'échelle |
| Fiche de la modale | 1180 × 423,66 | 1180 × 423,66 | — |
| Question FAQ fermée, ouverte | 1216 × 69 et 156 | 1216 × 73 et 162 | retraits 4 / 24 (2 / 26) |
| Accroche de Let's talk | 705,27 × 285,55 | 705 × 285 | — |
| Carte Service desktop | 529,73 × 320 | 529,73 × 320 | — |
| Ligne Services | 585,47 × 40 | 585 × 39 | retraits 8 / 12 |
| Mode d'emploi centré, rangé | 259,9 × 116,2 et 30 × 30 | 258 × 117 et 30 × 30 | — |
| Mode d'emploi rangé ouvert | 187 × 96 (texte à 8 px) | 226 × 113 (11 px) | aucun style à 8 px |

### Images

- Les visuels de projet viennent de `public/images`. Figma n'affiche pas les
  WebP importés : ils sont convertis en JPEG avec le navigateur avant import
  (Anya, Team Coin, Portfolio).
- Le lac d'Allos est une capture du canevas WebGL de `Lake3D.js` sur fond
  transparent, à sa place dans le bloc Let's talk
  (`outils/capture-scene.mjs`, cadre `.lt`, échelle 1).
- `pixels.png` (64 × 64) et `clouds.png` sont repris tels quels.

## 11. Arbitrages de la partie 2

Validés le 8 octobre 2026, en cours de partie (aucune valeur nouvelle) :

- jeton `color/overlay/button` (papier .12, `.ev-modal-x` .1 fusionné) ;
- scope `SHAPE_FILL` sur `color/text/primary` (logo, marque Figma) et
  `color/text/on-accent` (pastille de la ligne Services) ;
- survol de `.ev-modal-x` aligné sur celui des flèches (correction à faire,
  §5) ; icône par défaut commune à chaque jeu de boutons icônes (flèche,
  plus) ;
- styles `sign` (± de la FAQ, Bricolage Regular 20,8) et `help-strong` (Bold
  du mode d'emploi) ; altimètre sur la hiérarchie du hero clair ; papier .26
  (`.foot-topbtn`) rattaché à `color/text/subtle`.

À valider, apparus en fin de partie et au contrôle final :

1. **Scope `STROKE_COLOR` sur `color/text/label` et `color/text/muted`** :
   le chevron du sélecteur de langue et la flèche de l'altimètre sont en
   currentColor. C'est la règle du §4, arbitrage 2, étendue à deux jetons.
2. **Retrait de première ligne dans `display`** : 144 en desktop, 56 en
   mobile (`text-indent: clamp(56px,10vw,170px)`, commun à `.manif-big` et
   `.lt-big`). Posé sur le nœud, il détachait le style de l'accroche de
   Let's talk. Les spécimens de la page Fondations l'affichent.
3. **« Expert » de la marque Figma en `overline`** (Space Mono Bold 11,
   +8 %) : `.foot-figma b` est en Bold 10 px, et aucun style Bold n'existe à
   10 px. Autre voie : un style `label-sm-strong`, sur le modèle de
   `nav-active`.
4. **Lueurs du footer liées à la primitive `color/blue/a55`**, comme le
   spécimen de la page Fondations : il n'existe pas de rôle sémantique pour
   la lueur.
5. **Mode d'emploi rangé ouvert à 11 px** au lieu de 8 (aucun style à 8 px).
6. **Rayon des cadres de jeux de variantes** lié à `radius/5` : c'est le
   rayon par défaut de Figma pour ces cadres de présentation.

## 12. Corrections à faire sur le site (partie 2)

Elles complètent le §5 et la liste de l'audit (§10). Chacune relève de sa
propre branche, avec diagnostic et validation visuelle avant modification.

| Correction | Origine |
|---|---|
| Altimètres sombres (`.bn3-alt`, `.lt-alt`) : parcours en papier .6, « ALT. » et « M » en papier .45, valeur en papier | arbitrage du 8 octobre |
| `.foot-topbtn` : papier .26 → .45 | arbitrage du 8 octobre |
| Glyphes en SVG : → des cartes (`.pcard-bar-btn`, `.cw-shot-btn`) à 16 px ; ↗ des liens du footer, → de `.svx-go` et de « CHAMONIX → MONT BLANC » à 12 px | D8, TYP-13 |
| Menu mobile : liens secondaires papier .85 → .6, libellés .42 → .45, barre FR / EN .3 → .45, filet court .1 → .14, bordures blanc .1 → papier .14 | D2, COL-08, COL-09 |
| Crête du footer : trait papier .16 → .14, altitudes .3 et .34 → .45 | COL-09 |
| Focus visible et état désactivé sur les éléments cliquables de la partie 2 | D5, CMP-04 |
| Espacements alignés sur l'échelle (étiquette de sommet, question FAQ, menu mobile, modale, footer…) | fondations §6 |

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
