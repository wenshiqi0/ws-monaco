import { readFileSync } from 'fs';
import { join } from 'path';
import { SnippetString } from './types';

export default function registerSnippets(extPath, snippets) {
  (snippets || []).forEach(function({ language, path, disable }) {
    const snippet = readFileSync(join(extPath, path), {
      encoding: 'utf-8'
    });

    const snippetObejct = JSON.parse(snippet.trim());

    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: () => Object.keys(snippetObejct).map(key => {
        const body = snippetObejct[key].body;
        return {
          kind: monaco.languages.CompletionItemKind.Snippet,
          label: snippetObejct[key].prefix,
          insertText: new SnippetString(Array.isArray(body) ? body.join('\n') : body),
          documentation: snippetObejct[key].description,
        }
      })
    })
  });
}