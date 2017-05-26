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

  reloadTheme(mode: string);
}

export interface Global extends Window {
  monaco: any;
}