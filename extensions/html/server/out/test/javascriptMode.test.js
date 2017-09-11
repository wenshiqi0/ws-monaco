/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var javascriptMode_1 = require("../modes/javascriptMode");
var vscode_languageserver_types_1 = require("vscode-languageserver-types");
var languageModelCache_1 = require("../languageModelCache");
var vscode_html_languageservice_1 = require("vscode-html-languageservice");
var embeddedSupport = require("../modes/embeddedSupport");
suite('HTML Javascript Support', function () {
    var htmlLanguageService = vscode_html_languageservice_1.getLanguageService();
    function assertCompletions(value, expectedProposals) {
        var offset = value.indexOf('|');
        value = value.substr(0, offset) + value.substr(offset + 1);
        var document = vscode_languageserver_types_1.TextDocument.create('test://test/test.html', 'html', 0, value);
        var documentRegions = languageModelCache_1.getLanguageModelCache(10, 60, function (document) { return embeddedSupport.getDocumentRegions(htmlLanguageService, document); });
        var mode = javascriptMode_1.getJavascriptMode(documentRegions);
        var position = document.positionAt(offset);
        var list = mode.doComplete(document, position);
        assert.ok(list);
        var actualLabels = list.items.map(function (c) { return c.label; }).sort();
        for (var _i = 0, expectedProposals_1 = expectedProposals; _i < expectedProposals_1.length; _i++) {
            var expected = expectedProposals_1[_i];
            assert.ok(actualLabels.indexOf(expected) !== -1, 'Not found:' + expected + ' is ' + actualLabels.join(', '));
        }
    }
    test('Completions', function () {
        assertCompletions('<html><script>window.|</script></html>', ['location']);
        assertCompletions('<html><script>$.|</script></html>', ['getJSON']);
    });
});
//# sourceMappingURL=javascriptMode.test.js.map