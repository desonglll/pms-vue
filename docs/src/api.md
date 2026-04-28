# API 对接

后端基础路径：`/api`（Vite 代理 rewrite 掉 `/api` 前缀，实际请求后端无 `/api`）

## 认证接口

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| POST | /api/auth/login | 登录 | { username, password } |
| POST | /api/auth/register | 注册 | { username, password, role_ids? } |
| POST | /api/auth/logout | 登出（需 JWT） | - |
| GET | /api/auth/me | 获取当前用户（需 JWT） | - |

登录返回：`{ code: 200, data: { token } }`

登录后需调 `GET /auth/me` 获取用户信息（含 roles）。

## 用户接口（需 admin 角色）

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| GET | /api/users | 用户列表 | - |
| GET | /api/users/:id | 用户详情 | - |
| PUT | /api/users/:id/status | 修改状态 | { status: "active"/"disabled" } |
| PUT | /api/users/:id/roles | 分配角色 | { role_ids: [1, 2] } |

## 角色接口（需 admin/manager 角色）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/roles | 角色列表 |

## 员工接口

| 方法 | 路径 | 说明 | 参数/请求体 |
|------|------|------|------------|
| GET | /api/employees | 员工列表（分页） | keyword, sort_by, sort_desc, page, page_size |
| GET | /api/employees/:id | 员工详情 | - |
| POST | /api/employees | 创建员工（admin/manager） | { name, email, phone, id_number, dept_id, status } |
| PUT | /api/employees/:id | 更新员工（admin/manager） | 同上 |
| DELETE | /api/employees/:id | 删除员工（admin） | - |

## 部门接口

| 方法 | 路径 | 说明 | 参数/请求体 |
|------|------|------|------------|
| GET | /api/depts | 部门列表（分页） | keyword, sort_by, sort_desc, page, page_size |
| GET | /api/depts/:id | 部门详情 | - |
| POST | /api/depts | 创建部门（admin/manager） | { name, description } |
| PUT | /api/depts/:id | 更新部门（admin/manager） | 同上 |
| DELETE | /api/depts/:id | 删除部门（admin） | - |

## 响应格式

所有接口统一返回：

```json
{ "code": 200, "data": ..., "message": "..." }
```

前端 Axios 拦截器自动提取 `data` 字段，错误时自动弹出 `message`。

## 数据模型

### User

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 自增主键 |
| username | string | 用户名 |
| status | string | 状态：active/disabled |
| roles | Role[] | 角色列表 |
| created_at | string | 创建时间 |
| updated_at | string | 更新时间 |

### Role

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 自增主键 |
| name | string | 角色名：admin/manager/staff |
| description | string | 描述：系统管理员/部门经理/普通员工 |

### Employee

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 自增主键 |
| name | string | 姓名 |
| email | string | 邮箱（唯一） |
| phone | string | 电话 |
| id_number | string | 身份证号 |
| dept_id | number | 所属部门 ID |
| status | string | 状态：active/inactive |
| department | object | 预加载的部门信息 |
| created_by | string | 创建人 |
| updated_by | string | 更新人 |
| created_at | string | 创建时间 |
| updated_at | string | 更新时间 |

### Department

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 自增主键 |
| name | string | 部门名称（唯一） |
| description | string | 描述 |
| created_by | string | 创建人 |
| updated_by | string | 更新人 |
| created_at | string | 创建时间 |
| updated_at | string | 更新时间 |

## 权限模型

| 角色 | 权限 |
|------|------|
| admin | 所有操作 + 用户管理 |
| manager | 员工/部门增删改查 |
| staff | 员工/部门只读 |

## 后端错误消息

| 错误消息 | 说明 |
|---------|------|
| email already exists | 邮箱重复 |
| department not found | 部门不存在 |
| department name already exists | 部门名称重复 |
| employee not found | 员工不存在 |
| username already exists | 用户名已存在 |
| user not found | 用户不存在 |
| invalid username or password | 用户名或密码错误 |
| user is disabled | 用户已禁用 |
| invalid status | 无效的状态值 |
| unauthorized | 未授权 |
| forbidden | 权限不足 |
