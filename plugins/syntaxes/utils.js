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

export class WorkQueue {
  constructor() {
    this._queue = [];
    this.status = WorkQueue.Status.done;
  }

  addWorkPromise(work) {
    this._queue.push(work);
    if (this.status === Worker.Status.done) {
      next();
    }
  }

  async next() {
    if (this._queue.length === 0) {
      return (this.status = WorkQueue.Status.done);
    }
    const work = this._queue[0];
    this._queue = this._queue.slice(1) || [];
    await work;
    await this.nect();
  }
}

WorkQueue.Status = {
  done: Symbol('WorkQueue.done'),
  pending: Symbol('WorkQueue.pending'),
}

export class FlushQueue {
  constructor(event) {
    this._registryEvent = event;
    this._cache = {
      changes: [],
      isFlush: false,
      isRedoing: false,
      isUndoing: false,
      versionId: -1,
    };
    this._timeout = null;
    this.status = FlushQueue.Status.flushed;
  }

  reset() {
    this._cache = {
      changes: [],
      isFlush: false,
      isRedoing: false,
      isUndoing: false,
      versionId: this._cache.versionId,
    };
    this.status = FlushQueue.Status.flushed;
  }

  cache(change) {
    if (this.status === FlushQueue.Status.flushing) {
      setTimeout(function() {
        this.cache(change);
      }.bind(this), 0);
      return;
    }

    if (this.status === FlushQueue.Status.pending) {
      clearTimeout(this._timeout);
    }

    this.status = FlushQueue.Status.pending;

    // check versionId just go one step,
    // or throw an error out.
    if (change.versionId !== this._cache.versionId + 1 && this._cache.versionId !== -1)
      throw new Error('Editor change queue is under wrong orders');

    this._cache.changes = this._cache.changes.concat(change.changes);
    this._cache.versionId = change.versionId;

    this._timeout = setTimeout(function() {
      this.flush();
    }.bind(this), 500);
  }

  flush() {
    this.status = FlushQueue.Status.flushing;

    const cache = this._cache;
    this.reset();
    ipc.send(this._registryEvent, cache);

    this.status = FlushQueue.Status.flushed;
  }
}

FlushQueue.Status = {
  flushed: Symbol('FlushQueue.flushed'),
  flushing: Symbol('FlushQueue.flushing'),
  pending: Symbol('FlushQueue.pending'),
}
