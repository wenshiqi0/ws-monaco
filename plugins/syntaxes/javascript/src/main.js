import { ipcMain as ipc } from 'electron';
import libES6File from 'raw-loader!typescript/lib/lib.es6.d.ts';

const ts = require('typescript/lib/tsserverlibrary');

let document;
let version = 1;
const FILE_NAME = 'ant://javascript';
const TEST_NAME = 'test://javascript';

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
  target: 2, // lib.es6.d.ts
  moduleResolution: ts.ModuleResolutionKind.Classic
};

const host = {
  getCompilationSettings: () => compilerOptions,
  getScriptFileNames: () => [FILE_NAME, TEST_NAME],
  getScriptKind: () => ts.ScriptKind.JS,
  getScriptVersion: (fileName) => {
    if (fileName === FILE_NAME) {
      return String(version++);
    }
    return '1'; // 非工程文件只需要固定文件版本就好了
  },
  getScriptSnapshot: (fileName) => {
    let text = '';
    if (fileName === FILE_NAME) {
      text = document || '';
    } else if (fileName === TEST_NAME) {
      text = 'var text = ""'; // 目前还没有一个很好的方式来解决这里的性能问题，所以我添加了一个测试文件，在ide初始化的时候将预先生成代码补全的信息
    } else {
      text = libES6File;
    }
    return {
      getText: (start, end) => text.substring(start, end),
      getLength: () => text.length,
      getChangeRange: () => void 0,
    };
  },
  getCurrentDirectory: () => '',
  getDefaultLibFileName: () => 'lib.es6.d.ts', // 目前只使用 es6
}

const jsLanguageService = ts.createLanguageService(host);

// 预先生成所有的代码补全信息，typescript 会把相关信息缓存起来
jsLanguageService.getCompletionsAtPosition(TEST_NAME, 0);

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