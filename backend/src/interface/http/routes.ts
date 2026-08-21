import { Router } from 'express'
import { AuthenticatePatientUseCase } from '../../application/use-cases/AuthenticatePatientUseCase.js'
import type { Db } from '../../infrastructure/db/database.js'
import { SqliteAccessAttemptLogger } from '../../infrastructure/services/SqliteAccessAttemptLogger.js'
import { SqliteTokenIssuer } from '../../infrastructure/services/SqliteTokenIssuer.js'
import { UnavailableExamStatusGateway } from '../../infrastructure/services/UnavailableExamStatusGateway.js'
import { AccessController } from './controllers/AccessController.js'
import { ExamStatusController } from './controllers/ExamStatusController.js'
import { authenticate } from './middleware/authenticate.js'
import { accessThrottle, perMinuteThrottle } from './middleware/rateLimit.js'

/** Composição das dependências (equivalente ao service container do Laravel). */
export function createRouter(db: Db): Router {
  const router = Router()

  const gateway = new UnavailableExamStatusGateway()
  const tokens = new SqliteTokenIssuer(db)
  const useCase = new AuthenticatePatientUseCase(
    gateway,
    new SqliteAccessAttemptLogger(db),
    tokens,
  )

  const access = new AccessController(useCase, tokens)
  const examStatus = new ExamStatusController(gateway)

  // Rota pública de acesso
  router.post('/acesso', perMinuteThrottle(), accessThrottle(db), access.store)

  // Rotas protegidas por token
  router.get('/exames/status', authenticate(tokens), examStatus.show)
  router.post('/logout', authenticate(tokens), access.logout)

  return router
}
