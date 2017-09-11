/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var assert = require("assert");
var languageModes_1 = require("../modes/languageModes");
var vscode_languageserver_types_1 = require("vscode-languageserver-types");
var formatting_1 = require("../modes/formatting");
suite('HTML Embedded Formatting', function () {
    function assertFormat(value, expected, options, formatOptions, message) {
        var languageModes = languageModes_1.getLanguageModes({ css: true, javascript: true });
        if (options) {
            languageModes.getAllModes().forEach(function (m) { return m.configure(options); });
        }
        var rangeStartOffset = value.indexOf('|');
        var rangeEndOffset;
        if (rangeStartOffset !== -1) {
            value = value.substr(0, rangeStartOffset) + value.substr(rangeStartOffset + 1);
            rangeEndOffset = value.indexOf('|');
            value = value.substr(0, rangeEndOffset) + value.substr(rangeEndOffset + 1);
        }
        else {
            rangeStartOffset = 0;
            rangeEndOffset = value.length;
        }
        var document = vscode_languageserver_types_1.TextDocument.create('test://test/test.html', 'html', 0, value);
        var range = vscode_languageserver_types_1.Range.create(document.positionAt(rangeStartOffset), document.positionAt(rangeEndOffset));
        if (!formatOptions) {
            formatOptions = vscode_languageserver_types_1.FormattingOptions.create(2, true);
        }
        var result = formatting_1.format(languageModes, document, range, formatOptions, void 0, { css: true, javascript: true });
        var actual = applyEdits(document, result);
        assert.equal(actual, expected, message);
    }
    function assertFormatWithFixture(fixtureName, expectedPath, options, formatOptions) {
        var input = fs.readFileSync(path.join(__dirname, 'fixtures', 'inputs', fixtureName)).toString();
        var expected = fs.readFileSync(path.join(__dirname, 'fixtures', 'expected', expectedPath)).toString();
        assertFormat(input, expected, options, formatOptions, expectedPath);
    }
    test('HTML only', function () {
        assertFormat('<html><body><p>Hello</p></body></html>', '<html>\n\n<body>\n  <p>Hello</p>\n</body>\n\n</html>');
        assertFormat('|<html><body><p>Hello</p></body></html>|', '<html>\n\n<body>\n  <p>Hello</p>\n</body>\n\n</html>');
        assertFormat('<html>|<body><p>Hello</p></body>|</html>', '<html><body>\n  <p>Hello</p>\n</body></html>');
    });
    test('HTML & Scripts', function () {
        assertFormat('<html><head><script></script></head></html>', '<html>\n\n<head>\n  <script></script>\n</head>\n\n</html>');
        assertFormat('<html><head><script>var x=1;</script></head></html>', '<html>\n\n<head>\n  <script>\n    var x = 1;\n  </script>\n</head>\n\n</html>');
        assertFormat('<html><head><script>\nvar x=2;\n</script></head></html>', '<html>\n\n<head>\n  <script>\n    var x = 2;\n\n  </script>\n</head>\n\n</html>');
        assertFormat('<html><head>\n  <script>\nvar x=3;\n</script></head></html>', '<html>\n\n<head>\n  <script>\n    var x = 3;\n\n  </script>\n</head>\n\n</html>');
        assertFormat('<html><head>\n  <script>\nvar x=4;\nconsole.log("Hi");\n</script></head></html>', '<html>\n\n<head>\n  <script>\n    var x = 4;\n    console.log("Hi");\n\n  </script>\n</head>\n\n</html>');
        assertFormat('<html><head>\n  |<script>\nvar x=5;\n</script>|</head></html>', '<html><head>\n  <script>\n    var x = 5;\n\n  </script></head></html>');
    });
    test('HTLM & Scripts - Fixtures', function () {
        assertFormatWithFixture('19813.html', '19813.html');
        assertFormatWithFixture('19813.html', '19813-4spaces.html', void 0, vscode_languageserver_types_1.FormattingOptions.create(4, true));
        assertFormatWithFixture('19813.html', '19813-tab.html', void 0, vscode_languageserver_types_1.FormattingOptions.create(1, false));
        assertFormatWithFixture('21634.html', '21634.html');
    });
    test('Script end tag', function () {
        assertFormat('<html>\n<head>\n  <script>\nvar x  =  0;\n</script></head></html>', '<html>\n\n<head>\n  <script>\n    var x = 0;\n\n  </script>\n</head>\n\n</html>');
    });
    test('HTML & Multiple Scripts', function () {
        assertFormat('<html><head>\n<script>\nif(x){\nbar(); }\n</script><script>\nfunction(x){    }\n</script></head></html>', '<html>\n\n<head>\n  <script>\n    if (x) {\n      bar();\n    }\n\n  </script>\n  <script>\n    function(x) {}\n\n  </script>\n</head>\n\n</html>');
    });
    test('HTML & Styles', function () {
        assertFormat('<html><head>\n<style>\n.foo{display:none;}\n</style></head></html>', '<html>\n\n<head>\n  <style>\n    .foo {\n      display: none;\n    }\n  </style>\n</head>\n\n</html>');
    });
    test('EndWithNewline', function () {
        var options = {
            html: {
                format: {
                    endWithNewline: true
                }
            }
        };
        assertFormat('<html><body><p>Hello</p></body></html>', '<html>\n\n<body>\n  <p>Hello</p>\n</body>\n\n</html>\n', options);
        assertFormat('<html>|<body><p>Hello</p></body>|</html>', '<html><body>\n  <p>Hello</p>\n</body></html>', options);
        assertFormat('<html><head><script>\nvar x=1;\n</script></head></html>', '<html>\n\n<head>\n  <script>\n    var x = 1;\n\n  </script>\n</head>\n\n</html>\n', options);
    });
    test('Inside script', function () {
        assertFormat('<html><head>\n  <script>\n|var x=6;|\n</script></head></html>', '<html><head>\n  <script>\n  var x = 6;\n</script></head></html>');
        assertFormat('<html><head>\n  <script>\n|var x=6;\nvar y=  9;|\n</script></head></html>', '<html><head>\n  <script>\n  var x = 6;\n  var y = 9;\n</script></head></html>');
    });
    test('Range after new line', function () {
        assertFormat('<html><head>\n  |<script>\nvar x=6;\n</script>\n|</head></html>', '<html><head>\n  <script>\n    var x = 6;\n\n  </script>\n</head></html>');
    });
});
function applyEdits(document, edits) {
    var text = document.getText();
    var sortedEdits = edits.sort(function (a, b) {
        var startDiff = document.offsetAt(b.range.start) - document.offsetAt(a.range.start);
        if (startDiff === 0) {
            return document.offsetAt(b.range.end) - document.offsetAt(a.range.end);
        }
        return startDiff;
    });
    var lastOffset = text.length;
    sortedEdits.forEach(function (e) {
        var startOffset = document.offsetAt(e.range.start);
        var endOffset = document.offsetAt(e.range.end);
        assert.ok(startOffset <= endOffset);
        assert.ok(endOffset <= lastOffset);
        text = text.substring(0, startOffset) + e.newText + text.substring(endOffset, text.length);
        lastOffset = startOffset;
    });
    return text;
}
//# sourceMappingURL=formatting.test.js.map