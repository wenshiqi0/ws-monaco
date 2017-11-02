(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("vscode"), require("vscode-languageclient"), require("vscode-extension-telemetry"), require("vscode-languageclient/lib/configuration.proposed"), require("vscode-languageserver-protocol/lib/protocol.colorProvider.proposed"), require("vscode-nls"));
	else if(typeof define === 'function' && define.amd)
		define(["vscode", "vscode-languageclient", "vscode-extension-telemetry", "vscode-languageclient/lib/configuration.proposed", "vscode-languageserver-protocol/lib/protocol.colorProvider.proposed", "vscode-nls"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("vscode"), require("vscode-languageclient"), require("vscode-extension-telemetry"), require("vscode-languageclient/lib/configuration.proposed"), require("vscode-languageserver-protocol/lib/protocol.colorProvider.proposed"), require("vscode-nls")) : factory(root["vscode"], root["vscode-languageclient"], root["vscode-extension-telemetry"], root["vscode-languageclient/lib/configuration.proposed"], root["vscode-languageserver-protocol/lib/protocol.colorProvider.proposed"], root["vscode-nls"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_6__, __WEBPACK_EXTERNAL_MODULE_7__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
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
var path = __webpack_require__(1);
var vscode_1 = __webpack_require__(2);
var vscode_languageclient_1 = __webpack_require__(3);
var vscode_extension_telemetry_1 = __webpack_require__(4);
var configuration_proposed_1 = __webpack_require__(5);
var protocol_colorProvider_proposed_1 = __webpack_require__(6);
var nls = __webpack_require__(7);
var hash_1 = __webpack_require__(8);
var localize = nls.loadMessageBundle();
var VSCodeContentRequest;
(function (VSCodeContentRequest) {
    VSCodeContentRequest.type = new vscode_languageclient_1.RequestType('vscode/content');
})(VSCodeContentRequest || (VSCodeContentRequest = {}));
var SchemaContentChangeNotification;
(function (SchemaContentChangeNotification) {
    SchemaContentChangeNotification.type = new vscode_languageclient_1.NotificationType('json/schemaContent');
})(SchemaContentChangeNotification || (SchemaContentChangeNotification = {}));
var SchemaAssociationNotification;
(function (SchemaAssociationNotification) {
    SchemaAssociationNotification.type = new vscode_languageclient_1.NotificationType('json/schemaAssociations');
})(SchemaAssociationNotification || (SchemaAssociationNotification = {}));
function activate(context) {
    var toDispose = context.subscriptions;
    var packageInfo = getPackageInfo(context);
    var telemetryReporter = packageInfo && new vscode_extension_telemetry_1.default(packageInfo.name, packageInfo.version, packageInfo.aiKey);
    toDispose.push(telemetryReporter);
    // The server is implemented in node
    var serverModule = context.asAbsolutePath(path.join('server', 'out', 'jsonServerMain.js'));
    // The debug options for the server
    var debugOptions = { execArgv: ['--nolazy', '--inspect=6004'] };
    // If the extension is launch in debug mode the debug server options are use
    // Otherwise the run options are used
    var serverOptions = {
        run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
        debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
    };
    var documentSelector = ['json'];
    // Options to control the language client
    var clientOptions = {
        // Register the server for json documents
        documentSelector: documentSelector,
        synchronize: {
            // Synchronize the setting section 'json' to the server
            configurationSection: ['json', 'http'],
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/*.json')
        },
        middleware: {
            workspace: {
                didChangeConfiguration: function () {
                    return client.sendNotification(vscode_languageclient_1.DidChangeConfigurationNotification.type, { settings: getSettings() });
                }
            }
        }
    };
    // Create the language client and start the client.
    var client = new vscode_languageclient_1.LanguageClient('json', localize('jsonserver.name', 'JSON Language Server'), serverOptions, clientOptions);
    client.registerFeature(new configuration_proposed_1.ConfigurationFeature(client));
    var disposable = client.start();
    toDispose.push(disposable);
    client.onReady().then(function () {
        client.onTelemetry(function (e) {
            if (telemetryReporter) {
                telemetryReporter.sendTelemetryEvent(e.key, e.data);
            }
        });
        // handle content request
        client.onRequest(VSCodeContentRequest.type, function (uriPath) {
            var uri = vscode_1.Uri.parse(uriPath);
            return vscode_1.workspace.openTextDocument(uri).then(function (doc) {
                return doc.getText();
            }, function (error) {
                return Promise.reject(error);
            });
        });
        var handleContentChange = function (uri) {
            if (uri.scheme === 'vscode' && uri.authority === 'schemas') {
                client.sendNotification(SchemaContentChangeNotification.type, uri.toString());
            }
        };
        toDispose.push(vscode_1.workspace.onDidChangeTextDocument(function (e) {
            return handleContentChange(e.document.uri);
        }));
        toDispose.push(vscode_1.workspace.onDidCloseTextDocument(function (d) {
            return handleContentChange(d.uri);
        }));
        client.sendNotification(SchemaAssociationNotification.type, getSchemaAssociation(context));
        // register color provider
        toDispose.push(vscode_1.languages.registerColorProvider(documentSelector, {
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
        }));
    });
    vscode_1.languages.setLanguageConfiguration('json', {
        wordPattern: /("(?:[^\\\"]*(?:\\.)?)*"?)|[^\s{}\[\],:]+/,
        indentationRules: {
            increaseIndentPattern: /^.*(\{[^}]*|\[[^\]]*)$/,
            decreaseIndentPattern: /^\s*[}\]],?\s*$/
        }
    });
}
exports.activate = activate;
function getSchemaAssociation(context) {
    var associations = {};
    vscode_1.extensions.all.forEach(function (extension) {
        var packageJSON = extension.packageJSON;
        if (packageJSON && packageJSON.contributes && packageJSON.contributes.jsonValidation) {
            var jsonValidation = packageJSON.contributes.jsonValidation;
            if (Array.isArray(jsonValidation)) {
                jsonValidation.forEach(function (jv) {
                    var fileMatch = jv.fileMatch,
                        url = jv.url;
                    if (fileMatch && url) {
                        if (url[0] === '.' && url[1] === '/') {
                            url = vscode_1.Uri.file(path.join(extension.extensionPath, url)).toString();
                        }
                        if (fileMatch[0] === '%') {
                            fileMatch = fileMatch.replace(/%APP_SETTINGS_HOME%/, '/User');
                            fileMatch = fileMatch.replace(/%APP_WORKSPACES_HOME%/, '/Workspaces');
                        } else if (fileMatch.charAt(0) !== '/' && !fileMatch.match(/\w+:\/\//)) {
                            fileMatch = '/' + fileMatch;
                        }
                        var association = associations[fileMatch];
                        if (!association) {
                            association = [];
                            associations[fileMatch] = association;
                        }
                        association.push(url);
                    }
                });
            }
        }
    });
    return associations;
}
function getSettings() {
    var httpSettings = vscode_1.workspace.getConfiguration('http');
    var jsonSettings = vscode_1.workspace.getConfiguration('json');
    var settings = {
        http: {
            proxy: httpSettings.get('proxy'),
            proxyStrictSSL: httpSettings.get('proxyStrictSSL')
        },
        json: {
            format: jsonSettings.get('format'),
            schemas: []
        }
    };
    var schemaSettingsById = Object.create(null);
    var collectSchemaSettings = function (schemaSettings, rootPath, fileMatchPrefix) {
        for (var _i = 0, schemaSettings_1 = schemaSettings; _i < schemaSettings_1.length; _i++) {
            var setting = schemaSettings_1[_i];
            var url = getSchemaId(setting, rootPath);
            if (!url) {
                continue;
            }
            var schemaSetting = schemaSettingsById[url];
            if (!schemaSetting) {
                schemaSetting = schemaSettingsById[url] = { url: url, fileMatch: [] };
                settings.json.schemas.push(schemaSetting);
            }
            var fileMatches = setting.fileMatch;
            if (Array.isArray(fileMatches)) {
                if (fileMatchPrefix) {
                    fileMatches = fileMatches.map(function (m) {
                        return fileMatchPrefix + m;
                    });
                }
                (_a = schemaSetting.fileMatch).push.apply(_a, fileMatches);
            }
            if (setting.schema) {
                schemaSetting.schema = setting.schema;
            }
        }
        var _a;
    };
    // merge global and folder settings. Qualify all file matches with the folder path.
    var globalSettings = jsonSettings.get('schemas');
    if (Array.isArray(globalSettings)) {
        collectSchemaSettings(globalSettings, vscode_1.workspace.rootPath);
    }
    var folders = vscode_1.workspace.workspaceFolders;
    if (folders) {
        for (var _i = 0, folders_1 = folders; _i < folders_1.length; _i++) {
            var folder = folders_1[_i];
            var folderUri = folder.uri;
            var schemaConfigInfo = vscode_1.workspace.getConfiguration('json', folderUri).inspect('schemas');
            var folderSchemas = schemaConfigInfo.workspaceFolderValue;
            if (Array.isArray(folderSchemas)) {
                var folderPath = folderUri.toString();
                if (folderPath[folderPath.length - 1] !== '/') {
                    folderPath = folderPath + '/';
                }
                collectSchemaSettings(folderSchemas, folderUri.fsPath, folderPath + '*');
            }
            ;
        }
        ;
    }
    return settings;
}
function getSchemaId(schema, rootPath) {
    var url = schema.url;
    if (!url) {
        if (schema.schema) {
            url = schema.schema.id || "vscode://schemas/custom/" + encodeURIComponent(hash_1.hash(schema.schema).toString(16));
        }
    } else if (rootPath && (url[0] === '.' || url[0] === '/')) {
        url = vscode_1.Uri.file(path.normalize(path.join(rootPath, url))).toString();
    }
    return url;
}
function getPackageInfo(context) {
    var extensionPackage = !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }());
    if (extensionPackage) {
        return {
            name: extensionPackage.name,
            version: extensionPackage.version,
            aiKey: extensionPackage.aiKey
        };
    }
    return null;
}
//# sourceMappingURL=jsonMain.js.map

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("path");

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
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_7__;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Return a hash value for an object.
 */
function hash(obj, hashVal) {
    if (hashVal === void 0) {
        hashVal = 0;
    }
    switch (typeof obj) {
        case 'object':
            if (obj === null) {
                return numberHash(349, hashVal);
            } else if (Array.isArray(obj)) {
                return arrayHash(obj, hashVal);
            }
            return objectHash(obj, hashVal);
        case 'string':
            return stringHash(obj, hashVal);
        case 'boolean':
            return booleanHash(obj, hashVal);
        case 'number':
            return numberHash(obj, hashVal);
        case 'undefined':
            return numberHash(obj, 937);
        default:
            return numberHash(obj, 617);
    }
}
exports.hash = hash;
function numberHash(val, initialHashVal) {
    return (initialHashVal << 5) - initialHashVal + val | 0; // hashVal * 31 + ch, keep as int32
}
function booleanHash(b, initialHashVal) {
    return numberHash(b ? 433 : 863, initialHashVal);
}
function stringHash(s, hashVal) {
    hashVal = numberHash(149417, hashVal);
    for (var i = 0, length = s.length; i < length; i++) {
        hashVal = numberHash(s.charCodeAt(i), hashVal);
    }
    return hashVal;
}
function arrayHash(arr, initialHashVal) {
    initialHashVal = numberHash(104579, initialHashVal);
    return arr.reduce(function (hashVal, item) {
        return hash(item, hashVal);
    }, initialHashVal);
}
function objectHash(obj, initialHashVal) {
    initialHashVal = numberHash(181387, initialHashVal);
    return Object.keys(obj).sort().reduce(function (hashVal, key) {
        hashVal = stringHash(key, hashVal);
        return hash(obj[key], hashVal);
    }, initialHashVal);
}
//# sourceMappingURL=hash.js.map

/***/ }),
/* 9 */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 9;

/***/ })
/******/ ]);
});