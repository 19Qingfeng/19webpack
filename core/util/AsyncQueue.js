const AsyncQueue = require('./asyncQueue/index');

const queue = new AsyncQueue({
  name: 'buildModule',
  parallelism: 2,
  processor,
  getKey,
});

function processor(item, callback) {
  setTimeout(() => {
    // console.log(item, 'processor 处理前 item');
    item.age = '20';
    // console.log(item, '处理后的 item');
    callback(null, item);
  }, 2000);
}

// 返回queue中的每一个唯一标示属性
function getKey(item) {
  return item.key;
}

const startTime = Date.now();

queue.add({ key: 'item1', name: '19Qingfeng' }, (err, result) => {
  console.log('item1处理后的结果', result);
  console.log(Date.now() - startTime);
});

queue.add({ key: 'item2', name: '19Qingfeng' }, (err, result) => {
  console.log('item2处理后的结果');
  console.log(Date.now() - startTime);
});

queue.add({ key: 'item3', name: '19Qingfeng' }, (err, result) => {
  console.log('item3处理后的结果');
  console.log(Date.now() - startTime);
});

queue.add({ key: 'item1', name: '19Qingfeng' }, (err, result) => {
  console.log('重复的item1处理后的结果', result);
  console.log(Date.now() - startTime);
});
