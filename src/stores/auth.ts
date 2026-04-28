import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import * as api from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.roles?.some((r) => r.name === 'admin') ?? false)

  async function login(username: string, password: string) {
    const { data } = await api.login(username, password)
    token.value = data.token
    localStorage.setItem('token', data.token)
    // 登录后立即获取用户信息
    await fetchUser()
  }

  async function fetchUser() {
    const { data } = await api.getCurrentUser()
    user.value = data
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    api.logout().catch(() => {})
  }

  return { token, user, isLoggedIn, isAdmin, login, fetchUser, logout }
})
