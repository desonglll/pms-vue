<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { useLeaveStore } from '@/stores/leave'
import { useAuthStore } from '@/stores/auth'
import type { LeaveStatus, LeaveType } from '@/types'

const router = useRouter()
const leaveStore = useLeaveStore()
const auth = useAuthStore()

const keyword = ref('')

const leaveTypeMap: Record<LeaveType, string> = {
  annual: '年假',
  sick: '病假',
  personal: '事假',
}

const leaveStatusMap: Record<LeaveStatus, { label: string; type: string }> = {
  pending: { label: '待审批', type: 'warning' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' },
}

const canApprove = computed(() => auth.isAdmin || auth.isManager)

onMounted(() => {
  refresh()
})

function refresh() {
  leaveStore.setQuery({
    keyword: keyword.value || undefined,
  })
  leaveStore.setPage(1)
  leaveStore.fetchAll()
}

function handlePageChange(p: number) {
  leaveStore.setPage(p)
  leaveStore.fetchAll()
}

function handleSizeChange(s: number) {
  leaveStore.setPageSize(s)
  leaveStore.fetchAll()
}

function getStatusType(status: LeaveStatus) {
  return (leaveStatusMap[status]?.type || 'info') as '' | 'success' | 'warning' | 'danger' | 'info'
}

function getStatusLabel(status: LeaveStatus) {
  return leaveStatusMap[status]?.label || status
}

function getTypeLabel(type: LeaveType) {
  return leaveTypeMap[type] || type
}

async function handleApprove(id: number) {
  await leaveStore.approve(id)
  ElMessage.success('审批通过')
  refresh()
}

async function handleReject(id: number) {
  await ElMessageBox.confirm('确认驳回该请假申请？', '提示', { type: 'warning' })
  await leaveStore.reject(id)
  ElMessage.success('已驳回')
  refresh()
}
</script>

<template>
  <div>
    <el-card style="margin-bottom: 16px">
      <el-row :gutter="12" align="middle">
        <el-col :span="6">
          <el-input v-model="keyword" placeholder="搜索" clearable :prefix-icon="Search" @keyup.enter="refresh" @clear="refresh" />
        </el-col>
        <el-col :span="3">
          <el-button type="primary" :icon="Search" @click="refresh">搜索</el-button>
        </el-col>
        <el-col :span="15" style="text-align: right">
          <el-button type="primary" :icon="Plus" @click="router.push({ name: 'leave-new' })">申请请假</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table :data="leaveStore.leaves" v-loading="leaveStore.loading" stripe border>
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column label="员工" width="100">
          <template #default="{ row }">{{ row.employee?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="类型" width="80" align="center">
          <template #default="{ row }">{{ getTypeLabel(row.type) }}</template>
        </el-table-column>
        <el-table-column prop="start_date" label="开始日期" width="120" />
        <el-table-column prop="end_date" label="结束日期" width="120" />
        <el-table-column prop="reason" label="原因" min-width="150" show-overflow-tooltip />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small" effect="dark">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reviewed_by" label="审批人" width="90" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending' && canApprove" size="small" type="success" link @click="handleApprove(row.id)">通过</el-button>
            <el-button v-if="row.status === 'pending' && canApprove" size="small" type="danger" link @click="handleReject(row.id)">驳回</el-button>
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
