-- ================================================
-- 访问码系统数据库迁移
-- Version: 1.0
-- Date: 2026-03-09
-- ================================================

BEGIN;

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

  -- 关联信息
  user_id UUID REFERENCES profiles(id) NULL,     -- 激活后绑定的用户
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
CREATE INDEX IF NOT EXISTS idx_access_codes_user ON access_codes(user_id);

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

-- RLS 策略 - access_codes
-- 任何人都可以验证访问码（通过 API，不直接查询）
-- 管理员可以查看所有
CREATE POLICY "Service role can manage access codes"
ON access_codes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- RLS 策略 - access_code_logs
CREATE POLICY "Service role can manage logs"
ON access_code_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

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

COMMIT;
