import type { Request, Response } from 'express'
import type { ExamStatusGateway } from '../../../application/contracts/ExamStatusGateway.js'

/**
 * Endpoint protegido (exige token válido) que devolve o status do exame.
 * Demonstra que o token emitido no acesso realmente autoriza as rotas
 * protegidas.
 */
export class ExamStatusController {
  constructor(private readonly gateway: ExamStatusGateway) {}

  show = async (_request: Request, response: Response): Promise<void> => {
    const status = await this.gateway.statusFor('', '')

    response.status(200).json(status)
  }
}
