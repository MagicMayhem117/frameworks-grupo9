const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Obtenemos la configuración por defecto para poder modificarla
const defaultConfig = getDefaultConfig(__dirname);
const {
  assetExts,
  sourceExts
} = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    // Le decimos a Metro que los archivos .svg no son assets de imagen tradicionales...
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    // ...sino que son código fuente que se puede importar como un componente.
    sourceExts: [...sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, config);