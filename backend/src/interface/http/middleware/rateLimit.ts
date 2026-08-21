import type { NextFunction, Request, Response } from 'express'
import type { Db } from '../../../infrastructure/db/database.js'
import { hmac } from '../../../infrastructure/services/hash.js'
import { contextFrom } from './requestContext.js'

const MAX_REQUESTS_PER_MINUTE = 5
const MAX_FAILURES = 5
const LOCKOUT_MINUTES = 15

const tooManyAttempts = (response: Response, retryAfterSeconds: number): void => {
  response
    .status(429)
    .set('Retry-After', String(retryAfterSeconds))
    .json({ message: 'Muitas tentativas de acesso. Tente novamente mais tarde.' })
}

/**
 * Limite por minuto e por IP (equivalente ao throttle:5,1 do Laravel).
 * Mantido em memória: é uma defesa de rajada, não um registro auditável.
 */
export function perMinuteThrottle() {
  const hits = new Map<string, number[]>()

  return (request: Request, response: Response, next: NextFunction): void => {
    const key = hmac(contextFrom(request).ip)
    const now = Date.now()
    const recent = (hits.get(key) ?? []).filter((at) => now - at < 60_000)

    if (recent.length >= MAX_REQUESTS_PER_MINUTE) {
      hits.set(key, recent)
      tooManyAttempts(response, 60)
      return
    }

    recent.push(now)
    hits.set(key, recent)
    next()
  }
}

/**
 * Bloqueia o IP por uma janela após falhas consecutivas.
 *
 * Complementa o limite por minuto barrando o IP (hasheado) por 15 minutos
 * depois de 5 tentativas falhas — defesa simples contra força bruta sem
 * armazenar o IP cru (LGPD).
 */
export function accessThrottle(db: Db) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const ipHash = hmac(contextFrom(request).ip)

    const row = db
      .prepare(
        `SELECT COUNT(*) AS failures FROM login_attempts
         WHERE ip_hash = ? AND success = 0
           AND created_at >= datetime('now', ?)`,
      )
      .get(ipHash, `-${LOCKOUT_MINUTES} minutes`) as { failures: number }

    if (row.failures >= MAX_FAILURES) {
      tooManyAttempts(response, LOCKOUT_MINUTES * 60)
      return
    }

    next()
  }
}
