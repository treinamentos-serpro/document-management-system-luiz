const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const appModule = require('../src/app');

async function startTestServer(options = {}) {
  const storageDir = await mkdtemp(path.join(tmpdir(), 'dms-test-'));
  const app = appModule.createApp({ storageDir, ...options });
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    cleanup: async () => {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      await rm(storageDir, { recursive: true, force: true });
    },
  };
}

test('o app backend é exportado', () => {
  assert.ok(appModule, 'o app deve estar definido');
  assert.strictEqual(typeof appModule, 'function', 'o app Express deve ser uma função');
});

test('envia, lista e baixa um documento apenas para seu dono', async (context) => {
  const server = await startTestServer();
  context.after(server.cleanup);

  const uploadBody = new FormData();
  uploadBody.append('file', new Blob(['conteudo do documento']), 'relatorio.txt');
  const uploadResponse = await fetch(`${server.baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'user-1' },
    body: uploadBody,
  });

  assert.equal(uploadResponse.status, 201);
  const document = await uploadResponse.json();
  assert.equal(document.originalName, 'relatorio.txt');
  assert.equal(document.size, 21);
  assert.equal(document.owner, 'user-1');
  assert.equal(typeof document.id, 'string');
  assert.equal(typeof document.uploadedAt, 'string');
  assert.equal('storageName' in document, false);

  const ownDocuments = await fetch(`${server.baseUrl}/documents`, {
    headers: { 'X-User-Id': 'user-1' },
  });
  assert.deepEqual(await ownDocuments.json(), [document]);

  const otherDocuments = await fetch(`${server.baseUrl}/documents`, {
    headers: { 'X-User-Id': 'user-2' },
  });
  assert.deepEqual(await otherDocuments.json(), []);

  const downloadResponse = await fetch(
    `${server.baseUrl}/documents/${document.id}/download`,
    { headers: { 'X-User-Id': 'user-1' } },
  );
  assert.equal(downloadResponse.status, 200);
  assert.equal(await downloadResponse.text(), 'conteudo do documento');
  assert.match(downloadResponse.headers.get('content-disposition'), /relatorio\.txt/);

  const forbiddenDownload = await fetch(
    `${server.baseUrl}/documents/${document.id}/download`,
    { headers: { 'X-User-Id': 'user-2' } },
  );
  assert.equal(forbiddenDownload.status, 404);
});

test('retorna erro consistente quando identidade ou arquivo estão ausentes', async (context) => {
  const server = await startTestServer();
  context.after(server.cleanup);

  const missingIdentity = await fetch(`${server.baseUrl}/documents`);
  assert.equal(missingIdentity.status, 400);
  assert.equal(typeof (await missingIdentity.json()).error, 'string');

  const missingFileBody = new FormData();
  const missingFile = await fetch(`${server.baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'user-1' },
    body: missingFileBody,
  });
  assert.equal(missingFile.status, 400);
  assert.equal(typeof (await missingFile.json()).error, 'string');
});

test('rejeita uploads acima do limite configurado', async (context) => {
  const server = await startTestServer({ maxFileSizeBytes: 4 });
  context.after(server.cleanup);

  const uploadBody = new FormData();
  uploadBody.append('file', new Blob(['conteudo']), 'grande.txt');
  const response = await fetch(`${server.baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'user-1' },
    body: uploadBody,
  });

  assert.equal(response.status, 413);
  assert.equal(typeof (await response.json()).error, 'string');
});
