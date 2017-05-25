/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var languageModelCache_1 = require("../languageModelCache");
function getHTMLMode(htmlLanguageService) {
    var settings = {};
    var htmlDocuments = languageModelCache_1.getLanguageModelCache(10, 60, function (document) { return htmlLanguageService.parseHTMLDocument(document); });
    return {
        getId: function () {
            return 'html';
        },
        configure: function (options) {
            settings = options && options.html;
        },
        doComplete: function (document, position) {
            var options = settings && settings.suggest;
            return htmlLanguageService.doComplete(document, position, htmlDocuments.get(document), options);
        },
        doHover: function (document, position) {
            return htmlLanguageService.doHover(document, position, htmlDocuments.get(document));
        },
        findDocumentHighlight: function (document, position) {
            return htmlLanguageService.findDocumentHighlights(document, position, htmlDocuments.get(document));
        },
        findDocumentLinks: function (document, documentContext) {
            return htmlLanguageService.findDocumentLinks(document, documentContext);
        },
        findDocumentSymbols: function (document) {
            return htmlLanguageService.findDocumentSymbols(document, htmlDocuments.get(document));
        },
        format: function (document, range, formatParams) {
            var formatSettings = settings && settings.format;
            if (!formatSettings) {
                formatSettings = formatParams;
            }
            else {
                formatSettings = merge(formatParams, merge(formatSettings, {}));
            }
            return htmlLanguageService.format(document, range, formatSettings);
        },
        onDocumentRemoved: function (document) {
            htmlDocuments.onDocumentRemoved(document);
        },
        dispose: function () {
            htmlDocuments.dispose();
        }
    };
}
exports.getHTMLMode = getHTMLMode;
;
function merge(src, dst) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) {
            dst[key] = src[key];
        }
    }
    return dst;
}
//# sourceMappingURL=htmlMode.js.map