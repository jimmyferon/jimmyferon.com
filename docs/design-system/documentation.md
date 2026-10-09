# Documentation des composants — étape 4, partie 2

Étape 4 du brief (`docs/design-system/BRIEF.md`), partie 2 : la documentation
de chaque composant (anatomie, specs, usages à faire et à éviter), la reprise
des descriptions qui disaient encore « pas encore dans le code », le visuel par
défaut de la carte projet, puis le `DESIGN.md` du système.

- **Date** : 9 octobre 2026
- **Branche** : `design-system`
- **Fichier Figma** : `kMLD5Ti9yCpnKU4jdVfWDJ`, page Composants (`113:4`) ;
  retouches sur les pages Marque (`113:5`) et Motion (`113:6`)
- **Statut** : construite et contrôlée, en attente de validation

## 1. Les deux précisions de la partie 1

Les six choix du §6 de `marque-motion.md` sont validés, avec deux précisions.

**Taille minimum de 34 px : le favicon en est l'exception.** Planche
`planche/protection-taille` de la page Marque :

- le paragraphe de la taille minimum (`249:1128`) s'arrête aux tailles du
  code ;
- une ligne `exception` (`279:180`) le suit, sous la rangée des tailles : une
  instance du favicon (`279:181`) et la phrase « Seule exception : le favicon,
  une application à part. Le logo y descend à 24 px dans son carré de 32, et à
  12 px quand l'onglet le réduit à 16. » (`279:188`, style `body`,
  `color/text/muted`).

**Durées : chaque durée du code garde sa valeur exacte.** Vérifié sur la
planche `planche/durees` de la page Motion :

- les 23 durées de transition du code (`outils/extraire-css.mjs`, section
  `motion`) y sont toutes, chacune à sa valeur : .15, .18, .2, .22, .25, .28,
  .3, .35, .38, .4, .45, .5, .55, .6, .65, .7, .75, .8, .85, .9, 1,05 (`--rv-d`),
  1,1 et 1,2 s ;
- les 23 barres mesurent exactement leur durée (1 s = 400 px) ;
- toute autre durée écrite sur la page vient du code ou s'en déduit : 20 ms par
  lettre du roll, images du rideau, boucles ;
- la phrase d'introduction (`261:6`) le dit : « Les groupes ne servent qu'au
  classement : chaque durée garde la valeur exacte du code, aucune n'est
  arrondie. »

## 2. Kit de documentation

Une planche de plus, la dernière de la page Composants :
`planche/documentation` (`282:1065`). Elle porte trois composants qui ne
servent qu'aux planches. Leur nom commence par « _ » : Figma ne les publie
pas. Aucune valeur nouvelle, seulement les jetons et les styles des fondations.

| Composant | Nœud | Propriétés (clés) | Construction |
|---|---|---|---|
| `_doc/pin` | `282:1071` | `n#282:0`, `libellé#282:1`, `légende#282:2` | disque de 18 en `color/accent/default`, numéro en `label-sm-strong` et `color/text/on-accent` ; libellé en `data` et `color/text/primary`, écart `space/8`, visible quand `légende` est vrai |
| `_doc/spec` | `282:1084` (`type=en-tête` `282:1076`, `type=ligne` `282:1080`) | `propriété#282:3`, `valeur#282:6`, `jeton#282:9` | trois colonnes (150, remplir, 220), padding `space/10` 0, écart `space/16`, filet bas `color/border/default` (en-tête : style `label`, filet `color/border/strong`) ; propriété en `color/text/label`, valeur en `color/text/primary`, jeton en `color/accent/default` |
| `_doc/usage` | `282:1085` | `à faire#282:12`, `à éviter#282:13` | deux colonnes à `space/40` ; filet haut et titre `overline` en `color/accent/default` (à faire) ou `color/text/primary` (à éviter) ; consignes en `body`, `color/text/muted`, une par ligne |

## 3. La documentation sous chaque planche

Les 23 planches de composants reçoivent, en dernier enfant, un cadre
`documentation` : filet haut `color/border/default`, `space/40` au-dessus et
entre les blocs. Trois blocs :

- **Anatomie** : un schéma (fond `color/bg/primary` dans le mode du contexte,
  filet `color/border/default`) avec une instance du composant, mise à
  l'échelle, des pastilles `_doc/pin` et des traits de 1 px en
  `color/accent/default` ; sous le schéma, l'échelle en `data` et la légende.
  Une grille ou un cercle en pointillé (`color/border/strong`) montre ce qui
  ne se voit pas : grille d'icône, découpe du logo, fenêtre du roll.
- **Specs** : un tableau `_doc/spec` ; pour chaque propriété, la valeur exacte
  et le jeton ou la classe du code.
- **Usages** : un `_doc/usage`, deux à quatre consignes par colonne.

Deux mises en page : en colonne (schéma de 560 à gauche, specs à droite) pour
les petits composants ; en large (schéma de 1216, légende en ligne, specs
dessous) pour le header, la modale, la FAQ, Services et le footer. Les
planches sans retrait latéral (header, modale, footer) portent le retrait
`space/112` sur le cadre `documentation`.

| Planche | Documentation | Instance du schéma, échelle | Fond | Pastilles | Specs |
|---|---|---|---|---|---|
| `planche/icones` `143:6` | `284:1065` | `icon/arrow-right` ×8 | clair | 2 | 7 |
| `planche/roll` `143:10` | `286:1112` | `roll` default ×4, fenêtre ouverte | clair | 3 | 6 |
| `planche/bouton` `143:14` | `287:1165` | btnf · primary · md ×2,5 | clair | 3 | 10 |
| `planche/lien-nav` `143:18` | `288:1236` | `link/nav` default ×4 | clair | 2 | 7 |
| `planche/tag` `143:22` | `289:1286` | `tag` default ×4 | clair | 2 | 8 |
| `planche/icones-interface` `169:134` | `290:1337` | `icon/plus` ×8 | clair | 3 | 7 |
| `planche/logo` `171:134` | `291:1393` | `logo` ×6 | clair | 2 | 8 |
| `planche/surtitre` `172:149` | `292:1447` | `eyebrow` sv2-eyebrow ×4 | clair | 2 | 6 |
| `planche/bouton-icone` `173:161` | `293:1493` | `icon-button/solid` 38 ×4 | clair | 2 | 7 |
| `planche/bouton-menu` `175:221` | `295:1543` | `menu-button` fermé ×4 | clair | 3 | 7 |
| `planche/grain` `176:338` | `296:1608` | `grain` site ×1 | clair | 2 | 6 |
| `planche/crete` `177:344` | `297:1651` | `ridge` dark · desktop ×0,36 | clair | 2 | 7 |
| `planche/langue` `178:345` | `299:1698` | `lang` open ×2,5 | clair | 4 | 9 |
| `planche/header` `179:368` | `300:1777` | `header/desktop` top ×0,75 | clair, large | 6 | 11 |
| `planche/liens` `180:506` | `301:1908` | `link/footer` ×3 | sombre | 3 | 7 |
| `planche/carte-projet` `183:586` | `302:1967` | `card/project` Portfolio ×1,2 | clair | 7 | 10 |
| `planche/modale` `188:650` | `303:2083` | `modal/project` ×0,75 | sombre, large | 9 | 12 |
| `planche/faq` `189:670` | `304:2248` | `faq/item` desktop · open ×0,8 | clair, large | 5 | 9 |
| `planche/altimetre` `191:709` | `305:2331` | `altimeter` bn3-alt ×2,2, parcours de Benefits | sombre | 4 | 6 |
| `planche/mode-emploi` `192:736` | `306:2398` | `help` centered ×1,6 | clair (la scène) | 5 | 9 |
| `planche/drapeaux` `193:794` | `307:2493` | `flag/label` et `flag/edge` ×2,2 | clair | 6 | 8 |
| `planche/services` `195:815` | `308:2583` | `card/service` hover ×0,85 et `row/service` hover ×1 | clair, large | 7 | 10 |
| `planche/footer` `201:878` | `311:2713` | `footer` desktop ×0,5 | sombre, large | 10 | 11 |

En tout : 94 pastilles et 188 lignes de specs. L'en-tête de la page
(`143:2`) annonce la documentation et le kit.

## 4. Choix

- **Usages tirés du code.** Chaque consigne s'appuie sur un comportement lu
  dans le code, pas sur une règle générale : filtres cumulables et « Tous »
  actif quand aucun ne l'est (`Services.js`), une seule question FAQ ouverte
  (`Faq.js`), noms accessibles des boutons de la modale (`Everest.js`), header
  compact au-delà de 70 px et `on-dark` (`Header.js`), footer sur les trois
  pages, paires de boutons du hero mobile, d'About et du footer.
- **Flèches des boutons.** Le code n'oppose pas → et ↗ selon que le lien sort
  ou non du site (le bouton bleu d'About pointe vers `/about` avec ↗) : la
  consigne est de reprendre la flèche que le code écrit à cet endroit.
- **Pas de glyphe de flèche dans les textes de documentation.** Roboto rend ↗
  en émoji et Space Mono n'a pas les flèches : les textes disent « flèche
  droite », « flèche oblique » ou le nom de l'icône.
- **Espaces insécables** avant les unités (s, ms, px, %), pour qu'une valeur ne
  se coupe pas en fin de ligne.
- **Fond du schéma** dans le contexte du composant : sombre pour les liens, la
  modale, l'altimètre bn3-alt et le footer ; clair pour le mode d'emploi, qui
  flotte sur la scène Everest.
- **Échelles** choisies pour la lecture, écrites sous chaque schéma ; les
  valeurs des specs sont celles du code, à l'échelle 1.

## 5. Descriptions

23 descriptions disaient encore « pas encore dans le code », et non 22 : elles
reprennent les phrases du BRIEF, telles quelles.

| Cas | Phrase | Descriptions |
|---|---|---|
| Focus ajouté (D5) | « Focus ajouté dans Figma : le site n’en a pas. » | `button`, `link/nav`, `tag`, `icon-button/solid`, `icon-button/tint` (size=36), `menu-button`, `lang/option`, `lang`, `lang/toggle`, `link/menu`, `link/social`, `link/footer`, `link/email`, `link/top`, `card/project`, `faq/item`, `row/service` |
| Désactivé ajouté (D5) | « Désactivé ajouté dans Figma : le site n’en a pas. » | les mêmes, et `icon-button/bare`, `flag/label`, `flag/edge` |
| Flèche dessinée (D8) | « Flèche : caractère texte sur le site, icône ici. » | `icon/arrow-right`, `icon/arrow-up-right`, `icon/arrow-left-right`, `button`, `icon-button/solid`, `link/footer`, `row/service` |
| `ghost` · `sm` | « Variante ajoutée pour compléter la grille. » | `button` |

- Une phrase qui ne vaut que pour une variante est précédée de son nom :
  « size=36 — Focus ajouté dans Figma : le site n’en a pas. »
- Par cohérence, la description de `altimeter` reprend la phrase de la flèche
  dessinée, et celle du `favicon` (page Marque) commence par « Favicon
  proposé, absent du site. ».
- La description de `card/project` est réécrite en entier : elle gardait une
  phrase d'avant le 8 octobre (« à 12 des bords (10 dans le code), retraits
  8 / 8 / 8 / 16 »), contredite par le composant, qui est aux valeurs du code.

## 6. Carte projet : `redesign-bg` par défaut

Sur le site, la colonne de projets commence par la carte Portfolio
(`COLUMN_ORDER` de `Carousel.js`) : `redesign-bg` sous les nuages et la neige,
avec le logo animé en bleu. Le composant suit :

- le calque `visuel` des trois variantes porte `redesign-bg` (l'image déjà
  importée pour la planche Univers graphique, hash `18ded76c…`) ;
- valeurs par défaut : `titre` « Portfolio », `catégorie` « Branding · UI/UX
  · Dev React », `logo animé` vrai. La carte par défaut est donc la carte
  Portfolio entière : `redesign-bg` n'apparaît jamais seul sur le site ;
- les instances Anya (`183:660`) et Team Coin (`183:682`) des exemples gardent
  leur image, leurs textes et `logo animé` faux, par surcharge explicite.

## 7. Correction : le grain de la ligne Services au survol

Trouvé en construisant l'anatomie de Services. Dans `row/service` · hover
(`196:853`), l'instance `grain` (`196:854`) était retournée verticalement
(transformation `[[1,0,0],[0,-1,-1]]`) : le grain s'affichait 40 px au-dessus
de la ligne au lieu de la couvrir.

- Remise à l'endroit, à y = −1 comme construite : `[[1,0,0],[0,1,-1]]`.
- La variante coupe ce qui dépasse, comme le code :
  `.svx-row{overflow:hidden;border-radius:5px}`, le grain étant posé en
  `inset:-40%`. Le grain couvre la ligne, filet bas excepté.
- Aucun autre calque retourné dans les composants du fichier.

## 8. Contrôle final (9 octobre)

- **Composants** : 920 peintures pleines sur 920 et 516 traits sur 516 liés à
  une variable (hors intérieurs d'instances) ; 573 textes, 571 avec un style
  et les 2 à deux styles déjà connus (« Figma® Expert ») ; aucun retrait ni
  écart en dur ; seuls rayons non liés, la découpe ronde du logo ;
  48 composants (45 et les 3 du kit), tous décrits, 218 avec les variantes ;
  111 annotations ; aucune description ni aucun texte « pas encore » ;
  25 planches réempilées, aucun nœud hors planche.
- **Marque** : 115 peintures sur 115, 10 traits sur 10, 84 textes stylés sur
  84, une annotation (le favicon), aucun chevauchement.
- **Motion** : 560 sur 560, 112 sur 112, 489 sur 489.
- **Variables et styles** : aucune description « pas encore ».
- **`DESIGN.md`** : `outils/verifier-design-md.mjs`, aucun problème,
  283 références résolues ; 77 jetons qu'aucun composant ne cite (le lint du
  format ne les signale qu'en avertissement).

## 9. `DESIGN.md`

`docs/design-system/DESIGN.md`, au format des 64 références à front matter de
`~/.claude/references/design-md/` :

- front matter `version: alpha` : 44 couleurs, 37 styles de texte, 6 rayons,
  35 espacements, 42 entrées de composants, toutes aux valeurs du code ;
- les huit sections du format dans l'ordre (Overview, Colors, Typography,
  Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts), puis
  Responsive Behavior, Motion, Iteration Guide et Known Gaps ;
- titres H2 en anglais, parce que le lint du format reconnaît les sections à
  ce nom ; tout le reste en français ;
- il résume : les 118 styles, les 50 rôles en clair et en sombre et les
  31 espacements restent dans Figma, `audit.md` et `fondations.md`.

Le lint officiel (`npx @google/design.md lint`) n'a pas été lancé : il
installerait un outil. `outils/verifier-design-md.mjs` en reprend les contrôles
de structure.

## 10. Notes techniques

- **Script de 80 lignes au plus** : deux par planche, l'un pour la structure,
  les specs et les usages, l'autre pour l'anatomie.
- **Mise à l'échelle** (`rescale`) : liaisons et styles de texte gardés.
- **Instance qui déborde** (menu de langue ouvert, roll sans découpe) :
  centrer sur ses bornes rendues, qui comptent aussi l'ombre ; corriger à la
  main si une pastille sort du schéma.
- **Planche sans retrait latéral** : un enfant en « remplir » y prend 1440 ; le
  cadre `documentation` porte alors le retrait.
- **Planches** : la planche du kit, en fin de page, recouvre une planche qui
  s'allonge tant qu'on n'a pas réempilé (tri par y, x = 0).
- **Captures réduites** : un trait bleu de 1 px y paraît gris ; lire les pixels
  avant de conclure.

## 11. Points à valider

1. **Kit de documentation** : trois composants `_doc/…` sur une planche en fin
   de page Composants, non publiés.
2. **Carte projet** : la carte Portfolio entière par défaut (image, logo animé,
   titre et catégorie), Anya et Team Coin surchargées.
3. **Grain de `row/service` · hover** : remis à l'endroit, variante qui coupe
   ce qui dépasse.
4. **`DESIGN.md`** : titres H2 en anglais pour le format, contenu en
   français ; un résumé, pas l'inventaire complet.
