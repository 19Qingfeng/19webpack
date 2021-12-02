const mime = require('mime');

/**
 * urlLoader是基于fileLoader进行实现的
 * 当文件大小超过limit限制 使用file-loader处理
 * 当文件大小小于limit限制 使用url-loader将文件转化为base64格式内嵌
 */
function urlLoader(source) {
  const options = this.getOptions() || {};
  let limit = options.limit || 1024;
  const fallback = options.fallback;
  limit && (limit = parseInt(limit, 10));
  if (limit && source.length < limit) {
    // 获取文件类型
    const fileType = mime.getType(this.resourcePath);
    // 拼接base64
    const base64str = `data:${fileType};base64,${source.toString('base64')}`;
    return `module.exports = ${JSON.stringify(base64str)}`;
  } else {
    // 没有设置limit 或者limit < source.length 资源超出大小
    // 拿到备用loader函数
    const fallbackLoader = require(fallback);
    return fallbackLoader.call(this, source);
  }
}

urlLoader.raw = true;

module.exports = urlLoader;
