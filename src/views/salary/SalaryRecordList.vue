<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus } from '@element-plus/icons-vue'
import { useSalaryStore } from '@/stores/salary'

const router = useRouter()
const salaryStore = useSalaryStore()

const keyword = ref('')
const filterEmployeeId = ref<number | undefined>(undefined)
const filterYear = ref<number | undefined>(undefined)
const filterMonth = ref<number | undefined>(undefined)

onMounted(() => {
  refresh()
})

function refresh() {
  salaryStore.setRecordQuery({ keyword: keyword.value || undefined })
  const filters: Record<string, unknown> = {}
  if (filterEmployeeId.value) filters.employee_id = filterEmployeeId.value
  if (filterYear.value) filters.year = filterYear.value
  if (filterMonth.value) filters.month = filterMonth.value
  salaryStore.setRecordFilters(filters)
  salaryStore.fetchRecords()
}

function handleSearch() {
  refresh()
}

function handleReset() {
  keyword.value = ''
  filterEmployeeId.value = undefined
  filterYear.value = undefined
  filterMonth.value = undefined
  salaryStore.clearRecordFilters()
  refresh()
}

function handlePageChange(p: number) {
  salaryStore.setRecordPage(p)
  salaryStore.fetchRecords()
}

function handleSizeChange(size: number) {
  salaryStore.setRecordPageSize(size)
  salaryStore.fetchRecords()
}

function handleAdd() {
  router.push({ name: 'salary-record-new' })
}

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i)
</script>

<template>
  <div>
    <el-card style="margin-bottom: 16px">
      <el-row :gutter="12" align="middle">
        <el-col :span="5">
          <el-input
            v-model="keyword"
            placeholder="搜索员工姓名"
            clearable
            :prefix-icon="Search"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterYear" placeholder="年份" clearable style="width: 100%" @change="handleSearch">
            <el-option v-for="y in yearOptions" :key="y" :label="`${y}年`" :value="y" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterMonth" placeholder="月份" clearable style="width: 100%" @change="handleSearch">
            <el-option v-for="m in 12" :key="m" :label="`${m}月`" :value="m" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
        <el-col :span="8" style="text-align: right">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增薪资记录</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table
        :data="salaryStore.records"
        v-loading="salaryStore.recordLoading"
        stripe
        border
      >
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column label="员工" min-width="120">
          <template #default="{ row }">
            {{ row.employee?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="year" label="年" width="80" align="center" />
        <el-table-column prop="month" label="月" width="60" align="center" />
        <el-table-column label="基本工资" width="110" align="right">
          <template #default="{ row }">
            ¥{{ row.base_salary?.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="岗位津贴" width="110" align="right">
          <template #default="{ row }">
            ¥{{ row.position_allowance?.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="绩效系数" width="90" align="center">
          <template #default="{ row }">
            ×{{ row.performance_factor }}
          </template>
        </el-table-column>
        <el-table-column label="实发工资" width="130" align="right">
          <template #default="{ row }">
            <span style="font-weight: 600">¥{{ row.actual_salary?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_by" label="创建人" width="90" />
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
