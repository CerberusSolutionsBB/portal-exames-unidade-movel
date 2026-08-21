import type { Express } from 'express'
import { createDatabase, type Db } from '../src/infrastructure/db/database.js'
import { createApp } from '../src/interface/http/app.js'

export const VALID_CPF = '123.456.789-09'
export const VALID_CPF_DIGITS = '12345678909'
export const VALID_BIRTH_DATE = '15/03/1990'

export function makeApp(): { app: Express; db: Db } {
  const db = createDatabase(':memory:')

  return { app: createApp(db), db }
}
