# Be Sustainable - Backend

Backend para a aplicação Be Sustainable, desenvolvido com Node.js, Express, TypeScript e PostgreSQL.

## Requisitos

### Opção 1: Com Docker (Recomendado)
- Docker
- Docker Compose

### Opção 2: Sem Docker
- Node.js (v14 ou superior)
- PostgreSQL (v12 ou superior)
- npm ou yarn

## Instalação e Execução

### Usando Docker (Recomendado)

1. Certifique-se de ter o Docker e Docker Compose instalados
2. Na raiz do projeto (pasta que contém as pastas frontend e backend), execute:
```bash
docker-compose up -d
```

Isso irá:
- Criar e iniciar o container do PostgreSQL
- Criar e iniciar o container do backend
- Configurar a rede entre os containers
- Criar um volume persistente para o banco de dados

Para parar os containers:
```bash
docker-compose down
```

Para ver os logs:
```bash
docker-compose logs -f
```

### Instalação Manual (Sem Docker)

1. Clone o repositório
2. Navegue até a pasta do backend:
```bash
cd backend
```

3. Instale as dependências:
```bash
npm install
```

4. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASS=postgres
DB_NAME=be_sustainable
JWT_SECRET=your-super-secret-key-change-this-in-production
```

5. Crie o banco de dados PostgreSQL:
```sql
CREATE DATABASE be_sustainable;
```

6. Execute as migrações do banco de dados:
```bash
npm run build
npm run start
```

## Estrutura do Projeto

```
src/
  ├── config/         # Configurações do projeto
  ├── models/         # Modelos do Sequelize
  ├── routes/         # Rotas da API
  └── server.ts       # Arquivo principal
```

## Endpoints da API

### Usuários
- POST /api/users/register - Registrar novo usuário
- POST /api/users/login - Login de usuário
- GET /api/users/profile/:id - Obter perfil do usuário
- PUT /api/users/points/:id - Atualizar pontos do usuário

### Tarefas
- POST /api/tasks - Criar nova tarefa
- GET /api/tasks/user/:userId - Listar tarefas do usuário
- PUT /api/tasks/:id/complete - Marcar tarefa como concluída
- DELETE /api/tasks/:id - Excluir tarefa

### Níveis
- POST /api/levels - Criar novo nível
- GET /api/levels - Listar todos os níveis
- GET /api/levels/by-points/:points - Obter nível por pontuação
- PUT /api/levels/:id - Atualizar nível

## Scripts Disponíveis

- `npm run dev` - Executa o servidor em modo de desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm start` - Executa o servidor em produção

## Licença

MIT 