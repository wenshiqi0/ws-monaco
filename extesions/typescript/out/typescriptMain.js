"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
 * Includes code from typescript-sublime-plugin project, obtained from
 * https://github.com/Microsoft/TypeScript-Sublime-Plugin/blob/master/TypeScript%20Indent.tmPreferences
 * ------------------------------------------------------------------------------------------ */

const vscode_1 = require("vscode");
// This must be the first statement otherwise modules might got loaded with
// the wrong locale.
const nls = require("vscode-nls");
nls.config({ locale: vscode_1.env.language });
const localize = nls.loadMessageBundle();
const path = require("path");
const PConst = require("./protocol.const");
const typescriptServiceClient_1 = require("./typescriptServiceClient");
const hoverProvider_1 = require("./features/hoverProvider");
const definitionProvider_1 = require("./features/definitionProvider");
const implementationProvider_1 = require("./features/implementationProvider");
const typeDefinitionProvider_1 = require("./features/typeDefinitionProvider");
const documentHighlightProvider_1 = require("./features/documentHighlightProvider");
const referenceProvider_1 = require("./features/referenceProvider");
const documentSymbolProvider_1 = require("./features/documentSymbolProvider");
const signatureHelpProvider_1 = require("./features/signatureHelpProvider");
const renameProvider_1 = require("./features/renameProvider");
const formattingProvider_1 = require("./features/formattingProvider");
const bufferSyncSupport_1 = require("./features/bufferSyncSupport");
const completionItemProvider_1 = require("./features/completionItemProvider");
const workspaceSymbolProvider_1 = require("./features/workspaceSymbolProvider");
const codeActionProvider_1 = require("./features/codeActionProvider");
const refactorProvider_1 = require("./features/refactorProvider");
const referencesCodeLensProvider_1 = require("./features/referencesCodeLensProvider");
const jsDocCompletionProvider_1 = require("./features/jsDocCompletionProvider");
const directiveCommentCompletionProvider_1 = require("./features/directiveCommentCompletionProvider");
const taskProvider_1 = require("./features/taskProvider");
const implementationsCodeLensProvider_1 = require("./features/implementationsCodeLensProvider");
const ProjectStatus = require("./utils/projectStatus");
const typingsStatus_1 = require("./utils/typingsStatus");
const versionStatus_1 = require("./utils/versionStatus");
const plugins_1 = require("./utils/plugins");
const tsconfig_1 = require("./utils/tsconfig");
var ProjectConfigAction;
(function (ProjectConfigAction) {
    ProjectConfigAction[ProjectConfigAction["None"] = 0] = "None";
    ProjectConfigAction[ProjectConfigAction["CreateConfig"] = 1] = "CreateConfig";
    ProjectConfigAction[ProjectConfigAction["LearnMore"] = 2] = "LearnMore";
})(ProjectConfigAction || (ProjectConfigAction = {}));
const MODE_ID_TS = 'typescript';
const MODE_ID_TSX = 'typescriptreact';
const MODE_ID_JS = 'javascript';
const MODE_ID_JSX = 'javascriptreact';
const standardLanguageDescriptions = [
    {
        id: 'typescript',
        diagnosticSource: 'ts',
        modeIds: [MODE_ID_TS, MODE_ID_TSX],
        configFile: 'tsconfig.json'
    }, {
        id: 'javascript',
        diagnosticSource: 'js',
        modeIds: [MODE_ID_JS, MODE_ID_JSX],
        configFile: 'jsconfig.json'
    }
];
function activate(context) {
    const plugins = plugins_1.getContributedTypeScriptServerPlugins();
    const lazyClientHost = (() => {
        let clientHost;
        return () => {
            if (!clientHost) {
                clientHost = new TypeScriptServiceClientHost(standardLanguageDescriptions, context.workspaceState, plugins);
                context.subscriptions.push(clientHost);
                const host = clientHost;
                clientHost.serviceClient.onReady().then(() => {
                    context.subscriptions.push(ProjectStatus.create(host.serviceClient, path => new Promise(resolve => setTimeout(() => resolve(host.handles(path)), 750)), context.workspaceState));
                }, () => {
                    // Nothing to do here. The client did show a message;
                });
            }
            return clientHost;
        };
    })();
    context.subscriptions.push(vscode_1.commands.registerCommand('typescript.reloadProjects', () => {
        lazyClientHost().reloadProjects();
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand('javascript.reloadProjects', () => {
        lazyClientHost().reloadProjects();
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand('typescript.selectTypeScriptVersion', () => {
        lazyClientHost().serviceClient.onVersionStatusClicked();
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand('typescript.openTsServerLog', () => {
        lazyClientHost().serviceClient.openTsServerLogFile();
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand('typescript.restartTsServer', () => {
        lazyClientHost().serviceClient.restartTsServer();
    }));
    context.subscriptions.push(new taskProvider_1.default(() => lazyClientHost().serviceClient));
    const goToProjectConfig = (isTypeScript) => {
        const editor = vscode_1.window.activeTextEditor;
        if (editor) {
            lazyClientHost().goToProjectConfig(isTypeScript, editor.document.uri);
        }
    };
    context.subscriptions.push(vscode_1.commands.registerCommand('typescript.goToProjectConfig', goToProjectConfig.bind(null, true)));
    context.subscriptions.push(vscode_1.commands.registerCommand('javascript.goToProjectConfig', goToProjectConfig.bind(null, false)));
    const jsDocCompletionCommand = new jsDocCompletionProvider_1.TryCompleteJsDocCommand(() => lazyClientHost().serviceClient);
    context.subscriptions.push(vscode_1.commands.registerCommand(jsDocCompletionProvider_1.TryCompleteJsDocCommand.COMMAND_NAME, jsDocCompletionCommand.tryCompleteJsDoc, jsDocCompletionCommand));
    const supportedLanguage = [].concat.apply([], standardLanguageDescriptions.map(x => x.modeIds).concat(plugins.map(x => x.languages)));
    function didOpenTextDocument(textDocument) {
        if (supportedLanguage.indexOf(textDocument.languageId) >= 0) {
            openListener.dispose();
            // Force activation
            void lazyClientHost();
            return true;
        }
        return false;
    }
    const openListener = vscode_1.workspace.onDidOpenTextDocument(didOpenTextDocument);
    for (let textDocument of vscode_1.workspace.textDocuments) {
        if (didOpenTextDocument(textDocument)) {
            break;
        }
    }
}
exports.activate = activate;
const validateSetting = 'validate.enable';
class LanguageProvider {
    constructor(client, description) {
        this.client = client;
        this.description = description;
        this.toUpdateOnConfigurationChanged = [];
        this._validate = true;
        this.disposables = [];
        this.versionDependentDisposables = [];
        this.bufferSyncSupport = new bufferSyncSupport_1.default(client, description.modeIds, {
            delete: (file) => {
                this.currentDiagnostics.delete(client.asUrl(file));
            }
        });
        this.syntaxDiagnostics = Object.create(null);
        this.currentDiagnostics = vscode_1.languages.createDiagnosticCollection(description.id);
        this.typingsStatus = new typingsStatus_1.default(client);
        new typingsStatus_1.AtaProgressReporter(client);
        vscode_1.workspace.onDidChangeConfiguration(this.configurationChanged, this, this.disposables);
        this.configurationChanged();
        client.onReady().then(() => {
            this.registerProviders(client);
            this.bufferSyncSupport.listen();
        }, () => {
            // Nothing to do here. The client did show a message;
        });
    }
    dispose() {
        if (this.formattingProviderRegistration) {
            this.formattingProviderRegistration.dispose();
        }
        while (this.disposables.length) {
            const obj = this.disposables.pop();
            if (obj) {
                obj.dispose();
            }
        }
        while (this.versionDependentDisposables.length) {
            const obj = this.versionDependentDisposables.pop();
            if (obj) {
                obj.dispose();
            }
        }
        this.typingsStatus.dispose();
        this.currentDiagnostics.dispose();
        this.bufferSyncSupport.dispose();
    }
    registerProviders(client) {
        const selector = this.description.modeIds;
        const config = vscode_1.workspace.getConfiguration(this.id);
        const completionItemProvider = new completionItemProvider_1.default(client, this.typingsStatus);
        completionItemProvider.updateConfiguration();
        this.toUpdateOnConfigurationChanged.push(completionItemProvider);
        this.disposables.push(vscode_1.languages.registerCompletionItemProvider(selector, completionItemProvider, '.'));
        this.disposables.push(vscode_1.languages.registerCompletionItemProvider(selector, new directiveCommentCompletionProvider_1.DirectiveCommentCompletionProvider(client), '@'));
        this.formattingProvider = new formattingProvider_1.default(client);
        this.formattingProvider.updateConfiguration(config);
        this.disposables.push(vscode_1.languages.registerOnTypeFormattingEditProvider(selector, this.formattingProvider, ';', '}', '\n'));
        if (this.formattingProvider.isEnabled()) {
            this.formattingProviderRegistration = vscode_1.languages.registerDocumentRangeFormattingEditProvider(selector, this.formattingProvider);
        }
        const jsDocCompletionProvider = new jsDocCompletionProvider_1.JsDocCompletionProvider(client);
        jsDocCompletionProvider.updateConfiguration();
        this.disposables.push(vscode_1.languages.registerCompletionItemProvider(selector, jsDocCompletionProvider, '*'));
        this.disposables.push(vscode_1.languages.registerHoverProvider(selector, new hoverProvider_1.default(client)));
        this.disposables.push(vscode_1.languages.registerDefinitionProvider(selector, new definitionProvider_1.default(client)));
        this.disposables.push(vscode_1.languages.registerDocumentHighlightProvider(selector, new documentHighlightProvider_1.default(client)));
        this.disposables.push(vscode_1.languages.registerReferenceProvider(selector, new referenceProvider_1.default(client)));
        this.disposables.push(vscode_1.languages.registerDocumentSymbolProvider(selector, new documentSymbolProvider_1.default(client)));
        this.disposables.push(vscode_1.languages.registerSignatureHelpProvider(selector, new signatureHelpProvider_1.default(client), '(', ','));
        this.disposables.push(vscode_1.languages.registerRenameProvider(selector, new renameProvider_1.default(client)));
        this.disposables.push(vscode_1.languages.registerCodeActionsProvider(selector, new codeActionProvider_1.default(client, this.description.id)));
        this.disposables.push(vscode_1.languages.registerCodeActionsProvider(selector, new refactorProvider_1.default(client, this.description.id)));
        this.registerVersionDependentProviders();
        this.description.modeIds.forEach(modeId => {
            this.disposables.push(vscode_1.languages.registerWorkspaceSymbolProvider(new workspaceSymbolProvider_1.default(client, modeId)));
            const referenceCodeLensProvider = new referencesCodeLensProvider_1.default(client, modeId);
            referenceCodeLensProvider.updateConfiguration();
            this.toUpdateOnConfigurationChanged.push(referenceCodeLensProvider);
            this.disposables.push(vscode_1.languages.registerCodeLensProvider(selector, referenceCodeLensProvider));
            const implementationCodeLensProvider = new implementationsCodeLensProvider_1.default(client, modeId);
            implementationCodeLensProvider.updateConfiguration();
            this.toUpdateOnConfigurationChanged.push(implementationCodeLensProvider);
            this.disposables.push(vscode_1.languages.registerCodeLensProvider(selector, implementationCodeLensProvider));
            this.disposables.push(vscode_1.languages.setLanguageConfiguration(modeId, {
                indentationRules: {
                    // ^(.*\*/)?\s*\}.*$
                    decreaseIndentPattern: /^(.*\*\/)?\s*[\}|\]|\)].*$/,
                    // ^.*\{[^}"']*$
                    increaseIndentPattern: /^.*(\{[^}"'`]*|\([^)"'`]*|\[[^\]"'`]*)$/,
                    indentNextLinePattern: /^\s*(for|while|if|else)\b(?!.*[;{}]\s*(\/\/.*|\/[*].*[*]\/\s*)?$)/
                },
                wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
                onEnterRules: [
                    {
                        // e.g. /** | */
                        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                        afterText: /^\s*\*\/$/,
                        action: { indentAction: vscode_1.IndentAction.IndentOutdent, appendText: ' * ' }
                    }, {
                        // e.g. /** ...|
                        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                        action: { indentAction: vscode_1.IndentAction.None, appendText: ' * ' }
                    }, {
                        // e.g.  * ...|
                        beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                        action: { indentAction: vscode_1.IndentAction.None, appendText: '* ' }
                    }, {
                        // e.g.  */|
                        beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
                        action: { indentAction: vscode_1.IndentAction.None, removeText: 1 }
                    },
                    {
                        // e.g.  *-----*/|
                        beforeText: /^(\t|(\ \ ))*\ \*[^/]*\*\/\s*$/,
                        action: { indentAction: vscode_1.IndentAction.None, removeText: 1 }
                    }
                ]
            }));
            const EMPTY_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'];
            this.disposables.push(vscode_1.languages.setLanguageConfiguration('jsx-tags', {
                wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
                onEnterRules: [
                    {
                        beforeText: new RegExp(`<(?!(?:${EMPTY_ELEMENTS.join('|')}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                        afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
                        action: { indentAction: vscode_1.IndentAction.IndentOutdent }
                    },
                    {
                        beforeText: new RegExp(`<(?!(?:${EMPTY_ELEMENTS.join('|')}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                        action: { indentAction: vscode_1.IndentAction.Indent }
                    }
                ],
            }));
        });
    }
    configurationChanged() {
        const config = vscode_1.workspace.getConfiguration(this.id);
        this.updateValidate(config.get(validateSetting, true));
        if (this.formattingProvider) {
            this.formattingProvider.updateConfiguration(config);
            if (!this.formattingProvider.isEnabled() && this.formattingProviderRegistration) {
                this.formattingProviderRegistration.dispose();
                this.formattingProviderRegistration = null;
            }
            else if (this.formattingProvider.isEnabled() && !this.formattingProviderRegistration) {
                this.formattingProviderRegistration = vscode_1.languages.registerDocumentRangeFormattingEditProvider(this.description.modeIds, this.formattingProvider);
            }
        }
        for (const toUpdate of this.toUpdateOnConfigurationChanged) {
            toUpdate.updateConfiguration();
        }
    }
    handles(file, doc) {
        if (doc && this.description.modeIds.indexOf(doc.languageId) >= 0) {
            return true;
        }
        if (this.bufferSyncSupport.handles(file)) {
            return true;
        }
        const basename = path.basename(file);
        if (!!basename && basename === this.description.configFile) {
            return true;
        }
        return false;
    }
    get id() {
        return this.description.id;
    }
    get diagnosticSource() {
        return this.description.diagnosticSource;
    }
    updateValidate(value) {
        if (this._validate === value) {
            return;
        }
        this._validate = value;
        this.bufferSyncSupport.validate = value;
        if (value) {
            this.triggerAllDiagnostics();
        }
        else {
            this.syntaxDiagnostics = Object.create(null);
            this.currentDiagnostics.clear();
        }
    }
    reInitialize() {
        this.currentDiagnostics.clear();
        this.syntaxDiagnostics = Object.create(null);
        this.bufferSyncSupport.reOpenDocuments();
        this.bufferSyncSupport.requestAllDiagnostics();
        this.registerVersionDependentProviders();
    }
    registerVersionDependentProviders() {
        while (this.versionDependentDisposables.length) {
            const obj = this.versionDependentDisposables.pop();
            if (obj) {
                obj.dispose();
            }
        }
        this.versionDependentDisposables = [];
        if (!this.client) {
            return;
        }
        const selector = this.description.modeIds;
        if (this.client.apiVersion.has220Features()) {
            this.versionDependentDisposables.push(vscode_1.languages.registerImplementationProvider(selector, new implementationProvider_1.default(this.client)));
        }
        if (this.client.apiVersion.has213Features()) {
            this.versionDependentDisposables.push(vscode_1.languages.registerTypeDefinitionProvider(selector, new typeDefinitionProvider_1.default(this.client)));
        }
    }
    triggerAllDiagnostics() {
        this.bufferSyncSupport.requestAllDiagnostics();
    }
    syntaxDiagnosticsReceived(file, diagnostics) {
        this.syntaxDiagnostics[file] = diagnostics;
    }
    semanticDiagnosticsReceived(file, diagnostics) {
        const syntaxMarkers = this.syntaxDiagnostics[file];
        if (syntaxMarkers) {
            delete this.syntaxDiagnostics[file];
            diagnostics = syntaxMarkers.concat(diagnostics);
        }
        this.currentDiagnostics.set(this.client.asUrl(file), diagnostics);
    }
    configFileDiagnosticsReceived(file, diagnostics) {
        this.currentDiagnostics.set(this.client.asUrl(file), diagnostics);
    }
}
class TypeScriptServiceClientHost {
    constructor(descriptions, workspaceState, plugins) {
        this.languages = [];
        this.disposables = [];
        const handleProjectCreateOrDelete = () => {
            this.client.execute('reloadProjects', null, false);
            this.triggerAllDiagnostics();
        };
        const handleProjectChange = () => {
            setTimeout(() => {
                this.triggerAllDiagnostics();
            }, 1500);
        };
        const configFileWatcher = vscode_1.workspace.createFileSystemWatcher('**/[tj]sconfig.json');
        this.disposables.push(configFileWatcher);
        configFileWatcher.onDidCreate(handleProjectCreateOrDelete, this, this.disposables);
        configFileWatcher.onDidDelete(handleProjectCreateOrDelete, this, this.disposables);
        configFileWatcher.onDidChange(handleProjectChange, this, this.disposables);
        this.versionStatus = new versionStatus_1.default();
        this.disposables.push(this.versionStatus);
        this.client = new typescriptServiceClient_1.default(this, workspaceState, this.versionStatus, plugins, this.disposables);
        this.languagePerId = new Map();
        for (const description of descriptions) {
            const manager = new LanguageProvider(this.client, description);
            this.languages.push(manager);
            this.disposables.push(manager);
            this.languagePerId.set(description.id, manager);
        }
        this.client.onReady().then(() => {
            if (!this.client.apiVersion.has230Features()) {
                return;
            }
            const langauges = new Set();
            for (const plugin of plugins) {
                for (const language of plugin.languages) {
                    langauges.add(language);
                }
            }
            if (langauges.size) {
                const description = {
                    id: 'typescript-plugins',
                    modeIds: Array.from(langauges.values()),
                    diagnosticSource: 'ts-plugins'
                };
                const manager = new LanguageProvider(this.client, description);
                this.languages.push(manager);
                this.disposables.push(manager);
                this.languagePerId.set(description.id, manager);
            }
        });
        this.client.onTsServerStarted(() => {
            this.triggerAllDiagnostics();
        });
    }
    dispose() {
        while (this.disposables.length) {
            const obj = this.disposables.pop();
            if (obj) {
                obj.dispose();
            }
        }
    }
    get serviceClient() {
        return this.client;
    }
    reloadProjects() {
        this.client.execute('reloadProjects', null, false);
        this.triggerAllDiagnostics();
    }
    handles(file) {
        return !!this.findLanguage(file);
    }
    goToProjectConfig(isTypeScriptProject, resource) {
        const rootPath = vscode_1.workspace.rootPath;
        if (!rootPath) {
            vscode_1.window.showInformationMessage(localize('typescript.projectConfigNoWorkspace', 'Please open a folder in VS Code to use a TypeScript or JavaScript project'));
            return;
        }
        const file = this.client.normalizePath(resource);
        // TSServer errors when 'projectInfo' is invoked on a non js/ts file
        if (!file || !this.handles(file)) {
            vscode_1.window.showWarningMessage(localize('typescript.projectConfigUnsupportedFile', 'Could not determine TypeScript or JavaScript project. Unsupported file type'));
            return;
        }
        return this.client.execute('projectInfo', { file, needFileNameList: false }).then(res => {
            if (!res || !res.body) {
                return vscode_1.window.showWarningMessage(localize('typescript.projectConfigCouldNotGetInfo', 'Could not determine TypeScript or JavaScript project'))
                    .then(() => void 0);
            }
            const { configFileName } = res.body;
            if (configFileName && !tsconfig_1.isImplicitProjectConfigFile(configFileName)) {
                return vscode_1.workspace.openTextDocument(configFileName)
                    .then(doc => vscode_1.window.showTextDocument(doc, vscode_1.window.activeTextEditor ? vscode_1.window.activeTextEditor.viewColumn : undefined));
            }
            return vscode_1.window.showInformationMessage((isTypeScriptProject
                ? localize('typescript.noTypeScriptProjectConfig', 'File is not part of a TypeScript project')
                : localize('typescript.noJavaScriptProjectConfig', 'File is not part of a JavaScript project')), {
                title: isTypeScriptProject
                    ? localize('typescript.configureTsconfigQuickPick', 'Configure tsconfig.json')
                    : localize('typescript.configureJsconfigQuickPick', 'Configure jsconfig.json'),
                id: ProjectConfigAction.CreateConfig
            }, {
                title: localize('typescript.projectConfigLearnMore', 'Learn More'),
                id: ProjectConfigAction.LearnMore
            }).then(selected => {
                switch (selected && selected.id) {
                    case ProjectConfigAction.CreateConfig:
                        return tsconfig_1.openOrCreateConfigFile(isTypeScriptProject);
                    case ProjectConfigAction.LearnMore:
                        if (isTypeScriptProject) {
                            vscode_1.commands.executeCommand('vscode.open', vscode_1.Uri.parse('https://go.microsoft.com/fwlink/?linkid=841896'));
                        }
                        else {
                            vscode_1.commands.executeCommand('vscode.open', vscode_1.Uri.parse('https://go.microsoft.com/fwlink/?linkid=759670'));
                        }
                        return;
                    default:
                        return Promise.resolve(undefined);
                }
            });
        });
    }
    findLanguage(file) {
        return vscode_1.workspace.openTextDocument(this.client.asUrl(file)).then((doc) => {
            for (const language of this.languages) {
                if (language.handles(file, doc)) {
                    return language;
                }
            }
            return null;
        }, () => null);
    }
    triggerAllDiagnostics() {
        for (const language of this.languagePerId.values()) {
            language.triggerAllDiagnostics();
        }
    }
    /* internal */ populateService() {
        // See https://github.com/Microsoft/TypeScript/issues/5530
        vscode_1.workspace.saveAll(false).then(() => {
            for (const language of this.languagePerId.values()) {
                language.reInitialize();
            }
        });
    }
    /* internal */ syntaxDiagnosticsReceived(event) {
        const body = event.body;
        if (body && body.diagnostics) {
            this.findLanguage(body.file).then(language => {
                if (language) {
                    language.syntaxDiagnosticsReceived(body.file, this.createMarkerDatas(body.diagnostics, language.diagnosticSource));
                }
            });
        }
    }
    /* internal */ semanticDiagnosticsReceived(event) {
        const body = event.body;
        if (body && body.diagnostics) {
            this.findLanguage(body.file).then(language => {
                if (language) {
                    language.semanticDiagnosticsReceived(body.file, this.createMarkerDatas(body.diagnostics, language.diagnosticSource));
                }
            });
        }
    }
    /* internal */ configFileDiagnosticsReceived(event) {
        // See https://github.com/Microsoft/TypeScript/issues/10384
        const body = event.body;
        if (!body || !body.diagnostics || !body.configFile) {
            return;
        }
        (body.triggerFile ? this.findLanguage(body.triggerFile) : this.findLanguage(body.configFile)).then(language => {
            if (!language) {
                return;
            }
            if (body.diagnostics.length === 0) {
                language.configFileDiagnosticsReceived(body.configFile, []);
            }
            else if (body.diagnostics.length >= 1) {
                vscode_1.workspace.openTextDocument(vscode_1.Uri.file(body.configFile)).then((document) => {
                    let curly = undefined;
                    let nonCurly = undefined;
                    let diagnostic;
                    for (let index = 0; index < document.lineCount; index++) {
                        const line = document.lineAt(index);
                        const text = line.text;
                        const firstNonWhitespaceCharacterIndex = line.firstNonWhitespaceCharacterIndex;
                        if (firstNonWhitespaceCharacterIndex < text.length) {
                            if (text.charAt(firstNonWhitespaceCharacterIndex) === '{') {
                                curly = [index, firstNonWhitespaceCharacterIndex, firstNonWhitespaceCharacterIndex + 1];
                                break;
                            }
                            else {
                                const matches = /\s*([^\s]*)(?:\s*|$)/.exec(text.substr(firstNonWhitespaceCharacterIndex));
                                if (matches && matches.length >= 1) {
                                    nonCurly = [index, firstNonWhitespaceCharacterIndex, firstNonWhitespaceCharacterIndex + matches[1].length];
                                }
                            }
                        }
                    }
                    const match = curly || nonCurly;
                    if (match) {
                        diagnostic = new vscode_1.Diagnostic(new vscode_1.Range(match[0], match[1], match[0], match[2]), body.diagnostics[0].text);
                    }
                    else {
                        diagnostic = new vscode_1.Diagnostic(new vscode_1.Range(0, 0, 0, 0), body.diagnostics[0].text);
                    }
                    if (diagnostic) {
                        diagnostic.source = language.diagnosticSource;
                        language.configFileDiagnosticsReceived(body.configFile, [diagnostic]);
                    }
                }, _error => {
                    language.configFileDiagnosticsReceived(body.configFile, [new vscode_1.Diagnostic(new vscode_1.Range(0, 0, 0, 0), body.diagnostics[0].text)]);
                });
            }
        });
    }
    createMarkerDatas(diagnostics, source) {
        const result = [];
        for (let diagnostic of diagnostics) {
            const { start, end, text } = diagnostic;
            const range = new vscode_1.Range(start.line - 1, start.offset - 1, end.line - 1, end.offset - 1);
            const converted = new vscode_1.Diagnostic(range, text);
            converted.severity = this.getDiagnosticSeverity(diagnostic);
            converted.source = diagnostic.source || source;
            converted.code = '' + diagnostic.code;
            result.push(converted);
        }
        return result;
    }
    getDiagnosticSeverity(diagnostic) {
        switch (diagnostic.category) {
            case PConst.DiagnosticCategory.error:
                return vscode_1.DiagnosticSeverity.Error;
            case PConst.DiagnosticCategory.warning:
                return vscode_1.DiagnosticSeverity.Warning;
            default:
                return vscode_1.DiagnosticSeverity.Error;
        }
    }
}
//# sourceMappingURL=typescriptMain.js.map