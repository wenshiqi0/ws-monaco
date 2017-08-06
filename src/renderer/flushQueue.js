import { ipcRenderer as ipc } from 'electron';
import Event from '../event';

export default class FlushQueue {
  constructor(model, event) {
    this._model = model;
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
    }.bind(this), 200);
  }

  flush() {
    this.status = FlushQueue.Status.flushing;

    const events = this._cache;
    const uri = this._model.uri;

    this.reset();
    ipc.send(this._registryEvent, { uri, events });

    Event.dispatchGlobalEvent('onDidChangeFlushed', { events, model: this._model });

    this.status = FlushQueue.Status.flushed;
  }
}

FlushQueue.Status = {
  flushed: Symbol('FlushQueue.flushed'),
  flushing: Symbol('FlushQueue.flushing'),
  pending: Symbol('FlushQueue.pending'),
}