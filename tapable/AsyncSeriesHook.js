const Hook = require('./Hook');
const HookCodeFactory = require('./HookCodeFactory');

class AsyncSeriesCodeFactory extends HookCodeFactory {
  content({ onDone }) {
    // 不同钩子最核心的差异实现在content函数中
    return this.callTapsSeries({
      onDone,
    });
  }
}

const factory = new AsyncSeriesCodeFactory();

class AsyncSeriesHook extends Hook {
  compile(options) {
    factory.setup(this, options);
    return factory.create(options);
  }
}

module.exports = AsyncSeriesHook;
