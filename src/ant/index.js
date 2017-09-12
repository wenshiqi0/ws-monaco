import * as extensions from './extensions';
import * as commands from './commands';
import * as workspace from './workspace';
import window from './window';
import languages from './languages';
import { EventEmitter } from './Event';
import { IndentAction } from './const.d';
import { Range, Position, SignatureHelp, SignatureInformation, ParameterInformation, WorkspaceEdit, Location, Diagnostic, DiagnosticSeverity, Disposable, SnippetString, CompletionItem, CompletionList, CodeLens, SymbolKind, StatusBarAlignment, CompletionItemKind, TextEdit, Hover, Uri } from './types';

export default {
  env: {
    APPINSIGHTS_INSTRUMENTATIONKEY: 'antmonacoown'
  },
  Disposable,
  SymbolKind,
  CompletionItem,
  CompletionList,
  CodeLens,
  Range,
  Position,
  TextEdit,
  Hover,
  SnippetString,
  Diagnostic,
  DiagnosticSeverity,
  Location,
  WorkspaceEdit,
  SignatureHelp,
  SignatureInformation,
  ParameterInformation,
  Uri,

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