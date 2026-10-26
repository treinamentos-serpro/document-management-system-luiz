const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const createDocumentRepository = require('../src/repositories/documentRepository');

test('resolve nomes físicos válidos dentro do diretório absoluto de armazenamento', () => {
  const repository = createDocumentRepository({ storageDir: 'storage' });
  assert.equal(repository.getFilePath('arquivo-uuid'), path.resolve('storage', 'arquivo-uuid'));
});

test('rejeita nomes físicos com diretórios, caminhos absolutos ou entradas inválidas', () => {
  const repository = createDocumentRepository({ storageDir: 'storage' });
  const invalidNames = [
    '', '.', '..', '../segredo', 'pasta/arquivo', '/etc/passwd',
    '..\\segredo', 'C:\\segredo', '\\\\servidor\\arquivo', 'arquivo\0', null, undefined,
  ];

  for (const storageName of invalidNames) {
    assert.throws(() => repository.getFilePath(storageName), /Nome físico de arquivo inválido/);
  }
});
