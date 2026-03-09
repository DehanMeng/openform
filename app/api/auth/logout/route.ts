import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url))

  // 删除 admin session cookie
  response.cookies.delete('admin_session')

  return response
}

export async function GET(request: NextRequest) {
  return POST(request)
}
