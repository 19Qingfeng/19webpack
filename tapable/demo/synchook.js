const { SyncHook } = require('../index');

const hooks = new SyncHook(['arg1', 'arg2']);

// hooks.intercept({
//   register: (tapInfo) => {
//     console.log(tapInfo);
//     tapInfo.fn = () => console.log(`修改名称`);
//     console.log('register intercept');
//   },
//   tap: () => {
//     console.log('tap intercept');
//   },
//   call: () => {
//     console.log('call intercept');
//   },
// });

hooks.tap({ name: '19Qingfeng' }, (arg1, arg2) => {
  console.log('hello', arg1, arg2);
});

hooks.tap('2', (arg1, arg2) => {
  console.log('hello2', arg1, arg2);
});

hooks.call('wang', 'haoyu');

// hooks.tap('3', (arg1, arg2) => {
//   console.log('hello3', arg1, arg2);
// });
// console.log('------');
// hooks.call('19Qingfeng', 'haoyu');
