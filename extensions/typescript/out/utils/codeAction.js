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
const convert_1 = require("./convert");
function applyCodeAction(client, action, file) {
    return __awaiter(this, void 0, void 0, function* () {
        if (action.changes && action.changes.length) {
            const workspaceEdit = new vscode_1.WorkspaceEdit();
            for (const change of action.changes) {
                for (const textChange of change.textChanges) {
                    workspaceEdit.replace(client.asUrl(change.fileName), convert_1.tsTextSpanToVsRange(textChange), textChange.newText);
                }
            }
            if (!(yield vscode_1.workspace.applyEdit(workspaceEdit))) {
                return false;
            }
        }
        if (action.commands && action.commands.length) {
            for (const command of action.commands) {
                const response = yield client.execute('applyCodeActionCommand', { file, command });
                if (!response || !response.body) {
                    return false;
                }
            }
        }
        return true;
    });
}
exports.applyCodeAction = applyCodeAction;
//# sourceMappingURL=codeAction.js.map