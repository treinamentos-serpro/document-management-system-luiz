const path = require('node:path');

function createDocumentRepository({ storageDir }) {
  const documents = new Map();

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
      return path.join(storageDir, storageName);
    },
  };
}

module.exports = createDocumentRepository;