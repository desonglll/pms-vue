<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useSalaryStore } from '@/stores/salary'
import { useEmployeeStore } from '@/stores/employees'
import type { SalaryRecordForm } from '@/types'

const route = useRoute()
const router = useRouter()
const salaryStore = useSalaryStore()
const employeeStore = useEmployeeStore()

const isEdit = computed(() => route.name === 'salary-record-edit')
const formRef = ref()
const loading = ref(false)

const form = ref<SalaryRecordForm>({
  employee_id: undefined as unknown as number,
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  performance_factor: 1,
})

const rules = {
  employee_id: [{ required: true, message: '请选择员工', trigger: 'change' }],
  year: [{ required: true, message: '请输入年份', trigger: 'blur' }],
  month: [{ required: true, message: '请输入月份', trigger: 'blur' }],
}

onMounted(async () => {
  await employeeStore.fetchAllForSelect()
  if (isEdit.value) {
    const id = Number(route.params.id)
    loading.value = true
    try {
      const data = await salaryStore.fetchRecord(id) as any
      if (data) {
        form.value = {
          employee_id: data.employee_id,
          year: data.year,
          month: data.month,
          performance_factor: data.performance_factor,
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
      await salaryStore.updateRecord(Number(route.params.id), {
        performance_factor: form.value.performance_factor,
      })
    } else {
      await salaryStore.createRecord(form.value)
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    router.push({ name: 'salary-record-list' })
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
        <span style="font-size: 16px; font-weight: 600">{{ isEdit ? '编辑薪资记录' : '新增薪资记录' }}</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 600px">
        <el-form-item label="员工" prop="employee_id">
          <el-select v-model="form.employee_id" placeholder="请选择员工" filterable style="width: 100%" :disabled="isEdit">
            <el-option v-for="emp in employeeStore.allEmployees" :key="emp.id" :label="`${emp.name} (${emp.email})`" :value="emp.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="年份" prop="year">
          <el-input-number v-model="form.year" :min="2020" :max="2099" style="width: 100%" :disabled="isEdit" />
        </el-form-item>

        <el-form-item label="月份" prop="month">
          <el-input-number v-model="form.month" :min="1" :max="12" style="width: 100%" :disabled="isEdit" />
        </el-form-item>

        <el-form-item label="绩效系数">
          <el-input-number v-model="form.performance_factor" :min="0" :max="10" :step="0.1" :precision="2" style="width: 100%" />
        </el-form-item>

        <el-form-item v-if="isEdit" label="提示">
          <span style="color: #909399; font-size: 12px">修改绩效系数后，后端会自动重算应发工资</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
