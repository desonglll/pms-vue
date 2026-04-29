<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDepartmentStore } from '@/stores/departments'
import type { Department } from '@/types'

const route = useRoute()
const router = useRouter()
const deptStore = useDepartmentStore()

const loading = ref(true)
const dept = ref<Department | null>(null)

async function loadDept(id: number) {
  loading.value = true
  try {
    const data = await deptStore.fetchOne(id)
    dept.value = data
    if (deptStore.allDepartments.length === 0) {
      await deptStore.fetchAllForSelect()
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => loadDept(Number(route.params.id)))

watch(() => route.params.id, (newId) => {
  if (newId) loadDept(Number(newId))
})

const parentName = computed(() => {
  if (!dept.value?.parent_id) return '顶级部门'
  return deptStore.allDepartments.find(d => d.id === dept.value!.parent_id)?.name ?? `#${dept.value!.parent_id}`
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
        <span style="font-size: 16px; font-weight: 600">部门详情</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading">
      <el-descriptions :column="2" border v-if="dept">
        <el-descriptions-item label="ID">{{ dept.id }}</el-descriptions-item>
        <el-descriptions-item label="部门名称">{{ dept.name }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ dept.description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上级部门">{{ parentName }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ dept.leader?.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ dept.created_by || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新人">{{ dept.updated_by || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(dept.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(dept.updated_at) }}</el-descriptions-item>
      </el-descriptions>
      <el-empty v-else-if="!loading" description="部门不存在" />
    </el-card>
  </div>
</template>
