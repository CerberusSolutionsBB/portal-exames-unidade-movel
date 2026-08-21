# Como executar a tela de login (demonstração)

Guia para rodar o **Portal de Acesso a Exames — Unidade Móvel 121** em sua máquina.
O projeto é full-stack: backend **Node.js 20+ (Express + TypeScript + SQLite)** e
frontend **Vue 3 + Vuetify 3.13 + Pinia**.

---

## 1. O que foi entregue

```
newProject/
├── Artefatos do sistema/          # artefatos originais (referência)
├── backend/                       # Node.js + Express + TypeScript
│   └── src/
│       ├── domain/value-objects/  # Cpf, BirthDate (regras de validação)
│       ├── application/           # UseCase + DTOs + contratos (interfaces)
│       ├── infrastructure/        # SQLite, gateways e logger (LGPD)
│       └── interface/http/        # app, rotas, controllers, middlewares
│   └── tests/                     # Vitest (domínio + HTTP)
├── frontend/                      # Vue 3 + Vuetify 3.13 + Pinia + TypeScript
│   └── src/
│       ├── components/auth/LoginForm.vue
│       ├── views/LoginView.vue
│       ├── views/ResultView.vue
│       ├── stores/auth.ts         # Pinia
│       ├── services/AuthService.ts
│       ├── services/DemoAccessBackend.ts  # modo demo (GitHub Pages)
│       ├── composables/useAccess.ts
│       └── router/                # guards
├── index.html + assets/           # build publicado no GitHub Pages
└── docs/postman-collection.json   # collection dos endpoints
```

---

## 2. Pré-requisitos

| Ferramenta | Versão mínima | Como verificar |
|---|---|---|
| Node.js | 20+ (testado no 22) | `node -v` |
| npm | 9+ | `npm -v` |

O backend usa **SQLite** via `better-sqlite3` — não é preciso instalar
MySQL/PostgreSQL nem PHP.

---

## 3. Rodando o backend (API)

```bash
cd backend

# 1. Instala as dependências
npm install

# 2. Cria o arquivo de ambiente
cp .env.example .env

# 3. Gera uma APP_KEY fixa e cole no .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. Sobe o servidor de desenvolvimento (cria o SQLite no primeiro boot)
npm run dev
```

A API fica em `http://localhost:8000` (health check em `/up`).

Para produção: `npm run build && npm start`.

### Testando a API rapidamente (sem frontend)

```bash
curl -X POST http://localhost:8000/api/acesso \
  -H "Content-Type: application/json" \
  -d '{"cpf":"123.456.789-09","nascimento":"15/03/1990"}'
```

Resposta esperada (200):

```json
{
  "token": "0e8662316bf36b75cb55abd13f3df114...",
  "status": "nao_disponivel",
  "message": "Resultado de exame ainda não disponível."
}
```

---

## 4. Rodando o frontend (Vue + Vuetify)

Em **outro terminal**:

```bash
cd frontend
npm install
npm run dev
```

O frontend fica em `http://localhost:5173`.

O Vite faz **proxy** de `/api` para `http://localhost:8000`, então não é
necessário configurar CORS na máquina de demonstração. O backend já libera as
origens `5173`/`4173` via `CORS_ORIGINS`.

---

## 5. Demonstração (roteiro)

1. Abra `http://localhost:5173` no navegador.
2. Preencha:
   - **Login:** um CPF válido, por exemplo `123.456.789-09` (a máscara
     `000.000.000-00` é aplicada enquanto digita).
   - **Senha:** uma data de nascimento real, por exemplo `15/03/1990`
     (máscara `DD/MM/AAAA`).
3. Clique em **"Acessar exame"**.
   - Aparece **"Dados validados"** com o aviso em destaque
     **"Resultado de exame ainda não disponível."**
4. Clique em **"Consultar status do exame"** para navegar à rota protegida
   `/resultado` (usa o token emitido) e depois **"Sair"** (logout).

### Casos de erro para demonstrar

- **CPF inválido** (ex.: `111.111.111-11` ou `123.456.789-00`) → campo fica
  vermelho com "Informe um CPF válido." e o foco volta ao campo.
- **Data impossível** (ex.: `31/02/1990`) → "Informe uma data de nascimento válida."
- **5 tentativas falhas** → IP bloqueado por 15 minutos (`HTTP 429`).

---

## 6. Endpoints

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| POST | `/api/acesso` | pública (rate limit 5/min + lockout) | Valida CPF+nascimento, emite token e retorna status |
| GET | `/api/exames/status` | `Bearer` | Retorna o status do exame |
| POST | `/api/logout` | `Bearer` | Revoga todos os tokens do paciente |
| GET | `/up` | pública | Health check |

Collection do Postman: `docs/postman-collection.json`.

---

## 7. Executando os testes automatizados

```bash
cd backend
npm test          # Vitest: domínio, login, rota protegida, segurança
npm run typecheck
```

```bash
cd frontend
npm run typecheck   # verificação de tipos
npm run build       # build de produção
```

---

## 8. Publicação no GitHub Pages

O build publicado na raiz do repositório (`index.html` + `assets/`) atende
`https://cerberussolutionsbb.github.io/portal-exames-unidade-movel`.

O Pages é **hospedagem estática**: ele não executa a API. Por isso a build de
produção lê `frontend/.env.production`:

- `VITE_API_BASE_URL` **vazio** → **modo demonstração**: a validação de CPF e
  data acontece no navegador e a tela mostra "Resultado de exame ainda não
  disponível.". Nenhum dado do paciente sai do dispositivo e nenhuma requisição
  é feita (era daí que vinha o erro `405 Method Not Allowed` em
  `/api/acesso`).
- `VITE_API_BASE_URL=https://sua-api.exemplo.com/api` → a tela passa a chamar o
  backend Node de verdade. Lembre de incluir a origem do Pages em
  `CORS_ORIGINS` no backend.

Para republicar após alterações no frontend:

```bash
cd frontend && npm run build
cd .. && rm -rf assets index.html && cp -r frontend/dist/assets assets && cp frontend/dist/index.html index.html
```

O roteador usa **hash history** (`/#/`), o que dispensa configuração de
rewrite no Pages, e `base: './'` mantém os assets relativos ao subdiretório do
repositório.

---

## 9. Segurança implementada

- **Rate limiting** — 5 requisições/min por IP + lockout de 15 min após 5 falhas.
- **Headers de segurança** — `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `HSTS`, `CSP`, `Permissions-Policy` (via Helmet).
- **LGPD** — apenas *hashes* (HMAC-SHA256 salgado com `APP_KEY`) de CPF, IP e
  user-agent são persistidos em `login_attempts`; o CPF cru nunca é armazenado.
- **Tokens opacos** — 40 bytes aleatórios, guardados só em hash no banco e
  revogados no logout.
- **CORS** — origens restritas por `CORS_ORIGINS`.

---

## 10. Estrutura e fluxo (resumo)

```
Frontend (LoginForm)            Backend (Node/Express)
     │  POST /api/acesso            │
     │  {cpf, nascimento} ─────────►│ AccessController (valida o formato)
     │                              │ AuthenticatePatientUseCase
     │                              │   ├─ Cpf.fromString()       (dígito verificador)
     │                              │   ├─ BirthDate.fromDmy()    (data real)
     │                              │   ├─ AccessAttemptLogger    (log LGPD)
     │                              │   ├─ ExamStatusGateway      ("não disponível")
     │                              │   └─ TokenIssuer            (token opaco)
     │  ◄──────── {token, status, message}
     │  Pinia guarda token          │
     │  GET /api/exames/status ────►│ authenticate() → 200
```

O fluxo preserva a regra do `portal-exames-unidade-movel.md`: **sem cadastro,
sem senha tradicional, sem recuperação de acesso** — o "Login" é o CPF e a
"Senha" é a data de nascimento, e o resultado sempre indica indisponibilidade
(não há base de exames integrada nesta fase).
