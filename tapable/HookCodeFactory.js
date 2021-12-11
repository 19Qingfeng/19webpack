class HookCodeFactory {
  constructor(config) {
    this.config = config;
    this.options = undefined;
    this._args = undefined;
  }

  // 初始化参数
  setup(instance, options) {
    instance._x = options.taps.map((i) => i.fn);
  }

  // 编译最终需要生成的函数
  create(options) {
    this.init(options);
    // 最终编译生成的方法 fn
    let fn;
    switch (this.options.type) {
      case 'sync':
        fn = new Function(
          this.args(),
          '"use strict";\n' +
            this.header() +
            this.contentWithInterceptors({
              onError: (err) => `throw ${err};\n`,
              onResult: (result) => `return ${result};\n`,
              resultReturns: true,
              onDone: () => '',
              rethrowIfPossible: true,
            })
        );
        break;
      // 其他类型先不考虑
      default:
        break;
    }
    this.deinit();
    return fn;
  }

  contentWithInterceptors(options) {
    // 如果存在拦截器
    if (this.options.interceptors.length > 0) {
      // ...
    } else {
      return this.content(options);
    }
  }

  // 根据this._x生成整体函数内容
  callTapsSeries({ onDone }) {
    let code = '';
    let current = onDone;
    // 没有注册的事件则直接返回
    if (this.options.taps.length === 0) return onDone();
    // 遍历taps注册的函数 编译生成需要执行的函数
    for (let i = this.options.taps.length - 1; i >= 0; i--) {
      const done = current;
      // 一个一个创建对应的函数调用
      const content = this.callTap(i, {
        onDone: done,
      });
      current = () => content;
    }
    code += current();
    return code;
  }

  // 编译生成单个的事件函数并且调用 比如 fn1 = this._x[0]; fn1(...args)
  callTap(tapIndex, { onDone }) {
    let code = '';
    code += `var _fn${tapIndex} = ${this.getTapFn(tapIndex)};\n`;
    // 不同类型的调用方式不同
    const tap = this.options.taps[tapIndex];
    switch (tap.type) {
      case 'sync':
        code += `_fn${tapIndex}(${this.args()});\n`;
        break;
      // 其他类型不考虑
      default:
        break;
    }
    if (onDone) {
      code += onDone();
    }
    return code;
  }

  // 从this._x中获取函数内容 this._x[index]
  getTapFn(idx) {
    return `_x[${idx}]`;
  }

  args({ before, after } = {}) {
    let allArgs = this._args;
    if (before) allArgs = [before].concat(allArgs);
    if (after) allArgs = allArgs.concat(after);
    if (allArgs.length === 0) {
      return '';
    } else {
      return allArgs.join(', ');
    }
  }

  header() {
    let code = '';
    code += 'var _context;\n';
    code += 'var _x = this._x;\n';
    return code;
  }

  /**
   * @param {{ type: "sync" | "promise" | "async", taps: Array<Tap>, interceptors: Array<Interceptor> }} options
   */
  init(options) {
    this.options = options;
    // 保存初始化Hook时的参数
    this._args = options.args.slice();
  }

  deinit() {
    this.options = undefined;
    this._args = undefined;
  }
}

module.exports = HookCodeFactory;
