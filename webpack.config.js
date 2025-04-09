const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@ui-kitten/components']
    }
  }, argv);

  // Use our custom entry point for web
  config.entry = ['./index.web.ts'];
  
  // Find HtmlWebpackPlugin in the plugins array
  const htmlPlugin = config.plugins.find(plugin => plugin.constructor.name === 'HtmlWebpackPlugin');
  
  if (htmlPlugin) {
    htmlPlugin.userOptions.template = './public/index.html';
  } else {
    // If no HtmlWebpackPlugin found, add one
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html'
      })
    );
  }

  return config;
}; 