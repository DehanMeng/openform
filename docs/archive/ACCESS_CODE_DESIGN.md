# 访问码验证系统设计

## 业务场景

MBTI 测试作为付费产品，需要防止未付费用户访问，同时避免被剽窃。

## 解决方案：访问码（Access Code）系统

### 用户流程

```
用户看到产品 → 付费下单 → 收到访问码 → 输入访问码 → 访问测试
```

### 管理员流程

```
收到订单 → 后台生成访问码 → 发送给买家 → 监控使用情况
```

---

## 数据库设计

### 新表：`access_codes`

```sql
CREATE TABLE access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 访问码
  code VARCHAR(12) UNIQUE NOT NULL,              -- 随机码（如: XHFK-9J2M-P7WQ）

  -- 有效期
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,                 -- 过期时间（24/48小时后）
  is_active BOOLEAN DEFAULT TRUE,                -- 是否激活

  -- 使用限制
  max_uses INTEGER DEFAULT 1,                    -- 最多使用次数（1=单次，3=可测3次）
  current_uses INTEGER DEFAULT 0,                -- 当前已使用次数

  -- 关联信息
  user_id UUID REFERENCES profiles(id) NULL,     -- 激活后绑定的用户（可选）
  last_used_at TIMESTAMP NULL,                   -- 最后使用时间

  -- 订单信息（可选）
  order_id VARCHAR(50) NULL,                     -- 关联订单号
  price DECIMAL(10,2) NULL,                      -- 售价
  buyer_contact VARCHAR(100) NULL,               -- 买家联系方式（手机/微信/邮箱）

  -- 备注
  notes TEXT NULL,                               -- 管理员备注

  -- 索引
  CONSTRAINT chk_uses CHECK (current_uses <= max_uses)
);

-- 索引
CREATE INDEX idx_access_codes_code ON access_codes(code);
CREATE INDEX idx_access_codes_active ON access_codes(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_access_codes_expires ON access_codes(expires_at);
CREATE INDEX idx_access_codes_user ON access_codes(user_id);

-- RLS 策略
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- 管理员可以查看所有
CREATE POLICY "Admins can view all access codes"
ON access_codes FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

-- 管理员可以插入
CREATE POLICY "Admins can insert access codes"
ON access_codes FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 管理员可以更新
CREATE POLICY "Admins can update access codes"
ON access_codes FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 访问码类型

### 1. 基础版（24小时单次）
- 有效期：24小时
- 使用次数：1次
- 价格：9.9元

### 2. 标准版（48小时3次）
- 有效期：48小时
- 使用次数：3次
- 价格：19.9元

### 3. 永久版（无限期5次）
- 有效期：365天
- 使用次数：5次
- 价格：29.9元

---

## 访问码生成规则

### 格式：`XXXX-XXXX-XXXX`
- 12位字符（去除易混淆字符：0/O, 1/I/L）
- 大写字母 + 数字
- 用横杠分隔，易读易输入

### 示例：
```
ABCD-EF12-GH34
XHFK-9J2M-P7WQ
MN8R-K4ST-7VWY
```

### 生成算法（TypeScript）：
```typescript
function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // 去除易混淆字符
  let code = ''

  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-'
    code += chars[Math.floor(Math.random() * chars.length)]
  }

  return code
}
```

---

## 页面设计

### 1. 访问码验证页（`/access`）

**用户首次访问首页时，重定向到此页面**

```
┌─────────────────────────────────┐
│      🔒 请输入访问码             │
│                                 │
│  本测试为付费产品，需要访问码    │
│                                 │
│  ┌───────────────────────────┐  │
│  │ XXXX - XXXX - XXXX        │  │
│  └───────────────────────────┘  │
│                                 │
│      [确认] [购买访问码]         │
│                                 │
│  访问码有效期24小时，请及时使用  │
└─────────────────────────────────┘
```

### 2. 管理员后台（`/admin/codes`）

```
┌─────────────────────────────────────────┐
│  访问码管理                              │
│                                          │
│  [生成新访问码] [批量生成]               │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 码      有效期    状态   使用次数   │ │
│  │ ABCD-... 24h     已用   1/1        │ │
│  │ XHFK-... 18h     未用   0/3        │ │
│  │ MN8R-... 已过期  失效   2/5        │ │
│  └────────────────────────────────────┘ │
│                                          │
│  今日生成: 15 | 已使用: 8 | 收入: ¥158 │
└─────────────────────────────────────────┘
```

---

## API 设计

### 1. 验证访问码
```typescript
POST /api/access/validate
Body: { code: string }
Response: {
  valid: boolean
  message: string
  expires_at?: string
  remaining_uses?: number
}
```

### 2. 生成访问码（管理员）
```typescript
POST /api/admin/codes/generate
Body: {
  count: number          // 生成数量
  validity_hours: number // 有效期（小时）
  max_uses: number       // 最多使用次数
  price?: number         // 售价
  notes?: string         // 备注
}
Response: {
  codes: string[]
}
```

### 3. 获取访问码列表（管理员）
```typescript
GET /api/admin/codes?status=active&limit=50
Response: {
  codes: AccessCode[]
  total: number
  stats: {
    total: number
    active: number
    used: number
    expired: number
  }
}
```

---

## 中间件验证

### 修改 `middleware.ts`

```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 需要访问码的路径
  const protectedPaths = ['/', '/test', '/types']

  if (protectedPaths.some(path => pathname.startsWith(path))) {
    // 检查是否有有效的访问码 session
    const accessToken = request.cookies.get('access_token')

    if (!accessToken) {
      // 重定向到访问码验证页
      return NextResponse.redirect(new URL('/access', request.url))
    }

    // 验证访问码是否仍然有效
    const valid = await validateAccessToken(accessToken.value)
    if (!valid) {
      return NextResponse.redirect(new URL('/access', request.url))
    }
  }

  return await updateSession(request)
}
```

---

## 访问码验证流程

```
用户访问首页 (/)
    ↓
检查是否有 access_token cookie
    ↓
    无 → 重定向到 /access（输入访问码）
    ↓
    有 → 验证 access_token 是否有效
         ↓
         有效 → 允许访问
         无效 → 重定向到 /access
```

---

## 安全考虑

### 1. 防暴力破解
- 限制每个 IP 每小时验证次数（如 10 次）
- 错误 5 次后需要等待 30 分钟

### 2. 防分享
- 访问码绑定设备指纹（可选）
- 同一访问码不能同时在多个设备使用

### 3. 日志记录
- 记录每次访问码验证尝试
- 记录使用 IP、设备信息

---

## 付费对接方案

### 阶段1：手动发码（初期）
1. 买家在社交媒体下单
2. 手动转账/微信支付
3. 管理员后台生成访问码
4. 手动发送给买家

### 阶段2：半自动（中期）
1. 集成支付宝当面付/微信收款码
2. 买家扫码付款后截图
3. 管理员确认后自动发码（Webhook）

### 阶段3：全自动（后期）
1. 集成微信支付 API / 支付宝 API
2. 付款成功自动生成访问码
3. 自动发送到买家手机/邮箱

---

## 数据统计

### 管理员仪表盘指标
- 今日/本周/本月销售量
- 总收入
- 访问码使用率
- 热门时段分析
- 用户来源追踪

---

## 实施步骤

### 1. 数据库迁移
- [ ] 创建 access_codes 表
- [ ] 添加 RLS 策略

### 2. 核心功能
- [ ] 访问码生成算法
- [ ] 访问码验证 API
- [ ] Cookie/Session 管理

### 3. 前端页面
- [ ] 访问码输入页面 (`/access`)
- [ ] 管理员访问码管理页面 (`/admin/codes`)
- [ ] 生成访问码表单

### 4. 中间件
- [ ] 修改 middleware.ts
- [ ] 添加路径保护

### 5. 测试
- [ ] 验证流程测试
- [ ] 过期处理测试
- [ ] 并发使用测试

### 6. 部署
- [ ] 环境变量配置
- [ ] 数据库迁移执行
- [ ] 生产环境测试

---

## 价格建议

根据市场调研：

| 套餐 | 有效期 | 次数 | 价格 | 说明 |
|------|--------|------|------|------|
| 体验版 | 12小时 | 1次 | ¥4.9 | 限时活动 |
| 基础版 | 24小时 | 1次 | ¥9.9 | 最受欢迎 |
| 标准版 | 48小时 | 3次 | ¥19.9 | 可分享给朋友 |
| 高级版 | 7天 | 5次 | ¥29.9 | 适合团队 |

---

## 营销策略

### 1. 限时优惠
- 首批100名用户 5折
- 节假日特惠

### 2. 分享奖励
- 分享给朋友获得额外测试次数
- 邀请返现机制

### 3. 会员制
- 月度/年度会员无限次测试

---

## 技术栈

- **访问码存储**：Supabase PostgreSQL
- **Session 管理**：HTTP-only Cookie
- **验证中间件**：Next.js Middleware
- **支付集成**：微信支付 / 支付宝（可选）
- **发码通知**：短信 API / 邮件 API（可选）

---

## 总结

访问码系统是一个灵活、安全、易实施的付费验证方案，特别适合：
- 初期手动运营
- 中期半自动化
- 后期完全自动化

现在开始实施吗？
