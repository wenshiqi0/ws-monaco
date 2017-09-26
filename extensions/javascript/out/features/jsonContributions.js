/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var jsonc_parser_1 = require("jsonc-parser");
var path_1 = require("path");
var bowerJSONContribution_1 = require("./bowerJSONContribution");
var packageJSONContribution_1 = require("./packageJSONContribution");
var vscode_1 = require("vscode");
function addJSONProviders(xhr) {
    var contributions = [new packageJSONContribution_1.PackageJSONContribution(xhr), new bowerJSONContribution_1.BowerJSONContribution(xhr)];
    var subscriptions = [];
    contributions.forEach(function (contribution) {
        var selector = contribution.getDocumentSelector();
        subscriptions.push(vscode_1.languages.registerCompletionItemProvider(selector, new JSONCompletionItemProvider(contribution), '"', ':'));
        subscriptions.push(vscode_1.languages.registerHoverProvider(selector, new JSONHoverProvider(contribution)));
    });
    return vscode_1.Disposable.from.apply(vscode_1.Disposable, subscriptions);
}
exports.addJSONProviders = addJSONProviders;
var JSONHoverProvider = (function () {
    function JSONHoverProvider(jsonContribution) {
        this.jsonContribution = jsonContribution;
    }
    JSONHoverProvider.prototype.provideHover = function (document, position, token) {
        var fileName = path_1.basename(document.fileName);
        var offset = document.offsetAt(position);
        var location = jsonc_parser_1.getLocation(document.getText(), offset);
        var node = location.previousNode;
        if (node && node.offset <= offset && offset <= node.offset + node.length) {
            var promise = this.jsonContribution.getInfoContribution(fileName, location);
            if (promise) {
                return promise.then(function (htmlContent) {
                    var range = new vscode_1.Range(document.positionAt(node.offset), document.positionAt(node.offset + node.length));
                    var result = {
                        contents: htmlContent,
                        range: range
                    };
                    return result;
                });
            }
        }
        return null;
    };
    return JSONHoverProvider;
}());
exports.JSONHoverProvider = JSONHoverProvider;
var JSONCompletionItemProvider = (function () {
    function JSONCompletionItemProvider(jsonContribution) {
        this.jsonContribution = jsonContribution;
    }
    JSONCompletionItemProvider.prototype.resolveCompletionItem = function (item, token) {
        if (this.jsonContribution.resolveSuggestion) {
            var resolver = this.jsonContribution.resolveSuggestion(item);
            if (resolver) {
                return resolver;
            }
        }
        return Promise.resolve(item);
    };
    JSONCompletionItemProvider.prototype.provideCompletionItems = function (document, position, token) {
        var fileName = path_1.basename(document.fileName);
        var currentWord = this.getCurrentWord(document, position);
        var overwriteRange;
        var items = [];
        var isIncomplete = false;
        var offset = document.offsetAt(position);
        var location = jsonc_parser_1.getLocation(document.getText(), offset);
        var node = location.previousNode;
        if (node && node.offset <= offset && offset <= node.offset + node.length && (node.type === 'property' || node.type === 'string' || node.type === 'number' || node.type === 'boolean' || node.type === 'null')) {
            overwriteRange = new vscode_1.Range(document.positionAt(node.offset), document.positionAt(node.offset + node.length));
        }
        else {
            overwriteRange = new vscode_1.Range(document.positionAt(offset - currentWord.length), position);
        }
        var proposed = {};
        var collector = {
            add: function (suggestion) {
                if (!proposed[suggestion.label]) {
                    proposed[suggestion.label] = true;
                    suggestion.range = overwriteRange;
                    items.push(suggestion);
                }
            },
            setAsIncomplete: function () { return isIncomplete = true; },
            error: function (message) { return console.error(message); },
            log: function (message) { return console.log(message); }
        };
        var collectPromise = null;
        if (location.isAtPropertyKey) {
            var addValue = !location.previousNode || !location.previousNode.columnOffset;
            var isLast = this.isLast(document, position);
            collectPromise = this.jsonContribution.collectPropertySuggestions(fileName, location, currentWord, addValue, isLast, collector);
        }
        else {
            if (location.path.length === 0) {
                collectPromise = this.jsonContribution.collectDefaultSuggestions(fileName, collector);
            }
            else {
                collectPromise = this.jsonContribution.collectValueSuggestions(fileName, location, collector);
            }
        }
        if (collectPromise) {
            return collectPromise.then(function () {
                if (items.length > 0) {
                    return new vscode_1.CompletionList(items, isIncomplete);
                }
                return null;
            });
        }
        return null;
    };
    JSONCompletionItemProvider.prototype.getCurrentWord = function (document, position) {
        var i = position.character - 1;
        var text = document.lineAt(position.line).text;
        while (i >= 0 && ' \t\n\r\v":{[,'.indexOf(text.charAt(i)) === -1) {
            i--;
        }
        return text.substring(i + 1, position.character);
    };
    JSONCompletionItemProvider.prototype.isLast = function (document, position) {
        var scanner = jsonc_parser_1.createScanner(document.getText(), true);
        scanner.setPosition(document.offsetAt(position));
        var nextToken = scanner.scan();
        if (nextToken === jsonc_parser_1.SyntaxKind.StringLiteral && scanner.getTokenError() === jsonc_parser_1.ScanError.UnexpectedEndOfString) {
            nextToken = scanner.scan();
        }
        return nextToken === jsonc_parser_1.SyntaxKind.CloseBraceToken || nextToken === jsonc_parser_1.SyntaxKind.EOF;
    };
    return JSONCompletionItemProvider;
}());
exports.JSONCompletionItemProvider = JSONCompletionItemProvider;
//# sourceMappingURL=jsonContributions.js.map