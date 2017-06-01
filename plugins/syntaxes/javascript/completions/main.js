const abridge = require('../../../api/javascript/abridge.json');
const snippets = require('../snippets/javascript.json');
const objectCompletions = require('../../../api/javascript/Object.json');
const globalCompletions = require('../../../api/javascript/global.json');
const envCompletions = require('../../../api/javascript/env.json');
const consoleCompletions = require('../../../api/javascript/console.json');

let snippetsCompletions;

const registered = {
  Object: objectCompletions,
  console: consoleCompletions,
  abridge,
};

const registeredEntries = Object.keys(registered).map(key => {
  return {
    label: key,
    kind: monaco.languages.CompletionItemKind.Field,
  }
});

class SnippetString {
  constructor(str) {
    this.value = (typeof str) === 'string' ? str : str.join('\n');
  }
}

const abridgeProvideCompletionItems = (model, { column, lineNumber }) => {
  const modeId = model.getModeId();
  const prevText = model.getValueInRange({
    startColumn: column,
    endColumn: column - 1,
    startLineNumber: lineNumber,
    endLineNumber: lineNumber,
  });

  if (!snippetsCompletions) {
    snippetsCompletions = Object.keys(snippets).map(key => {
      const snippet = snippets[key];
      return {
        label: snippet.prefix,
        kind: window.monaco.languages.CompletionItemKind.Keyword,
        insertText: new SnippetString(snippet.body),
        documentation: snippet.description,
      };
    })
  }

  if (prevText === '.') {
    const prevWord = model.getWordAtPosition({
      column: column - 2,
      lineNumber,
    });
    if (prevWord) {
      let completions = {};
      if (Object.keys(registered).indexOf(prevWord.word) > -1) {
        completions = registered[prevWord.word].methods || registered[prevWord.word];
      }
      return [Object.assign({}, globalCompletions, completions)]
        .reduce((prev, curr) =>
          Object.keys(curr).map(k => {
            return Object.assign({}, curr[k], {
              label: k,
              kind: curr[k].kind || window.monaco.languages.CompletionItemKind.Method,
            })
          }).concat(prev)
        , []);
    }
  } else {
    return [{
      insertText: new SnippetString(`App({
  onLaunch(options) {
    $1
  },
  onShow() {

  },
  onHide() {

  }
})`),
      documentation: '使用 App 函数来生成一个程序实例',
      kind: monaco.languages.CompletionItemKind.Function,
      label: 'App',
    }, {
      insertText: new SnippetString(`Page({
  data: {
  },
  onLoad(options) {
    // 生命周期函数--监听页面加载
    $1
  },
  onReady() {
    // 生命周期函数--监听页面初次渲染完成

  },
  onShow() {
    // 生命周期函数--监听页面显示

  },
  onHide() {
    // 生命周期函数--监听页面隐藏

  },
  onUnload() {
    // 生命周期函数--监听页面卸载

  },
})`),
      documentation: '使用 Page 函数来生成一个页面实例',
      kind: monaco.languages.CompletionItemKind.Function,
      label: 'Page',
    }]
    .concat(snippetsCompletions)
    .concat(registeredEntries)
    .concat(envCompletions);
  };
}

module.exports = {
  provideCompletionItems: abridgeProvideCompletionItems,
  triggerCharacters: ['.'],
};