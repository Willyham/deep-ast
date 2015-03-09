'use strict';

var a = require('./nested/a');

module.exports = function root() {
  return a;
};
