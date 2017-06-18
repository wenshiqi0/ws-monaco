const components = require('../../../api/html/axml.json');

const gloablAttributes = [
  {
    documentation: '',
    label: 'class',
    insertText: { value: 'class="$1"' },
  },
  {
    documentation: '',
    label: 'onTap',
    insertText: { value: 'onTap="$1"' },
  },
];

const fixedTags = [
  {
    documentation: '仅可放置在<swiper/>组件中，宽高自动设置为100%。',
    label: 'swiper-item',
    insertText: { value: '<swiper-item>$1</swiper-item>' },
  },
  {
    documentation: '',
    label: 'picker-view-column',
    insertText: { value: '<picker-view-column>$1</picker-view-column>' },
  },
];

function indexesOf(string, regex) {
  let match;
  const indexes = {};
  const regex2 = new RegExp(regex);

  while (match = regex2.exec(string)) {
    if (!indexes[match[0]]) indexes[match[0]] = [];
    indexes[match[0]].push(match.index);
  }
  return indexes;
}

function comboWordDetect(lastTagName, model) {
  const returnTag = Object.assign({}, lastTagName);
  const nextText = model.getValueInRange({
    startColumn: lastTagName.endColumn,
    endColumn: lastTagName.endColumn + 1,
    startLineNumber: lastTagName.lineNumber,
    endLineNumber: lastTagName.lineNumber,
  });

  if (nextText === '-') {
    const nextWord = model.getWordAtPosition({
      column: lastTagName.endColumn + 2,
      lineNumber: lastTagName.lineNumber,
    });
    returnTag.word = `${lastTagName.word}-${nextWord.word}`;
    returnTag.endColumn = nextWord.endColumn;
    return comboWordDetect(returnTag, model);
  }

  return returnTag;
}

const provideCompletionItems = (model, { column, lineNumber }) => {
  let isTag = true; // otherwise is attribute
  let prevCharacter = '';
  let completionItems = [];
  let lastTagName = {};

  const prevText = model.getValueInRange({
    startColumn: 1,
    endColumn: column - 1,
    startLineNumber: lineNumber,
    endLineNumber: lineNumber,
  });

  if (prevText.length) {
    prevCharacter = prevText.substring(prevText.length - 1, prevText.length);
    if (prevCharacter !== '<') {
      const angleIndexes = indexesOf(prevText, /\<|\>/g);

      // 判断当前自动补全是采用 tag 还是 attributes, 目前这种做法仅限于行内，如果要做到跨行分析得依赖语法解析，可以参考 monaco-html
      const lastLeftAngle = angleIndexes['<'] ? angleIndexes['<'].pop() + 1 : 0;
      const lastRightAngle = angleIndexes['>'] ? angleIndexes['>'].pop() + 1 : 0;

      if (lastLeftAngle > lastRightAngle) {
        isTag = false;
        lastTagName = model.getWordAtPosition({
          column: lastLeftAngle + 1,
          lineNumber,
        });
        lastTagName.lineNumber = lineNumber;
        lastTagName = comboWordDetect(lastTagName, model);
      }
    }
  }

  if (isTag) {
    const nextText = model.getValueInRange({
      startColumn: 1,
      endColumn: column + 1,
      startLineNumber: lineNumber,
      endLineNumber: lineNumber,
    })

    completionItems = (components.concat(fixedTags)).map(tag => {
      const raw = ((tag.insertText || {}).value || '');
      const insertText = nextText.match(/<[a-zA-Z]*>$/g) ? {
        value: raw.substring(1, raw.length - 1),
      } : nextText.match(/<[a-zA-Z]*/g) ? {
        value: raw.substring(1, raw.length),
      } : tag.insertText;
      return Object.assign({}, tag, {
        kind: window.monaco.languages.CompletionItemKind.Keyword,
        insertText,
      })
    })
  } else {
    // attributes complteion here
    const matchedTags = components.filter(tag => tag.label.split(' ')[0] === lastTagName.word);
    if (matchedTags.length) {
      let wholeArray = gloablAttributes;
      matchedTags.forEach((tags) => {
        wholeArray = wholeArray.concat(tags.attributes);
      });
      completionItems = wholeArray;
    }
  }

  return completionItems;
}

module.exports = {
  provideCompletionItems,
};
