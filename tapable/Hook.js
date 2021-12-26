// 懒编译 当调用call时候才会调用方法 从而调用_createCall创建编译方法
// 得到编译后的方法后 赋值给this.call

// 最终通过 this.call(...args) 调用方法
const CALL_DELEGATE = function (...args) {
  this.call = this._createCall('sync');
  return this.call(...args);
};

const CALL_ASYNC_DELEGATE = function (...args) {
  this.callAsync = this._createCall('async');
  return this.callAsync(...args);
};

const CALL_PROMISE_DELEGATE = function (...args) {
  this.promise = this._createCall('promise');
  return this.promise(...args);
};

class Hook {
  constructor(args = [], name = undefined) {
    // 保存初始化Hook时传递的参数
    this._args = args;
    // name参数没什么用可以忽略掉
    this.name = name;
    // 保存通过tap注册的内容
    this.taps = [];
    // 保存拦截器相关内容
    this.interceptors = [];
    // hook.call 调用方法
    this._call = CALL_DELEGATE;
    this.call = CALL_DELEGATE;
    // _x存放hook中所有通过tap注册的函数
    this._x = undefined;

    // 动态编译方法
    this.compile = this.compile;
    // 相关注册方法
    this.tap = this.tap;
    this.tapAsync = this.tapAsync;
    this.tapPromise = this.tapPromise;

    this._callAsync = CALL_ASYNC_DELEGATE;
    this.callAsync = CALL_ASYNC_DELEGATE;
    // 相关promise方法
    this.promise = CALL_PROMISE_DELEGATE;
    this._promise = CALL_PROMISE_DELEGATE;

    // 与SyncHook无关的代码
    // this._promise = PROMISE_DELEGATE;
    // this.promise = PROMISE_DELEGATE;
    // this.tapPromise = this.tapPromise;
  }

  compile(options) {
    throw new Error('Abstract: should be overridden');
  }

  tap(options, fn) {
    // 这里额外多做了一层封装 是因为this._tap是一个通用方法
    // 这里我们使用的是同步 所以第一参数表示类型传入 sync
    // 如果是异步同理为sync、promise同理为 promise 这样就很好的区分了三种注册方式
    this._tap('sync', options, fn);
  }

  tapAsync(options, fn) {
    this._tap('async', options, fn);
  }

  tapPromise(options, fn) {
    this._tap('promise', options, fn);
  }

  /**
   *
   * @param {*} type 注册的类型 promise、async、sync
   * @param {*} options 注册时传递的第一个参数对象
   * @param {*} fn 注册时传入监听的事件函数
   */
  _tap(type, options, fn) {
    if (typeof options === 'string') {
      options = {
        name: options.trim(),
      };
    } else if (typeof options !== 'object' || options === null) {
      // 如果非对象或者传入null
      throw new Error('Invalid tap options');
    }
    // 那么此时剩下的options类型仅仅就只有object类型了
    if (typeof options.name !== 'string' || options.name === '') {
      // 如果传入的options.name 不是字符串 或者是 空串
      throw new Error('Missing name for tap');
    }
    // 合并参数 { type, fn,  name:'xxx'  }
    options = Object.assign({ type, fn }, options);
    // 运行注册拦截器
    options = this._runRegisterInterceptions(options);
    // 将合并后的参数插入
    this._insert(options);
  }

  // 添加拦截器
  intercept(interceptor) {
    this.interceptors.push(interceptor);
  }

  // 调用注册拦截器 在注册函数时立即执行
  _runRegisterInterceptions(options) {
    let result;
    this.interceptors.forEach((interceptor) => {
      if (interceptor.register) {
        result = interceptor.register(options);
      }
    });
    return result ? result : options;
  }

  _resetCompilation() {
    this.call = this._call;
    this.callAsync = this._callAsync;
    this.promise = this._promise;
  }

  _insert(item) {
    // 源码莫名其妙这样写 一个sort不香吗
    this._resetCompilation();
    // 添加stage和before的逻辑
    let before = item.before;
    if (item.before) {
      if (Array.isArray(before)) {
        before = new Set(before);
      } else {
        before = new Set([before]);
      }
    }
    let stage = 0; // 保存当前插入的stage
    if (typeof item.stage === 'number') {
      stage = item.stage; // 修改stage
    }
    let i = this.taps.length; // 通过i查找最终需要插入的索引
    while (i > 0) {
      i--;
      const x = this.taps[i]; // 获得当前下标的tap
      this.taps[i + 1] = x; // 将tap拷贝放在后一位
      const xStage = x.stage || 0; // 获取当前下标的stage
      // 如果当前tap传递了before before是大于stage，优先处理before之后才会处理stage
      if (before) {
        // 匹配当前before
        if (before.has(x.name)) {
          // 删除
          before.delete(x.name);
          continue;
        }
        // 如果还存在before了 优先判断before
        if (before.size > 0) {
          continue;
        }
      }
      if (xStage > stage) {
        continue;
      }
      // 当不满足条件时 表示插入元素的stage大于等于上一个元素的stage
      // 此时我要将元素插入到对应的位置
      i++;
      break;
    }
    this.taps[i] = item;
  }

  // 编译最终生成的执行函数的方法
  _createCall(type) {
    return this.compile({
      taps: this.taps, // [{ type, fn,  name:'xxx'  } ...]
      interceptors: this.interceptors, // 拦截器也进行编译 tap函数调用以及call时需要
      args: this._args, // args
      type: type, // 类型
    });
  }
}

module.exports = Hook;
