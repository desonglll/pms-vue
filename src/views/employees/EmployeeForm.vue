<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useEmployeeStore } from '@/stores/employees'
import { useDepartmentStore } from '@/stores/departments'
import type { EmployeeForm } from '@/types'

const route = useRoute()
const router = useRouter()
const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()

const isEdit = computed(() => route.name === 'employee-edit')
const formRef = ref()
const loading = ref(false)

const form = ref<EmployeeForm>({
  name: '',
  email: '',
  phone: '',
  id_number: '',
  dept_id: undefined,
  status: 'active',
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email' as const, message: '邮箱格式不正确', trigger: 'blur' },
  ],
  id_number: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  dept_id: [{ required: true, message: '请选择部门', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

onMounted(async () => {
  loading.value = true
  try {
    await departmentStore.fetchAllForSelect()
    if (isEdit.value) {
      const id = Number(route.params.id)
      const emp = await employeeStore.fetchOne(id)
      form.value = {
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        id_number: emp.id_number,
        dept_id: emp.dept_id,
        status: emp.status,
      }
    }
  } finally {
    loading.value = false
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
    // 拦截器已弹出错误提示
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <el-page-header :title="'返回'" @back="router.back()" style="margin-bottom: 16px">
      <template #content>
        <span style="font-size: 16px; font-weight: 600">{{ isEdit ? '编辑员工' : '新增员工' }}</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" style="max-width: 600px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="身份证号" prop="id_number">
          <el-input v-model="form.id_number" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="部门" prop="dept_id">
          <el-select v-model="form.dept_id" placeholder="请选择部门" style="width: 100%">
            <el-option
              v-for="dept in departmentStore.allDepartments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">在职</el-radio>
            <el-radio value="inactive">离职</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
