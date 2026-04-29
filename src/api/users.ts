import http from './index'
import type { User } from '@/types'

export function getUsers() {
  return http.get<User[]>('/users')
}

export function getUser(id: number) {
  return http.get<User>(`/users/${id}`)
}

export function updateUserStatus(id: number, status: string) {
  return http.put(`/users/${id}/status`, { status })
}

export function assignRoles(id: number, role_ids: number[]) {
  return http.put(`/users/${id}/roles`, { role_ids })
}

export function updateUserPassword(id: number, password: string) {
  return http.put(`/users/${id}/password`, { password })
}
