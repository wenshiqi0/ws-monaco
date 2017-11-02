"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const util_1 = require("./util");
const selectItemHTML_1 = require("./selectItemHTML");
const selectItemStylesheet_1 = require("./selectItemStylesheet");
const vscode_emmet_helper_1 = require("vscode-emmet-helper");
function fetchSelectItem(direction) {
    let editor = vscode.window.activeTextEditor;
    if (!util_1.validate()) {
        return;
    }
    let nextItem;
    let prevItem;
    if (vscode_emmet_helper_1.isStyleSheet(editor.document.languageId)) {
        nextItem = selectItemStylesheet_1.nextItemStylesheet;
        prevItem = selectItemStylesheet_1.prevItemStylesheet;
    }
    else {
        nextItem = selectItemHTML_1.nextItemHTML;
        prevItem = selectItemHTML_1.prevItemHTML;
    }
    let rootNode = util_1.parseDocument(editor.document);
    if (!rootNode) {
        return;
    }
    let newSelections = [];
    editor.selections.forEach(selection => {
        const selectionStart = selection.isReversed ? selection.active : selection.anchor;
        const selectionEnd = selection.isReversed ? selection.anchor : selection.active;
        let updatedSelection = direction === 'next' ? nextItem(selectionStart, selectionEnd, editor, rootNode) : prevItem(selectionStart, selectionEnd, editor, rootNode);
        newSelections.push(updatedSelection ? updatedSelection : selection);
    });
    editor.selections = newSelections;
    editor.revealRange(editor.selections[editor.selections.length - 1]);
}
exports.fetchSelectItem = fetchSelectItem;
//# sourceMappingURL=selectItem.js.map