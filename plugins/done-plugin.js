class DonePlugin {
  apply(compiler) {
    // 调用 Compiler Hook 注册额外逻辑
    compiler.hooks.afterEmit.tap('Plugin Done', (compilation) => {
      console.log(compilation, 'compilation 对象');
      //
      compiler.outputFileSystem.writeFile(compilation, './index.json');
    });
  }
}

module.exports = DonePlugin;
