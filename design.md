# Sistema de Gerenciamento de Passeios - Backend

## Visão Geral

Este é o backend de uma aplicação para gerenciamento de passeios organizados por microempresas (indivíduos) que transportam passageiros em 1 ou 2 ônibus. O sistema permite que microempresários criem e gerenciem passeios/viagens, enquanto usuários podem se inscrever nos passeios disponíveis.

## Arquitetura e Tecnologias

### Stack Tecnológico
- **Node.js** com **Express 5** - Framework web
- **MongoDB** com **Mongoose** - Banco de dados NoSQL e ODM
- **JWT (JSON Web Tokens)** - Autenticação
- **bcrypt** - Hashing de senhas
- **Multer** - Upload de imagens (armazenamento em memória)
- **CORS** - Controle de acesso cross-origin

### Estrutura do Projeto
```
server/
├── app.js                 # Aplicação principal e conexão MongoDB
├── app_curso.js           # (Arquivo alternativo - não utilizado)
├── config/
│   └── multer.js         # Configuração do Multer para upload de imagens
├── controllers/           # Controladores da aplicação
│   ├── excursionController.js
│   ├── logController.js
│   ├── pictureController.js
│   ├── testController.js
│   └── userController.js
├── models/               # Modelos Mongoose
│   ├── Excursion.js
│   ├── Log.js
│   ├── Picture.js
│   └── User.js
├── routes/               # Definições das rotas
│   ├── excursionRoutes.js
│   ├── logRoutes.js
│   ├── pictureRoutes.js
│   ├── testRoutes.js
│   └── userRoutes.js
├── utils/
│   └── logger.js         # Utilitário de logging
├── node_modules/
├── package.json
├── Readme.md
├── textify.py           # (Script auxiliar)
└── design.md           # Esta documentação
```

## Entidades do Sistema

### 1. Usuário (User)
Representa tanto os clientes quanto os administradores do sistema.

**Campos:**
- `name` (String) - Nome completo do usuário
- `email` (String) - Email único (usado para login)
- `password` (String) - Senha hashada com bcrypt
- `type` (String) - Tipo: 'user' ou 'admin'
- `picture` (ObjectId) - Referência para imagem de perfil
- `picture_base64` (String) - Campo legado (não utilizado)
- `excursions` (Array<ObjectId>) - Passeios nos quais está inscrito

**Tipos de Usuário:**
- **User**: Cliente comum que pode se inscrever em passeios
- **Admin**: Administrador com permissões para gerenciar usuários e alterar tipos

### 2. Passeio/Excursão (Excursion)
Entidade principal representando os passeios oferecidos pelas microempresas.

**Campos:**
- `name` (String, obrigatório) - Nome do passeio
- `description` (String) - Descrição detalhada
- `date` (Date) - Data e hora do passeio
- `location` (String) - Localização do passeio
- `price` (Number) - Preço por pessoa
- `type` (String, obrigatório) - Tipo: 'passeio' ou 'viagem'
- `pictures` (Array<ObjectId>) - Referências para imagens do passeio
- `users` (Array<ObjectId>) - Usuários inscritos no passeio

**Tipos de Excursão:**
- **passeio**: Passeio turístico/local
- **viagem**: Viagem mais longa/destino distante

### 3. Imagem (Picture)
Armazena imagens relacionadas aos passeios (fotos promocionais, pontos turísticos, etc.).

**Campos:**
- `name` (String, obrigatório) - Nome da imagem
- `data` (Buffer, obrigatório) - Dados binários da imagem
- `contentType` (String, obrigatório) - Tipo MIME (ex: 'image/png')

### 4. Log de Auditoria (Log)
Sistema de logging para rastrear operações importantes do sistema.

**Campos:**
- `message` (String) - Mensagem do log
- `level` (String) - Nível: 'info', 'warn', 'error'
- `timestamp` (Date) - Data/hora automática
- `meta` (Object) - Dados adicionais (userId, etc.)

## Funcionalidades Principais

### Gerenciamento de Usuários
- **Cadastro**: Criação de conta com nome, email e senha
- **Login**: Autenticação JWT retornando token e dados do usuário
- **Listagem**: Visualização de todos os usuários (admin)
- **Exclusão**: Remoção de usuários por ID
- **Controle de Acesso**: Alteração de tipo (user ↔ admin) por administradores
- **Inscrição**: Usuários podem se inscrever/cancelar em passeios

### Gerenciamento de Passeios
- **CRUD Completo**: Criar, ler, atualizar e excluir passeios
- **Listagem**: Visualização de todos os passeios com imagens e usuários
- **Detalhes**: Visualização individual de passeios
- **Inscrições**: Listagem de usuários inscritos em um passeio

### Gerenciamento de Imagens
- **Armazenamento**: Imagens armazenadas como binários no MongoDB
- **Recuperação**: Download direto das imagens
- **Associação**: Imagens são criadas e atualizadas diretamente nos passeios

### Sistema de Logs
- **Auditoria**: Logs de todas as operações importantes
- **Níveis**: Info, Warning e Error
- **Metadados**: Informações contextuais (IDs, emails, etc.)
- **Persistência**: Logs armazenados permanentemente no banco

## API REST

### Base URL
```
http://localhost:3000
```

### Endpoints Principais

#### Usuários (/SignUp/*)
- `GET /SignUp/GetAllUsers` - Lista todos os usuários
- `GET /SignUp/GetUserById/:id` - Busca usuário por ID
- `POST /SignUp/CreateUser` - Cria novo usuário
- `DELETE /SignUp/DeleteUserById/:id` - Exclui usuário
- `POST /SignUp/login/:userId` - Login (userId ignorado na lógica)
- `PUT /SignUp/ChangeUserType/:id` - Altera tipo do usuário (admin only)

#### Inscrições em Passeios
- `POST /users/:userId/subscribe/:excursionId` - Inscreve usuário em passeio
- `POST /users/:userId/unsubscribe/:excursionId` - Cancela inscrição

#### Passeios (/excursions)
- `GET /excursions` - Lista todos os passeios
- `GET /excursions/:id` - Busca passeio por ID
- `POST /excursions` - Cria novo passeio
- `PUT /excursions/:id` - Atualiza passeio
- `DELETE /excursions/:id` - Exclui passeio
- `GET /excursions/:id/users` - Lista usuários inscritos

#### Imagens (/pictures)
- `GET /pictures/:id` - Download de imagem

#### Logs (/logs)
- `GET /logs` - Lista logs do sistema

#### Teste
- `GET /test` - Health check da aplicação

## Configuração e Ambiente

### Variáveis de Ambiente (.env)
```
DB_USER=mongodb_username
DB_PASSWORD=mongodb_password
PORT=3000                    # Opcional, padrão 3000
SECRET=jwt_signing_secret    # Obrigatório para JWT
```

### Dependências
- `express`: Framework web
- `mongoose`: ODM MongoDB
- `bcrypt`: Hashing de senhas
- `jsonwebtoken`: Tokens JWT
- `cors`: Controle CORS
- `dotenv`: Variáveis de ambiente
- `multer`: Upload de arquivos

### Instalação e Execução
```bash
npm install
npm start  # Usa nodemon em desenvolvimento
```

## Fluxos de Uso

### 1. Cadastro e Login
1. Usuário se cadastra via `POST /SignUp/CreateUser`
2. Sistema valida email único e hasha senha
3. Usuário faz login via `POST /SignUp/login/:userId`
4. Sistema retorna JWT token para sessões futuras

### 2. Gerenciamento de Passeios (Admin)
1. Admin cria passeio via `POST /excursions` (com imagens incluídas)
2. Imagens são criadas diretamente no processo de criação/atualização do passeio
3. Passeios ficam disponíveis para inscrição

### 3. Inscrição em Passeios (Usuário)
1. Usuário visualiza passeios via `GET /excursions`
2. Usuário se inscreve via `POST /users/:userId/subscribe/:excursionId`
3. Sistema atualiza ambas as entidades (User e Excursion)
4. Usuário pode cancelar inscrição similarmente

### 4. Controle Administrativo
1. Admin pode alterar tipos de usuário
2. Admin pode visualizar logs de auditoria
3. Sistema registra todas as operações importantes

## Segurança

### Implementada
- Hashing de senhas com bcrypt (salt rounds: 12)
- Autenticação JWT para login
- Validação de entrada básica
- Controle de permissões (user vs admin)

### Pendências
- Middleware de autenticação para rotas protegidas
- Validação mais robusta (Joi/express-validator)
- Sanitização de entrada
- Rate limiting
- CORS configurável via env

## Melhorias Futuras

### Funcionalidades
- [ ] Sistema de pagamentos
- [ ] Notificações por email
- [ ] Avaliações e comentários dos passeios
- [ ] Capacidade máxima por passeio
- [ ] Filtros e busca avançada
- [ ] Dashboard administrativo
- [ ] Relatórios e estatísticas

### Técnica
- [ ] Middleware JWT para proteção de rotas
- [ ] Paginação para listas grandes
- [ ] Cache (Redis)
- [ ] Testes automatizados
- [ ] Documentação OpenAPI/Swagger
- [ ] Containerização (Docker)
- [ ] CI/CD pipeline

## Considerações de Design

### Modelo de Dados
- Relacionamentos bidirecionais entre User ↔ Excursion
- Imagens armazenadas como binários no MongoDB (simples mas limitado)
- Sistema de logs integrado para auditoria

### Escalabilidade
- Atualmente adequado para microempresas pequenas
- MongoDB suporta crescimento horizontal
- Estrutura modular facilita manutenção

### Usabilidade
- APIs RESTful intuitivas
- Documentação clara nos controladores
- Logs detalhados para debugging
- Separação clara de responsabilidades

---

**Data de Documentação**: Novembro 2025
**Status**: Backend funcional com APIs completas, pronto para integração com frontend
