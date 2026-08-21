/**
 * Data de nascimento como value object imutável.
 *
 * Aceita o formato DD/MM/AAAA usado pela interface e garante que o valor é uma
 * data real do calendário, não futura e com no máximo 120 anos.
 */
export class InvalidBirthDateError extends Error {}

const MAX_AGE_YEARS = 120

export class BirthDate {
  private constructor(private readonly value: Date) {}

  static fromDmy(raw: string): BirthDate {
    const normalized = raw.replace(/\D/g, '')
    const match = normalized.match(/^(\d{2})(\d{2})(\d{4})$/)

    if (!match) {
      throw new InvalidBirthDateError('Informe uma data de nascimento válida.')
    }

    const day = Number(match[1])
    const month = Number(match[2])
    const year = Number(match[3])

    const date = new Date(year, month - 1, day)

    const isRealDate =
      date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day

    if (!isRealDate) {
      throw new InvalidBirthDateError('Informe uma data de nascimento válida.')
    }

    const now = new Date()

    if (date.getTime() > now.getTime()) {
      throw new InvalidBirthDateError('A data de nascimento não pode estar no futuro.')
    }

    if (year < now.getFullYear() - MAX_AGE_YEARS) {
      throw new InvalidBirthDateError('Informe uma data de nascimento válida.')
    }

    return new BirthDate(date)
  }

  date(): Date {
    return new Date(this.value.getTime())
  }

  /** Formato ISO (AAAA-MM-DD), sem componente de fuso. */
  toDateString(): string {
    const year = this.value.getFullYear()
    const month = String(this.value.getMonth() + 1).padStart(2, '0')
    const day = String(this.value.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }
}
