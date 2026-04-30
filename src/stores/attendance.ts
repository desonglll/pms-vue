import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AttendanceRecord, AttendanceSummary, AttendanceRecordListQuery, AttendanceSummaryListQuery, AttendanceSummaryGenerateForm } from '@/types'
import * as api from '@/api/attendance'

export const useAttendanceStore = defineStore('attendance', () => {
  const records = ref<AttendanceRecord[]>([])
  const recordTotal = ref(0)
  const recordPage = ref(1)
  const recordPageSize = ref(10)
  const recordQuery = ref<AttendanceRecordListQuery>({})
  const loading = ref(false)

  const summaries = ref<AttendanceSummary[]>([])
  const summaryTotal = ref(0)
  const summaryPage = ref(1)
  const summaryPageSize = ref(10)
  const summaryQuery = ref<AttendanceSummaryListQuery>({})

  async function fetchRecords() {
    loading.value = true
    try {
      const { data: result } = await api.getAttendanceRecords({
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

  async function clockIn(employeeId: number) {
    await api.clockIn({ employee_id: employeeId })
  }

  async function clockOut(employeeId: number) {
    await api.clockOut({ employee_id: employeeId })
  }

  async function generateSummary(form: AttendanceSummaryGenerateForm) {
    await api.generateAttendanceSummary(form)
  }

  async function deleteRecord(id: number) {
    await api.deleteAttendanceRecord(id)
  }

  async function batchDeleteRecords(ids: number[]) {
    await api.batchDeleteAttendanceRecords(ids)
  }

  async function fetchSummaries() {
    loading.value = true
    try {
      const { data: result } = await api.getAttendanceSummaries({
        page: summaryPage.value,
        page_size: summaryPageSize.value,
        ...summaryQuery.value,
      })
      summaries.value = result.data
      summaryTotal.value = result.total
    } finally {
      loading.value = false
    }
  }

  function setRecordQuery(q: AttendanceRecordListQuery) {
    recordQuery.value = q
  }

  function setRecordPage(p: number) {
    recordPage.value = p
  }

  function setRecordPageSize(s: number) {
    recordPageSize.value = s
  }

  function setSummaryPage(p: number) {
    summaryPage.value = p
  }

  function setSummaryPageSize(s: number) {
    summaryPageSize.value = s
  }

  function setSummaryQuery(q: AttendanceSummaryListQuery) {
    summaryQuery.value = q
  }

  return {
    records, recordTotal, recordPage, recordPageSize, recordQuery, loading,
    summaries, summaryTotal, summaryPage, summaryPageSize, summaryQuery,
    fetchRecords, clockIn, clockOut, generateSummary, deleteRecord, batchDeleteRecords, fetchSummaries,
    setRecordQuery, setRecordPage, setRecordPageSize, setSummaryPage, setSummaryPageSize, setSummaryQuery,
  }
})
