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
const vscode_1 = require("vscode");
const convert_1 = require("../utils/convert");
class TypeScriptRefactorProvider {
    constructor(client, formattingOptionsManager, mode) {
        this.client = client;
        this.formattingOptionsManager = formattingOptionsManager;
        this.doRefactorCommandId = `_typescript.applyRefactoring.${mode}`;
        this.selectRefactorCommandId = `_typescript.selectRefactoring.${mode}`;
        vscode_1.commands.registerCommand(this.doRefactorCommandId, this.doRefactoring, this);
        vscode_1.commands.registerCommand(this.selectRefactorCommandId, this.selectRefactoring, this);
    }
    provideCodeActions(document, range, _context, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.apiVersion.has240Features()) {
                return [];
            }
            const file = this.client.normalizePath(document.uri);
            if (!file) {
                return [];
            }
            const args = convert_1.vsRangeToTsFileRange(file, range);
            try {
                const response = yield this.client.execute('getApplicableRefactors', args, token);
                if (!response || !response.body) {
                    return [];
                }
                const actions = [];
                for (const info of response.body) {
                    if (info.inlineable === false) {
                        actions.push({
                            title: info.description,
                            command: this.selectRefactorCommandId,
                            arguments: [document, file, info, range]
                        });
                    }
                    else {
                        for (const action of info.actions) {
                            actions.push({
                                title: action.description,
                                command: this.doRefactorCommandId,
                                arguments: [document, file, info.name, action.name, range]
                            });
                        }
                    }
                }
                return actions;
            }
            catch (err) {
                return [];
            }
        });
    }
    toWorkspaceEdit(edits) {
        const workspaceEdit = new vscode_1.WorkspaceEdit();
        for (const edit of edits) {
            for (const textChange of edit.textChanges) {
                workspaceEdit.replace(this.client.asUrl(edit.fileName), convert_1.tsTextSpanToVsRange(textChange), textChange.newText);
            }
        }
        return workspaceEdit;
    }
    selectRefactoring(document, file, info, range) {
        return __awaiter(this, void 0, void 0, function* () {
            return vscode_1.window.showQuickPick(info.actions.map((action) => ({
                label: action.name,
                description: action.description
            }))).then(selected => {
                if (!selected) {
                    return false;
                }
                return this.doRefactoring(document, file, info.name, selected.label, range);
            });
        });
    }
    doRefactoring(document, file, refactor, action, range) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.formattingOptionsManager.ensureFormatOptionsForDocument(document, undefined);
            const args = Object.assign({}, convert_1.vsRangeToTsFileRange(file, range), { refactor,
                action });
            const response = yield this.client.execute('getEditsForRefactor', args);
            if (!response || !response.body || !response.body.edits.length) {
                return false;
            }
            const edit = this.toWorkspaceEdit(response.body.edits);
            if (!(yield vscode_1.workspace.applyEdit(edit))) {
                return false;
            }
            const renameLocation = response.body.renameLocation;
            if (renameLocation) {
                if (vscode_1.window.activeTextEditor && vscode_1.window.activeTextEditor.document.uri.fsPath === file) {
                    const pos = convert_1.tsLocationToVsPosition(renameLocation);
                    vscode_1.window.activeTextEditor.selection = new vscode_1.Selection(pos, pos);
                    yield vscode_1.commands.executeCommand('editor.action.rename');
                }
            }
            return true;
        });
    }
}
exports.default = TypeScriptRefactorProvider;
