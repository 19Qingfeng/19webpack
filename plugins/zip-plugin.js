const JSZip = require('jszip');
const { RawSource } = require('webpack-sources');
/* 
  将本次打包的资源都打包成为一个压缩包
  需求:获取所有打包后的资源
*/

const pluginName = 'ZipPlugin';

class ZipPlugin {
  constructor({ output }) {
    this.output = output;
  }

  apply(compiler) {
    // AsyncSeriesHook 将 assets 输出到 output 目录之前调用该钩子
    compiler.hooks.emit.tapAsync(pluginName, (compilation, callback) => {
      const zip = new JSZip();
      const assets = compilation.getAssets();
      assets.forEach(({ name, source }) => {
        // 获得源代码
        const sourceCode = source.source();
        zip.file(name, sourceCode);
      });
      zip.generateAsync({ type: 'nodebuffer' }).then((result) => {
        compilation.emitAsset(this.output, new RawSource(result));
        callback();
      });
    });
  }
}

module.exports = ZipPlugin;
