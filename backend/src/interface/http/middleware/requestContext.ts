import type { Request } from 'express'
import type { AccessAttemptContext } from '../../../application/contracts/AccessAttemptLogger.js'

export function contextFrom(request: Request): AccessAttemptContext {
  return {
    ip: request.ip ?? 'unknown',
    userAgent: request.get('user-agent') ?? 'unknown',
  }
}
