exports.makeCompletion = (completion, entry) => {
  if (completion.length === 2) {
    if (entry) {
      return completion[1].split('.')[1];
    } else {
      return completion[1];
    }
  } else {
    const method = completion[0].split('\t')[0];
    return `${method}()`;
  }
}

exports.CompletionItemKind = {
	Text : 0,
	operation : 1,
	Function : 2,
	Constructor : 3,
	Field : 4,
	Variable : 5,
	Class : 6,
	Interface : 7,
	Module : 8,
	property : 9,
	Unit : 10,
	Value : 11,
	Enum : 12,
	Keyword : 13,
	Snippet : 14,
	Color : 15,
	File : 16,
	Reference : 17,
	Folder : 18,
}