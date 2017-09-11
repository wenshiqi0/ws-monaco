/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var vscode_1 = require("vscode");
var vscode_languageclient_1 = require("vscode-languageclient");
var htmlEmptyTagsShared_1 = require("./htmlEmptyTagsShared");
var tagClosing_1 = require("./tagClosing");
var vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
var proposed_1 = require("vscode-languageclient/lib/proposed");
var protocol_colorProvider_proposed_1 = require("vscode-languageserver-protocol/lib/protocol.colorProvider.proposed");
var nls = require("vscode-nls");
var localize = nls.loadMessageBundle();
var TagCloseRequest;
(function (TagCloseRequest) {
    TagCloseRequest.type = new vscode_languageclient_1.RequestType('html/tag');
})(TagCloseRequest || (TagCloseRequest = {}));
var CSSColorFormats = {
    Hex: '#{red:X}{green:X}{blue:X}',
    RGB: {
        opaque: 'rgb({red:d[0-255]}, {green:d[0-255]}, {blue:d[0-255]})',
        transparent: 'rgba({red:d[0-255]}, {green:d[0-255]}, {blue:d[0-255]}, {alpha})'
    },
    HSL: {
        opaque: 'hsl({hue:d[0-360]}, {saturation:d[0-100]}%, {luminance:d[0-100]}%)',
        transparent: 'hsla({hue:d[0-360]}, {saturation:d[0-100]}%, {luminance:d[0-100]}%, {alpha})'
    }
};
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
            configurationSection: ['html', 'css', 'javascript'],
        },
        initializationOptions: {
            embeddedLanguages: embeddedLanguages
        }
    };
    // Create the language client and start the client.
    var client = new vscode_languageclient_1.LanguageClient('html', localize('htmlserver.name', 'HTML Language Server'), serverOptions, clientOptions);
    client.registerFeature(new proposed_1.ConfigurationFeature(client));
    var disposable = client.start();
    toDispose.push(disposable);
    client.onReady().then(function () {
        disposable = vscode_1.languages.registerColorProvider(documentSelector, {
            provideDocumentColors: function (document) {
                var params = client.code2ProtocolConverter.asDocumentSymbolParams(document);
                return client.sendRequest(protocol_colorProvider_proposed_1.DocumentColorRequest.type, params).then(function (symbols) {
                    return symbols.map(function (symbol) {
                        var range = client.protocol2CodeConverter.asRange(symbol.range);
                        var color = new vscode_1.Color(symbol.color.red * 255, symbol.color.green * 255, symbol.color.blue * 255, symbol.color.alpha);
                        return new vscode_1.ColorRange(range, color, [CSSColorFormats.Hex, CSSColorFormats.RGB, CSSColorFormats.HSL]);
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