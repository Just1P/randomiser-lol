// Configuration Babel spécifique pour les tests
process.env.BABEL_DISABLE_CACHE = '1';
process.env.BABEL_QUIET = '1';

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],
  // Augmenter la limite de taille des fichiers
  generatorOpts: {
    compact: true,
    minified: true,
    comments: false,
    maxSize: 5000000, // 5MB, bien au-dessus de la taille des fichiers Firebase
  },
  // Désactiver les warnings
  ignore: [
    /node_modules\/@firebase\/firestore/,
    /node_modules\/firebase/,
  ],
}; 