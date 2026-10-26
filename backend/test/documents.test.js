const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { readFile, readdir, unlink } = require('node:fs/promises');
const path = require('node:path');
const app = require('../src/app');
const { storageDirectory } = require('../src/config/storage');

test('endpoints de documentos', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => {
    server.closeAllConnections();
    server.close((error) => error ? reject(error) : resolve());
  }));
  await once(server, 'listening');
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  let uploadedDocument;
  const content = 'Documento de teste.\n';

  await t.test('preserva o endpoint de saúde', async () => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
  });

  await t.test('lista inicialmente vazia', async () => {
    const response = await fetch(`${baseUrl}/documents`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), []);
  });

  await t.test('faz upload e grava o arquivo no armazenamento local', async () => {
    const form = new FormData();
    form.append('file', new Blob([content]), 'documento.txt');
    const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
    assert.equal(response.status, 201);
    uploadedDocument = await response.json();
    assert.match(uploadedDocument.id, /^[0-9a-f-]{36}$/);
    const filePath = path.join(storageDirectory, uploadedDocument.id);
    t.after(() => unlink(filePath).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    }));
    assert.equal(uploadedDocument.originalName, 'documento.txt');
    assert.equal(uploadedDocument.size, Buffer.byteLength(content));
    assert.equal(uploadedDocument.owner, 'anonymous');
    assert.ok(Number.isFinite(Date.parse(uploadedDocument.createdAt)));
    assert.equal(await readFile(filePath, 'utf8'), content);
  });

  await t.test('lista os metadados do documento enviado', async () => {
    const response = await fetch(`${baseUrl}/documents`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [uploadedDocument]);
  });

  await t.test('baixa o conteúdo com o nome original', async () => {
    const response = await fetch(`${baseUrl}/documents/${uploadedDocument.id}/download`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-disposition'), /attachment;.*documento\.txt/);
    assert.equal(await response.text(), content);
  });

  await t.test('rejeita upload sem arquivo', async () => {
    const response = await fetch(`${baseUrl}/upload`, { method: 'POST' });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'Envie um arquivo no campo "file".' });
  });

  await t.test('rejeita campo de arquivo inesperado', async () => {
    const form = new FormData();
    form.append('unexpected', new Blob([content]), 'documento.txt');
    const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
    assert.equal(response.status, 400);
    assert.ok((await response.json()).error);
  });

  await t.test('rejeita arquivos maiores que 10 MiB', async () => {
    const filesBefore = await readdir(storageDirectory);
    const form = new FormData();
    form.append('file', new Blob([Buffer.alloc(10 * 1024 * 1024 + 1)]), 'grande.txt');
    const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
    assert.equal(response.status, 413);
    await response.json();
    const list = await fetch(`${baseUrl}/documents`);
    assert.deepEqual(await list.json(), [uploadedDocument]);
    assert.deepEqual(await readdir(storageDirectory), filesBefore);
  });

  await t.test('rejeita múltiplos arquivos e remove uploads parciais', async () => {
    const filesBefore = await readdir(storageDirectory);
    const form = new FormData();
    form.append('file', new Blob([content]), 'primeiro.txt');
    form.append('file', new Blob([content]), 'segundo.txt');
    const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
    assert.equal(response.status, 400);
    await response.json();
    assert.deepEqual(await readdir(storageDirectory), filesBefore);
    const list = await fetch(`${baseUrl}/documents`);
    assert.deepEqual(await list.json(), [uploadedDocument]);
  });

  await t.test('retorna 404 para documento desconhecido', async () => {
    const response = await fetch(`${baseUrl}/documents/inexistente/download`);
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Documento não encontrado.' });
  });

  await t.test('não permite caminhos arbitrários no download', async () => {
    const response = await fetch(`${baseUrl}/documents/${encodeURIComponent('../package.json')}/download`);
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Documento não encontrado.' });
  });

  await t.test('retorna 404 se o arquivo foi removido do disco', async () => {
    await unlink(path.join(storageDirectory, uploadedDocument.id));
    const response = await fetch(`${baseUrl}/documents/${uploadedDocument.id}/download`);
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Documento não encontrado.' });
  });
});
