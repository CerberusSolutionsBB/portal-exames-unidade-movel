import { createHmac } from 'node:crypto'
import { config } from '../../config.js'

/** Hash unidirecional salgado com a APP_KEY — nunca guardamos o valor cru. */
export function hmac(value: string): string {
  return createHmac('sha256', config.appKey).update(value).digest('hex')
}
