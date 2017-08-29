/**
 * Represents a line of text, such as a line of source code.
 *
 * TextLine objects are __immutable__. When a [document](#TextDocument) changes,
 * previously retrieved lines will not represent the latest state.
 */
export default class TextLine {
  constructor(lineNumber, text, range) {
    const { isEmptyOrWhitespace, index } = initWitespaceIndex(text) || {};

    this._lineNumber = lineNumber;
    this._text = text;
    this._range = range;
    this._isEmptyOrWhitespace = isEmptyOrWhitespace;
    this._firstNoWhitespaceIndex = index;
  }

  /**
   * range with eol
   * 
   * @return New range
   */
  get rangeIncludingLineBreak() {
    const range = this._range;
    return new monaco.Range(
      range.startLineNumber,
      range.startColumn,
      range.endLineNumber + 1,
      range.endColumn
    );
  }

  /**
   * @return the index of the first non-whitespce character
   */
  get firstNonWhitespaceCharacterIndex() {
    return this._firstNoWhitespaceIndex;
  }

  get isEmptyOrWhitespace() {
    return this._isEmptyOrWhitespace;
  }
}

/**
 * caculate the index of the first non-whitespce character from the text,
 * and modify it filled of whitespce (empty) or not.
 * 
 * @param {string} str
 * @return Object with {boolean} isEmptyOrWhitespace and {number|undefined} index
 */
function initWitespaceIndex(str) {
  let i = 0;
  if (!this._text)
    return { isEmptyOrWhitespace: true };
  while(this._text[i]) {
    if (this._text[i] !== '\s')
      return { isEmptyOrWhitespace: false, index: i + 1 }; // monaco index start with 1
    i += 1;
  }
  return { isEmptyOrWhitespace: true };
}