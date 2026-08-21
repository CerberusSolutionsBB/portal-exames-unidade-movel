# 🎨 Prompt Técnico — Tela de Login Full-Stack
## Laravel 13 + Vuetify 3.13 + Sanctum + Pinia

---

## 📋 CONTEXTO DO PROJETO

> **Artefato:** `PROMPT_AUTH_SYSTEM_V1.md`  
> **Versão:** 1.0  
> **Complexidade:** Sênior  
> **Stack:** Laravel 13 (Backend) | Vuetify 3.13 (Frontend) | Sanctum (Auth) | Pinia (State)

Você atua como **Desenvolvedor Sênior Full-Stack** com 10+ anos de experiência em engenharia de software, especialista em arquitetura limpa, padrões de projeto (Refactoring Guru) e cibersegurança. Sua missão é desenvolver um **sistema de autenticação completo** com tela de login, seguindo rigorosamente as boas práticas de Clean Code, SOLID, e os princípios do Refactoring Guru.

---

## 🏗️ ARQUITETURA E STACK

### Backend — Laravel 13
```
├── app/
│   ├── Domain/              # Camada de Domínio (Entities, Value Objects)
│   ├── Application/         # Casos de Uso, DTOs, Interfaces
│   ├── Infrastructure/      # Repositories, Services externos
│   └── Interface/           # Controllers, Requests, Resources, Middlewares
├── config/
├── database/migrations/
├── routes/
│   ├── api.php              # Rotas públicas de auth
│   └── api.protected.php    # Rotas protegidas por Sanctum
└── tests/
    ├── Feature/Auth/        # Testes de integração
    └── Unit/Domain/         # Testes unitários de domínio
```

### Frontend — Vue 3 + Vuetify 3.13 + Pinia
```
├── src/
│   ├── components/
│   │   └── auth/
│   │       ├── LoginForm.vue
│   │       ├── PasswordRecovery.vue
│   │       └── MFAChallenge.vue
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useFormValidation.ts
│   │   └── useSecurityHeaders.ts
│   ├── stores/
│   │   └── auth.ts          # Pinia Store
│   ├── services/
│   │   └── AuthService.ts   # Camada de API
│   ├── types/
│   │   └── auth.d.ts
│   ├── router/
│   │   └── guards.ts        # Navigation Guards
│   └── views/
│       └── LoginView.vue
```

---

## 🔐 REQUISITOS FUNCIONAIS

### RF-01: Autenticação por Credenciais
- Login via e-mail + senha
- Validação em tempo real dos campos
- Feedback visual de erros (Vuetify `v-text-field` com `error-messages`)
- Botão "Mostrar/Ocultar senha" (ícone de olho)

### RF-02: Lembrar-me (Remember Me)
- Checkbox opcional
- Token com expiração estendida (30 dias) quando ativo
- Token padrão: 2 horas

### RF-03: MFA (Multi-Factor Authentication) — TOTP
- Após login válido, se MFA habilitado, exibir tela de código TOTP
- Campo de 6 dígitos com auto-focus sequencial
- Timer de expiração do código (30s)
- Botão "Reenviar código" com cooldown de 60s

### RF-04: Recuperação de Senha
- Link "Esqueci minha senha" no formulário de login
- Envio de e-mail com token único e expirável (15 minutos)
- Tela de redefinição de senha com validação de força

### RF-05: Logout Global
- Invalidação de todos os tokens do usuário
- Limpeza completa do estado Pinia e localStorage

---

## 🛡️ REQUISITOS DE CIBERSEGURANÇA

### CS-01: Proteção contra Força Bruta
```php
// Rate Limiting no Laravel
Route::middleware(['throttle:5,1'])->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [PasswordController::class, 'sendResetLink']);
});
```
- Backoff exponencial: após 3 tentativas falhas, delay progressivo
- Bloqueio de IP por 15 min após 5 tentativas
- Log de tentativas suspeitas

### CS-02: Proteção XSS
- Sanitização de todos os inputs no frontend (DOMPurify)
- Escape automático do Laravel nas respostas JSON
- Headers de segurança:
  ```
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'
  ```

### CS-03: Proteção CSRF
- Cookies com `SameSite=Strict`
- Sanctum CSRF token em todas as requisições stateful
- Double-submit cookie pattern

### CS-04: Sanctum — Configuração Hardened
```php
// config/sanctum.php
'expiration' => 120,           // 2 horas
'refresh_expiration' => 43200, // 30 dias (remember me)
'middleware' => [
    'verify_csrf_token',
    'encrypt_cookies',
],
```

### CS-05: Hash de Senha
- **Apenas** `bcrypt` com cost ≥ 12
- Nunca armazenar senha em plain text ou reversible encryption
- Verificação via `Hash::check()` do Laravel

### CS-06: Tokens
- Sanctum tokens com abilities (escopos granulares)
- Refresh token rotation a cada requisição autenticada
- Blacklist de tokens no logout
- Expiração automática com cleanup job diário

### CS-07: Headers de Segurança (Middleware Laravel)
```php
// app/Http/Middleware/SecurityHeaders.php
$response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
$response->headers->set('X-XSS-Protection', '1; mode=block');
$response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
```

### CS-08: LGPD Compliance
- Log de IP e User-Agent **apenas** para segurança (não para tracking)
- Hash do IP antes de armazenar
- Campo `last_login_at` sem geolocalização
- Possibilidade de exportação/deleção de dados de login pelo usuário

---

## 📐 DESIGN SYSTEM & RESPONSIVIDADE

### Breakpoints (Mobile-First)
| Dispositivo | Largura | Layout |
|-------------|---------|--------|
| Smartphone | < 600px | Formulário fullscreen, sem sidebar |
| Tablet | 600–960px | Formulário centralizado, padding aumentado |
| Notebook | 960–1264px | Split screen (imagem lateral 40% + form 60%) |
| Desktop | > 1264px | Split screen (imagem lateral 50% + form 50%) |

### Componentes Vuetify
```vue
<v-container fluid class="fill-height pa-0">
  <v-row no-gutters class="fill-height">
    <!-- Imagem lateral (oculta em mobile) -->
    <v-col cols="12" md="6" class="d-none d-md-flex bg-primary">
      <v-img src="/auth-illustration.svg" cover />
    </v-col>

    <!-- Formulário -->
    <v-col cols="12" md="6" class="d-flex align-center justify-center">
      <v-card class="pa-8" :max-width="$vuetify.display.mdAndUp ? 480 : '100%'">
        <!-- LoginForm.vue -->
      </v-card>
    </v-col>
  </v-row>
</v-container>
```

### Acessibilidade (WCAG 2.1 AA)
- Contraste mínimo 4.5:1
- Labels associados aos inputs (`for` + `id`)
- Navegação por teclado completa (Tab order lógico)
- Mensagens de erro anunciadas por `aria-live="polite"`
- Focus visível em todos os elementos interativos

---

## 🧹 CLEAN CODE & REFACTORING GURU

### Princípios Aplicáveis

| Princípio | Aplicação |
|-----------|-----------|
| **Single Responsibility** | Cada classe/função faz UMA coisa. Controller delega para Service. |
| **Open/Closed** | Extensão de comportamento via Strategy Pattern (ex: diferentes providers de MFA) |
| **Dependency Inversion** | Interfaces nos domínios, implementações na infraestrutura |
| **Extract Method** | Métodos > 20 linhas devem ser quebrados |
| **Replace Conditional with Polymorphism** | Evitar `if/else` em cadeia para tipos de autenticação |
| **Introduce Parameter Object** | DTOs para requests complexos |
| **Guard Clauses** | Retornar early em validações |

### Exemplo — Refatoração de Controller
```php
// ❌ ANTES (Ruim)
public function login(Request $request) {
    $data = $request->all();
    if (!isset($data['email'])) return response()->json(['error' => 'Email required'], 400);
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) return response()->json(['error' => 'Invalid email'], 400);
    $user = User::where('email', $data['email'])->first();
    if (!$user) return response()->json(['error' => 'Not found'], 404);
    if (!Hash::check($data['password'], $user->password)) return response()->json(['error' => 'Wrong password'], 401);
    $token = $user->createToken('auth')->plainTextToken;
    return response()->json(['token' => $token]);
}

// ✅ DEPOIS (Clean Code + SOLID)
public function __construct(
    private AuthenticateUserUseCase $authenticateUseCase,
    private LoginRequestValidator $validator
) {}

public function login(LoginRequest $request): JsonResponse
{
    $dto = LoginDTO::fromRequest($request->validated());
    $result = $this->authenticateUseCase->execute($dto);

    return $result->isSuccess()
        ? new AuthResource($result->getData())
        : $this->errorResponse($result->getError());
}
```

---

## 🗄️ PINIA STORE — Estrutura

```typescript
// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, AuthTokens, LoginCredentials } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const tokens = ref<AuthTokens | null>(null)
  const isLoading = ref(false)
  const mfaRequired = ref(false)
  const mfaTempToken = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!tokens.value?.accessToken)
  const hasMFA = computed(() => user.value?.mfa_enabled ?? false)

  // Actions
  async function login(credentials: LoginCredentials): Promise<void>
  async function verifyMFA(code: string): Promise<void>
  async function logout(): Promise<void>
  async function refreshToken(): Promise<void>
  async function recoverPassword(email: string): Promise<void>

  return {
    user, tokens, isLoading, mfaRequired, mfaTempToken,
    isAuthenticated, hasMFA,
    login, verifyMFA, logout, refreshToken, recoverPassword
  }
})
```

---

## ✅ CHECKLIST DE VALIDAÇÃO Q.A (Pré-Deploy)

| # | Teste | Critério de Aceitação | Ferramenta |
|---|-------|----------------------|------------|
| ☐ 1 | **Testes de penetração nos endpoints de autenticação** | Nenhuma vulnerabilidade CRITICAL/HIGH no relatório OWASP Top 10 | OWASP ZAP / Burp Suite |
| ☐ 2 | **Teste de força bruta automatizado** | Após 5 tentativas, IP bloqueado por 15 min; backoff exponencial ativo | Hydra / Custom script |
| ☐ 3 | **Teste de bypass de URL** | Acesso a `/api/admin` sem token retorna 401; com token inválido retorna 403 | cURL / Postman |
| ☐ 4 | **Teste de expiração de token** | Token expirado após 2h (padrão) ou 30d (remember me); refresh token rotaciona e antigo é invalidado | Custom script |
| ☐ 5 | **Teste de XSS** | Injeção de `<script>alert('xss')</script>` em campos de login é sanitizada/escapada; não executa | XSSer / Manual |
| ☐ 6 | **Teste de CSRF** | Requisição cross-origin sem token CSRF é rejeitada; cookies com `SameSite=Strict` | Burp Suite |
| ☐ 7 | **Teste de MFA** | Código TOTP expira em 30s; reutilização é bloqueada; brute force em 6 dígitos é rate-limited | Google Authenticator + script |
| ☐ 8 | **Teste de recuperação de senha** | Token de reset expira em 15 min; uso único (segundo uso retorna 410 Gone) | Postman |
| ☐ 9 | **Teste de concorrência** | 50 logins simultâneos do mesmo usuário não corrompem sessão; tokens são independentes | k6 / JMeter |
| ☐ 10 | **Teste de LGPD** | IPs são hasheados; dados de dispositivo são anonimizados; usuário pode solicitar deleção | Auditoria de código |
| ☐ 11 | **Teste de usabilidade** | Fluxo completo funciona em Chrome, Firefox, Safari, Edge; mobile (iOS/Android) e desktop | BrowserStack |
| ☐ 12 | **Teste de carga** | 1000+ logins simultâneos; tempo de resposta < 2s; nenhum erro 5xx; rate limiting funciona | k6 / Artillery |

---

## 📦 ENTREGÁVEIS ESPERADOS

1. **Backend Laravel 13:**
   - Migration de `users` com campos de segurança
   - Migration de `password_reset_tokens` (expiráveis)
   - Migration de `login_attempts` (rate limiting custom)
   - Controllers limpos (delegação para UseCases)
   - Form Requests com validação completa
   - Middleware de segurança custom
   - Policies de autorização
   - Testes unitários e de feature (PHPUnit)
   - Factories e Seeders

2. **Frontend Vue 3 + Vuetify 3.13:**
   - Componentes Vue com `<script setup>` e Composition API
   - Composables reutilizáveis
   - Pinia store tipado com TypeScript
   - Serviço de API com interceptors (refresh token automático)
   - Guards de rota
   - Validação de formulários com VeeValidate ou composable custom
   - Testes com Vitest + Vue Test Utils

3. **Documentação:**
   - README com instruções de setup
   - Collection Postman/Insomnia dos endpoints
   - Diagrama de sequência do fluxo de autenticação

---

## 🎯 INSTRUÇÃO FINAL

> **"Gere o código completo e funcional para todo o sistema descrito acima. Priorize segurança, performance e manutenibilidade. Cada arquivo deve seguir os princípios de Clean Code e SOLID. A responsividade deve ser pixel-perfect em todos os breakpoints. A segurança deve ser auditável e passar em todos os itens do checklist de QA. Forneça o código organizado por diretórios, com comentários explicativos onde necessário, e inclua os testes automatizados."**

---

*Prompt gerado por Engenharia de Prompt Sênior | Stack: Laravel 13 + Vuetify 3.13 + Sanctum + Pinia*
