define(["app/plugins/sdk","lodash"], function(__WEBPACK_EXTERNAL_MODULE_grafana_app_plugins_sdk__, __WEBPACK_EXTERNAL_MODULE_lodash__) { return /******/ (function(modules) { // webpackBootstrap
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

/***/ "../node_modules/css-loader/dist/cjs.js?!../node_modules/postcss-loader/src/index.js?!../node_modules/sass-loader/lib/loader.js!./css/query_editor.css":
/*!**********************************************************************************************************************************************************************!*\
  !*** ../node_modules/css-loader/dist/cjs.js??ref--7-1!../node_modules/postcss-loader/src??ref--7-2!../node_modules/sass-loader/lib/loader.js!./css/query_editor.css ***!
  \**********************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "../node_modules/css-loader/dist/runtime/api.js")(true);
// Module
exports.push([module.i, ".min-width-10 {\n  min-width: 10rem; }\n\n.min-width-12 {\n  min-width: 12rem; }\n\n.min-width-20 {\n  min-width: 20rem; }\n\n.gf-form-select-wrapper select.gf-form-input {\n  height: 2.64rem; }\n\n.gf-form-select-wrapper--caret-indent.gf-form-select-wrapper::after {\n  right: 0.775rem; }\n\n.ml-1 {\n  margin-left: 2px !important; }\n\n.join-r .gf-form-label {\n  margin-right: 0; }\n\n.join-l .gf-form-label {\n  border-left-width: 0;\n  border-radius: 0; }\n\n.mash-r .gf-form-label {\n  padding-right: 0; }\n\n.mash-l .gf-form-label {\n  padding-left: 0; }\n\n.irondb-tag-op .gf-form-label,\n.irondb-tag-end .gf-form-label {\n  color: #eb7b18; }\n\n.irondb-tag-cat .gf-form-label {\n  color: #598; }\n\n.irondb-tag-val .gf-form-label {\n  color: #5ca; }\n\n.irondb-tag-pair .gf-form-label,\n.irondb-tag-sep .gf-form-label {\n  color: #888; }\n\n.irondb-tag-op .gf-form-label:focus,\n.irondb-tag-op .gf-form-label:hover,\n.irondb-tag-cat .gf-form-label:focus,\n.irondb-tag-cat .gf-form-label:hover,\n.irondb-tag-val .gf-form-label:focus,\n.irondb-tag-val .gf-form-label:hover,\n.gf-form-label:focus .template-variable,\n.gf-form-label:hover .template-variable {\n  color: #fff; }\n\n/* menu item color changes */\n.irondb-tag-op .typeahead.dropdown-menu [data-value='REMOVE'] a {\n  color: #bb002c !important; }\n\n.irondb-tag-val .typeahead.dropdown-menu [data-value^='$'] a {\n  color: #33b5e5 !important; }\n\n.irondb-tag-op .typeahead.dropdown-menu [data-value='or('] a,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='not('] a,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='and('] a,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='or('] a,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='not('] a,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='and('] a {\n  color: #eb7b18 !important; }\n\n.irondb-tag-op .typeahead.dropdown-menu [data-value='REMOVE'] a:focus,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='REMOVE'] a:hover,\n.irondb-tag-val .typeahead.dropdown-menu [data-value^='$'] a:focus,\n.irondb-tag-val .typeahead.dropdown-menu [data-value^='$'] a:hover,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='or('] a:focus,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='or('] a:hover,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='not('] a:focus,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='not('] a:hover,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='and('] a:focus,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='and('] a:hover,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='or('] a:focus,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='or('] a:hover,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='not('] a:focus,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='not('] a:hover,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='and('] a:focus,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='and('] a:hover {\n  color: #fff !important; }\n", "",{"version":3,"sources":["query_editor.css"],"names":[],"mappings":"AAAA;EACE,gBAAgB,EAAE;;AAEpB;EACE,gBAAgB,EAAE;;AAEpB;EACE,gBAAgB,EAAE;;AAEpB;EACE,eAAe,EAAE;;AAEnB;EACE,eAAe,EAAE;;AAEnB;EACE,2BAA2B,EAAE;;AAE/B;EACE,eAAe,EAAE;;AAEnB;EACE,oBAAoB;EACpB,gBAAgB,EAAE;;AAEpB;EACE,gBAAgB,EAAE;;AAEpB;EACE,eAAe,EAAE;;AAEnB;;EAEE,cAAc,EAAE;;AAElB;EACE,WAAW,EAAE;;AAEf;EACE,WAAW,EAAE;;AAEf;;EAEE,WAAW,EAAE;;AAEf;;;;;;;;EAQE,WAAW,EAAE;;AAEf,4BAA4B;AAC5B;EACE,yBAAyB,EAAE;;AAE7B;EACE,yBAAyB,EAAE;;AAE7B;;;;;;EAME,yBAAyB,EAAE;;AAE7B;;;;;;;;;;;;;;;;EAgBE,sBAAsB,EAAE","file":"query_editor.css","sourcesContent":[".min-width-10 {\n  min-width: 10rem; }\n\n.min-width-12 {\n  min-width: 12rem; }\n\n.min-width-20 {\n  min-width: 20rem; }\n\n.gf-form-select-wrapper select.gf-form-input {\n  height: 2.64rem; }\n\n.gf-form-select-wrapper--caret-indent.gf-form-select-wrapper::after {\n  right: 0.775rem; }\n\n.ml-1 {\n  margin-left: 2px !important; }\n\n.join-r .gf-form-label {\n  margin-right: 0; }\n\n.join-l .gf-form-label {\n  border-left-width: 0;\n  border-radius: 0; }\n\n.mash-r .gf-form-label {\n  padding-right: 0; }\n\n.mash-l .gf-form-label {\n  padding-left: 0; }\n\n.irondb-tag-op .gf-form-label,\n.irondb-tag-end .gf-form-label {\n  color: #eb7b18; }\n\n.irondb-tag-cat .gf-form-label {\n  color: #598; }\n\n.irondb-tag-val .gf-form-label {\n  color: #5ca; }\n\n.irondb-tag-pair .gf-form-label,\n.irondb-tag-sep .gf-form-label {\n  color: #888; }\n\n.irondb-tag-op .gf-form-label:focus,\n.irondb-tag-op .gf-form-label:hover,\n.irondb-tag-cat .gf-form-label:focus,\n.irondb-tag-cat .gf-form-label:hover,\n.irondb-tag-val .gf-form-label:focus,\n.irondb-tag-val .gf-form-label:hover,\n.gf-form-label:focus .template-variable,\n.gf-form-label:hover .template-variable {\n  color: #fff; }\n\n/* menu item color changes */\n.irondb-tag-op .typeahead.dropdown-menu [data-value='REMOVE'] a {\n  color: #bb002c !important; }\n\n.irondb-tag-val .typeahead.dropdown-menu [data-value^='$'] a {\n  color: #33b5e5 !important; }\n\n.irondb-tag-op .typeahead.dropdown-menu [data-value='or('] a,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='not('] a,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='and('] a,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='or('] a,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='not('] a,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='and('] a {\n  color: #eb7b18 !important; }\n\n.irondb-tag-op .typeahead.dropdown-menu [data-value='REMOVE'] a:focus,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='REMOVE'] a:hover,\n.irondb-tag-val .typeahead.dropdown-menu [data-value^='$'] a:focus,\n.irondb-tag-val .typeahead.dropdown-menu [data-value^='$'] a:hover,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='or('] a:focus,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='or('] a:hover,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='not('] a:focus,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='not('] a:hover,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='and('] a:focus,\n.irondb-tag-op .typeahead.dropdown-menu [data-value='and('] a:hover,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='or('] a:focus,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='or('] a:hover,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='not('] a:focus,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='not('] a:hover,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='and('] a:focus,\n.irondb-tag-plus .typeahead.dropdown-menu [data-value='and('] a:hover {\n  color: #fff !important; }\n"]}]);


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
        return "@media ".concat(item[2], "{").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    for (var i = 0; i < this.length; i++) {
      // eslint-disable-next-line prefer-destructuring
      var id = this[i][0];

      if (id != null) {
        alreadyImportedModules[id] = true;
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = modules[_i]; // skip already imported module
      // this implementation is not 100% perfect for weird media query combinations
      // when a module is imported multiple times with different media queries.
      // I hope this will never occur (Hey this way we have smaller bundles)

      if (item[0] == null || !alreadyImportedModules[item[0]]) {
        if (mediaQuery && !item[2]) {
          item[2] = mediaQuery;
        } else if (mediaQuery) {
          item[2] = "(".concat(item[2], ") and (").concat(mediaQuery, ")");
        }

        list.push(item);
      }
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
      return "/*# sourceURL=".concat(cssMapping.sourceRoot).concat(source, " */");
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

exports = module.exports = function (message/*, code, ext*/) {
	var err = new Error(message), code = arguments[1], ext = arguments[2];
	if (!isValue(ext)) {
		if (isObject(code)) {
			ext = code;
			code = null;
		}
	}
	if (isValue(ext)) assign(err, ext);
	if (isValue(code)) err.code = code;
	if (captureStackTrace) captureStackTrace(err, exports);
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

/***/ "../node_modules/es5-ext/global.js":
/*!*****************************************!*\
  !*** ../node_modules/es5-ext/global.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = (function () {
	if (this) return this;

	// Unexpected strict mode (may happen if e.g. bundled into ESM module), be nice

	// Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis
	// In all ES5+ engines global object inherits from Object.prototype
	// (if you approached one that doesn't please report)
	Object.defineProperty(Object.prototype, "__global__", {
		get: function () { return this; },
		configurable: true
	});
	try { return __global__; }
	finally { delete Object.prototype.__global__; }
})();


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
	? __webpack_require__(/*! es5-ext/global */ "../node_modules/es5-ext/global.js").Symbol
	: __webpack_require__(/*! ./polyfill */ "../node_modules/es6-symbol/polyfill.js");


/***/ }),

/***/ "../node_modules/es6-symbol/is-implemented.js":
/*!****************************************************!*\
  !*** ../node_modules/es6-symbol/is-implemented.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var global     = __webpack_require__(/*! es5-ext/global */ "../node_modules/es5-ext/global.js")
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
  , NativeSymbol = __webpack_require__(/*! es5-ext/global */ "../node_modules/es5-ext/global.js").Symbol;

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
  , NativeSymbol         = __webpack_require__(/*! es5-ext/global */ "../node_modules/es5-ext/global.js").Symbol
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

/***/ "../node_modules/is-promise/index.js":
/*!*******************************************!*\
  !*** ../node_modules/is-promise/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = isPromise;

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

/***/ "../node_modules/next-tick/index.js":
/*!******************************************!*\
  !*** ../node_modules/next-tick/index.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process, setImmediate) {

var callable, byObserver;

callable = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

byObserver = function (Observer) {
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
		callable(fn);
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

	// MutationObserver
	if ((typeof document === 'object') && document) {
		if (typeof MutationObserver === 'function') return byObserver(MutationObserver);
		if (typeof WebKitMutationObserver === 'function') return byObserver(WebKitMutationObserver);
	}

	// W3C Draft
	// http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
	if (typeof setImmediate === 'function') {
		return function (cb) { setImmediate(callable(cb)); };
	}

	// Wide available standard
	if ((typeof setTimeout === 'function') || (typeof setTimeout === 'object')) {
		return function (cb) { setTimeout(callable(cb), 0); };
	}

	return null;
}());

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../process/browser.js */ "../node_modules/process/browser.js"), __webpack_require__(/*! ./../timers-browserify/main.js */ "../node_modules/timers-browserify/main.js").setImmediate))

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

/***/ "../node_modules/style-loader/lib/addStyles.js":
/*!*****************************************************!*\
  !*** ../node_modules/style-loader/lib/addStyles.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target, parent) {
  if (parent){
    return parent.querySelector(target);
  }
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target, parent) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target, parent);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(/*! ./urls */ "../node_modules/style-loader/lib/urls.js");

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertAt.before, target);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}

	if(options.attrs.nonce === undefined) {
		var nonce = getNonce();
		if (nonce) {
			options.attrs.nonce = nonce;
		}
	}

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function getNonce() {
	if (false) {}

	return __webpack_require__.nc;
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = typeof options.transform === 'function'
		 ? options.transform(obj.css) 
		 : options.transform.default(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ "../node_modules/style-loader/lib/urls.js":
/*!************************************************!*\
  !*** ../node_modules/style-loader/lib/urls.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
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

/***/ "../node_modules/tslib/tslib.es6.js":
/*!******************************************!*\
  !*** ../node_modules/tslib/tslib.es6.js ***!
  \******************************************/
/*! exports provided: __extends, __assign, __rest, __decorate, __param, __metadata, __awaiter, __generator, __exportStar, __values, __read, __spread, __spreadArrays, __await, __asyncGenerator, __asyncDelegator, __asyncValues, __makeTemplateObject, __importStar, __importDefault */
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
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
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
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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

function __exportStar(m, exports) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
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

/***/ "./config_ctrl.ts":
/*!************************!*\
  !*** ./config_ctrl.ts ***!
  \************************/
/*! exports provided: IrondbConfigCtrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IrondbConfigCtrl", function() { return IrondbConfigCtrl; });
var IrondbConfigCtrl =
/** @class */
function () {
  function IrondbConfigCtrl($scope) {
    this.current.jsonData.irondbType = this.current.jsonData.irondbType || 'standalone';
    this.current.jsonData.resultsLimit = this.current.jsonData.resultsLimit || '100';
    this.current.jsonData.useCaching = this.current.jsonData.useCaching || true;
    this.current.jsonData.activityTracking = this.current.jsonData.activityTracking || true;
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


var content = __webpack_require__(/*! !../../node_modules/css-loader/dist/cjs.js??ref--7-1!../../node_modules/postcss-loader/src??ref--7-2!../../node_modules/sass-loader/lib/loader.js!./query_editor.css */ "../node_modules/css-loader/dist/cjs.js?!../node_modules/postcss-loader/src/index.js?!../node_modules/sass-loader/lib/loader.js!./css/query_editor.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../../node_modules/style-loader/lib/addStyles.js */ "../node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),

/***/ "./datasource.ts":
/*!***********************!*\
  !*** ./datasource.ts ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _log__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./log */ "./log.ts");
/* harmony import */ var memoizee__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! memoizee */ "../node_modules/memoizee/index.js");
/* harmony import */ var memoizee__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(memoizee__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _irondb_query__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./irondb_query */ "./irondb_query.ts");




var log = Object(_log__WEBPACK_IMPORTED_MODULE_1__["default"])('IrondbDatasource');

var IrondbDatasource =
/** @class */
function () {
  IrondbDatasource.$inject = ["instanceSettings", "$q", "backendSrv", "templateSrv"];

  /** @ngInject */
  function IrondbDatasource(instanceSettings, $q, backendSrv, templateSrv) {
    this.$q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.type = 'irondb';
    this.name = instanceSettings.name;
    this.id = instanceSettings.id;
    this.accountId = (instanceSettings.jsonData || {}).accountId;
    this.irondbType = (instanceSettings.jsonData || {}).irondbType;
    this.resultsLimit = (instanceSettings.jsonData || {}).resultsLimit;
    this.apiToken = (instanceSettings.jsonData || {}).apiToken;
    this.useCaching = (instanceSettings.jsonData || {}).useCaching;
    this.activityTracking = (instanceSettings.jsonData || {}).activityTracking;
    this.url = instanceSettings.url;
    this.supportAnnotations = false;
    this.supportMetrics = true;
    this.appName = 'Grafana';
    this.datasourceRequest = IrondbDatasource.setupCache(this.useCaching, backendSrv);
  }

  IrondbDatasource.requestCacheKey = function (requestOptions) {
    var httpMethod = requestOptions.method;

    if (httpMethod === 'GET') {
      return requestOptions.url;
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
    return memoizee__WEBPACK_IMPORTED_MODULE_2___default()(function (options) {
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

    if (lodash__WEBPACK_IMPORTED_MODULE_0___default.a.isEmpty(options['targets'][0])) {
      return this.$q.when({
        data: []
      });
    }

    return Promise.all([this._buildIrondbParams(options)]).then(function (irondbOptions) {
      if (lodash__WEBPACK_IMPORTED_MODULE_0___default.a.isEmpty(irondbOptions[0])) {
        return _this.$q.when({
          data: []
        });
      }

      return _this._irondbRequest(irondbOptions[0]);
    }).then(function (queryResults) {
      if (queryResults['data'].constructor === Array) {
        queryResults['data'].sort(function (a, b) {
          return a['target'].localeCompare(b['target']);
        });
      }

      log(function () {
        return 'query() queryResults = ' + JSON.stringify(queryResults);
      });
      return queryResults;
    })["catch"](function (err) {
      if (err.status !== 0 || err.status >= 300) {
        _this._throwerr(err);
      }
    });
  };

  IrondbDatasource.prototype.annotationQuery = function (options) {
    throw new Error('Annotation Support not implemented yet.');
  };

  IrondbDatasource.prototype.metricFindQuery = function (query, options) {
    var variable = options.variable;

    if (query !== '' && variable !== undefined) {
      var metricName = query;
      var tagCat = variable.tagValuesQuery;

      if (variable.useTags && tagCat !== '') {
        return this.metricTagValsQuery(metricName, tagCat).then(function (results) {
          return lodash__WEBPACK_IMPORTED_MODULE_0___default.a.map(results.data, function (result) {
            return {
              value: result
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

  IrondbDatasource.prototype.metricTagsQuery = function (query, allowEmptyWildcard, activityWindow) {
    if (allowEmptyWildcard === void 0) {
      allowEmptyWildcard = false;
    }

    if (activityWindow === void 0) {
      activityWindow = null;
    }

    if (query === '' || query === undefined || !allowEmptyWildcard && query === 'and(__name:*)') {
      return Promise.resolve({
        data: []
      });
    }

    var queryUrl = '/find' + this.getAccountId() + '/tags?query=';
    queryUrl = queryUrl + query;

    if (this.activityTracking && !lodash__WEBPACK_IMPORTED_MODULE_0___default.a.isEmpty(activityWindow)) {
      log(function () {
        return 'metricTagsQuery() activityWindow = ' + JSON.stringify(activityWindow);
      });
      queryUrl += '&activity_start_secs=' + lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toInteger(activityWindow[0]);
      queryUrl += '&activity_end_secs=' + lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toInteger(activityWindow[1]);
    }

    log(function () {
      return 'metricTagsQuery() queryUrl = ' + queryUrl;
    });
    return this._irondbSimpleRequest('GET', queryUrl, false, true);
  };

  IrondbDatasource.prototype.metricTagCatsQuery = function (query) {
    var queryUrl = '/find' + this.getAccountId() + '/tag_cats?query=';
    queryUrl = queryUrl + 'and(__name:' + query + ')';
    log(function () {
      return 'metricTagCatsQuery() queryUrl = ' + queryUrl;
    });
    return this._irondbSimpleRequest('GET', queryUrl, false, true, false);
  };

  IrondbDatasource.prototype.metricTagValsQuery = function (query, cat) {
    var queryUrl = '/find' + this.getAccountId() + '/tag_vals?category=' + cat + '&query=';
    queryUrl = queryUrl + 'and(__name:' + query + ')';
    log(function () {
      return 'metricTagValsQuery() queryUrl = ' + queryUrl;
    });
    return this._irondbSimpleRequest('GET', queryUrl, false, true, false);
  };

  IrondbDatasource.prototype.testDatasource = function () {
    return this.metricTagsQuery('and(__name:ametric)').then(function (res) {
      var error = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(res, 'results[0].error');

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

  IrondbDatasource.prototype._throwerr = function (err) {
    log(function () {
      return '_throwerr() err = ' + err;
    });

    if (err.data && err.data.error) {
      throw new Error('Circonus IRONdb Error: ' + err.data.error);
    } else if (err.data && err.data.user_error) {
      var name_1 = err.data.method || 'IRONdb';
      var suffix = '';

      if (err.data.user_error.query) {
        suffix = ' in"' + err.data.user_error.query + '"';
      }

      throw new Error(name_1 + ' error: ' + err.data.user_error.message + suffix);
    } else if (err.statusText === 'Not Found') {
      throw new Error('Circonus IRONdb Error: ' + err.statusText);
    } else if (err.statusText && err.status > 0) {
      throw new Error('Network Error: ' + err.statusText + '(' + err.status + ')');
    } else {
      throw new Error('Error: ' + (err ? err.toString() : 'unknown'));
    }
  };

  IrondbDatasource.prototype._irondbSimpleRequest = function (method, url, isCaql, isFind, isLimited) {
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
      return '_irondbSimpleRequest() options = ' + JSON.stringify(options);
    });
    return this.datasourceRequest(options);
  };

  IrondbDatasource.prototype._irondbRequest = function (irondbOptions, isLimited) {
    var _this = this;

    if (isLimited === void 0) {
      isLimited = true;
    }

    log(function () {
      return '_irondbRequest() irondbOptions = ' + JSON.stringify(irondbOptions);
    });
    var headers = {
      'Content-Type': 'application/json'
    };
    var options = {};
    var queries = [];
    var queryResults = {};
    queryResults['data'] = [];

    if ('hosted' === this.irondbType) {
      headers['X-Circonus-Auth-Token'] = this.apiToken;
      headers['X-Circonus-App-Name'] = this.appName;
    } else {
      headers['X-Circonus-Account'] = this.accountId;
    }

    headers['X-Snowth-Advisory-Limit'] = isLimited ? this.resultsLimit : 'none';
    headers['Accept'] = 'application/json';

    if (irondbOptions['std']['names'].length) {
      var paneltype = irondbOptions['std']['names'][0]['leaf_data']['paneltype'] || 'Graph';
      options = {};
      options.url = this.url;

      if ('hosted' === this.irondbType) {
        options.url = options.url + '/irondb';
        options.url = options.url + '/fetch';
      }

      options.method = 'POST';

      if ('standalone' === this.irondbType) {
        options.url = options.url + '/fetch';
      }

      var metricLabels = [];
      var interval = irondbOptions['std']['interval'];
      var start = irondbOptions['std']['start'];
      var end = irondbOptions['std']['end'];
      start = Math.floor(start - start % interval);
      end = Math.floor(end - end % interval);
      var reduce = paneltype === 'Heatmap' ? 'merge' : 'pass';
      var streams = [];
      var data_1 = {
        streams: streams
      };
      data_1['period'] = interval;
      data_1['start'] = start;
      data_1['count'] = Math.round((end - start) / interval);
      data_1['reduce'] = [{
        label: '',
        method: reduce
      }];

      for (var i = 0; i < irondbOptions['std']['names'].length; i++) {
        var metrictype = paneltype === 'Heatmap' ? 'histogram' : 'numeric';
        metricLabels.push(irondbOptions['std']['names'][i]['leaf_data']['metriclabel']);
        var stream = {};
        var transform = irondbOptions['std']['names'][i]['leaf_data']['egress_function'];
        transform = paneltype === 'Heatmap' ? 'none' : transform;
        stream['transform'] = transform;
        stream['name'] = irondbOptions['std']['names'][i]['leaf_name'];
        stream['uuid'] = irondbOptions['std']['names'][i]['leaf_data']['uuid'];
        stream['kind'] = metrictype;
        streams.push(stream);
      }

      log(function () {
        return '_irondbRequest() data = ' + JSON.stringify(data_1);
      });
      options.data = data_1;
      options.name = 'fetch';
      options.headers = headers;

      if (this.basicAuth || this.withCredentials) {
        options.withCredentials = true;
      }

      if (this.basicAuth) {
        options.headers.Authorization = this.basicAuth;
      }

      options.metricLabels = metricLabels;
      options.paneltype = paneltype;
      options.isCaql = false;
      options.retry = 1;
      queries.push(options);
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

        var caqlQuery = this.templateSrv.replace(irondbOptions['caql']['names'][i]);
        options.url = options.url + '/caql_v1?format=DF4&start=' + irondbOptions['caql']['start'];
        options.url = options.url + '&end=' + irondbOptions['caql']['end'];
        options.url = options.url + '&period=' + irondbOptions['caql']['interval'];
        options.url = options.url + '&q=' + encodeURIComponent(caqlQuery);
        options.name = irondbOptions['caql']['names'][i];
        options.headers = headers;
        options.start = irondbOptions['caql']['start'];
        options.end = irondbOptions['caql']['end'];
        options.retry = 1;

        if (this.basicAuth || this.withCredentials) {
          options.withCredentials = true;
        }

        if (this.basicAuth) {
          options.headers.Authorization = this.basicAuth;
        }

        options.isCaql = true;
        queries.push(options);
      }
    }

    log(function () {
      return '_irondbRequest() queries = ' + JSON.stringify(queries);
    });
    return Promise.all(queries.map(function (query) {
      return _this.datasourceRequest(query).then(function (result) {
        log(function () {
          return '_irondbRequest() query = ' + JSON.stringify(query);
        });
        log(function () {
          return '_irondbRequest() result = ' + JSON.stringify(result);
        });
        return _this._convertIrondbDf4DataToGrafana(result, query);
      }).then(function (result) {
        if (result['data'].constructor === Array) {
          for (var i = 0; i < result['data'].length; i++) {
            queryResults['data'].push(result['data'][i]);
          }
        }

        if (result['data'].constructor === Object) {
          queryResults['data'].push(result['data']);
        }

        return queryResults;
      });
    })).then(function (result) {
      return queryResults;
    })["catch"](function (err) {
      if (err.status !== 0 || err.status >= 300) {
        _this._throwerr(err);
      }
    });
  };

  IrondbDatasource.prototype._buildIrondbParamsAsync = function (options) {
    var _this = this;

    var cleanOptions = {};
    var i, target;
    var hasTargets = false;
    var start = new Date(options.range.from).getTime() / 1000;
    var end = new Date(options.range.to).getTime() / 1000; // Pick a reasonable period for CAQL
    // We assume will use something close the request interval
    // unless it would produce more than maxDataPoints / 8
    // CAQL analytics at one point per pixel is almost never what
    // someone will want.

    var estdp = Math.floor((end - start) * 1000 / options.intervalMs);

    if (estdp > options.maxDataPoints / 2) {
      estdp = options.maxDataPoints / 2;
    }

    var period = Math.ceil((end - start) / estdp); // The period is in the right realm now, force align to something
    // that will make it pretty.

    var align = [86400, 3600, 1800, 1200, 900, 300, 60, 30, 15, 10, 5, 1];

    for (var j in align) {
      if (period > 1000 * align[j]) {
        period = Math.floor(period / (1000 * align[j])) * (1000 * align[j]);
        break;
      }
    }

    if (period < 60) {
      period = 60;
    } else {
      period = period - period % 60;
    }

    cleanOptions['std'] = {};
    cleanOptions['std']['start'] = start;
    cleanOptions['std']['end'] = end;
    cleanOptions['std']['names'] = [];
    cleanOptions['std']['interval'] = period;
    cleanOptions['caql'] = {};
    cleanOptions['caql']['start'] = start;
    cleanOptions['caql']['end'] = end;
    cleanOptions['caql']['names'] = [];
    cleanOptions['caql']['interval'] = period;

    for (i = 0; i < options.targets.length; i++) {
      target = options.targets[i];

      if (target.hide) {
        continue;
      }

      hasTargets = true;
    }

    if (!hasTargets) {
      return {};
    }

    for (i = 0; i < options.targets.length; i++) {
      target = options.targets[i];

      if (target.hide || !target['query'] || target['query'].length === 0) {
        continue;
      }

      if (target.isCaql) {
        cleanOptions['caql']['names'].push(target['query']);
      }
    }

    if (target.isCaql) {
      return cleanOptions;
    } else {
      var promises = options.targets.map(function (target) {
        var rawQuery = _this.templateSrv.replace(target['query']);

        return _this.metricTagsQuery(rawQuery, false, [start, end]).then(function (result) {
          // Don't mix numeric results with histograms and text metrics
          var metricFilter = 'numeric';

          if (target['paneltype'] === 'Heatmap') {
            metricFilter = 'histogram';
          }

          result.data = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.filter(result.data, function (metric) {
            var metricTypes = metric.type.split(',');
            return lodash__WEBPACK_IMPORTED_MODULE_0___default.a.includes(metricTypes, metricFilter);
          });

          for (var i_1 = 0; i_1 < result.data.length; i_1++) {
            result.data[i_1]['target'] = target;
          }

          return result.data;
        }).then(function (result) {
          for (var i_2 = 0; i_2 < result.length; i_2++) {
            if (result[i_2]['target'].hide) {
              continue;
            }

            if (!target.isCaql) {
              result[i_2]['leaf_data'] = {
                egress_function: 'average',
                uuid: result[i_2]['uuid'],
                paneltype: result[i_2]['target']['paneltype']
              };

              if (target.egressoverride !== 'average') {
                result[i_2]['leaf_data'].egress_function = target.egressoverride;
              }

              var leafName = result[i_2]['metric_name'];

              if (target.labeltype !== 'default') {
                var metriclabel = target.metriclabel;

                if (target.labeltype === 'name') {
                  metriclabel = '%n';
                } else if (target.labeltype === 'cardinality') {
                  metriclabel = '%n | %t-{*}';
                }

                metriclabel = Object(_irondb_query__WEBPACK_IMPORTED_MODULE_3__["metaInterpolateLabel"])(metriclabel, result, i_2);
                metriclabel = _this.templateSrv.replace(metriclabel);
                result[i_2]['leaf_data'].metriclabel = metriclabel;
              }

              cleanOptions['std']['names'].push({
                leaf_name: leafName,
                leaf_data: result[i_2]['leaf_data']
              });
            }
          }

          return cleanOptions;
        });
      });
      return Promise.all(promises).then(function (result) {
        return cleanOptions;
      })["catch"](function (err) {
        log(function () {
          return '_buildIrondbParams() err = ' + JSON.stringify(err);
        });

        if (err.status !== 0 || err.status >= 300) {}
      });
    }
  };

  IrondbDatasource.prototype._buildIrondbParams = function (options) {
    var self = this;
    return new Promise(function (resolve, reject) {
      resolve(self._buildIrondbParamsAsync(options));
    });
  };

  IrondbDatasource.prototype._convertIrondbDf4DataToGrafana = function (result, query) {
    var name = query.name;
    var data = result.data.data;
    var meta = result.data.meta;
    var cleanData = [];
    var st = result.data.head.start;
    var period = result.data.head.period;

    if (!data || data.length === 0) {
      return {
        data: cleanData
      };
    } // Only supports one histogram.. So sad.


    var lookaside = {};

    for (var si = 0; si < data.length; si++) {
      var dummy = name + ' [' + (si + 1) + ']';
      var lname = meta[si] ? meta[si].label : dummy;
      var metricLabel = query.metricLabels[si];

      if (lodash__WEBPACK_IMPORTED_MODULE_0___default.a.isString(metricLabel)) {
        lname = metricLabel;
      }

      for (var i = 0; i < data[si].length; i++) {
        if (data[si][i] === null) {
          continue;
        }

        var ts = (st + i * period) * 1000;

        if (ts < query.start * 1000) {
          continue;
        }

        if (data[si][i].constructor === Number) {
          if (cleanData[si] === undefined) {
            cleanData[si] = {
              target: lname,
              datapoints: []
            };
          }

          cleanData[si].datapoints.push([data[si][i], ts]);
        } else if (data[si][i].constructor === Object) {
          for (var vstr in data[si][i]) {
            var cnt = data[si][i][vstr];
            var v = parseFloat(vstr);
            vstr = v.toString();
            var tsstr = ts.toString();

            if (lookaside[vstr] === null) {
              lookaside[vstr] = {
                target: vstr,
                datapoints: [],
                _ts: {}
              };
              cleanData.push(lookaside[vstr]);
            }

            if (lookaside[vstr]._ts[tsstr] === null) {
              lookaside[vstr]._ts[tsstr] = [cnt, ts];
              lookaside[vstr].datapoints.push(lookaside[vstr]._ts[tsstr]);
            } else {
              lookaside[vstr]._ts[tsstr][0] += cnt;
            }
          }
        }
      }
    }

    var _loop_1 = function _loop_1(i) {
      if (lodash__WEBPACK_IMPORTED_MODULE_0___default.a.isUndefined(cleanData[i])) {
        log(function () {
          return '_convertIrondbDf4DataToGrafana() No data at ' + st + ' for ' + meta[i].kind + ' "' + meta[i].label + '"';
        });
        return "continue";
      }

      delete cleanData[i]._ts;
    };

    for (var i = 0; i < cleanData.length; i++) {
      _loop_1(i);
    }

    return {
      data: lodash__WEBPACK_IMPORTED_MODULE_0___default.a.compact(cleanData)
    };
  };

  IrondbDatasource.DEFAULT_CACHE_ENTRIES = 128;
  IrondbDatasource.DEFAULT_CACHE_TIME_MS = 60000;
  return IrondbDatasource;
}();

/* harmony default export */ __webpack_exports__["default"] = (IrondbDatasource);

/***/ }),

/***/ "./irondb_query.ts":
/*!*************************!*\
  !*** ./irondb_query.ts ***!
  \*************************/
/*! exports provided: SegmentType, taglessName, metaInterpolateLabel, encodeTag, decodeTag, decodeNameAndTags, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SegmentType", function() { return SegmentType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "taglessName", function() { return taglessName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "metaInterpolateLabel", function() { return metaInterpolateLabel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "encodeTag", function() { return encodeTag; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decodeTag", function() { return decodeTag; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decodeNameAndTags", function() { return decodeNameAndTags; });
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
    for (var _b = tslib__WEBPACK_IMPORTED_MODULE_0__["__values"](tags.split(/,/g)), _c = _b.next(); !_c.done; _c = _b.next()) {
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
  var keycnt = 0;
  var seen = new Map();

  for (var i = 0; i < meta.length; i++) {
    var _a = tslib__WEBPACK_IMPORTED_MODULE_0__["__read"](taglessNameAndTags(meta[i].metric_name), 2),
        name_1 = _a[0],
        tags = _a[1];

    var tagSet = splitTags(tags);
    var mtag = tagSet[tag] !== undefined ? tagSet[tag][0] : _privateNil;

    if (seen.get(mtag) === undefined) {
      keycnt = keycnt + 1;
    }

    seen.set(mtag, true);
  }

  return keycnt > 1;
}

function metaInterpolateLabel(fmt, metaIn, idx) {
  var meta = metaIn[idx]; // case %d

  var label = fmt.replace(/%d/g, (idx + 1).toString()); // case %n

  label = label.replace(/%n/g, taglessName(meta.metric_name)); // case %cn

  label = label.replace(/%cn/g, meta.metric_name); // case %tv

  label = label.replace(/%tv-?{([^}]*)}/g, function (x) {
    var e_2, _a;

    var elide = x.substring(3, 4);
    var choose = elide === '-' ? metaTagDiff : function () {
      return true;
    };
    var tag = x.substring(elide === '-' ? 5 : 4, x.length - 1);

    var _b = tslib__WEBPACK_IMPORTED_MODULE_0__["__read"](taglessNameAndTags(meta.metric_name), 2),
        name = _b[0],
        tags = _b[1];

    var tagSet = splitTags(tags);

    if (tag === '*') {
      var tagCats = [];

      try {
        for (var _c = tslib__WEBPACK_IMPORTED_MODULE_0__["__values"](lodash__WEBPACK_IMPORTED_MODULE_1___default.a.keys(tagSet)), _d = _c.next(); !_d.done; _d = _c.next()) {
          var k = _d.value;

          if (!k.startsWith('__') && choose(metaIn, k)) {
            tagCats.push(k);
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

      tagCats.sort();

      var tagVals = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(tagCats, function (tagCat) {
        return tagSet[tagCat][0];
      });

      return tagVals.join(',');
    }

    if (tagSet[tag] !== undefined && choose(metaIn, tag)) {
      return tagSet[tag][0];
    }

    return '';
  }); // case %t

  label = label.replace(/%t-?{([^}]*)}/g, function (x) {
    var e_3, _a;

    var elide = x.substring(2, 3);
    var choose = elide === '-' ? metaTagDiff : function () {
      return true;
    };
    var tag = x.substring(elide === '-' ? 4 : 3, x.length - 1);

    var _b = tslib__WEBPACK_IMPORTED_MODULE_0__["__read"](taglessNameAndTags(meta.metric_name), 2),
        name = _b[0],
        tags = _b[1];

    var tagSet = splitTags(tags);

    if (tag === '*') {
      var tagCats = [];

      try {
        for (var _c = tslib__WEBPACK_IMPORTED_MODULE_0__["__values"](lodash__WEBPACK_IMPORTED_MODULE_1___default.a.keys(tagSet)), _d = _c.next(); !_d.done; _d = _c.next()) {
          var k = _d.value;

          if (!k.startsWith('__') && choose(metaIn, k)) {
            var v = tagSet[k][0];
            tagCats.push(k + ':' + v);
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
      }

      tagCats.sort();
      return tagCats.join(',');
    }

    if (tagSet[tag] !== undefined && choose(metaIn, tag)) {
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
function decodeNameAndTags(name) {
  var e_4, _a;

  var tags = [];

  var _b = tslib__WEBPACK_IMPORTED_MODULE_0__["__read"](taglessNameAndTags(name), 2),
      metric = _b[0],
      rawTags = _b[1];

  var tagSet = splitTags(rawTags);

  try {
    for (var _c = tslib__WEBPACK_IMPORTED_MODULE_0__["__values"](lodash__WEBPACK_IMPORTED_MODULE_1___default.a.keys(tagSet)), _d = _c.next(); !_d.done; _d = _c.next()) {
      var tagCat = _d.value;
      tags.push(tagCat + ':' + tagSet[tagCat][0]);
    }
  } catch (e_4_1) {
    e_4 = {
      error: e_4_1
    };
  } finally {
    try {
      if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
    } finally {
      if (e_4) throw e_4.error;
    }
  }

  return metric + '|ST[' + tags.join(',') + ']';
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
    var e_5, _a;

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
      for (var tags_1 = tslib__WEBPACK_IMPORTED_MODULE_0__["__values"](tags), tags_1_1 = tags_1.next(); !tags_1_1.done; tags_1_1 = tags_1.next()) {
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
    } catch (e_5_1) {
      e_5 = {
        error: e_5_1
      };
    } finally {
      try {
        if (tags_1_1 && !tags_1_1.done && (_a = tags_1["return"])) _a.call(tags_1);
      } finally {
        if (e_5) throw e_5.error;
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
var logEnabled = false;

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
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AnnotationsQueryCtrl", function() { return IrondbAnnotationsQueryCtrl; });
/* harmony import */ var _datasource__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./datasource */ "./datasource.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Datasource", function() { return _datasource__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _query_ctrl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./query_ctrl */ "./query_ctrl.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "QueryCtrl", function() { return _query_ctrl__WEBPACK_IMPORTED_MODULE_1__["IrondbQueryCtrl"]; });

/* harmony import */ var _config_ctrl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./config_ctrl */ "./config_ctrl.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ConfigCtrl", function() { return _config_ctrl__WEBPACK_IMPORTED_MODULE_2__["IrondbConfigCtrl"]; });





var IrondbAnnotationsQueryCtrl =
/** @class */
function () {
  function IrondbAnnotationsQueryCtrl() {}

  IrondbAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';
  return IrondbAnnotationsQueryCtrl;
}();



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
/* harmony import */ var _css_query_editor_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./css/query_editor.css */ "./css/query_editor.css");
/* harmony import */ var _css_query_editor_css__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_css_query_editor_css__WEBPACK_IMPORTED_MODULE_5__);







var log = Object(_log__WEBPACK_IMPORTED_MODULE_2__["default"])('IrondbQueryCtrl');

function escapeRegExp(regexp) {
  return String(regexp).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
}

var IrondbQueryCtrl =
/** @class */
function (_super) {
  IrondbQueryCtrl.$inject = ["$scope", "$injector", "uiSegmentSrv", "templateSrv"];

  tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](IrondbQueryCtrl, _super);
  /** @ngInject */


  function IrondbQueryCtrl($scope, $injector, uiSegmentSrv, templateSrv) {
    var _this = _super.call(this, $scope, $injector) || this;

    _this.uiSegmentSrv = uiSegmentSrv;
    _this.templateSrv = templateSrv;
    _this.defaults = {};
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
      value: 'count',
      text: 'number of data points (count)'
    }, {
      value: 'average',
      text: 'average value (gauge)'
    }, {
      value: 'average_stddev',
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
    _this.caqlFindFunctions = {
      count: 'count',
      average: 'average',
      average_stddev: 'stddev',
      derive: 'derivative',
      derive_stddev: 'derivative_stddev',
      counter: 'counter',
      counter_stddev: 'counter_stddev'
    };

    lodash__WEBPACK_IMPORTED_MODULE_1___default.a.defaultsDeep(_this.target, _this.defaults);

    _this.target.isCaql = _this.target.isCaql || false;
    _this.target.egressoverride = _this.target.egressoverride || 'average';
    _this.target.metriclabel = _this.target.metriclabel || '';
    _this.target.labeltype = _this.target.labeltype || 'default';
    _this.target.query = _this.target.query || '';
    _this.target.segments = _this.target.segments || [];
    _this.target.paneltype = _this.panelCtrl.pluginName;
    _this.queryModel = new _irondb_query__WEBPACK_IMPORTED_MODULE_3__["default"](_this.datasource, _this.target, templateSrv);

    _this.buildSegments();

    _this.updateMetricLabelValue(false);

    return _this;
  }

  IrondbQueryCtrl.prototype.toggleEditorMode = function () {
    log(function () {
      return 'toggleEditorMode()';
    });
    this.target.isCaql = !this.target.isCaql;
    this.typeValueChanged();
  };

  IrondbQueryCtrl.prototype.typeValueChanged = function () {
    if (this.target.isCaql) {
      var caqlQuery_1 = this.segmentsToCaqlFind();
      this.target.query = caqlQuery_1;
      log(function () {
        return 'typeValueChanged() caqlQuery = ' + caqlQuery_1;
      });
    } else {
      this.target.query = '';
      this.target.egressoverride = 'average';
      this.target.labeltype = 'default';
      this.emptySegments();
      this.parseTarget();
      log(function () {
        return 'typeValueChanged() target reset';
      });
    }

    this.error = null;
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

  IrondbQueryCtrl.prototype.egressValueChanged = function () {
    this.panelCtrl.refresh();
  };

  IrondbQueryCtrl.prototype.onChangeInternal = function () {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  };

  IrondbQueryCtrl.prototype.getCollapsedText = function () {
    return this.target.query;
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
            for (var tagCats_1 = tslib__WEBPACK_IMPORTED_MODULE_0__["__values"](tagCats), tagCats_1_1 = tagCats_1.next(); !tagCats_1_1.done; tagCats_1_1 = tagCats_1.next()) {
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
            for (var tagVals_1 = tslib__WEBPACK_IMPORTED_MODULE_0__["__values"](tagVals), tagVals_1_1 = tagVals_1.next(); !tagVals_1_1.done; tagVals_1_1 = tagVals_1.next()) {
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
      for (var segments_1 = tslib__WEBPACK_IMPORTED_MODULE_0__["__values"](segments), segments_1_1 = segments_1.next(); !segments_1_1.done; segments_1_1 = segments_1.next()) {
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
    if (this.target.paneltype === 'Heatmap') {
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
      query += ')' + this.buildCaqlLabel();
      return query;
    }

    var firstTag = true;
    var noComma = false; // because last was a tag:pair

    try {
      for (var segments_2 = tslib__WEBPACK_IMPORTED_MODULE_0__["__values"](segments), segments_2_1 = segments_2.next(); !segments_2_1.done; segments_2_1 = segments_2.next()) {
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

    query += "')" + this.buildCaqlLabel();
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