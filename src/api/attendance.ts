import http from './index'
import type {
  AttendanceRecord,
  AttendanceSummary,
  AttendanceRecordListQuery,
  AttendanceSummaryGenerateForm,
  ListResult,
  ListQuery,
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

export function getAttendanceRecord(id: number) {
  return http.get<AttendanceRecord>(`/attendance/records/${id}`)
}

export function generateAttendanceSummary(data: AttendanceSummaryGenerateForm) {
  return http.post('/attendance/summaries/generate', data)
}

export function getAttendanceSummaries(params?: ListQuery) {
  return http.get<ListResult<AttendanceSummary>>('/attendance/summaries', { params })
}
