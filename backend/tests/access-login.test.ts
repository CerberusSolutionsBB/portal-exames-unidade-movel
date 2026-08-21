import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { hmac } from '../src/infrastructure/services/hash.js'
import { makeApp, VALID_BIRTH_DATE, VALID_CPF, VALID_CPF_DIGITS } from './helpers.js'

describe('POST /api/acesso', () => {
  let context: ReturnType<typeof makeApp>

  beforeEach(() => {
    context = makeApp()
  })

  afterEach(() => {
    context.db.close()
  })

  it('emite token e responde "não disponível" para credenciais válidas', async () => {
    const response = await request(context.app)
      .post('/api/acesso')
      .send({ cpf: VALID_CPF, nascimento: VALID_BIRTH_DATE })

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('nao_disponivel')
    expect(response.body.message).toBe('Resultado de exame ainda não disponível.')
    expect(response.body.token).toEqual(expect.any(String))

    const patient = context.db
      .prepare('SELECT cpf_hash FROM patients WHERE cpf_hash = ?')
      .get(hmac(VALID_CPF_DIGITS))

    expect(patient).toBeDefined()
  })

  it('devolve erro no campo cpf quando o CPF é inválido', async () => {
    const response = await request(context.app)
      .post('/api/acesso')
      .send({ cpf: '123.456.789-00', nascimento: VALID_BIRTH_DATE })

    expect(response.status).toBe(422)
    expect(response.body.errors.cpf).toBe('Informe um CPF válido.')
  })

  it('devolve erro no campo nascimento quando a data não existe', async () => {
    const response = await request(context.app)
      .post('/api/acesso')
      .send({ cpf: VALID_CPF, nascimento: '31/02/1990' })

    expect(response.status).toBe(422)
    expect(response.body.errors.nascimento).toBe('Informe uma data de nascimento válida.')
  })

  it('exige token na rota protegida', async () => {
    const response = await request(context.app).get('/api/exames/status')

    expect(response.status).toBe(401)
  })

  it('libera a rota protegida com o token emitido', async () => {
    const { body } = await request(context.app)
      .post('/api/acesso')
      .send({ cpf: VALID_CPF, nascimento: VALID_BIRTH_DATE })

    const response = await request(context.app)
      .get('/api/exames/status')
      .set('Authorization', `Bearer ${body.token}`)

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('nao_disponivel')
  })

  it('revoga o token no logout', async () => {
    const { body } = await request(context.app)
      .post('/api/acesso')
      .send({ cpf: VALID_CPF, nascimento: VALID_BIRTH_DATE })

    await request(context.app).post('/api/logout').set('Authorization', `Bearer ${body.token}`)

    const response = await request(context.app)
      .get('/api/exames/status')
      .set('Authorization', `Bearer ${body.token}`)

    expect(response.status).toBe(401)
  })
})
