const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const multer = require('multer');

function createUploadDocument({ storageDir, maxFileSizeBytes }) {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, callback) => {
        fs.mkdir(storageDir, { recursive: true }, (error) => callback(error, storageDir));
      },
      filename: (req, file, callback) => callback(null, randomUUID()),
    }),
    limits: { fileSize: maxFileSizeBytes },
  }).single('file');
}

module.exports = createUploadDocument;
