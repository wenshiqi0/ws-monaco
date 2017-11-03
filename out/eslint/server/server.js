/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const path = require("path");
const fs = require('fs');
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
var CommandIds;
(function (CommandIds) {
    CommandIds.applySingleFix = 'eslint.applySingleFix';
    CommandIds.applySameFixes = 'eslint.applySameFixes';
    CommandIds.applyAllFixes = 'eslint.applyAllFixes';
    CommandIds.applyAutoFix = 'eslint.applyAutoFix';
})(CommandIds || (CommandIds = {}));
var Status;
(function (Status) {
    Status[Status["ok"] = 1] = "ok";
    Status[Status["warn"] = 2] = "warn";
    Status[Status["error"] = 3] = "error";
})(Status || (Status = {}));
var StatusNotification;
(function (StatusNotification) {
    StatusNotification.type = new vscode_languageserver_1.NotificationType('eslint/status');
})(StatusNotification || (StatusNotification = {}));
var NoConfigRequest;
(function (NoConfigRequest) {
    NoConfigRequest.type = new vscode_languageserver_1.RequestType('eslint/noConfig');
})(NoConfigRequest || (NoConfigRequest = {}));
var NoESLintLibraryRequest;
(function (NoESLintLibraryRequest) {
    NoESLintLibraryRequest.type = new vscode_languageserver_1.RequestType('eslint/noLibrary');
})(NoESLintLibraryRequest || (NoESLintLibraryRequest = {}));
var ValidateItem;
(function (ValidateItem) {
    function is(item) {
        let candidate = item;
        return candidate && Is.string(candidate.language) && (Is.boolean(candidate.autoFix) || candidate.autoFix === void 0);
    }
    ValidateItem.is = is;
})(ValidateItem || (ValidateItem = {}));
var DirectoryItem;
(function (DirectoryItem) {
    function is(item) {
        let candidate = item;
        return candidate && Is.string(candidate.directory) && (Is.boolean(candidate.changeProcessCWD) || candidate.changeProcessCWD === void 0);
    }
    DirectoryItem.is = is;
})(DirectoryItem || (DirectoryItem = {}));
function makeDiagnostic(problem) {
    let message = (problem.ruleId != null)
        ? `${problem.message} (${problem.ruleId})`
        : `${problem.message}`;
    let startLine = Math.max(0, problem.line - 1);
    let startChar = Math.max(0, problem.column - 1);
    let endLine = problem.endLine != null ? Math.max(0, problem.endLine - 1) : startLine;
    let endChar = problem.endColumn != null ? Math.max(0, problem.endColumn - 1) : startChar;
    return {
        message: message,
        severity: convertSeverity(problem.severity),
        source: 'eslint',
        range: {
            start: { line: startLine, character: startChar },
            end: { line: endLine, character: endChar }
        },
        code: problem.ruleId
    };
}
function computeKey(diagnostic) {
    let range = diagnostic.range;
    return `[${range.start.line},${range.start.character},${range.end.line},${range.end.character}]-${diagnostic.code}`;
}
let codeActions = Object.create(null);
function recordCodeAction(document, diagnostic, problem) {
    if (!problem.fix || !problem.ruleId) {
        return;
    }
    let uri = document.uri;
    let edits = codeActions[uri];
    if (!edits) {
        edits = Object.create(null);
        codeActions[uri] = edits;
    }
    edits[computeKey(diagnostic)] = { label: `Fix this ${problem.ruleId} problem`, documentVersion: document.version, ruleId: problem.ruleId, edit: problem.fix };
}
function convertSeverity(severity) {
    switch (severity) {
        // Eslint 1 is warning
        case 1:
            return vscode_languageserver_1.DiagnosticSeverity.Warning;
        case 2:
            return vscode_languageserver_1.DiagnosticSeverity.Error;
        default:
            return vscode_languageserver_1.DiagnosticSeverity.Error;
    }
}
/**
 * Check if the path follows this pattern: `\\hostname\sharename`.
 *
 * @see https://msdn.microsoft.com/en-us/library/gg465305.aspx
 * @return A boolean indication if the path is a UNC path, on none-windows
 * always false.
 */
function isUNC(path) {
    if (process.platform !== 'win32') {
        // UNC is a windows concept
        return false;
    }
    if (!path || path.length < 5) {
        // at least \\a\b
        return false;
    }
    let code = path.charCodeAt(0);
    if (code !== 92 /* Backslash */) {
        return false;
    }
    code = path.charCodeAt(1);
    if (code !== 92 /* Backslash */) {
        return false;
    }
    let pos = 2;
    let start = pos;
    for (; pos < path.length; pos++) {
        code = path.charCodeAt(pos);
        if (code === 92 /* Backslash */) {
            break;
        }
    }
    if (start === pos) {
        return false;
    }
    code = path.charCodeAt(pos + 1);
    if (isNaN(code) || code === 92 /* Backslash */) {
        return false;
    }
    return true;
}
function getFilePath(documentOrUri) {
    if (!documentOrUri) {
        return undefined;
    }
    let uri = Is.string(documentOrUri) ? vscode_uri_1.default.parse(documentOrUri) : vscode_uri_1.default.parse(documentOrUri.uri);
    if (uri.scheme !== 'file') {
        return undefined;
    }
    return uri.fsPath;
}
const exitCalled = new vscode_languageserver_1.NotificationType('eslint/exitCalled');
const nodeExit = process.exit;
process.exit = (code) => {
    let stack = new Error('stack');
    connection.sendNotification(exitCalled, [code ? code : 0, stack.stack]);
    setTimeout(() => {
        nodeExit(code);
    }, 1000);
};
let connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
let settings = null;
let options = null;
let workingDirectories;
let documents = new vscode_languageserver_1.TextDocuments();
let supportedLanguages = Object.create(null);
let willSaveRegistered = false;
let supportedAutoFixLanguages = new Set();
let globalNodePath = undefined;
let nodePath = undefined;
let workspaceRoot = undefined;
let path2Library = Object.create(null);
let document2Library = Object.create(null);
function ignoreTextDocument(document) {
    return !supportedLanguages[document.languageId] || !document2Library[document.uri];
}
var Request;
(function (Request) {
    function is(value) {
        let candidate = value;
        return candidate && !!candidate.token && !!candidate.resolve && !!candidate.reject;
    }
    Request.is = is;
})(Request || (Request = {}));
var Thenable;
(function (Thenable) {
    function is(value) {
        let candidate = value;
        return candidate && typeof candidate.then === 'function';
    }
    Thenable.is = is;
})(Thenable || (Thenable = {}));
class BufferedMessageQueue {
    constructor(connection) {
        this.connection = connection;
        this.queue = [];
        this.requestHandlers = Object.create(null);
        this.notificationHandlers = Object.create(null);
    }
    registerRequest(type, handler, versionProvider) {
        this.connection.onRequest(type, (params, token) => {
            return new Promise((resolve, reject) => {
                this.queue.push({
                    method: type.method,
                    params: params,
                    documentVersion: versionProvider ? versionProvider(params) : undefined,
                    resolve: resolve,
                    reject: reject,
                    token: token
                });
                this.trigger();
            });
        });
        this.requestHandlers[type.method] = { handler, versionProvider };
    }
    registerNotification(type, handler, versionProvider) {
        connection.onNotification(type, (params) => {
            this.queue.push({
                method: type.method,
                params: params,
                documentVersion: versionProvider ? versionProvider(params) : undefined,
            });
            this.trigger();
        });
        this.notificationHandlers[type.method] = { handler, versionProvider };
    }
    addNotificationMessage(type, params, version) {
        this.queue.push({
            method: type.method,
            params,
            documentVersion: version
        });
        this.trigger();
    }
    onNotification(type, handler, versionProvider) {
        this.notificationHandlers[type.method] = { handler, versionProvider };
    }
    trigger() {
        if (this.timer || this.queue.length === 0) {
            return;
        }
        this.timer = setImmediate(() => {
            this.timer = undefined;
            this.processQueue();
        });
    }
    processQueue() {
        let message = this.queue.shift();
        if (!message) {
            return;
        }
        if (Request.is(message)) {
            let requestMessage = message;
            if (requestMessage.token.isCancellationRequested) {
                requestMessage.reject(new vscode_languageserver_1.ResponseError(vscode_languageserver_1.ErrorCodes.RequestCancelled, 'Request got cancelled'));
                return;
            }
            let elem = this.requestHandlers[requestMessage.method];
            if (elem.versionProvider && requestMessage.documentVersion !== void 0 && requestMessage.documentVersion !== elem.versionProvider(requestMessage.params)) {
                requestMessage.reject(new vscode_languageserver_1.ResponseError(vscode_languageserver_1.ErrorCodes.RequestCancelled, 'Request got cancelled'));
                return;
            }
            let result = elem.handler(requestMessage.params, requestMessage.token);
            if (Thenable.is(result)) {
                result.then((value) => {
                    requestMessage.resolve(value);
                }, (error) => {
                    requestMessage.reject(error);
                });
            }
            else {
                requestMessage.resolve(result);
            }
        }
        else {
            let notificationMessage = message;
            let elem = this.notificationHandlers[notificationMessage.method];
            if (elem.versionProvider && notificationMessage.documentVersion !== void 0 && notificationMessage.documentVersion !== elem.versionProvider(notificationMessage.params)) {
                return;
            }
            elem.handler(notificationMessage.params);
        }
        this.trigger();
    }
}
let messageQueue = new BufferedMessageQueue(connection);
var ValidateNotification;
(function (ValidateNotification) {
    ValidateNotification.type = new vscode_languageserver_1.NotificationType('eslint/validate');
})(ValidateNotification || (ValidateNotification = {}));
messageQueue.onNotification(ValidateNotification.type, (document) => {
    validateSingle(document, true);
}, (document) => {
    return document.version;
});
// The documents manager listen for text document create, change
// and close on the connection
documents.listen(connection);
documents.onDidOpen((event) => {
    if (!supportedLanguages[event.document.languageId]) {
        return;
    }
    if (!document2Library[event.document.uri]) {
        let promise = Promise.resolve(require.resolve('eslint/lib/api.js'));
        document2Library[event.document.uri] = promise.then((path) => {
            let library = path2Library[path];
            if (!library) {
                library = require(path);
                if (!library.CLIEngine) {
                    throw new Error(`The eslint library doesn\'t export a CLIEngine. You need at least eslint@1.0.0`);
                }
                connection.console.info(`ESLint library loaded from: ${path}`);
                path2Library[path] = library;
            }
            return library;
        }, () => {
            connection.sendRequest(NoESLintLibraryRequest.type, { source: { uri: event.document.uri } });
            return null;
        });
    }
    if (settings.eslint.run === 'onSave') {
        messageQueue.addNotificationMessage(ValidateNotification.type, event.document, event.document.version);
    }
});
// A text document has changed. Validate the document according the run setting.
documents.onDidChangeContent((event) => {
    if (settings.eslint.run !== 'onType' || ignoreTextDocument(event.document)) {
        return;
    }
    messageQueue.addNotificationMessage(ValidateNotification.type, event.document, event.document.version);
});
function getFixes(textDocument) {
    let uri = textDocument.uri;
    let edits = codeActions[uri];
    function createTextEdit(editInfo) {
        return vscode_languageserver_1.TextEdit.replace(vscode_languageserver_1.Range.create(textDocument.positionAt(editInfo.edit.range[0]), textDocument.positionAt(editInfo.edit.range[1])), editInfo.edit.text || '');
    }
    if (edits) {
        let fixes = new Fixes(edits);
        if (fixes.isEmpty() || textDocument.version !== fixes.getDocumentVersion()) {
            return [];
        }
        return fixes.getOverlapFree().map(createTextEdit);
    }
    return [];
}
documents.onWillSaveWaitUntil((event) => {
    if (event.reason === vscode_languageserver_1.TextDocumentSaveReason.AfterDelay) {
        return [];
    }
    let document = event.document;
    // If we validate on save and want to apply fixes on will save
    // we need to validate the file.
    if (settings.eslint.run === 'onSave') {
        // Do not queue this since we want to get the fixes as fast as possible.
        return validateSingle(document, false).then(() => getFixes(document));
    }
    else {
        return getFixes(document);
    }
});
// A text document has been saved. Validate the document according the run setting.
documents.onDidSave((event) => {
    // We even validate onSave if we have validated on will save to compute fixes since the
    // fixes will change the content of the document.
    if (settings.eslint.run !== 'onSave' || ignoreTextDocument(event.document)) {
        return;
    }
    messageQueue.addNotificationMessage(ValidateNotification.type, event.document, event.document.version);
});
documents.onDidClose((event) => {
    if (ignoreTextDocument(event.document)) {
        return;
    }
    delete document2Library[event.document.uri];
    delete codeActions[event.document.uri];
    connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});
/*
function trace(message: string, verbose?: string): void {
    connection.tracer.log(message, verbose);
}
*/
connection.onInitialize((params) => {
    let initOptions = params.initializationOptions;
    workspaceRoot = params.rootPath;
    nodePath = initOptions.nodePath;
    globalNodePath = vscode_languageserver_1.Files.resolveGlobalNodePath();
    return {
        capabilities: {
            textDocumentSync: vscode_languageserver_1.TextDocumentSyncKind.None,
            executeCommandProvider: {
                commands: [CommandIds.applySingleFix, CommandIds.applySameFixes, CommandIds.applyAllFixes, CommandIds.applyAutoFix]
            }
        }
    };
});
messageQueue.registerNotification(vscode_languageserver_1.DidChangeConfigurationNotification.type, (params) => {
    // settings = params.settings || {};
    // IDE
    settings = {
        eslint: {
            enable: true,
            validate: [
                "javascript",
                "javascriptreact"
            ],
            run: 'onType',
        }
    };
    settings.eslint = settings.eslint || {};
    options = settings.eslint.options || {};
    if (Array.isArray(settings.eslint.workingDirectories)) {
        workingDirectories = [];
        for (let entry of settings.eslint.workingDirectories) {
            let directory;
            let changeProcessCWD = false;
            if (Is.string(entry)) {
                directory = entry;
            }
            else if (DirectoryItem.is(entry)) {
                directory = entry.directory;
                changeProcessCWD = !!entry.changeProcessCWD;
            }
            if (directory) {
                let item;
                if (path.isAbsolute(directory)) {
                    item = { directory };
                }
                else if (workspaceRoot && directory) {
                    item = { directory: path.join(workspaceRoot, directory) };
                }
                else {
                    item = { directory: path.join(process.cwd(), directory) };
                }
                item.changeProcessCWD = changeProcessCWD;
                workingDirectories.push(item);
            }
        }
        if (workingDirectories.length === 0) {
            workingDirectories = undefined;
        }
    }
    let toValidate = [];
    let toSupportAutoFix = new Set();
    if (settings.eslint.validate) {
        for (const item of settings.eslint.validate) {
            if (Is.string(item)) {
                toValidate.push(item);
                if (item === 'javascript' || item === 'javascriptreact') {
                    toSupportAutoFix.add(item);
                }
            }
            else if (ValidateItem.is(item)) {
                toValidate.push(item.language);
                if (item.autoFix) {
                    toSupportAutoFix.add(item.language);
                }
            }
        }
    }
    function createDocumentSelector(language) {
        return [
            {
                scheme: 'file',
                language: language
            },
            {
                scheme: 'untitled',
                language: language
            }
        ];
    }
    if (settings.eslint.autoFixOnSave && !willSaveRegistered) {
        Object.keys(supportedLanguages).forEach(languageId => {
            if (!toSupportAutoFix.has(languageId)) {
                return;
            }
            let resolve = supportedLanguages[languageId];
            let documentSelector = createDocumentSelector(languageId);
            resolve.then(unregistration => {
                let documentOptions = { documentSelector: documentSelector };
                connection.client.register(unregistration, vscode_languageserver_1.WillSaveTextDocumentWaitUntilRequest.type, documentOptions);
            });
        });
        willSaveRegistered = true;
    }
    else if (!settings.eslint.autoFixOnSave && willSaveRegistered) {
        Object.keys(supportedLanguages).forEach(languageId => {
            if (!supportedAutoFixLanguages.has(languageId)) {
                return;
            }
            let resolve = supportedLanguages[languageId];
            resolve.then(unregistration => {
                unregistration.disposeSingle(vscode_languageserver_1.WillSaveTextDocumentWaitUntilRequest.type.method);
            });
        });
        willSaveRegistered = false;
    }
    let toRemove = Object.create(null);
    let toAdd = Object.create(null);
    Object.keys(supportedLanguages).forEach(key => toRemove[key] = true);
    let toRemoveAutoFix = Object.create(null);
    let toAddAutoFix = Object.create(null);
    toValidate.forEach(languageId => {
        if (toRemove[languageId]) {
            // The language is past and future
            delete toRemove[languageId];
            // Check if the autoFix has changed.
            if (supportedAutoFixLanguages.has(languageId) && !toSupportAutoFix.has(languageId)) {
                toRemoveAutoFix[languageId] = true;
            }
            else if (!supportedAutoFixLanguages.has(languageId) && toSupportAutoFix.has(languageId)) {
                toAddAutoFix[languageId] = true;
            }
        }
        else {
            toAdd[languageId] = true;
        }
    });
    supportedAutoFixLanguages = toSupportAutoFix;
    let removeDone = [];
    let removedDocuments = Object.create(null);
    // Remove old language
    Object.keys(toRemove).forEach(languageId => {
        let resolve = supportedLanguages[languageId];
        delete supportedLanguages[languageId];
        removeDone.push(resolve.then((disposable) => {
            documents.all().forEach((textDocument) => {
                if (languageId === textDocument.languageId) {
                    // When we receive the close event we already ignore the document
                    // since it is not in the list of supported languages. So do the
                    // cleanup here.
                    delete document2Library[textDocument.uri];
                    removedDocuments[textDocument.uri] = true;
                    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: [] });
                }
            });
            disposable.dispose();
        }));
    });
    // Add new languages
    Object.keys(toAdd).forEach(languageId => {
        let registration = vscode_languageserver_1.BulkRegistration.create();
        let documentSelector = createDocumentSelector(languageId);
        let documentOptions = { documentSelector: documentSelector };
        registration.add(vscode_languageserver_1.DidOpenTextDocumentNotification.type, documentOptions);
        let didChangeOptions = { documentSelector: documentSelector, syncKind: vscode_languageserver_1.TextDocumentSyncKind.Full };
        registration.add(vscode_languageserver_1.DidChangeTextDocumentNotification.type, didChangeOptions);
        if (settings.eslint.autoFixOnSave && supportedAutoFixLanguages.has(languageId)) {
            registration.add(vscode_languageserver_1.WillSaveTextDocumentWaitUntilRequest.type, documentOptions);
        }
        registration.add(vscode_languageserver_1.DidSaveTextDocumentNotification.type, documentOptions);
        registration.add(vscode_languageserver_1.DidCloseTextDocumentNotification.type, documentOptions);
        if (supportedAutoFixLanguages.has(languageId)) {
            registration.add(vscode_languageserver_1.CodeActionRequest.type, documentOptions);
        }
        supportedLanguages[languageId] = connection.client.register(registration);
    });
    // Handle change autofix for stable langauges
    Object.keys(toRemoveAutoFix).forEach(languageId => {
        let resolve = supportedLanguages[languageId];
        resolve.then(unregistration => {
            unregistration.disposeSingle(vscode_languageserver_1.CodeActionRequest.type.method);
            if (willSaveRegistered) {
                unregistration.disposeSingle(vscode_languageserver_1.WillSaveTextDocumentWaitUntilRequest.type.method);
            }
        });
    });
    Object.keys(toAddAutoFix).forEach(languageId => {
        let resolve = supportedLanguages[languageId];
        let documentSelector = createDocumentSelector(languageId);
        resolve.then(unregistration => {
            let documentOptions = { documentSelector: documentSelector };
            connection.client.register(unregistration, vscode_languageserver_1.CodeActionRequest.type, documentOptions);
            if (willSaveRegistered) {
                connection.client.register(unregistration, vscode_languageserver_1.WillSaveTextDocumentWaitUntilRequest.type, documentOptions);
            }
        });
    });
    Promise.all(removeDone).then(() => {
        // Settings have changed. Revalidate all documents.
        validateMany(documents.all().filter((document) => !removedDocuments[document.uri]));
    }, (_error) => {
        // Revalidation failed.
    });
});
const singleErrorHandlers = [
    tryHandleNoConfig,
    tryHandleConfigError,
    tryHandleMissingModule,
    showErrorMessage
];
function validateSingle(document, publishDiagnostics = true) {
    // We validate document in a queue but open / close documents directly. So we need to deal with the
    // fact that a document might be gone from the server.
    if (!documents.get(document.uri) || !document2Library[document.uri]) {
        return Promise.resolve(undefined);
    }
    return document2Library[document.uri].then((library) => {
        if (!library) {
            return;
        }
        try {
            validate(document, library, publishDiagnostics);
            connection.sendNotification(StatusNotification.type, { state: Status.ok });
        }
        catch (err) {
            let status = undefined;
            for (let handler of singleErrorHandlers) {
                status = handler(err, document, library);
                if (status) {
                    break;
                }
            }
            status = status || Status.error;
            connection.sendNotification(StatusNotification.type, { state: status });
        }
    });
}
function validateMany(documents) {
    documents.forEach(document => {
        messageQueue.addNotificationMessage(ValidateNotification.type, document, document.version);
    });
}
function getMessage(err, document) {
    let result = null;
    if (typeof err.message === 'string' || err.message instanceof String) {
        result = err.message;
        result = result.replace(/\r?\n/g, ' ');
        if (/^CLI: /.test(result)) {
            result = result.substr(5);
        }
    }
    else {
        result = `An unknown error occured while validating document: ${document.uri}`;
    }
    return result;
}
function validate(document, library, publishDiagnostics = true) {
    let newOptions = Object.assign(Object.create(null), options);
    let content = document.getText();
    let uri = document.uri;
    let file = getFilePath(document);
    let cwd = process.cwd();
    try {
        if (file) {
            if (workingDirectories) {
                for (let item of workingDirectories) {
                    if (file.startsWith(item.directory)) {
                        newOptions.cwd = item.directory;
                        if (item.changeProcessCWD) {
                            process.chdir(item.directory);
                        }
                        break;
                    }
                }
            }
            else if (!workspaceRoot && !isUNC(file)) {
                let directory = path.dirname(file);
                if (directory) {
                    if (path.isAbsolute(directory)) {
                        newOptions.cwd = directory;
                    }
                }
            }
        }
        let localEslintConfig;
        try {
            localEslintConfig = path.resolve(workspaceRoot, '.eslintrc');
        } catch (e) {
            localEslintConfig = null;
        }
        if (localEslintConfig && !fs.existsSync(localEslintConfig))
            localEslintConfig = null;
        let cli = new library.CLIEngine(Object.assign(newOptions, {
            configFile: localEslintConfig || require('ant-config').tiny,
        }));
        // Clean previously computed code actions.
        delete codeActions[uri];
        let report = cli.executeOnText(content, file);
        let diagnostics = [];
        if (report && report.results && Array.isArray(report.results) && report.results.length > 0) {
            let docReport = report.results[0];
            if (docReport.messages && Array.isArray(docReport.messages)) {
                docReport.messages.forEach((problem) => {
                    if (problem) {
                        let diagnostic = makeDiagnostic(problem);
                        diagnostics.push(diagnostic);
                        if (supportedAutoFixLanguages.has(document.languageId)) {
                            recordCodeAction(document, diagnostic, problem);
                        }
                    }
                });
            }
        }
        if (publishDiagnostics) {
            connection.sendDiagnostics({ uri, diagnostics });
        }
    }
    finally {
        if (cwd !== process.cwd()) {
            process.chdir(cwd);
        }
    }
}
let noConfigReported = Object.create(null);
function isNoConfigFoundError(error) {
    let candidate = error;
    return candidate.messageTemplate === 'no-config-found' || candidate.message === 'No ESLint configuration found.';
}
function tryHandleNoConfig(error, document, library) {
    if (!isNoConfigFoundError(error)) {
        return undefined;
    }
    if (!noConfigReported[document.uri]) {
        connection.sendRequest(NoConfigRequest.type, {
            message: getMessage(error, document),
            document: {
                uri: document.uri
            }
        })
            .then(undefined, () => { });
        noConfigReported[document.uri] = library;
    }
    return Status.warn;
}
let configErrorReported = Object.create(null);
function tryHandleConfigError(error, document, library) {
    if (!error.message) {
        return undefined;
    }
    function handleFileName(filename) {
        if (!configErrorReported[filename]) {
            connection.console.error(getMessage(error, document));
            if (!documents.get(vscode_uri_1.default.file(filename).toString())) {
                connection.window.showInformationMessage(getMessage(error, document));
            }
            configErrorReported[filename] = library;
        }
        return Status.warn;
    }
    let matches = /Cannot read config file:\s+(.*)\nError:\s+(.*)/.exec(error.message);
    if (matches && matches.length === 3) {
        return handleFileName(matches[1]);
    }
    matches = /(.*):\n\s*Configuration for rule \"(.*)\" is /.exec(error.message);
    if (matches && matches.length === 3) {
        return handleFileName(matches[1]);
    }
    matches = /Cannot find module '([^']*)'\nReferenced from:\s+(.*)/.exec(error.message);
    if (matches && matches.length === 3) {
        return handleFileName(matches[2]);
    }
    return undefined;
}
let missingModuleReported = Object.create(null);
function tryHandleMissingModule(error, document, library) {
    if (!error.message) {
        return undefined;
    }
    function handleMissingModule(plugin, module, error) {
        if (!missingModuleReported[plugin]) {
            let fsPath = getFilePath(document);
            missingModuleReported[plugin] = library;
            if (error.messageTemplate === 'plugin-missing') {
                connection.console.error([
                    '',
                    `${error.message.toString()}`,
                    `Happend while validating ${fsPath ? fsPath : document.uri}`,
                    `This can happen for a couple of reasons:`,
                    `1. The plugin name is spelled incorrectly in an ESLint configuration file (e.g. .eslintrc).`,
                    `2. If ESLint is installed globally, then make sure ${module} is installed globally as well.`,
                    `3. If ESLint is installed locally, then ${module} isn't installed correctly.`,
                    '',
                    `Consider running eslint --debug ${fsPath ? fsPath : document.uri} from a terminal to obtain a trace about the configuration files used.`
                ].join('\n'));
            }
            else {
                connection.console.error([
                    `${error.message.toString()}`,
                    `Happend while validating ${fsPath ? fsPath : document.uri}`
                ].join('\n'));
            }
        }
        return Status.warn;
    }
    let matches = /Failed to load plugin (.*): Cannot find module (.*)/.exec(error.message);
    if (matches && matches.length === 3) {
        return handleMissingModule(matches[1], matches[2], error);
    }
    return undefined;
}
function showErrorMessage(error, document) {
    connection.window.showErrorMessage(getMessage(error, document));
    return Status.error;
}
messageQueue.registerNotification(vscode_languageserver_1.DidChangeWatchedFilesNotification.type, (params) => {
    // A .eslintrc has change. No smartness here.
    // Simply revalidate all file.
    noConfigReported = Object.create(null);
    missingModuleReported = Object.create(null);
    params.changes.forEach((change) => {
        let fsPath = getFilePath(change.uri);
        if (!fsPath || isUNC(fsPath)) {
            return;
        }
        let dirname = path.dirname(fsPath);
        if (dirname) {
            let library = configErrorReported[fsPath];
            if (library) {
                let cli = new library.CLIEngine(options);
                try {
                    cli.executeOnText("", path.join(dirname, "___test___.js"));
                    delete configErrorReported[fsPath];
                }
                catch (error) {
                }
            }
        }
    });
    validateMany(documents.all());
});
class Fixes {
    constructor(edits) {
        this.edits = edits;
        this.keys = Object.keys(edits);
    }
    static overlaps(lastEdit, newEdit) {
        return !!lastEdit && lastEdit.edit.range[1] > newEdit.edit.range[0];
    }
    isEmpty() {
        return this.keys.length === 0;
    }
    getDocumentVersion() {
        return this.edits[this.keys[0]].documentVersion;
    }
    getScoped(diagnostics) {
        let result = [];
        for (let diagnostic of diagnostics) {
            let key = computeKey(diagnostic);
            let editInfo = this.edits[key];
            if (editInfo) {
                result.push(editInfo);
            }
        }
        return result;
    }
    getAllSorted() {
        let result = this.keys.map(key => this.edits[key]);
        return result.sort((a, b) => {
            let d = a.edit.range[0] - b.edit.range[0];
            if (d !== 0) {
                return d;
            }
            if (a.edit.range[1] === 0) {
                return -1;
            }
            if (b.edit.range[1] === 0) {
                return 1;
            }
            return a.edit.range[1] - b.edit.range[1];
        });
    }
    getOverlapFree() {
        let sorted = this.getAllSorted();
        if (sorted.length <= 1) {
            return sorted;
        }
        let result = [];
        let last = sorted[0];
        result.push(last);
        for (let i = 1; i < sorted.length; i++) {
            let current = sorted[i];
            if (!Fixes.overlaps(last, current)) {
                result.push(current);
                last = current;
            }
        }
        return result;
    }
}
let commands = Object.create(null);
messageQueue.registerRequest(vscode_languageserver_1.CodeActionRequest.type, (params) => {
    commands = Object.create(null);
    let result = [];
    let uri = params.textDocument.uri;
    let edits = codeActions[uri];
    if (!edits) {
        return result;
    }
    let fixes = new Fixes(edits);
    if (fixes.isEmpty()) {
        return result;
    }
    let textDocument = documents.get(uri);
    let documentVersion = -1;
    let ruleId;
    function createTextEdit(editInfo) {
        return vscode_languageserver_1.TextEdit.replace(vscode_languageserver_1.Range.create(textDocument.positionAt(editInfo.edit.range[0]), textDocument.positionAt(editInfo.edit.range[1])), editInfo.edit.text || '');
    }
    function getLastEdit(array) {
        let length = array.length;
        if (length === 0) {
            return undefined;
        }
        return array[length - 1];
    }
    for (let editInfo of fixes.getScoped(params.context.diagnostics)) {
        documentVersion = editInfo.documentVersion;
        ruleId = editInfo.ruleId;
        let workspaceChange = new vscode_languageserver_1.WorkspaceChange();
        workspaceChange.getTextEditChange({ uri, version: documentVersion }).add(createTextEdit(editInfo));
        commands[CommandIds.applySingleFix] = workspaceChange;
        result.push(vscode_languageserver_1.Command.create(editInfo.label, CommandIds.applySingleFix));
    }
    ;
    if (result.length > 0) {
        let same = [];
        let all = [];
        for (let editInfo of fixes.getAllSorted()) {
            if (documentVersion === -1) {
                documentVersion = editInfo.documentVersion;
            }
            if (editInfo.ruleId === ruleId && !Fixes.overlaps(getLastEdit(same), editInfo)) {
                same.push(editInfo);
            }
            if (!Fixes.overlaps(getLastEdit(all), editInfo)) {
                all.push(editInfo);
            }
        }
        if (same.length > 1) {
            let sameFixes = new vscode_languageserver_1.WorkspaceChange();
            let sameTextChange = sameFixes.getTextEditChange({ uri, version: documentVersion });
            same.map(createTextEdit).forEach(edit => sameTextChange.add(edit));
            commands[CommandIds.applySameFixes] = sameFixes;
            result.push(vscode_languageserver_1.Command.create(`Fix all ${ruleId} problems`, CommandIds.applySameFixes));
        }
        if (all.length > 1) {
            let allFixes = new vscode_languageserver_1.WorkspaceChange();
            let allTextChange = allFixes.getTextEditChange({ uri, version: documentVersion });
            all.map(createTextEdit).forEach(edit => allTextChange.add(edit));
            commands[CommandIds.applyAllFixes] = allFixes;
            result.push(vscode_languageserver_1.Command.create(`Fix all auto-fixable problems`, CommandIds.applyAllFixes));
        }
    }
    return result;
}, (params) => {
    let document = documents.get(params.textDocument.uri);
    return document ? document.version : undefined;
});
function computeAllFixes(identifier) {
    let uri = identifier.uri;
    let textDocument = documents.get(uri);
    if (!textDocument || identifier.version !== textDocument.version) {
        return undefined;
    }
    let edits = codeActions[uri];
    function createTextEdit(editInfo) {
        return vscode_languageserver_1.TextEdit.replace(vscode_languageserver_1.Range.create(textDocument.positionAt(editInfo.edit.range[0]), textDocument.positionAt(editInfo.edit.range[1])), editInfo.edit.text || '');
    }
    if (edits) {
        let fixes = new Fixes(edits);
        if (!fixes.isEmpty()) {
            return fixes.getOverlapFree().map(createTextEdit);
        }
    }
    return undefined;
}
;
messageQueue.registerRequest(vscode_languageserver_1.ExecuteCommandRequest.type, (params) => {
    let workspaceChange;
    if (params.command === CommandIds.applyAutoFix) {
        let identifier = params.arguments[0];
        let edits = computeAllFixes(identifier);
        if (edits) {
            workspaceChange = new vscode_languageserver_1.WorkspaceChange();
            let textChange = workspaceChange.getTextEditChange(identifier);
            edits.forEach(edit => textChange.add(edit));
        }
    }
    else {
        workspaceChange = commands[params.command];
    }
    if (!workspaceChange) {
        return {};
    }
    return connection.workspace.applyEdit(workspaceChange.edit).then((response) => {
        if (!response.applied) {
            connection.console.error(`Failed to apply command: ${params.command}`);
        }
        return {};
    }, () => {
        connection.console.error(`Failed to apply command: ${params.command}`);
    });
}, (params) => {
    if (params.command === CommandIds.applyAutoFix) {
        let identifier = params.arguments[0];
        return identifier.version;
    }
    else {
        return undefined;
    }
});
connection.listen();
//# sourceMappingURL=server.js.map