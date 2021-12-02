const sass = require('sass');

function sassLoader(source) {
  const callback = this.async();
  sass.render({ data: source }, (err, result) => {
    if (err) {
      throw err;
    }
    callback(null, result.css);
  });
}

module.exports = sassLoader;
