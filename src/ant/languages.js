import Promise from 'bluebird';
import * as convert from './convert';
import { score } from './languageSelector';
import { DiagnosticCollection } from './diagnostic';
import { Event } from './Event';
import { getContentChangePromise } from '../editor/hook';

async function delay(ms) {
  return new Promise(resolve => {
    setTimeout(function() {
      resolve();
    }, ms || 0);
  })
}

function handleLanguageId(ids) {
  return ids.map((id) => {
    switch (typeof id) {
      case 'object':
        return id.language;
      default:
        return id;
    }
  })
}

const _collections = []

export default {
  match: (selector, document) => {
    return score(selector, document.uri, document.languageId);    
  },
  createDiagnosticCollection: (id) => {
    const result = new class extends DiagnosticCollection {
      constructor() {
        super(id);
        _collections.push(this);
      }
      dispose() {
        super.dispose();
        let idx = _collections.indexOf(this);
        if (idx !== -1) {
          _collections.splice(idx, 1);
        }
      }
    };
    return result;
  },
  registerCompletionItemProvider: (id, client, trigger) => {
    monaco.languages.registerCompletionItemProvider(handleLanguageId(id), {
      triggerCharacters: [trigger],
      provideCompletionItems: async (model, position, token) => {
        // For bufferSupport to sync textDocuments.
        await delay();
        const pos = convert.toPosition(position);        
        const textDocument = uriToDocument.get(model.uri);
        const args = await client.provideCompletionItems(textDocument, pos, token);
        return {
          isIncomplete: Array.isArray(args) ? false : args.isIncomplete,
          items: (Array.isArray(args) ? args : args.items).map(item => {
            item.range = item.range ? convert.fromRange(item.range) : null;
            return item;
          })
        };
      },
      resolveCompletionItem: (item, token) => {
        if (!client.resolveCompletionItem) return item;
        return client.resolveCompletionItem(item, token);
      }
    });
  },
  registerOnTypeFormattingEditProvider: (id, client) => {

  },
  registerDocumentRangeFormattingEditProvider: (id, client) => {
    monaco.languages.registerDocumentRangeFormattingEditProvider(handleLanguageId(id), {
      provideDocumentRangeFormattingEdits: async (model, range, options, token) => {
        const textDocument = uriToDocument.get(model.uri);
        const args = await client.provideDocumentRangeFormattingEdits(textDocument, convert.toRange(range), options, token);
        return args.map(textEdit => {
          return convert.TextEdit.from(textEdit);
        });
      }
    });
  },
  registerHoverProvider: (id, client) => {
    monaco.languages.registerHoverProvider(handleLanguageId(id), {
      provideHover: (model, position, token) => {
        const textDocument = uriToDocument.get(model.uri);
        return client.provideHover(textDocument, convert.toPosition(position), token);
      }
    });
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
  registerColorProvider: () => {

  },
  setLanguageConfiguration: (id, configure) => {
    if (unknownLanguages.indexOf(id) > -1) return;
    monaco.languages.setLanguageConfiguration(id, configure);
  }
}

Event.addGlobalListenerEvent('setEntriesMarkers', entries => {
  entries.forEach(function(entry) {
    const uri = entry[0];
    const model = monaco.editor.getModel(uri.toString());   
    monaco.editor.setModelMarkers(model, uri.toString(), entry[1]);
  }, this);
})

const unknownLanguages = ['razor', 'handlebars'];
