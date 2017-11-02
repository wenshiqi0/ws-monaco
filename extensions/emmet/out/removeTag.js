"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const util_1 = require("./util");
function removeTag() {
    let editor = vscode.window.activeTextEditor;
    if (!util_1.validate(false)) {
        return;
    }
    let rootNode = util_1.parseDocument(editor.document);
    if (!rootNode) {
        return;
    }
    let indentInSpaces = '';
    for (let i = 0; i < editor.options.tabSize; i++) {
        indentInSpaces += ' ';
    }
    let rangesToRemove = [];
    editor.selections.reverse().forEach(selection => {
        rangesToRemove = rangesToRemove.concat(getRangeToRemove(editor, rootNode, selection, indentInSpaces));
    });
    return editor.edit(editBuilder => {
        rangesToRemove.forEach(range => {
            editBuilder.replace(range, '');
        });
    });
}
exports.removeTag = removeTag;
function getRangeToRemove(editor, rootNode, selection, indentInSpaces) {
    let nodeToUpdate = util_1.getNode(rootNode, selection.start);
    if (!nodeToUpdate) {
        return [];
    }
    let openRange = new vscode.Range(nodeToUpdate.open.start, nodeToUpdate.open.end);
    let closeRange = null;
    if (nodeToUpdate.close) {
        closeRange = new vscode.Range(nodeToUpdate.close.start, nodeToUpdate.close.end);
    }
    let ranges = [openRange];
    if (closeRange) {
        for (let i = openRange.start.line + 1; i <= closeRange.start.line; i++) {
            let lineContent = editor.document.lineAt(i).text;
            if (lineContent.startsWith('\t')) {
                ranges.push(new vscode.Range(i, 0, i, 1));
            }
            else if (lineContent.startsWith(indentInSpaces)) {
                ranges.push(new vscode.Range(i, 0, i, indentInSpaces.length));
            }
        }
        ranges.push(closeRange);
    }
    return ranges;
}
//# sourceMappingURL=removeTag.js.map