const Hook = require('./Hook');
const HookCodeFactory = require('./HookCodeFactory');

class AsyncParallelCodeFactory extends HookCodeFactory {
  content() {
    return this.callTapsParallel();
  }
}

const factory = new AsyncParallelCodeFactory();

class AsyncParallelHook extends Hooks {
  compile(options) {
    factory.setup(options);
    return factory.create(options);
  }
}

module.exports = AsyncParallelHook;
