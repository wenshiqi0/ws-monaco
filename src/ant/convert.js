import types from './types';

export function toPosition(position) {
	return new types.Position(position.lineNumber - 1, position.column - 1);
}

export function fromPosition(position) {
	return { lineNumber: position.line + 1, column: position.character + 1 };
}