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
