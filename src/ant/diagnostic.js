import Uri from '../editor/uri';
import { Severity } from './const.d';
import { Event } from './Event';

export class DiagnosticCollection {
    constructor(name) {
      this._name = name;
      this._data = new Map();
      this._isDisposed = false;
    }

    dispose() {
      if (!this._isDisposed) {
        this._data = undefined;
        this._isDisposed = true;
      }
    }

    get name() {
      this._checkDisposed();
      return this._name;
    }


    set(first, diagnostics) {
      if (!first) {
        // this set-call is a clear-call
        this.clear();
        return;
      }
  
      // the actual implementation for #set
  
      this._checkDisposed();
      let toSync;
  
      if (first instanceof Uri) {
  
        if (!diagnostics) {
          // remove this entry
          this.delete(first);
          return;
        }
  
        // update single row
        this._data.set(first.toString(), diagnostics);
        toSync = [first];
  
      } else if (Array.isArray(first)) {
        // update many rows
        toSync = [];
        let lastUri;
  
        // ensure stable-sort
        mergeSort(first, DiagnosticCollection._compareIndexedTuplesByUri);
  
        for (const tuple of first) {
          const [uri, diagnostics] = tuple;
          if (!lastUri || uri.toString() !== lastUri.toString()) {
            if (lastUri && this._data.get(lastUri.toString()).length === 0) {
              this._data.delete(lastUri.toString());
            }
            lastUri = uri;
            toSync.push(uri);
            this._data.set(uri.toString(), []);
          }
  
          if (!diagnostics) {
            // [Uri, undefined] means clear this
            this._data.get(uri.toString()).length = 0;
          } else {
            this._data.get(uri.toString()).push(...diagnostics);
          }
        }
      }

      // compute change and send to main side
      const entries = [];
      for (let uri of toSync) {
        let marker;
        let diagnostics = this._data.get(uri.toString());
        if (diagnostics) {
  
          // no more than 250 diagnostics per file
          if (diagnostics.length > DiagnosticCollection._maxDiagnosticsPerFile) {
            marker = [];
            const order = [DiagnosticSeverity.Error, DiagnosticSeverity.Warning, DiagnosticSeverity.Information, DiagnosticSeverity.Hint];
            orderLoop: for (let i = 0; i < 4; i++) {
              for (let diagnostic of diagnostics) {
                if (diagnostic.severity === order[i]) {
                  const len = marker.push(DiagnosticCollection._toMarkerData(diagnostic));
                  if (len === DiagnosticCollection._maxDiagnosticsPerFile) {
                    break orderLoop;
                  }
                }
              }
            }
  
            // add 'signal' marker for showing omitted errors/warnings
            marker.push({
              severity: Severity.Error,
              message: localize({ key: 'limitHit', comment: ['amount of errors/warning skipped due to limits'] }, "Not showing {0} further errors and warnings.", diagnostics.length - DiagnosticCollection._maxDiagnosticsPerFile),
              startLineNumber: marker[marker.length - 1].startLineNumber,
              startColumn: marker[marker.length - 1].startColumn,
              endLineNumber: marker[marker.length - 1].endLineNumber,
              endColumn: marker[marker.length - 1].endColumn
            });
          } else {
            marker = diagnostics.map(DiagnosticCollection._toMarkerData);
          }
        }
  
        entries.push([uri, marker]);
      }

      Event.dispatchGlobalEvent('setEntriesMarkers', entries);              
    }
  
    delete(uri) {
      this._checkDisposed();
      this._data.delete(uri.toString());

      // Global Event.
      Event.dispatchGlobalEvent('setEntriesMarkers', [[ uri, undefined]]);
    }
  
    clear() {
      this._checkDisposed();
      this._data.clear();
    }
  
    forEach(callback, thisArg) {
      this._checkDisposed();
      this._data.forEach((value, key) => {
        let uri = URI.parse(key);
        callback.apply(thisArg, [uri, this.get(uri), this]);
      });
    }
  
    get(uri) {
      this._checkDisposed();
      let result = this._data.get(uri.toString());
      if (Array.isArray(result)) {
        return Object.freeze(result.slice(0));
      }
      return undefined;
    }
  
    has(uri) {
      this._checkDisposed();
      return Array.isArray(this._data.get(uri.toString()));
    }
  
    _checkDisposed() {
      if (this._isDisposed) {
        throw new Error('illegal state - object is disposed');
      }
    }
  
    static _toMarkerData(diagnostic) {
  
      let range = diagnostic.range;
  
      return {
        startLineNumber: range.start.line + 1,
        startColumn: range.start.character + 1,
        endLineNumber: range.end.line + 1,
        endColumn: range.end.character + 1,
        message: diagnostic.message,
        source: diagnostic.source,
        severity: DiagnosticCollection._convertDiagnosticsSeverity(diagnostic.severity),
        code: String(diagnostic.code)
      };
    }
  
    static _convertDiagnosticsSeverity(severity) {
      switch (severity) {
        case 0: return Severity.Error;
        case 1: return Severity.Warning;
        case 2: return Severity.Info;
        case 3: return Severity.Ignore;
        default: return Severity.Error;
      }
    }
  
    static _compareIndexedTuplesByUri(a, b) {
      if (a[0].toString() < b[0].toString()) {
        return -1;
      } else if (a[0].toString() > b[0].toString()) {
        return 1;
      } else {
        return 0;
      }
    }
  }