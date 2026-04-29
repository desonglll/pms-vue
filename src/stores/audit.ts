import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AuditLog, AuditLogListQuery } from '@/types'
import * as api from '@/api/audit'

export const useAuditStore = defineStore('audit', () => {
  const logs = ref<AuditLog[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const query = ref<AuditLogListQuery>({})
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const { data: result } = await api.getAuditLogs({
        page: page.value,
        page_size: pageSize.value,
        ...query.value,
      })
      logs.value = result.data
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  function setPage(p: number) {
    page.value = p
  }

  function setPageSize(s: number) {
    pageSize.value = s
  }

  function setQuery(q: AuditLogListQuery) {
    query.value = q
  }

  return { logs, total, page, pageSize, query, loading, fetchAll, setPage, setPageSize, setQuery }
})
