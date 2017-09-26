export const USUAL_WORD_SEPARATORS = '`~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?';

/**
 * Create a word definition regular expression based on default word separators.
 * Optionally provide allowed separators that should be included in words.
 *
 * The default would look like this:
 * /(-?\d*\.\d\w*)|([^\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g
 */
function createWordRegExp(allowInWords) {
  allowInWords = allowInWords || '';
	var usualSeparators = USUAL_WORD_SEPARATORS;
	var source = '(-?\\d*\\.\\d\\w*)|([^';
	for (var i = 0; i < usualSeparators.length; i++) {
		if (allowInWords.indexOf(usualSeparators[i]) >= 0) {
			continue;
		}
		source += '\\' + usualSeparators[i];
	}
	source += '\\s]+)';
	return new RegExp(source, 'g');
}

// catches numbers (including floating numbers) in the first group, and alphanum in the second
export const DEFAULT_WORD_REGEXP = createWordRegExp();

export function ensureValidWordDefinition(wordDefinition) {
	var result = DEFAULT_WORD_REGEXP;

	if (wordDefinition && (wordDefinition instanceof RegExp)) {
		if (!wordDefinition.global) {
			var flags = 'g';
			if (wordDefinition.ignoreCase) {
				flags += 'i';
			}
			if (wordDefinition.multiline) {
				flags += 'm';
			}
			result = new RegExp(wordDefinition.source, flags);
		} else {
			result = wordDefinition;
		}
	}

	result.lastIndex = 0;

	return result;
}

function getWordAtPosFast(column, wordDefinition, text, textOffset) {
	// find whitespace enclosed text around column and match from there

	if (wordDefinition.test(' ')) {
		return getWordAtPosSlow(column, wordDefinition, text, textOffset);
	}

	let pos = column - 1 - textOffset;
	let start = text.lastIndexOf(' ', pos - 1) + 1;
	let end = text.indexOf(' ', pos);
	if (end === -1) {
		end = text.length;
	}

	wordDefinition.lastIndex = start;
	let match;
	while (match = wordDefinition.exec(text)) {
		if (match.index <= pos && wordDefinition.lastIndex >= pos) {
			return {
				word: match[0],
				startColumn: textOffset + 1 + match.index,
				endColumn: textOffset + 1 + wordDefinition.lastIndex
			};
		}
	}

	return null;
}


function getWordAtPosSlow(column, wordDefinition, text, textOffset) {
	// matches all words starting at the beginning
	// of the input until it finds a match that encloses
	// the desired column. slow but correct

	let pos = column - 1 - textOffset;
	wordDefinition.lastIndex = 0;

	let match;
	while (match = wordDefinition.exec(text)) {

		if (match.index > pos) {
			// |nW -> matched only after the pos
			return null;

		} else if (wordDefinition.lastIndex >= pos) {
			// W|W -> match encloses pos
			return {
				word: match[0],
				startColumn: textOffset + 1 + match.index,
				endColumn: textOffset + 1 + wordDefinition.lastIndex
			};
		}
	}

	return null;
}

export function getWordAtText(column, wordDefinition, text, textOffset) {
	const result = getWordAtPosFast(column, wordDefinition, text, textOffset);
	// both (getWordAtPosFast and getWordAtPosSlow) leave the wordDefinition-RegExp
	// in an undefined state and to not confuse other users of the wordDefinition
	// we reset the lastIndex
	wordDefinition.lastIndex = 0;
	return result;
}