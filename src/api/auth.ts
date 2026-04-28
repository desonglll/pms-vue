import http from './index'
import type { LoginResult, User } from '@/types'

export function login(username: string, password: string) {
  return http.post<LoginResult>('/auth/login', { username, password })
}

export function register(username: string, password: string, role_ids?: number[]) {
  return http.post('/auth/register', { username, password, role_ids })
}

export function logout() {
  return http.post('/auth/logout')
}

export function getCurrentUser() {
  return http.get<User>('/auth/me')
}
