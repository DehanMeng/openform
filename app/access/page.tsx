'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Brain, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AccessPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/access/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })

      const data = await response.json()

      if (data.valid) {
        setSuccess(true)
        // 等待1秒让用户看到成功提示，然后跳转
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 1000)
      } else {
        setError(data.message || '访问码无效，请检查后重试')
      }
    } catch (err) {
      setError('验证失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const formatCode = (value: string) => {
    // 移除所有非字母数字字符
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase()

    // 每4个字符添加一个横杠
    const formatted = cleaned
      .match(/.{1,4}/g)
      ?.join('-')
      .substring(0, 14) // XXXX-XXXX-XXXX

    return formatted || ''
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value)
    setCode(formatted)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02332f] via-[#024a3f] to-[#02332f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <Brain className="w-10 h-10 text-[#277f55]" />
          <h1 className="text-2xl font-bold text-white">16型人格测试</h1>
        </div>

        {/* Access Code Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="flex items-center gap-2 justify-center mb-6">
            <Lock className="w-8 h-8 text-[#277f55]" />
            <h2 className="text-2xl font-bold text-white">请输入访问码</h2>
          </div>

          <p className="text-gray-300 text-center mb-6">
            本测试为付费产品，需要访问码才能使用
          </p>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="text-green-200">
                <p className="font-medium">验证成功！</p>
                <p className="text-sm">正在跳转...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                访问码
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="XXXX-XXXX-XXXX"
                maxLength={14}
                required
                disabled={loading || success}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-lg font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#277f55] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-gray-400 text-center">
                请输入12位访问码（自动格式化）
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || success || code.length < 14}
              className="w-full h-12 bg-[#277f55] hover:bg-[#1f6444] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  验证中...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  验证成功
                </>
              ) : (
                '确认访问码'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-gray-400">还没有访问码？</span>
            </div>
          </div>

          {/* Purchase Info */}
          <div className="space-y-3">
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="text-white font-medium mb-2">如何获取访问码？</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#277f55] mt-0.5">•</span>
                  <span>添加微信：<strong className="text-white">your_wechat_id</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#277f55] mt-0.5">•</span>
                  <span>价格：基础版 ¥9.9（24小时有效）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#277f55] mt-0.5">•</span>
                  <span>付款后立即发送访问码</span>
                </li>
              </ul>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-400">
                访问码支持多次测试 · 24小时内有效
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>本测试仅供娱乐和自我认知参考</p>
        </div>
      </div>
    </div>
  )
}
