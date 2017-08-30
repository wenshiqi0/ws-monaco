import * as convert from './convert';
import Promise from 'bluebird';

export default {
  createDiagnosticCollection: (id) => {
    console.log(id);
  },
  registerCompletionItemProvider: (id, client, trigger) => {
    monaco.languages.registerCompletionItemProvider(id, {
      triggerCharacters: [trigger],
      provideCompletionItems: (model, position, token) => {
        const textDocument = uriToDocument.get(model.uri);
        const pos = convert.toPosition(position);
        const ret = client.provideCompletionItems(textDocument, pos, token);
        if (!ret) {
          return;
        } else if (Array.isArray(ret)) {
          return {
            isIncomplete: false,
            items: ret.map(item => {
              return {
                ...item,
                range: null,
              }
            }),
          }
        } else {
          return ret.then((completionItems) => {
            return new Promise((resolve) => {
              resolve({
                isIncomplete: false,
                items: completionItems.map(item => {
                  return {
                    ...item,
                    range: null,
                  }
                }),
              })
            })
          })
        }
      }
    });
  },
  registerOnTypeFormattingEditProvider: () => {
    monaco.languages.registerOnTypeFormattingEditProvider.apply(this, arguments);    
  },
  registerDocumentRangeFormattingEditProvider: () => {
    monaco.languages.registerDocumentRangeFormattingEditProvider.apply(this, arguments);
  },
  registerHoverProvider: () => {
    monaco.languages.registerHoverProvider.apply(this, arguments);
  },
  registerDefinitionProvider: () => {
    monaco.languages.registerDefinitionProvider.apply(this, arguments);
  },
  registerDocumentHighlightProvider: () => {
    monaco.languages.registerDocumentHighlightProvider.apply(this, arguments);
  },
  registerReferenceProvider: () => {
    monaco.languages.registerReferenceProvider.apply(this, arguments);
  },
  registerDocumentSymbolProvider: () => {
    monaco.languages.registerDocumentSymbolProvider.apply(this, arguments);
  },
  registerSignatureHelpProvider: () => {
    monaco.languages.registerSignatureHelpProvider.apply(this, arguments);
  },
  registerRenameProvider: () => {
    monaco.languages.registerRenameProvider.apply(this, arguments);
  },
  registerCodeActionsProvider: () => {

  },
  registerImplementationProvider: () => {
    monaco.languages.registerImplementationProvider.apply(this, arguments);
  },
  registerTypeDefinitionProvider: () => {
    monaco.languages.registerTypeDefinitionProvider.apply(this, arguments);
  },
  registerWorkspaceSymbolProvider: () => {

  },
  registerCodeLensProvider: () => {
    monaco.languages.registerCodeLensProvider.apply(this, arguments);
  },
  setLanguageConfiguration: (id, configure) => {
    monaco.languages.setLanguageConfiguration(id, configure);
  }
}