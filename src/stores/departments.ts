import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Department, DepartmentForm, DeptTreeNode, ListQuery } from '@/types'
import * as api from '@/api/departments'

export const useDepartmentStore = defineStore('departments', () => {
  const departments = ref<Department[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const query = ref<ListQuery>({})
  const allDepartments = ref<Department[]>([])
  const tree = ref<DeptTreeNode[]>([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const { data: result } = await api.getDepartments({
        page: page.value,
        page_size: pageSize.value,
        ...query.value,
      })
      departments.value = result.data
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number) {
    const { data } = await api.getDepartment(id)
    return data
  }

  async function fetchAllForSelect() {
    const { data: result } = await api.getDepartments({ page: 1, page_size: 999 })
    allDepartments.value = result.data
  }

  async function fetchTree() {
    const { data } = await api.getDepartmentTree()
    tree.value = data
  }

  async function create(form: DepartmentForm) {
    await api.createDepartment(form)
  }

  async function update(id: number, form: DepartmentForm) {
    await api.updateDepartment(id, form)
  }

  async function remove(id: number) {
    await api.deleteDepartment(id)
  }

  function setPage(p: number) {
    page.value = p
  }

  function setPageSize(s: number) {
    pageSize.value = s
  }

  function setQuery(q: ListQuery) {
    query.value = q
  }

  return {
    departments, total, page, pageSize, query, allDepartments, tree, loading,
    fetchAll, fetchOne, fetchAllForSelect, fetchTree, create, update, remove,
    setPage, setPageSize, setQuery,
  }
})
