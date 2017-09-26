"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
function isImplicitProjectConfigFile(configFileName) {
    return configFileName.indexOf('/dev/null/') === 0;
}
exports.isImplicitProjectConfigFile = isImplicitProjectConfigFile;
function openOrCreateConfigFile(isTypeScriptProject, rootPath) {
    const configFile = vscode.Uri.file(path.join(rootPath, isTypeScriptProject ? 'tsconfig.json' : 'jsconfig.json'));
    const col = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
    return vscode.workspace.openTextDocument(configFile)
        .then(doc => {
        return vscode.window.showTextDocument(doc, col);
    }, _ => {
        return vscode.workspace.openTextDocument(configFile.with({ scheme: 'untitled' }))
            .then(doc => vscode.window.showTextDocument(doc, col))
            .then(editor => {
            if (editor.document.getText().length === 0) {
                return editor.insertSnippet(new vscode.SnippetString('{\n\t$0\n}'))
                    .then(_ => editor);
            }
            return editor;
        });
    });
}
exports.openOrCreateConfigFile = openOrCreateConfigFile;
//# sourceMappingURL=tsconfig.js.map