import { ipcMain as ipc } from 'electron';
import { join } from 'path';

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
    const filenames = Array.from(Ant.modelsMap.keys());
    return filenames;
  }

  getScriptVersion(uri) {
    const model = Ant.modelsMap.get(uri);
    if (model)
      return model.getVersion();
    return '1';
  }

  getScriptSnapshot(uri) {
    let text;
    const model = Ant.modelsMap.get(uri);

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
    } catch(e) {
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
    console.log(info);
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

ipc.on('javascript:getCompletionsAtPosition', (event, args) => {
  const { uri, position, offset, entry } = args;
  const res = host.getCompletionsAtPosition(uri, position, offset);
  event.sender.send('javascript:getCompletionsAtPosition', res);
})

ipc.on('javascript:resolveCompletionItem', (event, args) => {
  const { uri, position, offset, entry } = args;
  const res = host.resolveCompletionItem(uri, position, offset, entry);
  event.sender.send('javascript:resolveCompletionItem', res);
})

ipc.on('javascript:provideSignatureHelp', (event, args) => {
  const { uri, position, offset } = args;
  const res = host.provideSignatureHelp(uri, position, offset);
  event.sender.send('javascript:provideSignatureHelp', res);
})

ipc.on('javascript:provideHover', (event, args) => {
  const { uri, position, offset } = args;
  const res = host.provideHover(uri, position, offset);
  event.sender.send('javascript:provideHover', res);
})

ipc.on('javascript:provideDocumentFormattingEdits', (event, args) => {
  const { uri, options } = args;
  const res = host.provideDocumentFormattingEdits(uri, options);
  event.sender.send('javascript:provideDocumentFormattingEdits', res);
})

ipc.on('javascript:provideDocumentRangeFormattingEdits', (event, args) => {
  const { uri, options, offsetStart, offsetEnd } = args;
  const res = host.provideDocumentRangeFormattingEdits(uri, offsetStart, offsetEnd, options);
  event.sender.send('javascript:provideDocumentRangeFormattingEdits', res);
})