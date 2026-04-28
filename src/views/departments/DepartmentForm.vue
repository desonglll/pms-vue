<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useDepartmentStore } from '@/stores/departments'
import type { DepartmentForm } from '@/types'

const route = useRoute()
const router = useRouter()
const departmentStore = useDepartmentStore()

const isEdit = computed(() => route.name === 'department-edit')
const formRef = ref()
const loading = ref(false)

const form = ref<DepartmentForm>({
  name: '',
  description: '',
})

const rules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
}

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    try {
      const id = Number(route.params.id)
      const dept = await departmentStore.fetchOne(id)
      form.value = {
        name: dept.name,
        description: dept.description,
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
      await departmentStore.update(Number(route.params.id), { ...form.value })
    } else {
      await departmentStore.create(form.value)
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    router.push({ name: 'department-list' })
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
        <span style="font-size: 16px; font-weight: 600">{{ isEdit ? '编辑部门' : '新增部门' }}</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" style="max-width: 600px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入部门描述" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
