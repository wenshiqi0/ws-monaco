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

const _collections = [];
export function getDiagnosticCollection() {
  return _collections;
}

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
    monaco.languages.registerCompletionItemProvider(id, {
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
  registerOnTypeFormattingEditProvider: (id, provider) => {
    // console.log(provider);
    /*
    return monaco.languages.registerOnTypeFormattingEditProvider(id, {
      autoFormatTriggerCharacters: ';',
      provideOnTypeFormattingEdits: async (model, position, ch, options, token) => {
        const textDocument = uriToDocument.get(model.uri);
        const args = await provider.provideDocumentFormattingEdits(textDocument, options, token);
      }
    })
    */
  },
  registerDocumentFormattingEditProvider: (id, provider) => {
    return monaco.languages.registerDocumentFormattingEditProvider(id, {
      provideDocumentFormattingEdits: async (model, options, token) => {
        const textDocument = uriToDocument.get(model.uri);
        const args = await provider.provideDocumentFormattingEdits(textDocument, options, token);
        return args.map(convert.TextEdit.from);
      }
    });
  },
  registerDocumentRangeFormattingEditProvider: (id, provider) => {
    return monaco.languages.registerDocumentRangeFormattingEditProvider(id, {
      provideDocumentRangeFormattingEdits: async (model, range, options, token) => {
        const textDocument = uriToDocument.get(model.uri);
        const args = await provider.provideDocumentRangeFormattingEdits(textDocument, convert.toRange(range), options, token);
        return args.map(convert.TextEdit.from);
      }
    });
  },
  registerHoverProvider: (id, provider) => {
    return monaco.languages.registerHoverProvider(id, {
      provideHover: async (model, position, token) => {
        const textDocument = uriToDocument.get(model.uri);
        const args = await provider.provideHover(textDocument, convert.toPosition(position), token);
        return args && { ...args, range: convert.fromRange(args.range) };
      }
    });
  },
  registerDefinitionProvider: (id, provider) => {
    return monaco.languages.registerDefinitionProvider(id, {
      provideDefinition: async (model, position, token) => {
        const textDocument = uriToDocument.get(model.uri);
        const args = await provider.provideDefinition(textDocument, convert.toPosition(position), token);
        return (args || []).map(item => ({ ...item, range: convert.fromRange(item.range) }));        
      }
    });
  },
  registerDocumentHighlightProvider: (id, provider) => {
    /*
    return monaco.languages.registerDocumentHighlightProvider(id, {
      provideDocumentHighlights: async (model, position, token) => {
        const textDocument = uriToDocument.get(model.uri);
        const args = await provider.provideDocumentHighlights(textDocument, convert.toPosition(position), token);
        return (args || []).map(item => ({ ...item, range: convert.fromRange(item.range) })); 
      }
    });
    */
  },
  registerReferenceProvider: (id, provider) => {
    return monaco.languages.registerReferenceProvider(id, {
      provideReferences: async (model, position, context, token) => {
        const textDocument = uriToDocument.get(model.uri);
        const args = await provider.provideReferences(textDocument, convert.toPosition(position), context, token);
        return (args || []).map(item => ({ ...item, range: convert.fromRange(item.range) }));        
      }
    });
  },
  registerDocumentSymbolProvider: (id, provider) => {
    return monaco.languages.registerReferenceProvider(id, {
      registerDocumentSymbolProvider: async (model, token) => {
        const textDocument = uriToDocument.get(model.uri);
        return await provider.provideDocumentSymbols(textDocument, token);
      }
    });
  },
  registerSignatureHelpProvider: (id, provider) => {
    return monaco.languages.registerSignatureHelpProvider(id, {
      signatureHelpTriggerCharacters: ['(', ','],      
      provideSignatureHelp: async (model, position, token) => {
        const textDocument = uriToDocument.get(model.uri);
        return await provider.provideSignatureHelp(textDocument, convert.toPosition(position), token);
      }
    });
  },
  registerRenameProvider: (id, provider) => {
    /*
    return monaco.languages.registerRenameProvider(id, {
      provideRenameEdits: async (model, position, newName, token) => {
        const textDocument = uriToDocument.get(model.uri);
        const args = await provider.provideRenameEdits(textDocument, convert.toPosition(position), newName, token);
        return (args || []).map(item => ({ ...item, range: convert.fromRange(item.range) }));        
      }
    });
    */
  },
  registerCodeActionsProvider: (selector, provider) => {
    return monaco.languages.registerCodeActionProvider(selector, {
      provideCodeActions: async (model, range, context, token) => {
        const args = await provider.provideCodeActions(model, convert.toRange(range), context, token);
        return args;
      }
    });
  },
  registerImplementationProvider: (id, provider) => {
    // return monaco.languages.registerImplementationProvider(id, provider);
  },
  registerTypeDefinitionProvider: (id, provider) => {
    return monaco.languages.registerTypeDefinitionProvider(id, {
      provideTypeDefinition: async (model, position, token) => {
        const textDocument = uriToDocument.get(model.uri);
        const args = await provider.provideTypeDefinition(textDocument, convert.toPosition(position), token);
        return (args || []).map(item => ({ ...item, range: convert.fromRange(item.range) }));        
      }
    });
  },
  registerCodeLensProvider: (id, provider) => {
    return monaco.languages.registerCodeLensProvider(id, {
      provideCodeLenses: async (model, token) => {
        const textDocument = uriToDocument.get(model.uri);
        const args = await provider.provideCodeLenses(textDocument, token);
        return (args || []).map(item => ({ ...item, range: convert.fromRange(item.range) }));        
      }
    });
  },
  setLanguageConfiguration: (id, configure) => {
    if (unknownLanguages.indexOf(id) > -1) return;
    monaco.languages.setLanguageConfiguration(id, configure);
  },
  registerWorkspaceSymbolProvider: () => {
  },
  // proposed API
  registerColorProvider: () => {

  },
}

Event.addGlobalListenerEvent('setEntriesMarkers', entries => {
  entries.forEach(function(entry) {
    const uri = entry[0];
    const model = monaco.editor.getModel(uri.toString());   
    monaco.editor.setModelMarkers(model, uri.toString(), entry[1]);
  }, this);
})

const unknownLanguages = ['razor', 'handlebars'];
