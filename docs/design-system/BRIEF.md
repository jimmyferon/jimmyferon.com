Charge d'abord les skills figma-use et figma-generate-library.
Ouvre une branche design-system, enregistre ce brief tel quel dans docs/design-system/BRIEF.md, puis lance l'étape 1.

Mission : construire le design system complet de jimmyferon.com dans Figma, à partir du code de ce repo, avec le niveau d'un designer senior.

Fichier Figma cible : https://www.figma.com/design/kMLD5Ti9yCpnKU4jdVfWDJ/Portfolio
Le fichier a été nettoyé. Ignore complètement les pages existantes (Matière et Templates) : ce ne sont pas des sources, ne t'en inspire pas, ne les modifie pas et ne les relie à rien. Construis tout le système dans de nouvelles pages, à partir du code uniquement.

Règles
1. Le code est la seule source : chaque valeur vient d'un fichier du repo. N'invente rien et n'applique aucune skill de goût (design-taste, brandkit, impeccable).
2. Avance par étapes et arrête-toi à chaque STOP pour que je valide.
3. MCP Figma : 80 lignes max par exécution, couleurs en {r,g,b,a}. Après chaque bloc, fais une capture et vérifie avant de continuer.
4. Polices : Bricolage Grotesque, Chopin, Space Mono et Roboto (texte courant) sont installées et disponibles dans Figma. Utilise-les exactement comme le code les définit (graisses, tailles, interlignages, approches). Vérifie le nom exact de chaque famille et de chaque style dans Figma avant de créer les styles. Si le code utilise une autre police, signale-la avant de l'utiliser.
5. Crée les pages Fondations, Composants, Marque et Motion.
6. Nommage en minuscules, structure catégorie/nom (color/bg/primary, text/heading-1, button/primary), aligné sur les noms du code.

Étape 1 : Audit
Inventorie tout ce que le site utilise :
- couleurs (opacités comprises) ;
- typos (famille, taille, graisse, interlignage, approche, en desktop et en mobile) ;
- espacements, radius, ombres et effets (grain, flous) ;
- breakpoints ;
- durées et courbes d'animation ;
- liste des composants.
Liste les doublons et incohérences, avec ta recommandation pour chacun. Écris docs/design-system/audit.md. STOP.

Étape 2 : Fondations
- Variables en deux niveaux : primitives (palette brute) puis sémantiques (fond, texte, accent, bordure), avec modes clair et sombre pour les sections sombres.
- Styles de texte desktop et mobile, avec mes quatre polices.
- Variables d'espacement et de radius.
- Grilles par breakpoint.
STOP.

Étape 3 : Composants
Reproduis chaque composant trouvé dans le code, notamment : boutons et CTA, liens avec effet roll, header flottant, cards projet, modale projet, accordéon FAQ, tags, footer, drapeaux de sommet, altimètre, encadré mode d'emploi.
Pour chacun : variantes, états (défaut, survol, actif, désactivé), auto layout, tout lié aux variables. STOP.

Étape 4 : Documentation
- Page Marque, à partir du SVG du logo présent dans le code : construction à 72°, zone de protection, taille minimum, versions noir, blanc et bleu.
- Pour chaque composant : anatomie, specs, usages à faire et à éviter.
- Page Motion : durées, courbes, effet roll, transition rideau.
STOP.

Bonus : écris un DESIGN.md du système, au même format que mes références dans ~/.claude/references/design-md/.

---

## Arbitrages de l'étape 1 (7 octobre 2026)

Audit validé : `docs/design-system/audit.md`. Le détail et les valeurs sont au §1 de l'audit.
D5 et D8 ajoutent dans Figma des éléments absents du code ; chacun porte l'annotation « pas encore dans le code ».

- D0 — Système rationalisé : couleurs et typo par rôle, chaque rôle reprenant une valeur qui existe dans le code ; espacements et rayons fidèles au code.
- D1 — Texte sur fond coloré en papier #F5F5F5, pour rester sur les trois couleurs de marque.
- D2 — Mode sombre : cinq rôles d'opacité (texte secondaire .6, libellé .55, discret .45, filet .14, filet appuyé .28).
- D3 — Marges desktop : 60 pour la nav et le footer, 112 pour les sections.
- D4 — Un seul composant bouton : primaire, encre, contour ; tailles md et sm.
- D5 — Exception à la règle 1, pour Figma uniquement : un état désactivé et un état focus clavier visible sur les boutons, les CTA et les autres éléments cliquables. Construits uniquement avec les fondations existantes, sans nouvelle valeur. Chaque état ajouté porte l'annotation « pas encore dans le code ».
- D6 — 33 styles de texte, en jeux desktop et mobile.
- D7 — Les huit titres sans interlignage propre prennent l'interlignage des autres titres du code. L'écart est noté au §10 de l'audit comme correction à faire sur le site.
- D8 — Les flèches → ↗ ↔ sont dessinées en icônes vectorielles (composants), annotées « pas encore dans le code ».
- D9 — Bricolage Grotesque : axe opsz réglé sur la taille du texte (12–96).
- D10 — Noms sémantiques en minuscules ; nom CSS en code syntax.
- D11 — Grain : effet natif et motif image à comparer à l'étape 2.
- D12 — Page Projets (PR #19) intégrée après sa fusion.

Scripts de mesure de l'audit : `docs/design-system/outils/`.

## Arbitrages complémentaires (7 octobre 2026)

- D7, D8 et le prolongement de D1 : validés tels que précisés au §1 de l'audit.
- Le blanc #FFFFFF des questions FAQ et des visuels About est gardé comme couleur d'interface (surface), pas comme couleur de marque. La marque tient en trois couleurs : papier, encre, bleu.
- RAY-01 : le rayon de 4 px passe à 5 px, le rayon de la marque. Le 8 px ne sert qu'au menu de langue, qui n'est pas un grand conteneur : il passe aussi à 5 px. L'écart est noté dans les corrections à faire sur le site.
- TYP-05, COL-07, ESP-04 : valeurs par défaut validées. `.lt-big` est fusionné dans `display` en mobile ; la bordure #E5E5E5 du header est gardée ; la marge mobile reste à 20 px.

Aucun point ne reste ouvert.

## Précisions (7 octobre 2026)

- Couleurs d'interface : validées, sauf les noirs voisins de l'encre #111111. Ils sont fondus dans l'encre quand ils n'ont pas de rôle distinct : #161616, #0E0E0E, #141414. Le voile de la modale et les ombres noires gardent leur valeur. Les écarts sont notés dans les corrections à faire sur le site.
- Logo : la version claire est en papier #F5F5F5, comme sur le site.
- Favicon : une application à part entière, le logo en papier sur un fond bleu #1E29FF, lisible sur les onglets clairs comme sombres. Prévu sur la page Marque à l'étape 4 ; il remplacera app/icon.svg sur le site (corrections à faire).
- public/Fram_25.svg : à supprimer, rien ne l'utilise (corrections à faire).

## Étape 2 : fondations (7 octobre 2026)

Construites dans Figma, vérifiées et validées. Les arbitrages ci-dessous y sont
appliqués. Le détail est dans `docs/design-system/fondations.md` : inventaire,
échelle d'espacement, mesures, corrections à faire sur le site.

## Arbitrages de l'étape 2 (7 octobre 2026)

- **Grain (D11) : motif image.** Style de remplissage `effect/grain` : motif du
  code en mosaïque de 240, opacité .21, fusion `difference`. Il mesure comme le
  site.
- **Bouton mobile : un seul style, 11 px et .06em.** Le double CTA du hero
  tient en 390 px (123 et 132 px de contenu pour 170 disponibles, jusqu'à
  314 px de large). Pas de variante `button-compact`. Le passage à 11 px est
  noté dans les corrections à faire sur le site.
- **Code syntax** : posée seulement quand une expression CSS vaut dans tous les
  modes. Validé.
- **Rôles sémantiques ajoutés** : validés. Les voiles dont l'opacité diffère de
  5 % ou moins sont fusionnés :
  - `header-mobile` (.94) et `menu` (.97) → `overlay/header-mobile` à .97 ;
  - `cal` (.65) et `edge` (.7) → `overlay/dim` à .7.

  Corrections à faire sur le site : le header compact mobile passe à .97, le
  voile cal.com à .7.
- **Papier .26** (`.foot-topbtn`) : rattaché au rôle le plus proche à l'étape 3.
- **Espacements : une échelle, pas l'inventaire.** 14 pas sur une base de 4 :
  4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 112.
  - Les marges et les rythmes de section restent dans la collection
    `responsive`.
  - Chaque valeur du code est rattachée au pas le plus proche (à égale
    distance, au pas supérieur).
  - Les 115 règles en écart sont listées dans les corrections à faire sur le
    site, comme pour les rayons.

## Pour reprendre à l'étape 3

Dans une nouvelle session :

- lire `docs/design-system/fondations.md` : état du fichier Figma, noms et
  identifiants, arbitrages, et le §7 (ce qui attend l'étape 3) ;
- lire dans l'audit le §1 (toutes les décisions), le §9 (liste des composants)
  et le §10 (incohérences par composant) ;
- relire le fichier Figma lui-même : les corrections faites à la main priment.

L'annexe C de l'audit décrit le fichier avant l'étape 2.

## Étape 3, partie 1 : petits composants (8 octobre 2026)

Construits dans Figma, vérifiés et validés : icônes de flèche, effet roll,
bouton, lien de navigation, tag. Le détail est dans
`docs/design-system/composants.md` : inventaire, identifiants, mesures,
arbitrages.

## Arbitrages de l'étape 3, partie 1 (8 octobre 2026)

- **Boutons** : hauteurs `md` 44 et `sm` 34, issues de l'échelle, validées.
- **Style `nav-active`** (desktop et mobile) ajouté : les valeurs de `nav` en
  Bold, aucune valeur nouvelle. 61 styles de texte.
- **Scope `STROKE_COLOR`** ajouté à `color/text/primary`, `on-accent`,
  `on-inverse`, `subtle` et `color/bg/inverse` (traits des icônes, bordure de
  la couleur du fond).
- **`ghost` · `sm`** gardé, annoté « pas encore dans le code », pour que la
  grille de variantes reste complète.
- **`↔`** redessinée : tige de 2 à 22, pointes de la modale et trait de 1,6
  inchangés, vérifiée à 12 px.
- **Bouton icône et bouton menu** : en ouverture de la partie 2.
- **Roll, pour la page Motion (étape 4)** : le site décale chaque lettre de
  20 ms ; le composant Figma ne le reproduit pas.

## Pour reprendre à la partie 2 de l'étape 3

Dans une nouvelle session :

- lire `docs/design-system/composants.md` : identifiants des planches et des
  composants, clés des propriétés, choix et mesures, et le §7 (notes
  techniques pour use_figma) ;
- relire dans l'audit le §9 (liste des composants) et le §10 (incohérences par
  composant) ;
- relire le fichier Figma lui-même : les corrections faites à la main priment ;
- commencer par le bouton icône (CMP-08) et le bouton menu (`.menu-btn`,
  flocon, ouvert et fermé), puis les grands composants : header, cartes
  projet, modale, accordéon FAQ, footer, drapeaux de sommet, altimètre,
  encadré mode d'emploi.

À trancher en ouvrant la partie 2 : le §7 de `fondations.md` attend encore de
l'étape 3 le papier .26 (footer), le composant grain et les variantes des
cartes et lignes Services, et les décalages de la crête. Ni les cartes
Services ni la crête ne figurent dans la liste de la partie 2.
