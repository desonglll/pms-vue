import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Role } from '@/types'
import * as api from '@/api/roles'

export const useRoleStore = defineStore('roles', () => {
  const roles = ref<Role[]>([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const { data } = await api.getRoles()
      roles.value = data
    } finally {
      loading.value = false
    }
  }

  return { roles, loading, fetchAll }
})
