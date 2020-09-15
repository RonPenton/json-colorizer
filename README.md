# json-chalker
A library for colorizing JSON strings, based on [json-colorizer](https://www.npmjs.com/package/json-colorizer).

This package is a simple console syntax highlighter for JSON.

## Installation
`npm install --save json-chalker`

## Usage

```js
const { colorize } = require('json-chalker');
console.log(colorize({ "foo": "bar" }));
```

## Specifying colors

You can specify a color to use for coloring individual tokens by providing a `colors` object in the options object. This should map token types to the names of color functions (see the [chalk styles reference](https://www.npmjs.com/package/chalk#styles)).

A color can also be specified as a hex value starting with the `#` symbol.

```js
const { colorize } = require('json-chalker');
console.log(colorize({ "foo": "bar" }, {
  colors: {
    STRING_KEY: 'green',
    STRING_LITERAL: 'magenta.bold',
    NUMBER_LITERAL: '#FF0000'
  }
}));
```

The tokens available are:

* `BRACE`
* `BRACKET`
* `COLON`
* `COMMA`
* `STRING_KEY`
* `STRING_LITERAL`
* `NUMBER_LITERAL`
* `BOOLEAN_LITERAL`
* `NULL_LITERAL`

## Custom formatting

You may specify custom formatting like this:

```js
const { colorize } = require('json-chalker');
console.log(colorize({ "foo": "I'm blue", "bar": "I'm red" }, {
  colors: {
    CUSTOM: (key, value, parent) => {
        if(key == "foo") return 'blue';
        if(value == "I'm red") return 'red';
    }
  }
}));
