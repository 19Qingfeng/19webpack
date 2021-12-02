// 这里要看原本的代码 先normal阶段checked一下
function styleLoader(source) {
  const script = `
    const styleEl = document.createElement('style')
    styleEl.innerHTML = ${JSON.stringify(source)}
    document.head.appendChild(styleEl)
  `;
  return script;
}
/* 
  原本的style-loader是在pitch阶段处理的逻辑
  这是因为：
  css-loader处理后的内容 normal阶段返回的是一个JS脚本

  如果style-loader中仍然使用normal 那么normal阶段接受的参数就一个JS脚本
  style-loader中需要执行css-loader返回的js脚本才能得到对应的css内容
  比如: css-loader返回 "xxxx .... module.exports = {...}" 的字符串
  这样我们在style-loader的normal阶段需要做很多边界兼容处理才能得到对应的css内容

  但是如果在pitch阶段就不同了
  
  如果是pitch阶段 

  1. 首先在style-loader的pitch阶段处理对应引入资源，以行内loader的形式拼接剩余未处理的loader以及对应的资源(通过require语句调用)，并且返回一段js脚本。
  2. 此时在style-loader的pitch阶段执行完毕存在返回值，loader发生熔断直接返回style-loader处理后的js脚本给webpack编译。
  3. webpack编译style-loader pitch阶段返回的js脚本，发现存在require(import)语句的依赖，此时会递归处理依赖(通过loader处理->在通过webpack编译该模块)。
  4. 因为我们在style-loader的require语句中处理成为了行内loader，拼接了之前没有处理的loader内容，(注意同时通过"！！"行内loader仅使用inline-loader的语法)，webpack会直接调用匹配的行内loader处理后交给webpack编译，也就是style-loader pitch阶段返回的脚本中的require语句会被webpack执行(这也就解决了之前需要在normal阶段处理js脚本的难题)，得到css-loader的module.exports的值(在style-loader pitch中的require语句中)。
  5. 此时style-loader pitch阶段不费吹灰之力得到了css-loader导出的值(字符串或者其他类型，从而方便进行自己的操作)，最终得到结果。

  也就是
  + require('index.css') 此时style-loader pitch 处理后，返回了一段js脚本，webpack会将这段脚本编译称为一个module，我们成为A。
  + A中因为style-loader pitch阶段又重新拼接了一个require(!!remainingRequest)语句，此时webpack递归处理依赖。
  + !!remainingRequest，因为使用了"!!"的语句，所以仅仅会执行对应的inline-loader编译，loader编译后再webpack编译再次编译成为另一个module，这个module的内容就是css-loader处理后的js脚本，A模块中的require(!!remainingRequest)也就返回了css-loader中的module.exports内容。省去了style-loader 在normal的处理JS脚本的工作，通过pitch交给了webpack编译。
  + 最终大功告成，当我们require('index.css')，首先会进入模块A，模块A中又引入了css-loader编译后的内容模块B。完美解决了我们的问题。
*/

module.exports = styleLoader;
