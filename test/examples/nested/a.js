'use strict';

// Cover '..' and '/.js'
var b = require('../b.js');

// Cover third party modules
var extend = require('xtend');

module.exports = function a() {
  return extend({}, {b: b});
};
