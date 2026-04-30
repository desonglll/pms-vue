import http from './index'
import type {
  AttendanceRecord,
  AttendanceSummary,
  AttendanceRecordListQuery,
  AttendanceSummaryListQuery,
  AttendanceSummaryGenerateForm,
  ListResult,
} from '@/types'

export function clockIn(data: { employee_id: number }) {
  return http.post('/attendance/clock-in', data)
}

export function clockOut(data: { employee_id: number }) {
  return http.put('/attendance/clock-out', data)
}

export function getAttendanceRecords(params?: AttendanceRecordListQuery) {
  return http.get<ListResult<AttendanceRecord>>('/attendance/records', { params })
}

export function batchDeleteAttendanceRecords(ids: number[]) {
  return http.delete('/attendance/records/batch', { data: { ids } })
}

export function generateAttendanceSummary(data: AttendanceSummaryGenerateForm) {
  return http.post('/attendance/summaries/generate', data)
}

export function getAttendanceSummaries(params?: AttendanceSummaryListQuery) {
  return http.get<ListResult<AttendanceSummary>>('/attendance/summaries', { params })
}
