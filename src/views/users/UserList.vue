<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/users'
import { useRoleStore } from '@/stores/roles'
import type { User } from '@/types'

const userStore = useUserStore()
const roleStore = useRoleStore()

const keyword = ref('')
const selectedIds = ref<number[]>([])
const roleDialogVisible = ref(false)
const roleForm = ref<{ userId: number; roleIds: number[] }>({ userId: 0, roleIds: [] })

const hasSelection = computed(() => selectedIds.value.length > 0)

const filteredUsers = computed(() => {
  if (!keyword.value) return userStore.users
  const kw = keyword.value.toLowerCase()
  return userStore.users.filter(
    (u) =>
      u.username.toLowerCase().includes(kw) ||
      u.roles?.some((r) => r.name.toLowerCase().includes(kw) || r.description.includes(kw)),
  )
})

onMounted(() => {
  userStore.fetchAll()
  roleStore.fetchAll()
})

function handleSelectionChange(rows: User[]) {
  selectedIds.value = rows.map((r) => r.id)
}

function formatRoles(user: User): string {
  return user.roles?.map((r) => r.description || r.name).join('、') || '-'
}

async function handleToggleStatus(user: User) {
  const newStatus = user.status === 'active' ? 'disabled' : 'active'
  const label = newStatus === 'disabled' ? '禁用' : '启用'
  await ElMessageBox.confirm(`确认${label}用户 ${user.username}？`, '提示', { type: 'warning' })
  await userStore.updateStatus(user.id, newStatus)
  ElMessage.success(`${label}成功`)
  userStore.fetchAll()
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
  userStore.fetchAll()
}

async function handleBatchDisable() {
  await ElMessageBox.confirm(`确认禁用选中的 ${selectedIds.value.length} 个用户？`, '批量禁用', { type: 'warning' })
  for (const id of selectedIds.value) {
    await userStore.updateStatus(id, 'disabled')
  }
  ElMessage.success('批量禁用成功')
  userStore.fetchAll()
}
</script>

<template>
  <div>
    <el-card style="margin-bottom: 16px">
      <el-row :gutter="12" align="middle">
        <el-col :span="6">
          <el-input
            v-model="keyword"
            placeholder="搜索用户名/角色"
            clearable
            :prefix-icon="Search"
          />
        </el-col>
        <el-col :span="18" style="text-align: right">
          <el-button type="danger" :icon="Delete" :disabled="!hasSelection" @click="handleBatchDisable">
            批量禁用{{ hasSelection ? `(${selectedIds.length})` : '' }}
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table
        :data="filteredUsers"
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
        <el-table-column prop="created_at" label="创建时间" width="170" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleAssignRoles(row)">分配角色</el-button>
            <el-button
              size="small"
              :type="row.status === 'active' ? 'warning' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

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
