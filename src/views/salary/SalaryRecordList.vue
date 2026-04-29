<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { useSalaryStore } from '@/stores/salary'
import { useAuthStore } from '@/stores/auth'
import type { SalaryStatus } from '@/types'

const router = useRouter()
const salaryStore = useSalaryStore()
const auth = useAuthStore()

const keyword = ref('')
const statusFilter = ref<SalaryStatus | ''>('')
const batchDialogVisible = ref(false)
const batchForm = ref({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, scope: 'all' as 'all' | 'dept' | 'employees', dept_id: undefined as number | undefined, employee_ids: [] as number[] })

const statusOptions: { label: string; value: SalaryStatus; type: string }[] = [
  { label: '草稿', value: 'draft', type: 'info' },
  { label: '待审核', value: 'pending', type: 'warning' },
  { label: '已审核', value: 'approved', type: 'success' },
  { label: '已驳回', value: 'rejected', type: 'danger' },
  { label: '已发放', value: 'paid', type: '' },
]

const statusMap = Object.fromEntries(statusOptions.map(s => [s.value, s]))

onMounted(() => {
  salaryStore.fetchStructures()
  refresh()
})

function refresh() {
  salaryStore.setRecordQuery({
    keyword: keyword.value || undefined,
    status: statusFilter.value || undefined,
  })
  salaryStore.setRecordPage(1)
  salaryStore.fetchRecords()
}

function handlePageChange(p: number) {
  salaryStore.setRecordPage(p)
  salaryStore.fetchRecords()
}

function handleSizeChange(s: number) {
  salaryStore.setRecordPageSize(s)
  salaryStore.fetchRecords()
}

function getStatusType(status: SalaryStatus) {
  return (statusMap[status]?.type || 'info') as '' | 'success' | 'warning' | 'danger' | 'info'
}

function getStatusLabel(status: SalaryStatus) {
  return statusMap[status]?.label || status
}

function canEdit(row: { status: SalaryStatus }) {
  return row.status === 'draft' || row.status === 'rejected'
}

function canSubmit(row: { status: SalaryStatus }) {
  return row.status === 'draft' || row.status === 'rejected'
}

function canApprove(row: { status: SalaryStatus }) {
  return row.status === 'pending'
}

function canPay(row: { status: SalaryStatus }) {
  return row.status === 'approved' && auth.isAdmin
}

async function handleSubmitAction(id: number) {
  await salaryStore.submitRecord(id)
  ElMessage.success('已提交审核')
  refresh()
}

async function handleApprove(id: number) {
  await salaryStore.approveRecord(id)
  ElMessage.success('审核通过')
  refresh()
}

async function handleReject(id: number) {
  await ElMessageBox.confirm('确认驳回该薪资记录？', '提示', { type: 'warning' })
  await salaryStore.rejectRecord(id)
  ElMessage.success('已驳回')
  refresh()
}

async function handlePay(id: number) {
  await ElMessageBox.confirm('确认发放该薪资？', '提示', { type: 'warning' })
  await salaryStore.payRecord(id)
  ElMessage.success('已确认发放')
  refresh()
}

async function handleBatchGenerate() {
  const form: Record<string, unknown> = {
    year: batchForm.value.year,
    month: batchForm.value.month,
  }
  if (batchForm.value.scope === 'dept') {
    form.dept_id = batchForm.value.dept_id
  } else if (batchForm.value.scope === 'employees') {
    form.employee_ids = batchForm.value.employee_ids
  }
  await salaryStore.batchGenerate(form as any)
  ElMessage.success('批量生成完成（已存在记录会自动跳过）')
  batchDialogVisible.value = false
  refresh()
}

function formatMoney(v: number) {
  return '¥' + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<template>
  <div>
    <el-card style="margin-bottom: 16px">
      <el-row :gutter="12" align="middle">
        <el-col :span="6">
          <el-input v-model="keyword" placeholder="搜索" clearable :prefix-icon="Search" @keyup.enter="refresh" @clear="refresh" />
        </el-col>
        <el-col :span="4">
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 100%" @change="refresh">
            <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" :icon="Search" @click="refresh">搜索</el-button>
        </el-col>
        <el-col :span="11" style="text-align: right">
          <el-button type="primary" :icon="Plus" @click="batchDialogVisible = true">批量生成</el-button>
          <el-button type="primary" :icon="Plus" @click="router.push({ name: 'salary-record-new' })">新增记录</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table :data="salaryStore.records" v-loading="salaryStore.loading" stripe border>
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column label="员工" width="100">
          <template #default="{ row }">{{ row.employee?.name || '-' }}</template>
        </el-table-column>
        <el-table-column prop="year" label="年" width="70" align="center" />
        <el-table-column prop="month" label="月" width="60" align="center" />
        <el-table-column label="基本工资" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.base_salary) }}</template>
        </el-table-column>
        <el-table-column label="岗位津贴" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.position_allowance) }}</template>
        </el-table-column>
        <el-table-column label="绩效系数" width="90" align="center">
          <template #default="{ row }">{{ row.performance_factor }}</template>
        </el-table-column>
        <el-table-column label="应发工资" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.actual_salary) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small" effect="dark">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核人" width="80" prop="reviewed_by" />
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="canEdit(row)" size="small" type="primary" link @click="router.push({ name: 'salary-record-edit', params: { id: row.id } })">修改</el-button>
            <el-button v-if="canSubmit(row)" size="small" type="warning" link @click="handleSubmitAction(row.id)">提交审核</el-button>
            <el-button v-if="canApprove(row)" size="small" type="success" link @click="handleApprove(row.id)">通过</el-button>
            <el-button v-if="canApprove(row)" size="small" type="danger" link @click="handleReject(row.id)">驳回</el-button>
            <el-button v-if="canPay(row)" size="small" type="success" link @click="handlePay(row.id)">确认发放</el-button>
            <el-tag v-if="row.status === 'paid'" size="small" type="info">已发放</el-tag>
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

    <el-dialog v-model="batchDialogVisible" title="批量生成薪资记录" width="480px">
      <el-form label-width="80px">
        <el-form-item label="年份">
          <el-input-number v-model="batchForm.year" :min="2020" :max="2099" style="width: 100%" />
        </el-form-item>
        <el-form-item label="月份">
          <el-input-number v-model="batchForm.month" :min="1" :max="12" style="width: 100%" />
        </el-form-item>
        <el-form-item label="生成范围">
          <el-radio-group v-model="batchForm.scope">
            <el-radio value="all">全员</el-radio>
            <el-radio value="dept">按部门</el-radio>
            <el-radio value="employees">指定员工</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="batchForm.scope === 'dept'" label="部门">
          <el-select v-model="batchForm.dept_id" placeholder="选择部门" style="width: 100%">
            <el-option label="开发部" :value="1" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchGenerate">确认生成</el-button>
      </template>
      <div style="color: #909399; font-size: 12px; margin-top: 8px">已存在记录会自动跳过</div>
    </el-dialog>
  </div>
</template>
