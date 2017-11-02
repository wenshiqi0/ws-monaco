"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const vscode_1 = require("vscode");
const testUtils_1 = require("./testUtils");
const reflectCssValue_1 = require("../reflectCssValue");
suite('Tests for Emmet: Reflect CSS Value command', () => {
    teardown(testUtils_1.closeAllEditors);
    const cssContents = `
	.header {
		margin: 10px;
		padding: 10px;
		transform: rotate(50deg);
		-moz-transform: rotate(20deg);
		-o-transform: rotate(50deg);
		-webkit-transform: rotate(50deg);
		-ms-transform: rotate(50deg);
	}
	`;
    const htmlContents = `
	<html>
		<style>
			.header {
				margin: 10px;
				padding: 10px;
				transform: rotate(50deg);
				-moz-transform: rotate(20deg);
				-o-transform: rotate(50deg);
				-webkit-transform: rotate(50deg);
				-ms-transform: rotate(50deg);
			}
		</style>
	</html>
	`;
    test('Reflect Css Value in css file', function () {
        return testUtils_1.withRandomFileEditor(cssContents, '.css', (editor, doc) => {
            editor.selections = [new vscode_1.Selection(5, 10, 5, 10)];
            return reflectCssValue_1.reflectCssValue().then(() => {
                assert.equal(doc.getText(), cssContents.replace(/\(50deg\)/g, '(20deg)'));
                return Promise.resolve();
            });
        });
    });
    test('Reflect Css Value in html file', function () {
        return testUtils_1.withRandomFileEditor(htmlContents, '.html', (editor, doc) => {
            editor.selections = [new vscode_1.Selection(7, 20, 7, 20)];
            return reflectCssValue_1.reflectCssValue().then(() => {
                assert.equal(doc.getText(), htmlContents.replace(/\(50deg\)/g, '(20deg)'));
                return Promise.resolve();
            });
        });
    });
});
//# sourceMappingURL=reflectCssValue.test.js.map