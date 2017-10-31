"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
function isImplicitProjectConfigFile(configFileName) {
    return configFileName.indexOf('/dev/null/') === 0;
}
exports.isImplicitProjectConfigFile = isImplicitProjectConfigFile;
const emptyConfig = new vscode.SnippetString(`{
	"compilerOptions": {
		"target": "ES6"$0
	},
	"exclude": [
		"node_modules",
		"**/node_modules/*"
	]
}`);
function openOrCreateConfigFile(isTypeScriptProject, rootPath) {
    const configFile = vscode.Uri.file(path.join(rootPath, isTypeScriptProject ? 'tsconfig.json' : 'jsconfig.json'));
    const col = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
    return vscode.workspace.openTextDocument(configFile)
        .then(doc => {
        return vscode.window.showTextDocument(doc, col);
    }, () => __awaiter(this, void 0, void 0, function* () {
        const doc = yield vscode.workspace.openTextDocument(configFile.with({ scheme: 'untitled' }));
        const editor = yield vscode.window.showTextDocument(doc, col);
        if (editor.document.getText().length === 0) {
            yield editor.insertSnippet(emptyConfig);
            return editor;
        }
        return editor;
    }));
}
exports.openOrCreateConfigFile = openOrCreateConfigFile;
