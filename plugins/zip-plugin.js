const JSZip = require('jszip');
const { RawSource } = require('webpack-sources');
/* 
  将本次打包的资源都打包成为一个压缩包
  需求:获取所有打包后的资源
*/

const pluginName = 'CompressAssetsPlugin';

class CompressAssetsPlugin {
  constructor({ output }) {
    this.output = output;
  }

  apply(compiler) {
    // AsyncSeriesHook 将 assets 输出到 output 目录之前调用该钩子
    compiler.hooks.emit.tapAsync(pluginName, (compilation, callback) => {
      // 创建zip对象
      const zip = new JSZip();
      // 获取本次打包生成所有的assets资源
      const assets = compilation.getAssets();
      // 循环每一个资源
      assets.forEach(({ name, source }) => {
        // 调用source()方法获得对应的源代码 这是一个源代码的字符串
        const sourceCode = source.source();
        // 往 zip 对象中添加资源名称和源代码内容
        zip.file(name, sourceCode);
      });
      // 调用 zip.generateAsync 生成 zip 压缩包
      zip.generateAsync({ type: 'nodebuffer' }).then((result) => {
        // 通过 new RawSource 创建压缩包
        // 并且同时通过 compilation.emitAsset 方法将生成的 Zip 压缩包输出到 this.output
        compilation.emitAsset(this.output, new RawSource(result));
        // 调用 callback 表示本次事件函数结束
        callback();
      });
    });
  }
}

module.exports = CompressAssetsPlugin;
