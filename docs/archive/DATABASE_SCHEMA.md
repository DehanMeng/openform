# MBTI 应用数据库 Schema 设计

## 一、数据库架构概览

```
profiles (现有表)
  ├── mbti_test_results (新增)
  │     └── 关联 mbti_questions
  └── current_mbti_type (新增字段)

mbti_questions (新增)
mbti_types (新增)
mbti_question_sets (新增)
```

---

## 二、表结构详细设计

### 2.1 扩展现有表: `profiles`

```sql
-- 添加新字段到现有 profiles 表
ALTER TABLE profiles
ADD COLUMN current_mbti_type VARCHAR(4) NULL,           -- 当前人格类型 (INTJ, ENFP等)
ADD COLUMN last_test_date TIMESTAMP NULL,               -- 最后测试日期
ADD COLUMN total_tests INTEGER DEFAULT 0;               -- 总测试次数

-- 添加索引
CREATE INDEX idx_profiles_mbti_type ON profiles(current_mbti_type);
```

### 2.2 新表: `mbti_questions`

存储 MBTI 标准化问题库

```sql
CREATE TABLE mbti_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 问题内容
  text TEXT NOT NULL,                                   -- 问题文本
  text_en TEXT NULL,                                    -- 英文版本 (可选)

  -- 维度标识
  dimension VARCHAR(2) NOT NULL,                        -- EI, SN, TF, JP
  pole VARCHAR(5) NOT NULL,                             -- 'left' 或 'right'

  -- 问题元数据
  category VARCHAR(20) DEFAULT 'behavioral',            -- behavioral, preference, situational
  difficulty INTEGER DEFAULT 1,                         -- 难度 1-5
  reverse BOOLEAN DEFAULT FALSE,                        -- 是否反向计分

  -- 排序与版本
  "order" INTEGER NOT NULL,                             -- 题目顺序
  question_set VARCHAR(20) DEFAULT 'standard',          -- 所属题集: standard, quick, extended
  version VARCHAR(10) DEFAULT 'v1',                     -- 版本号

  -- 状态
  is_active BOOLEAN DEFAULT TRUE,                       -- 是否启用

  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- 约束
  CONSTRAINT chk_dimension CHECK (dimension IN ('EI', 'SN', 'TF', 'JP')),
  CONSTRAINT chk_pole CHECK (pole IN ('left', 'right')),
  CONSTRAINT chk_category CHECK (category IN ('behavioral', 'preference', 'situational'))
);

-- 索引
CREATE INDEX idx_mbti_questions_dimension ON mbti_questions(dimension);
CREATE INDEX idx_mbti_questions_set ON mbti_questions(question_set);
CREATE INDEX idx_mbti_questions_active ON mbti_questions(is_active);
CREATE INDEX idx_mbti_questions_order ON mbti_questions("order");

-- RLS 策略: 所有人可读
ALTER TABLE mbti_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "MBTI questions are viewable by everyone"
ON mbti_questions FOR SELECT
USING (is_active = TRUE);
```

### 2.3 新表: `mbti_types`

存储 16 种人格类型详细描述

```sql
CREATE TABLE mbti_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 类型标识
  type VARCHAR(4) UNIQUE NOT NULL,                      -- INTJ, ENFP等

  -- 基本信息
  nickname VARCHAR(50) NOT NULL,                        -- 建筑师、逻辑学家等
  category VARCHAR(2) NOT NULL,                         -- NT, NF, SJ, SP

  -- 详细描述
  description TEXT NOT NULL,                            -- 整体描述
  strengths TEXT[] DEFAULT '{}',                        -- 优势列表
  weaknesses TEXT[] DEFAULT '{}',                       -- 劣势列表

  -- 职业与关系
  careers TEXT[] DEFAULT '{}',                          -- 适合职业
  relationships TEXT,                                   -- 人际关系描述
  learning_style TEXT,                                  -- 学习风格

  -- 名人与文化
  famous_people TEXT[] DEFAULT '{}',                    -- 代表名人
  fictional_characters TEXT[] DEFAULT '{}',             -- 代表虚拟角色

  -- UI 配置
  theme_color VARCHAR(7) DEFAULT '#6366f1',             -- 主题色 (hex)
  icon_emoji VARCHAR(10) DEFAULT '🧩',                  -- 表情符号

  -- 统计数据 (定期更新)
  global_percentage DECIMAL(5,2) DEFAULT 0.00,          -- 全球占比
  local_percentage DECIMAL(5,2) DEFAULT 0.00,           -- 本站用户占比

  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- 约束
  CONSTRAINT chk_type_format CHECK (type ~ '^[IE][SN][TF][JP]$'),
  CONSTRAINT chk_category CHECK (category IN ('NT', 'NF', 'SJ', 'SP'))
);

-- 索引
CREATE INDEX idx_mbti_types_category ON mbti_types(category);

-- RLS 策略: 所有人可读
ALTER TABLE mbti_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "MBTI types are viewable by everyone"
ON mbti_types FOR SELECT
USING (TRUE);
```

### 2.4 新表: `mbti_test_results`

存储用户测试结果

```sql
CREATE TABLE mbti_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 用户关联
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- 测试结果
  mbti_type VARCHAR(4) NOT NULL,                        -- 最终人格类型

  -- 维度得分 (JSONB 存储详细数据)
  dimension_scores JSONB NOT NULL,                      -- 四维度得分
  /*
    示例结构:
    {
      "EI": { "score": -20, "type": "I", "percentage": 60 },
      "SN": { "score": 40, "type": "N", "percentage": 70 },
      "TF": { "score": -10, "type": "T", "percentage": 55 },
      "JP": { "score": 30, "type": "P", "percentage": 65 }
    }
  */

  polarity_scores JSONB NOT NULL,                       -- 极性分数
  /*
    示例结构:
    {
      "E": 40, "I": 60,
      "S": 30, "N": 70,
      "T": 55, "F": 45,
      "J": 35, "P": 65
    }
  */

  -- 扩展维度 (可选)
  extended_dimensions JSONB DEFAULT '{}',               -- AO, HC等扩展维度

  -- 答案记录
  answers JSONB NOT NULL,                               -- 所有答案 {questionId: value}

  -- 测试元数据
  test_version VARCHAR(20) DEFAULT 'full',              -- full, quick, custom
  question_set VARCHAR(20) DEFAULT 'standard',          -- 使用的题集
  confidence INTEGER DEFAULT 0,                         -- 结果置信度 0-100

  -- 时间信息
  started_at TIMESTAMP,                                 -- 开始时间
  completed_at TIMESTAMP DEFAULT NOW(),                 -- 完成时间
  duration_seconds INTEGER,                             -- 耗时(秒)

  -- 分享与隐私
  is_public BOOLEAN DEFAULT FALSE,                      -- 是否公开分享
  share_token VARCHAR(32) UNIQUE,                       -- 分享令牌

  created_at TIMESTAMP DEFAULT NOW(),

  -- 约束
  CONSTRAINT chk_mbti_type CHECK (mbti_type ~ '^[IE][SN][TF][JP]$'),
  CONSTRAINT chk_confidence CHECK (confidence >= 0 AND confidence <= 100),
  CONSTRAINT chk_duration CHECK (duration_seconds >= 0)
);

-- 索引
CREATE INDEX idx_test_results_user_id ON mbti_test_results(user_id);
CREATE INDEX idx_test_results_type ON mbti_test_results(mbti_type);
CREATE INDEX idx_test_results_completed ON mbti_test_results(completed_at DESC);
CREATE INDEX idx_test_results_share_token ON mbti_test_results(share_token);
CREATE INDEX idx_test_results_public ON mbti_test_results(is_public) WHERE is_public = TRUE;

-- RLS 策略
ALTER TABLE mbti_test_results ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的结果
CREATE POLICY "Users can view own test results"
ON mbti_test_results FOR SELECT
USING (auth.uid() = user_id);

-- 公开分享的结果任何人可见
CREATE POLICY "Public test results are viewable by anyone"
ON mbti_test_results FOR SELECT
USING (is_public = TRUE);

-- 用户可以插入自己的结果
CREATE POLICY "Users can insert own test results"
ON mbti_test_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的结果 (如修改is_public)
CREATE POLICY "Users can update own test results"
ON mbti_test_results FOR UPDATE
USING (auth.uid() = user_id);

-- 用户可以删除自己的结果
CREATE POLICY "Users can delete own test results"
ON mbti_test_results FOR DELETE
USING (auth.uid() = user_id);
```

### 2.5 新表: `mbti_question_sets` (可选)

管理不同版本的问题集

```sql
CREATE TABLE mbti_question_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 题集标识
  name VARCHAR(50) UNIQUE NOT NULL,                     -- standard, quick, extended
  display_name VARCHAR(100) NOT NULL,                   -- 显示名称

  -- 题集配置
  description TEXT,
  question_count INTEGER NOT NULL,                      -- 题目数量
  estimated_minutes INTEGER NOT NULL,                   -- 预计耗时(分钟)

  -- 题目ID列表
  question_ids UUID[] NOT NULL,                         -- 包含的问题ID

  -- 状态
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,

  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_question_sets_active ON mbti_question_sets(is_active);

-- RLS 策略
ALTER TABLE mbti_question_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Question sets are viewable by everyone"
ON mbti_question_sets FOR SELECT
USING (is_active = TRUE);
```

---

## 三、Supabase 迁移文件

### 3.1 初始迁移: `20260308_create_mbti_tables.sql`

```sql
-- ================================================
-- MBTI 应用数据库迁移
-- Version: 1.0
-- Date: 2026-03-08
-- ================================================

BEGIN;

-- 1. 扩展 profiles 表
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS current_mbti_type VARCHAR(4),
ADD COLUMN IF NOT EXISTS last_test_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS total_tests INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_mbti_type ON profiles(current_mbti_type);

-- 2. 创建 mbti_questions 表
CREATE TABLE IF NOT EXISTS mbti_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  text_en TEXT,
  dimension VARCHAR(2) NOT NULL,
  pole VARCHAR(5) NOT NULL,
  category VARCHAR(20) DEFAULT 'behavioral',
  difficulty INTEGER DEFAULT 1,
  reverse BOOLEAN DEFAULT FALSE,
  "order" INTEGER NOT NULL,
  question_set VARCHAR(20) DEFAULT 'standard',
  version VARCHAR(10) DEFAULT 'v1',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT chk_dimension CHECK (dimension IN ('EI', 'SN', 'TF', 'JP')),
  CONSTRAINT chk_pole CHECK (pole IN ('left', 'right')),
  CONSTRAINT chk_category CHECK (category IN ('behavioral', 'preference', 'situational'))
);

CREATE INDEX IF NOT EXISTS idx_mbti_questions_dimension ON mbti_questions(dimension);
CREATE INDEX IF NOT EXISTS idx_mbti_questions_set ON mbti_questions(question_set);
CREATE INDEX IF NOT EXISTS idx_mbti_questions_active ON mbti_questions(is_active);
CREATE INDEX IF NOT EXISTS idx_mbti_questions_order ON mbti_questions("order");

-- 3. 创建 mbti_types 表
CREATE TABLE IF NOT EXISTS mbti_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(4) UNIQUE NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  category VARCHAR(2) NOT NULL,
  description TEXT NOT NULL,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  careers TEXT[] DEFAULT '{}',
  relationships TEXT,
  learning_style TEXT,
  famous_people TEXT[] DEFAULT '{}',
  fictional_characters TEXT[] DEFAULT '{}',
  theme_color VARCHAR(7) DEFAULT '#6366f1',
  icon_emoji VARCHAR(10) DEFAULT '🧩',
  global_percentage DECIMAL(5,2) DEFAULT 0.00,
  local_percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT chk_type_format CHECK (type ~ '^[IE][SN][TF][JP]$'),
  CONSTRAINT chk_category CHECK (category IN ('NT', 'NF', 'SJ', 'SP'))
);

CREATE INDEX IF NOT EXISTS idx_mbti_types_category ON mbti_types(category);

-- 4. 创建 mbti_test_results 表
CREATE TABLE IF NOT EXISTS mbti_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mbti_type VARCHAR(4) NOT NULL,
  dimension_scores JSONB NOT NULL,
  polarity_scores JSONB NOT NULL,
  extended_dimensions JSONB DEFAULT '{}',
  answers JSONB NOT NULL,
  test_version VARCHAR(20) DEFAULT 'full',
  question_set VARCHAR(20) DEFAULT 'standard',
  confidence INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP DEFAULT NOW(),
  duration_seconds INTEGER,
  is_public BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(32) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT chk_mbti_type CHECK (mbti_type ~ '^[IE][SN][TF][JP]$'),
  CONSTRAINT chk_confidence CHECK (confidence >= 0 AND confidence <= 100),
  CONSTRAINT chk_duration CHECK (duration_seconds >= 0)
);

CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON mbti_test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_type ON mbti_test_results(mbti_type);
CREATE INDEX IF NOT EXISTS idx_test_results_completed ON mbti_test_results(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_results_share_token ON mbti_test_results(share_token);
CREATE INDEX IF NOT EXISTS idx_test_results_public ON mbti_test_results(is_public) WHERE is_public = TRUE;

-- 5. 启用 RLS
ALTER TABLE mbti_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti_test_results ENABLE ROW LEVEL SECURITY;

-- 6. RLS 策略 - mbti_questions
CREATE POLICY "MBTI questions are viewable by everyone"
ON mbti_questions FOR SELECT
USING (is_active = TRUE);

-- 7. RLS 策略 - mbti_types
CREATE POLICY "MBTI types are viewable by everyone"
ON mbti_types FOR SELECT
USING (TRUE);

-- 8. RLS 策略 - mbti_test_results
CREATE POLICY "Users can view own test results"
ON mbti_test_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Public test results are viewable by anyone"
ON mbti_test_results FOR SELECT
USING (is_public = TRUE);

CREATE POLICY "Users can insert own test results"
ON mbti_test_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own test results"
ON mbti_test_results FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own test results"
ON mbti_test_results FOR DELETE
USING (auth.uid() = user_id);

COMMIT;
```

---

## 四、TypeScript 类型更新

更新 `lib/database.types.ts`:

```typescript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          current_mbti_type: string | null
          last_test_date: string | null
          total_tests: number
          created_at: string
          updated_at: string
        }
        // ... Insert 和 Update 类型
      }
      mbti_questions: {
        Row: {
          id: string
          text: string
          text_en: string | null
          dimension: 'EI' | 'SN' | 'TF' | 'JP'
          pole: 'left' | 'right'
          category: 'behavioral' | 'preference' | 'situational'
          difficulty: number
          reverse: boolean
          order: number
          question_set: string
          version: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        // ... Insert 和 Update 类型
      }
      mbti_types: {
        Row: {
          id: string
          type: string
          nickname: string
          category: 'NT' | 'NF' | 'SJ' | 'SP'
          description: string
          strengths: string[]
          weaknesses: string[]
          careers: string[]
          relationships: string | null
          learning_style: string | null
          famous_people: string[]
          fictional_characters: string[]
          theme_color: string
          icon_emoji: string
          global_percentage: number
          local_percentage: number
          created_at: string
          updated_at: string
        }
        // ... Insert 和 Update 类型
      }
      mbti_test_results: {
        Row: {
          id: string
          user_id: string
          mbti_type: string
          dimension_scores: Json
          polarity_scores: Json
          extended_dimensions: Json
          answers: Json
          test_version: string
          question_set: string
          confidence: number
          started_at: string | null
          completed_at: string
          duration_seconds: number | null
          is_public: boolean
          share_token: string | null
          created_at: string
        }
        // ... Insert 和 Update 类型
      }
    }
  }
}
```

---

## 五、数据迁移策略

### 5.1 如果有现有用户数据

```sql
-- 选项1: 保留 forms 表作为审计日志
-- 不做任何操作,让历史数据留存

-- 选项2: 清理无关数据
-- DROP TABLE responses;
-- DROP TABLE forms;
-- (生产环境慎用!)
```

### 5.2 性能优化建议

1. **分区策略** (用户量大时):
   ```sql
   -- 按年份分区 mbti_test_results
   CREATE TABLE mbti_test_results_2026 PARTITION OF mbti_test_results
   FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
   ```

2. **定期清理**:
   - 删除超过 2 年的匿名测试结果
   - 归档不活跃用户数据

3. **缓存热点数据**:
   - mbti_types 表可以客户端缓存
   - mbti_questions 可以在构建时静态化

---

## 六、种子数据准备清单

### 6.1 mbti_questions (93题完整版)

需要准备:
- [ ] EI 维度: 23 题
- [ ] SN 维度: 24 题
- [ ] TF 维度: 23 题
- [ ] JP 维度: 23 题

### 6.2 mbti_types (16种类型)

需要准备每个类型的:
- [ ] 昵称 (建筑师、逻辑学家等)
- [ ] 详细描述 (300-500字)
- [ ] 优势/劣势列表 (各5-8条)
- [ ] 适合职业 (10-15个)
- [ ] 代表名人 (5-10位)
- [ ] 主题色

### 6.3 问题集配置

- [ ] 标准版 (93题, ~15分钟)
- [ ] 快速版 (30题, ~5分钟)

---

## 七、数据库管理命令

```bash
# 连接到 Supabase
psql $DATABASE_URL

# 查看表结构
\d mbti_questions
\d mbti_types
\d mbti_test_results

# 统计数据
SELECT mbti_type, COUNT(*) FROM mbti_test_results GROUP BY mbti_type;

# 更新本地人格占比
UPDATE mbti_types SET local_percentage = (
  SELECT (COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM mbti_test_results)) * 100
  FROM mbti_test_results
  WHERE mbti_test_results.mbti_type = mbti_types.type
);
```
