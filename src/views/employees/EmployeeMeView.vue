<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getMyEmployee } from '@/api/employees'
import type { Employee } from '@/types'

const auth = useAuthStore()
const loading = ref(true)
const employee = ref<Employee | null>(null)
const notFound = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await getMyEmployee()
    employee.value = data
  } catch (err: any) {
    if (err.response?.status === 404) {
      notFound.value = true
    }
  } finally {
    loading.value = false
  }
})

function formatDate(dt: string | null | undefined) {
  if (!dt) return '-'
  return new Date(dt).toLocaleString('zh-CN')
}
</script>

<template>
  <div>
    <el-page-header style="margin-bottom: 16px">
      <template #content>
        <span style="font-size: 16px; font-weight: 600">个人档案</span>
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
          {{ employee.department?.name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="employee.status === 'active' ? 'success' : 'danger'" size="small">
            {{ employee.status === 'active' ? '在职' : '离职' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="上班时间">{{ employee.work_start_time || '-' }}</el-descriptions-item>
        <el-descriptions-item label="下班时间">{{ employee.work_end_time || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-result v-else-if="notFound" icon="warning" title="未关联员工档案" sub-title="请联系管理员关联您的员工档案">
      </el-result>

      <el-empty v-else-if="!loading" description="无法获取档案信息" />
    </el-card>
  </div>
</template>
