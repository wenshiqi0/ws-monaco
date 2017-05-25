/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var languageModelCache_1 = require("../languageModelCache");
var vscode_languageserver_types_1 = require("vscode-languageserver-types");
var strings_1 = require("../utils/strings");
var ts = require("typescript");
var path_1 = require("path");
var FILE_NAME = 'vscode://javascript/1'; // the same 'file' is used for all contents
var JQUERY_D_TS = path_1.join(__dirname, '../../lib/jquery.d.ts');
var JS_WORD_REGEX = /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g;
function getJavascriptMode(documentRegions) {
    var jsDocuments = languageModelCache_1.getLanguageModelCache(10, 60, function (document) { return documentRegions.get(document).getEmbeddedDocument('javascript'); });
    var compilerOptions = { allowNonTsExtensions: true, allowJs: true, lib: ['lib.es6.d.ts'], target: ts.ScriptTarget.Latest, moduleResolution: ts.ModuleResolutionKind.Classic };
    var currentTextDocument;
    var scriptFileVersion = 0;
    function updateCurrentTextDocument(doc) {
        if (!currentTextDocument || doc.uri !== currentTextDocument.uri || doc.version !== currentTextDocument.version) {
            currentTextDocument = jsDocuments.get(doc);
            scriptFileVersion++;
        }
    }
    var host = {
        getCompilationSettings: function () { return compilerOptions; },
        getScriptFileNames: function () { return [FILE_NAME, JQUERY_D_TS]; },
        getScriptVersion: function (fileName) {
            if (fileName === FILE_NAME) {
                return String(scriptFileVersion);
            }
            return '1'; // default lib an jquery.d.ts are static
        },
        getScriptSnapshot: function (fileName) {
            var text = '';
            if (strings_1.startsWith(fileName, 'vscode:')) {
                if (fileName === FILE_NAME) {
                    text = currentTextDocument.getText();
                }
            }
            else {
                text = ts.sys.readFile(fileName) || '';
            }
            return {
                getText: function (start, end) { return text.substring(start, end); },
                getLength: function () { return text.length; },
                getChangeRange: function () { return void 0; }
            };
        },
        getCurrentDirectory: function () { return ''; },
        getDefaultLibFileName: function (options) { return ts.getDefaultLibFilePath(options); }
    };
    var jsLanguageService = ts.createLanguageService(host);
    var settings = {};
    return {
        getId: function () {
            return 'javascript';
        },
        configure: function (options) {
            settings = options && options.javascript;
        },
        doValidation: function (document) {
            updateCurrentTextDocument(document);
            var diagnostics = jsLanguageService.getSyntacticDiagnostics(FILE_NAME);
            return diagnostics.map(function (diag) {
                return {
                    range: convertRange(currentTextDocument, diag),
                    severity: vscode_languageserver_types_1.DiagnosticSeverity.Error,
                    message: ts.flattenDiagnosticMessageText(diag.messageText, '\n')
                };
            });
        },
        doComplete: function (document, position) {
            updateCurrentTextDocument(document);
            var offset = currentTextDocument.offsetAt(position);
            var completions = jsLanguageService.getCompletionsAtPosition(FILE_NAME, offset);
            if (!completions) {
                return { isIncomplete: false, items: [] };
            }
            var replaceRange = convertRange(currentTextDocument, strings_1.getWordAtText(currentTextDocument.getText(), offset, JS_WORD_REGEX));
            return {
                isIncomplete: false,
                items: completions.entries.map(function (entry) {
                    return {
                        uri: document.uri,
                        position: position,
                        label: entry.name,
                        sortText: entry.sortText,
                        kind: convertKind(entry.kind),
                        textEdit: vscode_languageserver_types_1.TextEdit.replace(replaceRange, entry.name),
                        data: {
                            languageId: 'javascript',
                            uri: document.uri,
                            offset: offset
                        }
                    };
                })
            };
        },
        doResolve: function (document, item) {
            updateCurrentTextDocument(document);
            var details = jsLanguageService.getCompletionEntryDetails(FILE_NAME, item.data.offset, item.label);
            if (details) {
                item.detail = ts.displayPartsToString(details.displayParts);
                item.documentation = ts.displayPartsToString(details.documentation);
                delete item.data;
            }
            return item;
        },
        doHover: function (document, position) {
            updateCurrentTextDocument(document);
            var info = jsLanguageService.getQuickInfoAtPosition(FILE_NAME, currentTextDocument.offsetAt(position));
            if (info) {
                var contents = ts.displayPartsToString(info.displayParts);
                return {
                    range: convertRange(currentTextDocument, info.textSpan),
                    contents: vscode_languageserver_types_1.MarkedString.fromPlainText(contents)
                };
            }
            return null;
        },
        doSignatureHelp: function (document, position) {
            updateCurrentTextDocument(document);
            var signHelp = jsLanguageService.getSignatureHelpItems(FILE_NAME, currentTextDocument.offsetAt(position));
            if (signHelp) {
                var ret_1 = {
                    activeSignature: signHelp.selectedItemIndex,
                    activeParameter: signHelp.argumentIndex,
                    signatures: []
                };
                signHelp.items.forEach(function (item) {
                    var signature = {
                        label: '',
                        documentation: null,
                        parameters: []
                    };
                    signature.label += ts.displayPartsToString(item.prefixDisplayParts);
                    item.parameters.forEach(function (p, i, a) {
                        var label = ts.displayPartsToString(p.displayParts);
                        var parameter = {
                            label: label,
                            documentation: ts.displayPartsToString(p.documentation)
                        };
                        signature.label += label;
                        signature.parameters.push(parameter);
                        if (i < a.length - 1) {
                            signature.label += ts.displayPartsToString(item.separatorDisplayParts);
                        }
                    });
                    signature.label += ts.displayPartsToString(item.suffixDisplayParts);
                    ret_1.signatures.push(signature);
                });
                return ret_1;
            }
            ;
            return null;
        },
        findDocumentHighlight: function (document, position) {
            updateCurrentTextDocument(document);
            var occurrences = jsLanguageService.getOccurrencesAtPosition(FILE_NAME, currentTextDocument.offsetAt(position));
            if (occurrences) {
                return occurrences.map(function (entry) {
                    return {
                        range: convertRange(currentTextDocument, entry.textSpan),
                        kind: (entry.isWriteAccess ? vscode_languageserver_types_1.DocumentHighlightKind.Write : vscode_languageserver_types_1.DocumentHighlightKind.Text)
                    };
                });
            }
            ;
            return null;
        },
        findDocumentSymbols: function (document) {
            updateCurrentTextDocument(document);
            var items = jsLanguageService.getNavigationBarItems(FILE_NAME);
            if (items) {
                var result_1 = [];
                var existing_1 = {};
                var collectSymbols_1 = function (item, containerLabel) {
                    var sig = item.text + item.kind + item.spans[0].start;
                    if (item.kind !== 'script' && !existing_1[sig]) {
                        var symbol = {
                            name: item.text,
                            kind: convertSymbolKind(item.kind),
                            location: {
                                uri: document.uri,
                                range: convertRange(currentTextDocument, item.spans[0])
                            },
                            containerName: containerLabel
                        };
                        existing_1[sig] = true;
                        result_1.push(symbol);
                        containerLabel = item.text;
                    }
                    if (item.childItems && item.childItems.length > 0) {
                        for (var _i = 0, _a = item.childItems; _i < _a.length; _i++) {
                            var child = _a[_i];
                            collectSymbols_1(child, containerLabel);
                        }
                    }
                };
                items.forEach(function (item) { return collectSymbols_1(item); });
                return result_1;
            }
            return null;
        },
        findDefinition: function (document, position) {
            updateCurrentTextDocument(document);
            var definition = jsLanguageService.getDefinitionAtPosition(FILE_NAME, currentTextDocument.offsetAt(position));
            if (definition) {
                return definition.filter(function (d) { return d.fileName === FILE_NAME; }).map(function (d) {
                    return {
                        uri: document.uri,
                        range: convertRange(currentTextDocument, d.textSpan)
                    };
                });
            }
            return null;
        },
        findReferences: function (document, position) {
            updateCurrentTextDocument(document);
            var references = jsLanguageService.getReferencesAtPosition(FILE_NAME, currentTextDocument.offsetAt(position));
            if (references) {
                return references.filter(function (d) { return d.fileName === FILE_NAME; }).map(function (d) {
                    return {
                        uri: document.uri,
                        range: convertRange(currentTextDocument, d.textSpan)
                    };
                });
            }
            return null;
        },
        format: function (document, range, formatParams) {
            currentTextDocument = documentRegions.get(document).getEmbeddedDocument('javascript', true);
            scriptFileVersion++;
            var initialIndentLevel = computeInitialIndent(document, range, formatParams);
            var formatSettings = convertOptions(formatParams, settings && settings.format, initialIndentLevel + 1);
            var start = currentTextDocument.offsetAt(range.start);
            var end = currentTextDocument.offsetAt(range.end);
            var lastLineRange = null;
            if (range.end.character === 0 || strings_1.isWhitespaceOnly(currentTextDocument.getText().substr(end - range.end.character, range.end.character))) {
                end -= range.end.character;
                lastLineRange = vscode_languageserver_types_1.Range.create(vscode_languageserver_types_1.Position.create(range.end.line, 0), range.end);
            }
            var edits = jsLanguageService.getFormattingEditsForRange(FILE_NAME, start, end, formatSettings);
            if (edits) {
                var result = [];
                for (var _i = 0, edits_1 = edits; _i < edits_1.length; _i++) {
                    var edit = edits_1[_i];
                    if (edit.span.start >= start && edit.span.start + edit.span.length <= end) {
                        result.push({
                            range: convertRange(currentTextDocument, edit.span),
                            newText: edit.newText
                        });
                    }
                }
                if (lastLineRange) {
                    result.push({
                        range: lastLineRange,
                        newText: generateIndent(initialIndentLevel, formatParams)
                    });
                }
                return result;
            }
            return null;
        },
        onDocumentRemoved: function (document) {
            jsDocuments.onDocumentRemoved(document);
        },
        dispose: function () {
            jsLanguageService.dispose();
            jsDocuments.dispose();
        }
    };
}
exports.getJavascriptMode = getJavascriptMode;
;
function convertRange(document, span) {
    var startPosition = document.positionAt(span.start);
    var endPosition = document.positionAt(span.start + span.length);
    return vscode_languageserver_types_1.Range.create(startPosition, endPosition);
}
function convertKind(kind) {
    switch (kind) {
        case 'primitive type':
        case 'keyword':
            return vscode_languageserver_types_1.CompletionItemKind.Keyword;
        case 'var':
        case 'local var':
            return vscode_languageserver_types_1.CompletionItemKind.Variable;
        case 'property':
        case 'getter':
        case 'setter':
            return vscode_languageserver_types_1.CompletionItemKind.Field;
        case 'function':
        case 'method':
        case 'construct':
        case 'call':
        case 'index':
            return vscode_languageserver_types_1.CompletionItemKind.Function;
        case 'enum':
            return vscode_languageserver_types_1.CompletionItemKind.Enum;
        case 'module':
            return vscode_languageserver_types_1.CompletionItemKind.Module;
        case 'class':
            return vscode_languageserver_types_1.CompletionItemKind.Class;
        case 'interface':
            return vscode_languageserver_types_1.CompletionItemKind.Interface;
        case 'warning':
            return vscode_languageserver_types_1.CompletionItemKind.File;
    }
    return vscode_languageserver_types_1.CompletionItemKind.Property;
}
function convertSymbolKind(kind) {
    switch (kind) {
        case 'var':
        case 'local var':
        case 'const':
            return vscode_languageserver_types_1.SymbolKind.Variable;
        case 'function':
        case 'local function':
            return vscode_languageserver_types_1.SymbolKind.Function;
        case 'enum':
            return vscode_languageserver_types_1.SymbolKind.Enum;
        case 'module':
            return vscode_languageserver_types_1.SymbolKind.Module;
        case 'class':
            return vscode_languageserver_types_1.SymbolKind.Class;
        case 'interface':
            return vscode_languageserver_types_1.SymbolKind.Interface;
        case 'method':
            return vscode_languageserver_types_1.SymbolKind.Method;
        case 'property':
        case 'getter':
        case 'setter':
            return vscode_languageserver_types_1.SymbolKind.Property;
    }
    return vscode_languageserver_types_1.SymbolKind.Variable;
}
function convertOptions(options, formatSettings, initialIndentLevel) {
    return {
        ConvertTabsToSpaces: options.insertSpaces,
        TabSize: options.tabSize,
        IndentSize: options.tabSize,
        IndentStyle: ts.IndentStyle.Smart,
        NewLineCharacter: '\n',
        BaseIndentSize: options.tabSize * initialIndentLevel,
        InsertSpaceAfterCommaDelimiter: Boolean(!formatSettings || formatSettings.insertSpaceAfterCommaDelimiter),
        InsertSpaceAfterSemicolonInForStatements: Boolean(!formatSettings || formatSettings.insertSpaceAfterSemicolonInForStatements),
        InsertSpaceBeforeAndAfterBinaryOperators: Boolean(!formatSettings || formatSettings.insertSpaceBeforeAndAfterBinaryOperators),
        InsertSpaceAfterKeywordsInControlFlowStatements: Boolean(!formatSettings || formatSettings.insertSpaceAfterKeywordsInControlFlowStatements),
        InsertSpaceAfterFunctionKeywordForAnonymousFunctions: Boolean(!formatSettings || formatSettings.insertSpaceAfterFunctionKeywordForAnonymousFunctions),
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: Boolean(formatSettings && formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis),
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: Boolean(formatSettings && formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets),
        InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: Boolean(formatSettings && formatSettings.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces),
        PlaceOpenBraceOnNewLineForControlBlocks: Boolean(formatSettings && formatSettings.placeOpenBraceOnNewLineForFunctions),
        PlaceOpenBraceOnNewLineForFunctions: Boolean(formatSettings && formatSettings.placeOpenBraceOnNewLineForControlBlocks)
    };
}
function computeInitialIndent(document, range, options) {
    var lineStart = document.offsetAt(vscode_languageserver_types_1.Position.create(range.start.line, 0));
    var content = document.getText();
    var i = lineStart;
    var nChars = 0;
    var tabSize = options.tabSize || 4;
    while (i < content.length) {
        var ch = content.charAt(i);
        if (ch === ' ') {
            nChars++;
        }
        else if (ch === '\t') {
            nChars += tabSize;
        }
        else {
            break;
        }
        i++;
    }
    return Math.floor(nChars / tabSize);
}
function generateIndent(level, options) {
    if (options.insertSpaces) {
        return strings_1.repeat(' ', level * options.tabSize);
    }
    else {
        return strings_1.repeat('\t', level);
    }
}
//# sourceMappingURL=javascriptMode.js.map