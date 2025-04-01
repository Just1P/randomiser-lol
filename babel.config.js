// Configuration Babel pour les tests et le développement
const isTest = process.env.NODE_ENV === 'test';

// Désactiver les avertissements en mode test
if (isTest) {
  process.env.BABEL_DISABLE_CACHE = '1';
  process.env.BABEL_QUIET = '1';
}

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],
  
  // Configuration spécifique pour les tests
  ...(isTest ? {
    // Augmenter la limite de taille des fichiers en mode test
    generatorOpts: {
      compact: true,
      minified: true,
      comments: false,
      maxSize: 5000000, // 5MB, bien au-dessus de la taille des fichiers Firebase
    },
    // Désactiver les warnings pour Firebase en mode test
    ignore: [
      /node_modules\/@firebase\/firestore/,
      /node_modules\/firebase/,
    ],
  } : {})
}; 