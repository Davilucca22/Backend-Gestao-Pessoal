# Backend-Gestao-Pessoal

## Configuração

Use Node.js e configure as variáveis de ambiente antes de iniciar o servidor:

- `DATABASE_CONNECT`: string de conexão do PostgreSQL.
- `SECRET`: chave usada para assinar os tokens JWT; deve ter pelo menos 32 caracteres.
- `URLFRONT`: origens permitidas para o frontend, separadas por vírgula quando houver mais de uma.
- `PORT`: porta HTTP (opcional; padrão `3000`).
- `DATABASE_SSL`: use `false` somente em ambiente local sem TLS. Por padrão, o PostgreSQL usa TLS com validação do certificado.

Inicie em desenvolvimento com `npm run dev` ou diretamente com `node server.js`.