import { computed, ref } from 'vue'

function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  let out = digits

  if (digits.length > 9) out = digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
  else if (digits.length > 6) out = digits.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
  else if (digits.length > 3) out = digits.replace(/(\d{3})(\d{1,3})/, '$1.$2')

  return out
}

function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  let out = digits

  if (digits.length > 4) out = digits.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3')
  else if (digits.length > 2) out = digits.replace(/(\d{2})(\d{1,2})/, '$1/$2')

  return out
}

export function isValidCpf(value: string): boolean {
  const d = value.replace(/\D/g, '')

  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false

  const checkDigit = (len: number): number => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(d[i], 10) * (len + 1 - i)
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  return checkDigit(9) === parseInt(d[9], 10) && checkDigit(10) === parseInt(d[10], 10)
}

export function isValidDate(value: string): boolean {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return false

  const day = parseInt(match[1], 10)
  const month = parseInt(match[2], 10)
  const year = parseInt(match[3], 10)

  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return false
  }

  const now = new Date()
  const minYear = now.getFullYear() - 120

  if (year < minYear) return false
  if (date.getTime() > now.getTime()) return false

  return true
}

export function useAccess() {
  const cpf = ref('')
  const nascimento = ref('')

  const cpfModel = computed({
    get: () => maskCpf(cpf.value),
    set: (value: string) => {
      cpf.value = maskCpf(value)
    },
  })

  const dateModel = computed({
    get: () => maskDate(nascimento.value),
    set: (value: string) => {
      nascimento.value = maskDate(value)
    },
  })

  return { cpf, nascimento, cpfModel, dateModel, maskCpf, maskDate, isValidCpf, isValidDate }
}
