import { ipcMain as ipc } from 'electron';
import { readFileSync } from 'fs';
import { join } from 'path';

const ts = require('Typescript/lib/tsserverlibrary');
const FILE_NAME = 'ant://javascript:1';

let document;
let version = 1;

const CompletionItemKind = {
  Text: 0,
  Method: 1,
  Function: 2,
  Constructor: 3,
  Field: 4,
  Variable: 5,
  Class: 6,
  Interface: 7,
  Module: 8,
  Property: 9,
  Unit: 10,
  Value: 11,
  Enum: 12,
  Keyword: 13,
  Snippet: 14,
  Color: 15,
  File: 16,
  Reference: 17,
  Folder: 18,
}

function convertKind(kind) {
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

const compilerOptions = {
  allowNonTsExtensions: true,
  allowJs: true,
  lib: ['lib.es6.d.ts'],
  target: 'es6',
  moduleResolution: ts.ModuleResolutionKind.Classic
};

const host = {
  getCompilationSettings: () => compilerOptions,
  getScriptFileNames: () => [FILE_NAME],
  getScriptKind: () => ts.ScriptKind.JS,
  getScriptVersion: (fileName) => {
    if (fileName === FILE_NAME) {
      return String(version++);
    }
    return '1'; // default lib an jquery.d.ts are static
  },
  getScriptSnapshot: (fileName) => {
    let text = '';
    if (fileName === FILE_NAME) {
      text = document;
    } else {
      text = readFileSync(join(__dirname, './lib.es6.d.ts'), 'utf8');
    }
    return {
      getText: (start, end) => text.substring(start, end),
      getLength: () => text.length,
      getChangeRange: () => void 0,
    };
  },
  getCurrentDirectory: () => '',
  getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options)
}

const jsLanguageService = ts.createLanguageService(host);

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

ipc.on(
  'javascript:completions',
  (event, args) => {
    const { value, offset, position } = args;
    const result = handleCompletionItems(value, offset, position);
    event.sender.send('javascript:completions', {
        isIncomplete: false,
        items: result.items,
    });
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

ipc.on(
  'javascript:signatures',
  (event, args) => {
    const { value, offset, position } = args;
    const result = handleSignatureHelp(value, offset, position);
    event.sender.send('javascript:signatures', result);
  }
)