# Document Management System com GitHub Copilot

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey lzferreira!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/treinamentos-serpro/document-management-system-luiz/issues/1)

---

## Backend e CI

Com Node.js 24, execute `npm install` em `backend` e `frontend`.
Em `backend`, `npm test` roda os testes HTTP e `npm start` inicia o servidor
na porta definida por `PORT` (padrão: 3000). Em `frontend`, `npm run build`
gera o build. O workflow `.github/workflows/ci.yml` executa instalação,
build e testes em pushes e pull requests.

- `POST /upload`: multipart com um único arquivo no campo `file`, até 10 MiB;
  retorna os metadados com status 201.
- `GET /documents`: lista os metadados em memória.
- `GET /documents/:id/download`: baixa o arquivo pelo identificador.

Arquivos ficam em `backend/storage`, com nomes UUID. Metadados são perdidos
ao reiniciar o servidor; arquivos persistem no disco. Nesta etapa não há
autenticação e o dono é registrado como `anonymous`.
Upload e download compartilham um limite de 60 requisições por minuto por IP;
excedê-lo retorna status 429.

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)
