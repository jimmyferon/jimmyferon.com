// Données structurées (JSON-LD).
//
// Bloc invisible qui dit explicitement à Google ce que décrit la page :
// une personne, son métier, sa zone d'intervention, ses profils. Sans ça,
// un moteur doit deviner à partir du texte. Avec, il peut afficher une
// fiche enrichie plutôt qu'un simple lien bleu.
//
// Vocabulaire schema.org, format recommandé par Google.

const SITE = "https://jimmyferon.com";

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE}/#jimmy-feron`,
  name: "Jimmy Feron",
  url: SITE,
  image: `${SITE}/images/jimmy-feron-trail-portrait-1200.webp`,
  jobTitle: "Brand Designer & UI/UX Designer",
  description:
    "Brand designer et UI/UX indépendant. Identité de marque, interfaces et " +
    "direction artistique, de l'esport au sport outdoor.",
  email: "mailto:jimmyferon08@gmail.com",
  knowsLanguage: ["fr", "en"],
  knowsAbout: [
    "Brand design",
    "Identité visuelle",
    "UI/UX design",
    "Direction artistique",
    "Design system",
    "Esport",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Genève",
    addressCountry: "CH",
  },
  // Les profils qui permettent à Google de relier les différentes traces
  // du même individu sur le web.
  sameAs: [
    "https://www.linkedin.com/in/jimmyferon",
    "https://www.instagram.com/jimmy.ocks",
    "https://x.com/Sh0ocks",
  ],
};

export const siteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE}/#site`,
  url: SITE,
  name: "Jimmy Feron — Brand Designer & UI/UX",
  inLanguage: "fr-FR",
  publisher: { "@id": `${SITE}/#jimmy-feron` },
};

/** Les deux blocs réunis, prêts à être injectés dans une seule balise. */
export const jsonLd = { "@context": "https://schema.org", "@graph": [personSchema, siteSchema] };
