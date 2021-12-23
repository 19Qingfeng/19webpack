const { AsyncParallelHook } = require('../index');

const hooks = new AsyncParallelHook(['a', 'b']);

console.time('async');

hooks.tapAsync('EventA', (a, b, callback) => {
  setTimeout(() => {
    console.log(a, b, 'first event done');
    callback();
  }, 1000);
});

hooks.tapAsync('EventB', (a, b, callback) => {
  setTimeout(() => {
    console.log(a, b, 'second event done');
    callback();
  }, 2000);
});

hooks.tapAsync('EventC', (a, b, callback) => {
  setTimeout(() => {
    console.log(a, b, 'thired event done');
    callback();
  }, 3000);
});

hooks.callAsync('19Qingfeng', 'wang.haoyu', () => {
  console.timeEnd('async');
});
