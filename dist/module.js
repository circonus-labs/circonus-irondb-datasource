define(["@grafana/data","app/core/app_events","app/plugins/sdk","lodash"], function(__WEBPACK_EXTERNAL_MODULE__grafana_data__, __WEBPACK_EXTERNAL_MODULE_grafana_app_core_app_events__, __WEBPACK_EXTERNAL_MODULE_grafana_app_plugins_sdk__, __WEBPACK_EXTERNAL_MODULE_lodash__) { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./module.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../node_modules/braces/index.js":
/*!***************************************!*\
  !*** ../node_modules/braces/index.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const stringify = __webpack_require__(/*! ./lib/stringify */ "../node_modules/braces/lib/stringify.js");
const compile = __webpack_require__(/*! ./lib/compile */ "../node_modules/braces/lib/compile.js");
const expand = __webpack_require__(/*! ./lib/expand */ "../node_modules/braces/lib/expand.js");
const parse = __webpack_require__(/*! ./lib/parse */ "../node_modules/braces/lib/parse.js");

/**
 * Expand the given pattern or create a regex-compatible string.
 *
 * ```js
 * const braces = require('braces');
 * console.log(braces('{a,b,c}', { compile: true })); //=> ['(a|b|c)']
 * console.log(braces('{a,b,c}')); //=> ['a', 'b', 'c']
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

const braces = (input, options = {}) => {
  let output = [];

  if (Array.isArray(input)) {
    for (let pattern of input) {
      let result = braces.create(pattern, options);
      if (Array.isArray(result)) {
        output.push(...result);
      } else {
        output.push(result);
      }
    }
  } else {
    output = [].concat(braces.create(input, options));
  }

  if (options && options.expand === true && options.nodupes === true) {
    output = [...new Set(output)];
  }
  return output;
};

/**
 * Parse the given `str` with the given `options`.
 *
 * ```js
 * // braces.parse(pattern, [, options]);
 * const ast = braces.parse('a/{b,c}/d');
 * console.log(ast);
 * ```
 * @param {String} pattern Brace pattern to parse
 * @param {Object} options
 * @return {Object} Returns an AST
 * @api public
 */

braces.parse = (input, options = {}) => parse(input, options);

/**
 * Creates a braces string from an AST, or an AST node.
 *
 * ```js
 * const braces = require('braces');
 * let ast = braces.parse('foo/{a,b}/bar');
 * console.log(stringify(ast.nodes[2])); //=> '{a,b}'
 * ```
 * @param {String} `input` Brace pattern or AST.
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */

braces.stringify = (input, options = {}) => {
  if (typeof input === 'string') {
    return stringify(braces.parse(input, options), options);
  }
  return stringify(input, options);
};

/**
 * Compiles a brace pattern into a regex-compatible, optimized string.
 * This method is called by the main [braces](#braces) function by default.
 *
 * ```js
 * const braces = require('braces');
 * console.log(braces.compile('a/{b,c}/d'));
 * //=> ['a/(b|c)/d']
 * ```
 * @param {String} `input` Brace pattern or AST.
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */

braces.compile = (input, options = {}) => {
  if (typeof input === 'string') {
    input = braces.parse(input, options);
  }
  return compile(input, options);
};

/**
 * Expands a brace pattern into an array. This method is called by the
 * main [braces](#braces) function when `options.expand` is true. Before
 * using this method it's recommended that you read the [performance notes](#performance))
 * and advantages of using [.compile](#compile) instead.
 *
 * ```js
 * const braces = require('braces');
 * console.log(braces.expand('a/{b,c}/d'));
 * //=> ['a/b/d', 'a/c/d'];
 * ```
 * @param {String} `pattern` Brace pattern
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */

braces.expand = (input, options = {}) => {
  if (typeof input === 'string') {
    input = braces.parse(input, options);
  }

  let result = expand(input, options);

  // filter out empty strings if specified
  if (options.noempty === true) {
    result = result.filter(Boolean);
  }

  // filter out duplicates if specified
  if (options.nodupes === true) {
    result = [...new Set(result)];
  }

  return result;
};

/**
 * Processes a brace pattern and returns either an expanded array
 * (if `options.expand` is true), a highly optimized regex-compatible string.
 * This method is called by the main [braces](#braces) function.
 *
 * ```js
 * const braces = require('braces');
 * console.log(braces.create('user-{200..300}/project-{a,b,c}-{1..10}'))
 * //=> 'user-(20[0-9]|2[1-9][0-9]|300)/project-(a|b|c)-([1-9]|10)'
 * ```
 * @param {String} `pattern` Brace pattern
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */

braces.create = (input, options = {}) => {
  if (input === '' || input.length < 3) {
    return [input];
  }

 return options.expand !== true
    ? braces.compile(input, options)
    : braces.expand(input, options);
};

/**
 * Expose "braces"
 */

module.exports = braces;


/***/ }),

/***/ "../node_modules/braces/lib/compile.js":
/*!*********************************************!*\
  !*** ../node_modules/braces/lib/compile.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const fill = __webpack_require__(/*! fill-range */ "../node_modules/fill-range/index.js");
const utils = __webpack_require__(/*! ./utils */ "../node_modules/braces/lib/utils.js");

const compile = (ast, options = {}) => {
  let walk = (node, parent = {}) => {
    let invalidBlock = utils.isInvalidBrace(parent);
    let invalidNode = node.invalid === true && options.escapeInvalid === true;
    let invalid = invalidBlock === true || invalidNode === true;
    let prefix = options.escapeInvalid === true ? '\\' : '';
    let output = '';

    if (node.isOpen === true) {
      return prefix + node.value;
    }
    if (node.isClose === true) {
      return prefix + node.value;
    }

    if (node.type === 'open') {
      return invalid ? (prefix + node.value) : '(';
    }

    if (node.type === 'close') {
      return invalid ? (prefix + node.value) : ')';
    }

    if (node.type === 'comma') {
      return node.prev.type === 'comma' ? '' : (invalid ? node.value : '|');
    }

    if (node.value) {
      return node.value;
    }

    if (node.nodes && node.ranges > 0) {
      let args = utils.reduce(node.nodes);
      let range = fill(...args, { ...options, wrap: false, toRegex: true });

      if (range.length !== 0) {
        return args.length > 1 && range.length > 1 ? `(${range})` : range;
      }
    }

    if (node.nodes) {
      for (let child of node.nodes) {
        output += walk(child, node);
      }
    }
    return output;
  };

  return walk(ast);
};

module.exports = compile;


/***/ }),

/***/ "../node_modules/braces/lib/constants.js":
/*!***********************************************!*\
  !*** ../node_modules/braces/lib/constants.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  MAX_LENGTH: 1024 * 64,

  // Digits
  CHAR_0: '0', /* 0 */
  CHAR_9: '9', /* 9 */

  // Alphabet chars.
  CHAR_UPPERCASE_A: 'A', /* A */
  CHAR_LOWERCASE_A: 'a', /* a */
  CHAR_UPPERCASE_Z: 'Z', /* Z */
  CHAR_LOWERCASE_Z: 'z', /* z */

  CHAR_LEFT_PARENTHESES: '(', /* ( */
  CHAR_RIGHT_PARENTHESES: ')', /* ) */

  CHAR_ASTERISK: '*', /* * */

  // Non-alphabetic chars.
  CHAR_AMPERSAND: '&', /* & */
  CHAR_AT: '@', /* @ */
  CHAR_BACKSLASH: '\\', /* \ */
  CHAR_BACKTICK: '`', /* ` */
  CHAR_CARRIAGE_RETURN: '\r', /* \r */
  CHAR_CIRCUMFLEX_ACCENT: '^', /* ^ */
  CHAR_COLON: ':', /* : */
  CHAR_COMMA: ',', /* , */
  CHAR_DOLLAR: '$', /* . */
  CHAR_DOT: '.', /* . */
  CHAR_DOUBLE_QUOTE: '"', /* " */
  CHAR_EQUAL: '=', /* = */
  CHAR_EXCLAMATION_MARK: '!', /* ! */
  CHAR_FORM_FEED: '\f', /* \f */
  CHAR_FORWARD_SLASH: '/', /* / */
  CHAR_HASH: '#', /* # */
  CHAR_HYPHEN_MINUS: '-', /* - */
  CHAR_LEFT_ANGLE_BRACKET: '<', /* < */
  CHAR_LEFT_CURLY_BRACE: '{', /* { */
  CHAR_LEFT_SQUARE_BRACKET: '[', /* [ */
  CHAR_LINE_FEED: '\n', /* \n */
  CHAR_NO_BREAK_SPACE: '\u00A0', /* \u00A0 */
  CHAR_PERCENT: '%', /* % */
  CHAR_PLUS: '+', /* + */
  CHAR_QUESTION_MARK: '?', /* ? */
  CHAR_RIGHT_ANGLE_BRACKET: '>', /* > */
  CHAR_RIGHT_CURLY_BRACE: '}', /* } */
  CHAR_RIGHT_SQUARE_BRACKET: ']', /* ] */
  CHAR_SEMICOLON: ';', /* ; */
  CHAR_SINGLE_QUOTE: '\'', /* ' */
  CHAR_SPACE: ' ', /*   */
  CHAR_TAB: '\t', /* \t */
  CHAR_UNDERSCORE: '_', /* _ */
  CHAR_VERTICAL_LINE: '|', /* | */
  CHAR_ZERO_WIDTH_NOBREAK_SPACE: '\uFEFF' /* \uFEFF */
};


/***/ }),

/***/ "../node_modules/braces/lib/expand.js":
/*!********************************************!*\
  !*** ../node_modules/braces/lib/expand.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const fill = __webpack_require__(/*! fill-range */ "../node_modules/fill-range/index.js");
const stringify = __webpack_require__(/*! ./stringify */ "../node_modules/braces/lib/stringify.js");
const utils = __webpack_require__(/*! ./utils */ "../node_modules/braces/lib/utils.js");

const append = (queue = '', stash = '', enclose = false) => {
  let result = [];

  queue = [].concat(queue);
  stash = [].concat(stash);

  if (!stash.length) return queue;
  if (!queue.length) {
    return enclose ? utils.flatten(stash).map(ele => `{${ele}}`) : stash;
  }

  for (let item of queue) {
    if (Array.isArray(item)) {
      for (let value of item) {
        result.push(append(value, stash, enclose));
      }
    } else {
      for (let ele of stash) {
        if (enclose === true && typeof ele === 'string') ele = `{${ele}}`;
        result.push(Array.isArray(ele) ? append(item, ele, enclose) : (item + ele));
      }
    }
  }
  return utils.flatten(result);
};

const expand = (ast, options = {}) => {
  let rangeLimit = options.rangeLimit === void 0 ? 1000 : options.rangeLimit;

  let walk = (node, parent = {}) => {
    node.queue = [];

    let p = parent;
    let q = parent.queue;

    while (p.type !== 'brace' && p.type !== 'root' && p.parent) {
      p = p.parent;
      q = p.queue;
    }

    if (node.invalid || node.dollar) {
      q.push(append(q.pop(), stringify(node, options)));
      return;
    }

    if (node.type === 'brace' && node.invalid !== true && node.nodes.length === 2) {
      q.push(append(q.pop(), ['{}']));
      return;
    }

    if (node.nodes && node.ranges > 0) {
      let args = utils.reduce(node.nodes);

      if (utils.exceedsLimit(...args, options.step, rangeLimit)) {
        throw new RangeError('expanded array length exceeds range limit. Use options.rangeLimit to increase or disable the limit.');
      }

      let range = fill(...args, options);
      if (range.length === 0) {
        range = stringify(node, options);
      }

      q.push(append(q.pop(), range));
      node.nodes = [];
      return;
    }

    let enclose = utils.encloseBrace(node);
    let queue = node.queue;
    let block = node;

    while (block.type !== 'brace' && block.type !== 'root' && block.parent) {
      block = block.parent;
      queue = block.queue;
    }

    for (let i = 0; i < node.nodes.length; i++) {
      let child = node.nodes[i];

      if (child.type === 'comma' && node.type === 'brace') {
        if (i === 1) queue.push('');
        queue.push('');
        continue;
      }

      if (child.type === 'close') {
        q.push(append(q.pop(), queue, enclose));
        continue;
      }

      if (child.value && child.type !== 'open') {
        queue.push(append(queue.pop(), child.value));
        continue;
      }

      if (child.nodes) {
        walk(child, node);
      }
    }

    return queue;
  };

  return utils.flatten(walk(ast));
};

module.exports = expand;


/***/ }),

/***/ "../node_modules/braces/lib/parse.js":
/*!*******************************************!*\
  !*** ../node_modules/braces/lib/parse.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const stringify = __webpack_require__(/*! ./stringify */ "../node_modules/braces/lib/stringify.js");

/**
 * Constants
 */

const {
  MAX_LENGTH,
  CHAR_BACKSLASH, /* \ */
  CHAR_BACKTICK, /* ` */
  CHAR_COMMA, /* , */
  CHAR_DOT, /* . */
  CHAR_LEFT_PARENTHESES, /* ( */
  CHAR_RIGHT_PARENTHESES, /* ) */
  CHAR_LEFT_CURLY_BRACE, /* { */
  CHAR_RIGHT_CURLY_BRACE, /* } */
  CHAR_LEFT_SQUARE_BRACKET, /* [ */
  CHAR_RIGHT_SQUARE_BRACKET, /* ] */
  CHAR_DOUBLE_QUOTE, /* " */
  CHAR_SINGLE_QUOTE, /* ' */
  CHAR_NO_BREAK_SPACE,
  CHAR_ZERO_WIDTH_NOBREAK_SPACE
} = __webpack_require__(/*! ./constants */ "../node_modules/braces/lib/constants.js");

/**
 * parse
 */

const parse = (input, options = {}) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string');
  }

  let opts = options || {};
  let max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
  if (input.length > max) {
    throw new SyntaxError(`Input length (${input.length}), exceeds max characters (${max})`);
  }

  let ast = { type: 'root', input, nodes: [] };
  let stack = [ast];
  let block = ast;
  let prev = ast;
  let brackets = 0;
  let length = input.length;
  let index = 0;
  let depth = 0;
  let value;
  let memo = {};

  /**
   * Helpers
   */

  const advance = () => input[index++];
  const push = node => {
    if (node.type === 'text' && prev.type === 'dot') {
      prev.type = 'text';
    }

    if (prev && prev.type === 'text' && node.type === 'text') {
      prev.value += node.value;
      return;
    }

    block.nodes.push(node);
    node.parent = block;
    node.prev = prev;
    prev = node;
    return node;
  };

  push({ type: 'bos' });

  while (index < length) {
    block = stack[stack.length - 1];
    value = advance();

    /**
     * Invalid chars
     */

    if (value === CHAR_ZERO_WIDTH_NOBREAK_SPACE || value === CHAR_NO_BREAK_SPACE) {
      continue;
    }

    /**
     * Escaped chars
     */

    if (value === CHAR_BACKSLASH) {
      push({ type: 'text', value: (options.keepEscaping ? value : '') + advance() });
      continue;
    }

    /**
     * Right square bracket (literal): ']'
     */

    if (value === CHAR_RIGHT_SQUARE_BRACKET) {
      push({ type: 'text', value: '\\' + value });
      continue;
    }

    /**
     * Left square bracket: '['
     */

    if (value === CHAR_LEFT_SQUARE_BRACKET) {
      brackets++;

      let closed = true;
      let next;

      while (index < length && (next = advance())) {
        value += next;

        if (next === CHAR_LEFT_SQUARE_BRACKET) {
          brackets++;
          continue;
        }

        if (next === CHAR_BACKSLASH) {
          value += advance();
          continue;
        }

        if (next === CHAR_RIGHT_SQUARE_BRACKET) {
          brackets--;

          if (brackets === 0) {
            break;
          }
        }
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Parentheses
     */

    if (value === CHAR_LEFT_PARENTHESES) {
      block = push({ type: 'paren', nodes: [] });
      stack.push(block);
      push({ type: 'text', value });
      continue;
    }

    if (value === CHAR_RIGHT_PARENTHESES) {
      if (block.type !== 'paren') {
        push({ type: 'text', value });
        continue;
      }
      block = stack.pop();
      push({ type: 'text', value });
      block = stack[stack.length - 1];
      continue;
    }

    /**
     * Quotes: '|"|`
     */

    if (value === CHAR_DOUBLE_QUOTE || value === CHAR_SINGLE_QUOTE || value === CHAR_BACKTICK) {
      let open = value;
      let next;

      if (options.keepQuotes !== true) {
        value = '';
      }

      while (index < length && (next = advance())) {
        if (next === CHAR_BACKSLASH) {
          value += next + advance();
          continue;
        }

        if (next === open) {
          if (options.keepQuotes === true) value += next;
          break;
        }

        value += next;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Left curly brace: '{'
     */

    if (value === CHAR_LEFT_CURLY_BRACE) {
      depth++;

      let dollar = prev.value && prev.value.slice(-1) === '$' || block.dollar === true;
      let brace = {
        type: 'brace',
        open: true,
        close: false,
        dollar,
        depth,
        commas: 0,
        ranges: 0,
        nodes: []
      };

      block = push(brace);
      stack.push(block);
      push({ type: 'open', value });
      continue;
    }

    /**
     * Right curly brace: '}'
     */

    if (value === CHAR_RIGHT_CURLY_BRACE) {
      if (block.type !== 'brace') {
        push({ type: 'text', value });
        continue;
      }

      let type = 'close';
      block = stack.pop();
      block.close = true;

      push({ type, value });
      depth--;

      block = stack[stack.length - 1];
      continue;
    }

    /**
     * Comma: ','
     */

    if (value === CHAR_COMMA && depth > 0) {
      if (block.ranges > 0) {
        block.ranges = 0;
        let open = block.nodes.shift();
        block.nodes = [open, { type: 'text', value: stringify(block) }];
      }

      push({ type: 'comma', value });
      block.commas++;
      continue;
    }

    /**
     * Dot: '.'
     */

    if (value === CHAR_DOT && depth > 0 && block.commas === 0) {
      let siblings = block.nodes;

      if (depth === 0 || siblings.length === 0) {
        push({ type: 'text', value });
        continue;
      }

      if (prev.type === 'dot') {
        block.range = [];
        prev.value += value;
        prev.type = 'range';

        if (block.nodes.length !== 3 && block.nodes.length !== 5) {
          block.invalid = true;
          block.ranges = 0;
          prev.type = 'text';
          continue;
        }

        block.ranges++;
        block.args = [];
        continue;
      }

      if (prev.type === 'range') {
        siblings.pop();

        let before = siblings[siblings.length - 1];
        before.value += prev.value + value;
        prev = before;
        block.ranges--;
        continue;
      }

      push({ type: 'dot', value });
      continue;
    }

    /**
     * Text
     */

    push({ type: 'text', value });
  }

  // Mark imbalanced braces and brackets as invalid
  do {
    block = stack.pop();

    if (block.type !== 'root') {
      block.nodes.forEach(node => {
        if (!node.nodes) {
          if (node.type === 'open') node.isOpen = true;
          if (node.type === 'close') node.isClose = true;
          if (!node.nodes) node.type = 'text';
          node.invalid = true;
        }
      });

      // get the location of the block on parent.nodes (block's siblings)
      let parent = stack[stack.length - 1];
      let index = parent.nodes.indexOf(block);
      // replace the (invalid) block with it's nodes
      parent.nodes.splice(index, 1, ...block.nodes);
    }
  } while (stack.length > 0);

  push({ type: 'eos' });
  return ast;
};

module.exports = parse;


/***/ }),

/***/ "../node_modules/braces/lib/stringify.js":
/*!***********************************************!*\
  !*** ../node_modules/braces/lib/stringify.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const utils = __webpack_require__(/*! ./utils */ "../node_modules/braces/lib/utils.js");

module.exports = (ast, options = {}) => {
  let stringify = (node, parent = {}) => {
    let invalidBlock = options.escapeInvalid && utils.isInvalidBrace(parent);
    let invalidNode = node.invalid === true && options.escapeInvalid === true;
    let output = '';

    if (node.value) {
      if ((invalidBlock || invalidNode) && utils.isOpenOrClose(node)) {
        return '\\' + node.value;
      }
      return node.value;
    }

    if (node.value) {
      return node.value;
    }

    if (node.nodes) {
      for (let child of node.nodes) {
        output += stringify(child);
      }
    }
    return output;
  };

  return stringify(ast);
};



/***/ }),

/***/ "../node_modules/braces/lib/utils.js":
/*!*******************************************!*\
  !*** ../node_modules/braces/lib/utils.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.isInteger = num => {
  if (typeof num === 'number') {
    return Number.isInteger(num);
  }
  if (typeof num === 'string' && num.trim() !== '') {
    return Number.isInteger(Number(num));
  }
  return false;
};

/**
 * Find a node of the given type
 */

exports.find = (node, type) => node.nodes.find(node => node.type === type);

/**
 * Find a node of the given type
 */

exports.exceedsLimit = (min, max, step = 1, limit) => {
  if (limit === false) return false;
  if (!exports.isInteger(min) || !exports.isInteger(max)) return false;
  return ((Number(max) - Number(min)) / Number(step)) >= limit;
};

/**
 * Escape the given node with '\\' before node.value
 */

exports.escapeNode = (block, n = 0, type) => {
  let node = block.nodes[n];
  if (!node) return;

  if ((type && node.type === type) || node.type === 'open' || node.type === 'close') {
    if (node.escaped !== true) {
      node.value = '\\' + node.value;
      node.escaped = true;
    }
  }
};

/**
 * Returns true if the given brace node should be enclosed in literal braces
 */

exports.encloseBrace = node => {
  if (node.type !== 'brace') return false;
  if ((node.commas >> 0 + node.ranges >> 0) === 0) {
    node.invalid = true;
    return true;
  }
  return false;
};

/**
 * Returns true if a brace node is invalid.
 */

exports.isInvalidBrace = block => {
  if (block.type !== 'brace') return false;
  if (block.invalid === true || block.dollar) return true;
  if ((block.commas >> 0 + block.ranges >> 0) === 0) {
    block.invalid = true;
    return true;
  }
  if (block.open !== true || block.close !== true) {
    block.invalid = true;
    return true;
  }
  return false;
};

/**
 * Returns true if a node is an open or close node
 */

exports.isOpenOrClose = node => {
  if (node.type === 'open' || node.type === 'close') {
    return true;
  }
  return node.open === true || node.close === true;
};

/**
 * Reduce an array of text nodes.
 */

exports.reduce = nodes => nodes.reduce((acc, node) => {
  if (node.type === 'text') acc.push(node.value);
  if (node.type === 'range') node.type = 'text';
  return acc;
}, []);

/**
 * Flatten an array
 */

exports.flatten = (...args) => {
  const result = [];
  const flat = arr => {
    for (let i = 0; i < arr.length; i++) {
      let ele = arr[i];
      Array.isArray(ele) ? flat(ele, result) : ele !== void 0 && result.push(ele);
    }
    return result;
  };
  flat(args);
  return result;
};


/***/ }),

/***/ "../node_modules/css-loader/dist/cjs.js?!../node_modules/postcss-loader/src/index.js?!../node_modules/sass-loader/dist/cjs.js!./css/query_editor.css":
/*!********************************************************************************************************************************************************************!*\
  !*** ../node_modules/css-loader/dist/cjs.js??ref--8-1!../node_modules/postcss-loader/src??ref--8-2!../node_modules/sass-loader/dist/cjs.js!./css/query_editor.css ***!
  \********************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "../node_modules/css-loader/dist/runtime/api.js");
exports = ___CSS_LOADER_API_IMPORT___(true);
// Module
exports.push([module.i, ".min-width-10 {\n  min-width: 10rem;\n}\n\n.min-width-12 {\n  min-width: 12rem;\n}\n\n.min-width-20 {\n  min-width: 20rem;\n}\n\n.gf-form-select-wrapper select.gf-form-input {\n  height: 2.64rem;\n}\n\n.gf-form-select-wrapper--caret-indent.gf-form-select-wrapper::after {\n  right: 0.775rem;\n}\n\n.ml-1 {\n  margin-left: 2px !important;\n}\n\n.join-r .gf-form-label {\n  margin-right: 0;\n}\n\n.join-l .gf-form-label {\n  border-left-width: 0;\n  border-radius: 0;\n}\n\n.mash-r .gf-form-label {\n  padding-right: 0;\n}\n\n.mash-l .gf-form-label {\n  padding-left: 0;\n}\n\n.irondb-tag-op .gf-form-label,\n.irondb-tag-end .gf-form-label {\n  color: #eb7b18;\n}\n\n.irondb-tag-cat .gf-form-label {\n  color: #598;\n}\n\n.irondb-tag-val .gf-form-label {\n  color: #5ca;\n}\n\n.irondb-tag-pair .gf-form-label,\n.irondb-tag-sep .gf-form-label {\n  color: #888;\n}\n\n.irondb-tag-op .gf-form-label:focus,\n.irondb-tag-op .gf-form-label:hover,\n.irondb-tag-cat .gf-form-label:focus,\n.irondb-tag-cat .gf-form-label:hover,\n.irondb-tag-val .gf-form-label:focus,\n.irondb-tag-val .gf-form-label:hover,\n.gf-form-label:focus .template-variable,\n.gf-form-label:hover .template-variable {\n  color: #fff;\n}\n\n/* menu item color changes */\n.irondb-tag-op .typeahead.dropdown-menu [data-value=REMOVE] a {\n  color: #bb002c !important;\n}\n\n.irondb-tag-val .typeahead.dropdown-menu [data-value^=\"$\"] a {\n  color: #33b5e5 !important;\n}\n\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"or(\"] a,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"not(\"] a,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"and(\"] a,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"or(\"] a,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"not(\"] a,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"and(\"] a {\n  color: #eb7b18 !important;\n}\n\n.irondb-tag-op .typeahead.dropdown-menu [data-value=REMOVE] a:focus,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=REMOVE] a:hover,\n.irondb-tag-val .typeahead.dropdown-menu [data-value^=\"$\"] a:focus,\n.irondb-tag-val .typeahead.dropdown-menu [data-value^=\"$\"] a:hover,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"or(\"] a:focus,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"or(\"] a:hover,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"not(\"] a:focus,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"not(\"] a:hover,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"and(\"] a:focus,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"and(\"] a:hover,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"or(\"] a:focus,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"or(\"] a:hover,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"not(\"] a:focus,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"not(\"] a:hover,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"and(\"] a:focus,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"and(\"] a:hover {\n  color: #fff !important;\n}", "",{"version":3,"sources":["query_editor.css"],"names":[],"mappings":"AAAA;EACE,gBAAgB;AAClB;;AAEA;EACE,gBAAgB;AAClB;;AAEA;EACE,gBAAgB;AAClB;;AAEA;EACE,eAAe;AACjB;;AAEA;EACE,eAAe;AACjB;;AAEA;EACE,2BAA2B;AAC7B;;AAEA;EACE,eAAe;AACjB;;AAEA;EACE,oBAAoB;EACpB,gBAAgB;AAClB;;AAEA;EACE,gBAAgB;AAClB;;AAEA;EACE,eAAe;AACjB;;AAEA;;EAEE,cAAc;AAChB;;AAEA;EACE,WAAW;AACb;;AAEA;EACE,WAAW;AACb;;AAEA;;EAEE,WAAW;AACb;;AAEA;;;;;;;;EAQE,WAAW;AACb;;AAEA,4BAA4B;AAC5B;EACE,yBAAyB;AAC3B;;AAEA;EACE,yBAAyB;AAC3B;;AAEA;;;;;;EAME,yBAAyB;AAC3B;;AAEA;;;;;;;;;;;;;;;;EAgBE,sBAAsB;AACxB","file":"query_editor.css","sourcesContent":[".min-width-10 {\n  min-width: 10rem;\n}\n\n.min-width-12 {\n  min-width: 12rem;\n}\n\n.min-width-20 {\n  min-width: 20rem;\n}\n\n.gf-form-select-wrapper select.gf-form-input {\n  height: 2.64rem;\n}\n\n.gf-form-select-wrapper--caret-indent.gf-form-select-wrapper::after {\n  right: 0.775rem;\n}\n\n.ml-1 {\n  margin-left: 2px !important;\n}\n\n.join-r .gf-form-label {\n  margin-right: 0;\n}\n\n.join-l .gf-form-label {\n  border-left-width: 0;\n  border-radius: 0;\n}\n\n.mash-r .gf-form-label {\n  padding-right: 0;\n}\n\n.mash-l .gf-form-label {\n  padding-left: 0;\n}\n\n.irondb-tag-op .gf-form-label,\n.irondb-tag-end .gf-form-label {\n  color: #eb7b18;\n}\n\n.irondb-tag-cat .gf-form-label {\n  color: #598;\n}\n\n.irondb-tag-val .gf-form-label {\n  color: #5ca;\n}\n\n.irondb-tag-pair .gf-form-label,\n.irondb-tag-sep .gf-form-label {\n  color: #888;\n}\n\n.irondb-tag-op .gf-form-label:focus,\n.irondb-tag-op .gf-form-label:hover,\n.irondb-tag-cat .gf-form-label:focus,\n.irondb-tag-cat .gf-form-label:hover,\n.irondb-tag-val .gf-form-label:focus,\n.irondb-tag-val .gf-form-label:hover,\n.gf-form-label:focus .template-variable,\n.gf-form-label:hover .template-variable {\n  color: #fff;\n}\n\n/* menu item color changes */\n.irondb-tag-op .typeahead.dropdown-menu [data-value=REMOVE] a {\n  color: #bb002c !important;\n}\n\n.irondb-tag-val .typeahead.dropdown-menu [data-value^=\"$\"] a {\n  color: #33b5e5 !important;\n}\n\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"or(\"] a,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"not(\"] a,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"and(\"] a,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"or(\"] a,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"not(\"] a,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"and(\"] a {\n  color: #eb7b18 !important;\n}\n\n.irondb-tag-op .typeahead.dropdown-menu [data-value=REMOVE] a:focus,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=REMOVE] a:hover,\n.irondb-tag-val .typeahead.dropdown-menu [data-value^=\"$\"] a:focus,\n.irondb-tag-val .typeahead.dropdown-menu [data-value^=\"$\"] a:hover,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"or(\"] a:focus,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"or(\"] a:hover,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"not(\"] a:focus,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"not(\"] a:hover,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"and(\"] a:focus,\n.irondb-tag-op .typeahead.dropdown-menu [data-value=\"and(\"] a:hover,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"or(\"] a:focus,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"or(\"] a:hover,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"not(\"] a:focus,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"not(\"] a:hover,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"and(\"] a:focus,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value=\"and(\"] a:hover {\n  color: #fff !important;\n}"]}]);
// Exports
module.exports = exports;


/***/ }),

/***/ "../node_modules/css-loader/dist/runtime/api.js":
/*!******************************************************!*\
  !*** ../node_modules/css-loader/dist/runtime/api.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),

/***/ "../node_modules/d/index.js":
/*!**********************************!*\
  !*** ../node_modules/d/index.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue         = __webpack_require__(/*! type/value/is */ "../node_modules/type/value/is.js")
  , isPlainFunction = __webpack_require__(/*! type/plain-function/is */ "../node_modules/type/plain-function/is.js")
  , assign          = __webpack_require__(/*! es5-ext/object/assign */ "../node_modules/es5-ext/object/assign/index.js")
  , normalizeOpts   = __webpack_require__(/*! es5-ext/object/normalize-options */ "../node_modules/es5-ext/object/normalize-options.js")
  , contains        = __webpack_require__(/*! es5-ext/string/#/contains */ "../node_modules/es5-ext/string/#/contains/index.js");

var d = (module.exports = function (dscr, value/*, options*/) {
	var c, e, w, options, desc;
	if (arguments.length < 2 || typeof dscr !== "string") {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (isValue(dscr)) {
		c = contains.call(dscr, "c");
		e = contains.call(dscr, "e");
		w = contains.call(dscr, "w");
	} else {
		c = w = true;
		e = false;
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts(options), desc);
});

d.gs = function (dscr, get, set/*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== "string") {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (!isValue(get)) {
		get = undefined;
	} else if (!isPlainFunction(get)) {
		options = get;
		get = set = undefined;
	} else if (!isValue(set)) {
		set = undefined;
	} else if (!isPlainFunction(set)) {
		options = set;
		set = undefined;
	}
	if (isValue(dscr)) {
		c = contains.call(dscr, "c");
		e = contains.call(dscr, "e");
	} else {
		c = true;
		e = false;
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts(options), desc);
};


/***/ }),

/***/ "../node_modules/es5-ext/array/#/e-index-of.js":
/*!*****************************************************!*\
  !*** ../node_modules/es5-ext/array/#/e-index-of.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var numberIsNaN       = __webpack_require__(/*! ../../number/is-nan */ "../node_modules/es5-ext/number/is-nan/index.js")
  , toPosInt          = __webpack_require__(/*! ../../number/to-pos-integer */ "../node_modules/es5-ext/number/to-pos-integer.js")
  , value             = __webpack_require__(/*! ../../object/valid-value */ "../node_modules/es5-ext/object/valid-value.js")
  , indexOf           = Array.prototype.indexOf
  , objHasOwnProperty = Object.prototype.hasOwnProperty
  , abs               = Math.abs
  , floor             = Math.floor;

module.exports = function (searchElement/*, fromIndex*/) {
	var i, length, fromIndex, val;
	if (!numberIsNaN(searchElement)) return indexOf.apply(this, arguments);

	length = toPosInt(value(this).length);
	fromIndex = arguments[1];
	if (isNaN(fromIndex)) fromIndex = 0;
	else if (fromIndex >= 0) fromIndex = floor(fromIndex);
	else fromIndex = toPosInt(this.length) - floor(abs(fromIndex));

	for (i = fromIndex; i < length; ++i) {
		if (objHasOwnProperty.call(this, i)) {
			val = this[i];
			if (numberIsNaN(val)) return i; // Jslint: ignore
		}
	}
	return -1;
};


/***/ }),

/***/ "../node_modules/es5-ext/array/from/index.js":
/*!***************************************************!*\
  !*** ../node_modules/es5-ext/array/from/index.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(/*! ./is-implemented */ "../node_modules/es5-ext/array/from/is-implemented.js")() ? Array.from : __webpack_require__(/*! ./shim */ "../node_modules/es5-ext/array/from/shim.js");


/***/ }),

/***/ "../node_modules/es5-ext/array/from/is-implemented.js":
/*!************************************************************!*\
  !*** ../node_modules/es5-ext/array/from/is-implemented.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function () {
	var from = Array.from, arr, result;
	if (typeof from !== "function") return false;
	arr = ["raz", "dwa"];
	result = from(arr);
	return Boolean(result && result !== arr && result[1] === "dwa");
};


/***/ }),

/***/ "../node_modules/es5-ext/array/from/shim.js":
/*!**************************************************!*\
  !*** ../node_modules/es5-ext/array/from/shim.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var iteratorSymbol = __webpack_require__(/*! es6-symbol */ "../node_modules/es6-symbol/index.js").iterator
  , isArguments    = __webpack_require__(/*! ../../function/is-arguments */ "../node_modules/es5-ext/function/is-arguments.js")
  , isFunction     = __webpack_require__(/*! ../../function/is-function */ "../node_modules/es5-ext/function/is-function.js")
  , toPosInt       = __webpack_require__(/*! ../../number/to-pos-integer */ "../node_modules/es5-ext/number/to-pos-integer.js")
  , callable       = __webpack_require__(/*! ../../object/valid-callable */ "../node_modules/es5-ext/object/valid-callable.js")
  , validValue     = __webpack_require__(/*! ../../object/valid-value */ "../node_modules/es5-ext/object/valid-value.js")
  , isValue        = __webpack_require__(/*! ../../object/is-value */ "../node_modules/es5-ext/object/is-value.js")
  , isString       = __webpack_require__(/*! ../../string/is-string */ "../node_modules/es5-ext/string/is-string.js")
  , isArray        = Array.isArray
  , call           = Function.prototype.call
  , desc           = { configurable: true, enumerable: true, writable: true, value: null }
  , defineProperty = Object.defineProperty;

// eslint-disable-next-line complexity, max-lines-per-function
module.exports = function (arrayLike/*, mapFn, thisArg*/) {
	var mapFn = arguments[1]
	  , thisArg = arguments[2]
	  , Context
	  , i
	  , j
	  , arr
	  , length
	  , code
	  , iterator
	  , result
	  , getIterator
	  , value;

	arrayLike = Object(validValue(arrayLike));

	if (isValue(mapFn)) callable(mapFn);
	if (!this || this === Array || !isFunction(this)) {
		// Result: Plain array
		if (!mapFn) {
			if (isArguments(arrayLike)) {
				// Source: Arguments
				length = arrayLike.length;
				if (length !== 1) return Array.apply(null, arrayLike);
				arr = new Array(1);
				arr[0] = arrayLike[0];
				return arr;
			}
			if (isArray(arrayLike)) {
				// Source: Array
				arr = new Array((length = arrayLike.length));
				for (i = 0; i < length; ++i) arr[i] = arrayLike[i];
				return arr;
			}
		}
		arr = [];
	} else {
		// Result: Non plain array
		Context = this;
	}

	if (!isArray(arrayLike)) {
		if ((getIterator = arrayLike[iteratorSymbol]) !== undefined) {
			// Source: Iterator
			iterator = callable(getIterator).call(arrayLike);
			if (Context) arr = new Context();
			result = iterator.next();
			i = 0;
			while (!result.done) {
				value = mapFn ? call.call(mapFn, thisArg, result.value, i) : result.value;
				if (Context) {
					desc.value = value;
					defineProperty(arr, i, desc);
				} else {
					arr[i] = value;
				}
				result = iterator.next();
				++i;
			}
			length = i;
		} else if (isString(arrayLike)) {
			// Source: String
			length = arrayLike.length;
			if (Context) arr = new Context();
			for (i = 0, j = 0; i < length; ++i) {
				value = arrayLike[i];
				if (i + 1 < length) {
					code = value.charCodeAt(0);
					// eslint-disable-next-line max-depth
					if (code >= 0xd800 && code <= 0xdbff) value += arrayLike[++i];
				}
				value = mapFn ? call.call(mapFn, thisArg, value, j) : value;
				if (Context) {
					desc.value = value;
					defineProperty(arr, j, desc);
				} else {
					arr[j] = value;
				}
				++j;
			}
			length = j;
		}
	}
	if (length === undefined) {
		// Source: array or array-like
		length = toPosInt(arrayLike.length);
		if (Context) arr = new Context(length);
		for (i = 0; i < length; ++i) {
			value = mapFn ? call.call(mapFn, thisArg, arrayLike[i], i) : arrayLike[i];
			if (Context) {
				desc.value = value;
				defineProperty(arr, i, desc);
			} else {
				arr[i] = value;
			}
		}
	}
	if (Context) {
		desc.value = null;
		arr.length = length;
	}
	return arr;
};


/***/ }),

/***/ "../node_modules/es5-ext/array/to-array.js":
/*!*************************************************!*\
  !*** ../node_modules/es5-ext/array/to-array.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var from    = __webpack_require__(/*! ./from */ "../node_modules/es5-ext/array/from/index.js")
  , isArray = Array.isArray;

module.exports = function (arrayLike) { return isArray(arrayLike) ? arrayLike : from(arrayLike); };


/***/ }),

/***/ "../node_modules/es5-ext/error/custom.js":
/*!***********************************************!*\
  !*** ../node_modules/es5-ext/error/custom.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assign            = __webpack_require__(/*! ../object/assign */ "../node_modules/es5-ext/object/assign/index.js")
  , isObject          = __webpack_require__(/*! ../object/is-object */ "../node_modules/es5-ext/object/is-object.js")
  , isValue           = __webpack_require__(/*! ../object/is-value */ "../node_modules/es5-ext/object/is-value.js")
  , captureStackTrace = Error.captureStackTrace;

module.exports = function (message/*, code, ext*/) {
	var err = new Error(message), code = arguments[1], ext = arguments[2];
	if (!isValue(ext)) {
		if (isObject(code)) {
			ext = code;
			code = null;
		}
	}
	if (isValue(ext)) assign(err, ext);
	if (isValue(code)) err.code = code;
	if (captureStackTrace) captureStackTrace(err, module.exports);
	return err;
};


/***/ }),

/***/ "../node_modules/es5-ext/function/_define-length.js":
/*!**********************************************************!*\
  !*** ../node_modules/es5-ext/function/_define-length.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var toPosInt = __webpack_require__(/*! ../number/to-pos-integer */ "../node_modules/es5-ext/number/to-pos-integer.js");

var test = function (arg1, arg2) { return arg2; };

var desc, defineProperty, generate, mixin;

try {
	Object.defineProperty(test, "length", {
		configurable: true,
		writable: false,
		enumerable: false,
		value: 1
	});
}
catch (ignore) {}

if (test.length === 1) {
	// ES6
	desc = { configurable: true, writable: false, enumerable: false };
	defineProperty = Object.defineProperty;
	module.exports = function (fn, length) {
		length = toPosInt(length);
		if (fn.length === length) return fn;
		desc.value = length;
		return defineProperty(fn, "length", desc);
	};
} else {
	mixin = __webpack_require__(/*! ../object/mixin */ "../node_modules/es5-ext/object/mixin.js");
	generate = (function () {
		var cache = [];
		return function (length) {
			var args, i = 0;
			if (cache[length]) return cache[length];
			args = [];
			while (length--) args.push("a" + (++i).toString(36));
			// eslint-disable-next-line no-new-func
			return new Function(
				"fn",
				"return function (" + args.join(", ") + ") { return fn.apply(this, arguments); };"
			);
		};
	})();
	module.exports = function (src, length) {
		var target;
		length = toPosInt(length);
		if (src.length === length) return src;
		target = generate(length)(src);
		try { mixin(target, src); }
		catch (ignore) {}
		return target;
	};
}


/***/ }),

/***/ "../node_modules/es5-ext/function/is-arguments.js":
/*!********************************************************!*\
  !*** ../node_modules/es5-ext/function/is-arguments.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var objToString = Object.prototype.toString
  , id = objToString.call((function () { return arguments; })());

module.exports = function (value) { return objToString.call(value) === id; };


/***/ }),

/***/ "../node_modules/es5-ext/function/is-function.js":
/*!*******************************************************!*\
  !*** ../node_modules/es5-ext/function/is-function.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var objToString = Object.prototype.toString
  , isFunctionStringTag = RegExp.prototype.test.bind(/^[object [A-Za-z0-9]*Function]$/);

module.exports = function (value) {
	return typeof value === "function" && isFunctionStringTag(objToString.call(value));
};


/***/ }),

/***/ "../node_modules/es5-ext/function/noop.js":
/*!************************************************!*\
  !*** ../node_modules/es5-ext/function/noop.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// eslint-disable-next-line no-empty-function
module.exports = function () {};


/***/ }),

/***/ "../node_modules/es5-ext/math/sign/index.js":
/*!**************************************************!*\
  !*** ../node_modules/es5-ext/math/sign/index.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(/*! ./is-implemented */ "../node_modules/es5-ext/math/sign/is-implemented.js")() ? Math.sign : __webpack_require__(/*! ./shim */ "../node_modules/es5-ext/math/sign/shim.js");


/***/ }),

/***/ "../node_modules/es5-ext/math/sign/is-implemented.js":
/*!***********************************************************!*\
  !*** ../node_modules/es5-ext/math/sign/is-implemented.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function () {
	var sign = Math.sign;
	if (typeof sign !== "function") return false;
	return sign(10) === 1 && sign(-20) === -1;
};


/***/ }),

/***/ "../node_modules/es5-ext/math/sign/shim.js":
/*!*************************************************!*\
  !*** ../node_modules/es5-ext/math/sign/shim.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (value) {
	value = Number(value);
	if (isNaN(value) || value === 0) return value;
	return value > 0 ? 1 : -1;
};


/***/ }),

/***/ "../node_modules/es5-ext/number/is-nan/index.js":
/*!******************************************************!*\
  !*** ../node_modules/es5-ext/number/is-nan/index.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(/*! ./is-implemented */ "../node_modules/es5-ext/number/is-nan/is-implemented.js")() ? Number.isNaN : __webpack_require__(/*! ./shim */ "../node_modules/es5-ext/number/is-nan/shim.js");


/***/ }),

/***/ "../node_modules/es5-ext/number/is-nan/is-implemented.js":
/*!***************************************************************!*\
  !*** ../node_modules/es5-ext/number/is-nan/is-implemented.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function () {
	var numberIsNaN = Number.isNaN;
	if (typeof numberIsNaN !== "function") return false;
	return !numberIsNaN({}) && numberIsNaN(NaN) && !numberIsNaN(34);
};


/***/ }),

/***/ "../node_modules/es5-ext/number/is-nan/shim.js":
/*!*****************************************************!*\
  !*** ../node_modules/es5-ext/number/is-nan/shim.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (value) {
	// eslint-disable-next-line no-self-compare
	return value !== value;
};


/***/ }),

/***/ "../node_modules/es5-ext/number/to-integer.js":
/*!****************************************************!*\
  !*** ../node_modules/es5-ext/number/to-integer.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var sign  = __webpack_require__(/*! ../math/sign */ "../node_modules/es5-ext/math/sign/index.js")
  , abs   = Math.abs
  , floor = Math.floor;

module.exports = function (value) {
	if (isNaN(value)) return 0;
	value = Number(value);
	if (value === 0 || !isFinite(value)) return value;
	return sign(value) * floor(abs(value));
};


/***/ }),

/***/ "../node_modules/es5-ext/number/to-pos-integer.js":
/*!********************************************************!*\
  !*** ../node_modules/es5-ext/number/to-pos-integer.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var toInteger = __webpack_require__(/*! ./to-integer */ "../node_modules/es5-ext/number/to-integer.js")
  , max       = Math.max;

module.exports = function (value) { return max(0, toInteger(value)); };


/***/ }),

/***/ "../node_modules/es5-ext/object/_iterate.js":
/*!**************************************************!*\
  !*** ../node_modules/es5-ext/object/_iterate.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Internal method, used by iteration functions.
// Calls a function for each key-value pair found in object
// Optionally takes compareFn to iterate object in specific order



var callable                = __webpack_require__(/*! ./valid-callable */ "../node_modules/es5-ext/object/valid-callable.js")
  , value                   = __webpack_require__(/*! ./valid-value */ "../node_modules/es5-ext/object/valid-value.js")
  , bind                    = Function.prototype.bind
  , call                    = Function.prototype.call
  , keys                    = Object.keys
  , objPropertyIsEnumerable = Object.prototype.propertyIsEnumerable;

module.exports = function (method, defVal) {
	return function (obj, cb/*, thisArg, compareFn*/) {
		var list, thisArg = arguments[2], compareFn = arguments[3];
		obj = Object(value(obj));
		callable(cb);

		list = keys(obj);
		if (compareFn) {
			list.sort(typeof compareFn === "function" ? bind.call(compareFn, obj) : undefined);
		}
		if (typeof method !== "function") method = list[method];
		return call.call(method, list, function (key, index) {
			if (!objPropertyIsEnumerable.call(obj, key)) return defVal;
			return call.call(cb, thisArg, obj[key], key, obj, index);
		});
	};
};


/***/ }),

/***/ "../node_modules/es5-ext/object/assign/index.js":
/*!******************************************************!*\
  !*** ../node_modules/es5-ext/object/assign/index.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(/*! ./is-implemented */ "../node_modules/es5-ext/object/assign/is-implemented.js")() ? Object.assign : __webpack_require__(/*! ./shim */ "../node_modules/es5-ext/object/assign/shim.js");


/***/ }),

/***/ "../node_modules/es5-ext/object/assign/is-implemented.js":
/*!***************************************************************!*\
  !*** ../node_modules/es5-ext/object/assign/is-implemented.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== "function") return false;
	obj = { foo: "raz" };
	assign(obj, { bar: "dwa" }, { trzy: "trzy" });
	return obj.foo + obj.bar + obj.trzy === "razdwatrzy";
};


/***/ }),

/***/ "../node_modules/es5-ext/object/assign/shim.js":
/*!*****************************************************!*\
  !*** ../node_modules/es5-ext/object/assign/shim.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var keys  = __webpack_require__(/*! ../keys */ "../node_modules/es5-ext/object/keys/index.js")
  , value = __webpack_require__(/*! ../valid-value */ "../node_modules/es5-ext/object/valid-value.js")
  , max   = Math.max;

module.exports = function (dest, src/*, …srcn*/) {
	var error, i, length = max(arguments.length, 2), assign;
	dest = Object(value(dest));
	assign = function (key) {
		try {
			dest[key] = src[key];
		} catch (e) {
			if (!error) error = e;
		}
	};
	for (i = 1; i < length; ++i) {
		src = arguments[i];
		keys(src).forEach(assign);
	}
	if (error !== undefined) throw error;
	return dest;
};


/***/ }),

/***/ "../node_modules/es5-ext/object/for-each.js":
/*!**************************************************!*\
  !*** ../node_modules/es5-ext/object/for-each.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(/*! ./_iterate */ "../node_modules/es5-ext/object/_iterate.js")("forEach");


/***/ }),

/***/ "../node_modules/es5-ext/object/is-callable.js":
/*!*****************************************************!*\
  !*** ../node_modules/es5-ext/object/is-callable.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Deprecated



module.exports = function (obj) { return typeof obj === "function"; };


/***/ }),

/***/ "../node_modules/es5-ext/object/is-object.js":
/*!***************************************************!*\
  !*** ../node_modules/es5-ext/object/is-object.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue = __webpack_require__(/*! ./is-value */ "../node_modules/es5-ext/object/is-value.js");

var map = { function: true, object: true };

module.exports = function (value) { return (isValue(value) && map[typeof value]) || false; };


/***/ }),

/***/ "../node_modules/es5-ext/object/is-value.js":
/*!**************************************************!*\
  !*** ../node_modules/es5-ext/object/is-value.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _undefined = __webpack_require__(/*! ../function/noop */ "../node_modules/es5-ext/function/noop.js")(); // Support ES3 engines

module.exports = function (val) { return val !== _undefined && val !== null; };


/***/ }),

/***/ "../node_modules/es5-ext/object/keys/index.js":
/*!****************************************************!*\
  !*** ../node_modules/es5-ext/object/keys/index.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(/*! ./is-implemented */ "../node_modules/es5-ext/object/keys/is-implemented.js")() ? Object.keys : __webpack_require__(/*! ./shim */ "../node_modules/es5-ext/object/keys/shim.js");


/***/ }),

/***/ "../node_modules/es5-ext/object/keys/is-implemented.js":
/*!*************************************************************!*\
  !*** ../node_modules/es5-ext/object/keys/is-implemented.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function () {
	try {
		Object.keys("primitive");
		return true;
	} catch (e) {
		return false;
	}
};


/***/ }),

/***/ "../node_modules/es5-ext/object/keys/shim.js":
/*!***************************************************!*\
  !*** ../node_modules/es5-ext/object/keys/shim.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue = __webpack_require__(/*! ../is-value */ "../node_modules/es5-ext/object/is-value.js");

var keys = Object.keys;

module.exports = function (object) { return keys(isValue(object) ? Object(object) : object); };


/***/ }),

/***/ "../node_modules/es5-ext/object/map.js":
/*!*********************************************!*\
  !*** ../node_modules/es5-ext/object/map.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var callable = __webpack_require__(/*! ./valid-callable */ "../node_modules/es5-ext/object/valid-callable.js")
  , forEach  = __webpack_require__(/*! ./for-each */ "../node_modules/es5-ext/object/for-each.js")
  , call     = Function.prototype.call;

module.exports = function (obj, cb/*, thisArg*/) {
	var result = {}, thisArg = arguments[2];
	callable(cb);
	forEach(obj, function (value, key, targetObj, index) {
		result[key] = call.call(cb, thisArg, value, key, targetObj, index);
	});
	return result;
};


/***/ }),

/***/ "../node_modules/es5-ext/object/mixin.js":
/*!***********************************************!*\
  !*** ../node_modules/es5-ext/object/mixin.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var value                    = __webpack_require__(/*! ./valid-value */ "../node_modules/es5-ext/object/valid-value.js")
  , defineProperty           = Object.defineProperty
  , getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
  , getOwnPropertyNames      = Object.getOwnPropertyNames
  , getOwnPropertySymbols    = Object.getOwnPropertySymbols;

module.exports = function (target, source) {
	var error, sourceObject = Object(value(source));
	target = Object(value(target));
	getOwnPropertyNames(sourceObject).forEach(function (name) {
		try {
			defineProperty(target, name, getOwnPropertyDescriptor(source, name));
		} catch (e) { error = e; }
	});
	if (typeof getOwnPropertySymbols === "function") {
		getOwnPropertySymbols(sourceObject).forEach(function (symbol) {
			try {
				defineProperty(target, symbol, getOwnPropertyDescriptor(source, symbol));
			} catch (e) { error = e; }
		});
	}
	if (error !== undefined) throw error;
	return target;
};


/***/ }),

/***/ "../node_modules/es5-ext/object/normalize-options.js":
/*!***********************************************************!*\
  !*** ../node_modules/es5-ext/object/normalize-options.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue = __webpack_require__(/*! ./is-value */ "../node_modules/es5-ext/object/is-value.js");

var forEach = Array.prototype.forEach, create = Object.create;

var process = function (src, obj) {
	var key;
	for (key in src) obj[key] = src[key];
};

// eslint-disable-next-line no-unused-vars
module.exports = function (opts1/*, …options*/) {
	var result = create(null);
	forEach.call(arguments, function (options) {
		if (!isValue(options)) return;
		process(Object(options), result);
	});
	return result;
};


/***/ }),

/***/ "../node_modules/es5-ext/object/primitive-set.js":
/*!*******************************************************!*\
  !*** ../node_modules/es5-ext/object/primitive-set.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var forEach = Array.prototype.forEach, create = Object.create;

// eslint-disable-next-line no-unused-vars
module.exports = function (arg/*, …args*/) {
	var set = create(null);
	forEach.call(arguments, function (name) { set[name] = true; });
	return set;
};


/***/ }),

/***/ "../node_modules/es5-ext/object/valid-callable.js":
/*!********************************************************!*\
  !*** ../node_modules/es5-ext/object/valid-callable.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (fn) {
	if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
	return fn;
};


/***/ }),

/***/ "../node_modules/es5-ext/object/valid-value.js":
/*!*****************************************************!*\
  !*** ../node_modules/es5-ext/object/valid-value.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue = __webpack_require__(/*! ./is-value */ "../node_modules/es5-ext/object/is-value.js");

module.exports = function (value) {
	if (!isValue(value)) throw new TypeError("Cannot use null or undefined");
	return value;
};


/***/ }),

/***/ "../node_modules/es5-ext/object/validate-stringifiable-value.js":
/*!**********************************************************************!*\
  !*** ../node_modules/es5-ext/object/validate-stringifiable-value.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ensureValue   = __webpack_require__(/*! ./valid-value */ "../node_modules/es5-ext/object/valid-value.js")
  , stringifiable = __webpack_require__(/*! ./validate-stringifiable */ "../node_modules/es5-ext/object/validate-stringifiable.js");

module.exports = function (value) { return stringifiable(ensureValue(value)); };


/***/ }),

/***/ "../node_modules/es5-ext/object/validate-stringifiable.js":
/*!****************************************************************!*\
  !*** ../node_modules/es5-ext/object/validate-stringifiable.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isCallable = __webpack_require__(/*! ./is-callable */ "../node_modules/es5-ext/object/is-callable.js");

module.exports = function (stringifiable) {
	try {
		if (stringifiable && isCallable(stringifiable.toString)) return stringifiable.toString();
		return String(stringifiable);
	} catch (e) {
		throw new TypeError("Passed argument cannot be stringifed");
	}
};


/***/ }),

/***/ "../node_modules/es5-ext/safe-to-string.js":
/*!*************************************************!*\
  !*** ../node_modules/es5-ext/safe-to-string.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isCallable = __webpack_require__(/*! ./object/is-callable */ "../node_modules/es5-ext/object/is-callable.js");

module.exports = function (value) {
	try {
		if (value && isCallable(value.toString)) return value.toString();
		return String(value);
	} catch (e) {
		return "<Non-coercible to string value>";
	}
};


/***/ }),

/***/ "../node_modules/es5-ext/string/#/contains/index.js":
/*!**********************************************************!*\
  !*** ../node_modules/es5-ext/string/#/contains/index.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(/*! ./is-implemented */ "../node_modules/es5-ext/string/#/contains/is-implemented.js")() ? String.prototype.contains : __webpack_require__(/*! ./shim */ "../node_modules/es5-ext/string/#/contains/shim.js");


/***/ }),

/***/ "../node_modules/es5-ext/string/#/contains/is-implemented.js":
/*!*******************************************************************!*\
  !*** ../node_modules/es5-ext/string/#/contains/is-implemented.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var str = "razdwatrzy";

module.exports = function () {
	if (typeof str.contains !== "function") return false;
	return str.contains("dwa") === true && str.contains("foo") === false;
};


/***/ }),

/***/ "../node_modules/es5-ext/string/#/contains/shim.js":
/*!*********************************************************!*\
  !*** ../node_modules/es5-ext/string/#/contains/shim.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};


/***/ }),

/***/ "../node_modules/es5-ext/string/is-string.js":
/*!***************************************************!*\
  !*** ../node_modules/es5-ext/string/is-string.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var objToString = Object.prototype.toString, id = objToString.call("");

module.exports = function (value) {
	return (
		typeof value === "string" ||
		(value &&
			typeof value === "object" &&
			(value instanceof String || objToString.call(value) === id)) ||
		false
	);
};


/***/ }),

/***/ "../node_modules/es5-ext/to-short-string-representation.js":
/*!*****************************************************************!*\
  !*** ../node_modules/es5-ext/to-short-string-representation.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var safeToString = __webpack_require__(/*! ./safe-to-string */ "../node_modules/es5-ext/safe-to-string.js");

var reNewLine = /[\n\r\u2028\u2029]/g;

module.exports = function (value) {
	var string = safeToString(value);
	// Trim if too long
	if (string.length > 100) string = string.slice(0, 99) + "…";
	// Replace eventual new lines
	string = string.replace(reNewLine, function (char) {
		return JSON.stringify(char).slice(1, -1);
	});
	return string;
};


/***/ }),

/***/ "../node_modules/es6-symbol/index.js":
/*!*******************************************!*\
  !*** ../node_modules/es6-symbol/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(/*! ./is-implemented */ "../node_modules/es6-symbol/is-implemented.js")()
	? __webpack_require__(/*! ext/global-this */ "../node_modules/ext/global-this/index.js").Symbol
	: __webpack_require__(/*! ./polyfill */ "../node_modules/es6-symbol/polyfill.js");


/***/ }),

/***/ "../node_modules/es6-symbol/is-implemented.js":
/*!****************************************************!*\
  !*** ../node_modules/es6-symbol/is-implemented.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var global     = __webpack_require__(/*! ext/global-this */ "../node_modules/ext/global-this/index.js")
  , validTypes = { object: true, symbol: true };

module.exports = function () {
	var Symbol = global.Symbol;
	var symbol;
	if (typeof Symbol !== "function") return false;
	symbol = Symbol("test symbol");
	try { String(symbol); }
	catch (e) { return false; }

	// Return 'true' also for polyfills
	if (!validTypes[typeof Symbol.iterator]) return false;
	if (!validTypes[typeof Symbol.toPrimitive]) return false;
	if (!validTypes[typeof Symbol.toStringTag]) return false;

	return true;
};


/***/ }),

/***/ "../node_modules/es6-symbol/is-symbol.js":
/*!***********************************************!*\
  !*** ../node_modules/es6-symbol/is-symbol.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (value) {
	if (!value) return false;
	if (typeof value === "symbol") return true;
	if (!value.constructor) return false;
	if (value.constructor.name !== "Symbol") return false;
	return value[value.constructor.toStringTag] === "Symbol";
};


/***/ }),

/***/ "../node_modules/es6-symbol/lib/private/generate-name.js":
/*!***************************************************************!*\
  !*** ../node_modules/es6-symbol/lib/private/generate-name.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var d = __webpack_require__(/*! d */ "../node_modules/d/index.js");

var create = Object.create, defineProperty = Object.defineProperty, objPrototype = Object.prototype;

var created = create(null);
module.exports = function (desc) {
	var postfix = 0, name, ie11BugWorkaround;
	while (created[desc + (postfix || "")]) ++postfix;
	desc += postfix || "";
	created[desc] = true;
	name = "@@" + desc;
	defineProperty(
		objPrototype,
		name,
		d.gs(null, function (value) {
			// For IE11 issue see:
			// https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
			//    ie11-broken-getters-on-dom-objects
			// https://github.com/medikoo/es6-symbol/issues/12
			if (ie11BugWorkaround) return;
			ie11BugWorkaround = true;
			defineProperty(this, name, d(value));
			ie11BugWorkaround = false;
		})
	);
	return name;
};


/***/ }),

/***/ "../node_modules/es6-symbol/lib/private/setup/standard-symbols.js":
/*!************************************************************************!*\
  !*** ../node_modules/es6-symbol/lib/private/setup/standard-symbols.js ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var d            = __webpack_require__(/*! d */ "../node_modules/d/index.js")
  , NativeSymbol = __webpack_require__(/*! ext/global-this */ "../node_modules/ext/global-this/index.js").Symbol;

module.exports = function (SymbolPolyfill) {
	return Object.defineProperties(SymbolPolyfill, {
		// To ensure proper interoperability with other native functions (e.g. Array.from)
		// fallback to eventual native implementation of given symbol
		hasInstance: d(
			"", (NativeSymbol && NativeSymbol.hasInstance) || SymbolPolyfill("hasInstance")
		),
		isConcatSpreadable: d(
			"",
			(NativeSymbol && NativeSymbol.isConcatSpreadable) ||
				SymbolPolyfill("isConcatSpreadable")
		),
		iterator: d("", (NativeSymbol && NativeSymbol.iterator) || SymbolPolyfill("iterator")),
		match: d("", (NativeSymbol && NativeSymbol.match) || SymbolPolyfill("match")),
		replace: d("", (NativeSymbol && NativeSymbol.replace) || SymbolPolyfill("replace")),
		search: d("", (NativeSymbol && NativeSymbol.search) || SymbolPolyfill("search")),
		species: d("", (NativeSymbol && NativeSymbol.species) || SymbolPolyfill("species")),
		split: d("", (NativeSymbol && NativeSymbol.split) || SymbolPolyfill("split")),
		toPrimitive: d(
			"", (NativeSymbol && NativeSymbol.toPrimitive) || SymbolPolyfill("toPrimitive")
		),
		toStringTag: d(
			"", (NativeSymbol && NativeSymbol.toStringTag) || SymbolPolyfill("toStringTag")
		),
		unscopables: d(
			"", (NativeSymbol && NativeSymbol.unscopables) || SymbolPolyfill("unscopables")
		)
	});
};


/***/ }),

/***/ "../node_modules/es6-symbol/lib/private/setup/symbol-registry.js":
/*!***********************************************************************!*\
  !*** ../node_modules/es6-symbol/lib/private/setup/symbol-registry.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var d              = __webpack_require__(/*! d */ "../node_modules/d/index.js")
  , validateSymbol = __webpack_require__(/*! ../../../validate-symbol */ "../node_modules/es6-symbol/validate-symbol.js");

var registry = Object.create(null);

module.exports = function (SymbolPolyfill) {
	return Object.defineProperties(SymbolPolyfill, {
		for: d(function (key) {
			if (registry[key]) return registry[key];
			return (registry[key] = SymbolPolyfill(String(key)));
		}),
		keyFor: d(function (symbol) {
			var key;
			validateSymbol(symbol);
			for (key in registry) {
				if (registry[key] === symbol) return key;
			}
			return undefined;
		})
	});
};


/***/ }),

/***/ "../node_modules/es6-symbol/polyfill.js":
/*!**********************************************!*\
  !*** ../node_modules/es6-symbol/polyfill.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// ES2015 Symbol polyfill for environments that do not (or partially) support it



var d                    = __webpack_require__(/*! d */ "../node_modules/d/index.js")
  , validateSymbol       = __webpack_require__(/*! ./validate-symbol */ "../node_modules/es6-symbol/validate-symbol.js")
  , NativeSymbol         = __webpack_require__(/*! ext/global-this */ "../node_modules/ext/global-this/index.js").Symbol
  , generateName         = __webpack_require__(/*! ./lib/private/generate-name */ "../node_modules/es6-symbol/lib/private/generate-name.js")
  , setupStandardSymbols = __webpack_require__(/*! ./lib/private/setup/standard-symbols */ "../node_modules/es6-symbol/lib/private/setup/standard-symbols.js")
  , setupSymbolRegistry  = __webpack_require__(/*! ./lib/private/setup/symbol-registry */ "../node_modules/es6-symbol/lib/private/setup/symbol-registry.js");

var create = Object.create
  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty;

var SymbolPolyfill, HiddenSymbol, isNativeSafe;

if (typeof NativeSymbol === "function") {
	try {
		String(NativeSymbol());
		isNativeSafe = true;
	} catch (ignore) {}
} else {
	NativeSymbol = null;
}

// Internal constructor (not one exposed) for creating Symbol instances.
// This one is used to ensure that `someSymbol instanceof Symbol` always return false
HiddenSymbol = function Symbol(description) {
	if (this instanceof HiddenSymbol) throw new TypeError("Symbol is not a constructor");
	return SymbolPolyfill(description);
};

// Exposed `Symbol` constructor
// (returns instances of HiddenSymbol)
module.exports = SymbolPolyfill = function Symbol(description) {
	var symbol;
	if (this instanceof Symbol) throw new TypeError("Symbol is not a constructor");
	if (isNativeSafe) return NativeSymbol(description);
	symbol = create(HiddenSymbol.prototype);
	description = description === undefined ? "" : String(description);
	return defineProperties(symbol, {
		__description__: d("", description),
		__name__: d("", generateName(description))
	});
};

setupStandardSymbols(SymbolPolyfill);
setupSymbolRegistry(SymbolPolyfill);

// Internal tweaks for real symbol producer
defineProperties(HiddenSymbol.prototype, {
	constructor: d(SymbolPolyfill),
	toString: d("", function () { return this.__name__; })
});

// Proper implementation of methods exposed on Symbol.prototype
// They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
defineProperties(SymbolPolyfill.prototype, {
	toString: d(function () { return "Symbol (" + validateSymbol(this).__description__ + ")"; }),
	valueOf: d(function () { return validateSymbol(this); })
});
defineProperty(
	SymbolPolyfill.prototype,
	SymbolPolyfill.toPrimitive,
	d("", function () {
		var symbol = validateSymbol(this);
		if (typeof symbol === "symbol") return symbol;
		return symbol.toString();
	})
);
defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d("c", "Symbol"));

// Proper implementaton of toPrimitive and toStringTag for returned symbol instances
defineProperty(
	HiddenSymbol.prototype, SymbolPolyfill.toStringTag,
	d("c", SymbolPolyfill.prototype[SymbolPolyfill.toStringTag])
);

// Note: It's important to define `toPrimitive` as last one, as some implementations
// implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
// And that may invoke error in definition flow:
// See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
defineProperty(
	HiddenSymbol.prototype, SymbolPolyfill.toPrimitive,
	d("c", SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive])
);


/***/ }),

/***/ "../node_modules/es6-symbol/validate-symbol.js":
/*!*****************************************************!*\
  !*** ../node_modules/es6-symbol/validate-symbol.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isSymbol = __webpack_require__(/*! ./is-symbol */ "../node_modules/es6-symbol/is-symbol.js");

module.exports = function (value) {
	if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
	return value;
};


/***/ }),

/***/ "../node_modules/event-emitter/index.js":
/*!**********************************************!*\
  !*** ../node_modules/event-emitter/index.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var d        = __webpack_require__(/*! d */ "../node_modules/d/index.js")
  , callable = __webpack_require__(/*! es5-ext/object/valid-callable */ "../node_modules/es5-ext/object/valid-callable.js")

  , apply = Function.prototype.apply, call = Function.prototype.call
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , descriptor = { configurable: true, enumerable: false, writable: true }

  , on, once, off, emit, methods, descriptors, base;

on = function (type, listener) {
	var data;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) {
		data = descriptor.value = create(null);
		defineProperty(this, '__ee__', descriptor);
		descriptor.value = null;
	} else {
		data = this.__ee__;
	}
	if (!data[type]) data[type] = listener;
	else if (typeof data[type] === 'object') data[type].push(listener);
	else data[type] = [data[type], listener];

	return this;
};

once = function (type, listener) {
	var once, self;

	callable(listener);
	self = this;
	on.call(this, type, once = function () {
		off.call(self, type, once);
		apply.call(listener, this, arguments);
	});

	once.__eeOnceListener__ = listener;
	return this;
};

off = function (type, listener) {
	var data, listeners, candidate, i;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) return this;
	data = this.__ee__;
	if (!data[type]) return this;
	listeners = data[type];

	if (typeof listeners === 'object') {
		for (i = 0; (candidate = listeners[i]); ++i) {
			if ((candidate === listener) ||
					(candidate.__eeOnceListener__ === listener)) {
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
				else listeners.splice(i, 1);
			}
		}
	} else {
		if ((listeners === listener) ||
				(listeners.__eeOnceListener__ === listener)) {
			delete data[type];
		}
	}

	return this;
};

emit = function (type) {
	var i, l, listener, listeners, args;

	if (!hasOwnProperty.call(this, '__ee__')) return;
	listeners = this.__ee__[type];
	if (!listeners) return;

	if (typeof listeners === 'object') {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

		listeners = listeners.slice();
		for (i = 0; (listener = listeners[i]); ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
		case 1:
			call.call(listeners, this);
			break;
		case 2:
			call.call(listeners, this, arguments[1]);
			break;
		case 3:
			call.call(listeners, this, arguments[1], arguments[2]);
			break;
		default:
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) {
				args[i - 1] = arguments[i];
			}
			apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: once,
	off: off,
	emit: emit
};

descriptors = {
	on: d(on),
	once: d(once),
	off: d(off),
	emit: d(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function (o) {
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;


/***/ }),

/***/ "../node_modules/ext/global-this/implementation.js":
/*!*********************************************************!*\
  !*** ../node_modules/ext/global-this/implementation.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var naiveFallback = function () {
	if (typeof self === "object" && self) return self;
	if (typeof window === "object" && window) return window;
	throw new Error("Unable to resolve global `this`");
};

module.exports = (function () {
	if (this) return this;

	// Unexpected strict mode (may happen if e.g. bundled into ESM module)

	// Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis
	// In all ES5+ engines global object inherits from Object.prototype
	// (if you approached one that doesn't please report)
	try {
		Object.defineProperty(Object.prototype, "__global__", {
			get: function () { return this; },
			configurable: true
		});
	} catch (error) {
		// Unfortunate case of Object.prototype being sealed (via preventExtensions, seal or freeze)
		return naiveFallback();
	}
	try {
		// Safari case (window.__global__ is resolved with global context, but __global__ does not)
		if (!__global__) return naiveFallback();
		return __global__;
	} finally {
		delete Object.prototype.__global__;
	}
})();


/***/ }),

/***/ "../node_modules/ext/global-this/index.js":
/*!************************************************!*\
  !*** ../node_modules/ext/global-this/index.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(/*! ./is-implemented */ "../node_modules/ext/global-this/is-implemented.js")() ? globalThis : __webpack_require__(/*! ./implementation */ "../node_modules/ext/global-this/implementation.js");


/***/ }),

/***/ "../node_modules/ext/global-this/is-implemented.js":
/*!*********************************************************!*\
  !*** ../node_modules/ext/global-this/is-implemented.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function () {
	if (typeof globalThis !== "object") return false;
	if (!globalThis) return false;
	return globalThis.Array === Array;
};


/***/ }),

/***/ "../node_modules/fill-range/index.js":
/*!*******************************************!*\
  !*** ../node_modules/fill-range/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * fill-range <https://github.com/jonschlinkert/fill-range>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Licensed under the MIT License.
 */



const util = __webpack_require__(/*! util */ "../node_modules/util/util.js");
const toRegexRange = __webpack_require__(/*! to-regex-range */ "../node_modules/to-regex-range/index.js");

const isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);

const transform = toNumber => {
  return value => toNumber === true ? Number(value) : String(value);
};

const isValidValue = value => {
  return typeof value === 'number' || (typeof value === 'string' && value !== '');
};

const isNumber = num => Number.isInteger(+num);

const zeros = input => {
  let value = `${input}`;
  let index = -1;
  if (value[0] === '-') value = value.slice(1);
  if (value === '0') return false;
  while (value[++index] === '0');
  return index > 0;
};

const stringify = (start, end, options) => {
  if (typeof start === 'string' || typeof end === 'string') {
    return true;
  }
  return options.stringify === true;
};

const pad = (input, maxLength, toNumber) => {
  if (maxLength > 0) {
    let dash = input[0] === '-' ? '-' : '';
    if (dash) input = input.slice(1);
    input = (dash + input.padStart(dash ? maxLength - 1 : maxLength, '0'));
  }
  if (toNumber === false) {
    return String(input);
  }
  return input;
};

const toMaxLen = (input, maxLength) => {
  let negative = input[0] === '-' ? '-' : '';
  if (negative) {
    input = input.slice(1);
    maxLength--;
  }
  while (input.length < maxLength) input = '0' + input;
  return negative ? ('-' + input) : input;
};

const toSequence = (parts, options) => {
  parts.negatives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  parts.positives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);

  let prefix = options.capture ? '' : '?:';
  let positives = '';
  let negatives = '';
  let result;

  if (parts.positives.length) {
    positives = parts.positives.join('|');
  }

  if (parts.negatives.length) {
    negatives = `-(${prefix}${parts.negatives.join('|')})`;
  }

  if (positives && negatives) {
    result = `${positives}|${negatives}`;
  } else {
    result = positives || negatives;
  }

  if (options.wrap) {
    return `(${prefix}${result})`;
  }

  return result;
};

const toRange = (a, b, isNumbers, options) => {
  if (isNumbers) {
    return toRegexRange(a, b, { wrap: false, ...options });
  }

  let start = String.fromCharCode(a);
  if (a === b) return start;

  let stop = String.fromCharCode(b);
  return `[${start}-${stop}]`;
};

const toRegex = (start, end, options) => {
  if (Array.isArray(start)) {
    let wrap = options.wrap === true;
    let prefix = options.capture ? '' : '?:';
    return wrap ? `(${prefix}${start.join('|')})` : start.join('|');
  }
  return toRegexRange(start, end, options);
};

const rangeError = (...args) => {
  return new RangeError('Invalid range arguments: ' + util.inspect(...args));
};

const invalidRange = (start, end, options) => {
  if (options.strictRanges === true) throw rangeError([start, end]);
  return [];
};

const invalidStep = (step, options) => {
  if (options.strictRanges === true) {
    throw new TypeError(`Expected step "${step}" to be a number`);
  }
  return [];
};

const fillNumbers = (start, end, step = 1, options = {}) => {
  let a = Number(start);
  let b = Number(end);

  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    if (options.strictRanges === true) throw rangeError([start, end]);
    return [];
  }

  // fix negative zero
  if (a === 0) a = 0;
  if (b === 0) b = 0;

  let descending = a > b;
  let startString = String(start);
  let endString = String(end);
  let stepString = String(step);
  step = Math.max(Math.abs(step), 1);

  let padded = zeros(startString) || zeros(endString) || zeros(stepString);
  let maxLen = padded ? Math.max(startString.length, endString.length, stepString.length) : 0;
  let toNumber = padded === false && stringify(start, end, options) === false;
  let format = options.transform || transform(toNumber);

  if (options.toRegex && step === 1) {
    return toRange(toMaxLen(start, maxLen), toMaxLen(end, maxLen), true, options);
  }

  let parts = { negatives: [], positives: [] };
  let push = num => parts[num < 0 ? 'negatives' : 'positives'].push(Math.abs(num));
  let range = [];
  let index = 0;

  while (descending ? a >= b : a <= b) {
    if (options.toRegex === true && step > 1) {
      push(a);
    } else {
      range.push(pad(format(a, index), maxLen, toNumber));
    }
    a = descending ? a - step : a + step;
    index++;
  }

  if (options.toRegex === true) {
    return step > 1
      ? toSequence(parts, options)
      : toRegex(range, null, { wrap: false, ...options });
  }

  return range;
};

const fillLetters = (start, end, step = 1, options = {}) => {
  if ((!isNumber(start) && start.length > 1) || (!isNumber(end) && end.length > 1)) {
    return invalidRange(start, end, options);
  }


  let format = options.transform || (val => String.fromCharCode(val));
  let a = `${start}`.charCodeAt(0);
  let b = `${end}`.charCodeAt(0);

  let descending = a > b;
  let min = Math.min(a, b);
  let max = Math.max(a, b);

  if (options.toRegex && step === 1) {
    return toRange(min, max, false, options);
  }

  let range = [];
  let index = 0;

  while (descending ? a >= b : a <= b) {
    range.push(format(a, index));
    a = descending ? a - step : a + step;
    index++;
  }

  if (options.toRegex === true) {
    return toRegex(range, null, { wrap: false, options });
  }

  return range;
};

const fill = (start, end, step, options = {}) => {
  if (end == null && isValidValue(start)) {
    return [start];
  }

  if (!isValidValue(start) || !isValidValue(end)) {
    return invalidRange(start, end, options);
  }

  if (typeof step === 'function') {
    return fill(start, end, 1, { transform: step });
  }

  if (isObject(step)) {
    return fill(start, end, 0, step);
  }

  let opts = { ...options };
  if (opts.capture === true) opts.wrap = true;
  step = step || opts.step || 1;

  if (!isNumber(step)) {
    if (step != null && !isObject(step)) return invalidStep(step, opts);
    return fill(start, end, 1, step);
  }

  if (isNumber(start) && isNumber(end)) {
    return fillNumbers(start, end, step, opts);
  }

  return fillLetters(start, end, Math.max(Math.abs(step), 1), opts);
};

module.exports = fill;


/***/ }),

/***/ "../node_modules/is-number/index.js":
/*!******************************************!*\
  !*** ../node_modules/is-number/index.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * is-number <https://github.com/jonschlinkert/is-number>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Released under the MIT License.
 */



module.exports = function(num) {
  if (typeof num === 'number') {
    return num - num === 0;
  }
  if (typeof num === 'string' && num.trim() !== '') {
    return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
  }
  return false;
};


/***/ }),

/***/ "../node_modules/is-promise/index.js":
/*!*******************************************!*\
  !*** ../node_modules/is-promise/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = isPromise;
module.exports.default = isPromise;

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}


/***/ }),

/***/ "../node_modules/lru-queue/index.js":
/*!******************************************!*\
  !*** ../node_modules/lru-queue/index.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var toPosInt = __webpack_require__(/*! es5-ext/number/to-pos-integer */ "../node_modules/es5-ext/number/to-pos-integer.js")

  , create = Object.create, hasOwnProperty = Object.prototype.hasOwnProperty;

module.exports = function (limit) {
	var size = 0, base = 1, queue = create(null), map = create(null), index = 0, del;
	limit = toPosInt(limit);
	return {
		hit: function (id) {
			var oldIndex = map[id], nuIndex = ++index;
			queue[nuIndex] = id;
			map[id] = nuIndex;
			if (!oldIndex) {
				++size;
				if (size <= limit) return;
				id = queue[base];
				del(id);
				return id;
			}
			delete queue[oldIndex];
			if (base !== oldIndex) return;
			while (!hasOwnProperty.call(queue, ++base)) continue; //jslint: skip
		},
		delete: del = function (id) {
			var oldIndex = map[id];
			if (!oldIndex) return;
			delete queue[oldIndex];
			delete map[id];
			--size;
			if (base !== oldIndex) return;
			if (!size) {
				index = 0;
				base = 1;
				return;
			}
			while (!hasOwnProperty.call(queue, ++base)) continue; //jslint: skip
		},
		clear: function () {
			size = 0;
			base = 1;
			queue = create(null);
			map = create(null);
			index = 0;
		}
	};
};


/***/ }),

/***/ "../node_modules/memoizee/ext/async.js":
/*!*********************************************!*\
  !*** ../node_modules/memoizee/ext/async.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* eslint consistent-this: 0, no-shadow:0, no-eq-null: 0, eqeqeq: 0, no-unused-vars: 0 */

// Support for asynchronous functions



var aFrom        = __webpack_require__(/*! es5-ext/array/from */ "../node_modules/es5-ext/array/from/index.js")
  , objectMap    = __webpack_require__(/*! es5-ext/object/map */ "../node_modules/es5-ext/object/map.js")
  , mixin        = __webpack_require__(/*! es5-ext/object/mixin */ "../node_modules/es5-ext/object/mixin.js")
  , defineLength = __webpack_require__(/*! es5-ext/function/_define-length */ "../node_modules/es5-ext/function/_define-length.js")
  , nextTick     = __webpack_require__(/*! next-tick */ "../node_modules/next-tick/index.js");

var slice = Array.prototype.slice, apply = Function.prototype.apply, create = Object.create;

__webpack_require__(/*! ../lib/registered-extensions */ "../node_modules/memoizee/lib/registered-extensions.js").async = function (tbi, conf) {
	var waiting = create(null)
	  , cache = create(null)
	  , base = conf.memoized
	  , original = conf.original
	  , currentCallback
	  , currentContext
	  , currentArgs;

	// Initial
	conf.memoized = defineLength(function (arg) {
		var args = arguments, last = args[args.length - 1];
		if (typeof last === "function") {
			currentCallback = last;
			args = slice.call(args, 0, -1);
		}
		return base.apply(currentContext = this, currentArgs = args);
	}, base);
	try { mixin(conf.memoized, base); }
	catch (ignore) {}

	// From cache (sync)
	conf.on("get", function (id) {
		var cb, context, args;
		if (!currentCallback) return;

		// Unresolved
		if (waiting[id]) {
			if (typeof waiting[id] === "function") waiting[id] = [waiting[id], currentCallback];
			else waiting[id].push(currentCallback);
			currentCallback = null;
			return;
		}

		// Resolved, assure next tick invocation
		cb = currentCallback;
		context = currentContext;
		args = currentArgs;
		currentCallback = currentContext = currentArgs = null;
		nextTick(function () {
			var data;
			if (hasOwnProperty.call(cache, id)) {
				data = cache[id];
				conf.emit("getasync", id, args, context);
				apply.call(cb, data.context, data.args);
			} else {
				// Purged in a meantime, we shouldn't rely on cached value, recall
				currentCallback = cb;
				currentContext = context;
				currentArgs = args;
				base.apply(context, args);
			}
		});
	});

	// Not from cache
	conf.original = function () {
		var args, cb, origCb, result;
		if (!currentCallback) return apply.call(original, this, arguments);
		args = aFrom(arguments);
		cb = function self(err) {
			var cb, args, id = self.id;
			if (id == null) {
				// Shouldn't happen, means async callback was called sync way
				nextTick(apply.bind(self, this, arguments));
				return undefined;
			}
			delete self.id;
			cb = waiting[id];
			delete waiting[id];
			if (!cb) {
				// Already processed,
				// outcome of race condition: asyncFn(1, cb), asyncFn.clear(), asyncFn(1, cb)
				return undefined;
			}
			args = aFrom(arguments);
			if (conf.has(id)) {
				if (err) {
					conf.delete(id);
				} else {
					cache[id] = { context: this, args: args };
					conf.emit("setasync", id, typeof cb === "function" ? 1 : cb.length);
				}
			}
			if (typeof cb === "function") {
				result = apply.call(cb, this, args);
			} else {
				cb.forEach(function (cb) { result = apply.call(cb, this, args); }, this);
			}
			return result;
		};
		origCb = currentCallback;
		currentCallback = currentContext = currentArgs = null;
		args.push(cb);
		result = apply.call(original, this, args);
		cb.cb = origCb;
		currentCallback = cb;
		return result;
	};

	// After not from cache call
	conf.on("set", function (id) {
		if (!currentCallback) {
			conf.delete(id);
			return;
		}
		if (waiting[id]) {
			// Race condition: asyncFn(1, cb), asyncFn.clear(), asyncFn(1, cb)
			if (typeof waiting[id] === "function") waiting[id] = [waiting[id], currentCallback.cb];
			else waiting[id].push(currentCallback.cb);
		} else {
			waiting[id] = currentCallback.cb;
		}
		delete currentCallback.cb;
		currentCallback.id = id;
		currentCallback = null;
	});

	// On delete
	conf.on("delete", function (id) {
		var result;
		// If false, we don't have value yet, so we assume that intention is not
		// to memoize this call. After value is obtained we don't cache it but
		// gracefully pass to callback
		if (hasOwnProperty.call(waiting, id)) return;
		if (!cache[id]) return;
		result = cache[id];
		delete cache[id];
		conf.emit("deleteasync", id, slice.call(result.args, 1));
	});

	// On clear
	conf.on("clear", function () {
		var oldCache = cache;
		cache = create(null);
		conf.emit(
			"clearasync", objectMap(oldCache, function (data) { return slice.call(data.args, 1); })
		);
	});
};


/***/ }),

/***/ "../node_modules/memoizee/ext/dispose.js":
/*!***********************************************!*\
  !*** ../node_modules/memoizee/ext/dispose.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Call dispose callback on each cache purge



var callable   = __webpack_require__(/*! es5-ext/object/valid-callable */ "../node_modules/es5-ext/object/valid-callable.js")
  , forEach    = __webpack_require__(/*! es5-ext/object/for-each */ "../node_modules/es5-ext/object/for-each.js")
  , extensions = __webpack_require__(/*! ../lib/registered-extensions */ "../node_modules/memoizee/lib/registered-extensions.js")

  , apply = Function.prototype.apply;

extensions.dispose = function (dispose, conf, options) {
	var del;
	callable(dispose);
	if ((options.async && extensions.async) || (options.promise && extensions.promise)) {
		conf.on("deleteasync", del = function (id, resultArray) {
			apply.call(dispose, null, resultArray);
		});
		conf.on("clearasync", function (cache) {
			forEach(cache, function (result, id) {
 del(id, result);
});
		});
		return;
	}
	conf.on("delete", del = function (id, result) {
 dispose(result);
});
	conf.on("clear", function (cache) {
		forEach(cache, function (result, id) {
 del(id, result);
});
	});
};


/***/ }),

/***/ "../node_modules/memoizee/ext/max-age.js":
/*!***********************************************!*\
  !*** ../node_modules/memoizee/ext/max-age.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* eslint consistent-this: 0 */

// Timeout cached values



var aFrom      = __webpack_require__(/*! es5-ext/array/from */ "../node_modules/es5-ext/array/from/index.js")
  , forEach    = __webpack_require__(/*! es5-ext/object/for-each */ "../node_modules/es5-ext/object/for-each.js")
  , nextTick   = __webpack_require__(/*! next-tick */ "../node_modules/next-tick/index.js")
  , isPromise  = __webpack_require__(/*! is-promise */ "../node_modules/is-promise/index.js")
  , timeout    = __webpack_require__(/*! timers-ext/valid-timeout */ "../node_modules/timers-ext/valid-timeout.js")
  , extensions = __webpack_require__(/*! ../lib/registered-extensions */ "../node_modules/memoizee/lib/registered-extensions.js");

var noop = Function.prototype, max = Math.max, min = Math.min, create = Object.create;

extensions.maxAge = function (maxAge, conf, options) {
	var timeouts, postfix, preFetchAge, preFetchTimeouts;

	maxAge = timeout(maxAge);
	if (!maxAge) return;

	timeouts = create(null);
	postfix =
		(options.async && extensions.async) || (options.promise && extensions.promise)
			? "async"
			: "";
	conf.on("set" + postfix, function (id) {
		timeouts[id] = setTimeout(function () { conf.delete(id); }, maxAge);
		if (typeof timeouts[id].unref === "function") timeouts[id].unref();
		if (!preFetchTimeouts) return;
		if (preFetchTimeouts[id]) {
			if (preFetchTimeouts[id] !== "nextTick") clearTimeout(preFetchTimeouts[id]);
		}
		preFetchTimeouts[id] = setTimeout(function () {
			delete preFetchTimeouts[id];
		}, preFetchAge);
		if (typeof preFetchTimeouts[id].unref === "function") preFetchTimeouts[id].unref();
	});
	conf.on("delete" + postfix, function (id) {
		clearTimeout(timeouts[id]);
		delete timeouts[id];
		if (!preFetchTimeouts) return;
		if (preFetchTimeouts[id] !== "nextTick") clearTimeout(preFetchTimeouts[id]);
		delete preFetchTimeouts[id];
	});

	if (options.preFetch) {
		if (options.preFetch === true || isNaN(options.preFetch)) {
			preFetchAge = 0.333;
		} else {
			preFetchAge = max(min(Number(options.preFetch), 1), 0);
		}
		if (preFetchAge) {
			preFetchTimeouts = {};
			preFetchAge = (1 - preFetchAge) * maxAge;
			conf.on("get" + postfix, function (id, args, context) {
				if (!preFetchTimeouts[id]) {
					preFetchTimeouts[id] = "nextTick";
					nextTick(function () {
						var result;
						if (preFetchTimeouts[id] !== "nextTick") return;
						delete preFetchTimeouts[id];
						conf.delete(id);
						if (options.async) {
							args = aFrom(args);
							args.push(noop);
						}
						result = conf.memoized.apply(context, args);
						if (options.promise) {
							// Supress eventual error warnings
							if (isPromise(result)) {
								if (typeof result.done === "function") result.done(noop, noop);
								else result.then(noop, noop);
							}
						}
					});
				}
			});
		}
	}

	conf.on("clear" + postfix, function () {
		forEach(timeouts, function (id) { clearTimeout(id); });
		timeouts = {};
		if (preFetchTimeouts) {
			forEach(preFetchTimeouts, function (id) { if (id !== "nextTick") clearTimeout(id); });
			preFetchTimeouts = {};
		}
	});
};


/***/ }),

/***/ "../node_modules/memoizee/ext/max.js":
/*!*******************************************!*\
  !*** ../node_modules/memoizee/ext/max.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Limit cache size, LRU (least recently used) algorithm.



var toPosInteger = __webpack_require__(/*! es5-ext/number/to-pos-integer */ "../node_modules/es5-ext/number/to-pos-integer.js")
  , lruQueue     = __webpack_require__(/*! lru-queue */ "../node_modules/lru-queue/index.js")
  , extensions   = __webpack_require__(/*! ../lib/registered-extensions */ "../node_modules/memoizee/lib/registered-extensions.js");

extensions.max = function (max, conf, options) {
	var postfix, queue, hit;

	max = toPosInteger(max);
	if (!max) return;

	queue = lruQueue(max);
	postfix = (options.async && extensions.async) || (options.promise && extensions.promise)
		? "async" : "";

	conf.on("set" + postfix, hit = function (id) {
		id = queue.hit(id);
		if (id === undefined) return;
		conf.delete(id);
	});
	conf.on("get" + postfix, hit);
	conf.on("delete" + postfix, queue.delete);
	conf.on("clear" + postfix, queue.clear);
};


/***/ }),

/***/ "../node_modules/memoizee/ext/promise.js":
/*!***********************************************!*\
  !*** ../node_modules/memoizee/ext/promise.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* eslint max-statements: 0 */

// Support for functions returning promise



var objectMap     = __webpack_require__(/*! es5-ext/object/map */ "../node_modules/es5-ext/object/map.js")
  , primitiveSet  = __webpack_require__(/*! es5-ext/object/primitive-set */ "../node_modules/es5-ext/object/primitive-set.js")
  , ensureString  = __webpack_require__(/*! es5-ext/object/validate-stringifiable-value */ "../node_modules/es5-ext/object/validate-stringifiable-value.js")
  , toShortString = __webpack_require__(/*! es5-ext/to-short-string-representation */ "../node_modules/es5-ext/to-short-string-representation.js")
  , isPromise     = __webpack_require__(/*! is-promise */ "../node_modules/is-promise/index.js")
  , nextTick      = __webpack_require__(/*! next-tick */ "../node_modules/next-tick/index.js");

var create = Object.create
  , supportedModes = primitiveSet("then", "then:finally", "done", "done:finally");

__webpack_require__(/*! ../lib/registered-extensions */ "../node_modules/memoizee/lib/registered-extensions.js").promise = function (mode, conf) {
	var waiting = create(null), cache = create(null), promises = create(null);

	if (mode === true) {
		mode = null;
	} else {
		mode = ensureString(mode);
		if (!supportedModes[mode]) {
			throw new TypeError("'" + toShortString(mode) + "' is not valid promise mode");
		}
	}

	// After not from cache call
	conf.on("set", function (id, ignore, promise) {
		var isFailed = false;

		if (!isPromise(promise)) {
			// Non promise result
			cache[id] = promise;
			conf.emit("setasync", id, 1);
			return;
		}
		waiting[id] = 1;
		promises[id] = promise;
		var onSuccess = function (result) {
			var count = waiting[id];
			if (isFailed) {
				throw new Error(
					"Memoizee error: Detected unordered then|done & finally resolution, which " +
						"in turn makes proper detection of success/failure impossible (when in " +
						"'done:finally' mode)\n" +
						"Consider to rely on 'then' or 'done' mode instead."
				);
			}
			if (!count) return; // Deleted from cache before resolved
			delete waiting[id];
			cache[id] = result;
			conf.emit("setasync", id, count);
		};
		var onFailure = function () {
			isFailed = true;
			if (!waiting[id]) return; // Deleted from cache (or succeed in case of finally)
			delete waiting[id];
			delete promises[id];
			conf.delete(id);
		};

		var resolvedMode = mode;
		if (!resolvedMode) resolvedMode = "then";

		if (resolvedMode === "then") {
			var nextTickFailure = function () { nextTick(onFailure); };
			// Eventual finally needs to be attached to non rejected promise
			// (so we not force propagation of unhandled rejection)
			promise = promise.then(function (result) {
				nextTick(onSuccess.bind(this, result));
			}, nextTickFailure);
			// If `finally` is a function we attach to it to remove cancelled promises.
			if (typeof promise.finally === "function") {
				promise.finally(nextTickFailure);
			}
		} else if (resolvedMode === "done") {
			// Not recommended, as it may mute any eventual "Unhandled error" events
			if (typeof promise.done !== "function") {
				throw new Error(
					"Memoizee error: Retrieved promise does not implement 'done' " +
						"in 'done' mode"
				);
			}
			promise.done(onSuccess, onFailure);
		} else if (resolvedMode === "done:finally") {
			// The only mode with no side effects assuming library does not throw unconditionally
			// for rejected promises.
			if (typeof promise.done !== "function") {
				throw new Error(
					"Memoizee error: Retrieved promise does not implement 'done' " +
						"in 'done:finally' mode"
				);
			}
			if (typeof promise.finally !== "function") {
				throw new Error(
					"Memoizee error: Retrieved promise does not implement 'finally' " +
						"in 'done:finally' mode"
				);
			}
			promise.done(onSuccess);
			promise.finally(onFailure);
		}
	});

	// From cache (sync)
	conf.on("get", function (id, args, context) {
		var promise;
		if (waiting[id]) {
			++waiting[id]; // Still waiting
			return;
		}
		promise = promises[id];
		var emit = function () { conf.emit("getasync", id, args, context); };
		if (isPromise(promise)) {
			if (typeof promise.done === "function") promise.done(emit);
			else {
				promise.then(function () { nextTick(emit); });
			}
		} else {
			emit();
		}
	});

	// On delete
	conf.on("delete", function (id) {
		delete promises[id];
		if (waiting[id]) {
			delete waiting[id];
			return; // Not yet resolved
		}
		if (!hasOwnProperty.call(cache, id)) return;
		var result = cache[id];
		delete cache[id];
		conf.emit("deleteasync", id, [result]);
	});

	// On clear
	conf.on("clear", function () {
		var oldCache = cache;
		cache = create(null);
		waiting = create(null);
		promises = create(null);
		conf.emit("clearasync", objectMap(oldCache, function (data) { return [data]; }));
	});
};


/***/ }),

/***/ "../node_modules/memoizee/ext/ref-counter.js":
/*!***************************************************!*\
  !*** ../node_modules/memoizee/ext/ref-counter.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Reference counter, useful for garbage collector like functionality



var d          = __webpack_require__(/*! d */ "../node_modules/d/index.js")
  , extensions = __webpack_require__(/*! ../lib/registered-extensions */ "../node_modules/memoizee/lib/registered-extensions.js")

  , create = Object.create, defineProperties = Object.defineProperties;

extensions.refCounter = function (ignore, conf, options) {
	var cache, postfix;

	cache = create(null);
	postfix = (options.async && extensions.async) || (options.promise && extensions.promise)
		? "async" : "";

	conf.on("set" + postfix, function (id, length) {
 cache[id] = length || 1;
});
	conf.on("get" + postfix, function (id) {
 ++cache[id];
});
	conf.on("delete" + postfix, function (id) {
 delete cache[id];
});
	conf.on("clear" + postfix, function () {
 cache = {};
});

	defineProperties(conf.memoized, {
		deleteRef: d(function () {
			var id = conf.get(arguments);
			if (id === null) return null;
			if (!cache[id]) return null;
			if (!--cache[id]) {
				conf.delete(id);
				return true;
			}
			return false;
		}),
		getRefCount: d(function () {
			var id = conf.get(arguments);
			if (id === null) return 0;
			if (!cache[id]) return 0;
			return cache[id];
		})
	});
};


/***/ }),

/***/ "../node_modules/memoizee/index.js":
/*!*****************************************!*\
  !*** ../node_modules/memoizee/index.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var normalizeOpts = __webpack_require__(/*! es5-ext/object/normalize-options */ "../node_modules/es5-ext/object/normalize-options.js")
  , resolveLength = __webpack_require__(/*! ./lib/resolve-length */ "../node_modules/memoizee/lib/resolve-length.js")
  , plain         = __webpack_require__(/*! ./plain */ "../node_modules/memoizee/plain.js");

module.exports = function (fn/*, options*/) {
	var options = normalizeOpts(arguments[1]), length;

	if (!options.normalizer) {
		length = options.length = resolveLength(options.length, fn.length, options.async);
		if (length !== 0) {
			if (options.primitive) {
				if (length === false) {
					options.normalizer = __webpack_require__(/*! ./normalizers/primitive */ "../node_modules/memoizee/normalizers/primitive.js");
				} else if (length > 1) {
					options.normalizer = __webpack_require__(/*! ./normalizers/get-primitive-fixed */ "../node_modules/memoizee/normalizers/get-primitive-fixed.js")(length);
				}
			} else if (length === false) options.normalizer = __webpack_require__(/*! ./normalizers/get */ "../node_modules/memoizee/normalizers/get.js")();
				else if (length === 1) options.normalizer = __webpack_require__(/*! ./normalizers/get-1 */ "../node_modules/memoizee/normalizers/get-1.js")();
				else options.normalizer = __webpack_require__(/*! ./normalizers/get-fixed */ "../node_modules/memoizee/normalizers/get-fixed.js")(length);
		}
	}

	// Assure extensions
	if (options.async) __webpack_require__(/*! ./ext/async */ "../node_modules/memoizee/ext/async.js");
	if (options.promise) __webpack_require__(/*! ./ext/promise */ "../node_modules/memoizee/ext/promise.js");
	if (options.dispose) __webpack_require__(/*! ./ext/dispose */ "../node_modules/memoizee/ext/dispose.js");
	if (options.maxAge) __webpack_require__(/*! ./ext/max-age */ "../node_modules/memoizee/ext/max-age.js");
	if (options.max) __webpack_require__(/*! ./ext/max */ "../node_modules/memoizee/ext/max.js");
	if (options.refCounter) __webpack_require__(/*! ./ext/ref-counter */ "../node_modules/memoizee/ext/ref-counter.js");

	return plain(fn, options);
};


/***/ }),

/***/ "../node_modules/memoizee/lib/configure-map.js":
/*!*****************************************************!*\
  !*** ../node_modules/memoizee/lib/configure-map.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* eslint no-eq-null: 0, eqeqeq: 0, no-unused-vars: 0 */



var customError      = __webpack_require__(/*! es5-ext/error/custom */ "../node_modules/es5-ext/error/custom.js")
  , defineLength     = __webpack_require__(/*! es5-ext/function/_define-length */ "../node_modules/es5-ext/function/_define-length.js")
  , d                = __webpack_require__(/*! d */ "../node_modules/d/index.js")
  , ee               = __webpack_require__(/*! event-emitter */ "../node_modules/event-emitter/index.js").methods
  , resolveResolve   = __webpack_require__(/*! ./resolve-resolve */ "../node_modules/memoizee/lib/resolve-resolve.js")
  , resolveNormalize = __webpack_require__(/*! ./resolve-normalize */ "../node_modules/memoizee/lib/resolve-normalize.js");

var apply = Function.prototype.apply
  , call = Function.prototype.call
  , create = Object.create
  , defineProperties = Object.defineProperties
  , on = ee.on
  , emit = ee.emit;

module.exports = function (original, length, options) {
	var cache = create(null)
	  , conf
	  , memLength
	  , get
	  , set
	  , del
	  , clear
	  , extDel
	  , extGet
	  , extHas
	  , normalizer
	  , getListeners
	  , setListeners
	  , deleteListeners
	  , memoized
	  , resolve;
	if (length !== false) memLength = length;
	else if (isNaN(original.length)) memLength = 1;
	else memLength = original.length;

	if (options.normalizer) {
		normalizer = resolveNormalize(options.normalizer);
		get = normalizer.get;
		set = normalizer.set;
		del = normalizer.delete;
		clear = normalizer.clear;
	}
	if (options.resolvers != null) resolve = resolveResolve(options.resolvers);

	if (get) {
		memoized = defineLength(function (arg) {
			var id, result, args = arguments;
			if (resolve) args = resolve(args);
			id = get(args);
			if (id !== null) {
				if (hasOwnProperty.call(cache, id)) {
					if (getListeners) conf.emit("get", id, args, this);
					return cache[id];
				}
			}
			if (args.length === 1) result = call.call(original, this, args[0]);
			else result = apply.call(original, this, args);
			if (id === null) {
				id = get(args);
				if (id !== null) throw customError("Circular invocation", "CIRCULAR_INVOCATION");
				id = set(args);
			} else if (hasOwnProperty.call(cache, id)) {
				throw customError("Circular invocation", "CIRCULAR_INVOCATION");
			}
			cache[id] = result;
			if (setListeners) conf.emit("set", id, null, result);
			return result;
		}, memLength);
	} else if (length === 0) {
		memoized = function () {
			var result;
			if (hasOwnProperty.call(cache, "data")) {
				if (getListeners) conf.emit("get", "data", arguments, this);
				return cache.data;
			}
			if (arguments.length) result = apply.call(original, this, arguments);
			else result = call.call(original, this);
			if (hasOwnProperty.call(cache, "data")) {
				throw customError("Circular invocation", "CIRCULAR_INVOCATION");
			}
			cache.data = result;
			if (setListeners) conf.emit("set", "data", null, result);
			return result;
		};
	} else {
		memoized = function (arg) {
			var result, args = arguments, id;
			if (resolve) args = resolve(arguments);
			id = String(args[0]);
			if (hasOwnProperty.call(cache, id)) {
				if (getListeners) conf.emit("get", id, args, this);
				return cache[id];
			}
			if (args.length === 1) result = call.call(original, this, args[0]);
			else result = apply.call(original, this, args);
			if (hasOwnProperty.call(cache, id)) {
				throw customError("Circular invocation", "CIRCULAR_INVOCATION");
			}
			cache[id] = result;
			if (setListeners) conf.emit("set", id, null, result);
			return result;
		};
	}
	conf = {
		original: original,
		memoized: memoized,
		profileName: options.profileName,
		get: function (args) {
			if (resolve) args = resolve(args);
			if (get) return get(args);
			return String(args[0]);
		},
		has: function (id) { return hasOwnProperty.call(cache, id); },
		delete: function (id) {
			var result;
			if (!hasOwnProperty.call(cache, id)) return;
			if (del) del(id);
			result = cache[id];
			delete cache[id];
			if (deleteListeners) conf.emit("delete", id, result);
		},
		clear: function () {
			var oldCache = cache;
			if (clear) clear();
			cache = create(null);
			conf.emit("clear", oldCache);
		},
		on: function (type, listener) {
			if (type === "get") getListeners = true;
			else if (type === "set") setListeners = true;
			else if (type === "delete") deleteListeners = true;
			return on.call(this, type, listener);
		},
		emit: emit,
		updateEnv: function () { original = conf.original; }
	};
	if (get) {
		extDel = defineLength(function (arg) {
			var id, args = arguments;
			if (resolve) args = resolve(args);
			id = get(args);
			if (id === null) return;
			conf.delete(id);
		}, memLength);
	} else if (length === 0) {
		extDel = function () { return conf.delete("data"); };
	} else {
		extDel = function (arg) {
			if (resolve) arg = resolve(arguments)[0];
			return conf.delete(arg);
		};
	}
	extGet = defineLength(function () {
		var id, args = arguments;
		if (length === 0) return cache.data;
		if (resolve) args = resolve(args);
		if (get) id = get(args);
		else id = String(args[0]);
		return cache[id];
	});
	extHas = defineLength(function () {
		var id, args = arguments;
		if (length === 0) return conf.has("data");
		if (resolve) args = resolve(args);
		if (get) id = get(args);
		else id = String(args[0]);
		if (id === null) return false;
		return conf.has(id);
	});
	defineProperties(memoized, {
		__memoized__: d(true),
		delete: d(extDel),
		clear: d(conf.clear),
		_get: d(extGet),
		_has: d(extHas)
	});
	return conf;
};


/***/ }),

/***/ "../node_modules/memoizee/lib/registered-extensions.js":
/*!*************************************************************!*\
  !*** ../node_modules/memoizee/lib/registered-extensions.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



/***/ }),

/***/ "../node_modules/memoizee/lib/resolve-length.js":
/*!******************************************************!*\
  !*** ../node_modules/memoizee/lib/resolve-length.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var toPosInt = __webpack_require__(/*! es5-ext/number/to-pos-integer */ "../node_modules/es5-ext/number/to-pos-integer.js");

module.exports = function (optsLength, fnLength, isAsync) {
	var length;
	if (isNaN(optsLength)) {
		length = fnLength;
		if (!(length >= 0)) return 1;
		if (isAsync && length) return length - 1;
		return length;
	}
	if (optsLength === false) return false;
	return toPosInt(optsLength);
};


/***/ }),

/***/ "../node_modules/memoizee/lib/resolve-normalize.js":
/*!*********************************************************!*\
  !*** ../node_modules/memoizee/lib/resolve-normalize.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var callable = __webpack_require__(/*! es5-ext/object/valid-callable */ "../node_modules/es5-ext/object/valid-callable.js");

module.exports = function (userNormalizer) {
	var normalizer;
	if (typeof userNormalizer === "function") return { set: userNormalizer, get: userNormalizer };
	normalizer = { get: callable(userNormalizer.get) };
	if (userNormalizer.set !== undefined) {
		normalizer.set = callable(userNormalizer.set);
		if (userNormalizer.delete) normalizer.delete = callable(userNormalizer.delete);
		if (userNormalizer.clear) normalizer.clear = callable(userNormalizer.clear);
		return normalizer;
	}
	normalizer.set = normalizer.get;
	return normalizer;
};


/***/ }),

/***/ "../node_modules/memoizee/lib/resolve-resolve.js":
/*!*******************************************************!*\
  !*** ../node_modules/memoizee/lib/resolve-resolve.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var toArray  = __webpack_require__(/*! es5-ext/array/to-array */ "../node_modules/es5-ext/array/to-array.js")
  , isValue  = __webpack_require__(/*! es5-ext/object/is-value */ "../node_modules/es5-ext/object/is-value.js")
  , callable = __webpack_require__(/*! es5-ext/object/valid-callable */ "../node_modules/es5-ext/object/valid-callable.js");

var slice = Array.prototype.slice, resolveArgs;

resolveArgs = function (args) {
	return this.map(function (resolve, i) {
		return resolve ? resolve(args[i]) : args[i];
	}).concat(slice.call(args, this.length));
};

module.exports = function (resolvers) {
	resolvers = toArray(resolvers);
	resolvers.forEach(function (resolve) {
		if (isValue(resolve)) callable(resolve);
	});
	return resolveArgs.bind(resolvers);
};


/***/ }),

/***/ "../node_modules/memoizee/normalizers/get-1.js":
/*!*****************************************************!*\
  !*** ../node_modules/memoizee/normalizers/get-1.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var indexOf = __webpack_require__(/*! es5-ext/array/#/e-index-of */ "../node_modules/es5-ext/array/#/e-index-of.js");

module.exports = function () {
	var lastId = 0, argsMap = [], cache = [];
	return {
		get: function (args) {
			var index = indexOf.call(argsMap, args[0]);
			return index === -1 ? null : cache[index];
		},
		set: function (args) {
			argsMap.push(args[0]);
			cache.push(++lastId);
			return lastId;
		},
		delete: function (id) {
			var index = indexOf.call(cache, id);
			if (index !== -1) {
				argsMap.splice(index, 1);
				cache.splice(index, 1);
			}
		},
		clear: function () {
			argsMap = [];
			cache = [];
		}
	};
};


/***/ }),

/***/ "../node_modules/memoizee/normalizers/get-fixed.js":
/*!*********************************************************!*\
  !*** ../node_modules/memoizee/normalizers/get-fixed.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var indexOf = __webpack_require__(/*! es5-ext/array/#/e-index-of */ "../node_modules/es5-ext/array/#/e-index-of.js")
  , create  = Object.create;

module.exports = function (length) {
	var lastId = 0, map = [[], []], cache = create(null);
	return {
		get: function (args) {
			var index = 0, set = map, i;
			while (index < length - 1) {
				i = indexOf.call(set[0], args[index]);
				if (i === -1) return null;
				set = set[1][i];
				++index;
			}
			i = indexOf.call(set[0], args[index]);
			if (i === -1) return null;
			return set[1][i] || null;
		},
		set: function (args) {
			var index = 0, set = map, i;
			while (index < length - 1) {
				i = indexOf.call(set[0], args[index]);
				if (i === -1) {
					i = set[0].push(args[index]) - 1;
					set[1].push([[], []]);
				}
				set = set[1][i];
				++index;
			}
			i = indexOf.call(set[0], args[index]);
			if (i === -1) {
				i = set[0].push(args[index]) - 1;
			}
			set[1][i] = ++lastId;
			cache[lastId] = args;
			return lastId;
		},
		delete: function (id) {
			var index = 0, set = map, i, path = [], args = cache[id];
			while (index < length - 1) {
				i = indexOf.call(set[0], args[index]);
				if (i === -1) {
					return;
				}
				path.push(set, i);
				set = set[1][i];
				++index;
			}
			i = indexOf.call(set[0], args[index]);
			if (i === -1) {
				return;
			}
			id = set[1][i];
			set[0].splice(i, 1);
			set[1].splice(i, 1);
			while (!set[0].length && path.length) {
				i = path.pop();
				set = path.pop();
				set[0].splice(i, 1);
				set[1].splice(i, 1);
			}
			delete cache[id];
		},
		clear: function () {
			map = [[], []];
			cache = create(null);
		}
	};
};


/***/ }),

/***/ "../node_modules/memoizee/normalizers/get-primitive-fixed.js":
/*!*******************************************************************!*\
  !*** ../node_modules/memoizee/normalizers/get-primitive-fixed.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (length) {
	if (!length) {
		return function () {
			return "";
		};
	}
	return function (args) {
		var id = String(args[0]), i = 0, currentLength = length;
		while (--currentLength) {
			id += "\u0001" + args[++i];
		}
		return id;
	};
};


/***/ }),

/***/ "../node_modules/memoizee/normalizers/get.js":
/*!***************************************************!*\
  !*** ../node_modules/memoizee/normalizers/get.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* eslint max-statements: 0 */



var indexOf = __webpack_require__(/*! es5-ext/array/#/e-index-of */ "../node_modules/es5-ext/array/#/e-index-of.js");

var create = Object.create;

module.exports = function () {
	var lastId = 0, map = [], cache = create(null);
	return {
		get: function (args) {
			var index = 0, set = map, i, length = args.length;
			if (length === 0) return set[length] || null;
			if ((set = set[length])) {
				while (index < length - 1) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) return null;
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) return null;
				return set[1][i] || null;
			}
			return null;
		},
		set: function (args) {
			var index = 0, set = map, i, length = args.length;
			if (length === 0) {
				set[length] = ++lastId;
			} else {
				if (!set[length]) {
					set[length] = [[], []];
				}
				set = set[length];
				while (index < length - 1) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						i = set[0].push(args[index]) - 1;
						set[1].push([[], []]);
					}
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) {
					i = set[0].push(args[index]) - 1;
				}
				set[1][i] = ++lastId;
			}
			cache[lastId] = args;
			return lastId;
		},
		delete: function (id) {
			var index = 0, set = map, i, args = cache[id], length = args.length, path = [];
			if (length === 0) {
				delete set[length];
			} else if ((set = set[length])) {
				while (index < length - 1) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						return;
					}
					path.push(set, i);
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) {
					return;
				}
				id = set[1][i];
				set[0].splice(i, 1);
				set[1].splice(i, 1);
				while (!set[0].length && path.length) {
					i = path.pop();
					set = path.pop();
					set[0].splice(i, 1);
					set[1].splice(i, 1);
				}
			}
			delete cache[id];
		},
		clear: function () {
			map = [];
			cache = create(null);
		}
	};
};


/***/ }),

/***/ "../node_modules/memoizee/normalizers/primitive.js":
/*!*********************************************************!*\
  !*** ../node_modules/memoizee/normalizers/primitive.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (args) {
	var id, i, length = args.length;
	if (!length) return "\u0002";
	id = String(args[i = 0]);
	while (--length) id += "\u0001" + args[++i];
	return id;
};


/***/ }),

/***/ "../node_modules/memoizee/plain.js":
/*!*****************************************!*\
  !*** ../node_modules/memoizee/plain.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var callable      = __webpack_require__(/*! es5-ext/object/valid-callable */ "../node_modules/es5-ext/object/valid-callable.js")
  , forEach       = __webpack_require__(/*! es5-ext/object/for-each */ "../node_modules/es5-ext/object/for-each.js")
  , extensions    = __webpack_require__(/*! ./lib/registered-extensions */ "../node_modules/memoizee/lib/registered-extensions.js")
  , configure     = __webpack_require__(/*! ./lib/configure-map */ "../node_modules/memoizee/lib/configure-map.js")
  , resolveLength = __webpack_require__(/*! ./lib/resolve-length */ "../node_modules/memoizee/lib/resolve-length.js");

module.exports = function self(fn /*, options */) {
	var options, length, conf;

	callable(fn);
	options = Object(arguments[1]);

	if (options.async && options.promise) {
		throw new Error("Options 'async' and 'promise' cannot be used together");
	}

	// Do not memoize already memoized function
	if (hasOwnProperty.call(fn, "__memoized__") && !options.force) return fn;

	// Resolve length;
	length = resolveLength(options.length, fn.length, options.async && extensions.async);

	// Configure cache map
	conf = configure(fn, length, options);

	// Bind eventual extensions
	forEach(extensions, function (extFn, name) {
		if (options[name]) extFn(options[name], conf, options);
	});

	if (self.__profiler__) self.__profiler__(conf);

	conf.updateEnv();
	return conf.memoized;
};


/***/ }),

/***/ "../node_modules/micromatch/index.js":
/*!*******************************************!*\
  !*** ../node_modules/micromatch/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const util = __webpack_require__(/*! util */ "../node_modules/util/util.js");
const braces = __webpack_require__(/*! braces */ "../node_modules/braces/index.js");
const picomatch = __webpack_require__(/*! picomatch */ "../node_modules/picomatch/index.js");
const utils = __webpack_require__(/*! picomatch/lib/utils */ "../node_modules/picomatch/lib/utils.js");
const isEmptyString = val => typeof val === 'string' && (val === '' || val === './');

/**
 * Returns an array of strings that match one or more glob patterns.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm(list, patterns[, options]);
 *
 * console.log(mm(['a.js', 'a.txt'], ['*.js']));
 * //=> [ 'a.js' ]
 * ```
 * @param {String|Array<string>} list List of strings to match.
 * @param {String|Array<string>} patterns One or more glob patterns to use for matching.
 * @param {Object} options See available [options](#options)
 * @return {Array} Returns an array of matches
 * @summary false
 * @api public
 */

const micromatch = (list, patterns, options) => {
  patterns = [].concat(patterns);
  list = [].concat(list);

  let omit = new Set();
  let keep = new Set();
  let items = new Set();
  let negatives = 0;

  let onResult = state => {
    items.add(state.output);
    if (options && options.onResult) {
      options.onResult(state);
    }
  };

  for (let i = 0; i < patterns.length; i++) {
    let isMatch = picomatch(String(patterns[i]), { ...options, onResult }, true);
    let negated = isMatch.state.negated || isMatch.state.negatedExtglob;
    if (negated) negatives++;

    for (let item of list) {
      let matched = isMatch(item, true);

      let match = negated ? !matched.isMatch : matched.isMatch;
      if (!match) continue;

      if (negated) {
        omit.add(matched.output);
      } else {
        omit.delete(matched.output);
        keep.add(matched.output);
      }
    }
  }

  let result = negatives === patterns.length ? [...items] : [...keep];
  let matches = result.filter(item => !omit.has(item));

  if (options && matches.length === 0) {
    if (options.failglob === true) {
      throw new Error(`No matches found for "${patterns.join(', ')}"`);
    }

    if (options.nonull === true || options.nullglob === true) {
      return options.unescape ? patterns.map(p => p.replace(/\\/g, '')) : patterns;
    }
  }

  return matches;
};

/**
 * Backwards compatibility
 */

micromatch.match = micromatch;

/**
 * Returns a matcher function from the given glob `pattern` and `options`.
 * The returned function takes a string to match as its only argument and returns
 * true if the string is a match.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.matcher(pattern[, options]);
 *
 * const isMatch = mm.matcher('*.!(*a)');
 * console.log(isMatch('a.a')); //=> false
 * console.log(isMatch('a.b')); //=> true
 * ```
 * @param {String} `pattern` Glob pattern
 * @param {Object} `options`
 * @return {Function} Returns a matcher function.
 * @api public
 */

micromatch.matcher = (pattern, options) => picomatch(pattern, options);

/**
 * Returns true if **any** of the given glob `patterns` match the specified `string`.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.isMatch(string, patterns[, options]);
 *
 * console.log(mm.isMatch('a.a', ['b.*', '*.a'])); //=> true
 * console.log(mm.isMatch('a.a', 'b.*')); //=> false
 * ```
 * @param {String} str The string to test.
 * @param {String|Array} patterns One or more glob patterns to use for matching.
 * @param {Object} [options] See available [options](#options).
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

micromatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);

/**
 * Backwards compatibility
 */

micromatch.any = micromatch.isMatch;

/**
 * Returns a list of strings that _**do not match any**_ of the given `patterns`.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.not(list, patterns[, options]);
 *
 * console.log(mm.not(['a.a', 'b.b', 'c.c'], '*.a'));
 * //=> ['b.b', 'c.c']
 * ```
 * @param {Array} `list` Array of strings to match.
 * @param {String|Array} `patterns` One or more glob pattern to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Array} Returns an array of strings that **do not match** the given patterns.
 * @api public
 */

micromatch.not = (list, patterns, options = {}) => {
  patterns = [].concat(patterns).map(String);
  let result = new Set();
  let items = [];

  let onResult = state => {
    if (options.onResult) options.onResult(state);
    items.push(state.output);
  };

  let matches = micromatch(list, patterns, { ...options, onResult });

  for (let item of items) {
    if (!matches.includes(item)) {
      result.add(item);
    }
  }
  return [...result];
};

/**
 * Returns true if the given `string` contains the given pattern. Similar
 * to [.isMatch](#isMatch) but the pattern can match any part of the string.
 *
 * ```js
 * var mm = require('micromatch');
 * // mm.contains(string, pattern[, options]);
 *
 * console.log(mm.contains('aa/bb/cc', '*b'));
 * //=> true
 * console.log(mm.contains('aa/bb/cc', '*d'));
 * //=> false
 * ```
 * @param {String} `str` The string to match.
 * @param {String|Array} `patterns` Glob pattern to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if the patter matches any part of `str`.
 * @api public
 */

micromatch.contains = (str, pattern, options) => {
  if (typeof str !== 'string') {
    throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
  }

  if (Array.isArray(pattern)) {
    return pattern.some(p => micromatch.contains(str, p, options));
  }

  if (typeof pattern === 'string') {
    if (isEmptyString(str) || isEmptyString(pattern)) {
      return false;
    }

    if (str.includes(pattern) || (str.startsWith('./') && str.slice(2).includes(pattern))) {
      return true;
    }
  }

  return micromatch.isMatch(str, pattern, { ...options, contains: true });
};

/**
 * Filter the keys of the given object with the given `glob` pattern
 * and `options`. Does not attempt to match nested keys. If you need this feature,
 * use [glob-object][] instead.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.matchKeys(object, patterns[, options]);
 *
 * const obj = { aa: 'a', ab: 'b', ac: 'c' };
 * console.log(mm.matchKeys(obj, '*b'));
 * //=> { ab: 'b' }
 * ```
 * @param {Object} `object` The object with keys to filter.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Object} Returns an object with only keys that match the given patterns.
 * @api public
 */

micromatch.matchKeys = (obj, patterns, options) => {
  if (!utils.isObject(obj)) {
    throw new TypeError('Expected the first argument to be an object');
  }
  let keys = micromatch(Object.keys(obj), patterns, options);
  let res = {};
  for (let key of keys) res[key] = obj[key];
  return res;
};

/**
 * Returns true if some of the strings in the given `list` match any of the given glob `patterns`.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.some(list, patterns[, options]);
 *
 * console.log(mm.some(['foo.js', 'bar.js'], ['*.js', '!foo.js']));
 * // true
 * console.log(mm.some(['foo.js'], ['*.js', '!foo.js']));
 * // false
 * ```
 * @param {String|Array} `list` The string or array of strings to test. Returns as soon as the first match is found.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

micromatch.some = (list, patterns, options) => {
  let items = [].concat(list);

  for (let pattern of [].concat(patterns)) {
    let isMatch = picomatch(String(pattern), options);
    if (items.some(item => isMatch(item))) {
      return true;
    }
  }
  return false;
};

/**
 * Returns true if every string in the given `list` matches
 * any of the given glob `patterns`.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.every(list, patterns[, options]);
 *
 * console.log(mm.every('foo.js', ['foo.js']));
 * // true
 * console.log(mm.every(['foo.js', 'bar.js'], ['*.js']));
 * // true
 * console.log(mm.every(['foo.js', 'bar.js'], ['*.js', '!foo.js']));
 * // false
 * console.log(mm.every(['foo.js'], ['*.js', '!foo.js']));
 * // false
 * ```
 * @param {String|Array} `list` The string or array of strings to test.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

micromatch.every = (list, patterns, options) => {
  let items = [].concat(list);

  for (let pattern of [].concat(patterns)) {
    let isMatch = picomatch(String(pattern), options);
    if (!items.every(item => isMatch(item))) {
      return false;
    }
  }
  return true;
};

/**
 * Returns true if **all** of the given `patterns` match
 * the specified string.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.all(string, patterns[, options]);
 *
 * console.log(mm.all('foo.js', ['foo.js']));
 * // true
 *
 * console.log(mm.all('foo.js', ['*.js', '!foo.js']));
 * // false
 *
 * console.log(mm.all('foo.js', ['*.js', 'foo.js']));
 * // true
 *
 * console.log(mm.all('foo.js', ['*.js', 'f*', '*o*', '*o.js']));
 * // true
 * ```
 * @param {String|Array} `str` The string to test.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

micromatch.all = (str, patterns, options) => {
  if (typeof str !== 'string') {
    throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
  }

  return [].concat(patterns).every(p => picomatch(p, options)(str));
};

/**
 * Returns an array of matches captured by `pattern` in `string, or `null` if the pattern did not match.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.capture(pattern, string[, options]);
 *
 * console.log(mm.capture('test/*.js', 'test/foo.js'));
 * //=> ['foo']
 * console.log(mm.capture('test/*.js', 'foo/bar.css'));
 * //=> null
 * ```
 * @param {String} `glob` Glob pattern to use for matching.
 * @param {String} `input` String to match
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns an array of captures if the input matches the glob pattern, otherwise `null`.
 * @api public
 */

micromatch.capture = (glob, input, options) => {
  let posix = utils.isWindows(options);
  let regex = picomatch.makeRe(String(glob), { ...options, capture: true });
  let match = regex.exec(posix ? utils.toPosixSlashes(input) : input);

  if (match) {
    return match.slice(1).map(v => v === void 0 ? '' : v);
  }
};

/**
 * Create a regular expression from the given glob `pattern`.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.makeRe(pattern[, options]);
 *
 * console.log(mm.makeRe('*.js'));
 * //=> /^(?:(\.[\\\/])?(?!\.)(?=.)[^\/]*?\.js)$/
 * ```
 * @param {String} `pattern` A glob pattern to convert to regex.
 * @param {Object} `options`
 * @return {RegExp} Returns a regex created from the given pattern.
 * @api public
 */

micromatch.makeRe = (...args) => picomatch.makeRe(...args);

/**
 * Scan a glob pattern to separate the pattern into segments. Used
 * by the [split](#split) method.
 *
 * ```js
 * const mm = require('micromatch');
 * const state = mm.scan(pattern[, options]);
 * ```
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {Object} Returns an object with
 * @api public
 */

micromatch.scan = (...args) => picomatch.scan(...args);

/**
 * Parse a glob pattern to create the source string for a regular
 * expression.
 *
 * ```js
 * const mm = require('micromatch');
 * const state = mm(pattern[, options]);
 * ```
 * @param {String} `glob`
 * @param {Object} `options`
 * @return {Object} Returns an object with useful properties and output to be used as regex source string.
 * @api public
 */

micromatch.parse = (patterns, options) => {
  let res = [];
  for (let pattern of [].concat(patterns || [])) {
    for (let str of braces(String(pattern), options)) {
      res.push(picomatch.parse(str, options));
    }
  }
  return res;
};

/**
 * Process the given brace `pattern`.
 *
 * ```js
 * const { braces } = require('micromatch');
 * console.log(braces('foo/{a,b,c}/bar'));
 * //=> [ 'foo/(a|b|c)/bar' ]
 *
 * console.log(braces('foo/{a,b,c}/bar', { expand: true }));
 * //=> [ 'foo/a/bar', 'foo/b/bar', 'foo/c/bar' ]
 * ```
 * @param {String} `pattern` String with brace pattern to process.
 * @param {Object} `options` Any [options](#options) to change how expansion is performed. See the [braces][] library for all available options.
 * @return {Array}
 * @api public
 */

micromatch.braces = (pattern, options) => {
  if (typeof pattern !== 'string') throw new TypeError('Expected a string');
  if ((options && options.nobrace === true) || !/\{.*\}/.test(pattern)) {
    return [pattern];
  }
  return braces(pattern, options);
};

/**
 * Expand braces
 */

micromatch.braceExpand = (pattern, options) => {
  if (typeof pattern !== 'string') throw new TypeError('Expected a string');
  return micromatch.braces(pattern, { ...options, expand: true });
};

/**
 * Expose micromatch
 */

module.exports = micromatch;


/***/ }),

/***/ "../node_modules/mustache/mustache.js":
/*!********************************************!*\
  !*** ../node_modules/mustache/mustache.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// This file has been generated from mustache.mjs
(function (global, factory) {
   true ? module.exports = factory() :
  undefined;
}(this, (function () { 'use strict';

  /*!
   * mustache.js - Logic-less {{mustache}} templates with JavaScript
   * http://github.com/janl/mustache.js
   */

  var objectToString = Object.prototype.toString;
  var isArray = Array.isArray || function isArrayPolyfill (object) {
    return objectToString.call(object) === '[object Array]';
  };

  function isFunction (object) {
    return typeof object === 'function';
  }

  /**
   * More correct typeof string handling array
   * which normally returns typeof 'object'
   */
  function typeStr (obj) {
    return isArray(obj) ? 'array' : typeof obj;
  }

  function escapeRegExp (string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }

  /**
   * Null safe way of checking whether or not an object,
   * including its prototype, has a given property
   */
  function hasProperty (obj, propName) {
    return obj != null && typeof obj === 'object' && (propName in obj);
  }

  /**
   * Safe way of detecting whether or not the given thing is a primitive and
   * whether it has the given property
   */
  function primitiveHasOwnProperty (primitive, propName) {
    return (
      primitive != null
      && typeof primitive !== 'object'
      && primitive.hasOwnProperty
      && primitive.hasOwnProperty(propName)
    );
  }

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var regExpTest = RegExp.prototype.test;
  function testRegExp (re, string) {
    return regExpTest.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace (string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  function escapeHtml (string) {
    return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   *
   * Tokens for partials also contain two more elements: 1) a string value of
   * indendation prior to that tag and 2) the index of that tag on that line -
   * eg a value of 2 indicates the partial is the third tag on this line.
   */
  function parseTemplate (template, tags) {
    if (!template)
      return [];
    var lineHasNonSpace = false;
    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?
    var indentation = '';  // Tracks indentation for tags that use it
    var tagIndex = 0;      // Stores a count of number of tags encountered on a line

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace () {
      if (hasTag && !nonSpace) {
        while (spaces.length)
          delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags (tagsToCompile) {
      if (typeof tagsToCompile === 'string')
        tagsToCompile = tagsToCompile.split(spaceRe, 2);

      if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
        throw new Error('Invalid tags: ' + tagsToCompile);

      openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
    }

    compileTags(tags || mustache.tags);

    var scanner = new Scanner(template);

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
            indentation += chr;
          } else {
            nonSpace = true;
            lineHasNonSpace = true;
            indentation += ' ';
          }

          tokens.push([ 'text', chr, start, start + 1 ]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n') {
            stripSpace();
            indentation = '';
            tagIndex = 0;
            lineHasNonSpace = false;
          }
        }
      }

      // Match the opening tag.
      if (!scanner.scan(openingTagRe))
        break;

      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      // Match the closing tag.
      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);

      if (type == '>') {
        token = [ type, value, start, scanner.pos, indentation, tagIndex, lineHasNonSpace ];
      } else {
        token = [ type, value, start, scanner.pos ];
      }
      tagIndex++;
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);

        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        compileTags(value);
      }
    }

    stripSpace();

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();

    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens (tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens (tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
        case '#':
        case '^':
          collector.push(token);
          sections.push(token);
          collector = token[4] = [];
          break;
        case '/':
          section = sections.pop();
          section[5] = token[2];
          collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
          break;
        default:
          collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner (string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function eos () {
    return this.tail === '';
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function scan (re) {
    var match = this.tail.match(re);

    if (!match || match.index !== 0)
      return '';

    var string = match[0];

    this.tail = this.tail.substring(string.length);
    this.pos += string.length;

    return string;
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function scanUntil (re) {
    var index = this.tail.search(re), match;

    switch (index) {
      case -1:
        match = this.tail;
        this.tail = '';
        break;
      case 0:
        match = '';
        break;
      default:
        match = this.tail.substring(0, index);
        this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context (view, parentContext) {
    this.view = view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function push (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function lookup (name) {
    var cache = this.cache;

    var value;
    if (cache.hasOwnProperty(name)) {
      value = cache[name];
    } else {
      var context = this, intermediateValue, names, index, lookupHit = false;

      while (context) {
        if (name.indexOf('.') > 0) {
          intermediateValue = context.view;
          names = name.split('.');
          index = 0;

          /**
           * Using the dot notion path in `name`, we descend through the
           * nested objects.
           *
           * To be certain that the lookup has been successful, we have to
           * check if the last object in the path actually has the property
           * we are looking for. We store the result in `lookupHit`.
           *
           * This is specially necessary for when the value has been set to
           * `undefined` and we want to avoid looking up parent contexts.
           *
           * In the case where dot notation is used, we consider the lookup
           * to be successful even if the last "object" in the path is
           * not actually an object but a primitive (e.g., a string, or an
           * integer), because it is sometimes useful to access a property
           * of an autoboxed primitive, such as the length of a string.
           **/
          while (intermediateValue != null && index < names.length) {
            if (index === names.length - 1)
              lookupHit = (
                hasProperty(intermediateValue, names[index])
                || primitiveHasOwnProperty(intermediateValue, names[index])
              );

            intermediateValue = intermediateValue[names[index++]];
          }
        } else {
          intermediateValue = context.view[name];

          /**
           * Only checking against `hasProperty`, which always returns `false` if
           * `context.view` is not an object. Deliberately omitting the check
           * against `primitiveHasOwnProperty` if dot notation is not used.
           *
           * Consider this example:
           * ```
           * Mustache.render("The length of a football field is {{#length}}{{length}}{{/length}}.", {length: "100 yards"})
           * ```
           *
           * If we were to check also against `primitiveHasOwnProperty`, as we do
           * in the dot notation case, then render call would return:
           *
           * "The length of a football field is 9."
           *
           * rather than the expected:
           *
           * "The length of a football field is 100 yards."
           **/
          lookupHit = hasProperty(context.view, name);
        }

        if (lookupHit) {
          value = intermediateValue;
          break;
        }

        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value))
      value = value.call(this.view);

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer () {
    this.templateCache = {
      _cache: {},
      set: function set (key, value) {
        this._cache[key] = value;
      },
      get: function get (key) {
        return this._cache[key];
      },
      clear: function clear () {
        this._cache = {};
      }
    };
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function clearCache () {
    if (typeof this.templateCache !== 'undefined') {
      this.templateCache.clear();
    }
  };

  /**
   * Parses and caches the given `template` according to the given `tags` or
   * `mustache.tags` if `tags` is omitted,  and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function parse (template, tags) {
    var cache = this.templateCache;
    var cacheKey = template + ':' + (tags || mustache.tags).join(':');
    var isCacheEnabled = typeof cache !== 'undefined';
    var tokens = isCacheEnabled ? cache.get(cacheKey) : undefined;

    if (tokens == undefined) {
      tokens = parseTemplate(template, tags);
      isCacheEnabled && cache.set(cacheKey, tokens);
    }
    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   *
   * If the optional `config` argument is given here, then it should be an
   * object with a `tags` attribute or an `escape` attribute or both.
   * If an array is passed, then it will be interpreted the same way as
   * a `tags` attribute on a `config` object.
   *
   * The `tags` attribute of a `config` object must be an array with two
   * string values: the opening and closing tags used in the template (e.g.
   * [ "<%", "%>" ]). The default is to mustache.tags.
   *
   * The `escape` attribute of a `config` object must be a function which
   * accepts a string as input and outputs a safely escaped string.
   * If an `escape` function is not provided, then an HTML-safe string
   * escaping function is used as the default.
   */
  Writer.prototype.render = function render (template, view, partials, config) {
    var tags = this.getConfigTags(config);
    var tokens = this.parse(template, tags);
    var context = (view instanceof Context) ? view : new Context(view, undefined);
    return this.renderTokens(tokens, context, partials, template, config);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function renderTokens (tokens, context, partials, originalTemplate, config) {
    var buffer = '';

    var token, symbol, value;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];

      if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate, config);
      else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate, config);
      else if (symbol === '>') value = this.renderPartial(token, context, partials, config);
      else if (symbol === '&') value = this.unescapedValue(token, context);
      else if (symbol === 'name') value = this.escapedValue(token, context, config);
      else if (symbol === 'text') value = this.rawValue(token);

      if (value !== undefined)
        buffer += value;
    }

    return buffer;
  };

  Writer.prototype.renderSection = function renderSection (token, context, partials, originalTemplate, config) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    function subRender (template) {
      return self.render(template, context, partials, config);
    }

    if (!value) return;

    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate, config);
      }
    } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate, config);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string')
        throw new Error('Cannot use higher-order sections without the original template');

      // Extract the portion of the original template that the section contains.
      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

      if (value != null)
        buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate, config);
    }
    return buffer;
  };

  Writer.prototype.renderInverted = function renderInverted (token, context, partials, originalTemplate, config) {
    var value = context.lookup(token[1]);

    // Use JavaScript's definition of falsy. Include empty arrays.
    // See https://github.com/janl/mustache.js/issues/186
    if (!value || (isArray(value) && value.length === 0))
      return this.renderTokens(token[4], context, partials, originalTemplate, config);
  };

  Writer.prototype.indentPartial = function indentPartial (partial, indentation, lineHasNonSpace) {
    var filteredIndentation = indentation.replace(/[^ \t]/g, '');
    var partialByNl = partial.split('\n');
    for (var i = 0; i < partialByNl.length; i++) {
      if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
        partialByNl[i] = filteredIndentation + partialByNl[i];
      }
    }
    return partialByNl.join('\n');
  };

  Writer.prototype.renderPartial = function renderPartial (token, context, partials, config) {
    if (!partials) return;
    var tags = this.getConfigTags(config);

    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null) {
      var lineHasNonSpace = token[6];
      var tagIndex = token[5];
      var indentation = token[4];
      var indentedValue = value;
      if (tagIndex == 0 && indentation) {
        indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
      }
      var tokens = this.parse(indentedValue, tags);
      return this.renderTokens(tokens, context, partials, indentedValue, config);
    }
  };

  Writer.prototype.unescapedValue = function unescapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return value;
  };

  Writer.prototype.escapedValue = function escapedValue (token, context, config) {
    var escape = this.getConfigEscape(config) || mustache.escape;
    var value = context.lookup(token[1]);
    if (value != null)
      return (typeof value === 'number' && escape === mustache.escape) ? String(value) : escape(value);
  };

  Writer.prototype.rawValue = function rawValue (token) {
    return token[1];
  };

  Writer.prototype.getConfigTags = function getConfigTags (config) {
    if (isArray(config)) {
      return config;
    }
    else if (config && typeof config === 'object') {
      return config.tags;
    }
    else {
      return undefined;
    }
  };

  Writer.prototype.getConfigEscape = function getConfigEscape (config) {
    if (config && typeof config === 'object' && !isArray(config)) {
      return config.escape;
    }
    else {
      return undefined;
    }
  };

  var mustache = {
    name: 'mustache.js',
    version: '4.1.0',
    tags: [ '{{', '}}' ],
    clearCache: undefined,
    escape: undefined,
    parse: undefined,
    render: undefined,
    Scanner: undefined,
    Context: undefined,
    Writer: undefined,
    /**
     * Allows a user to override the default caching strategy, by providing an
     * object with set, get and clear methods. This can also be used to disable
     * the cache by setting it to the literal `undefined`.
     */
    set templateCache (cache) {
      defaultWriter.templateCache = cache;
    },
    /**
     * Gets the default or overridden caching object from the default writer.
     */
    get templateCache () {
      return defaultWriter.templateCache;
    }
  };

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function clearCache () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function parse (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view`, `partials`, and `config`
   * using the default writer.
   */
  mustache.render = function render (template, view, partials, config) {
    if (typeof template !== 'string') {
      throw new TypeError('Invalid template! Template should be a "string" ' +
                          'but "' + typeStr(template) + '" was given as the first ' +
                          'argument for mustache#render(template, view, partials)');
    }

    return defaultWriter.render(template, view, partials, config);
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

  return mustache;

})));


/***/ }),

/***/ "../node_modules/next-tick/index.js":
/*!******************************************!*\
  !*** ../node_modules/next-tick/index.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process, setImmediate) {

var ensureCallable = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

var byObserver = function (Observer) {
	var node = document.createTextNode(''), queue, currentQueue, i = 0;
	new Observer(function () {
		var callback;
		if (!queue) {
			if (!currentQueue) return;
			queue = currentQueue;
		} else if (currentQueue) {
			queue = currentQueue.concat(queue);
		}
		currentQueue = queue;
		queue = null;
		if (typeof currentQueue === 'function') {
			callback = currentQueue;
			currentQueue = null;
			callback();
			return;
		}
		node.data = (i = ++i % 2); // Invoke other batch, to handle leftover callbacks in case of crash
		while (currentQueue) {
			callback = currentQueue.shift();
			if (!currentQueue.length) currentQueue = null;
			callback();
		}
	}).observe(node, { characterData: true });
	return function (fn) {
		ensureCallable(fn);
		if (queue) {
			if (typeof queue === 'function') queue = [queue, fn];
			else queue.push(fn);
			return;
		}
		queue = fn;
		node.data = (i = ++i % 2);
	};
};

module.exports = (function () {
	// Node.js
	if ((typeof process === 'object') && process && (typeof process.nextTick === 'function')) {
		return process.nextTick;
	}

	// queueMicrotask
	if (typeof queueMicrotask === "function") {
		return function (cb) { queueMicrotask(ensureCallable(cb)); };
	}

	// MutationObserver
	if ((typeof document === 'object') && document) {
		if (typeof MutationObserver === 'function') return byObserver(MutationObserver);
		if (typeof WebKitMutationObserver === 'function') return byObserver(WebKitMutationObserver);
	}

	// W3C Draft
	// http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
	if (typeof setImmediate === 'function') {
		return function (cb) { setImmediate(ensureCallable(cb)); };
	}

	// Wide available standard
	if ((typeof setTimeout === 'function') || (typeof setTimeout === 'object')) {
		return function (cb) { setTimeout(ensureCallable(cb), 0); };
	}

	return null;
}());

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../process/browser.js */ "../node_modules/process/browser.js"), __webpack_require__(/*! ./../timers-browserify/main.js */ "../node_modules/timers-browserify/main.js").setImmediate))

/***/ }),

/***/ "../node_modules/path-browserify/index.js":
/*!************************************************!*\
  !*** ../node_modules/path-browserify/index.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../process/browser.js */ "../node_modules/process/browser.js")))

/***/ }),

/***/ "../node_modules/picomatch/index.js":
/*!******************************************!*\
  !*** ../node_modules/picomatch/index.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(/*! ./lib/picomatch */ "../node_modules/picomatch/lib/picomatch.js");


/***/ }),

/***/ "../node_modules/picomatch/lib/constants.js":
/*!**************************************************!*\
  !*** ../node_modules/picomatch/lib/constants.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const path = __webpack_require__(/*! path */ "../node_modules/path-browserify/index.js");
const WIN_SLASH = '\\\\/';
const WIN_NO_SLASH = `[^${WIN_SLASH}]`;

/**
 * Posix glob regex
 */

const DOT_LITERAL = '\\.';
const PLUS_LITERAL = '\\+';
const QMARK_LITERAL = '\\?';
const SLASH_LITERAL = '\\/';
const ONE_CHAR = '(?=.)';
const QMARK = '[^/]';
const END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
const START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
const DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
const NO_DOT = `(?!${DOT_LITERAL})`;
const NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
const NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
const NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
const QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
const STAR = `${QMARK}*?`;

const POSIX_CHARS = {
  DOT_LITERAL,
  PLUS_LITERAL,
  QMARK_LITERAL,
  SLASH_LITERAL,
  ONE_CHAR,
  QMARK,
  END_ANCHOR,
  DOTS_SLASH,
  NO_DOT,
  NO_DOTS,
  NO_DOT_SLASH,
  NO_DOTS_SLASH,
  QMARK_NO_DOT,
  STAR,
  START_ANCHOR
};

/**
 * Windows glob regex
 */

const WINDOWS_CHARS = {
  ...POSIX_CHARS,

  SLASH_LITERAL: `[${WIN_SLASH}]`,
  QMARK: WIN_NO_SLASH,
  STAR: `${WIN_NO_SLASH}*?`,
  DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
  NO_DOT: `(?!${DOT_LITERAL})`,
  NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
  NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
  START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
  END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
};

/**
 * POSIX Bracket Regex
 */

const POSIX_REGEX_SOURCE = {
  alnum: 'a-zA-Z0-9',
  alpha: 'a-zA-Z',
  ascii: '\\x00-\\x7F',
  blank: ' \\t',
  cntrl: '\\x00-\\x1F\\x7F',
  digit: '0-9',
  graph: '\\x21-\\x7E',
  lower: 'a-z',
  print: '\\x20-\\x7E ',
  punct: '\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~',
  space: ' \\t\\r\\n\\v\\f',
  upper: 'A-Z',
  word: 'A-Za-z0-9_',
  xdigit: 'A-Fa-f0-9'
};

module.exports = {
  MAX_LENGTH: 1024 * 64,
  POSIX_REGEX_SOURCE,

  // regular expressions
  REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
  REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
  REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
  REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
  REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
  REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,

  // Replace globs with equivalent patterns to reduce parsing time.
  REPLACEMENTS: {
    '***': '*',
    '**/**': '**',
    '**/**/**': '**'
  },

  // Digits
  CHAR_0: 48, /* 0 */
  CHAR_9: 57, /* 9 */

  // Alphabet chars.
  CHAR_UPPERCASE_A: 65, /* A */
  CHAR_LOWERCASE_A: 97, /* a */
  CHAR_UPPERCASE_Z: 90, /* Z */
  CHAR_LOWERCASE_Z: 122, /* z */

  CHAR_LEFT_PARENTHESES: 40, /* ( */
  CHAR_RIGHT_PARENTHESES: 41, /* ) */

  CHAR_ASTERISK: 42, /* * */

  // Non-alphabetic chars.
  CHAR_AMPERSAND: 38, /* & */
  CHAR_AT: 64, /* @ */
  CHAR_BACKWARD_SLASH: 92, /* \ */
  CHAR_CARRIAGE_RETURN: 13, /* \r */
  CHAR_CIRCUMFLEX_ACCENT: 94, /* ^ */
  CHAR_COLON: 58, /* : */
  CHAR_COMMA: 44, /* , */
  CHAR_DOT: 46, /* . */
  CHAR_DOUBLE_QUOTE: 34, /* " */
  CHAR_EQUAL: 61, /* = */
  CHAR_EXCLAMATION_MARK: 33, /* ! */
  CHAR_FORM_FEED: 12, /* \f */
  CHAR_FORWARD_SLASH: 47, /* / */
  CHAR_GRAVE_ACCENT: 96, /* ` */
  CHAR_HASH: 35, /* # */
  CHAR_HYPHEN_MINUS: 45, /* - */
  CHAR_LEFT_ANGLE_BRACKET: 60, /* < */
  CHAR_LEFT_CURLY_BRACE: 123, /* { */
  CHAR_LEFT_SQUARE_BRACKET: 91, /* [ */
  CHAR_LINE_FEED: 10, /* \n */
  CHAR_NO_BREAK_SPACE: 160, /* \u00A0 */
  CHAR_PERCENT: 37, /* % */
  CHAR_PLUS: 43, /* + */
  CHAR_QUESTION_MARK: 63, /* ? */
  CHAR_RIGHT_ANGLE_BRACKET: 62, /* > */
  CHAR_RIGHT_CURLY_BRACE: 125, /* } */
  CHAR_RIGHT_SQUARE_BRACKET: 93, /* ] */
  CHAR_SEMICOLON: 59, /* ; */
  CHAR_SINGLE_QUOTE: 39, /* ' */
  CHAR_SPACE: 32, /*   */
  CHAR_TAB: 9, /* \t */
  CHAR_UNDERSCORE: 95, /* _ */
  CHAR_VERTICAL_LINE: 124, /* | */
  CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279, /* \uFEFF */

  SEP: path.sep,

  /**
   * Create EXTGLOB_CHARS
   */

  extglobChars(chars) {
    return {
      '!': { type: 'negate', open: '(?:(?!(?:', close: `))${chars.STAR})` },
      '?': { type: 'qmark', open: '(?:', close: ')?' },
      '+': { type: 'plus', open: '(?:', close: ')+' },
      '*': { type: 'star', open: '(?:', close: ')*' },
      '@': { type: 'at', open: '(?:', close: ')' }
    };
  },

  /**
   * Create GLOB_CHARS
   */

  globChars(win32) {
    return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
  }
};


/***/ }),

/***/ "../node_modules/picomatch/lib/parse.js":
/*!**********************************************!*\
  !*** ../node_modules/picomatch/lib/parse.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const constants = __webpack_require__(/*! ./constants */ "../node_modules/picomatch/lib/constants.js");
const utils = __webpack_require__(/*! ./utils */ "../node_modules/picomatch/lib/utils.js");

/**
 * Constants
 */

const {
  MAX_LENGTH,
  POSIX_REGEX_SOURCE,
  REGEX_NON_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_BACKREF,
  REPLACEMENTS
} = constants;

/**
 * Helpers
 */

const expandRange = (args, options) => {
  if (typeof options.expandRange === 'function') {
    return options.expandRange(...args, options);
  }

  args.sort();
  const value = `[${args.join('-')}]`;

  try {
    /* eslint-disable-next-line no-new */
    new RegExp(value);
  } catch (ex) {
    return args.map(v => utils.escapeRegex(v)).join('..');
  }

  return value;
};

/**
 * Create the message for a syntax error
 */

const syntaxError = (type, char) => {
  return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
};

/**
 * Parse the given input string.
 * @param {String} input
 * @param {Object} options
 * @return {Object}
 */

const parse = (input, options) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string');
  }

  input = REPLACEMENTS[input] || input;

  const opts = { ...options };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;

  let len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  const bos = { type: 'bos', value: '', output: opts.prepend || '' };
  const tokens = [bos];

  const capture = opts.capture ? '' : '?:';
  const win32 = utils.isWindows(options);

  // create constants based on platform, for windows or posix
  const PLATFORM_CHARS = constants.globChars(win32);
  const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);

  const {
    DOT_LITERAL,
    PLUS_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOT_SLASH,
    NO_DOTS_SLASH,
    QMARK,
    QMARK_NO_DOT,
    STAR,
    START_ANCHOR
  } = PLATFORM_CHARS;

  const globstar = (opts) => {
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const nodot = opts.dot ? '' : NO_DOT;
  const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
  let star = opts.bash === true ? globstar(opts) : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  // minimatch options support
  if (typeof opts.noext === 'boolean') {
    opts.noextglob = opts.noext;
  }

  const state = {
    input,
    index: -1,
    start: 0,
    dot: opts.dot === true,
    consumed: '',
    output: '',
    prefix: '',
    backtrack: false,
    negated: false,
    brackets: 0,
    braces: 0,
    parens: 0,
    quotes: 0,
    globstar: false,
    tokens
  };

  input = utils.removePrefix(input, state);
  len = input.length;

  const extglobs = [];
  const braces = [];
  const stack = [];
  let prev = bos;
  let value;

  /**
   * Tokenizing helpers
   */

  const eos = () => state.index === len - 1;
  const peek = state.peek = (n = 1) => input[state.index + n];
  const advance = state.advance = () => input[++state.index];
  const remaining = () => input.slice(state.index + 1);
  const consume = (value = '', num = 0) => {
    state.consumed += value;
    state.index += num;
  };
  const append = token => {
    state.output += token.output != null ? token.output : token.value;
    consume(token.value);
  };

  const negate = () => {
    let count = 1;

    while (peek() === '!' && (peek(2) !== '(' || peek(3) === '?')) {
      advance();
      state.start++;
      count++;
    }

    if (count % 2 === 0) {
      return false;
    }

    state.negated = true;
    state.start++;
    return true;
  };

  const increment = type => {
    state[type]++;
    stack.push(type);
  };

  const decrement = type => {
    state[type]--;
    stack.pop();
  };

  /**
   * Push tokens onto the tokens array. This helper speeds up
   * tokenizing by 1) helping us avoid backtracking as much as possible,
   * and 2) helping us avoid creating extra tokens when consecutive
   * characters are plain text. This improves performance and simplifies
   * lookbehinds.
   */

  const push = tok => {
    if (prev.type === 'globstar') {
      const isBrace = state.braces > 0 && (tok.type === 'comma' || tok.type === 'brace');
      const isExtglob = tok.extglob === true || (extglobs.length && (tok.type === 'pipe' || tok.type === 'paren'));

      if (tok.type !== 'slash' && tok.type !== 'paren' && !isBrace && !isExtglob) {
        state.output = state.output.slice(0, -prev.output.length);
        prev.type = 'star';
        prev.value = '*';
        prev.output = star;
        state.output += prev.output;
      }
    }

    if (extglobs.length && tok.type !== 'paren' && !EXTGLOB_CHARS[tok.value]) {
      extglobs[extglobs.length - 1].inner += tok.value;
    }

    if (tok.value || tok.output) append(tok);
    if (prev && prev.type === 'text' && tok.type === 'text') {
      prev.value += tok.value;
      prev.output = (prev.output || '') + tok.value;
      return;
    }

    tok.prev = prev;
    tokens.push(tok);
    prev = tok;
  };

  const extglobOpen = (type, value) => {
    const token = { ...EXTGLOB_CHARS[value], conditions: 1, inner: '' };

    token.prev = prev;
    token.parens = state.parens;
    token.output = state.output;
    const output = (opts.capture ? '(' : '') + token.open;

    increment('parens');
    push({ type, value, output: state.output ? '' : ONE_CHAR });
    push({ type: 'paren', extglob: true, value: advance(), output });
    extglobs.push(token);
  };

  const extglobClose = token => {
    let output = token.close + (opts.capture ? ')' : '');

    if (token.type === 'negate') {
      let extglobStar = star;

      if (token.inner && token.inner.length > 1 && token.inner.includes('/')) {
        extglobStar = globstar(opts);
      }

      if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
        output = token.close = `)$))${extglobStar}`;
      }

      if (token.prev.type === 'bos' && eos()) {
        state.negatedExtglob = true;
      }
    }

    push({ type: 'paren', extglob: true, value, output });
    decrement('parens');
  };

  /**
   * Fast paths
   */

  if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
    let backslashes = false;

    let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
      if (first === '\\') {
        backslashes = true;
        return m;
      }

      if (first === '?') {
        if (esc) {
          return esc + first + (rest ? QMARK.repeat(rest.length) : '');
        }
        if (index === 0) {
          return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : '');
        }
        return QMARK.repeat(chars.length);
      }

      if (first === '.') {
        return DOT_LITERAL.repeat(chars.length);
      }

      if (first === '*') {
        if (esc) {
          return esc + first + (rest ? star : '');
        }
        return star;
      }
      return esc ? m : `\\${m}`;
    });

    if (backslashes === true) {
      if (opts.unescape === true) {
        output = output.replace(/\\/g, '');
      } else {
        output = output.replace(/\\+/g, m => {
          return m.length % 2 === 0 ? '\\\\' : (m ? '\\' : '');
        });
      }
    }

    if (output === input && opts.contains === true) {
      state.output = input;
      return state;
    }

    state.output = utils.wrapOutput(output, state, options);
    return state;
  }

  /**
   * Tokenize input until we reach end-of-string
   */

  while (!eos()) {
    value = advance();

    if (value === '\u0000') {
      continue;
    }

    /**
     * Escaped characters
     */

    if (value === '\\') {
      const next = peek();

      if (next === '/' && opts.bash !== true) {
        continue;
      }

      if (next === '.' || next === ';') {
        continue;
      }

      if (!next) {
        value += '\\';
        push({ type: 'text', value });
        continue;
      }

      // collapse slashes to reduce potential for exploits
      const match = /^\\+/.exec(remaining());
      let slashes = 0;

      if (match && match[0].length > 2) {
        slashes = match[0].length;
        state.index += slashes;
        if (slashes % 2 !== 0) {
          value += '\\';
        }
      }

      if (opts.unescape === true) {
        value = advance() || '';
      } else {
        value += advance() || '';
      }

      if (state.brackets === 0) {
        push({ type: 'text', value });
        continue;
      }
    }

    /**
     * If we're inside a regex character class, continue
     * until we reach the closing bracket.
     */

    if (state.brackets > 0 && (value !== ']' || prev.value === '[' || prev.value === '[^')) {
      if (opts.posix !== false && value === ':') {
        const inner = prev.value.slice(1);
        if (inner.includes('[')) {
          prev.posix = true;

          if (inner.includes(':')) {
            const idx = prev.value.lastIndexOf('[');
            const pre = prev.value.slice(0, idx);
            const rest = prev.value.slice(idx + 2);
            const posix = POSIX_REGEX_SOURCE[rest];
            if (posix) {
              prev.value = pre + posix;
              state.backtrack = true;
              advance();

              if (!bos.output && tokens.indexOf(prev) === 1) {
                bos.output = ONE_CHAR;
              }
              continue;
            }
          }
        }
      }

      if ((value === '[' && peek() !== ':') || (value === '-' && peek() === ']')) {
        value = `\\${value}`;
      }

      if (value === ']' && (prev.value === '[' || prev.value === '[^')) {
        value = `\\${value}`;
      }

      if (opts.posix === true && value === '!' && prev.value === '[') {
        value = '^';
      }

      prev.value += value;
      append({ value });
      continue;
    }

    /**
     * If we're inside a quoted string, continue
     * until we reach the closing double quote.
     */

    if (state.quotes === 1 && value !== '"') {
      value = utils.escapeRegex(value);
      prev.value += value;
      append({ value });
      continue;
    }

    /**
     * Double quotes
     */

    if (value === '"') {
      state.quotes = state.quotes === 1 ? 0 : 1;
      if (opts.keepQuotes === true) {
        push({ type: 'text', value });
      }
      continue;
    }

    /**
     * Parentheses
     */

    if (value === '(') {
      increment('parens');
      push({ type: 'paren', value });
      continue;
    }

    if (value === ')') {
      if (state.parens === 0 && opts.strictBrackets === true) {
        throw new SyntaxError(syntaxError('opening', '('));
      }

      const extglob = extglobs[extglobs.length - 1];
      if (extglob && state.parens === extglob.parens + 1) {
        extglobClose(extglobs.pop());
        continue;
      }

      push({ type: 'paren', value, output: state.parens ? ')' : '\\)' });
      decrement('parens');
      continue;
    }

    /**
     * Square brackets
     */

    if (value === '[') {
      if (opts.nobracket === true || !remaining().includes(']')) {
        if (opts.nobracket !== true && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('closing', ']'));
        }

        value = `\\${value}`;
      } else {
        increment('brackets');
      }

      push({ type: 'bracket', value });
      continue;
    }

    if (value === ']') {
      if (opts.nobracket === true || (prev && prev.type === 'bracket' && prev.value.length === 1)) {
        push({ type: 'text', value, output: `\\${value}` });
        continue;
      }

      if (state.brackets === 0) {
        if (opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('opening', '['));
        }

        push({ type: 'text', value, output: `\\${value}` });
        continue;
      }

      decrement('brackets');

      const prevValue = prev.value.slice(1);
      if (prev.posix !== true && prevValue[0] === '^' && !prevValue.includes('/')) {
        value = `/${value}`;
      }

      prev.value += value;
      append({ value });

      // when literal brackets are explicitly disabled
      // assume we should match with a regex character class
      if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
        continue;
      }

      const escaped = utils.escapeRegex(prev.value);
      state.output = state.output.slice(0, -prev.value.length);

      // when literal brackets are explicitly enabled
      // assume we should escape the brackets to match literal characters
      if (opts.literalBrackets === true) {
        state.output += escaped;
        prev.value = escaped;
        continue;
      }

      // when the user specifies nothing, try to match both
      prev.value = `(${capture}${escaped}|${prev.value})`;
      state.output += prev.value;
      continue;
    }

    /**
     * Braces
     */

    if (value === '{' && opts.nobrace !== true) {
      increment('braces');

      const open = {
        type: 'brace',
        value,
        output: '(',
        outputIndex: state.output.length,
        tokensIndex: state.tokens.length
      };

      braces.push(open);
      push(open);
      continue;
    }

    if (value === '}') {
      const brace = braces[braces.length - 1];

      if (opts.nobrace === true || !brace) {
        push({ type: 'text', value, output: value });
        continue;
      }

      let output = ')';

      if (brace.dots === true) {
        const arr = tokens.slice();
        const range = [];

        for (let i = arr.length - 1; i >= 0; i--) {
          tokens.pop();
          if (arr[i].type === 'brace') {
            break;
          }
          if (arr[i].type !== 'dots') {
            range.unshift(arr[i].value);
          }
        }

        output = expandRange(range, opts);
        state.backtrack = true;
      }

      if (brace.comma !== true && brace.dots !== true) {
        const out = state.output.slice(0, brace.outputIndex);
        const toks = state.tokens.slice(brace.tokensIndex);
        brace.value = brace.output = '\\{';
        value = output = '\\}';
        state.output = out;
        for (const t of toks) {
          state.output += (t.output || t.value);
        }
      }

      push({ type: 'brace', value, output });
      decrement('braces');
      braces.pop();
      continue;
    }

    /**
     * Pipes
     */

    if (value === '|') {
      if (extglobs.length > 0) {
        extglobs[extglobs.length - 1].conditions++;
      }
      push({ type: 'text', value });
      continue;
    }

    /**
     * Commas
     */

    if (value === ',') {
      let output = value;

      const brace = braces[braces.length - 1];
      if (brace && stack[stack.length - 1] === 'braces') {
        brace.comma = true;
        output = '|';
      }

      push({ type: 'comma', value, output });
      continue;
    }

    /**
     * Slashes
     */

    if (value === '/') {
      // if the beginning of the glob is "./", advance the start
      // to the current index, and don't add the "./" characters
      // to the state. This greatly simplifies lookbehinds when
      // checking for BOS characters like "!" and "." (not "./")
      if (prev.type === 'dot' && state.index === state.start + 1) {
        state.start = state.index + 1;
        state.consumed = '';
        state.output = '';
        tokens.pop();
        prev = bos; // reset "prev" to the first token
        continue;
      }

      push({ type: 'slash', value, output: SLASH_LITERAL });
      continue;
    }

    /**
     * Dots
     */

    if (value === '.') {
      if (state.braces > 0 && prev.type === 'dot') {
        if (prev.value === '.') prev.output = DOT_LITERAL;
        const brace = braces[braces.length - 1];
        prev.type = 'dots';
        prev.output += value;
        prev.value += value;
        brace.dots = true;
        continue;
      }

      if ((state.braces + state.parens) === 0 && prev.type !== 'bos' && prev.type !== 'slash') {
        push({ type: 'text', value, output: DOT_LITERAL });
        continue;
      }

      push({ type: 'dot', value, output: DOT_LITERAL });
      continue;
    }

    /**
     * Question marks
     */

    if (value === '?') {
      const isGroup = prev && prev.value === '(';
      if (!isGroup && opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('qmark', value);
        continue;
      }

      if (prev && prev.type === 'paren') {
        const next = peek();
        let output = value;

        if (next === '<' && !utils.supportsLookbehinds()) {
          throw new Error('Node.js v10 or higher is required for regex lookbehinds');
        }

        if ((prev.value === '(' && !/[!=<:]/.test(next)) || (next === '<' && !/<([!=]|\w+>)/.test(remaining()))) {
          output = `\\${value}`;
        }

        push({ type: 'text', value, output });
        continue;
      }

      if (opts.dot !== true && (prev.type === 'slash' || prev.type === 'bos')) {
        push({ type: 'qmark', value, output: QMARK_NO_DOT });
        continue;
      }

      push({ type: 'qmark', value, output: QMARK });
      continue;
    }

    /**
     * Exclamation
     */

    if (value === '!') {
      if (opts.noextglob !== true && peek() === '(') {
        if (peek(2) !== '?' || !/[!=<:]/.test(peek(3))) {
          extglobOpen('negate', value);
          continue;
        }
      }

      if (opts.nonegate !== true && state.index === 0) {
        negate();
        continue;
      }
    }

    /**
     * Plus
     */

    if (value === '+') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('plus', value);
        continue;
      }

      if ((prev && prev.value === '(') || opts.regex === false) {
        push({ type: 'plus', value, output: PLUS_LITERAL });
        continue;
      }

      if ((prev && (prev.type === 'bracket' || prev.type === 'paren' || prev.type === 'brace')) || state.parens > 0) {
        push({ type: 'plus', value });
        continue;
      }

      push({ type: 'plus', value: PLUS_LITERAL });
      continue;
    }

    /**
     * Plain text
     */

    if (value === '@') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        push({ type: 'at', extglob: true, value, output: '' });
        continue;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Plain text
     */

    if (value !== '*') {
      if (value === '$' || value === '^') {
        value = `\\${value}`;
      }

      const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
      if (match) {
        value += match[0];
        state.index += match[0].length;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Stars
     */

    if (prev && (prev.type === 'globstar' || prev.star === true)) {
      prev.type = 'star';
      prev.star = true;
      prev.value += value;
      prev.output = star;
      state.backtrack = true;
      state.globstar = true;
      consume(value);
      continue;
    }

    let rest = remaining();
    if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
      extglobOpen('star', value);
      continue;
    }

    if (prev.type === 'star') {
      if (opts.noglobstar === true) {
        consume(value);
        continue;
      }

      const prior = prev.prev;
      const before = prior.prev;
      const isStart = prior.type === 'slash' || prior.type === 'bos';
      const afterStar = before && (before.type === 'star' || before.type === 'globstar');

      if (opts.bash === true && (!isStart || (rest[0] && rest[0] !== '/'))) {
        push({ type: 'star', value, output: '' });
        continue;
      }

      const isBrace = state.braces > 0 && (prior.type === 'comma' || prior.type === 'brace');
      const isExtglob = extglobs.length && (prior.type === 'pipe' || prior.type === 'paren');
      if (!isStart && prior.type !== 'paren' && !isBrace && !isExtglob) {
        push({ type: 'star', value, output: '' });
        continue;
      }

      // strip consecutive `/**/`
      while (rest.slice(0, 3) === '/**') {
        const after = input[state.index + 4];
        if (after && after !== '/') {
          break;
        }
        rest = rest.slice(3);
        consume('/**', 3);
      }

      if (prior.type === 'bos' && eos()) {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = globstar(opts);
        state.output = prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && !afterStar && eos()) {
        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;

        prev.type = 'globstar';
        prev.output = globstar(opts) + (opts.strictSlashes ? ')' : '|$)');
        prev.value += value;
        state.globstar = true;
        state.output += prior.output + prev.output;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && rest[0] === '/') {
        const end = rest[1] !== void 0 ? '|$' : '';

        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;

        prev.type = 'globstar';
        prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
        prev.value += value;

        state.output += prior.output + prev.output;
        state.globstar = true;

        consume(value + advance());

        push({ type: 'slash', value: '/', output: '' });
        continue;
      }

      if (prior.type === 'bos' && rest[0] === '/') {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
        state.output = prev.output;
        state.globstar = true;
        consume(value + advance());
        push({ type: 'slash', value: '/', output: '' });
        continue;
      }

      // remove single star from output
      state.output = state.output.slice(0, -prev.output.length);

      // reset previous token to globstar
      prev.type = 'globstar';
      prev.output = globstar(opts);
      prev.value += value;

      // reset output with globstar
      state.output += prev.output;
      state.globstar = true;
      consume(value);
      continue;
    }

    const token = { type: 'star', value, output: star };

    if (opts.bash === true) {
      token.output = '.*?';
      if (prev.type === 'bos' || prev.type === 'slash') {
        token.output = nodot + token.output;
      }
      push(token);
      continue;
    }

    if (prev && (prev.type === 'bracket' || prev.type === 'paren') && opts.regex === true) {
      token.output = value;
      push(token);
      continue;
    }

    if (state.index === state.start || prev.type === 'slash' || prev.type === 'dot') {
      if (prev.type === 'dot') {
        state.output += NO_DOT_SLASH;
        prev.output += NO_DOT_SLASH;

      } else if (opts.dot === true) {
        state.output += NO_DOTS_SLASH;
        prev.output += NO_DOTS_SLASH;

      } else {
        state.output += nodot;
        prev.output += nodot;
      }

      if (peek() !== '*') {
        state.output += ONE_CHAR;
        prev.output += ONE_CHAR;
      }
    }

    push(token);
  }

  while (state.brackets > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ']'));
    state.output = utils.escapeLast(state.output, '[');
    decrement('brackets');
  }

  while (state.parens > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ')'));
    state.output = utils.escapeLast(state.output, '(');
    decrement('parens');
  }

  while (state.braces > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', '}'));
    state.output = utils.escapeLast(state.output, '{');
    decrement('braces');
  }

  if (opts.strictSlashes !== true && (prev.type === 'star' || prev.type === 'bracket')) {
    push({ type: 'maybe_slash', value: '', output: `${SLASH_LITERAL}?` });
  }

  // rebuild the output if we had to backtrack at any point
  if (state.backtrack === true) {
    state.output = '';

    for (const token of state.tokens) {
      state.output += token.output != null ? token.output : token.value;

      if (token.suffix) {
        state.output += token.suffix;
      }
    }
  }

  return state;
};

/**
 * Fast paths for creating regular expressions for common glob patterns.
 * This can significantly speed up processing and has very little downside
 * impact when none of the fast paths match.
 */

parse.fastpaths = (input, options) => {
  const opts = { ...options };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
  const len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  input = REPLACEMENTS[input] || input;
  const win32 = utils.isWindows(options);

  // create constants based on platform, for windows or posix
  const {
    DOT_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOTS,
    NO_DOTS_SLASH,
    STAR,
    START_ANCHOR
  } = constants.globChars(win32);

  const nodot = opts.dot ? NO_DOTS : NO_DOT;
  const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
  const capture = opts.capture ? '' : '?:';
  const state = { negated: false, prefix: '' };
  let star = opts.bash === true ? '.*?' : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  const globstar = (opts) => {
    if (opts.noglobstar === true) return star;
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const create = str => {
    switch (str) {
      case '*':
        return `${nodot}${ONE_CHAR}${star}`;

      case '.*':
        return `${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*.*':
        return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*/*':
        return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;

      case '**':
        return nodot + globstar(opts);

      case '**/*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;

      case '**/*.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '**/.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;

      default: {
        const match = /^(.*?)\.(\w+)$/.exec(str);
        if (!match) return;

        const source = create(match[1]);
        if (!source) return;

        return source + DOT_LITERAL + match[2];
      }
    }
  };

  const output = utils.removePrefix(input, state);
  let source = create(output);

  if (source && opts.strictSlashes !== true) {
    source += `${SLASH_LITERAL}?`;
  }

  return source;
};

module.exports = parse;


/***/ }),

/***/ "../node_modules/picomatch/lib/picomatch.js":
/*!**************************************************!*\
  !*** ../node_modules/picomatch/lib/picomatch.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const path = __webpack_require__(/*! path */ "../node_modules/path-browserify/index.js");
const scan = __webpack_require__(/*! ./scan */ "../node_modules/picomatch/lib/scan.js");
const parse = __webpack_require__(/*! ./parse */ "../node_modules/picomatch/lib/parse.js");
const utils = __webpack_require__(/*! ./utils */ "../node_modules/picomatch/lib/utils.js");
const constants = __webpack_require__(/*! ./constants */ "../node_modules/picomatch/lib/constants.js");
const isObject = val => val && typeof val === 'object' && !Array.isArray(val);

/**
 * Creates a matcher function from one or more glob patterns. The
 * returned function takes a string to match as its first argument,
 * and returns true if the string is a match. The returned matcher
 * function also takes a boolean as the second argument that, when true,
 * returns an object with additional information.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch(glob[, options]);
 *
 * const isMatch = picomatch('*.!(*a)');
 * console.log(isMatch('a.a')); //=> false
 * console.log(isMatch('a.b')); //=> true
 * ```
 * @name picomatch
 * @param {String|Array} `globs` One or more glob patterns.
 * @param {Object=} `options`
 * @return {Function=} Returns a matcher function.
 * @api public
 */

const picomatch = (glob, options, returnState = false) => {
  if (Array.isArray(glob)) {
    const fns = glob.map(input => picomatch(input, options, returnState));
    const arrayMatcher = str => {
      for (const isMatch of fns) {
        const state = isMatch(str);
        if (state) return state;
      }
      return false;
    };
    return arrayMatcher;
  }

  const isState = isObject(glob) && glob.tokens && glob.input;

  if (glob === '' || (typeof glob !== 'string' && !isState)) {
    throw new TypeError('Expected pattern to be a non-empty string');
  }

  const opts = options || {};
  const posix = utils.isWindows(options);
  const regex = isState
    ? picomatch.compileRe(glob, options)
    : picomatch.makeRe(glob, options, false, true);

  const state = regex.state;
  delete regex.state;

  let isIgnored = () => false;
  if (opts.ignore) {
    const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
    isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
  }

  const matcher = (input, returnObject = false) => {
    const { isMatch, match, output } = picomatch.test(input, regex, options, { glob, posix });
    const result = { glob, state, regex, posix, input, output, match, isMatch };

    if (typeof opts.onResult === 'function') {
      opts.onResult(result);
    }

    if (isMatch === false) {
      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (isIgnored(input)) {
      if (typeof opts.onIgnore === 'function') {
        opts.onIgnore(result);
      }
      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (typeof opts.onMatch === 'function') {
      opts.onMatch(result);
    }
    return returnObject ? result : true;
  };

  if (returnState) {
    matcher.state = state;
  }

  return matcher;
};

/**
 * Test `input` with the given `regex`. This is used by the main
 * `picomatch()` function to test the input string.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.test(input, regex[, options]);
 *
 * console.log(picomatch.test('foo/bar', /^(?:([^/]*?)\/([^/]*?))$/));
 * // { isMatch: true, match: [ 'foo/', 'foo', 'bar' ], output: 'foo/bar' }
 * ```
 * @param {String} `input` String to test.
 * @param {RegExp} `regex`
 * @return {Object} Returns an object with matching info.
 * @api public
 */

picomatch.test = (input, regex, options, { glob, posix } = {}) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected input to be a string');
  }

  if (input === '') {
    return { isMatch: false, output: '' };
  }

  const opts = options || {};
  const format = opts.format || (posix ? utils.toPosixSlashes : null);
  let match = input === glob;
  let output = (match && format) ? format(input) : input;

  if (match === false) {
    output = format ? format(input) : input;
    match = output === glob;
  }

  if (match === false || opts.capture === true) {
    if (opts.matchBase === true || opts.basename === true) {
      match = picomatch.matchBase(input, regex, options, posix);
    } else {
      match = regex.exec(output);
    }
  }

  return { isMatch: Boolean(match), match, output };
};

/**
 * Match the basename of a filepath.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.matchBase(input, glob[, options]);
 * console.log(picomatch.matchBase('foo/bar.js', '*.js'); // true
 * ```
 * @param {String} `input` String to test.
 * @param {RegExp|String} `glob` Glob pattern or regex created by [.makeRe](#makeRe).
 * @return {Boolean}
 * @api public
 */

picomatch.matchBase = (input, glob, options, posix = utils.isWindows(options)) => {
  const regex = glob instanceof RegExp ? glob : picomatch.makeRe(glob, options);
  return regex.test(path.basename(input));
};

/**
 * Returns true if **any** of the given glob `patterns` match the specified `string`.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.isMatch(string, patterns[, options]);
 *
 * console.log(picomatch.isMatch('a.a', ['b.*', '*.a'])); //=> true
 * console.log(picomatch.isMatch('a.a', 'b.*')); //=> false
 * ```
 * @param {String|Array} str The string to test.
 * @param {String|Array} patterns One or more glob patterns to use for matching.
 * @param {Object} [options] See available [options](#options).
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

picomatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);

/**
 * Parse a glob pattern to create the source string for a regular
 * expression.
 *
 * ```js
 * const picomatch = require('picomatch');
 * const result = picomatch.parse(pattern[, options]);
 * ```
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {Object} Returns an object with useful properties and output to be used as a regex source string.
 * @api public
 */

picomatch.parse = (pattern, options) => {
  if (Array.isArray(pattern)) return pattern.map(p => picomatch.parse(p, options));
  return parse(pattern, { ...options, fastpaths: false });
};

/**
 * Scan a glob pattern to separate the pattern into segments.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.scan(input[, options]);
 *
 * const result = picomatch.scan('!./foo/*.js');
 * console.log(result);
 * { prefix: '!./',
 *   input: '!./foo/*.js',
 *   start: 3,
 *   base: 'foo',
 *   glob: '*.js',
 *   isBrace: false,
 *   isBracket: false,
 *   isGlob: true,
 *   isExtglob: false,
 *   isGlobstar: false,
 *   negated: true }
 * ```
 * @param {String} `input` Glob pattern to scan.
 * @param {Object} `options`
 * @return {Object} Returns an object with
 * @api public
 */

picomatch.scan = (input, options) => scan(input, options);

/**
 * Create a regular expression from a parsed glob pattern.
 *
 * ```js
 * const picomatch = require('picomatch');
 * const state = picomatch.parse('*.js');
 * // picomatch.compileRe(state[, options]);
 *
 * console.log(picomatch.compileRe(state));
 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
 * ```
 * @param {String} `state` The object returned from the `.parse` method.
 * @param {Object} `options`
 * @return {RegExp} Returns a regex created from the given pattern.
 * @api public
 */

picomatch.compileRe = (parsed, options, returnOutput = false, returnState = false) => {
  if (returnOutput === true) {
    return parsed.output;
  }

  const opts = options || {};
  const prepend = opts.contains ? '' : '^';
  const append = opts.contains ? '' : '$';

  let source = `${prepend}(?:${parsed.output})${append}`;
  if (parsed && parsed.negated === true) {
    source = `^(?!${source}).*$`;
  }

  const regex = picomatch.toRegex(source, options);
  if (returnState === true) {
    regex.state = parsed;
  }

  return regex;
};

picomatch.makeRe = (input, options, returnOutput = false, returnState = false) => {
  if (!input || typeof input !== 'string') {
    throw new TypeError('Expected a non-empty string');
  }

  const opts = options || {};
  let parsed = { negated: false, fastpaths: true };
  let prefix = '';
  let output;

  if (input.startsWith('./')) {
    input = input.slice(2);
    prefix = parsed.prefix = './';
  }

  if (opts.fastpaths !== false && (input[0] === '.' || input[0] === '*')) {
    output = parse.fastpaths(input, options);
  }

  if (output === undefined) {
    parsed = parse(input, options);
    parsed.prefix = prefix + (parsed.prefix || '');
  } else {
    parsed.output = output;
  }

  return picomatch.compileRe(parsed, options, returnOutput, returnState);
};

/**
 * Create a regular expression from the given regex source string.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.toRegex(source[, options]);
 *
 * const { output } = picomatch.parse('*.js');
 * console.log(picomatch.toRegex(output));
 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
 * ```
 * @param {String} `source` Regular expression source string.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

picomatch.toRegex = (source, options) => {
  try {
    const opts = options || {};
    return new RegExp(source, opts.flags || (opts.nocase ? 'i' : ''));
  } catch (err) {
    if (options && options.debug === true) throw err;
    return /$^/;
  }
};

/**
 * Picomatch constants.
 * @return {Object}
 */

picomatch.constants = constants;

/**
 * Expose "picomatch"
 */

module.exports = picomatch;


/***/ }),

/***/ "../node_modules/picomatch/lib/scan.js":
/*!*********************************************!*\
  !*** ../node_modules/picomatch/lib/scan.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const utils = __webpack_require__(/*! ./utils */ "../node_modules/picomatch/lib/utils.js");
const {
  CHAR_ASTERISK,             /* * */
  CHAR_AT,                   /* @ */
  CHAR_BACKWARD_SLASH,       /* \ */
  CHAR_COMMA,                /* , */
  CHAR_DOT,                  /* . */
  CHAR_EXCLAMATION_MARK,     /* ! */
  CHAR_FORWARD_SLASH,        /* / */
  CHAR_LEFT_CURLY_BRACE,     /* { */
  CHAR_LEFT_PARENTHESES,     /* ( */
  CHAR_LEFT_SQUARE_BRACKET,  /* [ */
  CHAR_PLUS,                 /* + */
  CHAR_QUESTION_MARK,        /* ? */
  CHAR_RIGHT_CURLY_BRACE,    /* } */
  CHAR_RIGHT_PARENTHESES,    /* ) */
  CHAR_RIGHT_SQUARE_BRACKET  /* ] */
} = __webpack_require__(/*! ./constants */ "../node_modules/picomatch/lib/constants.js");

const isPathSeparator = code => {
  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
};

const depth = token => {
  if (token.isPrefix !== true) {
    token.depth = token.isGlobstar ? Infinity : 1;
  }
};

/**
 * Quickly scans a glob pattern and returns an object with a handful of
 * useful properties, like `isGlob`, `path` (the leading non-glob, if it exists),
 * `glob` (the actual pattern), and `negated` (true if the path starts with `!`).
 *
 * ```js
 * const pm = require('picomatch');
 * console.log(pm.scan('foo/bar/*.js'));
 * { isGlob: true, input: 'foo/bar/*.js', base: 'foo/bar', glob: '*.js' }
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {Object} Returns an object with tokens and regex source string.
 * @api public
 */

const scan = (input, options) => {
  const opts = options || {};

  const length = input.length - 1;
  const scanToEnd = opts.parts === true || opts.scanToEnd === true;
  const slashes = [];
  const tokens = [];
  const parts = [];

  let str = input;
  let index = -1;
  let start = 0;
  let lastIndex = 0;
  let isBrace = false;
  let isBracket = false;
  let isGlob = false;
  let isExtglob = false;
  let isGlobstar = false;
  let braceEscaped = false;
  let backslashes = false;
  let negated = false;
  let finished = false;
  let braces = 0;
  let prev;
  let code;
  let token = { value: '', depth: 0, isGlob: false };

  const eos = () => index >= length;
  const peek = () => str.charCodeAt(index + 1);
  const advance = () => {
    prev = code;
    return str.charCodeAt(++index);
  };

  while (index < length) {
    code = advance();
    let next;

    if (code === CHAR_BACKWARD_SLASH) {
      backslashes = token.backslashes = true;
      code = advance();

      if (code === CHAR_LEFT_CURLY_BRACE) {
        braceEscaped = true;
      }
      continue;
    }

    if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
      braces++;

      while (eos() !== true && (code = advance())) {
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }

        if (code === CHAR_LEFT_CURLY_BRACE) {
          braces++;
          continue;
        }

        if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
          isBrace = token.isBrace = true;
          isGlob = token.isGlob = true;
          finished = true;

          if (scanToEnd === true) {
            continue;
          }

          break;
        }

        if (braceEscaped !== true && code === CHAR_COMMA) {
          isBrace = token.isBrace = true;
          isGlob = token.isGlob = true;
          finished = true;

          if (scanToEnd === true) {
            continue;
          }

          break;
        }

        if (code === CHAR_RIGHT_CURLY_BRACE) {
          braces--;

          if (braces === 0) {
            braceEscaped = false;
            isBrace = token.isBrace = true;
            finished = true;
            break;
          }
        }
      }

      if (scanToEnd === true) {
        continue;
      }

      break;
    }

    if (code === CHAR_FORWARD_SLASH) {
      slashes.push(index);
      tokens.push(token);
      token = { value: '', depth: 0, isGlob: false };

      if (finished === true) continue;
      if (prev === CHAR_DOT && index === (start + 1)) {
        start += 2;
        continue;
      }

      lastIndex = index + 1;
      continue;
    }

    if (opts.noext !== true) {
      const isExtglobChar = code === CHAR_PLUS
        || code === CHAR_AT
        || code === CHAR_ASTERISK
        || code === CHAR_QUESTION_MARK
        || code === CHAR_EXCLAMATION_MARK;

      if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
        isGlob = token.isGlob = true;
        isExtglob = token.isExtglob = true;
        finished = true;

        if (scanToEnd === true) {
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              code = advance();
              continue;
            }

            if (code === CHAR_RIGHT_PARENTHESES) {
              isGlob = token.isGlob = true;
              finished = true;
              break;
            }
          }
          continue;
        }
        break;
      }
    }

    if (code === CHAR_ASTERISK) {
      if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
      isGlob = token.isGlob = true;
      finished = true;

      if (scanToEnd === true) {
        continue;
      }
      break;
    }

    if (code === CHAR_QUESTION_MARK) {
      isGlob = token.isGlob = true;
      finished = true;

      if (scanToEnd === true) {
        continue;
      }
      break;
    }

    if (code === CHAR_LEFT_SQUARE_BRACKET) {
      while (eos() !== true && (next = advance())) {
        if (next === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }

        if (next === CHAR_RIGHT_SQUARE_BRACKET) {
          isBracket = token.isBracket = true;
          isGlob = token.isGlob = true;
          finished = true;

          if (scanToEnd === true) {
            continue;
          }
          break;
        }
      }
    }

    if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
      negated = token.negated = true;
      start++;
      continue;
    }

    if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
      isGlob = token.isGlob = true;

      if (scanToEnd === true) {
        while (eos() !== true && (code = advance())) {
          if (code === CHAR_LEFT_PARENTHESES) {
            backslashes = token.backslashes = true;
            code = advance();
            continue;
          }

          if (code === CHAR_RIGHT_PARENTHESES) {
            finished = true;
            break;
          }
        }
        continue;
      }
      break;
    }

    if (isGlob === true) {
      finished = true;

      if (scanToEnd === true) {
        continue;
      }

      break;
    }
  }

  if (opts.noext === true) {
    isExtglob = false;
    isGlob = false;
  }

  let base = str;
  let prefix = '';
  let glob = '';

  if (start > 0) {
    prefix = str.slice(0, start);
    str = str.slice(start);
    lastIndex -= start;
  }

  if (base && isGlob === true && lastIndex > 0) {
    base = str.slice(0, lastIndex);
    glob = str.slice(lastIndex);
  } else if (isGlob === true) {
    base = '';
    glob = str;
  } else {
    base = str;
  }

  if (base && base !== '' && base !== '/' && base !== str) {
    if (isPathSeparator(base.charCodeAt(base.length - 1))) {
      base = base.slice(0, -1);
    }
  }

  if (opts.unescape === true) {
    if (glob) glob = utils.removeBackslashes(glob);

    if (base && backslashes === true) {
      base = utils.removeBackslashes(base);
    }
  }

  const state = {
    prefix,
    input,
    start,
    base,
    glob,
    isBrace,
    isBracket,
    isGlob,
    isExtglob,
    isGlobstar,
    negated
  };

  if (opts.tokens === true) {
    state.maxDepth = 0;
    if (!isPathSeparator(code)) {
      tokens.push(token);
    }
    state.tokens = tokens;
  }

  if (opts.parts === true || opts.tokens === true) {
    let prevIndex;

    for (let idx = 0; idx < slashes.length; idx++) {
      const n = prevIndex ? prevIndex + 1 : start;
      const i = slashes[idx];
      const value = input.slice(n, i);
      if (opts.tokens) {
        if (idx === 0 && start !== 0) {
          tokens[idx].isPrefix = true;
          tokens[idx].value = prefix;
        } else {
          tokens[idx].value = value;
        }
        depth(tokens[idx]);
        state.maxDepth += tokens[idx].depth;
      }
      if (idx !== 0 || value !== '') {
        parts.push(value);
      }
      prevIndex = i;
    }

    if (prevIndex && prevIndex + 1 < input.length) {
      const value = input.slice(prevIndex + 1);
      parts.push(value);

      if (opts.tokens) {
        tokens[tokens.length - 1].value = value;
        depth(tokens[tokens.length - 1]);
        state.maxDepth += tokens[tokens.length - 1].depth;
      }
    }

    state.slashes = slashes;
    state.parts = parts;
  }

  return state;
};

module.exports = scan;


/***/ }),

/***/ "../node_modules/picomatch/lib/utils.js":
/*!**********************************************!*\
  !*** ../node_modules/picomatch/lib/utils.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

const path = __webpack_require__(/*! path */ "../node_modules/path-browserify/index.js");
const win32 = process.platform === 'win32';
const {
  REGEX_BACKSLASH,
  REGEX_REMOVE_BACKSLASH,
  REGEX_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_GLOBAL
} = __webpack_require__(/*! ./constants */ "../node_modules/picomatch/lib/constants.js");

exports.isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
exports.hasRegexChars = str => REGEX_SPECIAL_CHARS.test(str);
exports.isRegexChar = str => str.length === 1 && exports.hasRegexChars(str);
exports.escapeRegex = str => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, '\\$1');
exports.toPosixSlashes = str => str.replace(REGEX_BACKSLASH, '/');

exports.removeBackslashes = str => {
  return str.replace(REGEX_REMOVE_BACKSLASH, match => {
    return match === '\\' ? '' : match;
  });
};

exports.supportsLookbehinds = () => {
  const segs = process.version.slice(1).split('.').map(Number);
  if (segs.length === 3 && segs[0] >= 9 || (segs[0] === 8 && segs[1] >= 10)) {
    return true;
  }
  return false;
};

exports.isWindows = options => {
  if (options && typeof options.windows === 'boolean') {
    return options.windows;
  }
  return win32 === true || path.sep === '\\';
};

exports.escapeLast = (input, char, lastIdx) => {
  const idx = input.lastIndexOf(char, lastIdx);
  if (idx === -1) return input;
  if (input[idx - 1] === '\\') return exports.escapeLast(input, char, idx - 1);
  return `${input.slice(0, idx)}\\${input.slice(idx)}`;
};

exports.removePrefix = (input, state = {}) => {
  let output = input;
  if (output.startsWith('./')) {
    output = output.slice(2);
    state.prefix = './';
  }
  return output;
};

exports.wrapOutput = (input, state = {}, options = {}) => {
  const prepend = options.contains ? '' : '^';
  const append = options.contains ? '' : '$';

  let output = `${prepend}(?:${input})${append}`;
  if (state.negated === true) {
    output = `(?:^(?!${output}).*$)`;
  }
  return output;
};

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../process/browser.js */ "../node_modules/process/browser.js")))

/***/ }),

/***/ "../node_modules/process/browser.js":
/*!******************************************!*\
  !*** ../node_modules/process/browser.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "../node_modules/setimmediate/setImmediate.js":
/*!****************************************************!*\
  !*** ../node_modules/setimmediate/setImmediate.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "../node_modules/webpack/buildin/global.js"), __webpack_require__(/*! ./../process/browser.js */ "../node_modules/process/browser.js")))

/***/ }),

/***/ "../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!*****************************************************************************!*\
  !*** ../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : undefined;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && btoa) {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "../node_modules/timers-browserify/main.js":
/*!*************************************************!*\
  !*** ../node_modules/timers-browserify/main.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var scope = (typeof global !== "undefined" && global) ||
            (typeof self !== "undefined" && self) ||
            window;
var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, scope, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, scope, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(scope, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(/*! setimmediate */ "../node_modules/setimmediate/setImmediate.js");
// On some exotic environments, it's not clear which object `setimmediate` was
// able to install onto.  Search each possibility in the same order as the
// `setimmediate` library.
exports.setImmediate = (typeof self !== "undefined" && self.setImmediate) ||
                       (typeof global !== "undefined" && global.setImmediate) ||
                       (this && this.setImmediate);
exports.clearImmediate = (typeof self !== "undefined" && self.clearImmediate) ||
                         (typeof global !== "undefined" && global.clearImmediate) ||
                         (this && this.clearImmediate);

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "../node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "../node_modules/timers-ext/max-timeout.js":
/*!*************************************************!*\
  !*** ../node_modules/timers-ext/max-timeout.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = 2147483647;


/***/ }),

/***/ "../node_modules/timers-ext/valid-timeout.js":
/*!***************************************************!*\
  !*** ../node_modules/timers-ext/valid-timeout.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var toPosInt   = __webpack_require__(/*! es5-ext/number/to-pos-integer */ "../node_modules/es5-ext/number/to-pos-integer.js")
  , maxTimeout = __webpack_require__(/*! ./max-timeout */ "../node_modules/timers-ext/max-timeout.js");

module.exports = function (value) {
	value = toPosInt(value);
	if (value > maxTimeout) throw new TypeError(value + " exceeds maximum possible timeout");
	return value;
};


/***/ }),

/***/ "../node_modules/to-regex-range/index.js":
/*!***********************************************!*\
  !*** ../node_modules/to-regex-range/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * to-regex-range <https://github.com/micromatch/to-regex-range>
 *
 * Copyright (c) 2015-present, Jon Schlinkert.
 * Released under the MIT License.
 */



const isNumber = __webpack_require__(/*! is-number */ "../node_modules/is-number/index.js");

const toRegexRange = (min, max, options) => {
  if (isNumber(min) === false) {
    throw new TypeError('toRegexRange: expected the first argument to be a number');
  }

  if (max === void 0 || min === max) {
    return String(min);
  }

  if (isNumber(max) === false) {
    throw new TypeError('toRegexRange: expected the second argument to be a number.');
  }

  let opts = { relaxZeros: true, ...options };
  if (typeof opts.strictZeros === 'boolean') {
    opts.relaxZeros = opts.strictZeros === false;
  }

  let relax = String(opts.relaxZeros);
  let shorthand = String(opts.shorthand);
  let capture = String(opts.capture);
  let wrap = String(opts.wrap);
  let cacheKey = min + ':' + max + '=' + relax + shorthand + capture + wrap;

  if (toRegexRange.cache.hasOwnProperty(cacheKey)) {
    return toRegexRange.cache[cacheKey].result;
  }

  let a = Math.min(min, max);
  let b = Math.max(min, max);

  if (Math.abs(a - b) === 1) {
    let result = min + '|' + max;
    if (opts.capture) {
      return `(${result})`;
    }
    if (opts.wrap === false) {
      return result;
    }
    return `(?:${result})`;
  }

  let isPadded = hasPadding(min) || hasPadding(max);
  let state = { min, max, a, b };
  let positives = [];
  let negatives = [];

  if (isPadded) {
    state.isPadded = isPadded;
    state.maxLen = String(state.max).length;
  }

  if (a < 0) {
    let newMin = b < 0 ? Math.abs(b) : 1;
    negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
    a = state.a = 0;
  }

  if (b >= 0) {
    positives = splitToPatterns(a, b, state, opts);
  }

  state.negatives = negatives;
  state.positives = positives;
  state.result = collatePatterns(negatives, positives, opts);

  if (opts.capture === true) {
    state.result = `(${state.result})`;
  } else if (opts.wrap !== false && (positives.length + negatives.length) > 1) {
    state.result = `(?:${state.result})`;
  }

  toRegexRange.cache[cacheKey] = state;
  return state.result;
};

function collatePatterns(neg, pos, options) {
  let onlyNegative = filterPatterns(neg, pos, '-', false, options) || [];
  let onlyPositive = filterPatterns(pos, neg, '', false, options) || [];
  let intersected = filterPatterns(neg, pos, '-?', true, options) || [];
  let subpatterns = onlyNegative.concat(intersected).concat(onlyPositive);
  return subpatterns.join('|');
}

function splitToRanges(min, max) {
  let nines = 1;
  let zeros = 1;

  let stop = countNines(min, nines);
  let stops = new Set([max]);

  while (min <= stop && stop <= max) {
    stops.add(stop);
    nines += 1;
    stop = countNines(min, nines);
  }

  stop = countZeros(max + 1, zeros) - 1;

  while (min < stop && stop <= max) {
    stops.add(stop);
    zeros += 1;
    stop = countZeros(max + 1, zeros) - 1;
  }

  stops = [...stops];
  stops.sort(compare);
  return stops;
}

/**
 * Convert a range to a regex pattern
 * @param {Number} `start`
 * @param {Number} `stop`
 * @return {String}
 */

function rangeToPattern(start, stop, options) {
  if (start === stop) {
    return { pattern: start, count: [], digits: 0 };
  }

  let zipped = zip(start, stop);
  let digits = zipped.length;
  let pattern = '';
  let count = 0;

  for (let i = 0; i < digits; i++) {
    let [startDigit, stopDigit] = zipped[i];

    if (startDigit === stopDigit) {
      pattern += startDigit;

    } else if (startDigit !== '0' || stopDigit !== '9') {
      pattern += toCharacterClass(startDigit, stopDigit, options);

    } else {
      count++;
    }
  }

  if (count) {
    pattern += options.shorthand === true ? '\\d' : '[0-9]';
  }

  return { pattern, count: [count], digits };
}

function splitToPatterns(min, max, tok, options) {
  let ranges = splitToRanges(min, max);
  let tokens = [];
  let start = min;
  let prev;

  for (let i = 0; i < ranges.length; i++) {
    let max = ranges[i];
    let obj = rangeToPattern(String(start), String(max), options);
    let zeros = '';

    if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
      if (prev.count.length > 1) {
        prev.count.pop();
      }

      prev.count.push(obj.count[0]);
      prev.string = prev.pattern + toQuantifier(prev.count);
      start = max + 1;
      continue;
    }

    if (tok.isPadded) {
      zeros = padZeros(max, tok, options);
    }

    obj.string = zeros + obj.pattern + toQuantifier(obj.count);
    tokens.push(obj);
    start = max + 1;
    prev = obj;
  }

  return tokens;
}

function filterPatterns(arr, comparison, prefix, intersection, options) {
  let result = [];

  for (let ele of arr) {
    let { string } = ele;

    // only push if _both_ are negative...
    if (!intersection && !contains(comparison, 'string', string)) {
      result.push(prefix + string);
    }

    // or _both_ are positive
    if (intersection && contains(comparison, 'string', string)) {
      result.push(prefix + string);
    }
  }
  return result;
}

/**
 * Zip strings
 */

function zip(a, b) {
  let arr = [];
  for (let i = 0; i < a.length; i++) arr.push([a[i], b[i]]);
  return arr;
}

function compare(a, b) {
  return a > b ? 1 : b > a ? -1 : 0;
}

function contains(arr, key, val) {
  return arr.some(ele => ele[key] === val);
}

function countNines(min, len) {
  return Number(String(min).slice(0, -len) + '9'.repeat(len));
}

function countZeros(integer, zeros) {
  return integer - (integer % Math.pow(10, zeros));
}

function toQuantifier(digits) {
  let [start = 0, stop = ''] = digits;
  if (stop || start > 1) {
    return `{${start + (stop ? ',' + stop : '')}}`;
  }
  return '';
}

function toCharacterClass(a, b, options) {
  return `[${a}${(b - a === 1) ? '' : '-'}${b}]`;
}

function hasPadding(str) {
  return /^-?(0+)\d/.test(str);
}

function padZeros(value, tok, options) {
  if (!tok.isPadded) {
    return value;
  }

  let diff = Math.abs(tok.maxLen - String(value).length);
  let relax = options.relaxZeros !== false;

  switch (diff) {
    case 0:
      return '';
    case 1:
      return relax ? '0?' : '0';
    case 2:
      return relax ? '0{0,2}' : '00';
    default: {
      return relax ? `0{0,${diff}}` : `0{${diff}}`;
    }
  }
}

/**
 * Cache
 */

toRegexRange.cache = {};
toRegexRange.clearCache = () => (toRegexRange.cache = {});

/**
 * Expose `toRegexRange`
 */

module.exports = toRegexRange;


/***/ }),

/***/ "../node_modules/tslib/tslib.es6.js":
/*!******************************************!*\
  !*** ../node_modules/tslib/tslib.es6.js ***!
  \******************************************/
/*! exports provided: __extends, __assign, __rest, __decorate, __param, __metadata, __awaiter, __generator, __createBinding, __exportStar, __values, __read, __spread, __spreadArrays, __await, __asyncGenerator, __asyncDelegator, __asyncValues, __makeTemplateObject, __importStar, __importDefault, __classPrivateFieldGet, __classPrivateFieldSet */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__extends", function() { return __extends; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__assign", function() { return __assign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__rest", function() { return __rest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__decorate", function() { return __decorate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__param", function() { return __param; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__metadata", function() { return __metadata; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__awaiter", function() { return __awaiter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__generator", function() { return __generator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__createBinding", function() { return __createBinding; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__exportStar", function() { return __exportStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__values", function() { return __values; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__read", function() { return __read; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spread", function() { return __spread; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spreadArrays", function() { return __spreadArrays; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__await", function() { return __await; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncGenerator", function() { return __asyncGenerator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncDelegator", function() { return __asyncDelegator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncValues", function() { return __asyncValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__makeTemplateObject", function() { return __makeTemplateObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importStar", function() { return __importStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importDefault", function() { return __importDefault; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__classPrivateFieldGet", function() { return __classPrivateFieldGet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__classPrivateFieldSet", function() { return __classPrivateFieldSet; });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __createBinding(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}

function __exportStar(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result.default = mod;
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
}

function __classPrivateFieldSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
}


/***/ }),

/***/ "../node_modules/type/function/is.js":
/*!*******************************************!*\
  !*** ../node_modules/type/function/is.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isPrototype = __webpack_require__(/*! ../prototype/is */ "../node_modules/type/prototype/is.js");

module.exports = function (value) {
	if (typeof value !== "function") return false;

	if (!hasOwnProperty.call(value, "length")) return false;

	try {
		if (typeof value.length !== "number") return false;
		if (typeof value.call !== "function") return false;
		if (typeof value.apply !== "function") return false;
	} catch (error) {
		return false;
	}

	return !isPrototype(value);
};


/***/ }),

/***/ "../node_modules/type/object/is.js":
/*!*****************************************!*\
  !*** ../node_modules/type/object/is.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue = __webpack_require__(/*! ../value/is */ "../node_modules/type/value/is.js");

// prettier-ignore
var possibleTypes = { "object": true, "function": true, "undefined": true /* document.all */ };

module.exports = function (value) {
	if (!isValue(value)) return false;
	return hasOwnProperty.call(possibleTypes, typeof value);
};


/***/ }),

/***/ "../node_modules/type/plain-function/is.js":
/*!*************************************************!*\
  !*** ../node_modules/type/plain-function/is.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isFunction = __webpack_require__(/*! ../function/is */ "../node_modules/type/function/is.js");

var classRe = /^\s*class[\s{/}]/, functionToString = Function.prototype.toString;

module.exports = function (value) {
	if (!isFunction(value)) return false;
	if (classRe.test(functionToString.call(value))) return false;
	return true;
};


/***/ }),

/***/ "../node_modules/type/prototype/is.js":
/*!********************************************!*\
  !*** ../node_modules/type/prototype/is.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isObject = __webpack_require__(/*! ../object/is */ "../node_modules/type/object/is.js");

module.exports = function (value) {
	if (!isObject(value)) return false;
	try {
		if (!value.constructor) return false;
		return value.constructor.prototype === value;
	} catch (error) {
		return false;
	}
};


/***/ }),

/***/ "../node_modules/type/value/is.js":
/*!****************************************!*\
  !*** ../node_modules/type/value/is.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// ES3 safe
var _undefined = void 0;

module.exports = function (value) { return value !== _undefined && value !== null; };


/***/ }),

/***/ "../node_modules/util/node_modules/inherits/inherits_browser.js":
/*!**********************************************************************!*\
  !*** ../node_modules/util/node_modules/inherits/inherits_browser.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ }),

/***/ "../node_modules/util/support/isBufferBrowser.js":
/*!*******************************************************!*\
  !*** ../node_modules/util/support/isBufferBrowser.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),

/***/ "../node_modules/util/util.js":
/*!************************************!*\
  !*** ../node_modules/util/util.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors ||
  function getOwnPropertyDescriptors(obj) {
    var keys = Object.keys(obj);
    var descriptors = {};
    for (var i = 0; i < keys.length; i++) {
      descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
    }
    return descriptors;
  };

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  if (typeof process !== 'undefined' && process.noDeprecation === true) {
    return fn;
  }

  // Allow for deprecating things in the process of starting up.
  if (typeof process === 'undefined') {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __webpack_require__(/*! ./support/isBuffer */ "../node_modules/util/support/isBufferBrowser.js");

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = __webpack_require__(/*! inherits */ "../node_modules/util/node_modules/inherits/inherits_browser.js");

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol('util.promisify.custom') : undefined;

exports.promisify = function promisify(original) {
  if (typeof original !== 'function')
    throw new TypeError('The "original" argument must be of type Function');

  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
    var fn = original[kCustomPromisifiedSymbol];
    if (typeof fn !== 'function') {
      throw new TypeError('The "util.promisify.custom" argument must be of type Function');
    }
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return fn;
  }

  function fn() {
    var promiseResolve, promiseReject;
    var promise = new Promise(function (resolve, reject) {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    args.push(function (err, value) {
      if (err) {
        promiseReject(err);
      } else {
        promiseResolve(value);
      }
    });

    try {
      original.apply(this, args);
    } catch (err) {
      promiseReject(err);
    }

    return promise;
  }

  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

  if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
    value: fn, enumerable: false, writable: false, configurable: true
  });
  return Object.defineProperties(
    fn,
    getOwnPropertyDescriptors(original)
  );
}

exports.promisify.custom = kCustomPromisifiedSymbol

function callbackifyOnRejected(reason, cb) {
  // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
  // Because `null` is a special error value in callbacks which means "no error
  // occurred", we error-wrap so the callback consumer can distinguish between
  // "the promise rejected with null" or "the promise fulfilled with undefined".
  if (!reason) {
    var newReason = new Error('Promise was rejected with a falsy value');
    newReason.reason = reason;
    reason = newReason;
  }
  return cb(reason);
}

function callbackify(original) {
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type Function');
  }

  // We DO NOT return the promise as it gives the user a false sense that
  // the promise is actually somehow related to the callback's execution
  // and that the callback throwing will reject the promise.
  function callbackified() {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    var maybeCb = args.pop();
    if (typeof maybeCb !== 'function') {
      throw new TypeError('The last argument must be of type Function');
    }
    var self = this;
    var cb = function() {
      return maybeCb.apply(self, arguments);
    };
    // In true node style we process the callback on `nextTick` with all the
    // implications (stack, `uncaughtException`, `async_hooks`)
    original.apply(this, args)
      .then(function(ret) { process.nextTick(cb, null, ret) },
            function(rej) { process.nextTick(callbackifyOnRejected, rej, cb) });
  }

  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
  Object.defineProperties(callbackified,
                          getOwnPropertyDescriptors(original));
  return callbackified;
}
exports.callbackify = callbackify;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../process/browser.js */ "../node_modules/process/browser.js")))

/***/ }),

/***/ "../node_modules/webpack/buildin/global.js":
/*!*************************************************!*\
  !*** ../node_modules/webpack/buildin/global.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./annotation_query_ctrl.ts":
/*!**********************************!*\
  !*** ./annotation_query_ctrl.ts ***!
  \**********************************/
/*! exports provided: AnnotationQueryEditor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AnnotationQueryEditor", function() { return AnnotationQueryEditor; });
var AnnotationQueryEditor =
/** @class */
function () {
  function AnnotationQueryEditor() {
    this.annotationQueryTypeOptions = [{
      value: 'alerts',
      text: 'Alerts'
    }];
    this.annotationFilterApplyOptions = [{
      value: 'all',
      text: 'ALL'
    }, {
      value: 'any',
      text: 'ANY'
    }];
    this.annotation.alertId = this.annotation.alertId || '';
    this.annotation.annotationQueryText = this.annotation.annotationQueryText || '';
    this.annotation.annotationQueryType = this.annotation.annotationQueryType || 'alerts';
    this.annotation.annotationFilterApply = this.annotation.annotationFilterApply || 'all';
    this.annotation.annotationFilterText = this.annotation.annotationFilterText || '';
  }

  AnnotationQueryEditor.templateUrl = 'partials/annotation.editor.html';
  return AnnotationQueryEditor;
}();



/***/ }),

/***/ "./config_ctrl.ts":
/*!************************!*\
  !*** ./config_ctrl.ts ***!
  \************************/
/*! exports provided: IrondbConfigCtrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IrondbConfigCtrl", function() { return IrondbConfigCtrl; });
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);


var IrondbConfigCtrl =
/** @class */
function () {
  IrondbConfigCtrl.$inject = ["$scope"];

  /** @ngInject */
  function IrondbConfigCtrl($scope) {
    this.current.jsonData.irondbType = this.current.jsonData.irondbType || 'standalone';
    this.current.jsonData.resultsLimit = this.current.jsonData.resultsLimit || '100';
    this.current.jsonData.useCaching = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.defaultTo(this.current.jsonData.useCaching, true);
    this.current.jsonData.activityTracking = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.defaultTo(this.current.jsonData.activityTracking, true);
  }

  IrondbConfigCtrl.templateUrl = 'partials/config.html';
  return IrondbConfigCtrl;
}();



/***/ }),

/***/ "./css/query_editor.css":
/*!******************************!*\
  !*** ./css/query_editor.css ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../../node_modules/css-loader/dist/cjs.js??ref--8-1!../../node_modules/postcss-loader/src??ref--8-2!../../node_modules/sass-loader/dist/cjs.js!./query_editor.css */ "../node_modules/css-loader/dist/cjs.js?!../node_modules/postcss-loader/src/index.js?!../node_modules/sass-loader/dist/cjs.js!./css/query_editor.css");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);

var exported = content.locals ? content.locals : {};



module.exports = exported;

/***/ }),

/***/ "./datasource.ts":
/*!***********************!*\
  !*** ./datasource.ts ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../node_modules/tslib/tslib.es6.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _log__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./log */ "./log.ts");
/* harmony import */ var micromatch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! micromatch */ "../node_modules/micromatch/index.js");
/* harmony import */ var micromatch__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(micromatch__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var memoizee__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! memoizee */ "../node_modules/memoizee/index.js");
/* harmony import */ var memoizee__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(memoizee__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _irondb_query__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./irondb_query */ "./irondb_query.ts");
/* harmony import */ var _grafana_data__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @grafana/data */ "@grafana/data");
/* harmony import */ var _grafana_data__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_grafana_data__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var mustache__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! mustache */ "../node_modules/mustache/mustache.js");
/* harmony import */ var mustache__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(mustache__WEBPACK_IMPORTED_MODULE_7__);








var log = Object(_log__WEBPACK_IMPORTED_MODULE_2__["default"])('IrondbDatasource');
var DURATION_UNITS_DEFAULT = 's';
var DURATION_UNITS = {
  ms: 1,
  s: 1000,
  m: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24
};

function parseDurationMs(duration) {
  if (!/^[0-9]+(ms|s|m|h|d)?$/g.test(duration.toLocaleLowerCase())) {
    throw new Error('Invalid time duration: ' + duration);
  }

  var unit = DURATION_UNITS_DEFAULT;

  for (var k in DURATION_UNITS) {
    if (duration.endsWith(k)) {
      unit = k;
      duration = duration.slice(0, duration.length - k.length);
    }
  }

  return parseInt(duration, 10) * DURATION_UNITS[unit];
}

var _s = [1, 0.5, 0.25, 0.2, 0.1, 0.05, 0.025, 0.02, 0.01, 0.005, 0.002, 0.001];
var _m = [60, 30, 20, 15, 10, 5, 3, 2, 1];

var _h = [60, 30, 20, 15, 10, 5, 3, 2, 1].map(function (a) {
  return a * 60;
});

var _d = [24, 12, 8, 6, 4, 3, 2, 1].map(function (a) {
  return a * 60 * 60;
});

var _matchset = [_s, _m, _h, _d];

function nudgeInterval(input, dir) {
  if (dir !== -1) {
    dir = 1;
  } // dir says if we're not a match do we choose 1 (larger) or -1 (smaller)


  if (input < 0.001) {
    return 0.001;
  }

  for (var si = 0; si < _matchset.length; si++) {
    var set = _matchset[si];

    if (input < set[0]) {
      for (var idx = 1; idx < set.length; idx++) {
        if (input > set[idx]) {
          if (dir === -1) {
            return set[idx];
          } else {
            return set[idx - 1];
          }
        }

        if (input === set[idx]) {
          return set[idx];
        }
      }
    }
  }

  if (input % 86400 === 0) {
    return input;
  }

  if (dir === 1) {
    return (1 + Math.floor(input / 86400)) * 86400;
  }

  return Math.floor(input / 86400) * 86400;
}

var HISTOGRAM_TRANSFORMS = {
  count: 'count',
  average: 'average',
  stddev: 'stddev',
  derive: 'rate',
  derive_stddev: 'derive_stddev',
  counter: 'rate',
  counter_stddev: 'counter_stddev'
};

var IrondbDatasource =
/** @class */
function (_super) {
  IrondbDatasource.$inject = ["instanceSettings", "$q", "backendSrv", "templateSrv"];

  Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"])(IrondbDatasource, _super);
  /** @ngInject */


  function IrondbDatasource(instanceSettings, $q, backendSrv, templateSrv) {
    var _this = _super.call(this, instanceSettings) || this;

    _this.$q = $q;
    _this.backendSrv = backendSrv;
    _this.templateSrv = templateSrv;
    _this.type = 'irondb';
    _this.name = instanceSettings.name;
    _this.id = instanceSettings.id;
    _this.accountId = instanceSettings.jsonData.accountId;
    _this.irondbType = instanceSettings.jsonData.irondbType;
    _this.resultsLimit = instanceSettings.jsonData.resultsLimit;
    _this.apiToken = instanceSettings.jsonData.apiToken;
    _this.useCaching = instanceSettings.jsonData.useCaching;
    _this.activityTracking = instanceSettings.jsonData.activityTracking;
    _this.url = instanceSettings.url;
    _this.supportAnnotations = false;
    _this.supportMetrics = true;
    _this.appName = 'Grafana';
    _this.datasourceRequest = IrondbDatasource.setupCache(_this.useCaching, backendSrv);
    return _this;
  }

  IrondbDatasource.stripActivityWindow = function (url) {
    return lodash__WEBPACK_IMPORTED_MODULE_1___default.a.split(url, '&').map(function (p) {
      return p.split('=');
    }).filter(function (p) {
      return !p[0].startsWith('activity_');
    }).map(function (p) {
      return p.join('=');
    }).join('&');
  };

  IrondbDatasource.requestCacheKey = function (requestOptions) {
    var httpMethod = requestOptions.method;

    if (httpMethod === 'GET') {
      return IrondbDatasource.stripActivityWindow(requestOptions.url);
    } else if (httpMethod === 'POST') {
      return JSON.stringify(requestOptions.data);
    }

    throw new Error('Unsupported HTTP method type: ' + (httpMethod || '?'));
  };

  IrondbDatasource.setupCache = function (useCaching, backendSrv) {
    var doRequest = function doRequest(options) {
      return backendSrv.datasourceRequest(options);
    };

    if (!useCaching) {
      log(function () {
        return 'setupCache() caching disabled';
      });
      return doRequest;
    }

    var cacheOpts = {
      max: IrondbDatasource.DEFAULT_CACHE_ENTRIES,
      maxAge: IrondbDatasource.DEFAULT_CACHE_TIME_MS,
      promise: true,
      normalizer: function normalizer(args) {
        var requestOptions = args[0];
        var cacheKey = IrondbDatasource.requestCacheKey(requestOptions);
        log(function () {
          return 'normalizer() cache lookup key = ' + cacheKey;
        });
        return cacheKey;
      }
    };
    log(function () {
      return 'setupCache() caching enabled';
    });
    return memoizee__WEBPACK_IMPORTED_MODULE_4___default()(function (options) {
      log(function () {
        return 'doRequest() cache miss key = ' + IrondbDatasource.requestCacheKey(options);
      });
      return doRequest(options);
    }, cacheOpts);
  };

  IrondbDatasource.prototype.query = function (options) {
    var _this = this;

    log(function () {
      return 'query() options = ' + JSON.stringify(options);
    });

    if (!lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isUndefined(this.queryRange) && !lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isEqual(options.range, this.queryRange)) {
      log(function () {
        return 'query() time range changed ' + JSON.stringify(_this.queryRange) + ' -> ' + JSON.stringify(options.range);
      });

      if (this.useCaching) {
        log(function () {
          return 'query() clearing cache';
        });
        var requestCache = this.datasourceRequest;
        requestCache.clear();
      }
    }

    this.queryRange = options.range;

    if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isEmpty(options['targets'][0])) {
      return this.$q.when({
        data: []
      });
    }

    return Promise.all([this.buildIrondbParams(options)]).then(function (irondbOptions) {
      if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isEmpty(irondbOptions[0])) {
        return _this.$q.when({
          data: []
        });
      }

      return _this.irondbRequest(irondbOptions[0]);
    }).then(function (queryResults) {
      if (queryResults.t === 'ts') {
        if (queryResults['data'].constructor === Array) {
          queryResults['data'].sort(function (a, b) {
            return a['target'].localeCompare(b['target']);
          });
        }
      }

      log(function () {
        return 'query() queryResults = ' + JSON.stringify(queryResults);
      });
      return queryResults;
    })["catch"](function (err) {
      if (err.status !== 0 || err.status >= 300) {
        _this.throwerr(err);
      }
    });
  };

  IrondbDatasource.prototype.annotationQuery = function (query) {
    var _this = this;

    log(function () {
      return 'annotationQuery() options = ' + JSON.stringify(query.annotation);
    });
    log(function () {
      return 'annotationQuery() range = ' + JSON.stringify(query.range);
    });

    if (!lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isUndefined(this.queryRange) && !lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isEqual(query.range, this.queryRange)) {
      log(function () {
        return 'query() time range changed ' + JSON.stringify(_this.queryRange) + ' -> ' + JSON.stringify(query.range);
      });

      if (this.useCaching) {
        log(function () {
          return 'query() clearing cache';
        });
        var requestCache = this.datasourceRequest;
        requestCache.clear();
      }
    }

    this.queryRange = query.range;
    var options = {};
    var queries = [];
    var headers = {
      'Content-Type': 'application/json'
    }; // const start = new Date(query.rangeRaw.from).getTime() / 1000;
    // const end = new Date(query.rangeRaw.to).getTime() / 1000;

    headers['X-Circonus-Auth-Token'] = this.apiToken;
    headers['X-Circonus-App-Name'] = this.appName;
    headers['Accept'] = 'application/json';

    if (query.annotation['annotationQueryType'] === 'alerts') {
      options = {};
      options.url = this.url;
      options.url = options.url + '/v2';
      options.method = 'GET';
      options.url = options.url + '/alert';
      var alertId = this.templateSrv.replace(query.annotation['alertId']);
      var alertQuery = this.templateSrv.replace(query.annotation['annotationQueryText']);

      if (alertId !== '') {
        options.url = options.url + '/' + alertId;
      } else {
        options.url = options.url + '?search=' + encodeURIComponent(alertQuery) + '&size=500';
      }

      options.headers = headers;
      options.retry = 1;
      options.start = query.range.from.valueOf() / 1000;
      options.end = query.range.to.valueOf() / 1000;
      options.isAlert = true;
      options.local_filter = query.annotation['annotationFilterText'];
      options.local_filter_match = query.annotation['annotationFilterApply'];
      options.annotation = query.annotation;

      if (this.basicAuth || this.withCredentials) {
        options.withCredentials = true;
      }

      if (this.basicAuth) {
        options.headers.Authorization = this.basicAuth;
      }

      options.isCaql = false;
      queries.push(options);
    }

    return Promise.all(queries.map(function (query) {
      return _this.datasourceRequest(query).then(function (result) {
        log(function () {
          return 'annotationQuery() query = ' + JSON.stringify(query);
        });
        log(function () {
          return 'annotationQuery() result = ' + JSON.stringify(result);
        });

        if (!lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isUndefined(query.isAlert)) {
          return _this.enrichAlertsWithRules(result, query);
        }
      }).then(function (results) {
        var e_1, _a, e_2, _b; // this is a list of objects with "alert" and "rule" fields.


        var events = [];

        try {
          for (var results_1 = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(results), results_1_1 = results_1.next(); !results_1_1.done; results_1_1 = results_1.next()) {
            var a = results_1_1.value;
            var alert = a['alert'];
            var rule = a['rule'];
            var tags = {};

            if (alert['_occurred_on'] < query.start || alert['_occurred_on'] > query.end) {
              continue;
            }

            var cn = alert['_canonical_metric_name'];
            var metric = alert['_metric_name'];

            if (cn !== undefined && cn !== '') {
              var _c = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["taglessNameAndTags"])(cn), 2),
                  n = _c[0],
                  stream_tags = _c[1];

              var st = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["splitTags"])(stream_tags);
              Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["mergeTags"])(tags, st);
            }

            try {
              for (var _e = (e_2 = void 0, Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(alert['_tags'])), _f = _e.next(); !_f.done; _f = _e.next()) {
                var tag = _f.value;
                var tagSep = tag.split(/:/g);
                var tagCat = tagSep.shift();

                if (!tagCat.startsWith('__') && tagCat !== '') {
                  var tagVal = tagSep.join(':');
                  tagCat = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["decodeTag"])(tagCat);
                  tagVal = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["decodeTag"])(tagVal);

                  if (tags[tagCat] === undefined) {
                    tags[tagCat] = [];
                  }

                  tags[tagCat].push(tagVal);
                }
              }
            } catch (e_2_1) {
              e_2 = {
                error: e_2_1
              };
            } finally {
              try {
                if (_f && !_f.done && (_b = _e["return"])) _b.call(_e);
              } finally {
                if (e_2) throw e_2.error;
              }
            }

            var annotationTags = [];

            for (var tagCat in tags) {
              annotationTags.push(tagCat + ':' + tags[tagCat][0]);
            } // each circonus alert can produce 2 events, one for the alert and one for the clear.
            // alert first.


            var alert_match = {};
            alert_match.metric = metric;
            alert_match.value = alert['_value'];
            var data = {};
            data.evalMatches = [];
            data.evalMatches.push(alert_match);
            var notes = rule !== undefined && rule !== null && rule['notes'] !== null && rule['notes'] !== '' ? rule['notes'] : 'Oh no!';
            notes = mustache__WEBPACK_IMPORTED_MODULE_7__["render"](notes, tags);
            var event = {
              time: alert['_occurred_on'] * 1000,
              title: 'ALERTING',
              text: '<br />' + notes + '<br />' + 'Sev: ' + alert['_severity'] + '<br >' + (alert['_metric_link'] !== null && alert['_metric_link'] !== '' ? '<a href="' + alert['_metric_link'] + '" target="_blank">Info</a><br />' : ''),
              tags: annotationTags,
              alertId: alert['_cid'].replace('/alert/', ''),
              newState: 'alerting',
              source: query.annotation,
              data: data
            };
            events.push(event);
            notes = rule !== undefined && rule !== null && rule['notes'] !== null && rule['notes'] !== '' ? rule['notes'] : 'Yay!';
            notes = mustache__WEBPACK_IMPORTED_MODULE_7__["render"](notes, tags); // clear if it's cleared:

            if (alert['_cleared_on'] !== null) {
              var alert_match_1 = {};
              alert_match_1.metric = metric;
              alert_match_1.value = alert['_cleared_value'];
              var data_1 = {};
              data_1.evalMatches = [];
              data_1.evalMatches.push(alert_match_1);
              var event_1 = {
                time: alert['_cleared_on'] * 1000,
                title: 'OK',
                text: '<br />' + notes + '<br />' + 'Sev: ' + alert['_severity'] + '<br >' + (alert['_metric_link'] !== null && alert['_metric_link'] !== '' ? '<a href="' + alert['_metric_link'] + '" target="_blank">Info</a><br />' : ''),
                tags: annotationTags,
                alertId: alert['_cid'].replace('/alert/', ''),
                newState: 'ok',
                source: query.annotation,
                data: data_1
              };
              events.push(event_1);
            }
          }
        } catch (e_1_1) {
          e_1 = {
            error: e_1_1
          };
        } finally {
          try {
            if (results_1_1 && !results_1_1.done && (_a = results_1["return"])) _a.call(results_1);
          } finally {
            if (e_1) throw e_1.error;
          }
        }

        return events;
      });
    })).then(function (results) {
      return results;
    });
  };

  IrondbDatasource.prototype.interpolateExpr = function (value, variable) {
    if (value === void 0) {
      value = [];
    } // if no multi or include all do not regexEscape


    if (!variable.multi && !variable.includeAll) {
      return value;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (value.length === 1) {
      return value[0];
    }

    var q = '';

    for (var i = 0; i < value.length; i++) {
      if (i > 0) {
        q = q + ',';
      }

      q = q + value[i];
      i = i + 1;
    }

    return q;
  };

  IrondbDatasource.prototype.metricFindQuery = function (query, options) {
    var _this = this;

    var variable = options.variable;
    var range = options.range;
    var from = undefined;
    var to = undefined;

    if (!lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isUndefined(range)) {
      from = range.from.valueOf() / 1000;
      to = range.to.valueOf() / 1000;

      if (!lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isUndefined(this.queryRange) && !lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isEqual(range, this.queryRange)) {
        log(function () {
          return 'query() time range changed ' + JSON.stringify(_this.queryRange) + ' -> ' + JSON.stringify(range);
        });

        if (this.useCaching) {
          log(function () {
            return 'query() clearing cache';
          });
          var requestCache = this.datasourceRequest;
          requestCache.clear();
        }
      }

      this.queryRange = range;
    }

    log(function () {
      return 'Options: ' + JSON.stringify(options);
    });

    if (query !== '' && variable !== undefined && (variable.regex !== '' || variable.useTags)) {
      log(function () {
        return 'metricFindQuery() incoming query = ' + query;
      });
      log(function () {
        return 'metricFindQuery() incoming regex = ' + variable.regex;
      });
      var metricQuery_1 = this.templateSrv.replace(query, null, this.interpolateExpr);
      var tagCat_1 = variable.tagValuesQuery;
      log(function () {
        return 'metricFindQuery() interpolatedQuery = ' + metricQuery_1;
      });
      log(function () {
        return 'metricFindQuery() tagCat = ' + tagCat_1;
      });

      if (!(metricQuery_1.includes('and(') || metricQuery_1.includes('or(') || metricQuery_1.includes('not('))) {
        metricQuery_1 = 'and(__name:' + metricQuery_1 + ')';
      }

      if (tagCat_1 !== '') {
        return this.metricTagValsQuery(metricQuery_1, tagCat_1, from, to).then(function (results) {
          return lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(results.data, function (result) {
            return {
              value: result
            };
          });
        });
      } else {
        return this.metricTagsQuery(metricQuery_1, false, from, to).then(function (results) {
          return lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(results.data, function (result) {
            return {
              value: result.metric_name
            };
          });
        });
      }
    }

    return Promise.resolve([]);
  };

  IrondbDatasource.prototype.getAccountId = function () {
    return this.irondbType === 'standalone' ? '/' + this.accountId : '';
  };

  IrondbDatasource.prototype.metricTagsQuery = function (query, allowEmptyWildcard, from, to) {
    if (allowEmptyWildcard === void 0) {
      allowEmptyWildcard = false;
    }

    if (from === void 0) {
      from = null;
    }

    if (to === void 0) {
      to = null;
    }

    if (query === '' || query === undefined || !allowEmptyWildcard && query === 'and(__name:*)') {
      return Promise.resolve({
        data: []
      });
    }

    var queryUrl = '/find' + this.getAccountId() + '/tags?query=';
    queryUrl = queryUrl + query;

    if (this.activityTracking && from && to) {
      log(function () {
        return 'metricTagsQuery() activityWindow = [' + from + ',' + to + ']';
      });
      queryUrl += '&activity_start_secs=' + lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toInteger(from);
      queryUrl += '&activity_end_secs=' + lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toInteger(to);
    }

    log(function () {
      return 'metricTagsQuery() queryUrl = ' + queryUrl;
    });
    return this.irondbSimpleRequest('GET', queryUrl, false, true);
  };

  IrondbDatasource.prototype.metricTagValsQuery = function (metricQuery, cat, from, to) {
    if (from === void 0) {
      from = null;
    }

    if (to === void 0) {
      to = null;
    }

    var queryUrl = '/find' + this.getAccountId() + '/tag_vals?category=' + cat + '&query=';
    queryUrl = queryUrl + metricQuery;

    if (this.activityTracking && from && to) {
      log(function () {
        return 'metricTagsQuery() activityWindow = [' + from + ',' + to + ']';
      });
      queryUrl += '&activity_start_secs=' + lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toInteger(from);
      queryUrl += '&activity_end_secs=' + lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toInteger(to);
    }

    log(function () {
      return 'metricTagValsQuery() queryUrl = ' + queryUrl;
    });
    return this.irondbSimpleRequest('GET', queryUrl, false, true, false);
  };

  IrondbDatasource.prototype.testDatasource = function () {
    return this.metricTagsQuery('and(__name:ametric)').then(function (res) {
      var error = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(res, 'results[0].error');

      if (error) {
        return {
          status: 'error',
          message: error,
          title: 'Error'
        };
      }

      return {
        status: 'success',
        message: 'Data source is working',
        title: 'Success'
      };
    })["catch"](function (err) {
      var message = (err.data || {}).message;

      if (message === undefined) {
        message = 'Error ' + (err.status || '') + ' ' + (err.statusText || '');
      }

      return {
        status: 'error',
        message: message,
        title: 'Error'
      };
    });
  };

  IrondbDatasource.prototype.throwerr = function (err) {
    log(function () {
      return 'throwerr() err = ' + err;
    });

    if (err.data && err.data.error) {
      throw new Error('Circonus IRONdb Error: ' + err.data.error);
    } else if (err.data && err.data.user_error) {
      var name = err.data.method || 'IRONdb';
      var suffix = '';

      if (err.data.user_error.query) {
        suffix = ' in"' + err.data.user_error.query + '"';
      }

      throw new Error(name + ' error: ' + err.data.user_error.message + suffix);
    } else if (err.statusText === 'Not Found') {
      throw new Error('Circonus IRONdb Error: ' + err.statusText);
    } else if (err.statusText && err.status > 0) {
      throw new Error('Network Error: ' + err.statusText + '(' + err.status + ')');
    } else {
      throw new Error('Error: ' + (err ? err.toString() : 'unknown'));
    }
  };

  IrondbDatasource.prototype.irondbSimpleRequest = function (method, url, isCaql, isFind, isLimited) {
    if (isCaql === void 0) {
      isCaql = false;
    }

    if (isFind === void 0) {
      isFind = false;
    }

    if (isLimited === void 0) {
      isLimited = true;
    }

    var baseUrl = this.url;
    var headers = {
      'Content-Type': 'application/json'
    };

    if ('hosted' !== this.irondbType) {
      headers['X-Circonus-Account'] = this.accountId;
    }

    if ('hosted' === this.irondbType && !isCaql) {
      baseUrl = baseUrl + '/irondb';

      if (!isFind) {
        baseUrl = baseUrl + '/series_multi';
      }

      headers['X-Circonus-Auth-Token'] = this.apiToken;
      headers['X-Circonus-App-Name'] = this.appName;
    }

    headers['X-Snowth-Advisory-Limit'] = isLimited ? this.resultsLimit : 'none';

    if ('standalone' === this.irondbType && !isCaql) {
      if (!isFind) {
        baseUrl = baseUrl + '/series_multi';
      }
    }

    if (isCaql && !isFind) {
      baseUrl = baseUrl + '/extension/lua/caql_v1';
    }

    var options = {
      method: method,
      url: baseUrl + url,
      headers: headers,
      retry: 1
    };
    log(function () {
      return 'irondbSimpleRequest() options = ' + JSON.stringify(options);
    });
    return this.datasourceRequest(options);
  };

  IrondbDatasource.prototype.irondbRequest = function (irondbOptions, isLimited) {
    var _this = this;

    if (isLimited === void 0) {
      isLimited = true;
    }

    log(function () {
      return 'irondbRequest() irondbOptions = ' + JSON.stringify(irondbOptions);
    });
    var headers = {
      'Content-Type': 'application/json'
    };
    var options = {};
    var queries = [];
    var queryResults = {};
    queryResults['data'] = [];
    queryResults['t'] = 'ts';

    if ('hosted' === this.irondbType) {
      headers['X-Circonus-Auth-Token'] = this.apiToken;
      headers['X-Circonus-App-Name'] = this.appName;
    } else {
      headers['X-Circonus-Account'] = this.accountId;
    }

    headers['X-Snowth-Advisory-Limit'] = isLimited ? this.resultsLimit : 'none';
    headers['Accept'] = 'application/json';

    if (irondbOptions['std']['names'].length) {
      var paneltype = irondbOptions['std']['names'][0]['leaf_data']['format'] || 'ts';

      var _loop_1 = function _loop_1(i) {
        options = {};
        options.url = this_1.url;

        if ('hosted' === this_1.irondbType) {
          options.url = options.url + '/irondb';
        }

        options.url = options.url + '/fetch';
        options.method = 'POST';
        var metricLabels = [];
        var check_tags = [];
        var start = irondbOptions['std']['start'];
        var end = irondbOptions['std']['end'];
        var interval = this_1.getRollupSpan(irondbOptions, start, end, false, irondbOptions['std']['names'][i]['leaf_data']);
        start -= interval;
        end += interval;
        var reduce = paneltype === 'heatmap' ? 'merge' : 'pass';
        var streams = [];
        var data = {
          streams: streams
        };
        data['period'] = interval;
        data['start'] = start;
        data['count'] = Math.round((end - start) / interval);
        data['reduce'] = [{
          label: '',
          method: reduce
        }];
        var metrictype = irondbOptions['std']['names'][i]['leaf_data']['metrictype'];
        metricLabels.push(irondbOptions['std']['names'][i]['leaf_data']['metriclabel']);
        check_tags.push(irondbOptions['std']['names'][i]['leaf_data']['check_tags']);
        var stream = {};
        var transform = irondbOptions['std']['names'][i]['leaf_data']['egress_function'];

        if (metrictype === 'histogram') {
          if (paneltype === 'heatmap') {
            transform = 'none';
          } else {
            transform = HISTOGRAM_TRANSFORMS[transform];
            var leafName = irondbOptions['std']['names'][i]['leaf_name'];
            var transformMode = 'default';

            if (Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["isStatsdCounter"])(leafName)) {
              transformMode = 'statsd_counter';
            }

            irondbOptions['std']['names'][i]['leaf_data']['target']['hist_transform'] = transformMode;
          }
        }

        stream['transform'] = transform;
        stream['name'] = irondbOptions['std']['names'][i]['leaf_name'];
        stream['uuid'] = irondbOptions['std']['names'][i]['leaf_data']['uuid'];
        stream['kind'] = metrictype;
        streams.push(stream);
        log(function () {
          return 'irondbRequest() data = ' + JSON.stringify(data);
        });
        options.data = data;
        options.name = 'fetch';
        options.headers = headers;

        if (this_1.basicAuth || this_1.withCredentials) {
          options.withCredentials = true;
        }

        if (this_1.basicAuth) {
          options.headers.Authorization = this_1.basicAuth;
        }

        options.metricLabels = metricLabels;
        options.check_tags = check_tags;
        options.paneltype = paneltype;
        options.format = irondbOptions['std']['names'][i]['leaf_data']['format'];
        options.isCaql = false;
        options.retry = 1;
        queries.push(options);
      };

      var this_1 = this;

      for (var i = 0; i < irondbOptions['std']['names'].length; i++) {
        _loop_1(i);
      }
    }

    if (irondbOptions['caql']['names'].length) {
      for (var i = 0; i < irondbOptions['caql']['names'].length; i++) {
        options = {};
        options.url = this.url;

        if ('hosted' === this.irondbType) {
          options.url = options.url + '/irondb';
        }

        options.method = 'GET';
        options.url = options.url + '/extension/lua';

        if ('hosted' === this.irondbType) {
          options.url = options.url + '/public';
        }

        var start = irondbOptions['caql']['start'];
        var end = irondbOptions['caql']['end'];
        var interval = this.getRollupSpan(irondbOptions, start, end, true, irondbOptions['caql']['names'][i].leaf_data);
        start -= interval;
        end += interval;
        var caqlQuery = this.templateSrv.replace(irondbOptions['caql']['names'][i].leaf_name, irondbOptions['scopedVars']);
        options.url = options.url + '/caql_v1?format=DF4&start=' + start.toFixed(3);
        options.url = options.url + '&end=' + end.toFixed(3);
        options.url = options.url + '&period=' + interval;
        options.url = options.url + '&q=' + encodeURIComponent(caqlQuery);
        options.name = irondbOptions['caql']['names'][i];
        options.headers = headers;
        options.start = start;
        options.end = end;
        options.retry = 1;

        if (this.basicAuth || this.withCredentials) {
          options.withCredentials = true;
        }

        if (this.basicAuth) {
          options.headers.Authorization = this.basicAuth;
        }

        options.isCaql = true;
        options.format = irondbOptions['caql']['names'][i]['leaf_data']['format'];
        queries.push(options);
      }
    }

    if (irondbOptions['alert']['names'].length) {
      for (var i = 0; i < irondbOptions['alert']['names'].length; i++) {
        options = {};
        options.url = this.url;

        if ('hosted' === this.irondbType) {
          options.url = options.url + '/v2';
        }

        options.method = 'GET';
        options.url = options.url + '/alert';
        var alertQuery = this.templateSrv.replace(irondbOptions['alert']['names'][i], irondbOptions['scopedVars']);

        if (alertQuery.startsWith('alert_id:')) {
          options.url = options.url + '/' + alertQuery.split(':')[1];
        } else {
          options.url = options.url + '?search=' + encodeURIComponent(alertQuery) + '&size=1000';
        }

        options.headers = headers;
        options.retry = 1;
        options.start = irondbOptions['alert']['start'];
        options.end = irondbOptions['alert']['end'];
        options.isAlert = true;
        options.counts_only = irondbOptions['alert']['counts_only'];
        options.label = irondbOptions['alert']['labels'][i];
        options.local_filter = irondbOptions['alert']['local_filters'][i];
        options.local_filter_match = irondbOptions['alert']['local_filter_matches'][i];
        options.query_type = irondbOptions['alert']['query_type'];
        options.target = irondbOptions['alert']['target'];

        if (this.basicAuth || this.withCredentials) {
          options.withCredentials = true;
        }

        if (this.basicAuth) {
          options.headers.Authorization = this.basicAuth;
        }

        options.isCaql = false;
        queries.push(options);
      }
    }

    log(function () {
      return 'irondbRequest() queries = ' + JSON.stringify(queries);
    });
    return Promise.all(queries.map(function (query) {
      return _this.datasourceRequest(query).then(function (result) {
        log(function () {
          return 'irondbRequest() query = ' + JSON.stringify(query);
        });
        log(function () {
          return 'irondbRequest() result = ' + JSON.stringify(result);
        });

        if (!lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isUndefined(query.isAlert)) {
          if (query.counts_only === false) {
            return _this.enrichAlertsWithRules(result, query).then(function (results) {
              return _this.convertAlertDataToGrafana(results);
            });
          } else {
            return _this.countAlerts(result, query);
          }
        } else {
          return _this.convertIrondbDf4DataToGrafana(result, query);
        }
      }).then(function (result) {
        if (result['data'].constructor === Array) {
          for (var i = 0; i < result['data'].length; i++) {
            if ('target' in result && 'refId' in result['target']) {
              result['data'][i]['target'] = result['target']['refId'];
            }

            queryResults['data'].push(result['data'][i]);
          }
        }

        if (result['data'].constructor === Object) {
          if ('target' in result && 'refId' in result['target']) {
            result['data']['target'] = result['target']['refId'];
          }

          queryResults['data'].push(result['data']);
        }

        queryResults['t'] = result['t'];
        return queryResults;
      });
    })).then(function (result) {
      return queryResults;
    })["catch"](function (err) {
      if (err.status !== 0 || err.status >= 300) {
        _this.throwerr(err);
      }
    });
  };

  IrondbDatasource.prototype.filterMatches = function (pair, alert) {
    var e_3, _a, e_4, _b, e_5, _c; // support keys:
    //
    // alert_id
    // tag
    // acknowledged
    // severities


    if (pair.key === 'alert_id') {
      if (alert['_cid'].endsWith(pair.value)) {
        return true;
      }

      return false;
    }

    if (pair.key === 'acknowledged') {
      if (pair.value === 'true') {
        return alert['_acknowledgement'] !== null;
      } else if (pair.value === 'false') {
        return alert['_acknowledgement'] === null;
      } else {
        return true;
      }
    }

    if (pair.key === 'severities') {
      return pair.value.indexOf(alert['_severity']) !== -1;
    }

    if (pair.key === 'tag') {
      var tags = [];
      var cn = alert['_canonical_metric_name'];

      if (cn !== undefined && cn !== '') {
        var _e = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["taglessNameAndTags"])(cn), 2),
            n = _e[0],
            stream_tags = _e[1];

        var temptags = stream_tags.split(',');

        try {
          for (var temptags_1 = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(temptags), temptags_1_1 = temptags_1.next(); !temptags_1_1.done; temptags_1_1 = temptags_1.next()) {
            var tag = temptags_1_1.value;
            var tagSep = tag.split(/:/g);
            var tagCat = tagSep.shift();

            if (!tagCat.startsWith('__') && tagCat !== '') {
              var tagVal = tagSep.join(':');
              tagCat = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["decodeTag"])(tagCat);
              tagVal = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["decodeTag"])(tagVal);
              tags.push({
                cat: tagCat,
                val: tagVal
              });
            }
          }
        } catch (e_3_1) {
          e_3 = {
            error: e_3_1
          };
        } finally {
          try {
            if (temptags_1_1 && !temptags_1_1.done && (_a = temptags_1["return"])) _a.call(temptags_1);
          } finally {
            if (e_3) throw e_3.error;
          }
        }
      }

      try {
        for (var _f = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(alert['_tags']), _g = _f.next(); !_g.done; _g = _f.next()) {
          var tag = _g.value;
          var tagSep = tag.split(/:/g);
          var tagCat = tagSep.shift();

          if (!tagCat.startsWith('__') && tagCat !== '') {
            var tagVal = tagSep.join(':');
            tagCat = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["decodeTag"])(tagCat);
            tagVal = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["decodeTag"])(tagVal);
            tags.push({
              cat: tagCat,
              val: tagVal
            });
          }
        }
      } catch (e_4_1) {
        e_4 = {
          error: e_4_1
        };
      } finally {
        try {
          if (_g && !_g.done && (_b = _f["return"])) _b.call(_f);
        } finally {
          if (e_4) throw e_4.error;
        }
      }

      var mmatch = false;

      try {
        for (var tags_1 = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(tags), tags_1_1 = tags_1.next(); !tags_1_1.done; tags_1_1 = tags_1.next()) {
          var tag = tags_1_1.value;
          var pp = pair.value.split(':');

          if (tag.cat === pp[0]) {
            if (micromatch__WEBPACK_IMPORTED_MODULE_3___default.a.isMatch(tag.val, pp[1])) {
              return true;
            }
          }
        }
      } catch (e_5_1) {
        e_5 = {
          error: e_5_1
        };
      } finally {
        try {
          if (tags_1_1 && !tags_1_1.done && (_c = tags_1["return"])) _c.call(tags_1);
        } finally {
          if (e_5) throw e_5.error;
        }
      }

      return false;
    }
  }; // apply filter_pairs to alert and return true if it doesn't match


  IrondbDatasource.prototype.alertFiltered = function (filter_pairs, match, alert) {
    var e_6, _a, e_7, _b;

    if (filter_pairs.length === 0) {
      return false; //nothing to filter on, everything matches
    } // AND case


    if (match === 'all') {
      try {
        for (var filter_pairs_1 = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(filter_pairs), filter_pairs_1_1 = filter_pairs_1.next(); !filter_pairs_1_1.done; filter_pairs_1_1 = filter_pairs_1.next()) {
          var pair = filter_pairs_1_1.value;

          if (!this.filterMatches(pair, alert)) {
            return true;
          }
        }
      } catch (e_6_1) {
        e_6 = {
          error: e_6_1
        };
      } finally {
        try {
          if (filter_pairs_1_1 && !filter_pairs_1_1.done && (_a = filter_pairs_1["return"])) _a.call(filter_pairs_1);
        } finally {
          if (e_6) throw e_6.error;
        }
      }

      return false;
    } else {
      try {
        for (var filter_pairs_2 = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(filter_pairs), filter_pairs_2_1 = filter_pairs_2.next(); !filter_pairs_2_1.done; filter_pairs_2_1 = filter_pairs_2.next()) {
          var pair = filter_pairs_2_1.value;

          if (this.filterMatches(pair, alert)) {
            return false;
          }
        }
      } catch (e_7_1) {
        e_7 = {
          error: e_7_1
        };
      } finally {
        try {
          if (filter_pairs_2_1 && !filter_pairs_2_1.done && (_b = filter_pairs_2["return"])) _b.call(filter_pairs_2);
        } finally {
          if (e_7) throw e_7.error;
        }
      }

      return true;
    }

    return true;
  };

  IrondbDatasource.prototype.countAlerts = function (alerts, query) {
    var e_8, _a, e_9, _b;

    var datatemp = alerts.data;
    var data = [];

    if (datatemp.constructor === Array) {
      data = datatemp;
    } else {
      data.push(datatemp);
    }

    var queries = [];
    var filter_pairs = [];
    var filter_match = query['local_filter_match'];

    if (query['local_filter'] !== undefined && query['local_filter'] !== '') {
      // parse the filter into match pairs
      // a filter is a series of field:value tokens separated by commas
      var tokens = query['local_filter'].split(',');

      try {
        for (var tokens_1 = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(tokens), tokens_1_1 = tokens_1.next(); !tokens_1_1.done; tokens_1_1 = tokens_1.next()) {
          var t = tokens_1_1.value;
          var x = t.trim();
          var i = x.indexOf(':');

          if (i === -1) {
            continue;
          }

          var pair = {};
          pair.key = x.slice(0, i);
          pair.value = x.slice(i + 1);
          filter_pairs.push(pair);
        }
      } catch (e_8_1) {
        e_8 = {
          error: e_8_1
        };
      } finally {
        try {
          if (tokens_1_1 && !tokens_1_1.done && (_a = tokens_1["return"])) _a.call(tokens_1);
        } finally {
          if (e_8) throw e_8.error;
        }
      }
    }

    var countBuckets = {};

    if (query['query_type'] === 'range') {
      // fill the buckets minutely with zeroes
      var qs = query.start;
      qs = qs - qs % 60;
      var qe = query.end;
      qe = qe - qe % 60;

      for (var i = qs; i < qe; i += 60) {
        countBuckets[i.toString()] = 0;
      }
    }

    var count = 0;

    for (var i = 0; i < data.length; i++) {
      if (this.alertFiltered(filter_pairs, filter_match, data[i])) {
        continue;
      }

      var alert = data[i];
      var epoch = alert['_occurred_on'];

      if (query['query_type'] === 'range') {
        // floor the timestamp to its minute so we can bucket counts by minute
        epoch = epoch - epoch % 60;

        if (epoch.toString() in countBuckets) {
          countBuckets[epoch.toString()] = countBuckets[epoch.toString()] + 1;
        }
      } else {
        count = count + 1;
      }
    }

    var label = 'Value';

    if (query['label']) {
      label = query['label'];
    }

    var timeField = getTimeField();
    var valueField = getNumberField(label);
    var dataFrames = [];

    if (query['query_type'] === 'range') {
      try {
        for (var _c = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(Object.entries(countBuckets)), _e = _c.next(); !_e.done; _e = _c.next()) {
          var _f = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(_e.value, 2),
              epoch = _f[0],
              count_1 = _f[1];

          timeField.values.add(Number(epoch) * 1000);
          valueField.values.add(count_1);
        }
      } catch (e_9_1) {
        e_9 = {
          error: e_9_1
        };
      } finally {
        try {
          if (_e && !_e.done && (_b = _c["return"])) _b.call(_c);
        } finally {
          if (e_9) throw e_9.error;
        }
      }

      dataFrames.push({
        length: timeField.values.length,
        fields: [timeField, valueField]
      });
    } else {
      valueField.values.add(count);
      dataFrames.push({
        length: 1,
        fields: [valueField]
      });
    }

    return {
      t: 'ts',
      data: dataFrames,
      target: query['target'],
      state: _grafana_data__WEBPACK_IMPORTED_MODULE_6__["LoadingState"].Done
    };
  }; // this also applies any local filters.


  IrondbDatasource.prototype.enrichAlertsWithRules = function (alerts, query) {
    var e_10, _a;

    var _this = this;

    var datatemp = alerts.data;
    var data = [];

    if (datatemp.constructor === Array) {
      data = datatemp;
    } else {
      data.push(datatemp);
    }

    var queries = [];
    var enrich_results = [];
    var headers = {
      'Content-Type': 'application/json'
    };

    if ('hosted' !== this.irondbType) {
      this.throwerr('Alert queries only supported on hosted irondb requests');
    }

    headers['X-Circonus-Auth-Token'] = this.apiToken;
    headers['X-Circonus-App-Name'] = this.appName;
    headers['Accept'] = 'application/json';
    var filter_pairs = [];
    var filter_match = query['local_filter_match'];

    if (query['local_filter'] !== undefined && query['local_filter'] !== '') {
      // parse the filter into match pairs
      // a filter is a series of field:value tokens separated by commas
      var tokens = query['local_filter'].split(',');

      try {
        for (var tokens_2 = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(tokens), tokens_2_1 = tokens_2.next(); !tokens_2_1.done; tokens_2_1 = tokens_2.next()) {
          var t = tokens_2_1.value;
          var x = t.trim();
          var i = x.indexOf(':');

          if (i === -1) {
            continue;
          }

          var pair = {};
          pair.key = x.slice(0, i);
          pair.value = x.slice(i + 1);
          filter_pairs.push(pair);
        }
      } catch (e_10_1) {
        e_10 = {
          error: e_10_1
        };
      } finally {
        try {
          if (tokens_2_1 && !tokens_2_1.done && (_a = tokens_2["return"])) _a.call(tokens_2);
        } finally {
          if (e_10) throw e_10.error;
        }
      }
    }

    for (var i = 0; i < data.length; i++) {
      if (this.alertFiltered(filter_pairs, filter_match, data[i])) {
        continue;
      }

      var options = {};
      options.url = this.url;

      if ('hosted' === this.irondbType) {
        options.url = options.url + '/v2';
      }

      options.method = 'GET';
      options.url = options.url + data[i]['_rule_set'];
      options.headers = headers;
      options.retry = 1;
      options.alert_data = data[i];

      if (this.basicAuth || this.withCredentials) {
        options.withCredentials = true;
      }

      if (this.basicAuth) {
        options.headers.Authorization = this.basicAuth;
      }

      queries.push(options);
    }

    return Promise.all(queries.map(function (query) {
      return _this.datasourceRequest(query).then(function (result) {
        log(function () {
          return 'enrichAlertsWithRules() query = ' + JSON.stringify(query);
        });
        log(function () {
          return 'enrichAlertsWithRules() result = ' + JSON.stringify(result);
        });
        return {
          alert: query.alert_data,
          rule: result.data
        };
      })["catch"](function (failed) {
        // TODO: skipping ruleset groups for now, this would be hard to implement
        return {
          alert: query.alert_data,
          rule: null
        };
      });
    })).then(function (results) {
      return results;
    });
  };

  IrondbDatasource.checkRollupAligned = function (rollupMs) {
    var e_11, _a;

    try {
      for (var _b = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(IrondbDatasource.ROLLUP_ALIGN_MS), _c = _b.next(); !_c.done; _c = _b.next()) {
        var alignMs = _c.value;

        if (rollupMs < alignMs) {
          if (alignMs % rollupMs !== 0) {
            throw new Error('Unaligned rollup period requested');
          }
        }
      }
    } catch (e_11_1) {
      e_11 = {
        error: e_11_1
      };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
      } finally {
        if (e_11) throw e_11.error;
      }
    }

    if (rollupMs > IrondbDatasource.ROLLUP_ALIGN_MS_1DAY && rollupMs % IrondbDatasource.ROLLUP_ALIGN_MS_1DAY !== 0) {
      throw new Error('Unaligned rollup period requested');
    }
  };

  IrondbDatasource.prototype.getRollupSpan = function (options, start, end, isCaql, leafData) {
    log(function () {
      return "getRollupSpan() intervalMs = " + options.intervalMs + ", maxDataPoints = " + options.maxDataPoints;
    });
    log(function () {
      return "getRollupSpan() " + (isCaql ? 'CAQL' : '/fetch') + " " + JSON.stringify(leafData);
    });
    var rolluptype = leafData.rolluptype;
    var metricrollup = leafData.metricrollup;

    if (rolluptype !== 'automatic' && lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isEmpty(metricrollup)) {
      rolluptype = 'automatic';
      log(function () {
        return "getRollupSpan() defaulting to automatic";
      });
    }

    if (rolluptype === 'exact') {
      var exactMs_1 = parseDurationMs(metricrollup);
      var exactDatapoints_1 = Math.floor((end - start) * 1000 / exactMs_1);
      log(function () {
        return "getRollupSpan() exactMs = " + exactMs_1 + ", exactDatapoints = " + exactDatapoints_1;
      });

      if (exactDatapoints_1 > options.maxDataPoints * IrondbDatasource.MAX_EXACT_DATAPOINTS_THRESHOLD) {
        throw new Error('Too many datapoints requested');
      }

      IrondbDatasource.checkRollupAligned(exactMs_1);
      return exactMs_1 / 1000.0;
    } else {
      var minimumMs_1 = IrondbDatasource.MIN_DURATION_MS_FETCH;

      if (isCaql) {
        minimumMs_1 = IrondbDatasource.MIN_DURATION_MS_CAQL;
      }

      if (rolluptype === 'minimum') {
        minimumMs_1 = parseDurationMs(metricrollup);
        log(function () {
          return "getRollupSpan() minimumMs = " + minimumMs_1;
        });
      }

      var intervalMs_1 = options.intervalMs;

      if (intervalMs_1 < minimumMs_1) {
        intervalMs_1 = minimumMs_1;
      }

      var interval_1 = nudgeInterval(intervalMs_1 / 1000, -1);

      while ((end - start) / interval_1 > options.maxDatapoints * IrondbDatasource.MAX_DATAPOINTS_THRESHOLD) {
        interval_1 = nudgeInterval(interval_1 + 0.001, 1);
      }

      log(function () {
        return "getRollupSpan() intervalMs = " + intervalMs_1 + " -> interval " + interval_1;
      });
      return interval_1;
    }
  };

  IrondbDatasource.prototype.filterMetricsByType = function (target, data) {
    // Don't mix text metrics with numeric and histogram results
    var metricFilter = 'text';
    return lodash__WEBPACK_IMPORTED_MODULE_1___default.a.filter(data, function (metric) {
      var metricTypes = metric.type.split(',');
      return !lodash__WEBPACK_IMPORTED_MODULE_1___default.a.includes(metricTypes, metricFilter);
    });
  };

  IrondbDatasource.prototype.buildFetchStream = function (target, result, i, scopedVars) {
    result[i]['leaf_data'] = {
      egress_function: 'average',
      uuid: result[i]['uuid'],
      paneltype: result[i]['target']['paneltype'],
      target: target
    };
    var leafName = result[i]['metric_name'];

    if (target.egressoverride !== 'average') {
      if (target.egressoverride === 'automatic') {
        if (Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["isStatsdCounter"])(leafName)) {
          result[i]['leaf_data'].egress_function = 'counter';
        }
      } else {
        result[i]['leaf_data'].egress_function = target.egressoverride;
      }
    }

    var metriclabel = target.metriclabel;

    if (target.labeltype === 'default') {
      metriclabel = '%n | %t{*}';
    } else if (target.labeltype === 'name') {
      metriclabel = '%n';
    } else if (target.labeltype === 'cardinality') {
      metriclabel = '%n | %t-{*}';
    }

    metriclabel = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["metaInterpolateLabel"])(metriclabel, result, i);
    metriclabel = this.templateSrv.replace(metriclabel, scopedVars);
    result[i]['leaf_data'].metriclabel = metriclabel;
    result[i]['leaf_data'].check_tags = result[i].check_tags;

    if (target.rolluptype !== 'automatic' && !lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isEmpty(target.metricrollup)) {
      result[i]['leaf_data'].rolluptype = target.rolluptype;
      result[i]['leaf_data'].metricrollup = target.metricrollup;
    }

    result[i]['leaf_data'].metrictype = result[i]['type'];
    return {
      leaf_name: leafName,
      leaf_data: result[i]['leaf_data']
    };
  };

  IrondbDatasource.prototype.buildAlertFetchStream = function (target, result, i) {
    var e_12, _a;

    result[i]['leaf_data'] = {
      target: target
    };
    var metricName = result[i]['metric_name'];
    var check_uuid = result[i]['uuid'];
    var check_id = undefined;

    try {
      for (var _b = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(result[i]['check_tags']), _c = _b.next(); !_c.done; _c = _b.next()) {
        var tag = _c.value;
        var ts = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["splitTags"])(tag);

        if (!lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isUndefined(ts['__check_id'])) {
          check_id = ts['__check_id'];
          break;
        }
      }
    } catch (e_12_1) {
      e_12 = {
        error: e_12_1
      };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
      } finally {
        if (e_12) throw e_12.error;
      }
    }

    var active = target.alert_state === 'active';
    var leafName = '(metric:' + metricName + ')';

    if (!lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isUndefined(check_id)) {
      leafName = leafName + '(check_id:' + check_id + ')';
    }

    if (active) {
      leafName = leafName + '(active:1)';
    }

    return {
      leaf_name: leafName,
      leaf_data: result[i]['leaf_data']
    };
  };

  IrondbDatasource.prototype.buildFetchParamsAsync = function (cleanOptions, target, start, end) {
    var _this = this;

    var rawQuery = this.templateSrv.replace(target['query'], cleanOptions['scopedVars']);
    return this.metricTagsQuery(rawQuery, false, start, end).then(function (result) {
      result.data = _this.filterMetricsByType(target, result.data);

      for (var i = 0; i < result.data.length; i++) {
        result.data[i]['target'] = target;
      }

      return result.data;
    }).then(function (result) {
      for (var i = 0; i < result.length; i++) {
        cleanOptions['std']['names'].push(_this.buildFetchStream(target, result, i, cleanOptions['scopedVars']));
      }

      return cleanOptions;
    });
  };

  IrondbDatasource.prototype.buildAlertQueryAsync = function (cleanOptions, target, start, end) {
    var rawQuery = this.templateSrv.replace(target['query'], cleanOptions['scopedVars']);

    if (target['alert_id'] !== '') {
      rawQuery = 'alert_id:' + this.templateSrv.replace(target['alert_id'], cleanOptions['scopedVars']);
    }

    cleanOptions['alert']['names'].push(rawQuery);
    cleanOptions['alert']['local_filters'].push(this.templateSrv.replace(target['local_filter'], cleanOptions['scopedVars']));
    cleanOptions['alert']['local_filter_matches'].push(target['local_filter_match']);
    cleanOptions['alert']['counts_only'] = target.querytype === 'alert_counts';
    cleanOptions['alert']['query_type'] = target['alert_count_query_type'];
    cleanOptions['alert']['labels'].push(this.templateSrv.replace(target['metriclabel'], cleanOptions['scopedVars']));
    cleanOptions['alert']['target'] = target;
  };

  IrondbDatasource.prototype.buildIrondbParamsAsync = function (options) {
    var _this = this;

    var cleanOptions = {};
    var start = new Date(options.range.from).getTime() / 1000;
    var end = new Date(options.range.to).getTime() / 1000;
    var intervalMs = Math.round((options.range.to.valueOf() - options.range.from.valueOf()) / options.maxDataPoints);
    cleanOptions['scopedVars'] = options.scopedVars;
    cleanOptions['meta'] = options.meta;
    cleanOptions['refId'] = options.refId;
    cleanOptions['maxDataPoints'] = options.maxDataPoints;
    cleanOptions['intervalMs'] = intervalMs;
    cleanOptions['std'] = {};
    cleanOptions['std']['start'] = start;
    cleanOptions['std']['end'] = end;
    cleanOptions['std']['names'] = [];
    cleanOptions['caql'] = {};
    cleanOptions['caql']['start'] = start;
    cleanOptions['caql']['end'] = end;
    cleanOptions['caql']['names'] = [];
    cleanOptions['alert'] = {};
    cleanOptions['alert']['names'] = [];
    cleanOptions['alert']['start'] = start;
    cleanOptions['alert']['end'] = end;
    cleanOptions['alert']['local_filters'] = [];
    cleanOptions['alert']['local_filter_matches'] = [];
    cleanOptions['alert']['labels'] = [];

    var targets = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.reject(options.targets, function (target) {
      var reject = target.hide || target['query'] === undefined && target['alert_id'] === undefined || target['query'].length === 0 && target['alert_id'].length === 0;
      return reject;
    });

    if (!targets.length) {
      return {};
    }

    var promises = targets.map(function (target) {
      if (target.isCaql || target.querytype === 'caql') {
        cleanOptions['caql']['names'].push({
          leaf_name: target['query'],
          leaf_data: {
            rolluptype: target.rolluptype,
            metricrollup: target.metricrollup,
            format: target.format
          }
        });
        return Promise.resolve(cleanOptions);
      } else if (target.querytype === 'alerts' || target.querytype === 'alert_counts') {
        return _this.buildAlertQueryAsync(cleanOptions, target, start, end);
      } else {
        return _this.buildFetchParamsAsync(cleanOptions, target, start, end);
      }
    });
    return Promise.all(promises).then(function (result) {
      return cleanOptions;
    })["catch"](function (err) {
      log(function () {
        return 'buildIrondbParams() err = ' + JSON.stringify(err);
      });

      if (err.status !== 0 || err.status >= 300) {}
    });
  };

  IrondbDatasource.prototype.buildIrondbParams = function (options) {
    var self = this;
    return new Promise(function (resolve, reject) {
      resolve(self.buildIrondbParamsAsync(options));
    });
  };

  IrondbDatasource.prototype.convertIrondbDf4DataToGrafana = function (result, query) {
    var name = query.name;
    var metricLabels = query.metricLabels || {};
    var check_tags = query.check_tags || [];
    var data = result.data.data;
    var meta = result.data.meta;
    var cleanData = [];
    var st = result.data.head.start;
    var period = result.data.head.period;
    var error = result.data.head.error;
    var format = query.format || 'ts';

    if (!lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isEmpty(error)) {
      throw new Error(error.join('\n'));
    }

    if (!data || data.length === 0) {
      return {
        data: cleanData
      };
    }

    log(function () {
      return 'Format: ' + format;
    });

    if (format === 'table') {
      // to tabulate we need to invert the data that comes back and iterate
      // values for each return instead of each return then values.
      // we use the first result record to fill the timeField
      // because we are guaranteed to have the same number of records
      // across all the results due to how irondb works.
      var timeField = getTimeField();
      var labelFields = new Set();
      var valueFields = new Set();
      var all_labels = {};
      var all_values = {};

      var _loop_2 = function _loop_2(i) {
        var ts = (st + i * period) * 1000;

        if (ts < query.start * 1000) {
          return "continue";
        }

        var _loop_4 = function _loop_4(si) {
          var e_13, _a; // first we add a timeField entry for each result.
          // this is in case tag values differ.


          log(function () {
            return 'convertIrondbDf4DataToGrafana(table) ts: ' + ts;
          });
          timeField.values.add(ts);
          var dummy = name + ' [' + (si + 1) + ']';
          var lname = meta[si] ? meta[si].label : dummy;
          lname = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["taglessName"])(lname);
          var tags = meta[si].tags;
          var metricLabel = metricLabels[si];

          if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isString(metricLabel)) {
            lname = metricLabel;
          }

          if (check_tags[si] !== undefined) {
            if (tags === undefined) {
              tags = check_tags[si];
            } else {
              tags.push.apply(tags, check_tags[si]);
            }
          }

          log(function () {
            return 'convertIrondbDf4DataToGrafana(table) name: ' + lname + ', tags: ' + tags;
          });

          if (tags !== undefined) {
            try {
              for (var tags_2 = (e_13 = void 0, Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(tags)), tags_2_1 = tags_2.next(); !tags_2_1.done; tags_2_1 = tags_2.next()) {
                var tag = tags_2_1.value;
                var tagSep = tag.split(/:/g);
                var tagCat = tagSep.shift();
                var tagVal = tagSep.join(':');

                if (!tagCat.startsWith('__')) {
                  tagCat = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["decodeTag"])(tagCat);
                  tagVal = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["decodeTag"])(tagVal);

                  if (!all_labels[tagCat]) {
                    var lfield_1 = {
                      name: tagCat,
                      config: {
                        filterable: false
                      },
                      type: _grafana_data__WEBPACK_IMPORTED_MODULE_6__["FieldType"].other,
                      values: new _grafana_data__WEBPACK_IMPORTED_MODULE_6__["ArrayVector"]()
                    };
                    all_labels[tagCat] = lfield_1;
                    labelFields.add(lfield_1);
                  }

                  var lfield = all_labels[tagCat];
                  lfield.values.add(tagVal);
                }
              }
            } catch (e_13_1) {
              e_13 = {
                error: e_13_1
              };
            } finally {
              try {
                if (tags_2_1 && !tags_2_1.done && (_a = tags_2["return"])) _a.call(tags_2);
              } finally {
                if (e_13) throw e_13.error;
              }
            }
          }

          if (!all_values[lname]) {
            var vfield_1 = {
              name: lname,
              config: {
                filterable: false,
                displayName: lname
              },
              type: _grafana_data__WEBPACK_IMPORTED_MODULE_6__["FieldType"].number,
              values: new _grafana_data__WEBPACK_IMPORTED_MODULE_6__["ArrayVector"]()
            };
            all_values[lname] = vfield_1;
            valueFields.add(vfield_1);
          }

          var vfield = all_values[lname];

          if (data[si][i] !== null && data[si][i].constructor === Number) {
            vfield.values.add(data[si][i]);
          } else {
            vfield.values.add(null);
          }
        };

        for (var si = 0; si < data.length; si++) {
          _loop_4(si);
        }
      };

      for (var i = 0; i < data[0].length; i++) {
        _loop_2(i);
      }

      return {
        t: 'table',
        data: {
          length: timeField.values.length,
          fields: Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__spread"])([timeField], labelFields, valueFields)
        },
        state: _grafana_data__WEBPACK_IMPORTED_MODULE_6__["LoadingState"].Done
      };
    }

    var dataFrames = []; // Only supports one histogram.. So sad.

    var lookaside = {};

    var _loop_3 = function _loop_3(si) {
      var e_14, _a;

      var dummy = name + ' [' + (si + 1) + ']';
      var tname = meta[si] ? meta[si].label : dummy;
      var explicitTags = tname.match(/\|ST\[[^\]]*\]/) != null;
      var lname = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["taglessName"])(tname);
      var tags = meta[si].tags;
      var metricLabel = metricLabels[si];

      if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isString(metricLabel)) {
        lname = metricLabel;
      }

      log(function () {
        return 'convertIrondbDf4DataToGrafana() tags: ' + tags;
      });
      var labels = {};

      if (check_tags[si] !== undefined) {
        if (tags === undefined) {
          tags = check_tags[si];
        } else {
          tags.push.apply(tags, check_tags[si]);
        }
      }

      var decoded_tags = [];

      if (tags !== undefined) {
        try {
          for (var tags_3 = (e_14 = void 0, Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(tags)), tags_3_1 = tags_3.next(); !tags_3_1.done; tags_3_1 = tags_3.next()) {
            var tag = tags_3_1.value;
            var tagSep = tag.split(/:/g);
            var tagCat = tagSep.shift();
            var tagVal = tagSep.join(':');

            if (!tagCat.startsWith('__')) {
              tagCat = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["decodeTag"])(tagCat);
              tagVal = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["decodeTag"])(tagVal);
              labels[tagCat] = tagVal;
              decoded_tags.push(tagCat + ':' + tagVal);
            }
          }
        } catch (e_14_1) {
          e_14 = {
            error: e_14_1
          };
        } finally {
          try {
            if (tags_3_1 && !tags_3_1.done && (_a = tags_3["return"])) _a.call(tags_3);
          } finally {
            if (e_14) throw e_14.error;
          }
        }
      }

      lname = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["decodeTagsInLabel"])(lname);
      var dname = lname;

      if (decoded_tags.length > 0 && explicitTags) {
        dname = dname + ' { ' + decoded_tags.join(', ') + ' }';
      }

      var timeField = getTimeField();
      var numericValueField = {
        name: _grafana_data__WEBPACK_IMPORTED_MODULE_6__["TIME_SERIES_VALUE_FIELD_NAME"],
        type: _grafana_data__WEBPACK_IMPORTED_MODULE_6__["FieldType"].number,
        config: {
          displayName: dname
        },
        labels: labels,
        values: new _grafana_data__WEBPACK_IMPORTED_MODULE_6__["ArrayVector"]()
      };
      log(function () {
        return 'convertIrondbDf4DataToGrafana() Labels: ' + JSON.stringify(labels);
      });

      for (var i = 0; i < data[si].length; i++) {
        if (data[si][i] === null) {
          continue;
        }

        var ts = (st + i * period) * 1000;

        if (ts < query.start * 1000) {
          continue;
        }

        if (data[si][i].constructor === Number) {
          timeField.values.add(ts);
          numericValueField.values.add(data[si][i]);
        } else if (data[si][i].constructor === Object) {
          for (var vstr in data[si][i]) {
            var cnt = data[si][i][vstr];
            var v = parseFloat(vstr);
            vstr = v.toString();
            var tsstr = ts.toString();

            if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isUndefined(lookaside[vstr])) {
              lookaside[vstr] = {
                target: vstr,
                title: vstr,
                tags: labels,
                datapoints: [],
                _ts: {}
              };
              dataFrames.push(lookaside[vstr]);
            }

            if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isUndefined(lookaside[vstr]._ts[tsstr])) {
              lookaside[vstr]._ts[tsstr] = [cnt, ts];
              lookaside[vstr].datapoints.push(lookaside[vstr]._ts[tsstr]);
            } else {
              lookaside[vstr]._ts[tsstr][0] += cnt;
            }
          }
        }
      }

      if (numericValueField.values.length > 0) {
        dataFrames.push({
          length: timeField.values.length,
          fields: [timeField, numericValueField]
        });
      }
    };

    for (var si = 0; si < data.length; si++) {
      _loop_3(si);
    }

    return {
      data: dataFrames
    };
  }; // an alert looks like this:
  //   {
  //   "_cid": "/alert/48145680",
  //   "_acknowledgement": null,
  //   "_alert_url": "https://mlb-infrastructure.circonus.com/fault-detection/alerts/48145680",
  //   "_broker": "/broker/2761",
  //   "_check": "/check/283849",
  //   "_check_name": "AMQ - legacy 02 npd activemq",
  //   "_cleared_on": null,
  //   "_cleared_value": null,
  //   "_maintenance": [
  //     "/maintenance/169927",
  //     "/maintenance/167993",
  //     "/maintenance/167992",
  //     "/maintenance/167991",
  //     "/maintenance/167575",
  //     "/maintenance/167574",
  //     "/maintenance/167573",
  //     "/maintenance/166899",
  //     "/maintenance/166898",
  //     "/maintenance/166839",
  //     "/maintenance/166838",
  //     "/maintenance/171161",
  //     "/maintenance/161011",
  //     "/maintenance/161010",
  //     "/maintenance/160774",
  //     "/maintenance/160773",
  //     "/maintenance/159757"
  //   ],
  //   "_metric_link": null,
  //   "_metric_name": "QueueSize",
  //   "_canonical_metric_name": "QueueSize|ST[brokerName:Internal_ActiveMQ_Broker,destinationName:lookup.background.job.topic.qa,destinationType:Queue,host:activemq02-internal.legacy.us-east4.bdatasf-gcp-npd.mlbinfra.net,type:Broker]",
  //   "_signature": "8f6126f5-3be4-4324-9831-ce468bef21e7`QueueSize|ST[brokerName:Internal_ActiveMQ_Broker,destinationName:lookup.background.job.topic.qa,destinationType:Queue,host:activemq02-internal.legacy.us-east4.bdatasf-gcp-npd.mlbinfra.net,type:Broker]",
  //   "_metric_notes": "{\"notes\":\"AMQ QueueSize has gotten too large, check subscribers\"}",
  //   "_occurred_on": 1609958123,
  //   "_rule_set": "/rule_set/268647",
  //   "_severity": 1,
  //   "_tags": [
  //     "category:partner",
  //     "env:npd",
  //     "service:amq"
  //   ],
  //   "_value": "1091"
  // }
  // and the `rule` field will look like:
  // {
  //   "derive": "average",
  //   "_cid": "/rule_set/268647",
  //   "metric_name": "QueueSize",
  //   "check": "/check/0",
  //   "metric_type": "numeric",
  //   "tags": [],
  //   "_host": null,
  //   "notes": "AMQ QueueSize has gotten too large, check subscribers",
  //   "lookup_key": null,
  //   "name": null,
  //   "parent": null,
  //   "rules": [
  //     {
  //       "severity": 1,
  //       "criteria": "max value",
  //       "wait": 0,
  //       "windowing_duration": 120,
  //       "value": "1000",
  //       "windowing_min_duration": 0,
  //       "windowing_function": "average"
  //     }
  //   ],
  //   "link": null,
  //   "filter": "and(service:amq,not(env:prod),not(host:activemq*-internal.sportradar.us-east4.bdatasf-gcp-npd.mlbinfra.net))",
  //   "contact_groups": {
  //     "1": [
  //       "/contact_group/5738"
  //     ],
  //     "3": [],
  //     "5": [],
  //     "4": [],
  //     "2": []
  //   }
  // }


  IrondbDatasource.prototype.convertAlertDataToGrafana = function (enrich_results) {
    var e_15, _a, e_16, _b, e_17, _c, e_18, _e;

    var cleanData = [];

    if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isUndefined(enrich_results) || enrich_results.length === 0) {
      return {
        data: cleanData
      };
    }

    var dataFrames = [];

    for (var si = 0; si < enrich_results.length; si++) {
      var timeField = getTimeField();
      var alternateTimeField = getTimeField('alert_timestamp');
      var labelFields = new Set();
      var valueFields = new Set();
      var all_labels = {};
      var all_values = {};
      var fields = {
        _acknowledgement: getTextField('acknowledgement'),
        _alert_url: getTextField('circonus_alert_url'),
        _check_name: getTextField('check_name'),
        _cleared_on: getTimeField('cleared_timestamp'),
        _metric_link: getTextField('metric_link'),
        _severity: getNumberField('severity'),
        derive: getTextField('derive'),
        metric_type: getTextField('metric_type'),
        _value: getOtherField('alert_value'),
        _cleared_value: getOtherField('cleared_value'),
        _cid: getTextField('alert_id')
      };
      var specialFields = {
        _signature: getTextField('check_uuid'),
        _canonical_metric_name: getTextField('metric_name'),
        _metric_name: 1,
        _tags: 1
      };
      var thresholdFields = {
        threshold_1: getNumberField('threshold_1'),
        threshold_2: getNumberField('threshold_2'),
        threshold_3: getNumberField('threshold_3'),
        threshold_4: getNumberField('threshold_4'),
        threshold_5: getNumberField('threshold_5')
      };
      var alert = enrich_results[si]['alert'];
      var rule = enrich_results[si]['rule'];
      var tags = {};

      for (var key in alert) {
        if (key === '_occurred_on') {
          var epoch = alert[key];
          timeField.values.add(epoch * 1000); // to milliseconds

          alternateTimeField.values.add(epoch * 1000); // also create a time window 30 minutes before the alert up to 30 mins after the  cleared_on timestamp
          // if it's not a cleared alert, use an 30 mins after the alert timestamp as the window (or now if it's recent)

          var before = epoch - 1800;
          var cleared = alert['_cleared_on'];
          var after = epoch + 1800;

          if (cleared !== null && cleared !== undefined) {
            after = cleared + 1800;
          }

          if (after > Math.floor(Date.now() / 1000)) {
            after = Math.floor(Date.now() / 1000);
          }

          var window_start = getNumberField('alert_window_start');
          var window_end = getNumberField('alert_window_end');
          valueFields.add(window_start);
          valueFields.add(window_end);
          window_start.values.add(before * 1000);
          window_end.values.add(after * 1000); // special field called 'state' which contains "ALERTING" or "OK"

          var state = getTextField('state');
          valueFields.add(state);

          if (cleared !== null && cleared !== undefined) {
            state.values.add('OK');
          } else {
            state.values.add('ALERTING');
          }
        } else if (key === '_cid') {
          var cid = alert[key];
          fields[key].values.add(cid.replace('/alert/', ''));
          valueFields.add(fields[key]);
        } else if (key === '_cleared_on') {
          var epoch = alert[key];

          if (epoch !== null) {
            fields[key].values.add(epoch * 1000);
          } else {
            fields[key].values.add(null);
          }

          if (!all_values[key]) {
            all_values[key] = fields[key];
            valueFields.add(fields[key]);
          }
        } else if (fields[key] !== undefined) {
          var val = alert[key];

          if (key === '_cleared_value' && alert[key] === null) {
            val = '';
          }

          if (key === '_value' && alert[key] === null || alert[key] === '') {
            val = '';
          }

          fields[key].values.add(val);

          if (!all_values[key]) {
            all_values[key] = fields[key];
            valueFields.add(fields[key]);
          }
        } else if (specialFields[key] !== undefined) {
          if (key === '_signature') {
            var check_uuid = alert['_signature'].substring(0, alert['_signature'].indexOf('`'));
            specialFields[key].values.add(check_uuid);

            if (!all_values[key]) {
              all_values[key] = specialFields[key];
              valueFields.add(specialFields[key]);
            }
          } else if (key === '_canonical_metric_name') {
            var cn = alert[key];

            if (cn !== undefined && cn !== '') {
              var _f = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["taglessNameAndTags"])(cn), 2),
                  n = _f[0],
                  stream_tags = _f[1];

              specialFields[key].values.add(n);

              if (!all_values[key]) {
                all_values[key] = specialFields[key];
                valueFields.add(specialFields[key]);
              }

              var real_cn = getTextField('canonical_metric_name');
              valueFields.add(real_cn);
              real_cn.values.add(cn);
              var st = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["splitTags"])(stream_tags);
              Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["mergeTags"])(tags, st);
            }
          } else if (key === '_metric_name' && alert['_canonical_metric_name'] === '') {
            var name = alert[key];
            specialFields['_canonical_metric_name'].values.add(name);

            if (!all_values[key]) {
              all_values[key] = specialFields['_canonical_metric_name'];
              valueFields.add(specialFields['_canonical_metric_name']);
            }
          } else if (key === '_tags') {
            try {
              for (var _g = (e_15 = void 0, Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(alert[key])), _j = _g.next(); !_j.done; _j = _g.next()) {
                var tag = _j.value;
                var tagSep = tag.split(/:/g);
                var tagCat = tagSep.shift();

                if (!tagCat.startsWith('__') && tagCat !== '') {
                  var tagVal = tagSep.join(':');
                  tagCat = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["decodeTag"])(tagCat);
                  tagVal = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_5__["decodeTag"])(tagVal);

                  if (tags[tagCat] === undefined) {
                    tags[tagCat] = [];
                  }

                  tags[tagCat].push(tagVal);
                }
              }
            } catch (e_15_1) {
              e_15 = {
                error: e_15_1
              };
            } finally {
              try {
                if (_j && !_j.done && (_a = _g["return"])) _a.call(_g);
              } finally {
                if (e_15) throw e_15.error;
              }
            }
          }
        }
      } // deal with accumulated tags and make a single comma separated field of tags.


      var tagField = getTextField('tags');
      valueFields.add(tagField);
      var i = 0;
      var combinedTags = '';

      for (var tag in tags) {
        if (i > 0) {
          combinedTags = combinedTags + '|';
        }

        if (tag !== '' && !tag.startsWith('__')) {
          i++;
          combinedTags = combinedTags + tag + ':' + tags[tag][0]; // also add a dedicated field per tag so people can split them out
          // if they want to

          var tf = getTextField(tag);
          tf.values.add(tags[tag][0]);
          valueFields.add(tf);
        }
      }

      tagField.values.add(combinedTags); // add the threshold fields even if there is no ruleset

      for (var i_1 = 1; i_1 < 6; i_1++) {
        var key = 'threshold_' + i_1;

        if (!all_values[key]) {
          all_values[key] = thresholdFields[key];
          valueFields.add(thresholdFields[key]);
        }
      }

      var done_map = {};

      if (!lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isUndefined(rule) && rule !== null && rule['metric_type'] === 'numeric') {
        // add up to 5 thresholds (one for each severity) based on severity from the `rule` object.
        var d = rule['derive'];

        if (d === 'mixed') {
          try {
            // loop to find the first rule with a windowing_function
            for (var _k = (e_16 = void 0, Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(rule['rules'])), _l = _k.next(); !_l.done; _l = _k.next()) {
              var r = _l.value;
              d = r['windowing_function'];

              if (d !== undefined && d !== null) {
                break;
              }
            }
          } catch (e_16_1) {
            e_16 = {
              error: e_16_1
            };
          } finally {
            try {
              if (_l && !_l.done && (_b = _k["return"])) _b.call(_k);
            } finally {
              if (e_16) throw e_16.error;
            }
          }
        }

        var deriveField = getTextField('function');
        valueFields.add(deriveField);
        deriveField.values.add(d);

        try {
          for (var _o = (e_17 = void 0, Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(rule['rules'])), _p = _o.next(); !_p.done; _p = _o.next()) {
            var r = _p.value;
            var sev = r['severity'];

            if (sev === 0) {
              continue; // sev 0 means to clear the alert, ignore it for thresholding purposes.
            }

            var key = 'threshold_' + sev;
            thresholdFields[key].values.add(r['value']);
            done_map[sev] = 1;
          }
        } catch (e_17_1) {
          e_17 = {
            error: e_17_1
          };
        } finally {
          try {
            if (_p && !_p.done && (_c = _o["return"])) _c.call(_o);
          } finally {
            if (e_17) throw e_17.error;
          }
        }
      }

      for (var i_2 = 1; i_2 < 6; i_2++) {
        if (done_map[i_2] === undefined) {
          var key = 'threshold_' + i_2;
          thresholdFields[key].values.add(-1);
        }
      } // add a text based description of the rules that are attached to this alert, separated by pipes
      //   "rules": [
      //     {
      //       "severity": 1,
      //       "criteria": "max value",
      //       "wait": 0,
      //       "windowing_duration": 120,
      //       "value": "1000",
      //       "windowing_min_duration": 0,
      //       "windowing_function": "average"
      //     }


      var ruleField = getTextField('rule_text');
      var notesField = getTextField('notes');
      valueFields.add(ruleField);
      valueFields.add(notesField);

      if (!lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isUndefined(rule) && rule !== null) {
        if (rule['notes'] !== null && rule['notes'].length > 0) {
          notesField.values.add(rule['notes']);
        } else {
          var mn = alert['metric_notes'];

          if (mn !== undefined && mn.length > 0) {
            // metric notes from the alert object is an embedded javascript string. eww.
            try {
              var notes = JSON.parse(mn);
              notesField.values.add(notes['notes']);
            } catch (err) {
              notesField.values.add('');
            }
          }
        }

        var text = '';
        var i_3 = 0;

        try {
          for (var _q = (e_18 = void 0, Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(rule['rules'])), _r = _q.next(); !_r.done; _r = _q.next()) {
            var r = _r.value;
            var winfunc = r['windowing_function'];
            var duration = '';

            if (winfunc === null) {
              winfunc = 'value';
            } else {
              duration = '(over ' + r['windowing_duration'] + ' seconds) ';
            }

            var t = 'if the ' + winfunc + ' ' + duration;

            if (r['criteria'] === 'on absence') {
              t += 'is absent for ' + r['value'] + ' seconds, ';
            } else if (r['criteria'] === 'max value') {
              t += 'is present and >= ' + r['value'] + ', ';
            } else if (r['criteria'] === 'min value') {
              t += 'is present and < ' + r['value'] + ', ';
            } else if (r['criteria'] === 'matches') {
              t += "is present and matches '" + r['value'] + "', ";
            } else if (r['criteria'] === 'does not match') {
              t += "is present and does not match '" + r['value'] + "', ";
            }

            if (i_3 > 0) {
              t += "and prior rules aren't triggered, ";
            }

            if (r['severity'] === 0) {
              t += 'clear the alert.';
            } else {
              t += 'trigger a sev ' + r['severity'] + ' alert and wait ' + r['wait'] + ' minutes before notifying.';
            }

            if (i_3 > 0) {
              text += '|';
            }

            text += t;
            i_3++;
          }
        } catch (e_18_1) {
          e_18 = {
            error: e_18_1
          };
        } finally {
          try {
            if (_r && !_r.done && (_e = _q["return"])) _e.call(_q);
          } finally {
            if (e_18) throw e_18.error;
          }
        }

        ruleField.values.add(text);
      } else {
        ruleField.values.add('');
        notesField.values.add('');
      }

      dataFrames.push({
        length: timeField.values.length,
        fields: Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__spread"])([timeField, alternateTimeField], labelFields, valueFields)
      });
    }

    return {
      t: 'table',
      data: dataFrames,
      state: _grafana_data__WEBPACK_IMPORTED_MODULE_6__["LoadingState"].Done
    };
  };

  IrondbDatasource.DEFAULT_CACHE_ENTRIES = 128;
  IrondbDatasource.DEFAULT_CACHE_TIME_MS = 60000;
  IrondbDatasource.MAX_DATAPOINTS_THRESHOLD = 1.5;
  IrondbDatasource.MAX_EXACT_DATAPOINTS_THRESHOLD = 1.5;
  IrondbDatasource.MIN_DURATION_MS_FETCH = 1;
  IrondbDatasource.MIN_DURATION_MS_CAQL = 60 * 1000;
  IrondbDatasource.ROLLUP_ALIGN_MS = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map([1, 60, 3600, 86400], function (x) {
    return x * 1000;
  });
  IrondbDatasource.ROLLUP_ALIGN_MS_1DAY = 86400 * 1000;
  return IrondbDatasource;
}(_grafana_data__WEBPACK_IMPORTED_MODULE_6__["DataSourceApi"]);

/* harmony default export */ __webpack_exports__["default"] = (IrondbDatasource);

function getTimeField(name) {
  if (name === void 0) {
    name = _grafana_data__WEBPACK_IMPORTED_MODULE_6__["TIME_SERIES_TIME_FIELD_NAME"];
  }

  return {
    name: name,
    type: _grafana_data__WEBPACK_IMPORTED_MODULE_6__["FieldType"].time,
    config: {},
    values: new _grafana_data__WEBPACK_IMPORTED_MODULE_6__["ArrayVector"]()
  };
}

function getNumberField(name) {
  if (name === void 0) {
    name = _grafana_data__WEBPACK_IMPORTED_MODULE_6__["TIME_SERIES_VALUE_FIELD_NAME"];
  }

  return {
    name: name,
    type: _grafana_data__WEBPACK_IMPORTED_MODULE_6__["FieldType"].number,
    config: {},
    values: new _grafana_data__WEBPACK_IMPORTED_MODULE_6__["ArrayVector"]()
  };
}

function getTextField(name) {
  return {
    name: name,
    type: _grafana_data__WEBPACK_IMPORTED_MODULE_6__["FieldType"].string,
    config: {},
    values: new _grafana_data__WEBPACK_IMPORTED_MODULE_6__["ArrayVector"]()
  };
}

function getOtherField(name) {
  return {
    name: name,
    type: _grafana_data__WEBPACK_IMPORTED_MODULE_6__["FieldType"].other,
    config: {},
    values: new _grafana_data__WEBPACK_IMPORTED_MODULE_6__["ArrayVector"]()
  };
}

/***/ }),

/***/ "./irondb_query.ts":
/*!*************************!*\
  !*** ./irondb_query.ts ***!
  \*************************/
/*! exports provided: SegmentType, splitTags, mergeTags, taglessNameAndTags, taglessName, metaInterpolateLabel, encodeTag, decodeTag, decodeTagsInLabel, decodeNameAndTags, isStatsdCounter, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SegmentType", function() { return SegmentType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "splitTags", function() { return splitTags; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mergeTags", function() { return mergeTags; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "taglessNameAndTags", function() { return taglessNameAndTags; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "taglessName", function() { return taglessName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "metaInterpolateLabel", function() { return metaInterpolateLabel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "encodeTag", function() { return encodeTag; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decodeTag", function() { return decodeTag; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decodeTagsInLabel", function() { return decodeTagsInLabel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decodeNameAndTags", function() { return decodeNameAndTags; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isStatsdCounter", function() { return isStatsdCounter; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../node_modules/tslib/tslib.es6.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _log__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./log */ "./log.ts");



var log = Object(_log__WEBPACK_IMPORTED_MODULE_2__["default"])('IrondbQuery');
var SegmentType;

(function (SegmentType) {
  SegmentType[SegmentType["MetricName"] = 0] = "MetricName";
  SegmentType[SegmentType["TagCat"] = 1] = "TagCat";
  SegmentType[SegmentType["TagVal"] = 2] = "TagVal";
  SegmentType[SegmentType["TagPair"] = 3] = "TagPair";
  SegmentType[SegmentType["TagSep"] = 4] = "TagSep";
  SegmentType[SegmentType["TagEnd"] = 5] = "TagEnd";
  SegmentType[SegmentType["TagOp"] = 6] = "TagOp";
  SegmentType[SegmentType["TagPlus"] = 7] = "TagPlus";
})(SegmentType || (SegmentType = {}));

function splitTags(tags, decode) {
  var e_1, _a;

  if (decode === void 0) {
    decode = true;
  }

  var outTags = {};

  try {
    for (var _b = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(tags.split(/,/g)), _c = _b.next(); !_c.done; _c = _b.next()) {
      var tag = _c.value;
      var tagSep = tag.split(/:/g);
      var tagCat = tagSep.shift();
      var tagVal = tagSep.join(':');

      if (decode) {
        tagCat = decodeTag(tagCat);
        tagVal = decodeTag(tagVal);
      }

      var tagVals = outTags[tagCat];

      if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isUndefined(tagVals)) {
        outTags[tagCat] = tagVals = [];
      }

      tagVals.push(tagVal);
    }
  } catch (e_1_1) {
    e_1 = {
      error: e_1_1
    };
  } finally {
    try {
      if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
    } finally {
      if (e_1) throw e_1.error;
    }
  }

  return outTags;
}
function mergeTags(dest, source) {
  for (var cat in source) {
    var vals = dest[cat];

    if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isUndefined(vals)) {
      dest[cat] = vals = [];
    }

    vals.push.apply(vals, source[cat]);
  }
}
function taglessNameAndTags(name) {
  var tags = '';
  var tagStart = name.indexOf('ST[');

  if (tagStart !== -1) {
    tags = name.substring(tagStart + 3, name.length - 1);
    name = name.substring(0, tagStart - 1);
  }

  return [name, tags];
}
function taglessName(name) {
  return taglessNameAndTags(name)[0];
} // given an array of meta objects, return true if the tag cat
// specified has variance in the array

var _privateNil = {}; // just some truthy value different from every string

function metaTagDiff(meta, tag) {
  var e_2, _a;

  var keycnt = 0;
  var seen = new Map();

  for (var i = 0; i < meta.length; i++) {
    var _b = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(taglessNameAndTags(meta[i].metric_name), 2),
        name = _b[0],
        tags = _b[1];

    var tagSet = splitTags(tags);

    try {
      for (var _c = (e_2 = void 0, Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(meta[i].check_tags)), _d = _c.next(); !_d.done; _d = _c.next()) {
        var tag_1 = _d.value;
        var tagSep = tag_1.split(/:/g);
        var tagCat = tagSep.shift();

        if (!tagCat.startsWith('__') && tagCat !== '') {
          var tagVal = tagSep.join(':');
          tagCat = decodeTag(tagCat);
          tagVal = decodeTag(tagVal);

          if (tagSet[tagCat] === undefined) {
            tagSet[tagCat] = [];
          }

          tagSet[tagCat].push(tagVal);
        }
      }
    } catch (e_2_1) {
      e_2 = {
        error: e_2_1
      };
    } finally {
      try {
        if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
      } finally {
        if (e_2) throw e_2.error;
      }
    }

    var mtag = tag !== '' && tagSet[tag] !== undefined ? tagSet[tag][0] : _privateNil;

    if (seen.get(mtag) === undefined) {
      keycnt = keycnt + 1;
    }

    seen.set(mtag, true);
  }

  return keycnt > 1;
}

function metaInterpolateLabel(fmt, metaIn, idx) {
  var e_3, _a;

  var meta = metaIn[idx]; // case %d

  var label = fmt.replace(/%d/g, (idx + 1).toString()); // case %n

  label = label.replace(/%n/g, taglessName(meta.metric_name)); // case %cn

  label = label.replace(/%cn/g, meta.metric_name); // allow accessing the check tags

  var _b = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(taglessNameAndTags(meta.metric_name), 2),
      name = _b[0],
      stream_tags = _b[1];

  var tagSet = splitTags(stream_tags);

  try {
    for (var _c = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(meta.check_tags), _d = _c.next(); !_d.done; _d = _c.next()) {
      var tag = _d.value;
      var tagSep = tag.split(/:/g);
      var tagCat = tagSep.shift();

      if (!tagCat.startsWith('__') && tagCat !== '') {
        var tagVal = tagSep.join(':');
        tagCat = decodeTag(tagCat);
        tagVal = decodeTag(tagVal);

        if (tagSet[tagCat] === undefined) {
          tagSet[tagCat] = [];
        }

        tagSet[tagCat].push(tagVal);
      }
    }
  } catch (e_3_1) {
    e_3 = {
      error: e_3_1
    };
  } finally {
    try {
      if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
    } finally {
      if (e_3) throw e_3.error;
    }
  } // case %tv


  label = label.replace(/%tv-?{([^}]*)}/g, function (x) {
    var e_4, _a;

    var elide = x.substring(3, 4);
    var choose = elide === '-' ? metaTagDiff : function () {
      return true;
    };
    var tag = x.substring(elide === '-' ? 5 : 4, x.length - 1);

    if (tag === '*') {
      var tagCats = [];

      try {
        for (var _b = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.keys(tagSet)), _c = _b.next(); !_c.done; _c = _b.next()) {
          var k = _c.value;

          if (!k.startsWith('__') && k !== '' && choose(metaIn, k)) {
            tagCats.push(k);
          }
        }
      } catch (e_4_1) {
        e_4 = {
          error: e_4_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        } finally {
          if (e_4) throw e_4.error;
        }
      }

      tagCats.sort();

      var tagVals = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(tagCats, function (tagCat) {
        return tagSet[tagCat][0];
      });

      return tagVals.join(',');
    }

    if (tagSet[tag] !== undefined && tag !== '' && choose(metaIn, tag)) {
      return tagSet[tag][0];
    }

    return '';
  }); // case %t

  label = label.replace(/%t-?{([^}]*)}/g, function (x) {
    var e_5, _a;

    var elide = x.substring(2, 3);
    var choose = elide === '-' ? metaTagDiff : function () {
      return true;
    };
    var tag = x.substring(elide === '-' ? 4 : 3, x.length - 1);

    if (tag === '*') {
      var tagCats = [];

      try {
        for (var _b = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.keys(tagSet)), _c = _b.next(); !_c.done; _c = _b.next()) {
          var k = _c.value;

          if (!k.startsWith('__') && k !== '' && choose(metaIn, k)) {
            var v = tagSet[k][0];
            tagCats.push(k + ':' + v);
          }
        }
      } catch (e_5_1) {
        e_5 = {
          error: e_5_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        } finally {
          if (e_5) throw e_5.error;
        }
      }

      tagCats.sort();
      return tagCats.join(',');
    }

    if (tagSet[tag] !== undefined && tag !== '' && choose(metaIn, tag)) {
      return tag + ':' + tagSet[tag][0];
    }

    return '';
  });
  return label;
}
/*
 * map for ascii tags
  perl -e '$valid = qr/[`+A-Za-z0-9!@#\$%^&"'\/\?\._-]/;
  foreach $i (0..7) {
  foreach $j (0..31) { printf "%d,", chr($i*32+$j) =~ $valid; }
  print "\n";
  }'
*/
// prettier-ignore

var vTagMapKey = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
/* Same as above, but allow for ':' and '=' */
// prettier-ignore

var vTagMapValue = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

function IsTaggableKeyChar(c) {
  return vTagMapKey[c] === 1;
}

function IsTaggableValueChar(c) {
  return vTagMapValue[c] === 1;
}

function IsTaggablePart(tag, tagPartFunction) {
  var n = 0;

  for (var i = 0; i < tag.length; i++) {
    var c = tag.charCodeAt(i);

    if (tagPartFunction(c)) {
      n += 1;
    }
  }

  return n === tag.length;
}

function IsTaggableKey(tag) {
  return IsTaggablePart(tag, IsTaggableKeyChar);
}

function IsTaggableValue(tag) {
  return IsTaggablePart(tag, IsTaggableValueChar);
}

function encodeTag(type, tag, exactMatch) {
  if (exactMatch === void 0) {
    exactMatch = true;
  }

  if (type === SegmentType.MetricName) {
    type = SegmentType.TagVal;
  }

  var needsBase64 = false;

  if (type === SegmentType.TagCat && !IsTaggableKey(tag)) {
    needsBase64 = true;
  } else if (type === SegmentType.TagVal && !IsTaggableValue(tag)) {
    if (!(tag.length === 1 && tag.charAt(0) === '*')) {
      needsBase64 = true;
    }
  }

  if (needsBase64) {
    var base64Char = '"';

    if (exactMatch) {
      base64Char = '!';
    }

    tag = ['b', base64Char, btoa(tag), base64Char].join('');
  }

  return tag;
}
function decodeTag(tag) {
  if (tag.startsWith('b"') && tag.endsWith('"') || tag.startsWith('b!') && tag.endsWith('!')) {
    tag = atob(tag.slice(2, tag.length - 1));
  }

  return tag;
}
function decodeTagsInLabel(label) {
  var i = 0;
  var l = label.length;
  var replaced = label;

  while (i < l && i !== -1) {
    i = label.indexOf('b"', i);

    if (i === -1) {
      return replaced;
    } else {
      var j = label.indexOf('"', i + 2);

      if (j === -1) {
        //malformed base64 encoding.
        return replaced;
      }

      var t = decodeTag(label.substring(i, j + 1));
      replaced = replaced.replace(label.substring(i, j + 1), t);
      i = j + 1;
    }
  }

  return replaced;
}
function decodeNameAndTags(name) {
  var e_6, _a;

  var tags = [];

  var _b = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(taglessNameAndTags(name), 2),
      metric = _b[0],
      rawTags = _b[1];

  var tagSet = splitTags(rawTags);

  try {
    for (var _c = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.keys(tagSet)), _d = _c.next(); !_d.done; _d = _c.next()) {
      var tagCat = _d.value;
      tags.push(tagCat + ':' + tagSet[tagCat][0]);
    }
  } catch (e_6_1) {
    e_6 = {
      error: e_6_1
    };
  } finally {
    try {
      if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
    } finally {
      if (e_6) throw e_6.error;
    }
  }

  return metric + (tags.length > 1 ? '|ST[' + tags.join(',') + ']' : '');
}
function isStatsdCounter(name) {
  var _a = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(taglessNameAndTags(name), 2),
      metric = _a[0],
      rawTags = _a[1];

  var tagSet = splitTags(rawTags);
  var statsdType = tagSet['statsd_type'];

  if (statsdType !== undefined && statsdType.includes('count')) {
    return true;
  }

  return false;
}

var IrondbQuery =
/** @class */
function () {
  IrondbQuery.$inject = ["datasource", "target", "templateSrv", "scopedVars"];

  /** @ngInject */
  function IrondbQuery(datasource, target, templateSrv, scopedVars) {
    this.datasource = datasource;
    this.target = target;
    this.parseTarget();
  }

  IrondbQuery.prototype.parseTarget = function () {
    var e_7, _a;

    var _this = this;

    this.segments = [];
    this.error = null;

    if (this.target.rawQuery) {
      return;
    }

    log(function () {
      return 'parseTarget() target = ' + JSON.stringify(_this.target);
    });
    var metricName = this.target.query; // Strip 'and(__name:)' from metric name

    metricName = metricName.slice(11, -1) || '*';
    var tags = metricName.split(',');
    metricName = tags.shift();
    this.segments.push({
      type: SegmentType.MetricName,
      value: decodeTag(metricName)
    });
    var first = true;

    try {
      for (var tags_1 = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(tags), tags_1_1 = tags_1.next(); !tags_1_1.done; tags_1_1 = tags_1.next()) {
        var tag = tags_1_1.value;

        if (first) {
          first = false;
        } else {
          this.segments.push({
            type: SegmentType.TagSep
          });
        }

        tag = tag.split(':');
        var tagCat = tag.shift();
        var tagVal = tag.join(':');
        var tagOp = false;
        var tagIndex = 4;

        if (tagCat.startsWith('and(') || tagCat.startsWith('not(')) {
          tagOp = true;
        } else if (tagCat.startsWith('or(')) {
          tagOp = true;
          tagIndex = 3;
        }

        if (tagOp) {
          this.segments.push({
            type: SegmentType.TagOp,
            value: tagCat.slice(0, tagIndex)
          });
          tagCat = tagCat.slice(tagIndex);
        }

        this.segments.push({
          type: SegmentType.TagCat,
          value: decodeTag(tagCat)
        });
        this.segments.push({
          type: SegmentType.TagPair
        });
        var end = 0;

        while (tagVal.endsWith(')')) {
          tagVal = tagVal.slice(0, -1);
          end++;
        }

        this.segments.push({
          type: SegmentType.TagVal,
          value: decodeTag(tagVal)
        });

        for (var i = 0; i < end; i++) {
          this.segments.push({
            type: SegmentType.TagPlus
          });
          this.segments.push({
            type: SegmentType.TagEnd
          });
        }
      }
    } catch (e_7_1) {
      e_7 = {
        error: e_7_1
      };
    } finally {
      try {
        if (tags_1_1 && !tags_1_1.done && (_a = tags_1["return"])) _a.call(tags_1);
      } finally {
        if (e_7) throw e_7.error;
      }
    }

    if (tags.length === 0) {
      this.segments.push({
        type: SegmentType.TagPlus
      });
    }

    log(function () {
      return 'parseTarget() SegmentType = ' + JSON.stringify(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(_this.segments, function (s) {
        return SegmentType[s.type];
      }));
    });
  };

  IrondbQuery.prototype.updateSegmentValue = function (segment, index) {
    var _this = this;

    log(function () {
      return 'updateSegmentValue() ' + index + ' segment = ' + JSON.stringify(segment);
    });
    log(function () {
      return 'updateSegmentValue() length = ' + _this.segments.length;
    });

    if (this.segments[index] !== undefined) {
      this.segments[index].value = segment.value;
    }
  };

  IrondbQuery.prototype.addSelectMetricSegment = function () {
    this.segments.push({
      value: 'select metric'
    });
  };

  return IrondbQuery;
}();

/* harmony default export */ __webpack_exports__["default"] = (IrondbQuery);

/***/ }),

/***/ "./log.ts":
/*!****************!*\
  !*** ./log.ts ***!
  \****************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Log; });
var logEnabled = true;

var now = function now() {
  return new Date().toISOString();
};

function Log(category) {
  if (logEnabled) {
    category = ' [' + category + '] ';
    return function (message) {
      return console.log(now() + category + message());
    };
  } else {
    return function (message) {};
  }
}

/***/ }),

/***/ "./module.ts":
/*!*******************!*\
  !*** ./module.ts ***!
  \*******************/
/*! exports provided: Datasource, QueryCtrl, ConfigCtrl, AnnotationsQueryCtrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _datasource__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./datasource */ "./datasource.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Datasource", function() { return _datasource__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _query_ctrl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./query_ctrl */ "./query_ctrl.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "QueryCtrl", function() { return _query_ctrl__WEBPACK_IMPORTED_MODULE_1__["IrondbQueryCtrl"]; });

/* harmony import */ var _config_ctrl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./config_ctrl */ "./config_ctrl.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ConfigCtrl", function() { return _config_ctrl__WEBPACK_IMPORTED_MODULE_2__["IrondbConfigCtrl"]; });

/* harmony import */ var _annotation_query_ctrl__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./annotation_query_ctrl */ "./annotation_query_ctrl.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AnnotationsQueryCtrl", function() { return _annotation_query_ctrl__WEBPACK_IMPORTED_MODULE_3__["AnnotationQueryEditor"]; });







/***/ }),

/***/ "./query_ctrl.ts":
/*!***********************!*\
  !*** ./query_ctrl.ts ***!
  \***********************/
/*! exports provided: IrondbQueryCtrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IrondbQueryCtrl", function() { return IrondbQueryCtrl; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../node_modules/tslib/tslib.es6.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _log__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./log */ "./log.ts");
/* harmony import */ var _irondb_query__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./irondb_query */ "./irondb_query.ts");
/* harmony import */ var grafana_app_plugins_sdk__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! grafana/app/plugins/sdk */ "grafana/app/plugins/sdk");
/* harmony import */ var grafana_app_plugins_sdk__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(grafana_app_plugins_sdk__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var grafana_app_core_app_events__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! grafana/app/core/app_events */ "grafana/app/core/app_events");
/* harmony import */ var grafana_app_core_app_events__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(grafana_app_core_app_events__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _css_query_editor_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./css/query_editor.css */ "./css/query_editor.css");
/* harmony import */ var _css_query_editor_css__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_css_query_editor_css__WEBPACK_IMPORTED_MODULE_6__);








var log = Object(_log__WEBPACK_IMPORTED_MODULE_2__["default"])('IrondbQueryCtrl');

function escapeRegExp(regexp) {
  return String(regexp).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
}

var IrondbQueryCtrl =
/** @class */
function (_super) {
  IrondbQueryCtrl.$inject = ["$scope", "$injector", "uiSegmentSrv", "templateSrv"];

  Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"])(IrondbQueryCtrl, _super);
  /** @ngInject */


  function IrondbQueryCtrl($scope, $injector, uiSegmentSrv, templateSrv) {
    var _this = _super.call(this, $scope, $injector) || this;

    _this.uiSegmentSrv = uiSegmentSrv;
    _this.templateSrv = templateSrv;
    _this.defaults = {};
    _this.alertStateOptions = [{
      value: 'active',
      text: 'Active'
    }, {
      value: 'inactive',
      text: 'Inactive'
    }];
    _this.queryTypeOptions = [{
      value: 'caql',
      text: 'CAQL'
    }, {
      value: 'basic',
      text: 'Basic'
    }, {
      value: 'alerts',
      text: 'Alerts'
    }, {
      value: 'alert_counts',
      text: 'Alert Counts'
    }];
    _this.localFilterMatchOptions = [{
      value: 'all',
      text: 'ALL'
    }, {
      value: 'any',
      text: 'ANY'
    }];
    _this.alertCountQueryTypeOptions = [{
      value: 'instant',
      text: 'instant'
    }, {
      value: 'range',
      text: 'range'
    }];
    _this.labelTypeOptions = [{
      value: 'default',
      text: 'name and tags'
    }, {
      value: 'name',
      text: 'name only'
    }, {
      value: 'cardinality',
      text: 'high cardinality tags'
    }, {
      value: 'custom',
      text: 'custom'
    }];
    _this.egressTypeOptions = [{
      value: 'automatic',
      text: 'automatic'
    }, {
      value: 'count',
      text: 'number of data points (count)'
    }, {
      value: 'average',
      text: 'average value (gauge)'
    }, {
      value: 'stddev',
      text: 'standard deviation a.k.a. σ (stddev)'
    }, {
      value: 'derive',
      text: 'rate of change (derive)'
    }, {
      value: 'derive_stddev',
      text: 'rate of change σ (derive_stddev)'
    }, {
      value: 'counter',
      text: 'rate of positive change (counter)'
    }, {
      value: 'counter_stddev',
      text: 'rate of positive change σ (counter_stddev)'
    }];
    _this.rollupTypeOptions = [{
      value: 'automatic',
      text: 'automatic'
    }, {
      value: 'minimum',
      text: 'minimum'
    }, {
      value: 'exact',
      text: 'exact'
    }];
    _this.formatOptions = [{
      value: 'ts',
      text: 'Time Series'
    }, {
      value: 'table',
      text: 'Table'
    }, {
      value: 'heatmap',
      text: 'Heatmap'
    }];
    _this.caqlFindFunctions = {
      count: 'count',
      average: 'average',
      stddev: 'stddev',
      derive: 'derivative',
      derive_stddev: 'derivative_stddev',
      counter: 'counter',
      counter_stddev: 'counter_stddev'
    }; // prettier-ignore

    _this.histogramTransforms = {
      count: ' | histogram:count()',
      average: ' | histogram:mean()',
      stddev: ' | histogram:stddev()',
      derive: ' | histogram:rate()',
      derive_stddev: '',
      counter: ' | histogram:rate()',
      counter_stddev: ''
    };

    lodash__WEBPACK_IMPORTED_MODULE_1___default.a.defaultsDeep(_this.target, _this.defaults);

    _this.target.egressoverride = _this.target.egressoverride || 'average';
    _this.target.metriclabel = _this.target.metriclabel || '';
    _this.target.labeltype = _this.target.labeltype || 'default';
    _this.target.rolluptype = _this.target.rolluptype || 'automatic';
    _this.target.query = _this.target.query || '';
    _this.target.segments = _this.target.segments || [];
    _this.target.format = _this.target.format || 'ts';

    if (_this.target.isCaql !== undefined) {
      _this.target.querytype = _this.target.isCaql ? 'caql' : 'basic';
    } else {
      _this.target.querytype = _this.target.querytype || 'caql';
    }

    _this.target.lastQueryType = _this.target.lastQueryType || _this.target.querytype;
    _this.target.local_filter = _this.target.local_filter || '';
    _this.target.local_filter_match = _this.target.local_filter_match || 'all';
    _this.target.alert_count_query_type = _this.target.alert_count_query_type || 'instant';
    _this.target.alert_id = _this.target.alert_id || '';
    _this.queryModel = new _irondb_query__WEBPACK_IMPORTED_MODULE_3__["default"](_this.datasource, _this.target, templateSrv);

    _this.buildSegments();

    _this.updateMetricLabelValue(false);

    return _this;
  }

  IrondbQueryCtrl.prototype.resetQueryTarget = function () {
    log(function () {
      return 'resetQueryTarget()';
    });
    this.target.query = '';
    this.target.egressoverride = 'average';
    this.target.labeltype = 'default';
    this.target.rolluptype = 'automatic';
    this.target.format = 'ts';
    this.target.local_filter = '';
    this.target.local_filter_match = 'all';
    this.target.alert_id = '';
    this.emptySegments();
    this.parseTarget();
    this.panelCtrl.refresh();
  };

  IrondbQueryCtrl.prototype.toggleEditorMode = function () {
    var _this = this;

    log(function () {
      return 'toggleEditorMode()';
    });

    if (this.target.lastQueryType === 'caql' && this.target.querytype === 'basic') {
      var onConfirm = function onConfirm() {
        _this.resetQueryTarget();
      };

      if (this.target.query === '') {
        setTimeout(onConfirm, 0);
      } else {
        grafana_app_core_app_events__WEBPACK_IMPORTED_MODULE_5___default.a.emit('confirm-modal', {
          title: 'Warning',
          text2: 'Switching to basic may overwrite your raw CAQL.',
          icon: 'fa-exclamation',
          yesText: 'Switch',
          onConfirm: onConfirm
        });
      }
    } else if (this.target.lastQueryType === 'basic' && this.target.querytype === 'caql') {
      var caqlQuery_1 = this.segmentsToCaqlFind();
      log(function () {
        return 'toggleEditorMode() caqlQuery = ' + caqlQuery_1;
      });
      this.target.query = caqlQuery_1;
      this.panelCtrl.refresh();
    } else if (this.target.querytype === 'alerts' || this.target.queryType === 'alert_counts') {
      this.target.query = '';
      this.panelCtrl.refresh();
    }

    this.target.lastQueryType = this.target.querytype;
  };

  IrondbQueryCtrl.prototype.alertStateValueChanged = function () {
    this.panelCtrl.refresh();
  };

  IrondbQueryCtrl.prototype.updateAlertQuery = function () {
    this.panelCtrl.refresh();
  };

  IrondbQueryCtrl.prototype.updateAlertId = function () {
    this.target.query = '';
    this.panelCtrl.refresh();
  };

  IrondbQueryCtrl.prototype.updateAlertLocalFilter = function () {
    this.panelCtrl.refresh();
  };

  IrondbQueryCtrl.prototype.localFilterMatchValueChanged = function () {
    this.panelCtrl.refresh();
  };

  IrondbQueryCtrl.prototype.alertCountQueryTypeValueChanged = function () {
    this.panelCtrl.refresh();
  };

  IrondbQueryCtrl.prototype.queryTypeValueChanged = function () {
    this.toggleEditorMode();
    this.panelCtrl.refresh();
  };

  IrondbQueryCtrl.prototype.labelTypeValueChanged = function () {
    if (this.target.labeltype === 'custom') {
      setTimeout(function () {
        document.getElementById('metriclabel').focus();
      }, 50);
    }

    this.panelCtrl.refresh();
  };

  IrondbQueryCtrl.prototype.metricLabelKeyUp = function (event) {
    var self = this;
    var element = event.currentTarget;

    if (event.keyCode === 13) {
      setTimeout(function () {
        self.target.metriclabel = element.value;
        self.updateMetricLabelValue();
      }, 0);
    }
  };

  IrondbQueryCtrl.prototype.updateMetricLabelValue = function (refresh) {
    if (refresh === void 0) {
      refresh = true;
    }

    if (this.target.metriclabel === '' && this.target.labeltype === 'custom') {
      this.target.labeltype = 'default';
    }

    if (refresh) {
      this.panelCtrl.refresh();
    }
  };

  IrondbQueryCtrl.prototype.rollupTypeValueChanged = function () {
    var refresh = true;

    if (this.target.rolluptype !== 'automatic') {
      if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isEmpty(this.target.metricrollup)) {
        refresh = false;
      }

      setTimeout(function () {
        document.getElementById('metricrollup').focus();
      }, 50);
    }

    if (refresh) {
      this.panelCtrl.refresh();
    }
  };

  IrondbQueryCtrl.prototype.metricRollupKeyUp = function (event) {
    var self = this;
    var element = event.currentTarget;

    if (event.keyCode === 13) {
      setTimeout(function () {
        self.target.metricrollup = element.value;
        self.updateMetricRollupValue();
      }, 0);
    }
  };

  IrondbQueryCtrl.prototype.updateMetricRollupValue = function (refresh) {
    if (refresh === void 0) {
      refresh = true;
    }

    if (this.target.metricrollup === '' && this.target.rolluptype !== 'automatic') {
      this.target.rolluptype = 'automatic';
    }

    if (refresh) {
      this.panelCtrl.refresh();
    }
  };

  IrondbQueryCtrl.prototype.egressValueChanged = function () {
    this.panelCtrl.refresh();
  };

  IrondbQueryCtrl.prototype.onChangeInternal = function () {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  };

  IrondbQueryCtrl.prototype.getCollapsedText = function () {
    if (this.target.querytype === 'caql') {
      return this.target.query;
    } else {
      return this.segmentsToCaqlFind();
    }
  };

  IrondbQueryCtrl.prototype.getSegments = function (index, prefix) {
    var _this = this;

    log(function () {
      return 'getSegments() ' + index + ' prefix = ' + prefix;
    });
    var query = prefix && prefix.length > 0 ? prefix : '';
    var segmentType = this.segments[index]._type;
    log(function () {
      return 'getSegments() ' + index + ' SegmentType = ' + _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"][segmentType];
    });

    if (segmentType === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].MetricName) {
      if (Object(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["encodeTag"])(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].MetricName, query) !== query) {
        query = 'b/' + btoa(escapeRegExp(query)) + '/';
      } else {
        query += '*';
      }

      return this.datasource.metricTagsQuery('and(__name:' + query + ')', true).then(function (results) {
        var metricnames = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(results.data, function (result) {
          return Object(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["taglessName"])(result.metric_name);
        });

        metricnames = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.uniq(metricnames);
        log(function () {
          return 'getSegments() metricnames = ' + JSON.stringify(metricnames);
        });

        var allSegments = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(metricnames, function (segment) {
          return _this.newSegment(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].MetricName, {
            value: segment,
            expandable: true
          });
        });

        return allSegments;
      })["catch"](function (err) {
        log(function () {
          return 'getSegments() err = ' + err.toString();
        });
        return [];
      });
    } else if (segmentType === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagCat || segmentType === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagPlus) {
      var metricName_1 = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["encodeTag"])(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].MetricName, this.segments[0].value);
      log(function () {
        return 'getSegments() tags for ' + metricName_1;
      });
      return this.datasource.metricTagCatsQuery(metricName_1).then(function (segments) {
        var e_1, _a;

        if (segments.data && segments.data.length > 0) {
          var tagCats = segments.data;
          var tagSegments = [];

          try {
            for (var tagCats_1 = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(tagCats), tagCats_1_1 = tagCats_1.next(); !tagCats_1_1.done; tagCats_1_1 = tagCats_1.next()) {
              var tagCat = tagCats_1_1.value;
              tagSegments.push(_this.newSegment(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagCat, {
                value: Object(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["decodeTag"])(tagCat),
                expandable: true
              }));
            }
          } catch (e_1_1) {
            e_1 = {
              error: e_1_1
            };
          } finally {
            try {
              if (tagCats_1_1 && !tagCats_1_1.done && (_a = tagCats_1["return"])) _a.call(tagCats_1);
            } finally {
              if (e_1) throw e_1.error;
            }
          }

          if (segmentType === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagPlus) {
            // For Plus, we want to allow new operators, so put those on the front
            tagSegments.unshift(_this.newSegment(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagOp, {
              value: 'and('
            }));
            tagSegments.unshift(_this.newSegment(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagOp, {
              value: 'not('
            }));
            tagSegments.unshift(_this.newSegment(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagOp, {
              value: 'or('
            }));
          }

          return tagSegments;
        }
      })["catch"](function (err) {
        log(function () {
          return 'getSegments() err = ' + err;
        });
        return [];
      });
    } else if (segmentType === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagOp) {
      var tagSegments = [this.newSegment(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagOp, {
        value: 'REMOVE'
      }), this.newSegment(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagOp, {
        value: 'and('
      }), this.newSegment(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagOp, {
        value: 'not('
      }), this.newSegment(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagOp, {
        value: 'or('
      })];
      return Promise.resolve(tagSegments);
    } else if (segmentType === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagVal) {
      var metricName_2 = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["encodeTag"])(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].MetricName, this.segments[0].value);
      var tagCat_1 = this.segments[index - 2].value;

      if (tagCat_1 === 'select tag') {
        return Promise.resolve([]);
      }

      log(function () {
        return 'getSegments() tag vals for ' + metricName_2 + ', ' + tagCat_1;
      });
      return this.datasource.metricTagValsQuery(metricName_2, Object(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["encodeTag"])(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagCat, tagCat_1, false)).then(function (segments) {
        var e_2, _a;

        if (segments.data && segments.data.length > 0) {
          var tagVals = segments.data;
          var tagSegments_1 = [];
          tagSegments_1.push(_this.newSegment(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagVal, {
            value: '*',
            expandable: true
          }));

          lodash__WEBPACK_IMPORTED_MODULE_1___default.a.eachRight(_this.templateSrv.variables, function (variable) {
            tagSegments_1.push(_this.newSegment(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagVal, {
              type: 'template',
              value: '$' + variable.name,
              expandable: true
            }));
          });

          try {
            for (var tagVals_1 = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(tagVals), tagVals_1_1 = tagVals_1.next(); !tagVals_1_1.done; tagVals_1_1 = tagVals_1.next()) {
              var tagVal = tagVals_1_1.value;
              tagSegments_1.push(_this.newSegment(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagVal, {
                value: Object(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["decodeTag"])(tagVal),
                expandable: true
              }));
            }
          } catch (e_2_1) {
            e_2 = {
              error: e_2_1
            };
          } finally {
            try {
              if (tagVals_1_1 && !tagVals_1_1.done && (_a = tagVals_1["return"])) _a.call(tagVals_1);
            } finally {
              if (e_2) throw e_2.error;
            }
          }

          return tagSegments_1;
        }
      })["catch"](function (err) {
        log(function () {
          return 'getSegments() err = ' + err;
        });
        return [];
      });
    }

    return Promise.resolve([]);
  };

  IrondbQueryCtrl.prototype.parseTarget = function () {
    this.queryModel.parseTarget();
    this.buildSegments();
  };

  IrondbQueryCtrl.prototype.setSegmentType = function (segment, type) {
    segment._type = type;
    segment._typeName = _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"][type];
    return segment;
  };

  IrondbQueryCtrl.prototype.newSegment = function (type, options) {
    var segment = this.uiSegmentSrv.newSegment(options);
    return this.setSegmentType(segment, type);
  };

  IrondbQueryCtrl.prototype.mapSegment = function (segment) {
    var uiSegment;

    if (segment.type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagOp) {
      uiSegment = this.uiSegmentSrv.newOperator(segment.value);
    } else if (segment.type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagEnd) {
      uiSegment = this.uiSegmentSrv.newOperator(')');
    } else if (segment.type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagPair) {
      uiSegment = this.uiSegmentSrv.newCondition(':');
    } else if (segment.type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagSep) {
      uiSegment = this.uiSegmentSrv.newCondition(',');
    } else if (segment.type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagPlus) {
      uiSegment = this.buildSelectTagPlusSegment();
    } else {
      uiSegment = this.uiSegmentSrv.newSegment(segment);
    }

    return this.setSegmentType(uiSegment, segment.type);
  };

  IrondbQueryCtrl.prototype.buildSegments = function () {
    var _this = this;

    this.segments = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(this.queryModel.segments, function (s) {
      return _this.mapSegment(s);
    });
    log(function () {
      return 'buildSegments()';
    });
    var checkOtherSegmentsIndex = this.queryModel.checkOtherSegmentsIndex || 0;
    this.checkOtherSegments(checkOtherSegmentsIndex);
  };

  IrondbQueryCtrl.prototype.addSelectMetricSegment = function () {
    this.queryModel.addSelectMetricSegment();
    var segment = this.uiSegmentSrv.newSelectMetric();
    this.setSegmentType(segment, _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].MetricName);
    this.segments.push(segment);
  };

  IrondbQueryCtrl.prototype.buildSelectTagPlusSegment = function () {
    var tagCatSegment = this.uiSegmentSrv.newPlusButton();
    this.setSegmentType(tagCatSegment, _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagPlus);
    return tagCatSegment;
  };

  IrondbQueryCtrl.prototype.addSelectTagPlusSegment = function () {
    this.segments.push(this.buildSelectTagPlusSegment());
  };

  IrondbQueryCtrl.prototype.newSelectTagValSegment = function () {
    var tagValSegment = this.uiSegmentSrv.newKeyValue('*');
    this.setSegmentType(tagValSegment, _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagVal);
    return tagValSegment;
  };

  IrondbQueryCtrl.prototype.checkOtherSegments = function (fromIndex) {
    if (fromIndex === this.segments.length) {
      var segmentType_1 = this.segments[fromIndex - 1]._type;
      log(function () {
        return 'checkOtherSegments() ' + (fromIndex - 1) + ' SegmentType = ' + _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"][segmentType_1];
      });

      if (segmentType_1 === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].MetricName) {
        this.addSelectTagPlusSegment();
      }
    }

    return Promise.resolve();
  };

  IrondbQueryCtrl.prototype.setSegmentFocus = function (segmentIndex) {
    lodash__WEBPACK_IMPORTED_MODULE_1___default.a.each(this.segments, function (segment, index) {
      segment.focus = segmentIndex === index;
    });
  };

  IrondbQueryCtrl.prototype.segmentValueChanged = function (segment, segmentIndex) {
    var _this = this;

    log(function () {
      return 'segmentValueChanged()';
    });
    this.error = null;
    this.queryModel.updateSegmentValue(segment, segmentIndex);

    if (segment._type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagOp) {
      if (segment.value === 'REMOVE') {
        // We need to remove ourself, as well as every other segment until our TagEnd
        // For every TagOp we hit, we need to get one more TagEnd to remove any sub-ops
        var endIndex = segmentIndex + 1;
        var endsNeeded = 1;
        var lastIndex = this.segments.length;

        while (endsNeeded > 0 && endIndex < lastIndex) {
          var type = this.segments[endIndex]._type;

          if (type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagOp) {
            endsNeeded++;
          } else if (type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagEnd) {
            endsNeeded--;

            if (endsNeeded === 0) {
              break; // don't increment endIndex
            }
          }

          endIndex++; // keep going
        }

        var deleteStart = segmentIndex;
        var countDelete = endIndex - segmentIndex + 1;

        if (segmentIndex > 2) {
          // If I'm not the very first operator, then i have a comma in front of me that needs killing
          deleteStart--;
          countDelete++;
        }

        this.segments.splice(deleteStart, countDelete);

        if (lastIndex === endIndex + 1) {
          // If these match, we removed the outermost operator, so we need a new + button
          this.segments.push(this.buildSelectTagPlusSegment());
        }
      } // else Changing an Operator doesn't need to affect any other segments


      this.targetChanged();
      return;
    } else if (segment._type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagPlus) {
      if (segment.value === 'and(' || segment.value === 'not(' || segment.value === 'or(') {
        // Remove myself
        this.segments.splice(segmentIndex, 1);

        if (segmentIndex > 2) {
          this.segments.splice(segmentIndex, 0, this.mapSegment({
            type: _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagSep
          }));
        } // and replace it with a TagOp + friends


        this.segments.splice(segmentIndex + 1, 0, this.mapSegment({
          type: _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagOp,
          value: segment.value
        }), this.mapSegment({
          type: _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagCat,
          value: 'select tag',
          fake: true
        }), this.mapSegment({
          type: _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagPair
        }), this.newSelectTagValSegment(), this.buildSelectTagPlusSegment(), this.mapSegment({
          type: _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagEnd
        }));

        if (segmentIndex > 2) {
          this.segments.splice(segmentIndex + 7, 0, this.buildSelectTagPlusSegment());
        } // Do not trigger targetChanged().  We do not have a valid category, which we need, so set focus on it


        this.setSegmentFocus(segmentIndex + 3);
        return;
      } else {
        // Remove myself
        this.segments.splice(segmentIndex, 1);

        if (segmentIndex > 2) {
          this.segments.splice(segmentIndex, 0, this.mapSegment({
            type: _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagSep
          }));
        } // and replace it with a TagOp + friends


        this.segments.splice(segmentIndex + 1, 0, this.mapSegment({
          type: _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagCat,
          value: segment.value
        }), this.mapSegment({
          type: _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagPair
        }), this.newSelectTagValSegment(), this.buildSelectTagPlusSegment());

        if (segmentIndex === 1) {
          // if index is 1 (immediatley after metric name), it's the first add and we're a tagCat
          // so that means we need to add in the implicit and() in the front
          this.segments.splice(segmentIndex, 0, this.mapSegment({
            type: _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagOp,
            value: 'and('
          }));
          this.segments.push(this.mapSegment({
            type: _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagEnd
          }));
        } // Fall through so targetChanged gets called

      }
    }

    if (segmentIndex === 0) {
      // If we changed the start metric, all the filters are invalid
      this.spliceSegments(segmentIndex + 1);
    }

    if (segment.expandable) {
      return this.checkOtherSegments(segmentIndex + 1).then(function () {
        _this.setSegmentFocus(segmentIndex + 1);

        _this.targetChanged();
      });
    }

    this.setSegmentFocus(segmentIndex + 1);
    this.targetChanged();
  };

  IrondbQueryCtrl.prototype.spliceSegments = function (index) {
    this.segments = this.segments.splice(0, index);
    this.queryModel.segments = this.queryModel.segments.splice(0, index);
  };

  IrondbQueryCtrl.prototype.emptySegments = function () {
    this.queryModel.segments = [];
    this.segments = [];
  };

  IrondbQueryCtrl.prototype.segmentsToStreamTags = function () {
    var e_3, _a;

    var segments = this.segments.slice(); // First element is always metric name

    var metricName = segments.shift().value;
    var query = 'and(__name:' + Object(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["encodeTag"])(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].MetricName, metricName);
    var noComma = false; // because last was a tag:pair

    try {
      for (var segments_1 = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(segments), segments_1_1 = segments_1.next(); !segments_1_1.done; segments_1_1 = segments_1.next()) {
        var segment = segments_1_1.value;
        var type = segment._type;

        if (type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagPlus) {
          continue;
        }

        if (!noComma && type !== _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagEnd && type !== _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagSep) {
          query += ',';
        }

        if (type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagOp || type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagPair || type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagCat || type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagSep) {
          noComma = true;
        } else {
          noComma = false;
        }

        query += Object(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["encodeTag"])(type, segment.value);
      }
    } catch (e_3_1) {
      e_3 = {
        error: e_3_1
      };
    } finally {
      try {
        if (segments_1_1 && !segments_1_1.done && (_a = segments_1["return"])) _a.call(segments_1);
      } finally {
        if (e_3) throw e_3.error;
      }
    }

    query += ')';
    return query;
  };

  IrondbQueryCtrl.prototype.queryFunctionToCaqlFind = function () {
    if (this.target.paneltype === 'Heatmap' || this.target.hist_transform !== undefined) {
      return 'find:histogram';
    }

    var findFunction = 'find';
    var egressOverride = this.target.egressoverride;

    if (egressOverride !== 'average') {
      egressOverride = this.caqlFindFunctions[egressOverride];
      findFunction += ':' + egressOverride;
    }

    return findFunction;
  };

  IrondbQueryCtrl.prototype.buildHistogramTransform = function () {
    if (this.target.hist_transform !== undefined) {
      var egressOverride = this.target.egressoverride;

      if (egressOverride === 'automatic') {
        if (this.target.hist_transform === 'statsd_counter') {
          egressOverride = 'counter';
        } else {
          egressOverride = 'average';
        }
      }

      return this.histogramTransforms[egressOverride];
    } else {
      return '';
    }
  };

  IrondbQueryCtrl.prototype.buildCaqlLabel = function () {
    var labeltype = this.target.labeltype;
    var metriclabel = this.target.metriclabel;

    if (labeltype !== 'default') {
      if (labeltype === 'custom' && metriclabel !== '') {
        metriclabel = metriclabel.replace(/'/g, '"');
        return " | label('" + metriclabel + "')";
      } else if (labeltype === 'name') {
        return " | label('%n')";
      } else if (labeltype === 'cardinality') {
        return " | label('%n | %t-{*}')";
      }
    } // Always use label() for tag decoding


    return " | label('%cn')";
  };

  IrondbQueryCtrl.prototype.segmentsToCaqlFind = function () {
    var e_4, _a;

    var segments = this.segments.slice(); // First element is always metric name

    var metricName = segments.shift().value;
    var tagless = segments.length === 1 && segments[0]._type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagPlus;

    if (metricName === '*' && tagless) {
      return '';
    }

    var query = this.queryFunctionToCaqlFind() + "('" + metricName + "'";

    if (tagless) {
      query += ')' + this.buildHistogramTransform() + this.buildCaqlLabel();
      return query;
    }

    var firstTag = true;
    var noComma = false; // because last was a tag:pair

    try {
      for (var segments_2 = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__values"])(segments), segments_2_1 = segments_2.next(); !segments_2_1.done; segments_2_1 = segments_2.next()) {
        var segment = segments_2_1.value;
        var type = segment._type;

        if (type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagPlus) {
          continue;
        }

        if (!noComma && type !== _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagEnd && type !== _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagSep) {
          query += ',';

          if (firstTag) {
            query += " '";
            firstTag = false;
          }
        }

        if (type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagOp || type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagPair || type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagCat || type === _irondb_query__WEBPACK_IMPORTED_MODULE_3__["SegmentType"].TagSep) {
          noComma = true;
        } else {
          noComma = false;
        }

        query += Object(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["encodeTag"])(type, segment.value);
      }
    } catch (e_4_1) {
      e_4 = {
        error: e_4_1
      };
    } finally {
      try {
        if (segments_2_1 && !segments_2_1.done && (_a = segments_2["return"])) _a.call(segments_2);
      } finally {
        if (e_4) throw e_4.error;
      }
    }

    query += "')" + this.buildHistogramTransform() + this.buildCaqlLabel();
    return query;
  };

  IrondbQueryCtrl.prototype.updateModelTarget = function () {
    var streamTags = this.segmentsToStreamTags();
    log(function () {
      return 'updateModelTarget() streamTags = ' + streamTags;
    });
    this.queryModel.target.query = streamTags;
  };

  IrondbQueryCtrl.prototype.targetChanged = function () {
    log(function () {
      return 'targetChanged()';
    });

    if (this.queryModel.error) {
      return;
    }

    var oldTarget = this.queryModel.target.query;
    this.updateModelTarget();

    if (this.queryModel.target !== oldTarget) {
      this.panelCtrl.refresh();
    }
  };

  IrondbQueryCtrl.templateUrl = 'partials/query.editor.html';
  return IrondbQueryCtrl;
}(grafana_app_plugins_sdk__WEBPACK_IMPORTED_MODULE_4__["QueryCtrl"]);



/***/ }),

/***/ "@grafana/data":
/*!********************************!*\
  !*** external "@grafana/data" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__grafana_data__;

/***/ }),

/***/ "grafana/app/core/app_events":
/*!**************************************!*\
  !*** external "app/core/app_events" ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_grafana_app_core_app_events__;

/***/ }),

/***/ "grafana/app/plugins/sdk":
/*!**********************************!*\
  !*** external "app/plugins/sdk" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_grafana_app_plugins_sdk__;

/***/ }),

/***/ "lodash":
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_lodash__;

/***/ })

/******/ })});;
//# sourceMappingURL=module.js.map