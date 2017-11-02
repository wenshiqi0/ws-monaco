"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const util_1 = require("./util");
const vscode_emmet_helper_1 = require("vscode-emmet-helper");
const trimRegex = /[\u00a0]*[\d|#|\-|\*|\u2022]+\.?/;
function wrapWithAbbreviation(args) {
    if (!util_1.validate(false)) {
        return;
    }
    const editor = vscode.window.activeTextEditor;
    const abbreviationPromise = (args && args['abbreviation']) ? Promise.resolve(args['abbreviation']) : vscode.window.showInputBox({ prompt: 'Enter Abbreviation' });
    const syntax = getSyntaxFromArgs({ language: editor.document.languageId });
    return abbreviationPromise.then(abbreviation => {
        if (!abbreviation || !abbreviation.trim() || !vscode_emmet_helper_1.isAbbreviationValid(syntax, abbreviation)) {
            return;
        }
        let expandAbbrList = [];
        editor.selections.forEach(selection => {
            let rangeToReplace = selection.isReversed ? new vscode.Range(selection.active, selection.anchor) : selection;
            if (rangeToReplace.isEmpty) {
                rangeToReplace = new vscode.Range(rangeToReplace.start.line, 0, rangeToReplace.start.line, editor.document.lineAt(rangeToReplace.start.line).text.length);
            }
            const firstLineOfSelection = editor.document.lineAt(rangeToReplace.start).text.substr(rangeToReplace.start.character);
            const matches = firstLineOfSelection.match(/^(\s*)/);
            const preceedingWhiteSpace = matches ? matches[1].length : 0;
            rangeToReplace = new vscode.Range(rangeToReplace.start.line, rangeToReplace.start.character + preceedingWhiteSpace, rangeToReplace.end.line, rangeToReplace.end.character);
            expandAbbrList.push({ syntax, abbreviation, rangeToReplace, textToWrap: ['\n\t$TM_SELECTED_TEXT\n'] });
        });
        return expandAbbreviationInRange(editor, expandAbbrList, true);
    });
}
exports.wrapWithAbbreviation = wrapWithAbbreviation;
function wrapIndividualLinesWithAbbreviation(args) {
    if (!util_1.validate(false)) {
        return;
    }
    const editor = vscode.window.activeTextEditor;
    if (editor.selection.isEmpty) {
        vscode.window.showInformationMessage('Select more than 1 line and try again.');
        return;
    }
    const abbreviationPromise = (args && args['abbreviation']) ? Promise.resolve(args['abbreviation']) : vscode.window.showInputBox({ prompt: 'Enter Abbreviation' });
    const syntax = getSyntaxFromArgs({ language: editor.document.languageId });
    const lines = editor.document.getText(editor.selection).split('\n').map(x => x.trim());
    return abbreviationPromise.then(inputAbbreviation => {
        if (!inputAbbreviation || !inputAbbreviation.trim() || !vscode_emmet_helper_1.isAbbreviationValid(syntax, inputAbbreviation)) {
            return;
        }
        let extractedResults = vscode_emmet_helper_1.extractAbbreviationFromText(inputAbbreviation);
        if (!extractedResults) {
            return;
        }
        let { abbreviation, filter } = extractedResults;
        let input = {
            syntax,
            abbreviation,
            rangeToReplace: editor.selection,
            textToWrap: lines,
            filter
        };
        return expandAbbreviationInRange(editor, [input], true);
    });
}
exports.wrapIndividualLinesWithAbbreviation = wrapIndividualLinesWithAbbreviation;
function expandEmmetAbbreviation(args) {
    const syntax = getSyntaxFromArgs(args);
    if (!syntax || !util_1.validate()) {
        return fallbackTab();
    }
    const editor = vscode.window.activeTextEditor;
    let rootNode = util_1.parseDocument(editor.document, false);
    // When tabbed on a non empty selection, do not treat it as an emmet abbreviation, and fallback to tab instead
    if (vscode.workspace.getConfiguration('emmet')['triggerExpansionOnTab'] === true && editor.selections.find(x => !x.isEmpty)) {
        return fallbackTab();
    }
    let abbreviationList = [];
    let firstAbbreviation;
    let allAbbreviationsSame = true;
    let getAbbreviation = (document, selection, position, syntax) => {
        let rangeToReplace = selection;
        let abbr = document.getText(rangeToReplace);
        if (!rangeToReplace.isEmpty) {
            let extractedResults = vscode_emmet_helper_1.extractAbbreviationFromText(abbr);
            if (extractedResults) {
                return [rangeToReplace, extractedResults.abbreviation, extractedResults.filter];
            }
            return [null, '', ''];
        }
        const currentLine = editor.document.lineAt(position.line).text;
        const textTillPosition = currentLine.substr(0, position.character);
        // Expand cases like <div to <div></div> explicitly
        // else we will end up with <<div></div>
        if (syntax === 'html') {
            let matches = textTillPosition.match(/<(\w+)$/);
            if (matches) {
                abbr = matches[1];
                rangeToReplace = new vscode.Range(position.translate(0, -(abbr.length + 1)), position);
                return [rangeToReplace, abbr, ''];
            }
        }
        let extractedResults = vscode_emmet_helper_1.extractAbbreviation(editor.document, position, false);
        if (!extractedResults) {
            return [null, '', ''];
        }
        let { abbreviationRange, abbreviation, filter } = extractedResults;
        return [new vscode.Range(abbreviationRange.start.line, abbreviationRange.start.character, abbreviationRange.end.line, abbreviationRange.end.character), abbreviation, filter];
    };
    let selectionsInReverseOrder = editor.selections.slice(0);
    selectionsInReverseOrder.sort((a, b) => {
        var posA = a.isReversed ? a.anchor : a.active;
        var posB = b.isReversed ? b.anchor : b.active;
        return posA.compareTo(posB) * -1;
    });
    selectionsInReverseOrder.forEach(selection => {
        let position = selection.isReversed ? selection.anchor : selection.active;
        let [rangeToReplace, abbreviation, filter] = getAbbreviation(editor.document, selection, position, syntax);
        if (!rangeToReplace) {
            return;
        }
        if (!vscode_emmet_helper_1.isAbbreviationValid(syntax, abbreviation)) {
            return;
        }
        let currentNode = util_1.getNode(rootNode, position, true);
        if (!isValidLocationForEmmetAbbreviation(currentNode, syntax, position)) {
            return;
        }
        if (!firstAbbreviation) {
            firstAbbreviation = abbreviation;
        }
        else if (allAbbreviationsSame && firstAbbreviation !== abbreviation) {
            allAbbreviationsSame = false;
        }
        abbreviationList.push({ syntax, abbreviation, rangeToReplace, filter });
    });
    return expandAbbreviationInRange(editor, abbreviationList, allAbbreviationsSame).then(success => {
        if (!success) {
            return fallbackTab();
        }
    });
}
exports.expandEmmetAbbreviation = expandEmmetAbbreviation;
function fallbackTab() {
    if (vscode.workspace.getConfiguration('emmet')['triggerExpansionOnTab'] === true) {
        return vscode.commands.executeCommand('tab');
    }
}
/**
 * Checks if given position is a valid location to expand emmet abbreviation.
 * Works only on html and css/less/scss syntax
 * @param currentNode parsed node at given position
 * @param syntax syntax of the abbreviation
 * @param position position to validate
 */
function isValidLocationForEmmetAbbreviation(currentNode, syntax, position) {
    // Continue validation only if the file was parse-able and the currentNode has been found
    if (!currentNode) {
        return true;
    }
    if (vscode_emmet_helper_1.isStyleSheet(syntax)) {
        // If current node is a rule or at-rule, then perform additional checks to ensure
        // emmet suggestions are not provided in the rule selector
        if (currentNode.type !== 'rule' && currentNode.type !== 'at-rule') {
            return true;
        }
        const currentCssNode = currentNode;
        // Position is valid if it occurs after the `{` that marks beginning of rule contents
        if (position.isAfter(currentCssNode.contentStartToken.end)) {
            return true;
        }
        // Workaround for https://github.com/Microsoft/vscode/30188
        // The line above the rule selector is considered as part of the selector by the css-parser
        // But we should assume it is a valid location for css properties under the parent rule
        if (currentCssNode.parent
            && (currentCssNode.parent.type === 'rule' || currentCssNode.parent.type === 'at-rule')
            && currentCssNode.selectorToken
            && position.line !== currentCssNode.selectorToken.end.line) {
            return true;
        }
        return false;
    }
    const currentHtmlNode = currentNode;
    if (currentHtmlNode.close) {
        return util_1.getInnerRange(currentHtmlNode).contains(position);
    }
    return false;
}
exports.isValidLocationForEmmetAbbreviation = isValidLocationForEmmetAbbreviation;
/**
 * Expands abbreviations as detailed in expandAbbrList in the editor
 * @param editor
 * @param expandAbbrList
 * @param insertSameSnippet
 * @returns false if no snippet can be inserted.
 */
function expandAbbreviationInRange(editor, expandAbbrList, insertSameSnippet) {
    if (!expandAbbrList || expandAbbrList.length === 0) {
        return Promise.resolve(false);
    }
    // Snippet to replace at multiple cursors are not the same
    // `editor.insertSnippet` will have to be called for each instance separately
    // We will not be able to maintain multiple cursors after snippet insertion
    let insertPromises = [];
    if (!insertSameSnippet) {
        expandAbbrList.forEach((expandAbbrInput) => {
            let expandedText = expandAbbr(expandAbbrInput);
            if (expandedText) {
                insertPromises.push(editor.insertSnippet(new vscode.SnippetString(expandedText), expandAbbrInput.rangeToReplace));
            }
        });
        if (insertPromises.length === 0) {
            return Promise.resolve(false);
        }
        return Promise.all(insertPromises).then(() => Promise.resolve(true));
    }
    // Snippet to replace at all cursors are the same
    // We can pass all ranges to `editor.insertSnippet` in a single call so that
    // all cursors are maintained after snippet insertion
    const anyExpandAbbrInput = expandAbbrList[0];
    let expandedText = expandAbbr(anyExpandAbbrInput);
    let allRanges = expandAbbrList.map(value => {
        return new vscode.Range(value.rangeToReplace.start.line, value.rangeToReplace.start.character, value.rangeToReplace.end.line, value.rangeToReplace.end.character);
    });
    if (expandedText) {
        return editor.insertSnippet(new vscode.SnippetString(expandedText), allRanges);
    }
    return Promise.resolve(false);
}
/**
 * Expands abbreviation as detailed in given input.
 */
function expandAbbr(input) {
    const expandOptions = vscode_emmet_helper_1.getExpandOptions(input.syntax, util_1.getEmmetConfiguration(input.syntax), input.filter);
    if (input.textToWrap) {
        if (input.filter && input.filter.indexOf('t') > -1) {
            input.textToWrap = input.textToWrap.map(line => {
                return line.replace(trimRegex, '').trim();
            });
        }
        expandOptions['text'] = input.textToWrap;
        // Below fixes https://github.com/Microsoft/vscode/issues/29898
        // With this, Emmet formats inline elements as block elements
        // ensuring the wrapped multi line text does not get merged to a single line
        if (!input.rangeToReplace.isSingleLine) {
            expandOptions.profile['inlineBreak'] = 1;
        }
    }
    try {
        // Expand the abbreviation
        let expandedText = vscode_emmet_helper_1.expandAbbreviation(input.abbreviation, expandOptions);
        if (input.textToWrap) {
            // All $anyword would have been escaped by the emmet helper.
            // Remove the escaping backslash from $TM_SELECTED_TEXT so that VS Code Snippet controller can treat it as a variable
            expandedText = expandedText.replace('\\$TM_SELECTED_TEXT', '$TM_SELECTED_TEXT');
            // If the expanded text is single line then we dont need the \t and \n we added to $TM_SELECTED_TEXT earlier
            if (input.textToWrap.length === 1 && expandedText.indexOf('\n') === -1) {
                expandedText = expandedText.replace(/\s*\$TM_SELECTED_TEXT\s*/, '$TM_SELECTED_TEXT');
            }
        }
        return expandedText;
    }
    catch (e) {
        vscode.window.showErrorMessage('Failed to expand abbreviation');
    }
}
function getSyntaxFromArgs(args) {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No editor is active.');
        return;
    }
    const mappedModes = util_1.getMappingForIncludedLanguages();
    let language = (!args || typeof args !== 'object' || !args['language']) ? editor.document.languageId : args['language'];
    let parentMode = (args && typeof args === 'object') ? args['parentMode'] : undefined;
    let excludedLanguages = vscode.workspace.getConfiguration('emmet')['excludeLanguages'] ? vscode.workspace.getConfiguration('emmet')['excludeLanguages'] : [];
    let syntax = vscode_emmet_helper_1.getEmmetMode((mappedModes[language] ? mappedModes[language] : language), excludedLanguages);
    if (!syntax) {
        syntax = vscode_emmet_helper_1.getEmmetMode((mappedModes[parentMode] ? mappedModes[parentMode] : parentMode), excludedLanguages);
    }
    return syntax;
}
//# sourceMappingURL=abbreviationActions.js.map