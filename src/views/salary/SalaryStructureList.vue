<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import { useSalaryStore } from '@/stores/salary'

const router = useRouter()
const salaryStore = useSalaryStore()

const keyword = ref('')
const selectedIds = ref<number[]>([])
const hasSelection = computed(() => selectedIds.value.length > 0)

onMounted(() => {
  refresh()
})

function refresh() {
  selectedIds.value = []
  salaryStore.setStructQuery({ keyword: keyword.value || undefined })
  salaryStore.fetchStructures()
}

function handleSearch() {
  refresh()
}

function handlePageChange(p: number) {
  salaryStore.setStructPage(p)
  salaryStore.fetchStructures()
}

function handleSizeChange(size: number) {
  salaryStore.setStructPageSize(size)
  salaryStore.fetchStructures()
}

function handleSelectionChange(rows: { id: number }[]) {
  selectedIds.value = rows.map((r) => r.id)
}

function handleAdd() {
  router.push({ name: 'salary-structure-new' })
}

function handleEdit(id: number) {
  router.push({ name: 'salary-structure-edit', params: { id } })
}

async function handleDeleteOne(id: number) {
  await ElMessageBox.confirm('确认删除该薪资结构？', '提示', { type: 'warning' })
  await salaryStore.deleteStructure(id)
  ElMessage.success('删除成功')
  refresh()
}

async function handleBatchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条记录？`, '批量删除', { type: 'warning' })
  for (const id of selectedIds.value) {
    await salaryStore.deleteStructure(id)
  }
  ElMessage.success('批量删除成功')
  refresh()
}
</script>

<template>
  <div>
    <el-card style="margin-bottom: 16px">
      <el-row :gutter="12" align="middle">
        <el-col :span="6">
          <el-input
            v-model="keyword"
            placeholder="搜索员工姓名"
            clearable
            :prefix-icon="Search"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
        </el-col>
        <el-col :span="3">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-col>
        <el-col :span="15" style="text-align: right">
          <el-button type="danger" :icon="Delete" :disabled="!hasSelection" @click="handleBatchDelete">
            批量删除{{ hasSelection ? `(${selectedIds.length})` : '' }}
          </el-button>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增薪资结构</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table
        :data="salaryStore.structures"
        v-loading="salaryStore.structLoading"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column label="员工" min-width="120">
          <template #default="{ row }">
            {{ row.employee?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="基本工资" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.base_salary?.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="岗位津贴" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.position_allowance?.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="绩效系数" width="100" align="center">
          <template #default="{ row }">
            ×{{ row.performance_factor }}
          </template>
        </el-table-column>
        <el-table-column label="应发合计" width="130" align="right">
          <template #default="{ row }">
            <span style="font-weight: 600">¥{{ ((row.base_salary + row.position_allowance) * row.performance_factor)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updated_by" label="更新人" width="90" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row.id)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDeleteOne(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="display: flex; justify-content: flex-end; margin-top: 16px">
        <el-pagination
          v-model:current-page="salaryStore.structPage"
          v-model:page-size="salaryStore.structPageSize"
          :total="salaryStore.structTotal"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>
