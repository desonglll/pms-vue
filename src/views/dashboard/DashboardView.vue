<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEmployeeStore } from '@/stores/employees'
import { useDepartmentStore } from '@/stores/departments'
import { useUserStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { User, OfficeBuilding, Avatar, Plus, List, Setting } from '@element-plus/icons-vue'

const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()
const userStore = useUserStore()
const auth = useAuthStore()

const empTotal = ref(0)
const deptTotal = ref(0)
const userTotal = ref(0)

onMounted(async () => {
  try {
    await employeeStore.fetchAll()
    empTotal.value = employeeStore.total
  } catch { /* ignore */ }
  try {
    await departmentStore.fetchAll()
    deptTotal.value = departmentStore.total
  } catch { /* ignore */ }
  if (auth.isAdmin) {
    try {
      await userStore.fetchAll()
      userTotal.value = userStore.users.length
    } catch { /* ignore */ }
  }
})
</script>

<template>
  <div>
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-body">
            <el-icon class="stat-icon" :size="48" color="#409eff"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ empTotal }}</div>
              <div class="stat-label">员工总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-body">
            <el-icon class="stat-icon" :size="48" color="#67c23a"><OfficeBuilding /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ deptTotal }}</div>
              <div class="stat-label">部门总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col v-if="auth.isAdmin" :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-body">
            <el-icon class="stat-icon" :size="48" color="#e6a23c"><Avatar /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ userTotal }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>快捷操作</template>
      <el-space wrap :size="12">
        <el-button type="primary" :icon="Plus" @click="$router.push('/employees/new')">新增员工</el-button>
        <el-button :icon="Plus" @click="$router.push('/departments/new')">新增部门</el-button>
        <el-button :icon="List" @click="$router.push('/employees')">员工列表</el-button>
        <el-button :icon="List" @click="$router.push('/departments')">部门列表</el-button>
        <el-button v-if="auth.isAdmin" :icon="Setting" type="warning" @click="$router.push('/users')">用户管理</el-button>
      </el-space>
    </el-card>
  </div>
</template>

<style scoped>
.stat-card {
  height: 120px;
}

.stat-body {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
</style>
