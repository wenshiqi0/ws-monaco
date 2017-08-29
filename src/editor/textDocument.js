import Promise from 'bluebird';
import { writeFilee} from 'fs';

/**
 * Represents a text document, such as a source file. Text documents have
 * [lines](#TextLine) and knowledge about an underlying resource like a file.
 */
export default class TextDocument {
  constructor(uri, filename, languageId, version, eol) {
    /**
		 * The associated URI for this document. Most documents have the __file__-scheme, indicating that they
		 * represent files on disk. However, some documents may have other schemes indicating that they are not
		 * available on disk.
		 */
    this._uri = uri;

    /**
		 * The file system path of the associated resource. Shorthand
		 * notation for [TextDocument.uri.fsPath](#TextDocument.uri). Independent of the uri scheme.
		 */
    this._filename = filename;

		/**
		 * The identifier of the language associated with this document.
		 */
    this._languageId = languageId;

    /**
		 * The version number of this document (it will strictly increase after each
		 * change, including undo/redo).
		 */
    this._version = version;

    /**
		 * The [end of line](#EndOfLine) sequence that is predominately
		 * used in this document.
		 */
    this._eol = eol || '\n';

    /**
     * Mutiple lines content.
     */
    this._lines = [];

    // features

    /**
		 * Is this document representing an untitled file.
		 */
    this._isUntitled = false;
    /**
		 * `true` if there are unpersisted changes.
		 */
    this._isDirty = false;
		/**
		 * `true` if the document have been closed. A closed document isn't synchronized anymore
		 * and won't be re-used when the same resource is opened again.
		 */
    this._isClosed = false;
  }

  /**
   * Save the underlying file.
   *
   * @return A promise that will resolve to true when the file
   * has been saved. If the file was not dirty or the save failed,
   * will return false.
   */
  save() {
    return new Promise((resolve) => {
      if (this._isDirty || this._isClosed) resolve(false);
      else {
        try {
          writeFilee(this._uri.toString(), this.lines.join(this._eol), 'utf-8', (err) => {
            if (err) throw err;
            resolve(true); 
          });
        } catch (e) {
          resolve(false);
        }
      }
    })
  }

  /**
   * set the lines content from textDocument.
   * 
   * @param {Array<string>} lines
   */
  set lines(lines) {
    this._lines = lines;
  }

  /**
   * get the lines content from textDocument.
   */
  get lines() {
    return this._lines;
  }

  /**
   * get line count from textDocument.
   */
  get lineCount() {
    return this._lines.length;
  }
}