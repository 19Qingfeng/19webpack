// loader运行函数
/* 
  loader本质就是一个函数,它接受上一个loader产生的结果(resource file)作为入参，同时支持多个loader组成对应的loader chain。

  webpack中的compiler(compilation)对象需要得到最后一个loader处理后的结果，这个结果应该是string或者buffer(Buffer最终也将会被转为string)。

  webpack中通过compilation对象进行模块编译时，会首先进行匹配loader处理文件得到结果(string/buffer),之后才会输出给webpack进行编译。

  loader的功能非常单一: 
*/
