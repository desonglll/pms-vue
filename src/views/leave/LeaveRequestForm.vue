<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useLeaveStore } from '@/stores/leave'
import { useEmployeeStore } from '@/stores/employees'
import { useAuthStore } from '@/stores/auth'
import type { LeaveRequestForm, LeaveType } from '@/types'

const router = useRouter()
const leaveStore = useLeaveStore()
const employeeStore = useEmployeeStore()
const auth = useAuthStore()

const formRef = ref()
const loading = ref(false)

const isStaff = computed(() => auth.isStaff)

const form = ref<LeaveRequestForm>({
  employee_id: undefined as unknown as number,
  type: 'annual' as LeaveType,
  start_date: '',
  end_date: '',
  reason: '',
})

const rules = {
  employee_id: [{ required: true, message: '请选择员工', trigger: 'change' }],
  type: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  start_date: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  end_date: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  reason: [{ required: true, message: '请输入请假原因', trigger: 'blur' }],
}

const typeOptions: { label: string; value: LeaveType }[] = [
  { label: '年假', value: 'annual' },
  { label: '病假', value: 'sick' },
  { label: '事假', value: 'personal' },
]

onMounted(async () => {
  if (!isStaff.value) {
    await employeeStore.fetchAll()
  }
  if (isStaff.value && auth.employeeId) {
    form.value.employee_id = auth.employeeId
  }
})

async function handleSubmit() {
  await formRef.value.validate()
  loading.value = true
  try {
    await leaveStore.create(form.value)
    ElMessage.success('请假申请提交成功')
    router.push({ name: 'leave-list' })
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
        <span style="font-size: 16px; font-weight: 600">申请请假</span>
      </template>
    </el-page-header>

    <el-card>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 600px">
        <el-form-item label="员工" prop="employee_id">
          <el-select v-model="form.employee_id" placeholder="请选择员工" filterable style="width: 100%" :disabled="isStaff">
            <el-option v-for="emp in employeeStore.employees" :key="emp.id" :label="`${emp.name} (${emp.email})`" :value="emp.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="请假类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
            <el-option v-for="opt in typeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="开始日期" prop="start_date">
          <el-date-picker v-model="form.start_date" type="date" placeholder="选择开始日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>

        <el-form-item label="结束日期" prop="end_date">
          <el-date-picker v-model="form.end_date" type="date" placeholder="选择结束日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>

        <el-form-item label="请假原因" prop="reason">
          <el-input v-model="form.reason" type="textarea" :rows="3" placeholder="请输入请假原因" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
