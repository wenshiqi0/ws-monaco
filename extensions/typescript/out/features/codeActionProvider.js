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
const vscode_1 = require("vscode");
class TypeScriptCodeActionProvider {
    constructor(client, mode) {
        this.client = client;
        this.commandId = `_typescript.applyCodeAction.${mode}`;
        vscode_1.commands.registerCommand(this.commandId, this.onCodeAction, this);
    }
    provideCodeActions(document, range, context, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.apiVersion.has213Features()) {
                return [];
            }
            const file = this.client.normalizePath(document.uri);
            if (!file) {
                return [];
            }
            const supportedActions = yield this.getSupportedActionsForContext(context);
            if (!supportedActions.size) {
                return [];
            }
            let formattingOptions = undefined;
            for (const editor of vscode_1.window.visibleTextEditors) {
                if (editor.document.fileName === document.fileName) {
                    formattingOptions = { tabSize: editor.options.tabSize, insertSpaces: editor.options.insertSpaces };
                    break;
                }
            }
            const source = {
                uri: document.uri,
                version: document.version,
                range: range,
                formattingOptions: formattingOptions
            };
            const args = {
                file: file,
                startLine: range.start.line + 1,
                endLine: range.end.line + 1,
                startOffset: range.start.character + 1,
                endOffset: range.end.character + 1,
                errorCodes: Array.from(supportedActions)
            };
            const response = yield this.client.execute('getCodeFixes', args, token);
            return (response.body || []).map(action => this.getCommandForAction(source, action));
        });
    }
    get supportedCodeActions() {
        if (!this._supportedCodeActions) {
            this._supportedCodeActions = this.client.execute('getSupportedCodeFixes', null, undefined)
                .then(response => response.body || [])
                .then(codes => codes.map(code => +code).filter(code => !isNaN(code)))
                .then(codes => codes.reduce((obj, code) => {
                obj[code] = true;
                return obj;
            }, Object.create(null)));
        }
        return this._supportedCodeActions;
    }
    getSupportedActionsForContext(context) {
        return this.supportedCodeActions.then(supportedActions => new Set(context.diagnostics
            .map(diagnostic => +diagnostic.code)
            .filter(code => supportedActions[code])));
    }
    getCommandForAction(source, action) {
        return {
            title: action.description,
            command: this.commandId,
            arguments: [source, action]
        };
    }
    onCodeAction(source, action) {
        return __awaiter(this, void 0, void 0, function* () {
            const workspaceEdit = new vscode_1.WorkspaceEdit();
            for (const change of action.changes) {
                for (const textChange of change.textChanges) {
                    workspaceEdit.replace(this.client.asUrl(change.fileName), new vscode_1.Range(textChange.start.line - 1, textChange.start.offset - 1, textChange.end.line - 1, textChange.end.offset - 1), textChange.newText);
                }
            }
            const success = vscode_1.workspace.applyEdit(workspaceEdit);
            if (!success) {
                return false;
            }
            let firstEdit = undefined;
            for (const [uri, edits] of workspaceEdit.entries()) {
                if (uri.fsPath === source.uri.fsPath) {
                    firstEdit = edits[0];
                    break;
                }
            }
            if (!firstEdit) {
                return true;
            }
            const newLines = firstEdit.newText.match(/\n/g);
            const editedRange = new vscode_1.Range(firstEdit.range.start.line, 0, firstEdit.range.end.line + 1 + (newLines ? newLines.length : 0), 0);
            // TODO: Workaround for https://github.com/Microsoft/TypeScript/issues/12249
            // apply formatting to the source range until TS returns formatted results
            const edits = (yield vscode_1.commands.executeCommand('vscode.executeFormatRangeProvider', source.uri, editedRange, source.formattingOptions || {}));
            if (!edits || !edits.length) {
                return false;
            }
            const formattingEdit = new vscode_1.WorkspaceEdit();
            formattingEdit.set(source.uri, edits);
            return vscode_1.workspace.applyEdit(formattingEdit);
        });
    }
}
exports.default = TypeScriptCodeActionProvider;
//# sourceMappingURL=codeActionProvider.js.map