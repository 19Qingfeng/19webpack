class Hook {
  constructor(args) {
    // 保存new Hook 时的参数
    this._args = args;
    // 存放所有taps 当前Hook通过tap注册的函数
    this.taps = [];
    // 存放拦截器
    this.interceptors = [];
    // 实现的call方法 执行this.call时动懒生成 真实call方法
    this.call = CALL_DELEGATE;
    this._call = CALL_DELEGATE;
    // 同理callAsync方法
    this.callAsync = CALL_ASYNC_DELEGATE;
    this._callAsync = CALL_ASYNC_DELEGATE;
    // promise
    this.promise = PROMISE_DELEGATE;
    this._promise = PROMISE_DELEGATE;

    // _x 格式化this.taps保存所有函数
    this.x = undefined;

    // 真正编译生成方法的逻辑
    this.compile = this.compile;
    // 注册方法
    this.tap = this.tap;
    // 两个异步方法先放一放
    // this.tapAsync = this.tapAsync
    // this.tapPromise = this.tapPromise
  }

  // 同步Hook注册方法
  tap(options, fn) {
    this._tap('sync', options, fn);
  }

  // 真实注册方法
  _tap(type, options, fn) {
    if (typeof options === 'string') {
      options = {
        name: options.trim(),
      };
    } else if (typeof options !== 'object' || options === null) {
      // null 或者非对象也非string
      throw new Error('Invalid tap options');
    }
    // 此时options只剩下typeof object的选项
    if (typeof options.name !== 'string' || options.name === '') {
      // 必须存在name
      throw new Error('Missing name for tap');
    }
    // options.context属性 马上被弃用 这里我们没必要了解了
    // 重新修改options
    options = Object.assign({ type, fn }, options);
    // 拦截器相关逻辑先干掉
    // _runRegisterInterceptors假如你和我一样没有故事，没事儿。哥们写不出来内容也罢，可这丝毫不妨碍咱爷们眼里有光
    // 将格式化后的数据加入this.taps
    this._insert(options);
  }

  // 插入
  _insert(item) {
    // 每次插入时需要将调用方法进行重置，因为有可能之前调用过 call方法已经编译过了
    this._resetCompilation();
    // 先实现最基础的syncHook
    this.taps.push(item);
  }

  // 重置编译调用方法
  _resetCompilation() {
    this.call = this._call;
    this.callAsync = this._callAsync;
    this.promise = this._promise;
  }

  _createCall(type) {
    // 调用编译方法进行编译
    return this.compile({
      // 当前所有的tap注册的钩子 [{taps: [{ type,fn,options }],args,type }]
      taps: this.taps,
      // interceptors: this.interceptors
      // 当前Hook初始化时候的参数
      args: this._args,
      // 当前创建hook的类型 sync/promise/async
      type,
    });
  }

  // Hook基类上并不会实现对应的编译方法 需要各自不同的派生类去实现compile方法
  // 你可以将它理解称为TS中的抽象方法
  compile(options) {
    throw new Error('Abstract: should be overridden');
  }
}

/*
  对应懒生成的方法
  当new Hook时 此时call、callAsync、promise这三个调用方法会赋值为一个函数
  当真正调用上述三个方法时才会实际调用对应方法编译 
  生成真正的调用方法
  再重新赋值给对应被调用的方法返回
*/

// 调用CALL_DELEGATE动态生成当前对象上的call方法
function CALL_DELEGATE(...args) {
  // 动态创建同步call方法
  this.call = this._createCall('sync');
  console.log(this.call.toString(), 'this.call');
  return this.call(...args);
}

// 懒生成callAsync需要执行的调用
function CALL_ASYNC_DELEGATE(...args) {
  this.callAsync = this._createCall('async');
  return this.callAsync(...args);
}

// 懒生成promise
function PROMISE_DELEGATE() {
  this.promise = this._createCall('promise');
  return this.promise(...args);
}

module.exports = Hook;
