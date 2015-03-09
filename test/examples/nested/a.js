'use strict';

// Cover '..' and '/.js'
var b = require('../b.js');

// Cover third party modules
var esprima = require('esprima');

module.exports = function a() {
  return esprima.parse(b.toString());
};
