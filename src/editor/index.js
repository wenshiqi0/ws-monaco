import { readFileSync } from 'fs';
import { join } from 'path';
import hook from './hook';
import editorOptions from './editorOptions';
import GrammarRegistry from './GrammarRegistry';
import { workspaceState } from './ExtensionContext';
import antMonaco, { extensions } from '../ant';
import Memento from '../ant/memento';
import Telemetry from '../ant/Telemetry';
import * as workspace from '../ant/workspace';
import Uri from './uri';
import '../ant/promise';

const { addExtension } = extensions;

global.languagesConfigure = {};
global.languagesMap = new Map();
global.subscriptions = [];

(function hookOriginalRequire() {
  const Module = require('module');
  const originalRequire = Module.prototype.require;
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

function scanExtensionsDir() {
  return [
    '/Users/munong/Documents/github/vscode/extensions/typescript',    
    '/Users/munong/Documents/github/vscode/extensions/javascript',
    '/Users/munong/Documents/github/vscode/extensions/css',
    '/Users/munong/Documents/github/vscode/extensions/less',
    '/Users/munong/Documents/github/vscode/extensions/scss',
    '/Users/munong/Documents/github/vscode/extensions/json',
    '/Users/munong/Documents/github/vscode/extensions/html',
    '/Users/munong/Documents/github/ant-monaco/extensions/schema',
    '/Users/munong/Documents/github/ant-monaco/extensions/nunjucks',
    '/Users/munong/Documents/github/ant-monaco/extensions/eslint'
  ];
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
  Object.keys(extension).forEach(key => {
    const { grammars, languages } = extension[key];

    if (grammars && languages) {
      grammars.forEach((grammar, i) => {
        const language = languages[i];

        languagesConfigure[grammar.scopeName] = join(extPath, grammar.path);
        languagesMap.set(language.id, Object.assign({}, language, grammar, { extPath }));

        addExtension(language.id, Object.assign({}, language, grammar));
        monaco.languages.register({
          id: language.id,
          extensions: Object.assign({}, language, grammar),
        })
      })
    }
  })
}

function start() {
  hook();

  const globalEditor = window.monaco.editor;

  // 定义编辑器的外观皮肤，目前实现有 dark 和 light
  globalEditor.defineTheme('tiny', {
    base: GrammarRegistry.getMode() === 'dark' ? 'vs-dark' : 'vs',
    inherit: true,
    rules: [], // 之后实际要复写这些rules的，所以干脆就传个空数组进去
    colors: GrammarRegistry.getDefaultColors(),
  });

  // 注册编辑器的皮肤
  globalEditor.setTheme('tiny');

  const extensions = scanExtensionsDir();
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
    const extMain = require(main);
    extMain.activate({
      subscriptions: global.subscriptions,
      extensionPath: extensions[index],
      workspaceState: new Memento(),
      globalState: new Memento(),
      storagePath: '',
      asAbsolutePath: (relative) => join(extensions[index], relative),
    });
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

  Uri,
}