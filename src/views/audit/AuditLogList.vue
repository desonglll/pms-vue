<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Delete } from '@element-plus/icons-vue'
import { useAuditStore } from '@/stores/audit'
import { useAuthStore } from '@/stores/auth'
import type { AuditAction, AuditEntityType, AuditLog } from '@/types'

const auditStore = useAuditStore()
const auth = useAuthStore()

const operator = ref('')
const entityType = ref<AuditEntityType | ''>('')
const startTime = ref('')
const endTime = ref('')
const selectedIds = ref<number[]>([])

const hasSelection = computed(() => selectedIds.value.length > 0)

const actionMap: Record<AuditAction, string> = {
  create: '创建',
  update: '更新',
  delete: '删除',
  update_status: '更新状态',
  assign_roles: '分配角色',
  reset_password: '重置密码',
  update_password: '修改密码',
  clock_in: '上班打卡',
  clock_out: '下班打卡',
  generate_summary: '生成统计',
  approve: '审批通过',
  reject: '审批驳回',
  submit: '提交审核',
  pay: '确认发放',
  batch_create: '批量生成',
}

const entityTypeMap: Record<AuditEntityType, string> = {
  employee: '员工',
  department: '部门',
  user: '用户',
  salary_structure: '薪资结构',
  salary_record: '薪资记录',
  attendance_record: '考勤记录',
  attendance_summary: '考勤统计',
  leave_request: '请假申请',
}

const entityTypeOptions = Object.entries(entityTypeMap).map(([value, label]) => ({ label, value }))

onMounted(() => refresh())

function refresh() {
  selectedIds.value = []
  auditStore.setQuery({
    operator: operator.value || undefined,
    entity_type: entityType.value || undefined,
    start_time: startTime.value || undefined,
    end_time: endTime.value || undefined,
  })
  auditStore.setPage(1)
  auditStore.fetchAll()
}

function handlePageChange(p: number) {
  auditStore.setPage(p)
  auditStore.fetchAll()
}

function handleSizeChange(s: number) {
  auditStore.setPageSize(s)
  auditStore.fetchAll()
}

function handleSelectionChange(rows: AuditLog[]) {
  selectedIds.value = rows.map((r) => r.id)
}

async function handleBatchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条审计日志？`, '批量删除', { type: 'warning' })
  await auditStore.batchDeleteLogs(selectedIds.value)
  ElMessage.success('批量删除成功')
  refresh()
}

function getActionLabel(action: AuditAction) {
  return actionMap[action] || action
}

function getEntityTypeLabel(type: AuditEntityType) {
  return entityTypeMap[type] || type
}

function formatChanges(changes: string | null) {
  if (!changes) return '-'
  try {
    return JSON.stringify(JSON.parse(changes), null, 2)
  } catch {
    return changes
  }
}

function formatDate(dt: string | null) {
  if (!dt) return '-'
  return new Date(dt).toLocaleString('zh-CN')
}
</script>

<template>
  <div>
    <el-card style="margin-bottom: 16px">
      <el-row :gutter="12" align="middle">
        <el-col :span="5">
          <el-input v-model="operator" placeholder="操作人" clearable :prefix-icon="Search" @keyup.enter="refresh" @clear="refresh" />
        </el-col>
        <el-col :span="5">
          <el-select v-model="entityType" placeholder="实体类型" clearable style="width: 100%" @change="refresh">
            <el-option v-for="opt in entityTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-date-picker v-model="startTime" type="datetime" placeholder="开始时间" value-format="YYYY-MM-DDTHH:mm:ssZ" style="width: 100%" @change="refresh" />
        </el-col>
        <el-col :span="5">
          <el-date-picker v-model="endTime" type="datetime" placeholder="结束时间" value-format="YYYY-MM-DDTHH:mm:ssZ" style="width: 100%" @change="refresh" />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" :icon="Search" @click="refresh">搜索</el-button>
          <el-button type="danger" :icon="Delete" :disabled="!hasSelection" @click="handleBatchDelete">
            {{ hasSelection ? `(${selectedIds.length})` : '' }}
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table :data="auditStore.logs" v-loading="auditStore.loading" stripe border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column label="操作时间" width="170">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column label="操作类型" width="100" align="center">
          <template #default="{ row }">{{ getActionLabel(row.action) }}</template>
        </el-table-column>
        <el-table-column label="实体类型" width="100" align="center">
          <template #default="{ row }">{{ getEntityTypeLabel(row.entity_type) }}</template>
        </el-table-column>
        <el-table-column prop="entity_id" label="实体ID" width="80" align="center" />
        <el-table-column label="变更内容" min-width="200">
          <template #default="{ row }">
            <el-popover trigger="hover" :width="400" v-if="row.changes">
              <template #reference>
                <span style="cursor: pointer; color: #409eff">{{ row.changes.substring(0, 50) }}{{ row.changes.length > 50 ? '...' : '' }}</span>
              </template>
              <pre style="font-size: 12px; max-height: 300px; overflow: auto">{{ formatChanges(row.changes) }}</pre>
            </el-popover>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="ip_address" label="IP" width="130" />
      </el-table>

      <div style="display: flex; justify-content: flex-end; margin-top: 16px">
        <el-pagination
          v-model:current-page="auditStore.page"
          v-model:page-size="auditStore.pageSize"
          :total="auditStore.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>
