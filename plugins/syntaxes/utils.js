import { ipcRenderer as ipc } from 'electron';

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

const Kind = {
	unknown : '',
	keyword : 'keyword',
	script : 'script',
	module : 'module',
	class : 'class',
	interface : 'interface',
	type : 'type',
	enum : 'enum',
	variable : 'var',
	localVariable : 'local var',
	function : 'function',
	localFunction : 'local function',
	memberFunction : 'method',
	memberGetAccessor : 'getter',
	memberSetAccessor : 'setter',
	memberVariable : 'property',
	constructorImplementation : 'constructor',
	callSignature : 'call',
	indexSignature : 'index',
	constructSignature : 'construct',
	parameter : 'parameter',
	typeParameter : 'type parameter',
	primitiveType : 'primitive type',
	label : 'label',
	alias : 'alias',
	const : 'const',
	let : 'let',
	warning : 'warning',
}

export function convertKind(kind) {
  switch (kind) {
    case Kind.primitiveType:
    case Kind.keyword:
      return CompletionItemKind.Keyword;
    case Kind.variable:
    case Kind.localVariable:
      return CompletionItemKind.Variable;
    case Kind.memberVariable:
    case Kind.memberGetAccessor:
    case Kind.memberSetAccessor:
      return CompletionItemKind.Field;
    case Kind.function:
    case Kind.memberFunction:
    case Kind.constructSignature:
    case Kind.callSignature:
    case Kind.indexSignature:
      return CompletionItemKind.Function;
    case Kind.enum:
      return CompletionItemKind.Enum;
    case Kind.module:
      return CompletionItemKind.Module;
    case Kind.class:
      return CompletionItemKind.Class;
    case Kind.interface:
      return CompletionItemKind.Interface;
    case Kind.warning:
      return CompletionItemKind.File;
  }
  return CompletionItemKind.Property;
}

export function wireCancellationToken(event, token, reject) {
  token.onCancellationRequested(() => {
    if (event)
      ipc.removeAllListeners(event);
    reject({ cancel: true });
  });
}