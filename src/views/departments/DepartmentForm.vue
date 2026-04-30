<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useDepartmentStore } from '@/stores/departments'
import { useEmployeeStore } from '@/stores/employees'
import type { DepartmentForm } from '@/types'

const route = useRoute()
const router = useRouter()
const deptStore = useDepartmentStore()
const employeeStore = useEmployeeStore()

const isEdit = computed(() => route.name === 'department-edit')
const formRef = ref()
const loading = ref(false)

const form = ref<DepartmentForm>({
  name: '',
  description: '',
  parent_id: null,
  leader_id: null,
})

const rules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
}

onMounted(async () => {
  await deptStore.fetchAllForSelect()
  await employeeStore.fetchAllForSelect()
  if (isEdit.value) {
    const id = Number(route.params.id)
    loading.value = true
    try {
      const data = await deptStore.fetchOne(id) as any
      if (data) {
        form.value = {
          name: data.name,
          description: data.description ?? '',
          parent_id: data.parent_id,
          leader_id: data.leader_id,
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
      await deptStore.update(Number(route.params.id), { ...form.value })
    } else {
      await deptStore.create(form.value)
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    router.push({ name: 'department-list' })
  } catch {
    // interceptor handles error
  } finally {
    loading.value = false
  }
}

const treeData = computed(() => {
  const editId = isEdit.value ? Number(route.params.id) : null
  function buildTree(items: any[], parentId: number | null): any[] {
    return items
      .filter(d => d.parent_id === parentId && d.id !== editId)
      .map(d => ({
        id: d.id,
        label: d.name,
        children: buildTree(items, d.id),
      }))
  }
  return buildTree(deptStore.allDepartments, null)
})
</script>

<template>
  <div>
    <el-page-header title="返回" @back="router.back()" style="margin-bottom: 16px">
      <template #content>
        <span style="font-size: 16px; font-weight: 600">{{ isEdit ? '编辑部门' : '新增部门' }}</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 600px">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入部门名称" />
        </el-form-item>

        <el-form-item label="部门描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入部门描述" />
        </el-form-item>

        <el-form-item label="上级部门">
          <el-tree-select
            v-model="form.parent_id"
            :data="treeData"
            placeholder="不选择则为顶级部门"
            clearable
            check-strictly
            :render-after-expand="false"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="部门负责人">
          <el-select v-model="form.leader_id" placeholder="选择负责人" filterable clearable style="width: 100%">
            <el-option v-for="emp in employeeStore.allEmployees" :key="emp.id" :label="`${emp.name} (${emp.email})`" :value="emp.id" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
