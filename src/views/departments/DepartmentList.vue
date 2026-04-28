<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import { useDepartmentStore } from '@/stores/departments'

const router = useRouter()
const departmentStore = useDepartmentStore()

const keyword = ref('')
const sortField = ref('')
const sortOrder = ref('')
const selectedIds = ref<number[]>([])

const sortOptions = [
  { label: '默认', value: '' },
  { label: 'ID', value: 'id' },
  { label: '名称', value: 'name' },
]

const hasSelection = computed(() => selectedIds.value.length > 0)

onMounted(() => {
  refresh()
})

function refresh() {
  selectedIds.value = []
  departmentStore.setQuery({
    keyword: keyword.value || undefined,
    sort_by: sortField.value || undefined,
    sort_desc: sortOrder.value === 'desc' ? true : sortOrder.value === 'asc' ? false : undefined,
  })
  departmentStore.fetchAll()
}

function handleSearch() {
  refresh()
}

function handleSortChange() {
  refresh()
}

function handlePageChange(p: number) {
  departmentStore.setPage(p)
  departmentStore.fetchAll()
}

function handleSizeChange(size: number) {
  departmentStore.setPageSize(size)
  departmentStore.fetchAll()
}

function handleSelectionChange(rows: { id: number }[]) {
  selectedIds.value = rows.map((r) => r.id)
}

function handleAdd() {
  router.push({ name: 'department-new' })
}

function handleEdit(id: number) {
  router.push({ name: 'department-edit', params: { id } })
}

async function handleDeleteOne(id: number) {
  await ElMessageBox.confirm('确认删除该部门？', '提示', { type: 'warning' })
  await departmentStore.remove(id)
  ElMessage.success('删除成功')
  refresh()
}

async function handleBatchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条记录？`, '批量删除', { type: 'warning' })
  for (const id of selectedIds.value) {
    await departmentStore.remove(id)
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
            placeholder="搜索部门名称"
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
          <el-button type="danger" :icon="Delete" :disabled="!hasSelection" @click="handleBatchDelete">
            批量删除{{ hasSelection ? `(${selectedIds.length})` : '' }}
          </el-button>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增部门</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table
        :data="departmentStore.departments"
        v-loading="departmentStore.loading"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="created_by" label="创建人" width="100" />
        <el-table-column prop="updated_by" label="更新人" width="100" />
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row.id)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDeleteOne(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="display: flex; justify-content: flex-end; margin-top: 16px">
        <el-pagination
          v-model:current-page="departmentStore.page"
          v-model:page-size="departmentStore.pageSize"
          :total="departmentStore.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>
