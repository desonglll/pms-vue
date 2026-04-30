import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, ListQuery } from '@/types'
import * as api from '@/api/users'

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const query = ref<ListQuery>({})
  const loading = ref(false)
  const allUsers = ref<User[]>([])

  async function fetchAll() {
    loading.value = true
    try {
      const { data: result } = await api.getUsers({
        ...query.value,
        page: page.value,
        page_size: pageSize.value,
      })
      users.value = result.data
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  async function fetchAllForSelect() {
    const { data: result } = await api.getUsers({ page: 1, page_size: 999 })
    allUsers.value = result.data
  }

  async function fetchOne(id: number) {
    const { data } = await api.getUser(id)
    return data
  }

  async function updateStatus(id: number, status: string) {
    await api.updateUserStatus(id, status)
  }

  async function assignRoles(id: number, roleIds: number[]) {
    await api.assignRoles(id, roleIds)
  }

  async function updatePassword(id: number, password: string) {
    await api.updateUserPassword(id, password)
  }

  async function create(data: { username: string; password: string; role_ids?: number[] }) {
    await api.createUser(data)
  }

  async function remove(id: number) {
    await api.deleteUser(id)
  }

  function setQuery(q: Partial<ListQuery>) {
    query.value = { ...query.value, ...q }
    page.value = 1
  }

  function setPage(p: number) {
    page.value = p
  }

  function setPageSize(s: number) {
    pageSize.value = s
    page.value = 1
  }

  return {
    users, total, page, pageSize, query, loading, allUsers,
    fetchAll, fetchAllForSelect, fetchOne, updateStatus, assignRoles, updatePassword, create, remove,
    setQuery, setPage, setPageSize,
  }
})
