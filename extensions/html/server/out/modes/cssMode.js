/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var languageModelCache_1 = require("../languageModelCache");
var vscode_css_languageservice_1 = require("vscode-css-languageservice");
var embeddedSupport_1 = require("./embeddedSupport");
function getCSSMode(documentRegions) {
    var cssLanguageService = vscode_css_languageservice_1.getCSSLanguageService();
    var embeddedCSSDocuments = languageModelCache_1.getLanguageModelCache(10, 60, function (document) { return documentRegions.get(document).getEmbeddedDocument('css'); });
    var cssStylesheets = languageModelCache_1.getLanguageModelCache(10, 60, function (document) { return cssLanguageService.parseStylesheet(document); });
    return {
        getId: function () {
            return 'css';
        },
        configure: function (options) {
            cssLanguageService.configure(options && options.css);
        },
        doValidation: function (document, settings) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.doValidation(embedded, cssStylesheets.get(embedded), settings && settings.css);
        },
        doComplete: function (document, position) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.doComplete(embedded, position, cssStylesheets.get(embedded));
        },
        doHover: function (document, position) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.doHover(embedded, position, cssStylesheets.get(embedded));
        },
        findDocumentHighlight: function (document, position) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.findDocumentHighlights(embedded, position, cssStylesheets.get(embedded));
        },
        findDocumentSymbols: function (document) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.findDocumentSymbols(embedded, cssStylesheets.get(embedded)).filter(function (s) { return s.name !== embeddedSupport_1.CSS_STYLE_RULE; });
        },
        findDefinition: function (document, position) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.findDefinition(embedded, position, cssStylesheets.get(embedded));
        },
        findReferences: function (document, position) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.findReferences(embedded, position, cssStylesheets.get(embedded));
        },
        findDocumentColors: function (document) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.findDocumentColors(embedded, cssStylesheets.get(embedded));
        },
        getColorPresentations: function (document, colorInfo) {
            var embedded = embeddedCSSDocuments.get(document);
            return cssLanguageService.getColorPresentations(embedded, cssStylesheets.get(embedded), colorInfo);
        },
        onDocumentRemoved: function (document) {
            embeddedCSSDocuments.onDocumentRemoved(document);
            cssStylesheets.onDocumentRemoved(document);
        },
        dispose: function () {
            embeddedCSSDocuments.dispose();
            cssStylesheets.dispose();
        }
    };
}
exports.getCSSMode = getCSSMode;
;
//# sourceMappingURL=cssMode.js.map