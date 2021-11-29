const fs = require('fs');

function runLoaders(options, callback) {
  // 需要处理的资源绝对路径
  const resource = options.resource || '';
  // 需要处理的所有loaders 组成的绝对路径数组
  let loaders = options.loaders || [];
  // loader执行上下文对象 每个loader中的this就会指向这个loaderContext
  const loaderContext = options.context || {};
  // 读取资源内容的方法
  const readResource = options.readResource || fs.readFile.bind(fs);
  // 根据loaders路径数组创建loaders对象
  loader = loader.map(createLoaderObject);
  // 处理loaderContext 也就是loader中的this对象
  loaderContext.resourcePath = resource; // 所有loader资源路径数组
  loaderContext.readResource = readResource; // 读取资源文件的方法
  loaderContext.loaderIndex = 0; // 我们通过loaderIndex来执行对应的loader
  loaderContext.loaders = loaders; // 所有的loader对象
  loaderContext.data = null;
  // 标志异步loader的对象属性
  loaderContext.async = null;
  loaderContext.callback = null;
  // request 保存所有loader路径和资源路径
  // 这里我们将它全部转化为inline-loader的形式(字符串拼接的"!"分割的形式)
  // 注意同时在结尾拼接了资源路径哦～
  Object.defineProperty(loaderContext, 'request', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders
        .map((l) => l.request)
        .concat(loaderContext.resourcePath || '')
        .join('!');
    },
  });
  // 保存剩下的请求 不包含自身(以LoaderIndex分界) 包含资源路径
  Object.defineProperty(loaderContext, 'remainingRequest', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders
        .slice(loaderContext + 1)
        .map((i) => i.request)
        .concat(loaderContext.resourcePath)
        .join('!');
    },
  });
  // 保存剩下的请求，包含自身也包含资源路径
  Object.defineProperty(loaderContext, 'currentRequest', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders
        .slice(loaderContext)
        .map((l) => l.request)
        .concat(loaderContext.resourcePath)
        .join('!');
    },
  });
  // 已经处理过的loader请求 不包含自身 不包含资源路径
  Object.defineProperty(loaderContext, 'previousRequest', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders
        .slice(0, loaderContext.index)
        .map((l) => l.request)
        .join('!');
    },
  });
  // 通过代理保存patch存储的值 pitch方法中的第三个参数可以修改 通过normal中的this.data可以获得对应loader的pitch方法操作的data
  Object.defineProperty(loaderContext, 'data', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders[loaderContext.loaderIndex].data;
    },
  });

  // 用来存储读取资源文件的二进制内容 (转化前的原始文件内容)
  const processOptions = {
    resourceBuffer: null,
  };
  // 处理完loaders对象和loaderContext上下文对象后
  // 根据流程我们需要开始迭代loaders--从pitch阶段开始迭代
  // 按照 post-inline-normal-pre 顺序迭代pitch
  iteratePitchLoaders(processOptions, loaderContext, (err, result) => {
    callback(err, {
      result,
      resourceBuffer: processOptions.resourceBuffer,
    });
  });
}

/**
 * 迭代pitch-loaders
 * 核心思路: 执行第一个loader的pitch 依次迭代 如果到了最后一个结束 就开始读取文件
 * @param {*} options processOptions对象
 * @param {*} loaderContext loader中的this对象
 * @param {*} callback runLoaders中的callback函数
 */
function iteratePitchLoaders(options, loaderContext, callback) {}

/**
 *
 * 通过loader的绝对路径地址创建loader对象
 * @param {*} loader loader的绝对路径地址
 */
function createLoaderObject(loader) {
  const obj = {
    normal: null, // loader normal 函数本身
    pitch: null, // loader pitch 函数
    raw: null, // 表示normal loader处理文件内容时 是否需要将内容转为buffer对象
    // pitch阶段通过给data赋值 normal阶段通过this.data取值 用来保存传递的data
    data: null,
    pitchExecuted: false, // 标记这个loader的pitch函数时候已经执行过
    normalExecuted: false, // 表示这个loader的normal阶段是否已经执行过
    request: loader, // 保存当前loader资源绝对路径
  };
  // 按照路径加载loader模块 真实源码中通过loadLoader加载还支持ESM模块 咱们这里仅仅支持CJS语法
  const normalLoader = require(obj.request);
  // 赋值
  obj.normal = normalLoader;
  obj.patch = normalLoader.pitch;
  // 转化时需要buffer/string   raw为true时为buffer false时为string
  obj.raw = normalLoader.raw;
  return obj;
}
