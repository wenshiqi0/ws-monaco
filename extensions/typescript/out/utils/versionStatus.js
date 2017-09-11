"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class VersionStatus extends vscode.Disposable {
    constructor() {
        super(() => this.dispose());
        this.versionBarEntry = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, Number.MIN_VALUE);
        this.onChangeEditorSub = vscode.window.onDidChangeActiveTextEditor(this.showHideStatus, this);
    }
    dispose() {
        this.versionBarEntry.dispose();
        this.onChangeEditorSub.dispose();
    }
    showHideStatus() {
        if (!this.versionBarEntry) {
            return;
        }
        if (!vscode.window.activeTextEditor) {
            this.versionBarEntry.hide();
            return;
        }
        let doc = vscode.window.activeTextEditor.document;
        if (vscode.languages.match('typescript', doc) || vscode.languages.match('typescriptreact', doc)) {
            this.versionBarEntry.show();
            return;
        }
        if (!vscode.window.activeTextEditor.viewColumn) {
            // viewColumn is undefined for the debug/output panel, but we still want
            // to show the version info
            return;
        }
        this.versionBarEntry.hide();
    }
    setInfo(message, tooltip) {
        this.versionBarEntry.text = message;
        this.versionBarEntry.tooltip = tooltip;
        this.versionBarEntry.command = 'typescript.selectTypeScriptVersion';
    }
}
exports.default = VersionStatus;
//# sourceMappingURL=versionStatus.js.map