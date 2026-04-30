<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/users'
import { useRoleStore } from '@/stores/roles'
import type { User } from '@/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const roleStore = useRoleStore()

const loading = ref(true)
const user = ref<User | null>(null)

const roleDialogVisible = ref(false)
const roleLoading = ref(false)
const selectedRoleIds = ref<number[]>([])

const passwordDialogVisible = ref(false)
const passwordLoading = ref(false)
const newPassword = ref('')

async function loadUser(id: number) {
  loading.value = true
  try {
    const data = await userStore.fetchOne(id) as any
    user.value = data
  } catch {
    user.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => loadUser(Number(route.params.id)))

watch(() => route.params.id, (newId) => {
  if (newId) loadUser(Number(newId))
})

const statusLabel = computed(() => {
  if (!user.value) return ''
  return user.value.status === 'active' ? '启用' : '禁用'
})

const statusType = computed(() => {
  if (!user.value) return 'info' as const
  return user.value.status === 'active' ? 'success' as const : 'danger' as const
})

function formatDate(dt: string | null | undefined) {
  if (!dt) return '-'
  return new Date(dt).toLocaleString('zh-CN')
}

async function handleToggleStatus() {
  if (!user.value) return
  const newStatus = user.value.status === 'active' ? 'disabled' : 'active'
  const action = newStatus === 'disabled' ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确认${action}该用户？`, '提示', { type: 'warning' })
    await userStore.updateStatus(user.value.id, newStatus)
    ElMessage.success(`已${action}`)
    user.value = { ...user.value, status: newStatus }
  } catch { /* cancelled or error */ }
}

async function handleDelete() {
  if (!user.value) return
  await ElMessageBox.confirm(`确认删除用户 ${user.value.username}？`, '提示', { type: 'warning' })
  await userStore.remove(user.value.id)
  ElMessage.success('删除成功')
  router.push({ name: 'user-list' })
}

function openRoleDialog() {
  if (!user.value) return
  selectedRoleIds.value = user.value.roles.map(r => r.id)
  if (roleStore.roles.length === 0) roleStore.fetchAll()
  roleDialogVisible.value = true
}

async function handleAssignRoles() {
  if (!user.value) return
  roleLoading.value = true
  try {
    await userStore.assignRoles(user.value.id, selectedRoleIds.value)
    ElMessage.success('角色分配成功')
    roleDialogVisible.value = false
    loadUser(user.value.id)
  } catch {
    // interceptor handles error
  } finally {
    roleLoading.value = false
  }
}

function openPasswordDialog() {
  newPassword.value = ''
  passwordDialogVisible.value = true
}

async function handleResetPassword() {
  if (!newPassword.value) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (!user.value) return
  passwordLoading.value = true
  try {
    await userStore.updatePassword(user.value.id, newPassword.value)
    ElMessage.success('密码重置成功')
    passwordDialogVisible.value = false
  } catch {
    // interceptor handles error
  } finally {
    passwordLoading.value = false
  }
}
</script>

<template>
  <div>
    <el-page-header title="返回" @back="router.back()" style="margin-bottom: 16px">
      <template #content>
        <span style="font-size: 16px; font-weight: 600">用户详情</span>
      </template>
      <template #extra>
        <el-button @click="openRoleDialog">分配角色</el-button>
        <el-button @click="openPasswordDialog">重置密码</el-button>
        <el-button :type="user?.status === 'active' ? 'danger' : 'success'" @click="handleToggleStatus">
          {{ user?.status === 'active' ? '禁用' : '启用' }}
        </el-button>
        <el-button type="danger" @click="handleDelete">删除</el-button>
      </template>
    </el-page-header>

    <el-card v-loading="loading">
      <el-descriptions :column="2" border v-if="user">
        <el-descriptions-item label="ID">{{ user.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ user.username }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType" size="small">{{ statusLabel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag v-for="role in user.roles" :key="role.id" size="small" style="margin-right: 4px">{{ role.description || role.name }}</el-tag>
          <span v-if="user.roles.length === 0">-</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(user.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(user.updated_at) }}</el-descriptions-item>
      </el-descriptions>
      <el-empty v-else-if="!loading" description="用户不存在" />
    </el-card>

    <!-- 角色分配弹窗 -->
    <el-dialog v-model="roleDialogVisible" title="分配角色" width="400px">
      <el-checkbox-group v-model="selectedRoleIds">
        <el-checkbox v-for="role in roleStore.roles" :key="role.id" :value="role.id" :label="role.id">
          {{ role.description || role.name }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="roleLoading" @click="handleAssignRoles">确定</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog v-model="passwordDialogVisible" title="重置密码" width="400px">
      <el-form label-width="80px">
        <el-form-item label="新密码">
          <el-input v-model="newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="passwordLoading" @click="handleResetPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
