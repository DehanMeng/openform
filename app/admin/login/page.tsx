import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Brain, Shield } from 'lucide-react'
import Link from 'next/link'

async function getUser() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}

export default async function AdminLoginPage() {
  const user = await getUser()

  // If already logged in, redirect to dashboard
  if (user) {
    redirect('/admin/dashboard')
  }

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
            使用您的管理员账号登录以访问后台管理系统
          </p>

          {/* Login Form */}
          <form action="/auth/login" method="post" className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                邮箱
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#277f55] focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#277f55] focus:border-transparent"
                placeholder="••••••••"
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
