function loader2(sourceCode) {
  console.log('join loader2');
  debugger;
  return sourceCode + `\n const loader2 = '19Qingfeng'`;
}

module.exports = loader2;
