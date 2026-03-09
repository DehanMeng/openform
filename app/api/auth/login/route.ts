import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const password = formData.get('password') as string

    // 从环境变量读取管理员密码
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.redirect(
        new URL('/admin/login?error=invalid', request.url)
      )
    }

    // 设置 admin session cookie
    const response = NextResponse.redirect(new URL('/admin/codes', request.url))

    response.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.redirect(
      new URL('/admin/login?error=server', request.url)
    )
  }
}
