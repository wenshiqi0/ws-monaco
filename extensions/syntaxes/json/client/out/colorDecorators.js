/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var vscode_1 = require("vscode");
var MAX_DECORATORS = 500;
var decorationType = {
    before: {
        contentText: ' ',
        border: 'solid 0.1em #000',
        margin: '0.1em 0.2em 0 0.2em',
        width: '0.8em',
        height: '0.8em'
    },
    dark: {
        before: {
            border: 'solid 0.1em #eee'
        }
    }
};
function activateColorDecorations(decoratorProvider, supportedLanguages, isDecoratorEnabled) {
    var disposables = [];
    var colorsDecorationType = vscode_1.window.createTextEditorDecorationType(decorationType);
    disposables.push(colorsDecorationType);
    var decoratorEnablement = {};
    for (var languageId in supportedLanguages) {
        decoratorEnablement[languageId] = isDecoratorEnabled(languageId);
    }
    var pendingUpdateRequests = {};
    vscode_1.window.onDidChangeVisibleTextEditors(function (editors) {
        for (var _i = 0, editors_1 = editors; _i < editors_1.length; _i++) {
            var editor = editors_1[_i];
            triggerUpdateDecorations(editor.document);
        }
    }, null, disposables);
    vscode_1.workspace.onDidChangeTextDocument(function (event) { return triggerUpdateDecorations(event.document); }, null, disposables);
    // track open and close for document languageId changes
    vscode_1.workspace.onDidCloseTextDocument(function (event) { return triggerUpdateDecorations(event, true); });
    vscode_1.workspace.onDidOpenTextDocument(function (event) { return triggerUpdateDecorations(event); });
    vscode_1.workspace.onDidChangeConfiguration(function (_) {
        var hasChanges = false;
        for (var languageId in supportedLanguages) {
            var prev = decoratorEnablement[languageId];
            var curr = isDecoratorEnabled(languageId);
            if (prev !== curr) {
                decoratorEnablement[languageId] = curr;
                hasChanges = true;
            }
        }
        if (hasChanges) {
            updateAllVisibleEditors(true);
        }
    }, null, disposables);
    updateAllVisibleEditors(false);
    function updateAllVisibleEditors(settingsChanges) {
        vscode_1.window.visibleTextEditors.forEach(function (editor) {
            if (editor.document) {
                triggerUpdateDecorations(editor.document, settingsChanges);
            }
        });
    }
    function triggerUpdateDecorations(document, settingsChanges) {
        if (settingsChanges === void 0) { settingsChanges = false; }
        var triggerUpdate = supportedLanguages[document.languageId] && (decoratorEnablement[document.languageId] || settingsChanges);
        if (triggerUpdate) {
            var documentUriStr_1 = document.uri.toString();
            var timeout = pendingUpdateRequests[documentUriStr_1];
            if (typeof timeout !== 'undefined') {
                clearTimeout(timeout);
            }
            pendingUpdateRequests[documentUriStr_1] = setTimeout(function () {
                // check if the document is in use by an active editor
                for (var _i = 0, _a = vscode_1.window.visibleTextEditors; _i < _a.length; _i++) {
                    var editor = _a[_i];
                    if (editor.document && documentUriStr_1 === editor.document.uri.toString()) {
                        if (decoratorEnablement[editor.document.languageId]) {
                            updateDecorationForEditor(documentUriStr_1, editor.document.version);
                            break;
                        }
                        else {
                            editor.setDecorations(colorsDecorationType, []);
                        }
                    }
                }
                delete pendingUpdateRequests[documentUriStr_1];
            }, 500);
        }
    }
    function updateDecorationForEditor(contentUri, documentVersion) {
        decoratorProvider(contentUri).then(function (ranges) {
            for (var _i = 0, _a = vscode_1.window.visibleTextEditors; _i < _a.length; _i++) {
                var editor = _a[_i];
                var document = editor.document;
                if (document && document.version === documentVersion && contentUri === document.uri.toString()) {
                    var decorations = [];
                    for (var i = 0; i < ranges.length && decorations.length < MAX_DECORATORS; i++) {
                        var range = ranges[i];
                        var text = document.getText(range);
                        var value = JSON.parse(text);
                        var color = hex2rgba(value);
                        if (color) {
                            decorations.push({
                                range: range,
                                renderOptions: {
                                    before: {
                                        backgroundColor: color
                                    }
                                }
                            });
                        }
                    }
                    editor.setDecorations(colorsDecorationType, decorations);
                }
            }
        });
    }
    return vscode_1.Disposable.from.apply(vscode_1.Disposable, disposables);
}
exports.activateColorDecorations = activateColorDecorations;
var CharCode_Hash = 35;
function hex2rgba(hex) {
    if (!hex) {
        return null;
    }
    if (hex.length === 7 && hex.charCodeAt(0) === CharCode_Hash) {
        // #RRGGBB format
        return hex;
    }
    if (hex.length === 9 && hex.charCodeAt(0) === CharCode_Hash) {
        // #RRGGBBAA format
        var val = parseInt(hex.substr(1), 16);
        var r = (val >> 24) & 255;
        var g = (val >> 16) & 255;
        var b = (val >> 8) & 255;
        var a = val & 255;
        return "rgba(" + r + ", " + g + ", " + b + ", " + +(a / 255).toFixed(2) + ")";
    }
    return null;
}
//# sourceMappingURL=colorDecorators.js.map