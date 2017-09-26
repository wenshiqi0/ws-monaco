export const IndentAction = {
  /**
   * Insert new line and copy the previous line's indentation.
   */
  None: 0,
  /**
   * Insert new line and indent once (relative to the previous line's indentation).
   */
  Indent: 1,
  /**
   * Insert two new lines:
   *  - the first one indented which will hold the cursor
   *  - the second one at the same indentation level
   */
  IndentOutdent: 2,
  /**
   * Insert new line and outdent once (relative to the previous line's indentation).
   */
  Outdent: 3
}

export const EndOfLineSequence = {
	/**
	 * Use line feed (\n) as the end of line character.
	 */
	LF: 0,
	/**
	 * Use carriage return and line feed (\r\n) as the end of line character.
	 */
	CRLF: 1
}

export const Severity = {
  error: 'error',
  warning: 'warning',
  warn: 'warn',
  info: 'info',
} 