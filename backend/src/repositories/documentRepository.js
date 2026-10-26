const documents = new Map();

function save(file) {
  const document = {
    id: file.filename,
    originalName: file.originalname,
    size: file.size,
    createdAt: new Date().toISOString(),
    owner: 'anonymous',
  };
  documents.set(document.id, document);
  return document;
}

function list() {
  return Array.from(documents.values());
}

function findById(id) {
  return documents.get(id);
}

module.exports = { save, list, findById };
