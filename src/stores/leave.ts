import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LeaveRequest, LeaveRequestForm, LeaveRequestListQuery } from '@/types'
import * as api from '@/api/leave'

export const useLeaveStore = defineStore('leave', () => {
  const leaves = ref<LeaveRequest[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const query = ref<LeaveRequestListQuery>({})
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const { data: result } = await api.getLeaves({
        page: page.value,
        page_size: pageSize.value,
        ...query.value,
      })
      leaves.value = result.data
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number) {
    const { data } = await api.getLeave(id)
    return data
  }

  async function create(form: LeaveRequestForm) {
    await api.createLeave(form)
  }

  async function approve(id: number) {
    await api.approveLeave(id)
  }

  async function reject(id: number) {
    await api.rejectLeave(id)
  }

  function setPage(p: number) {
    page.value = p
  }

  function setPageSize(s: number) {
    pageSize.value = s
  }

  function setQuery(q: LeaveRequestListQuery) {
    query.value = q
  }

  return { leaves, total, page, pageSize, query, loading, fetchAll, fetchOne, create, approve, reject, setPage, setPageSize, setQuery }
})
