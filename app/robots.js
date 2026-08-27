// Servi sur /robots.txt.
const SITE = "https://jimmyferon.com";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
