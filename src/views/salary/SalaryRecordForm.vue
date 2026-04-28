<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useSalaryStore } from '@/stores/salary'
import { useEmployeeStore } from '@/stores/employees'
import type { SalaryRecordForm } from '@/types'

const router = useRouter()
const salaryStore = useSalaryStore()
const employeeStore = useEmployeeStore()

const formRef = ref()
const loading = ref(false)

const form = ref<SalaryRecordForm>({
  employee_id: undefined,
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  performance_factor: 1,
})

const rules = {
  employee_id: [{ required: true, message: '请选择员工', trigger: 'change' }],
  year: [{ required: true, message: '请输入年份', trigger: 'blur' }],
  month: [{ required: true, message: '请选择月份', trigger: 'change' }],
}

onMounted(async () => {
  await employeeStore.fetchAll()
})

async function handleSubmit() {
  await formRef.value.validate()
  loading.value = true
  try {
    await salaryStore.createRecord(form.value)
    ElMessage.success('创建成功')
    router.push({ name: 'salary-record-list' })
  } catch {
    // 拦截器已弹出错误提示
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <el-page-header title="返回" @back="router.back()" style="margin-bottom: 16px">
      <template #content>
        <span style="font-size: 16px; font-weight: 600">新增薪资记录</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 600px">
        <el-form-item label="员工" prop="employee_id">
          <el-select v-model="form.employee_id" placeholder="请选择员工" filterable style="width: 100%">
            <el-option
              v-for="emp in employeeStore.employees"
              :key="emp.id"
              :label="`${emp.name} (${emp.email})`"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年份" prop="year">
              <el-input-number v-model="form.year" :min="2000" :max="2100" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="月份" prop="month">
              <el-select v-model="form.month" style="width: 100%">
                <el-option v-for="m in 12" :key="m" :label="`${m}月`" :value="m" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="绩效系数">
          <el-input-number v-model="form.performance_factor" :min="0" :max="10" :step="0.1" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
