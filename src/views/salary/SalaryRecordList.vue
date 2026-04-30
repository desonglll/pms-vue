<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete, Check, Close, Promotion, Upload } from '@element-plus/icons-vue'
import { useSalaryStore } from '@/stores/salary'
import { useEmployeeStore } from '@/stores/employees'
import type { SalaryRecord, SalaryStatus } from '@/types'

const router = useRouter()
const salaryStore = useSalaryStore()
const employeeStore = useEmployeeStore()

const keyword = ref('')
const statusFilter = ref<SalaryStatus | ''>('')
const selectedIds = ref<number[]>([])

const hasSelection = computed(() => selectedIds.value.length > 0)

const statusMap: Record<SalaryStatus, { label: string; type: string }> = {
  draft: { label: '草稿', type: 'info' },
  pending: { label: '待审核', type: 'warning' },
  approved: { label: '已审核', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' },
  paid: { label: '已发放', type: '' },
}

onMounted(async () => {
  await employeeStore.fetchAllForSelect()
  refresh()
})

function refresh() {
  selectedIds.value = []
  salaryStore.setRecordQuery({
    keyword: keyword.value || undefined,
    status: statusFilter.value || undefined,
  })
  salaryStore.setRecordPage(1)
  salaryStore.fetchRecords()
}

function handleSearch() {
  refresh()
}

function handlePageChange(p: number) {
  salaryStore.setRecordPage(p)
  salaryStore.fetchRecords()
}

function handleSizeChange(s: number) {
  salaryStore.setRecordPageSize(s)
  salaryStore.fetchRecords()
}

function handleSelectionChange(rows: SalaryRecord[]) {
  selectedIds.value = rows.map((r) => r.id)
}

async function handleSubmit(id: number) {
  await ElMessageBox.confirm('确认提交审核？', '提示', { type: 'warning' })
  await salaryStore.submitRecord(id)
  ElMessage.success('提交成功')
  refresh()
}

async function handleApprove(id: number) {
  await ElMessageBox.confirm('确认审核通过？', '提示', { type: 'warning' })
  await salaryStore.approveRecord(id)
  ElMessage.success('审核通过')
  refresh()
}

async function handleReject(id: number) {
  await ElMessageBox.confirm('确认驳回？', '提示', { type: 'warning' })
  await salaryStore.rejectRecord(id)
  ElMessage.success('已驳回')
  refresh()
}

async function handlePay(id: number) {
  await ElMessageBox.confirm('确认发放薪资？', '提示', { type: 'warning' })
  await salaryStore.payRecord(id)
  ElMessage.success('发放成功')
  refresh()
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确认删除该薪资记录？', '提示', { type: 'warning' })
  await salaryStore.deleteRecord(id)
  ElMessage.success('删除成功')
  refresh()
}

async function handleBatchSubmit() {
  await ElMessageBox.confirm(`确认提交选中的 ${selectedIds.value.length} 条记录审核？`, '批量提交', { type: 'warning' })
  for (const id of selectedIds.value) {
    await salaryStore.submitRecord(id)
  }
  ElMessage.success('批量提交成功')
  refresh()
}

async function handleBatchApprove() {
  await ElMessageBox.confirm(`确认审核通过选中的 ${selectedIds.value.length} 条记录？`, '批量审核', { type: 'warning' })
  for (const id of selectedIds.value) {
    await salaryStore.approveRecord(id)
  }
  ElMessage.success('批量审核通过')
  refresh()
}

async function handleBatchReject() {
  await ElMessageBox.confirm(`确认驳回选中的 ${selectedIds.value.length} 条记录？`, '批量驳回', { type: 'warning' })
  for (const id of selectedIds.value) {
    await salaryStore.rejectRecord(id)
  }
  ElMessage.success('批量驳回成功')
  refresh()
}

async function handleBatchPay() {
  await ElMessageBox.confirm(`确认发放选中的 ${selectedIds.value.length} 条薪资？`, '批量发放', { type: 'warning' })
  for (const id of selectedIds.value) {
    await salaryStore.payRecord(id)
  }
  ElMessage.success('批量发放成功')
  refresh()
}

async function handleBatchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条记录？`, '批量删除', { type: 'warning' })
  for (const id of selectedIds.value) {
    await salaryStore.deleteRecord(id)
  }
  ElMessage.success('批量删除成功')
  refresh()
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
            <el-option label="草稿" value="draft" />
            <el-option label="待审核" value="pending" />
            <el-option label="已审核" value="approved" />
            <el-option label="已驳回" value="rejected" />
            <el-option label="已发放" value="paid" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-button type="success" :icon="Upload" :disabled="!hasSelection" @click="handleBatchSubmit">
            批量提交{{ hasSelection ? `(${selectedIds.length})` : '' }}
          </el-button>
          <el-button type="success" :icon="Check" :disabled="!hasSelection" @click="handleBatchApprove">
            批量审核{{ hasSelection ? `(${selectedIds.length})` : '' }}
          </el-button>
          <el-button type="warning" :icon="Close" :disabled="!hasSelection" @click="handleBatchReject">
            批量驳回{{ hasSelection ? `(${selectedIds.length})` : '' }}
          </el-button>
          <el-button type="primary" :icon="Promotion" :disabled="!hasSelection" @click="handleBatchPay">
            批量发放{{ hasSelection ? `(${selectedIds.length})` : '' }}
          </el-button>
          <el-button type="danger" :icon="Delete" :disabled="!hasSelection" @click="handleBatchDelete">
            批量删除{{ hasSelection ? `(${selectedIds.length})` : '' }}
          </el-button>
          <el-button type="primary" :icon="Plus" @click="router.push({ name: 'salary-record-new' })">新增薪资记录</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table :data="salaryStore.records" v-loading="salaryStore.loading" stripe border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column label="员工" width="100">
          <template #default="{ row }">{{ row.employee?.name || '-' }}</template>
        </el-table-column>
        <el-table-column prop="year" label="年" width="70" align="center" />
        <el-table-column prop="month" label="月" width="60" align="center" />
        <el-table-column label="基本工资" width="110" align="right">
          <template #default="{ row }">¥{{ row.base_salary?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="岗位津贴" width="110" align="right">
          <template #default="{ row }">¥{{ row.position_allowance?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="实发工资" width="110" align="right">
          <template #default="{ row }">¥{{ row.actual_salary?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="(statusMap[row.status as SalaryStatus]?.type || 'info') as any" size="small" effect="dark">
              {{ statusMap[row.status as SalaryStatus]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'draft'" size="small" type="success" link @click="handleSubmit(row.id)">提交</el-button>
            <el-button v-if="row.status === 'pending'" size="small" type="success" link @click="handleApprove(row.id)">通过</el-button>
            <el-button v-if="row.status === 'pending'" size="small" type="danger" link @click="handleReject(row.id)">驳回</el-button>
            <el-button v-if="row.status === 'approved'" size="small" type="primary" link @click="handlePay(row.id)">发放</el-button>
            <el-button v-if="row.status === 'draft'" size="small" type="primary" link @click="router.push({ name: 'salary-record-edit', params: { id: row.id } })">编辑</el-button>
            <el-button v-if="row.status === 'draft'" size="small" type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="display: flex; justify-content: flex-end; margin-top: 16px">
        <el-pagination
          v-model:current-page="salaryStore.recordPage"
          v-model:page-size="salaryStore.recordPageSize"
          :total="salaryStore.recordTotal"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>
