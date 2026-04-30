import http from './index'
import type { User, ListQuery, ListResult } from '@/types'

export function getUsers(params?: ListQuery) {
  return http.get<ListResult<User>>('/users', { params })
}

export function getUser(id: number) {
  return http.get<User>(`/users/${id}`)
}

export function updateUserStatus(id: number, status: string) {
  return http.put(`/users/${id}/status`, { status })
}

export function assignRoles(id: number, roleIds: number[]) {
  return http.put(`/users/${id}/roles`, { role_ids: roleIds })
}

export function updateUserPassword(id: number, password: string) {
  return http.put(`/users/${id}/password`, { new_password: password })
}

export function createUser(data: { username: string; password: string; role_ids?: number[] }) {
  return http.post<User>('/users', data)
}

export function deleteUser(id: number) {
  return http.delete(`/users/${id}`)
}
