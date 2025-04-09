const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@ui-kitten/components']
    }
  }, argv);

  // Use our custom entry point for web
  config.entry = ['./index.web.ts'];
  
  // Use our custom HTML template
  config.plugins[0].options.template = './public/index.html';

  return config;
}; 