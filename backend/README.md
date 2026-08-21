# Backend — Portal de Exames (Node.js)

API em Node.js + Express + TypeScript que atende o portal de acesso a exames da
Unidade Móvel 121. Porte do backend Laravel anterior, mantendo a mesma
arquitetura em camadas e o mesmo contrato HTTP.

## Requisitos

- Node.js 20+ (testado no 22)

## Como executar

```bash
cp .env.example .env
# gere uma APP_KEY fixa:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

npm install
npm run dev      # http://localhost:8000
```

Produção:

```bash
npm run build && npm start
```

## Endpoints

| Método | Rota                 | Autenticação | Resposta                                        |
| ------ | -------------------- | ------------ | ----------------------------------------------- |
| POST   | `/api/acesso`        | pública      | `200 {token,status,message}` ou `422 {errors}`   |
| GET    | `/api/exames/status` | Bearer token | `200 {status,message}` ou `401`                  |
| POST   | `/api/logout`        | Bearer token | `200 {message}`                                 |
| GET    | `/up`                | pública      | health check                                    |

Corpo de `/api/acesso`: `{ "cpf": "123.456.789-09", "nascimento": "15/03/1990" }`.

## Arquitetura

```
src/
  domain/value-objects/     Cpf, BirthDate — regras de validação
  application/
    contracts/              ExamStatusGateway, AccessAttemptLogger, TokenIssuer
    dtos/                   AccessCredentials, AccessResult
    use-cases/              AuthenticatePatientUseCase
  infrastructure/
    db/                     SQLite (patients, access_tokens, login_attempts)
    services/               implementações dos contratos
  interface/http/           app, rotas, controllers, middlewares
```

Quando a base real de exames existir, basta trocar
`UnavailableExamStatusGateway` por uma implementação que consulte a base — o
caso de uso não muda.

## Segurança e LGPD

- CPF, IP e user-agent só são gravados como HMAC-SHA256 salgado com `APP_KEY`.
- Tokens são opacos e persistidos apenas em hash.
- Limite de 5 requisições por minuto por IP e bloqueio de 15 minutos após 5
  falhas.
- Cabeçalhos de segurança (Helmet) e CORS restrito a `CORS_ORIGINS`.

## Testes

```bash
npm test
```
