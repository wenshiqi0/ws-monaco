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
    dispose() {
        this.tsconfigProvider.dispose();
    }
    provideTasks(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const rootPath = vscode.workspace.rootPath;
            if (!rootPath) {
                return [];
            }
            const command = yield this.getCommand();
            const projects = yield this.getAllTsConfigs(token);
            return projects.map(configFile => {
                const configFileName = path.relative(rootPath, configFile);
                const buildTask = new vscode.ShellTask(`build ${configFileName}`, `${command} -p "${configFile}"`, '$tsc');
                buildTask.source = 'tsc';
                buildTask.group = vscode.TaskGroup.Build;
                return buildTask;
            });
        });
    }
    getAllTsConfigs(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const out = new Set();
            const configs = (yield this.getTsConfigForActiveFile(token)).concat(yield this.getTsConfigsInWorkspace());
            for (const config of configs) {
                if (yield exists(config)) {
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
                    return [editor.document.fileName];
                }
            }
            const file = this.getActiveTypeScriptFile();
            if (!file) {
                return [];
            }
            const res = yield this.lazyClient().execute('projectInfo', { file, needFileNameList: false }, token);
            if (!res || !res.body) {
                return [];
            }
            const { configFileName } = res.body;
            if (configFileName && !tsconfig_1.isImplicitProjectConfigFile(configFileName)) {
                return [configFileName];
            }
            return [];
        });
    }
    getTsConfigsInWorkspace() {
        return __awaiter(this, void 0, void 0, function* () {
            return Array.from(yield this.tsconfigProvider.getConfigsForWorkspace());
        });
    }
    getCommand() {
        return __awaiter(this, void 0, void 0, function* () {
            const platform = process.platform;
            if (platform === 'win32' && (yield exists(path.join(vscode.workspace.rootPath, 'node_modules', '.bin', 'tsc.cmd')))) {
                return path.join('.', 'node_modules', '.bin', 'tsc.cmd');
            }
            else if ((platform === 'linux' || platform === 'darwin') && (yield exists(path.join(vscode.workspace.rootPath, 'node_modules', '.bin', 'tsc')))) {
                return path.join('.', 'node_modules', '.bin', 'tsc');
            }
            else {
                return 'tsc';
            }
        });
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
            this.taskProviderSub = vscode.workspace.registerTaskProvider(new TscTaskProvider(this.lazyClient));
        }
    }
}
exports.default = TypeScriptTaskProviderManager;
//# sourceMappingURL=taskProvider.js.map