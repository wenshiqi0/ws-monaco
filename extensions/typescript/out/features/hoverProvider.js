"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const previewer_1 = require("./previewer");
class TypeScriptHoverProvider {
    constructor(client) {
        this.client = client;
    }
    provideHover(document, position, token) {
        const filepath = this.client.normalizePath(document.uri);
        if (!filepath) {
            return Promise.resolve(null);
        }
        const args = {
            file: filepath,
            line: position.line + 1,
            offset: position.character + 1
        };
        return this.client.execute('quickinfo', args, token).then((response) => {
            if (response && response.body) {
                const data = response.body;
                return new vscode_1.Hover(TypeScriptHoverProvider.getContents(data), new vscode_1.Range(data.start.line - 1, data.start.offset - 1, data.end.line - 1, data.end.offset - 1));
            }
            return undefined;
        }, () => {
            return null;
        });
    }
    static getContents(data) {
        const tags = previewer_1.tagsMarkdownPreview(data.tags);
        return [
            { language: 'typescript', value: data.displayString },
            data.documentation + (tags ? '\n\n' + tags : '')
        ];
    }
}
exports.default = TypeScriptHoverProvider;
//# sourceMappingURL=hoverProvider.js.map