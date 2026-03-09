import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Button } from '@/components/ui/button'
import { Brain, Shield, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')

  // 如果已登录，重定向到管理后台
  if (adminSession?.value === 'authenticated') {
    redirect('/admin/codes')
  }

  const params = await searchParams
  const error = params.error

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02332f] via-[#024a3f] to-[#02332f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <Brain className="w-10 h-10 text-[#277f55]" />
          <h1 className="text-2xl font-bold text-white">16型人格测试</h1>
        </Link>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="flex items-center gap-2 justify-center mb-6">
            <Shield className="w-8 h-8 text-[#277f55]" />
            <h2 className="text-2xl font-bold text-white">管理员登录</h2>
          </div>

          <p className="text-gray-300 text-center mb-8">
            输入管理员密码以访问后台管理系统
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">
                {error === 'invalid' ? '密码错误，请重试' : '登录失败，请稍后再试'}
              </span>
            </div>
          )}

          {/* Login Form */}
          <form action="/api/auth/login" method="post" className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                管理员密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#277f55] focus:border-transparent"
                placeholder="请输入管理员密码"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#277f55] hover:bg-[#1f6444] text-white"
            >
              登录
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-300">
              ← 返回首页
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>仅供管理员使用 · 未经授权禁止访问</p>
        </div>
      </div>
    </div>
  )
}
