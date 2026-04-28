# HR 前端项目 - AI 协作指南

## 项目角色

你是这个 HR 系统的前端全栈开发者，与 `../hr/` 后端项目协同开发。
后端是 Go + Gin + GORM + PostgreSQL，前端是 Vue 3 + TypeScript + Vite。

## 核心原则

1. **时刻读取后端最新代码**：后端 API 可能随时变化，开发前端功能前先读后端的 handler/router/models，不要凭记忆假设接口格式
2. **文档先行**：所有变更同步到 `docs/` 目录的 mdbook 文档，保持文档与代码一致
3. **纯 markdown 文档**：文档用标题+表格+代码块，不要花哨格式，方便手动维护

## 后端关键文件速查

| 信息 | 文件路径 |
|------|----------|
| 路由定义 | `../hr/handler/router.go` |
| 员工接口 | `../hr/handler/employee_handler.go` |
| 部门接口 | `../hr/handler/department_handler.go` |
| 认证接口 | `../hr/handler/auth_handler.go` |
| 用户接口 | `../hr/handler/user_handler.go` |
| 角色接口 | `../hr/handler/role_handler.go` |
| 中间件 | `../hr/handler/middleware.go` |
| 数据模型 | `../hr/models/*.go` |
| 业务逻辑 | `../hr/service/*.go` |
| 数据访问 | `../hr/repository/*.go` |
| 后端文档 | `../hr/docs/src/*.md` |

## 后端 API 规范

- 后端路由**没有** `/api` 前缀，前端 Vite 代理会把 `/api` rewrite 掉
- 响应统一格式：`{ "code": 200, "data": ..., "message": "..." }`
- 前端 Axios 拦截器已自动提取 `data` 字段，代码中直接用 `res.data` 拿到业务数据
- 错误时拦截器自动弹 `ElMessage.error(message)`，catch 里不要重复弹
- 部门路径是 `/depts` 不是 `/departments`

## 认证流程

- 登录：`POST /auth/login` → 返回 `{ token }`（不再返回 user）
- 登录后立即调 `GET /auth/me` 获取用户信息（含 roles）
- token 存 localStorage，Axios 拦截器自动加 `Authorization: Bearer <token>`
- 路由守卫：未登录跳转 `/login`，admin 路由非 admin 跳转首页
- 401 响应：拦截器自动清 token 并跳转登录页
- 种子账号：`admin / admin123`

## 权限模型

| 角色 | 权限 |
|------|------|
| admin | 所有操作 + 用户管理 |
| manager | 员工/部门增删改查 |
| staff | 员工/部门只读 |

前端通过 `auth.isAdmin` 控制用户管理菜单可见性，路由 `meta.admin` 控制页面访问。

## 布局

顶部导航栏布局：
- 左侧：logo + 横向菜单（首页/员工/部门/用户管理-仅admin）
- 右侧：用户名 + 角色标签(管理员) + 退出
- 下方：浅灰背景 `#f0f2f5`，router-view
- 列表页统一：搜索筛选区（el-card）+ 多选表格 + 分页（el-card）
- 表单页统一：el-page-header 返回 + 标题，el-card 内表单

## 前端项目结构

```
src/
├── api/            # Axios 封装，每个模块一个文件
│   ├── index.ts    # 实例 + JWT/错误拦截器
│   ├── auth.ts
│   ├── employees.ts
│   ├── departments.ts
│   ├── users.ts
│   └── roles.ts
├── router/         # 路由 + 登录守卫 + admin 守卫
├── stores/         # Pinia 状态（auth/employees/departments/users/roles）
├── views/          # 页面组件（auth/dashboard/employees/departments/users）
├── types/          # TypeScript 类型定义
└── assets/
```

依赖方向：views → stores → api → 后端，types 被各层共用。

## 开发流程

1. 读后端最新代码，确认接口格式
2. 更新 `src/types/index.ts` 类型定义
3. 更新 `src/api/` 接口封装
4. 更新 `src/stores/` 状态管理
5. 更新 `src/views/` 页面组件
6. 运行 `bun run build` 验证
7. 更新 `docs/` 文档
8. 参照 `docs/src/pre-commit.md` 完成提交前操作

## 技术栈细节

- Vue 3 Composition API + `<script setup>`
- Pinia（状态管理，用 setup store 风格）
- Vue Router（history 模式）
- Axios（拦截器处理 JWT 和统一错误提示）
- Element Plus（UI 组件库，全局注册，中文 locale）
- mdBook（项目文档，源码在 `docs/src/`，构建命令 `cd docs && mdbook build`）
