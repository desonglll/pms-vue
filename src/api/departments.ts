import http from './index'
import type { Department, DepartmentForm, DeptTreeNode, ListResult, ListQuery } from '@/types'

export function getDepartments(params?: ListQuery) {
  return http.get<ListResult<Department>>('/depts', { params })
}

export function getDepartment(id: number) {
  return http.get<Department>(`/depts/${id}`)
}

export function createDepartment(data: DepartmentForm) {
  return http.post<Department>('/depts', data)
}

export function updateDepartment(id: number, data: DepartmentForm) {
  return http.put(`/depts/${id}`, data)
}

export function deleteDepartment(id: number) {
  return http.delete(`/depts/${id}`)
}

export function getDepartmentTree() {
  return http.get<DeptTreeNode[]>('/depts/tree')
}
