import { ipcRenderer as ipc } from 'electron';
import { join } from 'path';
import { wireCancellationToken } from '../../utils';
import abridgeInsert from './../../../api/javascript/abridge.json';
import Event from '../../../../src/renderer/event';

import { convertKind } from '../../utils';

const ts = require('typescript/lib/typescriptServices');

import libES6File from 'raw-loader!typescript/lib/lib.es6.d.ts';
import abridgeFile from './../../../api/javascript/lib.abridge.spec.ts';

import snippets from '../snippets/javascripttiny.json';

let snippetsItems;
const combineFile = `${abridgeFile}\n\n${libES6File}`;

// snippets handle
try {
  if (!snippetsItems)
    snippetsItems = Object.keys(snippets).map(key => {
      return {
        "label": key,
        "type": 13,
        "insertText": { value: (snippets[key].body || []).join('\n') },
        "documentation": snippets[key].description,
      }
    });
} catch (e) {
  snippetsItems = null;
}

const prefix = 'internal://tea';

class AntMonacoMainHost {
  constructor(compilerOptions) {
    this._languageService = ts.createLanguageService(this);
    this._compilerOptions = compilerOptions;
    this._extraLibs = [];
  }

  getCompilationSettings() {
    return this._compilerOptions;
  }

  getScriptFileNames() {
    return monaco.editor.getModels().map(model => {
      return model.uri;
    });
  }

  getScriptVersion(uri) {
    const model = monaco.editor.getModel(uri);
    if (model)
      return model.getVersionId();
    return '1';
  }

  getScriptSnapshot(uri) {
    let text;
    const model = monaco.editor.getModel(uri);

    if (model) {
      // a true editor model
      text = model.getValue() || '';
    } else if (uri in this._extraLibs) {
      // static extra lib
      text = this._extraLibs[uri];
    } else if (uri === 'lib.es6.d.ts') {
      text = combineFile;
    } else {
      return;
    }

    return {
      getText: (start, end) => text.substring(start, end),
      getLength: () => text.length,
      getChangeRange: () => undefined
    };
  }

  getCurrentDirectory() {
    return '';
  }

  getDefaultLibFileName() {
    return 'lib.es6.d.ts';
  }

  // --- language features

  getCompletionsAtPosition(uri, position, offset) {
    let completionsItems;
    const info = this._languageService.getCompletionsAtPosition(uri, offset);
    const model = monaco.editor.getModel(uri);

    // normal handle
    try {
      completionsItems = info.entries.map(entry => {
        return {
          uri,
          position,
          label: entry.name,
          sortText: entry.sortText,
          kind: convertKind(entry.kind),
        };
      });
    } catch (e) {
      completionsItems = null;
    }

    if (completionsItems && Array.isArray(completionsItems)) {
      return {
        isIncomplete: false,
        items: completionsItems.concat((info || {}).isMemberCompletion ? [] : snippetsItems),
      }
    } else {
      return {
        isIncomplete: false,
        items: (info || {}).isMemberCompletion ? null : snippetsItems,
      }
    }
  }

  resolveCompletionItem(uri, position, offset, entry) {
    let result;
    const details = this._languageService.getCompletionEntryDetails(uri, offset, entry);
    if (!details) {
      result = null;
    } else {
      const detail = ts.displayPartsToString(details.displayParts);
      const documentation = ts.displayPartsToString(details.documentation);
      result = {
        uri,
        position,
        label: details.name,
        kind: convertKind(details.kind),
        detail: detail.match(/\(method\) Abridge/g) ? documentation : detail,
        documentation,
      }
    }
    return result;
  }

  provideSignatureHelp(uri, position, offset) {
    let resource = uri;

    const info = this._languageService.getSignatureHelpItems(uri, offset);

    if (!info) {
      return;
    }

    let ret = {
      activeSignature: info.selectedItemIndex,
      activeParameter: info.argumentIndex,
      signatures: []
    };

    info.items.forEach(item => {
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

    return ret;
  }

  provideHover(uri, position, offset) {
    let resource = uri;
    const info = this._languageService.getQuickInfoAtPosition(uri, offset);
    if (!info) {
      return;
    }
    let contents = ts.displayPartsToString(info.displayParts);
    return {
      contents: [contents],
      textSpan: info.textSpan,
    };
  }

  provideDocumentFormattingEdits(uri, options) {
    const info = this._languageService.getFormattingEditsForDocument(uri, this._convertOptions(options));
    return info;
  }

  provideDocumentRangeFormattingEdits(uri, offsetStart, offsetEnd, options) {
    return this._languageService.getFormattingEditsForRange(uri, offsetStart, offsetEnd, this._convertOptions(options));
  }

  _convertOptions(options) {
    return {
      ConvertTabsToSpaces: options.insertSpaces,
      TabSize: options.tabSize,
      IndentSize: options.tabSize,
      IndentStyle: ts.IndentStyle.Smart,
      NewLineCharacter: '\n',
      InsertSpaceAfterCommaDelimiter: true,
      InsertSpaceAfterSemicolonInForStatements: true,
      InsertSpaceBeforeAndAfterBinaryOperators: true,
      InsertSpaceAfterKeywordsInControlFlowStatements: true,
      InsertSpaceAfterFunctionKeywordForAnonymousFunctions: true,
      InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
      InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
      InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
      PlaceOpenBraceOnNewLineForControlBlocks: false,
      PlaceOpenBraceOnNewLineForFunctions: false
    };
  }
}

const host = new AntMonacoMainHost({
  allowNonTsExtensions: true,
  target: 5, // lib.es6.d.ts
  noSemanticValidation: true,
  noSyntaxValidation: true
});

export const activate = (registry, monaco) => {
  const languages = monaco.languages;
  const editor = monaco.editor;
 
  languages.registerCompletionItemProvider('javascript', {
    triggerCharacters: ['.'],
    provideCompletionItems: (model, position, token) => {
      return new Promise((resolve, reject) => {
        token.onCancellationRequested(() => {
          reject();
        })
        const res = host.getCompletionsAtPosition(model.uri, position, model.getOffsetAt(position));
        resolve(res);
      })
    },
    resolveCompletionItem: (item, token) => {
      if (!item) return resolve(null);
      const position = item.position;
      const model = monaco.editor.getModel(item.uri);
      return new Promise((resolve, reject) => {
        token.onCancellationRequested(() => {
          reject();
        })
        const res = host.resolveCompletionItem(item.uri, position, model.getOffsetAt(position), item.label);
        const ret = res ? res : item;
        const insertText = (abridgeInsert[item.label] || {}).insertText;
        if (insertText)
          ret.insertText = insertText;

        resolve(ret);
      })
    }
  });

  languages.registerSignatureHelpProvider('javascript', {
    signatureHelpTriggerCharacters: ['(', ','],
    provideSignatureHelp: (model, position, token) => {
      return new Promise((resolve, reject) => {
        token.onCancellationRequested(() => {
          reject();
        })
        const res = host.provideSignatureHelp(model.uri, position, model.getOffsetAt(position));
        resolve(res);
      })
    },
  });

  languages.registerHoverProvider('javascript', {
    provideHover: (model, position, token) => {
      return new Promise((resolve, reject) => {
        token.onCancellationRequested(() => {
          reject();
        })
        const res = host.provideHover(model.uri, position, model.getOffsetAt(position));
        const { textSpan, contents } = res || {};
        resolve({
          contents,
          range: textSpan ? textSpanToRange(model, textSpan) : null,
        });
      })
    }
  });

  languages.registerDocumentFormattingEditProvider('javascript', {
    provideDocumentFormattingEdits: (model, options, token) => {
      return new Promise((resolve, reject) => {
        token.onCancellationRequested(() => {
          reject();
        })
        const res = host.provideDocumentFormattingEdits(model.uri, options);
        resolve(res.map(edit => convertTextChanges(model, edit)));
      })
    }
  });

  languages.registerDocumentRangeFormattingEditProvider('javascript', {
    provideDocumentRangeFormattingEdits: (model, range, options, token) => {
      const offsetStart = model.getOffsetAt({ lineNumber: range.startLineNumber, column: range.startColumn });
      const offsetEnd = model.getOffsetAt({ lineNumber: range.endLineNumber, column: range.endColumn });
      return new Promise((resolve, reject) => {
        token.onCancellationRequested(() => {
          reject();
        })
        const res = host.provideDocumentRangeFormattingEdits(model.uri, offsetStart, offsetEnd, options);
        resolve(res.map(edit => convertTextChanges(model, edit)));
      })
    }
  });
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