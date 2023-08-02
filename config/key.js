if (process.env.NODE_ENV === 'development') {
    module.exports = require('./prod');
  } else {
    module.exports = require('./dev');
  }
