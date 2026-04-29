import http from './index'
import type {
  SalaryStructure,
  SalaryStructureForm,
  SalaryRecord,
  SalaryRecordForm,
  SalaryRecordBatchForm,
  SalaryRecordListQuery,
  ListResult,
} from '@/types'

// ---- Structures ----

export function getSalaryStructures(params?: { page?: number; page_size?: number }) {
  return http.get<ListResult<SalaryStructure>>('/salaries/structures', { params })
}

export function getSalaryStructure(id: number) {
  return http.get<SalaryStructure>(`/salaries/structures/${id}`)
}

export function createSalaryStructure(data: SalaryStructureForm) {
  return http.post<SalaryStructure>('/salaries/structures', data)
}

export function updateSalaryStructure(id: number, data: SalaryStructureForm) {
  return http.put(`/salaries/structures/${id}`, data)
}

export function deleteSalaryStructure(id: number) {
  return http.delete(`/salaries/structures/${id}`)
}

// ---- Records ----

export function getSalaryRecords(params?: SalaryRecordListQuery) {
  return http.get<ListResult<SalaryRecord>>('/salaries/records', { params })
}

export function getSalaryRecord(id: number) {
  return http.get<SalaryRecord>(`/salaries/records/${id}`)
}

export function createSalaryRecord(data: SalaryRecordForm) {
  return http.post<SalaryRecord>('/salaries/records', data)
}

export function updateSalaryRecord(id: number, data: { performance_factor?: number }) {
  return http.put(`/salaries/records/${id}`, data)
}

export function deleteSalaryRecord(id: number) {
  return http.delete(`/salaries/records/${id}`)
}

export function submitSalaryRecord(id: number) {
  return http.put(`/salaries/records/${id}/submit`)
}

export function approveSalaryRecord(id: number) {
  return http.put(`/salaries/records/${id}/approve`)
}

export function rejectSalaryRecord(id: number) {
  return http.put(`/salaries/records/${id}/reject`)
}

export function paySalaryRecord(id: number) {
  return http.put(`/salaries/records/${id}/pay`)
}

export function batchGenerateSalaryRecords(data: SalaryRecordBatchForm) {
  return http.post('/salaries/records/batch', data)
}
