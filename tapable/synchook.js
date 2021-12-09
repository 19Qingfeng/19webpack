const Hook = require('./Hook');

const TAP_ASYNC = () => {
  throw new Error('tapAsync is not supported on a SyncHook');
};

const TAP_PROMISE = () => {
  throw new Error('tapPromise is not supported on a SyncHook');
};

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
