// function loader2(sourceCode) {
//   console.log('join loader2');
//   debugger;
//   return sourceCode + `\n const loader2 = '19Qingfeng'`;
// }

// module.exports = loader2;

const { SyncWaterfallHook } = require('tapable');

const syncWaterfallHook = new SyncWaterfallHook(['arg1', 'args']);

syncWaterfallHook.tap('1', (arg1, arg2) => {
  console.log(arg1);
  console.log(arg2);
  return ['wang', 'haoyu'];
});

syncWaterfallHook.tap('1', (arg1, arg2) => {
  console.log(arg1);
  console.log(arg2);
});

syncWaterfallHook.tap('1', (arg1, arg2) => {
  console.log(arg1);
  console.log(arg2);
});

syncWaterfallHook.call('hello', 'world');
