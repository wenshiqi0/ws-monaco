let all = [];
const extensions = new Map();

export function addExtension (id, ext) {
  extensions.set(id, ext);
  all = extensions.values();
}

export function getExtension (id) {
  return extensions.get(id);
}
