import { readFileSync } from 'fs';
import { join } from 'path';
import editorOptions from './editorOptions';
import GrammarRegistry from './GrammarRegistry';
import ExtensionContext from './ExtensionContext';
import antMonaco, { extensions } from '../ant';

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
    } else {
      return originalRequire.apply(this, arguments);
    }
  };
})()

function scanExtensionsDir() {
  return ['/Users/munong/Documents/github/ant-monaco/extesions/typescript'];
}

function readJson(path) {
  const blob = readFileSync(path, 'utf-8');
  return JSON.parse(blob);
}

function readScript(path) {
  return readFileSync(path, 'utf-8');
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
      })
    }
  })
}

function start() {
  const extensions = scanExtensionsDir();
  const scripts = [];

  extensions.forEach(ext => {
    const packageJson = readJson(join(ext, 'package.json'));
    if (packageJson.contributes && packageJson.contributes.languages) {
      registerLanguageConf(ext, packageJson);
    }
    scripts.push(join(ext, packageJson.main));
  })

  const registry = new GrammarRegistry(languagesConfigure);

  scripts.forEach((script, i) => {
    const extMain = require(script);
    extMain.activate({
      subscriptions: global.subscriptions,
      extensionPath: extensions[i],
      storagePath: '',
    });
  })
}

module.exports = {
  start,
  editorOptions,
  GrammarRegistry,
}