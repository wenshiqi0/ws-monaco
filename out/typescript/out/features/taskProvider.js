/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const tsconfigProvider_1 = require("../utils/tsconfigProvider");
const tsconfig_1 = require("../utils/tsconfig");
const nls = require("vscode-nls");
const localize = nls.loadMessageBundle();
const exists = (file) => new Promise((resolve, _reject) => {
    fs.exists(file, (value) => {
        resolve(value);
    });
});
/**
 * Provides tasks for building `tsconfig.json` files in a project.
 */
class TscTaskProvider {
    constructor(lazyClient) {
        this.lazyClient = lazyClient;
        this.tsconfigProvider = new tsconfigProvider_1.default();
    }
    provideTasks(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const folders = vscode.workspace.workspaceFolders;
            if (!folders || !folders.length) {
                return [];
            }
            const configPaths = new Set();
            const tasks = [];
            for (const project of yield this.getAllTsConfigs(token)) {
                if (!configPaths.has(project.path)) {
                    configPaths.add(project.path);
                    tasks.push(yield this.getBuildTaskForProject(project));
                }
            }
            return tasks;
        });
    }
    resolveTask(_task) {
        return undefined;
    }
    getAllTsConfigs(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const out = new Set();
            const configs = (yield this.getTsConfigForActiveFile(token)).concat(yield this.getTsConfigsInWorkspace());
            for (const config of configs) {
                if (yield exists(config.path)) {
                    out.add(config);
                }
            }
            return Array.from(out);
        });
    }
    getTsConfigForActiveFile(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                if (path.basename(editor.document.fileName).match(/^tsconfig\.(.\.)?json$/)) {
                    const uri = editor.document.uri;
                    return [{
                            path: uri.fsPath,
                            workspaceFolder: vscode.workspace.getWorkspaceFolder(uri)
                        }];
                }
            }
            const file = this.getActiveTypeScriptFile();
            if (!file) {
                return [];
            }
            try {
                const res = yield this.lazyClient().execute('projectInfo', { file, needFileNameList: false }, token);
                if (!res || !res.body) {
                    return [];
                }
                const { configFileName } = res.body;
                if (configFileName && !tsconfig_1.isImplicitProjectConfigFile(configFileName)) {
                    const normalizedConfigPath = path.normalize(configFileName);
                    const uri = vscode.Uri.file(normalizedConfigPath);
                    const folder = vscode.workspace.getWorkspaceFolder(uri);
                    return [{
                            path: normalizedConfigPath,
                            workspaceFolder: folder
                        }];
                }
            }
            catch (e) {
                // noop
            }
            return [];
        });
    }
    getTsConfigsInWorkspace() {
        return __awaiter(this, void 0, void 0, function* () {
            return Array.from(yield this.tsconfigProvider.getConfigsForWorkspace());
        });
    }
    getCommand(project) {
        return __awaiter(this, void 0, void 0, function* () {
            if (project.workspaceFolder) {
                const platform = process.platform;
                const bin = path.join(project.workspaceFolder.uri.fsPath, 'node_modules', '.bin');
                if (platform === 'win32' && (yield exists(path.join(bin, 'tsc.cmd')))) {
                    return path.join(bin, 'tsc.cmd');
                }
                else if ((platform === 'linux' || platform === 'darwin') && (yield exists(path.join(bin, 'tsc')))) {
                    return path.join(bin, 'tsc');
                }
            }
            return 'tsc';
        });
    }
    shouldUseWatchForBuild(configFile) {
        try {
            const config = JSON.parse(fs.readFileSync(configFile.path, 'utf-8'));
            if (config) {
                return !!config.compileOnSave;
            }
        }
        catch (e) {
            // noop
        }
        return false;
    }
    getActiveTypeScriptFile() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            if (document && (document.languageId === 'typescript' || document.languageId === 'typescriptreact')) {
                return this.lazyClient().normalizePath(document.uri);
            }
        }
        return null;
    }
    getBuildTaskForProject(project) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = yield this.getCommand(project);
            let label = project.path;
            if (project.workspaceFolder) {
                const projectFolder = project.workspaceFolder;
                const workspaceFolders = vscode.workspace.workspaceFolders;
                const relativePath = path.relative(project.workspaceFolder.uri.fsPath, project.path);
                if (workspaceFolders && workspaceFolders.length > 1) {
                    // Use absolute path when we have multiple folders with the same name
                    if (workspaceFolders.filter(x => x.name === projectFolder.name).length > 1) {
                        label = path.join(project.workspaceFolder.uri.fsPath, relativePath);
                    }
                    else {
                        label = path.join(project.workspaceFolder.name, relativePath);
                    }
                }
                else {
                    label = relativePath;
                }
            }
            const watch = false && this.shouldUseWatchForBuild(project);
            const identifier = { type: 'typescript', tsconfig: label };
            const buildTask = new vscode.Task(identifier, watch
                ? localize('buildAndWatchTscLabel', 'watch - {0}', label)
                : localize('buildTscLabel', 'build - {0}', label), 'tsc', new vscode.ShellExecution(`${command} ${watch ? '--watch' : ''} -p "${project.path}"`), watch
                ? '$tsc-watch'
                : '$tsc');
            buildTask.group = vscode.TaskGroup.Build;
            buildTask.isBackground = watch;
            return buildTask;
        });
    }
}
/**
 * Manages registrations of TypeScript task provides with VScode.
 */
class TypeScriptTaskProviderManager {
    constructor(lazyClient) {
        this.lazyClient = lazyClient;
        this.taskProviderSub = undefined;
        this.disposables = [];
        vscode.workspace.onDidChangeConfiguration(this.onConfigurationChanged, this, this.disposables);
        this.onConfigurationChanged();
    }
    dispose() {
        if (this.taskProviderSub) {
            this.taskProviderSub.dispose();
            this.taskProviderSub = undefined;
        }
        this.disposables.forEach(x => x.dispose());
    }
    onConfigurationChanged() {
        let autoDetect = vscode.workspace.getConfiguration('typescript.tsc').get('autoDetect');
        if (this.taskProviderSub && autoDetect === 'off') {
            this.taskProviderSub.dispose();
            this.taskProviderSub = undefined;
        }
        else if (!this.taskProviderSub && autoDetect === 'on') {
            this.taskProviderSub = vscode.workspace.registerTaskProvider('typescript', new TscTaskProvider(this.lazyClient));
        }
    }
}
exports.default = TypeScriptTaskProviderManager;
