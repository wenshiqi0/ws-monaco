"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const cp = require("child_process");
const fs = require("fs");
const vscode_1 = require("vscode");
const async_1 = require("../utils/async");
const nls = require("vscode-nls");
let localize = nls.loadMessageBundle();
function mode2ScriptKind(mode) {
    switch (mode) {
        case 'typescript': return 'TS';
        case 'typescriptreact': return 'TSX';
        case 'javascript': return 'JS';
        case 'javascriptreact': return 'JSX';
    }
    return undefined;
}
class SyncedBuffer {
    constructor(document, filepath, diagnosticRequestor, client) {
        this.document = document;
        this.filepath = filepath;
        this.diagnosticRequestor = diagnosticRequestor;
        this.client = client;
    }
    open() {
        const args = {
            file: this.filepath,
            fileContent: this.document.getText(),
        };
        if (this.client.apiVersion.has203Features()) {
            const scriptKind = mode2ScriptKind(this.document.languageId);
            if (scriptKind) {
                args.scriptKindName = scriptKind;
            }
        }
        if (vscode_1.workspace.rootPath && this.client.apiVersion.has230Features()) {
            args.projectRootPath = vscode_1.workspace.rootPath;
        }
        this.client.execute('open', args, false);
    }
    get lineCount() {
        return this.document.lineCount;
    }
    close() {
        const args = {
            file: this.filepath
        };
        this.client.execute('close', args, false);
    }
    onContentChanged(events) {
        const filePath = this.client.normalizePath(this.document.uri);
        if (!filePath) {
            return;
        }
        for (const event of events) {
            const range = event.range;
            const text = event.text;
            const args = {
                file: filePath,
                line: range.start.line + 1,
                offset: range.start.character + 1,
                endLine: range.end.line + 1,
                endOffset: range.end.character + 1,
                insertString: text
            };
            this.client.execute('change', args, false);
        }
        this.diagnosticRequestor.requestDiagnostic(filePath);
    }
}
const checkTscVersionSettingKey = 'check.tscVersion';
class BufferSyncSupport {
    constructor(client, modeIds, diagnostics, validate = true) {
        this.disposables = [];
        this.pendingDiagnostics = new Map();
        this.client = client;
        this.modeIds = new Set(modeIds);
        this.diagnostics = diagnostics;
        this._validate = validate;
        this.diagnosticDelayer = new async_1.Delayer(300);
        this.syncedBuffers = new Map();
        const tsConfig = vscode_1.workspace.getConfiguration('typescript');
        this.checkGlobalTSCVersion = client.checkGlobalTSCVersion && this.modeIds.has('typescript') && tsConfig.get(checkTscVersionSettingKey, true);
    }
    listen() {
        vscode_1.workspace.onDidOpenTextDocument(this.onDidOpenTextDocument, this, this.disposables);
        vscode_1.workspace.onDidCloseTextDocument(this.onDidCloseTextDocument, this, this.disposables);
        vscode_1.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument, this, this.disposables);
        vscode_1.workspace.textDocuments.forEach(this.onDidOpenTextDocument, this);
    }
    get validate() {
        return this._validate;
    }
    set validate(value) {
        this._validate = value;
    }
    handles(file) {
        return this.syncedBuffers.has(file);
    }
    reOpenDocuments() {
        for (const buffer of this.syncedBuffers.values()) {
            buffer.open();
        }
    }
    dispose() {
        while (this.disposables.length) {
            const obj = this.disposables.pop();
            if (obj) {
                obj.dispose();
            }
        }
    }
    onDidOpenTextDocument(document) {
        if (!this.modeIds.has(document.languageId)) {
            return;
        }
        const resource = document.uri;
        const filepath = this.client.normalizePath(resource);
        if (!filepath) {
            return;
        }
        const syncedBuffer = new SyncedBuffer(document, filepath, this, this.client);
        this.syncedBuffers.set(filepath, syncedBuffer);
        syncedBuffer.open();
        this.requestDiagnostic(filepath);
        if (document.languageId === 'typescript' || document.languageId === 'typescriptreact') {
            this.checkTSCVersion();
        }
    }
    onDidCloseTextDocument(document) {
        let filepath = this.client.normalizePath(document.uri);
        if (!filepath) {
            return;
        }
        const syncedBuffer = this.syncedBuffers.get(filepath);
        if (!syncedBuffer) {
            return;
        }
        this.diagnostics.delete(filepath);
        this.syncedBuffers.delete(filepath);
        syncedBuffer.close();
        if (!fs.existsSync(filepath)) {
            this.requestAllDiagnostics();
        }
    }
    onDidChangeTextDocument(e) {
        let filepath = this.client.normalizePath(e.document.uri);
        if (!filepath) {
            return;
        }
        let syncedBuffer = this.syncedBuffers.get(filepath);
        if (!syncedBuffer) {
            return;
        }
        syncedBuffer.onContentChanged(e.contentChanges);
    }
    requestAllDiagnostics() {
        if (!this._validate) {
            return;
        }
        for (const filePath of this.syncedBuffers.keys()) {
            this.pendingDiagnostics.set(filePath, Date.now());
        }
        this.diagnosticDelayer.trigger(() => {
            this.sendPendingDiagnostics();
        }, 200);
    }
    requestDiagnostic(file) {
        if (!this._validate) {
            return;
        }
        this.pendingDiagnostics.set(file, Date.now());
        const buffer = this.syncedBuffers.get(file);
        let delay = 300;
        if (buffer) {
            let lineCount = buffer.lineCount;
            delay = Math.min(Math.max(Math.ceil(lineCount / 20), 300), 800);
        }
        this.diagnosticDelayer.trigger(() => {
            this.sendPendingDiagnostics();
        }, delay);
    }
    sendPendingDiagnostics() {
        if (!this._validate) {
            return;
        }
        let files = Array.from(this.pendingDiagnostics.entries()).map(([key, value]) => {
            return {
                file: key,
                time: value
            };
        }).sort((a, b) => {
            return a.time - b.time;
        }).map((value) => {
            return value.file;
        });
        // Add all open TS buffers to the geterr request. They might be visible
        for (const file of this.syncedBuffers.keys()) {
            if (!this.pendingDiagnostics.get(file)) {
                files.push(file);
            }
        }
        if (files.length) {
            const args = {
                delay: 0,
                files: files
            };
            this.client.execute('geterr', args, false);
        }
        this.pendingDiagnostics.clear();
    }
    checkTSCVersion() {
        if (!this.checkGlobalTSCVersion) {
            return;
        }
        this.checkGlobalTSCVersion = false;
        let tscVersion = undefined;
        try {
            let out = cp.execSync('tsc --version', { encoding: 'utf8' });
            if (out) {
                let matches = out.trim().match(/Version\s*(.*)$/);
                if (matches && matches.length === 2) {
                    tscVersion = matches[1];
                }
            }
        }
        catch (error) {
        }
        if (tscVersion && tscVersion !== this.client.apiVersion.versionString) {
            vscode_1.window.showInformationMessage(localize('versionMismatch', 'Using TypeScript ({1}) for editor features. TypeScript ({0}) is installed globally on your machine. Errors in VS Code  may differ from TSC errors', tscVersion, this.client.apiVersion.versionString), {
                title: localize('moreInformation', 'More Information'),
                id: 1
            }, {
                title: localize('doNotCheckAgain', 'Don\'t Check Again'),
                id: 2
            }, {
                title: localize('close', 'Close'),
                id: 3,
                isCloseAffordance: true
            }).then((selected) => {
                if (!selected || selected.id === 3) {
                    return;
                }
                switch (selected.id) {
                    case 1:
                        vscode_1.commands.executeCommand('vscode.open', vscode_1.Uri.parse('http://go.microsoft.com/fwlink/?LinkId=826239'));
                        break;
                    case 2:
                        const tsConfig = vscode_1.workspace.getConfiguration('typescript');
                        tsConfig.update(checkTscVersionSettingKey, false, true);
                        vscode_1.window.showInformationMessage(localize('updateTscCheck', 'Updated user setting \'typescript.check.tscVersion\' to false'));
                        break;
                }
            });
        }
    }
}
exports.default = BufferSyncSupport;
//# sourceMappingURL=bufferSyncSupport.js.map