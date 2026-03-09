# 管理员认证系统

## 概述

管理员后台使用简单的密码保护机制，基于环境变量和 HTTP-only Cookie Session。

## 安全特性

- ✅ Cookie Session（HTTP-only + Secure）
- ✅ 密码保存在环境变量中，不在代码中
- ✅ proxy.ts 中间件拦截未授权访问
- ✅ 7 天自动过期
- ✅ 所有管理员 API 需要验证

## 配置步骤

### 1. 本地开发

在 `.env.local` 设置管理员密码：

```bash
ADMIN_PASSWORD=your_secure_password_here
```

**建议**：使用至少 12 位强密码（包含大小写字母、数字、特殊字符）

### 2. Vercel 生产环境

1. 进入 Vercel Dashboard → 项目设置
2. Environment Variables → Add New
3. 添加变量：
   - Name: `ADMIN_PASSWORD`
   - Value: `生产环境强密码`
   - Environment: Production, Preview, Development

4. 保存后触发重新部署

## 使用方法

### 登录

1. 访问 `/admin/login`
2. 输入管理员密码
3. 自动跳转到 `/admin/codes`

### 登出

点击页面右上角 "退出登录" 按钮

## 保护的路径

以下路径需要管理员认证：

- `/admin/codes` - 访问码管理
- `/api/admin/*` - 所有管理员 API

**不需要认证**：

- `/admin/login` - 登录页面本身

## 实现细节

### proxy.ts 中间件

```typescript
// 检查所有 /admin/* 路径（除了登录页）
if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
  const adminSession = request.cookies.get('admin_session')

  if (!adminSession || adminSession.value !== 'authenticated') {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}
```

### 登录 API

`/api/auth/login`:
- 验证密码是否匹配 `ADMIN_PASSWORD` 环境变量
- 设置 `admin_session` Cookie（7 天有效期）
- 重定向到 `/admin/codes`

### 登出 API

`/api/auth/logout`:
- 删除 `admin_session` Cookie
- 重定向到 `/admin/login`

## 安全建议

### 生产环境

1. **强密码**：至少 16 位，包含大小写字母、数字、符号
2. **定期更换**：建议每 3 个月更换一次
3. **不要泄露**：不要在代码、Git、公开文档中暴露密码
4. **HTTPS**：Vercel 默认启用，Cookie 自动设为 Secure

### 示例强密码生成

```bash
# Linux/macOS
openssl rand -base64 24

# 或使用密码管理器生成
```

### 不推荐

❌ `admin123`
❌ `password`
❌ `your_secure_password_here`

### 推荐

✅ `xK9#mP2$vL8@nQ5!rT3^wY6&`
✅ `Tr0ub4dor&3-ComplexPass`
✅ 使用 1Password/LastPass 生成的随机密码

## 升级到数据库认证（可选）

如需更复杂的权限系统（多管理员、角色管理），可升级为 Supabase Auth：

1. 在 Supabase 创建管理员用户
2. 添加 `users` 表的 `role` 字段
3. 修改 proxy.ts 使用 `supabase.auth.getUser()`
4. 更新登录页面使用邮箱+密码

当前简化方案适合个人项目或单管理员场景。

## 故障排除

### 登录后仍然跳转到登录页

1. 检查浏览器是否允许 Cookie
2. 检查 `.env.local` 是否设置了 `ADMIN_PASSWORD`
3. 清除浏览器 Cookie 重试
4. 检查控制台是否有错误

### Vercel 部署后无法登录

1. 检查 Vercel 环境变量是否设置
2. 检查最新部署是否成功
3. 查看 Vercel Functions 日志

### 忘记密码

1. 本地开发：修改 `.env.local` 重启服务
2. 生产环境：在 Vercel Dashboard 修改环境变量，触发重新部署

---

**创建日期**：2026-03-11
**最后更新**：2026-03-11
