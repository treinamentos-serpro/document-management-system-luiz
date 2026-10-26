const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const multer = require('multer');
const express = require('express');

function createDocumentRoutes({ documentController, storageDir, maxFileSizeBytes }) {
  const router = express.Router();
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, callback) => {
        fs.mkdir(storageDir, { recursive: true }, (error) => callback(error, storageDir));
      },
      filename: (req, file, callback) => callback(null, randomUUID()),
    }),
    limits: { fileSize: maxFileSizeBytes },
  });

  router.post('/upload', documentController.requireOwner, upload.single('file'), documentController.upload);
  router.get('/documents', documentController.requireOwner, documentController.list);
  router.get('/documents/:id/download', documentController.requireOwner, documentController.download);

  return router;
}

module.exports = createDocumentRoutes;