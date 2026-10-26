const { randomUUID } = require('node:crypto');

function createDocumentService({ documentRepository }) {
  return {
    createDocument(file, owner) {
      const document = {
        id: randomUUID(),
        originalName: file.originalname,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        owner,
        storageName: file.filename,
      };

      documentRepository.add(document);
      return toPublicDocument(document);
    },

    listDocuments(owner) {
      return documentRepository.findByOwner(owner).map(toPublicDocument);
    },

    getDownload(id, owner) {
      const document = documentRepository.findById(id);
      if (!document || document.owner !== owner) {
        return null;
      }

      return {
        document: toPublicDocument(document),
        filePath: documentRepository.getFilePath(document.storageName),
      };
    },
  };
}

function toPublicDocument({ id, originalName, size, uploadedAt, owner }) {
  return { id, originalName, size, uploadedAt, owner };
}

module.exports = createDocumentService;