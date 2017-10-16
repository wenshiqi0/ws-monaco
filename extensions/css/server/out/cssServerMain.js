/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var vscode_languageserver_1 = require("vscode-languageserver");
var protocol_configuration_proposed_1 = require("vscode-languageserver-protocol/lib/protocol.configuration.proposed");
var protocol_colorProvider_proposed_1 = require("vscode-languageserver-protocol/lib/protocol.colorProvider.proposed");
var vscode_css_languageservice_1 = require("vscode-css-languageservice");
var languageModelCache_1 = require("./languageModelCache");
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
var stylesheets = languageModelCache_1.getLanguageModelCache(10, 60, function (document) { return getLanguageService(document).parseStylesheet(document); });
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
            promise = connection.sendRequest(protocol_configuration_proposed_1.ConfigurationRequest.type, configRequestParam).then(function (s) { return s[0]; });
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
    require('fs').appendFileSync('/Users/munong/Downloads/edit.log', JSON.stringify(textEdit));
    require('fs').appendFileSync('/Users/munong/Downloads/docs.log', JSON.stringify(document));
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