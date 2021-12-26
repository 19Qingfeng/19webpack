class HookMap {
  constructor(hookCreateFactor) {
    this._map = new Map();
    this.createHookFactor = hookCreateFactor;
  }

  // 创建方法
  for(key) {
    const hook = this.get(key);
    if (hook) {
      return hook;
    }
    const newHook = this.createHookFactor();
    return this.set(key, newHook);
  }

  // 检查是否已经创建
  get(key) {
    return this._map.get(key);
  }

  // 设置值
  set(key, value) {
    this._map.set(key, value);
    return value;
  }
}

module.exports = HookMap;
