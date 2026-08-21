/** Entrada do fluxo "acessar resultado de exame": CPF + data de nascimento. */
export interface AccessCredentials {
  cpf: string
  birthDate: string
}

export function accessCredentialsFromBody(body: unknown): AccessCredentials {
  const data = (body ?? {}) as Record<string, unknown>

  return {
    cpf: typeof data.cpf === 'string' ? data.cpf : '',
    birthDate: typeof data.nascimento === 'string' ? data.nascimento : '',
  }
}
