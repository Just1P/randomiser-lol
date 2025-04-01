/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour les tests et le développement
  compiler: {
    styledComponents: true,
  },
  // Désactiver les règles de lint pour le déploiement en CI
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignorer les erreurs de type TypeScript pendant les builds
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 