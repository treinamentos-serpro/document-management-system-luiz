const service = require('../services/documentService');
const { storageDirectory } = require('../config/storage');

function upload(req, res) {
  res.status(201).json(service.upload(req.file));
}

function list(req, res) {
  res.json(service.list());
}

function download(req, res, next) {
  const document = service.findById(req.params.id);
  res.download(document.id, document.originalName, { root: storageDirectory }, (error) => {
    if (error) next(error);
  });
}

module.exports = { upload, list, download };
