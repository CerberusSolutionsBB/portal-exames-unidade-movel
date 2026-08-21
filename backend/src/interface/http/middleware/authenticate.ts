import type { NextFunction, Request, Response } from 'express'
import type { TokenIssuer } from '../../../application/contracts/TokenIssuer.js'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      patientId?: number
      accessToken?: string
    }
  }
}

/** Equivalente ao middleware auth:sanctum: exige um token de acesso válido. */
export function authenticate(tokens: TokenIssuer) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const header = request.get('authorization') ?? ''
    const plainToken = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
    const patientId = plainToken ? tokens.patientIdFor(plainToken) : null

    if (patientId === null) {
      response.status(401).json({ message: 'Não autenticado.' })
      return
    }

    request.patientId = patientId
    request.accessToken = plainToken
    next()
  }
}
