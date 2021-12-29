const { ExternalModule } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const pluginName = 'ExtendsPlugin';

function importHandler(parser) {
  parser.hooks.import.tap(pluginName, (statement, source) => {
    // 解析当前模块中的import语句
    if (this.transformLibrary.includes(source)) {
      this.usedLibrary.add(source);
    }
  });
}

function requireHandler(parser) {
  // 解析当前模块中的require语句
  parser.hooks.call.for('require').tap(pluginName, (expression) => {
    const moduleName = expression.arguments[0].value;
    // 当require语句中使用到传入的模块时
    if (this.transformLibrary.includes(moduleName)) {
      this.usedLibrary.add(moduleName);
    }
  });
}

class ExtendsPlugin {
  constructor(options) {
    // 保存传入配置
    this.options = options;
    // 需要转化的所有库名称  ['lodash']
    this.transformLibrary = Object.keys(this.options);
    // 保存代码中使用到的外部external所有模块 用于最终在HTML中注入
    this.usedLibrary = new Set();
  }
  apply(compiler) {
    // 首先检查Webpack Parser Modules 生成AST时检查所有import引入语句
    compiler.hooks.normalModuleFactory.tap(
      pluginName,
      (normalModuleFactory) => {
        // 寻找名为 javascript/auto 的HooksMap javascript/auto 指webpack中对于所有默认模块的处理(CommonJS、AMD、ESM)会触发该钩子
        normalModuleFactory.hooks.parser
          .for('javascript/auto')
          .tap(pluginName, (parser) => {
            // 当解析到模块中的 import 语句时
            importHandler.call(this, parser);
            // 当解析到模块中的 require 语句时
            requireHandler.call(this, parser);
          });

        // 判断在引入模块时 如果引入的模块是usedLibrary中的 那么直接引入外链而不进行webpack编译引入模块(拦截编译模块)
        normalModuleFactory.hooks.factorize.tapAsync(
          pluginName,
          (resolveData, callback) => {
            const requireModuleName = resolveData.request;
            if (this.transformLibrary.includes(requireModuleName)) {
              // 此时不需要normalModuleFactory进行编译了 处理成为外部模块依
              const externalModuleName =
                this.options[requireModuleName].variableName;
              // 不编译了 直接创建一个外部模块对象进行返回
              callback(
                null,
                // 第一个参数为替换的外部模块变量
                // 第二个参数为第一个参数对应的对象 比如 externalModuleName为_时，第二个参数为window 编译出外部模块导出为 window['_']
                // 第三个参数为编译生成的模块名称
                new ExternalModule(
                  externalModuleName,
                  'window',
                  requireModuleName
                )
              );
            } else {
              // 正常解析
              callback();
            }
          }
        );
      }
    );

    // 利用 html-webpack-plugin 在生成HTML文件时注入使用到的CDN
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      // 获取HTMLWebpackPlugin拓展的compilation Hooks
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap(
        pluginName,
        (data) => {
          // 额外添加scripts
          const scriptTag = data.assetTags.scripts;
          // console.log(assetTags, 'assetTags');
          this.usedLibrary.forEach((library) => {
            scriptTag.unshift({
              tagName: 'script',
              voidTag: false,
              meta: { plugin: pluginName },
              attributes: {
                defer: true,
                type: undefined,
                src: this.options[library].src,
              },
            });
          });
        }
      );
      // console.log(this.usedLibrary, 'usedLibrary');
      // this.usedLibrary.forEach((value) => console.log(value, 'value'));
    });
  }
}

module.exports = ExtendsPlugin;
