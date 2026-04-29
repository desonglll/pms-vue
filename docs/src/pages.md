# 页面设计

## 首页 DashboardView

- 路径：`/`
- 统计卡片：员工总数、部门总数、用户总数（admin）、薪资结构数（admin）
- 快捷操作按角色显示：新增员工(manager+)、新增部门(manager+)、员工列表(manager+)、部门列表、个人档案(staff)、用户管理(admin)、薪资管理(admin)、考勤管理、请假管理、审计日志(admin)

## 登录页 LoginView

- 路径：`/login`
- 字段：用户名、密码
- 登录成功后解码 JWT 提取 role 和 employee_id，存入全局状态
- 被禁用用户提示"user is disabled"

## 员工管理

### 员工列表 EmployeeList（admin/manager）

- 路径：`/employees`
- 多选表格（admin 可批量删除），搜索/排序/分页
- 表格列：多选框(admin)、ID、姓名、邮箱、电话、部门、状态、关联用户(admin)、操作
- 操作列按角色：查看(所有)、编辑(manager+)、删除(admin)

### 个人档案 EmployeeMe（所有角色）

- 路径：`/employees/me`
- 调用 GET /employees/me 展示当前用户关联的员工信息
- 未关联时提示"请联系管理员关联员工档案"
- 显示：姓名、邮箱、电话、身份证号、部门、状态、上下班时间

### 员工表单 EmployeeForm（admin/manager）

- 路径：`/employees/new`、`/employees/:id/edit`
- 字段：姓名、邮箱、电话、身份证号、部门（树形下拉）、关联用户(admin,可选)、状态、上班时间、下班时间

### 员工详情 EmployeeDetail（admin/manager）

- 路径：`/employees/:id`
- el-descriptions 展示全部字段，包括关联用户ID
- 右上角编辑按钮

## 部门管理

### 部门列表 DepartmentList

- 路径：`/departments`
- 搜索/分页
- 表格：ID、名称、描述、上级部门、负责人、创建人、操作
- 操作：查看(所有)、编辑(manager+)、删除(admin)
- "部门树"按钮跳转 /departments/tree

### 部门树 DepartmentTreeView

- 路径：`/departments/tree`
- 调用 GET /depts/tree，el-tree 展示层级结构，节点显示名称、负责人标签、描述

### 部门表单 DepartmentForm（admin/manager）

- 路径：`/departments/new`、`/departments/:id/edit`
- 字段：名称（必填）、描述、上级部门（树形下拉）、部门负责人（员工下拉）
- 编辑时排除自身及子部门避免循环引用

### 部门详情 DepartmentDetail

- 路径：`/departments/:id`
- el-descriptions 展示：ID、名称、描述、上级部门、负责人、创建人/更新人、创建/更新时间

## 薪资管理（仅 admin）

### 薪资结构列表 SalaryStructureList

- 路径：`/salary/structures`
- 搜索/分页
- 表格：ID、员工、基本工资、岗位津贴、绩效系数、创建人、操作

### 薪资结构表单 SalaryStructureForm

- 路径：`/salary/structures/new`、`/salary/structures/:id/edit`
- 字段：员工（可搜索下拉，编辑时禁用）、基本工资、岗位津贴、绩效系数
- 底部显示应发合计 = (基本工资 + 岗位津贴) × 绩效系数

### 薪资记录列表 SalaryRecordList

- 路径：`/salary/records`
- 搜索/状态筛选/分页
- 表格：ID、员工、年、月、基本工资、岗位津贴、绩效系数、应发工资、状态、审核人、操作
- 状态标签：草稿(info)/待审核(warning)/已审核(success)/已驳回(danger)/已发放(info)
- 操作列按状态显示：
  - draft/rejected：修改、提交审核
  - pending：审核通过、审核驳回
  - approved（admin）：确认发放
  - paid：无操作
- 批量生成按钮 → 弹窗选择年月 + 范围（全员/按部门/指定员工）

### 薪资记录表单 SalaryRecordForm

- 路径：`/salary/records/new`、`/salary/records/:id/edit`
- 新建：员工、薪资结构、年、月、绩效系数
- 编辑（仅 draft/rejected）：员工/年/月禁用，仅修改绩效系数
- 提示：修改绩效系数后实发工资自动重算

## 用户管理（仅 admin）

### 用户列表 UserList

- 路径：`/users`
- 多选表格，批量禁用
- 前端搜索：用户名/角色
- 操作：查看、分配角色（弹窗）、启用/禁用

### 用户详情 UserDetail

- 路径：`/users/:id`
- el-descriptions 展示：ID、用户名、状态标签、角色标签、创建/更新时间
- 右上角：分配角色、重置密码、禁用/启用按钮

## 考勤管理

### 考勤打卡页 AttendanceClockIn

- 路径：`/attendance`
- 打卡区：选择员工（staff 自动填充不可修改）+ 上班/下班打卡按钮
- 双标签页：打卡记录 + 考勤统计
- 打卡记录标签：日期范围筛选，表格显示 ID/员工/日期/上班时间/下班时间/操作人，分页
- 考勤统计标签：生成统计按钮（staff 不可点），表格显示 ID/员工/年/月/正常/迟到/早退/缺勤天数，分页

## 请假管理

### 请假列表 LeaveRequestList

- 路径：`/leaves`
- 搜索/分页
- 表格：ID、员工、类型、开始日期、结束日期、原因、状态、审批人、操作
- 状态标签：待审批(warning)/已通过(success)/已驳回(danger)
- 操作：pending 状态 admin/manager 可审批通过/驳回

### 请假表单 LeaveRequestForm

- 路径：`/leaves/new`
- 字段：员工（staff 自动填充不可修改）、请假类型（年假/病假/事假）、起止日期、原因

## 审计日志（仅 admin）

### 审计日志列表 AuditLogList

- 路径：`/audit-logs`
- 筛选：操作人、实体类型、时间范围
- 表格：ID、操作时间、操作人、操作类型、实体类型、实体ID、变更内容（hover 弹窗显示 JSON）、IP 地址
- 分页

## RBAC 路由控制

| 角色 | 可访问页面 |
|------|----------|
| admin | 所有页面 |
| manager | 首页、员工管理、部门管理、考勤管理、请假管理、个人档案 |
| staff | 首页、考勤管理、请假管理、个人档案 |

## 布局

左侧边栏布局：
- 侧边栏：HR 管理系统 logo + 纵向菜单（按角色显隐），支持折叠/展开
- 菜单项：首页、员工管理(admin/manager)/个人档案(staff)、部门管理、薪资管理(admin)、考勤管理、请假管理、用户管理(admin)、审计日志(admin)
- 顶栏：折叠按钮 + 角色标签（管理员/经理/员工）+ 用户名 + 退出
- 列表页统一：搜索筛选区（el-card）+ 多选表格 + 分页（el-card）
- 表单页统一：el-page-header 返回 + 标题 + el-card 内表单
