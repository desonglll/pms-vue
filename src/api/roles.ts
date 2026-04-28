import http from './index'
import type { Role } from '@/types'

export function getRoles() {
  return http.get<Role[]>('/roles')
}
