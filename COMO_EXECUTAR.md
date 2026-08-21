# Como executar a tela de login (demonstração)

Guia para rodar o **Portal de Acesso a Exames — Unidade Móvel 121** em sua máquina.
O projeto é full-stack: backend **Laravel 12 + Sanctum** e frontend **Vue 3 + Vuetify 3.13 + Pinia**.

---

## 1. O que foi entregue

```
newProject/
├── Artefatos do sistema/          # artefatos originais (referência)
├── backend/                       # Laravel 12 (API + Sanctum + segurança)
│   ├── app/
│   │   ├── Domain/                # Value Objects: Cpf, BirthDate
│   │   ├── Application/           # UseCase + DTOs + contratos (interfaces)
│   │   ├── Infrastructure/        # Gateways e logger (LGPD)
│   │   └── Interface/             # Controllers, Requests, Resources, Middlewares
│   ├── database/migrations/       # patients, login_attempts, tokens
│   ├── routes/api.php             # rota pública POST /api/acesso
│   ├── routes/api.protected.php   # rotas protegidas (Sanctum)
│   └── tests/                     # PHPUnit (unit + feature)
├── frontend/                      # Vue 3 + Vuetify 3.13 + Pinia + TypeScript
│   └── src/
│       ├── components/auth/LoginForm.vue
│       ├── views/LoginView.vue
│       ├── views/ResultView.vue
│       ├── stores/auth.ts         # Pinia
│       ├── services/AuthService.ts
│       ├── composables/useAccess.ts
│       └── router/                # guards
└── docs/postman-collection.json   # collection dos endpoints
```

> Nota sobre versões: o prompt cita "Laravel 13" e "Vuetify 3.13". Não existe
> release estável do Laravel 13; foi usado **Laravel 12** (o mais recente estável,
> compatível com PHP 8.2). **Vuetify 3.13** existe e foi usado exatamente.

---

## 2. Pré-requisitos

| Ferramenta | Versão mínima | Como verificar |
|---|---|---|
| PHP | 8.2+ | `php -v` |
| Composer | 2.x | `composer --version` |
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |

Extensões PHP necessárias: `pdo`, `pdo_sqlite`, `openssl`, `mbstring`.
(O backend usa **SQLite** — não é preciso instalar MySQL/PostgreSQL.)

---

## 3. Rodando o backend (API)

```bash
cd backend

# 1. Instala as dependências (já instaladas, mas não custa garantir)
composer install

# 2. Cria o arquivo de ambiente, se não existir
cp .env.example .env

# 3. Gera a chave da aplicação (já gerada neste projeto)
php artisan key:generate

# 4. Cria o banco SQLite e roda as migrations
touch database/database.sqlite
php artisan migrate

# 5. Sobe o servidor de desenvolvimento
php artisan serve --host=127.0.0.1 --port=8000
```

A API fica em `http://localhost:8000`.

### Testando a API rapidamente (sem frontend)

```bash
curl -X POST http://localhost:8000/api/acesso \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"cpf":"123.456.789-09","nascimento":"15/03/1990"}'
```

Resposta esperada (200):

```json
{
  "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxx",
  "status": "nao_disponivel",
  "message": "Resultado de exame ainda não disponível."
}
```

---

## 4. Rodando o frontend (Vue + Vuetify)

Em **outro terminal**:

```bash
cd frontend

# 1. Instala as dependências (já instaladas)
npm install

# 2. Sobe o servidor de desenvolvimento
npm run dev
```

O frontend fica em `http://localhost:5173`.

O Vite faz **proxy** de `/api` para `http://localhost:8000`, então não é
necessário configurar CORS na máquina de demonstração.

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
   `/resultado` (usa o token do Sanctum) e depois **"Sair"** (logout).

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
| GET | `/api/exames/status` | `Bearer` (Sanctum) | Retorna o status do exame |
| POST | `/api/logout` | `Bearer` (Sanctum) | Revoga todos os tokens |

Collection do Postman: `docs/postman-collection.json`.

---

## 7. Executando os testes automatizados

```bash
cd backend
php artisan test
```

Cobre validação de CPF/data (unit), login válido/inválido, rota protegida,
headers de segurança, log anonimizado (LGPD) e lockout de IP (feature).

```bash
cd frontend
npm run typecheck   # verificação de tipos
npm run build       # build de produção
```

---

## 8. Segurança implementada

- **Rate limiting** — `throttle:5,1` + lockout de 15 min após 5 falhas (`AccessThrottle`).
- **Headers de segurança** — `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `HSTS`, `CSP`, `Permissions-Policy` (`SecurityHeaders`).
- **LGPD** — apenas *hashes* (HMAC-SHA256 salgado) de CPF, IP e user-agent são
  persistidos na tabela `login_attempts`; o CPF cru nunca é armazenado.
- **Sanctum** — tokens com habilidade `exames:read`, expiração de 120 min e
  revogação no logout.
- **CSRF/CORS** — configuração em `config/cors.php` com origens restritas.

---

## 9. Estrutura e fluxo (resumo)

```
Frontend (LoginForm)            Backend (Laravel)
     │  POST /api/acesso            │
     │  {cpf, nascimento} ─────────►│ AccessRequest (valida formato)
     │                              │ AuthenticatePatientUseCase
     │                              │   ├─ Cpf::fromString()      (dígito verificador)
     │                              │   ├─ BirthDate::fromDmy()   (data real)
     │                              │   ├─ AccessAttemptLogger    (log LGPD)
     │                              │   ├─ ExamStatusGateway      ("não disponível")
     │                              │   └─ Patient::createToken() (Sanctum)
     │  ◄──────── {token, status, message}
     │  Pinia guarda token          │
     │  GET /api/exames/status ────►│ auth:sanctum → 200
```

O fluxo preserva a regra do `portal-exames-unidade-movel.md`: **sem cadastro,
sem senha tradicional, sem recuperação de acesso** — o "Login" é o CPF e a
"Senha" é a data de nascimento, e o resultado sempre indica indisponibilidade
(não há base de exames integrada nesta fase).
