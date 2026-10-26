const { Router } = require('express');
const multer = require('multer');
const { randomUUID } = require('node:crypto');
const controller = require('../controllers/documentController');
const { storageDirectory } = require('../config/storage');

const router = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: storageDirectory,
    filename: (req, file, callback) => callback(null, randomUUID()),
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 0 },
});

router.post('/upload', upload.single('file'), controller.upload);
router.get('/documents', controller.list);
router.get('/documents/:id/download', controller.download);

module.exports = router;
