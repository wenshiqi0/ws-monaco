(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("vscode"), require("vscode-languageclient"), require("vscode-extension-telemetry"), require("vscode-languageclient/lib/configuration.proposed"), require("vscode-languageserver-protocol/lib/protocol.colorProvider.proposed"), require("vscode-nls"));
	else if(typeof define === 'function' && define.amd)
		define(["vscode", "vscode-languageclient", "vscode-extension-telemetry", "vscode-languageclient/lib/configuration.proposed", "vscode-languageserver-protocol/lib/protocol.colorProvider.proposed", "vscode-nls"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("vscode"), require("vscode-languageclient"), require("vscode-extension-telemetry"), require("vscode-languageclient/lib/configuration.proposed"), require("vscode-languageserver-protocol/lib/protocol.colorProvider.proposed"), require("vscode-nls")) : factory(root["vscode"], root["vscode-languageclient"], root["vscode-extension-telemetry"], root["vscode-languageclient/lib/configuration.proposed"], root["vscode-languageserver-protocol/lib/protocol.colorProvider.proposed"], root["vscode-nls"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_6__, __WEBPACK_EXTERNAL_MODULE_7__, __WEBPACK_EXTERNAL_MODULE_8__, __WEBPACK_EXTERNAL_MODULE_9__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
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
var path = __webpack_require__(2);
var vscode_1 = __webpack_require__(0);
var vscode_languageclient_1 = __webpack_require__(3);
var htmlEmptyTagsShared_1 = __webpack_require__(4);
var tagClosing_1 = __webpack_require__(5);
var vscode_extension_telemetry_1 = __webpack_require__(6);
var configuration_proposed_1 = __webpack_require__(7);
var protocol_colorProvider_proposed_1 = __webpack_require__(8);
var nls = __webpack_require__(9);
var localize = nls.loadMessageBundle();
var TagCloseRequest;
(function (TagCloseRequest) {
    TagCloseRequest.type = new vscode_languageclient_1.RequestType('html/tag');
})(TagCloseRequest || (TagCloseRequest = {}));
function activate(context) {
    var toDispose = context.subscriptions;
    var packageInfo = getPackageInfo(context);
    var telemetryReporter = packageInfo && new vscode_extension_telemetry_1.default(packageInfo.name, packageInfo.version, packageInfo.aiKey);
    if (telemetryReporter) {
        toDispose.push(telemetryReporter);
    }
    // The server is implemented in node
    var serverModule = context.asAbsolutePath(path.join('server', 'out', 'htmlServerMain.js'));
    // The debug options for the server
    var debugOptions = { execArgv: ['--nolazy', '--inspect=6004'] };
    // If the extension is launch in debug mode the debug server options are use
    // Otherwise the run options are used
    var serverOptions = {
        run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
        debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
    };
    var documentSelector = ['html', 'handlebars', 'razor'];
    var embeddedLanguages = { css: true, javascript: true };
    // Options to control the language client
    var clientOptions = {
        documentSelector: documentSelector,
        synchronize: {
            configurationSection: ['html', 'css', 'javascript']
        },
        initializationOptions: {
            embeddedLanguages: embeddedLanguages
        }
    };
    // Create the language client and start the client.
    var client = new vscode_languageclient_1.LanguageClient('html', localize('htmlserver.name', 'HTML Language Server'), serverOptions, clientOptions);
    client.registerFeature(new configuration_proposed_1.ConfigurationFeature(client));
    var disposable = client.start();
    toDispose.push(disposable);
    client.onReady().then(function () {
        disposable = vscode_1.languages.registerColorProvider(documentSelector, {
            provideDocumentColors: function (document) {
                var params = {
                    textDocument: client.code2ProtocolConverter.asTextDocumentIdentifier(document)
                };
                return client.sendRequest(protocol_colorProvider_proposed_1.DocumentColorRequest.type, params).then(function (symbols) {
                    return symbols.map(function (symbol) {
                        var range = client.protocol2CodeConverter.asRange(symbol.range);
                        var color = new vscode_1.Color(symbol.color.red, symbol.color.green, symbol.color.blue, symbol.color.alpha);
                        return new vscode_1.ColorInformation(range, color);
                    });
                });
            },
            provideColorPresentations: function (color, context) {
                var params = {
                    textDocument: client.code2ProtocolConverter.asTextDocumentIdentifier(context.document),
                    colorInfo: { range: client.code2ProtocolConverter.asRange(context.range), color: color }
                };
                return client.sendRequest(protocol_colorProvider_proposed_1.ColorPresentationRequest.type, params).then(function (presentations) {
                    return presentations.map(function (p) {
                        var presentation = new vscode_1.ColorPresentation(p.label);
                        presentation.textEdit = p.textEdit && client.protocol2CodeConverter.asTextEdit(p.textEdit);
                        presentation.additionalTextEdits = p.additionalTextEdits && client.protocol2CodeConverter.asTextEdits(p.additionalTextEdits);
                        return presentation;
                    });
                });
            }
        });
        toDispose.push(disposable);
        var tagRequestor = function (document, position) {
            var param = client.code2ProtocolConverter.asTextDocumentPositionParams(document, position);
            return client.sendRequest(TagCloseRequest.type, param);
        };
        disposable = tagClosing_1.activateTagClosing(tagRequestor, { html: true, handlebars: true, razor: true }, 'html.autoClosingTags');
        toDispose.push(disposable);
        disposable = client.onTelemetry(function (e) {
            if (telemetryReporter) {
                telemetryReporter.sendTelemetryEvent(e.key, e.data);
            }
        });
        toDispose.push(disposable);
    });
    vscode_1.languages.setLanguageConfiguration('html', {
        indentationRules: {
            increaseIndentPattern: /<(?!\?|(?:area|base|br|col|frame|hr|html|img|input|link|meta|param)\b|[^>]*\/>)([-_\.A-Za-z0-9]+)(?=\s|>)\b[^>]*>(?!.*<\/\1>)|<!--(?!.*-->)|\{[^}"']*$/,
            decreaseIndentPattern: /^\s*(<\/(?!html)[-_\.A-Za-z0-9]+\b[^>]*>|-->|\})/
        },
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
        onEnterRules: [{
            beforeText: new RegExp("<(?!(?:" + htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|') + "))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
            afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
            action: { indentAction: vscode_1.IndentAction.IndentOutdent }
        }, {
            beforeText: new RegExp("<(?!(?:" + htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|') + "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
            action: { indentAction: vscode_1.IndentAction.Indent }
        }]
    });
    vscode_1.languages.setLanguageConfiguration('handlebars', {
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
        onEnterRules: [{
            beforeText: new RegExp("<(?!(?:" + htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|') + "))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
            afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
            action: { indentAction: vscode_1.IndentAction.IndentOutdent }
        }, {
            beforeText: new RegExp("<(?!(?:" + htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|') + "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
            action: { indentAction: vscode_1.IndentAction.Indent }
        }]
    });
    vscode_1.languages.setLanguageConfiguration('razor', {
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
        onEnterRules: [{
            beforeText: new RegExp("<(?!(?:" + htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|') + "))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
            afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
            action: { indentAction: vscode_1.IndentAction.IndentOutdent }
        }, {
            beforeText: new RegExp("<(?!(?:" + htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|') + "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
            action: { indentAction: vscode_1.IndentAction.Indent }
        }]
    });
}
exports.activate = activate;
function getPackageInfo(context) {
    var extensionPackage = JSON.parse(__webpack_require__(10).readFileSync(context.asAbsolutePath('./package.json'), 'utf-8'));
    if (extensionPackage) {
        return {
            name: extensionPackage.name,
            version: extensionPackage.version,
            aiKey: extensionPackage.aiKey
        };
    }
    return null;
}
//# sourceMappingURL=htmlMain.js.map

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("path");

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
exports.EMPTY_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'];
//# sourceMappingURL=htmlEmptyTagsShared.js.map

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


Object.defineProperty(exports, "__esModule", { value: true });
var vscode_1 = __webpack_require__(0);
function activateTagClosing(tagProvider, supportedLanguages, configName) {
    var disposables = [];
    vscode_1.workspace.onDidChangeTextDocument(function (event) {
        return onDidChangeTextDocument(event.document, event.contentChanges);
    }, null, disposables);
    var isEnabled = false;
    updateEnabledState();
    vscode_1.window.onDidChangeActiveTextEditor(updateEnabledState, null, disposables);
    var timeout = void 0;
    function updateEnabledState() {
        isEnabled = false;
        var editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            return;
        }
        var document = editor.document;
        if (!supportedLanguages[document.languageId]) {
            return;
        }
        if (!vscode_1.workspace.getConfiguration(void 0, document.uri).get(configName)) {
            return;
        }
        isEnabled = true;
    }
    function onDidChangeTextDocument(document, changes) {
        if (!isEnabled) {
            return;
        }
        var activeDocument = vscode_1.window.activeTextEditor && vscode_1.window.activeTextEditor.document;
        if (document !== activeDocument || changes.length === 0) {
            return;
        }
        if (typeof timeout !== 'undefined') {
            clearTimeout(timeout);
        }
        var lastChange = changes[changes.length - 1];
        var lastCharacter = lastChange.text[lastChange.text.length - 1];
        if (lastChange.rangeLength > 0 || lastCharacter !== '>' && lastCharacter !== '/') {
            return;
        }
        var rangeStart = lastChange.range.start;
        var version = document.version;
        timeout = setTimeout(function () {
            var position = new vscode_1.Position(rangeStart.line, rangeStart.character + lastChange.text.length);
            tagProvider(document, position).then(function (text) {
                if (text && isEnabled) {
                    var activeEditor = vscode_1.window.activeTextEditor;
                    var activeDocument_1 = activeEditor && activeEditor.document;
                    if (document === activeDocument_1 && activeDocument_1.version === version) {
                        var selections = activeEditor.selections;
                        if (selections.length && selections.some(function (s) {
                            return s.active.isEqual(position);
                        })) {
                            activeEditor.insertSnippet(new vscode_1.SnippetString(text), selections.map(function (s) {
                                return s.active;
                            }));
                        } else {
                            activeEditor.insertSnippet(new vscode_1.SnippetString(text), position);
                        }
                    }
                }
            });
            timeout = void 0;
        }, 100);
    }
    return vscode_1.Disposable.from.apply(vscode_1.Disposable, disposables);
}
exports.activateTagClosing = activateTagClosing;
//# sourceMappingURL=tagClosing.js.map

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_7__;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_8__;

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_9__;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ })
/******/ ]);
});