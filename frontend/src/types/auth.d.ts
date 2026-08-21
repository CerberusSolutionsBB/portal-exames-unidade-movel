export interface LoginCredentials {
  cpf: string
  nascimento: string
}

export interface AccessResponse {
  token: string
  status: string
  message: string
}

export interface FieldErrors {
  cpf?: string
  nascimento?: string
}
