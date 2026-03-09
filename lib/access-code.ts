/**
 * 访问码生成和验证工具
 */

import { createClient } from '@/lib/supabase/server'

// 去除易混淆字符：0/O, 1/I/L
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/**
 * 生成随机访问码
 * 格式: XXXX-XXXX-XXXX (12位字符，3组，每组4位)
 */
export function generateAccessCode(): string {
  let code = ''

  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) {
      code += '-'
    }
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }

  return code
}

/**
 * 生成指定数量的访问码
 * @param count 数量
 * @param validityHours 有效期（小时）
 * @param maxUses 最大使用次数
 * @param price 价格
 * @param notes 备注
 */
export async function generateAccessCodes(options: {
  count: number
  validityHours: number
  maxUses: number
  price?: number
  notes?: string
}): Promise<string[]> {
  const supabase = await createClient()
  const codes: string[] = []
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + options.validityHours)

  for (let i = 0; i < options.count; i++) {
    const code = generateAccessCode()

    const { error } = await supabase
      .from('access_codes' as any)
      .insert({
        code,
        expires_at: expiresAt.toISOString(),
        max_uses: options.maxUses,
        price: options.price,
        notes: options.notes,
      } as any)

    if (!error) {
      codes.push(code)
    }
  }

  return codes
}

/**
 * 验证访问码是否有效
 * @param code 访问码
 * @returns 验证结果
 */
export async function validateAccessCode(code: string): Promise<{
  valid: boolean
  message: string
  expiresAt?: string
  remainingUses?: number
}> {
  const supabase = await createClient()

  // 格式化访问码（移除空格，转大写）
  const formattedCode = code.trim().toUpperCase()

  // 调用数据库函数验证
  const { data, error } = await (supabase as any).rpc('is_access_code_valid', {
    p_code: formattedCode,
  })

  if (error || !data || data.length === 0) {
    return {
      valid: false,
      message: '验证失败，请重试',
    }
  }

  const result = data[0]

  return {
    valid: result.valid,
    message: result.message,
    expiresAt: result.expires_at,
    remainingUses: result.remaining_uses,
  }
}

/**
 * 使用访问码（增加使用次数）
 * @param code 访问码
 * @param ipAddress IP地址
 */
export async function useAccessCode(
  code: string,
  ipAddress?: string
): Promise<{
  success: boolean
  message: string
}> {
  const supabase = await createClient()

  const formattedCode = code.trim().toUpperCase()

  const { data, error } = await (supabase as any).rpc('use_access_code', {
    p_code: formattedCode,
    p_ip: ipAddress,
  })

  if (error || !data || data.length === 0) {
    return {
      success: false,
      message: '使用失败，请重试',
    }
  }

  const result = data[0]

  return {
    success: result.success,
    message: result.message,
  }
}

/**
 * 记录访问日志
 */
export async function logAccessAttempt(options: {
  code: string
  action: 'validate' | 'use' | 'expire'
  success: boolean
  ipAddress?: string
  userAgent?: string
  errorMessage?: string
}) {
  const supabase = await createClient()

  await supabase.from('access_code_logs' as any).insert({
    code: options.code.trim().toUpperCase(),
    action: options.action,
    success: options.success,
    ip_address: options.ipAddress,
    user_agent: options.userAgent,
    error_message: options.errorMessage,
  } as any)
}

/**
 * 获取访问码列表（管理员）
 */
export async function getAccessCodes(options: {
  status?: 'all' | 'active' | 'expired' | 'used'
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('access_codes' as any)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // 筛选条件
  if (options.status === 'active') {
    query = query
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
  } else if (options.status === 'expired') {
    query = query.lt('expires_at', new Date().toISOString())
  } else if (options.status === 'used') {
    query = query.eq('is_active', false)
  }

  // 分页
  if (options.limit) {
    query = query.limit(options.limit)
  }
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    throw error
  }

  return {
    codes: data || [],
    total: count || 0,
  }
}

/**
 * 获取访问码统计信息（管理员）
 */
export async function getAccessCodeStats() {
  const supabase = await createClient()

  const [totalResult, activeResult, usedResult, expiredResult, revenueResult] =
    await Promise.all([
      supabase.from('access_codes' as any).select('id', { count: 'exact', head: true }),
      supabase
        .from('access_codes' as any)
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString()),
      supabase
        .from('access_codes' as any)
        .select('id', { count: 'exact', head: true })
        .eq('is_active', false),
      supabase
        .from('access_codes' as any)
        .select('id', { count: 'exact', head: true })
        .lt('expires_at', new Date().toISOString()),
      supabase.from('access_codes' as any).select('price'),
    ])

  const totalRevenue = revenueResult.data?.reduce(
    (sum, item: any) => sum + (Number(item.price) || 0),
    0
  ) || 0

  return {
    total: totalResult.count || 0,
    active: activeResult.count || 0,
    used: usedResult.count || 0,
    expired: expiredResult.count || 0,
    revenue: totalRevenue,
  }
}
