function loader(source) {
  console.log('normal2: normal', source);
  return source + '//normal2';
}

loader.pitch = function () {
  console.log('normal2 pitch');
};

module.exports = loader;
