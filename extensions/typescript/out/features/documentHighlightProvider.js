"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class TypeScriptDocumentHighlightProvider {
    constructor(client) {
        this.client = client;
    }
    provideDocumentHighlights(resource, position, token) {
        const filepath = this.client.normalizePath(resource.uri);
        if (!filepath) {
            return Promise.resolve([]);
        }
        const args = {
            file: filepath,
            line: position.line + 1,
            offset: position.character + 1
        };
        return this.client.execute('occurrences', args, token).then((response) => {
            let data = response.body;
            if (data && data.length) {
                // Workaround for https://github.com/Microsoft/TypeScript/issues/12780
                // Don't highlight string occurrences
                const firstOccurrence = data[0];
                if (this.client.apiVersion.has213Features() && firstOccurrence.start.offset > 1) {
                    // Check to see if contents around first occurrence are string delimiters
                    const contents = resource.getText(new vscode_1.Range(firstOccurrence.start.line - 1, firstOccurrence.start.offset - 1 - 1, firstOccurrence.end.line - 1, firstOccurrence.end.offset - 1 + 1));
                    const stringDelimiters = ['"', '\'', '`'];
                    if (contents && contents.length > 2 && stringDelimiters.indexOf(contents[0]) >= 0 && contents[0] === contents[contents.length - 1]) {
                        return [];
                    }
                }
                return data.map((item) => {
                    return new vscode_1.DocumentHighlight(new vscode_1.Range(item.start.line - 1, item.start.offset - 1, item.end.line - 1, item.end.offset - 1), item.isWriteAccess ? vscode_1.DocumentHighlightKind.Write : vscode_1.DocumentHighlightKind.Read);
                });
            }
            return [];
        }, () => {
            return [];
        });
    }
}
exports.default = TypeScriptDocumentHighlightProvider;
//# sourceMappingURL=documentHighlightProvider.js.map