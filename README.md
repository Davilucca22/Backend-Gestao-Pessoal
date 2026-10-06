# Backend-Gestao-Pessoal

## Configuração

Use Node.js e configure as variáveis de ambiente antes de iniciar o servidor:

- `DATABASE_CONNECT`: string de conexão do PostgreSQL.
- `SECRET`: chave usada para assinar os tokens JWT; deve ter pelo menos 32 caracteres.
- `URLFRONT`: origens permitidas para o frontend, separadas por vírgula quando houver mais de uma.
- `PORT`: porta HTTP (opcional; padrão `3000`).
- `DATABASE_SSL`: use `false` somente em ambiente local sem TLS. Por padrão, o PostgreSQL usa TLS com validação do certificado.

Em desenvolvimento, se `URLFRONT` não estiver definido, são permitidas as origens Vite `http://localhost:5173` e `http://127.0.0.1:5173`. Em produção, configure explicitamente `URLFRONT`.

Inicie em desenvolvimento com `npm run dev` ou diretamente com `node server.js`.

Ao iniciar, o backend cria as tabelas `USER_APP_DATA` e `USER_APP_RECORDS`. O documento JSONB preserva os dados completos do frontend; as coleções compatíveis também são sincronizadas transacionalmente com as tabelas existentes `FINANCIAS`, `HABITOS`, `DIAS_HABITOS`, `AGENDA`, `CALENDARIO`, `TREINOS` e `EXERCICIOS`. `USER_APP_RECORDS` mapeia os IDs do frontend para os IDs relacionais e permite atualizar/remover somente os registros criados pela sincronização. A primeira leitura após a atualização migra dados JSONB já existentes para as tabelas relacionais. Tipos financeiros personalizados e metadados sem coluna correspondente continuam preservados em JSONB. O usuário do PostgreSQL precisa ter permissão para criar tabelas e adicionar a coluna de sincronização.