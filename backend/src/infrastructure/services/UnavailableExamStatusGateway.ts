import type { ExamStatus, ExamStatusGateway } from '../../application/contracts/ExamStatusGateway.js'

/**
 * Comportamento atual do projeto: ainda não existe base de exames, então todo
 * acesso responde "não disponível", qualquer que seja o CPF.
 *
 * Esta classe é o único ponto a mudar quando a base real for integrada.
 */
export class UnavailableExamStatusGateway implements ExamStatusGateway {
  async statusFor(): Promise<ExamStatus> {
    return {
      status: 'nao_disponivel',
      message: 'Resultado de exame ainda não disponível.',
    }
  }
}
