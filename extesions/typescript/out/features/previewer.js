"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
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
function tagsPlainPreview(tags) {
    return (tags || [])
        .map(tag => {
        const label = `@${tag.name}`;
        if (!tag.text) {
            return label;
        }
        return label + (tag.text.match(/\r\n|\n/g) ? '\n' + tag.text : ` — ${tag.text}`);
    })
        .join('\n\ngit');
}
function plainDocumentation(documentation, tags) {
    const parts = [plain(documentation), tagsPlainPreview(tags)];
    return parts.filter(x => x).join('\n\n');
}
exports.plainDocumentation = plainDocumentation;
//# sourceMappingURL=previewer.js.map