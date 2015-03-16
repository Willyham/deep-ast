'use strict';
var fs = require('fs');
var test = require('tape');
var esprima = require('esprima');
var deepAST = require('../index');

function loadAndParse(path) {
  return esprima.parse(fs.readFileSync(path));
}

var ASTs = {
  'a': loadAndParse('test/examples/nested/a.js'),
  'b': loadAndParse('test/examples/b.js'),
  'root': loadAndParse('test/examples/root.js')
};

test('It should export a function', function assert(t) {
  t.equal(typeof deepAST, 'function');
  t.end();
});

test('It should throw return an error when there is no file', function assert(t) {
  t.ok(deepAST('dontpanic') instanceof Error);
  t.end();
});

test('It should throw return an error when the JS is invalid', function assert(t) {
  t.ok(deepAST('test/examples/invalid.js') instanceof Error);
  t.end();
});

test('It should load a file without the js extension', function assert(t) {
  t.deepEqual(ASTs.b, deepAST('test/examples/b'));
  t.end();
});

test('It should return the esprima AST when there are no requires', function assert(t) {
  t.deepEqual(ASTs.b, deepAST('test/examples/b.js'));
  t.end();
});
