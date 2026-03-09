import { NextRequest, NextResponse } from 'next/server'
import { generateAccessCodes } from '@/lib/access-code'

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限（检查 cookie）
    const adminSession = request.cookies.get('admin_session')

    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json(
        { error: '未授权访问，请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      count = 1,
      validityHours = 24,
      maxUses = 1,
      price,
      notes,
    } = body

    // 验证参数
    if (count < 1 || count > 100) {
      return NextResponse.json(
        { error: '生成数量必须在 1-100 之间' },
        { status: 400 }
      )
    }

    if (validityHours < 1 || validityHours > 8760) {
      return NextResponse.json(
        { error: '有效期必须在 1 小时到 365 天之间' },
        { status: 400 }
      )
    }

    if (maxUses < 1 || maxUses > 100) {
      return NextResponse.json(
        { error: '使用次数必须在 1-100 之间' },
        { status: 400 }
      )
    }

    // 生成访问码
    const codes = await generateAccessCodes({
      count,
      validityHours,
      maxUses,
      price,
      notes,
    })

    return NextResponse.json({
      success: true,
      codes,
      count: codes.length,
    })
  } catch (error) {
    console.error('Generate access codes error:', error)
    return NextResponse.json(
      { error: '生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}
