const Hook = require('./Hook');
const HookCodeFactory = require('./HookCodeFactory');

class SyncHookCodeFactory extends HookCodeFactory {
  content({ onError, onDone, rethrowIfPossible }) {
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

/**
 * 调用栈 this.call() -> CALL_DELEGATE() -> this._createCall() -> this.compile() -> COMPILE()
 * @param {*} options
 * @returns
 */
function COMPILE(options) {
  factory.setup(this, options);
  return factory.create(options);
}

function SyncHook(args = [], name = undefined) {
  const hook = new Hook(args);
  hook.constructor = SyncHook;
  hook.tapAsync = TAP_ASYNC;
  hook.tapPromise = TAP_PROMISE;
  hook.compile = COMPILE;
  return hook;
}

SyncHook.prototype = null;

module.exports = SyncHook;
