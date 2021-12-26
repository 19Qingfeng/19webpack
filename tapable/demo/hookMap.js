const { SyncHook, HookMap } = require('../index');

const map = new HookMap(() => new SyncHook(['name']));

// 创建
const hook = map.for('name');

hook.tap('A', (name) => {
  console.log(name, 'A');
});

hook.tap('B', (name) => {
  console.log(name, 'B');
});

hook.call('19Qingfeng');
