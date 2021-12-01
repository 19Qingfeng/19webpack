const { interpolateName } = require('loader-utils');

/**
 * 核心:
 * 1. loaderUtils.interpolateName 生成新的文件名称
 * 2. loaderContext.emitFile 将原本文件拷贝到新的文件名中去
 * 3. return js模块路径 在其他文件引入时返回新生成的文件路径
 * webpack会将图片资源也当作一个模块 别的模块引入该模块时引入的是新生成的图片路径
 * (具体可以参考编译后的代码，引入图片资源文件就相当于引入对应的路径进行赋值)
 * @param {*} source 资源文件buffer内容
 * @returns
 */
function fileLoader(source) {
  // 1. 获取外部参数
  const options = this.getOptions() || {};
  const filename = options.filename;
  // 2. 调用interpolateName生成文件
  // https://github.com/webpack/loader-utils#interpolatename
  const targetFilename = interpolateName(this, filename, {
    content: source,
  });
  console.log(targetFilename, 'targetFilename');
  // 3. 调用Webpack复制生成文件 相当于compilation['assets']['targetFilename'] = content
  this.emitFile(targetFilename, source);
  // 返回JS内容 让Webpack可以处理
  return `module.exports = ${JSON.stringify(targetFilename)}`;
}

fileLoader.raw = true;

module.exports = fileLoader;
