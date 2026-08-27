# jimmyferon.com

Portfolio de **Jimmy Feron**, brand designer & UI/UX basé entre Genève et la Haute-Savoie.

Site conçu, dessiné et développé de bout en bout : direction artistique, design system,
puis intégration. Le fil rouge est la montagne — le site se parcourt comme une ascension.

**En ligne : [jimmyferon.com](https://jimmyferon.com)**

![Next.js](https://img.shields.io/badge/Next.js-14-000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-087EA4?logo=react&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r128-000?logo=threedotjs&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-déployé-000?logo=vercel&logoColor=white)

---

## Ce qu'il y a sous le capot

Le site est une vitrine autant qu'un terrain d'expérimentation. Les pièces les plus
intéressantes :

| Ce que vous voyez | Comment c'est fait |
| --- | --- |
| **Carrousel de projets** | Cartes disposées sur un cylindre en perspective 3D, défilement continu au pointeur. Sur téléphone il bascule en colonne verticale : la version 3D coûtait trop cher en rendu. |
| **Ascension du Mont Blanc** | Relief réel reconstruit à partir de données d'élévation SRTM, dessiné courbe de niveau par courbe de niveau en WebGL. La caméra grimpe au rythme du défilement, les camps s'allument au passage. |
| **Crêtes de transition** | Le passage d'un fond clair à un fond sombre se fait par une découpe en ligne de crête, dont l'amplitude se déploie au défilement (`clip-path` recalculé à chaque image). |
| **Lac d'Allos** | Courbes de niveau du lac en WebGL, orientables à la souris. |
| **Manifestes** | Révélation caractère par caractère, avec un fondu glissant sur quatorze caractères. |
| **Bilingue FR / EN** | Bascule instantanée sans rechargement, choix conservé d'une visite à l'autre. |

Le tout est **responsive de bout en bout** : les effets lourds ne sont pas montés du tout
sur téléphone, et les interactions au survol sont neutralisées là où il n'y a pas de curseur.

---

## Stack

- **[Next.js 14](https://nextjs.org)** — App Router, rendu serveur, routes propres
- **[React 18](https://react.dev)**
- **[Three.js](https://threejs.org)** — les scènes WebGL (relief, lac)
- **CSS natif** — variables et media queries, aucun framework de style
- **[Vercel](https://vercel.com)** — déploiement continu depuis la branche principale

Aucune dépendance d'interface : chaque composant est écrit à la main.

---

## Structure

```
app/            Routes (App Router), layout global, styles, sitemap et robots
components/     Composants d'interface — une section ou un effet par fichier
lib/            Traductions, données de projets, contexte de langue, hooks
data/           Données d'élévation du relief
public/         Images, CV, logo
```

---

## Lancer le projet en local

Node 18.17 ou plus récent.

```bash
git clone https://github.com/<compte>/<repo>.git
cd <repo>
npm install
npm run dev
```

Le site tourne alors sur [localhost:3000](http://localhost:3000).

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement avec rechargement à chaud |
| `npm run build` | Compilation de production |
| `npm run start` | Sert la version compilée |

---

## Me contacter

- **Site** — [jimmyferon.com](https://jimmyferon.com)
- **LinkedIn** — [linkedin.com/in/jimmyferon](https://linkedin.com/in/jimmyferon)
- **Instagram** — [@jimmy.ocks](https://instagram.com/jimmy.ocks)
- **Un projet en tête ?** — [réserver un appel](https://cal.com/jimmy-feron/intro-call)

---

## Licence

Le code est public à des fins de démonstration. Les contenus — textes, images,
photographies, identité visuelle — restent la propriété de Jimmy Feron et ne peuvent pas
être réutilisés sans autorisation. Voir [LICENSE](./LICENSE).
