/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Masque l'en-tête X-Powered-By, qui annonce la stack sans rien apporter.
  poweredByHeader: false,
};

module.exports = nextConfig;
