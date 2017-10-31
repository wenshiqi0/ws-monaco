"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const PConst = require("../protocol.const");
const Previewer = require("./previewer");
const convert_1 = require("../utils/convert");
const nls = require("vscode-nls");
let localize = nls.loadMessageBundle();
class MyCompletionItem extends vscode_1.CompletionItem {
    constructor(position, document, entry, enableDotCompletions, enableCallCompletions) {
        super(entry.name);
        this.position = position;
        this.document = document;
        this.sortText = entry.sortText;
        this.kind = MyCompletionItem.convertKind(entry.kind);
        this.position = position;
        this.commitCharacters = MyCompletionItem.getCommitCharacters(enableDotCompletions, enableCallCompletions, entry.kind);
        if (entry.replacementSpan) {
            let span = entry.replacementSpan;
            // The indexing for the range returned by the server uses 1-based indexing.
            // We convert to 0-based indexing.
            this.textEdit = vscode_1.TextEdit.replace(convert_1.tsTextSpanToVsRange(span), entry.name);
        }
        else {
            // Try getting longer, prefix based range for completions that span words
            const wordRange = document.getWordRangeAtPosition(position);
            const text = document.getText(new vscode_1.Range(position.line, Math.max(0, position.character - entry.name.length), position.line, position.character)).toLowerCase();
            const entryName = entry.name.toLowerCase();
            for (let i = entryName.length; i >= 0; --i) {
                if (text.endsWith(entryName.substr(0, i)) && (!wordRange || wordRange.start.character > position.character - i)) {
                    this.range = new vscode_1.Range(position.line, Math.max(0, position.character - i), position.line, position.character);
                    break;
                }
            }
        }
    }
    static convertKind(kind) {
        switch (kind) {
            case PConst.Kind.primitiveType:
            case PConst.Kind.keyword:
                return vscode_1.CompletionItemKind.Keyword;
            case PConst.Kind.const:
                return vscode_1.CompletionItemKind.Constant;
            case PConst.Kind.let:
            case PConst.Kind.variable:
            case PConst.Kind.localVariable:
            case PConst.Kind.alias:
                return vscode_1.CompletionItemKind.Variable;
            case PConst.Kind.memberVariable:
            case PConst.Kind.memberGetAccessor:
            case PConst.Kind.memberSetAccessor:
                return vscode_1.CompletionItemKind.Field;
            case PConst.Kind.function:
                return vscode_1.CompletionItemKind.Function;
            case PConst.Kind.memberFunction:
            case PConst.Kind.constructSignature:
            case PConst.Kind.callSignature:
            case PConst.Kind.indexSignature:
                return vscode_1.CompletionItemKind.Method;
            case PConst.Kind.enum:
                return vscode_1.CompletionItemKind.Enum;
            case PConst.Kind.module:
            case PConst.Kind.externalModuleName:
                return vscode_1.CompletionItemKind.Module;
            case PConst.Kind.class:
            case PConst.Kind.type:
                return vscode_1.CompletionItemKind.Class;
            case PConst.Kind.interface:
                return vscode_1.CompletionItemKind.Interface;
            case PConst.Kind.warning:
            case PConst.Kind.file:
            case PConst.Kind.script:
                return vscode_1.CompletionItemKind.File;
            case PConst.Kind.directory:
                return vscode_1.CompletionItemKind.Folder;
        }
        return vscode_1.CompletionItemKind.Property;
    }
    static getCommitCharacters(enableDotCompletions, enableCallCompletions, kind) {
        switch (kind) {
            case PConst.Kind.externalModuleName:
                return ['"', '\''];
            case PConst.Kind.file:
            case PConst.Kind.directory:
                return ['"', '\''];
            case PConst.Kind.memberGetAccessor:
            case PConst.Kind.memberSetAccessor:
            case PConst.Kind.constructSignature:
            case PConst.Kind.callSignature:
            case PConst.Kind.indexSignature:
            case PConst.Kind.enum:
            case PConst.Kind.interface:
                return enableDotCompletions ? ['.'] : undefined;
            case PConst.Kind.module:
            case PConst.Kind.alias:
            case PConst.Kind.const:
            case PConst.Kind.let:
            case PConst.Kind.variable:
            case PConst.Kind.localVariable:
            case PConst.Kind.memberVariable:
            case PConst.Kind.class:
            case PConst.Kind.function:
            case PConst.Kind.memberFunction:
                return enableDotCompletions ? (enableCallCompletions ? ['.', '('] : ['.']) : undefined;
        }
        return undefined;
    }
}
var Configuration;
(function (Configuration) {
    Configuration.useCodeSnippetsOnMethodSuggest = 'useCodeSnippetsOnMethodSuggest';
    Configuration.nameSuggestions = 'nameSuggestions';
})(Configuration || (Configuration = {}));
class TypeScriptCompletionItemProvider {
    constructor(client, typingsStatus) {
        this.client = client;
        this.typingsStatus = typingsStatus;
        this.config = {
            useCodeSnippetsOnMethodSuggest: false,
            nameSuggestions: true
        };
    }
    updateConfiguration() {
        // Use shared setting for js and ts
        const typeScriptConfig = vscode_1.workspace.getConfiguration('typescript');
        this.config.useCodeSnippetsOnMethodSuggest = typeScriptConfig.get(Configuration.useCodeSnippetsOnMethodSuggest, false);
        const jsConfig = vscode_1.workspace.getConfiguration('javascript');
        this.config.nameSuggestions = jsConfig.get(Configuration.nameSuggestions, true);
    }
    provideCompletionItems(document, position, token, context) {
        if (this.typingsStatus.isAcquiringTypings) {
            return Promise.reject({
                label: localize({ key: 'acquiringTypingsLabel', comment: ['Typings refers to the *.d.ts typings files that power our IntelliSense. It should not be localized'] }, 'Acquiring typings...'),
                detail: localize({ key: 'acquiringTypingsDetail', comment: ['Typings refers to the *.d.ts typings files that power our IntelliSense. It should not be localized'] }, 'Acquiring typings definitions for IntelliSense.')
            });
        }
        const file = this.client.normalizePath(document.uri);
        if (!file) {
            return Promise.resolve([]);
        }
        if (context.triggerCharacter === '"' || context.triggerCharacter === '\'') {
            // make sure we are in something that looks like the start of an import
            const line = document.lineAt(position.line).text.slice(0, position.character);
            if (!line.match(/^import .+? from\s*["']$/)) {
                return Promise.resolve([]);
            }
        }
        if (context.triggerCharacter === '/') {
            // make sure we are in something that looks line an import path
            const line = document.lineAt(position.line).text.slice(0, position.character);
            if (!line.match(/^import .+? from\s*["'][^'"]*$/)) {
                return Promise.resolve([]);
            }
        }
        const args = convert_1.vsPositionToTsFileLocation(file, position);
        return this.client.execute('completions', args, token).then((msg) => {
            // This info has to come from the tsserver. See https://github.com/Microsoft/TypeScript/issues/2831
            // let isMemberCompletion = false;
            // let requestColumn = position.character;
            // if (wordAtPosition) {
            // 	requestColumn = wordAtPosition.startColumn;
            // }
            // if (requestColumn > 0) {
            // 	let value = model.getValueInRange({
            // 		startLineNumber: position.line,
            // 		startColumn: requestColumn - 1,
            // 		endLineNumber: position.line,
            // 		endColumn: requestColumn
            // 	});
            // 	isMemberCompletion = value === '.';
            // }
            const completionItems = [];
            const body = msg.body;
            if (body) {
                // Only enable dot completions in TS files for now
                let enableDotCompletions = document && (document.languageId === 'typescript' || document.languageId === 'typescriptreact');
                // TODO: Workaround for https://github.com/Microsoft/TypeScript/issues/13456
                // Only enable dot completions when previous character is an identifier.
                // Prevents incorrectly completing while typing spread operators.
                if (position.character > 0) {
                    const preText = document.getText(new vscode_1.Range(position.line, 0, position.line, position.character - 1));
                    enableDotCompletions = preText.match(/[a-z_$\)\]\}]\s*$/ig) !== null;
                }
                for (const element of body) {
                    if (element.kind === PConst.Kind.warning && !this.config.nameSuggestions) {
                        continue;
                    }
                    const item = new MyCompletionItem(position, document, element, enableDotCompletions, !this.config.useCodeSnippetsOnMethodSuggest);
                    completionItems.push(item);
                }
            }
            return completionItems;
        }, () => {
            return [];
        });
    }
    resolveCompletionItem(item, token) {
        if (!(item instanceof MyCompletionItem)) {
            return null;
        }
        const filepath = this.client.normalizePath(item.document.uri);
        if (!filepath) {
            return null;
        }
        const args = Object.assign({}, convert_1.vsPositionToTsFileLocation(filepath, item.position), { entryNames: [item.label] });
        return this.client.execute('completionEntryDetails', args, token).then((response) => {
            const details = response.body;
            if (!details || !details.length || !details[0]) {
                return item;
            }
            const detail = details[0];
            item.detail = Previewer.plain(detail.displayParts);
            item.documentation = Previewer.markdownDocumentation(detail.documentation, detail.tags);
            if (detail && this.config.useCodeSnippetsOnMethodSuggest && (item.kind === vscode_1.CompletionItemKind.Function || item.kind === vscode_1.CompletionItemKind.Method)) {
                return this.isValidFunctionCompletionContext(filepath, item.position).then(shouldCompleteFunction => {
                    if (shouldCompleteFunction) {
                        item.insertText = this.snippetForFunctionCall(detail);
                    }
                    return item;
                });
            }
            return item;
        }, () => {
            return item;
        });
    }
    isValidFunctionCompletionContext(filepath, position) {
        const args = convert_1.vsPositionToTsFileLocation(filepath, position);
        // Workaround for https://github.com/Microsoft/TypeScript/issues/12677
        // Don't complete function calls inside of destructive assigments or imports
        return this.client.execute('quickinfo', args).then(infoResponse => {
            const info = infoResponse.body;
            switch (info && info.kind) {
                case 'var':
                case 'let':
                case 'const':
                case 'alias':
                    return false;
                default:
                    return true;
            }
        }, () => {
            return true;
        });
    }
    snippetForFunctionCall(detail) {
        const suggestionArgumentNames = [];
        let parenCount = 0;
        for (let i = 0; i < detail.displayParts.length; ++i) {
            const part = detail.displayParts[i];
            // Only take top level paren names
            if (part.kind === 'parameterName' && parenCount === 1) {
                suggestionArgumentNames.push(`\${${i + 1}:${part.text}}`);
            }
            else if (part.kind === 'punctuation') {
                if (part.text === '(') {
                    ++parenCount;
                }
                else if (part.text === ')') {
                    --parenCount;
                }
            }
        }
        let codeSnippet = detail.name;
        if (suggestionArgumentNames.length > 0) {
            codeSnippet += '(' + suggestionArgumentNames.join(', ') + ')$0';
        }
        else {
            codeSnippet += '()';
        }
        return new vscode_1.SnippetString(codeSnippet);
    }
}
exports.default = TypeScriptCompletionItemProvider;
