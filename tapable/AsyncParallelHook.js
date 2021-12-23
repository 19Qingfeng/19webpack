const Hook = require('./Hook');
const HookCodeFactory = require('./HookCodeFactory');

class AsyncParallelCodeFactory extends HookCodeFactory {
  content() {
    return this.callTapsParallel();
  }
}

const factory = new AsyncParallelCodeFactory();

class AsyncParallelHook extends Hook {
  compile(options) {
    console.log(options, 'options');
    factory.setup(this, options);
    return factory.create(options);
  }
}

module.exports = AsyncParallelHook;
