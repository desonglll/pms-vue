import http from './index'
import type { Department, DepartmentForm, ListQuery, ListResult } from '@/types'

export function getDepartments(params?: ListQuery) {
  return http.get<ListResult<Department>>('/depts', { params })
}

export function getDepartment(id: number) {
  return http.get<Department>(`/depts/${id}`)
}

export function createDepartment(data: DepartmentForm) {
  return http.post<Department>('/depts', data)
}

export function updateDepartment(id: number, data: Record<string, unknown>) {
  return http.put(`/depts/${id}`, data)
}

export function deleteDepartment(id: number) {
  return http.delete(`/depts/${id}`)
}
