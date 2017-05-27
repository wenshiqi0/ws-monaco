// interface
import '@types/node';
import '../monaco/monaco.d';

import { Registry, INITIAL } from 'vscode-textmate';

export interface IGrammarRegistry {
  getRegistry(): Registry;

  getScopeRegistry(): any;

  getEmbeddedLanguages(): string[];

  pushLanguageEmbedded(languageId: string): Number;

  updateTheme(name: string);

  reloadTheme(name: string);
}

export interface Global extends Window {
  monaco: any;
}