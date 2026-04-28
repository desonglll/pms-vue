<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useSalaryStore } from '@/stores/salary'
import { useEmployeeStore } from '@/stores/employees'
import type { SalaryStructureForm } from '@/types'

const route = useRoute()
const router = useRouter()
const salaryStore = useSalaryStore()
const employeeStore = useEmployeeStore()

const isEdit = computed(() => route.name === 'salary-structure-edit')
const formRef = ref()
const loading = ref(false)

const form = ref<SalaryStructureForm>({
  employee_id: undefined,
  base_salary: 0,
  position_allowance: 0,
  performance_factor: 1,
})

const rules = {
  employee_id: [{ required: true, message: '请选择员工', trigger: 'change' }],
  base_salary: [{ required: true, message: '请输入基本工资', trigger: 'blur' }],
}

const calculatedTotal = computed(() => {
  return (form.value.base_salary + form.value.position_allowance) * form.value.performance_factor
})

onMounted(async () => {
  await employeeStore.fetchAll()
  // 确保薪资结构列表已加载
  if (salaryStore.structures.length === 0) {
    await salaryStore.fetchStructures()
  }
  if (isEdit.value) {
    const id = Number(route.params.id)
    const s = salaryStore.structures.find((item) => item.id === id)
    if (s) {
      form.value = {
        employee_id: s.employee_id,
        base_salary: s.base_salary,
        position_allowance: s.position_allowance,
        performance_factor: s.performance_factor,
      }
    }
  }
})

async function handleSubmit() {
  await formRef.value.validate()
  loading.value = true
  try {
    if (isEdit.value) {
      await salaryStore.updateStructure(Number(route.params.id), { ...form.value })
    } else {
      await salaryStore.createStructure(form.value)
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    router.push({ name: 'salary-structure-list' })
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
        <span style="font-size: 16px; font-weight: 600">{{ isEdit ? '编辑薪资结构' : '新增薪资结构' }}</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 600px">
        <el-form-item label="员工" prop="employee_id">
          <el-select v-model="form.employee_id" placeholder="请选择员工" filterable style="width: 100%" :disabled="isEdit">
            <el-option
              v-for="emp in employeeStore.employees"
              :key="emp.id"
              :label="`${emp.name} (${emp.email})`"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="基本工资" prop="base_salary">
          <el-input-number v-model="form.base_salary" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="岗位津贴">
          <el-input-number v-model="form.position_allowance" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="绩效系数">
          <el-input-number v-model="form.performance_factor" :min="0" :max="10" :step="0.1" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="应发合计">
          <span style="font-size: 18px; font-weight: 600; color: #409eff">
            ¥{{ calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
