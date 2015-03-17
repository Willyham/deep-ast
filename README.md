# deep-ast [![Travis branch](https://img.shields.io/travis/Willyham/deep-ast.svg)]()

Get an AST with require statements resolved into respective ASTs

NOTE: This module uses synchronous I/O and should not be used at request time in a service.

## API

```ocaml
readFile : (
  filename: String,
  options?: {
    includeExternalDependencies?: Boolean(true)
  }
) => Object
```

Passing `includeExternalDependencies` will cause the ASTs of 3rd party modules to also be parsed. Note that this
is a recursive algorithm, so the dependencies of each depdendency will also be parsed. As a warning, setting this flag
to true can produce extremely large ASTs.

## Usage

var deepAST = require('deep-ast');
var AST = deepAST('./myModule.js');

## Examples

Take the file structure where module 'a' requires module 'b' like so:

b.js:

```javascript
module.exports = 'panic';
```

a.js:

```javascript
var b = require('./b');
module.exports = 'dont';
```

The ASTs of these two modules (generated by esprima would be):

b.js:

```json
{
  "type": "Program",
  "body": [{
    "type": "ExpressionStatement",
    "expression": {
      "type": "AssignmentExpression",
      "operator": "=",
      "left": {
        "type": "MemberExpression",
        "computed": false,
        "object": {
          "type": "Identifier",
          "name": "module"
        },
        "property": {
          "type": "Identifier",
          "name": "exports"
        }
      },
      "right": {
        "type": "Literal",
        "value": "panic",
        "raw": "'panic'"
      }
    }
  }]
}
```

a.js:

```json
{
  "type": "Program",
  "body": [{
    "type": "VariableDeclaration",
    "declarations": [{
      "type": "VariableDeclarator",
      "id": {
        "type": "Identifier",
        "name": "b"
      },
      "init": {
        "type": "CallExpression",
        "callee": {
          "type": "Identifier",
          "name": "require"
        },
        "arguments": [{
            "type": "Literal",
            "value": "./b",
            "raw": "'./b'"
        }]
      }
    }],
    "kind": "var"
  },
  {
    "type": "ExpressionStatement",
    "expression": {
      "type": "AssignmentExpression",
      "operator": "=",
      "left": {
        "type": "MemberExpression",
        "computed": false,
        "object": {
          "type": "Identifier",
          "name": "module"
        },
        "property": {
          "type": "Identifier",
          "name": "exports"
        }
      },
      "right": {
        "type": "Literal",
        "value": "dont",
        "raw": "'dont'"
      }
    }
  }]
}
```

Running `deep-ast` on `a.js` will result in the require statement for 'b' being replaced with the syntax tree which is
generated from running 'b' through `deep-ast`. Or:

`deep-ast of a (b) === deep-ast of b`

Like so:

```json
{
  "type": "Program",
  "body": [{
    "type": "VariableDeclaration",
    "declarations": [{
      "type": "VariableDeclarator",
      "id": {"type": "Identifier", name: "b"},
      "init": {
        "type": "Program",
        "body": [{
          "type": "ExpressionStatement",
          "expression": {
            "type": "AssignmentExpression",
            "operator": "=",
            "left": {
              "type": "MemberExpression",
              "computed": false,
              "object": {"type": "Identifier", "name": "module"},
              "property": {"type": "Identifier", "name": "exports"}
            },
            "right": {"type": "Literal", "value": "panic", "raw": "panic"}
          }
        }]
      }
    }],
    "kind": "var"
  },
  {
    "type": "ExpressionStatement",
    "expression": {
      "type": "AssignmentExpression",
      "operator": "=",
      "left": {
        "type": "MemberExpression",
        "computed": false,
        "object": {"type": "Identifier", "name": "module"},
        "property": {"type": "Identifier", "name": "exports"}
      },
      "right": {"type": "Literal", "value": "dont", "raw": "dont"}
    }
  }]
}
```
