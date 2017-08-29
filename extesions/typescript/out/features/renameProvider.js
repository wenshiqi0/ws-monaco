"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class TypeScriptRenameProvider {
    constructor(client) {
        this.client = client;
    }
    provideRenameEdits(document, position, newName, token) {
        const filepath = this.client.normalizePath(document.uri);
        if (!filepath) {
            return Promise.resolve(null);
        }
        const args = {
            file: filepath,
            line: position.line + 1,
            offset: position.character + 1,
            findInStrings: false,
            findInComments: false
        };
        return this.client.execute('rename', args, token).then((response) => {
            const renameResponse = response.body;
            if (!renameResponse) {
                return Promise.resolve(null);
            }
            const renameInfo = renameResponse.info;
            const result = new vscode_1.WorkspaceEdit();
            if (!renameInfo.canRename) {
                return Promise.reject(renameInfo.localizedErrorMessage);
            }
            renameResponse.locs.forEach((spanGroup) => {
                const resource = this.client.asUrl(spanGroup.file);
                if (!resource) {
                    return;
                }
                spanGroup.locs.forEach((textSpan) => {
                    result.replace(resource, new vscode_1.Range(textSpan.start.line - 1, textSpan.start.offset - 1, textSpan.end.line - 1, textSpan.end.offset - 1), newName);
                });
            });
            return result;
        }, () => {
            return null;
        });
    }
}
exports.default = TypeScriptRenameProvider;
//# sourceMappingURL=renameProvider.js.map