import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, JwtPayload } from '@/types'
import * as api from '@/api/auth'

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]!))
    return payload as JwtPayload
  } catch {
    return null
  }
}

function loadJwtPayload(): JwtPayload | null {
  const t = localStorage.getItem('token')
  if (!t) return null
  return decodeJwt(t)
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref<User | null>(null)
  const jwtPayload = ref<JwtPayload | null>(loadJwtPayload())

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => jwtPayload.value?.role === 'admin')
  const isManager = computed(() => jwtPayload.value?.role === 'manager')
  const isStaff = computed(() => jwtPayload.value?.role === 'staff')
  const role = computed(() => jwtPayload.value?.role ?? '')
  const employeeId = computed(() => jwtPayload.value?.employee_id ?? null)

  async function login(username: string, password: string) {
    const { data } = await api.login(username, password)
    token.value = data.token
    localStorage.setItem('token', data.token)
    jwtPayload.value = decodeJwt(data.token)
    await fetchUser()
  }

  async function fetchUser() {
    const { data } = await api.getCurrentUser()
    user.value = data
  }

  function logout() {
    token.value = ''
    user.value = null
    jwtPayload.value = null
    localStorage.removeItem('token')
  }

  return { token, user, jwtPayload, isLoggedIn, isAdmin, isManager, isStaff, role, employeeId, login, fetchUser, logout }
})
