/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
function applyEdits(document, edits) {
    var text = document.getText();
    var sortedEdits = edits.sort(function (a, b) {
        var startDiff = comparePositions(a.range.start, b.range.start);
        if (startDiff === 0) {
            return comparePositions(a.range.end, b.range.end);
        }
        return startDiff;
    });
    var lastOffset = text.length;
    sortedEdits.forEach(function (e) {
        var startOffset = document.offsetAt(e.range.start);
        var endOffset = document.offsetAt(e.range.end);
        text = text.substring(0, startOffset) + e.newText + text.substring(endOffset, text.length);
        lastOffset = startOffset;
    });
    return text;
}
exports.applyEdits = applyEdits;
function comparePositions(p1, p2) {
    var diff = p2.line - p1.line;
    if (diff === 0) {
        return p2.character - p1.character;
    }
    return diff;
}
//# sourceMappingURL=edits.js.map