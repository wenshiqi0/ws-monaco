(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("vscode"), require("vscode-emmet-helper"));
	else if(typeof define === 'function' && define.amd)
		define(["vscode", "vscode-emmet-helper"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("vscode"), require("vscode-emmet-helper")) : factory(root["vscode"], root["vscode-emmet-helper"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 21);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(0);
const html_matcher_1 = __webpack_require__(23);
const css_parser_1 = __webpack_require__(5);
const bufferStream_1 = __webpack_require__(4);
const vscode_emmet_helper_1 = __webpack_require__(2);
exports.LANGUAGE_MODES = {
    'html': ['!', '.', '}', ':', '*', '$', ']', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'jade': ['!', '.', '}', ':', '*', '$', ']', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'slim': ['!', '.', '}', ':', '*', '$', ']', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'haml': ['!', '.', '}', ':', '*', '$', ']', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'xml': ['.', '}', '*', '$', ']', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'xsl': ['!', '.', '}', '*', '$', ']', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'css': [':', ';', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'scss': [':', ';', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'sass': [':', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'less': [':', ';', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'stylus': [':', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'javascriptreact': ['.', '}', '*', '$', ']', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'typescriptreact': ['.', '}', '*', '$', ']', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
};
// Explicitly map languages that have built-in grammar in VS Code to their parent language
// to get emmet completion support
// For other languages, users will have to use `emmet.includeLanguages` or
// language specific extensions can provide emmet completion support
exports.MAPPED_MODES = {
    'handlebars': 'html',
    'php': 'html'
};
function validate(allowStylesheet = true) {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No editor is active');
        return false;
    }
    if (!allowStylesheet && vscode_emmet_helper_1.isStyleSheet(editor.document.languageId)) {
        return false;
    }
    return true;
}
exports.validate = validate;
function getMappingForIncludedLanguages() {
    let finalMappedModes = {};
    let includeLanguagesConfig = vscode.workspace.getConfiguration('emmet')['includeLanguages'];
    let includeLanguages = Object.assign({}, exports.MAPPED_MODES, includeLanguagesConfig ? includeLanguagesConfig : {});
    Object.keys(includeLanguages).forEach(syntax => {
        if (typeof includeLanguages[syntax] === 'string' && exports.LANGUAGE_MODES[includeLanguages[syntax]]) {
            finalMappedModes[syntax] = includeLanguages[syntax];
        }
    });
    return finalMappedModes;
}
exports.getMappingForIncludedLanguages = getMappingForIncludedLanguages;
/**
 * Parses the given document using emmet parsing modules
 * @param document
 */
function parseDocument(document, showError = true) {
    let parseContent = vscode_emmet_helper_1.isStyleSheet(document.languageId) ? css_parser_1.default : html_matcher_1.default;
    let rootNode;
    try {
        rootNode = parseContent(new bufferStream_1.DocumentStreamReader(document));
    } catch (e) {
        if (showError) {
            vscode.window.showErrorMessage('Emmet: Failed to parse the file');
        }
    }
    return rootNode;
}
exports.parseDocument = parseDocument;
/**
 * Returns node corresponding to given position in the given root node
 * @param root
 * @param position
 * @param includeNodeBoundary
 */
function getNode(root, position, includeNodeBoundary = false) {
    if (!root) {
        return null;
    }
    let currentNode = root.firstChild;
    let foundNode = null;
    while (currentNode) {
        const nodeStart = currentNode.start;
        const nodeEnd = currentNode.end;
        if (nodeStart.isBefore(position) && nodeEnd.isAfter(position) || includeNodeBoundary && nodeStart.isBeforeOrEqual(position) && nodeEnd.isAfterOrEqual(position)) {
            foundNode = currentNode;
            // Dig deeper
            currentNode = currentNode.firstChild;
        } else {
            currentNode = currentNode.nextSibling;
        }
    }
    return foundNode;
}
exports.getNode = getNode;
/**
 * Returns inner range of an html node.
 * @param currentNode
 */
function getInnerRange(currentNode) {
    if (!currentNode.close) {
        return;
    }
    return new vscode.Range(currentNode.open.end, currentNode.close.start);
}
exports.getInnerRange = getInnerRange;
function getDeepestNode(node) {
    if (!node || !node.children || node.children.length === 0 || !node.children.find(x => x.type !== 'comment')) {
        return node;
    }
    for (let i = node.children.length - 1; i >= 0; i--) {
        if (node.children[i].type !== 'comment') {
            return getDeepestNode(node.children[i]);
        }
    }
}
exports.getDeepestNode = getDeepestNode;
function findNextWord(propertyValue, pos) {
    let foundSpace = pos === -1;
    let foundStart = false;
    let foundEnd = false;
    let newSelectionStart;
    let newSelectionEnd;
    while (pos < propertyValue.length - 1) {
        pos++;
        if (!foundSpace) {
            if (propertyValue[pos] === ' ') {
                foundSpace = true;
            }
            continue;
        }
        if (foundSpace && !foundStart && propertyValue[pos] === ' ') {
            continue;
        }
        if (!foundStart) {
            newSelectionStart = pos;
            foundStart = true;
            continue;
        }
        if (propertyValue[pos] === ' ') {
            newSelectionEnd = pos;
            foundEnd = true;
            break;
        }
    }
    if (foundStart && !foundEnd) {
        newSelectionEnd = propertyValue.length;
    }
    return [newSelectionStart, newSelectionEnd];
}
exports.findNextWord = findNextWord;
function findPrevWord(propertyValue, pos) {
    let foundSpace = pos === propertyValue.length;
    let foundStart = false;
    let foundEnd = false;
    let newSelectionStart;
    let newSelectionEnd;
    while (pos > -1) {
        pos--;
        if (!foundSpace) {
            if (propertyValue[pos] === ' ') {
                foundSpace = true;
            }
            continue;
        }
        if (foundSpace && !foundEnd && propertyValue[pos] === ' ') {
            continue;
        }
        if (!foundEnd) {
            newSelectionEnd = pos + 1;
            foundEnd = true;
            continue;
        }
        if (propertyValue[pos] === ' ') {
            newSelectionStart = pos + 1;
            foundStart = true;
            break;
        }
    }
    if (foundEnd && !foundStart) {
        newSelectionStart = 0;
    }
    return [newSelectionStart, newSelectionEnd];
}
exports.findPrevWord = findPrevWord;
function getNodesInBetween(node1, node2) {
    // Same node
    if (sameNodes(node1, node2)) {
        return [node1];
    }
    // Same parent
    if (sameNodes(node1.parent, node2.parent)) {
        return getNextSiblingsTillPosition(node1, node2.end);
    }
    // node2 is ancestor of node1
    if (node2.start.isBefore(node1.start)) {
        return [node2];
    }
    // node1 is ancestor of node2
    if (node2.start.isBefore(node1.end)) {
        return [node1];
    }
    // Get the highest ancestor of node1 that should be commented
    while (node1.parent && node1.parent.end.isBefore(node2.start)) {
        node1 = node1.parent;
    }
    // Get the highest ancestor of node2 that should be commented
    while (node2.parent && node2.parent.start.isAfter(node1.start)) {
        node2 = node2.parent;
    }
    return getNextSiblingsTillPosition(node1, node2.end);
}
exports.getNodesInBetween = getNodesInBetween;
function getNextSiblingsTillPosition(node, position) {
    let siblings = [];
    let currentNode = node;
    while (currentNode && position.isAfter(currentNode.start)) {
        siblings.push(currentNode);
        currentNode = currentNode.nextSibling;
    }
    return siblings;
}
function sameNodes(node1, node2) {
    if (!node1 || !node2) {
        return false;
    }
    return node1.start.isEqual(node2.start) && node1.end.isEqual(node2.end);
}
exports.sameNodes = sameNodes;
function getEmmetConfiguration(syntax) {
    const emmetConfig = vscode.workspace.getConfiguration('emmet');
    const syntaxProfiles = Object.assign({}, emmetConfig['syntaxProfiles'] || {});
    // jsx, xml and xsl syntaxes need to have self closing tags unless otherwise configured by user
    if (syntax === 'jsx' || syntax === 'xml' || syntax === 'xsl') {
        syntaxProfiles[syntax] = syntaxProfiles[syntax] || {};
        if (typeof syntaxProfiles[syntax] === 'object' && !syntaxProfiles[syntax].hasOwnProperty('self_closing_tag') // Old Emmet format
        && !syntaxProfiles[syntax].hasOwnProperty('selfClosingStyle') // Emmet 2.0 format
        ) {
                syntaxProfiles[syntax]['selfClosingStyle'] = 'xml';
            }
    }
    return {
        preferences: emmetConfig['preferences'],
        showExpandedAbbreviation: emmetConfig['showExpandedAbbreviation'],
        showAbbreviationSuggestions: emmetConfig['showAbbreviationSuggestions'],
        syntaxProfiles,
        variables: emmetConfig['variables']
    };
}
exports.getEmmetConfiguration = getEmmetConfiguration;
/**
 * Itereates by each child, as well as nested child’ children, in their order
 * and invokes `fn` for each. If `fn` function returns `false`, iteration stops
 * @param  {Token}    token
 * @param  {Function} fn
 */
function iterateCSSToken(token, fn) {
    for (let i = 0, il = token.size; i < il; i++) {
        if (fn(token.item(i)) === false || iterateCSSToken(token.item(i), fn) === false) {
            return false;
        }
    }
}
exports.iterateCSSToken = iterateCSSToken;
/**
 * Returns `name` CSS property from given `rule`
 * @param  {Node} rule
 * @param  {String} name
 * @return {Property}
 */
function getCssPropertyFromRule(rule, name) {
    return rule.children.find(node => node.type === 'property' && node.name === name);
}
exports.getCssPropertyFromRule = getCssPropertyFromRule;
/**
 * Returns css property under caret in given editor or `null` if such node cannot
 * be found
 * @param  {TextEditor}  editor
 * @return {Property}
 */
function getCssPropertyFromDocument(editor, position) {
    const rootNode = parseDocument(editor.document);
    const node = getNode(rootNode, position);
    if (vscode_emmet_helper_1.isStyleSheet(editor.document.languageId)) {
        return node && node.type === 'property' ? node : null;
    }
    let htmlNode = node;
    if (htmlNode && htmlNode.name === 'style' && htmlNode.open.end.isBefore(position) && htmlNode.close.start.isAfter(position)) {
        let buffer = new bufferStream_1.DocumentStreamReader(editor.document, htmlNode.start, new vscode.Range(htmlNode.start, htmlNode.end));
        let rootNode = css_parser_1.default(buffer);
        const node = getNode(rootNode, position);
        return node && node.type === 'property' ? node : null;
    }
}
exports.getCssPropertyFromDocument = getCssPropertyFromDocument;
//# sourceMappingURL=util.js.map

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/* Based on @sergeche's work in his emmet plugin */


Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = __webpack_require__(0);
/**
 * A stream reader for VSCode's `TextDocument`
 * Based on @emmetio/stream-reader and @emmetio/atom-plugin
 */
class DocumentStreamReader {
    /**
     * @param  {TextDocument} buffer
     * @param  {Position}      pos
     * @param  {Range}        limit
     */
    constructor(document, pos, limit) {
        this.document = document;
        this.start = this.pos = pos ? pos : new vscode_1.Position(0, 0);
        this._eof = limit ? limit.end : new vscode_1.Position(this.document.lineCount - 1, this._lineLength(this.document.lineCount - 1));
        this._eol = this.document.eol === vscode_1.EndOfLine.LF ? '\n' : '\r\n';
    }
    /**
     * Returns true only if the stream is at the end of the file.
     * @returns {Boolean}
     */
    eof() {
        return this.pos.isAfterOrEqual(this._eof);
    }
    /**
     * Creates a new stream instance which is limited to given range for given document
     * @param  {Position} start
     * @param  {Position} end
     * @return {DocumentStreamReader}
     */
    limit(start, end) {
        return new DocumentStreamReader(this.document, start, new vscode_1.Range(start, end));
    }
    /**
     * Returns the next character code in the stream without advancing it.
     * Will return NaN at the end of the file.
     * @returns {Number}
     */
    peek() {
        if (this.eof()) {
            return NaN;
        }
        const line = this.document.lineAt(this.pos.line).text;
        return this.pos.character < line.length ? line.charCodeAt(this.pos.character) : this._eol.charCodeAt(this.pos.character - line.length);
    }
    /**
     * Returns the next character in the stream and advances it.
     * Also returns NaN when no more characters are available.
     * @returns {Number}
     */
    next() {
        if (this.eof()) {
            return NaN;
        }
        const line = this.document.lineAt(this.pos.line).text;
        let code;
        if (this.pos.character < line.length) {
            code = line.charCodeAt(this.pos.character);
            this.pos = this.pos.translate(0, 1);
        } else {
            code = this._eol.charCodeAt(this.pos.character - line.length);
            this.pos = new vscode_1.Position(this.pos.line + 1, 0);
        }
        if (this.eof()) {
            // restrict pos to eof, if in case it got moved beyond eof
            this.pos = new vscode_1.Position(this._eof.line, this._eof.character);
        }
        return code;
    }
    /**
     * Backs up the stream n characters. Backing it up further than the
     * start of the current token will cause things to break, so be careful.
     * @param {Number} n
     */
    backUp(n) {
        let row = this.pos.line;
        let column = this.pos.character;
        column -= n || 1;
        while (row >= 0 && column < 0) {
            row--;
            column += this._lineLength(row);
        }
        this.pos = row < 0 || column < 0 ? new vscode_1.Position(0, 0) : new vscode_1.Position(row, column);
        return this.peek();
    }
    /**
     * Get the string between the start of the current token and the
     * current stream position.
     * @returns {String}
     */
    current() {
        return this.substring(this.start, this.pos);
    }
    /**
     * Returns contents for given range
     * @param  {Position} from
     * @param  {Position} to
     * @return {String}
     */
    substring(from, to) {
        return this.document.getText(new vscode_1.Range(from, to));
    }
    /**
     * Creates error object with current stream state
     * @param {String} message
     * @return {Error}
     */
    error(message) {
        const err = new Error(`${message} at row ${this.pos.line}, column ${this.pos.character}`);
        return err;
    }
    /**
     * Returns line length of given row, including line ending
     * @param  {Number} row
     * @return {Number}
     */
    _lineLength(row) {
        if (row === this.document.lineCount - 1) {
            return this.document.lineAt(row).text.length;
        }
        return this.document.lineAt(row).text.length + this._eol.length;
    }
    /**
     * `match` can be a character code or a function that takes a character code
     * and returns a boolean. If the next character in the stream 'matches'
     * the given argument, it is consumed and returned.
     * Otherwise, `false` is returned.
     * @param {Number|Function} match
     * @returns {Boolean}
     */
    eat(match) {
        const ch = this.peek();
        const ok = typeof match === 'function' ? match(ch) : ch === match;
        if (ok) {
            this.next();
        }
        return ok;
    }
    /**
     * Repeatedly calls <code>eat</code> with the given argument, until it
     * fails. Returns <code>true</code> if any characters were eaten.
     * @param {Object} match
     * @returns {Boolean}
     */
    eatWhile(match) {
        const start = this.pos;
        while (!this.eof() && this.eat(match)) {}
        return !this.pos.isEqual(start);
    }
}
exports.DocumentStreamReader = DocumentStreamReader;
//# sourceMappingURL=bufferStream.js.map

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createAtRule = exports.createRule = exports.createProperty = exports.parseSelector = exports.parsePropertyValue = exports.parsePropertyName = exports.parseMediaExpression = exports.backtick = exports.interpolation = exports.url = exports.string = exports.ident = exports.whitespace = exports.comment = exports.formatting = exports.variable = exports.keyword = exports.value = exports.selector = exports.any = exports.Token = exports.lexer = undefined;

var _streamReader = __webpack_require__(24);

var _streamReader2 = _interopRequireDefault(_streamReader);

var _streamReaderUtils = __webpack_require__(25);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Abstract container that contains nested nodes or other containers
 */
class Node {
	constructor(type) {
		this.type = type;
		this.children = [];
		this.parent = null;
	}

	get firstChild() {
		return this.children[0];
	}

	get nextSibling() {
		const ix = this.index();
		return ix !== -1 ? this.parent.children[ix + 1] : null;
	}

	get previousSibling() {
		const ix = this.index();
		return ix !== -1 ? this.parent.children[ix - 1] : null;
	}

	/**
  * Returns current element’s index in parent list of child nodes
  * @return {Number}
  */
	index() {
		return this.parent ? this.parent.children.indexOf(this) : -1;
	}

	/**
  * Adds given node as a child
  * @param {Node} node
  * @return {Node} Current node
  */
	add(node) {
		if (node) {
			node.remove();
			this.children.push(node);
			node.parent = this;
		}
		return this;
	}

	/**
  * Removes current node from its parent
  * @return {Node} Current node
  */
	remove() {
		if (this.parent) {
			const ix = this.index();
			if (ix !== -1) {
				this.parent.children.splice(ix, 1);
				this.parent = null;
			}
		}

		return this;
	}
}

class Stylesheet extends Node {
	constructor() {
		super('stylesheet');
		this.comments = [];
	}

	/**
  * Returns node’s start position in stream
  * @return {*}
  */
	get start() {
		const node = this.firstChild;
		return node && node.start;
	}

	/**
  * Returns node’s end position in stream
  * @return {*}
  */
	get end() {
		const node = this.children[this.children.length - 1];
		return node && node.end;
	}

	/**
  * Adds comment token into a list.
  * This somewhat awkward feature is required to properly detect comment
  * ranges. Specifically, in Atom: it’s API provides scopes limited to current
  * line only
  * @param {Token} token
  */
	addComment(token) {
		this.comments.push(token);
	}
}

/**
 * Removes tokens that matches given criteria from start and end of given list
 * @param  {Token[]} tokens
 * @return {Token[]}
 */
function trimTokens(tokens) {
	tokens = tokens.slice();
	let len;
	while (len !== tokens.length) {
		len = tokens.length;
		if (isFormattingToken(tokens[0])) {
			tokens.shift();
		}

		if (isFormattingToken(last(tokens))) {
			tokens.pop();
		}
	}

	return tokens;
}

/**
 * Trims formatting tokens (whitespace and comments) from the beginning and end
 * of given token list
 * @param  {Token[]} tokens
 * @return {Token[]}
 */
function trimFormatting(tokens) {
	return trimTokens(tokens, isFormattingToken);
}

/**
 * Check if given token is a formatting one (whitespace or comment)
 * @param  {Token}  token
 * @return {Boolean}
 */
function isFormattingToken(token) {
	const type = token && token.type;
	return type === 'whitespace' || type === 'comment';
}

/**
 * Consumes string char-by-char from given stream
 * @param  {StreamReader} stream
 * @param  {String} string
 * @return {Boolean} Returns `true` if string was completely consumed
 */
function eatString(stream, string) {
	const start = stream.pos;

	for (let i = 0, il = string.length; i < il; i++) {
		if (!stream.eat(string.charCodeAt(i))) {
			stream.pos = start;
			return false;
		}
	}

	return true;
}

function consume(stream, match) {
	const start = stream.pos;
	if (stream.eat(match)) {
		stream.start = start;
		return true;
	}

	return false;
}

function consumeWhile(stream, match) {
	const start = stream.pos;
	if (stream.eatWhile(match)) {
		stream.start = start;
		return true;
	}

	return false;
}

function last(arr) {
	return arr[arr.length - 1];
}

function valueOf(token) {
	return token && token.valueOf();
}

/**
 * A structure describing text fragment in content stream. It may contain
 * other sub-fragments (also tokens) that represent current fragments’ logical
 * parts
 */
class Token {
	/**
  * @param {StreamReader} stream
  * @param {String}       type    Token type
  * @param {Object}       [start] Tokens’ start position in `stream`
  * @param {Object}       [end]   Tokens’ end position in `stream`
  */
	constructor(stream, type, start, end) {
		this.stream = stream;
		this.start = start != null ? start : stream.start;
		this.end = end != null ? end : stream.pos;
		this.type = type;

		this._props = null;
		this._value = null;
		this._items = null;
	}

	get size() {
		return this._items ? this._items.length : 0;
	}

	get items() {
		return this._items;
	}

	clone(start, end) {
		return new this.constructor(this.stream, this.type, start != null ? start : this.start, end != null ? end : this.end);
	}

	add(item) {
		if (Array.isArray(item)) {
			for (let i = 0, il = item.length; i < il; i++) {
				this.add(item[i]);
			}
		} else if (item) {
			if (!this._items) {
				this._items = [item];
			} else {
				this._items.push(item);
			}
		}

		return this;
	}

	remove(item) {
		if (this._items) {
			const ix = this._items.indexOf(item);
			if (ix !== -1) {
				this._items.splice(ix, 1);
			}
		}

		return this;
	}

	item(i) {
		const size = this.size;
		return this._items && this._items[(size + i) % size];
	}

	limit() {
		return this.stream.limit(this.start, this.end);
	}

	slice(from, to) {
		const token = this.clone();
		const items = this._items && this._items.slice(from, to);
		if (items && items.length) {
			token.start = items[0].start;
			token.end = items[items.length - 1].end;
			token.add(items);
		} else if (items) {
			// Empty token
			token.start = token.end;
		}

		return token;
	}

	property(name, value) {
		if (typeof value !== 'undefined') {
			// set property value
			if (!this._props) {
				this._props = {};
			}

			this._props[name] = value;
		}

		return this._props && this._props[name];
	}

	/**
  * Returns token textual representation
  * @return {String}
  */
	toString() {
		return `${this.valueOf()} [${this.start}, ${this.end}] (${this.type})`;
	}

	valueOf() {
		if (this._value === null) {
			this._value = this.stream.substring(this.start, this.end);
		}

		return this._value;
	}
}

const COMMA = 44; // ,
const PROP_DELIMITER$1 = 58; // :
const PROP_TERMINATOR$1 = 59; // ;
const RULE_START$1 = 123; // {
const RULE_END$1 = 125; // }

const types = new Map().set(COMMA, 'comma').set(PROP_DELIMITER$1, 'propertyDelimiter').set(PROP_TERMINATOR$1, 'propertyTerminator').set(RULE_START$1, 'ruleStart').set(RULE_END$1, 'ruleEnd');

/**
 * Consumes separator token from given string
 */
function separator(stream) {
	if (isSeparator(stream.peek())) {
		const start = stream.pos;
		const type = types.get(stream.next());
		const token = new Token(stream, 'separator', start);

		token.property('type', type);
		return token;
	}
}

function isSeparator(code) {
	return code === COMMA || code === PROP_DELIMITER$1 || code === PROP_TERMINATOR$1 || code === RULE_START$1 || code === RULE_END$1;
}

const ARGUMENTS_START = 40; // (
const ARGUMENTS_END = 41; // )

var args = function (stream, tokenConsumer) {
	if (stream.peek() === ARGUMENTS_START) {
		const start = stream.pos;
		stream.next();

		const tokens = [];
		let t;
		// in LESS, it’s possible to separate arguments list either by `;` or `,`.
		// In first case, we should keep comma-separated item as a single argument
		let usePropTerminator = false;

		while (!stream.eof()) {
			if (isUnexpectedTerminator(stream.peek()) || stream.eat(ARGUMENTS_END)) {
				break;
			}

			t = tokenConsumer(stream);
			if (!t) {
				break;
			}

			if (isSemicolonSeparator(t)) {
				usePropTerminator = true;
			}

			tokens.push(t);
		}

		stream.start = start;
		return createArgumentList(stream, tokens, usePropTerminator);
	}
};

function isUnexpectedTerminator(code) {
	return code === RULE_START$1 || code === RULE_END$1;
}

function createArgumentList(stream, tokens, usePropTerminator) {
	const argsToken = new Token(stream, 'arguments');
	const isSeparator = usePropTerminator ? isSemicolonSeparator : isCommaSeparator;
	let arg = [];

	for (let i = 0, il = tokens.length, token; i < il; i++) {
		token = tokens[i];
		if (isSeparator(token)) {
			argsToken.add(createArgument(stream, arg) || createEmptyArgument(stream, token.start));
			arg.length = 0;
		} else {
			arg.push(token);
		}
	}

	if (arg.length) {
		argsToken.add(createArgument(stream, arg));
	}

	return argsToken;
}

function createArgument(stream, tokens) {
	tokens = trimFormatting(tokens);

	if (tokens.length) {
		const arg = new Token(stream, 'argument', tokens[0].start, last(tokens).end);

		for (let i = 0; i < tokens.length; i++) {
			arg.add(tokens[i]);
		}

		return arg;
	}
}

function createEmptyArgument(stream, pos) {
	const token = new Token(stream, 'argument', pos, pos);
	token.property('empty', true);
	return token;
}

function isCommaSeparator(token) {
	return token.property('type') === 'comma';
}

function isSemicolonSeparator(token) {
	return token.property('type') === 'propertyTerminator';
}

const HYPHEN = 45;
const UNDERSCORE = 95;

function ident(stream) {
	return eatIdent(stream) && new Token(stream, 'ident');
}

function eatIdent(stream) {
	const start = stream.pos;

	stream.eat(HYPHEN);
	if (stream.eat(isIdentStart)) {
		stream.eatWhile(isIdent);
		stream.start = start;
		return true;
	}

	stream.pos = start;
	return false;
}

function isIdentStart(code) {
	return code === UNDERSCORE || code === HYPHEN || (0, _streamReaderUtils.isAlpha)(code) || code >= 128;
}

function isIdent(code) {
	return (0, _streamReaderUtils.isNumber)(code) || isIdentStart(code);
}

function prefixed(stream, tokenType, prefix, body, allowEmptyBody) {
	const start = stream.pos;

	if (stream.eat(prefix)) {
		const bodyToken = body(stream, start);
		if (bodyToken || allowEmptyBody) {
			stream.start = start;
			return new Token(stream, tokenType, start).add(bodyToken);
		}
	}

	stream.pos = start;
}

const AT = 64; // @

/**
 * Consumes at-keyword from given stream
 */
function atKeyword(stream) {
	return prefixed(stream, 'at-keyword', AT, ident);
}

const HASH = 35; // #
const AT$1 = 64; // @

/**
 * Consumes interpolation token, e.g. `#{expression}`
 * @param  {StreamReader} stream
 * @param  {Function} tokenConsumer
 * @return {Token}
 */
function interpolation(stream, tokenConsumer) {
	const start = stream.pos;
	tokenConsumer = tokenConsumer || defaultTokenConsumer;

	if ((stream.eat(HASH) || stream.eat(AT$1)) && stream.eat(RULE_START$1)) {
		const container = new Token(stream, 'interpolation', start);
		let stack = 1,
		    token;

		while (!stream.eof()) {
			if (stream.eat(RULE_START$1)) {
				stack++;
			} else if (stream.eat(RULE_END$1)) {
				stack--;
				if (!stack) {
					container.end = stream.pos;
					return container;
				}
			} else if (token = tokenConsumer(stream)) {
				container.add(token);
			} else {
				break;
			}
		}
	}

	stream.pos = start;
}

function eatInterpolation(stream) {
	const start = stream.pos;

	if ((stream.eat(HASH) || stream.eat(AT$1)) && (0, _streamReaderUtils.eatPair)(stream, RULE_START$1, RULE_END$1)) {
		stream.start = start;
		return true;
	}

	stream.pos = start;
	return false;
}

function defaultTokenConsumer(stream) {
	const start = stream.pos;

	while (!stream.eof()) {
		if (stream.peek() === RULE_END$1) {
			break;
		}

		eatString$1(stream) || stream.next();
	}

	if (start !== stream.pos) {
		return new Token(stream, 'expression', start);
	}
}

/**
 * Consumes quoted string from current string and returns token with consumed
 * data or `null`, if string wasn’t consumed
 * @param  {StreamReader} stream
 * @return {StringToken}
 */
function string(stream) {
	return eatString$1(stream, true);
}

function eatString$1(stream, asToken) {
	let ch = stream.peek(),
	    pos,
	    tokens,
	    token;

	if ((0, _streamReaderUtils.isQuote)(ch)) {
		stream.start = stream.pos;
		stream.next();
		const quote = ch;
		const valueStart = stream.pos;

		while (!stream.eof()) {
			pos = stream.pos;
			if (stream.eat(quote) || stream.eat(isNewline)) {
				// found end of string or newline without preceding '\',
				// which is not allowed (don’t throw error, for now)
				break;
			} else if (stream.eat(92 /* \ */)) {
				// backslash allows newline in string
				stream.eat(isNewline);
			} else if (asToken && (token = interpolation(stream))) {
				if (!tokens) {
					tokens = [token];
				} else {
					tokens.push(token);
				}
			}

			stream.next();
		}

		// Either reached EOF or explicitly stopped at string end
		// NB use extra `asToken` param to return boolean instead of token to reduce
		// memory allocations and improve performance
		if (asToken) {
			const token = new Token(stream, 'string');
			const inner = new Token(stream, 'unquoted', valueStart, pos);
			inner.add(tokens);
			token.add(inner);
			token.property('quote', quote);
			return token;
		}

		return true;
	}

	return false;
}

function isNewline(code) {
	return code === 10 /* LF */ || code === 13 /* CR */;
}

const ASTERISK = 42;
const SLASH = 47;

/**
 * Consumes comment from given stream: either multi-line or single-line
 * @param  {StreamReader} stream
 * @return {CommentToken}
 */
var comment = function (stream) {
	return singleLineComment(stream) || multiLineComment(stream);
};

function singleLineComment(stream) {
	if (eatSingleLineComment(stream)) {
		const token = new Token(stream, 'comment');
		token.property('type', 'single-line');
		return token;
	}
}

function multiLineComment(stream) {
	if (eatMultiLineComment(stream)) {
		const token = new Token(stream, 'comment');
		token.property('type', 'multiline');
		return token;
	}
}

function eatComment(stream) {
	return eatSingleLineComment(stream) || eatMultiLineComment(stream);
}

function eatSingleLineComment(stream) {
	const start = stream.pos;

	if (stream.eat(SLASH) && stream.eat(SLASH)) {
		// single-line comment, consume till the end of line
		stream.start = start;
		while (!stream.eof()) {
			if (isLineBreak(stream.next())) {
				break;
			}
		}
		return true;
	}

	stream.pos = start;
	return false;
}

function eatMultiLineComment(stream) {
	const start = stream.pos;

	if (stream.eat(SLASH) && stream.eat(ASTERISK)) {
		while (!stream.eof()) {
			if (stream.next() === ASTERISK && stream.eat(SLASH)) {
				break;
			}
		}

		stream.start = start;
		return true;
	}

	stream.pos = start;
	return false;
}

function isLineBreak(code) {
	return code === 10 /* LF */ || code === 13 /* CR */;
}

/**
 * Consumes white-space tokens from given stream
 */
function whitespace(stream) {
	return eatWhitespace(stream) && new Token(stream, 'whitespace');
}

function eatWhitespace(stream) {
	return consumeWhile(stream, _streamReaderUtils.isSpace);
}

const ATTR_START = 91; // [
const ATTR_END = 93; // ]

/**
 * Consumes attribute from given string, e.g. value between [ and ]
 * @param  {StreamReader} stream
 * @return {AttributeToken}
 */
function eatAttribuite(stream) {
	const start = stream.pos;

	if (stream.eat(ATTR_START)) {
		skip(stream);
		const name = ident(stream);

		skip(stream);
		const op = operator(stream);

		skip(stream);
		const value = string(stream) || ident(stream);

		skip(stream);
		stream.eat(ATTR_END);

		return new Token(stream, 'attribute', start).add(name).add(op).add(value);
	}
}

function skip(stream) {
	while (!stream.eof()) {
		if (!eatWhitespace(stream) && !eatComment(stream)) {
			return true;
		}
	}
}

function operator(stream) {
	return consumeWhile(stream, isOperator) && new Token(stream, 'operator');
}

function isOperator(code) {
	return code === 126 /* ~ */
	|| code === 124 /* | */
	|| code === 94 /* ^ */
	|| code === 36 /* $ */
	|| code === 42 /* * */
	|| code === 61; /* = */
}

const BACKTICK = 96; // `

/**
 * Consumes backtick token, e.g. `...`
 * @param  {StreamReader} stream
 * @param  {Function} tokenConsumer
 * @return {Token}
 */
function backtick(stream) {
	if (eatBacktick(stream)) {
		return new Token(stream, 'backtick');
	}
}

function eatBacktick(stream) {
	const start = stream.pos;

	if ((0, _streamReaderUtils.eatPair)(stream, BACKTICK, BACKTICK)) {
		stream.start = start;
		return true;
	}

	return false;
}

const CLASS = 46; // .

/**
 * Consumes class fragment from given stream, e.g. `.foo`
 * @param  {StreamReader} stream
 * @return {ClassToken}
 */
function className(stream) {
	return prefixed(stream, 'class', CLASS, ident);
}

const ADJACENT_SIBLING = 43; // +
const GENERAL_SIBLING = 126; // ~
const CHILD = 62; // >
const NESTING = 38; // &

const types$1 = {
	[ADJACENT_SIBLING]: 'adjacentSibling',
	[GENERAL_SIBLING]: 'generalSibling',
	[CHILD]: 'child',
	[NESTING]: 'nesting'
};

/**
 * Consumes combinator token from given string
 */
var combinator = function (stream) {
	if (isCombinator(stream.peek())) {
		const start = stream.pos;
		const type = types$1[stream.next()];
		const token = new Token(stream, 'combinator', start);

		token.property('type', type);
		return token;
	}
};

function isCombinator(code) {
	return code === ADJACENT_SIBLING || code === GENERAL_SIBLING || code === NESTING || code === CHILD;
}

const HASH$1 = 35;

function hash(stream) {
	return prefixed(stream, 'hash', HASH$1, hashValue, true);
}

function hashValue(stream) {
	if (eatHashValue(stream)) {
		return new Token(stream, 'hash-value');
	}
}

function eatHashValue(stream) {
	return consumeWhile(stream, isHashValue);
}

function isHashValue(code) {
	return (0, _streamReaderUtils.isNumber)(code) || (0, _streamReaderUtils.isAlpha)(code, 65 /* A */, 70 /* F */) || code === 95 /* _ */ || code === 45 /* - */
	|| code > 128; /* non-ASCII */
}

const ID = 35; // #

/**
 * Consumes id fragment from given stream, e.g. `#foo`
 * @param  {StreamReader} stream
 * @return {Token}
 */
function id(stream) {
	return prefixed(stream, 'id', ID, ident);
}

const IMPORTANT = 33; // !

/**
 * Consumes !important token
 * @param  {StreamReader} stream
 * @return {Token}
 */
function important(stream) {
	return prefixed(stream, 'important', IMPORTANT, ident);
}

const DOT = 46; // .

/**
 * Consumes number from given string, e.g. `10px`
 * @param  {StreamReader} stream
 * @return {NumberToken}
 */
function number(stream) {
	if (eatNumericPart(stream)) {
		const start = stream.start;
		const num = new Token(stream, 'value');
		const unit = eatUnitPart(stream) ? new Token(stream, 'unit') : null;

		return new Token(stream, 'number', start).add(num).add(unit);
	}
}

function eatNumericPart(stream) {
	const start = stream.pos;

	stream.eat(isOperator$1);
	if (stream.eatWhile(_streamReaderUtils.isNumber)) {
		stream.start = start;
		const decimalEnd = stream.pos;

		if (!(stream.eat(DOT) && stream.eatWhile(_streamReaderUtils.isNumber))) {
			stream.pos = decimalEnd;
		}

		return true;
	} else if (stream.eat(DOT) && stream.eatWhile(_streamReaderUtils.isNumber)) {
		stream.start = start;
		return true;
	}

	// TODO eat exponent part

	stream.pos = start;
	return false;
}

function eatUnitPart(stream) {
	return eatIdent(stream) || eatPercent(stream);
}

function eatPercent(stream) {
	return consume(stream, 37 /* % */);
}

function isOperator$1(code) {
	return code === 45 /* - */ || code === 43 /* + */;
}

const NOT = 33; // !
const MULTIPLY = 42; // *
const PLUS = 43; // +
const MINUS = 45; // -
const DIVIDE = 47; // /
const LESS_THAN = 60; // <
const EQUALS = 61; // =
const GREATER_THAN = 62; // <

function operator$1(stream) {
	return eatOperator(stream) && new Token(stream, 'operator');
}

function eatOperator(stream) {
	if (consume(stream, isEquality)) {
		stream.eatWhile(EQUALS);
		return true;
	} else if (consume(stream, isOperator$2)) {
		return true;
	}

	return false;
}

function isEquality(code) {
	return code === NOT || code === LESS_THAN || code === EQUALS || code === GREATER_THAN;
}

function isOperator$2(code) {
	return code === MULTIPLY || code === PLUS || code === MINUS || code === DIVIDE || isEquality(code);
}

const PSEUDO = 58; // :

/**
 * Consumes pseudo-selector from given stream
 */
var pseudo = function (stream) {
	const start = stream.pos;

	if (stream.eatWhile(PSEUDO)) {
		const name = ident(stream);
		if (name) {
			return new Token(stream, 'pseudo', start).add(name);
		}
	}

	stream.pos = start;
};

/**
 * Consumes unquoted value from given stream
 * @param  {StreamReader} stream
 * @return {UnquotedToken}
 */
var unquoted = function (stream) {
	return eatUnquoted(stream) && new Token(stream, 'unquoted');
};

function eatUnquoted(stream) {
	return consumeWhile(stream, isUnquoted);
}

function isUnquoted(code) {
	return !isNaN(code) && !(0, _streamReaderUtils.isQuote)(code) && !(0, _streamReaderUtils.isSpace)(code) && code !== 40 /* ( */ && code !== 41 /* ) */ && code !== 92 /* \ */
	&& !isNonPrintable(code);
}

function isNonPrintable(code) {
	return code >= 0 && code <= 8 || code === 11 || code >= 14 && code <= 31 || code === 127;
}

/**
 * Consumes URL token from given stream
 * @param  {StreamReader} stream
 * @return {Token}
 */
function url(stream) {
	const start = stream.pos;

	if (eatString(stream, 'url(')) {
		eatWhitespace(stream);
		const value = string(stream) || unquoted(stream);
		eatWhitespace(stream);
		stream.eat(41); // )

		return new Token(stream, 'url', start).add(value);
	}

	stream.pos = start;
}

function eatUrl(stream) {
	const start = stream.pos;

	if (eatString(stream, 'url(')) {
		eatWhitespace(stream);
		eatString$1(stream) || eatUnquoted(stream);
		eatWhitespace(stream);
		stream.eat(41); // )
		stream.start = start;

		return true;
	}

	stream.pos = start;
	return false;
}

const VARIABLE = 36; // $

/**
 * Consumes SCSS variable from given stream
 */
function variable(stream) {
	return prefixed(stream, 'variable', VARIABLE, variableName);
}

function variableName(stream) {
	if (eatVariableName(stream)) {
		return new Token(stream, 'name');
	}
}

function eatVariableName(stream) {
	return consumeWhile(stream, isVariableName);
}

function isVariableName(code) {
	return code === VARIABLE || isIdent(code);
}

/**
 * Group tokens by commonly used context
 */

function consumeToken(stream) {
	const _token = any(stream) || args(stream, consumeToken);
	if (_token && _token.type === 'ident') {
		const _args = args(stream, consumeToken);
		if (_args) {
			// An identifier followed by arguments – function call
			return new Token(stream, 'function', _token.start, _args.end).add(_token).add(_args);
		}
	}

	return _token || unknown(stream);
}

function any(stream) {
	return formatting(stream) || url(stream) || selector(stream) || value(stream) || separator(stream);
}

function selector(stream) {
	return interpolation(stream) || backtick(stream) || ident(stream) || atKeyword(stream) || className(stream) || id(stream) || pseudo(stream) || eatAttribuite(stream) || combinator(stream);
}

function value(stream) {
	return url(stream) || string(stream) || interpolation(stream) || backtick(stream) || number(stream) || hash(stream) || keyword(stream) || important(stream) || operator$1(stream);
}

function keyword(stream) {
	return backtick(stream) || variable(stream) || atKeyword(stream) || ident(stream);
}

function formatting(stream) {
	return comment(stream) || whitespace(stream);
}

function unknown(stream) {
	stream.start = stream.pos;
	const ch = stream.next();
	if (ch != null) {
		return new Token(stream, 'unknown');
	}
}

/**
 * Parses CSS rule selector
 * @param  {String|StreamReader} source
 * @return {Token[]}
 */
function parseSelector(source) {
	return parseList(source, 'selector');
}

/**
 * Parses CSS property name. Mostly used for LESS where
 * property-like entry might be used as a mixin call
 * @param {String|StreamReader} source
 * @return {Token}
 */
function parsePropertyName(source) {
	const stream = typeof source === 'string' ? new _streamReader2.default(source) : source;
	const items = [];

	while (!stream.eof()) {
		items.push(consumeToken(stream));
	}

	let token;
	if (items.length === 1) {
		token = items[0];
	} else {
		token = new Token(stream, 'property-name', stream.start, stream.end);
		for (let i = 0, il = items.length; i < il; i++) {
			token.add(items[i]);
		}
	}

	return token;
}

/**
 * Parses CSS property value
 * @param  {String|StreamReader} source
 * @return {Token[]}
 */
function parsePropertyValue(source) {
	return parseList(source);
}

/**
 * Parses @media CSS rule expression
 * @param  {String|StreamReader} source
 * @return {Token[]}
 */
function parseMediaExpression(source) {
	return parseList(source);
}

/**
 * Parses given source into a set of tokens, separated by comma. Each token contains
 * parsed sub-items as independent tokens and so on. Mostly used to parse
 * selectors and property values
 * @param  {String|StreamReader} source     Source to parse
 * @param  {String}             [tokenType] Type of first-level tokens.
 *                                          Default is `item`
 * @return {Token[]}
 */
function parseList(source, tokenType) {
	tokenType = tokenType || 'item';
	const stream = typeof source === 'string' ? new _streamReader2.default(source) : source;
	const items = [];
	const fragments = [];
	const flush = () => {
		const clean = trimFormatting(fragments);

		if (clean.length) {
			const item = new Token(stream, tokenType, clean[0].start, last(clean).end);
			for (let i = 0; i < clean.length; i++) {
				item.add(clean[i]);
			}
			items.push(item);
		}

		fragments.length = 0;
	};

	let token;
	while (!stream.eof()) {
		if (stream.eat(44 /* , */)) {
			flush();
		} else if (token = consumeToken(stream)) {
			if (token.type !== 'comment') {
				fragments.push(token);
			}
		} else {
			throw stream.error('Unexpected character');
		}
	}

	flush();
	return items;
}

/**
 * Creates CSS rule from given tokens
 * @param  {StreamReader} stream
 * @param  {Token[]} tokens
 * @param  {Token} [content]
 * @return {Rule}
 */
function createRule(stream, tokens, contentStart, contentEnd) {
	if (!tokens.length) {
		return null;
	}

	const name = tokens[0];
	name.end = last(tokens).end;

	return new Rule(stream, name, contentStart, contentEnd);
}

/**
 * Represents CSS rule
 * @type {Node}
 */
class Rule extends Node {
	/**
  * @param {StreamReader} stream
  * @param {Token} name         Rule’s name token
  * @param {Token} contentStart Rule’s content start token
  * @param {Token} [contentEnd] Rule’s content end token
  */
	constructor(stream, name, contentStart, contentEnd) {
		super('rule');
		this.stream = stream;
		this.selectorToken = name;
		this.contentStartToken = contentStart;
		this.contentEndToken = contentEnd || contentStart;
		this._parsedSelector = null;
	}

	/**
  * Returns rule selector
  * @return {String}
  */
	get selector() {
		return valueOf(this.selectorToken);
	}

	get parsedSelector() {
		if (!this._parsedSelector) {
			this._parsedSelector = parseSelector(this.selectorToken.limit());
		}

		return this._parsedSelector;
	}

	/**
  * Returns node’s start position in stream
  * @return {*}
  */
	get start() {
		return this.selectorToken && this.selectorToken.start;
	}

	/**
  * Returns node’s end position in stream
  * @return {*}
  */
	get end() {
		const token = this.contentEndToken || this.contentStartToken || this.nameToken;
		return token && token.end;
	}
}

/**
 * Creates CSS rule from given tokens
 * @param  {StreamReader} stream
 * @param  {Token[]} tokens
 * @param  {Token} [content]
 * @return {Rule}
 */
function createAtRule(stream, tokens, contentStart, contentEnd) {
	if (!tokens.length) {
		return null;
	}

	let ix = 0,
	    expression;
	const name = tokens[ix++];

	if (ix < tokens.length) {
		expression = tokens[ix++];
		expression.type = 'expression';
		expression.end = last(tokens).end;
	} else {
		expression = new Token(stream, 'expression', name.end, name.end);
	}

	return new AtRule(stream, name, expression, contentStart, contentEnd);
}

class AtRule extends Node {
	constructor(stream, name, expression, contentStart, contentEnd) {
		super('at-rule');
		this.stream = stream;
		this.nameToken = name;
		this.expressionToken = expression;
		this.contentStartToken = contentStart;
		this.contentEndToken = contentEnd || contentStart;
		this._parsedExpression = null;
	}

	/**
  * Returns at-rule name
  * @return {String}
  */
	get name() {
		return valueOf(this.nameToken && this.nameToken.item(0));
	}

	get expression() {
		return valueOf(this.expressionToken);
	}

	get parsedExpression() {
		if (!this._parsedExpression) {
			this._parsedExpression = parseMediaExpression(this.expressionToken.limit());
		}

		return this._parsedExpression;
	}

	/**
  * Returns node’s start position in stream
  * @return {*}
  */
	get start() {
		return this.nameToken && this.nameToken.start;
	}

	/**
  * Returns node’s end position in stream
  * @return {*}
  */
	get end() {
		const token = this.contentEndToken || this.contentStartToken || this.nameToken;
		return token && token.end;
	}
}

/**
 * Factory method that creates property node from given tokens
 * @param  {StreamReader} stream
 * @param  {Token[]}      tokens
 * @param  {Token}        terminator
 * @return {Property}
 */
function createProperty(stream, tokens, terminator) {
	// NB in LESS, fragmented properties without value like `.foo.bar;` must be
	// treated like mixin call
	if (!tokens.length) {
		return null;
	}

	let separator,
	    value,
	    ix = 0;
	const name = tokens[ix++];

	if (ix < tokens.length) {
		value = tokens[ix++];
		value.type = 'value';
		value.end = last(tokens).end;
	}

	if (name && value) {
		separator = new Token(stream, 'separator', name.end, value.start);
	}

	return new Property(stream, name, value, separator, terminator);
}

class Property extends Node {
	constructor(stream, name, value, separator, terminator) {
		super('property');
		this.stream = stream;
		this.nameToken = name;
		this.valueToken = value;
		this._parsedName = null;
		this._parsedValue = null;

		this.separatorToken = separator;
		this.terminatorToken = terminator;
	}

	/**
  * Property name
  * @return {String}
  */
	get name() {
		return valueOf(this.nameToken);
	}

	/**
  * Returns parsed sub-tokens of current property name
  * @return {Token[]}
  */
	get parsedName() {
		if (!this._parsedName) {
			this._parsedName = parsePropertyName(this.nameToken.limit());
		}

		return this._parsedName;
	}

	/**
  * Property value
  * @return {String}
  */
	get value() {
		return valueOf(this.valueToken);
	}

	/**
  * Parsed value parts: a list of tokens, separated by comma. Each token may
  * contains parsed sub-tokens and so on
  * @return {Token[]}
  */
	get parsedValue() {
		if (!this._parsedValue) {
			this._parsedValue = parsePropertyValue(this.valueToken.limit());
		}

		return this._parsedValue;
	}

	get separator() {
		return valueOf(this.separatorToken);
	}

	get terminator() {
		return valueOf(this.terminatorToken);
	}

	get start() {
		const token = this.nameToken || this.separatorToken || this.valueToken || this.terminatorToken;
		return token && token.start;
	}

	get end() {
		const token = this.terminatorToken || this.valueToken || this.separatorToken || this.nameToken;
		return token && token.end;
	}
}

const LBRACE = 40; // (
const RBRACE = 41; // )
const PROP_DELIMITER = 58; // :
const PROP_TERMINATOR = 59; // ;
const RULE_START = 123; // {
const RULE_END = 125; // }

function parseStylesheet(source) {
	const stream = typeof source === 'string' ? new _streamReader2.default(source) : source;
	const root = new Stylesheet();
	let ctx = root,
	    child,
	    accum,
	    token;
	let tokens = [];
	const flush = () => {
		if (accum) {
			tokens.push(accum);
			accum = null;
		}
	};

	while (!stream.eof()) {
		if (eatWhitespace(stream)) {
			continue;
		}

		if (token = comment(stream)) {
			root.addComment(token);
			continue;
		}

		stream.start = stream.pos;

		if (stream.eatWhile(PROP_DELIMITER)) {
			// Property delimiter can be either a real property delimiter or a
			// part of pseudo-selector.
			if (!tokens.length) {
				if (accum) {
					// No consumed tokens yet but pending token: most likely it’s
					// a CSS property
					flush();
				} else {
					// No consumend or accumulated token, seems like a start of
					// pseudo-selector, e.g. `::slotted`
					accum = new Token(stream, 'preparse');
				}
			}
			// Skip delimiter if there are already consumend tokens: most likely
			// it’s a part of pseudo-selector
		} else if (stream.eat(PROP_TERMINATOR)) {
			flush();
			ctx.add(createProperty(stream, tokens, new Token(stream, 'termintator')));
			tokens.length = 0;
		} else if (stream.eat(RULE_START)) {
			flush();
			if (tokens.length > 0) {
				child = tokens[0].type === 'at-keyword' ? createAtRule(stream, tokens, new Token(stream, 'body-start')) : createRule(stream, tokens, new Token(stream, 'body-start'));
				ctx.add(child);
				ctx = child;
				tokens.length = 0;
			}
		} else if (stream.eat(RULE_END)) {
			flush();

			// Finalize context section
			ctx.add(createProperty(stream, tokens));

			if (ctx.type !== 'stylesheet') {
				// In case of invalid stylesheet with redundant `}`,
				// don’t modify root section.
				ctx.contentEndToken = new Token(stream, 'body-end');
				ctx = ctx.parent;
			}

			tokens.length = 0;
		} else if (token = atKeyword(stream)) {
			// Explictly consume @-tokens since it defines how rule or property
			// should be pre-parsed
			flush();
			tokens.push(token);
		} else if (eatUrl(stream) || eatInterpolation(stream) || eatBacktick(stream) || eatBraces(stream, root) || eatString$1(stream) || stream.next()) {
			// NB explicitly consume `url()` token since it may contain
			// an unquoted url like `http://example.com` which interferes
			// with single-line comment
			accum = accum || new Token(stream, 'preparse');
			accum.end = stream.pos;
		} else {
			throw new Error(`Unexpected end-of-stream at ${stream.pos}`);
		}
	}

	if (accum) {
		tokens.push(accum);
	}

	// Finalize all the rest properties
	ctx.add(createProperty(stream, tokens));

	// Finalize unterminated rules
	stream.start = stream.pos;
	while (ctx && ctx !== root) {
		ctx.contentEndToken = new Token(stream, 'body-end');
		ctx = ctx.parent;
	}

	return root;
}

/**
 * Parses given source into tokens
 * @param  {String|StreamReader} source
 * @param  {Function} [consumer] Token consumer function, for example, `selector`,
 * `value` etc. from `lib/tokens` module. Default is generic `consumeToken`
 * @return {Token[]}
 */
function lexer(source, consumer) {
	consumer = consumer || consumeToken;
	const stream = typeof source === 'string' ? new _streamReader2.default(source) : source;
	const result = [];
	let token;

	while (!stream.eof() && (token = consumer(stream))) {
		result.push(token);
	}

	return result;
}

/**
 * Consumes content inside round braces. Mostly used to skip `;` token inside
 * expressions since in LESS it is also used to separate function arguments
 * @param  {StringReader} stream
 * @param  {Stylesheet}   root   A stylesheet root. Used to accumulate comments
 * @return {Boolean}
 */
function eatBraces(stream, root) {
	if (stream.eat(LBRACE)) {
		let stack = 1,
		    token;

		while (!stream.eof()) {
			if (stream.eat(RBRACE)) {
				stack--;
				if (!stack) {
					break;
				}
			} else if (stream.eat(LBRACE)) {
				stack++;
			} else if (eatUrl(stream) || eatString$1(stream)) {
				continue;
			} else if (token = comment(stream)) {
				root.addComment(token);
				continue;
			} else {
				stream.next();
			}
		}

		return true;
	}

	return false;
}

exports.lexer = lexer;
exports.Token = Token;
exports.any = any;
exports.selector = selector;
exports.value = value;
exports.keyword = keyword;
exports.variable = variable;
exports.formatting = formatting;
exports.comment = comment;
exports.whitespace = whitespace;
exports.ident = ident;
exports.string = string;
exports.url = url;
exports.interpolation = interpolation;
exports.backtick = backtick;
exports.parseMediaExpression = parseMediaExpression;
exports.parsePropertyName = parsePropertyName;
exports.parsePropertyValue = parsePropertyValue;
exports.parseSelector = parseSelector;
exports.createProperty = createProperty;
exports.createRule = createRule;
exports.createAtRule = createAtRule;
exports.default = parseStylesheet;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(0);
const util_1 = __webpack_require__(1);
const vscode_emmet_helper_1 = __webpack_require__(2);
const trimRegex = /[\u00a0]*[\d|#|\-|\*|\u2022]+\.?/;
function wrapWithAbbreviation(args) {
    if (!util_1.validate(false)) {
        return;
    }
    const editor = vscode.window.activeTextEditor;
    const abbreviationPromise = args && args['abbreviation'] ? Promise.resolve(args['abbreviation']) : vscode.window.showInputBox({ prompt: 'Enter Abbreviation' });
    const syntax = getSyntaxFromArgs({ language: editor.document.languageId });
    return abbreviationPromise.then(abbreviation => {
        if (!abbreviation || !abbreviation.trim() || !vscode_emmet_helper_1.isAbbreviationValid(syntax, abbreviation)) {
            return;
        }
        let expandAbbrList = [];
        editor.selections.forEach(selection => {
            let rangeToReplace = selection.isReversed ? new vscode.Range(selection.active, selection.anchor) : selection;
            if (rangeToReplace.isEmpty) {
                rangeToReplace = new vscode.Range(rangeToReplace.start.line, 0, rangeToReplace.start.line, editor.document.lineAt(rangeToReplace.start.line).text.length);
            }
            const firstLineOfSelection = editor.document.lineAt(rangeToReplace.start).text.substr(rangeToReplace.start.character);
            const matches = firstLineOfSelection.match(/^(\s*)/);
            const preceedingWhiteSpace = matches ? matches[1].length : 0;
            rangeToReplace = new vscode.Range(rangeToReplace.start.line, rangeToReplace.start.character + preceedingWhiteSpace, rangeToReplace.end.line, rangeToReplace.end.character);
            expandAbbrList.push({ syntax, abbreviation, rangeToReplace, textToWrap: ['\n\t$TM_SELECTED_TEXT\n'] });
        });
        return expandAbbreviationInRange(editor, expandAbbrList, true);
    });
}
exports.wrapWithAbbreviation = wrapWithAbbreviation;
function wrapIndividualLinesWithAbbreviation(args) {
    if (!util_1.validate(false)) {
        return;
    }
    const editor = vscode.window.activeTextEditor;
    if (editor.selection.isEmpty) {
        vscode.window.showInformationMessage('Select more than 1 line and try again.');
        return;
    }
    const abbreviationPromise = args && args['abbreviation'] ? Promise.resolve(args['abbreviation']) : vscode.window.showInputBox({ prompt: 'Enter Abbreviation' });
    const syntax = getSyntaxFromArgs({ language: editor.document.languageId });
    const lines = editor.document.getText(editor.selection).split('\n').map(x => x.trim());
    return abbreviationPromise.then(inputAbbreviation => {
        if (!inputAbbreviation || !inputAbbreviation.trim() || !vscode_emmet_helper_1.isAbbreviationValid(syntax, inputAbbreviation)) {
            return;
        }
        let extractedResults = vscode_emmet_helper_1.extractAbbreviationFromText(inputAbbreviation);
        if (!extractedResults) {
            return;
        }
        let { abbreviation, filter } = extractedResults;
        let input = {
            syntax,
            abbreviation,
            rangeToReplace: editor.selection,
            textToWrap: lines,
            filter
        };
        return expandAbbreviationInRange(editor, [input], true);
    });
}
exports.wrapIndividualLinesWithAbbreviation = wrapIndividualLinesWithAbbreviation;
function expandEmmetAbbreviation(args) {
    const syntax = getSyntaxFromArgs(args);
    if (!syntax || !util_1.validate()) {
        return fallbackTab();
    }
    const editor = vscode.window.activeTextEditor;
    let rootNode = util_1.parseDocument(editor.document, false);
    // When tabbed on a non empty selection, do not treat it as an emmet abbreviation, and fallback to tab instead
    if (vscode.workspace.getConfiguration('emmet')['triggerExpansionOnTab'] === true && editor.selections.find(x => !x.isEmpty)) {
        return fallbackTab();
    }
    let abbreviationList = [];
    let firstAbbreviation;
    let allAbbreviationsSame = true;
    let getAbbreviation = (document, selection, position, syntax) => {
        let rangeToReplace = selection;
        let abbr = document.getText(rangeToReplace);
        if (!rangeToReplace.isEmpty) {
            let extractedResults = vscode_emmet_helper_1.extractAbbreviationFromText(abbr);
            if (extractedResults) {
                return [rangeToReplace, extractedResults.abbreviation, extractedResults.filter];
            }
            return [null, '', ''];
        }
        const currentLine = editor.document.lineAt(position.line).text;
        const textTillPosition = currentLine.substr(0, position.character);
        // Expand cases like <div to <div></div> explicitly
        // else we will end up with <<div></div>
        if (syntax === 'html') {
            let matches = textTillPosition.match(/<(\w+)$/);
            if (matches) {
                abbr = matches[1];
                rangeToReplace = new vscode.Range(position.translate(0, -(abbr.length + 1)), position);
                return [rangeToReplace, abbr, ''];
            }
        }
        let extractedResults = vscode_emmet_helper_1.extractAbbreviation(editor.document, position, false);
        if (!extractedResults) {
            return [null, '', ''];
        }
        let { abbreviationRange, abbreviation, filter } = extractedResults;
        return [new vscode.Range(abbreviationRange.start.line, abbreviationRange.start.character, abbreviationRange.end.line, abbreviationRange.end.character), abbreviation, filter];
    };
    let selectionsInReverseOrder = editor.selections.slice(0);
    selectionsInReverseOrder.sort((a, b) => {
        var posA = a.isReversed ? a.anchor : a.active;
        var posB = b.isReversed ? b.anchor : b.active;
        return posA.compareTo(posB) * -1;
    });
    selectionsInReverseOrder.forEach(selection => {
        let position = selection.isReversed ? selection.anchor : selection.active;
        let [rangeToReplace, abbreviation, filter] = getAbbreviation(editor.document, selection, position, syntax);
        if (!rangeToReplace) {
            return;
        }
        if (!vscode_emmet_helper_1.isAbbreviationValid(syntax, abbreviation)) {
            return;
        }
        let currentNode = util_1.getNode(rootNode, position, true);
        if (!isValidLocationForEmmetAbbreviation(currentNode, syntax, position)) {
            return;
        }
        if (!firstAbbreviation) {
            firstAbbreviation = abbreviation;
        } else if (allAbbreviationsSame && firstAbbreviation !== abbreviation) {
            allAbbreviationsSame = false;
        }
        abbreviationList.push({ syntax, abbreviation, rangeToReplace, filter });
    });
    return expandAbbreviationInRange(editor, abbreviationList, allAbbreviationsSame).then(success => {
        if (!success) {
            return fallbackTab();
        }
    });
}
exports.expandEmmetAbbreviation = expandEmmetAbbreviation;
function fallbackTab() {
    if (vscode.workspace.getConfiguration('emmet')['triggerExpansionOnTab'] === true) {
        return vscode.commands.executeCommand('tab');
    }
}
/**
 * Checks if given position is a valid location to expand emmet abbreviation.
 * Works only on html and css/less/scss syntax
 * @param currentNode parsed node at given position
 * @param syntax syntax of the abbreviation
 * @param position position to validate
 */
function isValidLocationForEmmetAbbreviation(currentNode, syntax, position) {
    // Continue validation only if the file was parse-able and the currentNode has been found
    if (!currentNode) {
        return true;
    }
    if (vscode_emmet_helper_1.isStyleSheet(syntax)) {
        // If current node is a rule or at-rule, then perform additional checks to ensure
        // emmet suggestions are not provided in the rule selector
        if (currentNode.type !== 'rule' && currentNode.type !== 'at-rule') {
            return true;
        }
        const currentCssNode = currentNode;
        // Position is valid if it occurs after the `{` that marks beginning of rule contents
        if (position.isAfter(currentCssNode.contentStartToken.end)) {
            return true;
        }
        // Workaround for https://github.com/Microsoft/vscode/30188
        // The line above the rule selector is considered as part of the selector by the css-parser
        // But we should assume it is a valid location for css properties under the parent rule
        if (currentCssNode.parent && (currentCssNode.parent.type === 'rule' || currentCssNode.parent.type === 'at-rule') && currentCssNode.selectorToken && position.line !== currentCssNode.selectorToken.end.line) {
            return true;
        }
        return false;
    }
    const currentHtmlNode = currentNode;
    if (currentHtmlNode.close) {
        return util_1.getInnerRange(currentHtmlNode).contains(position);
    }
    return false;
}
exports.isValidLocationForEmmetAbbreviation = isValidLocationForEmmetAbbreviation;
/**
 * Expands abbreviations as detailed in expandAbbrList in the editor
 * @param editor
 * @param expandAbbrList
 * @param insertSameSnippet
 * @returns false if no snippet can be inserted.
 */
function expandAbbreviationInRange(editor, expandAbbrList, insertSameSnippet) {
    if (!expandAbbrList || expandAbbrList.length === 0) {
        return Promise.resolve(false);
    }
    // Snippet to replace at multiple cursors are not the same
    // `editor.insertSnippet` will have to be called for each instance separately
    // We will not be able to maintain multiple cursors after snippet insertion
    let insertPromises = [];
    if (!insertSameSnippet) {
        expandAbbrList.forEach(expandAbbrInput => {
            let expandedText = expandAbbr(expandAbbrInput);
            if (expandedText) {
                insertPromises.push(editor.insertSnippet(new vscode.SnippetString(expandedText), expandAbbrInput.rangeToReplace));
            }
        });
        if (insertPromises.length === 0) {
            return Promise.resolve(false);
        }
        return Promise.all(insertPromises).then(() => Promise.resolve(true));
    }
    // Snippet to replace at all cursors are the same
    // We can pass all ranges to `editor.insertSnippet` in a single call so that
    // all cursors are maintained after snippet insertion
    const anyExpandAbbrInput = expandAbbrList[0];
    let expandedText = expandAbbr(anyExpandAbbrInput);
    let allRanges = expandAbbrList.map(value => {
        return new vscode.Range(value.rangeToReplace.start.line, value.rangeToReplace.start.character, value.rangeToReplace.end.line, value.rangeToReplace.end.character);
    });
    if (expandedText) {
        return editor.insertSnippet(new vscode.SnippetString(expandedText), allRanges);
    }
    return Promise.resolve(false);
}
/**
 * Expands abbreviation as detailed in given input.
 */
function expandAbbr(input) {
    const expandOptions = vscode_emmet_helper_1.getExpandOptions(input.syntax, util_1.getEmmetConfiguration(input.syntax), input.filter);
    if (input.textToWrap) {
        if (input.filter && input.filter.indexOf('t') > -1) {
            input.textToWrap = input.textToWrap.map(line => {
                return line.replace(trimRegex, '').trim();
            });
        }
        expandOptions['text'] = input.textToWrap;
        // Below fixes https://github.com/Microsoft/vscode/issues/29898
        // With this, Emmet formats inline elements as block elements
        // ensuring the wrapped multi line text does not get merged to a single line
        if (!input.rangeToReplace.isSingleLine) {
            expandOptions.profile['inlineBreak'] = 1;
        }
    }
    try {
        // Expand the abbreviation
        let expandedText = vscode_emmet_helper_1.expandAbbreviation(input.abbreviation, expandOptions);
        if (input.textToWrap) {
            // All $anyword would have been escaped by the emmet helper.
            // Remove the escaping backslash from $TM_SELECTED_TEXT so that VS Code Snippet controller can treat it as a variable
            expandedText = expandedText.replace('\\$TM_SELECTED_TEXT', '$TM_SELECTED_TEXT');
            // If the expanded text is single line then we dont need the \t and \n we added to $TM_SELECTED_TEXT earlier
            if (input.textToWrap.length === 1 && expandedText.indexOf('\n') === -1) {
                expandedText = expandedText.replace(/\s*\$TM_SELECTED_TEXT\s*/, '$TM_SELECTED_TEXT');
            }
        }
        return expandedText;
    } catch (e) {
        vscode.window.showErrorMessage('Failed to expand abbreviation');
    }
}
function getSyntaxFromArgs(args) {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No editor is active.');
        return;
    }
    const mappedModes = util_1.getMappingForIncludedLanguages();
    let language = !args || typeof args !== 'object' || !args['language'] ? editor.document.languageId : args['language'];
    let parentMode = args && typeof args === 'object' ? args['parentMode'] : undefined;
    let excludedLanguages = vscode.workspace.getConfiguration('emmet')['excludeLanguages'] ? vscode.workspace.getConfiguration('emmet')['excludeLanguages'] : [];
    let syntax = vscode_emmet_helper_1.getEmmetMode(mappedModes[language] ? mappedModes[language] : language, excludedLanguages);
    if (!syntax) {
        syntax = vscode_emmet_helper_1.getEmmetMode(mappedModes[parentMode] ? mappedModes[parentMode] : parentMode, excludedLanguages);
    }
    return syntax;
}
//# sourceMappingURL=abbreviationActions.js.map

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * A streaming, character code-based string reader
 */
class StreamReader {
	constructor(string, start, end) {
		if (end == null && typeof string === 'string') {
			end = string.length;
		}

		this.string = string;
		this.pos = this.start = start || 0;
		this.end = end;
	}

	/**
  * Returns true only if the stream is at the end of the file.
  * @returns {Boolean}
  */
	eof() {
		return this.pos >= this.end;
	}

	/**
  * Creates a new stream instance which is limited to given `start` and `end`
  * range. E.g. its `eof()` method will look at `end` property, not actual
  * stream end
  * @param  {Point} start
  * @param  {Point} end
  * @return {StreamReader}
  */
	limit(start, end) {
		return new this.constructor(this.string, start, end);
	}

	/**
  * Returns the next character code in the stream without advancing it.
  * Will return NaN at the end of the file.
  * @returns {Number}
  */
	peek() {
		return this.string.charCodeAt(this.pos);
	}

	/**
  * Returns the next character in the stream and advances it.
  * Also returns <code>undefined</code> when no more characters are available.
  * @returns {Number}
  */
	next() {
		if (this.pos < this.string.length) {
			return this.string.charCodeAt(this.pos++);
		}
	}

	/**
  * `match` can be a character code or a function that takes a character code
  * and returns a boolean. If the next character in the stream 'matches'
  * the given argument, it is consumed and returned.
  * Otherwise, `false` is returned.
  * @param {Number|Function} match
  * @returns {Boolean}
  */
	eat(match) {
		const ch = this.peek();
		const ok = typeof match === 'function' ? match(ch) : ch === match;

		if (ok) {
			this.next();
		}

		return ok;
	}

	/**
  * Repeatedly calls <code>eat</code> with the given argument, until it
  * fails. Returns <code>true</code> if any characters were eaten.
  * @param {Object} match
  * @returns {Boolean}
  */
	eatWhile(match) {
		const start = this.pos;
		while (!this.eof() && this.eat(match)) {}
		return this.pos !== start;
	}

	/**
  * Backs up the stream n characters. Backing it up further than the
  * start of the current token will cause things to break, so be careful.
  * @param {Number} n
  */
	backUp(n) {
		this.pos -= n || 1;
	}

	/**
  * Get the string between the start of the current token and the
  * current stream position.
  * @returns {String}
  */
	current() {
		return this.substring(this.start, this.pos);
	}

	/**
  * Returns substring for given range
  * @param  {Number} start
  * @param  {Number} [end]
  * @return {String}
  */
	substring(start, end) {
		return this.string.slice(start, end);
	}

	/**
  * Creates error object with current stream state
  * @param {String} message
  * @return {Error}
  */
	error(message) {
		const err = new Error(`${message} at char ${this.pos + 1}`);
		err.originalMessage = message;
		err.pos = this.pos;
		err.string = this.string;
		return err;
	}
}

exports.default = StreamReader;
module.exports = exports['default'];

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * Methods for consuming quoted values
 */

const SINGLE_QUOTE = 39; // '
const DOUBLE_QUOTE = 34; // "

const defaultOptions = {
	escape: 92, // \ character
	throws: false
};

/**
 * Consumes 'single' or "double"-quoted string from given string, if possible
 * @param  {StreamReader} stream
 * @param  {Number}  options.escape A character code of quote-escape symbol
 * @param  {Boolean} options.throws Throw error if quotes string can’t be properly consumed
 * @return {Boolean} `true` if quoted string was consumed. The contents
 *                   of quoted string will be availabe as `stream.current()`
 */
var eatQuoted = function (stream, options) {
	options = options ? Object.assign({}, defaultOptions, options) : defaultOptions;
	const start = stream.pos;
	const quote = stream.peek();

	if (stream.eat(isQuote)) {
		while (!stream.eof()) {
			switch (stream.next()) {
				case quote:
					stream.start = start;
					return true;

				case options.escape:
					stream.next();
					break;
			}
		}

		// If we’re here then stream wasn’t properly consumed.
		// Revert stream and decide what to do
		stream.pos = start;

		if (options.throws) {
			throw stream.error('Unable to consume quoted string');
		}
	}

	return false;
};

function isQuote(code) {
	return code === SINGLE_QUOTE || code === DOUBLE_QUOTE;
}

/**
 * Check if given code is a number
 * @param  {Number}  code
 * @return {Boolean}
 */
function isNumber(code) {
	return code > 47 && code < 58;
}

/**
 * Check if given character code is alpha code (letter through A to Z)
 * @param  {Number}  code
 * @param  {Number}  [from]
 * @param  {Number}  [to]
 * @return {Boolean}
 */
function isAlpha(code, from, to) {
	from = from || 65; // A
	to = to || 90; // Z
	code &= ~32; // quick hack to convert any char code to uppercase char code

	return code >= from && code <= to;
}

/**
 * Check if given character code is alpha-numeric (letter through A to Z or number)
 * @param  {Number}  code
 * @return {Boolean}
 */
function isAlphaNumeric(code) {
	return isNumber(code) || isAlpha(code);
}

function isWhiteSpace(code) {
	return code === 32 /* space */
	|| code === 9 /* tab */
	|| code === 160; /* non-breaking space */
}

/**
 * Check if given character code is a space
 * @param  {Number}  code
 * @return {Boolean}
 */
function isSpace(code) {
	return isWhiteSpace(code) || code === 10 /* LF */
	|| code === 13; /* CR */
}

const defaultOptions$1 = {
	escape: 92, // \ character
	throws: false
};

/**
 * Eats paired characters substring, for example `(foo)` or `[bar]`
 * @param  {StreamReader} stream
 * @param  {Number} open      Character code of pair openinig
 * @param  {Number} close     Character code of pair closing
 * @param  {Object} [options]
 * @return {Boolean}       Returns `true` if chacarter pair was successfully
 *                         consumed, it’s content will be available as `stream.current()`
 */
function eatPair(stream, open, close, options) {
	options = options ? Object.assign({}, defaultOptions$1, options) : defaultOptions$1;
	const start = stream.pos;

	if (stream.eat(open)) {
		let stack = 1,
		    ch;

		while (!stream.eof()) {
			if (eatQuoted(stream, options)) {
				continue;
			}

			ch = stream.next();
			if (ch === open) {
				stack++;
			} else if (ch === close) {
				stack--;
				if (!stack) {
					stream.start = start;
					return true;
				}
			} else if (ch === options.escape) {
				stream.next();
			}
		}

		// If we’re here then paired character can’t be consumed
		stream.pos = start;

		if (options.throws) {
			throw stream.error(`Unable to find matching pair for ${String.fromCharCode(open)}`);
		}
	}

	return false;
}

exports.eatQuoted = eatQuoted;
exports.isQuote = isQuote;
exports.isAlpha = isAlpha;
exports.isNumber = isNumber;
exports.isAlphaNumeric = isAlphaNumeric;
exports.isSpace = isSpace;
exports.isWhiteSpace = isWhiteSpace;
exports.eatPair = eatPair;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = ['bmp', 'gif', 'jpg', 'png', 'psd', 'svg', 'tiff', 'webp', 'dds'];

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./bmp": 12,
	"./bmp.js": 12,
	"./dds": 13,
	"./dds.js": 13,
	"./gif": 14,
	"./gif.js": 14,
	"./jpg": 15,
	"./jpg.js": 15,
	"./png": 16,
	"./png.js": 16,
	"./psd": 17,
	"./psd.js": 17,
	"./svg": 18,
	"./svg.js": 18,
	"./tiff": 19,
	"./tiff.js": 19,
	"./webp": 20,
	"./webp.js": 20
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 11;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function isBMP(buffer) {
  return 'BM' === buffer.toString('ascii', 0, 2);
}

function calculate(buffer) {
  return {
    'width': buffer.readUInt32LE(18),
    'height': Math.abs(buffer.readInt32LE(22))
  };
}

module.exports = {
  'detect': isBMP,
  'calculate': calculate
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function isDDS(buffer) {
	return buffer.readUInt32LE(0) === 0x20534444;
}

function calculate(buffer) {
	// read file resolution metadata
	return {
		'height': buffer.readUInt32LE(12),
		'width': buffer.readUInt32LE(16)
	};
}

module.exports = {
	'detect': isDDS,
	'calculate': calculate
};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var gifRegexp = /^GIF8[79]a/;
function isGIF(buffer) {
  var signature = buffer.toString('ascii', 0, 6);
  return gifRegexp.test(signature);
}

function calculate(buffer) {
  return {
    'width': buffer.readUInt16LE(6),
    'height': buffer.readUInt16LE(8)
  };
}

module.exports = {
  'detect': isGIF,
  'calculate': calculate
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// NOTE: we only support baseline and progressive JPGs here
// due to the structure of the loader class, we only get a buffer
// with a maximum size of 4096 bytes. so if the SOF marker is outside
// if this range we can't detect the file size correctly.

function isJPG(buffer) {
  //, filepath
  var SOIMarker = buffer.toString('hex', 0, 2);
  return 'ffd8' === SOIMarker;
}

function extractSize(buffer, i) {
  return {
    'height': buffer.readUInt16BE(i),
    'width': buffer.readUInt16BE(i + 2)
  };
}

function validateBuffer(buffer, i) {
  // index should be within buffer limits
  if (i > buffer.length) {
    throw new TypeError('Corrupt JPG, exceeded buffer limits');
  }
  // Every JPEG block must begin with a 0xFF
  if (buffer[i] !== 0xFF) {
    throw new TypeError('Invalid JPG, marker table corrupted');
  }
}

function calculate(buffer) {

  // Skip 4 chars, they are for signature
  buffer = buffer.slice(4);

  var i, next;
  while (buffer.length) {
    // read length of the next block
    i = buffer.readUInt16BE(0);

    // ensure correct format
    validateBuffer(buffer, i);

    // 0xFFC0 is baseline standard(SOF)
    // 0xFFC1 is baseline optimized(SOF)
    // 0xFFC2 is progressive(SOF2)
    next = buffer[i + 1];
    if (next === 0xC0 || next === 0xC1 || next === 0xC2) {
      return extractSize(buffer, i + 5);
    }

    // move to the next block
    buffer = buffer.slice(i + 2);
  }

  throw new TypeError('Invalid JPG, no size found');
}

module.exports = {
  'detect': isJPG,
  'calculate': calculate
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var pngSignature = 'PNG\r\n\x1a\n';
var pngImageHeaderChunkName = 'IHDR';
var pngFriedChunkName = 'CgBI'; // Used to detect "fried" png's: http://www.jongware.com/pngdefry.html

function isPNG(buffer) {
  if (pngSignature === buffer.toString('ascii', 1, 8)) {
    var chunkName = buffer.toString('ascii', 12, 16);
    if (chunkName === pngFriedChunkName) {
      chunkName = buffer.toString('ascii', 28, 32);
    }
    if (chunkName !== pngImageHeaderChunkName) {
      throw new TypeError('invalid png');
    }
    return true;
  }
}

function calculate(buffer) {
  if (buffer.toString('ascii', 12, 16) === pngFriedChunkName) {
    return {
      'width': buffer.readUInt32BE(32),
      'height': buffer.readUInt32BE(36)
    };
  }
  return {
    'width': buffer.readUInt32BE(16),
    'height': buffer.readUInt32BE(20)
  };
}

module.exports = {
  'detect': isPNG,
  'calculate': calculate
};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function isPSD(buffer) {
  return '8BPS' === buffer.toString('ascii', 0, 4);
}

function calculate(buffer) {
  return {
    'width': buffer.readUInt32BE(18),
    'height': buffer.readUInt32BE(14)
  };
}

module.exports = {
  'detect': isPSD,
  'calculate': calculate
};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var svgReg = /<svg[^>]+[^>]*>/;
function isSVG(buffer) {
  return svgReg.test(buffer);
}

var extractorRegExps = {
  'root': /<svg\s[^>]+>/,
  'width': /\bwidth=(['"])([^%]+?)\1/,
  'height': /\bheight=(['"])([^%]+?)\1/,
  'viewbox': /\bviewBox=(['"])(.+?)\1/
};

function parseViewbox(viewbox) {
  var bounds = viewbox.split(' ');
  return {
    'width': parseInt(bounds[2], 10),
    'height': parseInt(bounds[3], 10)
  };
}

function parseAttributes(root) {
  var width = root.match(extractorRegExps.width);
  var height = root.match(extractorRegExps.height);
  var viewbox = root.match(extractorRegExps.viewbox);
  return {
    'width': width && parseInt(width[2], 10),
    'height': height && parseInt(height[2], 10),
    'viewbox': viewbox && parseViewbox(viewbox[2])
  };
}

function calculateByDimensions(attrs) {
  return {
    'width': attrs.width,
    'height': attrs.height
  };
}

function calculateByViewbox(attrs) {
  var ratio = attrs.viewbox.width / attrs.viewbox.height;
  if (attrs.width) {
    return {
      'width': attrs.width,
      'height': Math.floor(attrs.width / ratio)
    };
  }
  if (attrs.height) {
    return {
      'width': Math.floor(attrs.height * ratio),
      'height': attrs.height
    };
  }
  return {
    'width': attrs.viewbox.width,
    'height': attrs.viewbox.height
  };
}

function calculate(buffer) {
  var root = buffer.toString('utf8').match(extractorRegExps.root);
  if (root) {
    var attrs = parseAttributes(root[0]);
    if (attrs.width && attrs.height) {
      return calculateByDimensions(attrs);
    }
    if (attrs.viewbox) {
      return calculateByViewbox(attrs);
    }
  }
  throw new TypeError('invalid svg');
}

module.exports = {
  'detect': isSVG,
  'calculate': calculate
};

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// based on http://www.compix.com/fileformattif.htm
// TO-DO: support big-endian as well

var fs = __webpack_require__(6);
var readUInt = __webpack_require__(47);

function isTIFF(buffer) {
  var hex4 = buffer.toString('hex', 0, 4);
  return '49492a00' === hex4 || '4d4d002a' === hex4;
}

// Read IFD (image-file-directory) into a buffer
function readIFD(buffer, filepath, isBigEndian) {

  var ifdOffset = readUInt(buffer, 32, 4, isBigEndian);

  // read only till the end of the file
  var bufferSize = 1024;
  var fileSize = fs.statSync(filepath).size;
  if (ifdOffset + bufferSize > fileSize) {
    bufferSize = fileSize - ifdOffset - 10;
  }

  // populate the buffer
  var endBuffer = new Buffer(bufferSize);
  var descriptor = fs.openSync(filepath, 'r');
  fs.readSync(descriptor, endBuffer, 0, bufferSize, ifdOffset);

  // var ifdLength = readUInt(endBuffer, 16, 0, isBigEndian);
  var ifdBuffer = endBuffer.slice(2); //, 2 + 12 * ifdLength);
  return ifdBuffer;
}

// TIFF values seem to be messed up on Big-Endian, this helps
function readValue(buffer, isBigEndian) {
  var low = readUInt(buffer, 16, 8, isBigEndian);
  var high = readUInt(buffer, 16, 10, isBigEndian);
  return (high << 16) + low;
}

// move to the next tag
function nextTag(buffer) {
  if (buffer.length > 24) {
    return buffer.slice(12);
  }
}

// Extract IFD tags from TIFF metadata
function extractTags(buffer, isBigEndian) {
  var tags = {};
  var code, type, length;

  while (buffer && buffer.length) {
    code = readUInt(buffer, 16, 0, isBigEndian);
    type = readUInt(buffer, 16, 2, isBigEndian);
    length = readUInt(buffer, 32, 4, isBigEndian);

    // 0 means end of IFD
    if (code === 0) {
      break;
    } else {
      // 256 is width, 257 is height
      // if (code === 256 || code === 257) {
      if (length === 1 && (type === 3 || type === 4)) {
        tags[code] = readValue(buffer, isBigEndian);
      }

      // move to the next tag
      buffer = nextTag(buffer);
    }
  }
  return tags;
}

// Test if the TIFF is Big Endian or Little Endian
function determineEndianness(buffer) {
  var signature = buffer.toString('ascii', 0, 2);
  if ('II' === signature) {
    return 'LE';
  } else if ('MM' === signature) {
    return 'BE';
  }
}

function calculate(buffer, filepath) {

  if (!filepath) {
    throw new TypeError('Tiff doesn\'t support buffer');
  }

  // Determine BE/LE
  var isBigEndian = determineEndianness(buffer) === 'BE';

  // read the IFD
  var ifdBuffer = readIFD(buffer, filepath, isBigEndian);

  // extract the tags from the IFD
  var tags = extractTags(ifdBuffer, isBigEndian);

  var width = tags[256];
  var height = tags[257];

  if (!width || !height) {
    throw new TypeError('Invalid Tiff, missing tags');
  }

  return {
    'width': width,
    'height': height
  };
}

module.exports = {
  'detect': isTIFF,
  'calculate': calculate
};

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// based on https://developers.google.com/speed/webp/docs/riff_container

function isWebP(buffer) {
  var riffHeader = 'RIFF' === buffer.toString('ascii', 0, 4);
  var webpHeader = 'WEBP' === buffer.toString('ascii', 8, 12);
  var vp8Header = 'VP8' === buffer.toString('ascii', 12, 15);
  return riffHeader && webpHeader && vp8Header;
}

function calculate(buffer) {
  var chunkHeader = buffer.toString('ascii', 12, 16);
  buffer = buffer.slice(20, 30);

  // Extended webp stream signature
  if (chunkHeader === 'VP8X') {
    var extendedHeader = buffer[0];
    var validStart = (extendedHeader & 0xc0) === 0;
    var validEnd = (extendedHeader & 0x01) === 0;
    if (validStart && validEnd) {
      return calculateExtended(buffer);
    } else {
      return false;
    }
  }

  // Lossless webp stream signature
  if (chunkHeader === 'VP8 ' && buffer[0] !== 0x2f) {
    return calculateLossy(buffer);
  }

  // Lossy webp stream signature
  var signature = buffer.toString('hex', 3, 6);
  if (chunkHeader === 'VP8L' && signature !== '9d012a') {
    return calculateLossless(buffer);
  }

  return false;
}

function calculateExtended(buffer) {
  return {
    'width': 1 + buffer.readUIntLE(4, 3),
    'height': 1 + buffer.readUIntLE(7, 3)
  };
}

function calculateLossless(buffer) {
  return {
    'width': 1 + ((buffer[2] & 0x3F) << 8 | buffer[1]),
    'height': 1 + ((buffer[4] & 0xF) << 10 | buffer[3] << 2 | (buffer[2] & 0xC0) >> 6)
  };
}

function calculateLossy(buffer) {
  // `& 0x3fff` returns the last 14 bits
  // TO-DO: include webp scaling in the calculations
  return {
    'width': buffer.readInt16LE(6) & 0x3fff,
    'height': buffer.readInt16LE(8) & 0x3fff
  };
}

module.exports = {
  'detect': isWebP,
  'calculate': calculate
};

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(0);
const defaultCompletionProvider_1 = __webpack_require__(22);
const abbreviationActions_1 = __webpack_require__(7);
const removeTag_1 = __webpack_require__(26);
const updateTag_1 = __webpack_require__(27);
const matchTag_1 = __webpack_require__(28);
const balance_1 = __webpack_require__(29);
const splitJoinTag_1 = __webpack_require__(30);
const mergeLines_1 = __webpack_require__(31);
const toggleComment_1 = __webpack_require__(32);
const editPoint_1 = __webpack_require__(33);
const selectItem_1 = __webpack_require__(34);
const evaluateMathExpression_1 = __webpack_require__(37);
const incrementDecrement_1 = __webpack_require__(39);
const util_1 = __webpack_require__(1);
const vscode_emmet_helper_1 = __webpack_require__(2);
const updateImageSize_1 = __webpack_require__(40);
const reflectCssValue_1 = __webpack_require__(49);
const path = __webpack_require__(3);
function activate(context) {
    registerCompletionProviders(context);
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.wrapWithAbbreviation', args => {
        abbreviationActions_1.wrapWithAbbreviation(args);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.wrapIndividualLinesWithAbbreviation', args => {
        abbreviationActions_1.wrapIndividualLinesWithAbbreviation(args);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('emmet.expandAbbreviation', args => {
        abbreviationActions_1.expandEmmetAbbreviation(args);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.removeTag', () => {
        return removeTag_1.removeTag();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.updateTag', inputTag => {
        if (inputTag && typeof inputTag === 'string') {
            return updateTag_1.updateTag(inputTag);
        }
        return vscode.window.showInputBox({ prompt: 'Enter Tag' }).then(tagName => {
            return updateTag_1.updateTag(tagName);
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.matchTag', () => {
        matchTag_1.matchTag();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.balanceOut', () => {
        balance_1.balanceOut();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.balanceIn', () => {
        balance_1.balanceIn();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.splitJoinTag', () => {
        return splitJoinTag_1.splitJoinTag();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.mergeLines', () => {
        mergeLines_1.mergeLines();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.toggleComment', () => {
        toggleComment_1.toggleComment();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.nextEditPoint', () => {
        editPoint_1.fetchEditPoint('next');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.prevEditPoint', () => {
        editPoint_1.fetchEditPoint('prev');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.selectNextItem', () => {
        selectItem_1.fetchSelectItem('next');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.selectPrevItem', () => {
        selectItem_1.fetchSelectItem('prev');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.evaluateMathExpression', () => {
        evaluateMathExpression_1.evaluateMathExpression();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.incrementNumberByOneTenth', () => {
        return incrementDecrement_1.incrementDecrement(.1);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.incrementNumberByOne', () => {
        return incrementDecrement_1.incrementDecrement(1);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.incrementNumberByTen', () => {
        return incrementDecrement_1.incrementDecrement(10);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.decrementNumberByOneTenth', () => {
        return incrementDecrement_1.incrementDecrement(-0.1);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.decrementNumberByOne', () => {
        return incrementDecrement_1.incrementDecrement(-1);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.decrementNumberByTen', () => {
        return incrementDecrement_1.incrementDecrement(-10);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.updateImageSize', () => {
        return updateImageSize_1.updateImageSize();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('editor.emmet.action.reflectCSSValue', () => {
        return reflectCssValue_1.reflectCssValue();
    }));
    let currentExtensionsPath = undefined;
    let resolveUpdateExtensionsPath = () => {
        let extensionsPath = vscode.workspace.getConfiguration('emmet')['extensionsPath'];
        if (extensionsPath && !path.isAbsolute(extensionsPath)) {
            extensionsPath = path.join(vscode.workspace.rootPath, extensionsPath);
        }
        if (currentExtensionsPath !== extensionsPath) {
            currentExtensionsPath = extensionsPath;
            vscode_emmet_helper_1.updateExtensionsPath(currentExtensionsPath).then(null, err => vscode.window.showErrorMessage(err));
        }
    };
    resolveUpdateExtensionsPath();
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => {
        registerCompletionProviders(context);
        resolveUpdateExtensionsPath();
    }));
}
exports.activate = activate;
/**
 * Holds any registered completion providers by their language strings
 */
const languageMappingForCompletionProviders = new Map();
const completionProvidersMapping = new Map();
function registerCompletionProviders(context) {
    let completionProvider = new defaultCompletionProvider_1.DefaultCompletionItemProvider();
    let includedLanguages = util_1.getMappingForIncludedLanguages();
    Object.keys(includedLanguages).forEach(language => {
        if (languageMappingForCompletionProviders.has(language) && languageMappingForCompletionProviders.get(language) === includedLanguages[language]) {
            return;
        }
        if (languageMappingForCompletionProviders.has(language)) {
            completionProvidersMapping.get(language).dispose();
            languageMappingForCompletionProviders.delete(language);
            completionProvidersMapping.delete(language);
        }
        const provider = vscode.languages.registerCompletionItemProvider(language, completionProvider, ...util_1.LANGUAGE_MODES[includedLanguages[language]]);
        context.subscriptions.push(provider);
        languageMappingForCompletionProviders.set(language, includedLanguages[language]);
        completionProvidersMapping.set(language, provider);
    });
    Object.keys(util_1.LANGUAGE_MODES).forEach(language => {
        if (!languageMappingForCompletionProviders.has(language)) {
            const provider = vscode.languages.registerCompletionItemProvider(language, completionProvider, ...util_1.LANGUAGE_MODES[language]);
            context.subscriptions.push(provider);
            languageMappingForCompletionProviders.set(language, language);
            completionProvidersMapping.set(language, provider);
        }
    });
}
function deactivate() {}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(0);
const vscode_emmet_helper_1 = __webpack_require__(2);
const abbreviationActions_1 = __webpack_require__(7);
const util_1 = __webpack_require__(1);
const allowedMimeTypesInScriptTag = ['text/html', 'text/plain', 'text/x-template'];
class DefaultCompletionItemProvider {
    provideCompletionItems(document, position, token) {
        const mappedLanguages = util_1.getMappingForIncludedLanguages();
        const emmetConfig = vscode.workspace.getConfiguration('emmet');
        let isSyntaxMapped = mappedLanguages[document.languageId] ? true : false;
        let excludedLanguages = emmetConfig['excludeLanguages'] ? emmetConfig['excludeLanguages'] : [];
        let syntax = vscode_emmet_helper_1.getEmmetMode(isSyntaxMapped ? mappedLanguages[document.languageId] : document.languageId, excludedLanguages);
        if (document.languageId === 'html' || vscode_emmet_helper_1.isStyleSheet(document.languageId)) {
            // Document can be html/css parsed
            // Use syntaxHelper to parse file, validate location and update sytnax if needed
            syntax = this.syntaxHelper(syntax, document, position);
        }
        /*
        if (!syntax
            || ((isSyntaxMapped || syntax === 'jsx')
                && emmetConfig['showExpandedAbbreviation'] !== 'always')) {
            return;
        }
        */
        let noiseCheckPromise = Promise.resolve();
        // Fix for https://github.com/Microsoft/vscode/issues/32647
        // Check for document symbols in js/ts/jsx/tsx and avoid triggering emmet for abbreviations of the form symbolName.sometext
        // Presence of > or * or + in the abbreviation denotes valid abbreviation that should trigger emmet
        if (!vscode_emmet_helper_1.isStyleSheet(syntax) && (document.languageId === 'javascript' || document.languageId === 'javascriptreact' || document.languageId === 'typescript' || document.languageId === 'typescriptreact')) {
            let extractAbbreviationResults = vscode_emmet_helper_1.extractAbbreviation(document, position);
            if (extractAbbreviationResults) {
                let abbreviation = extractAbbreviationResults.abbreviation;
                if (abbreviation.startsWith('this.')) {
                    noiseCheckPromise = Promise.resolve(true);
                } else {
                    /*
                    noiseCheckPromise = vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri).then((symbols: vscode.SymbolInformation[]) => {
                        return symbols.find(x => abbreviation === x.name || (abbreviation.startsWith(x.name + '.') && !/>|\*|\+/.test(abbreviation)));
                    });
                    */
                }
            }
        }
        return noiseCheckPromise.then(noise => {
            if (noise) {
                return;
            }
            let result = vscode_emmet_helper_1.doComplete(document, position, syntax, util_1.getEmmetConfiguration(syntax));
            let newItems = [];
            if (result && result.items) {
                result.items.forEach(item => {
                    let newItem = new vscode.CompletionItem(item.label);
                    newItem.documentation = item.documentation;
                    newItem.detail = item.detail;
                    newItem.insertText = new vscode.SnippetString(item.textEdit.newText);
                    let oldrange = item.textEdit.range;
                    newItem.range = new vscode.Range(oldrange.start.line, oldrange.start.character, oldrange.end.line, oldrange.end.character);
                    newItem.filterText = item.filterText;
                    newItem.sortText = item.sortText;
                    if (emmetConfig['showSuggestionsAsSnippets'] === true) {
                        newItem.kind = vscode.CompletionItemKind.Snippet;
                    }
                    newItems.push(newItem);
                });
            }
            return Promise.resolve(new vscode.CompletionList(newItems, true));
        });
    }
    /**
     * Parses given document to check whether given position is valid for emmet abbreviation and returns appropriate syntax
     * @param syntax string language mode of current document
     * @param document vscode.Textdocument
     * @param position vscode.Position position of the abbreviation that needs to be expanded
     */
    syntaxHelper(syntax, document, position) {
        if (!syntax) {
            return syntax;
        }
        let rootNode = util_1.parseDocument(document, false);
        if (!rootNode) {
            return;
        }
        let currentNode = util_1.getNode(rootNode, position, true);
        if (!vscode_emmet_helper_1.isStyleSheet(syntax)) {
            const currentHtmlNode = currentNode;
            if (currentHtmlNode && currentHtmlNode.close && util_1.getInnerRange(currentHtmlNode).contains(position)) {
                if (currentHtmlNode.name === 'style') {
                    return 'css';
                }
                if (currentHtmlNode.name === 'script') {
                    if (currentHtmlNode.attributes && currentHtmlNode.attributes.some(x => x.name.toString() === 'type' && allowedMimeTypesInScriptTag.indexOf(x.value.toString()) > -1)) {
                        return syntax;
                    }
                    return;
                }
            }
        }
        if (!abbreviationActions_1.isValidLocationForEmmetAbbreviation(currentNode, syntax, position)) {
            return;
        }
        return syntax;
    }
}
exports.DefaultCompletionItemProvider = DefaultCompletionItemProvider;
//# sourceMappingURL=defaultCompletionProvider.js.map

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.match = exports.defaultOptions = undefined;

var _streamReader = __webpack_require__(8);

var _streamReader2 = _interopRequireDefault(_streamReader);

var _streamReaderUtils = __webpack_require__(9);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Node {
	constructor(stream, type, open, close) {
		this.stream = stream;
		this.type = type;
		this.open = open;
		this.close = close;

		this.children = [];
		this.parent = null;
	}

	/**
  * Returns node name
  * @return {String}
  */
	get name() {
		if (this.type === 'tag' && this.open) {
			return this.open && this.open.name && this.open.name.value;
		}

		return '#' + this.type;
	}

	/**
  * Returns attributes of current node
  * @return {Array}
  */
	get attributes() {
		return this.open && this.open.attributes;
	}

	/**
  * Returns node’s start position in stream
  * @return {*}
  */
	get start() {
		return this.open && this.open.start;
	}

	/**
  * Returns node’s start position in stream
  * @return {*}
  */
	get end() {
		return this.close ? this.close.end : this.open && this.open.end;
	}

	get firstChild() {
		return this.children[0];
	}

	get nextSibling() {
		const ix = this.getIndex();
		return ix !== -1 ? this.parent.children[ix + 1] : null;
	}

	get previousSibling() {
		const ix = this.getIndex();
		return ix !== -1 ? this.parent.children[ix - 1] : null;
	}

	/**
  * Returns current element’s index in parent list of child nodes
  * @return {Number}
  */
	getIndex() {
		return this.parent ? this.parent.children.indexOf(this) : -1;
	}

	/**
  * Adds given node as a child
  * @param {Node} node
  * @return {Node} Current node
  */
	addChild(node) {
		this.removeChild(node);
		this.children.push(node);
		node.parent = this;
		return this;
	}

	/**
  * Removes given node from current node’s child list
  * @param  {Node} node
  * @return {Node} Current node
  */
	removeChild(node) {
		const ix = this.children.indexOf(node);
		if (ix !== -1) {
			this.children.splice(ix, 1);
			node.parent = null;
		}

		return this;
	}
}

/**
 * A token factory method
 * @param  {StreamReader}   stream
 * @param  {Point|Function} start  Tokens’ start location or stream consumer
 * @param  {Point}          [end]  Tokens’ end location
 * @return {Token}
 */
var token = function (stream, start, end) {
	return typeof start === 'function' ? eatToken(stream, start) : new Token(stream, start, end);
};

/**
 * Consumes characters from given stream that matches `fn` call and returns it
 * as token, if consumed
 * @param  {StreamReader} stream
 * @param  {Function} test
 * @return {Token}
 */
function eatToken(stream, test) {
	const start = stream.pos;
	if (stream.eatWhile(test)) {
		return new Token(stream, start, stream.pos);
	}

	stream.pos = start;
}

/**
 * A structure describing text fragment in content stream
 */
class Token {
	/**
  * @param {ContentStreamReader} stream
  * @param {Point} start         Tokens’ start location in content stream
  * @param {Point} end           Tokens’ end location in content stream
  */
	constructor(stream, start, end) {
		this.stream = stream;
		this.start = start != null ? start : stream.start;
		this.end = end != null ? end : stream.pos;
		this._value = null;
	}

	/**
  * Returns token textual value
  * NB implemented as getter to reduce unnecessary memory allocations for
  * strings that not required
  * @return {String}
  */
	get value() {
		if (this._value === null) {
			const start = this.stream.start;
			const end = this.stream.pos;

			this.stream.start = this.start;
			this.stream.pos = this.end;
			this._value = this.stream.current();

			this.stream.start = start;
			this.stream.pos = end;
		}

		return this._value;
	}

	toString() {
		return this.value;
	}

	valueOf() {
		return `${this.value} [${this.start}; ${this.end}]`;
	}
}

const LANGLE = 60;
const RANGLE = 62; // < and >
const LSQUARE = 91;
const RSQUARE = 93; // [ and ]
const LROUND = 40;
const RROUND = 41; // ( and )
const LCURLY = 123;
const RCURLY = 125; // { and }

const opt = { throws: true };

/**
 * Consumes paired tokens (like `[` and `]`) with respect of nesting and embedded
 * quoted values
 * @param  {StreamReader} stream
 * @return {Token} A token with consumed paired character
 */
var eatPaired = function (stream) {
	const start = stream.pos;
	const consumed = (0, _streamReaderUtils.eatPair)(stream, LANGLE, RANGLE, opt) || (0, _streamReaderUtils.eatPair)(stream, LSQUARE, RSQUARE, opt) || (0, _streamReaderUtils.eatPair)(stream, LROUND, RROUND, opt) || (0, _streamReaderUtils.eatPair)(stream, LCURLY, RCURLY, opt);

	if (consumed) {
		return token(stream, start);
	}
};

const SLASH$1 = 47; // /
const EQUALS = 61; // =
const RIGHT_ANGLE$1 = 62; // >

/**
 * Consumes attributes from given stream
 * @param {StreamReader} stream
 * @return {Array} Array of consumed attributes
 */
var eatAttributes = function (stream) {
	const result = [];
	let name, value, attr;

	while (!stream.eof()) {
		stream.eatWhile(_streamReaderUtils.isSpace);
		attr = { start: stream.pos };

		// A name could be a regular name or expression:
		// React-style – <div {...props}>
		// Angular-style – <div [ng-for]>
		if (attr.name = eatAttributeName(stream)) {
			// Consumed attribute name. Can be an attribute with name
			// or boolean attribute. The value can be React-like expression
			if (stream.eat(EQUALS)) {
				attr.value = eatAttributeValue(stream);
			} else {
				attr.boolean = true;
			}
			attr.end = stream.pos;
			result.push(attr);
		} else if (isTerminator(stream.peek())) {
			// look for tag terminator in order to skip any other possible characters
			// (maybe junk)
			break;
		} else {
			stream.next();
		}
	}

	return result;
};

/**
 * Consumes attribute name from current location
 * @param  {StreamReader} stream
 * @return {Token}
 */
function eatAttributeName(stream) {
	return eatPaired(stream) || token(stream, isAttributeName);
}

/**
 * Consumes attribute value from given location
 * @param  {StreamReader} stream
 * @return {Token}
 */
function eatAttributeValue(stream) {
	const start = stream.pos;
	if ((0, _streamReaderUtils.eatQuoted)(stream)) {
		// Should return token that points to unquoted value.
		// Use stream readers’ public API to traverse instead of direct
		// manipulation
		const current = stream.pos;
		let valueStart, valueEnd;

		stream.pos = start;
		stream.next();
		valueStart = stream.start = stream.pos;

		stream.pos = current;
		stream.backUp(1);
		valueEnd = stream.pos;

		const result = token(stream, valueStart, valueEnd);
		stream.pos = current;
		return result;
	}

	return eatPaired(stream) || eatUnquoted(stream);
}

/**
 * Check if given code belongs to attribute name.
 * NB some custom HTML variations allow non-default values in name, like `*ngFor`
 * @param  {Number}  code
 * @return {Boolean}
 */
function isAttributeName(code) {
	return code !== EQUALS && !isTerminator(code) && !(0, _streamReaderUtils.isSpace)(code);
}

/**
 * Check if given code is tag terminator
 * @param  {Number}  code
 * @return {Boolean}
 */
function isTerminator(code) {
	return code === RIGHT_ANGLE$1 || code === SLASH$1;
}

/**
 * Eats unquoted value from stream
 * @param  {StreamReader} stream
 * @return {Token}
 */
function eatUnquoted(stream) {
	return token(stream, isUnquoted);
}

/**
 * Check if given character code is valid unquoted value
 * @param  {Number}  code
 * @return {Boolean}
 */
function isUnquoted(code) {
	return !isNaN(code) && !(0, _streamReaderUtils.isQuote)(code) && !(0, _streamReaderUtils.isSpace)(code) && !isTerminator(code);
}

const DASH = 45; // -
const DOT = 46; // .
const SLASH = 47; // /
const COLON = 58; // :
const LEFT_ANGLE = 60; // <
const RIGHT_ANGLE = 62; // >
const UNDERSCORE = 95; // _

/**
 * Parses tag definition (open or close tag) from given stream state
 * @param {StreamReader} stream Content stream reader
 * @return {Object}
 */
var tag = function (stream) {
	const start = stream.pos;

	if (stream.eat(LEFT_ANGLE)) {
		const model = { type: stream.eat(SLASH) ? 'close' : 'open' };

		if (model.name = eatTagName(stream)) {
			if (model.type !== 'close') {
				model.attributes = eatAttributes(stream);
				stream.eatWhile(_streamReaderUtils.isSpace);
				model.selfClosing = stream.eat(SLASH);
			}

			if (stream.eat(RIGHT_ANGLE)) {
				// tag properly closed
				return Object.assign(token(stream, start), model);
			}
		}
	}

	// invalid tag, revert to original position
	stream.pos = start;
	return null;
};

/**
 * Eats HTML identifier (tag or attribute name) from given stream
 * @param  {StreamReader} stream
 * @return {Token}
 */
function eatTagName(stream) {
	return token(stream, isTagName);
}

/**
 * Check if given character code can be used as HTML/XML tag name
 * @param  {Number}  code
 * @return {Boolean}
 */
function isTagName(code) {
	return (0, _streamReaderUtils.isAlphaNumeric)(code) || code === COLON // colon is used for namespaces
	|| code === DOT // in rare cases declarative tag names may have dots in names
	|| code === DASH || code === UNDERSCORE;
}

/**
 * Eats array of character codes from given stream
 * @param  {StreamReader} stream
 * @param  {Number[]} codes  Array of character codes
 * @return {Boolean}
 */
function eatArray(stream, codes) {
	const start = stream.pos;

	for (let i = 0; i < codes.length; i++) {
		if (!stream.eat(codes[i])) {
			stream.pos = start;
			return false;
		}
	}

	stream.start = start;
	return true;
}

/**
 * Consumes section from given string which starts with `open` character codes
 * and ends with `close` character codes
 * @param  {StreamReader} stream
 * @param  {Number[]} open
 * @param  {Number[]} close
 * @return {Boolean}  Returns `true` if section was consumed
 */
function eatSection(stream, open, close, allowUnclosed) {
	const start = stream.pos;
	if (eatArray(stream, open)) {
		// consumed `<!--`, read next until we find ending part or reach the end of input
		while (!stream.eof()) {
			if (eatArray(stream, close)) {
				return true;
			}

			stream.next();
		}

		// unclosed section is allowed
		if (allowUnclosed) {
			return true;
		}

		stream.pos = start;
		return false;
	}

	// unable to find section, revert to initial position
	stream.pos = start;
	return null;
}

/**
 * Converts given string into array of character codes
 * @param  {String} str
 * @return {Number[]}
 */
function toCharCodes(str) {
	return str.split('').map(ch => ch.charCodeAt(0));
}

const open = toCharCodes('<!--');
const close = toCharCodes('-->');

/**
 * Consumes HTML comment from given stream
 * @param  {StreamReader} stream
 * @return {Token}
 */
var comment = function (stream) {
	const start = stream.pos;
	if (eatSection(stream, open, close, true)) {
		const result = token(stream, start);
		result.type = 'comment';
		return result;
	}

	return null;
};

const open$1 = toCharCodes('<![CDATA[');
const close$1 = toCharCodes(']]>');

/**
 * Consumes CDATA from given stream
 * @param  {StreamReader} stream
 * @return {Token}
 */
var cdata = function (stream) {
	const start = stream.pos;
	if (eatSection(stream, open$1, close$1, true)) {
		const result = token(stream, start);
		result.type = 'cdata';
		return result;
	}

	return null;
};

const defaultOptions = {
	/**
  * Expect XML content in searching content. It alters how should-be-empty
  * elements are treated: for example, in XML mode parser will try to locate
  * closing pair for `<br>` tag
  * @type {Boolean}
  */
	xml: false,

	special: ['script', 'style'],

	/**
  * List of elements that should be treated as empty (e.g. without closing tag)
  * in non-XML syntax
  * @type {Array}
  */
	empty: ['img', 'meta', 'link', 'br', 'base', 'hr', 'area', 'wbr']
};

/**
 * Parses given content into a DOM-like structure
 * @param  {String|StreamReader} content
 * @param  {Object} options
 * @return {Node}
 */
function parse(content, options) {
	options = Object.assign({}, defaultOptions, options);
	const stream = typeof content === 'string' ? new _streamReader2.default(content) : content;

	const root = new Node(stream, 'root');
	const empty = new Set(options.empty);
	const special = options.special.reduce((map, name) => map.set(name, toCharCodes(`</${name}>`)), new Map());
	const isEmpty = (token, name) => token.selfClosing || !options.xml && empty.has(name);

	let m,
	    node,
	    name,
	    stack = [root];

	while (!stream.eof()) {
		if (m = match(stream)) {
			name = getName(m);

			if (m.type === 'open') {
				// opening tag
				node = new Node(stream, 'tag', m);
				last(stack).addChild(node);
				if (special.has(name)) {
					node.close = consumeSpecial(stream, special.get(name));
				} else if (!isEmpty(m, name)) {
					stack.push(node);
				}
			} else if (m.type === 'close') {
				// closing tag, find it’s matching opening tag
				for (let i = stack.length - 1; i > 0; i--) {
					if (stack[i].name.toLowerCase() === name) {
						stack[i].close = m;
						stack = stack.slice(0, i);
						break;
					}
				}
			} else {
				last(stack).addChild(new Node(stream, m.type, m));
			}
		} else {
			stream.next();
		}
	}

	return root;
}

/**
 * Matches known token in current state of given stream
 * @param  {ContentStreamReader} stream
 * @return {Token}
 */
function match(stream) {
	// fast-path optimization: check for `<` code
	if (stream.peek() === 60 /* < */) {
			return comment(stream) || cdata(stream) || tag(stream);
		}
}

/**
 * @param  {StreamReader} stream
 * @param  {Number[]} codes
 * @return {Token}
 */
function consumeSpecial(stream, codes) {
	const start = stream.pos;
	let m;

	while (!stream.eof()) {
		if (eatArray(stream, codes)) {
			stream.pos = stream.start;
			return tag(stream);
		}
		stream.next();
	}

	stream.pos = start;
	return null;
}

/**
 * Returns name of given matched token
 * @param  {Token} tag
 * @return {String}
 */
function getName(tag$$1) {
	return tag$$1.name ? tag$$1.name.value.toLowerCase() : `#${tag$$1.type}`;
}

function last(arr) {
	return arr[arr.length - 1];
}

exports.defaultOptions = defaultOptions;
exports.match = match;
exports.default = parse;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * A streaming, character code-based string reader
 */
class StreamReader {
	constructor(string, start, end) {
		if (end == null && typeof string === 'string') {
			end = string.length;
		}

		this.string = string;
		this.pos = this.start = start || 0;
		this.end = end;
	}

	/**
  * Returns true only if the stream is at the end of the file.
  * @returns {Boolean}
  */
	eof() {
		return this.pos >= this.end;
	}

	/**
  * Creates a new stream instance which is limited to given `start` and `end`
  * range. E.g. its `eof()` method will look at `end` property, not actual
  * stream end
  * @param  {Point} start
  * @param  {Point} end
  * @return {StreamReader}
  */
	limit(start, end) {
		return new this.constructor(this.string, start, end);
	}

	/**
  * Returns the next character code in the stream without advancing it.
  * Will return NaN at the end of the file.
  * @returns {Number}
  */
	peek() {
		return this.string.charCodeAt(this.pos);
	}

	/**
  * Returns the next character in the stream and advances it.
  * Also returns <code>undefined</code> when no more characters are available.
  * @returns {Number}
  */
	next() {
		if (this.pos < this.string.length) {
			return this.string.charCodeAt(this.pos++);
		}
	}

	/**
  * `match` can be a character code or a function that takes a character code
  * and returns a boolean. If the next character in the stream 'matches'
  * the given argument, it is consumed and returned.
  * Otherwise, `false` is returned.
  * @param {Number|Function} match
  * @returns {Boolean}
  */
	eat(match) {
		const ch = this.peek();
		const ok = typeof match === 'function' ? match(ch) : ch === match;

		if (ok) {
			this.next();
		}

		return ok;
	}

	/**
  * Repeatedly calls <code>eat</code> with the given argument, until it
  * fails. Returns <code>true</code> if any characters were eaten.
  * @param {Object} match
  * @returns {Boolean}
  */
	eatWhile(match) {
		const start = this.pos;
		while (!this.eof() && this.eat(match)) {}
		return this.pos !== start;
	}

	/**
  * Backs up the stream n characters. Backing it up further than the
  * start of the current token will cause things to break, so be careful.
  * @param {Number} n
  */
	backUp(n) {
		this.pos -= n || 1;
	}

	/**
  * Get the string between the start of the current token and the
  * current stream position.
  * @returns {String}
  */
	current() {
		return this.substring(this.start, this.pos);
	}

	/**
  * Returns substring for given range
  * @param  {Number} start
  * @param  {Number} [end]
  * @return {String}
  */
	substring(start, end) {
		return this.string.slice(start, end);
	}

	/**
  * Creates error object with current stream state
  * @param {String} message
  * @return {Error}
  */
	error(message) {
		const err = new Error(`${message} at char ${this.pos + 1}`);
		err.originalMessage = message;
		err.pos = this.pos;
		err.string = this.string;
		return err;
	}
}

exports.default = StreamReader;
module.exports = exports['default'];

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * Methods for consuming quoted values
 */

const SINGLE_QUOTE = 39; // '
const DOUBLE_QUOTE = 34; // "

const defaultOptions = {
	escape: 92, // \ character
	throws: false
};

/**
 * Consumes 'single' or "double"-quoted string from given string, if possible
 * @param  {StreamReader} stream
 * @param  {Number}  options.escape A character code of quote-escape symbol
 * @param  {Boolean} options.throws Throw error if quotes string can’t be properly consumed
 * @return {Boolean} `true` if quoted string was consumed. The contents
 *                   of quoted string will be availabe as `stream.current()`
 */
var eatQuoted = function (stream, options) {
	options = options ? Object.assign({}, defaultOptions, options) : defaultOptions;
	const start = stream.pos;
	const quote = stream.peek();

	if (stream.eat(isQuote)) {
		while (!stream.eof()) {
			switch (stream.next()) {
				case quote:
					stream.start = start;
					return true;

				case options.escape:
					stream.next();
					break;
			}
		}

		// If we’re here then stream wasn’t properly consumed.
		// Revert stream and decide what to do
		stream.pos = start;

		if (options.throws) {
			throw stream.error('Unable to consume quoted string');
		}
	}

	return false;
};

function isQuote(code) {
	return code === SINGLE_QUOTE || code === DOUBLE_QUOTE;
}

/**
 * Check if given code is a number
 * @param  {Number}  code
 * @return {Boolean}
 */
function isNumber(code) {
	return code > 47 && code < 58;
}

/**
 * Check if given character code is alpha code (letter through A to Z)
 * @param  {Number}  code
 * @param  {Number}  [from]
 * @param  {Number}  [to]
 * @return {Boolean}
 */
function isAlpha(code, from, to) {
	from = from || 65; // A
	to = to || 90; // Z
	code &= ~32; // quick hack to convert any char code to uppercase char code

	return code >= from && code <= to;
}

/**
 * Check if given character code is alpha-numeric (letter through A to Z or number)
 * @param  {Number}  code
 * @return {Boolean}
 */
function isAlphaNumeric(code) {
	return isNumber(code) || isAlpha(code);
}

function isWhiteSpace(code) {
	return code === 32 /* space */
	|| code === 9 /* tab */
	|| code === 160; /* non-breaking space */
}

/**
 * Check if given character code is a space
 * @param  {Number}  code
 * @return {Boolean}
 */
function isSpace(code) {
	return isWhiteSpace(code) || code === 10 /* LF */
	|| code === 13; /* CR */
}

const defaultOptions$1 = {
	escape: 92, // \ character
	throws: false
};

/**
 * Eats paired characters substring, for example `(foo)` or `[bar]`
 * @param  {StreamReader} stream
 * @param  {Number} open      Character code of pair openinig
 * @param  {Number} close     Character code of pair closing
 * @param  {Object} [options]
 * @return {Boolean}       Returns `true` if chacarter pair was successfully
 *                         consumed, it’s content will be available as `stream.current()`
 */
function eatPair(stream, open, close, options) {
	options = options ? Object.assign({}, defaultOptions$1, options) : defaultOptions$1;
	const start = stream.pos;

	if (stream.eat(open)) {
		let stack = 1,
		    ch;

		while (!stream.eof()) {
			if (eatQuoted(stream, options)) {
				continue;
			}

			ch = stream.next();
			if (ch === open) {
				stack++;
			} else if (ch === close) {
				stack--;
				if (!stack) {
					stream.start = start;
					return true;
				}
			} else if (ch === options.escape) {
				stream.next();
			}
		}

		// If we’re here then paired character can’t be consumed
		stream.pos = start;

		if (options.throws) {
			throw stream.error(`Unable to find matching pair for ${String.fromCharCode(open)}`);
		}
	}

	return false;
}

exports.eatQuoted = eatQuoted;
exports.isQuote = isQuote;
exports.isAlpha = isAlpha;
exports.isNumber = isNumber;
exports.isAlphaNumeric = isAlphaNumeric;
exports.isSpace = isSpace;
exports.isWhiteSpace = isWhiteSpace;
exports.eatPair = eatPair;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(0);
const util_1 = __webpack_require__(1);
function removeTag() {
    let editor = vscode.window.activeTextEditor;
    if (!util_1.validate(false)) {
        return;
    }
    let rootNode = util_1.parseDocument(editor.document);
    if (!rootNode) {
        return;
    }
    let indentInSpaces = '';
    for (let i = 0; i < editor.options.tabSize; i++) {
        indentInSpaces += ' ';
    }
    let rangesToRemove = [];
    editor.selections.reverse().forEach(selection => {
        rangesToRemove = rangesToRemove.concat(getRangeToRemove(editor, rootNode, selection, indentInSpaces));
    });
    return editor.edit(editBuilder => {
        rangesToRemove.forEach(range => {
            editBuilder.replace(range, '');
        });
    });
}
exports.removeTag = removeTag;
function getRangeToRemove(editor, rootNode, selection, indentInSpaces) {
    let nodeToUpdate = util_1.getNode(rootNode, selection.start);
    if (!nodeToUpdate) {
        return [];
    }
    let openRange = new vscode.Range(nodeToUpdate.open.start, nodeToUpdate.open.end);
    let closeRange = null;
    if (nodeToUpdate.close) {
        closeRange = new vscode.Range(nodeToUpdate.close.start, nodeToUpdate.close.end);
    }
    let ranges = [openRange];
    if (closeRange) {
        for (let i = openRange.start.line + 1; i <= closeRange.start.line; i++) {
            let lineContent = editor.document.lineAt(i).text;
            if (lineContent.startsWith('\t')) {
                ranges.push(new vscode.Range(i, 0, i, 1));
            } else if (lineContent.startsWith(indentInSpaces)) {
                ranges.push(new vscode.Range(i, 0, i, indentInSpaces.length));
            }
        }
        ranges.push(closeRange);
    }
    return ranges;
}
//# sourceMappingURL=removeTag.js.map

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(0);
const util_1 = __webpack_require__(1);
function updateTag(tagName) {
    let editor = vscode.window.activeTextEditor;
    if (!util_1.validate(false)) {
        return;
    }
    let rootNode = util_1.parseDocument(editor.document);
    if (!rootNode) {
        return;
    }
    let rangesToUpdate = [];
    editor.selections.reverse().forEach(selection => {
        rangesToUpdate = rangesToUpdate.concat(getRangesToUpdate(editor, selection, rootNode));
    });
    return editor.edit(editBuilder => {
        rangesToUpdate.forEach(range => {
            editBuilder.replace(range, tagName);
        });
    });
}
exports.updateTag = updateTag;
function getRangesToUpdate(editor, selection, rootNode) {
    let nodeToUpdate = util_1.getNode(rootNode, selection.start);
    if (!nodeToUpdate) {
        return [];
    }
    let openStart = nodeToUpdate.open.start.translate(0, 1);
    let openEnd = openStart.translate(0, nodeToUpdate.name.length);
    let ranges = [new vscode.Range(openStart, openEnd)];
    if (nodeToUpdate.close) {
        let closeStart = nodeToUpdate.close.start.translate(0, 2);
        let closeEnd = nodeToUpdate.close.end.translate(0, -1);
        ranges.push(new vscode.Range(closeStart, closeEnd));
    }
    return ranges;
}
//# sourceMappingURL=updateTag.js.map

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(0);
const util_1 = __webpack_require__(1);
function matchTag() {
    let editor = vscode.window.activeTextEditor;
    if (!util_1.validate(false)) {
        return;
    }
    let rootNode = util_1.parseDocument(editor.document);
    if (!rootNode) {
        return;
    }
    let updatedSelections = [];
    editor.selections.forEach(selection => {
        let updatedSelection = getUpdatedSelections(editor, selection.start, rootNode);
        if (updatedSelection) {
            updatedSelections.push(updatedSelection);
        }
    });
    if (updatedSelections.length > 0) {
        editor.selections = updatedSelections;
        editor.revealRange(editor.selections[updatedSelections.length - 1]);
    }
}
exports.matchTag = matchTag;
function getUpdatedSelections(editor, position, rootNode) {
    let currentNode = util_1.getNode(rootNode, position, true);
    if (!currentNode) {
        return;
    }
    // If no closing tag or cursor is between open and close tag, then no-op
    if (!currentNode.close || position.isAfter(currentNode.open.end) && position.isBefore(currentNode.close.start)) {
        return;
    }
    // Place cursor inside the close tag if cursor is inside the open tag, else place it inside the open tag
    let finalPosition = position.isBeforeOrEqual(currentNode.open.end) ? currentNode.close.start.translate(0, 2) : currentNode.open.start.translate(0, 1);
    return new vscode.Selection(finalPosition, finalPosition);
}
//# sourceMappingURL=matchTag.js.map

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(0);
const util_1 = __webpack_require__(1);
function balanceOut() {
    balance(true);
}
exports.balanceOut = balanceOut;
function balanceIn() {
    balance(false);
}
exports.balanceIn = balanceIn;
function balance(out) {
    let editor = vscode.window.activeTextEditor;
    if (!util_1.validate(false)) {
        return;
    }
    let rootNode = util_1.parseDocument(editor.document);
    if (!rootNode) {
        return;
    }
    let getRangeFunction = out ? getRangeToBalanceOut : getRangeToBalanceIn;
    let newSelections = [];
    editor.selections.forEach(selection => {
        let range = getRangeFunction(editor.document, selection, rootNode);
        newSelections.push(range ? range : selection);
    });
    editor.selection = newSelections[0];
    editor.selections = newSelections;
}
function getRangeToBalanceOut(document, selection, rootNode) {
    let nodeToBalance = util_1.getNode(rootNode, selection.start);
    if (!nodeToBalance) {
        return;
    }
    if (!nodeToBalance.close) {
        return new vscode.Selection(nodeToBalance.start, nodeToBalance.end);
    }
    let innerSelection = new vscode.Selection(nodeToBalance.open.end, nodeToBalance.close.start);
    let outerSelection = new vscode.Selection(nodeToBalance.start, nodeToBalance.end);
    if (innerSelection.contains(selection) && !innerSelection.isEqual(selection)) {
        return innerSelection;
    }
    if (outerSelection.contains(selection) && !outerSelection.isEqual(selection)) {
        return outerSelection;
    }
    return;
}
function getRangeToBalanceIn(document, selection, rootNode) {
    let nodeToBalance = util_1.getNode(rootNode, selection.start, true);
    if (!nodeToBalance) {
        return;
    }
    if (selection.start.isEqual(nodeToBalance.start) && selection.end.isEqual(nodeToBalance.end) && nodeToBalance.close) {
        return new vscode.Selection(nodeToBalance.open.end, nodeToBalance.close.start);
    }
    if (!nodeToBalance.firstChild) {
        return;
    }
    if (selection.start.isEqual(nodeToBalance.firstChild.start) && selection.end.isEqual(nodeToBalance.firstChild.end) && nodeToBalance.firstChild.close) {
        return new vscode.Selection(nodeToBalance.firstChild.open.end, nodeToBalance.firstChild.close.start);
    }
    return new vscode.Selection(nodeToBalance.firstChild.start, nodeToBalance.firstChild.end);
}
//# sourceMappingURL=balance.js.map

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(0);
const util_1 = __webpack_require__(1);
function splitJoinTag() {
    let editor = vscode.window.activeTextEditor;
    if (!util_1.validate(false)) {
        return;
    }
    let rootNode = util_1.parseDocument(editor.document);
    if (!rootNode) {
        return;
    }
    return editor.edit(editBuilder => {
        editor.selections.reverse().forEach(selection => {
            let textEdit = getRangesToReplace(editor.document, selection, rootNode);
            if (textEdit) {
                editBuilder.replace(textEdit.range, textEdit.newText);
            }
        });
    });
}
exports.splitJoinTag = splitJoinTag;
function getRangesToReplace(document, selection, rootNode) {
    let nodeToUpdate = util_1.getNode(rootNode, selection.start);
    let rangeToReplace;
    let textToReplaceWith;
    if (!nodeToUpdate) {
        return;
    }
    if (!nodeToUpdate.close) {
        // Split Tag
        let nodeText = document.getText(new vscode.Range(nodeToUpdate.start, nodeToUpdate.end));
        let m = nodeText.match(/(\s*\/)?>$/);
        let end = nodeToUpdate.end;
        let start = m ? end.translate(0, -m[0].length) : end;
        rangeToReplace = new vscode.Range(start, end);
        textToReplaceWith = `></${nodeToUpdate.name}>`;
    } else {
        // Join Tag
        let start = nodeToUpdate.open.end.translate(0, -1);
        let end = nodeToUpdate.end;
        rangeToReplace = new vscode.Range(start, end);
        textToReplaceWith = '/>';
    }
    return new vscode.TextEdit(rangeToReplace, textToReplaceWith);
}
//# sourceMappingURL=splitJoinTag.js.map

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(0);
const util_1 = __webpack_require__(1);
function mergeLines() {
    let editor = vscode.window.activeTextEditor;
    if (!util_1.validate(false)) {
        return;
    }
    let rootNode = util_1.parseDocument(editor.document);
    if (!rootNode) {
        return;
    }
    return editor.edit(editBuilder => {
        editor.selections.reverse().forEach(selection => {
            let textEdit = getRangesToReplace(editor.document, selection, rootNode);
            if (textEdit) {
                editBuilder.replace(textEdit.range, textEdit.newText);
            }
        });
    });
}
exports.mergeLines = mergeLines;
function getRangesToReplace(document, selection, rootNode) {
    let startNodeToUpdate;
    let endNodeToUpdate;
    if (selection.isEmpty) {
        startNodeToUpdate = endNodeToUpdate = util_1.getNode(rootNode, selection.start);
    } else {
        startNodeToUpdate = util_1.getNode(rootNode, selection.start, true);
        endNodeToUpdate = util_1.getNode(rootNode, selection.end, true);
    }
    if (!startNodeToUpdate || !endNodeToUpdate || startNodeToUpdate.start.line === endNodeToUpdate.end.line) {
        return;
    }
    let rangeToReplace = new vscode.Range(startNodeToUpdate.start, endNodeToUpdate.end);
    let textToReplaceWith = document.lineAt(startNodeToUpdate.start.line).text.substr(startNodeToUpdate.start.character);
    for (let i = startNodeToUpdate.start.line + 1; i <= endNodeToUpdate.end.line; i++) {
        textToReplaceWith += document.lineAt(i).text.trim();
    }
    return new vscode.TextEdit(rangeToReplace, textToReplaceWith);
}
//# sourceMappingURL=mergeLines.js.map

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(0);
const util_1 = __webpack_require__(1);
const vscode_emmet_helper_1 = __webpack_require__(2);
const css_parser_1 = __webpack_require__(5);
const bufferStream_1 = __webpack_require__(4);
const startCommentStylesheet = '/*';
const endCommentStylesheet = '*/';
const startCommentHTML = '<!--';
const endCommentHTML = '-->';
function toggleComment() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No editor is active');
        return;
    }
    let toggleCommentInternal;
    if (vscode_emmet_helper_1.isStyleSheet(editor.document.languageId)) {
        toggleCommentInternal = toggleCommentStylesheet;
    } else {
        toggleCommentInternal = toggleCommentHTML;
    }
    let rootNode = util_1.parseDocument(editor.document);
    if (!rootNode) {
        return;
    }
    return editor.edit(editBuilder => {
        editor.selections.reverse().forEach(selection => {
            let edits = toggleCommentInternal(editor.document, selection, rootNode);
            edits.forEach(x => {
                editBuilder.replace(x.range, x.newText);
            });
        });
    });
}
exports.toggleComment = toggleComment;
function toggleCommentHTML(document, selection, rootNode) {
    const selectionStart = selection.isReversed ? selection.active : selection.anchor;
    const selectionEnd = selection.isReversed ? selection.anchor : selection.active;
    let startNode = util_1.getNode(rootNode, selectionStart, true);
    let endNode = util_1.getNode(rootNode, selectionEnd, true);
    if (!startNode || !endNode) {
        return [];
    }
    if (util_1.sameNodes(startNode, endNode) && startNode.name === 'style' && startNode.open.end.isBefore(selectionStart) && startNode.close.start.isAfter(selectionEnd)) {
        let buffer = new bufferStream_1.DocumentStreamReader(document, startNode.open.end, new vscode.Range(startNode.open.end, startNode.close.start));
        let cssRootNode = css_parser_1.default(buffer);
        return toggleCommentStylesheet(document, selection, cssRootNode);
    }
    let allNodes = util_1.getNodesInBetween(startNode, endNode);
    let edits = [];
    allNodes.forEach(node => {
        edits = edits.concat(getRangesToUnCommentHTML(node, document));
    });
    if (startNode.type === 'comment') {
        return edits;
    }
    edits.push(new vscode.TextEdit(new vscode.Range(allNodes[0].start, allNodes[0].start), startCommentHTML));
    edits.push(new vscode.TextEdit(new vscode.Range(allNodes[allNodes.length - 1].end, allNodes[allNodes.length - 1].end), endCommentHTML));
    return edits;
}
function getRangesToUnCommentHTML(node, document) {
    let unCommentTextEdits = [];
    // If current node is commented, then uncomment and return
    if (node.type === 'comment') {
        unCommentTextEdits.push(new vscode.TextEdit(new vscode.Range(node.start, node.start.translate(0, startCommentHTML.length)), ''));
        unCommentTextEdits.push(new vscode.TextEdit(new vscode.Range(node.end.translate(0, -endCommentHTML.length), node.end), ''));
        return unCommentTextEdits;
    }
    // All children of current node should be uncommented
    node.children.forEach(childNode => {
        unCommentTextEdits = unCommentTextEdits.concat(getRangesToUnCommentHTML(childNode, document));
    });
    return unCommentTextEdits;
}
function toggleCommentStylesheet(document, selection, rootNode) {
    let selectionStart = selection.isReversed ? selection.active : selection.anchor;
    let selectionEnd = selection.isReversed ? selection.anchor : selection.active;
    let startNode = util_1.getNode(rootNode, selectionStart, true);
    let endNode = util_1.getNode(rootNode, selectionEnd, true);
    if (!selection.isEmpty || startNode) {
        selectionStart = selection.isEmpty ? startNode.start : adjustStartNodeCss(startNode, selectionStart, rootNode);
        selectionEnd = selection.isEmpty ? startNode.end : adjustEndNodeCss(endNode, selectionEnd, rootNode);
        selection = new vscode.Selection(selectionStart, selectionEnd);
    }
    // Uncomment the comments that intersect with the selection.
    let rangesToUnComment = [];
    let edits = [];
    rootNode.comments.forEach(comment => {
        let commentRange = new vscode.Range(comment.start, comment.end);
        if (selection.intersection(commentRange)) {
            rangesToUnComment.push(commentRange);
            edits.push(new vscode.TextEdit(new vscode.Range(comment.start, comment.start.translate(0, startCommentStylesheet.length)), ''));
            edits.push(new vscode.TextEdit(new vscode.Range(comment.end.translate(0, -endCommentStylesheet.length), comment.end), ''));
        }
    });
    if (edits.length > 0) {
        return edits;
    }
    return [new vscode.TextEdit(new vscode.Range(selection.start, selection.start), startCommentStylesheet), new vscode.TextEdit(new vscode.Range(selection.end, selection.end), endCommentStylesheet)];
}
function adjustStartNodeCss(node, pos, rootNode) {
    for (let i = 0; i < rootNode.comments.length; i++) {
        let commentRange = new vscode.Range(rootNode.comments[i].start, rootNode.comments[i].end);
        if (commentRange.contains(pos)) {
            return pos;
        }
    }
    if (!node) {
        return pos;
    }
    if (node.type === 'property') {
        return node.start;
    }
    const rule = node;
    if (pos.isBefore(rule.contentStartToken.end) || !rule.firstChild) {
        return rule.start;
    }
    if (pos.isBefore(rule.firstChild.start)) {
        return pos;
    }
    let newStartNode = rule.firstChild;
    while (newStartNode.nextSibling && pos.isAfter(newStartNode.end)) {
        newStartNode = newStartNode.nextSibling;
    }
    return newStartNode.start;
}
function adjustEndNodeCss(node, pos, rootNode) {
    for (let i = 0; i < rootNode.comments.length; i++) {
        let commentRange = new vscode.Range(rootNode.comments[i].start, rootNode.comments[i].end);
        if (commentRange.contains(pos)) {
            return pos;
        }
    }
    if (!node) {
        return pos;
    }
    if (node.type === 'property') {
        return node.end;
    }
    const rule = node;
    if (pos.isEqual(rule.contentEndToken.end) || !rule.firstChild) {
        return rule.end;
    }
    if (pos.isAfter(rule.children[rule.children.length - 1].end)) {
        return pos;
    }
    let newEndNode = rule.children[rule.children.length - 1];
    while (newEndNode.previousSibling && pos.isBefore(newEndNode.start)) {
        newEndNode = newEndNode.previousSibling;
    }
    return newEndNode.end;
}
//# sourceMappingURL=toggleComment.js.map

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(0);
const util_1 = __webpack_require__(1);
function fetchEditPoint(direction) {
    let editor = vscode.window.activeTextEditor;
    if (!util_1.validate()) {
        return;
    }
    let newSelections = [];
    editor.selections.forEach(selection => {
        let updatedSelection = direction === 'next' ? nextEditPoint(selection.anchor, editor) : prevEditPoint(selection.anchor, editor);
        newSelections.push(updatedSelection ? updatedSelection : selection);
    });
    editor.selections = newSelections;
    editor.revealRange(editor.selections[editor.selections.length - 1]);
}
exports.fetchEditPoint = fetchEditPoint;
function nextEditPoint(position, editor) {
    for (let lineNum = position.line; lineNum < editor.document.lineCount; lineNum++) {
        let updatedSelection = findEditPoint(lineNum, editor, position, 'next');
        if (updatedSelection) {
            return updatedSelection;
        }
    }
}
function prevEditPoint(position, editor) {
    for (let lineNum = position.line; lineNum >= 0; lineNum--) {
        let updatedSelection = findEditPoint(lineNum, editor, position, 'prev');
        if (updatedSelection) {
            return updatedSelection;
        }
    }
}
function findEditPoint(lineNum, editor, position, direction) {
    let line = editor.document.lineAt(lineNum);
    let lineContent = line.text;
    if (lineNum !== position.line && line.isEmptyOrWhitespace) {
        return new vscode.Selection(lineNum, lineContent.length, lineNum, lineContent.length);
    }
    if (lineNum === position.line && direction === 'prev') {
        lineContent = lineContent.substr(0, position.character);
    }
    let emptyAttrIndex = direction === 'next' ? lineContent.indexOf('""', lineNum === position.line ? position.character : 0) : lineContent.lastIndexOf('""');
    let emptyTagIndex = direction === 'next' ? lineContent.indexOf('><', lineNum === position.line ? position.character : 0) : lineContent.lastIndexOf('><');
    let winner = -1;
    if (emptyAttrIndex > -1 && emptyTagIndex > -1) {
        winner = direction === 'next' ? Math.min(emptyAttrIndex, emptyTagIndex) : Math.max(emptyAttrIndex, emptyTagIndex);
    } else if (emptyAttrIndex > -1) {
        winner = emptyAttrIndex;
    } else {
        winner = emptyTagIndex;
    }
    if (winner > -1) {
        return new vscode.Selection(lineNum, winner + 1, lineNum, winner + 1);
    }
}
//# sourceMappingURL=editPoint.js.map

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(0);
const util_1 = __webpack_require__(1);
const selectItemHTML_1 = __webpack_require__(35);
const selectItemStylesheet_1 = __webpack_require__(36);
const vscode_emmet_helper_1 = __webpack_require__(2);
function fetchSelectItem(direction) {
    let editor = vscode.window.activeTextEditor;
    if (!util_1.validate()) {
        return;
    }
    let nextItem;
    let prevItem;
    if (vscode_emmet_helper_1.isStyleSheet(editor.document.languageId)) {
        nextItem = selectItemStylesheet_1.nextItemStylesheet;
        prevItem = selectItemStylesheet_1.prevItemStylesheet;
    } else {
        nextItem = selectItemHTML_1.nextItemHTML;
        prevItem = selectItemHTML_1.prevItemHTML;
    }
    let rootNode = util_1.parseDocument(editor.document);
    if (!rootNode) {
        return;
    }
    let newSelections = [];
    editor.selections.forEach(selection => {
        const selectionStart = selection.isReversed ? selection.active : selection.anchor;
        const selectionEnd = selection.isReversed ? selection.anchor : selection.active;
        let updatedSelection = direction === 'next' ? nextItem(selectionStart, selectionEnd, editor, rootNode) : prevItem(selectionStart, selectionEnd, editor, rootNode);
        newSelections.push(updatedSelection ? updatedSelection : selection);
    });
    editor.selections = newSelections;
    editor.revealRange(editor.selections[editor.selections.length - 1]);
}
exports.fetchSelectItem = fetchSelectItem;
//# sourceMappingURL=selectItem.js.map

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(0);
const util_1 = __webpack_require__(1);
function nextItemHTML(selectionStart, selectionEnd, editor, rootNode) {
    let currentNode = util_1.getNode(rootNode, selectionEnd);
    let nextNode;
    if (!currentNode) {
        return;
    }
    if (currentNode.type !== 'comment') {
        // If cursor is in the tag name, select tag
        if (selectionEnd.isBefore(currentNode.open.start.translate(0, currentNode.name.length))) {
            return getSelectionFromNode(currentNode, editor.document);
        }
        // If cursor is in the open tag, look for attributes
        if (selectionEnd.isBefore(currentNode.open.end)) {
            let attrSelection = getNextAttribute(selectionStart, selectionEnd, editor.document, currentNode);
            if (attrSelection) {
                return attrSelection;
            }
        }
        // Get the first child of current node which is right after the cursor and is not a comment
        nextNode = currentNode.firstChild;
        while (nextNode && (selectionEnd.isAfterOrEqual(nextNode.start) || nextNode.type === 'comment')) {
            nextNode = nextNode.nextSibling;
        }
    }
    // Get next sibling of current node which is not a comment. If none is found try the same on the parent
    while (!nextNode && currentNode) {
        if (currentNode.nextSibling) {
            if (currentNode.nextSibling.type !== 'comment') {
                nextNode = currentNode.nextSibling;
            } else {
                currentNode = currentNode.nextSibling;
            }
        } else {
            currentNode = currentNode.parent;
        }
    }
    return getSelectionFromNode(nextNode, editor.document);
}
exports.nextItemHTML = nextItemHTML;
function prevItemHTML(selectionStart, selectionEnd, editor, rootNode) {
    let currentNode = util_1.getNode(rootNode, selectionStart);
    let prevNode;
    if (!currentNode) {
        return;
    }
    if (currentNode.type !== 'comment' && selectionStart.translate(0, -1).isAfter(currentNode.open.start)) {
        if (selectionStart.isBefore(currentNode.open.end) || !currentNode.firstChild) {
            prevNode = currentNode;
        } else {
            // Select the child that appears just before the cursor and is not a comment
            prevNode = currentNode.firstChild;
            let oldOption;
            while (prevNode.nextSibling && selectionStart.isAfterOrEqual(prevNode.nextSibling.end)) {
                if (prevNode && prevNode.type !== 'comment') {
                    oldOption = prevNode;
                }
                prevNode = prevNode.nextSibling;
            }
            prevNode = util_1.getDeepestNode(prevNode && prevNode.type !== 'comment' ? prevNode : oldOption);
        }
    }
    // Select previous sibling which is not a comment. If none found, then select parent
    while (!prevNode && currentNode) {
        if (currentNode.previousSibling) {
            if (currentNode.previousSibling.type !== 'comment') {
                prevNode = util_1.getDeepestNode(currentNode.previousSibling);
            } else {
                currentNode = currentNode.previousSibling;
            }
        } else {
            prevNode = currentNode.parent;
        }
    }
    let attrSelection = getPrevAttribute(selectionStart, selectionEnd, editor.document, prevNode);
    return attrSelection ? attrSelection : getSelectionFromNode(prevNode, editor.document);
}
exports.prevItemHTML = prevItemHTML;
function getSelectionFromNode(node, document) {
    if (node && node.open) {
        let selectionStart = node.open.start.translate(0, 1);
        let selectionEnd = selectionStart.translate(0, node.name.length);
        return new vscode.Selection(selectionStart, selectionEnd);
    }
}
function getNextAttribute(selectionStart, selectionEnd, document, node) {
    if (!node.attributes || node.attributes.length === 0 || node.type === 'comment') {
        return;
    }
    for (let i = 0; i < node.attributes.length; i++) {
        let attr = node.attributes[i];
        if (selectionEnd.isBefore(attr.start)) {
            // select full attr
            return new vscode.Selection(attr.start, attr.end);
        }
        if (!attr.value || attr.value.start.isEqual(attr.value.end)) {
            // No attr value to select
            continue;
        }
        if (selectionStart.isEqual(attr.start) && selectionEnd.isEqual(attr.end) || selectionEnd.isBefore(attr.value.start)) {
            // cursor is in attr name,  so select full attr value
            return new vscode.Selection(attr.value.start, attr.value.end);
        }
        // Fetch the next word in the attr value
        if (attr.value.toString().indexOf(' ') === -1) {
            // attr value does not have space, so no next word to find
            continue;
        }
        let pos = undefined;
        if (selectionStart.isEqual(attr.value.start) && selectionEnd.isEqual(attr.value.end)) {
            pos = -1;
        }
        if (pos === undefined && selectionEnd.isBefore(attr.end)) {
            pos = selectionEnd.character - attr.value.start.character - 1;
        }
        if (pos !== undefined) {
            let [newSelectionStartOffset, newSelectionEndOffset] = util_1.findNextWord(attr.value.toString(), pos);
            if (newSelectionStartOffset >= 0 && newSelectionEndOffset >= 0) {
                const newSelectionStart = attr.value.start.translate(0, newSelectionStartOffset);
                const newSelectionEnd = attr.value.start.translate(0, newSelectionEndOffset);
                return new vscode.Selection(newSelectionStart, newSelectionEnd);
            }
        }
    }
}
function getPrevAttribute(selectionStart, selectionEnd, document, node) {
    if (!node.attributes || node.attributes.length === 0 || node.type === 'comment') {
        return;
    }
    for (let i = node.attributes.length - 1; i >= 0; i--) {
        let attr = node.attributes[i];
        if (selectionStart.isBeforeOrEqual(attr.start)) {
            continue;
        }
        if (!attr.value || attr.value.start.isEqual(attr.value.end) || selectionStart.isBefore(attr.value.start)) {
            // select full attr
            return new vscode.Selection(attr.start, attr.end);
        }
        if (selectionStart.isEqual(attr.value.start)) {
            if (selectionEnd.isAfterOrEqual(attr.value.end)) {
                // select full attr
                return new vscode.Selection(attr.start, attr.end);
            }
            // select attr value
            return new vscode.Selection(attr.value.start, attr.value.end);
        }
        // Fetch the prev word in the attr value
        let pos = selectionStart.isAfter(attr.value.end) ? attr.value.toString().length : selectionStart.character - attr.value.start.character;
        let [newSelectionStartOffset, newSelectionEndOffset] = util_1.findPrevWord(attr.value.toString(), pos);
        if (newSelectionStartOffset >= 0 && newSelectionEndOffset >= 0) {
            const newSelectionStart = attr.value.start.translate(0, newSelectionStartOffset);
            const newSelectionEnd = attr.value.start.translate(0, newSelectionEndOffset);
            return new vscode.Selection(newSelectionStart, newSelectionEnd);
        }
    }
}
//# sourceMappingURL=selectItemHTML.js.map

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(0);
const util_1 = __webpack_require__(1);
function nextItemStylesheet(startOffset, endOffset, editor, rootNode) {
    let currentNode = util_1.getNode(rootNode, endOffset, true);
    if (!currentNode) {
        currentNode = rootNode;
    }
    if (!currentNode) {
        return;
    }
    // Full property is selected, so select full property value next
    if (currentNode.type === 'property' && startOffset.isEqual(currentNode.start) && endOffset.isEqual(currentNode.end)) {
        return getSelectionFromProperty(currentNode, editor.document, startOffset, endOffset, true, 'next');
    }
    // Part or whole of propertyValue is selected, so select the next word in the propertyValue
    if (currentNode.type === 'property' && startOffset.isAfterOrEqual(currentNode.valueToken.start) && endOffset.isBeforeOrEqual(currentNode.valueToken.end)) {
        let singlePropertyValue = getSelectionFromProperty(currentNode, editor.document, startOffset, endOffset, false, 'next');
        if (singlePropertyValue) {
            return singlePropertyValue;
        }
    }
    // Cursor is in the selector or in a property
    if (currentNode.type === 'rule' && endOffset.isBefore(currentNode.selectorToken.end) || currentNode.type === 'property' && endOffset.isBefore(currentNode.valueToken.end)) {
        return getSelectionFromNode(currentNode, editor.document);
    }
    // Get the first child of current node which is right after the cursor
    let nextNode = currentNode.firstChild;
    while (nextNode && endOffset.isAfterOrEqual(nextNode.end)) {
        nextNode = nextNode.nextSibling;
    }
    // Get next sibling of current node or the parent
    while (!nextNode && currentNode) {
        nextNode = currentNode.nextSibling;
        currentNode = currentNode.parent;
    }
    return getSelectionFromNode(nextNode, editor.document);
}
exports.nextItemStylesheet = nextItemStylesheet;
function prevItemStylesheet(startOffset, endOffset, editor, rootNode) {
    let currentNode = util_1.getNode(rootNode, startOffset);
    if (!currentNode) {
        currentNode = rootNode;
    }
    if (!currentNode) {
        return;
    }
    // Full property value is selected, so select the whole property next
    if (currentNode.type === 'property' && startOffset.isEqual(currentNode.valueToken.start) && endOffset.isEqual(currentNode.valueToken.end)) {
        return getSelectionFromNode(currentNode, editor.document);
    }
    // Part of propertyValue is selected, so select the prev word in the propertyValue
    if (currentNode.type === 'property' && startOffset.isAfterOrEqual(currentNode.valueToken.start) && endOffset.isBeforeOrEqual(currentNode.valueToken.end)) {
        let singlePropertyValue = getSelectionFromProperty(currentNode, editor.document, startOffset, endOffset, false, 'prev');
        if (singlePropertyValue) {
            return singlePropertyValue;
        }
    }
    if (currentNode.type === 'property' || !currentNode.firstChild || currentNode.type === 'rule' && startOffset.isBeforeOrEqual(currentNode.firstChild.start)) {
        return getSelectionFromNode(currentNode, editor.document);
    }
    // Select the child that appears just before the cursor
    let prevNode = currentNode.firstChild;
    while (prevNode.nextSibling && startOffset.isAfterOrEqual(prevNode.nextSibling.end)) {
        prevNode = prevNode.nextSibling;
    }
    prevNode = util_1.getDeepestNode(prevNode);
    return getSelectionFromProperty(prevNode, editor.document, startOffset, endOffset, false, 'prev');
}
exports.prevItemStylesheet = prevItemStylesheet;
function getSelectionFromNode(node, document) {
    if (!node) {
        return;
    }
    let nodeToSelect = node.type === 'rule' ? node.selectorToken : node;
    return new vscode.Selection(nodeToSelect.start, nodeToSelect.end);
}
function getSelectionFromProperty(node, document, selectionStart, selectionEnd, selectFullValue, direction) {
    if (!node || node.type !== 'property') {
        return;
    }
    const propertyNode = node;
    let propertyValue = propertyNode.valueToken.stream.substring(propertyNode.valueToken.start, propertyNode.valueToken.end);
    selectFullValue = selectFullValue || direction === 'prev' && selectionStart.isEqual(propertyNode.valueToken.start) && selectionEnd.isBefore(propertyNode.valueToken.end);
    if (selectFullValue) {
        return new vscode.Selection(propertyNode.valueToken.start, propertyNode.valueToken.end);
    }
    let pos;
    if (direction === 'prev') {
        if (selectionStart.isEqual(propertyNode.valueToken.start)) {
            return;
        }
        pos = selectionStart.isAfter(propertyNode.valueToken.end) ? propertyValue.length : selectionStart.character - propertyNode.valueToken.start.character;
    }
    if (direction === 'next') {
        if (selectionEnd.isEqual(propertyNode.valueToken.end) && (selectionStart.isAfter(propertyNode.valueToken.start) || propertyValue.indexOf(' ') === -1)) {
            return;
        }
        pos = selectionEnd.isEqual(propertyNode.valueToken.end) ? -1 : selectionEnd.character - propertyNode.valueToken.start.character - 1;
    }
    let [newSelectionStartOffset, newSelectionEndOffset] = direction === 'prev' ? util_1.findPrevWord(propertyValue, pos) : util_1.findNextWord(propertyValue, pos);
    if (!newSelectionStartOffset && !newSelectionEndOffset) {
        return;
    }
    const newSelectionStart = propertyNode.valueToken.start.translate(0, newSelectionStartOffset);
    const newSelectionEnd = propertyNode.valueToken.start.translate(0, newSelectionEndOffset);
    return new vscode.Selection(newSelectionStart, newSelectionEnd);
}
//# sourceMappingURL=selectItemStylesheet.js.map

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
/* Based on @sergeche's work in his emmet plugin */
const vscode = __webpack_require__(0);
const math_expression_1 = __webpack_require__(38);
const bufferStream_1 = __webpack_require__(4);
function evaluateMathExpression() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No editor is active');
        return;
    }
    const stream = new bufferStream_1.DocumentStreamReader(editor.document);
    editor.edit(editBuilder => {
        editor.selections.forEach(selection => {
            const pos = selection.isReversed ? selection.anchor : selection.active;
            stream.pos = pos;
            try {
                const result = String(math_expression_1.default(stream, true));
                editBuilder.replace(new vscode.Range(stream.pos, pos), result);
            } catch (err) {
                vscode.window.showErrorMessage('Could not evaluate expression');
                // Ignore error since most likely it’s because of non-math expression
                console.warn('Math evaluation error', err);
            }
        });
    });
}
exports.evaluateMathExpression = evaluateMathExpression;
//# sourceMappingURL=evaluateMathExpression.js.map

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.parse = undefined;

var _streamReader = __webpack_require__(8);

var _streamReader2 = _interopRequireDefault(_streamReader);

var _streamReaderUtils = __webpack_require__(9);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Fixes StreamReader design flaw: check if stream is at the start-of-file
 * @param  {StreamReader}  stream
 * @return {Boolean}
 */
function isSoF(stream) {
	return stream.sof ? stream.sof() : stream.pos <= 0;
}

const DOT = 46; // .

/**
 * Consumes number from given stream, either in forward or backward direction
 * @param {StreamReader} stream
 * @param {Boolean}      backward Consume number in backward direction
 */
var consumeNumber = function (stream, backward) {
	return backward ? consumeBackward(stream) : consumeForward(stream);
};

/**
 * Consumes number in forward stream direction
 * @param  {StreamReader} stream
 * @return {Boolean}        Returns true if number was consumed
 */
function consumeForward(stream) {
	const start = stream.pos;
	if (stream.eat(DOT) && stream.eatWhile(_streamReaderUtils.isNumber)) {
		// short decimal notation: .025
		return true;
	}

	if (stream.eatWhile(_streamReaderUtils.isNumber) && (!stream.eat(DOT) || stream.eatWhile(_streamReaderUtils.isNumber))) {
		// either integer or decimal: 10, 10.25
		return true;
	}

	stream.pos = start;
	return false;
}

/**
 * Consumes number in backward stream direction
 * @param  {StreamReader} stream
 * @return {Boolean}        Returns true if number was consumed
 */
function consumeBackward(stream) {
	const start = stream.pos;
	let ch,
	    hadDot = false,
	    hadNumber = false;
	// NB a StreamReader insance can be editor-specific and contain objects
	// as a position marker. Since we don’t know for sure how to compare editor
	// position markers, use consumed length instead to detect if number was consumed
	let len = 0;

	while (!isSoF(stream)) {
		stream.backUp(1);
		ch = stream.peek();

		if (ch === DOT && !hadDot && hadNumber) {
			hadDot = true;
		} else if (!(0, _streamReaderUtils.isNumber)(ch)) {
			stream.next();
			break;
		}

		hadNumber = true;
		len++;
	}

	if (len) {
		const pos = stream.pos;
		stream.start = pos;
		stream.pos = start;
		return true;
	}

	stream.pos = start;
	return false;
}

/**
 * Expression parser and tokenizer
 */
// token types
const NUMBER = 'num';
const OP1 = 'op1';
const OP2 = 'op2';

// operators
const PLUS = 43; // +
const MINUS = 45; // -
const MULTIPLY = 42; // *
const DIVIDE = 47; // /
const INT_DIVIDE = 92; // \
const LEFT_PARENTHESIS = 40; // (
const RIGHT_PARENTHESIS = 41; // )

// parser states
const PRIMARY = 1 << 0;
const OPERATOR = 1 << 1;
const LPAREN = 1 << 2;
const RPAREN = 1 << 3;
const SIGN = 1 << 4;
const NULLARY_CALL = 1 << 5;

class Token {
	constructor(type, value, priority) {
		this.type = type;
		this.value = value;
		this.priority = priority || 0;
	}
}

const nullary = new Token(NULLARY_CALL);

function parse(expr, backward) {
	return backward ? parseBackward(expr) : parseForward(expr);
}

/**
 * Parses given expression in forward direction
 * @param  {String|StreamReader} expr
 * @return {Token[]}
 */
function parseForward(expr) {
	const stream = typeof expr === 'object' ? expr : new _streamReader2.default(expr);
	let ch,
	    priority = 0;
	let expected = PRIMARY | LPAREN | SIGN;
	const tokens = [];

	while (!stream.eof()) {
		stream.eatWhile(_streamReaderUtils.isWhiteSpace);
		stream.start = stream.pos;

		if (consumeNumber(stream)) {
			if ((expected & PRIMARY) === 0) {
				error('Unexpected number', stream);
			}

			tokens.push(number(stream.current()));
			expected = OPERATOR | RPAREN;
		} else if (isOperator(stream.peek())) {
			ch = stream.next();
			if (isSign(ch) && expected & SIGN) {
				if (isNegativeSign(ch)) {
					tokens.push(op1(ch, priority));
				}
				expected = PRIMARY | LPAREN | SIGN;
			} else {
				if ((expected & OPERATOR) === 0) {
					error('Unexpected operator', stream);
				}
				tokens.push(op2(ch, priority));
				expected = PRIMARY | LPAREN | SIGN;
			}
		} else if (stream.eat(LEFT_PARENTHESIS)) {
			if ((expected & LPAREN) === 0) {
				error('Unexpected "("', stream);
			}

			priority += 10;
			expected = PRIMARY | LPAREN | SIGN | NULLARY_CALL;
		} else if (stream.eat(RIGHT_PARENTHESIS)) {
			priority -= 10;

			if (expected & NULLARY_CALL) {
				tokens.push(nullary);
			} else if ((expected & RPAREN) === 0) {
				error('Unexpected ")"', stream);
			}

			expected = OPERATOR | RPAREN | LPAREN;
		} else {
			error('Unknown character', stream);
		}
	}

	if (priority < 0 || priority >= 10) {
		error('Unmatched "()"', stream);
	}

	const result = orderTokens(tokens);

	if (result === null) {
		error('Parity', stream);
	}

	return result;
}

/**
 * Parses given exprssion in reverse order, e.g. from back to end, and stops when
 * first unknown character was found
 * @param  {String|StreamReader} expr
 * @return {Array}
 */
function parseBackward(expr) {
	let stream;
	if (typeof expr === 'object') {
		stream = expr;
	} else {
		stream = new _streamReader2.default(expr);
		stream.start = stream.pos = expr.length;
	}

	let ch,
	    priority = 0;
	let expected = PRIMARY | RPAREN;
	const tokens = [];

	while (!isSoF(stream)) {
		if (consumeNumber(stream, true)) {
			if ((expected & PRIMARY) === 0) {
				error('Unexpected number', stream);
			}

			tokens.push(number(stream.current()));
			expected = OPERATOR | SIGN | LPAREN;

			// NB should explicitly update stream position for backward direction
			stream.pos = stream.start;
		} else {
			stream.backUp(1);
			ch = stream.peek();

			if (isOperator(ch)) {
				if (isSign(ch) && expected & SIGN && isReverseSignContext(stream)) {
					if (isNegativeSign(ch)) {
						tokens.push(op1(ch, priority));
					}
					expected = LPAREN | RPAREN | OPERATOR | PRIMARY;
				} else {
					if ((expected & OPERATOR) === 0) {
						stream.next();
						break;
					}
					tokens.push(op2(ch, priority));
					expected = PRIMARY | RPAREN;
				}
			} else if (ch === RIGHT_PARENTHESIS) {
				if ((expected & RPAREN) === 0) {
					stream.next();
					break;
				}

				priority += 10;
				expected = PRIMARY | RPAREN | LPAREN;
			} else if (ch === LEFT_PARENTHESIS) {
				priority -= 10;

				if (expected & NULLARY_CALL) {
					tokens.push(nullary);
				} else if ((expected & LPAREN) === 0) {
					stream.next();
					break;
				}

				expected = OPERATOR | SIGN | LPAREN | NULLARY_CALL;
			} else if (!(0, _streamReaderUtils.isWhiteSpace)(ch)) {
				stream.next();
				break;
			}
		}
	}

	if (priority < 0 || priority >= 10) {
		error('Unmatched "()"', stream);
	}

	const result = orderTokens(tokens.reverse());
	if (result === null) {
		error('Parity', stream);
	}

	// edge case: expression is preceded by white-space;
	// move stream position back to expression start
	stream.eatWhile(_streamReaderUtils.isWhiteSpace);

	return result;
}

/**
 * Orders parsed tokens (operands and operators) in given array so that they are
 * laid off in order of execution
 * @param  {Token[]} tokens
 * @return {Token[]}
 */
function orderTokens(tokens) {
	const operators = [],
	      operands = [];
	let noperators = 0;

	for (let i = 0, token; i < tokens.length; i++) {
		token = tokens[i];

		if (token.type === NUMBER) {
			operands.push(token);
		} else {
			noperators += token.type === OP1 ? 1 : 2;

			while (operators.length) {
				if (token.priority <= operators[operators.length - 1].priority) {
					operands.push(operators.pop());
				} else {
					break;
				}
			}

			operators.push(token);
		}
	}

	return noperators + 1 === operands.length + operators.length ? operands.concat(operators.reverse()) : null /* parity */;
}

/**
 * Check if current stream state is in sign (e.g. positive or negative) context
 * for reverse parsing
 * @param  {StreamReader} stream
 * @return {Boolean}
 */
function isReverseSignContext(stream) {
	const start = stream.pos;
	let ch,
	    inCtx = true;

	while (!isSoF(stream)) {
		stream.backUp(1);
		ch = stream.peek();

		if ((0, _streamReaderUtils.isWhiteSpace)(ch)) {
			continue;
		}

		inCtx = ch === LEFT_PARENTHESIS || isOperator(ch);
		break;
	}

	stream.pos = start;
	return inCtx;
}

/**
 * Number token factory
 * @param  {String} value
 * @param  {Number} [priority ]
 * @return {Token}
 */
function number(value, priority) {
	return new Token(NUMBER, parseFloat(value), priority);
}

/**
 * Unary operator factory
 * @param  {Number} value    Operator  character code
 * @param  {Number} priority Operator execution priority
 * @return {Token[]}
 */
function op1(value, priority) {
	if (value === MINUS) {
		priority += 2;
	}
	return new Token(OP1, value, priority);
}

/**
 * Binary operator factory
 * @param  {Number} value    Operator  character code
 * @param  {Number} priority Operator execution priority
 * @return {Token[]}
 */
function op2(value, priority) {
	if (value === MULTIPLY) {
		priority += 1;
	} else if (value === DIVIDE || value === INT_DIVIDE) {
		priority += 2;
	}

	return new Token(OP2, value, priority);
}

function error(name, stream) {
	if (stream) {
		name += ` at column ${stream.start} of expression`;
	}
	throw new Error(name);
}

function isSign(ch) {
	return isPositiveSign(ch) || isNegativeSign(ch);
}

function isPositiveSign(ch) {
	return ch === PLUS;
}

function isNegativeSign(ch) {
	return ch === MINUS;
}

function isOperator(ch) {
	return ch === PLUS || ch === MINUS || ch === MULTIPLY || ch === DIVIDE || ch === INT_DIVIDE;
}

const ops1 = {
	[MINUS]: num => -num
};

const ops2 = {
	[PLUS]: (a, b) => a + b,
	[MINUS]: (a, b) => a - b,
	[MULTIPLY]: (a, b) => a * b,
	[DIVIDE]: (a, b) => a / b,
	[INT_DIVIDE]: (a, b) => Math.floor(a / b)
};

/**
 * Evaluates given math expression
 * @param  {String|StreamReader|Array} expr Expression to evaluate
 * @param  {Boolean}                   [backward] Parses given expression (string
 *                                                or stream) in backward direction
 * @return {Number}
 */
var index = function (expr, backward) {
	if (!Array.isArray(expr)) {
		expr = parse(expr, backward);
	}

	if (!expr || !expr.length) {
		return null;
	}

	const nstack = [];
	let n1, n2, f;
	let item, value;

	for (let i = 0, il = expr.length, token; i < il; i++) {
		token = expr[i];
		if (token.type === NUMBER) {
			nstack.push(token.value);
		} else if (token.type === OP2) {
			n2 = nstack.pop();
			n1 = nstack.pop();
			f = ops2[token.value];
			nstack.push(f(n1, n2));
		} else if (token.type === OP1) {
			n1 = nstack.pop();
			f = ops1[token.value];
			nstack.push(f(n1));
		} else {
			throw new Error('Invalid expression');
		}
	}

	if (nstack.length > 1) {
		throw new Error('Invalid Expression (parity)');
	}

	return nstack[0];
};

exports.parse = parse;
exports.default = index;

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
/* Based on @sergeche's work in his emmet plugin */
const vscode = __webpack_require__(0);
const reNumber = /[0-9]/;
/**
 * Incerement number under caret of given editor
 * @param  {Number}     delta
 */
function incrementDecrement(delta) {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No editor is active');
        return;
    }
    return editor.edit(editBuilder => {
        editor.selections.forEach(selection => {
            let rangeToReplace = locate(editor.document, selection.isReversed ? selection.anchor : selection.active);
            if (!rangeToReplace) {
                return;
            }
            const text = editor.document.getText(rangeToReplace);
            if (isValidNumber(text)) {
                editBuilder.replace(rangeToReplace, update(text, delta));
            }
        });
    });
}
exports.incrementDecrement = incrementDecrement;
/**
 * Updates given number with `delta` and returns string formatted according
 * to original string format
 * @param  {String} numString
 * @param  {Number} delta
 * @return {String}
 */
function update(numString, delta) {
    let m;
    let decimals = (m = numString.match(/\.(\d+)$/)) ? m[1].length : 1;
    let output = String((parseFloat(numString) + delta).toFixed(decimals)).replace(/\.0+$/, '');
    if (m = numString.match(/^\-?(0\d+)/)) {
        // padded number: preserve padding
        output = output.replace(/^(\-?)(\d+)/, (str, minus, prefix) => minus + '0'.repeat(Math.max(0, m[1].length - prefix.length)) + prefix);
    }
    if (/^\-?\./.test(numString)) {
        // omit integer part
        output = output.replace(/^(\-?)0+/, '$1');
    }
    return output;
}
exports.update = update;
/**
 * Locates number from given position in the document
 * @param  {document} Textdocument
 * @param  {Point}      pos
 * @return {Range}      Range of number or `undefined` if not found
 */
function locate(document, pos) {
    const line = document.lineAt(pos.line).text;
    let start = pos.character;
    let end = pos.character;
    let hadDot = false,
        hadMinus = false;
    let ch;
    while (start > 0) {
        ch = line[--start];
        if (ch === '-') {
            hadMinus = true;
            break;
        } else if (ch === '.' && !hadDot) {
            hadDot = true;
        } else if (!reNumber.test(ch)) {
            start++;
            break;
        }
    }
    if (line[end] === '-' && !hadMinus) {
        end++;
    }
    while (end < line.length) {
        ch = line[end++];
        if (ch === '.' && !hadDot && reNumber.test(line[end])) {
            // A dot must be followed by a number. Otherwise stop parsing
            hadDot = true;
        } else if (!reNumber.test(ch)) {
            end--;
            break;
        }
    }
    // ensure that found range contains valid number
    if (start !== end && isValidNumber(line.slice(start, end))) {
        return new vscode.Range(pos.line, start, pos.line, end);
    }
}
exports.locate = locate;
/**
 * Check if given string contains valid number
 * @param  {String}  str
 * @return {Boolean}
 */
function isValidNumber(str) {
    return str && !isNaN(parseFloat(str));
}
//# sourceMappingURL=incrementDecrement.js.map

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// Based on @sergeche's work on the emmet plugin for atom


Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = __webpack_require__(0);
const path = __webpack_require__(3);
const imageSizeHelper_1 = __webpack_require__(41);
const vscode_emmet_helper_1 = __webpack_require__(2);
const util_1 = __webpack_require__(1);
const locateFile_1 = __webpack_require__(48);
const css_parser_1 = __webpack_require__(5);
const bufferStream_1 = __webpack_require__(4);
/**
 * Updates size of context image in given editor
 */
function updateImageSize() {
    let editor = vscode_1.window.activeTextEditor;
    if (!editor) {
        vscode_1.window.showInformationMessage('No editor is active.');
        return;
    }
    let allUpdatesPromise = editor.selections.reverse().map(selection => {
        let position = selection.isReversed ? selection.active : selection.anchor;
        if (!vscode_emmet_helper_1.isStyleSheet(editor.document.languageId)) {
            return updateImageSizeHTML(editor, position);
        } else {
            return updateImageSizeCSSFile(editor, position);
        }
    });
    return Promise.all(allUpdatesPromise).then(updates => {
        return editor.edit(builder => {
            updates.forEach(update => {
                update.forEach(textEdit => {
                    builder.replace(textEdit.range, textEdit.newText);
                });
            });
        });
    });
}
exports.updateImageSize = updateImageSize;
/**
 * Updates image size of context tag of HTML model
 */
function updateImageSizeHTML(editor, position) {
    const src = getImageSrcHTML(getImageHTMLNode(editor, position));
    if (!src) {
        return updateImageSizeStyleTag(editor, position);
    }
    return locateFile_1.locateFile(path.dirname(editor.document.fileName), src).then(imageSizeHelper_1.getImageSize).then(size => {
        // since this action is asynchronous, we have to ensure that editor wasn’t
        // changed and user didn’t moved caret outside <img> node
        const img = getImageHTMLNode(editor, position);
        if (getImageSrcHTML(img) === src) {
            return updateHTMLTag(editor, img, size.width, size.height);
        }
    }).catch(err => {
        console.warn('Error while updating image size:', err);return [];
    });
}
function updateImageSizeStyleTag(editor, position) {
    let getPropertyInsiderStyleTag = editor => {
        const rootNode = util_1.parseDocument(editor.document);
        const currentNode = util_1.getNode(rootNode, position);
        if (currentNode && currentNode.name === 'style' && currentNode.open.end.isBefore(position) && currentNode.close.start.isAfter(position)) {
            let buffer = new bufferStream_1.DocumentStreamReader(editor.document, currentNode.open.end, new vscode_1.Range(currentNode.open.end, currentNode.close.start));
            let rootNode = css_parser_1.default(buffer);
            const node = util_1.getNode(rootNode, position);
            return node && node.type === 'property' ? node : null;
        }
    };
    return updateImageSizeCSS(editor, position, getPropertyInsiderStyleTag);
}
function updateImageSizeCSSFile(editor, position) {
    return updateImageSizeCSS(editor, position, getImageCSSNode);
}
/**
 * Updates image size of context rule of stylesheet model
 */
function updateImageSizeCSS(editor, position, fetchNode) {
    const src = getImageSrcCSS(fetchNode(editor, position), position);
    if (!src) {
        return Promise.reject(new Error('No valid image source'));
    }
    return locateFile_1.locateFile(path.dirname(editor.document.fileName), src).then(imageSizeHelper_1.getImageSize).then(size => {
        // since this action is asynchronous, we have to ensure that editor wasn’t
        // changed and user didn’t moved caret outside <img> node
        const prop = fetchNode(editor, position);
        if (getImageSrcCSS(prop, position) === src) {
            return updateCSSNode(editor, prop, size.width, size.height);
        }
    }).catch(err => {
        console.warn('Error while updating image size:', err);return [];
    });
}
/**
 * Returns <img> node under caret in given editor or `null` if such node cannot
 * be found
 * @param  {TextEditor}  editor
 * @return {HtmlNode}
 */
function getImageHTMLNode(editor, position) {
    const rootNode = util_1.parseDocument(editor.document);
    const node = util_1.getNode(rootNode, position, true);
    return node && node.name.toLowerCase() === 'img' ? node : null;
}
/**
 * Returns css property under caret in given editor or `null` if such node cannot
 * be found
 * @param  {TextEditor}  editor
 * @return {Property}
 */
function getImageCSSNode(editor, position) {
    const rootNode = util_1.parseDocument(editor.document);
    const node = util_1.getNode(rootNode, position, true);
    return node && node.type === 'property' ? node : null;
}
/**
 * Returns image source from given <img> node
 * @param  {HtmlNode} node
 * @return {string}
 */
function getImageSrcHTML(node) {
    const srcAttr = getAttribute(node, 'src');
    if (!srcAttr) {
        return;
    }
    return srcAttr.value.value;
}
/**
 * Returns image source from given `url()` token
 * @param  {Property} node
 * @param {Position}
 * @return {string}
 */
function getImageSrcCSS(node, position) {
    if (!node) {
        return;
    }
    const urlToken = findUrlToken(node, position);
    if (!urlToken) {
        return;
    }
    // A stylesheet token may contain either quoted ('string') or unquoted URL
    let urlValue = urlToken.item(0);
    if (urlValue && urlValue.type === 'string') {
        urlValue = urlValue.item(0);
    }
    return urlValue && urlValue.valueOf();
}
/**
 * Updates size of given HTML node
 * @param  {TextEditor} editor
 * @param  {HtmlNode}   node
 * @param  {number}     width
 * @param  {number}     height
 */
function updateHTMLTag(editor, node, width, height) {
    const srcAttr = getAttribute(node, 'src');
    const widthAttr = getAttribute(node, 'width');
    const heightAttr = getAttribute(node, 'height');
    const quote = getAttributeQuote(editor, srcAttr);
    const endOfAttributes = node.attributes[node.attributes.length - 1].end;
    let edits = [];
    let textToAdd = '';
    if (!widthAttr) {
        textToAdd += ` width=${quote}${width}${quote}`;
    } else {
        edits.push(new vscode_1.TextEdit(new vscode_1.Range(widthAttr.value.start, widthAttr.value.end), String(width)));
    }
    if (!heightAttr) {
        textToAdd += ` height=${quote}${height}${quote}`;
    } else {
        edits.push(new vscode_1.TextEdit(new vscode_1.Range(heightAttr.value.start, heightAttr.value.end), String(height)));
    }
    if (textToAdd) {
        edits.push(new vscode_1.TextEdit(new vscode_1.Range(endOfAttributes, endOfAttributes), textToAdd));
    }
    return edits;
}
/**
 * Updates size of given CSS rule
 * @param  {TextEditor} editor
 * @param  {Property}   srcProp
 * @param  {number}     width
 * @param  {number}     height
 */
function updateCSSNode(editor, srcProp, width, height) {
    const rule = srcProp.parent;
    const widthProp = util_1.getCssPropertyFromRule(rule, 'width');
    const heightProp = util_1.getCssPropertyFromRule(rule, 'height');
    // Detect formatting
    const separator = srcProp.separator || ': ';
    const before = getPropertyDelimitor(editor, srcProp);
    let edits = [];
    if (!srcProp.terminatorToken) {
        edits.push(new vscode_1.TextEdit(new vscode_1.Range(srcProp.end, srcProp.end), ';'));
    }
    let textToAdd = '';
    if (!widthProp) {
        textToAdd += `${before}width${separator}${width}px;`;
    } else {
        edits.push(new vscode_1.TextEdit(new vscode_1.Range(widthProp.valueToken.start, widthProp.valueToken.end), `${width}px`));
    }
    if (!heightProp) {
        textToAdd += `${before}height${separator}${height}px;`;
    } else {
        edits.push(new vscode_1.TextEdit(new vscode_1.Range(heightProp.valueToken.start, heightProp.valueToken.end), `${height}px`));
    }
    if (textToAdd) {
        edits.push(new vscode_1.TextEdit(new vscode_1.Range(srcProp.end, srcProp.end), textToAdd));
    }
    return edits;
}
/**
 * Returns attribute object with `attrName` name from given HTML node
 * @param  {Node} node
 * @param  {String} attrName
 * @return {Object}
 */
function getAttribute(node, attrName) {
    attrName = attrName.toLowerCase();
    return node && node.open.attributes.find(attr => attr.name.value.toLowerCase() === attrName);
}
/**
 * Returns quote character, used for value of given attribute. May return empty
 * string if attribute wasn’t quoted
 * @param  {TextEditor} editor
 * @param  {Object} attr
 * @return {String}
 */
function getAttributeQuote(editor, attr) {
    const range = new vscode_1.Range(attr.value ? attr.value.end : attr.end, attr.end);
    return range.isEmpty ? '' : editor.document.getText(range);
}
/**
 * Finds 'url' token for given `pos` point in given CSS property `node`
 * @param  {Node}  node
 * @param  {Position} pos
 * @return {Token}
 */
function findUrlToken(node, pos) {
    for (let i = 0, il = node.parsedValue.length, url; i < il; i++) {
        util_1.iterateCSSToken(node.parsedValue[i], token => {
            if (token.type === 'url' && token.start.isBeforeOrEqual(pos) && token.end.isAfterOrEqual(pos)) {
                url = token;
                return false;
            }
        });
        if (url) {
            return url;
        }
    }
}
/**
 * Returns a string that is used to delimit properties in current node’s rule
 * @param  {TextEditor} editor
 * @param  {Property}       node
 * @return {String}
 */
function getPropertyDelimitor(editor, node) {
    let anchor;
    if (anchor = node.previousSibling || node.parent.contentStartToken) {
        return editor.document.getText(new vscode_1.Range(anchor.end, node.start));
    } else if (anchor = node.nextSibling || node.parent.contentEndToken) {
        return editor.document.getText(new vscode_1.Range(node.end, anchor.start));
    }
    return '';
}
//# sourceMappingURL=updateImageSize.js.map

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// Based on @sergeche's work on the emmet plugin for atom
// TODO: Move to https://github.com/emmetio/image-size


Object.defineProperty(exports, "__esModule", { value: true });
const path = __webpack_require__(3);
const http = __webpack_require__(42);
const https = __webpack_require__(43);
const url_1 = __webpack_require__(44);
const sizeOf = __webpack_require__(45);
const reUrl = /^https?:/;
/**
 * Get size of given image file. Supports files from local filesystem,
 * as well as URLs
 * @param  {String} file Path to local file or URL
 * @return {Promise}
 */
function getImageSize(file) {
    file = file.replace(/^file:\/\//, '');
    return reUrl.test(file) ? getImageSizeFromURL(file) : getImageSizeFromFile(file);
}
exports.getImageSize = getImageSize;
/**
 * Get image size from file on local file system
 * @param  {String} file
 * @return {Promise}
 */
function getImageSizeFromFile(file) {
    return new Promise((resolve, reject) => {
        const isDataUrl = file.match(/^data:.+?;base64,/);
        if (isDataUrl) {
            // NB should use sync version of `sizeOf()` for buffers
            try {
                const data = Buffer.from(file.slice(isDataUrl[0].length), 'base64');
                return resolve(sizeForFileName('', sizeOf(data)));
            } catch (err) {
                return reject(err);
            }
        }
        sizeOf(file, (err, size) => {
            if (err) {
                reject(err);
            } else {
                resolve(sizeForFileName(path.basename(file), size));
            }
        });
    });
}
/**
 * Get image size from given remove URL
 * @param  {String} url
 * @return {Promise}
 */
function getImageSizeFromURL(url) {
    return new Promise((resolve, reject) => {
        url = url_1.parse(url);
        const getTransport = url.protocol === 'https:' ? https.get : http.get;
        getTransport(url, resp => {
            const chunks = [];
            let bufSize = 0;
            const trySize = chunks => {
                try {
                    const size = sizeOf(Buffer.concat(chunks, bufSize));
                    resp.removeListener('data', onData);
                    resp.destroy(); // no need to read further
                    resolve(sizeForFileName(path.basename(url.pathname), size));
                } catch (err) {
                    // might not have enough data, skip error
                }
            };
            const onData = chunk => {
                bufSize += chunk.length;
                chunks.push(chunk);
                trySize(chunks);
            };
            resp.on('data', onData).on('end', () => trySize(chunks)).once('error', err => {
                resp.removeListener('data', onData);
                reject(err);
            });
        }).once('error', reject);
    });
}
/**
 * Returns size object for given file name. If file name contains `@Nx` token,
 * the final dimentions will be downscaled by N
 * @param  {String} fileName
 * @param  {Object} size
 * @return {Object}
 */
function sizeForFileName(fileName, size) {
    const m = fileName.match(/@(\d+)x\./);
    const scale = m ? +m[1] : 1;
    return {
        realWidth: size.width,
        realHeight: size.height,
        width: Math.floor(size.width / scale),
        height: Math.floor(size.height / scale)
    };
}
//# sourceMappingURL=imageSizeHelper.js.map

/***/ }),
/* 42 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 43 */
/***/ (function(module, exports) {

module.exports = require("https");

/***/ }),
/* 44 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var fs = __webpack_require__(6);
var path = __webpack_require__(3);

var detector = __webpack_require__(46);

var handlers = {};
var types = __webpack_require__(10);

// load all available handlers
types.forEach(function (type) {
  handlers[type] = __webpack_require__(11)("./" + type);
});

// Maximum buffer size, with a default of 128 kilobytes.
// TO-DO: make this adaptive based on the initial signature of the image
var MaxBufferSize = 128 * 1024;

function lookup(buffer, filepath) {
  // detect the file type.. don't rely on the extension
  var type = detector(buffer, filepath);

  // find an appropriate handler for this file type
  if (type in handlers) {
    var size = handlers[type].calculate(buffer, filepath);
    if (size !== false) {
      size.type = type;
      return size;
    }
  }

  // throw up, if we don't understand the file
  throw new TypeError('unsupported file type: ' + type + ' (file: ' + filepath + ')');
}

function asyncFileToBuffer(filepath, callback) {
  // open the file in read only mode
  fs.open(filepath, 'r', function (err, descriptor) {
    if (err) {
      return callback(err);
    }
    var size = fs.fstatSync(descriptor).size;
    if (size <= 0) {
      return callback(new Error("File size is not greater than 0 —— " + filepath));
    }
    var bufferSize = Math.min(size, MaxBufferSize);
    var buffer = new Buffer(bufferSize);
    // read first buffer block from the file, asynchronously
    fs.read(descriptor, buffer, 0, bufferSize, 0, function (err) {
      if (err) {
        return callback(err);
      }
      // close the file, we are done
      fs.close(descriptor, function (err) {
        callback(err, buffer);
      });
    });
  });
}

function syncFileToBuffer(filepath) {
  // read from the file, synchronously
  var descriptor = fs.openSync(filepath, 'r');
  var size = fs.fstatSync(descriptor).size;
  var bufferSize = Math.min(size, MaxBufferSize);
  var buffer = new Buffer(bufferSize);
  fs.readSync(descriptor, buffer, 0, bufferSize, 0);
  fs.closeSync(descriptor);
  return buffer;
}

/**
 * @params input - buffer or relative/absolute path of the image file
 * @params callback - optional function for async detection
 */
module.exports = function (input, callback) {

  // Handle buffer input
  if (Buffer.isBuffer(input)) {
    return lookup(input);
  }

  // input should be a string at this point
  if (typeof input !== 'string') {
    throw new TypeError('invalid invocation');
  }

  // resolve the file path
  var filepath = path.resolve(input);

  if (typeof callback === 'function') {
    asyncFileToBuffer(filepath, function (err, buffer) {
      if (err) {
        return callback(err);
      }

      // return the dimensions
      var dimensions;
      try {
        dimensions = lookup(buffer, filepath);
      } catch (e) {
        err = e;
      }
      callback(err, dimensions);
    });
  } else {
    var buffer = syncFileToBuffer(filepath);
    return lookup(buffer, filepath);
  }
};

module.exports.types = types;

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var typeMap = {};
var types = __webpack_require__(10);

// load all available handlers
types.forEach(function (type) {
  typeMap[type] = __webpack_require__(11)("./" + type).detect;
});

module.exports = function (buffer, filepath) {
  var type, result;
  for (type in typeMap) {
    result = typeMap[type](buffer, filepath);
    if (result) {
      return type;
    }
  }
};

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Abstract reading multi-byte unsigned integers

function readUInt(buffer, bits, offset, isBigEndian) {
  offset = offset || 0;
  var endian = !!isBigEndian ? 'BE' : 'LE';
  var method = buffer['readUInt' + bits + endian];
  return method.call(buffer, offset);
}

module.exports = readUInt;

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// Based on @sergeche's work on the emmet plugin for atom
// TODO: Move to https://github.com/emmetio/file-utils


Object.defineProperty(exports, "__esModule", { value: true });
const path = __webpack_require__(3);
const fs = __webpack_require__(6);
const reAbsolute = /^\/+/;
/**
 * Locates given `filePath` on user’s file system and returns absolute path to it.
 * This method expects either URL, or relative/absolute path to resource
 * @param  {String} basePath Base path to use if filePath is not absoulte
 * @param  {String} filePath File to locate.
 * @return {Promise}
 */
function locateFile(base, filePath) {
    if (/^\w+:/.test(filePath)) {
        // path with protocol, already absolute
        return Promise.resolve(filePath);
    }
    filePath = path.normalize(filePath);
    return reAbsolute.test(filePath) ? resolveAbsolute(base, filePath) : resolveRelative(base, filePath);
}
exports.locateFile = locateFile;
/**
 * Resolves relative file path
 * @param  {TextEditor|String} base
 * @param  {String}            filePath
 * @return {Promise}
 */
function resolveRelative(basePath, filePath) {
    return tryFile(path.resolve(basePath, filePath));
}
/**
 * Resolves absolute file path agaist given editor: tries to find file in every
 * parent of editor’s file
 * @param  {TextEditor|String} base
 * @param  {String}            filePath
 * @return {Promise}
 */
function resolveAbsolute(basePath, filePath) {
    return new Promise((resolve, reject) => {
        filePath = filePath.replace(reAbsolute, '');
        const next = ctx => {
            tryFile(path.resolve(ctx, filePath)).then(resolve, err => {
                const dir = path.dirname(ctx);
                if (!dir || dir === ctx) {
                    return reject(`Unable to locate absolute file ${filePath}`);
                }
                next(dir);
            });
        };
        next(basePath);
    });
}
/**
 * Check if given file exists and it’s a file, not directory
 * @param  {String} file
 * @return {Promise}
 */
function tryFile(file) {
    return new Promise((resolve, reject) => {
        fs.stat(file, (err, stat) => {
            if (err) {
                return reject(err);
            }
            if (!stat.isFile()) {
                return reject(new Error(`${file} is not a file`));
            }
            resolve(file);
        });
    });
}
//# sourceMappingURL=locateFile.js.map

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = __webpack_require__(0);
const util_1 = __webpack_require__(1);
const vendorPrefixes = ['-webkit-', '-moz-', '-ms-', '-o-', ''];
function reflectCssValue() {
    let editor = vscode_1.window.activeTextEditor;
    if (!editor) {
        vscode_1.window.showInformationMessage('No editor is active.');
        return;
    }
    let node = util_1.getCssPropertyFromDocument(editor, editor.selection.active);
    if (!node) {
        return;
    }
    return updateCSSNode(editor, node);
}
exports.reflectCssValue = reflectCssValue;
function updateCSSNode(editor, property) {
    const rule = property.parent;
    let currentPrefix = '';
    // Find vendor prefix of given property node
    for (let i = 0; i < vendorPrefixes.length; i++) {
        if (property.name.startsWith(vendorPrefixes[i])) {
            currentPrefix = vendorPrefixes[i];
            break;
        }
    }
    const propertyName = property.name.substr(currentPrefix.length);
    const propertyValue = property.value;
    return editor.edit(builder => {
        // Find properties with vendor prefixes, update each
        vendorPrefixes.forEach(prefix => {
            if (prefix === currentPrefix) {
                return;
            }
            let vendorProperty = util_1.getCssPropertyFromRule(rule, prefix + propertyName);
            if (vendorProperty) {
                builder.replace(new vscode_1.Range(vendorProperty.valueToken.start, vendorProperty.valueToken.end), propertyValue);
            }
        });
    });
}
//# sourceMappingURL=reflectCssValue.js.map

/***/ })
/******/ ]);
});