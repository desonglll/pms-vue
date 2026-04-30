# API 对接

后端基础路径：`/api`（Vite 代理 rewrite 掉 `/api` 前缀，实际请求后端无 `/api`）

## 认证接口

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| POST | /api/auth/login | 登录 | { username, password } |
| POST | /api/auth/register | 注册 | { username, password, role_ids? } |
| POST | /api/auth/logout | 登出（需 JWT） | - |
| GET | /api/auth/me | 获取当前用户（需 JWT） | - |

## 用户接口（需 admin 角色）

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| GET | /api/users | 用户列表（分页） | keyword, sort_by, sort_desc, page, page_size |
| GET | /api/users/:id | 用户详情 | - |
| PUT | /api/users/:id/status | 修改状态 | { status: "active"/"disabled" } |
| PUT | /api/users/:id/roles | 分配角色 | { role_ids: [1, 2] } |
| PUT | /api/users/:id/password | 重置密码（admin） | { new_password } |
| DELETE | /api/users/:id | 删除用户 | - |

## 角色接口（需 admin/manager 角色）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/roles | 角色列表 |

## 薪资结构接口

| 方法 | 路径 | 说明 | 参数/请求体 |
|------|------|------|------------|
| GET | /api/salaries/structures | 薪资结构列表（分页） | keyword, sort_by, sort_desc, page, page_size |
| GET | /api/salaries/structures/employees/:emp_id | 按员工查结构 | - |
| POST | /api/salaries/structures | 创建薪资结构 | { employee_id, base_salary, position_allowance, performance_factor? } |
| PUT | /api/salaries/structures/:id | 更新薪资结构 | map[string]interface{} |
| DELETE | /api/salaries/structures/:id | 删除薪资结构 | - |

## 薪资记录接口

| 方法 | 路径 | 说明 | 参数/请求体 |
|------|------|------|------------|
| GET | /api/salaries/records | 薪资记录列表（分页） | keyword, sort_by, sort_desc, page, page_size, employee_id?, year?, month?, status? |
| GET | /api/salaries/records/:id | 薪资记录详情 | - |
| POST | /api/salaries/records | 创建薪资记录 | { employee_id, year, month, performance_factor? } |
| PUT | /api/salaries/records/:id | 修改记录（仅draft/rejected） | { performance_factor } |
| PUT | /api/salaries/records/:id/submit | 提交审核 | - |
| PUT | /api/salaries/records/:id/approve | 审核通过 | - |
| PUT | /api/salaries/records/:id/reject | 审核驳回 | - |
| PUT | /api/salaries/records/:id/pay | 确认发放（仅admin） | - |
| POST | /api/salaries/records/batch | 批量生成 | { year, month, employee_ids?, dept_id? } |

### 薪资记录状态流转

| 操作 | 前置状态 | 目标状态 |
|------|---------|---------|
| 提交审核 | draft/rejected | pending |
| 审核通过 | pending | approved |
| 审核驳回 | pending | rejected |
| 确认发放 | approved | paid |

### 薪资记录状态

| status | 中文 | 说明 |
|--------|------|------|
| draft | 草稿 | 新建默认状态 |
| pending | 待审核 | 已提交审核 |
| approved | 已审核 | 审核通过 |
| rejected | 已驳回 | 审核驳回，可修改后重新提交 |
| paid | 已发放 | 确认发放（终态） |

### 批量生成

- 不传 employee_ids 和 dept_id → 全员生成
- 传 dept_id → 按部门生成
- 传 employee_ids → 指定员工生成
- 已存在记录自动跳过

## 考勤接口

| 方法 | 路径 | 说明 | 参数/请求体 |
|------|------|------|------------|
| POST | /api/attendance/clock-in | 上班打卡 | { employee_id } |
| PUT | /api/attendance/clock-out | 下班打卡 | { employee_id } |
| GET | /api/attendance/records | 打卡记录列表 | keyword, sort_by, sort_desc, page, page_size, employee_id?, start_date?, end_date? |
| GET | /api/attendance/records/:id | 单条打卡记录 | - |
| POST | /api/attendance/summaries/generate | 生成月度统计（admin/manager） | { employee_id, year, month } |
| GET | /api/attendance/summaries | 统计列表 | keyword, sort_by, sort_desc, page, page_size, employee_id?, year?, month? |

## 请假接口

| 方法 | 路径 | 说明 | 参数/请求体 |
|------|------|------|------------|
| POST | /api/leaves | 提交请假 | { employee_id, type, start_date, end_date, reason? } |
| GET | /api/leaves | 请假列表 | keyword, sort_by, sort_desc, page, page_size, employee_id?, status? |
| GET | /api/leaves/:id | 单条请假 | - |
| PUT | /api/leaves/:id/approve | 审批通过（admin/manager） | - |
| PUT | /api/leaves/:id/reject | 审批驳回（admin/manager） | - |

### 请假类型

| type | 中文 |
|------|------|
| annual | 年假 |
| sick | 病假 |
| personal | 事假 |

### 请假状态

| status | 中文 | 标签颜色 |
|--------|------|---------|
| pending | 待审批 | warning |
| approved | 已通过 | success |
| rejected | 已驳回 | danger |

## 员工接口

| 方法 | 路径 | 说明 | 参数/请求体 |
|------|------|------|------------|
| GET | /api/employees | 员工列表（分页） | keyword, sort_by, sort_desc, page, page_size |
| GET | /api/employees/me | 当前用户员工档案 | - |
| GET | /api/employees/:id | 员工详情 | - |
| POST | /api/employees | 创建员工（admin/manager） | { name, email, phone, id_number, dept_id, user_id?, status, work_start_time?, work_end_time? } |
| PUT | /api/employees/:id | 更新员工（admin/manager） | 同上 |
| DELETE | /api/employees/:id | 删除员工（admin） | - |

## 审计日志接口（仅 admin）

| 方法 | 路径 | 说明 | 参数/请求体 |
|------|------|------|------------|
| GET | /api/audit-logs | 审计日志列表 | keyword, sort_by, sort_desc, page, page_size, operator?, entity_type?, start_time?, end_time? |

### 审计日志实体类型

| entity_type | 对应模块 |
|-------------|---------|
| employee | 员工 |
| department | 部门 |
| user | 用户 |
| salary_structure | 薪资结构 |
| salary_record | 薪资记录 |
| attendance_record | 考勤记录 |
| attendance_summary | 考勤统计 |
| leave_request | 请假申请 |

### 审计日志操作类型

| action | 中文 |
|--------|------|
| create | 创建 |
| update | 更新 |
| delete | 删除 |
| update_status | 更新状态 |
| assign_roles | 分配角色 |
| reset_password | 重置密码 |
| update_password | 修改密码 |
| clock_in | 上班打卡 |
| clock_out | 下班打卡 |
| generate_summary | 生成统计 |
| approve | 审批通过 |
| reject | 审批驳回 |

## 部门接口

| 方法 | 路径 | 说明 | 参数/请求体 |
|------|------|------|------------|
| GET | /api/depts | 部门列表（分页） | keyword, sort_by, sort_desc, page, page_size |
| GET | /api/depts/tree | 部门树 | - |
| GET | /api/depts/:id | 部门详情 | - |
| POST | /api/depts | 创建部门（admin/manager） | { name, description?, parent_id?, leader_id? } |
| PUT | /api/depts/:id | 更新部门（admin/manager） | 同上 |
| DELETE | /api/depts/:id | 删除部门（admin，有子部门不可删） | - |

## 响应格式

所有接口统一返回：

```json
{ "code": 200, "data": ..., "message": "..." }
```

## 数据模型

### SalaryStructure

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 自增主键 |
| employee_id | number | 员工 ID（唯一） |
| employee | object | 预加载的员工信息 |
| base_salary | number | 基本工资 |
| position_allowance | number | 岗位津贴 |
| performance_factor | number | 绩效系数 |
| created_by | string | 创建人 |
| updated_by | string | 更新人 |
| created_at | string | 创建时间 |
| updated_at | string | 更新时间 |

### SalaryRecord

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 自增主键 |
| employee_id | number | 员工 ID |
| employee | object | 预加载的员工信息 |
| structure_id | number | 关联的薪资结构 ID |
| year | number | 年份 |
| month | number | 月份 |
| base_salary | number | 基本工资 |
| position_allowance | number | 岗位津贴 |
| performance_factor | number | 绩效系数 |
| actual_salary | number | 实发工资 |
| status | string | 状态：draft/pending/approved/rejected/paid |
| reviewed_by | string | 审核人 |
| reviewed_at | string | 审核时间 |
| paid_by | string | 发放人 |
| paid_at | string | 发放时间 |
| created_by | string | 创建人 |
| created_at | string | 创建时间 |

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
| description | string | 描述 |

### Employee

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 自增主键 |
| user_id | number/null | 关联的登录账号 ID |
| name | string | 姓名 |
| email | string | 邮箱（唯一） |
| phone | string | 电话 |
| id_number | string | 身份证号 |
| dept_id | number | 所属部门 ID |
| status | string | 状态：active/inactive |
| work_start_time | string | 上班时间（如 09:00） |
| work_end_time | string | 下班时间（如 18:00） |
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
| leader_id | number/null | 负责人员工 ID |
| leader | object/null | 预加载的负责人信息 |
| parent_id | number/null | 父部门 ID，null 为顶级部门 |
| created_by | string | 创建人 |
| updated_by | string | 更新人 |
| created_at | string | 创建时间 |
| updated_at | string | 更新时间 |

### DeptTreeNode

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 部门 ID |
| name | string | 部门名称 |
| description | string | 描述 |
| leader_id | number/null | 负责人员工 ID |
| leader_name | string | 负责人姓名 |
| parent_id | number/null | 父部门 ID |
| children | DeptTreeNode[] | 子部门列表 |

### AttendanceRecord

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 自增主键 |
| employee_id | number | 员工 ID |
| employee | object | 预加载的员工信息 |
| date | string | 日期 |
| clock_in | string | 上班打卡时间（null 未打卡） |
| clock_out | string | 下班打卡时间（null 未打卡） |
| created_by | string | 操作人 |
| created_at | string | 创建时间 |

### AttendanceSummary

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 自增主键 |
| employee_id | number | 员工 ID |
| employee | object | 预加载的员工信息 |
| year | number | 年份 |
| month | number | 月份 |
| normal_days | number | 正常天数 |
| late_days | number | 迟到天数 |
| early_days | number | 早退天数 |
| absent_days | number | 缺勤天数 |
| created_at | string | 创建时间 |

### LeaveRequest

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 自增主键 |
| employee_id | number | 员工 ID |
| employee | object | 预加载的员工信息 |
| type | string | 类型：annual/sick/personal |
| start_date | string | 开始日期 |
| end_date | string | 结束日期 |
| reason | string | 原因 |
| status | string | 状态：pending/approved/rejected |
| reviewed_by | string | 审批人 |
| reviewed_at | string | 审批时间 |
| created_by | string | 创建人 |
| created_at | string | 创建时间 |

## 权限模型（RBAC）

JWT token payload 包含 `role` 和 `employee_id`，前端据此控制页面/按钮可见性。

| 角色 | 权限 |
|------|------|
| admin | 所有操作 + 用户管理 + 薪资管理 + 审计日志 |
| manager | 员工/部门增删改查（本部门范围）+ 请假审批 + 考勤管理 |
| staff | 考勤打卡（仅自己）+ 请假（仅自己）+ 个人档案 + 部门只读 |

### JWT Token Claims

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | number | 用户 ID |
| username | string | 用户名 |
| role | string | 角色：admin/manager/staff |
| employee_id | number? | 关联的员工 ID，未关联时不存在 |

### AuditLog

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 自增主键 |
| operator | string | 操作人用户名 |
| action | string | 操作类型 |
| entity_type | string | 实体类型 |
| entity_id | number | 实体 ID |
| changes | string/null | 变更内容（JSON 字符串） |
| ip_address | string | 操作者 IP |
| created_at | string | 操作时间 |

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
| salary structure already exists for this employee | 该员工已有薪资结构 |
| salary structure not found | 薪资结构不存在 |
| salary record already exists for this employee and month | 该员工当月已有薪资记录 |
| salary record not found | 薪资记录不存在 |
| invalid year or month | 无效的年份或月份 |
| salary record is not in draft/rejected status | 薪资记录非草稿/驳回状态 |
| salary record is not in pending status | 薪资记录非待审核状态 |
| salary record is not in approved status | 薪资记录非已审核状态 |
| invalid status transition | 无效的状态转换 |
| already clocked in today | 今日已上班打卡 |
| not clocked in today | 今日未上班打卡 |
| already clocked out today | 今日已下班打卡 |
| attendance record not found | 考勤记录不存在 |
| attendance summary not found | 考勤统计不存在 |
| leave request not found | 请假记录不存在 |
| leave request is not in pending status | 请假非待审批状态 |
| invalid leave type, must be annual/sick/personal | 无效的请假类型 |
| end date must be >= start date | 结束日期须不小于开始日期 |
| parent department not found | 父部门不存在 |
| cannot set parent: circular reference | 设置父部门产生循环引用 |
| department has child departments | 部门有子部门，不可删除 |
