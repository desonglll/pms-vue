# 提交前操作清单

每次提交代码前，按以下步骤执行。

## 1. 读取后端最新代码

检查后端是否有接口变更：

```bash
# 检查路由
cat ../hr/handler/router.go
# 检查模型
cat ../hr/models/*.go
# 检查接口
cat ../hr/handler/*_handler.go
```

如果后端有变更，先对齐前端代码（types → api → stores → views）。

## 2. 构建验证

```bash
bun run build
```

类型检查和构建都必须通过。如果有错误先修复。

## 3. 更新文档

对照本次代码变更，更新以下文档：

| 变更类型 | 需更新的文档 |
|---------|-------------|
| 新增/修改 API 接口 | `docs/src/api.md` |
| 新增/修改页面 | `docs/src/pages.md` |
| 新增/修改目录结构 | `docs/src/structure.md` |
| 新增/修改技术栈 | `docs/src/tech-stack.md` |
| 开发流程变化 | `docs/src/development.md` |
| 任何变更 | `docs/src/changelog.md` |
| 提交流程变化 | `docs/src/pre-commit.md` |

文档要求：
- 纯 markdown，标题+表格+代码块
- 不用花哨格式、不用 emoji
- 保持与代码一致，代码是唯一真相来源

## 4. 构建文档

```bash
cd docs && mdbook build
```

确认无报错。

## 5. 生成 commit message

格式：

```
<范围>: <简短描述>

- 具体变更1
- 具体变更2
```

范围示例：api, auth, employees, departments, docs, config

描述用中文，关注"做了什么"而不是"修改了哪些文件"。

示例：

```
auth: 对接后端登录认证接口

- 新增登录页面和 JWT 认证流程
- Axios 拦截器自动携带 token 和处理 401
- 路由守卫拦截未登录请求
```

## 6. 提交

```bash
git add <相关文件>
git commit
```

不要 `git add .`，逐个添加，避免提交无关文件。
不要提交 `dist/`、`node_modules/`、`docs/book/` 等生成产物。
