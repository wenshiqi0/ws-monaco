export class MarkdownString {
	constructor(value) {
		this.value = value || '';
	}

	appendText(value) {
		// escape markdown syntax tokens: http://daringfireball.net/projects/markdown/syntax#backslash
		this.value += value.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&');
		return this;
	}

	appendMarkdown(value) {
		this.value += value;
		return this;
	}

	appendCodeblock(langId, code) {
		this.value += '\n```';
		this.value += langId;
		this.value += '\n';
		this.value += code;
		this.value += '\n```\n';
		return this;
	}
}