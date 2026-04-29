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
    // ---- Employees ----
    {
      path: '/employees',
      name: 'employee-list',
      component: () => import('@/views/employees/EmployeeList.vue'),
      meta: { roles: ['admin', 'manager'] },
    },
    {
      path: '/employees/me',
      name: 'employee-me',
      component: () => import('@/views/employees/EmployeeMeView.vue'),
    },
    {
      path: '/employees/:id',
      name: 'employee-detail',
      component: () => import('@/views/employees/EmployeeDetail.vue'),
      props: true,
      meta: { roles: ['admin', 'manager'] },
    },
    {
      path: '/employees/new',
      name: 'employee-new',
      component: () => import('@/views/employees/EmployeeForm.vue'),
      meta: { roles: ['admin', 'manager'] },
    },
    {
      path: '/employees/:id/edit',
      name: 'employee-edit',
      component: () => import('@/views/employees/EmployeeForm.vue'),
      props: true,
      meta: { roles: ['admin', 'manager'] },
    },
    // ---- Departments ----
    {
      path: '/departments',
      name: 'department-list',
      component: () => import('@/views/departments/DepartmentList.vue'),
    },
    {
      path: '/departments/tree',
      name: 'department-tree',
      component: () => import('@/views/departments/DepartmentTreeView.vue'),
    },
    {
      path: '/departments/:id',
      name: 'department-detail',
      component: () => import('@/views/departments/DepartmentDetail.vue'),
      props: true,
    },
    {
      path: '/departments/new',
      name: 'department-new',
      component: () => import('@/views/departments/DepartmentForm.vue'),
      meta: { roles: ['admin', 'manager'] },
    },
    {
      path: '/departments/:id/edit',
      name: 'department-edit',
      component: () => import('@/views/departments/DepartmentForm.vue'),
      props: true,
      meta: { roles: ['admin', 'manager'] },
    },
    // ---- Users (admin only) ----
    {
      path: '/users',
      name: 'user-list',
      component: () => import('@/views/users/UserList.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/users/:id',
      name: 'user-detail',
      component: () => import('@/views/users/UserDetail.vue'),
      meta: { roles: ['admin'] },
      props: true,
    },
    // ---- Salary (admin only) ----
    {
      path: '/salary/structures',
      name: 'salary-structure-list',
      component: () => import('@/views/salary/SalaryStructureList.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/salary/structures/new',
      name: 'salary-structure-new',
      component: () => import('@/views/salary/SalaryStructureForm.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/salary/structures/:id/edit',
      name: 'salary-structure-edit',
      component: () => import('@/views/salary/SalaryStructureForm.vue'),
      props: true,
      meta: { roles: ['admin'] },
    },
    {
      path: '/salary/records',
      name: 'salary-record-list',
      component: () => import('@/views/salary/SalaryRecordList.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/salary/records/new',
      name: 'salary-record-new',
      component: () => import('@/views/salary/SalaryRecordForm.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/salary/records/:id/edit',
      name: 'salary-record-edit',
      component: () => import('@/views/salary/SalaryRecordForm.vue'),
      props: true,
      meta: { roles: ['admin'] },
    },
    // ---- Attendance ----
    {
      path: '/attendance',
      name: 'attendance',
      component: () => import('@/views/attendance/AttendanceClockIn.vue'),
    },
    // ---- Leaves ----
    {
      path: '/leaves',
      name: 'leave-list',
      component: () => import('@/views/leave/LeaveRequestList.vue'),
    },
    {
      path: '/leaves/new',
      name: 'leave-new',
      component: () => import('@/views/leave/LeaveRequestForm.vue'),
    },
    // ---- Audit Logs (admin only) ----
    {
      path: '/audit-logs',
      name: 'audit-log-list',
      component: () => import('@/views/audit/AuditLogList.vue'),
      meta: { roles: ['admin'] },
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.public) return true
  const auth = useAuthStore()
  if (!auth.isLoggedIn) {
    return { name: 'login' }
  }
  const requiredRoles = to.meta.roles as string[] | undefined
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(auth.role)) {
      return { name: 'dashboard' }
    }
  }
  return true
})

export default router
