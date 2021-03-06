import { Event, EventEmitter } from './Event';
import Watcher from './watcher'; 
import { getConfiguration as getConf } from './configure';
import { getDiagnosticCollection } from './languages';
import Uri from '../editor/uri';

const emitter = new EventEmitter();

export const textDocuments = [];
export const uriMap = new Map();

window.textDocument = textDocuments;

export let type = 'tiny';
export let rootPath = '';
export const workspaceFolders = [];

export function getMainWorkspace() {
  return workspaceFolders[0];
}

export function onDidChangeConfiguration(callback, client, disposes) {
  Event.addGlobalListenerEvent('onDidChangeConfiguration', callback.bind(client));
  return {
    dispose: () => {
      Event.removeGlobalListener('onDidChangeConfiguration', callback);      
    }
  }
}

export function addTextDocument(textDocument) {
  textDocuments.push(textDocument);
  uriMap.set(textDocument.uri.toString(), textDocument);
}

export function openTextDocument(uri) {
  const textDocument = uriMap.get(uri.toString());
  return Promise.resolve(textDocument);
}

export function registerTaskProvider() {
  
}

export function onDidOpenTextDocument(callback, params, disposes) {
  const realCallback = (ret) => {
    const { textDocument } = ret;
    window.activeTextEditor = {
      document: textDocument,
    }
    return callback.bind(params)(textDocument);
  };

  Event.addGlobalListenerEvent('onDidOpenTextDocument', realCallback);
  if (textDocuments.length > 0) {
    textDocuments.forEach((item) => {
      window.activeTextEditor = {
        document: item,
      }  
      callback.bind(params)(item);
    })
  }

  return {
    dispose: () => {
      Event.removeGlobalListener('onDidOpenTextDocument', realCallback);
    }
  }
}

export function onDidCloseTextDocument(callback) {
  Event.addGlobalListenerEvent('onDidCloseTextDocument', callback);
}

export function onDidChangeTextDocument(callback, self) {
  Event.addGlobalListenerEvent('onDidChangeTextDocument', callback.bind(self));
}

export function onDidSaveTextDocument(callback) {
  // console.log(callback);  
  Event.addGlobalListenerEvent('onDidSaveTextDocument', callback);  
}

export function createFileSystemWatcher(conf) {
  return new Watcher(conf);
}

export function registerTextDocumentContentProvider(scheme, provider) {

}

export function didChangeConfiguration(callback, self) {
  Event.addGlobalListenerEvent('didChangeConfiguration', callback.bind(self));  
}

export function openProject(path) {
  if (rootPath !== path && workspaceFolders.indexOf(path) === -1) {
    const uri = new Uri('file', '', path);
    rootPath = path;
    workspaceFolders.push({
      uri,
      name: uri.fsPath,
      index: workspaceFolders.length,
    });
  }
}

export const getConfiguration = getConf;

export function setWorkspaceType (wtype) {
  type = wtype;
}
