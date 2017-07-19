import { ipcRenderer as ipc } from 'electron';
import { join } from 'path';
import { wireCancellationToken } from '../../utils';
import abridgeInsert from './../../../api/javascript/abridge.json';

const prefix = 'internal://tea';

export const activate = (registry, monaco) => {
  const languages = monaco.languages;
  const editor = monaco.editor;

  languages.registerCompletionItemProvider('javascript', {
    triggerCharacters: ['.'],
    provideCompletionItems: (model, position, token) => {
      const handler = 'javascript:getCompletionsAtPosition';
      return new Promise((resolve, reject) => {
        wireCancellationToken(handler, token, reject);
        ipc.once(handler, (event, args) => {
          resolve(args);
        });
        ipc.send(handler, { position, uri: model.uri, offset: model.getOffsetAt(position) });
      })
    },
    resolveCompletionItem: (item, token) => {
      const handler = 'javascript:resolveCompletionItem';
      const position = item.position;
      const model = monaco.editor.getModel(item.uri);
      return new Promise((resolve, reject) => {
        wireCancellationToken(handler, token, reject);
        ipc.once(handler, (event, args) => {
          const ret = args ? args : item;
          const insertText = (abridgeInsert[item.label] || {}).insertText;
          if (insertText)
            ret.insertText = insertText;
          resolve(ret);
        });
        ipc.send(handler, { position, uri: item.uri, offset: model.getOffsetAt(position), entry: item.label });
      })
    }
  });

  languages.registerSignatureHelpProvider('javascript', {
    signatureHelpTriggerCharacters: ['(', ','],
    provideSignatureHelp: (model, position, token) => {
      const handler = 'javascript:provideSignatureHelp';
      return new Promise((resolve, reject) => {
        wireCancellationToken(handler, token, reject);
        ipc.once(handler, (event, args) => {
          resolve(args);
        });
        ipc.send(handler, { position, uri: model.uri, offset: model.getOffsetAt(position) });
      })
    },
  });

  languages.registerHoverProvider('javascript', {
    provideHover: (model, position, token) => {
      const handler = 'javascript:provideHover';
      return new Promise((resolve, reject) => {
        wireCancellationToken(handler, token, reject);
        ipc.once(handler, (event, args) => {
          if (!args) return resolve();
          const { textSpan, contents } = args;
          resolve({
            contents,
            range: textSpanToRange(model, textSpan),
          });
        });
        ipc.send(handler, { position, uri: model.uri, offset: model.getOffsetAt(position) });
      })
    }
  });

  languages.registerDocumentFormattingEditProvider('javascript', {
    provideDocumentFormattingEdits: (model, options, token) => {
      const handler = 'javascript:provideDocumentFormattingEdits';
      return new Promise((resolve, reject) => {
        wireCancellationToken(handler, token, reject);
        ipc.once(handler, (event, args) => {
          resolve(args.map(edit => convertTextChanges(model, edit)));
        });
        ipc.send(handler, { uri: model.uri, options });
      });
    }
  })

  languages.registerDocumentRangeFormattingEditProvider('javascript', {
    provideDocumentRangeFormattingEdits: (model, range, options, token) => {
      const handler = 'javascript:provideDocumentRangeFormattingEdits';
      const offsetStart = model.getOffsetAt({ lineNumber: range.startLineNumber, column: range.startColumn });
      const offsetEnd = model.getOffsetAt({ lineNumber: range.endLineNumber, column: range.endColumn });
      return new Promise((resolve, reject) => {
        wireCancellationToken(handler, token, reject);
        ipc.once(handler, (event, args) => {
          resolve(args.map(edit => convertTextChanges(model, edit)));
        });
        ipc.send(handler, { uri: model.uri, options, offsetStart, offsetEnd });
      });
    }
  })
}

function textSpanToRange(model, span) {
  const uri = model.uri;
  let p1 = model.getPositionAt(span.start);
  let p2 = model.getPositionAt(span.start + span.length);

  let { lineNumber: startLineNumber, column: startColumn } = p1;
  let { lineNumber: endLineNumber, column: endColumn } = p2;
  return { startLineNumber, startColumn, endLineNumber, endColumn };
}

function convertTextChanges(model, change) {
  const uri = model.uri;
  return {
    text: change.newText,
		range: textSpanToRange(model, change.span),
	};
}