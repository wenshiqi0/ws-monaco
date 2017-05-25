/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var path = require("path");
var vscode_1 = require("vscode");
var vscode_languageclient_1 = require("vscode-languageclient");
var vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
var colorDecorators_1 = require("./colorDecorators");
var nls = require("vscode-nls");
var localize = nls.loadMessageBundle();
var VSCodeContentRequest;
(function (VSCodeContentRequest) {
    VSCodeContentRequest.type = new vscode_languageclient_1.RequestType('vscode/content');
})(VSCodeContentRequest || (VSCodeContentRequest = {}));
var ColorSymbolRequest;
(function (ColorSymbolRequest) {
    ColorSymbolRequest.type = new vscode_languageclient_1.RequestType('json/colorSymbols');
})(ColorSymbolRequest || (ColorSymbolRequest = {}));
var SchemaAssociationNotification;
(function (SchemaAssociationNotification) {
    SchemaAssociationNotification.type = new vscode_languageclient_1.NotificationType('json/schemaAssociations');
})(SchemaAssociationNotification || (SchemaAssociationNotification = {}));
function activate(context) {
    var packageInfo = getPackageInfo(context);
    var telemetryReporter = packageInfo && new vscode_extension_telemetry_1.default(packageInfo.name, packageInfo.version, packageInfo.aiKey);
    context.subscriptions.push(telemetryReporter);
    // The server is implemented in node
    var serverModule = context.asAbsolutePath(path.join('server', 'out', 'jsonServerMain.js'));
    // The debug options for the server
    var debugOptions = { execArgv: ['--nolazy', '--debug=6004'] };
    // If the extension is launch in debug mode the debug server options are use
    // Otherwise the run options are used
    var serverOptions = {
        run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
        debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
    };
    // Options to control the language client
    var clientOptions = {
        // Register the server for json documents
        documentSelector: ['json'],
        synchronize: {
            // Synchronize the setting section 'json' to the server
            configurationSection: ['json', 'http.proxy', 'http.proxyStrictSSL'],
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/*.json')
        }
    };
    // Create the language client and start the client.
    var client = new vscode_languageclient_1.LanguageClient('json', localize('jsonserver.name', 'JSON Language Server'), serverOptions, clientOptions);
    var disposable = client.start();
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
        client.sendNotification(SchemaAssociationNotification.type, getSchemaAssociation(context));
        var colorRequestor = function (uri) {
            return client.sendRequest(ColorSymbolRequest.type, uri).then(function (ranges) { return ranges.map(client.protocol2CodeConverter.asRange); });
        };
        var isDecoratorEnabled = function (languageId) {
            return vscode_1.workspace.getConfiguration().get(languageId + '.colorDecorators.enable');
        };
        disposable = colorDecorators_1.activateColorDecorations(colorRequestor, { json: true }, isDecoratorEnabled);
        context.subscriptions.push(disposable);
    });
    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(disposable);
    vscode_1.languages.setLanguageConfiguration('json', {
        wordPattern: /("(?:[^\\\"]*(?:\\.)?)*"?)|[^\s{}\[\],:]+/
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
                    var fileMatch = jv.fileMatch, url = jv.url;
                    if (fileMatch && url) {
                        if (url[0] === '.' && url[1] === '/') {
                            url = vscode_1.Uri.file(path.join(extension.extensionPath, url)).toString();
                        }
                        if (fileMatch[0] === '%') {
                            fileMatch = fileMatch.replace(/%APP_SETTINGS_HOME%/, '/User');
                        }
                        else if (fileMatch.charAt(0) !== '/' && !fileMatch.match(/\w+:\/\//)) {
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
//# sourceMappingURL=jsonMain.js.map