import { Registry, INITIAL } from 'vscode-textmate';
import { join } from 'path';
import * as theme from './theme';

// language configs
const jsConfig = require('../extensions/syntaxes/javascript/javascript-language-configuration.json');
const cssConfig = require('../extensions/syntaxes/css/language-configuration.json');
const jsonConfig = require('../extensions/syntaxes/json/language-configuration.json');
const htmlConfig = require('../extensions/syntaxes/html/language-configuration.json');

let mode = 'light';

const generateTokensCSSForColorMap = (colorMap) => {
  const rules = [];
  for (let i = 1, len = colorMap.length; i < len; i += 1) {
    const color = colorMap[i];
    rules[i] = `.mtk${i} { color: ${color.toString()}; }`;
  }
  rules.push('.mtki { font-style: italic; }');
  rules.push('.mtkb { font-weight: bold; }');
  rules.push('.mtku { text-decoration: underline; }');
  return rules.join('\n');
}

const rebuildMtkColors = (cssRules) => {
  const head = document.head;
  const tokensColor = document.createElement('style');
  tokensColor.innerHTML = `${cssRules}`;
  head.appendChild(tokensColor);
  return true;
};

const globalLanguageMap = {
  javascript: {
    scope: 'source.js',
    config: jsConfig,
    extensions: ['.js', '.jsx'],
  },
  css: {
    scope: 'source.css',
    config: cssConfig,
    extensions: ['.acss', '.css'],
  },
  json: {
    scope: 'source.json',
    config: jsonConfig,
    extensions: [
      '.json',
      '.bowerrc',
      '.jshintrc',
      '.jscsrc',
      '.eslintrc',
      '.babelrc',
      '.webmanifest',
    ],
  },
  html: {
    scope: 'text.html.basic',
    config: htmlConfig,
    extensions: [
      '.axml',
      '.html',
    ],
  },
};

const buildCompletionItemProvider = (languageId) => {
  switch (languageId) {
    case 'javascript':
      return jsCompletionItemProvider;
    default:
      return [];
  }
};

const jsCompletionItemProvider = [
  {
    triggerCharacters: [/^[a-zA-Z]/],
    provideCompletionItems: () => {
      return [{
        label: 'abridge',
        kind: window.monaco.languages.CompletionItemKind.Field,
      }, {
        insertText: 'App({\n  onLaunch: function () {\n    {{String1}}\n  },\n  onShow: function () {\n    {{String2}}\n  },\n  onHide: function () {\n    {{String3}}\n  },\n  onError: function (msg) {\n    {{String4}}\n  }\n})',
        documentation: '使用 App 函数来生成一个程序实例',
        kind: monaco.languages.CompletionItemKind.Function,
        label: 'App',
      }, {
        insertText: 'Page({\n  data:{\n    {{String1}}\n  },\n  onLoad:function(options){\n    // 生命周期函数--监听页面加载\n    {{String2}}\n  },\n  onReady:function(){\n    // 生命周期函数--监听页面初次渲染完成\n    {{String3}}\n  },\n  onShow:function(){\n    // 生命周期函数--监听页面显示\n    {{String4}}\n  },\n  onHide:function(){\n    // 生命周期函数--监听页面隐藏\n    {{String5}}\n  },\n  onUnload:function(){\n    // 生命周期函数--监听页面卸载\n    {{String6}}\n  },\n  onPullDownRefresh: function() {\n    // 页面相关事件处理函数--监听用户下拉动作\n    {{String7}}\n  },\n  onReachBottom: function() {\n    // 页面上拉触底事件的处理函数\n    {{String8}}\n  },\n  onShareAppMessage: function() {\n    // 用户点击右上角分享\n    return {\n      title: \'{{title}}\', // 分享标题\n      desc: \'{{desc}}\', // 分享描述\n      path: \'{{path}}\' // 分享路径\n    }\n  }\n})',
        documentation: '使用 Page 函数来生成一个页面实例',
        kind: monaco.languages.CompletionItemKind.Function,
        label: 'Page',
      }];
    },
  },
];

// grammar registry
const GrammarRegistry = class {
  constructor(scopeRegistry) {
    this.scopeRegistry = scopeRegistry;
    this.injections = {};
    this.embeddedLanguages = [];
    this.registry = new Registry({
      getFilePath: (scopeName) => {
        return this.scopeRegistry[scopeName];
      },
      getInjections: (scopeName) => {
        return this.injections[scopeName];
      },
      theme: theme[mode].theme,
    });
  }

  getRegistry() {
    return this.registry;
  }

  getScopeRegistry() {
    return this.scopeRegistry;
  }

  getEmbeddedLanguages() {
    return this.embeddedLanguages;
  }

  pushLanguageEmbedded(languageId) {
    this.embeddedLanguages.push(languageId);
    return this.embeddedLanguages.length;
  }

  updateTheme(name) {
    this.registry.setTheme({ name, settings: theme[mode].tokens });
  }

  reloadTheme(themeMode) {
    if (mode) mode = themeMode;
    const cssRules = generateTokensCSSForColorMap(this.registry.getColorMap());
    rebuildMtkColors(cssRules);
  }

  static loadGrammar({ registry, languageId }) {
    return new Promise((resolve, reject) => {
      if (registry.getEmbeddedLanguages().indexOf(languageId) > -1) resolve({ languageId: null });
      else {
        // Id index map to language. vscode-textmate does not use index 0.
        const id = registry.pushLanguageEmbedded(languageId);
        registry.getRegistry().loadGrammarWithEmbeddedLanguages(
          globalLanguageMap[languageId].scope,
          id,
          null,
          (err, grammar) => {
            if (err) {
              return reject(err);
            }
            resolve({
              languageId,
              grammar,
              containsEmbeddedLanguages: registry.getEmbeddedLanguages(),
            });
          });
      }
    });
  }

  static registerLanguage({ languageId, grammar }) {
    return new Promise((resolve) => {
      if (!languageId) resolve(false);
      const languages = window.monaco.languages;
      languages.register({
        id: languageId,
        extensions: globalLanguageMap[languageId].extensions,
      });
      languages.setLanguageConfiguration(languageId, globalLanguageMap[languageId].config);
      languages.setTokensProvider(languageId, {
        getInitialState: () => {
          return INITIAL;
        },
        tokenize2: (line, state) => {
          const rule = grammar.tokenizeLine2(line, state);
          const ruleStack = rule.ruleStack;
          return {
            tokens: rule.tokens,
            endState: ruleStack,
          };
        },
      });
      const providers = buildCompletionItemProvider(languageId);

      providers.forEach((provider) => {
        languages.registerCompletionItemProvider(languageId, provider);
      });

      resolve({ languageId, grammar });
    });
  }

  static getDefaultColors() {
    return theme[mode].defaultColors;
  }
}

const getDefaultRegistry = (rootDir) => {
  const nodeDir = 'node_modules/ant-monaco';
  return new GrammarRegistry({
    'source.js': join(rootDir, nodeDir, 'extensions/syntaxes/javascript/syntaxes/JavaScript.tmLanguage.json'),
    'source.css': join(rootDir, nodeDir, 'extensions/syntaxes/css/syntaxes/css.tmLanguage.json'),
    'source.json': join(rootDir, nodeDir, 'extensions/syntaxes/json/syntaxes/JSON.tmLanguage.json'),
    'text.html.basic': join(rootDir, nodeDir, 'extensions/syntaxes/html/syntaxes/html.tmLanguage.json'),
  });
}

module.exports = {
  getDefaultRegistry,
  GrammarRegistry,
}
