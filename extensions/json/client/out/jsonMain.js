/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var vscode_1 = require("vscode");
var vscode_languageclient_1 = require("vscode-languageclient");
var vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
var proposed_1 = require("vscode-languageclient/lib/proposed");
var protocol_colorProvider_proposed_1 = require("vscode-languageserver-protocol/lib/protocol.colorProvider.proposed");
var nls = require("vscode-nls");
var localize = nls.loadMessageBundle();
var VSCodeContentRequest;
(function (VSCodeContentRequest) {
    VSCodeContentRequest.type = new vscode_languageclient_1.RequestType('vscode/content');
})(VSCodeContentRequest || (VSCodeContentRequest = {}));
var SchemaAssociationNotification;
(function (SchemaAssociationNotification) {
    SchemaAssociationNotification.type = new vscode_languageclient_1.NotificationType('json/schemaAssociations');
})(SchemaAssociationNotification || (SchemaAssociationNotification = {}));
var ColorFormat_HEX = {
    opaque: '"#{red:X}{green:X}{blue:X}"',
    transparent: '"#{red:X}{green:X}{blue:X}{alpha:X}"'
};
function activate(context) {
    var packageInfo = getPackageInfo(context);
    var telemetryReporter = packageInfo && new vscode_extension_telemetry_1.default(packageInfo.name, packageInfo.version, packageInfo.aiKey);
    context.subscriptions.push(telemetryReporter);
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
                didChangeConfiguration: function () { return client.sendNotification(vscode_languageclient_1.DidChangeConfigurationNotification.type, { settings: getSettings() }); }
            }
        }
    };
    // Create the language client and start the client.
    var client = new vscode_languageclient_1.LanguageClient('json', localize('jsonserver.name', 'JSON Language Server'), serverOptions, clientOptions);
    client.registerFeature(new proposed_1.ConfigurationFeature(client));
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
        // register color provider
        context.subscriptions.push(vscode_1.languages.registerColorProvider(documentSelector, {
            provideDocumentColors: function (document) {
                var params = client.code2ProtocolConverter.asDocumentSymbolParams(document);
                return client.sendRequest(protocol_colorProvider_proposed_1.DocumentColorRequest.type, params).then(function (symbols) {
                    return symbols.map(function (symbol) {
                        var range = client.protocol2CodeConverter.asRange(symbol.range);
                        var color = new vscode_1.Color(symbol.color.red * 255, symbol.color.green * 255, symbol.color.blue * 255, symbol.color.alpha);
                        return new vscode_1.ColorRange(range, color, [ColorFormat_HEX]);
                    });
                });
            }
        }));
    });
    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(disposable);
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
                    var fileMatch = jv.fileMatch, url = jv.url;
                    if (fileMatch && url) {
                        if (url[0] === '.' && url[1] === '/') {
                            url = vscode_1.Uri.file(path.join(extension.extensionPath, url)).toString();
                        }
                        if (fileMatch[0] === '%') {
                            fileMatch = fileMatch.replace(/%APP_SETTINGS_HOME%/, '/User');
                            fileMatch = fileMatch.replace(/%APP_WORKSPACES_HOME%/, '/Workspaces');
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
function getSettings() {
    var httpSettings = vscode_1.workspace.getConfiguration('http');
    var jsonSettings = vscode_1.workspace.getConfiguration('json');
    var schemas = [];
    var settings = {
        http: {
            proxy: httpSettings.get('proxy'),
            proxyStrictSSL: httpSettings.get('proxyStrictSSL')
        },
        json: {
            format: jsonSettings.get('format'),
            schemas: schemas,
        }
    };
    var settingsSchemas = jsonSettings.get('schemas');
    if (Array.isArray(settingsSchemas)) {
        schemas.push.apply(schemas, settingsSchemas);
    }
    var folders = vscode_1.workspace.workspaceFolders;
    if (folders) {
        folders.forEach(function (folder) {
            var jsonConfig = vscode_1.workspace.getConfiguration('json', folder.uri);
            var schemaConfigInfo = jsonConfig.inspect('schemas');
            var folderSchemas = schemaConfigInfo.workspaceFolderValue;
            if (Array.isArray(folderSchemas)) {
                folderSchemas.forEach(function (schema) {
                    var url = schema.url;
                    if (!url && schema.schema) {
                        url = schema.schema.id;
                    }
                    if (url && url[0] === '.') {
                        url = vscode_1.Uri.file(path.normalize(path.join(folder.uri.fsPath, url))).toString();
                    }
                    var fileMatch = schema.fileMatch;
                    if (fileMatch) {
                        fileMatch = fileMatch.map(function (m) { return folder.uri.toString() + '*' + m; });
                    }
                    schemas.push({ url: url, fileMatch: fileMatch, schema: schema.schema });
                });
            }
            ;
        });
    }
    return settings;
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