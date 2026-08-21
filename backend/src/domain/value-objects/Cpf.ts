import { createHmac } from 'node:crypto'
import { config } from '../../config.js'

/**
 * CPF (Cadastro de Pessoas Físicas) como value object imutável.
 *
 * Concentra a regra do dígito verificador e a formatação, para que o resto do
 * sistema nunca lide com uma string crua.
 */
export class InvalidCpfError extends Error {}

export class Cpf {
  private constructor(private readonly value: string) {}

  /** Constrói a partir de qualquer string informada pelo usuário (com ou sem máscara). */
  static fromString(raw: string): Cpf {
    const digits = raw.replace(/\D/g, '')

    if (!Cpf.isValid(digits)) {
      throw new InvalidCpfError('Informe um CPF válido.')
    }

    return new Cpf(digits)
  }

  static isValid(digits: string): boolean {
    if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
      return false
    }

    return (
      Cpf.checkDigit(digits, 9) === Number(digits[9]) &&
      Cpf.checkDigit(digits, 10) === Number(digits[10])
    )
  }

  private static checkDigit(digits: string, length: number): number {
    let sum = 0

    for (let i = 0; i < length; i++) {
      sum += Number(digits[i]) * (length + 1 - i)
    }

    const remainder = (sum * 10) % 11

    return remainder === 10 ? 0 : remainder
  }

  digits(): string {
    return this.value
  }

  formatted(): string {
    return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  /**
   * Impressão digital anonimizada (via HMAC com a APP_KEY). Usada para
   * armazenamento e log compatíveis com a LGPD — o CPF cru nunca é persistido.
   */
  hash(): string {
    return createHmac('sha256', config.appKey).update(this.value).digest('hex')
  }

  toString(): string {
    return this.formatted()
  }
}
