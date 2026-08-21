import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { hmac } from '../src/infrastructure/services/hash.js'
import { makeApp, VALID_BIRTH_DATE, VALID_CPF, VALID_CPF_DIGITS } from './helpers.js'

describe('segurança do acesso', () => {
  let context: ReturnType<typeof makeApp>

  beforeEach(() => {
    context = makeApp()
  })

  afterEach(() => {
    context.db.close()
  })

  it('aplica os cabeçalhos de segurança', async () => {
    const response = await request(context.app)
      .post('/api/acesso')
      .send({ cpf: VALID_CPF, nascimento: VALID_BIRTH_DATE })

    expect(response.headers['x-content-type-options']).toBe('nosniff')
    expect(response.headers['x-frame-options']).toBe('DENY')
    expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  })

  it('registra tentativas apenas com dados hasheados', async () => {
    await request(context.app)
      .post('/api/acesso')
      .send({ cpf: VALID_CPF, nascimento: VALID_BIRTH_DATE })

    const attempt = context.db.prepare('SELECT * FROM login_attempts LIMIT 1').get() as {
      success: number
      ip_hash: string
      cpf_hash: string
    }

    expect(attempt.success).toBe(1)
    expect(attempt.ip_hash).toHaveLength(64)
    expect(attempt.cpf_hash).not.toContain(VALID_CPF_DIGITS)
    expect(attempt.cpf_hash).toBe(hmac(VALID_CPF_DIGITS))
  })

  it('bloqueia o IP após cinco tentativas falhas', async () => {
    const insert = context.db.prepare(
      `INSERT INTO login_attempts (ip_hash, cpf_hash, user_agent_hash, success)
       VALUES (?, NULL, NULL, 0)`,
    )

    for (const ip of ['::ffff:127.0.0.1', '127.0.0.1']) {
      for (let i = 0; i < 5; i++) insert.run(hmac(ip))
    }

    const response = await request(context.app)
      .post('/api/acesso')
      .send({ cpf: VALID_CPF, nascimento: VALID_BIRTH_DATE })

    expect(response.status).toBe(429)
    expect(response.headers['retry-after']).toBe('900')
  })
})
