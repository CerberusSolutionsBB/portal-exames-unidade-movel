import type {
  AccessAttemptContext,
  AccessAttemptLogger,
} from '../../application/contracts/AccessAttemptLogger.js'
import type { Db } from '../db/database.js'
import { hmac } from './hash.js'

/**
 * Logger de tentativas compatível com a LGPD.
 *
 * Persiste apenas hashes HMAC-SHA256 (salgados com a APP_KEY) de IP, CPF e
 * user-agent — nunca os valores crus — além do indicador de sucesso.
 */
export class SqliteAccessAttemptLogger implements AccessAttemptLogger {
  constructor(private readonly db: Db) {}

  log(cpfDigits: string, success: boolean, context: AccessAttemptContext): void {
    this.db
      .prepare(
        `INSERT INTO login_attempts (ip_hash, cpf_hash, user_agent_hash, success)
         VALUES (?, ?, ?, ?)`,
      )
      .run(
        hmac(context.ip || 'unknown'),
        cpfDigits ? hmac(cpfDigits) : null,
        hmac(context.userAgent || 'unknown'),
        success ? 1 : 0,
      )
  }
}
