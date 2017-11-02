"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const util_1 = require("./util");
const vscode_emmet_helper_1 = require("vscode-emmet-helper");
const css_parser_1 = require("@emmetio/css-parser");
const bufferStream_1 = require("./bufferStream");
const startCommentStylesheet = '/*';
const endCommentStylesheet = '*/';
const startCommentHTML = '<!--';
const endCommentHTML = '-->';
function toggleComment() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No editor is active');
        return;
    }
    let toggleCommentInternal;
    if (vscode_emmet_helper_1.isStyleSheet(editor.document.languageId)) {
        toggleCommentInternal = toggleCommentStylesheet;
    }
    else {
        toggleCommentInternal = toggleCommentHTML;
    }
    let rootNode = util_1.parseDocument(editor.document);
    if (!rootNode) {
        return;
    }
    return editor.edit(editBuilder => {
        editor.selections.reverse().forEach(selection => {
            let edits = toggleCommentInternal(editor.document, selection, rootNode);
            edits.forEach(x => {
                editBuilder.replace(x.range, x.newText);
            });
        });
    });
}
exports.toggleComment = toggleComment;
function toggleCommentHTML(document, selection, rootNode) {
    const selectionStart = selection.isReversed ? selection.active : selection.anchor;
    const selectionEnd = selection.isReversed ? selection.anchor : selection.active;
    let startNode = util_1.getNode(rootNode, selectionStart, true);
    let endNode = util_1.getNode(rootNode, selectionEnd, true);
    if (!startNode || !endNode) {
        return [];
    }
    if (util_1.sameNodes(startNode, endNode) && startNode.name === 'style'
        && startNode.open.end.isBefore(selectionStart)
        && startNode.close.start.isAfter(selectionEnd)) {
        let buffer = new bufferStream_1.DocumentStreamReader(document, startNode.open.end, new vscode.Range(startNode.open.end, startNode.close.start));
        let cssRootNode = css_parser_1.default(buffer);
        return toggleCommentStylesheet(document, selection, cssRootNode);
    }
    let allNodes = util_1.getNodesInBetween(startNode, endNode);
    let edits = [];
    allNodes.forEach(node => {
        edits = edits.concat(getRangesToUnCommentHTML(node, document));
    });
    if (startNode.type === 'comment') {
        return edits;
    }
    edits.push(new vscode.TextEdit(new vscode.Range(allNodes[0].start, allNodes[0].start), startCommentHTML));
    edits.push(new vscode.TextEdit(new vscode.Range(allNodes[allNodes.length - 1].end, allNodes[allNodes.length - 1].end), endCommentHTML));
    return edits;
}
function getRangesToUnCommentHTML(node, document) {
    let unCommentTextEdits = [];
    // If current node is commented, then uncomment and return
    if (node.type === 'comment') {
        unCommentTextEdits.push(new vscode.TextEdit(new vscode.Range(node.start, node.start.translate(0, startCommentHTML.length)), ''));
        unCommentTextEdits.push(new vscode.TextEdit(new vscode.Range(node.end.translate(0, -endCommentHTML.length), node.end), ''));
        return unCommentTextEdits;
    }
    // All children of current node should be uncommented
    node.children.forEach(childNode => {
        unCommentTextEdits = unCommentTextEdits.concat(getRangesToUnCommentHTML(childNode, document));
    });
    return unCommentTextEdits;
}
function toggleCommentStylesheet(document, selection, rootNode) {
    let selectionStart = selection.isReversed ? selection.active : selection.anchor;
    let selectionEnd = selection.isReversed ? selection.anchor : selection.active;
    let startNode = util_1.getNode(rootNode, selectionStart, true);
    let endNode = util_1.getNode(rootNode, selectionEnd, true);
    if (!selection.isEmpty || startNode) {
        selectionStart = selection.isEmpty ? startNode.start : adjustStartNodeCss(startNode, selectionStart, rootNode);
        selectionEnd = selection.isEmpty ? startNode.end : adjustEndNodeCss(endNode, selectionEnd, rootNode);
        selection = new vscode.Selection(selectionStart, selectionEnd);
    }
    // Uncomment the comments that intersect with the selection.
    let rangesToUnComment = [];
    let edits = [];
    rootNode.comments.forEach(comment => {
        let commentRange = new vscode.Range(comment.start, comment.end);
        if (selection.intersection(commentRange)) {
            rangesToUnComment.push(commentRange);
            edits.push(new vscode.TextEdit(new vscode.Range(comment.start, comment.start.translate(0, startCommentStylesheet.length)), ''));
            edits.push(new vscode.TextEdit(new vscode.Range(comment.end.translate(0, -endCommentStylesheet.length), comment.end), ''));
        }
    });
    if (edits.length > 0) {
        return edits;
    }
    return [
        new vscode.TextEdit(new vscode.Range(selection.start, selection.start), startCommentStylesheet),
        new vscode.TextEdit(new vscode.Range(selection.end, selection.end), endCommentStylesheet)
    ];
}
function adjustStartNodeCss(node, pos, rootNode) {
    for (let i = 0; i < rootNode.comments.length; i++) {
        let commentRange = new vscode.Range(rootNode.comments[i].start, rootNode.comments[i].end);
        if (commentRange.contains(pos)) {
            return pos;
        }
    }
    if (!node) {
        return pos;
    }
    if (node.type === 'property') {
        return node.start;
    }
    const rule = node;
    if (pos.isBefore(rule.contentStartToken.end) || !rule.firstChild) {
        return rule.start;
    }
    if (pos.isBefore(rule.firstChild.start)) {
        return pos;
    }
    let newStartNode = rule.firstChild;
    while (newStartNode.nextSibling && pos.isAfter(newStartNode.end)) {
        newStartNode = newStartNode.nextSibling;
    }
    return newStartNode.start;
}
function adjustEndNodeCss(node, pos, rootNode) {
    for (let i = 0; i < rootNode.comments.length; i++) {
        let commentRange = new vscode.Range(rootNode.comments[i].start, rootNode.comments[i].end);
        if (commentRange.contains(pos)) {
            return pos;
        }
    }
    if (!node) {
        return pos;
    }
    if (node.type === 'property') {
        return node.end;
    }
    const rule = node;
    if (pos.isEqual(rule.contentEndToken.end) || !rule.firstChild) {
        return rule.end;
    }
    if (pos.isAfter(rule.children[rule.children.length - 1].end)) {
        return pos;
    }
    let newEndNode = rule.children[rule.children.length - 1];
    while (newEndNode.previousSibling && pos.isBefore(newEndNode.start)) {
        newEndNode = newEndNode.previousSibling;
    }
    return newEndNode.end;
}
//# sourceMappingURL=toggleComment.js.map