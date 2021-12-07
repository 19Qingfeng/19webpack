class HookCodeFactory {
  // 初始化fn编译方法
  setup(instance, options) {
    // instance 外部传入的Hook实例对象
    // hook._x 存放所有的事件监听函数 仅存放函数 [fn1,fn2,fn3]
    instance._x = options.taps.map((h) => h.fn);
  }

  // 根据对应的options创建对应需要执行的事件函数
  create(options) {
    // 初始化参数
    this.init(options);
    let fn;
    switch (this.options.type) {
      case 'sync':
        // 创建需要执行的函数 拼接多个事件函数
        fn = this.createSyncHookFn();
    }
    // 销毁参数
    this.deinit(options);
    return fn;
  }

  // 获取顶部参数
  // before after 是调用时额外加入的内置参数 比如callAsync时加入的callback
  args({ before, after } = {}) {
    // args 是本次的参数
    let allArgs = this._args;
    if (before) allArgs = [before].concat(allArgs);
    if (after) allArgs = [after].concat(allArgs);
    if (this._args.length === 0) {
      // 处理称为空字符串 new Function时使用
      return '';
    } else {
      return allArgs.join(', ');
    }
  }

  header() {
    let code = '';
    // context 直接忽略不看 马上废弃
    code += 'var _x = this._x\n';
    // if (this.options.interceptors.length > 0) {
    // 这里有拦截器 先不处理
    // }
    return code;
  }

  // 编译生成SyncHook 可执行的Fn
  createSyncHookFn() {
    return new Function(
      this.args(),
      // 函数体
      '"use strict";\n' +
        // 'console.log(this);' +
        this.header() +
        this.contentWithInterceptors({
          // 拦截器相关
          onError: (err) => `throw ${err};\n`,
          onResult: (result) => `return ${result};\n`,
          resultReturns: true,
          onDone: () => '',
          rethrowIfPossible: true,
        })
    );
  }

  // 生成整体函数体
  contentWithInterceptors(options) {
    if (this.options?.interceptors?.length > 0) {
      // 存在拦截器 处理 拦截器内容
    } else {
      // 生成对应的函数体 每个type拥有不同的函数体
      // 所以在派生类中进行实现
      return this.content(options);
    }
  }

  // 初始化参数
  init(options) {
    // 保存options对象
    this.options = options;
    // 调用函数时参数
    this._args = options.args.slice();
  }

  // deinit 销毁参数
  deinit() {
    this.options = undefined;
    this._args = undefined;
  }

  callTapsSeries({
    onError,
    onResult,
    resultReturns,
    onDone,
    doneReturns,
    rethrowIfPossible,
  }) {
    const { taps } = this.options;
    let current = onDone;
    // 没有注册 直接返回调用done函数 默认 ''
    if (taps.length === 0) return onDone();

    let code = '';
    // 循环taps
    for (let j = taps.length - 1; j >= 0; j--) {
      const done = current;
      // 生成单个函数内容
      const content = this.callTap(j, {
        onError: (error) => onError(i, error, done, doneBreak),
        onResult: undefined, // 不知道作用
        onDone: done, // 不知道作用
        rethrowIfPossible: true, // 同步下是true
      });
      current = () => content;
    }
    code += current();
    return code;
  }

  // 生成单个
  callTap(tapIndex, { onError, onResult, onDone, rethrowIfPossible }) {
    // 拦截器内容先不考虑
    let code = '';
    // 顶部声明函数都是一样的
    code += `var _fn${tapIndex} = ${this.getTapFn(tapIndex)};\n`;
    // 获取对应tap
    const tap = this.options.taps[tapIndex];
    switch (tap.type) {
      case 'sync':
        code += `_fn${tapIndex}(${this.args()});\n`;
        if (onDone) {
          code += onDone(); // code = code + onDone()
        }
        break;
    }
    return code;
  }

  getTapFn(idx) {
    return `_x[${idx}]`;
  }
}

module.exports = HookCodeFactory;
