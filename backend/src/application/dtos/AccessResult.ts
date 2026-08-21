/**
 * Resultado do caso de uso de autenticação.
 *
 * No sucesso carrega o token emitido e o status do exame. Na falha carrega os
 * erros por campo ("cpf" / "nascimento"), para a interface destacar exatamente
 * o que está errado.
 */
export interface AccessResult {
  success: boolean
  fieldErrors: Record<string, string>
  token: string | null
  status: string | null
  message: string | null
}

export function accessSuccess(token: string, status: string, message: string): AccessResult {
  return { success: true, fieldErrors: {}, token, status, message }
}

export function accessFailure(fieldErrors: Record<string, string>): AccessResult {
  return { success: false, fieldErrors, token: null, status: null, message: null }
}
