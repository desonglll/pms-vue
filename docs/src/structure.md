# 项目结构

```
hr-vue/
├── index.html
├── package.json
├── vite.config.ts
├── CLAUDE.md                   # AI 协作指南（自动读取）
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── env.d.ts
├── public/
│   └── favicon.ico
├── src/
│   ├── main.ts                 # 入口：挂载 App
│   ├── App.vue                 # 根组件（侧边栏布局 + 登录态判断）
│   ├── api/                    # Axios 封装 + 各模块接口
│   │   ├── index.ts            # Axios 实例，JWT 拦截器，响应提取
│   │   ├── auth.ts             # 登录/登出/注册/当前用户
│   │   ├── employees.ts        # 员工 CRUD + 分页查询
│   │   └── departments.ts      # 部门 CRUD + 分页查询
│   ├── router/
│   │   └── index.ts            # 路由定义 + 登录守卫
│   ├── stores/
│   │   ├── auth.ts             # 认证状态（token/user）
│   │   ├── employees.ts        # 员工状态（分页/搜索/排序）
│   │   └── departments.ts      # 部门状态（分页/搜索/排序 + 下拉列表）
│   ├── views/
│   │   ├── auth/
│   │   │   └── LoginView.vue
│   │   ├── dashboard/
│   │   │   └── DashboardView.vue
│   │   ├── employees/
│   │   │   ├── EmployeeList.vue
│   │   │   └── EmployeeForm.vue
│   │   └── departments/
│   │       ├── DepartmentList.vue
│   │       └── DepartmentForm.vue
│   ├── types/
│   │   └── index.ts            # Employee/Department/User 类型
│   └── assets/
├── docs/                        # 项目文档（mdbook）
└── .gitignore
```

## 各目录职责

| 目录 | 职责 | 依赖方向 |
|------|------|----------|
| api | 接口封装，自动带 JWT | 被 stores 引用 |
| router | 路由定义 + 登录守卫 | 被 main 引用 |
| stores | Pinia 状态管理 | 依赖 api，被 views 引用 |
| views | 页面组件 | 依赖 stores + router |
| types | TypeScript 类型定义 | 被 api/stores/views 引用 |

依赖方向：views → stores → api → 后端，types 被各层共用。
