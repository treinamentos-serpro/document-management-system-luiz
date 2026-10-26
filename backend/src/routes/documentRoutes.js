const { Router } = require('express');
const multer = require('multer');
const { rateLimit } = require('express-rate-limit');
const { randomUUID } = require('node:crypto');
const controller = require('../controllers/documentController');
const { storageDirectory } = require('../config/storage');

const router = Router();
const fileRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em um minuto.' },
});
const upload = multer({
  storage: multer.diskStorage({
    destination: storageDirectory,
    filename: (req, file, callback) => callback(null, randomUUID()),
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 0 },
});

router.post('/upload', fileRateLimit, upload.single('file'), controller.upload);
router.get('/documents', controller.list);
router.get('/documents/:id/download', fileRateLimit, controller.download);

module.exports = router;
