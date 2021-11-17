// 插件A
class PluginA {
  apply(compiler) {
    // 注册同步钩子
    compiler.hooks.run.tap('Plugin A', () => {
      // 调用
      console.log('PluginA');
    });
  }
}

module.exports = PluginA;
