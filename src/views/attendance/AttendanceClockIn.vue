<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Clock, Calendar, Delete } from '@element-plus/icons-vue'
import { useAttendanceStore } from '@/stores/attendance'
import { useEmployeeStore } from '@/stores/employees'
import { useAuthStore } from '@/stores/auth'
import type { AttendanceRecord } from '@/types'

const attendanceStore = useAttendanceStore()
const employeeStore = useEmployeeStore()
const auth = useAuthStore()

const activeTab = ref('records')

// 打卡区域
const clockEmployeeId = ref<number | null>(null)
const clockLoading = ref(false)

// 打卡记录筛选
const startDate = ref('')
const endDate = ref('')
const selectedRecordIds = ref<number[]>([])
const hasRecordSelection = computed(() => selectedRecordIds.value.length > 0)

// 考勤统计区域
const summaryEmployeeId = ref<number | null>(null)
const summaryForm = ref({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 })
const summaryLoading = ref(false)

const isAdmin = computed(() => auth.isAdmin)
const isStaff = computed(() => auth.isStaff)

onMounted(async () => {
  if (!isStaff.value) {
    await employeeStore.fetchAllForSelect()
  }
  if (isStaff.value && auth.employeeId) {
    clockEmployeeId.value = auth.employeeId
    summaryEmployeeId.value = auth.employeeId
  }
  refreshRecords()
})

function refreshRecords() {
  selectedRecordIds.value = []
  attendanceStore.setRecordQuery({
    start_date: startDate.value || undefined,
    end_date: endDate.value || undefined,
  })
  attendanceStore.setRecordPage(1)
  attendanceStore.fetchRecords()
}

// ---- 打卡 ----

async function handleClockIn() {
  if (!clockEmployeeId.value) {
    ElMessage.warning('请选择员工')
    return
  }
  clockLoading.value = true
  try {
    await attendanceStore.clockIn(clockEmployeeId.value)
    ElMessage.success('上班打卡成功')
    refreshRecords()
  } catch {
    // interceptor handles error
  } finally {
    clockLoading.value = false
  }
}

async function handleClockOut() {
  if (!clockEmployeeId.value) {
    ElMessage.warning('请选择员工')
    return
  }
  clockLoading.value = true
  try {
    await attendanceStore.clockOut(clockEmployeeId.value)
    ElMessage.success('下班打卡成功')
    refreshRecords()
  } catch {
    // interceptor handles error
  } finally {
    clockLoading.value = false
  }
}

// ---- 打卡记录 ----

function handleRecordPageChange(p: number) {
  attendanceStore.setRecordPage(p)
  attendanceStore.fetchRecords()
}

function handleRecordSizeChange(s: number) {
  attendanceStore.setRecordPageSize(s)
  attendanceStore.fetchRecords()
}

function handleRecordSelectionChange(rows: AttendanceRecord[]) {
  selectedRecordIds.value = rows.map((r) => r.id)
}

async function handleBatchDeleteRecords() {
  await ElMessageBox.confirm(`确认删除选中的 ${selectedRecordIds.value.length} 条打卡记录？`, '批量删除', { type: 'warning' })
  await attendanceStore.batchDeleteRecords(selectedRecordIds.value)
  ElMessage.success('批量删除成功')
  refreshRecords()
}

// ---- 考勤统计 ----

async function handleGenerateSummary() {
  if (!summaryEmployeeId.value) {
    ElMessage.warning('请选择要生成统计的员工')
    return
  }
  summaryLoading.value = true
  try {
    await attendanceStore.generateSummary({
      employee_id: summaryEmployeeId.value,
      year: summaryForm.value.year,
      month: summaryForm.value.month,
    })
    ElMessage.success('统计生成成功')
    attendanceStore.fetchSummaries()
  } catch {
    // interceptor handles error
  } finally {
    summaryLoading.value = false
  }
}

function handleSummaryPageChange(p: number) {
  attendanceStore.setSummaryPage(p)
  attendanceStore.fetchSummaries()
}

function handleSummarySizeChange(s: number) {
  attendanceStore.setSummaryPageSize(s)
  attendanceStore.fetchSummaries()
}

function formatTime(dt: string | null) {
  if (!dt) return '-'
  return new Date(dt).toLocaleString('zh-CN')
}

function onTabChange(tab: string) {
  if (tab === 'summaries') {
    attendanceStore.fetchSummaries()
  }
}
</script>

<template>
  <div>
    <!-- 打卡操作区 -->
    <el-card style="margin-bottom: 16px">
      <el-row :gutter="12" align="middle">
        <el-col :span="6">
          <el-select
            v-model="clockEmployeeId"
            placeholder="选择员工（打卡）"
            filterable
            style="width: 100%"
            :disabled="isStaff"
          >
            <el-option v-for="emp in employeeStore.allEmployees" :key="emp.id" :label="`${emp.name} (${emp.email})`" :value="emp.id" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" :icon="Clock" @click="handleClockIn" :loading="clockLoading">上班打卡</el-button>
        </el-col>
        <el-col :span="3">
          <el-button type="warning" :icon="Clock" @click="handleClockOut" :loading="clockLoading">下班打卡</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <!-- 打卡记录 -->
      <el-tab-pane label="打卡记录" name="records">
        <el-card style="margin-bottom: 16px">
          <el-row :gutter="12" align="middle">
            <el-col :span="5">
              <el-date-picker v-model="startDate" type="date" placeholder="开始日期" value-format="YYYY-MM-DD" style="width: 100%" @change="refreshRecords" />
            </el-col>
            <el-col :span="5">
              <el-date-picker v-model="endDate" type="date" placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 100%" @change="refreshRecords" />
            </el-col>
            <el-col :span="14" style="text-align: right">
              <el-button v-if="isAdmin" type="danger" :icon="Delete" :disabled="!hasRecordSelection" @click="handleBatchDeleteRecords">
                批量删除{{ hasRecordSelection ? `(${selectedRecordIds.length})` : '' }}
              </el-button>
            </el-col>
          </el-row>
        </el-card>

        <el-card>
          <el-table :data="attendanceStore.records" v-loading="attendanceStore.loading" stripe border @selection-change="handleRecordSelectionChange">
            <el-table-column type="selection" width="45" align="center" />
            <el-table-column prop="id" label="ID" width="60" align="center" />
            <el-table-column label="员工" width="100">
              <template #default="{ row }">{{ row.employee?.name || '-' }}</template>
            </el-table-column>
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column label="上班时间" width="180">
              <template #default="{ row }">{{ formatTime(row.clock_in) }}</template>
            </el-table-column>
            <el-table-column label="下班时间" width="180">
              <template #default="{ row }">{{ formatTime(row.clock_out) }}</template>
            </el-table-column>
            <el-table-column prop="created_by" label="打卡人" width="90" />
          </el-table>

          <div style="display: flex; justify-content: flex-end; margin-top: 16px">
            <el-pagination
              v-model:current-page="attendanceStore.recordPage"
              v-model:page-size="attendanceStore.recordPageSize"
              :total="attendanceStore.recordTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @current-change="handleRecordPageChange"
              @size-change="handleRecordSizeChange"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 考勤统计 -->
      <el-tab-pane label="考勤统计" name="summaries">
        <el-card style="margin-bottom: 16px">
          <el-row :gutter="12" align="middle">
            <el-col :span="6" v-if="!isStaff">
              <el-select v-model="summaryEmployeeId" placeholder="选择员工（生成统计）" filterable style="width: 100%">
                <el-option v-for="emp in employeeStore.allEmployees" :key="emp.id" :label="emp.name" :value="emp.id" />
              </el-select>
            </el-col>
            <el-col :span="3">
              <el-input-number v-model="summaryForm.year" :min="2020" :max="2099" style="width: 100%" />
            </el-col>
            <el-col :span="3">
              <el-input-number v-model="summaryForm.month" :min="1" :max="12" style="width: 100%" />
            </el-col>
            <el-col :span="4">
              <el-button type="primary" :icon="Calendar" @click="handleGenerateSummary" :loading="summaryLoading" :disabled="isStaff">生成统计</el-button>
            </el-col>
          </el-row>
        </el-card>

        <el-card>
          <el-table :data="attendanceStore.summaries" v-loading="attendanceStore.loading" stripe border>
            <el-table-column prop="id" label="ID" width="60" align="center" />
            <el-table-column label="员工" width="100">
              <template #default="{ row }">{{ row.employee?.name || '-' }}</template>
            </el-table-column>
            <el-table-column prop="year" label="年" width="70" align="center" />
            <el-table-column prop="month" label="月" width="60" align="center" />
            <el-table-column prop="normal_days" label="正常天数" width="100" align="center" />
            <el-table-column prop="late_days" label="迟到天数" width="100" align="center" />
            <el-table-column prop="early_days" label="早退天数" width="100" align="center" />
            <el-table-column prop="absent_days" label="缺勤天数" width="100" align="center" />
          </el-table>

          <div style="display: flex; justify-content: flex-end; margin-top: 16px">
            <el-pagination
              v-model:current-page="attendanceStore.summaryPage"
              v-model:page-size="attendanceStore.summaryPageSize"
              :total="attendanceStore.summaryTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @current-change="handleSummaryPageChange"
              @size-change="handleSummarySizeChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
