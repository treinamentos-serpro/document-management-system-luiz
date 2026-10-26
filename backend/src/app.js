const path = require('node:path');
const express = require('express');
const multer = require('multer');
const createDocumentController = require('./controllers/documentController');
const createDocumentRepository = require('./repositories/documentRepository');
const createDocumentRoutes = require('./routes/documentRoutes');
const createDocumentService = require('./services/documentService');

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function createApp({
  storageDir = process.env.STORAGE_DIR || path.join(__dirname, '..', 'storage'),
  maxFileSizeBytes = positiveInteger(process.env.MAX_FILE_SIZE_BYTES, 10 * 1024 * 1024),
} = {}) {
  const app = express();
  const documentRepository = createDocumentRepository({ storageDir });
  const documentService = createDocumentService({ documentRepository });
  const documentController = createDocumentController({ documentService });

  app.use(express.json());
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use(createDocumentRoutes({ documentController, storageDir, maxFileSizeBytes }));
  app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'O arquivo excede o limite permitido.' });
    }

    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Não foi possível processar o upload.' });
    }

    return res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
  });

  return app;
}

const app = createApp();
app.createApp = createApp;

if (require.main === module) {
  const port = positiveInteger(process.env.PORT, 3000);
  app.listen(port, () => {
    console.log(`DMS backend ouvindo na porta ${port}`);
  });
}

module.exports = app;
