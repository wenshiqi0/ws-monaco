/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var vscode_languageserver_1 = require("vscode-languageserver");
var languageModes_1 = require("./modes/languageModes");
var formatting_1 = require("./modes/formatting");
var url = require("url");
var path = require("path");
var vscode_uri_1 = require("vscode-uri");
var nls = require("vscode-nls");
nls.config(process.env['VSCODE_NLS_CONFIG']);
var ColorSymbolRequest;
(function (ColorSymbolRequest) {
    ColorSymbolRequest.type = new vscode_languageserver_1.RequestType('css/colorSymbols');
})(ColorSymbolRequest || (ColorSymbolRequest = {}));
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
var settings = {};
var clientSnippetSupport = false;
var clientDynamicRegisterSupport = false;
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
    return {
        capabilities: {
            // Tell the client that the server works in FULL text document sync mode
            textDocumentSync: documents.syncKind,
            completionProvider: clientDynamicRegisterSupport ? { resolveProvider: true, triggerCharacters: ['.', ':', '<', '"', '=', '/'] } : null,
            hoverProvider: true,
            documentHighlightProvider: true,
            documentRangeFormattingProvider: false,
            documentLinkProvider: { resolveProvider: false },
            documentSymbolProvider: true,
            definitionProvider: true,
            signatureHelpProvider: { triggerCharacters: ['('] },
            referencesProvider: true,
        }
    };
});
var validation = {
    html: true,
    css: true,
    javascript: true
};
var formatterRegistration = null;
// The settings have changed. Is send on server activation as well.
connection.onDidChangeConfiguration(function (change) {
    settings = change.settings;
    var validationSettings = settings && settings.html && settings.html.validate || {};
    validation.css = validationSettings.styles !== false;
    validation.javascript = validationSettings.scripts !== false;
    languageModes.getAllModes().forEach(function (m) {
        if (m.configure) {
            m.configure(change.settings);
        }
    });
    documents.all().forEach(triggerValidation);
    // dynamically enable & disable the formatter
    if (clientDynamicRegisterSupport) {
        var enableFormatter = settings && settings.html && settings.html.format && settings.html.format.enable;
        if (enableFormatter) {
            if (!formatterRegistration) {
                var documentSelector = [{ language: 'html' }, { language: 'handlebars' }]; // don't register razor, the formatter does more harm than good
                formatterRegistration = connection.client.register(vscode_languageserver_1.DocumentRangeFormattingRequest.type, { documentSelector: documentSelector });
            }
        }
        else if (formatterRegistration) {
            formatterRegistration.then(function (r) { return r.dispose(); });
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
function validateTextDocument(textDocument) {
    var diagnostics = [];
    if (textDocument.languageId === 'html') {
        languageModes.getAllModesInDocument(textDocument).forEach(function (mode) {
            if (mode.doValidation && validation[mode.getId()]) {
                pushAll(diagnostics, mode.doValidation(textDocument));
            }
        });
    }
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: diagnostics });
}
function pushAll(to, from) {
    if (from) {
        for (var i = 0; i < from.length; i++) {
            to.push(from[i]);
        }
    }
}
connection.onCompletion(function (textDocumentPosition) {
    var document = documents.get(textDocumentPosition.textDocument.uri);
    var mode = languageModes.getModeAtPosition(document, textDocumentPosition.position);
    if (mode && mode.doComplete) {
        if (mode.getId() !== 'html') {
            connection.telemetry.logEvent({ key: 'html.embbedded.complete', value: { languageId: mode.getId() } });
        }
        return mode.doComplete(document, textDocumentPosition.position);
    }
    return { isIncomplete: true, items: [] };
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
    var document = documents.get(formatParams.textDocument.uri);
    var unformattedTags = settings && settings.html && settings.html.format && settings.html.format.unformatted || '';
    var enabledModes = { css: !unformattedTags.match(/\bstyle\b/), javascript: !unformattedTags.match(/\bscript\b/) };
    return formatting_1.format(languageModes, document, formatParams.range, formatParams.options, enabledModes);
});
connection.onDocumentLinks(function (documentLinkParam) {
    var document = documents.get(documentLinkParam.textDocument.uri);
    var documentContext = {
        resolveReference: function (ref) {
            if (workspacePath && ref[0] === '/') {
                return vscode_uri_1.default.file(path.join(workspacePath, ref)).toString();
            }
            return url.resolve(document.uri, ref);
        }
    };
    var links = [];
    languageModes.getAllModesInDocument(document).forEach(function (m) {
        if (m.findDocumentLinks) {
            pushAll(links, m.findDocumentLinks(document, documentContext));
        }
    });
    return links;
});
connection.onDocumentSymbol(function (documentSymbolParms) {
    var document = documents.get(documentSymbolParms.textDocument.uri);
    var symbols = [];
    languageModes.getAllModesInDocument(document).forEach(function (m) {
        if (m.findDocumentSymbols) {
            pushAll(symbols, m.findDocumentSymbols(document));
        }
    });
    return symbols;
});
connection.onRequest(ColorSymbolRequest.type, function (uri) {
    var ranges = [];
    var document = documents.get(uri);
    if (document) {
        languageModes.getAllModesInDocument(document).forEach(function (m) {
            if (m.findColorSymbols) {
                pushAll(ranges, m.findColorSymbols(document));
            }
        });
    }
    return ranges;
});
// Listen on the connection
connection.listen();
//# sourceMappingURL=htmlServerMain.js.map