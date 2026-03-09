-- ================================================
-- MBTI 测试应用 - 完整数据库初始化脚本
-- ================================================
-- 这个脚本将创建所有必需的表、索引、函数和测试数据
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ================================================

BEGIN;

-- ================================================
-- 1. 访问码系统
-- ================================================

-- 创建 access_codes 表
CREATE TABLE IF NOT EXISTS access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 访问码
  code VARCHAR(14) UNIQUE NOT NULL,              -- 格式: XXXX-XXXX-XXXX

  -- 有效期
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,                 -- 过期时间
  is_active BOOLEAN DEFAULT TRUE,                -- 是否激活

  -- 使用限制
  max_uses INTEGER DEFAULT 1,                    -- 最多使用次数
  current_uses INTEGER DEFAULT 0,                -- 当前已使用次数

  -- 使用记录
  last_used_at TIMESTAMP NULL,                   -- 最后使用时间
  last_used_ip VARCHAR(50) NULL,                 -- 最后使用 IP

  -- 订单信息
  order_id VARCHAR(50) NULL,                     -- 关联订单号
  price DECIMAL(10,2) NULL,                      -- 售价
  buyer_contact VARCHAR(100) NULL,               -- 买家联系方式

  -- 备注
  notes TEXT NULL,                               -- 管理员备注

  -- 约束
  CONSTRAINT chk_uses CHECK (current_uses <= max_uses)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_active ON access_codes(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_access_codes_expires ON access_codes(expires_at);

-- 创建访问日志表
CREATE TABLE IF NOT EXISTS access_code_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(14) NOT NULL,
  action VARCHAR(20) NOT NULL,                   -- 'validate', 'use', 'expire'
  success BOOLEAN NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_code ON access_code_logs(code);
CREATE INDEX IF NOT EXISTS idx_access_logs_created ON access_code_logs(created_at);

-- 启用 RLS
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_code_logs ENABLE ROW LEVEL SECURITY;

-- RLS 策略 - 允许 service_role 完全访问
DROP POLICY IF EXISTS "Service role can manage access codes" ON access_codes;
CREATE POLICY "Service role can manage access codes"
ON access_codes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage logs" ON access_code_logs;
CREATE POLICY "Service role can manage logs"
ON access_code_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- RLS 策略 - 允许 anon 验证访问码（只读特定字段）
DROP POLICY IF EXISTS "Anyone can validate access codes" ON access_codes;
CREATE POLICY "Anyone can validate access codes"
ON access_codes
FOR SELECT
TO anon
USING (true);

-- 创建函数：检查访问码是否有效
CREATE OR REPLACE FUNCTION is_access_code_valid(p_code VARCHAR)
RETURNS TABLE (
  valid BOOLEAN,
  message TEXT,
  expires_at TIMESTAMP,
  remaining_uses INTEGER
) AS $$
DECLARE
  v_code access_codes%ROWTYPE;
BEGIN
  -- 查找访问码
  SELECT * INTO v_code
  FROM access_codes
  WHERE code = p_code
  AND is_active = TRUE;

  -- 访问码不存在
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, '访问码不存在或已失效'::TEXT, NULL::TIMESTAMP, NULL::INTEGER;
    RETURN;
  END IF;

  -- 检查是否过期
  IF v_code.expires_at < NOW() THEN
    -- 标记为失效
    UPDATE access_codes SET is_active = FALSE WHERE code = p_code;
    RETURN QUERY SELECT FALSE, '访问码已过期'::TEXT, NULL::TIMESTAMP, NULL::INTEGER;
    RETURN;
  END IF;

  -- 检查使用次数
  IF v_code.current_uses >= v_code.max_uses THEN
    RETURN QUERY SELECT FALSE, '访问码使用次数已达上限'::TEXT, NULL::TIMESTAMP, NULL::INTEGER;
    RETURN;
  END IF;

  -- 访问码有效
  RETURN QUERY SELECT
    TRUE,
    '访问码有效'::TEXT,
    v_code.expires_at,
    (v_code.max_uses - v_code.current_uses)::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数：使用访问码（增加使用次数）
CREATE OR REPLACE FUNCTION use_access_code(
  p_code VARCHAR,
  p_ip VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_code access_codes%ROWTYPE;
BEGIN
  -- 查找访问码
  SELECT * INTO v_code
  FROM access_codes
  WHERE code = p_code
  AND is_active = TRUE
  FOR UPDATE;

  -- 访问码不存在
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, '访问码不存在或已失效'::TEXT;
    RETURN;
  END IF;

  -- 检查是否过期
  IF v_code.expires_at < NOW() THEN
    UPDATE access_codes SET is_active = FALSE WHERE code = p_code;
    RETURN QUERY SELECT FALSE, '访问码已过期'::TEXT;
    RETURN;
  END IF;

  -- 检查使用次数
  IF v_code.current_uses >= v_code.max_uses THEN
    RETURN QUERY SELECT FALSE, '访问码使用次数已达上限'::TEXT;
    RETURN;
  END IF;

  -- 增加使用次数
  UPDATE access_codes
  SET
    current_uses = current_uses + 1,
    last_used_at = NOW(),
    last_used_ip = p_ip
  WHERE code = p_code;

  RETURN QUERY SELECT TRUE, '访问码使用成功'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 2. MBTI 测试系统
-- ================================================

-- MBTI 测试结果表
CREATE TABLE IF NOT EXISTS mbti_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 基本信息
  created_at TIMESTAMP DEFAULT NOW(),
  access_code VARCHAR(14) NULL,                  -- 关联的访问码（可选）

  -- 测试版本
  test_version VARCHAR(20) DEFAULT 'full',       -- 'full' (93题) 或 'quick' (30题)

  -- MBTI 结果
  mbti_type VARCHAR(4) NOT NULL,                 -- 'INTJ', 'ENFP' 等
  confidence INTEGER NOT NULL,                   -- 置信度 0-100

  -- 详细得分（JSON）
  dimension_scores JSONB NOT NULL,               -- 四维度详细得分
  polarity_scores JSONB NOT NULL,                -- 极性百分比

  -- 答案记录（JSON）
  answers JSONB NOT NULL,                        -- 所有问题的答案

  -- 元数据
  ip_address VARCHAR(50) NULL,
  user_agent TEXT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_mbti_results_type ON mbti_test_results(mbti_type);
CREATE INDEX IF NOT EXISTS idx_mbti_results_created ON mbti_test_results(created_at);
CREATE INDEX IF NOT EXISTS idx_mbti_results_access_code ON mbti_test_results(access_code);

-- 启用 RLS
ALTER TABLE mbti_test_results ENABLE ROW LEVEL SECURITY;

-- RLS 策略 - 允许所有人插入测试结果
DROP POLICY IF EXISTS "Anyone can insert test results" ON mbti_test_results;
CREATE POLICY "Anyone can insert test results"
ON mbti_test_results
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- RLS 策略 - 允许所有人读取测试结果（通过 ID）
DROP POLICY IF EXISTS "Anyone can read test results" ON mbti_test_results;
CREATE POLICY "Anyone can read test results"
ON mbti_test_results
FOR SELECT
TO anon, authenticated
USING (true);

-- RLS 策略 - 管理员可以管理所有测试结果
DROP POLICY IF EXISTS "Service role can manage test results" ON mbti_test_results;
CREATE POLICY "Service role can manage test results"
ON mbti_test_results
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ================================================
-- 3. 插入测试数据
-- ================================================

-- 插入测试访问码
INSERT INTO access_codes (
  code,
  expires_at,
  max_uses,
  price,
  notes
) VALUES (
  'TEST-CODE-2024',
  NOW() + INTERVAL '365 days',  -- 1年有效期（方便测试）
  999,                           -- 可使用999次
  0,                             -- 免费测试码
  '开发测试用访问码 - 请勿删除'
) ON CONFLICT (code) DO NOTHING;

-- 再插入几个不同价位的测试访问码
INSERT INTO access_codes (code, expires_at, max_uses, price, notes) VALUES
  ('DEMO-BASIC-001', NOW() + INTERVAL '24 hours', 1, 9.9, '基础版演示'),
  ('DEMO-STAND-002', NOW() + INTERVAL '48 hours', 3, 19.9, '标准版演示'),
  ('DEMO-PREMM-003', NOW() + INTERVAL '7 days', 5, 29.9, '高级版演示')
ON CONFLICT (code) DO NOTHING;

COMMIT;

-- ================================================
-- 完成！
-- ================================================
-- 执行成功后，你可以：
-- 1. 使用访问码 TEST-CODE-2024 进行测试
-- 2. 在管理后台 /admin/codes 生成更多访问码
-- 3. 开始测试 MBTI 应用的所有功能
-- ================================================
