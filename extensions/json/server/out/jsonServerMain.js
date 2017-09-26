/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var vscode_languageserver_1 = require("vscode-languageserver");
var protocol_colorProvider_proposed_1 = require("vscode-languageserver-protocol/lib/protocol.colorProvider.proposed");
var request_light_1 = require("request-light");
var path = require("path");
var fs = require("fs");
var uri_1 = require("./utils/uri");
var URL = require("url");
var Strings = require("./utils/strings");
var vscode_json_languageservice_1 = require("vscode-json-languageservice");
var languageModelCache_1 = require("./languageModelCache");
var nls = require("vscode-nls");
nls.config(process.env['VSCODE_NLS_CONFIG']);
var SchemaAssociationNotification;
(function (SchemaAssociationNotification) {
    SchemaAssociationNotification.type = new vscode_languageserver_1.NotificationType('json/schemaAssociations');
})(SchemaAssociationNotification || (SchemaAssociationNotification = {}));
var VSCodeContentRequest;
(function (VSCodeContentRequest) {
    VSCodeContentRequest.type = new vscode_languageserver_1.RequestType('vscode/content');
})(VSCodeContentRequest || (VSCodeContentRequest = {}));
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
var workspaceRoot;
connection.onInitialize(function (params) {
    workspaceRoot = uri_1.default.parse(params.rootPath);
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
        var fsPath_1 = uri_1.default.parse(uri).fsPath;
        return new Promise(function (c, e) {
            fs.readFile(fsPath_1, 'UTF-8', function (err, result) {
                err ? e('') : c(result.toString());
            });
        });
    }
    else if (Strings.startsWith(uri, 'vscode://')) {
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
        }
        else if (formatterRegistration) {
            formatterRegistration.then(function (r) { return r.dispose(); });
            formatterRegistration = null;
        }
    }
});
// The jsonValidation extension configuration has changed
connection.onNotification(SchemaAssociationNotification.type, function (associations) {
    schemaAssociations = associations;
    updateConfiguration();
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
        jsonConfigurationSettings.forEach(function (schema) {
            var uri = schema.url;
            if (!uri && schema.schema) {
                uri = schema.schema.id;
            }
            if (!uri && schema.fileMatch) {
                uri = 'vscode://schemas/custom/' + encodeURIComponent(schema.fileMatch.join('&'));
            }
            if (uri) {
                if (uri[0] === '.' && workspaceRoot) {
                    // workspace relative path
                    uri = uri_1.default.file(path.normalize(path.join(workspaceRoot.fsPath, uri))).toString();
                }
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
var jsonDocuments = languageModelCache_1.getLanguageModelCache(10, 60, function (document) { return languageService.parseJSONDocument(document); });
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
// Listen on the connection
connection.listen();
//# sourceMappingURL=jsonServerMain.js.map