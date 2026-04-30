<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Delete, Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/users'
import { useRoleStore } from '@/stores/roles'
import type { User } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const roleStore = useRoleStore()

const keyword = ref('')
const selectedIds = ref<number[]>([])
const roleDialogVisible = ref(false)
const roleForm = ref<{ userId: number; roleIds: number[] }>({ userId: 0, roleIds: [] })
const createDialogVisible = ref(false)
const createForm = ref<{ username: string; password: string; roleIds: number[] }>({ username: '', password: '', roleIds: [] })
const createFormRef = ref()

const hasSelection = computed(() => selectedIds.value.length > 0)

const createRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
}

onMounted(() => {
  refresh()
  roleStore.fetchAll()
})

function refresh() {
  selectedIds.value = []
  userStore.setQuery({ keyword: keyword.value || undefined })
  userStore.fetchAll()
}

function handleSearch() {
  refresh()
}

function handlePageChange(p: number) {
  userStore.setPage(p)
  userStore.fetchAll()
}

function handleSizeChange(size: number) {
  userStore.setPageSize(size)
  userStore.fetchAll()
}

function handleSelectionChange(rows: User[]) {
  selectedIds.value = rows.map((r) => r.id)
}

function formatRoles(user: User): string {
  return user.roles?.map((r) => r.description || r.name).join('、') || '-'
}

function handleCreate() {
  createForm.value = { username: '', password: '', roleIds: [] }
  createDialogVisible.value = true
}

async function handleCreateSubmit() {
  await createFormRef.value?.validate()
  await userStore.create({
    username: createForm.value.username,
    password: createForm.value.password,
    role_ids: createForm.value.roleIds,
  })
  ElMessage.success('创建用户成功')
  createDialogVisible.value = false
  refresh()
}

async function handleToggleStatus(user: User) {
  const newStatus = user.status === 'active' ? 'disabled' : 'active'
  const label = newStatus === 'disabled' ? '禁用' : '启用'
  await ElMessageBox.confirm(`确认${label}用户 ${user.username}？`, '提示', { type: 'warning' })
  await userStore.updateStatus(user.id, newStatus)
  ElMessage.success(`${label}成功`)
  refresh()
}

async function handleDelete(user: User) {
  await ElMessageBox.confirm(`确认删除用户 ${user.username}？`, '提示', { type: 'warning' })
  await userStore.remove(user.id)
  ElMessage.success('删除成功')
  refresh()
}

function handleAssignRoles(user: User) {
  roleForm.value = {
    userId: user.id,
    roleIds: user.roles?.map((r) => r.id) || [],
  }
  roleDialogVisible.value = true
}

async function handleRoleSubmit() {
  await userStore.assignRoles(roleForm.value.userId, roleForm.value.roleIds)
  ElMessage.success('角色分配成功')
  roleDialogVisible.value = false
  refresh()
}

async function handleBatchDisable() {
  await ElMessageBox.confirm(`确认禁用选中的 ${selectedIds.value.length} 个用户？`, '批量禁用', { type: 'warning' })
  for (const id of selectedIds.value) {
    await userStore.updateStatus(id, 'disabled')
  }
  ElMessage.success('批量禁用成功')
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
            placeholder="搜索用户名"
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
          <el-button type="danger" :icon="Delete" :disabled="!hasSelection" @click="handleBatchDisable">
            批量禁用{{ hasSelection ? `(${selectedIds.length})` : '' }}
          </el-button>
          <el-button type="primary" :icon="Plus" @click="handleCreate">新增用户</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table
        :data="userStore.users"
        v-loading="userStore.loading"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column label="角色" min-width="150">
          <template #default="{ row }">
            {{ formatRoles(row) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small" effect="dark">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link @click="router.push({ name: 'user-detail', params: { id: row.id } })">查看</el-button>
            <el-button size="small" type="primary" link @click="handleAssignRoles(row)">分配角色</el-button>
            <el-button
              size="small"
              :type="row.status === 'active' ? 'warning' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="display: flex; justify-content: flex-end; margin-top: 16px">
        <el-pagination
          v-model:current-page="userStore.page"
          v-model:page-size="userStore.pageSize"
          :total="userStore.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="createDialogVisible" title="新增用户" width="480px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="createForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="createForm.password" type="password" show-password placeholder="请输入密码（至少6位）" />
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group v-model="createForm.roleIds">
            <el-checkbox v-for="role in roleStore.roles" :key="role.id" :value="role.id" :label="role.id">
              {{ role.description || role.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="roleDialogVisible" title="分配角色" width="450px">
      <el-checkbox-group v-model="roleForm.roleIds">
        <el-checkbox v-for="role in roleStore.roles" :key="role.id" :value="role.id" :label="role.id">
          {{ role.description || role.name }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRoleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
