<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Check, Close } from '@element-plus/icons-vue'
import { useLeaveStore } from '@/stores/leave'
import { useEmployeeStore } from '@/stores/employees'
import { useAuthStore } from '@/stores/auth'
import type { LeaveRequest, LeaveStatus } from '@/types'

const router = useRouter()
const leaveStore = useLeaveStore()
const employeeStore = useEmployeeStore()
const auth = useAuthStore()

const keyword = ref('')
const statusFilter = ref<LeaveStatus | ''>('')
const selectedIds = ref<number[]>([])

const hasSelection = computed(() => selectedIds.value.length > 0)
const canApprove = computed(() => auth.isAdmin || auth.isManager)

const leaveTypeMap: Record<string, string> = {
  annual: '年假',
  sick: '病假',
  personal: '事假',
}

const statusMap: Record<LeaveStatus, { label: string; type: string }> = {
  pending: { label: '待审批', type: 'warning' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' },
}

onMounted(async () => {
  if (!auth.isStaff) {
    await employeeStore.fetchAllForSelect()
  }
  refresh()
})

function refresh() {
  selectedIds.value = []
  leaveStore.setQuery({
    keyword: keyword.value || undefined,
    status: statusFilter.value || undefined,
  })
  leaveStore.setPage(1)
  leaveStore.fetchAll()
}

function handleSearch() {
  refresh()
}

function handlePageChange(p: number) {
  leaveStore.setPage(p)
  leaveStore.fetchAll()
}

function handleSizeChange(size: number) {
  leaveStore.setPageSize(size)
  leaveStore.fetchAll()
}

function handleSelectionChange(rows: LeaveRequest[]) {
  selectedIds.value = rows.map((r) => r.id)
}

async function handleApprove(id: number) {
  await ElMessageBox.confirm('确认通过该请假申请？', '审批', { type: 'warning' })
  await leaveStore.approve(id)
  ElMessage.success('审批通过')
  refresh()
}

async function handleReject(id: number) {
  await ElMessageBox.confirm('确认驳回该请假申请？', '审批', { type: 'warning' })
  await leaveStore.reject(id)
  ElMessage.success('已驳回')
  refresh()
}

async function handleBatchApprove() {
  await ElMessageBox.confirm(`确认通过选中的 ${selectedIds.value.length} 条请假申请？`, '批量审批', { type: 'warning' })
  await leaveStore.batchApprove(selectedIds.value)
  ElMessage.success('批量审批通过')
  refresh()
}

async function handleBatchReject() {
  await ElMessageBox.confirm(`确认驳回选中的 ${selectedIds.value.length} 条请假申请？`, '批量驳回', { type: 'warning' })
  await leaveStore.batchReject(selectedIds.value)
  ElMessage.success('批量驳回成功')
  refresh()
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
          <el-input v-model="keyword" placeholder="搜索" clearable :prefix-icon="Search" @keyup.enter="handleSearch" @clear="handleSearch" />
        </el-col>
        <el-col :span="4">
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 100%" @change="handleSearch">
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-button v-if="canApprove" type="success" :icon="Check" :disabled="!hasSelection" @click="handleBatchApprove">
            批量通过{{ hasSelection ? `(${selectedIds.length})` : '' }}
          </el-button>
          <el-button v-if="canApprove" type="danger" :icon="Close" :disabled="!hasSelection" @click="handleBatchReject">
            批量驳回{{ hasSelection ? `(${selectedIds.length})` : '' }}
          </el-button>
          <el-button type="primary" :icon="Plus" @click="router.push({ name: 'leave-new' })">新增请假</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table :data="leaveStore.leaves" v-loading="leaveStore.loading" stripe border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column label="员工" width="100">
          <template #default="{ row }">{{ row.employee?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="类型" width="80" align="center">
          <template #default="{ row }">{{ leaveTypeMap[row.type] || row.type }}</template>
        </el-table-column>
        <el-table-column prop="start_date" label="开始日期" width="120" />
        <el-table-column prop="end_date" label="结束日期" width="120" />
        <el-table-column prop="reason" label="原因" min-width="150" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="(statusMap[row.status as LeaveStatus]?.type || 'info') as any" size="small" effect="dark">
              {{ statusMap[row.status as LeaveStatus]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="canApprove && row.status === 'pending'" size="small" type="success" link @click="handleApprove(row.id)">通过</el-button>
            <el-button v-if="canApprove && row.status === 'pending'" size="small" type="danger" link @click="handleReject(row.id)">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="display: flex; justify-content: flex-end; margin-top: 16px">
        <el-pagination
          v-model:current-page="leaveStore.page"
          v-model:page-size="leaveStore.pageSize"
          :total="leaveStore.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>
