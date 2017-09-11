/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var vscode_1 = require("vscode");
function activateTagClosing(tagProvider, supportedLanguages, configName) {
    var disposables = [];
    vscode_1.workspace.onDidChangeTextDocument(function (event) { return onDidChangeTextDocument(event.document, event.contentChanges); }, null, disposables);
    var isEnabled = false;
    updateEnabledState();
    vscode_1.window.onDidChangeActiveTextEditor(updateEnabledState, null, disposables);
    var timeout = void 0;
    function updateEnabledState() {
        isEnabled = false;
        var editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            return;
        }
        var document = editor.document;
        if (!supportedLanguages[document.languageId]) {
            return;
        }
        if (!vscode_1.workspace.getConfiguration(void 0, document.uri).get(configName)) {
            return;
        }
        isEnabled = true;
    }
    function onDidChangeTextDocument(document, changes) {
        if (!isEnabled) {
            return;
        }
        var activeDocument = vscode_1.window.activeTextEditor && vscode_1.window.activeTextEditor.document;
        if (document !== activeDocument || changes.length === 0) {
            return;
        }
        if (typeof timeout !== 'undefined') {
            clearTimeout(timeout);
        }
        var lastChange = changes[changes.length - 1];
        var lastCharacter = lastChange.text[lastChange.text.length - 1];
        if (lastChange.rangeLength > 0 || lastCharacter !== '>' && lastCharacter !== '/') {
            return;
        }
        var rangeStart = lastChange.range.start;
        var version = document.version;
        timeout = setTimeout(function () {
            var position = new vscode_1.Position(rangeStart.line, rangeStart.character + lastChange.text.length);
            tagProvider(document, position).then(function (text) {
                if (text && isEnabled) {
                    var activeEditor = vscode_1.window.activeTextEditor;
                    var activeDocument_1 = activeEditor && activeEditor.document;
                    if (document === activeDocument_1 && activeDocument_1.version === version) {
                        var selections = activeEditor.selections;
                        if (selections.length && selections.some(function (s) { return s.active.isEqual(position); })) {
                            activeEditor.insertSnippet(new vscode_1.SnippetString(text), selections.map(function (s) { return s.active; }));
                        }
                        else {
                            activeEditor.insertSnippet(new vscode_1.SnippetString(text), position);
                        }
                    }
                }
            });
            timeout = void 0;
        }, 100);
    }
    return vscode_1.Disposable.from.apply(vscode_1.Disposable, disposables);
}
exports.activateTagClosing = activateTagClosing;
//# sourceMappingURL=tagClosing.js.map