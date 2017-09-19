const { languages, SnippetString, Position } = require('vscode');
const snippets = require('../snippets/axml');

function activate(context) {
  languages.registerCompletionItemProvider('axml', new CompletionsProvider(), '.', ':', '<', '"', '=', '/');
}

class CompletionsProvider {
  provideCompletionItems(document, position, token) {
    return Object.keys(snippets).map(key => {
      const body = snippets[key].body;
      return {
        kind: monaco.languages.CompletionItemKind.Snippet,
        label: snippets[key].prefix,
        insertText: new SnippetString(Array.isArray(body) ? body.join('\n') : body),
        documentation: snippets[key].description,
        document,
        position,
      }
    })
  }
  resolveCompletionItem(item, token) {
    const { document, position } = item;
    const range = document.getWordRangeAtPosition(position);
    if (range) {
      const last = range.with(position.translate({ characterDelta: -1 }), position);
      if (last) {
        const text = document.getText(last);
        if (text === '<' && item.insertText.value.charAt(0) === '<')
        item.insertText.value = item.insertText.value.slice(1);
      }
    }
    return item;
  }
}

exports.activate = activate;
module.exports['default'] = activate;
