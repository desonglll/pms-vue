import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Employee, EmployeeForm, ListQuery, ListResult } from '@/types'
import * as api from '@/api/employees'

export const useEmployeeStore = defineStore('employees', () => {
  const employees = ref<Employee[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const totalPages = ref(0)
  const loading = ref(false)
  const query = ref<ListQuery>({})

  async function fetchAll() {
    loading.value = true
    try {
      const { data } = await api.getEmployees({ ...query.value, page: page.value, page_size: pageSize.value })
      const result = data as unknown as ListResult<Employee>
      employees.value = result.data
      total.value = result.total
      totalPages.value = result.total_pages
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number) {
    const { data } = await api.getEmployee(id)
    return data
  }

  async function create(form: EmployeeForm) {
    await api.createEmployee(form)
  }

  async function update(id: number, form: Record<string, unknown>) {
    await api.updateEmployee(id, form)
  }

  async function remove(id: number) {
    await api.deleteEmployee(id)
  }

  function setQuery(q: Partial<ListQuery>) {
    query.value = { ...query.value, ...q }
    page.value = 1
  }

  function setPage(p: number) {
    page.value = p
  }

  function setPageSize(size: number) {
    pageSize.value = size
    page.value = 1
  }

  return {
    employees, total, page, pageSize, totalPages, loading, query,
    fetchAll, fetchOne, create, update, remove,
    setQuery, setPage, setPageSize,
  }
})
