<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDepartmentStore } from '@/stores/departments'

const deptStore = useDepartmentStore()

onMounted(() => {
  deptStore.fetchTree()
})

const treeProps = {
  children: 'children',
  label: 'name',
}
</script>

<template>
  <div>
    <el-page-header title="返回" @back="$router.back()" style="margin-bottom: 16px">
      <template #content>
        <span style="font-size: 16px; font-weight: 600">部门树</span>
      </template>
    </el-page-header>

    <el-card v-loading="deptStore.loading">
      <el-tree
        :data="deptStore.tree"
        :props="treeProps"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
      >
        <template #default="{ data }">
          <span style="display: flex; align-items: center; gap: 8px; font-size: 14px">
            <span style="font-weight: 500">{{ data.name }}</span>
            <el-tag v-if="data.leader_name" size="small" type="info">{{ data.leader_name }}</el-tag>
            <span v-if="data.description" style="color: #909399; font-size: 12px">{{ data.description }}</span>
          </span>
        </template>
      </el-tree>

      <el-empty v-if="!deptStore.loading && deptStore.tree.length === 0" description="暂无部门数据" />
    </el-card>
  </div>
</template>
