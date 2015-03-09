'use strict';

var test = require('tape');

var deepAST = require('../index');

test('It should export a function', function assert(t) {
  t.equal(typeof deepAST, 'function');
  t.end();
});
