import helmet from 'helmet'

/** Conjunto endurecido de cabeçalhos de segurança em toda resposta da API. */
export const securityHeaders = helmet({
  contentSecurityPolicy: { directives: { 'default-src': ["'self'"] } },
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true },
})
