import "./globals.css";
import Header from "@/components/Header";
import Veil from "@/components/Veil";
import Preloader from "@/components/Preloader";
import ReactiveField from "@/components/ReactiveField";
import SmoothScroll from "@/components/SmoothScroll";
import Reveal from "@/components/Reveal";
import Ridge from "@/components/Ridge";
import CalEmbed from "@/components/CalEmbed";
import { Analytics } from "@vercel/analytics/next";
import { LangProvider } from "@/lib/LangContext";

const SITE = "https://jimmyferon.com";
const TITLE = "Jimmy Feron — Brand Designer & UI/UX";
const DESC =
  "Brand designer et UI/UX basé entre Genève et la Haute-Savoie. Identité de marque, " +
  "interfaces et direction artistique, de l'esport au sport outdoor.";

export const metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: "%s — Jimmy Feron" },
  description: DESC,
  keywords: [
    "brand designer", "UI/UX", "direction artistique", "identité de marque",
    "design system", "Genève", "Annecy", "Haute-Savoie", "esport", "freelance",
  ],
  authors: [{ name: "Jimmy Feron", url: SITE }],
  creator: "Jimmy Feron",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Jimmy Feron",
    title: TITLE,
    description: DESC,
    locale: "fr_FR",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Jimmy Feron — Brand Designer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    creator: "@Sh0ocks",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Garantit le <meta name="viewport"> (indispensable pour que les media
// queries mobiles se déclenchent correctement sur téléphone).
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111111",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Roboto:wght@100..900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LangProvider>
          <Preloader />
          <ReactiveField />
          <SmoothScroll />
          <Reveal />
          <Ridge />
          <CalEmbed />
          <Veil />
          <div id="cursor" className="cursor-badge">See the project</div>
          <Header />
          <main>{children}</main>
        </LangProvider>
        {/* Mesure d'audience Vercel : sans cookie, sans identifiant
            personnel. Le script ne se charge qu'après l'affichage de la
            page, il n'entre donc pas dans le calcul des temps de chargement. */}
        <Analytics />
      </body>
    </html>
  );
}
