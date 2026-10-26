import { test } from 'node:test';
import assert from 'node:assert/strict';
import { downloadDocument, listDocuments, uploadDocument } from '../src/services/documentApi.js';

test('lista documentos com identidade e sinal de cancelamento', async (context) => {
  const controller = new AbortController();
  const documents = [{ id: '1', originalName: 'relatorio.txt' }];
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/documents');
    assert.equal(options.headers['X-User-Id'], 'user-1');
    assert.equal(options.signal, controller.signal);
    return Response.json(documents);
  });

  assert.deepEqual(await listDocuments('user-1', { signal: controller.signal }), documents);
});

test('propaga cancelamento para que o consumidor ignore respostas obsoletas', async (context) => {
  const controller = new AbortController();
  context.mock.method(globalThis, 'fetch', async (url, { signal }) => {
    signal.throwIfAborted();
  });
  controller.abort();

  await assert.rejects(listDocuments('user-1', { signal: controller.signal }), {
    name: 'AbortError',
  });
});

test('envia o arquivo como multipart sem definir Content-Type manualmente', async (context) => {
  const document = { id: '1' };
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/upload');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['X-User-Id'], 'user-1');
    assert.equal(options.headers['Content-Type'], undefined);
    assert.equal(await options.body.get('file').text(), 'conteudo');
    return Response.json(document, { status: 201 });
  });

  assert.deepEqual(await uploadDocument(new Blob(['conteudo']), 'user-1'), document);
});

test('codifica o identificador do download e retorna o conteúdo binário', async (context) => {
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/documents/id%2Fespecial/download');
    assert.equal(options.headers['X-User-Id'], 'user-1');
    return new Response('conteudo');
  });

  assert.equal(await (await downloadDocument('id/especial', 'user-1')).text(), 'conteudo');
});

test('apresenta erros da API e mantém erro HTTP quando a resposta não é JSON', async (context) => {
  const fetchMock = context.mock.method(globalThis, 'fetch', async () => (
    Response.json({ error: 'O arquivo excede o limite permitido.' }, { status: 413 })
  ));
  await assert.rejects(listDocuments('user-1'), /O arquivo excede o limite permitido/);

  fetchMock.mock.mockImplementation(async () => new Response('Indisponível', { status: 502 }));
  await assert.rejects(listDocuments('user-1'), /Falha na requisição \(HTTP 502\)/);
});
