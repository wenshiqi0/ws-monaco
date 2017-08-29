"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const os = require("os");
const net = require("net");
const electron = require("./utils/electron");
const wireProtocol_1 = require("./utils/wireProtocol");
const vscode_1 = require("vscode");
const typescriptService_1 = require("./typescriptService");
const logger_1 = require("./utils/logger");
const is = require("./utils/is");
const telemetry_1 = require("./utils/telemetry");
const tracer_1 = require("./utils/tracer");
const nls = require("vscode-nls");
const localize = nls.loadMessageBundle();
class CallbackMap {
    constructor() {
        this.callbacks = new Map();
        this.pendingResponses = 0;
    }
    destroy(e) {
        for (const callback of this.callbacks.values()) {
            callback.e(e);
        }
        this.callbacks = new Map();
        this.pendingResponses = 0;
    }
    add(seq, callback) {
        this.callbacks.set(seq, callback);
        ++this.pendingResponses;
    }
    fetch(seq) {
        const callback = this.callbacks.get(seq);
        this.delete(seq);
        return callback;
    }
    delete(seq) {
        if (this.callbacks.delete(seq)) {
            --this.pendingResponses;
        }
    }
}
var TsServerLogLevel;
(function (TsServerLogLevel) {
    TsServerLogLevel[TsServerLogLevel["Off"] = 0] = "Off";
    TsServerLogLevel[TsServerLogLevel["Normal"] = 1] = "Normal";
    TsServerLogLevel[TsServerLogLevel["Terse"] = 2] = "Terse";
    TsServerLogLevel[TsServerLogLevel["Verbose"] = 3] = "Verbose";
})(TsServerLogLevel || (TsServerLogLevel = {}));
(function (TsServerLogLevel) {
    function fromString(value) {
        switch (value && value.toLowerCase()) {
            case 'normal':
                return TsServerLogLevel.Normal;
            case 'terse':
                return TsServerLogLevel.Terse;
            case 'verbose':
                return TsServerLogLevel.Verbose;
            case 'off':
            default:
                return TsServerLogLevel.Off;
        }
    }
    TsServerLogLevel.fromString = fromString;
    function toString(value) {
        switch (value) {
            case TsServerLogLevel.Normal:
                return 'normal';
            case TsServerLogLevel.Terse:
                return 'terse';
            case TsServerLogLevel.Verbose:
                return 'verbose';
            case TsServerLogLevel.Off:
            default:
                return 'off';
        }
    }
    TsServerLogLevel.toString = toString;
})(TsServerLogLevel || (TsServerLogLevel = {}));
var MessageAction;
(function (MessageAction) {
    MessageAction[MessageAction["useLocal"] = 0] = "useLocal";
    MessageAction[MessageAction["useBundled"] = 1] = "useBundled";
    MessageAction[MessageAction["learnMore"] = 2] = "learnMore";
    MessageAction[MessageAction["reportIssue"] = 3] = "reportIssue";
})(MessageAction || (MessageAction = {}));
class TypeScriptServiceConfiguration {
    constructor() {
        this.tsServerLogLevel = TsServerLogLevel.Off;
        const configuration = vscode_1.workspace.getConfiguration();
        this.globalTsdk = TypeScriptServiceConfiguration.extractGlobalTsdk(configuration);
        this.localTsdk = TypeScriptServiceConfiguration.extractLocalTsdk(configuration);
        this.npmLocation = TypeScriptServiceConfiguration.readNpmLocation(configuration);
        this.tsServerLogLevel = TypeScriptServiceConfiguration.readTsServerLogLevel(configuration);
        this.checkJs = TypeScriptServiceConfiguration.readCheckJs(configuration);
    }
    static loadFromWorkspace() {
        return new TypeScriptServiceConfiguration();
    }
    isEqualTo(other) {
        return this.globalTsdk === other.globalTsdk
            && this.localTsdk === other.localTsdk
            && this.npmLocation === other.npmLocation
            && this.tsServerLogLevel === other.tsServerLogLevel
            && this.checkJs === other.checkJs;
    }
    static extractGlobalTsdk(configuration) {
        let inspect = configuration.inspect('typescript.tsdk');
        if (inspect && inspect.globalValue && 'string' === typeof inspect.globalValue) {
            return inspect.globalValue;
        }
        if (inspect && inspect.defaultValue && 'string' === typeof inspect.defaultValue) {
            return inspect.defaultValue;
        }
        return null;
    }
    static extractLocalTsdk(configuration) {
        let inspect = configuration.inspect('typescript.tsdk');
        if (inspect && inspect.workspaceValue && 'string' === typeof inspect.workspaceValue) {
            return inspect.workspaceValue;
        }
        return null;
    }
    static readTsServerLogLevel(configuration) {
        const setting = configuration.get('typescript.tsserver.log', 'off');
        return TsServerLogLevel.fromString(setting);
    }
    static readCheckJs(configuration) {
        return configuration.get('javascript.implicitProjectConfig.checkJs', false);
    }
    static readNpmLocation(configuration) {
        return configuration.get('typescript.npm', null);
    }
}
class RequestQueue {
    constructor() {
        this.queue = [];
        this.sequenceNumber = 0;
    }
    get length() {
        return this.queue.length;
    }
    push(item) {
        this.queue.push(item);
    }
    shift() {
        return this.queue.shift();
    }
    tryCancelPendingRequest(seq) {
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].request.seq === seq) {
                this.queue.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    createRequest(command, args) {
        return {
            seq: this.sequenceNumber++,
            type: 'request',
            command: command,
            arguments: args
        };
    }
}
class TypeScriptServiceClient {
    constructor(host, workspaceState, versionStatus, plugins, disposables) {
        this.host = host;
        this.workspaceState = workspaceState;
        this.versionStatus = versionStatus;
        this.plugins = plugins;
        this.logger = new logger_1.default();
        this.tsServerLogFile = null;
        this.isRestarting = false;
        this.cancellationPipeName = null;
        this._onTsServerStarted = new vscode_1.EventEmitter();
        this._onProjectLanguageServiceStateChanged = new vscode_1.EventEmitter();
        this._onDidBeginInstallTypings = new vscode_1.EventEmitter();
        this._onDidEndInstallTypings = new vscode_1.EventEmitter();
        this._onTypesInstallerInitializationFailed = new vscode_1.EventEmitter();
        this.pathSeparator = path.sep;
        this.lastStart = Date.now();
        var p = new Promise((resolve, reject) => {
            this._onReady = { promise: p, resolve, reject };
        });
        this._onReady.promise = p;
        this.servicePromise = null;
        this.lastError = null;
        this.firstStart = Date.now();
        this.numberRestarts = 0;
        this.requestQueue = new RequestQueue();
        this.callbacks = new CallbackMap();
        this.configuration = TypeScriptServiceConfiguration.loadFromWorkspace();
        this._apiVersion = new typescriptService_1.API('1.0.0');
        this._checkGlobalTSCVersion = true;
        this.tracer = new tracer_1.default(this.logger);
        disposables.push(vscode_1.workspace.onDidChangeConfiguration(() => {
            const oldConfiguration = this.configuration;
            this.configuration = TypeScriptServiceConfiguration.loadFromWorkspace();
            this.tracer.updateConfiguration();
            if (this.servicePromise) {
                if (this.configuration.checkJs !== oldConfiguration.checkJs) {
                    this.setCompilerOptionsForInferredProjects();
                }
                if (!this.configuration.isEqualTo(oldConfiguration)) {
                    this.restartTsServer();
                }
            }
        }));
        this.telemetryReporter = new telemetry_1.default();
        disposables.push(this.telemetryReporter);
        this.startService();
    }
    restartTsServer() {
        const start = () => {
            this.servicePromise = this.startService(true);
            return this.servicePromise;
        };
        if (this.servicePromise) {
            this.servicePromise = this.servicePromise.then(cp => {
                if (cp) {
                    this.isRestarting = true;
                    cp.kill();
                }
            }).then(start);
        }
        else {
            start();
        }
    }
    get onTsServerStarted() {
        return this._onTsServerStarted.event;
    }
    get onProjectLanguageServiceStateChanged() {
        return this._onProjectLanguageServiceStateChanged.event;
    }
    get onDidBeginInstallTypings() {
        return this._onDidBeginInstallTypings.event;
    }
    get onDidEndInstallTypings() {
        return this._onDidEndInstallTypings.event;
    }
    get onTypesInstallerInitializationFailed() {
        return this._onTypesInstallerInitializationFailed.event;
    }
    get checkGlobalTSCVersion() {
        return this._checkGlobalTSCVersion;
    }
    get apiVersion() {
        return this._apiVersion;
    }
    onReady() {
        return this._onReady.promise;
    }
    info(message, data) {
        this.logger.info(message, data);
    }
    warn(message, data) {
        this.logger.warn(message, data);
    }
    error(message, data) {
        this.logger.error(message, data);
    }
    logTelemetry(eventName, properties) {
        this.telemetryReporter.logTelemetry(eventName, properties);
    }
    service() {
        if (this.servicePromise) {
            return this.servicePromise;
        }
        if (this.lastError) {
            return Promise.reject(this.lastError);
        }
        this.startService();
        if (this.servicePromise) {
            return this.servicePromise;
        }
        return Promise.reject(new Error('Could not create TS service'));
    }
    get bundledTypeScriptPath() {
        try {
            return require.resolve('typescript/lib/tsserver.js');
        }
        catch (e) {
            return '';
        }
    }
    get localTypeScriptPath() {
        if (!vscode_1.workspace.rootPath) {
            return null;
        }
        if (this.configuration.localTsdk) {
            this._checkGlobalTSCVersion = false;
            if (path.isAbsolute(this.configuration.localTsdk)) {
                return path.join(this.configuration.localTsdk, 'tsserver.js');
            }
            return path.join(vscode_1.workspace.rootPath, this.configuration.localTsdk, 'tsserver.js');
        }
        const localModulePath = path.join(vscode_1.workspace.rootPath, 'node_modules', 'typescript', 'lib', 'tsserver.js');
        if (fs.existsSync(localModulePath) && this.getTypeScriptVersion(localModulePath)) {
            return localModulePath;
        }
        return null;
    }
    get globalTypescriptPath() {
        if (this.configuration.globalTsdk) {
            this._checkGlobalTSCVersion = false;
            if (path.isAbsolute(this.configuration.globalTsdk)) {
                return path.join(this.configuration.globalTsdk, 'tsserver.js');
            }
            else if (vscode_1.workspace.rootPath) {
                return path.join(vscode_1.workspace.rootPath, this.configuration.globalTsdk, 'tsserver.js');
            }
        }
        return this.bundledTypeScriptPath;
    }
    hasWorkspaceTsdkSetting() {
        return !!this.configuration.localTsdk;
    }
    startService(resendModels = false) {
        let modulePath = Promise.resolve(this.globalTypescriptPath);
        if (!this.workspaceState.get(TypeScriptServiceClient.tsdkMigratedStorageKey, false)) {
            this.workspaceState.update(TypeScriptServiceClient.tsdkMigratedStorageKey, true);
            if (vscode_1.workspace.rootPath && this.hasWorkspaceTsdkSetting()) {
                modulePath = this.showVersionPicker(true);
            }
        }
        return modulePath.then(modulePath => {
            if (this.workspaceState.get(TypeScriptServiceClient.useWorkspaceTsdkStorageKey, false)) {
                if (vscode_1.workspace.rootPath) {
                    // TODO: check if we need better error handling
                    return this.localTypeScriptPath || modulePath;
                }
            }
            return modulePath;
        }).then(modulePath => {
            return this.getDebugPort().then(debugPort => ({ modulePath, debugPort }));
        }).then(({ modulePath, debugPort }) => {
            return this.servicePromise = new Promise((resolve, reject) => {
                this.info(`Using tsserver from: ${modulePath}`);
                if (!fs.existsSync(modulePath)) {
                    vscode_1.window.showWarningMessage(localize('noServerFound', 'The path {0} doesn\'t point to a valid tsserver install. Falling back to bundled TypeScript version.', modulePath ? path.dirname(modulePath) : ''));
                    if (!this.bundledTypeScriptPath) {
                        vscode_1.window.showErrorMessage(localize('noBundledServerFound', 'VSCode\'s tsserver was deleted by another application such as a misbehaving virus detection tool. Please reinstall VS Code.'));
                        return reject(new Error('Could not find bundled tsserver.js'));
                    }
                    modulePath = this.bundledTypeScriptPath;
                }
                let version = this.getTypeScriptVersion(modulePath);
                if (!version) {
                    version = vscode_1.workspace.getConfiguration().get('typescript.tsdk_version', undefined);
                }
                if (version) {
                    this._apiVersion = new typescriptService_1.API(version);
                }
                const label = version || localize('versionNumber.custom', 'custom');
                const tooltip = modulePath;
                this.modulePath = modulePath;
                this.versionStatus.showHideStatus();
                this.versionStatus.setInfo(label, tooltip);
                this.requestQueue = new RequestQueue();
                this.callbacks = new CallbackMap();
                this.lastError = null;
                try {
                    const options = {
                        execArgv: [] // [`--debug-brk=5859`]
                    };
                    if (vscode_1.workspace.rootPath) {
                        options.cwd = vscode_1.workspace.rootPath;
                    }
                    if (debugPort && !isNaN(debugPort)) {
                        this.info(`TSServer started in debug mode using port ${debugPort}`);
                        options.execArgv = [`--debug=${debugPort}`];
                    }
                    const args = [];
                    if (this.apiVersion.has206Features()) {
                        args.push('--useSingleInferredProject');
                        if (vscode_1.workspace.getConfiguration().get('typescript.disableAutomaticTypeAcquisition', false)) {
                            args.push('--disableAutomaticTypingAcquisition');
                        }
                    }
                    if (this.apiVersion.has208Features()) {
                        args.push('--enableTelemetry');
                    }
                    if (this.apiVersion.has222Features()) {
                        this.cancellationPipeName = electron.getTempFile(`tscancellation-${electron.makeRandomHexString(20)}`);
                        args.push('--cancellationPipeName', this.cancellationPipeName + '*');
                    }
                    if (this.apiVersion.has222Features()) {
                        if (this.configuration.tsServerLogLevel !== TsServerLogLevel.Off) {
                            try {
                                const logDir = fs.mkdtempSync(path.join(os.tmpdir(), `vscode-tsserver-log-`));
                                this.tsServerLogFile = path.join(logDir, `tsserver.log`);
                                this.info(`TSServer log file: ${this.tsServerLogFile}`);
                            }
                            catch (e) {
                                this.error('Could not create TSServer log directory');
                            }
                            if (this.tsServerLogFile) {
                                args.push('--logVerbosity', TsServerLogLevel.toString(this.configuration.tsServerLogLevel));
                                args.push('--logFile', this.tsServerLogFile);
                            }
                        }
                    }
                    if (this.apiVersion.has230Features()) {
                        if (this.plugins.length) {
                            args.push('--globalPlugins', this.plugins.map(x => x.name).join(','));
                            if (modulePath === this.globalTypescriptPath) {
                                args.push('--pluginProbeLocations', this.plugins.map(x => x.path).join(','));
                            }
                        }
                    }
                    if (this.apiVersion.has234Features()) {
                        if (this.configuration.npmLocation) {
                            args.push('--npmLocation', `"${this.configuration.npmLocation}"`);
                        }
                    }
                    electron.fork(modulePath, args, options, this.logger, (err, childProcess) => {
                        if (err) {
                            this.lastError = err;
                            this.error('Starting TSServer failed with error.', err);
                            vscode_1.window.showErrorMessage(localize('serverCouldNotBeStarted', 'TypeScript language server couldn\'t be started. Error message is: {0}', err.message || err));
                            this.logTelemetry('error', { message: err.message });
                            return;
                        }
                        this.lastStart = Date.now();
                        childProcess.on('error', (err) => {
                            this.lastError = err;
                            this.error('TSServer errored with error.', err);
                            if (this.tsServerLogFile) {
                                this.error(`TSServer log file: ${this.tsServerLogFile}`);
                            }
                            this.logTelemetry('tsserver.error');
                            this.serviceExited(false);
                        });
                        childProcess.on('exit', (code) => {
                            if (code === null || typeof code === 'undefined') {
                                this.info(`TSServer exited`);
                            }
                            else {
                                this.error(`TSServer exited with code: ${code}`);
                                this.logTelemetry('tsserver.exitWithCode', { code: code });
                            }
                            if (this.tsServerLogFile) {
                                this.info(`TSServer log file: ${this.tsServerLogFile}`);
                            }
                            this.serviceExited(!this.isRestarting);
                            this.isRestarting = false;
                        });
                        this.reader = new wireProtocol_1.Reader(childProcess.stdout, (msg) => { this.dispatchMessage(msg); }, error => { this.error('ReaderError', error); });
                        this._onReady.resolve();
                        resolve(childProcess);
                        this._onTsServerStarted.fire();
                        this.serviceStarted(resendModels);
                    });
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    getDebugPort() {
        const value = process.env.TSS_DEBUG;
        if (value) {
            const port = parseInt(value);
            if (!isNaN(port)) {
                return Promise.resolve(port);
            }
        }
        if (vscode_1.workspace.getConfiguration('typescript').get('tsserver.debug', false)) {
            return Promise.race([
                new Promise((resolve) => setTimeout(() => resolve(undefined), 1000)),
                new Promise((resolve) => {
                    const server = net.createServer(sock => sock.end());
                    server.listen(0, function () {
                        resolve(server.address().port);
                    });
                })
            ]);
        }
        return Promise.resolve(undefined);
    }
    onVersionStatusClicked() {
        return this.showVersionPicker(false);
    }
    showVersionPicker(firstRun) {
        const modulePath = this.modulePath || this.globalTypescriptPath;
        if (!vscode_1.workspace.rootPath || !modulePath) {
            return Promise.resolve(modulePath);
        }
        const useWorkspaceVersionSetting = this.workspaceState.get(TypeScriptServiceClient.useWorkspaceTsdkStorageKey, false);
        const shippedVersion = this.getTypeScriptVersion(this.globalTypescriptPath);
        const localModulePath = this.localTypeScriptPath;
        const pickOptions = [];
        pickOptions.push({
            label: localize('useVSCodeVersionOption', 'Use VSCode\'s Version'),
            description: shippedVersion || this.globalTypescriptPath,
            detail: modulePath === this.globalTypescriptPath && (modulePath !== localModulePath || !useWorkspaceVersionSetting) ? localize('activeVersion', 'Currently active') : '',
            id: MessageAction.useBundled,
        });
        if (localModulePath) {
            const localVersion = this.getTypeScriptVersion(localModulePath);
            pickOptions.push({
                label: localize('useWorkspaceVersionOption', 'Use Workspace Version'),
                description: localVersion || localModulePath,
                detail: modulePath === localModulePath && (modulePath !== this.globalTypescriptPath || useWorkspaceVersionSetting) ? localize('activeVersion', 'Currently active') : '',
                id: MessageAction.useLocal
            });
        }
        pickOptions.push({
            label: localize('learnMore', 'Learn More'),
            description: '',
            id: MessageAction.learnMore
        });
        const tryShowRestart = (newModulePath) => {
            if (firstRun || newModulePath === this.modulePath) {
                return;
            }
            this.restartTsServer();
        };
        return vscode_1.window.showQuickPick(pickOptions, {
            placeHolder: localize('selectTsVersion', 'Select the TypeScript version used for JavaScript and TypeScript language features'),
            ignoreFocusOut: firstRun
        })
            .then(selected => {
            if (!selected) {
                return modulePath;
            }
            switch (selected.id) {
                case MessageAction.useLocal:
                    return this.workspaceState.update(TypeScriptServiceClient.useWorkspaceTsdkStorageKey, true)
                        .then(_ => {
                        if (localModulePath) {
                            tryShowRestart(localModulePath);
                        }
                        return localModulePath || '';
                    });
                case MessageAction.useBundled:
                    return this.workspaceState.update(TypeScriptServiceClient.useWorkspaceTsdkStorageKey, false)
                        .then(_ => {
                        tryShowRestart(this.globalTypescriptPath);
                        return this.globalTypescriptPath;
                    });
                case MessageAction.learnMore:
                    vscode_1.commands.executeCommand('vscode.open', vscode_1.Uri.parse('https://go.microsoft.com/fwlink/?linkid=839919'));
                    return modulePath;
                default:
                    return modulePath;
            }
        });
    }
    openTsServerLogFile() {
        if (!this.apiVersion.has222Features()) {
            return vscode_1.window.showErrorMessage(localize('typescript.openTsServerLog.notSupported', 'TS Server logging requires TS 2.2.2+'))
                .then(() => false);
        }
        if (this.configuration.tsServerLogLevel === TsServerLogLevel.Off) {
            return vscode_1.window.showErrorMessage(localize('typescript.openTsServerLog.loggingNotEnabled', 'TS Server logging is off. Please set `typescript.tsserver.log` and restart the TS server to enable logging'), {
                title: localize('typescript.openTsServerLog.enableAndReloadOption', 'Enable logging and restart TS server'),
            })
                .then(selection => {
                if (selection) {
                    return vscode_1.workspace.getConfiguration().update('typescript.tsserver.log', 'verbose', true).then(() => {
                        this.restartTsServer();
                        return false;
                    });
                }
                return false;
            });
        }
        if (!this.tsServerLogFile) {
            return vscode_1.window.showWarningMessage(localize('typescript.openTsServerLog.noLogFile', 'TS Server has not started logging.')).then(() => false);
        }
        return vscode_1.commands.executeCommand('_workbench.action.files.revealInOS', vscode_1.Uri.parse(this.tsServerLogFile))
            .then(() => true, () => {
            vscode_1.window.showWarningMessage(localize('openTsServerLog.openFileFailedFailed', 'Could not open TS Server log file'));
            return false;
        });
    }
    serviceStarted(resendModels) {
        let configureOptions = {
            hostInfo: 'vscode'
        };
        this.execute('configure', configureOptions);
        this.setCompilerOptionsForInferredProjects();
        if (resendModels) {
            this.host.populateService();
        }
    }
    setCompilerOptionsForInferredProjects() {
        if (!this.apiVersion.has206Features()) {
            return;
        }
        const compilerOptions = {
            module: 'CommonJS',
            target: 'ES6',
            allowSyntheticDefaultImports: true,
            allowNonTsExtensions: true,
            allowJs: true,
            jsx: 'Preserve'
        };
        if (this.apiVersion.has230Features()) {
            compilerOptions.checkJs = vscode_1.workspace.getConfiguration('javascript').get('implicitProjectConfig.checkJs', false);
        }
        const args = {
            options: compilerOptions
        };
        this.execute('compilerOptionsForInferredProjects', args, true).catch((err) => {
            this.error(`'compilerOptionsForInferredProjects' request failed with error.`, err);
        });
    }
    getTypeScriptVersion(serverPath) {
        if (!fs.existsSync(serverPath)) {
            return undefined;
        }
        let p = serverPath.split(path.sep);
        if (p.length <= 2) {
            return undefined;
        }
        let p2 = p.slice(0, -2);
        let modulePath = p2.join(path.sep);
        let fileName = path.join(modulePath, 'package.json');
        if (!fs.existsSync(fileName)) {
            return undefined;
        }
        let contents = fs.readFileSync(fileName).toString();
        let desc = null;
        try {
            desc = JSON.parse(contents);
        }
        catch (err) {
            return undefined;
        }
        if (!desc || !desc.version) {
            return undefined;
        }
        return desc.version;
    }
    serviceExited(restart) {
        this.servicePromise = null;
        this.tsServerLogFile = null;
        this.callbacks.destroy(new Error('Service died.'));
        this.callbacks = new CallbackMap();
        if (restart) {
            const diff = Date.now() - this.lastStart;
            this.numberRestarts++;
            let startService = true;
            if (this.numberRestarts > 5) {
                let prompt = undefined;
                this.numberRestarts = 0;
                if (diff < 10 * 1000 /* 10 seconds */) {
                    this.lastStart = Date.now();
                    startService = false;
                    prompt = vscode_1.window.showErrorMessage(localize('serverDiedAfterStart', 'The TypeScript language service died 5 times right after it got started. The service will not be restarted.'), {
                        title: localize('serverDiedReportIssue', 'Report Issue'),
                        id: MessageAction.reportIssue,
                        isCloseAffordance: true
                    });
                    this.logTelemetry('serviceExited');
                }
                else if (diff < 60 * 1000 /* 1 Minutes */) {
                    this.lastStart = Date.now();
                    prompt = vscode_1.window.showWarningMessage(localize('serverDied', 'The TypeScript language service died unexpectedly 5 times in the last 5 Minutes.'), {
                        title: localize('serverDiedReportIssue', 'Report Issue'),
                        id: MessageAction.reportIssue,
                        isCloseAffordance: true
                    });
                }
                if (prompt) {
                    prompt.then(item => {
                        if (item && item.id === MessageAction.reportIssue) {
                            return vscode_1.commands.executeCommand('workbench.action.reportIssues');
                        }
                        return undefined;
                    });
                }
            }
            if (startService) {
                this.startService(true);
            }
        }
    }
    normalizePath(resource) {
        if (resource.scheme === TypeScriptServiceClient.WALK_THROUGH_SNIPPET_SCHEME) {
            return resource.toString();
        }
        if (resource.scheme === 'untitled' && this._apiVersion.has213Features()) {
            return resource.toString();
        }
        if (resource.scheme !== 'file') {
            return null;
        }
        let result = resource.fsPath;
        if (!result) {
            return null;
        }
        // Both \ and / must be escaped in regular expressions
        return result.replace(new RegExp('\\' + this.pathSeparator, 'g'), '/');
    }
    asUrl(filepath) {
        if (filepath.startsWith(TypeScriptServiceClient.WALK_THROUGH_SNIPPET_SCHEME_COLON)
            || (filepath.startsWith('untitled:') && this._apiVersion.has213Features())) {
            return vscode_1.Uri.parse(filepath);
        }
        return vscode_1.Uri.file(filepath);
    }
    execute(command, args, expectsResultOrToken) {
        let token = undefined;
        let expectsResult = true;
        if (typeof expectsResultOrToken === 'boolean') {
            expectsResult = expectsResultOrToken;
        }
        else {
            token = expectsResultOrToken;
        }
        const request = this.requestQueue.createRequest(command, args);
        const requestInfo = {
            request: request,
            promise: null,
            callbacks: null
        };
        let result = Promise.resolve(null);
        if (expectsResult) {
            let wasCancelled = false;
            result = new Promise((resolve, reject) => {
                requestInfo.callbacks = { c: resolve, e: reject, start: Date.now() };
                if (token) {
                    token.onCancellationRequested(() => {
                        wasCancelled = true;
                        this.tryCancelRequest(request.seq);
                    });
                }
            }).catch((err) => {
                if (!wasCancelled) {
                    this.error(`'${command}' request failed with error.`, err);
                }
                throw err;
            });
        }
        requestInfo.promise = result;
        this.requestQueue.push(requestInfo);
        this.sendNextRequests();
        return result;
    }
    sendNextRequests() {
        while (this.callbacks.pendingResponses === 0 && this.requestQueue.length > 0) {
            const item = this.requestQueue.shift();
            if (item) {
                this.sendRequest(item);
            }
        }
    }
    sendRequest(requestItem) {
        const serverRequest = requestItem.request;
        this.tracer.traceRequest(serverRequest, !!requestItem.callbacks, this.requestQueue.length);
        if (requestItem.callbacks) {
            this.callbacks.add(serverRequest.seq, requestItem.callbacks);
        }
        this.service()
            .then((childProcess) => {
            childProcess.stdin.write(JSON.stringify(serverRequest) + '\r\n', 'utf8');
        })
            .then(undefined, err => {
            const callback = this.callbacks.fetch(serverRequest.seq);
            if (callback) {
                callback.e(err);
            }
        });
    }
    tryCancelRequest(seq) {
        try {
            if (this.requestQueue.tryCancelPendingRequest(seq)) {
                this.tracer.logTrace(`TypeScript Service: canceled request with sequence number ${seq}`);
                return true;
            }
            if (this.apiVersion.has222Features() && this.cancellationPipeName) {
                this.tracer.logTrace(`TypeScript Service: trying to cancel ongoing request with sequence number ${seq}`);
                try {
                    fs.writeFileSync(this.cancellationPipeName + seq, '');
                }
                catch (e) {
                    // noop
                }
                return true;
            }
            this.tracer.logTrace(`TypeScript Service: tried to cancel request with sequence number ${seq}. But request got already delivered.`);
            return false;
        }
        finally {
            const p = this.callbacks.fetch(seq);
            if (p) {
                p.e(new Error(`Cancelled Request ${seq}`));
            }
        }
    }
    dispatchMessage(message) {
        try {
            if (message.type === 'response') {
                const response = message;
                const p = this.callbacks.fetch(response.request_seq);
                if (p) {
                    this.tracer.traceResponse(response, p.start);
                    if (response.success) {
                        p.c(response);
                    }
                    else {
                        p.e(response);
                    }
                }
            }
            else if (message.type === 'event') {
                const event = message;
                this.tracer.traceEvent(event);
                this.dispatchEvent(event);
            }
            else {
                throw new Error('Unknown message type ' + message.type + ' recevied');
            }
        }
        finally {
            this.sendNextRequests();
        }
    }
    dispatchEvent(event) {
        if (event.event === 'syntaxDiag') {
            this.host.syntaxDiagnosticsReceived(event);
        }
        else if (event.event === 'semanticDiag') {
            this.host.semanticDiagnosticsReceived(event);
        }
        else if (event.event === 'configFileDiag') {
            this.host.configFileDiagnosticsReceived(event);
        }
        else if (event.event === 'telemetry') {
            const telemetryData = event.body;
            this.dispatchTelemetryEvent(telemetryData);
        }
        else if (event.event === 'projectLanguageServiceState') {
            const data = event.body;
            if (data) {
                this._onProjectLanguageServiceStateChanged.fire(data);
            }
        }
        else if (event.event === 'beginInstallTypes') {
            const data = event.body;
            if (data) {
                this._onDidBeginInstallTypings.fire(data);
            }
        }
        else if (event.event === 'endInstallTypes') {
            const data = event.body;
            if (data) {
                this._onDidEndInstallTypings.fire(data);
            }
        }
        else if (event.event === 'typesInstallerInitializationFailed') {
            const data = event.body;
            if (data) {
                this._onTypesInstallerInitializationFailed.fire(data);
            }
        }
    }
    dispatchTelemetryEvent(telemetryData) {
        const properties = Object.create(null);
        switch (telemetryData.telemetryEventName) {
            case 'typingsInstalled':
                const typingsInstalledPayload = telemetryData.payload;
                properties['installedPackages'] = typingsInstalledPayload.installedPackages;
                if (is.defined(typingsInstalledPayload.installSuccess)) {
                    properties['installSuccess'] = typingsInstalledPayload.installSuccess.toString();
                }
                if (is.string(typingsInstalledPayload.typingsInstallerVersion)) {
                    properties['typingsInstallerVersion'] = typingsInstalledPayload.typingsInstallerVersion;
                }
                break;
            default:
                const payload = telemetryData.payload;
                if (payload) {
                    Object.keys(payload).forEach((key) => {
                        try {
                            if (payload.hasOwnProperty(key)) {
                                properties[key] = is.string(payload[key]) ? payload[key] : JSON.stringify(payload[key]);
                            }
                        }
                        catch (e) {
                            // noop
                        }
                    });
                }
                break;
        }
        this.logTelemetry(telemetryData.telemetryEventName, properties);
    }
}
TypeScriptServiceClient.useWorkspaceTsdkStorageKey = 'typescript.useWorkspaceTsdk';
TypeScriptServiceClient.tsdkMigratedStorageKey = 'typescript.tsdkMigrated';
TypeScriptServiceClient.WALK_THROUGH_SNIPPET_SCHEME = 'walkThroughSnippet';
TypeScriptServiceClient.WALK_THROUGH_SNIPPET_SCHEME_COLON = `${TypeScriptServiceClient.WALK_THROUGH_SNIPPET_SCHEME}:`;
exports.default = TypeScriptServiceClient;
//# sourceMappingURL=typescriptServiceClient.js.map