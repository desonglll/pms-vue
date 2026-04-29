<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import { useEmployeeStore } from '@/stores/employees'
import { useDepartmentStore } from '@/stores/departments'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()
const auth = useAuthStore()

const keyword = ref('')
const sortField = ref('')
const sortOrder = ref('')
const selectedIds = ref<number[]>([])

const sortOptions = [
  { label: '默认', value: '' },
  { label: 'ID', value: 'id' },
  { label: '姓名', value: 'name' },
  { label: '邮箱', value: 'email' },
  { label: '状态', value: 'status' },
  { label: '创建时间', value: 'created_at' },
]

const hasSelection = computed(() => selectedIds.value.length > 0)
const canEdit = computed(() => auth.isAdmin || auth.isManager)

onMounted(() => {
  departmentStore.fetchAllForSelect()
  refresh()
})

function refresh() {
  selectedIds.value = []
  employeeStore.setQuery({
    keyword: keyword.value || undefined,
    sort_by: sortField.value || undefined,
    sort_desc: sortOrder.value === 'desc' ? true : sortOrder.value === 'asc' ? false : undefined,
  })
  employeeStore.fetchAll()
}

function handleSearch() {
  refresh()
}

function handleSortChange() {
  refresh()
}

function handlePageChange(p: number) {
  employeeStore.setPage(p)
  employeeStore.fetchAll()
}

function handleSizeChange(size: number) {
  employeeStore.setPageSize(size)
  employeeStore.fetchAll()
}

function handleSelectionChange(rows: { id: number }[]) {
  selectedIds.value = rows.map((r) => r.id)
}

function handleAdd() {
  router.push({ name: 'employee-new' })
}

function handleEdit(id: number) {
  router.push({ name: 'employee-edit', params: { id } })
}

async function handleDeleteOne(id: number) {
  await ElMessageBox.confirm('确认删除该员工？', '提示', { type: 'warning' })
  await employeeStore.remove(id)
  ElMessage.success('删除成功')
  refresh()
}

async function handleBatchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条记录？`, '批量删除', { type: 'warning' })
  for (const id of selectedIds.value) {
    await employeeStore.remove(id)
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
            placeholder="搜索姓名/邮箱/电话/身份证"
            clearable
            :prefix-icon="Search"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
        </el-col>
        <el-col :span="4">
          <el-select v-model="sortField" placeholder="排序字段" style="width: 100%" @change="handleSortChange">
            <el-option v-for="opt in sortOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="sortOrder" placeholder="排序方向" style="width: 100%" @change="handleSortChange" :disabled="!sortField">
            <el-option label="升序" value="asc" />
            <el-option label="降序" value="desc" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-col>
        <el-col :span="7" style="text-align: right">
          <el-button v-if="auth.isAdmin" type="danger" :icon="Delete" :disabled="!hasSelection" @click="handleBatchDelete">
            批量删除{{ hasSelection ? `(${selectedIds.length})` : '' }}
          </el-button>
          <el-button v-if="canEdit" type="primary" :icon="Plus" @click="handleAdd">新增员工</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table
        :data="employeeStore.employees"
        v-loading="employeeStore.loading"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="auth.isAdmin" type="selection" width="45" align="center" />
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="email" label="邮箱" min-width="160" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column label="部门" width="100">
          <template #default="{ row }">
            {{ row.department?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small" effect="dark">
              {{ row.status === 'active' ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="auth.isAdmin" label="关联用户" width="100">
          <template #default="{ row }">
            {{ row.user_id ? `User#${row.user_id}` : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link @click="router.push({ name: 'employee-detail', params: { id: row.id } })">查看</el-button>
            <el-button v-if="canEdit" size="small" type="primary" link @click="handleEdit(row.id)">编辑</el-button>
            <el-button v-if="auth.isAdmin" size="small" type="danger" link @click="handleDeleteOne(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="display: flex; justify-content: flex-end; margin-top: 16px">
        <el-pagination
          v-model:current-page="employeeStore.page"
          v-model:page-size="employeeStore.pageSize"
          :total="employeeStore.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>
