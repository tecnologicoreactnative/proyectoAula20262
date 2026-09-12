const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1. Añadir soporte para extensiones .cjs requeridas por Firebase JS SDK
if (!config.resolver.sourceExts.includes('cjs')) {
  config.resolver.sourceExts.push('cjs');
}

// 2. Desactivar package exports para que Metro resuelva la versión nativa de React Native de Firebase
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
