const { SyncHook } = require('../index');

const hooks = new SyncHook(['arg1', 'arg2']);

hooks.tap('1', (arg1, arg2) => {
  console.log('hello', arg1, arg2);
});

hooks.tap('2', (arg1, arg2) => {
  console.log('hello2', arg1, arg2);
});

hooks.call('wang', 'haoyu');

hooks.tap('3', (arg1, arg2) => {
  console.log('hello3', arg1, arg2);
});
console.log('------');
hooks.call('19Qingfeng', 'haoyu');
