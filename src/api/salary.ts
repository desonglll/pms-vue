import http from './index'
import type {
  SalaryStructure,
  SalaryStructureForm,
  SalaryRecord,
  SalaryRecordForm,
  SalaryRecordBatchForm,
  SalaryRecordListQuery,
  ListQuery,
  ListResult,
} from '@/types'

// ---- Structures ----

export function getSalaryStructures(params?: ListQuery) {
  return http.get<ListResult<SalaryStructure>>('/salaries/structures', { params })
}

export function getSalaryStructureByEmployee(empId: number) {
  return http.get<SalaryStructure>(`/salaries/structures/employees/${empId}`)
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
  const { employee_id, year, month, performance_factor } = data
  return http.post<SalaryRecord>('/salaries/records', { employee_id, year, month, performance_factor })
}

export function updateSalaryRecord(id: number, data: { performance_factor?: number }) {
  return http.put(`/salaries/records/${id}`, data)
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
