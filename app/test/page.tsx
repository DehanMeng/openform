'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Brain, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

function TestPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const version = searchParams.get('version') || 'full'

  const testConfig = {
    full: {
      title: '完整版测试',
      questions: 93,
      duration: '15分钟',
      description: '包含所有维度的深度测评，结果更精准可靠',
      features: [
        '93道精心设计的问题',
        '四维度全面评估（E/I, S/N, T/F, J/P）',
        '详细的人格分析报告',
        '职业建议与人际关系洞察',
        '置信度评分'
      ]
    },
    quick: {
      title: '极速版测试',
      questions: 30,
      duration: '5分钟',
      description: '快速了解你的人格类型，适合初次体验',
      features: [
        '30道核心问题',
        '快速获得基础人格类型',
        '简化版分析报告',
        '适合时间有限的用户',
        '可随时升级到完整版'
      ]
    }
  }

  const config = testConfig[version as keyof typeof testConfig] || testConfig.full

  const startTest = () => {
    router.push(`/test/taking?version=${version}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02332f] via-[#024a3f] to-[#02332f]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#02332f]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <Brain className="w-8 h-8 text-[#277f55]" />
            <h1 className="text-xl font-bold text-white">16型人格测试</h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          {/* Test Info Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 md:p-12 mb-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#277f55]/20 border border-[#277f55]/30 rounded-full px-3 py-1 mb-6">
              <Clock className="w-4 h-4 text-[#277f55]" />
              <span className="text-[#277f55] text-sm font-medium">预计 {config.duration}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {config.title}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {config.description}
            </p>

            {/* Features List */}
            <div className="space-y-3 mb-8">
              {config.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#277f55] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            {/* Version Switch */}
            <div className="flex flex-wrap gap-3 mb-8 pb-8 border-b border-white/10">
              <Link href="/test?version=full">
                <Button
                  variant={version === 'full' ? 'default' : 'outline'}
                  className={
                    version === 'full'
                      ? 'bg-[#277f55] hover:bg-[#1f6444] text-white'
                      : 'border-white/20 text-gray-300 hover:bg-white/5'
                  }
                >
                  完整版 (93题)
                </Button>
              </Link>
              <Link href="/test?version=quick">
                <Button
                  variant={version === 'quick' ? 'default' : 'outline'}
                  className={
                    version === 'quick'
                      ? 'bg-[#277f55] hover:bg-[#1f6444] text-white'
                      : 'border-white/20 text-gray-300 hover:bg-white/5'
                  }
                >
                  极速版 (30题)
                </Button>
              </Link>
            </div>

            {/* Instructions */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#277f55]" />
                答题须知
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• 请根据<strong className="text-white">真实感受</strong>作答，无对错之分</li>
                <li>• 使用 1-7 量表选择，4 代表中立</li>
                <li>• 不要过度思考，凭第一直觉选择</li>
                <li>• 建议在<strong className="text-white">安静环境</strong>下一次性完成</li>
                <li>• 可使用键盘 ↑↓ 或滚轮切换题目，Enter 确认</li>
              </ul>
            </div>

            {/* Start Button */}
            <Button
              onClick={startTest}
              size="lg"
              className="w-full h-14 text-lg bg-[#277f55] hover:bg-[#1f6444] text-white shadow-lg shadow-[#277f55]/20 transition-all"
            >
              <Brain className="w-5 h-5 mr-2" />
              开始测试 ({config.questions} 题)
            </Button>
          </div>

          {/* Back Link */}
          <div className="text-center">
            <Link href="/" className="text-gray-400 hover:text-gray-300 text-sm transition">
              ← 返回首页
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function TestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#02332f] via-[#024a3f] to-[#02332f] flex items-center justify-center">
        <div className="text-white text-lg">加载中...</div>
      </div>
    }>
      <TestPageContent />
    </Suspense>
  )
}
