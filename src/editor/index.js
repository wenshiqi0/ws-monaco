import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import hook from './hook';
import editorOptions from './editorOptions';
import GrammarRegistry from './GrammarRegistry';
import { workspaceState } from './ExtensionContext';
import antMonaco, { extensions } from '../ant';
import Memento from '../ant/memento';
import Telemetry from '../ant/Telemetry';
import * as workspace from '../ant/workspace';
import { updateConfiguration } from '../ant/configure';
import Uri from './uri';
import registerSnippets from '../ant/snippets';
import '../ant/promise';

const { addExtension } = extensions;

let originalRequire;

global.languagesConfigure = {};
global.languagesMap = new Map();
global.subscriptions = [];
global.idePath = "";

(function hookOriginalRequire() {
  const Module = require('module');
  originalRequire = Module.prototype.require;
  Module.prototype.require = function() {
    if (arguments[0] === 'vscode') {
      return antMonaco;
    } else if (arguments[0] === 'vscode-extension-telemetry') {
      return { default: Telemetry };
    } else {
      return originalRequire.apply(this, arguments);
    }
  };
})()

function buildInExtensionsDir() {
  const ret = [];
  const extensions = readdirSync(join(__dirname, '../out/'));
  extensions.forEach(ext => {
    const dict = join(__dirname, '../out/', ext);
    /*
    if (ext === 'emmet')
      ret.push('/Users/munong/Documents/github/vscode/extensions/emmet');
    else if (statSync(dict).isDirectory())
    */
    if (statSync(dict).isDirectory())
      ret.push(dict);
  })
  return ret;
}

function readJson(path) {
  const blob = readFileSync(path, 'utf-8');
  return JSON.parse(blob);
}

function readScript(path) {
  return readFileSync(path, 'utf-8');
}

function initEditorTheme() {
  GrammarRegistry.setMode('dark');
}

function registerLanguageConf(extPath, extension) {
  Object.keys(extension).forEach((key) => {
    const { grammars, languages, snippets } = extension[key];

    if (grammars && languages) {
      grammars.forEach((grammar, i) => {
        const language = languages[i];
        languagesConfigure[grammar.scopeName] = join(extPath, grammar.path);
        languagesMap.set(language.id, Object.assign({}, language, grammar, { extPath, index: countLanguage }));

        addExtension(language.id, Object.assign({}, language, grammar));
        monaco.languages.register({
          id: language.id,
          extensions: Object.assign({}, language, grammar),
        })
        countLanguage++;
      })
    }

    registerSnippets(extPath, snippets);
  })
}

let countLanguage = 1;

function start(idePath, theme) {
  global.idePath = idePath;

  hook();

  const globalEditor = window.monaco.editor;  
  // 定义编辑器的外观皮肤，目前实现有 dark 和 light
  GrammarRegistry.setMode(theme || 'dark');    
  globalEditor.defineTheme('tiny', {
    base: theme === 'dark' ? 'vs-dark' : 'vs',
    inherit: true,
    rules: [], // 之后实际要复写这些rules的，所以干脆就传个空数组进去
    colors: GrammarRegistry.getDefaultColors(),
  });

  // 注册编辑器的皮肤
  globalEditor.setTheme('tiny');

  const extensions = buildInExtensionsDir();
  const scripts = [];

  extensions.forEach((ext, index) => {
    const packageJson = readJson(join(ext, 'package.json'));
    if (packageJson.contributes && packageJson.contributes.languages) {
      registerLanguageConf(ext, packageJson);
    }
    if (packageJson.main)
      scripts.push({
        main: join(ext, packageJson.main),
        index,
      });
  })

  scripts.forEach(({ main, index }) => {
    try {
      const extMain = originalRequire(main);
      extMain.activate({
        subscriptions: global.subscriptions,
        extensionPath: extensions[index],
        workspaceState: new Memento(),
        globalState: new Memento(),
        storagePath: '',
        asAbsolutePath: (relative) => join(extensions[index], relative),
      }); 
    } catch (e) { console.error(e) }
  })
}

function openProject(path) {
  workspace.openProject(path);
}

module.exports = {
  start,
  openProject,
  editorOptions,
  GrammarRegistry,
  updateConfiguration,
  setWorkspaceType: workspace.setWorkspaceType,

  Uri,
}