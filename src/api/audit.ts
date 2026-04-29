import http from './index'
import type { AuditLog, AuditLogListQuery, ListResult } from '@/types'

export function getAuditLogs(params?: AuditLogListQuery) {
  return http.get<ListResult<AuditLog>>('/audit-logs', { params })
}
