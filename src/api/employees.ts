import http from './index'
import type { Employee, EmployeeForm, ListQuery, ListResult } from '@/types'

export function getEmployees(params?: ListQuery) {
  return http.get<ListResult<Employee>>('/employees', { params })
}

export function getEmployee(id: number) {
  return http.get<Employee>(`/employees/${id}`)
}

export function createEmployee(data: EmployeeForm) {
  return http.post<Employee>('/employees', data)
}

export function updateEmployee(id: number, data: Record<string, unknown>) {
  return http.put(`/employees/${id}`, data)
}

export function deleteEmployee(id: number) {
  return http.delete(`/employees/${id}`)
}
