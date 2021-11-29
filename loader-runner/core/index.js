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
  console.log(loaders, 'loaders');
  loaders = loaders.map(createLoaderObject);
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
  // 通过代理保存pitch存储的值 pitch方法中的第三个参数可以修改 通过normal中的this.data可以获得对应loader的pitch方法操作的data
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
  iteratePitchingLoaders(processOptions, loaderContext, (err, result) => {
    callback(err, {
      result,
      resourceBuffer: processOptions.resourceBuffer,
    });
  });
}

/**
 *
 * 读取文件方法
 * @param {*} options
 * @param {*} loaderContext
 * @param {*} callback
 */
function processResource(options, loaderContext, callback) {
  // 重置越界的 loaderContext.loaderIndex
  // 达到倒叙执行 pre -> normal -> inline -> post
  loaderContext.loaderIndex = loaderContext.loaders.length - 1;
  const resource = loaderContext.resourcePath;
  // 读取文件内容
  loaderContext.readResource(resource, (err, buffer) => {
    if (err) {
      return callback(err);
    }
    // 保存原始文件内容的buffer 相当于processOptions.resourceBuffer = buffer
    options.resourceBuffer = buffer;
    // 同时将读取到的文件内容传入iterateNormalLoaders 进行迭代`normal loader`
    iterateNormalLoaders(options, loaderContext, [buffer], callback);
  });
}

/**
 *
 * 转化资源source的格式
 * @param {*} args [资源]
 * @param {*} raw Boolean 是否需要Buffer
 * raw为true 表示需要一个Buffer
 * raw为false表示不需要Buffer
 */
function convertArgs(args, raw) {
  if (!raw && Buffer.isBuffer(args[0])) {
    // 我不需要buffer
    args[0] = args[0].toString();
  } else if (raw && typeof args[0] === 'string') {
    // 需要Buffer 资源文件是string类型 转化称为Buffer
    args[0] = Buffer.from(args[0], 'utf8');
  }
}

/**
 * 迭代normal-loaders 根据loaderIndex的值进行迭代
 * 核心思路: 迭代完成pitch-loader之后 读取文件 迭代执行normal-loader
 *          或者在pitch-loader中存在返回值 熔断执行normal-loader
 * @param {*} options processOptions对象
 * @param {*} loaderContext loader中的this对象
 * @param {*} args [buffer/any]
 * 当pitch阶段不存在返回值时 此时为即将处理的资源文件
 * 当pitch阶段存在返回值时 此时为pitch阶段的返回值
 * @param {*} callback runLoaders中的callback函数
 */
function iterateNormalLoaders(options, loaderContext, args, callback) {
  // 越界元素判断 越界表示所有normal loader处理完毕 直接调用callback返回
  if (loaderContext.loaderIndex < 0) {
    return callback(null, args);
  }
  const currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  if (currentLoader.normalExecuted) {
    loaderContext.loaderIndex--;
    return iterateNormalLoaders(options, loaderContext, args, callback);
  }

  const normalFunction = currentLoader.normal;
  // 标记为执行过
  currentLoader.normalExecuted = true;
  // 检查是否执行过
  if (!normalFunction) {
    return iterateNormalLoaders(options, loaderContext, args, callback);
  }
  // 根据loader中raw的值 格式化source
  convertArgs(args, currentLoader.raw);
  // 执行loader
  runSyncOrAsync(normalFunction, loaderContext, args, (err, ...args) => {
    if (err) {
      return callback(err);
    }
    // 继续迭代 注意这里的args是处理过后的args
    iterateNormalLoaders(options, loaderContext, args, callback);
  });
}

/**
 * 迭代pitch-loaders
 * 核心思路: 执行第一个loader的pitch 依次迭代 如果到了最后一个结束 就开始读取文件
 * @param {*} options processOptions对象
 * @param {*} loaderContext loader中的this对象
 * @param {*} callback runLoaders中的callback函数
 */
function iteratePitchingLoaders(options, loaderContext, callback) {
  // 超出loader个数 表示所有pitch已经结束 那么此时需要开始读取资源文件内容
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) {
    return processResource(options, loaderContext, callback);
  }

  const currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

  // 当前loader的pitch已经执行过了 继续递归执行下一个
  if (currentLoaderObject.pitchExecuted) {
    loaderContext.loaderIndex++;
    return iteratePitchingLoaders(options, loaderContext, callback);
  }

  const pitchFunction = currentLoaderObject.pitch;

  // 标记当前loader pitch已经执行过
  currentLoaderObject.pitchExecuted = true;

  // 如果当前loader不存在pitch阶段
  if (!currentLoaderObject.pitch) {
    return iteratePitchingLoaders(options, loaderContext, callback);
  }

  // 存在pitch阶段 并且当前pitch loader也未执行过 调用loader的pitch函数
  runSyncOrAsync(
    pitchFunction,
    loaderContext,
    [
      currentLoaderObject.remainingRequest,
      currentLoaderObject.previousRequest,
      currentLoaderObject.data,
    ],
    function (err, ...args) {
      if (err) {
        // 存在错误直接调用callback 表示runLoaders执行完毕
        return callback(err);
      }
      // 根据返回值 判断是否需要熔断 or 继续往下执行下一个pitch
      // pitch函数存在返回值 -> 进行熔断 掉头执行normal-loader
      // pitch函数不存在返回值 -> 继续迭代下一个 iteratePitchLoader
      const hasArg = args.some((i) => i !== undefined);
      if (hasArg) {
        loaderContext.loaderIndex--;
        // 熔断 直接返回调用normal-loader
        iterateNormalLoaders(options, loaderContext, args, callback);
      } else {
        // 这个pitch-loader执行完毕后 继续调用下一个loader
        iteratePitchingLoaders(options, loaderContext, callback);
      }
    }
  );
}

/**
 *
 * 执行loader 同步/异步
 * @param {*} fn 需要被执行的函数
 * @param {*} context loader的上下文对象
 * @param {*} args 执行loader函数时候需要传入的参数 Array类型
 * @param {*} callback 回调函数 用来表示本次loader的执行结果
 */
function runSyncOrAsync(fn, context, args, callback) {
  // 标记是否同步 默认同步
  let isSync = true;
  // 表示传入的fn是否已经执行完成 用来标记重复执行
  let isDone = false;

  // 定义loaderContext的异步属性 this.async/this.callback实现
  const innerCallback = (context.callback = function () {
    // 重置状态 其实这个重置无关紧要 源码中存在就加上吧
    isSync = false;
    // 标记完成
    isDone = true;
    // 调用传入的callback同时传入this.callback(a,b,c)赋值的参数
    callback(null, ...arguments);
  });
  context.async = function () {
    // 标记变成异步
    isSync = false;
    // 闭包返回innerCallback函数
    return innerCallback;
  };

  // 执行loader 绑定this为loaderContext同时传入args参数
  const result = fn.apply(context, args);

  if (isSync) {
    // 如果是同步(loader内部未调用this.async) apply完毕则执行完毕
    if (result === undefined) {
      // fn函数执行什么都没有返回
      return callback();
    }
    if (
      result &&
      typeof result === 'result' &&
      typeof result.then === 'function'
    ) {
      // 返回了一个Promise对象  等待Promise resolve后将resolve的结果带哦用callback
      return result.then((r) => callback(null, r), callback);
    }
    // 非Promise 同时存在result
    return callback(null, result);
  }
}

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
  obj.pitch = normalLoader.pitch;
  // 转化时需要buffer/string   raw为true时为buffer false时为string
  obj.raw = normalLoader.raw;
  return obj;
}

module.exports = {
  runLoaders,
};
