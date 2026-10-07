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

## Pour reprendre à l'étape 2

Dans une nouvelle session : rien n'a encore été créé dans Figma. Lire dans l'audit le §1 (toutes les décisions), le §2.5 (structure des couleurs), les §3.1 et §3.4 (polices et styles), le §4 (espacements et grilles) et l'annexe C (état du fichier Figma).
