const { test } = require('node:test');
const assert = require('node:assert/strict');
const createDocumentService = require('../src/services/documentService');
const createDocumentRepository = require('../src/repositories/documentRepository');

test('o serviço recebe metadados independentes do Multer e omite dados internos', () => {
  const records = new Map();
  const documentRepository = {
    add(document) {
      records.set(document.id, document);
    },
    findByOwner(owner) {
      return [...records.values()].filter((document) => document.owner === owner);
    },
    findById(id) {
      return records.get(id);
    },
    getFilePath(storageName) {
      return `/storage/${storageName}`;
    },
  };
  const service = createDocumentService({ documentRepository });
  const document = service.createDocument({
    originalName: 'relatorio.txt', size: 12, storageName: 'arquivo-interno',
  }, 'user-1');

  assert.deepEqual(Object.keys(document).sort(), [
    'id', 'originalName', 'owner', 'size', 'uploadedAt',
  ]);
  assert.equal(document.originalName, 'relatorio.txt');
  assert.equal(document.size, 12);
  assert.equal(document.owner, 'user-1');
  assert.equal(Number.isNaN(Date.parse(document.uploadedAt)), false);
  assert.equal(records.get(document.id).storageName, 'arquivo-interno');
  assert.deepEqual(service.listDocuments('user-1'), [document]);
  assert.deepEqual(service.listDocuments('user-2'), []);
  assert.deepEqual(service.getDownload(document.id, 'user-1'), {
    document, filePath: '/storage/arquivo-interno',
  });
  assert.equal(service.getDownload(document.id, 'user-2'), null);
  assert.equal(service.getDownload('inexistente', 'user-1'), null);
});

test('repositórios mantêm seus metadados isolados', () => {
  const first = createDocumentRepository({ storageDir: '/storage' });
  const second = createDocumentRepository({ storageDir: '/storage' });
  const document = { id: '1', owner: 'user-1' };

  first.add(document);
  assert.equal(first.findById('1'), document);
  assert.equal(second.findById('1'), null);
});
