import http from './index'
import type { SalaryStructure, SalaryStructureForm, SalaryRecord, SalaryRecordForm, ListQuery, ListResult } from '@/types'

// 薪资结构
export function getSalaryStructures(params?: ListQuery) {
  return http.get<ListResult<SalaryStructure>>('/salaries/structures', { params })
}

export function getSalaryStructureByEmployee(empId: number) {
  return http.get<SalaryStructure>(`/salaries/structures/employees/${empId}`)
}

export function createSalaryStructure(data: SalaryStructureForm) {
  return http.post<SalaryStructure>('/salaries/structures', data)
}

export function updateSalaryStructure(id: number, data: Record<string, unknown>) {
  return http.put(`/salaries/structures/${id}`, data)
}

export function deleteSalaryStructure(id: number) {
  return http.delete(`/salaries/structures/${id}`)
}

// 薪资记录
export function getSalaryRecords(params?: Record<string, unknown>) {
  return http.get<ListResult<SalaryRecord>>('/salaries/records', { params })
}

export function getSalaryRecord(id: number) {
  return http.get<SalaryRecord>(`/salaries/records/${id}`)
}

export function createSalaryRecord(data: SalaryRecordForm) {
  return http.post<SalaryRecord>('/salaries/records', data)
}
