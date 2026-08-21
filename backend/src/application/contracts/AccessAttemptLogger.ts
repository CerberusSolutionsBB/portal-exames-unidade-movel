/**
 * Registra tentativas de acesso para auditoria de segurança (LGPD).
 *
 * Implementações devem persistir apenas dados anonimizados (hashes), nunca CPF,
 * IP ou user-agent em texto claro.
 */
export interface AccessAttemptContext {
  ip: string
  userAgent: string
}

export interface AccessAttemptLogger {
  log(cpfDigits: string, success: boolean, context: AccessAttemptContext): void
}
