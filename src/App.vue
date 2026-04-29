<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
  Clock,
  Calendar,
  Expand,
  Fold,
  Document,
  Grid,
} from '@element-plus/icons-vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const isCollapsed = ref(false)

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/employees')) return '/employees'
  if (path.startsWith('/departments')) return '/departments'
  if (path.startsWith('/users')) return '/users'
  if (path.startsWith('/salary/structures')) return '/salary/structures'
  if (path.startsWith('/salary/records')) return '/salary/records'
  if (path.startsWith('/attendance')) return '/attendance'
  if (path.startsWith('/leaves')) return '/leaves'
  if (path.startsWith('/audit-logs')) return '/audit-logs'
  return path
})

const defaultOpeneds = ['/salary']

const roleLabel = computed(() => {
  if (auth.isAdmin) return '管理员'
  if (auth.isManager) return '经理'
  if (auth.isStaff) return '员工'
  return ''
})

const roleTagType = computed(() => {
  if (auth.isAdmin) return 'danger'
  if (auth.isManager) return 'warning'
  return 'info'
})

onMounted(async () => {
  if (auth.isLoggedIn && !auth.user) {
    try {
      await auth.fetchUser()
    } catch {
      auth.logout()
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

  <!-- 已登录：侧边栏布局 -->
  <template v-else>
    <el-container class="app-layout">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapsed ? '64px' : '220px'" class="app-aside">
        <div class="aside-header">
          <transition name="fade" mode="out-in">
            <span v-if="!isCollapsed" class="logo" @click="router.push('/')">HR 管理系统</span>
            <span v-else class="logo-mini" @click="router.push('/')">HR</span>
          </transition>
        </div>
        <el-menu
          :default-active="activeMenu"
          :default-openeds="defaultOpeneds"
          :collapse="isCollapsed"
          :collapse-transition="true"
          router
          class="aside-menu"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <template #title>首页</template>
          </el-menu-item>

          <!-- 员工管理: admin/manager see list, staff sees /employees/me -->
          <el-menu-item v-if="auth.isAdmin || auth.isManager" index="/employees">
            <el-icon><User /></el-icon>
            <template #title>员工管理</template>
          </el-menu-item>
          <el-menu-item v-if="auth.isStaff" index="/employees/me">
            <el-icon><User /></el-icon>
            <template #title>个人档案</template>
          </el-menu-item>

          <el-menu-item index="/departments">
            <el-icon><OfficeBuilding /></el-icon>
            <template #title>部门管理</template>
          </el-menu-item>

          <!-- 薪资管理: admin only -->
          <el-sub-menu v-if="auth.isAdmin" index="/salary">
            <template #title>
              <el-icon><Money /></el-icon>
              <span>薪资管理</span>
            </template>
            <el-menu-item index="/salary/structures">薪资结构</el-menu-item>
            <el-menu-item index="/salary/records">薪资记录</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/attendance">
            <el-icon><Clock /></el-icon>
            <template #title>考勤管理</template>
          </el-menu-item>

          <el-menu-item index="/leaves">
            <el-icon><Calendar /></el-icon>
            <template #title>请假管理</template>
          </el-menu-item>

          <!-- 用户管理: admin only -->
          <el-menu-item v-if="auth.isAdmin" index="/users">
            <el-icon><Setting /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>

          <!-- 审计日志: admin only -->
          <el-menu-item v-if="auth.isAdmin" index="/audit-logs">
            <el-icon><Document /></el-icon>
            <template #title>审计日志</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧区域 -->
      <el-container class="main-area">
        <!-- 顶部栏 -->
        <el-header class="app-header">
          <div class="header-left">
            <el-icon
              class="collapse-btn"
              :size="20"
              @click="isCollapsed = !isCollapsed"
            >
              <Fold v-if="!isCollapsed" />
              <Expand v-else />
            </el-icon>
          </div>
          <div class="header-right">
            <el-tag :type="roleTagType" size="small" effect="dark">{{ roleLabel }}</el-tag>
            <span class="username">{{ auth.user?.username }}</span>
            <el-button :icon="SwitchButton" text @click="handleLogout">退出</el-button>
          </div>
        </el-header>

        <!-- 主内容区 -->
        <el-main class="app-main">
          <router-view />
        </el-main>
      </el-container>
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
</style>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-aside {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  overflow: hidden;
  transition: width 0.28s ease;
}

.aside-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e4e7ed;
  overflow: hidden;
}

.logo {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  cursor: pointer;
  white-space: nowrap;
}

.logo-mini {
  font-size: 18px;
  font-weight: 700;
  color: #409eff;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.aside-menu {
  border-right: none !important;
}

.aside-menu:not(.el-menu--collapse) {
  width: 220px;
}

.main-area {
  flex-direction: column;
  overflow: hidden;
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
}

.collapse-btn {
  cursor: pointer;
  color: #606266;
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: #409eff;
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
  overflow-y: auto;
}
</style>
