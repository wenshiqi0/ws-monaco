import { ipcRenderer as ipc, remote } from 'electron';

export const activate = (registry, monaco) => {
  const languages = monaco.languages;

  languages.registerCompletionItemProvider('javascript', {
    triggerCharacters: ['*'],
    provideCompletionItems: (model, position, token) => {
      return new Promise(resolve => {
        ipc.once('javascript:completions', (event, args) => resolve(args));
        if (token) {
					token.onCancellationRequested(() => {
            ipc.removeAllListeners('javascript:completions');
						resolve(undefined);
					});
				}
        ipc.send('javascript:completions', {
          value: model.getValue(),
          offset: model.getOffsetAt(position),
          position,
        });
      });
    },
  });

  languages.registerSignatureHelpProvider('javascript', {
    signatureHelpTriggerCharacters: ['(', ','],
    provideSignatureHelp: (model, position, token) => {
      return new Promise(resolve => {
        ipc.once('javascript:signatures', (event, args) => resolve(args));
        if (token) {
					token.onCancellationRequested(() => {
            ipc.removeAllListeners('javascript:signatures');
						resolve(undefined);
					});
				}
        ipc.send('javascript:signatures', {
          value: model.getValue(),
          offset: model.getOffsetAt(position),
          position,
        });
      });
    },
  })
}