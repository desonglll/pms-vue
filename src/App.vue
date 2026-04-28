<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import {
  HomeFilled,
  User,
  OfficeBuilding,
  SwitchButton,
  Setting,
  Money,
} from '@element-plus/icons-vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/employees')) return '/employees'
  if (path.startsWith('/departments')) return '/departments'
  if (path.startsWith('/users')) return '/users'
  if (path.startsWith('/salary/structures')) return '/salary/structures'
  if (path.startsWith('/salary/records')) return '/salary/records'
  return path
})

onMounted(async () => {
  if (auth.isLoggedIn && !auth.user) {
    try {
      await auth.fetchUser()
    } catch {
      auth.logout()
      router.push('/login')
    }
  }
})

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <!-- 未登录：只渲染登录页 -->
  <template v-if="!auth.isLoggedIn">
    <router-view />
  </template>

  <!-- 已登录：经典后台布局 -->
  <template v-else>
    <el-container class="app-layout">
      <!-- 顶部导航 -->
      <el-header class="app-header">
        <div class="header-left">
          <span class="logo" @click="router.push('/')">HR 管理系统</span>
          <el-menu
            mode="horizontal"
            :default-active="activeMenu"
            :ellipsis="false"
            router
            class="header-menu"
          >
            <el-menu-item index="/">
              <el-icon><HomeFilled /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="/employees">
              <el-icon><User /></el-icon>
              <span>员工管理</span>
            </el-menu-item>
            <el-menu-item index="/departments">
              <el-icon><OfficeBuilding /></el-icon>
              <span>部门管理</span>
            </el-menu-item>
            <el-menu-item v-if="auth.isAdmin" index="/users">
              <el-icon><Setting /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
            <el-sub-menu index="/salary">
              <template #title>
                <el-icon><Money /></el-icon>
                <span>薪资管理</span>
              </template>
              <el-menu-item index="/salary/structures">薪资结构</el-menu-item>
              <el-menu-item index="/salary/records">薪资记录</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </div>
        <div class="header-right">
          <span class="username">{{ auth.user?.username }}</span>
          <el-tag v-if="auth.isAdmin" size="small" type="danger" effect="dark" style="margin-right: 4px">管理员</el-tag>
          <el-button :icon="SwitchButton" text @click="handleLogout">退出</el-button>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </template>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.app-layout {
  min-height: 100vh;
  flex-direction: column;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  height: 56px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  cursor: pointer;
  white-space: nowrap;
  margin-right: 8px;
}

.header-menu {
  border-bottom: none !important;
  height: 56px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 14px;
  color: #606266;
}

.app-main {
  background: #f0f2f5;
  padding: 20px;
  min-height: calc(100vh - 56px);
}
</style>
