/** @type {import('next').NextConfig} */
const nextConfig = {
  // Forcer l'utilisation de SWC
  swcMinify: true,
  compiler: {
    // Voir https://nextjs.org/docs/advanced-features/compiler
    styledComponents: true, // Si vous utilisez styled-components
  },
  // Autres configurations...
  experimental: {
    // Fonctionnalités expérimentales si nécessaire
  },
};

module.exports = nextConfig; 