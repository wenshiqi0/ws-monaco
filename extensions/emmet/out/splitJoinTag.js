"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const util_1 = require("./util");
function splitJoinTag() {
    let editor = vscode.window.activeTextEditor;
    if (!util_1.validate(false)) {
        return;
    }
    let rootNode = util_1.parseDocument(editor.document);
    if (!rootNode) {
        return;
    }
    return editor.edit(editBuilder => {
        editor.selections.reverse().forEach(selection => {
            let textEdit = getRangesToReplace(editor.document, selection, rootNode);
            if (textEdit) {
                editBuilder.replace(textEdit.range, textEdit.newText);
            }
        });
    });
}
exports.splitJoinTag = splitJoinTag;
function getRangesToReplace(document, selection, rootNode) {
    let nodeToUpdate = util_1.getNode(rootNode, selection.start);
    let rangeToReplace;
    let textToReplaceWith;
    if (!nodeToUpdate) {
        return;
    }
    if (!nodeToUpdate.close) {
        // Split Tag
        let nodeText = document.getText(new vscode.Range(nodeToUpdate.start, nodeToUpdate.end));
        let m = nodeText.match(/(\s*\/)?>$/);
        let end = nodeToUpdate.end;
        let start = m ? end.translate(0, -m[0].length) : end;
        rangeToReplace = new vscode.Range(start, end);
        textToReplaceWith = `></${nodeToUpdate.name}>`;
    }
    else {
        // Join Tag
        let start = nodeToUpdate.open.end.translate(0, -1);
        let end = nodeToUpdate.end;
        rangeToReplace = new vscode.Range(start, end);
        textToReplaceWith = '/>';
    }
    return new vscode.TextEdit(rangeToReplace, textToReplaceWith);
}
//# sourceMappingURL=splitJoinTag.js.map