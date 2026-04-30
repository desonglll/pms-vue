// ---- Common ----
export interface ListQuery {
  page?: number
  page_size?: number
  keyword?: string
  sort_by?: string
  sort_desc?: boolean
}

export interface ListResult<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// ---- Auth ----
export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResult {
  token: string
}

export interface JwtPayload {
  user_id: number
  username: string
  role: 'admin' | 'manager' | 'staff'
  employee_id?: number
  jti: string
  exp: number
  iat: number
}

// ---- User ----
export interface User {
  id: number
  username: string
  status: string
  roles: Role[]
  created_at: string
  updated_at: string
}

export interface UserDetail extends User {
  employee_id?: number | null
}

// ---- Role ----
export interface Role {
  id: number
  name: string
  description: string
}

// ---- Department ----
export interface Department {
  id: number
  name: string
  description: string
  parent_id: number | null
  leader_id: number | null
  leader: { id: number; name: string } | null
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
}

export interface DeptTreeNode {
  id: number
  name: string
  description: string
  leader_id: number | null
  leader_name: string
  parent_id: number | null
  children: DeptTreeNode[]
}

export interface DepartmentForm {
  name: string
  description?: string
  parent_id?: number | null
  leader_id?: number | null
}

// ---- Employee ----
export interface Employee {
  id: number
  user_id: number | null
  user: { id: number; username: string } | null
  name: string
  email: string
  phone: string
  id_number: string
  dept_id: number
  department: { id: number; name: string }
  status: 'active' | 'inactive'
  work_start_time: string
  work_end_time: string
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
}

export interface EmployeeForm {
  name: string
  email: string
  phone?: string
  id_number?: string
  dept_id: number
  user_id?: number | null
  status?: 'active' | 'inactive'
  work_start_time?: string
  work_end_time?: string
}

// ---- Salary ----
export interface SalaryStructure {
  id: number
  employee_id: number
  employee: { id: number; name: string }
  base_salary: number
  position_allowance: number
  performance_factor: number
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
}

export interface SalaryStructureForm {
  employee_id: number
  base_salary: number
  position_allowance: number
  performance_factor?: number
}

export type SalaryStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'paid'

export interface SalaryRecord {
  id: number
  employee_id: number
  employee: { id: number; name: string }
  structure_id: number
  year: number
  month: number
  base_salary: number
  position_allowance: number
  performance_factor: number
  actual_salary: number
  status: SalaryStatus
  reviewed_by: string
  reviewed_at: string | null
  paid_by: string
  paid_at: string | null
  created_by: string
  created_at: string
}

export interface SalaryRecordForm {
  employee_id: number
  year: number
  month: number
  performance_factor?: number
}

export interface SalaryRecordBatchForm {
  year: number
  month: number
  employee_ids?: number[]
  dept_id?: number
}

export interface SalaryRecordListQuery extends ListQuery {
  employee_id?: number
  year?: number
  month?: number
  status?: SalaryStatus
}

// ---- Attendance ----
export interface AttendanceRecord {
  id: number
  employee_id: number
  employee: { id: number; name: string }
  date: string
  clock_in: string | null
  clock_out: string | null
  created_by: string
  created_at: string
}

export interface AttendanceSummary {
  id: number
  employee_id: number
  employee: { id: number; name: string }
  year: number
  month: number
  normal_days: number
  late_days: number
  early_days: number
  absent_days: number
  created_at: string
}

export interface AttendanceRecordListQuery extends ListQuery {
  employee_id?: number
  keyword?: string
  start_date?: string
  end_date?: string
}

export interface AttendanceSummaryListQuery extends ListQuery {
  employee_id?: number
  year?: number
  month?: number
}

export interface AttendanceSummaryGenerateForm {
  employee_id: number
  year: number
  month: number
}

// ---- Leave ----
export type LeaveType = 'annual' | 'sick' | 'personal'
export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export interface LeaveRequest {
  id: number
  employee_id: number
  employee: { id: number; name: string }
  type: LeaveType
  start_date: string
  end_date: string
  reason: string
  status: LeaveStatus
  reviewed_by: string
  reviewed_at: string | null
  created_by: string
  created_at: string
}

export interface LeaveRequestForm {
  employee_id: number
  type: LeaveType
  start_date: string
  end_date: string
  reason?: string
}

export interface LeaveRequestListQuery extends ListQuery {
  employee_id?: number
  status?: LeaveStatus
}

// ---- Audit Log ----
export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'update_status'
  | 'assign_roles'
  | 'reset_password'
  | 'update_password'
  | 'clock_in'
  | 'clock_out'
  | 'generate_summary'
  | 'approve'
  | 'reject'
  | 'submit'
  | 'pay'
  | 'batch_create'

export type AuditEntityType =
  | 'employee'
  | 'department'
  | 'user'
  | 'salary_structure'
  | 'salary_record'
  | 'attendance_record'
  | 'attendance_summary'
  | 'leave_request'

export interface AuditLog {
  id: number
  operator: string
  action: AuditAction
  entity_type: AuditEntityType
  entity_id: number
  changes: string | null
  ip_address: string
  created_at: string
}

export interface AuditLogListQuery extends ListQuery {
  operator?: string
  entity_type?: AuditEntityType
  start_time?: string
  end_time?: string
}
