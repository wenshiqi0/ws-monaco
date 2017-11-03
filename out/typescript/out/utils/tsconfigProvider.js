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
class TsConfigProvider {
    getConfigsForWorkspace() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!vscode.workspace.workspaceFolders) {
                return [];
            }
            const configs = new Map();
            for (const config of yield vscode.workspace.findFiles('**/tsconfig*.json', '**/node_modules/**')) {
                const root = vscode.workspace.getWorkspaceFolder(config);
                if (root) {
                    configs.set(config.fsPath, {
                        path: config.fsPath,
                        workspaceFolder: root
                    });
                }
            }
            return configs.values();
        });
    }
}
exports.default = TsConfigProvider;
