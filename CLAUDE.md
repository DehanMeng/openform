# MBTI 人格测试 Web 应用

基于 OpenForm 深度定制的付费 MBTI 测试应用，参考 16type.com 设计。

## 项目定位

- **付费访问**：通过访问码系统控制访问，无需用户注册登录
- **一题一屏**：TypeForm 风格的答题体验
- **科学评分**：完整的 MBTI 四维度计算引擎
- **管理后台**：访问码生成和管理系统

## 技术栈

- Next.js 16 (App Router) + React 19
- Supabase (PostgreSQL + Auth)
- Tailwind CSS v4 + shadcn/ui
- TypeScript

## 项目结构

```
app/
├── page.tsx                          # 首页（需访问码）
├── access/page.tsx                   # 访问码验证页
├── test/
│   ├── page.tsx                      # 测试准备页
│   ├── taking/page.tsx               # 答题页（一题一屏）
│   └── result/[id]/page.tsx          # 结果页
├── types/page.tsx                    # 16 种类型总览
├── admin/codes/page.tsx              # 访问码管理后台
└── api/
    ├── access/validate/route.ts      # 验证访问码
    └── admin/codes/generate/route.ts # 生成访问码

lib/
├── mbti/
│   ├── calculator.ts                 # MBTI 计算引擎
│   ├── sample-questions.ts           # 问题库（当前 12 题）⚠️
│   ├── type-profiles.ts              # 16 种类型资料
│   └── types.ts                      # TypeScript 类型定义
├── access-code.ts                    # 访问码工具函数
└── supabase/                         # Supabase 客户端

supabase/
└── init.sql                          # 数据库初始化脚本

middleware.ts                          # 访问控制中间件
```

## 环境配置

### Supabase 配置（已完成 ✅）

`.env.local` 已配置（参考 `.env.example`）：
```bash
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的密钥
```

数据库已初始化（执行 `supabase/init.sql`）：
- ✅ `access_codes` 表
- ✅ `access_code_logs` 表
- ✅ `mbti_test_results` 表
- ✅ 数据库函数和 RLS 策略
- ✅ 测试访问码：`TEST-CODE-2024`（999 次，1 年有效）

### 启动项目

```bash
npm install
npm run dev
# 访问 http://localhost:3000
```

## 核心功能

### 1. 访问控制系统

**中间件保护**（`middleware.ts`）：
- 保护路径：`/`, `/test/*`, `/types`
- 检查 `access_token` Cookie
- 未授权自动重定向到 `/access`

**访问码格式**：`XXXX-XXXX-XXXX`（12 字符，排除易混淆字符 0/O/1/I/L）

**Cookie 设置**：
- HTTP-only（防 XSS）
- 有效期跟随访问码过期时间
- SameSite: lax

### 2. MBTI 计算引擎

**算法**（`lib/mbti/calculator.ts`）：
```typescript
1-7 量表 → -3 到 +3 分数
→ 按维度累加（E/I, S/N, T/F, J/P）
→ 归一化为百分比（0-100%）
→ 确定类型（>50% 为该极性）
→ 计算置信度
```

**核心函数**：
```typescript
calculateMBTIResult(
  questions: MBTIQuestion[],
  answers: Record<string, AnswerValue>,
  testVersion: string,
  userId?: string
): MBTIResult
```

### 3. 数据库设计

**access_codes**（访问码表）：
- `code` VARCHAR(14) - 访问码
- `expires_at` TIMESTAMP - 过期时间
- `max_uses` INTEGER - 最大使用次数
- `current_uses` INTEGER - 已使用次数
- `price` DECIMAL - 售价
- `is_active` BOOLEAN - 是否激活

**mbti_test_results**（测试结果）：
- `mbti_type` VARCHAR(4) - MBTI 类型
- `dimension_scores` JSONB - 四维度得分
- `polarity_scores` JSONB - 极性百分比
- `answers` JSONB - 所有答案
- `confidence` INTEGER - 置信度

## 开发指南

### Supabase 客户端使用

```typescript
// Server Components / API Routes
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Components
'use client'
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### 访问码生成

```typescript
import { generateAccessCode } from '@/lib/access-code'

// 格式：XXXX-XXXX-XXXX
// 字符集：ABCDEFGHJKMNPQRSTUVWXYZ23456789（排除 0/O/1/I/L）
const code = generateAccessCode()
```

### 答题页面约定

- **一题一屏**：使用 URL 参数 `?question=1` 控制当前题目
- **答案存储**：localStorage 临时存储，提交时发送 API
- **1-7 量表**：1=完全不同意，4=中立，7=完全同意
- **键盘支持**：数字键 1-7、↑↓ 箭头、滚轮

## 当前状态

### ✅ 已完成

- 5 个核心页面（首页、访问码、测试、结果、类型总览）
- MBTI 计算引擎（400+ 行）
- 访问码系统（生成、验证、管理）
- 管理员后台
- Supabase 完整配置
- 中间件访问控制
- 测试数据和测试访问码

### ⚠️ 待完成

**优先级 P0**：
1. **扩展题库**：当前仅 12 题演示，需扩展到：
   - 完整版：93 题
   - 快速版：30 题
   - 位置：`lib/mbti/sample-questions.ts`

**优先级 P1**（可选）：
2. 社交分享功能
3. 测试结果导出（PDF/图片）
4. 支付系统对接（微信支付）

## 关键文件

### MBTI 核心
- `lib/mbti/calculator.ts` - 评分引擎（400+ 行）
- `lib/mbti/sample-questions.ts` - 题库（⚠️ 仅 12 题）
- `lib/mbti/type-profiles.ts` - 16 种类型完整资料

### 访问码系统
- `lib/access-code.ts` - 工具函数
- `app/api/access/validate/route.ts` - 验证 API
- `middleware.ts` - 访问控制

### 数据库
- `supabase/init.sql` - 完整初始化脚本（已执行）

## 设计规范

### 配色
- 主背景：`#02332f` → `#024a3f`（深青绿渐变）
- 强调色：`#277f55`（深森林绿）
- 卡片：`bg-white/10` + `border-white/20`

### UI 约定
- 按钮主色：`bg-[#277f55] hover:bg-[#1f6444]`
- 一题一屏全屏显示
- Framer Motion 动画过渡
- 响应式设计

## 测试访问

**测试访问码**：`TEST-CODE-2024`
- 有效期：1 年
- 使用次数：999 次
- 价格：免费

**测试流程**：
1. 访问 http://localhost:3000
2. 自动跳转到 `/access`
3. 输入 `TEST-CODE-2024`
4. 验证成功后开始测试

## 参考文档

- `CONFIGURATION_COMPLETE.md` - Supabase 配置完成报告
- `ACCESS_CODE_USAGE.md` - 访问码使用指南
- `DATABASE_SCHEMA.md` - 数据库设计文档
- `MBTI_IMPLEMENTATION_PLAN.md` - 开发任务清单

---

**版本**：v2.0.0 (2026-03-09)
**状态**：核心功能完成，Supabase 已配置，题库待扩展
