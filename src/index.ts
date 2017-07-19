// electron
import { ipcRenderer as ipc } from 'electron';

// interface
import { IGrammarRegistry, Global } from './index.d';
import { Registry, INITIAL } from 'vscode-textmate';
import { join } from 'path';
import { activate as activateJs } from '../plugins/syntaxes/javascript/src/index';
import { activate as activateEslint } from '../plugins/syntaxes/eslint/src/index';
import { activate as activateCss } from '../plugins/syntaxes/css/src/index';
import * as theme from './theme';

// ensure monaco is on the global window
declare const window: Global;
declare const __dirname: string;

// language configs
const jsConfig = require('../plugins/syntaxes/javascript/js-configuration');
const cssConfig = require('../plugins/syntaxes/css/language-configuration.css.json');
const lessConfig = require('../plugins/syntaxes/css/language-configuration.less.json');
const jsonConfig = require('../plugins/syntaxes/json/language-configuration');
const axmlConfig = require('../plugins/syntaxes/axml/language-configuration.json');
const nunjucksConfig = require('../plugins/syntaxes/nunjucks/nunjucks.configuration.json');
const schemaConfig = require('../plugins/syntaxes/fengdie/language-configuration.json')

const completionsHelp = require('../plugins/syntaxes/axml/completions/main');

let mode = 'light';

const generateTokensCSSForColorMap = (colorMap: any[]) => {
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

const rebuildMtkColors = (cssRules: string) => {
  const head = document.head;
  const tokensColor = document.createElement('style');
  tokensColor.innerHTML = `${cssRules}`;
  head.appendChild(tokensColor);
  return true;
};

const globalLanguageMap: any = {
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
  less: {
    scope: 'source.css.less',
    config: lessConfig,
    extensions: ['.less'],
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
  axml: {
    scope: 'text.axml.basic',
    config: axmlConfig,
    extensions: [
      '.axml',
      '.xml'
    ],
  },
  nunjucks: {
    scope: 'text.html.nunjucks',
    config: nunjucksConfig,
    extensions: [
      '.html',
      '.njk',
      '.nunjucks',
    ]
  },
  fengdie: {
    scope: 'source.schema',
    config: schemaConfig,
    extensions: [
      '.schema'
    ]
  },
  default: 'plaintext'
};

// grammar registry
class GrammarRegistry implements IGrammarRegistry {
  private scopeRegistry: any;
  private injections: any;
  private embeddedLanguages: string[];
  private registry: Registry;
  private editor: any;
  private currentModel: any;

  constructor(scopeRegistry: any) {
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

  getRegistry(): Registry {
    return this.registry;
  }

  getScopeRegistry(): any {
    return this.scopeRegistry;
  }

  getEmbeddedLanguages(): string[] {
    return this.embeddedLanguages;
  }
 
  pushLanguageEmbedded(languageId: string): Number {
    this.embeddedLanguages.push(languageId);
    return this.embeddedLanguages.length;
  }

  updateTheme(name: string) {
    this.registry.setTheme({ name, settings: theme[mode].tokens });
  }

  reloadTheme(name: string) {
    this.updateTheme(name);
    const cssRules: string = generateTokensCSSForColorMap(this.registry.getColorMap());
    rebuildMtkColors(cssRules);
  }

  setCurrentEditor(editor: any) {
    this.editor = editor;
  }

  getCurrentEditor(): any {
    return this.editor;
  }

  getCurrentModel(): any {
    return this.editor.getModel();
  }

  setCurrentModelMarkers(owner: string, markers: any) {
    const model = this.getCurrentModel();
    window.monaco.editor.setModelMarkers(model, owner, markers);
  }

  activateExtensions() {
    // hook the createMoldel and setValue function
    const originalCreateModel = window.monaco.editor.createModel;
    window.monaco.editor.createModel = (value, language, uri) => {
      const model = originalCreateModel(value, language, uri);
      if (language && uri) {
        ipc.send('ant-monaco:createOrUpdateModel', { value, language, uri, version: model._versionId.toString() });
      }
      const originalSetValue = model.setValue;
      model.setValue = (value) => {
        if (!value && value !== '') return;
        ipc.send('ant-monaco:createOrUpdateModel', { value, uri, language, version: model._versionId.toString() });
        return originalSetValue(value);
      }
      model.onDidChangeContent(() => {
        ipc.send('ant-monaco:createOrUpdateModel', {
          value: model.getValue(),
          uri: model.uri, language,
          version: model._versionId.toString() 
        });
      })
      return model;
    }

    // activate language features
    activateJs(this, window.monaco);
    activateEslint(this, window.monaco);
    activateCss(this, window.monaco);
  }

  static activateCompletionItems(modeId) {
    const languages = window.monaco.languages;
    if (modeId === 'axml') {
      languages.registerCompletionItemProvider(modeId, completionsHelp);
    }
  }

  static setMode(themeMode: string) {
    mode = themeMode;
  }

  static loadGrammar({ registry, languageId }): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (registry.getEmbeddedLanguages().indexOf(languageId) > -1) resolve({ languageId: null });
      else if (!globalLanguageMap[languageId]) resolve({ languageId: globalLanguageMap.default });
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

  static registerLanguage({ languageId, grammar }): Promise<any> {
    return new Promise<any>((resolve) => {
      if (!languageId) return resolve(false);
      if (languageId === 'plaintext') return resolve({ languageId, grammar: null });
      const languages = window.monaco.languages;
      languages.register({
        id: languageId,
        extensions: globalLanguageMap[languageId].extensions,
      });
      languages.setLanguageConfiguration(languageId, globalLanguageMap[languageId].config);
      GrammarRegistry.activateCompletionItems(languageId);
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
      resolve({ languageId, grammar });
    });
  }

  static getDefaultColors(): Promise<any> {
    return theme[mode].defaultColors;
  }
}

const getDefaultRegistry = () => {
  return new GrammarRegistry({
    'source.js': join(__dirname, 'syntaxes/JavaScript.tmLanguage.json'),
    'source.css': join(__dirname, 'syntaxes/css.tmLanguage.json'),
    'source.css.less': join(__dirname, 'syntaxes/less.tmLanguage.json'),
    'source.json': join(__dirname, 'syntaxes/JSON.tmLanguage'),
    'source.schema': join(__dirname, 'syntaxes/schema.tmLanguage.json'),
    'text.axml.basic': join(__dirname, 'syntaxes/axml.tmLanguage.json'),
    'text.html.nunjucks': join(__dirname, 'syntaxes/nunjucks.tmLanguage')
  });
}

const editorOptions = {
  folding: true,
  fontSize: 12,
  tabSize: 2,
  parameterHints: true,
  autoClosingBrackets: true,
  renderWhitespace: 'none',
  wordWrap: 'off',
  cursorStyle: 'line',
  fontFamily: "Menlo, Monaco, 'Courier New', monospace",
  scrollbar: {
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
  },
  renderIndentGuides: true,
  insertSpaces: true,
  detectIndentation: true,
  quickSuggestionsDelay: 10,
  minimap: {
    enabled: false,
  }
};

module.exports = {
  getDefaultRegistry,
  GrammarRegistry,
  editorOptions,
}
