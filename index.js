var fs = require('fs');
var path = require('path');

var clone  = require('clone');
var extend = require("xtend");
var esprima = require('esprima');
var traverse = require('traverse');

var defaults = {
  includeExternalDependencies: false
};

/**
 * Get a 'deep' AST where require statements are replace with their respective ASTs
 * @param {String} filename The root file to parse
 * @param {Object} options
 * @returns {Object|Error}
 */
module.exports = function getDeepAST(filename, options) {
  options = options || {};
  options = extend(clone(defaults), options);
  try {
    if(!path.extname(filename)){
      filename += '.js';
    }
    var content = fs.readFileSync(filename, 'utf-8');
    var ast = esprima.parse(content);
    return replaceRequires(ast, options);
  }
  catch (ex){
    return ex;
  }
};

/**
 * Replace requires in the AST with the respective ASTs loaded from that file
 * @param {Object} ast An esprima AST
 * @param {Object} options
 * @returns {Object} A new AST
 */
function replaceRequires(ast, options) {
  return traverse(ast).forEach(function(node) {
    if (options.includeExternalDependencies && isRequireStatement(node)) {
      return this.update(getDeepAST(getRequirePath(node), options));
    }
    if (isRelativeRequire(node)) {
      return this.update(getDeepAST(getRequirePath(node), options));
    }
  });
}

/**
 * Check whether a node is a require statement with a relative path
 * @param {Object} node AST node
 * @returns {Boolean} True if relative require, false otherwise
 */
function isRelativeRequire(node) {
  return Boolean(isRequireStatement(node) && isRelativePath(getRequirePath(node)));
}

/**
 * Get the require path from a require statement
 * @param {Object} node AST node
 * @returns {String} The path from the require statement
 */
function getRequirePath(node) {
  return node.arguments[0].value;
}

/**
 * Check whether a node is a require statement
 * @param {Object} node AST node
 * @returns {boolean}
 */
function isRequireStatement(node) {
  return Boolean(node && node.type === 'CallExpression' && node.callee.name === 'require');
}

/**
 * Test whether a path is a relative or not.
 * @param {String} path The path
 * @returns {boolean} True if it starts with './' or '../'. False otherwise
 */
function isRelativePath(path) {
  var relativeIndex = path.indexOf('./');
  return Boolean(relativeIndex === 0 || relativeIndex === 1);
}
