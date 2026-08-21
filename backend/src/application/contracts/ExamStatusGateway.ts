export interface ExamStatus {
  status: string
  message: string
}

/**
 * Costura para consultar o resultado de um exame.
 *
 * Hoje a única implementação responde "não disponível", porque ainda não há
 * base de exames. Trocar por um gateway real (banco/API) depois é só adicionar
 * outra implementação — o caso de uso não muda (Aberto/Fechado).
 */
export interface ExamStatusGateway {
  statusFor(cpfDigits: string, birthDate: string): Promise<ExamStatus>
}
