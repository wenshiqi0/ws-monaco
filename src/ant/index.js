import * as extensions from './extensions';
import * as commands from './commands';
import * as workspace from './workspace';
import window from './window';
import languages from './languages';
import { EventEmitter } from './Event';
import { Range, Position, Disposable, CompletionItem, CodeLens, Disposable, SymbolKind, StatusBarAlignment, IndentAction, CompletionItemKind } from './types';

export default {
  env: {

  },
  Disposable,
  SymbolKind,
  CompletionItem,
  CodeLens,
  Range,
  Position,

  // features
  extensions,
  commands,
  workspace,
  window,
  languages,

  // event
  EventEmitter,

  // const
  StatusBarAlignment,
  IndentAction,
  CompletionItemKind
}