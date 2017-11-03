(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("vscode-html-languageservice"), require("vscode-languageserver-types"), require("vscode-languageserver"), require("vscode-css-languageservice"), require("typescript"), require("vscode-languageserver-protocol/lib/protocol.configuration.proposed"), require("vscode-languageserver-protocol/lib/protocol.colorProvider.proposed"), require("vscode-uri"), require("vscode-nls"));
	else if(typeof define === 'function' && define.amd)
		define(["vscode-html-languageservice", "vscode-languageserver-types", "vscode-languageserver", "vscode-css-languageservice", "typescript", "vscode-languageserver-protocol/lib/protocol.configuration.proposed", "vscode-languageserver-protocol/lib/protocol.colorProvider.proposed", "vscode-uri", "vscode-nls"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("vscode-html-languageservice"), require("vscode-languageserver-types"), require("vscode-languageserver"), require("vscode-css-languageservice"), require("typescript"), require("vscode-languageserver-protocol/lib/protocol.configuration.proposed"), require("vscode-languageserver-protocol/lib/protocol.colorProvider.proposed"), require("vscode-uri"), require("vscode-nls")) : factory(root["vscode-html-languageservice"], root["vscode-languageserver-types"], root["vscode-languageserver"], root["vscode-css-languageservice"], root["typescript"], root["vscode-languageserver-protocol/lib/protocol.configuration.proposed"], root["vscode-languageserver-protocol/lib/protocol.colorProvider.proposed"], root["vscode-uri"], root["vscode-nls"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_8__, __WEBPACK_EXTERNAL_MODULE_11__, __WEBPACK_EXTERNAL_MODULE_13__, __WEBPACK_EXTERNAL_MODULE_15__, __WEBPACK_EXTERNAL_MODULE_16__, __WEBPACK_EXTERNAL_MODULE_20__, __WEBPACK_EXTERNAL_MODULE_21__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


Object.defineProperty(exports, "__esModule", { value: true });
function getLanguageModelCache(maxEntries, cleanupIntervalTimeInSec, parse) {
    var languageModels = {};
    var nModels = 0;
    var cleanupInterval = void 0;
    if (cleanupIntervalTimeInSec > 0) {
        cleanupInterval = setInterval(function () {
            var cutoffTime = Date.now() - cleanupIntervalTimeInSec * 1000;
            var uris = Object.keys(languageModels);
            for (var _i = 0, uris_1 = uris; _i < uris_1.length; _i++) {
                var uri = uris_1[_i];
                var languageModelInfo = languageModels[uri];
                if (languageModelInfo.cTime < cutoffTime) {
                    delete languageModels[uri];
                    nModels--;
                }
            }
        }, cleanupIntervalTimeInSec * 1000);
    }
    return {
        get: function (document) {
            var version = document.version;
            var languageId = document.languageId;
            var languageModelInfo = languageModels[document.uri];
            if (languageModelInfo && languageModelInfo.version === version && languageModelInfo.languageId === languageId) {
                languageModelInfo.cTime = Date.now();
                return languageModelInfo.languageModel;
            }
            var languageModel = parse(document);
            languageModels[document.uri] = { languageModel: languageModel, version: version, languageId: languageId, cTime: Date.now() };
            if (!languageModelInfo) {
                nModels++;
            }
            if (nModels === maxEntries) {
                var oldestTime = Number.MAX_VALUE;
                var oldestUri = null;
                for (var uri in languageModels) {
                    var languageModelInfo_1 = languageModels[uri];
                    if (languageModelInfo_1.cTime < oldestTime) {
                        oldestUri = uri;
                        oldestTime = languageModelInfo_1.cTime;
                    }
                }
                if (oldestUri) {
                    delete languageModels[oldestUri];
                    nModels--;
                }
            }
            return languageModel;
        },
        onDocumentRemoved: function (document) {
            var uri = document.uri;
            if (languageModels[uri]) {
                delete languageModels[uri];
                nModels--;
            }
        },
        dispose: function () {
            if (typeof cleanupInterval !== 'undefined') {
                clearInterval(cleanupInterval);
                cleanupInterval = void 0;
                languageModels = {};
                nModels = 0;
            }
        }
    };
}
exports.getLanguageModelCache = getLanguageModelCache;
//# sourceMappingURL=languageModelCache.js.map

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


Object.defineProperty(exports, "__esModule", { value: true });
var vscode_html_languageservice_1 = __webpack_require__(1);
exports.CSS_STYLE_RULE = '__';
;
function getDocumentRegions(languageService, document) {
    var regions = [];
    var scanner = languageService.createScanner(document.getText());
    var lastTagName;
    var lastAttributeName;
    var languageIdFromType;
    var importedScripts = [];
    var token = scanner.scan();
    while (token !== vscode_html_languageservice_1.TokenType.EOS) {
        switch (token) {
            case vscode_html_languageservice_1.TokenType.StartTag:
                lastTagName = scanner.getTokenText();
                lastAttributeName = null;
                languageIdFromType = 'javascript';
                break;
            case vscode_html_languageservice_1.TokenType.Styles:
                regions.push({ languageId: 'css', start: scanner.getTokenOffset(), end: scanner.getTokenEnd() });
                break;
            case vscode_html_languageservice_1.TokenType.Script:
                regions.push({ languageId: languageIdFromType, start: scanner.getTokenOffset(), end: scanner.getTokenEnd() });
                break;
            case vscode_html_languageservice_1.TokenType.AttributeName:
                lastAttributeName = scanner.getTokenText();
                break;
            case vscode_html_languageservice_1.TokenType.AttributeValue:
                if (lastAttributeName === 'src' && lastTagName.toLowerCase() === 'script') {
                    var value = scanner.getTokenText();
                    if (value[0] === '\'' || value[0] === '"') {
                        value = value.substr(1, value.length - 1);
                    }
                    importedScripts.push(value);
                } else if (lastAttributeName === 'type' && lastTagName.toLowerCase() === 'script') {
                    if (/["'](module|(text|application)\/(java|ecma)script)["']/.test(scanner.getTokenText())) {
                        languageIdFromType = 'javascript';
                    } else {
                        languageIdFromType = void 0;
                    }
                } else {
                    var attributeLanguageId = getAttributeLanguage(lastAttributeName);
                    if (attributeLanguageId) {
                        var start = scanner.getTokenOffset();
                        var end = scanner.getTokenEnd();
                        var firstChar = document.getText()[start];
                        if (firstChar === '\'' || firstChar === '"') {
                            start++;
                            end--;
                        }
                        regions.push({ languageId: attributeLanguageId, start: start, end: end, attributeValue: true });
                    }
                }
                lastAttributeName = null;
                break;
        }
        token = scanner.scan();
    }
    return {
        getLanguageRanges: function (range) {
            return getLanguageRanges(document, regions, range);
        },
        getEmbeddedDocument: function (languageId, ignoreAttributeValues) {
            return getEmbeddedDocument(document, regions, languageId, ignoreAttributeValues);
        },
        getLanguageAtPosition: function (position) {
            return getLanguageAtPosition(document, regions, position);
        },
        getLanguagesInDocument: function () {
            return getLanguagesInDocument(document, regions);
        },
        getImportedScripts: function () {
            return importedScripts;
        }
    };
}
exports.getDocumentRegions = getDocumentRegions;
function getLanguageRanges(document, regions, range) {
    var result = [];
    var currentPos = range ? range.start : vscode_html_languageservice_1.Position.create(0, 0);
    var currentOffset = range ? document.offsetAt(range.start) : 0;
    var endOffset = range ? document.offsetAt(range.end) : document.getText().length;
    for (var _i = 0, regions_1 = regions; _i < regions_1.length; _i++) {
        var region = regions_1[_i];
        if (region.end > currentOffset && region.start < endOffset) {
            var start = Math.max(region.start, currentOffset);
            var startPos = document.positionAt(start);
            if (currentOffset < region.start) {
                result.push({
                    start: currentPos,
                    end: startPos,
                    languageId: 'html'
                });
            }
            var end = Math.min(region.end, endOffset);
            var endPos = document.positionAt(end);
            if (end > region.start) {
                result.push({
                    start: startPos,
                    end: endPos,
                    languageId: region.languageId,
                    attributeValue: region.attributeValue
                });
            }
            currentOffset = end;
            currentPos = endPos;
        }
    }
    if (currentOffset < endOffset) {
        var endPos = range ? range.end : document.positionAt(endOffset);
        result.push({
            start: currentPos,
            end: endPos,
            languageId: 'html'
        });
    }
    return result;
}
function getLanguagesInDocument(document, regions) {
    var result = [];
    for (var _i = 0, regions_2 = regions; _i < regions_2.length; _i++) {
        var region = regions_2[_i];
        if (region.languageId && result.indexOf(region.languageId) === -1) {
            result.push(region.languageId);
            if (result.length === 3) {
                return result;
            }
        }
    }
    result.push('html');
    return result;
}
function getLanguageAtPosition(document, regions, position) {
    var offset = document.offsetAt(position);
    for (var _i = 0, regions_3 = regions; _i < regions_3.length; _i++) {
        var region = regions_3[_i];
        if (region.start <= offset) {
            if (offset <= region.end) {
                return region.languageId;
            }
        } else {
            break;
        }
    }
    return 'html';
}
function getEmbeddedDocument(document, contents, languageId, ignoreAttributeValues) {
    var currentPos = 0;
    var oldContent = document.getText();
    var result = '';
    var lastSuffix = '';
    for (var _i = 0, contents_1 = contents; _i < contents_1.length; _i++) {
        var c = contents_1[_i];
        if (c.languageId === languageId && (!ignoreAttributeValues || !c.attributeValue)) {
            result = substituteWithWhitespace(result, currentPos, c.start, oldContent, lastSuffix, getPrefix(c));
            result += oldContent.substring(c.start, c.end);
            currentPos = c.end;
            lastSuffix = getSuffix(c);
        }
    }
    result = substituteWithWhitespace(result, currentPos, oldContent.length, oldContent, lastSuffix, '');
    return vscode_html_languageservice_1.TextDocument.create(document.uri, languageId, document.version, result);
}
function getPrefix(c) {
    if (c.attributeValue) {
        switch (c.languageId) {
            case 'css':
                return exports.CSS_STYLE_RULE + '{';
        }
    }
    return '';
}
function getSuffix(c) {
    if (c.attributeValue) {
        switch (c.languageId) {
            case 'css':
                return '}';
            case 'javascript':
                return ';';
        }
    }
    return '';
}
function substituteWithWhitespace(result, start, end, oldContent, before, after) {
    var accumulatedWS = 0;
    result += before;
    for (var i = start + before.length; i < end; i++) {
        var ch = oldContent[i];
        if (ch === '\n' || ch === '\r') {
            // only write new lines, skip the whitespace
            accumulatedWS = 0;
            result += ch;
        } else {
            accumulatedWS++;
        }
    }
    result = append(result, ' ', accumulatedWS - after.length);
    result += after;
    return result;
}
function append(result, str, n) {
    while (n > 0) {
        if (n & 1) {
            result += str;
        }
        n >>= 1;
        str += str;
    }
    return result;
}
function getAttributeLanguage(attributeName) {
    var match = attributeName.match(/^(style)$|^(on\w+)$/i);
    if (!match) {
        return null;
    }
    return match[1] ? 'css' : 'javascript';
}
//# sourceMappingURL=embeddedSupport.js.map

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


Object.defineProperty(exports, "__esModule", { value: true });
function getWordAtText(text, offset, wordDefinition) {
    var lineStart = offset;
    while (lineStart > 0 && !isNewlineCharacter(text.charCodeAt(lineStart - 1))) {
        lineStart--;
    }
    var offsetInLine = offset - lineStart;
    var lineText = text.substr(lineStart);
    // make a copy of the regex as to not keep the state
    var flags = wordDefinition.ignoreCase ? 'gi' : 'g';
    wordDefinition = new RegExp(wordDefinition.source, flags);
    var match = wordDefinition.exec(lineText);
    while (match && match.index + match[0].length < offsetInLine) {
        match = wordDefinition.exec(lineText);
    }
    if (match && match.index <= offsetInLine) {
        return { start: match.index + lineStart, length: match[0].length };
    }
    return { start: offset, length: 0 };
}
exports.getWordAtText = getWordAtText;
function startsWith(haystack, needle) {
    if (haystack.length < needle.length) {
        return false;
    }
    for (var i = 0; i < needle.length; i++) {
        if (haystack[i] !== needle[i]) {
            return false;
        }
    }
    return true;
}
exports.startsWith = startsWith;
function repeat(value, count) {
    var s = '';
    while (count > 0) {
        if ((count & 1) === 1) {
            s += value;
        }
        value += value;
        count = count >>> 1;
    }
    return s;
}
exports.repeat = repeat;
function isWhitespaceOnly(str) {
    return (/^\s*$/.test(str)
    );
}
exports.isWhitespaceOnly = isWhitespaceOnly;
function isEOL(content, offset) {
    return isNewlineCharacter(content.charCodeAt(offset));
}
exports.isEOL = isEOL;
var CR = '\r'.charCodeAt(0);
var NL = '\n'.charCodeAt(0);
function isNewlineCharacter(charCode) {
    return charCode === CR || charCode === NL;
}
exports.isNewlineCharacter = isNewlineCharacter;
//# sourceMappingURL=strings.js.map

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


Object.defineProperty(exports, "__esModule", { value: true });
function pushAll(to, from) {
    if (from) {
        for (var i = 0; i < from.length; i++) {
            to.push(from[i]);
        }
    }
}
exports.pushAll = pushAll;
//# sourceMappingURL=arrays.js.map

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = undefined && undefined.__generator || function (thisArg, body) {
    var _ = { label: 0, sent: function () {
            if (t[0] & 1) throw t[1];return t[1];
        }, trys: [], ops: [] },
        f,
        y,
        t,
        g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this;
    }), g;
    function verb(n) {
        return function (v) {
            return step([n, v]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0:case 1:
                    t = op;break;
                case 4:
                    _.label++;return { value: op[1], done: false };
                case 5:
                    _.label++;y = op[1];op = [0];continue;
                case 7:
                    op = _.ops.pop();_.trys.pop();continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];t = op;break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];_.ops.push(op);break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [6, e];y = 0;
        } finally {
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = undefined;
Object.defineProperty(exports, "__esModule", { value: true });
var vscode_languageserver_1 = __webpack_require__(8);
var languageModes_1 = __webpack_require__(9);
var protocol_configuration_proposed_1 = __webpack_require__(15);
var protocol_colorProvider_proposed_1 = __webpack_require__(16);
var formatting_1 = __webpack_require__(17);
var arrays_1 = __webpack_require__(6);
var url = __webpack_require__(19);
var path = __webpack_require__(5);
var vscode_uri_1 = __webpack_require__(20);
var nls = __webpack_require__(21);
nls.config(process.env['VSCODE_NLS_CONFIG']);
var TagCloseRequest;
(function (TagCloseRequest) {
    TagCloseRequest.type = new vscode_languageserver_1.RequestType('html/tag');
})(TagCloseRequest || (TagCloseRequest = {}));
// Create a connection for the server
var connection = vscode_languageserver_1.createConnection();
console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);
// Create a simple text document manager. The text document manager
// supports full document sync only
var documents = new vscode_languageserver_1.TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
var workspacePath;
var languageModes;
var clientSnippetSupport = false;
var clientDynamicRegisterSupport = false;
var scopedSettingsSupport = false;
var globalSettings = {};
var documentSettings = {};
// remove document settings on close
documents.onDidClose(function (e) {
    delete documentSettings[e.document.uri];
});
function getDocumentSettings(textDocument, needsDocumentSettings) {
    if (scopedSettingsSupport && needsDocumentSettings()) {
        var promise = documentSettings[textDocument.uri];
        if (!promise) {
            var scopeUri = textDocument.uri;
            var configRequestParam = { items: [{ scopeUri: scopeUri, section: 'css' }, { scopeUri: scopeUri, section: 'html' }, { scopeUri: scopeUri, section: 'javascript' }] };
            promise = connection.sendRequest(protocol_configuration_proposed_1.ConfigurationRequest.type, configRequestParam).then(function (s) {
                return { css: s[0], html: s[1], javascript: s[2] };
            });
            documentSettings[textDocument.uri] = promise;
        }
        return promise;
    }
    return Promise.resolve(void 0);
}
// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites
connection.onInitialize(function (params) {
    var initializationOptions = params.initializationOptions;
    workspacePath = params.rootPath;
    languageModes = languageModes_1.getLanguageModes(initializationOptions ? initializationOptions.embeddedLanguages : { css: true, javascript: true });
    documents.onDidClose(function (e) {
        languageModes.onDocumentRemoved(e.document);
    });
    connection.onShutdown(function () {
        languageModes.dispose();
    });
    function hasClientCapability() {
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        var c = params.capabilities;
        for (var i = 0; c && i < keys.length; i++) {
            c = c[keys[i]];
        }
        return !!c;
    }
    clientSnippetSupport = hasClientCapability('textDocument', 'completion', 'completionItem', 'snippetSupport');
    clientDynamicRegisterSupport = hasClientCapability('workspace', 'symbol', 'dynamicRegistration');
    scopedSettingsSupport = hasClientCapability('workspace', 'configuration');
    var capabilities = {
        // Tell the client that the server works in FULL text document sync mode
        textDocumentSync: documents.syncKind,
        completionProvider: clientSnippetSupport ? { resolveProvider: true, triggerCharacters: ['.', ':', '<', '"', '=', '/', '>'] } : null,
        hoverProvider: true,
        documentHighlightProvider: true,
        documentRangeFormattingProvider: false,
        documentLinkProvider: { resolveProvider: false },
        documentSymbolProvider: true,
        definitionProvider: true,
        signatureHelpProvider: { triggerCharacters: ['('] },
        referencesProvider: true,
        colorProvider: true
    };
    return { capabilities: capabilities };
});
var formatterRegistration = null;
// The settings have changed. Is send on server activation as well.
connection.onDidChangeConfiguration(function (change) {
    globalSettings = change.settings;
    documentSettings = {}; // reset all document settings
    languageModes.getAllModes().forEach(function (m) {
        if (m.configure) {
            m.configure(change.settings);
        }
    });
    documents.all().forEach(triggerValidation);
    // dynamically enable & disable the formatter
    if (clientDynamicRegisterSupport) {
        var enableFormatter = globalSettings && globalSettings.html && globalSettings.html.format && globalSettings.html.format.enable;
        if (enableFormatter) {
            if (!formatterRegistration) {
                var documentSelector = [{ language: 'html' }, { language: 'handlebars' }]; // don't register razor, the formatter does more harm than good
                formatterRegistration = connection.client.register(vscode_languageserver_1.DocumentRangeFormattingRequest.type, { documentSelector: documentSelector });
            }
        } else if (formatterRegistration) {
            formatterRegistration.then(function (r) {
                return r.dispose();
            });
            formatterRegistration = null;
        }
    }
});
var pendingValidationRequests = {};
var validationDelayMs = 200;
// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(function (change) {
    triggerValidation(change.document);
});
// a document has closed: clear all diagnostics
documents.onDidClose(function (event) {
    cleanPendingValidation(event.document);
    connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});
function cleanPendingValidation(textDocument) {
    var request = pendingValidationRequests[textDocument.uri];
    if (request) {
        clearTimeout(request);
        delete pendingValidationRequests[textDocument.uri];
    }
}
function triggerValidation(textDocument) {
    cleanPendingValidation(textDocument);
    pendingValidationRequests[textDocument.uri] = setTimeout(function () {
        delete pendingValidationRequests[textDocument.uri];
        validateTextDocument(textDocument);
    }, validationDelayMs);
}
function isValidationEnabled(languageId, settings) {
    if (settings === void 0) {
        settings = globalSettings;
    }
    var validationSettings = settings && settings.html && settings.html.validate;
    if (validationSettings) {
        return languageId === 'css' && validationSettings.styles !== false || languageId === 'javascript' && validationSettings.scripts !== false;
    }
    return true;
}
function validateTextDocument(textDocument) {
    return __awaiter(this, void 0, void 0, function () {
        var diagnostics, modes_1, settings_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    diagnostics = [];
                    if (!(textDocument.languageId === 'html')) return [3 /*break*/, 2];
                    modes_1 = languageModes.getAllModesInDocument(textDocument);
                    return [4 /*yield*/, getDocumentSettings(textDocument, function () {
                        return modes_1.some(function (m) {
                            return !!m.doValidation;
                        });
                    })];
                case 1:
                    settings_1 = _a.sent();
                    modes_1.forEach(function (mode) {
                        if (mode.doValidation && isValidationEnabled(mode.getId(), settings_1)) {
                            arrays_1.pushAll(diagnostics, mode.doValidation(textDocument, settings_1));
                        }
                    });
                    _a.label = 2;
                case 2:
                    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: diagnostics });
                    return [2 /*return*/];
            }
        });
    });
}
connection.onCompletion(function (textDocumentPosition) {
    return __awaiter(_this, void 0, void 0, function () {
        var document, mode, settings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = documents.get(textDocumentPosition.textDocument.uri);
                    mode = languageModes.getModeAtPosition(document, textDocumentPosition.position);
                    if (!(mode && mode.doComplete)) return [3 /*break*/, 2];
                    if (mode.getId() !== 'html') {
                        connection.telemetry.logEvent({ key: 'html.embbedded.complete', value: { languageId: mode.getId() } });
                    }
                    return [4 /*yield*/, getDocumentSettings(document, function () {
                        return mode.doComplete.length > 2;
                    })];
                case 1:
                    settings = _a.sent();
                    return [2 /*return*/, mode.doComplete(document, textDocumentPosition.position, settings)];
                case 2:
                    return [2 /*return*/, { isIncomplete: true, items: [] }];
            }
        });
    });
});
connection.onCompletionResolve(function (item) {
    var data = item.data;
    if (data && data.languageId && data.uri) {
        var mode = languageModes.getMode(data.languageId);
        var document = documents.get(data.uri);
        if (mode && mode.doResolve && document) {
            return mode.doResolve(document, item);
        }
    }
    return item;
});
connection.onHover(function (textDocumentPosition) {
    var document = documents.get(textDocumentPosition.textDocument.uri);
    var mode = languageModes.getModeAtPosition(document, textDocumentPosition.position);
    if (mode && mode.doHover) {
        return mode.doHover(document, textDocumentPosition.position);
    }
    return null;
});
connection.onDocumentHighlight(function (documentHighlightParams) {
    var document = documents.get(documentHighlightParams.textDocument.uri);
    var mode = languageModes.getModeAtPosition(document, documentHighlightParams.position);
    if (mode && mode.findDocumentHighlight) {
        return mode.findDocumentHighlight(document, documentHighlightParams.position);
    }
    return [];
});
connection.onDefinition(function (definitionParams) {
    var document = documents.get(definitionParams.textDocument.uri);
    var mode = languageModes.getModeAtPosition(document, definitionParams.position);
    if (mode && mode.findDefinition) {
        return mode.findDefinition(document, definitionParams.position);
    }
    return [];
});
connection.onReferences(function (referenceParams) {
    var document = documents.get(referenceParams.textDocument.uri);
    var mode = languageModes.getModeAtPosition(document, referenceParams.position);
    if (mode && mode.findReferences) {
        return mode.findReferences(document, referenceParams.position);
    }
    return [];
});
connection.onSignatureHelp(function (signatureHelpParms) {
    var document = documents.get(signatureHelpParms.textDocument.uri);
    var mode = languageModes.getModeAtPosition(document, signatureHelpParms.position);
    if (mode && mode.doSignatureHelp) {
        return mode.doSignatureHelp(document, signatureHelpParms.position);
    }
    return null;
});
connection.onDocumentRangeFormatting(function (formatParams) {
    return __awaiter(_this, void 0, void 0, function () {
        var document, settings, unformattedTags, enabledModes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = documents.get(formatParams.textDocument.uri);
                    return [4 /*yield*/, getDocumentSettings(document, function () {
                        return true;
                    })];
                case 1:
                    settings = _a.sent();
                    if (!settings) {
                        settings = globalSettings;
                    }
                    unformattedTags = settings && settings.html && settings.html.format && settings.html.format.unformatted || '';
                    enabledModes = { css: !unformattedTags.match(/\bstyle\b/), javascript: !unformattedTags.match(/\bscript\b/) };
                    return [2 /*return*/, formatting_1.format(languageModes, document, formatParams.range, formatParams.options, settings, enabledModes)];
            }
        });
    });
});
connection.onDocumentLinks(function (documentLinkParam) {
    var document = documents.get(documentLinkParam.textDocument.uri);
    var documentContext = {
        resolveReference: function (ref, base) {
            if (base) {
                ref = url.resolve(base, ref);
            }
            if (workspacePath && ref[0] === '/') {
                return vscode_uri_1.default.file(path.join(workspacePath, ref)).toString();
            }
            return url.resolve(document.uri, ref);
        }
    };
    var links = [];
    languageModes.getAllModesInDocument(document).forEach(function (m) {
        if (m.findDocumentLinks) {
            arrays_1.pushAll(links, m.findDocumentLinks(document, documentContext));
        }
    });
    return links;
});
connection.onDocumentSymbol(function (documentSymbolParms) {
    var document = documents.get(documentSymbolParms.textDocument.uri);
    var symbols = [];
    languageModes.getAllModesInDocument(document).forEach(function (m) {
        if (m.findDocumentSymbols) {
            arrays_1.pushAll(symbols, m.findDocumentSymbols(document));
        }
    });
    return symbols;
});
connection.onRequest(protocol_colorProvider_proposed_1.DocumentColorRequest.type, function (params) {
    var infos = [];
    var document = documents.get(params.textDocument.uri);
    if (document) {
        languageModes.getAllModesInDocument(document).forEach(function (m) {
            if (m.findDocumentColors) {
                arrays_1.pushAll(infos, m.findDocumentColors(document));
            }
        });
    }
    return infos;
});
connection.onRequest(protocol_colorProvider_proposed_1.ColorPresentationRequest.type, function (params) {
    var document = documents.get(params.textDocument.uri);
    if (document) {
        var mode = languageModes.getModeAtPosition(document, params.colorInfo.range.start);
        if (mode && mode.getColorPresentations) {
            return mode.getColorPresentations(document, params.colorInfo);
        }
    }
    return [];
});
connection.onRequest(TagCloseRequest.type, function (params) {
    var document = documents.get(params.textDocument.uri);
    if (document) {
        var pos = params.position;
        if (pos.character > 0) {
            var mode = languageModes.getModeAtPosition(document, vscode_languageserver_1.Position.create(pos.line, pos.character - 1));
            if (mode && mode.doAutoClose) {
                return mode.doAutoClose(document, pos);
            }
        }
    }
    return null;
});
// Listen on the connection
connection.listen();
//# sourceMappingURL=htmlServerMain.js.map

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_8__;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


Object.defineProperty(exports, "__esModule", { value: true });
var vscode_html_languageservice_1 = __webpack_require__(1);
var languageModelCache_1 = __webpack_require__(0);
var embeddedSupport_1 = __webpack_require__(2);
var cssMode_1 = __webpack_require__(10);
var javascriptMode_1 = __webpack_require__(12);
var htmlMode_1 = __webpack_require__(14);
function getLanguageModes(supportedLanguages) {
    var htmlLanguageService = vscode_html_languageservice_1.getLanguageService();
    var documentRegions = languageModelCache_1.getLanguageModelCache(10, 60, function (document) {
        return embeddedSupport_1.getDocumentRegions(htmlLanguageService, document);
    });
    var modelCaches = [];
    modelCaches.push(documentRegions);
    var modes = {};
    modes['html'] = htmlMode_1.getHTMLMode(htmlLanguageService);
    if (supportedLanguages['css']) {
        modes['css'] = cssMode_1.getCSSMode(documentRegions);
    }
    if (supportedLanguages['javascript']) {
        modes['javascript'] = javascriptMode_1.getJavascriptMode(documentRegions);
    }
    return {
        getModeAtPosition: function (document, position) {
            var languageId = documentRegions.get(document).getLanguageAtPosition(position);
            if (languageId) {
                return modes[languageId];
            }
            return null;
        },
        getModesInRange: function (document, range) {
            return documentRegions.get(document).getLanguageRanges(range).map(function (r) {
                return {
                    start: r.start,
                    end: r.end,
                    mode: modes[r.languageId],
                    attributeValue: r.attributeValue
                };
            });
        },
        getAllModesInDocument: function (document) {
            var result = [];
            for (var _i = 0, _a = documentRegions.get(document).getLanguagesInDocument(); _i < _a.length; _i++) {
                var languageId = _a[_i];
                var mode = modes[languageId];
                if (mode) {
                    result.push(mode);
                }
            }
            return result;
        },
        getAllModes: function () {
            var result = [];
            for (var languageId in modes) {
                var mode = modes[languageId];
                if (mode) {
                    result.push(mode);
                }
            }
            return result;
        },
        getMode: function (languageId) {
            return modes[languageId];
        },
        onDocumentRemoved: function (document) {
            modelCaches.forEach(function (mc) {
                return mc.onDocumentRemoved(document);
            });
            for (var mode in modes) {
                modes[mode].onDocumentRemoved(document);
            }
        },
        dispose: function () {
            modelCaches.forEach(function (mc) {
                return mc.dispose();
            });
            modelCaches = [];
            for (var mode in modes) {
                modes[mode].dispose();
            }
            modes = {};
        }
    };
}
exports.getLanguageModes = getLanguageModes;
//# sourceMappingURL=languageModes.js.map

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


Object.defineProperty(exports, "__esModule", { value: true });
var languageModelCache_1 = __webpack_require__(0);
var vscode_css_languageservice_1 = __webpack_require__(11);
var embeddedSupport_1 = __webpack_require__(2);
function getCSSMode(documentRegions) {
    var cssLanguageService = vscode_css_languageservice_1.getCSSLanguageService();
    var embeddedCSSDocuments = languageModelCache_1.getLanguageModelCache(10, 60, function (document) {
        return documentRegions.get(document).getEmbeddedDocument('css');
    });
    var cssStylesheets = languageModelCache_1.getLanguageModelCache(10, 60, function (document) {
        return cssLanguageService.parseStylesheet(document);
    });
    return {
        getId: function () {
            return 'css';
        },
        configure: function (options) {
            cssLanguageService.configure(options && options.css);
        },
        doValidation: function (document, settings) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.doValidation(embedded, cssStylesheets.get(embedded), settings && settings.css);
        },
        doComplete: function (document, position) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.doComplete(embedded, position, cssStylesheets.get(embedded));
        },
        doHover: function (document, position) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.doHover(embedded, position, cssStylesheets.get(embedded));
        },
        findDocumentHighlight: function (document, position) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.findDocumentHighlights(embedded, position, cssStylesheets.get(embedded));
        },
        findDocumentSymbols: function (document) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.findDocumentSymbols(embedded, cssStylesheets.get(embedded)).filter(function (s) {
                return s.name !== embeddedSupport_1.CSS_STYLE_RULE;
            });
        },
        findDefinition: function (document, position) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.findDefinition(embedded, position, cssStylesheets.get(embedded));
        },
        findReferences: function (document, position) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.findReferences(embedded, position, cssStylesheets.get(embedded));
        },
        findDocumentColors: function (document) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.findDocumentColors(embedded, cssStylesheets.get(embedded));
        },
        getColorPresentations: function (document, colorInfo) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.getColorPresentations(embedded, cssStylesheets.get(embedded), colorInfo);
        },
        onDocumentRemoved: function (document) {
            embeddedCSSDocuments.onDocumentRemoved(document);
            cssStylesheets.onDocumentRemoved(document);
        },
        dispose: function () {
            embeddedCSSDocuments.dispose();
            cssStylesheets.dispose();
        }
    };
}
exports.getCSSMode = getCSSMode;
;
//# sourceMappingURL=cssMode.js.map

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_11__;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


Object.defineProperty(exports, "__esModule", { value: true });
var languageModelCache_1 = __webpack_require__(0);
var vscode_languageserver_types_1 = __webpack_require__(3);
var strings_1 = __webpack_require__(4);
var ts = __webpack_require__(13);
var path_1 = __webpack_require__(5);
var FILE_NAME = 'vscode://javascript/1'; // the same 'file' is used for all contents
var JQUERY_D_TS = path_1.join(__dirname, '../../lib/jquery.d.ts');
var JS_WORD_REGEX = /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g;
function getJavascriptMode(documentRegions) {
    var jsDocuments = languageModelCache_1.getLanguageModelCache(10, 60, function (document) {
        return documentRegions.get(document).getEmbeddedDocument('javascript');
    });
    var compilerOptions = { allowNonTsExtensions: true, allowJs: true, lib: ['lib.es6.d.ts'], target: ts.ScriptTarget.Latest, moduleResolution: ts.ModuleResolutionKind.Classic };
    var currentTextDocument;
    var scriptFileVersion = 0;
    function updateCurrentTextDocument(doc) {
        if (!currentTextDocument || doc.uri !== currentTextDocument.uri || doc.version !== currentTextDocument.version) {
            currentTextDocument = jsDocuments.get(doc);
            scriptFileVersion++;
        }
    }
    var host = {
        getCompilationSettings: function () {
            return compilerOptions;
        },
        getScriptFileNames: function () {
            return [FILE_NAME, JQUERY_D_TS];
        },
        getScriptKind: function () {
            return ts.ScriptKind.JS;
        },
        getScriptVersion: function (fileName) {
            if (fileName === FILE_NAME) {
                return String(scriptFileVersion);
            }
            return '1'; // default lib an jquery.d.ts are static
        },
        getScriptSnapshot: function (fileName) {
            var text = '';
            if (strings_1.startsWith(fileName, 'vscode:')) {
                if (fileName === FILE_NAME) {
                    text = currentTextDocument.getText();
                }
            } else {
                text = ts.sys.readFile(fileName) || '';
            }
            return {
                getText: function (start, end) {
                    return text.substring(start, end);
                },
                getLength: function () {
                    return text.length;
                },
                getChangeRange: function () {
                    return void 0;
                }
            };
        },
        getCurrentDirectory: function () {
            return '';
        },
        getDefaultLibFileName: function (options) {
            return ts.getDefaultLibFilePath(options);
        }
    };
    var jsLanguageService = ts.createLanguageService(host);
    var globalSettings = {};
    return {
        getId: function () {
            return 'javascript';
        },
        configure: function (options) {
            globalSettings = options;
        },
        doValidation: function (document) {
            updateCurrentTextDocument(document);
            var syntaxDiagnostics = jsLanguageService.getSyntacticDiagnostics(FILE_NAME);
            var semanticDiagnostics = jsLanguageService.getSemanticDiagnostics(FILE_NAME);
            return syntaxDiagnostics.concat(semanticDiagnostics).map(function (diag) {
                return {
                    range: convertRange(currentTextDocument, diag),
                    severity: vscode_languageserver_types_1.DiagnosticSeverity.Error,
                    message: ts.flattenDiagnosticMessageText(diag.messageText, '\n')
                };
            });
        },
        doComplete: function (document, position) {
            updateCurrentTextDocument(document);
            var offset = currentTextDocument.offsetAt(position);
            var completions = jsLanguageService.getCompletionsAtPosition(FILE_NAME, offset);
            if (!completions) {
                return { isIncomplete: false, items: [] };
            }
            var replaceRange = convertRange(currentTextDocument, strings_1.getWordAtText(currentTextDocument.getText(), offset, JS_WORD_REGEX));
            return {
                isIncomplete: false,
                items: completions.entries.map(function (entry) {
                    return {
                        uri: document.uri,
                        position: position,
                        label: entry.name,
                        sortText: entry.sortText,
                        kind: convertKind(entry.kind),
                        textEdit: vscode_languageserver_types_1.TextEdit.replace(replaceRange, entry.name),
                        data: {
                            languageId: 'javascript',
                            uri: document.uri,
                            offset: offset
                        }
                    };
                })
            };
        },
        doResolve: function (document, item) {
            updateCurrentTextDocument(document);
            var details = jsLanguageService.getCompletionEntryDetails(FILE_NAME, item.data.offset, item.label);
            if (details) {
                item.detail = ts.displayPartsToString(details.displayParts);
                item.documentation = ts.displayPartsToString(details.documentation);
                delete item.data;
            }
            return item;
        },
        doHover: function (document, position) {
            updateCurrentTextDocument(document);
            var info = jsLanguageService.getQuickInfoAtPosition(FILE_NAME, currentTextDocument.offsetAt(position));
            if (info) {
                var contents = ts.displayPartsToString(info.displayParts);
                return {
                    range: convertRange(currentTextDocument, info.textSpan),
                    contents: vscode_languageserver_types_1.MarkedString.fromPlainText(contents)
                };
            }
            return null;
        },
        doSignatureHelp: function (document, position) {
            updateCurrentTextDocument(document);
            var signHelp = jsLanguageService.getSignatureHelpItems(FILE_NAME, currentTextDocument.offsetAt(position));
            if (signHelp) {
                var ret_1 = {
                    activeSignature: signHelp.selectedItemIndex,
                    activeParameter: signHelp.argumentIndex,
                    signatures: []
                };
                signHelp.items.forEach(function (item) {
                    var signature = {
                        label: '',
                        documentation: null,
                        parameters: []
                    };
                    signature.label += ts.displayPartsToString(item.prefixDisplayParts);
                    item.parameters.forEach(function (p, i, a) {
                        var label = ts.displayPartsToString(p.displayParts);
                        var parameter = {
                            label: label,
                            documentation: ts.displayPartsToString(p.documentation)
                        };
                        signature.label += label;
                        signature.parameters.push(parameter);
                        if (i < a.length - 1) {
                            signature.label += ts.displayPartsToString(item.separatorDisplayParts);
                        }
                    });
                    signature.label += ts.displayPartsToString(item.suffixDisplayParts);
                    ret_1.signatures.push(signature);
                });
                return ret_1;
            }
            ;
            return null;
        },
        findDocumentHighlight: function (document, position) {
            updateCurrentTextDocument(document);
            var occurrences = jsLanguageService.getOccurrencesAtPosition(FILE_NAME, currentTextDocument.offsetAt(position));
            if (occurrences) {
                return occurrences.map(function (entry) {
                    return {
                        range: convertRange(currentTextDocument, entry.textSpan),
                        kind: entry.isWriteAccess ? vscode_languageserver_types_1.DocumentHighlightKind.Write : vscode_languageserver_types_1.DocumentHighlightKind.Text
                    };
                });
            }
            ;
            return null;
        },
        findDocumentSymbols: function (document) {
            updateCurrentTextDocument(document);
            var items = jsLanguageService.getNavigationBarItems(FILE_NAME);
            if (items) {
                var result_1 = [];
                var existing_1 = {};
                var collectSymbols_1 = function (item, containerLabel) {
                    var sig = item.text + item.kind + item.spans[0].start;
                    if (item.kind !== 'script' && !existing_1[sig]) {
                        var symbol = {
                            name: item.text,
                            kind: convertSymbolKind(item.kind),
                            location: {
                                uri: document.uri,
                                range: convertRange(currentTextDocument, item.spans[0])
                            },
                            containerName: containerLabel
                        };
                        existing_1[sig] = true;
                        result_1.push(symbol);
                        containerLabel = item.text;
                    }
                    if (item.childItems && item.childItems.length > 0) {
                        for (var _i = 0, _a = item.childItems; _i < _a.length; _i++) {
                            var child = _a[_i];
                            collectSymbols_1(child, containerLabel);
                        }
                    }
                };
                items.forEach(function (item) {
                    return collectSymbols_1(item);
                });
                return result_1;
            }
            return null;
        },
        findDefinition: function (document, position) {
            updateCurrentTextDocument(document);
            var definition = jsLanguageService.getDefinitionAtPosition(FILE_NAME, currentTextDocument.offsetAt(position));
            if (definition) {
                return definition.filter(function (d) {
                    return d.fileName === FILE_NAME;
                }).map(function (d) {
                    return {
                        uri: document.uri,
                        range: convertRange(currentTextDocument, d.textSpan)
                    };
                });
            }
            return null;
        },
        findReferences: function (document, position) {
            updateCurrentTextDocument(document);
            var references = jsLanguageService.getReferencesAtPosition(FILE_NAME, currentTextDocument.offsetAt(position));
            if (references) {
                return references.filter(function (d) {
                    return d.fileName === FILE_NAME;
                }).map(function (d) {
                    return {
                        uri: document.uri,
                        range: convertRange(currentTextDocument, d.textSpan)
                    };
                });
            }
            return null;
        },
        format: function (document, range, formatParams, settings) {
            if (settings === void 0) {
                settings = globalSettings;
            }
            currentTextDocument = documentRegions.get(document).getEmbeddedDocument('javascript', true);
            scriptFileVersion++;
            var formatterSettings = settings && settings.javascript && settings.javascript.format;
            var initialIndentLevel = computeInitialIndent(document, range, formatParams);
            var formatSettings = convertOptions(formatParams, formatterSettings, initialIndentLevel + 1);
            var start = currentTextDocument.offsetAt(range.start);
            var end = currentTextDocument.offsetAt(range.end);
            var lastLineRange = null;
            if (range.end.character === 0 || strings_1.isWhitespaceOnly(currentTextDocument.getText().substr(end - range.end.character, range.end.character))) {
                end -= range.end.character;
                lastLineRange = vscode_languageserver_types_1.Range.create(vscode_languageserver_types_1.Position.create(range.end.line, 0), range.end);
            }
            var edits = jsLanguageService.getFormattingEditsForRange(FILE_NAME, start, end, formatSettings);
            if (edits) {
                var result = [];
                for (var _i = 0, edits_1 = edits; _i < edits_1.length; _i++) {
                    var edit = edits_1[_i];
                    if (edit.span.start >= start && edit.span.start + edit.span.length <= end) {
                        result.push({
                            range: convertRange(currentTextDocument, edit.span),
                            newText: edit.newText
                        });
                    }
                }
                if (lastLineRange) {
                    result.push({
                        range: lastLineRange,
                        newText: generateIndent(initialIndentLevel, formatParams)
                    });
                }
                return result;
            }
            return null;
        },
        onDocumentRemoved: function (document) {
            jsDocuments.onDocumentRemoved(document);
        },
        dispose: function () {
            jsLanguageService.dispose();
            jsDocuments.dispose();
        }
    };
}
exports.getJavascriptMode = getJavascriptMode;
;
function convertRange(document, span) {
    var startPosition = document.positionAt(span.start);
    var endPosition = document.positionAt(span.start + span.length);
    return vscode_languageserver_types_1.Range.create(startPosition, endPosition);
}
function convertKind(kind) {
    switch (kind) {
        case 'primitive type':
        case 'keyword':
            return vscode_languageserver_types_1.CompletionItemKind.Keyword;
        case 'var':
        case 'local var':
            return vscode_languageserver_types_1.CompletionItemKind.Variable;
        case 'property':
        case 'getter':
        case 'setter':
            return vscode_languageserver_types_1.CompletionItemKind.Field;
        case 'function':
        case 'method':
        case 'construct':
        case 'call':
        case 'index':
            return vscode_languageserver_types_1.CompletionItemKind.Function;
        case 'enum':
            return vscode_languageserver_types_1.CompletionItemKind.Enum;
        case 'module':
            return vscode_languageserver_types_1.CompletionItemKind.Module;
        case 'class':
            return vscode_languageserver_types_1.CompletionItemKind.Class;
        case 'interface':
            return vscode_languageserver_types_1.CompletionItemKind.Interface;
        case 'warning':
            return vscode_languageserver_types_1.CompletionItemKind.File;
    }
    return vscode_languageserver_types_1.CompletionItemKind.Property;
}
function convertSymbolKind(kind) {
    switch (kind) {
        case 'var':
        case 'local var':
        case 'const':
            return vscode_languageserver_types_1.SymbolKind.Variable;
        case 'function':
        case 'local function':
            return vscode_languageserver_types_1.SymbolKind.Function;
        case 'enum':
            return vscode_languageserver_types_1.SymbolKind.Enum;
        case 'module':
            return vscode_languageserver_types_1.SymbolKind.Module;
        case 'class':
            return vscode_languageserver_types_1.SymbolKind.Class;
        case 'interface':
            return vscode_languageserver_types_1.SymbolKind.Interface;
        case 'method':
            return vscode_languageserver_types_1.SymbolKind.Method;
        case 'property':
        case 'getter':
        case 'setter':
            return vscode_languageserver_types_1.SymbolKind.Property;
    }
    return vscode_languageserver_types_1.SymbolKind.Variable;
}
function convertOptions(options, formatSettings, initialIndentLevel) {
    return {
        ConvertTabsToSpaces: options.insertSpaces,
        TabSize: options.tabSize,
        IndentSize: options.tabSize,
        IndentStyle: ts.IndentStyle.Smart,
        NewLineCharacter: '\n',
        BaseIndentSize: options.tabSize * initialIndentLevel,
        InsertSpaceAfterCommaDelimiter: Boolean(!formatSettings || formatSettings.insertSpaceAfterCommaDelimiter),
        InsertSpaceAfterSemicolonInForStatements: Boolean(!formatSettings || formatSettings.insertSpaceAfterSemicolonInForStatements),
        InsertSpaceBeforeAndAfterBinaryOperators: Boolean(!formatSettings || formatSettings.insertSpaceBeforeAndAfterBinaryOperators),
        InsertSpaceAfterKeywordsInControlFlowStatements: Boolean(!formatSettings || formatSettings.insertSpaceAfterKeywordsInControlFlowStatements),
        InsertSpaceAfterFunctionKeywordForAnonymousFunctions: Boolean(!formatSettings || formatSettings.insertSpaceAfterFunctionKeywordForAnonymousFunctions),
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: Boolean(formatSettings && formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis),
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: Boolean(formatSettings && formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets),
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: Boolean(formatSettings && formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces),
        InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: Boolean(formatSettings && formatSettings.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces),
        PlaceOpenBraceOnNewLineForControlBlocks: Boolean(formatSettings && formatSettings.placeOpenBraceOnNewLineForFunctions),
        PlaceOpenBraceOnNewLineForFunctions: Boolean(formatSettings && formatSettings.placeOpenBraceOnNewLineForControlBlocks)
    };
}
function computeInitialIndent(document, range, options) {
    var lineStart = document.offsetAt(vscode_languageserver_types_1.Position.create(range.start.line, 0));
    var content = document.getText();
    var i = lineStart;
    var nChars = 0;
    var tabSize = options.tabSize || 4;
    while (i < content.length) {
        var ch = content.charAt(i);
        if (ch === ' ') {
            nChars++;
        } else if (ch === '\t') {
            nChars += tabSize;
        } else {
            break;
        }
        i++;
    }
    return Math.floor(nChars / tabSize);
}
function generateIndent(level, options) {
    if (options.insertSpaces) {
        return strings_1.repeat(' ', level * options.tabSize);
    } else {
        return strings_1.repeat('\t', level);
    }
}
//# sourceMappingURL=javascriptMode.js.map
/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_13__;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


Object.defineProperty(exports, "__esModule", { value: true });
var languageModelCache_1 = __webpack_require__(0);
function getHTMLMode(htmlLanguageService) {
    var globalSettings = {};
    var htmlDocuments = languageModelCache_1.getLanguageModelCache(10, 60, function (document) {
        return htmlLanguageService.parseHTMLDocument(document);
    });
    return {
        getId: function () {
            return 'html';
        },
        configure: function (options) {
            globalSettings = options;
        },
        doComplete: function (document, position, settings) {
            if (settings === void 0) {
                settings = globalSettings;
            }
            var options = settings && settings.html && settings.html.suggest;
            var doAutoComplete = settings && settings.html && settings.html.autoClosingTags;
            if (doAutoComplete) {
                options.hideAutoCompleteProposals = true;
            }
            return htmlLanguageService.doComplete(document, position, htmlDocuments.get(document), options);
        },
        doHover: function (document, position) {
            return htmlLanguageService.doHover(document, position, htmlDocuments.get(document));
        },
        findDocumentHighlight: function (document, position) {
            return htmlLanguageService.findDocumentHighlights(document, position, htmlDocuments.get(document));
        },
        findDocumentLinks: function (document, documentContext) {
            return htmlLanguageService.findDocumentLinks(document, documentContext);
        },
        findDocumentSymbols: function (document) {
            return htmlLanguageService.findDocumentSymbols(document, htmlDocuments.get(document));
        },
        format: function (document, range, formatParams, settings) {
            if (settings === void 0) {
                settings = globalSettings;
            }
            var formatSettings = settings && settings.html && settings.html.format;
            if (formatSettings) {
                formatSettings = merge(formatSettings, {});
            } else {
                formatSettings = {};
            }
            if (formatSettings.contentUnformatted) {
                formatSettings.contentUnformatted = formatSettings.contentUnformatted + ',script';
            } else {
                formatSettings.contentUnformatted = 'script';
            }
            formatSettings = merge(formatParams, formatSettings);
            return htmlLanguageService.format(document, range, formatSettings);
        },
        doAutoClose: function (document, position) {
            var offset = document.offsetAt(position);
            var text = document.getText();
            if (offset > 0 && text.charAt(offset - 1).match(/[>\/]/g)) {
                return htmlLanguageService.doTagComplete(document, position, htmlDocuments.get(document));
            }
            return null;
        },
        onDocumentRemoved: function (document) {
            htmlDocuments.onDocumentRemoved(document);
        },
        dispose: function () {
            htmlDocuments.dispose();
        }
    };
}
exports.getHTMLMode = getHTMLMode;
;
function merge(src, dst) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) {
            dst[key] = src[key];
        }
    }
    return dst;
}
//# sourceMappingURL=htmlMode.js.map

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_15__;

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_16__;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


Object.defineProperty(exports, "__esModule", { value: true });
var edits_1 = __webpack_require__(18);
var vscode_languageserver_types_1 = __webpack_require__(3);
var arrays_1 = __webpack_require__(6);
var strings_1 = __webpack_require__(4);
function format(languageModes, document, formatRange, formattingOptions, settings, enabledModes) {
    var result = [];
    var endPos = formatRange.end;
    var endOffset = document.offsetAt(endPos);
    var content = document.getText();
    if (endPos.character === 0 && endPos.line > 0 && endOffset !== content.length) {
        // if selection ends after a new line, exclude that new line
        var prevLineStart = document.offsetAt(vscode_languageserver_types_1.Position.create(endPos.line - 1, 0));
        while (strings_1.isEOL(content, endOffset - 1) && endOffset > prevLineStart) {
            endOffset--;
        }
        formatRange = vscode_languageserver_types_1.Range.create(formatRange.start, document.positionAt(endOffset));
    }
    // run the html formatter on the full range and pass the result content to the embedded formatters.
    // from the final content create a single edit
    // advantages of this approach are
    //  - correct indents in the html document
    //  - correct initial indent for embedded formatters
    //  - no worrying of overlapping edits
    // make sure we start in html
    var allRanges = languageModes.getModesInRange(document, formatRange);
    var i = 0;
    var startPos = formatRange.start;
    while (i < allRanges.length && allRanges[i].mode.getId() !== 'html') {
        var range = allRanges[i];
        if (!range.attributeValue && range.mode.format) {
            var edits = range.mode.format(document, vscode_languageserver_types_1.Range.create(startPos, range.end), formattingOptions, settings);
            arrays_1.pushAll(result, edits);
        }
        startPos = range.end;
        i++;
    }
    if (i === allRanges.length) {
        return result;
    }
    // modify the range
    formatRange = vscode_languageserver_types_1.Range.create(startPos, formatRange.end);
    // perform a html format and apply changes to a new document
    var htmlMode = languageModes.getMode('html');
    var htmlEdits = htmlMode.format(document, formatRange, formattingOptions, settings);
    var htmlFormattedContent = edits_1.applyEdits(document, htmlEdits);
    var newDocument = vscode_languageserver_types_1.TextDocument.create(document.uri + '.tmp', document.languageId, document.version, htmlFormattedContent);
    try {
        // run embedded formatters on html formatted content: - formatters see correct initial indent
        var afterFormatRangeLength = document.getText().length - document.offsetAt(formatRange.end); // length of unchanged content after replace range
        var newFormatRange = vscode_languageserver_types_1.Range.create(formatRange.start, newDocument.positionAt(htmlFormattedContent.length - afterFormatRangeLength));
        var embeddedRanges = languageModes.getModesInRange(newDocument, newFormatRange);
        var embeddedEdits = [];
        for (var _i = 0, embeddedRanges_1 = embeddedRanges; _i < embeddedRanges_1.length; _i++) {
            var r = embeddedRanges_1[_i];
            var mode = r.mode;
            if (mode && mode.format && enabledModes[mode.getId()] && !r.attributeValue) {
                var edits = mode.format(newDocument, r, formattingOptions, settings);
                for (var _a = 0, edits_2 = edits; _a < edits_2.length; _a++) {
                    var edit = edits_2[_a];
                    embeddedEdits.push(edit);
                }
            }
        }
        ;
        if (embeddedEdits.length === 0) {
            arrays_1.pushAll(result, htmlEdits);
            return result;
        }
        // apply all embedded format edits and create a single edit for all changes
        var resultContent = edits_1.applyEdits(newDocument, embeddedEdits);
        var resultReplaceText = resultContent.substring(document.offsetAt(formatRange.start), resultContent.length - afterFormatRangeLength);
        result.push(vscode_languageserver_types_1.TextEdit.replace(formatRange, resultReplaceText));
        return result;
    } finally {
        languageModes.onDocumentRemoved(newDocument);
    }
}
exports.format = format;
//# sourceMappingURL=formatting.js.map

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


Object.defineProperty(exports, "__esModule", { value: true });
function applyEdits(document, edits) {
    var text = document.getText();
    var sortedEdits = edits.sort(function (a, b) {
        var startDiff = comparePositions(a.range.start, b.range.start);
        if (startDiff === 0) {
            return comparePositions(a.range.end, b.range.end);
        }
        return startDiff;
    });
    var lastOffset = text.length;
    sortedEdits.forEach(function (e) {
        var startOffset = document.offsetAt(e.range.start);
        var endOffset = document.offsetAt(e.range.end);
        text = text.substring(0, startOffset) + e.newText + text.substring(endOffset, text.length);
        lastOffset = startOffset;
    });
    return text;
}
exports.applyEdits = applyEdits;
function comparePositions(p1, p2) {
    var diff = p2.line - p1.line;
    if (diff === 0) {
        return p2.character - p1.character;
    }
    return diff;
}
//# sourceMappingURL=edits.js.map

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_20__;

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_21__;

/***/ })
/******/ ]);
});