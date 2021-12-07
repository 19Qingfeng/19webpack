const { SyncWaterfallHook } = require('tapable');

const syncWaterfallHook = new SyncWaterfallHook(['arg1', 'arg2']);

syncWaterfallHook.tap('flag 1', (name, nickname) => {
  console.log('flag 3', name, nickname);
});

syncWaterfallHook.tap('flag 2', (name, nickname) => {
  console.log('flag 2', name, nickname);
  return 'haoyu';
});

syncWaterfallHook.tap('flag 3', (name, nickname) => {
  console.log('flag 3:', name, nickname);
});

syncWaterfallHook.call('wang', '19Qingfeng');
