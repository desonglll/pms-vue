import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  SalaryStructure,
  SalaryStructureForm,
  SalaryRecord,
  SalaryRecordForm,
  SalaryRecordBatchForm,
  SalaryRecordListQuery,
} from '@/types'
import * as api from '@/api/salary'

export const useSalaryStore = defineStore('salary', () => {
  // Structures
  const structures = ref<SalaryStructure[]>([])
  const structTotal = ref(0)
  const structPage = ref(1)
  const structPageSize = ref(10)

  // Records
  const records = ref<SalaryRecord[]>([])
  const recordTotal = ref(0)
  const recordPage = ref(1)
  const recordPageSize = ref(10)
  const recordQuery = ref<SalaryRecordListQuery>({})
  const loading = ref(false)

  // ---- Structures ----

  async function fetchStructures() {
    loading.value = true
    try {
      const { data: result } = await api.getSalaryStructures({ page: structPage.value, page_size: structPageSize.value })
      structures.value = result.data
      structTotal.value = result.total
    } finally {
      loading.value = false
    }
  }

  async function fetchStructure(id: number) {
    const { data } = await api.getSalaryStructure(id)
    return data
  }

  async function createStructure(form: SalaryStructureForm) {
    await api.createSalaryStructure(form)
  }

  async function updateStructure(id: number, form: SalaryStructureForm) {
    await api.updateSalaryStructure(id, form)
  }

  async function deleteStructure(id: number) {
    await api.deleteSalaryStructure(id)
  }

  function setStructPage(p: number) {
    structPage.value = p
  }

  function setStructPageSize(s: number) {
    structPageSize.value = s
  }

  // ---- Records ----

  async function fetchRecords() {
    loading.value = true
    try {
      const { data: result } = await api.getSalaryRecords({
        page: recordPage.value,
        page_size: recordPageSize.value,
        ...recordQuery.value,
      })
      records.value = result.data
      recordTotal.value = result.total
    } finally {
      loading.value = false
    }
  }

  async function fetchRecord(id: number) {
    const { data } = await api.getSalaryRecord(id)
    return data
  }

  async function createRecord(form: SalaryRecordForm) {
    await api.createSalaryRecord(form)
  }

  async function updateRecord(id: number, data: { performance_factor?: number }) {
    await api.updateSalaryRecord(id, data)
  }

  async function deleteRecord(id: number) {
    await api.deleteSalaryRecord(id)
  }

  async function submitRecord(id: number) {
    await api.submitSalaryRecord(id)
  }

  async function approveRecord(id: number) {
    await api.approveSalaryRecord(id)
  }

  async function rejectRecord(id: number) {
    await api.rejectSalaryRecord(id)
  }

  async function payRecord(id: number) {
    await api.paySalaryRecord(id)
  }

  async function batchGenerate(form: SalaryRecordBatchForm) {
    await api.batchGenerateSalaryRecords(form)
  }

  function setRecordPage(p: number) {
    recordPage.value = p
  }

  function setRecordPageSize(s: number) {
    recordPageSize.value = s
  }

  function setRecordQuery(q: SalaryRecordListQuery) {
    recordQuery.value = q
  }

  return {
    structures, structTotal, structPage, structPageSize,
    records, recordTotal, recordPage, recordPageSize, recordQuery, loading,
    fetchStructures, fetchStructure, createStructure, updateStructure, deleteStructure, setStructPage, setStructPageSize,
    fetchRecords, fetchRecord, createRecord, updateRecord, deleteRecord, setRecordPage, setRecordPageSize, setRecordQuery,
    submitRecord, approveRecord, rejectRecord, payRecord, batchGenerate,
  }
})
