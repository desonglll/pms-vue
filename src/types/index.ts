export interface Employee {
  id: number
  name: string
  email: string
  phone: string
  id_number: string
  dept_id: number
  status: string
  department: Department | null
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

export interface EmployeeForm {
  name: string
  email: string
  phone: string
  id_number: string
  dept_id: number | undefined
  status: string
}

export interface Department {
  id: number
  name: string
  description: string
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

export interface DepartmentForm {
  name: string
  description: string
}

export interface Role {
  id: number
  name: string
  description: string
}

export interface User {
  id: number
  username: string
  status: string
  roles: Role[]
  created_at: string
  updated_at: string
}

export interface SalaryStructure {
  id: number
  employee_id: number
  employee: Employee | null
  base_salary: number
  position_allowance: number
  performance_factor: number
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

export interface SalaryStructureForm {
  employee_id: number | undefined
  base_salary: number
  position_allowance: number
  performance_factor: number
}

export interface SalaryRecord {
  id: number
  employee_id: number
  employee: Employee | null
  year: number
  month: number
  base_salary: number
  position_allowance: number
  performance_factor: number
  actual_salary: number
  created_by: string
  created_at: string
}

export interface SalaryRecordForm {
  employee_id: number | undefined
  year: number
  month: number
  performance_factor: number
}

export interface ListQuery {
  keyword?: string
  sort_by?: string
  sort_desc?: boolean
  page?: number
  page_size?: number
}

export interface ListResult<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface LoginResult {
  token: string
}
