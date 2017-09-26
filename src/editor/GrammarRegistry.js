import { ipcRenderer as ipc } from 'electron';
import { Registry, INITIAL } from 'vscode-textmate';
import Promise from 'bluebird';
import * as theme from './theme';

// Editor theme.
let mode = 'dark';

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
    this.scopeRegistry = scopeRegistry || global.languagesConfigure;
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
   * set theme mode.
   * 
   * @param {"dark" | "light"} themeMode 
   */
  static setMode(themeMode) {
    mode = themeMode;
  }

  /**
   * get theme mode.
   * 
   * @return {"dark" | "light"} themeMode 
   */
  static getMode() {
    return mode;
  }

  /**
   * lazy load a language.
   * 
   * @param {Object} language detail
   */
  static loadGrammar({ registry, languageId }) {
    const language = global.languagesMap.get(languageId);
    return new Promise((resolve, reject) => {
      if (registry.getEmbeddedLanguages().indexOf(languageId) > -1) resolve({ languageId: null });
      else if (!language) resolve({ languageId: 'plaintext' });
      else {
        // Id index map to language. vscode-textmate does not use index 0.
        registry.pushLanguageEmbedded(languageId);
        const { index } = languagesMap.get(languageId);
        registry.getRegistry().loadGrammarWithEmbeddedLanguages(
          language.scopeName,
          index + 1,
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

  /**
   * set grammar token provider for vscode-textmate.
   * 
   * @param {Object} param language detail
   */
  static registerLanguage({ languageId, grammar }){
    const language = global.languagesMap.get(languageId);
    return new Promise((resolve) => {
      if (!languageId) return resolve(false);
      if (languageId === 'plaintext') return resolve({ languageId, grammar: null });
      const languages = window.monaco.languages;
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