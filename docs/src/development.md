# 开发指南

## 环境要求

- Node.js 18+
- pnpm 或 bun（推荐 bun）
- 后端服务运行在 localhost:8080

## 启动

```bash
bun install
bun run dev
```

前端默认端口 5173，Vite 代理 `/api` 请求到后端 8080。

## Vite 代理配置

`vite.config.ts` 中已配置代理：

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
},
```

开发时前端请求 `/api/employees` 等路径会被代理到后端，无需跨域。

## 构建部署

```bash
bun run build
```

产物输出到 `dist/`，部署时需由后端或 Nginx 反向代理 API 请求。
