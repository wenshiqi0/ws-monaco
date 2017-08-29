let allExtensions = [];
const extensions = new Map();

export function addExtension (id, ext) {
  extensions.set(id, ext);
  allExtensions = extensions.values();
}

export function getExtension (id) {
  return extensions.get(id);
}


export const all = allExtensions;