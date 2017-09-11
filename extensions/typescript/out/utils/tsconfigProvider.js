"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode = require("vscode");
class TsConfigProvider extends vscode.Disposable {
    constructor() {
        super(() => this.dispose());
        this.tsconfigs = new Set();
        this.activated = false;
        this.disposables = [];
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
    getConfigsForWorkspace() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!vscode.workspace.rootPath) {
                return [];
            }
            yield this.ensureActivated();
            return this.tsconfigs;
        });
    }
    ensureActivated() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.activated) {
                return this;
            }
            this.activated = true;
            for (const config of yield TsConfigProvider.loadWorkspaceTsconfigs()) {
                this.tsconfigs.add(config.fsPath);
            }
            const configFileWatcher = vscode.workspace.createFileSystemWatcher('**/tsconfig*.json');
            this.disposables.push(configFileWatcher);
            configFileWatcher.onDidCreate(this.handleProjectCreate, this, this.disposables);
            configFileWatcher.onDidDelete(this.handleProjectDelete, this, this.disposables);
            return this;
        });
    }
    static loadWorkspaceTsconfigs() {
        return vscode.workspace.findFiles('**/tsconfig*.json', '**/node_modules/**');
    }
    handleProjectCreate(e) {
        this.tsconfigs.add(e.fsPath);
    }
    handleProjectDelete(e) {
        this.tsconfigs.delete(e.fsPath);
    }
}
exports.default = TsConfigProvider;
//# sourceMappingURL=tsconfigProvider.js.map