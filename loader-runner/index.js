// 入口文件
const fs = require('fs');
const path = require('path');
const { runLoaders } = require('loader-runner');

// 模块路径
const filePath = path.resolve(__dirname, './title.js');

// 模拟模块内容和.title.js一模一样的内容
const request = 'inline1-loader!inline2-loader!./title.js';

// 模拟webpack配置
const rules = [
  // 普通loader
  {
    test: /\.js$/,
    use: [
      'normal1-loader',
      'normal2-loader',
      {
        loader: path.resolve(__dirname, './loaders/babel-loader/index.js'),
        options: {
          name: 'wang.hayu',
        },
      },
    ],
  },
  // 前置loader
  {
    test: /\.js$/,
    use: ['pre1-loader', 'pre2-loader'],
    enforce: 'pre',
  },
  // 后置loader
  {
    test: /\.js$/,
    use: ['post1-loader', 'post2-loader'],
    enforce: 'post',
  },
];

// 从文件引入路径中提取inline loader 同时将文件路径中的 -!、!!、! 等标志inline-loader的规则删除掉
const parts = request.replace(/^-?!+/, '').split('!');

// 获取文件路径
const sourcePath = parts.pop();

// 获取inlineLoader
const inlineLoaders = parts;

// 处理rules中的loader规则
const preLoaders = [],
  normalLoaders = [],
  postLoaders = [];

rules.forEach((rule) => {
  // 如果匹配情况下
  if (rule.test.test(sourcePath)) {
    switch (rule.enforce) {
      case 'pre':
        preLoaders.push(...rule.use);
        break;
      case 'post':
        postLoaders.push(...rule.use);
        break;
      default:
        normalLoaders.push(...rule.use);
        break;
    }
  }
});

/**
 * 根据inlineLoader的规则过滤需要的loader
 * https://webpack.js.org/concepts/loaders/
 * !: 单个！开头，排除所有normal-loader.
 * !!: 两个!!开头 仅剩余 inline-loader 排除所有(pre,normal,post).
 * -!: -!开头将会禁用所有pre、normal类型的loader，剩余post和normal类型的.
 */
let loaders = [];
if (request.startsWith('!!')) {
  loaders.push(...inlineLoaders);
} else if (request.startsWith('-!')) {
  loaders.push(...postLoaders, ...inlineLoaders);
} else if (request.startsWith('!')) {
  loaders.push(...postLoaders, ...inlineLoaders, ...preLoaders);
} else {
  loaders.push(
    ...[...postLoaders, ...inlineLoaders, ...normalLoaders, ...preLoaders]
  );
}

// 将loader转化为loader所在文件路径
// webpack下默认是针对于resolve.modules的路径进行解析 这里为了模拟我们省略了webpack中的路径解析
const resolveLoader = (loader) => path.resolve(__dirname, './loaders', loader);

// 获得需要处理的loaders路径
loaders = loaders.map(resolveLoader);

console.log(loaders, 'loaders');

runLoaders(
  {
    resource: filePath, // 加载的模块路径
    loaders, // 需要处理的loader数组
    context: { name: '19Qingfeng' }, // 传递的上下文对象
    readResource: fs.readFile.bind(fs), // 读取文件的方法
    // processResource 参数先忽略
  },
  (error, result) => {
    console.log(error, '存在的错误');
    console.log(result, '结果');
  }
);
