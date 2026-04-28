# 页面设计

## 首页 DashboardView

- 路径：`/`
- 统计卡片：员工总数、部门总数、用户总数（admin）、薪资结构数
- 快捷操作：新增员工、新增部门、员工列表、部门列表、用户管理（admin）、薪资结构、薪资记录

## 登录页 LoginView

- 路径：`/login`
- 字段：用户名、密码
- 登录成功跳转首页，被禁用用户提示"user is disabled"

## 员工管理

### 员工列表 EmployeeList

- 路径：`/employees`
- 多选表格，批量删除
- 搜索/排序/分页
- 表格：多选框、ID、姓名、邮箱、电话、部门、状态、创建人、更新人、操作

### 员工表单 EmployeeForm

- 路径：`/employees/new`、`/employees/:id/edit`
- 字段：姓名、邮箱、电话、身份证号、部门（下拉）、状态

## 部门管理

### 部门列表 DepartmentList

- 路径：`/departments`
- 多选表格，批量删除
- 搜索/排序/分页
- 表格：多选框、ID、名称、描述、创建人、更新人、操作

### 部门表单 DepartmentForm

- 路径：`/departments/new`、`/departments/:id/edit`
- 字段：名称（必填）、描述

## 薪资管理

### 薪资结构列表 SalaryStructureList

- 路径：`/salary/structures`
- 多选表格，批量删除
- 搜索/分页
- 表格：多选框、ID、员工、基本工资、奖金、扣款、应发合计、更新人、操作
- 应发合计 = 基本工资 + 奖金 - 扣款

### 薪资结构表单 SalaryStructureForm

- 路径：`/salary/structures/new`、`/salary/structures/:id/edit`
- 字段：员工（可搜索下拉，编辑时禁用）、基本工资、奖金、扣款
- 底部显示应发合计

### 薪资记录列表 SalaryRecordList

- 路径：`/salary/records`
- 多选表格，批量删除
- 搜索/分页
- 表格：多选框、ID、员工、年、月、实发工资、状态、更新人、操作
- 状态标签：草稿(info)/已审批(warning)/已发放(success)

### 薪资记录表单 SalaryRecordForm

- 路径：`/salary/records/new`、`/salary/records/:id/edit`
- 字段：员工（可搜索下拉）、年、月、实发工资、状态（草稿/已审批/已发放）

## 用户管理（仅 admin）

### 用户列表 UserList

- 路径：`/users`
- 多选表格，批量禁用
- 前端搜索：用户名/角色
- 操作：分配角色（弹窗）、启用/禁用

## 布局

顶部导航栏布局：
- 菜单：首页、员工管理、部门管理、用户管理（admin）、薪资管理（子菜单：薪资结构/薪资记录）
- 右侧：用户名 + 角色标签 + 退出
- 列表页统一：搜索筛选区 + 多选表格 + 分页
- 表单页统一：el-page-header + el-card
