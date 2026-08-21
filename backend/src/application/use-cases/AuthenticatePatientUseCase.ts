import type { AccessAttemptContext, AccessAttemptLogger } from '../contracts/AccessAttemptLogger.js'
import type { ExamStatusGateway } from '../contracts/ExamStatusGateway.js'
import type { TokenIssuer } from '../contracts/TokenIssuer.js'
import type { AccessCredentials } from '../dtos/AccessCredentials.js'
import { accessFailure, accessSuccess, type AccessResult } from '../dtos/AccessResult.js'
import { BirthDate, InvalidBirthDateError } from '../../domain/value-objects/BirthDate.js'
import { Cpf, InvalidCpfError } from '../../domain/value-objects/Cpf.js'

/**
 * Valida as credenciais de acesso, registra a tentativa e emite um token para a
 * identidade anônima do paciente (ancorada no hash do CPF).
 *
 * Responsabilidade única: orquestrar o fluxo de acesso. A validação vive nos
 * value objects; a persistência vive atrás dos contratos injetados.
 */
export class AuthenticatePatientUseCase {
  constructor(
    private readonly examStatusGateway: ExamStatusGateway,
    private readonly attemptLogger: AccessAttemptLogger,
    private readonly tokenIssuer: TokenIssuer,
  ) {}

  async execute(
    credentials: AccessCredentials,
    context: AccessAttemptContext,
  ): Promise<AccessResult> {
    let cpf: Cpf

    try {
      cpf = Cpf.fromString(credentials.cpf)
    } catch (error) {
      if (!(error instanceof InvalidCpfError)) throw error

      this.attemptLogger.log(credentials.cpf.replace(/\D/g, ''), false, context)

      return accessFailure({ cpf: error.message })
    }

    let birthDate: BirthDate

    try {
      birthDate = BirthDate.fromDmy(credentials.birthDate)
    } catch (error) {
      if (!(error instanceof InvalidBirthDateError)) throw error

      this.attemptLogger.log(cpf.digits(), false, context)

      return accessFailure({ nascimento: error.message })
    }

    this.attemptLogger.log(cpf.digits(), true, context)

    const status = await this.examStatusGateway.statusFor(cpf.digits(), birthDate.toDateString())

    return accessSuccess(this.tokenIssuer.issueFor(cpf.hash()), status.status, status.message)
  }
}
