(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("vscode-nls"), require("vscode-languageserver"), require("vscode-languageserver-protocol/lib/protocol.colorProvider.proposed"), require("vscode-uri"), require("vscode-json-languageservice"));
	else if(typeof define === 'function' && define.amd)
		define(["vscode-nls", "vscode-languageserver", "vscode-languageserver-protocol/lib/protocol.colorProvider.proposed", "vscode-uri", "vscode-json-languageservice"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("vscode-nls"), require("vscode-languageserver"), require("vscode-languageserver-protocol/lib/protocol.colorProvider.proposed"), require("vscode-uri"), require("vscode-json-languageservice")) : factory(root["vscode-nls"], root["vscode-languageserver"], root["vscode-languageserver-protocol/lib/protocol.colorProvider.proposed"], root["vscode-uri"], root["vscode-json-languageservice"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_9__, __WEBPACK_EXTERNAL_MODULE_11__, __WEBPACK_EXTERNAL_MODULE_12__, __WEBPACK_EXTERNAL_MODULE_24__, __WEBPACK_EXTERNAL_MODULE_26__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("net");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("tls");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0];
	var i = 1;
	var length = arguments.length;
	var deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	if (target == null || typeof target !== 'object' && typeof target !== 'function') {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

						// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Module dependencies.
 */

var inherits = __webpack_require__(1).inherits;
var EventEmitter = __webpack_require__(17).EventEmitter;

/**
 * Module exports.
 */

module.exports = Agent;

/**
 *
 * @api public
 */

function Agent(callback) {
  if (!(this instanceof Agent)) return new Agent(callback);
  if ('function' != typeof callback) throw new Error('Must pass a "callback function"');
  EventEmitter.call(this);
  this.callback = callback;
}
inherits(Agent, EventEmitter);

/**
 * Called by node-core's "_http_client.js" module when creating
 * a new HTTP request with this Agent instance.
 *
 * @api public
 */

Agent.prototype.addRequest = function (req, host, port, localAddress) {
  var opts;
  if ('object' == typeof host) {
    // >= v0.11.x API
    opts = host;
    if (opts.host && opts.path) {
      // if both a `host` and `path` are specified then it's most likely the
      // result of a `url.parse()` call... we need to remove the `path` portion so
      // that `net.connect()` doesn't attempt to open that as a unix socket file.
      delete opts.path;
    }
  } else {
    // <= v0.10.x API
    opts = { host: host, port: port };
    if (null != localAddress) {
      opts.localAddress = localAddress;
    }
  }

  // hint to use "Connection: close"
  // XXX: non-documented `http` module API :(
  req._last = true;
  req.shouldKeepAlive = false;

  // create the `net.Socket` instance
  var sync = true;
  this.callback(req, opts, function (err, socket) {
    function emitErr() {
      req.emit('error', err);
      // For Safety. Some additional errors might fire later on
      // and we need to make sure we don't double-fire the error event.
      req._hadError = true;
    }
    if (err) {
      if (sync) {
        // need to defer the "error" event, when sync, because by now the `req`
        // instance hasn't event been passed back to the user yet...
        process.nextTick(emitErr);
      } else {
        emitErr();
      }
    } else {
      req.onSocket(socket);
    }
  });
  sync = false;
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Detect Electron renderer process, which is node, but we should
 * treat as a browser.
 */

if (typeof process !== 'undefined' && process.type === 'renderer') {
  module.exports = __webpack_require__(18);
} else {
  module.exports = __webpack_require__(20);
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(19);

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0,
      i;

  for (i in namespace) {
    hash = (hash << 5) - hash + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_9__;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


Object.defineProperty(exports, "__esModule", { value: true });
var vscode_languageserver_1 = __webpack_require__(11);
var protocol_colorProvider_proposed_1 = __webpack_require__(12);
var request_light_1 = __webpack_require__(13);
var fs = __webpack_require__(8);
var vscode_uri_1 = __webpack_require__(24);
var URL = __webpack_require__(0);
var Strings = __webpack_require__(25);
var vscode_json_languageservice_1 = __webpack_require__(26);
var languageModelCache_1 = __webpack_require__(27);
var nls = __webpack_require__(9);
nls.config(process.env['VSCODE_NLS_CONFIG']);
var SchemaAssociationNotification;
(function (SchemaAssociationNotification) {
    SchemaAssociationNotification.type = new vscode_languageserver_1.NotificationType('json/schemaAssociations');
})(SchemaAssociationNotification || (SchemaAssociationNotification = {}));
var VSCodeContentRequest;
(function (VSCodeContentRequest) {
    VSCodeContentRequest.type = new vscode_languageserver_1.RequestType('vscode/content');
})(VSCodeContentRequest || (VSCodeContentRequest = {}));
var SchemaContentChangeNotification;
(function (SchemaContentChangeNotification) {
    SchemaContentChangeNotification.type = new vscode_languageserver_1.NotificationType('json/schemaContent');
})(SchemaContentChangeNotification || (SchemaContentChangeNotification = {}));
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
var clientSnippetSupport = false;
var clientDynamicRegisterSupport = false;
// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities.
connection.onInitialize(function (params) {
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
    var capabilities = {
        // Tell the client that the server works in FULL text document sync mode
        textDocumentSync: documents.syncKind,
        completionProvider: clientSnippetSupport ? { resolveProvider: true, triggerCharacters: ['"', ':'] } : null,
        hoverProvider: true,
        documentSymbolProvider: true,
        documentRangeFormattingProvider: false,
        colorProvider: true
    };
    return { capabilities: capabilities };
});
var workspaceContext = {
    resolveRelativePath: function (relativePath, resource) {
        return URL.resolve(resource, relativePath);
    }
};
var schemaRequestService = function (uri) {
    if (Strings.startsWith(uri, 'file://')) {
        var fsPath_1 = vscode_uri_1.default.parse(uri).fsPath;
        return new Promise(function (c, e) {
            fs.readFile(fsPath_1, 'UTF-8', function (err, result) {
                err ? e('') : c(result.toString());
            });
        });
    } else if (Strings.startsWith(uri, 'vscode://')) {
        return connection.sendRequest(VSCodeContentRequest.type, uri).then(function (responseText) {
            return responseText;
        }, function (error) {
            return error.message;
        });
    }
    if (uri.indexOf('//schema.management.azure.com/') !== -1) {
        connection.telemetry.logEvent({
            key: 'json.schema',
            value: {
                schemaURL: uri
            }
        });
    }
    var headers = { 'Accept-Encoding': 'gzip, deflate' };
    return request_light_1.xhr({ url: uri, followRedirects: 5, headers: headers }).then(function (response) {
        return response.responseText;
    }, function (error) {
        return Promise.reject(error.responseText || request_light_1.getErrorStatusDescription(error.status) || error.toString());
    });
};
// create the JSON language service
var languageService = vscode_json_languageservice_1.getLanguageService({
    schemaRequestService: schemaRequestService,
    workspaceContext: workspaceContext,
    contributions: []
});
var jsonConfigurationSettings = void 0;
var schemaAssociations = void 0;
var formatterRegistration = null;
// The settings have changed. Is send on server activation as well.
connection.onDidChangeConfiguration(function (change) {
    var settings = change.settings;
    request_light_1.configure(settings.http && settings.http.proxy, settings.http && settings.http.proxyStrictSSL);
    jsonConfigurationSettings = settings.json && settings.json.schemas;
    updateConfiguration();
    // dynamically enable & disable the formatter
    if (clientDynamicRegisterSupport) {
        var enableFormatter = settings && settings.json && settings.json.format && settings.json.format.enable;
        if (enableFormatter) {
            if (!formatterRegistration) {
                formatterRegistration = connection.client.register(vscode_languageserver_1.DocumentRangeFormattingRequest.type, { documentSelector: [{ language: 'json' }] });
            }
        } else if (formatterRegistration) {
            formatterRegistration.then(function (r) {
                return r.dispose();
            });
            formatterRegistration = null;
        }
    }
});
// The jsonValidation extension configuration has changed
connection.onNotification(SchemaAssociationNotification.type, function (associations) {
    schemaAssociations = associations;
    updateConfiguration();
});
// A schema has changed
connection.onNotification(SchemaContentChangeNotification.type, function (uri) {
    languageService.resetSchema(uri);
});
function updateConfiguration() {
    var languageSettings = {
        validate: true,
        allowComments: true,
        schemas: []
    };
    if (schemaAssociations) {
        for (var pattern in schemaAssociations) {
            var association = schemaAssociations[pattern];
            if (Array.isArray(association)) {
                association.forEach(function (uri) {
                    languageSettings.schemas.push({ uri: uri, fileMatch: [pattern] });
                });
            }
        }
    }
    if (jsonConfigurationSettings) {
        jsonConfigurationSettings.forEach(function (schema, index) {
            var uri = schema.url;
            if (!uri && schema.schema) {
                uri = schema.schema.id || "vscode://schemas/custom/" + index;
            }
            if (uri) {
                languageSettings.schemas.push({ uri: uri, fileMatch: schema.fileMatch, schema: schema.schema });
            }
        });
    }
    languageService.configure(languageSettings);
    // Revalidate any open text documents
    documents.all().forEach(triggerValidation);
}
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
var pendingValidationRequests = {};
var validationDelayMs = 200;
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
    if (textDocument.getText().length === 0) {
        // ignore empty documents
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: [] });
        return;
    }
    var jsonDocument = getJSONDocument(textDocument);
    languageService.doValidation(textDocument, jsonDocument).then(function (diagnostics) {
        // Send the computed diagnostics to VSCode.
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: diagnostics });
    });
}
connection.onDidChangeWatchedFiles(function (change) {
    // Monitored files have changed in VSCode
    var hasChanges = false;
    change.changes.forEach(function (c) {
        if (languageService.resetSchema(c.uri)) {
            hasChanges = true;
        }
    });
    if (hasChanges) {
        documents.all().forEach(validateTextDocument);
    }
});
var jsonDocuments = languageModelCache_1.getLanguageModelCache(10, 60, function (document) {
    return languageService.parseJSONDocument(document);
});
documents.onDidClose(function (e) {
    jsonDocuments.onDocumentRemoved(e.document);
});
connection.onShutdown(function () {
    jsonDocuments.dispose();
});
function getJSONDocument(document) {
    return jsonDocuments.get(document);
}
connection.onCompletion(function (textDocumentPosition) {
    var document = documents.get(textDocumentPosition.textDocument.uri);
    var jsonDocument = getJSONDocument(document);
    return languageService.doComplete(document, textDocumentPosition.position, jsonDocument);
});
connection.onCompletionResolve(function (completionItem) {
    return languageService.doResolve(completionItem);
});
connection.onHover(function (textDocumentPositionParams) {
    var document = documents.get(textDocumentPositionParams.textDocument.uri);
    var jsonDocument = getJSONDocument(document);
    return languageService.doHover(document, textDocumentPositionParams.position, jsonDocument);
});
connection.onDocumentSymbol(function (documentSymbolParams) {
    var document = documents.get(documentSymbolParams.textDocument.uri);
    var jsonDocument = getJSONDocument(document);
    return languageService.findDocumentSymbols(document, jsonDocument);
});
connection.onDocumentRangeFormatting(function (formatParams) {
    var document = documents.get(formatParams.textDocument.uri);
    return languageService.format(document, formatParams.range, formatParams.options);
});
connection.onRequest(protocol_colorProvider_proposed_1.DocumentColorRequest.type, function (params) {
    var document = documents.get(params.textDocument.uri);
    if (document) {
        var jsonDocument = getJSONDocument(document);
        return languageService.findDocumentColors(document, jsonDocument);
    }
    return [];
});
connection.onRequest(protocol_colorProvider_proposed_1.ColorPresentationRequest.type, function (params) {
    var document = documents.get(params.textDocument.uri);
    if (document) {
        var jsonDocument = getJSONDocument(document);
        return languageService.getColorPresentations(document, jsonDocument, params.colorInfo);
    }
    return [];
});
// Listen on the connection
connection.listen();
//# sourceMappingURL=jsonServerMain.js.map

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_11__;

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_12__;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


var url_1 = __webpack_require__(0);
var https = __webpack_require__(14);
var http = __webpack_require__(15);
var HttpProxyAgent = __webpack_require__(16);
var HttpsProxyAgent = __webpack_require__(22);
var zlib = __webpack_require__(23);
var nls = __webpack_require__(9);
nls.config(process.env['VSCODE_NLS_CONFIG']);
var localize = nls.loadMessageBundle();
var proxyUrl = null;
var strictSSL = true;
function configure(_proxyUrl, _strictSSL) {
    proxyUrl = _proxyUrl;
    strictSSL = _strictSSL;
}
exports.configure = configure;
function xhr(options) {
    var agent = getProxyAgent(options.url, { proxyUrl: proxyUrl, strictSSL: strictSSL });
    options = assign({}, options);
    options = assign(options, { agent: agent, strictSSL: strictSSL });
    if (typeof options.followRedirects !== 'number') {
        options.followRedirects = 5;
    }
    return request(options).then(function (result) {
        return new Promise(function (c, e) {
            var res = result.res;
            var readable = res;
            var encoding = res.headers && res.headers['content-encoding'];
            if (encoding === 'gzip') {
                var gunzip = zlib.createGunzip();
                res.pipe(gunzip);
                readable = gunzip;
            } else if (encoding === 'deflate') {
                var inflate = zlib.createInflate();
                res.pipe(inflate);
                readable = inflate;
            }
            var data = [];
            readable.on('data', function (c) {
                return data.push(c);
            });
            readable.on('end', function () {
                if (options.followRedirects > 0 && (res.statusCode >= 300 && res.statusCode <= 303 || res.statusCode === 307)) {
                    var location = res.headers['location'];
                    if (location) {
                        var newOptions = {
                            type: options.type, url: location, user: options.user, password: options.password, responseType: options.responseType, headers: options.headers,
                            timeout: options.timeout, followRedirects: options.followRedirects - 1, data: options.data
                        };
                        xhr(newOptions).then(c, e);
                        return;
                    }
                }
                var response = {
                    responseText: data.join(''),
                    status: res.statusCode
                };
                if (res.statusCode >= 200 && res.statusCode < 300 || res.statusCode === 1223) {
                    c(response);
                } else {
                    e(response);
                }
            });
        });
    }, function (err) {
        var message;
        if (agent) {
            message = localize('error.cannot.connect.proxy', 'Unable to to connect to {0} through a proxy . Error: {1}', options.url, err.message);
        } else {
            message = localize('error.cannot.connect', 'Unable to to connect to {0}. Error: {1}', options.url, err.message);
        }
        return Promise.reject({
            responseText: message,
            status: 404
        });
    });
}
exports.xhr = xhr;
function assign(destination) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    sources.forEach(function (source) {
        return Object.keys(source).forEach(function (key) {
            return destination[key] = source[key];
        });
    });
    return destination;
}
function request(options) {
    var req;
    return new Promise(function (c, e) {
        var endpoint = url_1.parse(options.url);
        var opts = {
            hostname: endpoint.hostname,
            port: endpoint.port ? parseInt(endpoint.port) : endpoint.protocol === 'https:' ? 443 : 80,
            path: endpoint.path,
            method: options.type || 'GET',
            headers: options.headers,
            agent: options.agent,
            rejectUnauthorized: typeof options.strictSSL === 'boolean' ? options.strictSSL : true
        };
        if (options.user && options.password) {
            opts.auth = options.user + ':' + options.password;
        }
        var handler = function (res) {
            if (res.statusCode >= 300 && res.statusCode < 400 && options.followRedirects && options.followRedirects > 0 && res.headers['location']) {
                c(request(assign({}, options, {
                    url: res.headers['location'],
                    followRedirects: options.followRedirects - 1
                })));
            } else {
                c({ req: req, res: res });
            }
        };
        if (endpoint.protocol === 'https:') {
            req = https.request(opts, handler);
        } else {
            req = http.request(opts, handler);
        }
        req.on('error', e);
        if (options.timeout) {
            req.setTimeout(options.timeout);
        }
        if (options.data) {
            req.write(options.data);
        }
        req.end();
    });
}
function getErrorStatusDescription(status) {
    if (status < 400) {
        return void 0;
    }
    switch (status) {
        case 400:
            return localize('status.400', 'Bad request. The request cannot be fulfilled due to bad syntax.');
        case 401:
            return localize('status.401', 'Unauthorized. The server is refusing to respond.');
        case 403:
            return localize('status.403', 'Forbidden. The server is refusing to respond.');
        case 404:
            return localize('status.404', 'Not Found. The requested location could not be found.');
        case 405:
            return localize('status.405', 'Method not allowed. A request was made using a request method not supported by that location.');
        case 406:
            return localize('status.406', 'Not Acceptable. The server can only generate a response that is not accepted by the client.');
        case 407:
            return localize('status.407', 'Proxy Authentication Required. The client must first authenticate itself with the proxy.');
        case 408:
            return localize('status.408', 'Request Timeout. The server timed out waiting for the request.');
        case 409:
            return localize('status.409', 'Conflict. The request could not be completed because of a conflict in the request.');
        case 410:
            return localize('status.410', 'Gone. The requested page is no longer available.');
        case 411:
            return localize('status.411', 'Length Required. The "Content-Length" is not defined.');
        case 412:
            return localize('status.412', 'Precondition Failed. The precondition given in the request evaluated to false by the server.');
        case 413:
            return localize('status.413', 'Request Entity Too Large. The server will not accept the request, because the request entity is too large.');
        case 414:
            return localize('status.414', 'Request-URI Too Long. The server will not accept the request, because the URL is too long.');
        case 415:
            return localize('status.415', 'Unsupported Media Type. The server will not accept the request, because the media type is not supported.');
        case 500:
            return localize('status.500', 'Internal Server Error.');
        case 501:
            return localize('status.501', 'Not Implemented. The server either does not recognize the request method, or it lacks the ability to fulfill the request.');
        case 503:
            return localize('status.503', 'Service Unavailable. The server is currently unavailable (overloaded or down).');
        default:
            return localize('status.416', 'HTTP status code {0}', status);
    }
}
exports.getErrorStatusDescription = getErrorStatusDescription;
// proxy handling
function getSystemProxyURI(requestURL) {
    if (requestURL.protocol === 'http:') {
        return process.env.HTTP_PROXY || process.env.http_proxy || null;
    } else if (requestURL.protocol === 'https:') {
        return process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy || null;
    }
    return null;
}
function getProxyAgent(rawRequestURL, options) {
    if (options === void 0) {
        options = {};
    }
    var requestURL = url_1.parse(rawRequestURL);
    var proxyURL = options.proxyUrl || getSystemProxyURI(requestURL);
    if (!proxyURL) {
        return null;
    }
    var proxyEndpoint = url_1.parse(proxyURL);
    if (!/^https?:$/.test(proxyEndpoint.protocol)) {
        return null;
    }
    var opts = {
        host: proxyEndpoint.hostname,
        port: Number(proxyEndpoint.port),
        auth: proxyEndpoint.auth,
        rejectUnauthorized: typeof options.strictSSL === 'boolean' ? options.strictSSL : true
    };
    return requestURL.protocol === 'http:' ? new HttpProxyAgent(opts) : new HttpsProxyAgent(opts);
}
//# sourceMappingURL=main.js.map

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("https");

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Module dependencies.
 */

var net = __webpack_require__(2);
var tls = __webpack_require__(3);
var url = __webpack_require__(0);
var extend = __webpack_require__(4);
var Agent = __webpack_require__(5);
var inherits = __webpack_require__(1).inherits;
var debug = __webpack_require__(6)('http-proxy-agent');

/**
 * Module exports.
 */

module.exports = HttpProxyAgent;

/**
 * The `HttpProxyAgent` implements an HTTP Agent subclass that connects to the
 * specified "HTTP proxy server" in order to proxy HTTP requests.
 *
 * @api public
 */

function HttpProxyAgent(opts) {
  if (!(this instanceof HttpProxyAgent)) return new HttpProxyAgent(opts);
  if ('string' == typeof opts) opts = url.parse(opts);
  if (!opts) throw new Error('an HTTP(S) proxy server `host` and `port` must be specified!');
  debug('creating new HttpProxyAgent instance: %j', opts);
  Agent.call(this, connect);

  var proxy = extend({}, opts);

  // if `true`, then connect to the proxy server over TLS. defaults to `false`.
  this.secureProxy = proxy.protocol ? /^https:?$/i.test(proxy.protocol) : false;

  // prefer `hostname` over `host`, and set the `port` if needed
  proxy.host = proxy.hostname || proxy.host;
  proxy.port = +proxy.port || (this.secureProxy ? 443 : 80);

  if (proxy.host && proxy.path) {
    // if both a `host` and `path` are specified then it's most likely the
    // result of a `url.parse()` call... we need to remove the `path` portion so
    // that `net.connect()` doesn't attempt to open that as a unix socket file.
    delete proxy.path;
    delete proxy.pathname;
  }

  this.proxy = proxy;
}
inherits(HttpProxyAgent, Agent);

/**
 * Default options for the "connect" opts object.
 */

var defaults = { port: 80 };

/**
 * Called when the node-core HTTP client library is creating a new HTTP request.
 *
 * @api public
 */

function connect(req, _opts, fn) {

  var proxy = this.proxy;
  var secureProxy = this.secureProxy;

  // these `opts` are the connect options to connect to the destination endpoint
  var opts = extend({}, defaults, _opts);

  // change the `http.ClientRequest` instance's "path" field
  // to the absolute path of the URL that will be requested
  var parsed = url.parse(req.path);
  if (null == parsed.protocol) parsed.protocol = 'http:';
  if (null == parsed.hostname) parsed.hostname = opts.hostname || opts.host;
  if (null == parsed.port) parsed.port = opts.port;
  if (parsed.port == defaults.port) {
    // if port is 80, then we can remove the port so that the
    // ":80" portion is not on the produced URL
    delete parsed.port;
  }
  var absolute = url.format(parsed);
  req.path = absolute;

  // inject the `Proxy-Authorization` header if necessary
  var auth = proxy.auth;
  if (auth) {
    req.setHeader('Proxy-Authorization', 'Basic ' + new Buffer(auth).toString('base64'));
  }

  // create a socket connection to the proxy server
  var socket;
  if (secureProxy) {
    socket = tls.connect(proxy);
  } else {
    socket = net.connect(proxy);
  }

  // at this point, the http ClientRequest's internal `_header` field might have
  // already been set. If this is the case then we'll need to re-generate the
  // string since we just changed the `req.path`
  if (req._header) {
    debug('regenerating stored HTTP header string for request');
    req._header = null;
    req._implicitHeader();
    if (req.output && req.output.length > 0) {
      debug('patching connection write() output buffer with updated header');
      // the _header has already been queued to be written to the socket
      var first = req.output[0];
      var endOfHeaders = first.indexOf('\r\n\r\n') + 4;
      req.output[0] = req._header + first.substring(endOfHeaders);
      debug('output buffer: %j', req.output);
    }
  }

  fn(null, socket);
};

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(7);
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome && 'undefined' != typeof chrome.storage ? chrome.storage.local : localstorage();

/**
 * Colors.
 */

exports.colors = ['lightseagreen', 'forestgreen', 'goldenrod', 'dodgerblue', 'darkorchid', 'crimson'];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return typeof document !== 'undefined' && document && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance ||
  // is firebug? http://stackoverflow.com/a/398120/376773
  typeof window !== 'undefined' && window && window.console && (window.console.firebug || window.console.exception && window.console.table) ||
  // is firefox >= v31?
  // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 ||
  // double check webkit in userAgent just in case we are in a worker
  typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function (v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '') + this.namespace + (useColors ? ' %c' : ' ') + args[0] + (useColors ? '%c ' : ' ') + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit');

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function (match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch (e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch (e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 10000) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') || plural(ms, h, 'hour') || plural(ms, m, 'minute') || plural(ms, s, 'second') || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Module dependencies.
 */

var tty = __webpack_require__(21);
var util = __webpack_require__(1);

/**
 * This is the Node.js implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(7);
exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return (/^debug_/i.test(key)
  );
}).reduce(function (obj, key) {
  // camel-case
  var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function (_, k) {
    return k.toUpperCase();
  });

  // coerce string value into JS value
  var val = process.env[key];
  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;else if (/^(no|off|false|disabled)$/i.test(val)) val = false;else if (val === 'null') val = null;else val = Number(val);

  obj[prop] = val;
  return obj;
}, {});

/**
 * The file descriptor to write the `debug()` calls to.
 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
 *
 *   $ DEBUG_FD=3 node script.js 3>debug.log
 */

var fd = parseInt(process.env.DEBUG_FD, 10) || 2;

if (1 !== fd && 2 !== fd) {
  util.deprecate(function () {}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')();
}

var stream = 1 === fd ? process.stdout : 2 === fd ? process.stderr : createWritableStdioStream(fd);

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(fd);
}

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

exports.formatters.o = function (v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts).replace(/\s*\n\s*/g, ' ');
};

/**
 * Map %o to `util.inspect()`, allowing multiple lines if needed.
 */

exports.formatters.O = function (v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var name = this.namespace;
  var useColors = this.useColors;

  if (useColors) {
    var c = this.color;
    var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';

    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
  } else {
    args[0] = new Date().toUTCString() + ' ' + name + ' ' + args[0];
  }
}

/**
 * Invokes `util.format()` with the specified arguments and writes to `stream`.
 */

function log() {
  return stream.write(util.format.apply(util, arguments) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  if (null == namespaces) {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  } else {
    process.env.DEBUG = namespaces;
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  return process.env.DEBUG;
}

/**
 * Copied from `node/src/node.js`.
 *
 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
 */

function createWritableStdioStream(fd) {
  var stream;
  var tty_wrap = process.binding('tty_wrap');

  // Note stream._type is used for test-module-load-list.js

  switch (tty_wrap.guessHandleType(fd)) {
    case 'TTY':
      stream = new tty.WriteStream(fd);
      stream._type = 'tty';

      // Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    case 'FILE':
      var fs = __webpack_require__(8);
      stream = new fs.SyncWriteStream(fd, { autoClose: false });
      stream._type = 'fs';
      break;

    case 'PIPE':
    case 'TCP':
      var net = __webpack_require__(2);
      stream = new net.Socket({
        fd: fd,
        readable: false,
        writable: true
      });

      // FIXME Should probably have an option in net.Socket to create a
      // stream from an existing fd which is writable only. But for now
      // we'll just add this hack and set the `readable` member to false.
      // Test: ./node test/fixtures/echo.js < /etc/passwd
      stream.readable = false;
      stream.read = null;
      stream._type = 'pipe';

      // FIXME Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    default:
      // Probably an error on in uv_guess_handle()
      throw new Error('Implement me. Unknown stream file type!');
  }

  // For supporting legacy API we put the FD here.
  stream.fd = fd;

  stream._isStdio = true;

  return stream;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init(debug) {
  debug.inspectOpts = util._extend({}, exports.inspectOpts);
}

/**
 * Enable namespaces listed in `process.env.DEBUG` initially.
 */

exports.enable(load());

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("tty");

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Module dependencies.
 */

var net = __webpack_require__(2);
var tls = __webpack_require__(3);
var url = __webpack_require__(0);
var extend = __webpack_require__(4);
var Agent = __webpack_require__(5);
var inherits = __webpack_require__(1).inherits;
var debug = __webpack_require__(6)('https-proxy-agent');

/**
 * Module exports.
 */

module.exports = HttpsProxyAgent;

/**
 * The `HttpsProxyAgent` implements an HTTP Agent subclass that connects to the
 * specified "HTTP(s) proxy server" in order to proxy HTTPS requests.
 *
 * @api public
 */

function HttpsProxyAgent(opts) {
  if (!(this instanceof HttpsProxyAgent)) return new HttpsProxyAgent(opts);
  if ('string' == typeof opts) opts = url.parse(opts);
  if (!opts) throw new Error('an HTTP(S) proxy server `host` and `port` must be specified!');
  debug('creating new HttpsProxyAgent instance: %j', opts);
  Agent.call(this, connect);

  var proxy = extend({}, opts);

  // if `true`, then connect to the proxy server over TLS. defaults to `false`.
  this.secureProxy = proxy.protocol ? /^https:?$/i.test(proxy.protocol) : false;

  // if `true`, then connect to the destination endpoint over TLS, defaults to `true`
  this.secureEndpoint = opts.secureEndpoint !== false;

  // prefer `hostname` over `host`, and set the `port` if needed
  proxy.host = proxy.hostname || proxy.host;
  proxy.port = +proxy.port || (this.secureProxy ? 443 : 80);

  if (proxy.host && proxy.path) {
    // if both a `host` and `path` are specified then it's most likely the
    // result of a `url.parse()` call... we need to remove the `path` portion so
    // that `net.connect()` doesn't attempt to open that as a unix socket file.
    delete proxy.path;
    delete proxy.pathname;
  }

  this.proxy = proxy;
}
inherits(HttpsProxyAgent, Agent);

/**
 * Default options for the "connect" opts object.
 */

var defaults = { port: 80 };
var secureDefaults = { port: 443 };

/**
 * Called when the node-core HTTP client library is creating a new HTTP request.
 *
 * @api public
 */

function connect(req, _opts, fn) {

  var proxy = this.proxy;
  var secureProxy = this.secureProxy;
  var secureEndpoint = this.secureEndpoint;

  // create a socket connection to the proxy server
  var socket;
  if (secureProxy) {
    socket = tls.connect(proxy);
  } else {
    socket = net.connect(proxy);
  }

  // these `opts` are the connect options to connect to the destination endpoint
  // XXX: we mix in the proxy options so that TLS options like
  // `rejectUnauthorized` get passed to the destination endpoint as well
  var proxyOpts = extend({}, proxy);
  delete proxyOpts.host;
  delete proxyOpts.hostname;
  delete proxyOpts.port;
  var opts = extend({}, proxyOpts, secureEndpoint ? secureDefaults : defaults, _opts);

  // we need to buffer any HTTP traffic that happens with the proxy before we get
  // the CONNECT response, so that if the response is anything other than an "200"
  // response code, then we can re-play the "data" events on the socket once the
  // HTTP parser is hooked up...
  var buffers = [];
  var buffersLength = 0;

  function read() {
    var b = socket.read();
    if (b) ondata(b);else socket.once('readable', read);
  }

  function cleanup() {
    socket.removeListener('data', ondata);
    socket.removeListener('end', onend);
    socket.removeListener('error', onerror);
    socket.removeListener('close', onclose);
    socket.removeListener('readable', read);
  }

  function onclose(err) {
    debug('onclose had error', err);
  }

  function onend() {
    debug('onend');
  }

  function onerror(err) {
    cleanup();
    fn(err);
  }

  function ondata(b) {
    buffers.push(b);
    buffersLength += b.length;
    var buffered = Buffer.concat(buffers, buffersLength);
    var str = buffered.toString('ascii');

    if (!~str.indexOf('\r\n\r\n')) {
      // keep buffering
      debug('have not received end of HTTP headers yet...');
      if (socket.read) {
        read();
      } else {
        socket.once('data', ondata);
      }
      return;
    }

    var firstLine = str.substring(0, str.indexOf('\r\n'));
    var statusCode = +firstLine.split(' ')[1];
    debug('got proxy server response: "%s"', firstLine);
    //console.log('statusCode: %d', statusCode);
    //console.log(b.length, b, b.toString());

    if (200 == statusCode) {
      // 200 Connected status code!
      var sock = socket;

      // nullify the buffered data since we won't be needing it
      buffers = buffered = null;

      if (secureEndpoint) {
        // since the proxy is connecting to an SSL server, we have
        // to upgrade this socket connection to an SSL connection
        debug('upgrading proxy-connected socket to TLS connection: "%s"', opts.host);
        opts.socket = socket;
        opts.servername = opts.host;
        opts.host = null;
        opts.hostname = null;
        opts.port = null;
        sock = tls.connect(opts);
      }

      cleanup();
      fn(null, sock);
    } else {
      // some other status code that's not 200... need to re-play the HTTP header
      // "data" events onto the socket once the HTTP machinery is attached so that
      // the user can parse and handle the error status code
      cleanup();

      // save a reference to the concat'd Buffer for the `onsocket` callback
      buffers = buffered;

      // need to wait for the "socket" event to re-play the "data" events
      req.once('socket', onsocket);
      fn(null, socket);
    }
  }

  function onsocket(socket) {
    // replay the "buffers" Buffer onto the `socket`, since at this point
    // the HTTP module machinery has been hooked up for the user
    if ('function' == typeof socket.ondata) {
      // node <= v0.11.3, the `ondata` function is set on the socket
      socket.ondata(buffers, 0, buffers.length);
    } else if (socket.listeners('data').length > 0) {
      // node > v0.11.3, the "data" event is listened for directly
      socket.emit('data', buffers);
    } else {
      // never?
      throw new Error('should not happen...');
    }

    // nullify the cached Buffer instance
    buffers = null;
  }

  socket.on('error', onerror);
  socket.on('close', onclose);
  socket.on('end', onend);

  if (socket.read) {
    read();
  } else {
    socket.once('data', ondata);
  }

  var hostname = opts.host + ':' + opts.port;
  var msg = 'CONNECT ' + hostname + ' HTTP/1.1\r\n';
  var auth = proxy.auth;
  if (auth) {
    msg += 'Proxy-Authorization: Basic ' + new Buffer(auth).toString('base64') + '\r\n';
  }
  msg += 'Host: ' + hostname + '\r\n' + 'Connection: close\r\n' + '\r\n';
  socket.write(msg);
};

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require("zlib");

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_24__;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


Object.defineProperty(exports, "__esModule", { value: true });
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
/**
 * Determines if haystack ends with needle.
 */
function endsWith(haystack, needle) {
    var diff = haystack.length - needle.length;
    if (diff > 0) {
        return haystack.lastIndexOf(needle) === diff;
    } else if (diff === 0) {
        return haystack === needle;
    } else {
        return false;
    }
}
exports.endsWith = endsWith;
function convertSimple2RegExpPattern(pattern) {
    return pattern.replace(/[\-\\\{\}\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&').replace(/[\*]/g, '.*');
}
exports.convertSimple2RegExpPattern = convertSimple2RegExpPattern;
//# sourceMappingURL=strings.js.map

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_26__;

/***/ }),
/* 27 */
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