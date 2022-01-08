const path = require('path');
const ExternalsWebpackPlugin = require('../plugins/external-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  mode: 'development',
  entry: {
    main: path.resolve(__dirname, './src/entry1.js'),
  },
  devtool: false,
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js',
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new ExternalsWebpackPlugin({
      lodash: {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
        variableName: '_',
      },
      vue: {
        src: 'https://vue.js',
        variableName: 'vue',
      },
    }),
  ],
};
