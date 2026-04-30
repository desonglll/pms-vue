import http from './index'
import type { LeaveRequest, LeaveRequestForm, LeaveRequestListQuery, ListResult } from '@/types'

export function getLeaves(params?: LeaveRequestListQuery) {
  return http.get<ListResult<LeaveRequest>>('/leaves', { params })
}

export function getLeave(id: number) {
  return http.get<LeaveRequest>(`/leaves/${id}`)
}

export function createLeave(data: LeaveRequestForm) {
  return http.post<LeaveRequest>('/leaves', data)
}

export function approveLeave(id: number) {
  return http.put(`/leaves/${id}/approve`)
}

export function rejectLeave(id: number) {
  return http.put(`/leaves/${id}/reject`)
}
