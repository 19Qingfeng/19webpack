class ArrayQueue {
  constructor() {
    this._list = [];
  }

  // 入队
  enqueue(item) {
    this._list.push(item);
  }

  // 出队
  dequeue() {
    return this._list.shift();
  }
}

module.exports = ArrayQueue;
