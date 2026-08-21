import 'dotenv/config'
import { randomBytes } from 'node:crypto'

function required(name: string, fallback: string): string {
  const value = process.env[name]?.trim()

  if (value) return value

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Variável de ambiente ${name} é obrigatória em produção.`)
  }

  return fallback
}

export const config = {
  port: Number(process.env.PORT ?? 8000),
  /** Salt das hashes HMAC. Em produção precisa ser fixo, senão os hashes mudam a cada boot. */
  appKey: required('APP_KEY', randomBytes(32).toString('hex')),
  dbPath: process.env.DB_PATH?.trim() || './database/portal.sqlite',
  corsOrigins: (
    process.env.CORS_ORIGINS ??
    'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
}
