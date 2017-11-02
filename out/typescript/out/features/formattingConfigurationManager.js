"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
var FormattingConfiguration;
(function (FormattingConfiguration) {
    function equals(a, b) {
        let keys = Object.keys(a);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (a[key] !== b[key]) {
                return false;
            }
        }
        return true;
    }
    FormattingConfiguration.equals = equals;
    FormattingConfiguration.def = {
        insertSpaceAfterCommaDelimiter: true,
        insertSpaceAfterConstructor: false,
        insertSpaceAfterSemicolonInForStatements: true,
        insertSpaceBeforeAndAfterBinaryOperators: true,
        insertSpaceAfterKeywordsInControlFlowStatements: true,
        insertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
        insertSpaceBeforeFunctionParenthesis: false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
        insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
        insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: false,
        insertSpaceAfterTypeAssertion: false,
        placeOpenBraceOnNewLineForFunctions: false,
        placeOpenBraceOnNewLineForControlBlocks: false
    };
})(FormattingConfiguration || (FormattingConfiguration = {}));
class FormattingConfigurationManager {
    constructor(client) {
        this.client = client;
        this.config = FormattingConfiguration.def;
        this.formatOptions = Object.create(null);
        vscode_1.workspace.onDidCloseTextDocument((textDocument) => {
            let key = textDocument.uri.toString();
            // When a document gets closed delete the cached formatting options.
            // This is necessary sine the tsserver now closed a project when its
            // last file in it closes which drops the stored formatting options
            // as well.
            delete this.formatOptions[key];
        });
    }
    ensureFormatOptionsForDocument(document, token) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const editor of vscode_1.window.visibleTextEditors) {
                if (editor.document.fileName === document.fileName) {
                    const formattingOptions = { tabSize: editor.options.tabSize, insertSpaces: editor.options.insertSpaces };
                    return this.ensureFormatOptions(document, formattingOptions, token);
                }
            }
        });
    }
    ensureFormatOptions(document, options, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = document.uri.toString();
            const currentOptions = this.formatOptions[key];
            if (currentOptions && currentOptions.tabSize === options.tabSize && currentOptions.indentSize === options.tabSize && currentOptions.convertTabsToSpaces === options.insertSpaces) {
                return;
            }
            const absPath = this.client.normalizePath(document.uri);
            if (!absPath) {
                return Object.create(null);
            }
            const formatOptions = this.getFormatOptions(options);
            const args = {
                file: absPath,
                formatOptions: formatOptions
            };
            yield this.client.execute('configure', args, token);
            this.formatOptions[key] = formatOptions;
        });
    }
    updateConfiguration(config) {
        const newConfig = config.get('format', FormattingConfiguration.def);
        if (!FormattingConfiguration.equals(this.config, newConfig)) {
            this.formatOptions = Object.create(null);
        }
        this.config = newConfig;
    }
    getFormatOptions(options) {
        return {
            tabSize: options.tabSize,
            indentSize: options.tabSize,
            convertTabsToSpaces: options.insertSpaces,
            // We can use \n here since the editor normalizes later on to its line endings.
            newLineCharacter: '\n',
            insertSpaceAfterCommaDelimiter: this.config.insertSpaceAfterCommaDelimiter,
            insertSpaceAfterConstructor: this.config.insertSpaceAfterConstructor,
            insertSpaceAfterSemicolonInForStatements: this.config.insertSpaceAfterSemicolonInForStatements,
            insertSpaceBeforeAndAfterBinaryOperators: this.config.insertSpaceBeforeAndAfterBinaryOperators,
            insertSpaceAfterKeywordsInControlFlowStatements: this.config.insertSpaceAfterKeywordsInControlFlowStatements,
            insertSpaceAfterFunctionKeywordForAnonymousFunctions: this.config.insertSpaceAfterFunctionKeywordForAnonymousFunctions,
            insertSpaceBeforeFunctionParenthesis: this.config.insertSpaceBeforeFunctionParenthesis,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: this.config.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: this.config.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: this.config.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces,
            insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: this.config.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces,
            insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: this.config.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces,
            insertSpaceAfterTypeAssertion: this.config.insertSpaceAfterTypeAssertion,
            placeOpenBraceOnNewLineForFunctions: this.config.placeOpenBraceOnNewLineForFunctions,
            placeOpenBraceOnNewLineForControlBlocks: this.config.placeOpenBraceOnNewLineForControlBlocks,
        };
    }
}
exports.default = FormattingConfigurationManager;
