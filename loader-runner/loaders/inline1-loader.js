function loader(source) {
  console.log('inline1: normal', source);
  return source + '//inline1';
}

loader.pitch = function () {
  console.log('inline1 pitch');
};

module.exports = loader;
