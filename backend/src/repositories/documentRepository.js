const path = require('node:path');

function createDocumentRepository({ storageDir }) {
  const documents = new Map();
  const storageRoot = path.resolve(storageDir);

  return {
    add(document) {
      documents.set(document.id, document);
      return document;
    },

    findByOwner(owner) {
      return [...documents.values()].filter((document) => document.owner === owner);
    },

    findById(id) {
      return documents.get(id) ?? null;
    },

    getFilePath(storageName) {
      if (typeof storageName !== 'string' || !storageName
        || storageName === '.' || storageName === '..'
        || storageName.includes('/') || storageName.includes('\\')
        || storageName.includes('\0') || path.win32.isAbsolute(storageName)) {
        throw new Error('Nome físico de arquivo inválido.');
      }

      return path.join(storageRoot, storageName);
    },
  };
}

module.exports = createDocumentRepository;