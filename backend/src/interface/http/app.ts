import cors from 'cors'
import express, { type Express } from 'express'
import { config } from '../../config.js'
import type { Db } from '../../infrastructure/db/database.js'
import { securityHeaders } from './middleware/securityHeaders.js'
import { createRouter } from './routes.js'

export function createApp(db: Db): Express {
  const app = express()

  // Necessário para request.ip refletir o cliente real atrás de proxy/CDN.
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(securityHeaders)
  app.use(cors({ origin: config.corsOrigins, methods: ['GET', 'POST', 'OPTIONS'] }))
  app.use(express.json({ limit: '16kb' }))

  app.get('/up', (_request, response) => {
    response.status(200).json({ status: 'ok' })
  })

  app.use('/api', createRouter(db))

  app.use((_request, response) => {
    response.status(404).json({ message: 'Recurso não encontrado.' })
  })

  return app
}
