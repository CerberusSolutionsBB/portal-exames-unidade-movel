import { isValidCpf, isValidDate } from '@/composables/useAccess'
import type { AccessResponse, LoginCredentials } from '@/types/auth'

/**
 * Transporte usado quando a build não tem uma API configurada
 * (VITE_API_BASE_URL vazio) — caso do GitHub Pages, que é estático e não
 * executa o backend Laravel. Reproduz o comportamento definido para esta fase
 * do projeto: validação local de CPF/data e aviso de exame indisponível.
 * Nenhum dado do paciente sai do navegador.
 */
const UNAVAILABLE_MESSAGE = 'Resultado de exame ainda não disponível.'

function validationError(errors: Record<string, string>): unknown {
  return {
    response: {
      status: 422,
      data: { message: 'Os dados informados são inválidos.', errors },
    },
  }
}

export const DemoAccessBackend = {
  async access(credentials: LoginCredentials): Promise<AccessResponse> {
    const errors: Record<string, string> = {}

    if (!isValidCpf(credentials.cpf)) {
      errors.cpf = 'Informe um CPF válido.'
    }

    if (!isValidDate(credentials.nascimento)) {
      errors.nascimento = 'Informe uma data de nascimento válida.'
    }

    if (Object.keys(errors).length > 0) {
      throw validationError(errors)
    }

    return {
      token: `demo.${Date.now().toString(36)}`,
      status: 'indisponivel',
      message: UNAVAILABLE_MESSAGE,
    }
  },

  async status(): Promise<AccessResponse> {
    const token = localStorage.getItem('access_token')

    if (!token) {
      throw validationError({})
    }

    return { token, status: 'indisponivel', message: UNAVAILABLE_MESSAGE }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('access_token')
  },
}
