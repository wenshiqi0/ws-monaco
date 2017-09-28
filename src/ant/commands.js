const commandsMap = new Map();

export function registerCommand(id, callback) {
  commandsMap.set(id, callback);

  return {
    dispose: () => {}
  }
}

export function executeCommand() {
  const id = arguments[0];
  const params = arguments.slice(1);
  const method = commandsMap.get(id);

  method.apply(this, params);
}

export function getCommands() {
  return commandsMap.keys();
}

export function registerTextEditorCommand() {
  // noop
}
