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
    '/Users/munong/Documents/github/vscode/extensions/javascript',
    '/Users/munong/Documents/github/vscode/extensions/typescript',
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
        languagesMap.set(language.id, Object.assign({}, language, grammar));

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

  const extensions = scanExtensionsDir();
  const scripts = [];

  extensions.forEach(ext => {
    const packageJson = readJson(join(ext, 'package.json'));
    if (packageJson.contributes && packageJson.contributes.languages) {
      registerLanguageConf(ext, packageJson);
    }
    if (packageJson.main)
      scripts.push(join(ext, packageJson.main));
  })

  scripts.forEach((script, i) => {
    const extMain = require(script);
    extMain.activate({
      subscriptions: global.subscriptions,
      extensionPath: extensions[i],
      workspaceState: new Memento(),
      globalState: new Memento(),
      storagePath: '',
      asAbsolutePath: (relative) => join(extensions[i], relative),
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
}