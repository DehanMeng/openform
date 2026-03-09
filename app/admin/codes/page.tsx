'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Brain,
  Plus,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Loader2,
  LogOut,
} from 'lucide-react'
import Link from 'next/link'

interface AccessCode {
  id: string
  code: string
  created_at: string
  expires_at: string
  is_active: boolean
  max_uses: number
  current_uses: number
  price: number | null
  notes: string | null
  buyer_contact: string | null
  last_used_at: string | null
}

interface Stats {
  total: number
  active: number
  used: number
  expired: number
  revenue: number
}

export default function AdminCodesPage() {
  const [codes, setCodes] = useState<AccessCode[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    used: 0,
    expired: 0,
    revenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // 生成表单状态
  const [generateForm, setGenerateForm] = useState({
    count: 1,
    validityHours: 24,
    maxUses: 1,
    price: 9.9,
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // 这里应该调用 API 获取数据
      // 暂时使用模拟数据
      setCodes([])
      setStats({
        total: 0,
        active: 0,
        used: 0,
        expired: 0,
        revenue: 0,
      })
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    try {
      setGenerating(true)

      const response = await fetch('/api/admin/codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generateForm),
      })

      const data = await response.json()

      if (data.success) {
        alert(`成功生成 ${data.count} 个访问码！\n\n${data.codes.join('\n')}`)
        loadData()
      } else {
        alert('生成失败：' + (data.error || '未知错误'))
      }
    } catch (error) {
      alert('生成失败，请重试')
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 0) {
      return '已过期'
    } else if (hours < 24) {
      return `${hours}小时后过期`
    } else {
      return `${Math.floor(hours / 24)}天后过期`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02332f] via-[#024a3f] to-[#02332f]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#02332f]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-[#277f55]" />
            <h1 className="text-xl font-bold text-white">访问码管理</h1>
          </Link>
          <form action="/api/auth/logout" method="post">
            <Button
              type="submit"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="p-4 bg-white/10 border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">总计</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </Card>

            <Card className="p-4 bg-white/10 border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">可用</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
            </Card>

            <Card className="p-4 bg-white/10 border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">已用完</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.used}</p>
            </Card>

            <Card className="p-4 bg-white/10 border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-300">已过期</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.expired}</p>
            </Card>

            <Card className="p-4 bg-white/10 border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-[#277f55]" />
                <span className="text-sm text-gray-300">总收入</span>
              </div>
              <p className="text-2xl font-bold text-white">¥{stats.revenue.toFixed(2)}</p>
            </Card>
          </div>

          {/* Generate Form */}
          <Card className="p-6 bg-white/10 border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#277f55]" />
              生成新访问码
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">生成数量</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={generateForm.count}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, count: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">有效期（小时）</label>
                <input
                  type="number"
                  min="1"
                  max="8760"
                  value={generateForm.validityHours}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, validityHours: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">使用次数</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={generateForm.maxUses}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, maxUses: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">价格（元）</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={generateForm.price}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, price: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full bg-[#277f55] hover:bg-[#1f6444] text-white"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      生成
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">备注（可选）</label>
              <input
                type="text"
                value={generateForm.notes}
                onChange={(e) => setGenerateForm({ ...generateForm, notes: e.target.value })}
                placeholder="例如：618活动、给朋友、测试用"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
              />
            </div>
          </Card>

          {/* Codes List */}
          <Card className="p-6 bg-white/10 border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">访问码列表</h2>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-[#277f55] mx-auto animate-spin mb-4" />
                <p className="text-gray-300">加载中...</p>
              </div>
            ) : codes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">暂无访问码，点击上方按钮生成</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                        访问码
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                        状态
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                        有效期
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                        使用情况
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                        价格
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((code) => (
                      <tr key={code.id} className="border-b border-white/5">
                        <td className="py-3 px-4">
                          <code className="text-white font-mono">{code.code}</code>
                        </td>
                        <td className="py-3 px-4">
                          {code.is_active ? (
                            <span className="text-green-400 text-sm">可用</span>
                          ) : (
                            <span className="text-red-400 text-sm">失效</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {formatDate(code.expires_at)}
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {code.current_uses} / {code.max_uses}
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {code.price ? `¥${code.price}` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(code.code)}
                            className="text-[#277f55] hover:bg-white/5"
                          >
                            {copiedCode === code.code ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                已复制
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-1" />
                                复制
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
