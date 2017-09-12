import types from './types';
import { EndOfLineSequence } from './const.d';

export function toPosition(position) {
	return new types.Position(position.lineNumber - 1, position.column - 1);
}

export function fromPosition(position) {
	return { lineNumber: position.line + 1, column: position.character + 1 };
}

export function fromRange(range) {
	if (!range) {
		return undefined;
	}
	let { start, end } = range;
	return {
		startLineNumber: start.line + 1,
		startColumn: start.character + 1,
		endLineNumber: end.line + 1,
		endColumn: end.character + 1
	};
}

export function toRange(range) {
	if (!range) {
		return undefined;
	}
	let { startLineNumber, startColumn, endLineNumber, endColumn } = range;
	return new types.Range(startLineNumber - 1, startColumn - 1, endLineNumber - 1, endColumn - 1);
}

export const TextEdit = {
	from(edit) {
		return{
			text: edit.newText,
			eol: EndOfLine.from(edit.newEol),
			range: fromRange(edit.range)
		};
	},
	to(edit) {
		let result = new types.TextEdit(toRange(edit.range), edit.text);
		result.newEol = EndOfLine.to(edit.eol);
		return result;
	}
};

export const EndOfLine = {		
	from(eol) {
		if (eol === types.EndOfLine.CRLF) {
			return EndOfLineSequence.CRLF;
		} else if (eol === types.EndOfLine.LF) {
			return EndOfLineSequence.LF;
		}
			return undefined;
	},
	to(eol) {
		if (eol === EndOfLineSequence.CRLF) {
			return types.EndOfLine.CRLF;
		} else if (eol === EndOfLineSequence.LF) {
			return types.EndOfLine.LF;
		}
		return undefined;
	}
}