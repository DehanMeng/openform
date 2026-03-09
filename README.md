# MBTI 人格测试 Web 应用

一个基于访问码付费的 MBTI 人格测试应用，采用 TypeForm 风格的一题一屏答题体验。

## 特性

- **付费访问控制** - 通过访问码系统控制访问，无需用户注册
- **一题一屏** - 流畅的答题体验，支持键盘快捷键
- **科学评分** - 完整的 MBTI 四维度计算引擎
- **详细分析** - 16 种人格类型完整档案和可视化得分
- **管理后台** - 访问码生成、管理和统计

## 技术栈

- Next.js 16 (App Router) + React 19
- Supabase (PostgreSQL + Auth)
- Tailwind CSS v4 + shadcn/ui
- TypeScript

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的匿名密钥
```

### 3. 初始化数据库

在 Supabase Dashboard → SQL Editor 中执行 `supabase/init.sql`

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 测试访问

使用测试访问码：`TEST-CODE-2024`

## 项目结构

```
app/
├── page.tsx                   # 首页
├── access/page.tsx            # 访问码验证
├── test/                      # 测试相关页面
├── admin/codes/page.tsx       # 访问码管理后台
└── api/                       # API 路由

lib/
├── mbti/                      # MBTI 核心逻辑
│   ├── calculator.ts          # 评分引擎
│   ├── sample-questions.ts    # 题库（⚠️ 仅 12 题）
│   └── type-profiles.ts       # 16 种类型资料
└── supabase/                  # Supabase 客户端
```

## 待完成

- [ ] 扩展题库到 93 题完整版

## 文档

- [CLAUDE.md](CLAUDE.md) - 完整项目文档
- [docs/archive/](docs/archive/) - 参考文档归档

## License

MIT
