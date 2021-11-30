const core = require('@babel/core');

/**
 *
 * @param {*} source 源代码内容
 */
function babelLoader(source, sourceMap, meta) {
  // 获取loader参数
  const options = this.getOptions() || {};
  // 生成babel转译阶段的sourcemap
  options.sourceMaps = true;
  // 保存之前loader传递进入的sourceMap
  options.inputSourceMap = sourceMap;
  // 获得处理的资源文件名 babel API需要
  options.filename = this.requestPath.split('/').pop();
  console.log(filename, 'filename');
  // 通过transform方法进行转化
  const { code, map, ast } = core.transform(source, options);
  // 调用this.callback表示loader执行完毕
  // 同时传递多个参数给下一个loader
  // 将transform API生成的sourceMap 返回给下一个loader(或者webpack编译阶段)进行处理
  this.callback(null, code, map, ast);
}

module.exports = babelLoader;
