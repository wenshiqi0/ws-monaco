const commandsMap = new Map();

export function registerCommand(id, callback) {
  commandsMap.set(id, callback);

  return {
    dispose: () => {
      commandsMap.delete(id);
    }
  }
}

export function executeCommand() {
  const id = arguments[0];
  const params = Array.prototype.slice.call(arguments);
  const method = commandsMap.get(id);

  if (method)
    method.apply(this, params);
}

export function getCommands() {
  return commandsMap.keys();
}

export function registerTextEditorCommand() {
  // noop
}
