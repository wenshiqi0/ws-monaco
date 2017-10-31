/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var vscode_1 = require("vscode");
var vscode_languageclient_1 = require("vscode-languageclient");
var configuration_proposed_1 = require("vscode-languageclient/lib/configuration.proposed");
var protocol_colorProvider_proposed_1 = require("vscode-languageserver-protocol/lib/protocol.colorProvider.proposed");
var nls = require("vscode-nls");
var localize = nls.loadMessageBundle();
// this method is called when vs code is activated
function activate(context) {
    // The server is implemented in node
    var serverModule = context.asAbsolutePath(path.join('server', 'out', 'cssServerMain.js'));
    // The debug options for the server
    var debugOptions = { execArgv: ['--nolazy', '--inspect=6004'] };
    // If the extension is launch in debug mode the debug server options are use
    // Otherwise the run options are used
    var serverOptions = {
        run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
        debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
    };
    var documentSelector = ['css', 'scss', 'less'];
    // Options to control the language client
    var clientOptions = {
        documentSelector: documentSelector,
        synchronize: {
            configurationSection: ['css', 'scss', 'less']
        },
        initializationOptions: {}
    };
    // Create the language client and start the client.
    var client = new vscode_languageclient_1.LanguageClient('css', localize('cssserver.name', 'CSS Language Server'), serverOptions, clientOptions);
    client.registerFeature(new configuration_proposed_1.ConfigurationFeature(client));
    var disposable = client.start();
    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(disposable);
    client.onReady().then(function (_) {
        // register color provider
        context.subscriptions.push(vscode_1.languages.registerColorProvider(documentSelector, {
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
            provideColorPresentations: function (document, colorInfo) {
                var params = {
                    textDocument: client.code2ProtocolConverter.asTextDocumentIdentifier(document),
                    colorInfo: { range: client.code2ProtocolConverter.asRange(colorInfo.range), color: colorInfo.color }
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
    var indentationRules = {
        increaseIndentPattern: /(^.*\{[^}]*$)/,
        decreaseIndentPattern: /^\s*\}/
    };
    vscode_1.languages.setLanguageConfiguration('css', {
        wordPattern: /(#?-?\d*\.\d\w*%?)|(::?[\w-]*(?=[^,{;]*[,{]))|(([@#.!])?[\w-?]+%?|[@#!.])/g,
        indentationRules: indentationRules
    });
    vscode_1.languages.setLanguageConfiguration('less', {
        wordPattern: /(#?-?\d*\.\d\w*%?)|(::?[\w-]+(?=[^,{;]*[,{]))|(([@#.!])?[\w-?]+%?|[@#!.])/g,
        indentationRules: indentationRules
    });
    vscode_1.languages.setLanguageConfiguration('scss', {
        wordPattern: /(#?-?\d*\.\d\w*%?)|(::?[\w-]*(?=[^,{;]*[,{]))|(([@$#.!])?[\w-?]+%?|[@#!$.])/g,
        indentationRules: indentationRules
    });
    vscode_1.commands.registerCommand('_css.applyCodeAction', applyCodeAction);
    function applyCodeAction(uri, documentVersion, edits) {
        var textEditor = vscode_1.window.activeTextEditor;
        if (textEditor && textEditor.document.uri.toString() === uri) {
            if (textEditor.document.version !== documentVersion) {
                vscode_1.window.showInformationMessage("CSS fix is outdated and can't be applied to the document.");
            }
            textEditor.edit(function (mutator) {
                for (var _i = 0, edits_1 = edits; _i < edits_1.length; _i++) {
                    var edit = edits_1[_i];
                    mutator.replace(client.protocol2CodeConverter.asRange(edit.range), edit.newText);
                }
            }).then(function (success) {
                if (!success) {
                    vscode_1.window.showErrorMessage('Failed to apply CSS fix to the document. Please consider opening an issue with steps to reproduce.');
                }
            });
        }
    }
}
exports.activate = activate;
//# sourceMappingURL=cssMain.js.map