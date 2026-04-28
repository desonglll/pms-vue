import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import * as api from '@/api/users'

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const { data } = await api.getUsers()
      users.value = data
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(id: number, status: string) {
    await api.updateUserStatus(id, status)
  }

  async function assignRoles(id: number, roleIds: number[]) {
    await api.assignRoles(id, roleIds)
  }

  return { users, loading, fetchAll, updateStatus, assignRoles }
})
