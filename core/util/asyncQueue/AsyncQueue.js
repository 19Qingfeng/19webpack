const ArrayQueue = require('./ArrayQueue');

const QUEUE_STATE = 0; // 表示等待执行
const PROCESS_STATUE = 1; // 表示正在执行
const DONE_STATUS = 2; // 表示执行完毕

class AsyncQueueEntry {
  constructor(item, callback) {
    this.item = item;
    this.callback = callback;
    this.status = QUEUE_STATE;
    this.result = null; // 当前item经过processor处理后的结果
    this.error = null; // 保存当前item经过process处理后的的错误
    this.callbacks = []; // 多次重复添加时 额外的callback函数
  }
}

/**
 * TODO: 异步事件调度器总结
 * 本质上可以理解成为添加时执行Queue
 * 当queue中执行完毕一个时同样会再次执行Queue
 * @class AsyncQueue
 */
class AsyncQueue {
  constructor({
    name, // 当前队列名称
    parallelism, // 当前队列最多允许并行处理个数
    processor, // 当前队列处理器方法
    getKey, // 获取队列中每一个元素的唯一表示符方法
  }) {
    this._name = name;
    this._parallelism = parallelism;
    this._processor = processor;
    this._getKey = getKey;

    // 内部实现
    this._entries = new Map(); // 判断是否已经添加过该条目 保存所有添加过的记录
    this._queued = new ArrayQueue(); // 保存每一个item 添加会入栈 执行完会出栈
    this._activeTask = 0; // 当前正在执行的所有任务数量（并发数）
    this._willEnsureProcessing = false; // 表示当前队列是即将开始处理状态 也就是标记当前queue是否在下一次EventLoop中即将执行  或者说当前正在执行 总之就是为了防止异步重复调用
  }

  add(item, callback) {
    const key = this._getKey(item);
    // 获取entries中是否存在key 存在获取旧的条目
    const oldEntry = this._entries.get(key);
    // TODO: 当存在时暂时未处理
    if (oldEntry) {
      // 如果添加了对于相同key
      if (oldEntry.status === DONE_STATUS) {
        // 已经添加过的entry已经完成
        process.nextTick(() => callback(oldEntry.error, oldEntry.result));
      } else {
        // 表示当前还未执行完毕
        oldEntry.callbacks.push(callback);
      }
      return;
    }
    // 创建一个新的条目
    const newEntry = new AsyncQueueEntry(item, callback);
    // 加入记录中
    this._entries.set(key, newEntry);
    // 加入队列等待执行 入栈
    this._queued.enqueue(newEntry);
    // 如果当前Queue 没有在执行（false），那么添加后立马开启队列
    if (!this._willEnsureProcessing) {
      this._willEnsureProcessing = true;
      setImmediate(this._ensureProcessing);
    }
  }

  // 处理queue
  _ensureProcessing = () => {
    // 如果当前活跃的个数 < 并发数
    while (this._activeTask < this._parallelism) {
      // 取出栈中顶部任务
      const entry = this._queued.dequeue();
      // 已经不存在任务 退出while
      if (!entry) {
        break;
      }
      this._activeTask++; // 增加活跃任务数量
      entry.status = PROCESS_STATUE;
      this._startProcess(entry);
    }
    this._willEnsureProcessing = false;
  };
  // 执行任务
  _startProcess(entry) {
    this._processor(entry.item, (error, result) => {
      this._handleResult(entry, error, result);
    });
  }

  // 处理结果
  _handleResult(entry, error, result) {
    entry.status = DONE_STATUS;
    entry.result = result;
    entry.error = error;
    entry.callback(error, result);
    entry.callbacks.forEach((fn) => fn(error, result));
    this._activeTask--;
    if (!this._willEnsureProcessing) {
      this._willEnsureProcessing = true;
      setImmediate(this._ensureProcessing);
    }
  }
}

module.exports = AsyncQueue;
