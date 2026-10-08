# Audit du design system — jimmyferon.com

Étape 1 du brief (`docs/design-system/BRIEF.md`) : inventaire de tout ce que le
site utilise, doublons et incohérences, recommandation pour chacun.
Rien n'a encore été créé dans Figma, rien n'a été modifié dans le code.

- **Date** : 7 octobre 2026
- **Branche** : `design-system`, partie de `origin/main` (7e88e63), c'est-à-dire la
  version en production
- **Source** : le code uniquement
- **Statut** : validé le 7 octobre 2026 ; tous les arbitrages sont inscrits en
  §1, aucun point ne reste ouvert

## Sommaire

0. [Méthode](#0-méthode)
1. [Décisions arbitrées](#1-décisions-arbitrées)
2. [Couleurs](#2-couleurs)
3. [Typographie](#3-typographie)
4. [Espacements et mise en page](#4-espacements-et-mise-en-page)
5. [Rayons](#5-rayons)
6. [Ombres et effets](#6-ombres-et-effets)
7. [Points de rupture](#7-points-de-rupture)
8. [Mouvement](#8-mouvement)
9. [Composants](#9-composants)
10. [Doublons et incohérences](#10-doublons-et-incohérences)
11. [Hors périmètre, signalé](#11-hors-périmètre-signalé)
- [Annexe A — PR #19, page Projets](#annexe-a--pr-19-page-projets-non-fusionnée)
- [Annexe B — CSS mort](#annexe-b--css-mort)
- [Annexe C — État du fichier Figma](#annexe-c--état-du-fichier-figma)
- [Annexe D — Plans (z-index)](#annexe-d--plans-z-index)

---

## 0. Méthode

- **Lecture intégrale du code** de `origin/main` : `app/globals.css`
  (1 778 lignes), les 21 composants de `components/`, `app/`, `lib/`, `data/`.
- **Extraction outillée.** Chaque valeur de `globals.css` (couleur, taille,
  durée, courbe, rayon, ombre, espacement, requête média) a été relevée par
  script, avec son contexte `@media` et son nombre d'usages.
- **Mesure dans le navigateur.** Les styles *calculés* ont été lus sur
  jimmyferon.com (Chromium headless piloté par le protocole DevTools), pages
  `/`, `/work` et `/about` :
  - **D** = desktop 1440 × 900, souris ;
  - **M** = mobile 390 × 844, tactile émulé (`hover:none`, `pointer:coarse`).

  Les `clamp()` sont donc résolus et la cascade tranchée. Plusieurs valeurs
  écrites dans le CSS ne s'appliquent jamais : voir ESP-04 et l'annexe B.
- **Polices vérifiées à la source** : le navigateur a été interrogé sur la
  police qui dessine réellement chaque texte, et la table `name` du fichier
  `public/fonts/chopin.woff2` a été lue.
- **CSS mort écarté.** 41 classes déclarées n'ont aucun usage dans le JSX
  (héritage de l'ancien `index.html`). Elles ne deviennent pas des composants
  (annexe B).
- **Figma, en lecture seule** : noms des pages, collections et styles existants
  (pour éviter les collisions), styles et axes des quatre polices. Aucune valeur
  des pages Matière et Templates n'a été lue (annexe C).
- **PR #19** (page Projets), ouverte et non fusionnée, est traitée à part
  (annexe A).
- **Scripts versionnés** dans [`outils/`](outils/README.md), pour rejouer
  l'audit sur la prod ou sur une preview.

Conventions : tailles en px. L'approche (letter-spacing) est donnée en em, puis
en % pour Figma (−.02em = −2 %). « CAPS » signale `text-transform:uppercase`.

---

## 1. Décisions arbitrées

Audit validé par Jimmy le 7 octobre 2026. Le même jour, une seconde série
d'arbitrages a validé les précisions de D1, D7 et D8 et tranché les derniers
points (blanc d'interface, rayons, valeurs par défaut). Trois précisions ont
suivi : les noirs voisins de l'encre, la version claire du logo et le favicon.
Le détail de chaque point est en §10.

> **Règle du 8 octobre 2026, prioritaire sur tout ce qui suit.** Le site ne
> change pas : les valeurs du code sont les bonnes, et le design system les
> reproduit exactement (`BRIEF.md`). Les décisions de rationalisation (D0 à
> D4, D6, D7, RAY-01, fusions de couleurs et de voiles, échelle d'espacement)
> sont remplacées par la valeur exacte de chaque classe ; il n'y a plus de
> « corrections à faire sur le site ». Restent propres à Figma, annotés « pas
> encore dans le code » : les états focus et désactivé (D5), les flèches
> dessinées (D8), `ghost` · `sm` et le favicon.

Le tableau donne l'état en vigueur ; quand une décision a été remplacée le
8 octobre, l'ancienne est rappelée en italique.

| # | Question | Décision |
|---|---|---|
| **D0** | Figma doit-il copier le code à l'identique, ou un système rationalisé ? | **À l'identique** (8 octobre) : chaque classe garde ses valeurs, couleurs, opacités, styles, espacements et rayons compris. *Avant : système rationalisé par rôle.* |
| **D1** | Texte posé sur un aplat bleu ou encre (COL-04) | **`#FFFFFF` là où le code l'écrit, papier là où il écrit papier** (`.cta .roll`, `.menu-btn`, `.pcard-bar-btn`) ; blanc .5 et .75 sur la carte et la ligne Services. *Avant : papier partout.* |
| **D2** | Opacités du mode sombre (COL-09) | **Les opacités exactes du code**, chacune sur un jeton (§2.5) : .85, .74, .72, .6, .55, .5, .45, .42, .34, .3, .16, .14, .1, et #F4F6F5 à .45 et .26. *Avant : cinq rôles.* |
| **D3** | Marges de page desktop (ESP-01) | **56 pour la nav et le footer** (`layout/nav-pad`, `layout/footer-pad`), 60 pour `--pad` (hero, `.wrap`, scène), 112 pour les sections. *Avant : 60 pour la nav et le footer.* |
| **D4** | Boutons (CMP-01) | **Deux familles, comme le code** : propriété `family` (`btnf` : `.btnf-blue`, `.btnf-ink`, `.btnf-ghost` ; `btn` : `.btn-blue`, `.btn-ink` et `.sv2-cta`), chacune avec ses survols ; `md` = `.btnf` (45,6 px, écart 9), `sm` = `.cta` (35,6 px, écart 7) et `.menu-btn` (34 px, écart 8, .08em). *Avant : un seul composant, 44 et 34 px.* |
| **D5** | États désactivé et focus (CMP-04) | **Exception à la règle 1 du brief, pour Figma uniquement.** Un état désactivé et un état focus clavier visible sur les boutons, les CTA et tous les autres éléments cliquables. Construits **uniquement avec les fondations existantes**, sans nouvelle valeur. Chaque état ajouté porte l'annotation « pas encore dans le code ». *Recommandation : ne pas les créer.* |
| **D6** | Typographie (§3.4) | **Un style par classe du code** : 118 styles, 66 `text/desktop/…` et 52 `text/mobile/…` (§3.4). *Avant : 33 styles fusionnés.* |
| **D7** | Titres sans interlignage propre (TYP-01) | **Le 160 % hérité du body**, celui que le navigateur rend. *Avant : l'interlignage d'autres titres du code.* |
| **D8** | Flèches `→ ↗ ↔` (TYP-13) | **Icônes vectorielles, en composants**, annotées « pas encore dans le code » (tracés ci-dessous, validés). *Recommandation : tester d'abord le rendu Figma des glyphes.* |
| **D9** | Taille optique de Bricolage (TYP-14) | Axe `opsz` réglé sur la taille du texte, borné à 12–96, dans chaque style. |
| **D10** | Nommage | Noms sémantiques en minuscules (`color/text/muted`, `text/heading-2`). Le nom CSS va en *code syntax* (variables) ou en description (styles). |
| **D11** | Grain (EFF-02) | À tester à l'étape 2 : effet « Bruit » natif contre motif image, comparés à une capture du site. |
| **D12** | Page Projets (PR #19) | Intégrée après sa fusion : rebaser `design-system` sur `main`, puis ajouter tuile projet et badge « À venir ». |

### Couleurs de marque et couleurs d'interface

- **Couleurs de marque** : papier `#F5F5F5`, encre `#111111`, bleu `#1E29FF`.
  Rien d'autre.
- **Couleurs d'interface** : le blanc `#FFFFFF` (surface des questions FAQ et
  des visuels About, texte sur les aplats bleus et encre là où le code l'écrit),
  le bleu de survol, le bleu clair, les gris (cartes Services, bordure du
  header), les gris du grain, le blanc cassé `#F4F6F5` du footer et du rideau.
- **Noirs voisins de l'encre** : chacun garde sa valeur (règle du 8 octobre).
  - `#161616` (fond du menu de langue sur fond sombre), `#0E0E0E` (fond du
    visuel de la modale), `#141414` (particules du logo animé, en JS) : trois
    primitives, `color/ink-soft`, `ink-deep`, `ink-particle`.
  - Le voile de la modale `rgba(10,10,10,.86)` et les ombres noires
    (`rgba(0,0,0,.6)` et `.9`).
  - Hors sujet : les deux `#000` sont techniques (masque de la liste Services,
    canevas de calcul du logo animé, jamais affiché).
- **Logo, version claire** : papier `#F5F5F5`, comme sur le site (header sur
  fond sombre, footer, rideau). C'est la version « blanc » du brief pour la
  page Marque. La version sombre est déjà en encre `#111111` sur le site
  (header clair, logo animé de la page About).
- **Favicon** : une application à part entière. C'est le logo en papier
  `#F5F5F5` sur un fond bleu `#1E29FF`, lisible sur les onglets clairs comme
  sombres.
  - Il est prévu sur la page Marque, à l'étape 4. La forme du fond et la marge
    autour du logo y seront définies avec les fondations existantes.
  - Il n'existe que dans Figma, annoté « pas encore dans le code » : le site
    garde `app/icon.svg`, le logo en blanc pur sans fond.
  - `public/Fram_25.svg` est une copie du même fichier que rien n'utilise
    (annexe B) ; signalé seulement.

### D5 — périmètre et construction

- **Éléments concernés** :
  - composant `button`, CTA du header, `.menu-btn` ;
  - boutons icônes (modale, scène, barres de carte) ;
  - liens : nav, footer, liens roll, e-mail ;
  - puces de filtre, bascules (`.svx-toggle`, langue), options de langue ;
  - question FAQ, lignes Services et Client work, carte projet ;
  - étiquette de sommet, indicateur de bord.
- **Focus** : la seule recette du code, celle de la scène Everest. Contour de
  2 px en `--blue`, décalé de 2 à 4 px (`globals.css:1552,1573,1614,1727,1759`).
  Là où le code définit ce focus (étiquette de sommet, indicateur de bord,
  flèches de la modale, boutons du mode d'emploi et du plein écran), Figma
  reprend le sien, décalage et rayon compris, sans annotation.
- **Désactivé** : composé à l'étape 3 avec des tokens existants (par exemple
  texte `color/text/subtle`, filet `color/border/default`), sans opacité ni
  couleur nouvelle.
- **Annotation** : propriété `annotations` du nœud Figma (annotation Dev Mode),
  libellé « pas encore dans le code ».

### D7 — interlignage des huit titres

Les huit titres sans `line-height` propre (TYP-01) gardent dans Figma le 160 %
hérité du body, celui que le navigateur rend : `heading-1-uc` (desktop),
`heading-2-fq`, `heading-3`, `heading-3-modal`, `heading-4`, `heading-5`,
`title`, `title-strong`. *Jusqu'au 8 octobre, ils prenaient l'interlignage
d'autres titres du code (100 à 120 %).*

### D8 — dessin des flèches (validé)

Même grille et même trait que les icônes SVG du code : 24 × 24, trait de 1,6,
extrémités et angles arrondis, comme les flèches de navigation de la modale
(`Everest.js:1026-1036`).

| Composant | Glyphe remplacé | Tracé |
|---|---|---|
| `icon/arrow-right` | → | la flèche « projet suivant » de la modale : `M5 12h14M13 6l6 6-6 6` |
| `icon/arrow-up-right` | ↗ | la même, tournée de −45° |
| `icon/arrow-left-right` | ↔ | la tige et les deux pointes des flèches de la modale : `M5 12h14M11 6l-6 6 6 6M13 6l6 6-6 6` |

- Dans les boutons, l'icône remplace le glyphe par une propriété d'instance
  (*instance swap*). Au survol, elle tourne de 45°, comme le glyphe actuel.
- Dans un texte (« Annecy ↔ Genève », « CHAMONIX → MONT BLANC »,
  « → Démarrer un projet »), l'icône se place entre deux textes, en auto layout.
- Chaque instance porte l'annotation « pas encore dans le code ».

### Derniers points tranchés

- **RAY-01** — Les rayons du code sont gardés : 5 px partout, 4 px pour
  l'encadré mode d'emploi `.ev-help` et le contour de focus de son bouton
  (`radius/4`), 8 px pour le menu de langue (`radius/8`). Les grands
  conteneurs qui utilisaient 8 px (`.wcard`, `.portrait`, `.proj-cover`,
  `.gimg`) sont du CSS mort. *Jusqu'au 8 octobre : 5 px partout.*
- **TYP-05** — `.lt-big` a son propre style en mobile, `display-lt`
  (33,15 · 112 %) ; en desktop, il partage `display` avec `.manif-big`.
- **COL-07** — La bordure opaque `#E5E5E5` du header est gardée, comme couleur
  d'interface.
- **ESP-04** — 20 px en mobile, la valeur réelle ; le bloc de tête sans effet
  est signalé seulement (§11).

---

## 2. Couleurs

### 2.1 Palette racine (`:root`, `globals.css:26-38`)

| Variable | Valeur | Rôle constaté |
|---|---|---|
| `--paper` | `#F5F5F5` | fond clair, texte sur fond sombre |
| `--ink` | `#111111` | texte, fond sombre (`themeColor` de `layout.js` aussi) |
| `--blue` | `#1E29FF` | accent unique : liens actifs, survols, CTA, drapeaux, tracés WebGL |
| `--line` | `rgba(17,17,17,.13)` | filet standard sur clair |
| `--line-2` | `rgba(17,17,17,.26)` | filet appuyé (bordures de puces, contours) |
| `--muted` | `rgba(17,17,17,.55)` | texte secondaire sur clair |
| `--muted-2` | `rgba(17,17,17,.38)` | texte discret sur clair |

Les trois couleurs de marque sont `--paper`, `--ink` et `--blue`. Toutes les
autres couleurs du site, alphas compris, sont des couleurs d'interface (§1).

### 2.2 Couleurs pleines écrites en dur (code vivant)

| Valeur | Rôle | Où |
|---|---|---|
| `#FFFFFF` | texte sur aplat bleu ou encre ; fond des questions FAQ et des visuels About | `.btnf-*`, `.btn-*`, `.sv2-cta`, `.svx-pill.on`, `.svx-go`, `.sv2-card:hover h3`, `.fq-item`, `.ab-fig`… |
| `#0F17C2` | survol du bleu | `.cta:hover`, `.btn-blue:hover`, `.btnf-blue:hover` |
| `#7D86FF` | bleu clair sur encre | `.ev-modal-camp` (libellé du camp dans la modale) |
| `#E0E2E8` | fond des cartes Services | `.sv2-card` |
| `#E5E5E5` | bordure du header clair | `header`, `header::before`, `header.compact` |
| `#161616` | fond du menu langue sur fond sombre ; fondu dans l'encre (§1) | `header.on-dark .lang-menu` |
| `#0E0E0E` | fond du visuel de la modale ; fondu dans l'encre (§1) | `.ev-modal-shot` |
| `#63636A` | gris du grain d'accent, manifeste | `.m-acc .mch` |
| `#4A4A52` | même grain, « un cran plus foncé », titre mobile | `.hero-mtitle .m-acc .mch` |
| `#1111118C` | = `--muted` réécrit en hexadécimal | nav, langue, surtitres, `.svx-toggle` (×6) |
| `#F4F6F5` (+ alpha) | blanc cassé ≠ papier | footer, rideau (×6) |
| `#000` | masque de la liste Services | `.svx-list` (`mask-image`) |

Couleurs de **contenu**, hors système : les dégradés de repli des cartes du
carrousel (`CARD_BG`, `lib/projects.js:69-76`), un par projet, visibles
seulement pendant le chargement du média. L'entrée `havas` n'a plus de projet
associé.

### 2.3 Paliers d'alpha (code vivant)

**Encre** `rgb(17,17,17)` : 17 paliers.

| α | Usages |
|---|---|
| .05 | survol d'une option du menu langue |
| .13 | `--line` |
| .22 / .25 | ombres (vignette carrousel, menu langue), barre de défilement |
| .26 | `--line-2` |
| .35 / .45 / .5 / .55 | ombres (header compact, barre de carte, menu ouvert, étiquette de sommet) ; `.uc-line` (.5) |
| .38 | `--muted-2` ; vignette des paliers Benefits |
| .55 | `--muted` (+ `#1111118C` ×6) |
| .65 | voile de la modale cal.com |
| .7 | indicateur de bord (`.ev-edge`) |
| .72 | header sombre ; texte au survol d'une ligne Client work ; vignette des paliers |
| .86 / .94 / .97 | header compact sombre ; header compact mobile ; menu mobile ouvert |
| `rgba(16,19,18,.45)` | `.hero-scroll` : presque l'encre, alpha hors échelle (COL-03) |

**Papier** `rgb(245,245,245)` : 25 paliers, le point le plus dispersé du
système (COL-09).

| α | Usages |
|---|---|
| .05 / .08 / .1 / .12 | fond du visuel Client work mobile ; survol menu langue sombre ; filet court du menu mobile, bouton fermer de la modale ; flèches de la modale |
| .14 | filets sur fond sombre (×7) |
| .16 | bordure menu langue sombre, filet Let's talk, crête et filet du footer (×4) ; barre du préchargement |
| .2 / .22 / .28 | rail mobile Benefits ; survol du bouton fermer ; bordure du bouton contour |
| .3 / .34 | textes de la crête du footer, séparateur FR/EN |
| .42 / .45 | libellés du menu mobile et de la modale ; FR/EN, repères mobiles Benefits (+ `#F4F6F5` à .45 ×5) |
| .5 | nav et langue sur fond sombre, type et année Client work, altitudes des paliers, catégorie de la modale (×9) |
| .55 | surtitres sur fond sombre, altimètres, compteur de la modale (×6) |
| .6 / .65 / .72 / .74 / .85 | textes Benefits ; sommet ; mode d'emploi ; résumé de la modale ; liens du menu mobile |
| .78 / .88 / .92 | header clair ; étiquette de sommet ; header compact |
| .8 | mât du fanion (SVG, `Benefits.js:366`) |

**Blanc** `rgb(255,255,255)` : .1 (bordures du header mobile), .5 (numéros
de la liste sur carte bleue), .75 (texte au survol d'une ligne Services).

**Bleu** `rgb(30,41,255)` : .15 → 0 (halo Benefits), .5 (lueur du hero),
.55 (lueur du footer), .8 (ombre au survol d'une étiquette de sommet), et dans
le JS .10 / .14 (halo du logo animé).

**Noir** : `rgba(0,0,0,.6)` (ombre de texte des paliers, menu langue sombre),
`rgba(0,0,0,.9)` (ombre de la modale), `rgba(10,10,10,.86)` (voile de la
modale). Tous gardés : leur rôle est distinct (§1).

### 2.4 Couleurs posées dans le JS

| Où | Valeur |
|---|---|
| Everest (`Everest.js`) | courbes `0x111111` à .4 ; drapeaux, mâts, grimpeur `0x1E29FF` ; trace bleue en 3 tronçons à .22 / .55 / 1 ; brouillard `0xF5F5F5` de 110 à 340 |
| Mont Blanc (`Benefits.js`) | courbes `0xF5F5F5` à .28 (fines) et .75 (maîtresses) ; trace GPX `0x1E29FF` à .95 ; fanion SVG : mât papier .8, drapeau `#1E29FF` |
| Lac d'Allos (`Lake3D.js`) | courbes `0xF5F5F5` à .26 / .6 ; hachures d'eau `0x1E29FF` à .55 |
| Logo animé (`LogoReveal.js`) | carrousel et modale : encre `#1E29FF`, particules `#2A37FF`, halo bleu .14 ; page About : `#111111`, particules `#141414` (fondu dans l'encre, §1), halo bleu .10 |
| Champ réactif (`ReactiveField.js`) | fond clair : blanc → `rgb(13,26,255)` en *multiply* ; fond sombre : `rgb(245,245,245)` en *screen* |
| Illustration « en construction » (`app/work/page.js`) | traits encre .5, fanion `#1E29FF`, points encre .3 à .4 |

`#2A37FF` (particules) et `rgb(13,26,255)` sont des variantes du bleu propres
aux effets ; je ne les propose pas comme tokens.

### 2.5 Modes clair et sombre

Le site a un vrai mode sombre par section :

- bloc `.dark-wrap` (Client work et Benefits) ;
- footer (Let's talk et corps) ;
- header `.on-dark` ;
- modale projet, encadré mode d'emploi, menu mobile ;
- rideau et préchargement.

Correspondance des rôles observée dans le code :

| Rôle | Clair | Sombre : valeurs observées (usages) | Jetons Figma (règle du 8 octobre) |
|---|---|---|---|
| fond | `--paper` | `--ink` | `bg/primary` |
| texte principal | `--ink` | `--paper` | `text/primary` |
| texte secondaire (paragraphes) | `--muted` .55 | .6 (×2), .65, .72, .74, .85 | `text/muted` (.6), `text/help` (.72), `text/modal-summary` (.74), `text/menu-link` (.85) ; .65 en primitive |
| libellé, surtitre | `--muted` .55 | .55 (×6), .5 (×9) | `text/label` (.55), `text/label-dim` (.5) |
| texte discret | `--muted-2` .38 | .45, `#F4F6F5` à .45 et .26, .42 (×2), .34, .3 | `text/subtle` (.45), `text/footer` et `text/footer-top` (#F4F6F5), `text/label-faint` (.42), `text/ridge` (.34), `text/menu-separator` (.3) |
| filet | `--line` .13 | .14 (×7), .16 (×4), .1 (×2) | `border/default` (.14), `border/menu` et `border/footer` (.16), `border/menu-rule` (.1), `border/header-mobile` (blanc .1) |
| filet appuyé | `--line-2` .26 | .28 (bouton contour), .2 (rail mobile) | `border/strong` (.28) ; .2 en primitive |
| accent | `--blue` | `--blue` ; `#7D86FF` pour un libellé | `accent/default`, `accent/on-dark` |
| texte sur aplat | `#FFF` (≈ 18), papier (3) | idem | `text/on-accent` (#fff), `text/cta` (papier, `.cta .roll`), `text/on-inverse` (`.menu-btn`, `.pcard-bar-btn`) |

Les fonds translucides du header (papier .78 / .92, encre .72 / .86 / .94 /
.97) et les voiles (modale, cal.com .65, indicateur de bord .7) sont des
valeurs de composant : chacun a sa sémantique dédiée (`color/overlay/…`).

**Structure Figma** (règle du 8 octobre, D10) :

- **`primitives`**, un seul mode : les trois couleurs de marque, les couleurs
  d'interface (dont `ink-soft` #161616, `ink-deep` #0E0E0E, `ink-particle`
  #141414, `ink-scroll`) et tous les paliers d'alpha vivants du code (papier,
  encre, blanc, blanc cassé #F4F6F5, bleu, noir). Couleurs saisies en
  {r,g,b,a}.
- **`semantic`**, deux modes `clair` et `sombre`, 50 jetons : fonds, textes,
  accent, bordures, voiles, ombre, lueur. Chaque jeton reprend les valeurs
  exactes d'un usage du code en clair et en sombre ; un usage qui n'existe que
  sur fond sombre a la même valeur dans les deux modes. Chacun en alias d'une
  primitive, avec la variable CSS en *code syntax* quand une seule expression
  vaut dans les deux modes.

---

## 3. Typographie

### 3.1 Familles, graisses, noms exacts dans Figma

Chargement : Google Fonts pour Bricolage, Roboto et Space Mono
(`layout.js:84`) ; Chopin en local, `public/fonts/chopin.woff2` (`globals.css:1`).

| Variable | Famille du code | Graisses vivantes | Famille Figma | Styles Figma | Axes Figma |
|---|---|---|---|---|---|
| `--display` | Bricolage Grotesque | 400 (glyphe ± de la FAQ seulement), 600, 700 | `Bricolage Grotesque` | `Regular`, `SemiBold`, `Bold` | opsz, wdth, wght |
| `--body` | Roboto | 400, 500, 600 | `Roboto` | `Regular`, `Medium`, `SemiBold` | wdth, wght |
| `--mono` | Space Mono | 400, 700 | `Space Mono` | `Regular`, `Bold` | statique |
| `--chopin` | Chopin, 500 italique | 500 italique | `Chopin-Trial VF` | `Medium Italic` | wght |

- **Bricolage 800** est demandée à Google Fonts mais n'est utilisée que par du
  CSS mort. **Space Mono italique** est chargée et jamais utilisée (TYP-12).
- **Chopin** : le fichier servi par le site s'appelle en interne
  « Chopin-Trial Medium Italic » (Fontfabric, version 1.000). Figma a la
  version d'essai variable, `Chopin-Trial VF`. Le dessin est le même ; le nom de
  famille diffère du code (TYP-15). Licence : voir §11.
- **Taille optique** : Bricolage est chargée avec l'axe `opsz` 12–96. Le
  navigateur règle cet axe sur la taille du texte (`font-optical-sizing:auto`) :
  un titre de 56 px est dessiné avec `opsz 56`, un libellé de 11 px avec
  `opsz 12`. Figma expose l'axe ; il faut le régler style par style (TYP-14).

### 3.2 Polices hors des quatre : à signaler

Mesure sur la prod : le navigateur rapporte la police qui dessine chaque glyphe.

| Texte | Glyphes dessinés par |
|---|---|
| libellés de boutons, textes mono | Space Mono |
| flèche `→` des boutons, de « CHAMONIX → MONT BLANC », de « → Démarrer un projet » | **Consolas** (police système) |
| flèche `↗` (CTA du header, liens du footer) | **Segoe UI Symbol** (police système) |
| `↔` de « Annecy ↔ Genève » (hero, en mono) | **Consolas** (police système) |

Cause : Google Fonts ne livre Space Mono qu'en sous-ensembles latin,
latin-ext et vietnamese, qui ne contiennent ni U+2192, ni U+2194, ni U+2197. Le
navigateur passe alors à la pile de secours (`ui-monospace`, `SFMono-Regular`,
`monospace`), puis à une police système.

Ces glyphes changent donc de dessin selon le système du visiteur : c'est la
seule police « autre » réellement visible sur le site. Les flèches sont au
cœur des boutons (rotation de 45° au survol), d'où la décision D8 avant de les
reproduire.

Aucune autre famille n'est utilisée. Les piles de secours (`system-ui`,
`-apple-system`, `serif`…) ne servent qu'en cas d'échec de chargement.

### 3.3 Échelle mesurée

Valeurs calculées par le navigateur. « hérité » = interlignage non déclaré, qui
reprend le 1,6 du `body`.

**Bricolage Grotesque**

| Classe | Gr. | D : taille / interl. | M : taille / interl. | Approche | Source CSS |
|---|---|---|---|---|---|
| `.uc-title` | 700 | 57,6 / 1,6 hérité | 32 / 1,06 | D −.025em, M −.02em | `clamp(2rem,4.6vw,3.6rem)` ; M `clamp(2rem,8vw,3rem)` |
| `.manif-big` | 600 | 56 / 1,02 | 28,8 / 1,02 | −.025em | `clamp(1.8rem,3.9vw,3.5rem)` |
| `.lt-big` | 600 | 56 / 1,02 | 33,15 / 1,12 | −.025em | idem en D ; M `clamp(1.9rem,8.5vw,2.9rem)` |
| `.bn3-title` | 700 | 54,4 / 1 | 33,15 / 1 | −.03em | `clamp(2rem,4.4vw,3.4rem)` ; M `clamp(2rem,8.5vw,2.6rem)` |
| `.hero-mtitle` (≤ 1024) | 600 | — | 42,9 / 1,03 | −.03em | `clamp(2.45rem,11vw,3.6rem)` |
| `.sv2-title` (Services, About) | 600 | 44 / 1,05 | 29,6 / 1,05 | −.02em | `clamp(1.85rem,3.6vw,2.75rem)` |
| `.cw-title` | 600 | 44 / 1,07 | 29,6 / 1,07 | −.02em | idem |
| `.fq-title` | 600 | 41,6 / 1,6 hérité | 25,6 / 1,6 hérité | −.02em | `clamp(1.6rem,3vw,2.6rem)` |
| `.f-mail` | 700 | 38 / 1,08 | 24,96 / 1,08 | −.02em | `38px` ; M `clamp(20px,6.4vw,38px)` |
| `.bn3-summit h3` | 700 | 36,8 / 1,6 hérité | 20,8 / 1,6 hérité | −.02em | `clamp(1.6rem,2.6vw,2.3rem)` ; M `1.3rem` |
| `.ev-modal-txt h3` | 700 | 33,6 / 1,6 hérité | — | −.02em | `clamp(1.5rem,2.4vw,2.1rem)` |
| `.hx-nav a` (≤ 900) | 700 | — | 25,6 / 1,12 | −.02em | `clamp(1.6rem,6.5vw,2rem)` |
| `.sv2-card h3` | 600 | 29,6 / 1,6 hérité | 22,4 / 1,6 hérité | −.02em | `clamp(1.4rem,2.2vw,1.85rem)` |
| `.bn3-camp h3` | 600 | 24 / 1,6 hérité | 17,92 / 1,6 hérité | −.015em | `clamp(1.2rem,1.7vw,1.5rem)` ; M `1.12rem` |
| `.fq-q` | 600 | 20,8 / normal | 16,32 / normal | −.01em | `clamp(1.02rem,1.5vw,1.3rem)` |
| `.fq-x` (± de la FAQ) | 400 | 20,8 / 1 | 20,8 / 1 | — | `1.3rem` |
| `.home-msg .nm` | 700 | 17,6 / 1,6 hérité | masqué | −.01em | `1.1rem` |
| `.cw-name` | 600 | 17,6 / 1,6 hérité | 18,4 / 1,6 hérité | −.01em | `clamp(.95rem,1.3vw,1.1rem)` ; M `1.15rem` |
| `.pcard-bar-txt b` (≤ 1024) | 700 | — | 15,2 / 1,2 | −.01em | `.95rem` |
| `.ev-mark-name` (> 1024) | 600 | 13,76 / 1,25 | — | −.01em | `.86rem` |

**Roboto**

| Classe | Gr. | D | M | Source CSS |
|---|---|---|---|---|
| `.manif-sub` | 500 | 22 / 1,4 | 15,2 / 1,4 | `clamp(.95rem,1.55vw,1.375rem)` |
| `.sv2-lead` | 500 | 18 / 1,38 | 18 / 1,38 | `1.125rem` |
| `.sv2-desc` | 500 | 16 / 1,42 | = | `1rem` |
| `.sv2-list li span` | 600 | 16 / 1,45 | = | `1rem` |
| `.bn3-sub` | 500 | 15,84 / 1,55 | 15,2 / 1,55 | `clamp(.95rem,1.1vw,1.05rem)` |
| `.bn3-summit p` | 500 | 15,2 / 1,55 | = | `.95rem` |
| `body` (`.fq-a p`, `.uc-sub`, `.uc-cv p`) | 400 | 15,12 / 1,6 | 15 / 1,6 | `clamp(15px,1.05vw,16.5px)` |
| `.uc-sub` | 400 | 15,12 / 1,6 | 16 / 1,6 | M `1rem` |
| `.home-msg p` | 400 | 14,72 / 1,6 | masqué | `.92rem` |
| `.bn3-camp p` | 500 | 14,72 / 1,5 | = | `.92rem` |
| `.ev-modal-over` | 400 | 14,72 / 1,65 | — | `.92rem` |
| `.hx-links a`, `.hx-hook`, `.hx-mail` (≤ 900) | 400 | — | 14,04 / 1,38 | `clamp(.85rem,3.6vw,.95rem)` |
| `.cw-type` | 500 | 13,6 / 1,6 | masqué | `.85rem` |
| `.svx-name` | 500 | 13,12 / 1,6 | = | `.82rem` |
| `.svx-type` | 500 | 12,16 / 1,6 | masqué ≤ 620 | `.76rem` |
| `.pcard-bar-txt span` (≤ 1024) | 400 | — | 12 / 1,3 | `.75rem` |
| `.cursor-badge` | 500 | 10,88 / 1,6, +.01em | = | `.68rem` (inatteignable, CMP-05) |

**Space Mono** : hors exceptions signalées, les tailles sont identiques en D et
en M.

| Classe | Gr. | Taille / interl. | Approche | CAPS |
|---|---|---|---|---|
| `.pre-count` (préchargement) | 400 | 16 / 1,6 | .22em | — |
| `.hb-val` | 400 | 12 / 1,2 | — | — |
| `.foot-col a`, `.hx-lang`, `.ev-modal-meta dd` | 400 | 12 / 1,6 | — (`.hx-lang` .08em) | — |
| `.f-hook` | 400 | 11,52 / 1,6 | .18em | oui |
| `.svx-go` | 700 | 11,52 / 1,6 | .08em | oui |
| `.cw-year` | 400 | D 11,2 / M 12,48 | — | — |
| `.sv2-eyebrow`, `.lt-eyebrow`, `.uc-eyebrow` | 700 | 11 / 1 (`.sv2-`) ou 1,6 | .08em | oui |
| `.nav-mid a`, `.lang-trigger`, `.lang-menu button`, `.menu-btn`, `.svx-toggle` | 400 (actif 700) | 11 / normal | .08em | oui |
| `.btnf`, `.cta` | 400 | 11 / 1,6 ; M hero 10 | .06em ; M hero .05em | oui |
| `.fq-q i` (numéro) | 400 | 11 / normal | .08em | — |
| `.bn3-alt`, `.lt-alt` (altimètres sombres) | 400 | 11 / 1,9 | .14em | texte déjà en capitales |
| `.ev-help-body` | 400 (`b` 700) | 11 / 1,4 ; rangé 8 | 1,512 px fixe (TYP-11) | oui |
| `.svx-time` | 400 | 10,88 / 1,6 | — | — |
| `.ev-meta` (altimètre clair) | 400 | 10 / 2 | .18em | oui |
| `.hb-lbl` | 400 | 10 / 1 | .18em | oui |
| `.hero-scroll`, `.veil-mark`, `.ev-modal-camp`, `.ev-modal-meta dt` | 400 | 10 / 1,6 | .18em | oui |
| `.ev-modal-count` | 400 | 10 | .18em | — |
| `.foot-col h4` | 400 | 10 / 1,6 | .16em | oui |
| `.foot-copy`, `.foot-loc`, `.foot-topbtn`, `.ev-modal-cat` | 400 | 10 / 1,6 | .14em | oui |
| `.hx-label` (≤ 900) | 700 | 10 / 1,6 | .12em | oui |
| `.foot-figma` | 400 (`b` 700) | 10 / 1,6 | .12em | oui |
| `.bn3-campalt` | 400 | 10 / 1,6 | .12em | — |
| `.svx-pill` | 400 | 10 / normal | .05em | oui |
| `.sv2-list li i` | 400 | 10 / 1,45 | — | — |
| `.hero-meyebrow` (≤ 1024) | 400 | M 9,36 / 1,4 | .01em | — |
| `.ev-mark-alt` | 400 | 9 / 1 | .16em | oui |
| `.ev-mark-proj` | 400 | 9 / 1,3 | .14em | oui |
| `.svx-head` | 400 | 9 / 1,6 | .14em | oui |
| crête du footer (SVG) | 400 | 9 | .14em | — |
| `.ev-edge` | 700 | 8 / 1 | .14em | oui |

**Chopin** : `.pre-word`, 500 italique, D 40 / 1,2, M 24 / 1,2,
`clamp(1.5rem,3.6vw,2.5rem)`. Préchargement : intouchable, documenté seulement.

### 3.4 Styles de texte (D6, règle du 8 octobre)

Un style par classe du code, à ses valeurs exactes : 118 styles, 66 dans
`text/desktop/…` et 52 dans `text/mobile/…` (un style n'existe que dans le
jeu où sa classe est visible). Deux classes ne partagent un style que si
toutes leurs valeurs sont identiques. Bricolage porte son axe `opsz` réglé sur
la taille, borné à 12–96 (D9). « = » : comme en desktop.

| Style | Police | D : taille · interl. · approche | M | Classes |
|---|---|---|---|---|
| `display` | Bricolage SemiBold | 56 · 102 % · −2,5 % · retrait 144 | 28,8 · 102 % · −2,5 % · retrait 56 | `.manif-big` ; `.lt-big` en desktop |
| `display-lt` | Bricolage SemiBold | — | 33,15 · 112 % · −2,5 % · retrait 56 | `.lt-big` ≤ 760 |
| `heading-1` | Bricolage Bold | 54,4 · 100 % · −3 % | 33,15 · 100 % · −3 % | `.bn3-title` |
| `heading-1-uc` | Bricolage Bold | 57,6 · 160 % · −2,5 % | 32 · 106 % · −2 % | `.uc-title` |
| `heading-2` | Bricolage SemiBold | 44 · 105 % · −2 % | 29,6 · 105 % · −2 % | `.sv2-title` |
| `heading-2-cw` | Bricolage SemiBold | 44 · 107 % · −2 % | 29,6 · 107 % · −2 % | `.cw-title` |
| `heading-2-fq` | Bricolage SemiBold | 41,6 · 160 % · −2 % | 25,6 · 160 % · −2 % | `.fq-title` |
| `heading-3` | Bricolage Bold | 36,8 · 160 % · −2 % | 20,8 · 160 % · −2 % | `.bn3-summit h3` |
| `heading-3-modal` | Bricolage Bold | 33,6 · 160 % · −2 % | — | `.ev-modal-txt h3` |
| `heading-4` | Bricolage SemiBold | 29,6 · 160 % · −2 % | 22,4 · 160 % · −2 % | `.sv2-card h3` |
| `heading-5` | Bricolage SemiBold | 24 · 160 % · −1,5 % | 17,92 · 160 % · −1,5 % | `.bn3-camp h3` |
| `heading-6` | Bricolage SemiBold | 20,8 · auto · −1 % | 16,32 · auto · −1 % | `.fq-q` |
| `sign` | Bricolage Regular | 20,8 · 100 % · −1 % | = | `.fq-x` (± de la FAQ) |
| `title` | Bricolage SemiBold | 17,6 · 160 % · −1 % | 18,4 · 160 % · −1 % | `.cw-name` |
| `title-strong` | Bricolage Bold | 17,6 · 160 % · −1 % | — | `.home-msg .nm` |
| `title-sm` | Bricolage Bold | — | 15,2 · 120 % · −1 % | `.pcard-bar-txt b` |
| `title-xs` | Bricolage SemiBold | 13,76 · 125 % · −1 % | — | `.ev-mark-name` |
| `hero` | Bricolage SemiBold | — | 42,9 · 103 % · −3 % | `.hero-mtitle` |
| `email` | Bricolage Bold | 38 · 108 % · −2 % | 24,96 · 108 % · −2 % | `.f-mail` |
| `menu` | Bricolage Bold | — | 25,6 · 112 % · −2 % | `.hx-nav a` |
| `lead-lg` | Roboto Medium | 22 · 140 % | 15,2 · 140 % | `.manif-sub` |
| `lead` | Roboto Medium | 18 · 138 % | = | `.sv2-lead` |
| `body-md` | Roboto Medium | 16 · 142 % | = | `.sv2-desc` |
| `body-md-list` | Roboto SemiBold | 16 · 145 % | = | `.sv2-list li span` |
| `body` | Roboto Regular | 15,12 · 160 % | 15 · 160 % | `body`, `.fq-a p`, `.uc-sub` (desktop), `.uc-cv p` |
| `body-uc` | Roboto Regular | — | 16 · 160 % | `.uc-sub` ≤ 760 |
| `body-sm` | Roboto Medium | 15,2 · 155 % | = | `.bn3-summit p` ; `.bn3-sub` en mobile |
| `body-sm-sub` | Roboto Medium | 15,84 · 155 % | — | `.bn3-sub` |
| `body-xs` | Roboto Regular | 14,72 · 160 % | — | `.home-msg p` |
| `body-xs-camp` | Roboto Medium | 14,72 · 150 % | = | `.bn3-camp p` |
| `body-xs-modal` | Roboto Regular | 14,72 · 165 % | — | `.ev-modal-over` |
| `body-menu` | Roboto Regular | — | 14,04 · 138 % | `.hx-links a`, `.hx-hook`, `.hx-mail` |
| `caption` | Roboto Medium | 13,6 · 160 % | — | `.cw-type` |
| `caption-name` | Roboto Medium | 13,12 · 160 % | = | `.svx-name` |
| `caption-type` | Roboto Medium | 12,16 · 160 % | — | `.svx-type` |
| `caption-card` | Roboto Regular | — | 12 · 130 % | `.pcard-bar-txt span` |
| `preloader` | Chopin-Trial VF Medium Italic | 40 · 120 % | 24 · 120 % | `.pre-word` (intouchable) |
| `overline` | Space Mono Bold | 11 · 100 % · +8 % · CAPS | = | `.sv2-eyebrow` |
| `overline-lt` | Space Mono Bold | 11 · 160 % · +8 % · CAPS | = | `.lt-eyebrow`, `.uc-eyebrow` |
| `overline-go` | Space Mono Bold | 11,52 · 160 % · +8 % · CAPS | — | `.svx-go` |
| `nav` | Space Mono Regular | 11 · auto · +8 % · CAPS | = | `.nav-mid a`, `.lang-trigger`, `.lang-menu button`, `.menu-btn`, `.svx-toggle` |
| `nav-active` | Space Mono Bold | 11 · auto · +8 % · CAPS | = | état actif de `nav` |
| `nav-roll` | Space Mono Regular | 11 · 118 % · +8 % · CAPS | — | lettres du roll de `.nav-mid a` |
| `nav-active-roll` | Space Mono Bold | 11 · 118 % · +8 % · CAPS | — | page courante, lettres du roll |
| `button` | Space Mono Regular | 11 · 160 % · +6 % · CAPS | = | `.btnf`, `.cta` |
| `button-roll` | Space Mono Regular | 11 · 118 % · +6 % · CAPS | — | lettres du roll d'un bouton (`.roll .rl`, line-height 1.18) |
| `button-hero` | Space Mono Regular | — | 10 · 160 % · +5 % · CAPS | `.hero-mcta .btnf` |
| `label` | Space Mono Regular | 10 · 160 % · +18 % · CAPS | = | `.hero-scroll`, `.veil-mark`, `.ev-modal-camp`, `.ev-modal-meta dt` |
| `label-hb` | Space Mono Regular | 10 · 100 % · +18 % · CAPS | — | `.hb-lbl` |
| `label-count` | Space Mono Regular | 10 · 160 % · +18 % | — | `.ev-modal-count` |
| `label-hook` | Space Mono Regular | 11,52 · 160 % · +18 % · CAPS | = | `.f-hook` |
| `label-sm` | Space Mono Regular | 10 · 160 % · +14 % · CAPS | = | `.foot-copy`, `.foot-loc`, `.foot-topbtn`, `.ev-modal-cat` |
| `label-sm-col` | Space Mono Regular | 10 · 160 % · +16 % · CAPS | = | `.foot-col h4` |
| `label-sm-figma` | Space Mono Regular | 10 · 160 % · +12 % · CAPS | = | `.foot-figma` |
| `label-sm-strong` | Space Mono Bold | 10 · 160 % · +12 % · CAPS | = | `.foot-figma b`, `.hx-label` |
| `micro` | Space Mono Regular | 9 · 160 % · +14 % · CAPS | = | `.svx-head` |
| `micro-alt` | Space Mono Regular | 9 · 100 % · +16 % · CAPS | — | `.ev-mark-alt` |
| `micro-proj` | Space Mono Regular | 9 · 130 % · +14 % · CAPS | — | `.ev-mark-proj` |
| `micro-edge` | Space Mono Bold | 8 · 100 % · +14 % · CAPS | — | `.ev-edge` |
| `micro-ridge` | Space Mono Regular | 9 · auto · +14 % | = | altitudes de la crête du footer (texte SVG) |
| `meta` | Space Mono Regular | 12 · 160 % | = | `.foot-col a`, `.ev-modal-meta dd` |
| `meta-hb` | Space Mono Regular | 12 · 120 % | — | `.hb-val` |
| `meta-lang` | Space Mono Regular | — | 12 · 160 % · +8 % | `.hx-lang` |
| `data` | Space Mono Regular | 11 · auto · +8 % | = | `.fq-q i` |
| `data-year` | Space Mono Regular | 11,2 · 160 % | 12,48 · 160 % | `.cw-year` |
| `data-time` | Space Mono Regular | 10,88 · 160 % | = | `.svx-time` |
| `data-list` | Space Mono Regular | 10 · 145 % | = | `.sv2-list li i` |
| `data-camp` | Space Mono Regular | 10 · 160 % · +12 % | = | `.bn3-campalt` |
| `altimeter` | Space Mono Regular | 11 · 190 % · +14 % | — | `.bn3-alt`, `.lt-alt` |
| `altimeter-ev` | Space Mono Regular | 10 · 200 % · +18 % · CAPS | — | `.ev-meta` |
| `help` | Space Mono Regular | 11 · 140 % · 1,512 px · CAPS | — | `.ev-help-body` |
| `help-strong` | Space Mono Bold | 11 · 140 % · 1,512 px · CAPS | — | `.ev-help b` |
| `help-docked` | Space Mono Regular | 8 · 140 % · 1,512 px · CAPS | — | `.ev-help.docked .ev-help-body` |
| `help-docked-strong` | Space Mono Bold | 8 · 140 % · 1,512 px · CAPS | — | `.ev-help b`, rangé ouvert |
| `chip` | Space Mono Regular | 10 · auto · +5 % · CAPS | = | `.svx-pill` |
| `hero-meta` | Space Mono Regular | — | 9,36 · 140 % · +1 % | `.hero-meyebrow` |

*Jusqu'au 8 octobre : 33 styles qui rattachaient plusieurs classes à une
même valeur (approches mono ramenées à quatre, tailles mono entières, titres
à l'interlignage d'autres titres).*

Le compteur du préchargement (`.pre-count`) reste documenté dans le composant
Préchargement, sans style propre.

---

## 4. Espacements et mise en page

### 4.1 Variables existantes

| Variable | Valeur | D 1440 | M 390 |
|---|---|---|---|
| `--pad` | `clamp(20px,5vw,60px)` | 60 | 20 (la surcharge à 16 px sous 480 ne s'applique jamais, ESP-04) |
| `--hh` | `64px` | 64 | 64 |
| `--cardw` | `clamp(320px,40vw,530px)` ; ≤ 680 `clamp(250px,86vw,400px)` | sans effet depuis le passage à la scène Everest | — |
| `--rv-y` | `28px` | décalage des apparitions | — |

Il n'existe **aucune échelle d'espacement** dans le code : tout le reste est
écrit en dur.

### 4.2 Marges de page mesurées

| Élément | D 1440 | 1024 | 900 | 760 | M 390 |
|---|---|---|---|---|---|
| `nav` | 56 | 56 | 45 (`--pad`) | 38 | 20 |
| bas du hero, `.wrap`, scène Everest | 60 (`--pad`) | — | — | — | 20 |
| sections `.sv2`, `.cw`, `.ab`, `.fq` | 112 | 112 | 112 | 38 | 20 |
| Let's talk `.lt` | 112 | 51,2 (`--pad` sous 1400) | 45 | 38 | 20 |
| filet de Let's talk `.lt::after` | 112 | **112** | **112** | **40** | **40** |
| footer `.foot-pad` | 56 | 56 | 56 | **20** | 20 |

Trois marges cohabitent sur desktop : 56, 60 et 112 (ESP-01). Le filet de
Let's talk ne suit jamais le contenu sous 1400 px, et le footer ne suit pas
`--pad` entre 761 et ~400 px (ESP-02, ESP-03).

### 4.3 Rythme vertical des sections

Toutes ces valeurs sont en `vh` : elles varient avec la hauteur d'écran
(ESP-06). Mesures à 900 et 844 de haut.

| Section | Haut D / M | Bas D / M | Source |
|---|---|---|---|
| hero | hauteur 836 / 780 | — | `100vh − --hh` ; M `100svh − --hh` |
| manifeste | 162 / 92,8 | 117 / 67,5 | `clamp(110px,18vh,230px)` ; M `clamp(70px,11vh,140px)` |
| Services `.sv2` | 90 / 50,6 | 324 / 109,7 | `clamp(60px,10vh,130px)` / `clamp(305px,36vh,485px)` |
| bloc sombre `.dark-wrap` | marge −604,8 / −105, retrait 470 / 260 | — | chevauchement de la crête |
| Client work `.cw` | 31,5 / 30 | 63 / 50 | `clamp(20px,3.5vh,48px)` |
| About `.ab` | 90 / 50,6 | 63 / 67,5 | |
| FAQ `.fq` | 108 / 67,5 | 135 / 90 | `clamp(84px,12vh,140px)` |
| Let's talk `.lt` | 144 / 118,2 | — / 84,4 | `clamp(110px,16vh,190px)` |
| footer `.foot-pad` | 54 / 50,6 | 27 / 25,3 | `clamp(40px,6vh,72px)` |
| page en construction | 72 / 126,6 | 72 / 76 | `.sec` |

### 4.4 Échelle de fait (valeurs fixes, px)

Relevé de `padding`, `margin` et `gap`, nombre d'usages approximatif :

| px | ≈ | Exemples |
|---|---|---|
| 1 | 2 | écart titre / catégorie de la barre de carte, étiquette de sommet |
| 2 | 8 | retrait des questions FAQ, libellé `.hb-lbl` |
| 3 | 2 | listes du menu mobile |
| 4 | 6 | menu langue, liens du footer |
| 5 | 3 | déclencheur de langue |
| 6 | 17 | puces de filtre (écart et retrait), menu langue |
| 7 | 10 | surtitres (écart du flocon), `.cta`, étiquettes et bords Everest |
| 8 | 14 | `.svx-toggle`, `.menu-btn`, `.ev-mark` |
| 9 | 12 | écart des boutons, retrait de `.cta`, `.menu-btn`, `.svx-row`, `.pcard-bar` |
| 10 | 23 | lignes Services, `.cw-row`, `.hero-mcta` |
| 12 | 13 | liste FAQ, `.cw-row`, `.pcard-bar` |
| 13 | 6 | retrait vertical des boutons, titres de menu mobile |
| 14 | 30 | retrait horizontal de `.cta` et `.menu-btn`, paires de CTA, marges sous les titres |
| 15 | 2 | retrait au survol d'une ligne Services |
| 16 | 13 | marges des grands titres, visuels About, réponses FAQ |
| 18 | 12 | question FAQ, filet du footer, navigation de la modale |
| 20 | 11 | question FAQ, grille du menu mobile |
| 22 | 6 | entre cartes Services, menu mobile, réponses FAQ |
| 24 | 13 | retrait horizontal des boutons, nav, grille du hero, mode d'emploi |
| 26 | 6 | retrait horizontal des questions FAQ |
| 30 | 10 | CTA About, colonnes du footer, mode d'emploi |
| 34 | 4 | marges des CTA isolés (« Tous les projets », Let's talk) |
| 36 | 3 | grille Services mobile, footer ≤ 900, méta de la modale |
| 40 | 9 | CTA Services, CTA About mobile |
| 56 | 4 | nav, footer (desktop) |
| 112 | 5 | sections (desktop) |

Valeurs irrégulières, faute d'échelle : 1, 3, 5, 7, 9, 13, 15, 22, 26, 34, 36
(ESP-05). Certaines structurent des composants : un bouton fait 13 / 24, un
`.cta` 9 / 14.

### 4.5 Grilles réellement utilisées

Le code n'a **pas de grille de colonnes globale** : chaque section pose la
sienne.

| Bloc | Colonnes | Gouttière D (1440) | ≤ 760 |
|---|---|---|---|
| `.wrap` | conteneur centré, 1320 max | — | pleine largeur − `--pad` |
| sections desktop | contenu 1216 (1440 − 2 × 112) | — | — |
| `.hb-grid` (bas du hero) | 4 colonnes égales (> 1024) | 24 | masqué |
| `.sv2-grid` (Services) | 1,05fr / 0,95fr | 100,8 (`clamp(48px,7vw,120px)`) ; 761–930 : `clamp(28px,4vw,56px)` | 1 colonne, 36 |
| `.cw-head` | 1fr / 1fr, titre en colonne 2 | 24 | 1 colonne |
| `.ab` (About) | 1fr / 1,05fr | 86,4 (`clamp(40px,6vw,90px)`) | 1 colonne, 40 |
| `.ab-figs` | 1fr / 1fr | 16 | 10 |
| `.foot-cta-pair` | 1fr / 1fr | 14 | 1 colonne |
| `.ev-modal-box` | 1,35fr / 1fr | — | (desktop seul) |
| `.hx-grid` (menu mobile) | 1fr / auto | 20 / 22 | — |

À l'étape 2, les grilles Figma par point de rupture ne reprendront que ces
données : marges de page (D3), 2 colonnes au-dessus de 760 et 1 en dessous,
gouttière de la section concernée. Aucune grille à 12 colonnes, puisque le
code n'en a pas.

---

## 5. Rayons

| Valeur | Où | Statut |
|---|---|---|
| **5 px** | header compact et menu ouvert, boutons, `.cta`, `.menu-btn`, cartes carrousel et barres, cartes Services, lignes et puces Services, aperçu Client work, visuels About, questions FAQ, étiquettes de sommet, modale et ses boutons, boutons carrés 38 | **rayon de la marque** (23 règles) |
| 4 px | encadré mode d'emploi `.ev-help`, contour de focus de son bouton | `radius/4` (RAY-01) |
| 8 px | menu langue `.lang-menu`, petit menu déroulant | `radius/8` (RAY-01) |
| 2 px | soulignement de l'e-mail du footer, poignée de la barre de défilement | détail |
| 3 px | contour de focus du bouton plein écran | détail |
| 38 → 20 px | coins hauts du footer, `clamp(20px,3vw,38px)` : 38 en D, 30,7 à 1024, 20 en M | fluide (RAY-02) |
| 50 % | pastilles (point de statut, flocon, repères Benefits) | cercle |
| 0 5 5 0 | visuel About qui déborde à gauche (`.ab-fig--bleed`) | voulu |
| 100 px, 8 px, 4 px | `.pill`, `.wcard`, `.portrait`, `.ph-tag`… | CSS mort |

---

## 6. Ombres et effets

### 6.1 Ombres portées

Toutes différentes, aucune variable (EFF-01). Géométrie Figma : x, y, flou,
étalement, couleur.

| Usage | Valeur CSS | Nom retenu |
|---|---|---|
| header compact | `0 24px 50px -30px rgba(17,17,17,.35)` | `shadow/header` |
| header mobile, menu ouvert | `0 24px 50px -30px rgba(17,17,17,.5)` | `shadow/header-menu` |
| menu langue | `0 12px 30px -12px rgba(17,17,17,.25)` ; sombre `rgba(0,0,0,.6)` | `shadow/menu` (clair / sombre) |
| visuel de carte carrousel | `0 12px 26px -20px rgba(17,17,17,.22)` | `shadow/card` |
| barre de carte, bouton carré Client work | `0 14px 30px -22px rgba(17,17,17,.45)` | `shadow/card-bar` |
| étiquette de sommet | `0 6px 18px -14px rgba(17,17,17,.55)` | `shadow/flag` |
| étiquette de sommet au survol | `0 10px 26px -16px rgba(30,41,255,.8)` | `shadow/flag-hover` |
| modale projet | `0 50px 110px -60px rgba(0,0,0,.9)` | `shadow/modal` |
| badge curseur | `0 8px 20px -8px rgba(30,41,255,.5)` | inatteignable (CMP-05) |
| texte des paliers Benefits | `text-shadow: 0 1px 10px rgba(0,0,0,.6)` | `shadow/text` |

### 6.2 Flous

| Type | Valeur | Où |
|---|---|---|
| arrière-plan | 14 px | header |
| arrière-plan | 8 px | étiquettes de sommet |
| arrière-plan | 4 px | voile de la modale |
| calque | 58 px | lueur bleue du hero |
| calque | 66 px | lueur bleue du footer |
| calque | 22 px | champ réactif (curseur WebGL) |

### 6.3 Grain

Un seul motif, recopié en data-URI dans 8 règles (EFF-02) : SVG 240 × 240,
`feTurbulence type=fractalNoise baseFrequency=0.72 numOctaves=2 stitchTiles`,
rectangle à 55 % d'opacité.

| Où | Opacité | Fusion | Mouvement |
|---|---|---|---|
| tout le site (`body::after`, fixe, débordement −100 %) | .21 | *difference* | `grainMove` 7 s `steps(8)` |
| header (`header::after`) | .21 | *difference* | `grainShift` 7 s `steps(8)` |
| préchargement, modale | .21 | *difference* | `grainMove` 7 s `steps(8)` |
| cartes Services au survol | .6 (motif à 300 px) | normale | `cardGrain` .4 s `steps(4)` |
| lignes Services au survol | .4 | normale | `cardGrain` .4 s `steps(4)` |
| mots accentués du manifeste | texte détouré sur `#63636A` (titre mobile `#4A4A52`) | — | `accGrain` .55 s `steps(5)` |

### 6.4 Lueurs, dégradés, fusions

- **Lueur du hero** : tache bleue `rgba(30,41,255,.5)` à opacité .5 (.28
  quand la scène Everest est là), flou 58, contour animé `blob` 9,5 s.
- **Lueur du footer** : `rgba(30,41,255,.55)` à .5, flou 66, `footDrift`
  12,5 s et `footMorph` 8,5 s. Quasi identique à celle du hero (EFF-04).
- **Halo Benefits** : dégradé radial bleu .15 → 0.
- **Vignette des paliers** : dégradé radial encre .72 → .38 → 0.
- **Masque de la liste Services** (≤ 1024) : noir jusqu'à 82 %, puis transparent.
- **Fusions** : *difference* pour le grain, *screen* pour la neige et le champ
  réactif sur fond sombre, *multiply* pour le champ réactif sur fond clair.
- **Neige et nuages pixelisés** : `pixels.png` (tuile de 64), `clouds.png`,
  `image-rendering:pixelated`.

---

## 7. Points de rupture

Règle du projet (`CLAUDE.md`) : **760 / 900 / 1024 / 1400**.

| Requête | Règles | Rôle | Statut |
|---|---|---|---|
| `max-width:1440px` | 1 | borne `.wrap.sec` sous 1440 | hors règle, inoffensif |
| `max-width:1399px` / JS `>= 1400` | 5 | Let's talk sans lac | officiel |
| `max-width:1024px` / `min-width:1025px` | 38 / 46 | bascule du hero (Everest / colonne de projets) | officiel |
| `max-width:930px and min-width:761px` | 2 | Services sur deux colonnes serrées | hors règle |
| `max-width:900px` / `min-width:901px` | 23 / 2 | barre et menu mobiles | officiel |
| `max-width:760px` | 110 | téléphone | officiel |
| `max-width:680px` | 13 | ancienne nav : une seule règle encore vivante, `.veil-mark` | hors règle, quasi mort (BRK-02) |
| `max-width:620px` | 5 | colonnes de l'index Services | hors règle |
| `max-width:560px` | 2 | colonnes du footer | hors règle |
| `max-width:480px` | 3 | surcharges jamais appliquées | hors règle, mort (ESP-04) |
| `hover:none` | 27 | neutralise les survols au doigt | — |
| `pointer:coarse` | 1 (+ JS) | coupe le champ réactif et le défilement fluide | — |
| `prefers-reduced-motion` | 11 | coupe animations et transitions | — |

Seuils JS : 760 / 761 (Benefits, LogoReveal, Ridge), 900 (fermeture du menu),
1024 / 1025 (`app/page.js`, `Carousel.js`), 1400 (`Footer.js`). Le JS utilise
aussi 1200 comme largeur de référence pour l'échelle de la crête et le seuil
du header sombre (`k = largeur / 1200`, borné à 0,55–1).

Cadres Figma retenus : **1440** (référence desktop), **1400**,
**1024**, **900**, **760**, **390** (référence mobile).

---

## 8. Mouvement

### 8.1 Courbes

| Nom dans le code | Valeur | Usages | Rôle |
|---|---|---|---|
| `--e` | `cubic-bezier(.22,1,.36,1)` | 82 | courbe maison, sortie très rapide : header, couleurs, rideau, apparitions desktop, cartes, modale |
| `--eio` | `cubic-bezier(.65,0,.35,1)` | 13 | entrée-sortie symétrique, réservée à l'encadré mode d'emploi (déclarée sur `.ev`) |
| `--rv-e` | `cubic-bezier(.4,0,.2,1)` | 10 | apparitions au défilement, toutes tailles depuis la section 12 |
| *aucun* | `cubic-bezier(.65,0,.2,1)` | 4 | effet roll, rotation 72° des logos, flèche du CTA header (MOT-01) |
| *aucun* | `cubic-bezier(.55,0,.55,.2)` | 1 | sortie d'un mot du préchargement (intouchable) |
| *aucun* | `cubic-bezier(.25,.6,.3,1)` | 1 | onde du flocon `flakePing` |
| `ease-in-out` | — | 4 | boucles : lueur du hero, point de statut, lueur du footer, chevron mobile |
| `linear` | — | 10 | rotations, neige, dérive de la lueur, rail mobile, bords Everest |
| `steps(4)` · `steps(5)` · `steps(8)` | — | 7 | grain animé |

Courbes écrites en JS :

- *smoothstep* (Benefits, lac, logo animé) ;
- *ease-out cubic* et *ease-in-out quint* (logo animé) ;
- *ease-in-out quad* (vol vers un drapeau) ;
- `1 − (1 − p)^2.4` (dévoilement de l'Everest), `1 − (1 − p)²` (crête) ;
- amortis exponentiels par image : aperçu Client work .18, champ réactif .085,
  défilement fluide .045, effet magnétique .30.

### 8.2 Durées des transitions

| Groupe | Valeurs | Exemples |
|---|---|---|
| micro | .15 · .2 · .22 · .25 · .28 s | menu langue, étiquettes de sommet, puces de filtre, boutons de la modale |
| rapide | **.3** · .35 · .38 · .4 s | roll, liens, `.cta`, boutons `.btnf` (.35), FAQ ±, apparition de la modale (.38) |
| base | .45 · **.5** · **.55** s | header (couleurs .5), rideau .55, menu mobile .55, réponses FAQ .5 |
| modérée | .6 · .65 · .7 · .75 s | header compact (.6), logo 72° (.6), lignes Client work (.65 / .75), cartes Services (.7) |
| lente | .8 · **.85** · .9 s | préchargement (.8), apparitions desktop (.85), mode d'emploi (.85), lignes Services |
| apparition | **1.05** (`--rv-d`) · 1.1 · 1.2 s | apparitions unifiées, zoom des visuels About, apparitions ≤ 1024 |

26 valeurs distinctes en tout (MOT-02).

### 8.3 Boucles

| Animation | Durée | Courbe |
|---|---|---|
| grain (site, header, préchargement, modale) | 7 s | `steps(8)` |
| grain des cartes et lignes Services | .4 s | `steps(4)` |
| grain des mots accentués | .55 s | `steps(5)` |
| lueur du hero `blob` | 9,5 s | `ease-in-out` |
| lueur du footer | 12,5 s + 8,5 s | linéaire + `ease-in-out` |
| logo du rideau | 6 s | linéaire |
| logo du menu de footer | 44 s | linéaire |
| onde du flocon | 1,9 s | `cubic-bezier(.25,.6,.3,1)` |
| point de statut, trait « Défiler pour explorer » | 2,4 s | `ease-in-out` / `--e` |
| chevron mobile | 1,9 s | `ease-in-out` |
| neige About (tactile) | 4 s | linéaire |
| logo animé des cartes | 4 s en boucle (About : 3 s une fois) | JS |

### 8.4 Mécaniques documentées pour la page Motion

- **Effet roll** (`Roll.js`, `globals.css:51-57`). Chaque caractère est
  doublé : deux copies empilées dans une fenêtre `overflow:hidden`, interligne
  1,18. Au survol de l'ancêtre `a`, `button` ou `.roll`, la pile monte de
  100 % en .3 s `cubic-bezier(.65,0,.2,1)`, avec 20 ms de décalage par
  caractère. Figé sans survol (`hover:none`).
- **Rideau** (`Veil.js`, `globals.css:265-273`).
  1. Fond encre plein écran (plan 5950) ; montée de 101 % à 0 en .55 s `--e`.
  2. Navigation déclenchée après 580 ms.
  3. Levée de 0 à −101 % en .55 s `--e`, dès que la nouvelle route est
     montée (secours à 2,5 s).

  Logo de 84 px qui tourne en 6 s ; mention mono 10 px en bas à gauche.
- **Préchargement** (intouchable). 3 s : compteur 000 → 100, six mots qui
  défilent, barre de progression. Sortie vers le haut en .8 s `--e`, 200 ms
  après 100.
- **Apparitions.** Desktop : `[data-reveal]` en .85 s `--e`, déclenché à la
  fin du préchargement, avec les délais `--rd` du balisage. Groupes et
  `.reveal` : 1,05 s `--rv-e`, décalage 28 px. ≤ 1024 : 1,2 s (MOT-04).
- **Header compact** : au-delà de 70 px de défilement, le header devient une
  pilule flottante (largeur, position, rayon, ombre en .6 s `--e`).
- **Effet magnétique** des boutons : le bouton suit la souris (25 % en x,
  35 % en y), lissage .30 par image ; désactivé au doigt et en mouvement réduit.
- **Défilement fluide** à la molette : lissage .045, multiplicateur .944.
- **Texte du manifeste** : chaque caractère passe de .1 à 1 d'opacité sur un
  front de 14 caractères, piloté par le défilement.
- **Crête** : `clip-path` à 7 sommets, qui passe d'une ligne plate (385 px) à
  son amplitude réelle avec le défilement, en *ease-out*.

---

## 9. Composants

Composants vivants, trouvés dans le code. En gras : ceux que cite le brief.
« États codés » = ce que le CSS ou le JS définit réellement.

| Composant | Fichiers / classes | Variantes | États codés |
|---|---|---|---|
| **Bouton / CTA** | `.btnf` + `.btnf-blue`, `.btnf-ink`, `.btnf-ghost`, `.btn-blue`, `.btn-ink`, `.sv2-cta` | bleu, encre, contour sur fond sombre ; taille 46 px (13 / 24) ; compact hero mobile (14 / 12, 10 px) | défaut ; survol (fond, roll du libellé, flèche à 45°, magnétique) ; pas de focus propre, pas de désactivé |
| **Bouton compact** | `.cta` (header), `.menu-btn` | bleu (`.cta`), encre ; inversé papier sur fond sombre (`.menu-btn`) ; 36 / 34 px (9 / 14) | défaut, survol (`.cta`) ; ouvert, fermé (`.menu-btn`) |
| Bouton icône | `.pcard-bar-btn` (38, encre), `.cw-shot-btn` (38, papier), `.ev-modal-x` (36), `.ev-modal-arrow` (40), `.ev-help-btn` (30), `.ev-full-btn` (26) | tailles, fonds plein, translucide ou nu | survol ; focus sur les quatre derniers |
| **Lien avec effet roll** | `Roll.js`, `.roll .rl .rl-in` | dans nav, boutons, CTA | défaut, survol |
| Liens texte | `.nav-mid a`, `.foot-col a`, `.f-mail`, `.u-blue`, `.hx-links a`, `.foot-topbtn` | nav, footer, e-mail souligné, soulignement bleu | survol (bleu, décalage de 4 px, soulignement animé) ; courant (nav : bleu, gras) ; tap (menu mobile : bleu) |
| Surtitre | `.sv2-eyebrow`, `.lt-eyebrow`, `.uc-eyebrow` + `.sv2-flake` | clair, sombre | flocon qui émet une onde |
| Pastilles | `.hb-val .dot`, `.hero-meyebrow .dot`, `.sv2-flake` | 8, 6, 7 px | pulsation, onde |
| **Tags** | `.svx-pill` (filtres Services) | — | défaut, survol (bordure et texte bleus), actif (fond bleu) |
| Bascule à chevron | `.svx-toggle`, `.lang-trigger` | — | défaut, survol, ouvert (chevron à 180°) |
| Sélecteur de langue | `.lang`, `.lang-menu` | clair, sombre | fermé, ouvert ; option courante en gras |
| Logo | SVG à 5 tracés dans un cercle (`Header.js`, `Footer.js`, `Veil.js`, `app/icon.svg`) | 34 (header), 44 (footer), 54 (menu du footer, opacité .12), 84 (rideau) ; encre sur fond clair, papier sur fond sombre ; favicon `icon.svg` en blanc, qui deviendra le logo papier sur fond bleu (§1) | survol : rotation de 72° ; rotation continue (rideau, footer) |
| **Header flottant** | `header`, `nav`, `Header.js` | desktop, mobile ≤ 900 | haut de page, compact, sur fond sombre, compact sombre ; mobile : barre, compact noir, menu ouvert |
| Menu mobile | `.hx` (extension du header) | — | fermé, ouvert (liens en cascade .10 / .16 / .22 s) |
| **Footer** | `Footer.js` : `.lt` (Let's talk), `.foot-body` | avec lac (≥ 1400), sans lac | survols des liens, de l'e-mail, des boutons |
| Altimètre | `.ev-meta` (hero), `.bn3-alt` (Benefits), `.lt-alt` (Let's talk) | clair, sombre | valeur mise à jour en continu |
| **Drapeau de sommet** | `.ev-mark` (étiquette) + drapeau 3D (`Everest.js`) ; fanion `.bn3-flagpin` (SVG) | étiquette, fanion | défaut, survol / focus (bleu) |
| Indicateur de bord | `.ev-edge`, `-l`, `-r`, `-t` | gauche, droite, haut | caché, visible, survol / focus |
| **Encadré mode d'emploi** | `.ev-help` | — | masqué, centré, rangé (30 × 30), rangé ouvert (330 × 150 max) |
| Bouton plein écran | `.ev-full-btn` | entrer, sortir | masqué, visible, survol, focus |
| Cellule d'info | `.hb-cell` (`.hb-lbl` + `.hb-val`) | avec ou sans point de statut | — |
| **Carte projet** | `.pcard` + `.pcard-bar` (colonne ≤ 1024) | image, vidéo, logo animé | — (défilement automatique et glissé) |
| Ligne Client work | `.cw-row` + `.cw-preview` (desktop), `.cw-shot` (mobile) | desktop, mobile | survol : remplissage papier qui descend, aperçu qui suit la souris |
| **Modale projet** | `.ev-modal` (`Everest.js`) | image, vidéo, logo animé | ouverte (fondu et montée), navigation ← →, fermeture |
| Carte Service | `.sv2-card` | — | défaut, survol ou tap (bleu, grain, liste numérotée) |
| Index des Services | `.svx`, `.svx-head`, `.svx-row` | — | fermé, ouvert ; ligne : défaut, survol (bleu, grain, point, « → Démarrer un projet ») |
| **Accordéon FAQ** | `.fq-item`, `.fq-q`, `.fq-a` | — | fermé, ouvert (numéro et ± en bleu) |
| Palier Benefits | `.bn3-camp`, `.bn3-summit` | desktop (sur le relief), mobile (rail vertical) | allumé, éteint ; rail qui se remplit |
| Manifeste | `.manif`, `.manif--left` | droite, gauche | révélation lettre par lettre |
| Crête | `.dark-wrap`, `.light-wrap`, `Ridge.js` | vers le sombre, vers le clair | amplitude pilotée par le défilement |
| Rideau | `.veil` | — | caché, couvre, se lève |
| Préchargement | `#preloader` | — | intouchable, documenté seulement |
| Bloc « en construction » | `.uc-*` | Projets (avec CV), À propos (avec logo animé) | — |
| Logo animé | `LogoReveal.js` | bleu (cartes), encre (About) | boucle 4 s ou lecture unique 3 s |
| Icônes | SVG en ligne | chevron 10 × 6, flocon, plein écran, fermer, flèches, plus / moins, marque Figma, chevron bas | — |

**Ajouts propres à Figma (D5, D8).** Le tableau décrit le code. Dans Figma
s'y ajouteront :

- un état désactivé et un état focus sur tous les éléments cliquables ;
- les icônes `icon/arrow-right`, `icon/arrow-up-right` et
  `icon/arrow-left-right`.

Chaque ajout porte l'annotation « pas encore dans le code ».

Hors composants Figma : les scènes WebGL (Everest, Mont Blanc, lac) et le
champ réactif sont du rendu procédural. Ils seront documentés sur la page
Motion, pas reproduits.

**Inatteignables**, à ne pas reproduire (CMP-05) : le badge curseur « See the
project » et le carrousel 3D. Le badge n'apparaît que dans le mode 3D du
carrousel, et ce mode ne peut plus s'activer depuis que la scène Everest
occupe le hero au-dessus de 1024 px.

---

## 10. Doublons et incohérences

Chaque ligne : le constat, la preuve, et ce que fait Figma. Depuis le 8 octobre
(règle prioritaire, `BRIEF.md`), Figma reproduit la valeur exacte du code : les
incohérences du code sont documentées, pas corrigées. Le site ne change pas.

### Couleurs

| ID | Constat | Dans Figma |
|---|---|---|
| COL-01 | `#1111118C` écrit en dur ×6 : c'est `--muted` (`globals.css:75,81,88,314,343,494`). | Même valeur : `color/text/label` et `color/text/label-dim` en clair (`ink/a55`, aussi écrit `#1111118C`). |
| COL-02 | Blanc cassé `#F4F6F5` ×6 (`#f4f6f573`, `#f4f6f542`, `rgba(244,246,245,.45)`) au lieu du papier : footer et rideau. Écart de 1 sur une composante, invisible. | Gardé : primitives `off-white/a45` et `off-white/a26`, jetons `color/text/footer` et `color/text/footer-top`. |
| COL-03 | `.hero-scroll` en `rgba(16,19,18,.45)` : presque l'encre, alpha absent de l'échelle (`globals.css:278`). | Gardé : primitive `color/ink-scroll`. |
| COL-04 | Texte sur aplat : `#FFF` (≈ 18 usages : boutons bleus et encre, puce active, survols bleus) ou papier (3 : `.cta .roll`, `.menu-btn`, `.pcard-bar-btn`). Le CTA du header mélange les deux : libellé papier, flèche blanche. | Gardé tel quel (D1) : `color/text/on-accent` (#fff), `color/text/cta` (papier, libellé du CTA du header), `color/text/on-inverse` (`.menu-btn`, `.pcard-bar-btn`). |
| COL-05 | Bleu de survol `#0F17C2` ×4, sans variable. | Primitive `blue-hover`, sémantique `color/accent/hover` ; code syntax `#0f17c2`, la valeur écrite dans le code. |
| COL-06 | Bleu clair `#7D86FF`, un seul usage (modale). | Primitive `blue-light`, sémantique `color/accent/on-dark`. |
| COL-07 | Bordure du header en gris opaque `#E5E5E5`, alors que les filets du site sont en `--line` (encre .13, soit environ `#D7D7D7` sur papier). | Gardée : `color/border/header`, couleur d'interface (§1). |
| COL-08 | Bordures sur fond sombre : papier .14 en desktop, **blanc .1** pour le header mobile (`globals.css:677,686`). | Les deux : `color/border/default` (papier .14 en sombre) et `color/border/header-mobile` (blanc .1). |
| COL-09 | 25 paliers d'alpha sur le papier, 17 sur l'encre. | Tous les paliers vivants en primitives ; un jeton sémantique par usage, à son opacité exacte (§2.5). |
| COL-10 | Noirs voisins : `#161616` (menu langue sombre), `#0E0E0E` (visuel de la modale), `#141414` (particules du logo animé, `LogoReveal.js:20,125`), voile `rgba(10,10,10,.86)`, à côté de l'encre `#111`. | Gardés : `color/ink-soft`, `ink-deep`, `ink-particle` ; jetons `color/bg/menu` et `color/bg/modal-shot` ; le voile reste `color/overlay/modal`, les ombres noires restent des ombres. |
| COL-11 | Deux fonds de carte : blanc (FAQ, visuels About) et gris `#E0E2E8` (Services). | Deux jetons, `color/bg/surface` et `color/bg/card` : l'usage est distinct. |
| COL-12 | Deux gris de grain d'accent, `#63636A` et `#4A4A52`. | Voulu (commentaire « un cran plus foncé ») : deux primitives. |

### Typographie

| ID | Constat | Dans Figma |
|---|---|---|
| TYP-01 | Huit titres sans `line-height` héritent du 1,6 du body : `.fq-title`, `.sv2-card h3`, `.bn3-camp h3`, `.bn3-summit h3`, `.uc-title` (desktop), `.ev-modal-txt h3`, `.home-msg .nm`, `.cw-name`. | Figma garde le 160 % hérité, celui que le navigateur rend (D7). |
| TYP-02 | `.sv2-title` (1,05) et `.cw-title` (1,07) : même style à 0,02 près. | Deux styles : `heading-2` (1,05) et `heading-2-cw` (1,07). |
| TYP-03 | `.fq-title` (41,6, interlignage hérité 1,6) est un `heading-2` à 2,4 px près. | Son propre style : `heading-2-fq` (41,6 et 25,6, interlignage 1,6). |
| TYP-04 | `.uc-title` (57,6, −.025em) et `.bn3-title` (54,4, −.03em) : deux grands titres voisins. | Deux styles : `heading-1` (`.bn3-title`) et `heading-1-uc` (`.uc-title`). |
| TYP-05 | `.lt-big` = `.manif-big` en desktop, mais diverge en mobile (33,15 / 1,12 contre 28,8 / 1,02 : règle ajoutée en section 6). | `display` pour les deux en desktop ; `display-lt` pour `.lt-big` en mobile (33,15 · 112 %). |
| TYP-06 | Neuf approches en mono capitales : .05, .06, .08, .1 (fixe), .12, .14, .16, .18, .22em. | Toutes gardées, chacune dans son style (§3.4). |
| TYP-07 | Tailles mono mêlant px et rem : 10,88 (`.68rem`), 11,2 (`.7rem`), 11,52 (`.72rem`) à côté de 10 / 11 / 12 px. | Gardées : `data-time` (10,88), `data-year` (11,2 ; 12,48 en mobile), `overline-go` et `label-hook` (11,52). |
| TYP-08 | Corps Roboto : 14 combinaisons taille / interlignage (22 → 10,88 ; 1,3 → 1,65). | Un style par combinaison vivante (§3.4). |
| TYP-09 | Trois altimètres : `.ev-meta` (10 / 2 / .18em, CAPS) n'est pas « calqué » sur `.bn3-alt` et `.lt-alt` (11 / 1,9 / .14em), contrairement à ce que dit son commentaire (`globals.css:1531`). | Deux styles et deux variantes du composant `altimeter` : `altimeter-ev` (`.ev-meta`) et `altimeter` (`.bn3-alt`, `.lt-alt`). |
| TYP-10 | Surtitre défini trois fois (`.sv2-`, `.lt-`, `.uc-eyebrow`), interlignage 1 ou 1,6 selon la classe ; `.hx-label` en est une variante (10 / .12em). | Composant `eyebrow` à deux variantes (`class=sv2-eyebrow`, `class=lt-eyebrow`), styles `overline` et `overline-lt` ; `.hx-label` en `label-sm-strong`. |
| TYP-11 | L'approche du mode d'emploi est calculée sur la taille du body (.1em × 15,12 = 1,512 px), puis héritée : elle grossit en relatif quand le texte passe à 8 px. | Reproduit : 1,512 px dans `help` (11 px) et `help-docked` (8 px). |
| TYP-12 | Chargés pour rien : Bricolage 800 (CSS mort uniquement), Space Mono italique. Bricolage 400 ne sert qu'au glyphe ± de la FAQ. | Signalé seulement (§11). |
| TYP-13 | Flèches `→ ↗ ↔` dessinées par Consolas et Segoe UI Symbol (§3.2). | D8 : icônes vectorielles `icon/arrow-right`, `icon/arrow-up-right`, `icon/arrow-left-right` (tracés au §1), propres à Figma, annotées « pas encore dans le code » ; le site garde ses glyphes. |
| TYP-14 | Axe optique de Bricolage réglé automatiquement par le navigateur. | D9 : `opsz` = taille (bornée 12–96) dans chaque style Figma. |
| TYP-15 | Famille Chopin : « Chopin » dans le code, `Chopin-Trial VF` dans Figma. | `Chopin-Trial VF` / `Medium Italic` (même dessin), correspondance notée dans le style. |
| TYP-16 | `.cw-name` est plus grand en mobile (18,4) qu'en desktop (17,6). | Reproduit dans `title` (17,6 et 18,4). |

### Espacements et mise en page

| ID | Constat | Dans Figma |
|---|---|---|
| ESP-01 | Trois marges desktop : 56 (nav, footer : `globals.css:69,541`), 60 (`--pad` : hero, `.wrap`, scène), 112 (sections). Le logo est à x = 56, le nom du hero à x = 60. | Les trois : `layout/nav-pad` et `layout/footer-pad` (56 / 20), `layout/page-pad` (60 / 20), `layout/section-inset` (112 / 20) (D3). |
| ESP-02 | Sous 1400, le contenu de Let's talk passe à `--pad`, mais son filet `.lt::after` reste à 112, puis à 40 sous 760 (`globals.css:486,507,837-846`). À 390, contenu à 20 et filet à 40. | Reproduit : `section/lets-talk/rule-inset` (112 ; 40 sous 760). |
| ESP-03 | Footer ≤ 760 en 20 px fixes (`globals.css:588`), le reste du site en `--pad` (38 à 760). | Reproduit : `layout/footer-pad` (20 en mobile). |
| ESP-04 | Le bloc « correctifs mobile » (`globals.css:3-22`) précède les règles de base et perd la cascade. `--pad:16px` sous 480 ne s'applique jamais, ni la plupart des autres lignes. | 20 en mobile, la valeur réelle ; le bloc sans effet est signalé seulement (§11). |
| ESP-05 | Pas d'échelle : 26 valeurs fixes, dont des irrégulières (7, 9, 13, 22, 26, 34, 36…). | Toutes les valeurs vivantes en primitives `space/…` (31), sans arrondi. |
| ESP-06 | Rythme vertical en `vh` : il change avec la hauteur d'écran. | Figma : valeurs à 900 et 844 de haut, formule `clamp` en description (collection `responsive`). |
| ESP-07 | Marges mobiles de 40 px (`globals.css:377,502-512,520-523`) presque toutes écrasées plus loin par `--pad`. Seul le filet de Let's talk les garde (ESP-02). | Seule valeur vivante : le filet de Let's talk (ESP-02). |

### Rayons

| ID | Constat | Dans Figma |
|---|---|---|
| RAY-01 | 5 px partout, sauf l'encadré mode d'emploi (4 px) et le menu langue (8 px). | Les trois : `radius/5`, `radius/4` (`.ev-help`, focus de `.ev-help-btn`) et `radius/8` (`.lang-menu`). |
| RAY-02 | Coins du footer fluides (38 → 20). | `radius/footer` avec modes desktop et mobile. |

### Ombres et effets

| ID | Constat | Dans Figma |
|---|---|---|
| EFF-01 | Neuf ombres, toutes différentes, aucune variable. | Un style d'effet par usage (§6.1). |
| EFF-02 | Motif du grain recopié en data-URI dans 8 règles. | Un seul style `effect/grain` (D11) et le composant `grain`. |
| EFF-03 | Six flous différents (14, 8, 4 ; 58, 66, 22). | Styles d'effet : `blur/header`, `blur/flag`, `blur/overlay`, `blur/glow-hero`, `blur/glow-footer`. |
| EFF-04 | Lueurs du hero et du footer quasi identiques (bleu .5 et .55 à opacité .5 ; flous 58 et 66). | Les deux, exactes : jeton `color/glow` (bleu .5 en clair pour le hero, .55 en sombre pour le footer), `blur/glow-hero` (58) et `blur/glow-footer` (66). |

### Points de rupture

| ID | Constat | Dans Figma |
|---|---|---|
| BRK-01 | Hors règle : 480, 560, 620, 680, 930 / 761, 1440. | Figma : cadres 1440 / 1400 / 1024 / 900 / 760 / 390 ; les seuils hors règle sont signalés. |
| BRK-02 | 680 : une seule règle encore vivante, `.veil-mark{left:20px}`. | Signalé. |

### Mouvement

| ID | Constat | Dans Figma |
|---|---|---|
| MOT-01 | Courbe du roll `cubic-bezier(.65,0,.2,1)` ×4, sans nom. | Courbe documentée sur la page Motion (étape 4). |
| MOT-02 | 26 durées distinctes. | Documenter les six groupes du §8.2 ; échelle de durées sur la page Motion. |
| MOT-03 | `.reveal` déclaré deux fois (`globals.css:597` et `1437`) : la courbe `.2,.7,.2,1` est écrasée. Règle `cal-modal-box` en double (`633` et `1495`). | Signalé (CSS mort). |
| MOT-04 | Trois régimes d'apparition : .85 s `--e` (desktop), 1,05 s `--rv-e` (groupes), 1,2 s (≤ 1024). | Documenter les trois, sans fusionner. |

### Composants

| ID | Constat | Dans Figma |
|---|---|---|
| CMP-01 | Deux familles de boutons : `.btnf-blue` / `-ink` / `-ghost` d'un côté, `.btn-blue` / `.btn-ink` / `.sv2-cta` de l'autre (`globals.css:320-323,441-455,559-566`). `.btnf-blue` garde au survol une bordure `#1E29FF` autour d'un fond `#0F17C2` (liseré visible) ; `.btn-blue` change aussi la bordure. `.btnf-ink` n'a pas de survol ; `.btn-ink` et `.sv2-cta` passent au bleu. | Reproduites : propriété `family` du composant `button` (`btnf`, `btn`), chacune avec ses survols (D4). |
| CMP-02 | `.cta` (header) = bouton bleu en petit (9 / 14) ; `.menu-btn` a une approche de .08em, contre .06em pour les autres boutons. | `size=sm` : `.cta` (9 / 14, écart 7, .06em) et `.menu-btn` (9 / 14, écart 8, .08em, line-height normal). |
| CMP-03 | Classes de bouton mortes : `.btn-dark`, `.btn-paper`, que `useMagnetic.js` et `ReactiveField.js` visent encore. | Signalé (CSS mort, annexe B). |
| CMP-04 | Aucun état désactivé dans le code. Focus visible seulement sur les composants Everest (contour bleu de 2 px, décalé de 2 à 4 px). État actif seulement au tap du menu mobile. | D5 : désactivé et focus dans Figma, annotés « pas encore dans le code » ; là où le code a un focus (scène Everest), Figma reprend le sien. |
| CMP-05 | Badge curseur et carrousel 3D inatteignables. | Non reproduits. |
| CMP-06 | Surtitre défini trois fois (TYP-10). | Composant `eyebrow`, deux variantes (TYP-10). |
| CMP-07 | Altimètre implémenté trois fois (TYP-09). | Composant `altimeter`, deux variantes (TYP-09). |
| CMP-08 | Six boutons icônes, cinq tailles (26, 30, 36, 38, 40), trois traitements. | Trois jeux `icon-button` (`solid`, `tint`, `bare`) aux tailles du code ; la croix de la modale garde son fond .1 et son survol .22. |

---

## 11. Hors périmètre, signalé

Découverts en chemin. Rien n'a été touché ; chacun mérite sa propre branche.

1. **Police d'essai en production.** `public/fonts/chopin.woff2` est
   « Chopin-Trial Medium Italic » (Fontfabric). Une licence d'essai n'autorise
   en général pas l'usage commercial : à vérifier de ton côté. Elle sert le
   préchargement, donc toute substitution changerait son rendu : à décider
   avant toute modification.
2. **Bloc CSS mort en tête de fichier** (`globals.css:3-22`), voir ESP-04.
3. **41 classes mortes** et règles en double (annexe B, MOT-03).
4. **Textes écrits en dur hors `lib/i18n.js`** :
   - menu (`Header.js:9-22`) ;
   - « See the project » (`layout.js:103`) ;
   - « Jimmy Feron — Portfolio 2026 » (`Veil.js:93`) ;
   - « CHAMONIX → MONT BLANC » et « ALT. » (`Benefits.js:375`) ;
   - « Figma® Expert » (`Footer.js:160`).
5. **Navigation au clavier** : aucun focus visible en dehors de la scène
   Everest (boutons, liens, FAQ, menu).
6. **Polices chargées inutilement** : Bricolage 800, Space Mono italique (TYP-12).
7. **Désalignements en tablette** (ESP-02, ESP-03).

---

## Annexe A — PR #19, page Projets (non fusionnée)

Branche `feat/page-projets`, PR #19 ouverte. Elle ajoute la section 15 de
`globals.css`, `components/WorkIndex.js`, `app/work/layout.js`, quatre clés
i18n et un drapeau `soon` dans `lib/projects.js`. Si elle est fusionnée,
`/work` cesse d'être une page « en construction ».

| Élément | Valeurs |
|---|---|
| Grille `.px-grid` | 2 colonnes, gouttière 8 ; retrait de page 8 (« exceptions assumées », reprises de son wireframe) ; 1 colonne ≤ 900 |
| Tuile `.px-tile` (carte projet de l'index) | 16:9, rayon 5, fond `#0E0E0E` (encre à l'intégration : noirs voisins, §1) ; zoom du média ×1,05 en 1,1 s `--e` au survol (> 1024, souris) ; focus : contour bleu 2 px décalé de 4 |
| Voile `.px-scrim` | dégradé vers le haut : encre .86 jusqu'à 30 %, .38 à 68 %, 0 en haut ; 42 % de la hauteur |
| Libellé « View » `.px-view` | Space Mono Bold 11, .08em, CAPS, blanc en *difference*, suit la souris ; fondu .35 s `--e` |
| Badge « À venir » `.px-soon` | Space Mono 10 (M 9), .12em, CAPS, papier sur encre, retrait 4 / 8, rayon 4 (5 à l'intégration : RAY-01) |
| Titre et catégorie | `.px-name` : Bricolage Bold `clamp(1.2rem,1.7vw,1.6rem)`, −.01em, papier, ombre de texte ; `.px-cat` : `.85rem`, papier .74 ; M 1,15 rem / .8 rem |
| Apparition | `animation-timeline: view()`, de 0 à 55 % de l'entrée ; repli `IntersectionObserver` avec les tokens `--rv-*` |

À l'intégration, elle apporterait deux composants (tuile projet, badge
« À venir ») et des valeurs déjà connues : 8 px, papier .74, rayon 4 ramené à
5 (RAY-01).

---

## Annexe B — CSS mort

Classes déclarées dans `globals.css` sans aucun usage dans le JSX (vérifié sur
toutes les chaînes du JS) :

`about-cta` · `about-intro` · `about-top` · `band` · `band-track` · `btn-paper` ·
`burger` · `count` · `dates` · `exp-head` · `exp-item` · `exp-list` · `gallery` ·
`gimg` · `home-hint` · `ic` · `lbl` · `meta` · `meta-rows` · `mrow` · `ph` ·
`ph-tag` · `pill` · `portrait` · `proj-back` · `proj-body` · `proj-cover` ·
`proj-hero` · `proj-metaline` · `proj-next` · `sec-head` · `socials` · `stat` ·
`stat-line` · `stats` · `talk-title` · `tall` · `wcard` · `wide` · `work-grid` · `yr`

S'y ajoutent :

- des classes déclarées mais qui ne servent que dans des sélecteurs JS :
  `.btn-dark`, `.eyebrow` ;
- des règles vivantes mais sans effet : `.home-msg .rl`, le bloc
  `globals.css:3-22`, l'essentiel du bloc 680 ;
- les règles du carrousel 3D et du badge curseur (CMP-05) ;
- l'entrée `havas` de `CARD_BG` ;
- le fichier `public/Fram_25.svg`, copie du logo que rien n'utilise
  (signalé seulement).

## Annexe C — État du fichier Figma

Lecture seule, 7 octobre 2026, fichier `kMLD5Ti9yCpnKU4jdVfWDJ`.

- **Pages existantes** : « Matière » (0:1), « Templates » (1:548). Seuls les
  noms ont été lus. Elles ne seront ni modifiées ni reliées à quoi que ce soit.
- **Variables** : aucune collection. **Styles** : aucun (texte, effet,
  couleur, grille). Aucune collision de nom possible.
- **Polices** : table du §3.1. Familles et styles exacts vérifiés avec
  `listAvailableFontsAsync`, axes avec `getFontFamilyVariationAxes`.
- **Couleurs à l'étape 2** : les variables couleur acceptent {r,g,b,a}. Les
  peintures posées directement sur un calque prennent {r,g,b} et une opacité
  séparée : c'est une contrainte de l'API, pas un écart à la règle du brief.

## Annexe D — Plans (z-index)

| Plan | Valeur |
|---|---|
| préchargement | 5960 |
| rideau | 5950 |
| liens du footer (au-dessus du grain) | 5910 |
| modale projet | 5900 |
| header | 3000 (menu langue 950 en interne) |
| badge curseur | 2950 |
| bouton plein écran | 2800 |
| bas du hero | 2700 |
| colonne de projets du hero | 2600 |
| champ réactif | 2520 |
| grain du site | 2500 |
| sections | 0 à 6, en local |

Documentation seulement : Figma n'a pas de variable pour les plans.
