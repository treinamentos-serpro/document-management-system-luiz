const repository = require('../repositories/documentRepository');

function upload(file) {
  if (!file) {
    const error = new Error('Envie um arquivo no campo "file".');
    error.status = 400;
    throw error;
  }
  return repository.save(file);
}

function list() {
  return repository.list();
}

function findById(id) {
  const document = repository.findById(id);
  if (!document) {
    const error = new Error('Documento não encontrado.');
    error.status = 404;
    throw error;
  }
  return document;
}

module.exports = { upload, list, findById };
