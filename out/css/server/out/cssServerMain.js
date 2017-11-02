(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("vscode-languageserver"), require("vscode-languageserver-protocol/lib/protocol.configuration.proposed"), require("vscode-languageserver-protocol/lib/protocol.colorProvider.proposed"), require("vscode-css-languageservice"));
	else if(typeof define === 'function' && define.amd)
		define(["vscode-languageserver", "vscode-languageserver-protocol/lib/protocol.configuration.proposed", "vscode-languageserver-protocol/lib/protocol.colorProvider.proposed", "vscode-css-languageservice"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("vscode-languageserver"), require("vscode-languageserver-protocol/lib/protocol.configuration.proposed"), require("vscode-languageserver-protocol/lib/protocol.colorProvider.proposed"), require("vscode-css-languageservice")) : factory(root["vscode-languageserver"], root["vscode-languageserver-protocol/lib/protocol.configuration.proposed"], root["vscode-languageserver-protocol/lib/protocol.colorProvider.proposed"], root["vscode-css-languageservice"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__) {
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

module.exports = require("fs");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


Object.defineProperty(exports, "__esModule", { value: true });
var vscode_languageserver_1 = __webpack_require__(2);
var protocol_configuration_proposed_1 = __webpack_require__(3);
var protocol_colorProvider_proposed_1 = __webpack_require__(4);
var vscode_css_languageservice_1 = __webpack_require__(5);
var languageModelCache_1 = __webpack_require__(6);
// Create a connection for the server.
var connection = vscode_languageserver_1.createConnection();
console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);
// Create a simple text document manager. The text document manager
// supports full document sync only
var documents = new vscode_languageserver_1.TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
var stylesheets = languageModelCache_1.getLanguageModelCache(10, 60, function (document) {
    return getLanguageService(document).parseStylesheet(document);
});
documents.onDidClose(function (e) {
    stylesheets.onDocumentRemoved(e.document);
});
connection.onShutdown(function () {
    stylesheets.dispose();
});
var scopedSettingsSupport = false;
// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities.
connection.onInitialize(function (params) {
    function hasClientCapability(name) {
        var keys = name.split('.');
        var c = params.capabilities;
        for (var i = 0; c && i < keys.length; i++) {
            c = c[keys[i]];
        }
        return !!c;
    }
    var snippetSupport = hasClientCapability('textDocument.completion.completionItem.snippetSupport');
    scopedSettingsSupport = hasClientCapability('workspace.configuration');
    var capabilities = {
        // Tell the client that the server works in FULL text document sync mode
        textDocumentSync: documents.syncKind,
        completionProvider: snippetSupport ? { resolveProvider: false } : null,
        hoverProvider: true,
        documentSymbolProvider: true,
        referencesProvider: true,
        definitionProvider: true,
        documentHighlightProvider: true,
        documentRangeFormattingProvider: true,
        codeActionProvider: true,
        renameProvider: true,
        colorProvider: true
    };
    return { capabilities: capabilities };
});
var languageServices = {
    css: vscode_css_languageservice_1.getCSSLanguageService(),
    scss: vscode_css_languageservice_1.getSCSSLanguageService(),
    less: vscode_css_languageservice_1.getLESSLanguageService()
};
function getLanguageService(document) {
    var service = languageServices[document.languageId];
    if (!service) {
        connection.console.log('Document type is ' + document.languageId + ', using css instead.');
        service = languageServices['css'];
    }
    return service;
}
var documentSettings = {};
// remove document settings on close
documents.onDidClose(function (e) {
    delete documentSettings[e.document.uri];
});
function getDocumentSettings(textDocument) {
    if (scopedSettingsSupport) {
        var promise = documentSettings[textDocument.uri];
        if (!promise) {
            var configRequestParam = { items: [{ scopeUri: textDocument.uri, section: textDocument.languageId }] };
            promise = connection.sendRequest(protocol_configuration_proposed_1.ConfigurationRequest.type, configRequestParam).then(function (s) {
                return s[0];
            });
            documentSettings[textDocument.uri] = promise;
        }
        return promise;
    }
    return void 0;
}
// The settings have changed. Is send on server activation as well.
connection.onDidChangeConfiguration(function (change) {
    updateConfiguration(change.settings);
});
function updateConfiguration(settings) {
    for (var languageId in languageServices) {
        languageServices[languageId].configure(settings[languageId]);
    }
    // reset all document settings
    documentSettings = {};
    // Revalidate any open text documents
    documents.all().forEach(triggerValidation);
}
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
function validateTextDocument(textDocument) {
    var settingsPromise = getDocumentSettings(textDocument);
    var stylesheet = stylesheets.get(textDocument);
    settingsPromise.then(function (settings) {
        var diagnostics = getLanguageService(textDocument).doValidation(textDocument, stylesheet, settings);
        // Send the computed diagnostics to VSCode.
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: diagnostics });
    });
}
connection.onCompletion(function (textDocumentPosition) {
    var document = documents.get(textDocumentPosition.textDocument.uri);
    var stylesheet = stylesheets.get(document);
    return getLanguageService(document).doComplete(document, textDocumentPosition.position, stylesheet);
});
connection.onHover(function (textDocumentPosition) {
    var document = documents.get(textDocumentPosition.textDocument.uri);
    var styleSheet = stylesheets.get(document);
    return getLanguageService(document).doHover(document, textDocumentPosition.position, styleSheet);
});
connection.onDocumentSymbol(function (documentSymbolParams) {
    var document = documents.get(documentSymbolParams.textDocument.uri);
    var stylesheet = stylesheets.get(document);
    return getLanguageService(document).findDocumentSymbols(document, stylesheet);
});
connection.onDefinition(function (documentSymbolParams) {
    var document = documents.get(documentSymbolParams.textDocument.uri);
    var stylesheet = stylesheets.get(document);
    return getLanguageService(document).findDefinition(document, documentSymbolParams.position, stylesheet);
});
connection.onDocumentHighlight(function (documentSymbolParams) {
    var document = documents.get(documentSymbolParams.textDocument.uri);
    var stylesheet = stylesheets.get(document);
    return getLanguageService(document).findDocumentHighlights(document, documentSymbolParams.position, stylesheet);
});
connection.onReferences(function (referenceParams) {
    var document = documents.get(referenceParams.textDocument.uri);
    var stylesheet = stylesheets.get(document);
    return getLanguageService(document).findReferences(document, referenceParams.position, stylesheet);
});
connection.onDocumentRangeFormatting(function (formatParams, textEdit, token) {
    var document = documents.get(formatParams.textDocument.uri);
    __webpack_require__(0).appendFileSync('/Users/munong/Downloads/edit.log', JSON.stringify(textEdit));
    __webpack_require__(0).appendFileSync('/Users/munong/Downloads/docs.log', JSON.stringify(document));
    return {};
});
connection.onCodeAction(function (codeActionParams) {
    var document = documents.get(codeActionParams.textDocument.uri);
    var stylesheet = stylesheets.get(document);
    return getLanguageService(document).doCodeActions(document, codeActionParams.range, codeActionParams.context, stylesheet);
});
connection.onRequest(protocol_colorProvider_proposed_1.DocumentColorRequest.type, function (params) {
    var document = documents.get(params.textDocument.uri);
    if (document) {
        var stylesheet = stylesheets.get(document);
        return getLanguageService(document).findDocumentColors(document, stylesheet);
    }
    return [];
});
connection.onRequest(protocol_colorProvider_proposed_1.ColorPresentationRequest.type, function (params) {
    var document = documents.get(params.textDocument.uri);
    if (document) {
        var stylesheet = stylesheets.get(document);
        return getLanguageService(document).getColorPresentations(document, stylesheet, params.colorInfo);
    }
    return [];
});
connection.onRenameRequest(function (renameParameters) {
    var document = documents.get(renameParameters.textDocument.uri);
    var stylesheet = stylesheets.get(document);
    return getLanguageService(document).doRename(document, renameParameters.position, renameParameters.newName, stylesheet);
});
// Listen on the connection
connection.listen();
//# sourceMappingURL=cssServerMain.js.map

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }),
/* 6 */
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

/***/ })
/******/ ]);
});