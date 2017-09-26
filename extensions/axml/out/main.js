const { languages, SnippetString, Position, IndentAction } = require('vscode');
const snippets = require('../snippets/axml');
const completions = require('./completions/axml.json');

const EMPTY_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'];

const completionsMap = new Map();
function activate(context) {
  languages.setLanguageConfiguration('axml', {
    comments: {
      "blockComment": [ "<!--", "-->" ]      
    },
    "brackets": [
      ["<!--", "-->"],
      ["<", ">"],
      ["{", "}"],
      ["(", ")"]
    ],
    "autoClosingPairs": [
      { "open": "{", "close": "}"},
      { "open": "[", "close": "]"},
      { "open": "(", "close": ")" },
      { "open": "'", "close": "'" },
      { "open": "\"", "close": "\"" }
    ],
    "surroundingPairs": [
      { "open": "'", "close": "'" },
      { "open": "\"", "close": "\"" },
      { "open": "{", "close": "}"},
      { "open": "[", "close": "]"},
      { "open": "(", "close": ")" },
      { "open": "<", "close": ">" }
    ],
    indentationRules: {
        increaseIndentPattern: /<(?!\?|(?:area|base|br|col|frame|hr|html|img|input|link|meta|param)\b|[^>]*\/>)([-_\.A-Za-z0-9]+)(?=\s|>)\b[^>]*>(?!.*<\/\1>)|<!--(?!.*-->)|\{[^}"']*$/,
        decreaseIndentPattern: /^\s*(<\/(?!html)[-_\.A-Za-z0-9]+\b[^>]*>|-->|\})/
    },
    wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
    onEnterRules: [
        {
            beforeText: new RegExp("<(?!(?:" + EMPTY_ELEMENTS.join('|') + "))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
            afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
            action: { indentAction: IndentAction.IndentOutdent }
        },
        {
            beforeText: new RegExp("<(?!(?:" + EMPTY_ELEMENTS.join('|') + "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
            action: { indentAction: IndentAction.Indent }
        }
    ],
  });

  completions.forEach(completion => {
    completionsMap.set(completion.label, completion);
  })

  languages.registerCompletionItemProvider('axml', new CompletionsProvider(), '.', ':', '<', '"', '=', '/', '\s');
}

const tagRex = /<[a-zA-Z\-\:\"\'\=\{\}\s]*\/?>?/;

function getTagName(document, line) {
  try {
    const text = document.lineAt(line).text;
    const tagText = text.match(tagRex);
    if (tagText) {
      const tagName = tagText[0].split(' ')[0].substring(1);
      return tagName;
    }
  } catch (e) {}
  return '';  
}

function getSnippets(document, position, tagFilter) {
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
  }).filter(({tag}) => tagFilter ? !tag : true);
}

class CompletionsProvider {
  provideCompletionItems(document, position, token) {
    const tag = getTagName(document, position.line);

    if (tag) {      
      return (((completionsMap.get(tag) || {}).attributes || []).map(item => (
        Object.assign({}, item, { document, position })
      ))).concat(getSnippets(document, position, true));
    } else {
      return getSnippets(document, position, false);
    }
  }
  resolveCompletionItem(item, token) {
    const { document, position } = item;
    const range = document.getWordRangeAtPosition(position);
    const tag = getTagName(document, position.line);
    if (tag && item.insertText.value.charAt(0) === '<')
      item.insertText.value = item.insertText.value.slice(1);
    return item;
  }
}

exports.activate = activate;
module.exports['default'] = activate;
