"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function getSymbolKind(item) {
    switch (item.kind) {
        case 'method': return vscode_1.SymbolKind.Method;
        case 'enum': return vscode_1.SymbolKind.Enum;
        case 'function': return vscode_1.SymbolKind.Function;
        case 'class': return vscode_1.SymbolKind.Class;
        case 'interface': return vscode_1.SymbolKind.Interface;
        case 'var': return vscode_1.SymbolKind.Variable;
        default: return vscode_1.SymbolKind.Variable;
    }
}
class TypeScriptWorkspaceSymbolProvider {
    constructor(client, modeId) {
        this.client = client;
        this.modeId = modeId;
    }
    provideWorkspaceSymbols(search, token) {
        // typescript wants to have a resource even when asking
        // general questions so we check the active editor. If this
        // doesn't match we take the first TS document.
        let uri = undefined;
        const editor = vscode_1.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            if (document && document.languageId === this.modeId) {
                uri = document.uri;
            }
        }
        if (!uri) {
            const documents = vscode_1.workspace.textDocuments;
            for (const document of documents) {
                if (document.languageId === this.modeId) {
                    uri = document.uri;
                    break;
                }
            }
        }
        if (!uri) {
            return Promise.resolve([]);
        }
        const filepath = this.client.normalizePath(uri);
        if (!filepath) {
            return Promise.resolve([]);
        }
        const args = {
            file: filepath,
            searchValue: search
        };
        return this.client.execute('navto', args, token).then((response) => {
            const result = [];
            let data = response.body;
            if (data) {
                for (let item of data) {
                    if (!item.containerName && item.kind === 'alias') {
                        continue;
                    }
                    const range = new vscode_1.Range(item.start.line - 1, item.start.offset - 1, item.end.line - 1, item.end.offset - 1);
                    let label = item.name;
                    if (item.kind === 'method' || item.kind === 'function') {
                        label += '()';
                    }
                    result.push(new vscode_1.SymbolInformation(label, getSymbolKind(item), item.containerName || '', new vscode_1.Location(this.client.asUrl(item.file), range)));
                }
            }
            return result;
        }, () => {
            return [];
        });
    }
}
exports.default = TypeScriptWorkspaceSymbolProvider;
//# sourceMappingURL=workspaceSymbolProvider.js.map