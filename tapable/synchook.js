const { SyncHook } = require('./core/index');

const syncHook = new SyncHook(['arg1', 'arg2']);

syncHook.tap('flag 1', (name, nickname) => {
  console.log('flag 3', name, nickname);
});

syncHook.tap('flag 2', (name, nickname) => {
  console.log('flag 2', name, nickname);
});

syncHook.tap('flag 3', (name, nickname) => {
  console.log('flag 3:', name, nickname);
});

syncHook.call('wang', '19Qingfeng');
