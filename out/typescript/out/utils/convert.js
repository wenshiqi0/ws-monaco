"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
exports.tsTextSpanToVsRange = (span) => new vscode.Range(span.start.line - 1, span.start.offset - 1, span.end.line - 1, span.end.offset - 1);
exports.tsLocationToVsPosition = (tslocation) => new vscode.Position(tslocation.line - 1, tslocation.offset - 1);
exports.vsPositionToTsFileLocation = (file, position) => ({
    file,
    line: position.line + 1,
    offset: position.character + 1
});
exports.vsRangeToTsFileRange = (file, range) => ({
    file,
    startLine: range.start.line + 1,
    startOffset: range.start.character + 1,
    endLine: range.end.line + 1,
    endOffset: range.end.character + 1
});
