import Promise from 'bluebird';
import os from 'os';
import { writeFileSync } from 'fs';
import TextLine from './textLine';
import MirrorModel from './MirrorModel';
import { Range, Position } from '../ant/types';
import { getWordAtText, ensureValidWordDefinition } from './wordHelper';

const _modeId2WordDefinition = new Map();
function setWordDefinitionFor(modeId, wordDefinition) {
	_modeId2WordDefinition.set(modeId, wordDefinition);
}
function getWordDefinitionFor(modeId) {
	return _modeId2WordDefinition.get(modeId);
}

/**
 * Represents a text document, such as a source file. Text documents have
 * [lines](#TextLine) and knowledge about an underlying resource like a file.
 */
export default class TextDocument extends MirrorModel {
  constructor(uri, lines, eol, languageId, versionId, filename) {
    super(uri, lines, eol, languageId, versionId);
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
    this._version = versionId;

    /**
		 * The [end of line](#EndOfLine) sequence that is predominately
		 * used in this document.
		 */
		this._eol = eol || (os.platform() === 'win32' ? '\r\n' : '\n');
		
    /**
     * Mutiple lines content.
     */
    this._lines = lines;

    this._textLines = [];

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
          writeFileSync(this._uri.toString(), this.lines.join(this._eol), 'utf-8', (err) => {
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
   * @reutrn text of the document with eol.
   */
	getText(range) {
		return range ? this.getTextInRange(range) : this.lines.join(this._eol);
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

  /**
   * get uri
   */
  get uri() {
    return this._uri;
  }

  /**
   * get language id
   */
  get languageId() {
    return this._languageId;
  }

  /**
  * Returns a text line denoted by the line number. Note
  * that the returned object is *not* live and changes to the
  * document are not reflected.
  *
  * @param line A line number in [0, lineCount).
  * @return A [line](#TextLine).
  */
  lineAt(line) {
    if (typeof line === 'number') {
      const lineText = this._lines[line];
      return new TextLine(line, lineText, new Range(line, 0, line, lineText.length - 1));
    } else {
    }
  }

	getTextInRange(_range) {
		let range = this.validateRange(_range);

		if (range.isEmpty) {
			return '';
		}

		if (range.isSingleLine) {
			return this._lines[range.start.line].substring(range.start.character, range.end.character);
		}

		let lineEnding = this._eol,
			startLineIndex = range.start.line,
			endLineIndex = range.end.line,
			resultLines = [];

		resultLines.push(this._lines[startLineIndex].substring(range.start.character));
		for (let i = startLineIndex + 1; i < endLineIndex; i++) {
			resultLines.push(this._lines[i]);
		}
		resultLines.push(this._lines[endLineIndex].substring(0, range.end.character));

		return resultLines.join(lineEnding);
	}

	lineAt(lineOrPosition) {
		let line;
		if (typeof lineOrPosition === 'number') {
      line = lineOrPosition;
    } else {
      line = lineOrPosition.line;
    }

		if (line < 0 || line >= this._lines.length) {
			throw new Error('Illegal value for `line`');
		}

		let result = this._textLines[line];
		if (!result || result.lineNumber !== line || result.text !== this._lines[line]) {

			const text = this._lines[line];
			const firstNonWhitespaceCharacterIndex = /^(\s*)/.exec(text)[1].length;
			const range = new Range(line, 0, line, text.length);
			const rangeIncludingLineBreak = line < this._lines.length - 1
				? new Range(line, 0, line + 1, 0)
				: range;

			result = Object.freeze({
				lineNumber: line,
				range,
				rangeIncludingLineBreak,
				text,
				firstNonWhitespaceCharacterIndex, //TODO@api, rename to 'leadingWhitespaceLength'
				isEmptyOrWhitespace: firstNonWhitespaceCharacterIndex === text.length
			});

			this._textLines[line] = result;
		}

		return result;
	}

	offsetAt(position) {
		position = this.validatePosition(position);
		this._ensureLineStarts();
		return this._lineStarts.getAccumulatedValue(position.line - 1) + position.character;
	}

	positionAt(offset) {
		offset = Math.floor(offset);
		offset = Math.max(0, offset);

		this._ensureLineStarts();
		let out = this._lineStarts.getIndexOf(offset);

		let lineLength = this._lines[out.index].length;

		// Ensure we return a valid position
		return new Position(out.index, Math.min(out.remainder, lineLength));
	}

	// ---- range math

	validateRange(range) {
		if (!(range instanceof Range)) {
			throw new Error('Invalid argument');
		}

		let start = this.validatePosition(range.start);
		let end = this.validatePosition(range.end);

		if (start === range.start && end === range.end) {
			return range;
		}
		return new Range(start.line, start.character, end.line, end.character);
	}

	validatePosition(position) {
		if (!(position instanceof Position)) {
			throw new Error('Invalid argument');
		}

		let { line, character } = position;
		let hasChanged = false;

		if (line < 0) {
			line = 0;
			character = 0;
			hasChanged = true;
		}
		else if (line >= this._lines.length) {
			line = this._lines.length - 1;
			character = this._lines[line].length;
			hasChanged = true;
		}
		else {
			let maxCharacter = this._lines[line].length;
			if (character < 0) {
				character = 0;
				hasChanged = true;
			}
			else if (character > maxCharacter) {
				character = maxCharacter;
				hasChanged = true;
			}
		}

		if (!hasChanged) {
			return position;
		}
		return new Position(line, character);
	}

	getWordRangeAtPosition(_position, regexp) {
		let position = this.validatePosition(_position);
		if (!regexp || regExpLeadsToEndlessLoop(regexp)) {
			regexp = getWordDefinitionFor(this._languageId);
		}
		let wordAtText = getWordAtText(
			position.character + 1,
			ensureValidWordDefinition(regexp),
			this._lines[position.line],
			0
		);

		if (wordAtText) {
			return new Range(position.line, wordAtText.startColumn - 1, position.line, wordAtText.endColumn - 1);
		}
		return undefined;
	}
}