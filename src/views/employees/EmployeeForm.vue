<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useEmployeeStore } from '@/stores/employees'
import { useDepartmentStore } from '@/stores/departments'
import { useUserStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import type { EmployeeForm } from '@/types'

const route = useRoute()
const router = useRouter()
const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()
const userStore = useUserStore()
const auth = useAuthStore()

const isEdit = computed(() => route.name === 'employee-edit')
const formRef = ref()
const loading = ref(false)

const form = ref<EmployeeForm>({
  name: '',
  email: '',
  phone: '',
  id_number: '',
  dept_id: 0,
  user_id: null,
  status: 'active',
  work_start_time: '09:00',
  work_end_time: '18:00',
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  dept_id: [{ required: true, message: '请选择部门', trigger: 'change' }],
}

function buildSelectTree(items: { id: number; name: string; parent_id: number | null }[]) {
  function build(parentId: number | null): any[] {
    return items
      .filter(d => d.parent_id === parentId)
      .map(d => ({ id: d.id, label: d.name, children: build(d.id) }))
  }
  return build(null)
}

const deptTreeData = computed(() => {
  if (departmentStore.tree.length > 0) return departmentStore.tree
  return buildSelectTree(departmentStore.allDepartments)
})

onMounted(async () => {
  await departmentStore.fetchAllForSelect()
  if (auth.isAdmin) {
    await userStore.fetchAllForSelect()
  }
  if (isEdit.value) {
    const id = Number(route.params.id)
    loading.value = true
    try {
      const data = await employeeStore.fetchOne(id) as any
      if (data) {
        form.value = {
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          id_number: data.id_number || '',
          dept_id: data.dept_id,
          user_id: data.user_id,
          status: data.status || 'active',
          work_start_time: data.work_start_time || '09:00',
          work_end_time: data.work_end_time || '18:00',
        }
      }
    } finally {
      loading.value = false
    }
  }
})

async function handleSubmit() {
  await formRef.value.validate()
  loading.value = true
  try {
    if (isEdit.value) {
      await employeeStore.update(Number(route.params.id), { ...form.value })
    } else {
      await employeeStore.create(form.value)
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    router.push({ name: 'employee-list' })
  } catch {
    // interceptor handles error
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <el-page-header title="返回" @back="router.back()" style="margin-bottom: 16px">
      <template #content>
        <span style="font-size: 16px; font-weight: 600">{{ isEdit ? '编辑员工' : '新增员工' }}</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 600px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="电话">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>

        <el-form-item label="身份证号">
          <el-input v-model="form.id_number" placeholder="请输入身份证号" />
        </el-form-item>

        <el-form-item label="部门" prop="dept_id">
          <el-tree-select
            v-model="form.dept_id"
            :data="deptTreeData"
            placeholder="请选择部门"
            clearable
            check-strictly
            :render-after-expand="false"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item v-if="auth.isAdmin" label="关联用户">
          <el-select v-model="form.user_id" placeholder="关联登录账号（可选）" filterable clearable style="width: 100%">
            <el-option v-for="u in userStore.allUsers" :key="u.id" :label="u.username" :value="u.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="在职" value="active" />
            <el-option label="离职" value="inactive" />
          </el-select>
        </el-form-item>

        <el-form-item label="上班时间">
          <el-time-select v-model="form.work_start_time" :max-time="form.work_end_time" placeholder="上班时间" start="06:00" step="00:30" end="23:00" style="width: 100%" />
        </el-form-item>

        <el-form-item label="下班时间">
          <el-time-select v-model="form.work_end_time" :min-time="form.work_start_time" placeholder="下班时间" start="06:00" step="00:30" end="23:00" style="width: 100%" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
