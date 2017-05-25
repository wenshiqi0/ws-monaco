/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
function getWordAtText(text, offset, wordDefinition) {
    var lineStart = offset;
    while (lineStart > 0 && !isNewlineCharacter(text.charCodeAt(lineStart - 1))) {
        lineStart--;
    }
    var offsetInLine = offset - lineStart;
    var lineText = text.substr(lineStart);
    // make a copy of the regex as to not keep the state
    var flags = wordDefinition.ignoreCase ? 'gi' : 'g';
    wordDefinition = new RegExp(wordDefinition.source, flags);
    var match = wordDefinition.exec(lineText);
    while (match && match.index + match[0].length < offsetInLine) {
        match = wordDefinition.exec(lineText);
    }
    if (match && match.index <= offsetInLine) {
        return { start: match.index + lineStart, length: match[0].length };
    }
    return { start: offset, length: 0 };
}
exports.getWordAtText = getWordAtText;
function startsWith(haystack, needle) {
    if (haystack.length < needle.length) {
        return false;
    }
    for (var i = 0; i < needle.length; i++) {
        if (haystack[i] !== needle[i]) {
            return false;
        }
    }
    return true;
}
exports.startsWith = startsWith;
function repeat(value, count) {
    var s = '';
    while (count > 0) {
        if ((count & 1) === 1) {
            s += value;
        }
        value += value;
        count = count >>> 1;
    }
    return s;
}
exports.repeat = repeat;
function isWhitespaceOnly(str) {
    return /^\s*$/.test(str);
}
exports.isWhitespaceOnly = isWhitespaceOnly;
var CR = '\r'.charCodeAt(0);
var NL = '\n'.charCodeAt(0);
function isNewlineCharacter(charCode) {
    return charCode === CR || charCode === NL;
}
//# sourceMappingURL=strings.js.map