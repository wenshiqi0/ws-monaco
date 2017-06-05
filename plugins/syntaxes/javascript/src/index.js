const IPC = require('node-ipc').IPC;
const fs = require('fs');
const { join } = require('path');

let monaco;
let registry;
let document;
let changedRange;
let version = 1;

const FILE_NAME = 'ant://javascript:1';

function convertKind(kind) {
  const CompletionItemKind = window.monaco.languages.CompletionItemKind;
  switch (kind) {
    case 'primitive type':
    case 'keyword':
      return CompletionItemKind.Keyword;
    case 'var':
    case 'local var':
      return CompletionItemKind.Variable;
    case 'property':
    case 'getter':
    case 'setter':
      return CompletionItemKind.Field;
    case 'function':
    case 'method':
    case 'construct':
    case 'call':
    case 'index':
      return CompletionItemKind.Function;
    case 'enum':
      return CompletionItemKind.Enum;
    case 'module':
      return CompletionItemKind.Module;
    case 'class':
      return CompletionItemKind.Class;
    case 'interface':
      return CompletionItemKind.Interface;
    case 'warning':
      return CompletionItemKind.File;
  }

  return CompletionItemKind.Property;
}

// server
const activate = (callback) => {
  const ipc = new IPC();
  ipc.config.id = 'tsServer';
  ipc.config.silent = true;

  ipc.serve(() => {

    const ts = require('Typescript/lib/tsserverlibrary');
    const compilerOptions = { allowNonTsExtensions: true, allowJs: true, lib: ['lib.es6.d.ts'], target: 'es6', moduleResolution: ts.ModuleResolutionKind.Classic };

    const host = {
      getCompilationSettings: () => compilerOptions,
      getScriptFileNames: () => [FILE_NAME],
      getScriptKind: () => ts.ScriptKind.JS,
      getScriptVersion: (fileName) => {
        if (fileName === FILE_NAME) {
          return String(version);
        }
        return '1'; // default lib an jquery.d.ts are static
      },
      getScriptSnapshot: (fileName) => {
        let text = '';
        if (fileName === FILE_NAME) {
          text = document;
        } else {
          text = fs.readFileSync(join(__dirname, './lib.es6.d.ts'), 'utf8');
        }
        return {
          getText: (start, end) =>  text.substring(start, end),
          getLength: () => text.length,
          getChangeRange: () => void 0,
        };
      },
      getCurrentDirectory: () => '',
      getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options)
    }

    const jsLanguageService = ts.createLanguageService(host);

    // completionsHelp
    const handleCompletionItems = (value, offset, position) => {
      document = value;
      let completions = jsLanguageService.getCompletionsAtPosition(FILE_NAME, offset);
      if (!completions) {
        return { isIncomplete: false, items: [] };
      }
      return {
        isIncomplete: false,
        items: completions.entries.map(entry => {
          return {
            position,
            label: entry.name,
            insertText: entry.name,
            kind: convertKind(entry.kind),
            data: { // data used for resolving item details (see 'doResolve')
              languageId: 'javascript',
              offset,
            }
          };
        })
      };
    }

    ipc.server.on(
      'completions',
      (data, socket) => {
        const { value, offset, position } = JSON.parse(data);
        const result = handleCompletionItems(value, offset, position);
        const messagesString = JSON.stringify({
          isIncomplete: false,
          items: result.items,
        });
        ipc.server.emit(
          socket,
          'completions',
          messagesString
        );
      }
    )

    const handleSignatureHelp = (value, offset, position) => {
      document = value;
      const signHelp = jsLanguageService.getSignatureHelpItems(FILE_NAME, offset);
      if (signHelp) {
        let ret = {
          activeSignature: signHelp.selectedItemIndex,
          activeParameter: signHelp.argumentIndex,
          signatures: [] 
        };
        signHelp.items.forEach(item => {
          let signature = {
            label: '',
            documentation: null,
            parameters: []
          };
          signature.label += ts.displayPartsToString(item.prefixDisplayParts);
          item.parameters.forEach((p, i, a) => {
            let label = ts.displayPartsToString(p.displayParts);
            let parameter = {
              label: label,
              documentation: ts.displayPartsToString(p.documentation)
            };
            signature.label += label;
            signature.parameters.push(parameter);
            if (i < a.length - 1) {
              signature.label += ts.displayPartsToString(item.separatorDisplayParts);
            }
          });
          signature.label += ts.displayPartsToString(item.suffixDisplayParts);
          ret.signatures.push(signature);
        });
        return (ret);
      };
      return (null);
    }

    ipc.server.on(
      'signatures',
      (data, socket) => {
        const { value, offset, position } = JSON.parse(data);
        const result = handleSignatureHelp(value, offset, position);
        const messagesString = JSON.stringify(result);
        ipc.server.emit(
          socket,
          'signatures',
          messagesString
        );
      }
    )

    callback();
  })

  ipc.server.start();
};

// client
const initClient = (callback) => {
  const ipc = new IPC();
  ipc.config.id = 'ts';
  ipc.config.silent = true;
  ipc.connectTo(
    'tsServer',
    () => {
      ipc.of.tsServer.on(
        'connect',
        () => {
          monaco.editor.onDidCreateModel((model) => {
            document = model.getValue();
            model.onDidChangeContent((e) => {
              const { changes } = e;
              version++;
              changedRange = changes[0] || {};
            })
          })

          const languages = window.monaco.languages;
          languages.registerCompletionItemProvider('javascript', {
            triggerCharacters: ['*'],
            provideCompletionItems: (model, position, token) => {
              return new Promise(resolve => {
                ipc.of.tsServer.emit('completions', JSON.stringify({
                  value: model.getValue(),
                  offset: model.getOffsetAt(position),
                  position,
                }));
                ipc.of.tsServer.on(
                  'completions',
                  (str) => {
                    const json = JSON.parse(str);
                    resolve(json);
                  }
                )
              });
            }
          })

          languages.registerSignatureHelpProvider('javascript', {
            signatureHelpTriggerCharacters: ['(', ','],
            provideSignatureHelp: (model, position, token) => {
              return new Promise(resolve => {
                ipc.of.tsServer.emit('signatures', JSON.stringify({
                  value: model.getValue(),
                  offset: model.getOffsetAt(position),
                  position,
                }));
                ipc.of.tsServer.on(
                  'signatures',
                  (str) => {
                    const json = JSON.parse(str);
                    resolve(json);
                  }
                )
              });
            }
          })
        }
      );
    });
}

module.exports = (r, m) => {
  registry = r;
  monaco = m;
  activate(initClient);
}