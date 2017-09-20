/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const eslintrc = [
    '{',
    '    "env": {',
    '        "browser": true,',
    '        "commonjs": true,',
    '        "es6": true,',
    '        "node": true',
    '    },',
    '    "parserOptions": {',
    '        "ecmaFeatures": {',
    '            "jsx": true',
    '        },',
    '        "sourceType": "module"',
    '    },',
    '    "rules": {',
    '        "no-const-assign": "warn",',
    '        "no-this-before-super": "warn",',
    '        "no-undef": "warn",',
    '        "no-unreachable": "warn",',
    '        "no-unused-vars": "warn",',
    '        "constructor-super": "warn",',
    '        "valid-typeof": "warn"',
    '    }',
    '}'
].join(process.platform === 'win32' ? '\r\n' : '\n');
var Is;
(function (Is) {
    const toString = Object.prototype.toString;
    function boolean(value) {
        return value === true || value === false;
    }
    Is.boolean = boolean;
    function string(value) {
        return toString.call(value) === '[object String]';
    }
    Is.string = string;
})(Is || (Is = {}));
var ValidateItem;
(function (ValidateItem) {
    function is(item) {
        let candidate = item;
        return candidate && Is.string(candidate.language) && (Is.boolean(candidate.autoFix) || candidate.autoFix === void 0);
    }
    ValidateItem.is = is;
})(ValidateItem || (ValidateItem = {}));
var Status;
(function (Status) {
    Status[Status["ok"] = 1] = "ok";
    Status[Status["warn"] = 2] = "warn";
    Status[Status["error"] = 3] = "error";
})(Status || (Status = {}));
var StatusNotification;
(function (StatusNotification) {
    StatusNotification.type = new vscode_languageclient_1.NotificationType('eslint/status');
})(StatusNotification || (StatusNotification = {}));
var NoConfigRequest;
(function (NoConfigRequest) {
    NoConfigRequest.type = new vscode_languageclient_1.RequestType('eslint/noConfig');
})(NoConfigRequest || (NoConfigRequest = {}));
var NoESLintLibraryRequest;
(function (NoESLintLibraryRequest) {
    NoESLintLibraryRequest.type = new vscode_languageclient_1.RequestType('eslint/noLibrary');
})(NoESLintLibraryRequest || (NoESLintLibraryRequest = {}));
const exitCalled = new vscode_languageclient_1.NotificationType('eslint/exitCalled');
function enable() {
    if (!vscode_1.workspace.rootPath) {
        vscode_1.window.showErrorMessage('ESLint can only be enabled if VS Code is opened on a workspace folder.');
        return;
    }
    vscode_1.workspace.getConfiguration('eslint').update('enable', true, false);
}
function disable() {
    if (!vscode_1.workspace.rootPath) {
        vscode_1.window.showErrorMessage('ESLint can only be disabled if VS Code is opened on a workspace folder.');
        return;
    }
    vscode_1.workspace.getConfiguration('eslint').update('enable', false, false);
}
function createDefaultConfiguration() {
    if (!vscode_1.workspace.rootPath) {
        vscode_1.window.showErrorMessage('An ESLint configuration can only be generated if VS Code is opened on a workspace folder.');
        return;
    }
    let eslintConfigFile = path.join(vscode_1.workspace.rootPath, '.eslintrc.json');
    if (!fs.existsSync(eslintConfigFile)) {
        fs.writeFileSync(eslintConfigFile, eslintrc, { encoding: 'utf8' });
    }
}
let dummyCommands;
function activate(context) {
    let supportedLanguages;

    function configurationChanged() {
        supportedLanguages = new Set();
        let settings = vscode_1.workspace.getConfiguration('eslint');
        if (settings) {
            let toValidate = settings.get('validate', undefined);
            if (toValidate && Array.isArray(toValidate)) {
                toValidate.forEach(item => {
                    if (Is.string(item)) {
                        supportedLanguages.add(item);
                    }
                    else if (ValidateItem.is(item)) {
                        supportedLanguages.add(item.language);
                    }
                });
            }
        }
    }
    configurationChanged();
    const configurationListener = vscode_1.workspace.onDidChangeConfiguration(configurationChanged);
    let activated;
    let notValidating = () => vscode_1.window.showInformationMessage('ESLint is not validating any files yet.');
    dummyCommands = [
        vscode_1.commands.registerCommand('eslint.executeAutofix', notValidating),
        vscode_1.commands.registerCommand('eslint.showOutputChannel', notValidating)
    ];
    function didOpenTextDocument(textDocument) {

        if (supportedLanguages.has(textDocument.languageId)) {
            configurationListener.dispose();
            openListener.dispose();
            activated = true;

            realActivate(context);
        }
    }
    ;
    const openListener = vscode_1.workspace.onDidOpenTextDocument(didOpenTextDocument);
    for (let textDocument of vscode_1.workspace.textDocuments) {
        if (activated) {
            break;
        }
        didOpenTextDocument(textDocument);
    }
    context.subscriptions.push(vscode_1.commands.registerCommand('eslint.createConfig', createDefaultConfiguration), vscode_1.commands.registerCommand('eslint.enable', enable), vscode_1.commands.registerCommand('eslint.disable', disable));
}
exports.activate = activate;
function realActivate(context) {
    let statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right, 0);
    let eslintStatus = Status.ok;
    let serverRunning = false;
    statusBarItem.text = 'ESLint';
    statusBarItem.command = 'eslint.showOutputChannel';
    function showStatusBarItem(show) {
        if (show) {
            statusBarItem.show();
        }
        else {
            statusBarItem.hide();
        }
    }
    function updateStatus(status) {
        switch (status) {
            case Status.ok:
                statusBarItem.color = undefined;
                break;
            case Status.warn:
                statusBarItem.color = 'yellow';
                break;
            case Status.error:
                statusBarItem.color = 'darkred';
                break;
        }
        eslintStatus = status;
        udpateStatusBarVisibility(vscode_1.window.activeTextEditor);
    }
    function udpateStatusBarVisibility(editor) {
        statusBarItem.text = eslintStatus === Status.ok ? 'ESLint' : 'ESLint!';
        showStatusBarItem(serverRunning &&
            (eslintStatus !== Status.ok ||
                (editor && (editor.document.languageId === 'javascript' || editor.document.languageId === 'javascriptreact'))));
    }
    vscode_1.window.onDidChangeActiveTextEditor(udpateStatusBarVisibility);
    udpateStatusBarVisibility(vscode_1.window.activeTextEditor);
    // We need to go one level up since an extension compile the js code into
    // the output folder.
    // serverModule
    let serverModule = path.join(__dirname, '..', 'server', 'server.js');
    let debugOptions = { execArgv: ["--nolazy", "--debug=6010"] };
    let serverOptions = {
        run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
        debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
    };
    let defaultErrorHandler;
    let serverCalledProcessExit = false;
    let staticDocuments = [
        { scheme: 'file', pattern: '**/package.json' },
        { scheme: 'file', pattern: '**/.eslintr{c.js,c.yaml,c.yml,c,c.json' }
    ];
    let languages = ['javascript', 'javascriptreact'];
    let clientOptions = {
        documentSelector: staticDocuments,
        diagnosticCollectionName: 'eslint',
        revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Never,
        synchronize: {
            configurationSection: 'eslint',
            fileEvents: [
                vscode_1.workspace.createFileSystemWatcher('**/.eslintr{c.js,c.yaml,c.yml,c,c.json}'),
                vscode_1.workspace.createFileSystemWatcher('**/.eslintignore'),
                vscode_1.workspace.createFileSystemWatcher('**/package.json')
            ]
        },
        initializationOptions: () => {
            let configuration = vscode_1.workspace.getConfiguration('eslint');
            return {
                legacyModuleResolve: configuration ? configuration.get('_legacyModuleResolve', false) : false,
                nodePath: configuration ? configuration.get('nodePath', undefined) : undefined,
                languageIds: configuration ? configuration.get('valiadate', languages) : languages
            };
        },
        initializationFailedHandler: (error) => {
            client.error('Server initialization failed.', error);
            client.outputChannel.show(true);
            return false;
        },
        errorHandler: {
            error: (error, message, count) => {
                return defaultErrorHandler.error(error, message, count);
            },
            closed: () => {
                if (serverCalledProcessExit) {
                    return vscode_languageclient_1.CloseAction.DoNotRestart;
                }
                return defaultErrorHandler.closed();
            }
        },
        middleware: {
            provideCodeActions: (document, range, context, token, next) => {
                if (!context.diagnostics || context.diagnostics.length === 0) {
                    return [];
                }
                let eslintDiagnostics = [];
                for (let diagnostic of context.diagnostics) {
                    if (diagnostic.source === 'eslint') {
                        eslintDiagnostics.push(diagnostic);
                    }
                }
                if (eslintDiagnostics.length === 0) {
                    return [];
                }
                let newContext = Object.assign({}, context);

                newContext.diagnostics = eslintDiagnostics

                return next(document, range, newContext, token);
            }
        }
    };
    let client = new vscode_languageclient_1.LanguageClient('ESLint', serverOptions, clientOptions);
    defaultErrorHandler = client.createDefaultErrorHandler();
    const running = 'ESLint server is running.';
    const stopped = 'ESLint server stopped.';
    client.onDidChangeState((event) => {
        if (event.newState === vscode_languageclient_1.State.Running) {
            client.info(running);
            statusBarItem.tooltip = running;
            serverRunning = true;
        }
        else {
            client.info(stopped);
            statusBarItem.tooltip = stopped;
            serverRunning = false;
        }
        udpateStatusBarVisibility(vscode_1.window.activeTextEditor);
    });
    client.onReady().then(() => {
        client.onNotification(StatusNotification.type, (params) => {
            updateStatus(params.state);
        });
        client.onNotification(exitCalled, (params) => {
            serverCalledProcessExit = true;
            client.error(`Server process exited with code ${params[0]}. This usually indicates a misconfigured ESLint setup.`, params[1]);
            vscode_1.window.showErrorMessage(`ESLint server shut down itself. See 'ESLint' output channel for details.`);
        });
        client.onRequest(NoConfigRequest.type, (params) => {
            let document = vscode_1.Uri.parse(params.document.uri);
            let location = document.fsPath;
            if (vscode_1.workspace.rootPath && document.fsPath.indexOf(vscode_1.workspace.rootPath) === 0) {
                location = document.fsPath.substr(vscode_1.workspace.rootPath.length + 1);
            }
            client.warn([
                '',
                `No ESLint configuration (e.g .eslintrc) found for file: ${location}`,
                `File will not be validated. Consider running the 'Create .eslintrc.json file' command.`,
                `Alternatively you can disable ESLint for this workspace by executing the 'Disable ESLint for this workspace' command.`
            ].join('\n'));
            eslintStatus = Status.warn;
            udpateStatusBarVisibility(vscode_1.window.activeTextEditor);
            return {};
        });
        client.onRequest(NoESLintLibraryRequest.type, (params) => {
            const key = 'noESLintMessageShown';
            let state = context.globalState.get(key, {});
            let uri = vscode_1.Uri.parse(params.source.uri);
            if (vscode_1.workspace.rootPath) {
                client.info([
                    '',
                    `Failed to load the ESLint library for the document ${uri.fsPath}`,
                    '',
                    'To use ESLint in this workspace please install eslint using \'npm install eslint\' or globally using \'npm install -g eslint\'.',
                    'You need to reopen the workspace after installing eslint.',
                    '',
                    `Alternatively you can disable ESLint for this workspace by executing the 'Disable ESLint for this workspace' command.`
                ].join('\n'));
                if (!state.workspaces) {
                    state.workspaces = Object.create(null);
                }
                if (!state.workspaces[vscode_1.workspace.rootPath]) {
                    state.workspaces[vscode_1.workspace.rootPath] = true;
                    client.outputChannel.show(true);
                    context.globalState.update(key, state);
                }
            }
            else {
                client.info([
                    `Failed to load the ESLint library for the document ${uri.fsPath}`,
                    'To use ESLint for single JavaScript file install eslint globally using \'npm install -g eslint\'.',
                    'You need to reopen VS Code after installing eslint.',
                ].join('\n'));
                if (!state.global) {
                    state.global = true;
                    client.outputChannel.show(true);
                    context.globalState.update(key, state);
                }
            }
            return {};
        });
    });
    if (dummyCommands) {
        dummyCommands.forEach(command => command.dispose());
        dummyCommands = undefined;
    }
    context.subscriptions.push(new vscode_languageclient_1.SettingMonitor(client, 'eslint.enable').start(), vscode_1.commands.registerCommand('eslint.executeAutofix', () => {
        let textEditor = vscode_1.window.activeTextEditor;
        if (!textEditor) {
            return;
        }
        let textDocument = {
            uri: textEditor.document.uri.toString(),
            version: textEditor.document.version
        };
        let params = {
            command: 'eslint.applyAutoFix',
            arguments: [textDocument]
        };
        client.sendRequest(vscode_languageclient_1.ExecuteCommandRequest.type, params).then(undefined, () => {
            vscode_1.window.showErrorMessage('Failed to apply ESLint fixes to the document. Please consider opening an issue with steps to reproduce.');
        });
    }), vscode_1.commands.registerCommand('eslint.showOutputChannel', () => { client.outputChannel.show(); }), statusBarItem);
}
exports.realActivate = realActivate;
function deactivate() {
    if (dummyCommands) {
        dummyCommands.forEach(command => command.dispose());
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map