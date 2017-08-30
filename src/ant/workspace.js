import { Disposable } from './class.d';
import { Event } from './Event';
import Watcher from './watcher'; 
import { getConfiguration as getConf } from './configure';

export const textDocuments = [];

export function onDidChangeConfiguration(callback) {
  Event.addGlobalListenerEvent('onDidChangeConfiguration', callback);
}

export function onDidOpenTextDocument(callback) {
  const realCallback = ({ textDocument }) => {
    console.log('[event] onDidOpenTextDocument');
    textDocuments.push(textDocument);
    callback(textDocument);
  };

  Event.addGlobalListenerEvent('onDidOpenTextDocument', realCallback);
  return new Disposable(() => {
    Event.removeGlobalListener('onDidOpenTextDocument', realCallback);
  });
}

export function onDidCloseTextDocument(callback) {
  Event.addGlobalListenerEvent('onDidCloseTextDocument', callback);
}

export function onDidChangeTextDocument(callback) {
  Event.addGlobalListenerEvent('onDidChangeTextDocument', callback);
}

export function createFileSystemWatcher(conf) {
  return new Watcher(conf);
}

export const getConfiguration = getConf;
