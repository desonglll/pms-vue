import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/dashboard/DashboardView.vue'),
    },
    {
      path: '/employees',
      name: 'employee-list',
      component: () => import('@/views/employees/EmployeeList.vue'),
    },
    {
      path: '/employees/new',
      name: 'employee-new',
      component: () => import('@/views/employees/EmployeeForm.vue'),
    },
    {
      path: '/employees/:id/edit',
      name: 'employee-edit',
      component: () => import('@/views/employees/EmployeeForm.vue'),
      props: true,
    },
    {
      path: '/departments',
      name: 'department-list',
      component: () => import('@/views/departments/DepartmentList.vue'),
    },
    {
      path: '/departments/new',
      name: 'department-new',
      component: () => import('@/views/departments/DepartmentForm.vue'),
    },
    {
      path: '/departments/:id/edit',
      name: 'department-edit',
      component: () => import('@/views/departments/DepartmentForm.vue'),
      props: true,
    },
    {
      path: '/users',
      name: 'user-list',
      component: () => import('@/views/users/UserList.vue'),
      meta: { admin: true },
    },
    {
      path: '/salary/structures',
      name: 'salary-structure-list',
      component: () => import('@/views/salary/SalaryStructureList.vue'),
    },
    {
      path: '/salary/structures/new',
      name: 'salary-structure-new',
      component: () => import('@/views/salary/SalaryStructureForm.vue'),
    },
    {
      path: '/salary/structures/:id/edit',
      name: 'salary-structure-edit',
      component: () => import('@/views/salary/SalaryStructureForm.vue'),
      props: true,
    },
    {
      path: '/salary/records',
      name: 'salary-record-list',
      component: () => import('@/views/salary/SalaryRecordList.vue'),
    },
    {
      path: '/salary/records/new',
      name: 'salary-record-new',
      component: () => import('@/views/salary/SalaryRecordForm.vue'),
    },
    {
      path: '/salary/records/:id/edit',
      name: 'salary-record-edit',
      component: () => import('@/views/salary/SalaryRecordForm.vue'),
      props: true,
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.public) return true
  const auth = useAuthStore()
  if (!auth.isLoggedIn) {
    return { name: 'login' }
  }
  if (to.meta.admin && !auth.isAdmin) {
    return { name: 'dashboard' }
  }
})

export default router
