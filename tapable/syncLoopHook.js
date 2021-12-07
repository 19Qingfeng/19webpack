const { SyncLoopHook, AsyncParallelBailHook } = require('tapable');

const syncLoopHook = new SyncLoopHook(['arg1', 'arg2']);

const aAsyncParallelBailHook = new AsyncParallelBailHook();
aAsyncParallelBailHo;

let flag1 = 2;
let flag2 = 1;
let flag3 = 0;
/* 
  flag1 =2  执行一次flag1函数  打印flag1
  flag1=3 执行一次flag1函数 返回 undefined 进行下一次 打印flag1
 
  flag2=1 执行一次2 此时flag变成2 重新执行  打印 2
    flag1 重新执行1 打印1 返回undefined 
    flag2 此时flag=2 打印2 此时flag变成为3 返回falg2
  
  再次重新执行 1 
             2 返回undefined

  1

  2
*/

syncLoopHook.tap('flag 1', (name, nickname) => {
  console.log('flag 1', name, nickname);
  if (flag1 === 3) {
    return;
  }
  flag1++;
  return 'flag1';
});

syncLoopHook.tap('flag 2', (name, nickname) => {
  console.log('flag 2', name, nickname);
  if (flag2 === 3) {
    return;
  }
  flag2++;
  return 'flag2';
});

syncLoopHook.tap('flag 3', (name, nickname) => {
  console.log('flag 3:', name, nickname);
  if (flag3 !== 3) {
    return;
  }
  flag3++;
  return 'flag3';
});

syncLoopHook.call('wang', '19Qingfeng');
