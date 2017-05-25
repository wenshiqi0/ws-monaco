/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var edits_1 = require("../utils/edits");
var vscode_languageserver_types_1 = require("vscode-languageserver-types");
function format(languageModes, document, formatRange, formattingOptions, enabledModes) {
    // run the html formatter on the full range and pass the result content to the embedded formatters.
    // from the final content create a single edit
    // advantages of this approach are
    //  - correct indents in the html document
    //  - correct initial indent for embedded formatters
    //  - no worrying of overlapping edits
    // perform a html format and apply changes to a new document
    var htmlMode = languageModes.getMode('html');
    var htmlEdits = htmlMode.format(document, formatRange, formattingOptions);
    var htmlFormattedContent = edits_1.applyEdits(document, htmlEdits);
    var newDocument = vscode_languageserver_types_1.TextDocument.create(document.uri + '.tmp', document.languageId, document.version, htmlFormattedContent);
    try {
        // run embedded formatters on html formatted content: - formatters see correct initial indent
        var afterFormatRangeLength = document.getText().length - document.offsetAt(formatRange.end); // length of unchanged content after replace range
        var newFormatRange = vscode_languageserver_types_1.Range.create(formatRange.start, newDocument.positionAt(htmlFormattedContent.length - afterFormatRangeLength));
        var embeddedRanges = languageModes.getModesInRange(newDocument, newFormatRange);
        var embeddedEdits = [];
        for (var _i = 0, embeddedRanges_1 = embeddedRanges; _i < embeddedRanges_1.length; _i++) {
            var r = embeddedRanges_1[_i];
            var mode = r.mode;
            if (mode && mode.format && enabledModes[mode.getId()] && !r.attributeValue) {
                var edits = mode.format(newDocument, r, formattingOptions);
                for (var _a = 0, edits_2 = edits; _a < edits_2.length; _a++) {
                    var edit = edits_2[_a];
                    embeddedEdits.push(edit);
                }
            }
        }
        ;
        if (embeddedEdits.length === 0) {
            return htmlEdits;
        }
        // apply all embedded format edits and create a single edit for all changes
        var resultContent = edits_1.applyEdits(newDocument, embeddedEdits);
        var resultReplaceText = resultContent.substring(document.offsetAt(formatRange.start), resultContent.length - afterFormatRangeLength);
        return [vscode_languageserver_types_1.TextEdit.replace(formatRange, resultReplaceText)];
    }
    finally {
        languageModes.onDocumentRemoved(newDocument);
    }
}
exports.format = format;
//# sourceMappingURL=formatting.js.map