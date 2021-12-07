const { SyncBailHook } = require('tapable');

const syncBailHook = new SyncBailHook(['arg1', 'arg2']);

syncBailHook.tap(
  {
    name: 'wang.haoyu',
    // context: 'context',
  },
  (name, nickname) => {
    console.log('flag 1', name, nickname);
  }
);

syncBailHook.tap('flag 2', (name, nickname) => {
  console.log('flag 2', name, nickname);
  // return 'Have any return value to interrupt';
});

syncBailHook.tap('flag 3', (name, nickname) => {
  console.log('flag 3:', name, nickname);
});

syncBailHook.call('wang', '19Qingfeng');

console.log('我是分割线');

syncBailHook.tap('flag 4', (name, nickname) => {
  console.log('flag 4:', name, nickname);
});

syncBailHook.call('wang', '19Qingfeng');
