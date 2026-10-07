# Outils de l'audit

Les scripts qui ont produit les mesures de [`../audit.md`](../audit.md).

Ils ne font que lire : ni le code du site ni le fichier Figma ne sont modifiés.
Aucune dépendance à installer. Il faut Node 24 (voir `.nvmrc`), et un
navigateur Chromium installé (Chrome, Edge ou Brave) pour les deux scripts de
mesure.

## Les scripts

Toutes les commandes se lancent depuis la racine du dépôt.

| Script | Ce qu'il fait |
|---|---|
| `extraire-css.mjs` | Inventaire de `globals.css` par catégorie : chaque valeur avec son contexte `@media` et son nombre d'usages. |
| `classes-mortes.mjs` | Classes déclarées dans `globals.css` qui n'apparaissent dans aucune chaîne du JS (`app/`, `components/`, `lib/`). |
| `mesurer-styles.mjs` | Styles calculés de chaque élément porteur de texte et de chaque boîte à classe. Pages `/`, `/work` et `/about`, en 1440 × 900 (souris) et en 390 × 844 (tactile émulé). Écrit `mesures.json`. |
| `tableau-typo.mjs` | Tableau typographique desktop / mobile, construit à partir de `mesures.json`. |
| `polices-rendues.mjs` | Police qui dessine réellement chaque texte témoin. C'est lui qui révèle les glyphes tombés sur une police système. |
| `nom-police.mjs` | Table `name` d'un fichier WOFF2 : famille, style, version, licence. |

Commandes :

```sh
# Inventaire de globals.css. Sections : colors, type, motion, radius,
# shadow, effects, media, spacing, z, all
node docs/design-system/outils/extraire-css.mjs app/globals.css colors

# Classes mortes
node docs/design-system/outils/classes-mortes.mjs .

# Mesure des styles calculés (environ une minute), puis tableau typo
node docs/design-system/outils/mesurer-styles.mjs <chemin du navigateur> <dossier de sortie>
node docs/design-system/outils/tableau-typo.mjs <dossier de sortie>/mesures.json

# Police réellement utilisée pour chaque texte témoin
node docs/design-system/outils/polices-rendues.mjs <chemin du navigateur> <dossier de profil>

# Nom interne d'une police
node docs/design-system/outils/nom-police.mjs public/fonts/chopin.woff2
```

## Mesurer une preview plutôt que la prod

`mesurer-styles.mjs` et `polices-rendues.mjs` prennent l'URL en dernier
argument (par défaut `https://jimmyferon.com`). Pour comparer une preview
Vercel à la prod, lancer la mesure deux fois, avec deux dossiers de sortie,
puis comparer les deux `mesures.json`.

## Bon à savoir

- **Dossier de sortie hors du dépôt.** Les scripts de mesure lancent le
  navigateur sans fenêtre, avec un profil temporaire créé dans le dossier
  indiqué. Ce profil pèse plusieurs dizaines de Mo : prendre par exemple le
  dossier temporaire du système.
- Chaque page est mesurée 4,5 s après son chargement, le temps du
  préchargement (3 s) et de la levée du rideau.
- Ports utilisés : 9333 (mesure) et 9334 (polices). Si une mesure s'arrête en
  cours, fermer le navigateur resté ouvert sur ces ports.
- Les polices de secours dépendent du système. Sous Windows, les flèches
  tombent sur Consolas et Segoe UI Symbol ; sous macOS, sur d'autres polices.
