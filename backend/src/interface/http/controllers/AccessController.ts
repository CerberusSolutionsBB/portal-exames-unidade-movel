import type { Request, Response } from 'express'
import type { TokenIssuer } from '../../../application/contracts/TokenIssuer.js'
import { accessCredentialsFromBody } from '../../../application/dtos/AccessCredentials.js'
import type { AuthenticatePatientUseCase } from '../../../application/use-cases/AuthenticatePatientUseCase.js'
import { contextFrom } from '../middleware/requestContext.js'

/**
 * Controller fino: valida o formato da requisição e delega o resto ao caso de
 * uso (Responsabilidade Única).
 */
export class AccessController {
  constructor(
    private readonly useCase: AuthenticatePatientUseCase,
    private readonly tokens: TokenIssuer,
  ) {}

  store = async (request: Request, response: Response): Promise<void> => {
    const credentials = accessCredentialsFromBody(request.body)

    if (!credentials.cpf || !credentials.birthDate) {
      response.status(422).json({
        message: 'Os dados informados são inválidos.',
        errors: {
          ...(credentials.cpf ? {} : { cpf: 'Informe um CPF válido.' }),
          ...(credentials.birthDate
            ? {}
            : { nascimento: 'Informe uma data de nascimento válida.' }),
        },
      })
      return
    }

    const result = await this.useCase.execute(credentials, contextFrom(request))

    if (!result.success) {
      response.status(422).json({
        message: 'Os dados informados são inválidos.',
        errors: result.fieldErrors,
      })
      return
    }

    response.status(200).json({
      token: result.token,
      status: result.status,
      message: result.message,
    })
  }

  logout = async (request: Request, response: Response): Promise<void> => {
    if (request.accessToken) {
      this.tokens.revoke(request.accessToken)
    }

    response.status(200).json({ message: 'Sessão encerrada.' })
  }
}
