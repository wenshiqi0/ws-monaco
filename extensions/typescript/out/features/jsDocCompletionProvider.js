"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const nls = require("vscode-nls");
const localize = nls.loadMessageBundle();
const configurationNamespace = 'jsDocCompletion';
var Configuration;
(function (Configuration) {
    Configuration.enabled = 'enabled';
})(Configuration || (Configuration = {}));
class JsDocCompletionItem extends vscode_1.CompletionItem {
    constructor(document, position, shouldGetJSDocFromTSServer) {
        super('/** */', vscode_1.CompletionItemKind.Snippet);
        this.detail = localize('typescript.jsDocCompletionItem.documentation', 'JSDoc comment');
        this.insertText = '';
        this.sortText = '\0';
        const line = document.lineAt(position.line).text;
        const prefix = line.slice(0, position.character).match(/\/\**\s*$/);
        const suffix = line.slice(position.character).match(/^\s*\**\//);
        const start = position.translate(0, prefix ? -prefix[0].length : 0);
        this.range = new vscode_1.Range(start, position.translate(0, suffix ? suffix[0].length : 0));
        this.command = {
            title: 'Try Complete JSDoc',
            command: TryCompleteJsDocCommand.COMMAND_NAME,
            arguments: [document.uri, start, shouldGetJSDocFromTSServer]
        };
    }
}
class JsDocCompletionProvider {
    constructor(client) {
        this.client = client;
        this.config = { enabled: true };
    }
    updateConfiguration() {
        const jsDocCompletionConfig = vscode_1.workspace.getConfiguration(configurationNamespace);
        this.config.enabled = jsDocCompletionConfig.get(Configuration.enabled, true);
    }
    provideCompletionItems(document, position, _token) {
        const file = this.client.normalizePath(document.uri);
        if (!file) {
            return [];
        }
        // Only show the JSdoc completion when the everything before the cursor is whitespace
        // or could be the opening of a comment
        const line = document.lineAt(position.line).text;
        const prefix = line.slice(0, position.character);
        if (prefix.match(/^\s*$|\/\*\*\s*$|^\s*\/\*\*+\s*$/)) {
            return [new JsDocCompletionItem(document, position, this.config.enabled)];
        }
        return [];
    }
    resolveCompletionItem(item, _token) {
        return item;
    }
}
exports.JsDocCompletionProvider = JsDocCompletionProvider;
class TryCompleteJsDocCommand {
    constructor(lazyClient) {
        this.lazyClient = lazyClient;
    }
    /**
     * Try to insert a jsdoc comment, using a template provide by typescript
     * if possible, otherwise falling back to a default comment format.
     */
    tryCompleteJsDoc(resource, start, shouldGetJSDocFromTSServer) {
        const file = this.lazyClient().normalizePath(resource);
        if (!file) {
            return Promise.resolve(false);
        }
        const editor = vscode_1.window.activeTextEditor;
        if (!editor || editor.document.uri.fsPath !== resource.fsPath) {
            return Promise.resolve(false);
        }
        if (!shouldGetJSDocFromTSServer) {
            return this.tryInsertDefaultDoc(editor, start);
        }
        return this.tryInsertJsDocFromTemplate(editor, file, start)
            .then((didInsertFromTemplate) => {
            if (didInsertFromTemplate) {
                return true;
            }
            return this.tryInsertDefaultDoc(editor, start);
        });
    }
    tryInsertJsDocFromTemplate(editor, file, position) {
        const args = {
            file: file,
            line: position.line + 1,
            offset: position.character + 1
        };
        return Promise.race([
            this.lazyClient().execute('docCommentTemplate', args),
            new Promise((_, reject) => setTimeout(reject, 250))
        ]).then((res) => {
            if (!res || !res.body) {
                return false;
            }
            return editor.insertSnippet(this.templateToSnippet(res.body.newText), position, { undoStopBefore: false, undoStopAfter: true });
        }, () => false);
    }
    templateToSnippet(template) {
        let snippetIndex = 1;
        template = template.replace(/^\s*(?=(\/|[ ]\*))/gm, '');
        template = template.replace(/^(\/\*\*\s*\*[ ]*)$/m, (x) => x + `\$0`);
        template = template.replace(/\* @param([ ]\{\S+\})?\s+(\S+)\s*$/gm, (_param, type, post) => {
            let out = '* @param ';
            if (type === ' {any}' || type === ' {*}') {
                out += `{*\$\{${snippetIndex++}\}} `;
            }
            else if (type) {
                out += type + ' ';
            }
            out += post + ` \${${snippetIndex++}}`;
            return out;
        });
        return new vscode_1.SnippetString(template);
    }
    /**
     * Insert the default JSDoc
     */
    tryInsertDefaultDoc(editor, position) {
        const snippet = new vscode_1.SnippetString(`/**\n * $0\n */`);
        return editor.insertSnippet(snippet, position, { undoStopBefore: false, undoStopAfter: true });
    }
}
TryCompleteJsDocCommand.COMMAND_NAME = '_typeScript.tryCompleteJsDoc';
exports.TryCompleteJsDocCommand = TryCompleteJsDocCommand;
//# sourceMappingURL=jsDocCompletionProvider.js.map