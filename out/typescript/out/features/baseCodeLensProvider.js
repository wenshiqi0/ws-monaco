"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const convert_1 = require("../utils/convert");
class ReferencesCodeLens extends vscode_1.CodeLens {
    constructor(document, file, range) {
        super(range);
        this.document = document;
        this.file = file;
    }
}
exports.ReferencesCodeLens = ReferencesCodeLens;
class TypeScriptBaseCodeLensProvider {
    constructor(client) {
        this.client = client;
        this.enabled = true;
        this.onDidChangeCodeLensesEmitter = new vscode_1.EventEmitter();
    }
    get onDidChangeCodeLenses() {
        return this.onDidChangeCodeLensesEmitter.event;
    }
    setEnabled(enabled) {
        if (this.enabled !== enabled) {
            this.enabled = enabled;
            this.onDidChangeCodeLensesEmitter.fire();
        }
    }
    provideCodeLenses(document, token) {
        if (!this.enabled) {
            return [];
        }
        const filepath = this.client.normalizePath(document.uri);
        if (!filepath) {
            return [];
        }
        return this.client.execute('navtree', { file: filepath }, token).then(response => {
            if (!response) {
                return [];
            }
            const tree = response.body;
            const referenceableSpans = [];
            if (tree && tree.childItems) {
                tree.childItems.forEach(item => this.walkNavTree(document, item, null, referenceableSpans));
            }
            return referenceableSpans.map(span => new ReferencesCodeLens(document.uri, filepath, span));
        }, () => {
            return [];
        });
    }
    walkNavTree(document, item, parent, results) {
        if (!item) {
            return;
        }
        const range = this.extractSymbol(document, item, parent);
        if (range) {
            results.push(range);
        }
        (item.childItems || []).forEach(child => this.walkNavTree(document, child, item, results));
    }
    /**
     * TODO: TS currently requires the position for 'references 'to be inside of the identifer
     * Massage the range to make sure this is the case
     */
    getSymbolRange(document, item) {
        if (!item) {
            return null;
        }
        const span = item.spans && item.spans[0];
        if (!span) {
            return null;
        }
        const range = convert_1.tsTextSpanToVsRange(span);
        const text = document.getText(range);
        const identifierMatch = new RegExp(`^(.*?(\\b|\\W))${(item.text || '').replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}(\\b|\\W)`, 'gm');
        const match = identifierMatch.exec(text);
        const prefixLength = match ? match.index + match[1].length : 0;
        const startOffset = document.offsetAt(new vscode_1.Position(range.start.line, range.start.character)) + prefixLength;
        return new vscode_1.Range(document.positionAt(startOffset), document.positionAt(startOffset + item.text.length));
    }
}
exports.TypeScriptBaseCodeLensProvider = TypeScriptBaseCodeLensProvider;
