import { describe, expect, it } from 'vitest'
import { BirthDate, InvalidBirthDateError } from '../src/domain/value-objects/BirthDate.js'
import { Cpf, InvalidCpfError } from '../src/domain/value-objects/Cpf.js'

describe('Cpf', () => {
  it('aceita um CPF válido com ou sem máscara', () => {
    expect(Cpf.fromString('123.456.789-09').digits()).toBe('12345678909')
    expect(Cpf.fromString('12345678909').formatted()).toBe('123.456.789-09')
  })

  it('rejeita dígito verificador inválido e sequências repetidas', () => {
    expect(() => Cpf.fromString('123.456.789-00')).toThrow(InvalidCpfError)
    expect(() => Cpf.fromString('111.111.111-11')).toThrow(InvalidCpfError)
    expect(() => Cpf.fromString('123')).toThrow(InvalidCpfError)
  })

  it('gera hash de 64 caracteres que não contém o CPF', () => {
    const hash = Cpf.fromString('123.456.789-09').hash()

    expect(hash).toHaveLength(64)
    expect(hash).not.toContain('12345678909')
  })
})

describe('BirthDate', () => {
  it('aceita uma data real em DD/MM/AAAA', () => {
    expect(BirthDate.fromDmy('15/03/1990').toDateString()).toBe('1990-03-15')
  })

  it('rejeita data inexistente, formato inválido e data futura', () => {
    expect(() => BirthDate.fromDmy('31/02/1990')).toThrow(InvalidBirthDateError)
    expect(() => BirthDate.fromDmy('1990-03-15')).toThrow(InvalidBirthDateError)

    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    const dmy = `01/01/${future.getFullYear()}`

    expect(() => BirthDate.fromDmy(dmy)).toThrow(InvalidBirthDateError)
  })

  it('rejeita idade acima de 120 anos', () => {
    const year = new Date().getFullYear() - 130

    expect(() => BirthDate.fromDmy(`01/01/${year}`)).toThrow(InvalidBirthDateError)
  })
})
