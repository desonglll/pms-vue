import http from './index'
import type { AuditLog, AuditLogListQuery, ListResult } from '@/types'

export function getAuditLogs(params?: AuditLogListQuery) {
  return http.get<ListResult<AuditLog>>('/audit-logs', { params })
}

export function deleteAuditLog(id: number) {
  return http.delete(`/audit-logs/${id}`)
}

export function batchDeleteAuditLogs(ids: number[]) {
  return http.delete('/audit-logs/batch', { data: { ids } })
}
