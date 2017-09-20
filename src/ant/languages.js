import Promise from 'bluebird';
import fs from 'fs';
import { join } from 'path';
import * as convert from './convert';
import { score } from './languageSelector';
import { DiagnosticCollection } from './diagnostic';
import { Event } from './Event';
import { getContentChangePromise } from '../editor/hook';
import { Location } from './types';
import { wireCancellationToken } from './promise';

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
    if (id === 'javascript') {
      return {
        set: () => {}
      };
    }

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
  registerCompletionItemProvider: (id, provider, ...trigger) => {
    monaco.languages.registerCompletionItemProvider(id, {
      triggerCharacters: trigger,
      provideCompletionItems: async (model, position, token) => {
        // For bufferSupport to sync textDocuments (typescript & javascript).
        await delay();
        const pos = convert.toPosition(position);
        const textDocument = uriToDocument.get(model.uri);
        const args = await wireCancellationToken(token, provider.provideCompletionItems(textDocument, pos, token));
        return {
          isIncomplete: Array.isArray(args) ? false : args.isIncomplete,
          items: (Array.isArray(args) ? args : args.items).map(item => {
            item.range = item.range ? convert.fromRange(item.range) : null;
            return item;
          })
        };
      },
      resolveCompletionItem: (item, token) => {
        if (!provider.resolveCompletionItem) return item;
        return provider.resolveCompletionItem(item, token);
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
        const args = await wireCancellationToken(token, provider.provideDocumentFormattingEdits(textDocument, options, token));        
        return args.map(convert.TextEdit.from);
      }
    });
  },
  registerDocumentRangeFormattingEditProvider: (id, provider) => {
    return monaco.languages.registerDocumentRangeFormattingEditProvider(id, {
      provideDocumentRangeFormattingEdits: async (model, range, options, token) => {
        const textDocument = uriToDocument.get(model.uri);
        const args = await wireCancellationToken(token, provider.provideDocumentRangeFormattingEdits(textDocument, convert.toRange(range), options, token));          
        return args.map(convert.TextEdit.from);
      }
    });
  },
  registerHoverProvider: (id, provider) => {
    return monaco.languages.registerHoverProvider(id, {
      provideHover: async (model, position, token) => {
        const textDocument = uriToDocument.get(model.uri);
        const args = await wireCancellationToken(token, provider.provideHover(textDocument, convert.toPosition(position), token));
        return args && { ...args, range: convert.fromRange(args.range) };
      }
    });
  },
  registerDefinitionProvider: (id, provider) => {
    return monaco.languages.registerDefinitionProvider(id, {
      provideDefinition: async (model, position, token) => {
        const textDocument = uriToDocument.get(model.uri);
        const args = await wireCancellationToken(token, provider.provideDefinition(textDocument, convert.toPosition(position), token));
        if (args instanceof Location)
          return { ...args, range: convert.fromRange(args.range) };
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
        const args = await wireCancellationToken(token, provider.provideReferences(textDocument, convert.toPosition(position), context, token));
        return (args || []).map(item => ({ ...item, range: convert.fromRange(item.range) }));        
      }
    });
  },
  registerDocumentSymbolProvider: (id, provider) => {
    return monaco.languages.registerReferenceProvider(id, {
      registerDocumentSymbolProvider: (model, token) => {
        const textDocument = uriToDocument.get(model.uri);
        return wireCancellationToken(token, provider.provideDocumentSymbols(textDocument, token));
      }
    });
  },
  registerSignatureHelpProvider: (id, provider, ...trigger) => {
    return monaco.languages.registerSignatureHelpProvider(id, {
      signatureHelpTriggerCharacters: trigger,      
      provideSignatureHelp: (model, position, token) => {
        const textDocument = uriToDocument.get(model.uri);
        return wireCancellationToken(token, provider.provideSignatureHelp(textDocument, convert.toPosition(position), token));
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
      provideCodeActions: (model, range, context, token) => {
        return wireCancellationToken(token, provider.provideCodeActions(model, convert.toRange(range), context, token))
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
        const args = await wireCancellationToken(token, provider.provideTypeDefinition(textDocument, convert.toPosition(position), token));
        return (args || []).map(item => ({ ...item, range: convert.fromRange(item.range) }));        
      }
    });
  },
  registerCodeLensProvider: (id, provider) => {
    return monaco.languages.registerCodeLensProvider(id, {
      provideCodeLenses: async (model, token) => {
        const textDocument = uriToDocument.get(model.uri);
        const args = await wireCancellationToken(token, provider.provideCodeLenses(textDocument, token));
        return (args || []).map(item => ({ ...item, range: convert.fromRange(item.range) }));        
      }
    });
  },
  setLanguageConfiguration: (id, configure) => {
    let moreConfigure = {}
    if (unknownLanguages.indexOf(id) > -1) return;
    if (id === 'jsx-tags') id = 'javascript';
    try {
      const { extPath, configuration: confPath } = languagesMap.get(id);      
      const absConfPath = join(extPath, confPath);
      if (fs.existsSync(absConfPath)) {
        const stringBuffer = fs.readFileSync(join(extPath, confPath), 'utf-8');
        moreConfigure = JSON.parse(stringBuffer);
      }
    } catch (e) {
      moreConfigure = {};
    }
    monaco.languages.setLanguageConfiguration(id, { ...moreConfigure, ...configure });
  },
  registerWorkspaceSymbolProvider: () => {
  },
  // proposed API
  registerColorProvider: () => {

  },
}

Event.addGlobalListenerEvent('setEntriesMarkers', entries => {
  if (entries) {
    entries.forEach(function(entry) {
      const uri = entry[0];
      const model = monaco.editor.getModel(uri.toString());   
      monaco.editor.setModelMarkers(model, uri.toString(), entry[1]);
    }, this);
  }
})

const unknownLanguages = ['razor', 'handlebars'];
