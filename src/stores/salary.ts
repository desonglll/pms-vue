import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SalaryStructure, SalaryStructureForm, SalaryRecord, SalaryRecordForm, ListQuery, ListResult } from '@/types'
import * as api from '@/api/salary'

export const useSalaryStore = defineStore('salary', () => {
  // 薪资结构
  const structures = ref<SalaryStructure[]>([])
  const structTotal = ref(0)
  const structPage = ref(1)
  const structPageSize = ref(10)
  const structTotalPages = ref(0)
  const structLoading = ref(false)
  const structQuery = ref<ListQuery>({})

  async function fetchStructures() {
    structLoading.value = true
    try {
      const { data } = await api.getSalaryStructures({ ...structQuery.value, page: structPage.value, page_size: structPageSize.value })
      const result = data as unknown as ListResult<SalaryStructure>
      structures.value = result.data
      structTotal.value = result.total
      structTotalPages.value = result.total_pages
    } finally {
      structLoading.value = false
    }
  }

  async function fetchStructureByEmployee(empId: number) {
    const { data } = await api.getSalaryStructureByEmployee(empId)
    return data
  }

  async function createStructure(form: SalaryStructureForm) {
    await api.createSalaryStructure(form)
  }

  async function updateStructure(id: number, form: Record<string, unknown>) {
    await api.updateSalaryStructure(id, form)
  }

  async function deleteStructure(id: number) {
    await api.deleteSalaryStructure(id)
  }

  function setStructQuery(q: Partial<ListQuery>) {
    structQuery.value = { ...structQuery.value, ...q }
    structPage.value = 1
  }

  function setStructPage(p: number) {
    structPage.value = p
  }

  function setStructPageSize(size: number) {
    structPageSize.value = size
    structPage.value = 1
  }

  // 薪资记录
  const records = ref<SalaryRecord[]>([])
  const recordTotal = ref(0)
  const recordPage = ref(1)
  const recordPageSize = ref(10)
  const recordTotalPages = ref(0)
  const recordLoading = ref(false)
  const recordQuery = ref<ListQuery>({})
  const recordFilters = ref<Record<string, unknown>>({})

  async function fetchRecords() {
    recordLoading.value = true
    try {
      const { data } = await api.getSalaryRecords({
        ...recordQuery.value,
        ...recordFilters.value,
        page: recordPage.value,
        page_size: recordPageSize.value,
      })
      const result = data as unknown as ListResult<SalaryRecord>
      records.value = result.data
      recordTotal.value = result.total
      recordTotalPages.value = result.total_pages
    } finally {
      recordLoading.value = false
    }
  }

  async function fetchOneRecord(id: number) {
    const { data } = await api.getSalaryRecord(id)
    return data
  }

  async function createRecord(form: SalaryRecordForm) {
    await api.createSalaryRecord(form)
  }

  function setRecordQuery(q: Partial<ListQuery>) {
    recordQuery.value = { ...recordQuery.value, ...q }
    recordPage.value = 1
  }

  function setRecordFilters(f: Record<string, unknown>) {
    recordFilters.value = { ...recordFilters.value, ...f }
    recordPage.value = 1
  }

  function clearRecordFilters() {
    recordFilters.value = {}
    recordPage.value = 1
  }

  function setRecordPage(p: number) {
    recordPage.value = p
  }

  function setRecordPageSize(size: number) {
    recordPageSize.value = size
    recordPage.value = 1
  }

  return {
    structures, structTotal, structPage, structPageSize, structTotalPages, structLoading, structQuery,
    fetchStructures, fetchStructureByEmployee, createStructure, updateStructure, deleteStructure,
    setStructQuery, setStructPage, setStructPageSize,
    records, recordTotal, recordPage, recordPageSize, recordTotalPages, recordLoading, recordQuery, recordFilters,
    fetchRecords, fetchOneRecord, createRecord,
    setRecordQuery, setRecordFilters, clearRecordFilters, setRecordPage, setRecordPageSize,
  }
})
