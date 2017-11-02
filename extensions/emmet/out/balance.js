"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const util_1 = require("./util");
function balanceOut() {
    balance(true);
}
exports.balanceOut = balanceOut;
function balanceIn() {
    balance(false);
}
exports.balanceIn = balanceIn;
function balance(out) {
    let editor = vscode.window.activeTextEditor;
    if (!util_1.validate(false)) {
        return;
    }
    let rootNode = util_1.parseDocument(editor.document);
    if (!rootNode) {
        return;
    }
    let getRangeFunction = out ? getRangeToBalanceOut : getRangeToBalanceIn;
    let newSelections = [];
    editor.selections.forEach(selection => {
        let range = getRangeFunction(editor.document, selection, rootNode);
        newSelections.push(range ? range : selection);
    });
    editor.selection = newSelections[0];
    editor.selections = newSelections;
}
function getRangeToBalanceOut(document, selection, rootNode) {
    let nodeToBalance = util_1.getNode(rootNode, selection.start);
    if (!nodeToBalance) {
        return;
    }
    if (!nodeToBalance.close) {
        return new vscode.Selection(nodeToBalance.start, nodeToBalance.end);
    }
    let innerSelection = new vscode.Selection(nodeToBalance.open.end, nodeToBalance.close.start);
    let outerSelection = new vscode.Selection(nodeToBalance.start, nodeToBalance.end);
    if (innerSelection.contains(selection) && !innerSelection.isEqual(selection)) {
        return innerSelection;
    }
    if (outerSelection.contains(selection) && !outerSelection.isEqual(selection)) {
        return outerSelection;
    }
    return;
}
function getRangeToBalanceIn(document, selection, rootNode) {
    let nodeToBalance = util_1.getNode(rootNode, selection.start, true);
    if (!nodeToBalance) {
        return;
    }
    if (selection.start.isEqual(nodeToBalance.start)
        && selection.end.isEqual(nodeToBalance.end)
        && nodeToBalance.close) {
        return new vscode.Selection(nodeToBalance.open.end, nodeToBalance.close.start);
    }
    if (!nodeToBalance.firstChild) {
        return;
    }
    if (selection.start.isEqual(nodeToBalance.firstChild.start)
        && selection.end.isEqual(nodeToBalance.firstChild.end)
        && nodeToBalance.firstChild.close) {
        return new vscode.Selection(nodeToBalance.firstChild.open.end, nodeToBalance.firstChild.close.start);
    }
    return new vscode.Selection(nodeToBalance.firstChild.start, nodeToBalance.firstChild.end);
}
//# sourceMappingURL=balance.js.map