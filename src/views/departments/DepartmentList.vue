<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete, Grid } from '@element-plus/icons-vue'
import { useDepartmentStore } from '@/stores/departments'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const deptStore = useDepartmentStore()
const auth = useAuthStore()

const keyword = ref('')

const canEdit = computed(() => auth.isAdmin || auth.isManager)

onMounted(() => {
  refresh()
})

function refresh() {
  deptStore.setQuery({
    keyword: keyword.value || undefined,
  })
  deptStore.setPage(1)
  deptStore.fetchAll()
}

function handlePageChange(p: number) {
  deptStore.setPage(p)
  deptStore.fetchAll()
}

function handleSizeChange(s: number) {
  deptStore.setPageSize(s)
  deptStore.fetchAll()
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确认删除该部门？如有子部门或员工则不可删除。', '提示', { type: 'warning' })
  await deptStore.remove(id)
  ElMessage.success('删除成功')
  refresh()
}
</script>

<template>
  <div>
    <el-card style="margin-bottom: 16px">
      <el-row :gutter="12" align="middle">
        <el-col :span="6">
          <el-input v-model="keyword" placeholder="搜索部门名称" clearable :prefix-icon="Search" @keyup.enter="refresh" @clear="refresh" />
        </el-col>
        <el-col :span="3">
          <el-button type="primary" :icon="Search" @click="refresh">搜索</el-button>
        </el-col>
        <el-col :span="15" style="text-align: right">
          <el-button :icon="Grid" @click="router.push({ name: 'department-tree' })">部门树</el-button>
          <el-button v-if="canEdit" type="primary" :icon="Plus" @click="router.push({ name: 'department-new' })">新增部门</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table :data="deptStore.departments" v-loading="deptStore.loading" stripe border>
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="name" label="部门名称" width="140" />
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column label="上级部门" width="120">
          <template #default="{ row }">
            {{ deptStore.allDepartments.find(d => d.id === row.parent_id)?.name || (row.parent_id ? `#${row.parent_id}` : '顶级') }}
          </template>
        </el-table-column>
        <el-table-column label="负责人" width="100">
          <template #default="{ row }">{{ row.leader?.name || '-' }}</template>
        </el-table-column>
        <el-table-column prop="created_by" label="创建人" width="90" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link @click="router.push({ name: 'department-detail', params: { id: row.id } })">查看</el-button>
            <el-button v-if="canEdit" size="small" type="primary" link @click="router.push({ name: 'department-edit', params: { id: row.id } })">编辑</el-button>
            <el-button v-if="auth.isAdmin" size="small" type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="display: flex; justify-content: flex-end; margin-top: 16px">
        <el-pagination
          v-model:current-page="deptStore.page"
          v-model:page-size="deptStore.pageSize"
          :total="deptStore.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>
