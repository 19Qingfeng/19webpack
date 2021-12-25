const { AsyncSeriesHook } = require('../index');

const hooks = new AsyncSeriesHook(['a', 'b']);

console.time('async');

hooks.tapAsync('EventA', (a, b, callback) => {
  setTimeout(() => {
    console.log(a, b, 'one');
    callback(a, b, 'one event done');
  }, 1000);
});

hooks.tapAsync('EventB', (a, b, callback) => {
  setTimeout(() => {
    console.log(a, b, 'three');
    callback(a, b, 'three event done');
  }, 2000);
});

hooks.tapAsync('EventC', (a, b, callback) => {
  setTimeout(() => {
    console.log(a, b, 'three');
    callback(a, b, 'third event done');
  }, 3000);
});

hooks.callAsync('19Qingfeng', 'wang.haoyu', () => {
  console.timeEnd('async');
});
