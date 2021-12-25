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
      case 'async':
        fn = new Function(
          // callAsync 函数生成时，会额外添加一个 callback 参数
          this.args({ after: '_callback' }),
          this.header() +
            this.contentWithInterceptors({
              onDone: () => '_callback();\n',
            })
        );
        // 其他类型先不考虑
        break;
      case 'promise':
        let content = this.contentWithInterceptors({
          onDone: () => 'resolve(null);\n',
        });
        let template = `return new Promise((resolve,reject) => {
          ${content}
        })`;
        fn = new Function(this.args(), this.header() + template);
      default:
        break;
    }
    this.deinit();
    return fn;
  }

  contentWithInterceptors(options) {
    // 如果存在拦截器
    const interceptors = this.options.interceptors;
    if (interceptors.length > 0) {
      // 优先执行call拦截器
      let code = `
        var taps = this.taps; \n
        var _interceptors = this.interceptors; \n
      `;
      interceptors.forEach((interceptor, index) => {
        // call拦截器
        if (interceptor.call) {
          code += `_interceptors[${index}].call(${this.args()});\n`;
        }
      });
      return code + this.content(options);
    } else {
      return this.content(options);
    }
  }

  // 生成并行调用函数内容
  callTapsParallel({ onDone }) {
    const { taps } = this.options;
    let code = `
      var counter = ${taps.length}; \n
      var _done = (function () { ${onDone()} });\n
    `;
    // 生成并行调用函数
    for (let i = this.options.taps.length - 1; i >= 0; i--) {
      code += this.callTap(i, {
        onDone: () => 'if(--counter === 0) _done();',
      });
    }
    return code;
  }

  // 根据this._x生成整体函数内容
  callTapsSeries({ onDone }) {
    let code = '';
    let current = onDone; // current 表示当前执行的函数内容体/ 以及调用的函数名
    // 没有注册的事件则直接返回
    if (this.options.taps.length === 0) return onDone();
    // 遍历taps注册的函数 编译生成需要执行的函数
    for (let i = this.options.taps.length - 1; i >= 0; i--) {
      const unroll = this.options.taps[i].type !== 'sync';
      // 长度-1开始连续生成
      const done = current; // 上一次生成的code内容
      if (unroll && i < this.options.taps.length - 1) {
        code += `function next${i}(){`;
        // 上一次的函数内容
        code += `${current()};`;
        code += '};';
        // 异步同时我需要在修改current
        current = () => `next${i}()`;
      }
      // 一个一个创建对应的函数调用
      const content = this.callTap(i, {
        onDone: () => done(),
      });
      // 修改current
      current = () => content;
    }
    // 这里添加的是for循环中执行到最后的一次内容 直接调用的内容
    code += current();
    return code;
  }

  // 编译生成单个的事件函数并且调用 比如 fn1 = this._x[0]; fn1(...args)
  callTap(tapIndex, { onDone }) {
    let code = '';
    // 这里应该处理tap拦截器 当每一个注册方法调用时
    const { interceptors } = this.options;
    if (interceptors.length > 0) {
      code += `var tap${tapIndex} = taps[${tapIndex}];\n`;
      interceptors.forEach((interceptor, index) => {
        if (interceptor.tap) {
          code += `_interceptors[${index}].tap(tap${tapIndex});\n`;
        }
      });
    }
    code += `var _fn${tapIndex} = ${this.getTapFn(tapIndex)};\n`;
    // 不同类型的调用方式不同
    const tap = this.options.taps[tapIndex];
    switch (tap.type) {
      case 'sync':
        code += `_fn${tapIndex}(${this.args()});\n`;
        if (onDone) {
          code += onDone();
        }
        break;
      case 'async':
        code += `_fn${tapIndex}(${this.args()},function () {
         ${onDone()}
        });
          \n
        `;
        break;
      case 'promise':
        code += `
          var _promise${tapIndex} = _fn${tapIndex}(${this.args()});\n
          _promise${tapIndex}.then(() => {\n
            ${onDone()};\n
          })
        `;
      // 其他类型不考虑
      default:
        break;
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
