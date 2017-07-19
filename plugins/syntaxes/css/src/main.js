import { ipcMain as ipc } from 'electron';
import { getCSSLanguageService, getLESSLanguageService } from 'vscode-css-languageservice';
import { TextDocument, Position, InsertTextFormat } from 'vscode-languageserver-types-commonjs';

import { convertKind } from '../../utils';

let version = 0;

const cssLanguageService = getCSSLanguageService();
const lessLanguageService = getLESSLanguageService();

function toRange(range) {
  if (!range) {
    return null;
  }
  return {
    startLineNumber: range.start.line + 1,
    startColumn: range.start.character + 1,
    endLineNumber: range.end.line + 1,
    endColumn: range.end.character + 1,
  }
}

ipc.on(
  'style:completions',
  (event, args) => {
    let service;
    const { value, position, languageId, offset } = args;

    switch (languageId) {
      case 'less':
        service = lessLanguageService;
        break;
      default:
        service = cssLanguageService;
        break;
    }

    const document = TextDocument.create('ant://css', 1, version++, value);
    const pos = Position.create(position.lineNumber - 1, position.column - 1);
    const stylesheet = service.parseStylesheet(document);

    const info = service.doComplete(document, pos, stylesheet);

    const items = info.items.map(entry => {
      const item = {
        label: entry.label,
        insertText: entry.insertText,
        sortText: entry.sortText,
        filterText: entry.filterText,
        documentation: entry.documentation,
        detail: entry.detail,
        kind: convertKind(entry.kind),
      };
      if (entry.textEdit) {
        item.range = toRange(entry.textEdit.range);
        item.insertText = entry.textEdit.newText;
      }
      if (entry.insertTextFormat === InsertTextFormat.Snippet) {
        item.insertText = { value: item.insertText };
      }
      return item;
    });

    event.sender.send('style:completions', {
      isIncomplete: info.isIncomplete,
      items,
    });
  }
)