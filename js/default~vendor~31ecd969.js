(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[5],{

/***/ 0:
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

  if (sourceMap && typeof btoa !== 'undefined') {
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

/***/ 32:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_bootstrap_min_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _css_bootstrap_min_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_bootstrap_min_css__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var vunit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
/* harmony import */ var vunit_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(vunit_js__WEBPACK_IMPORTED_MODULE_1__);

__webpack_require__.e(/* import() */ 12).then(__webpack_require__.t.bind(null, 16, 7));
__webpack_require__.e(/* import() */ 13).then(__webpack_require__.t.bind(null, 17, 7));
__webpack_require__.e(/* import() */ 14).then(__webpack_require__.t.bind(null, 18, 7));
__webpack_require__.e(/* import() */ 10).then(__webpack_require__.t.bind(null, 19, 7)); // import ScrollReveal from 'scrollreveal';
// window.ScrollReveal = ScrollReveal;


Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(19)]).then(__webpack_require__.t.bind(null, 20, 7)); // import(/* webpackPrefetch: 2 */ "./particles-dark.js")

Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(null, 7, 7));
__webpack_require__.e(/* import() */ 29).then(__webpack_require__.t.bind(null, 21, 7));

/***/ }),

/***/ 4:
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(0);
            var content = __webpack_require__(5);

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),

/***/ 5:
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ 6:
/***/ (function(module, exports) {

/*!
 * @license MIT
 * @preserve
 *
 * vUnit.js: A vanilla JS alternative for vh and vw CSS units.
 * Version: 0.2.0
 * https://github.com/joaocunha/v-unit/
 *
 * @author João Cunha - joao@joaocunha.net - twitter.com/joaocunha
 */

;(function(win, doc, undefined) {
	'use strict';

	win.vUnit = function (options) {
		// Just an alias for easier readability (and to preserve `this` context)
		var vunit = this;

		// For extending the options
		var opts = options || {};

		vunit.options = {
			// The ID for the appended stylesheet
			stylesheetId: opts.stylesheetId || 'v-unit-stylesheet',

			// The interval between each check in miliseconds
			viewportObserverInterval: opts.viewportObserverInterval || 100,

			// The CSS rules to be vUnit'd
			CSSMap: opts.CSSMap || null,

			// onResize callback
			onResize: opts.onResize || function() {}
		};

		// Stores the viewport dimensions so the observer can check against it and update it.
		vunit.viewportSize = {
			height: 0,
			width: 0
		};

		/**
		 * @function init
		 * Triggers the execution of vUnit and wraps its main logic.
		 *
		 * It sets an observer to check if the viewport dimensions changed, running on an interval
		 * based on the viewportObserverInterval option. If the dimensions have changed, it creates
		 * an stylesheet, adds the calculated CSS rules to it and append it to the head.
		 *
		 * The observer is a cross-device event-less solution to keep track of everything that
		 * would trigger a resize on the viewport:
		 *
		 *  - Window resizing on desktop;
		 *  - Orientation changing on mobile;
		 *  - Scrollbars appearing/disappearing on desktop;
		 *  - Navigation bars appearing/disappearing on mobile;
		 *  - Zooming on mobile and desktop;
		 *  - Download bar on desktop;
		 *  - Password saving prompt on desktop;
		 *  - Etc.
		 *
		 * @returns {Function|Boolean} The observer function or false if no CSSMap was passed.
		 */
		vunit.init = function() {
			// We need a CSSMap to know what rules to create. Duh!
			if (opts.CSSMap) {

				// We pass a self-invoking function that returns itself to the setInterval method
				// so we can execute the first iteration immediately. This helps preventing FOUC.
				return win.setInterval((function viewportObserver() {

					if (viewportHasChanged()) {
						var stylesheet = createStylesheet();
						var CSSRules = createCSSRules();

						appendCSSRulesToStylesheet(CSSRules, stylesheet);
						appendStylesheetOnHead(stylesheet);
						vunit.options.onResize(vunit.viewportSize);
					}

					return viewportObserver;
				})(), vunit.options.viewportObserverInterval);
			} else {
				// Stops execution if no CSS rules were passed
				// TODO: raise an exception
				return false;
			}
		};

		/**
		 * @function viewportHasChanged
		 * Checks if the viewport dimensions have changed since the last checking.
		 *
		 * This checking is very inexpensive, so it allows to regenerate the CSS rules only when
		 * it's needed.
		 *
		 * @returns {Boolean} Wether the dimensions changed or not.
		 */
		var viewportHasChanged = function() {
			var currentViewportSize = calculateViewportSize();
			var differentHeight = (currentViewportSize.height !== vunit.viewportSize.height);
			var differentWidth = (currentViewportSize.width !== vunit.viewportSize.width);

			// Updates the global variable for future checking
			vunit.viewportSize = currentViewportSize;

			return (differentHeight || differentWidth);
		};

		/**
		 * @function createStylesheet
		 * Creates an empty stylesheet that will hold the v-unit rules.
		 *
		 * @returns {HTMLStyleElement} An empty stylesheet element.
		 */
		var createStylesheet = function() {
			var stylesheet = doc.createElement('style');

			stylesheet.setAttribute('rel', 'stylesheet');
			stylesheet.setAttribute('type', 'text/css');
			stylesheet.setAttribute('media', 'screen');
			stylesheet.setAttribute('id', vunit.options.stylesheetId);

			return stylesheet;
		};

		/**
		 * @function createCSSRules
		 * Create CSS rules based on the viewport dimensions.
		 *
		 * It loops through a map of CSS properties and creates rules ranging from 1 to 100 percent
		 * of its size.
		 *
		 * We used to Math.round() the values, but then we can't stack two .vw50 elements side by
		 * side on odd viewport widths. If we use Math.floor, we end up with a 1px gap. On the other
		 * hand, if we use pixel decimals (no round or floor), the browsers ajusts the width
		 * properly.
		 *
		 * Example:
		 * .vw1   {width: 20px;}
		 * .vw2   {width: 40px;}
		 *         ...
		 * .vw100 {width: 2000px;}
		 * .vh1   {height: 5px;}
		 * .vh2   {height: 10px;}
		 *         ...
		 * .vh100 {height: 500px;}
		 *
		 * @returns {String} The concatenated CSS rules in string format.
		 */
		var createCSSRules = function() {
			var computedHeight = (vunit.viewportSize.height / 100);
			var computedWidth = (vunit.viewportSize.width / 100);
			var vmin = Math.min(computedWidth, computedHeight);
			var vmax = Math.max(computedWidth, computedHeight);
			var map = vunit.options.CSSMap;
			var CSSRules = '';
			var value = 0;

			// Loop through all selectors passed on the CSSMap option
			for (var selector in map) {
				var property = map[selector].property;

				// Adds rules from className1 to className100 to the stylesheet
				for (var range = 1; range <= 100; range++) {

					// Checks what to base the value on (viewport width/height or vmin/vmax)
					switch (map[selector].reference) {
						case 'vw':
							value = computedWidth * range;
							break;
						case 'vh':
							value = computedHeight * range;
							break;
						case 'vmin':
							value = vmin * range;
							break;
						case 'vmax':
							value = vmax * range;
							break;
					}

					// Barebones templating syntax
					var CSSRuleTemplate = '_SELECTOR__RANGE_{_PROPERTY_:_VALUE_px}\n';

					CSSRules += CSSRuleTemplate.replace('_SELECTOR_', selector)
                                     .replace('_RANGE_', range)
                                     .replace('_PROPERTY_', property)
                                     .replace('_VALUE_', value);
				}
			}

			return CSSRules;
		};

		/**
		 * @function appendCSSRulesToStylesheet
		 * Appends the created CSS rules (string) to the empty stylesheet.
		 *
		 * @param {String} CSSRules A string containing all the calculated CSS rules.
		 * @param {HTMLStyleElement} stylesheet An empty stylesheet object to hold the rules.
		 */
		var appendCSSRulesToStylesheet = function(CSSRules, stylesheet) {
			// IE < 8 checking
			if (stylesheet.styleSheet) {
				stylesheet.styleSheet.cssText = CSSRules;
			} else {
				stylesheet.appendChild(doc.createTextNode(CSSRules));
			}
		};

		/**
		 * @function appendStylesheetOnHead
		 * Appends the stylesheet to the <head> element once the CSS rules are created.
		 *
		 * @param {HTMLStyleElement} stylesheet A populated stylesheet object.
		 */
		var appendStylesheetOnHead = function(stylesheet) {
			// Borrowed head detection from restyle.js - thanks, Andrea!
			// https://github.com/WebReflection/restyle/blob/master/src/restyle.js
			var head = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement;

			// Grabs the previous stylesheet
			var legacyStylesheet = doc.getElementById(vunit.options.stylesheetId);

			// Removes the previous stylesheet from the head, if any
			if (legacyStylesheet) {
				head.removeChild(legacyStylesheet);
			}

			// Add the new stylesheet to the head
			head.appendChild(stylesheet);
		};

		/**
		 * @function calculateViewportSize
		 * Calculates the size of the viewport.
		 *
		 * @returns {Object} An object containing the dimensions of the viewport.
		 *
		 * Example:
		 * return {
		 *     width: 768,
		 *     height: 1024
		 * }
		 */
		var calculateViewportSize = function() {
			var viewportSize = {
				height: doc.documentElement.clientHeight,
				width: doc.documentElement.clientWidth
			};

			return viewportSize;
		};
	};
})(window, document);


/***/ })

}]);