"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_emmet_helper_1 = require("vscode-emmet-helper");
const abbreviationActions_1 = require("./abbreviationActions");
const util_1 = require("./util");
const allowedMimeTypesInScriptTag = ['text/html', 'text/plain', 'text/x-template'];
class DefaultCompletionItemProvider {
    provideCompletionItems(document, position, token) {
        const mappedLanguages = util_1.getMappingForIncludedLanguages();
        const emmetConfig = vscode.workspace.getConfiguration('emmet');
        let isSyntaxMapped = mappedLanguages[document.languageId] ? true : false;
        let excludedLanguages = emmetConfig['excludeLanguages'] ? emmetConfig['excludeLanguages'] : [];
        let syntax = vscode_emmet_helper_1.getEmmetMode((isSyntaxMapped ? mappedLanguages[document.languageId] : document.languageId), excludedLanguages);
        if (document.languageId === 'html' || vscode_emmet_helper_1.isStyleSheet(document.languageId)) {
            // Document can be html/css parsed
            // Use syntaxHelper to parse file, validate location and update sytnax if needed
            syntax = this.syntaxHelper(syntax, document, position);
        }
        /*
        if (!syntax
            || ((isSyntaxMapped || syntax === 'jsx')
                && emmetConfig['showExpandedAbbreviation'] !== 'always')) {
            return;
        }
        */
        let noiseCheckPromise = Promise.resolve();
        // Fix for https://github.com/Microsoft/vscode/issues/32647
        // Check for document symbols in js/ts/jsx/tsx and avoid triggering emmet for abbreviations of the form symbolName.sometext
        // Presence of > or * or + in the abbreviation denotes valid abbreviation that should trigger emmet
        if (!vscode_emmet_helper_1.isStyleSheet(syntax) && (document.languageId === 'javascript' || document.languageId === 'javascriptreact' || document.languageId === 'typescript' || document.languageId === 'typescriptreact')) {
            let extractAbbreviationResults = vscode_emmet_helper_1.extractAbbreviation(document, position);
            if (extractAbbreviationResults) {
                let abbreviation = extractAbbreviationResults.abbreviation;
                if (abbreviation.startsWith('this.')) {
                    noiseCheckPromise = Promise.resolve(true);
                }
                else {
                    /*
                    noiseCheckPromise = vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri).then((symbols: vscode.SymbolInformation[]) => {
                        return symbols.find(x => abbreviation === x.name || (abbreviation.startsWith(x.name + '.') && !/>|\*|\+/.test(abbreviation)));
                    });
                    */
                }
            }
        }
        return noiseCheckPromise.then(noise => {
            if (noise) {
                return;
            }
            let result = vscode_emmet_helper_1.doComplete(document, position, syntax, util_1.getEmmetConfiguration(syntax));
            let newItems = [];
            if (result && result.items) {
                result.items.forEach(item => {
                    let newItem = new vscode.CompletionItem(item.label);
                    newItem.documentation = item.documentation;
                    newItem.detail = item.detail;
                    newItem.insertText = new vscode.SnippetString(item.textEdit.newText);
                    let oldrange = item.textEdit.range;
                    newItem.range = new vscode.Range(oldrange.start.line, oldrange.start.character, oldrange.end.line, oldrange.end.character);
                    newItem.filterText = item.filterText;
                    newItem.sortText = item.sortText;
                    if (emmetConfig['showSuggestionsAsSnippets'] === true) {
                        newItem.kind = vscode.CompletionItemKind.Snippet;
                    }
                    newItems.push(newItem);
                });
            }
            return Promise.resolve(new vscode.CompletionList(newItems, true));
        });
    }
    /**
     * Parses given document to check whether given position is valid for emmet abbreviation and returns appropriate syntax
     * @param syntax string language mode of current document
     * @param document vscode.Textdocument
     * @param position vscode.Position position of the abbreviation that needs to be expanded
     */
    syntaxHelper(syntax, document, position) {
        if (!syntax) {
            return syntax;
        }
        let rootNode = util_1.parseDocument(document, false);
        if (!rootNode) {
            return;
        }
        let currentNode = util_1.getNode(rootNode, position, true);
        if (!vscode_emmet_helper_1.isStyleSheet(syntax)) {
            const currentHtmlNode = currentNode;
            if (currentHtmlNode
                && currentHtmlNode.close
                && util_1.getInnerRange(currentHtmlNode).contains(position)) {
                if (currentHtmlNode.name === 'style') {
                    return 'css';
                }
                if (currentHtmlNode.name === 'script') {
                    if (currentHtmlNode.attributes
                        && currentHtmlNode.attributes.some(x => x.name.toString() === 'type' && allowedMimeTypesInScriptTag.indexOf(x.value.toString()) > -1)) {
                        return syntax;
                    }
                    return;
                }
            }
        }
        if (!abbreviationActions_1.isValidLocationForEmmetAbbreviation(currentNode, syntax, position)) {
            return;
        }
        return syntax;
    }
}
exports.DefaultCompletionItemProvider = DefaultCompletionItemProvider;
//# sourceMappingURL=defaultCompletionProvider.js.map