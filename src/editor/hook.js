import TextDocument from './TextDocument';
import Uri from './Uri';
import { Event } from '../ant/Event';

global.uriToDocument = new Map();

export default function hook() {
  const originalCreateModel = window.monaco.editor.createModel;
  const originalCreate = window.monaco.editor.create;

  window.monaco.editor.createModel = (value, language, path) => {
    const uri = new Uri('file', '', path);
    const splited = path.split('/');
    const filename = splited[splited.length - 1];
    const textDocument = new TextDocument(value, uri, filename, language, 0, '\n');

    uriToDocument.set(uri.toString(), textDocument);

    Event.dispatchGlobalEvent('onDidOpenTextDocument', { textDocument });
    return originalCreateModel(value, language, uri.toString());    
  }

  window.monaco.editor.creat = (dom, options, override) => {
    return originalCreate(dom, options, override);
  }
}