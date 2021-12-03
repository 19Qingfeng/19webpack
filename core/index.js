const webpack = require('./webpack');
const config = require('../example/webpack.config');
// 步骤1: 初始化参数 根据配置文件和shell参数合成参数
// 步骤2: 调用Webpack(options) 初始化compiler对象  webpack()方法会返回一个compiler对象
const compiler = webpack(config);

// 调用run方法进行打包
compiler.run((err, stats) => {
  if (err) {
    console.log(err, 'err');
  }
  // ...
});
