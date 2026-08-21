import { randomBytes } from 'node:crypto'
import type { TokenIssuer } from '../../application/contracts/TokenIssuer.js'
import type { Db } from '../db/database.js'
import { hmac } from './hash.js'

/**
 * Emite tokens opacos para a identidade anônima do paciente (papel do Sanctum
 * na versão PHP). O banco guarda apenas o hash do token; o valor em claro só
 * existe na resposta ao paciente.
 */
export class SqliteTokenIssuer implements TokenIssuer {
  constructor(private readonly db: Db) {}

  issueFor(cpfHash: string): string {
    const patientId = this.findOrCreatePatient(cpfHash)
    const plainToken = randomBytes(40).toString('hex')

    this.db
      .prepare(`INSERT INTO access_tokens (patient_id, token_hash) VALUES (?, ?)`)
      .run(patientId, hmac(plainToken))

    return plainToken
  }

  patientIdFor(plainToken: string): number | null {
    const row = this.db
      .prepare(`SELECT patient_id FROM access_tokens WHERE token_hash = ?`)
      .get(hmac(plainToken)) as { patient_id: number } | undefined

    return row?.patient_id ?? null
  }

  revoke(plainToken: string): void {
    const patientId = this.patientIdFor(plainToken)

    if (patientId === null) return

    // Mesma semântica do logout no Laravel: derruba todos os tokens do paciente.
    this.db.prepare(`DELETE FROM access_tokens WHERE patient_id = ?`).run(patientId)
  }

  private findOrCreatePatient(cpfHash: string): number {
    this.db
      .prepare(
        `INSERT INTO patients (cpf_hash, last_accessed_at)
         VALUES (?, datetime('now'))
         ON CONFLICT (cpf_hash)
         DO UPDATE SET last_accessed_at = datetime('now'), updated_at = datetime('now')`,
      )
      .run(cpfHash)

    const row = this.db.prepare(`SELECT id FROM patients WHERE cpf_hash = ?`).get(cpfHash) as {
      id: number
    }

    return row.id
  }
}
