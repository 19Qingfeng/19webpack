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

hooks.tap({ name: '19Qingfeng1', stage: 1 }, (arg1, arg2) => {
  console.log('hello1', arg1, arg2);
});

hooks.tap({ name: '19Qingfeng3', stage: 3 }, (arg1, arg2) => {
  console.log('hello3', arg1, arg2);
});

hooks.tap({ name: '19Qingfeng4', stage: 4 }, (arg1, arg2) => {
  console.log('hello4', arg1, arg2);
});

hooks.tap(
  { name: 'wang.haoyu', before: '19Qingfeng3', stage: 5 },
  (arg1, arg2) => {
    console.log('插入的tap', arg1, arg2);
  }
);

hooks.call('wang', 'haoyu');

// hooks.tap('3', (arg1, arg2) => {
//   console.log('hello3', arg1, arg2);
// });
// console.log('------');
// hooks.call('19Qingfeng', 'haoyu');
