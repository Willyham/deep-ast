'use strict';
var fs = require('fs');
var test = require('tape');
var esprima = require('esprima');
var resolve = require('resolve');

var deepAST = require('../index');

function loadAndParse(path) {
  return esprima.parse(fs.readFileSync(path));
}

var paths = {
  'a': 'test/examples/nested/a.js',
  'b': 'test/examples/b.js',
  'root': 'test/examples/root.js'
};

var ASTs = Object.keys(paths).reduce(function parsePath(memo, key) {
  memo[key] = loadAndParse(paths[key]);
  return memo;
}, {});

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
  t.deepEqual(ASTs.b, deepAST(paths.b));
  t.end();
});

test('The tree of "a" required from "root" should be the same tree required from "a"', function assert(t) {
  var ast = deepAST(paths.root);
  var aBody = ast.body[1].declarations[0].init;
  t.deepEqual(deepAST(paths.a), aBody);
  t.end();
});

test('The tree of "a" should include the tree of xtend when 3rd party modules are included', function assert(t) {
  var ast = deepAST(paths.a, {
    includeExternalDependencies: true
  });
  var xtendBody = ast.body[2].declarations[0].init;
  t.deepEqual(deepAST(resolve.sync('xtend')), xtendBody);
  t.end();
});

test('The tree of "a" should not include xtend when 3rd party modules are not included', function assert(t) {
  var ast = deepAST(paths.a);
  var xtendBody = ast.body[2].declarations[0].init;
  t.notDeepEqual(deepAST(resolve.sync('xtend')), xtendBody);
  t.end();
});
