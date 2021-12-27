const path = require('path');
const ZipPlugin = require('../plugins/zip-plugin');
const PluginA = require('../plugins/plugin-a');
const PluginB = require('../plugins/plugin-b');
module.exports = {
  mode: 'development',
  entry: {
    main: path.resolve(__dirname, './src/entry1.js'),
    second: path.resolve(__dirname, './src/entry2.js'),
  },
  devtool: false,
  // 基础目录，绝对路径，用于从配置中解析入口点(entry point)和 加载器(loader)。
  // 换而言之entry和loader的所有相对路径都是相对于这个路径而言的
  context: process.cwd(),
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js',
  },
  plugins: [
    new PluginA(),
    new PluginB(),
    new ZipPlugin({
      output: 'a/result.zip',
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.js/,
        use: [
          // 使用自己loader有三种方式 这里仅仅是一种
          // {
          //   loader: path.resolve(__dirname, '../loaders/loader-1.js'),
          //   options: {
          //     name: 'wang.haoyu',
          //   },
          // },
          path.resolve(__dirname, '../loaders/loader-1.js'),
          path.resolve(__dirname, '../loaders/loader-2.js'),
        ],
      },
    ],
  },
};
