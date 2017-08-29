import { ipcRenderer as ipc } from 'electron';
import { Registry, INITIAL } from 'vscode-textmate';
import Promise from 'bluebird';
import * as theme from './theme';

// Editor theme.
let mode = 'light';

/**
 * Prepare the html style string from the token color map.
 * 
 * @param {Object} colorMap <key, value> map
 * @return A html style string.
 */
function generateTokensCSSForColorMap(colorMap) {
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

/**
 * Rewrite the css rules on monaco style node.
 * 
 * @param {string} cssRules 
 * @return true
 */
function rebuildMtkColors(cssRules) {
  const head = document.head;
  const tokensColor = document.createElement('style');
  tokensColor.innerHTML = `${cssRules}`;
  head.appendChild(tokensColor);
  return true;
};

// grammar registry
export default class GrammarRegistry {
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

  /**
   * @return get monaco registry
   */
  getRegistry() {
    return this.registry;
  }

  /**
   * @return 
   */
  getScopeRegistry() {
    return this.scopeRegistry;
  }

  /**
   * @return an array with all embedded languages.
   */
  getEmbeddedLanguages() {
    return this.embeddedLanguages;
  }
 
  /**
   * register a langauge and make a language for it.
   * 
   * @param {string} languageId 
   */
  pushLanguageEmbedded(languageId) {
    this.embeddedLanguages.push(languageId);
    return this.embeddedLanguages.length;
  }

  /**
   * Set the tokens colors into vscode-textmate registry.
   * 
   * @param {string} name 
   */
  updateTheme(name) {
    this.registry.setTheme({ name, settings: theme[mode].tokens });
  }

  /**
   * This is a much hack method, it set tokens into vscode-textmate and rewrite the css of minaco,
   * because there is some difference between vscode-textmate and monaco.
   * Need to make it better.
   * 
   * @param {string} name 
   */
  reloadTheme(name) {
    this.updateTheme(name);
    const cssRules = generateTokensCSSForColorMap(this.registry.getColorMap());
    rebuildMtkColors(cssRules);
  }

  /**
   * Set the editor instance to current context.
   * 
   * @param {Moanco.Editor} editor
   */
  setCurrentEditor(editor) {
    this.editor = editor;
  }

  /**
   * @return the current editor instance.
   */
  getCurrentEditor() {
    return this.editor;
  }

  /**
   * @return then current Model instance.
   */
  getCurrentModel() {
    return this.editor.getModel();
  }

  /**
   * 
   * @param {*} owner 
   * @param {Array<any>} markers An array with Monaco markers.
   */
  setCurrentModelMarkers(owner, markers) {
    const model = this.getCurrentModel();
    window.monaco.editor.setModelMarkers(model, owner, markers);
  }

  activateExtensions() {
    // hook the createMoldel and setValue function
    const originalCreateModel = window.monaco.editor.createModel;
    window.monaco.editor.createModel = (value, language, uri) => {
      const model = (originalCreateModel.bind(window.monaco.editor))(value, language, uri);

      model.queue = new FlushQueue(model, 'ant-monaco:updateModel');
      if (language && uri) {
        Event.dispatchGlobalEvent('onInitDocument', {
          uri, language, 
          eol: model.getEOL(),
          version: model.getVersionId(),
          lines: model.getLinesContent(),
        });
      }
      const originalSetValue = model.setValue;

      // Hook setValue method.
      // While doing this will also change the value in the mirror model. 
      model.setValue = (value) => {
        if (!value && value !== '') return;
        Event.dispatchGlobalEvent('onInitDocument', {
          uri, language, 
          eol: model.getEOL(),
          version: model.getVersionId(),
          lines: model.getLinesContent(),
        });
        return (originalSetValue.bind(model))(value);
      }

      // flush the change of model values
      model.onDidChangeContent((event) => {
        if (event)
          Event.dispatchGlobalEvent('onDidChangeContent', { model, event });
        model.queue.cache(event);
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

  static setMode(themeMode) {
    mode = themeMode;
  }

  static loadGrammar({ registry, languageId }) {
    const language = global.languagesMap.get(languageId);    

    return new Promise((resolve, reject) => {
      if (registry.getEmbeddedLanguages().indexOf(languageId) > -1) resolve({ languageId: null });
      else if (language) resolve({ languageId: 'plaintext' });
      else {
        // Id index map to language. vscode-textmate does not use index 0.
        const id = registry.pushLanguageEmbedded(languageId);
        registry.getRegistry().loadGrammarWithEmbeddedLanguages(
          language.scopeName,
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

  static registerLanguage({ languageId, grammar }){
    const language = global.languagesMap.get(languageId);    

    return new Promise((resolve) => {
      if (!languageId) return resolve(false);
      if (languageId === 'plaintext') return resolve({ languageId, grammar: null });
      const languages = window.monaco.languages;
      languages.register({
        id: languageId,
        extensions: language.extensions,
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

  static getDefaultColors() {
    return theme[mode].defaultColors;
  }
}