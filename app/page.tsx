import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, Zap, BarChart3, Users, Star, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02332f] via-[#024a3f] to-[#02332f]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#02332f]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-[#277f55]" />
            <h1 className="text-xl font-bold text-white">16型人格测试</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/about" className="text-gray-300 hover:text-white transition">
              关于测试
            </Link>
            <Link href="/types" className="text-gray-300 hover:text-white transition">
              16种类型
            </Link>
            <Link href="/admin/login" className="text-gray-400 hover:text-gray-300 transition text-xs">
              管理员
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#277f55]/20 border border-[#277f55]/30 rounded-full px-4 py-2 mb-8">
            <Star className="w-4 h-4 text-[#277f55]" />
            <span className="text-[#277f55] text-sm font-medium">基于近4000万用户数据优化</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            16型人格测试
            <br />
            <span className="text-[#277f55]">原汁原味的高精度测试</span>
          </h1>

          <p className="text-xl text-gray-300 mb-4">
            更人性化的按程度（可中立）选择模式
          </p>
          <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
            本测试基于MBTI理论，通过科学的问卷设计，帮助你深入了解自己的人格特征、优势劣势、职业倾向和人际关系风格
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/test?version=full">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-lg bg-[#277f55] hover:bg-[#1f6444] text-white shadow-lg shadow-[#277f55]/20 transition-all"
              >
                <Brain className="w-5 h-5 mr-2" />
                开始完整测试
                <span className="ml-2 text-sm opacity-80">(93题 · 约15分钟)</span>
              </Button>
            </Link>
            <Link href="/test?version=quick">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 text-lg border-2 border-[#277f55] text-[#277f55] hover:bg-[#277f55]/10 transition-all"
              >
                <Zap className="w-5 h-5 mr-2" />
                极速版测试
                <span className="ml-2 text-sm opacity-80">(30题 · 约5分钟)</span>
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
              <BarChart3 className="w-10 h-10 text-[#277f55] mb-4 mx-auto" />
              <h3 className="text-white font-semibold mb-2">精准分析</h3>
              <p className="text-gray-400 text-sm">
                四维度深度评估，置信度量化展示
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
              <Users className="w-10 h-10 text-[#277f55] mb-4 mx-auto" />
              <h3 className="text-white font-semibold mb-2">详细报告</h3>
              <p className="text-gray-400 text-sm">
                优势劣势、职业建议、人际关系
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
              <TrendingUp className="w-10 h-10 text-[#277f55] mb-4 mx-auto" />
              <h3 className="text-white font-semibold mb-2">持续优化</h3>
              <p className="text-gray-400 text-sm">
                基于大数据不断改进算法模型
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-16 p-6 bg-white/5 border border-white/10 rounded-xl max-w-2xl mx-auto">
            <p className="text-gray-400 text-sm leading-relaxed">
              <span className="text-white font-medium">免责声明：</span>
              本测试仅供娱乐和自我认知参考，不能作为专业心理诊断依据。
              如需专业心理咨询，请寻求持证心理咨询师的帮助。
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#02332f]/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400 text-sm">
          <p>© 2026 16型人格测试 · 仅供参考，不作为专业诊断</p>
        </div>
      </footer>
    </div>
  )
}
