<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEmployeeStore } from '@/stores/employees'
import { useDepartmentStore } from '@/stores/departments'
import type { Employee } from '@/types'

const route = useRoute()
const router = useRouter()
const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()

const loading = ref(true)
const employee = ref<Employee | null>(null)

async function loadEmployee(id: number) {
  loading.value = true
  try {
    const data = await employeeStore.fetchOne(id)
    employee.value = data
    if (data?.dept_id && departmentStore.allDepartments.length === 0) {
      await departmentStore.fetchAllForSelect()
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => loadEmployee(Number(route.params.id)))

watch(() => route.params.id, (newId) => {
  if (newId) loadEmployee(Number(newId))
})

const statusLabel = computed(() => {
  if (!employee.value) return ''
  return employee.value.status === 'active' ? '在职' : '离职'
})

const statusType = computed(() => {
  if (!employee.value) return 'info' as const
  return employee.value.status === 'active' ? 'success' as const : 'danger' as const
})

const deptName = computed(() => {
  if (!employee.value?.dept_id) return '-'
  return employee.value.department?.name ?? departmentStore.allDepartments.find(d => d.id === employee.value!.dept_id)?.name ?? '-'
})

function formatDate(dt: string | null | undefined) {
  if (!dt) return '-'
  return new Date(dt).toLocaleString('zh-CN')
}
</script>

<template>
  <div>
    <el-page-header title="返回" @back="router.back()" style="margin-bottom: 16px">
      <template #content>
        <span style="font-size: 16px; font-weight: 600">员工详情</span>
      </template>
      <template #extra>
        <el-button type="primary" @click="router.push({ name: 'employee-edit', params: { id: route.params.id } })">编辑</el-button>
      </template>
    </el-page-header>

    <el-card v-loading="loading">
      <el-descriptions :column="2" border v-if="employee">
        <el-descriptions-item label="ID">{{ employee.id }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ employee.name }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ employee.email }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ employee.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ employee.id_number || '-' }}</el-descriptions-item>
        <el-descriptions-item label="部门">
          <el-link v-if="employee.dept_id" type="primary" @click="router.push({ name: 'department-detail', params: { id: employee.dept_id } })">
            {{ deptName }}
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType" size="small">{{ statusLabel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="上班时间">{{ employee.work_start_time || '-' }}</el-descriptions-item>
        <el-descriptions-item label="下班时间">{{ employee.work_end_time || '-' }}</el-descriptions-item>
        <el-descriptions-item label="关联用户">{{ employee.user_id ? `User#${employee.user_id}` : '未关联' }}</el-descriptions-item>
        <el-descriptions-item label="部门负责人">
          <span v-if="employee.dept_id">{{ '-' }}</span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建人">{{ employee.created_by || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新人">{{ employee.updated_by || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(employee.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(employee.updated_at) }}</el-descriptions-item>
      </el-descriptions>
      <el-empty v-else-if="!loading" description="员工不存在" />
    </el-card>
  </div>
</template>
