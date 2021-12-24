const { AsyncParallelHook } = require('../index');

const hooks = new AsyncParallelHook(['a', 'b']);

console.time('async');

hooks.tapPromise('EventA', (a, b) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(a, b, 'first event done');
      resolve();
    }, 1000);
  });
});

hooks.tapPromise('EventB', (a, b) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(a, b, 'second event done');
      resolve();
    }, 2000);
  });
});

hooks.tapPromise('EventC', (a, b) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(a, b, 'third event done');
      resolve();
    }, 3000);
  });
});

hooks.promise('19Qingfeng', 'wang.haoyu').then(() => {
  console.timeEnd('async');
});
