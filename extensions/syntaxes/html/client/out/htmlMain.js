/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var path = require("path");
var vscode_1 = require("vscode");
var vscode_languageclient_1 = require("vscode-languageclient");
var htmlEmptyTagsShared_1 = require("./htmlEmptyTagsShared");
var colorDecorators_1 = require("./colorDecorators");
var vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
var nls = require("vscode-nls");
var localize = nls.loadMessageBundle();
var ColorSymbolRequest;
(function (ColorSymbolRequest) {
    ColorSymbolRequest.type = new vscode_languageclient_1.RequestType('css/colorSymbols');
})(ColorSymbolRequest || (ColorSymbolRequest = {}));
function activate(context) {
    var packageInfo = getPackageInfo(context);
    var telemetryReporter = packageInfo && new vscode_extension_telemetry_1.default(packageInfo.name, packageInfo.version, packageInfo.aiKey);
    context.subscriptions.push(telemetryReporter);
    // The server is implemented in node
    var serverModule = context.asAbsolutePath(path.join('server', 'out', 'htmlServerMain.js'));
    // The debug options for the server
    var debugOptions = { execArgv: ['--nolazy', '--debug=6004'] };
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
            configurationSection: ['html', 'css', 'javascript'],
        },
        initializationOptions: {
            embeddedLanguages: embeddedLanguages
        }
    };
    // Create the language client and start the client.
    var client = new vscode_languageclient_1.LanguageClient('html', localize('htmlserver.name', 'HTML Language Server'), serverOptions, clientOptions);
    var disposable = client.start();
    context.subscriptions.push(disposable);
    client.onReady().then(function () {
        var colorRequestor = function (uri) {
            return client.sendRequest(ColorSymbolRequest.type, uri).then(function (ranges) { return ranges.map(client.protocol2CodeConverter.asRange); });
        };
        var isDecoratorEnabled = function (languageId) {
            return vscode_1.workspace.getConfiguration().get('css.colorDecorators.enable');
        };
        var disposable = colorDecorators_1.activateColorDecorations(colorRequestor, { html: true, handlebars: true, razor: true }, isDecoratorEnabled);
        context.subscriptions.push(disposable);
        client.onTelemetry(function (e) {
            if (telemetryReporter) {
                telemetryReporter.sendTelemetryEvent(e.key, e.data);
            }
        });
    });
    vscode_1.languages.setLanguageConfiguration('html', {
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
        onEnterRules: [
            {
                beforeText: new RegExp("<(?!(?:" + htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|') + "))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
                afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
                action: { indentAction: vscode_1.IndentAction.IndentOutdent }
            },
            {
                beforeText: new RegExp("<(?!(?:" + htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|') + "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
                action: { indentAction: vscode_1.IndentAction.Indent }
            }
        ],
    });
    vscode_1.languages.setLanguageConfiguration('handlebars', {
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
        onEnterRules: [
            {
                beforeText: new RegExp("<(?!(?:" + htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|') + "))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
                afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
                action: { indentAction: vscode_1.IndentAction.IndentOutdent }
            },
            {
                beforeText: new RegExp("<(?!(?:" + htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|') + "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
                action: { indentAction: vscode_1.IndentAction.Indent }
            }
        ],
    });
    vscode_1.languages.setLanguageConfiguration('razor', {
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
        onEnterRules: [
            {
                beforeText: new RegExp("<(?!(?:" + htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|') + "))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
                afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
                action: { indentAction: vscode_1.IndentAction.IndentOutdent }
            },
            {
                beforeText: new RegExp("<(?!(?:" + htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|') + "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
                action: { indentAction: vscode_1.IndentAction.Indent }
            }
        ],
    });
}
exports.activate = activate;
function getPackageInfo(context) {
    var extensionPackage = require(context.asAbsolutePath('./package.json'));
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