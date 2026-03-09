import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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

      // TODO: 可以在这里添加访问码有效性验证
      // 目前仅检查 Cookie 是否存在
    }
  }

  // 管理员路径仍然需要身份验证
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
