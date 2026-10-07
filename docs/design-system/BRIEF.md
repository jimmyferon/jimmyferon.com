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

Pour reprendre à l'étape 2, dans une nouvelle session : rien n'a encore été créé dans Figma. Lire dans l'audit le §1 (décisions et points encore ouverts), le §2.5 (structure des couleurs), les §3.1 et §3.4 (polices et styles), le §4 (espacements et grilles) et l'annexe C (état du fichier Figma).
