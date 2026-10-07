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
