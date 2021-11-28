function loader(source) {
  console.log('inline2: normal', source);
  return source + '//inline2';
}

loader.pitch = function () {
  console.log('inline2 pitch');
};

module.exports = loader;
