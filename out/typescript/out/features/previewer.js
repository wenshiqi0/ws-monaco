"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function plain(parts) {
    if (!parts) {
        return '';
    }
    return parts.map(part => part.text).join('');
}
exports.plain = plain;
function tagsMarkdownPreview(tags) {
    return (tags || [])
        .map(tag => {
        const label = `*@${tag.name}*`;
        if (!tag.text) {
            return label;
        }
        return label + (tag.text.match(/\r\n|\n/g) ? '  \n' + tag.text : ` — ${tag.text}`);
    })
        .join('  \n\n');
}
exports.tagsMarkdownPreview = tagsMarkdownPreview;
function markdownDocumentation(documentation, tags) {
    const out = new vscode_1.MarkdownString();
    out.appendMarkdown(plain(documentation));
    const tagsPreview = tagsMarkdownPreview(tags);
    if (tagsPreview) {
        out.appendMarkdown('\n\n' + tagsPreview);
    }
    return out;
}
exports.markdownDocumentation = markdownDocumentation;
