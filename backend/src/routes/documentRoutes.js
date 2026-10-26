const express = require('express');
const requireOwner = require('../middleware/requireOwner');

function createDocumentRoutes({ documentController, uploadDocument }) {
  const router = express.Router();

  router.post('/upload', requireOwner, uploadDocument, documentController.upload);
  router.get('/documents', requireOwner, documentController.list);
  router.get('/documents/:id/download', requireOwner, documentController.download);

  return router;
}

module.exports = createDocumentRoutes;