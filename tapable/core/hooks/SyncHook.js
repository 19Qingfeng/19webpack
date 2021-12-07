const Hook = require('./Hook');
const HookCodeFactory = require('./HookCodeFactory');
// 通过SyncHookCodeFactory生成编译方法
class SyncHookCodeFactory extends HookCodeFactory {
  // 编译时生成最终需要执行的函数时 根据type不同动态生成不同的函数体
  // 各个子函数中实现 因为各个类型的Hook 生成的最终函数体是不同的
  content({ onError, onDone, rethrowIfPossible }) {
    // 生成同步运行的函数体
    return this.callTapsSeries({
      onError: (i, err) => onError(err),
      onDone,
      rethrowIfPossible,
    });
  }
}

const factory = new SyncHookCodeFactory();

const TAP_ASYNC = () => {
  throw new Error('tapAsync is not supported on a SyncHook');
};

const TAP_PROMISE = () => {
  throw new Error('tapPromise is not supported on a SyncHook');
};

const COMPILE = function (options) {
  // 初始化赋值 _x 所有保存的事件函数
  factory.setup(this, options);
  return factory.create(options);
};

// 需要在同步钩子中实现对应的compile方法：this.compile
function SyncHook(args = []) {
  // 所有类型的Hook都是基于Hook基类去派生实现的
  const hook = new Hook(args);
  hook.constructor = SyncHook;
  // SyncHook不支持异步调用
  hook.tapAsync = TAP_ASYNC;
  hook.tapPromise = TAP_PROMISE;
  /* 
    compile方法接受的参数
    {
      // 当前所有的tap注册的钩子 [{taps: [{ type,fn,options }],args,type }]
      taps: this.taps,
      // interceptors: this.interceptors
      // 当前Hook初始化时候的参数
      args: this._args,
      // 当前创建hook的类型 sync/promise/async
      type,
    }
  */
  // 懒编译compile方法
  // 当调用外部this.call触发事件时 相当于先调用CALL_DELEGATE方法
  // CALL_DELEGATE方法内部调用this._createCall
  // this._createCall方法内部就是调用 hook.compile方法编译生成最终需要执行的函数体并且执行
  // 这样一个流程
  hook.compile = COMPILE;
  return hook;
}

module.exports = SyncHook;
