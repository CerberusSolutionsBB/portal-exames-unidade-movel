/**
 * Emissão e verificação dos tokens de acesso do paciente anônimo
 * (equivalente ao papel do Sanctum na versão PHP).
 */
export interface TokenIssuer {
  issueFor(cpfHash: string): string
  patientIdFor(plainToken: string): number | null
  revoke(plainToken: string): void
}
