// La page /work est un composant client (contexte de langue, survols) : elle
// ne peut pas exporter metadata elle-même. Ce layout serveur ne fait que ça,
// pour que la route porte son propre titre et sa propre description plutôt
// que d'hériter de ceux de la racine.

const TITLE = "Projets";
const DESC =
  "Les projets de Jimmy Feron, brand designer et UI/UX : identité de marque, " +
  "interfaces et direction artistique, de l'esport au sport outdoor.";

export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/work" },
  openGraph: {
    type: "website",
    url: "/work",
    title: `${TITLE} — Jimmy Feron`,
    description: DESC,
  },
  twitter: {
    title: `${TITLE} — Jimmy Feron`,
    description: DESC,
  },
};

export default function WorkLayout({ children }) {
  return children;
}
