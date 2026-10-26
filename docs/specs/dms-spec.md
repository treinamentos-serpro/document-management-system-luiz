# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, listem e baixem documentos armazenados no filesystem local da aplicação, com metadados mantidos em memória.

## 2. Escopo

### Dentro do escopo

- Envio de documentos por usuário.
- Listagem dos documentos associados ao usuário.
- Download de documentos pelo identificador.
- Interface web para upload, listagem e download, em etapa de implementação posterior.
- Armazenamento dos arquivos no filesystem local e dos metadados em memória.

### Fora do escopo

- Armazenamento em nuvem ou serviços externos.
- Banco de dados ou persistência dos metadados após reinício do backend.
- Versionamento, edição ou exclusão de documentos.
- Autenticação completa e gestão de contas.
- Pré-visualização ou processamento do conteúdo dos arquivos.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um arquivo em uma requisição `multipart/form-data`, no campo `file`. |
| RF-02 | O sistema gera um identificador único e grava o arquivo em diretório local usando Multer com `diskStorage`. |
| RF-03 | O sistema registra `id`, `originalName`, `size`, `uploadedAt` e `owner` em memória. |
| RF-04 | O usuário pode listar os metadados dos documentos associados à sua identidade. |
| RF-05 | O usuário pode baixar um documento pelo identificador se ele estiver associado à sua identidade. |
| RF-06 | O nome original é preservado nos metadados e usado como nome sugerido no download; não é usado como nome físico do arquivo. |
| RF-07 | O sistema informa erros de entrada inválida, documento inexistente e falhas de armazenamento sem expor detalhes internos. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos são gravados exclusivamente no filesystem local com Multer `diskStorage`. |
| RNF-02 | Os metadados são mantidos em memória e podem ser perdidos ao reiniciar o processo. |
| RNF-03 | Porta, diretório e limite de upload são configuráveis por `PORT`, `STORAGE_DIR` e `MAX_FILE_SIZE_BYTES`. |
| RNF-04 | O diretório padrão é `backend/storage`; o limite padrão é 10 MiB. |
| RNF-05 | O backend segue o fluxo `routes -> controllers -> services -> repositories`; camadas internas não dependem das externas. |
| RNF-06 | Os testes do backend usam o runner nativo `node:test`. |
| RNF-07 | O frontend consome a API pelo prefixo `/api`, encaminhado pelo proxy do Vite. |

## 5. Modelo de dados

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único gerado pelo sistema. |
| `originalName` | string | Nome original do arquivo enviado. |
| `size` | number | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Data e hora do upload em ISO 8601. |
| `owner` | string | Identificador do usuário associado ao documento. |
| `storageName` | string | Nome físico interno do arquivo; não é exposto pela API. |

O registro completo é mantido em memória. O arquivo correspondente fica em `STORAGE_DIR`.

## 6. Contratos de API

No ambiente de desenvolvimento, o frontend chama os endpoints pelo prefixo `/api`, removido pelo proxy do Vite.

### Identidade do usuário

Nesta fase sem autenticação, as requisições usam o cabeçalho `X-User-Id` para identificar o dono dos documentos. Esse valor não é um mecanismo de autenticação confiável e não deve ser usado como proteção em um serviço exposto à internet.

### `POST /upload`

- Entrada: `multipart/form-data` com arquivo no campo `file` e cabeçalho `X-User-Id`.
- Sucesso: `201 Created`, metadados públicos do documento.
- Erros: `400` para identidade ou arquivo ausentes; `413` para arquivo acima do limite; `500` para falha de gravação.
- A resposta não inclui `storageName` nem caminho local.

### `GET /documents`

- Entrada: cabeçalho `X-User-Id`.
- Sucesso: `200 OK`, lista de metadados do usuário ou lista vazia.
- Erro: `400` quando a identidade está ausente.

### `GET /documents/:id/download`

- Entrada: identificador na rota e cabeçalho `X-User-Id`.
- Sucesso: `200 OK`, conteúdo binário com `Content-Disposition` usando o nome original.
- Erros: `400` quando a identidade está ausente; `404` quando o documento não existe ou não pertence ao usuário; `500` para falha de leitura.

As respostas de erro usam JSON no formato `{ "error": "mensagem" }`, sem stack traces ou caminhos locais.

## 7. Decisões arquiteturais e riscos

- `routes/` define endpoints e delega; `controllers/` trata HTTP e validação de entrada; `services/` concentra regras de negócio; `repositories/` gerencia metadados e arquivos locais.
- O nome físico do arquivo é gerado pelo sistema, separado do nome original fornecido pelo cliente.
- Metadados em memória desaparecem após reinício, podendo deixar arquivos sem referência no diretório local. Recuperação ou limpeza automática não fazem parte desta fase.
- `X-User-Id` pode ser falsificado; autenticação real permanece fora do escopo.

## 8. Plano de execução da especificação

Este plano cobre somente a elaboração e revisão deste documento. A execução de arquivos do backend e do frontend fica para uma etapa posterior.

1. Consolidar objetivo, escopo e requisitos funcionais e não funcionais a partir do modelo e das instruções do projeto.
2. Definir o modelo de dados, os contratos HTTP, a identidade do usuário e as respostas de erro.
3. Registrar decisões arquiteturais, restrições de armazenamento local e riscos conhecidos.
4. Revisar a consistência com Clean Architecture simples, Multer `diskStorage` e metadados em memória.

### Critérios de aceite

- O documento especifica upload, listagem e download, incluindo entradas, saídas e erros.
- O armazenamento permanece local; não há dependência de provedores externos ou banco de dados.
- O plano não inclui execução de arquivos backend ou frontend.