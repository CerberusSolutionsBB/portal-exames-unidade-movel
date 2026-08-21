import { config } from './config.js'
import { createDatabase } from './infrastructure/db/database.js'
import { createApp } from './interface/http/app.js'

const db = createDatabase()
const app = createApp(db)

const server = app.listen(config.port, () => {
  console.log(`API do Portal de Exames em http://localhost:${config.port}`)
})

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => {
      db.close()
      process.exit(0)
    })
  })
}
