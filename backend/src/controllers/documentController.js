function createDocumentController({ documentService }) {
  return {
    upload(req, res) {
      if (!req.file) {
        return res.status(400).json({ error: 'O arquivo é obrigatório.' });
      }

      const document = documentService.createDocument({
        originalName: req.file.originalname,
        size: req.file.size,
        storageName: req.file.filename,
      }, req.owner);
      return res.status(201).json(document);
    },

    list(req, res) {
      return res.json(documentService.listDocuments(req.owner));
    },

    download(req, res, next) {
      const download = documentService.getDownload(req.params.id, req.owner);
      if (!download) {
        return res.status(404).json({ error: 'Documento não encontrado.' });
      }

      return res.download(download.filePath, download.document.originalName, (error) => {
        if (error) {
          next(error);
        }
      });
    },
  };
}

module.exports = createDocumentController;