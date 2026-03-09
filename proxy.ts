import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 管理员路径保护（优先检查）
  if (pathname.startsWith('/admin')) {
    // 允许访问登录页面和 API
    if (!pathname.startsWith('/admin/login') && !pathname.startsWith('/api/auth')) {
      const adminSession = request.cookies.get('admin_session')

      // 没有管理员 session，重定向到登录页
      if (!adminSession || adminSession.value !== 'authenticated') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }
  }

  // 需要访问码验证的路径
  const protectedPaths = ['/', '/test', '/types']
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )

  // 如果是受保护路径，检查访问码
  if (isProtectedPath) {
    // 排除访问码验证页面本身和 API
    if (!pathname.startsWith('/access') && !pathname.startsWith('/api/')) {
      const accessToken = request.cookies.get('access_token')

      // 没有访问码 Cookie，重定向到验证页面
      if (!accessToken) {
        const url = new URL('/access', request.url)
        return NextResponse.redirect(url)
      }
    }
  }

  // Supabase session 更新
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
