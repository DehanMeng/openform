import { NextRequest, NextResponse } from 'next/server'
import { validateAccessCode, useAccessCode, logAccessAttempt } from '@/lib/access-code'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, message: '请输入访问码' },
        { status: 400 }
      )
    }

    // 获取 IP 地址
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    const userAgent = request.headers.get('user-agent') || 'unknown'

    // 验证访问码
    const result = await validateAccessCode(code)

    // 记录日志
    await logAccessAttempt({
      code,
      action: 'validate',
      success: result.valid,
      ipAddress,
      userAgent,
      errorMessage: result.valid ? undefined : result.message,
    })

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, message: result.message },
        { status: 400 }
      )
    }

    // 使用访问码（增加使用次数）
    const useResult = await useAccessCode(code, ipAddress)

    if (!useResult.success) {
      return NextResponse.json(
        { valid: false, message: useResult.message },
        { status: 400 }
      )
    }

    // 记录使用日志
    await logAccessAttempt({
      code,
      action: 'use',
      success: true,
      ipAddress,
      userAgent,
    })

    // 设置 Cookie（HTTP-only，安全）
    const cookieStore = await cookies()
    const expiresAt = result.expiresAt ? new Date(result.expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000)

    cookieStore.set('access_token', code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })

    return NextResponse.json({
      valid: true,
      message: '验证成功',
      expiresAt: result.expiresAt,
      remainingUses: result.remainingUses,
    })
  } catch (error) {
    console.error('Access code validation error:', error)
    return NextResponse.json(
      { valid: false, message: '系统错误，请稍后重试' },
      { status: 500 }
    )
  }
}
