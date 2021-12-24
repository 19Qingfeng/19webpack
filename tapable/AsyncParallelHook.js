const Hook = require('./Hook');
const HookCodeFactory = require('./HookCodeFactory');

class AsyncParallelCodeFactory extends HookCodeFactory {
  content({ onDone }) {
    return this.callTapsParallel({
      onDone,
    });
  }
}

const factory = new AsyncParallelCodeFactory();

class AsyncParallelHook extends Hook {
  compile(options) {
    factory.setup(this, options);
    return factory.create(options);
  }
}

module.exports = AsyncParallelHook;
