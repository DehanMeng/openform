'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, Share2, Download, RotateCcw, TrendingUp, Users, Briefcase, Heart } from 'lucide-react'
import { MBTIResult } from '@/lib/mbti/types'
import { getTypeProfile } from '@/lib/mbti/type-profiles'
import { Progress } from '@/components/ui/progress'

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [result, setResult] = useState<MBTIResult | null>(null)

  useEffect(() => {
    // 从 localStorage 加载结果（实际应从数据库加载）
    const stored = localStorage.getItem('mbti_latest_result')
    if (stored) {
      const data = JSON.parse(stored)
      setResult(data)
    }
  }, [id])

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#02332f] via-[#024a3f] to-[#02332f] flex items-center justify-center">
        <div className="text-white text-center">
          <Brain className="w-16 h-16 text-[#277f55] mx-auto mb-4 animate-pulse" />
          <p>正在加载结果...</p>
        </div>
      </div>
    )
  }

  const profile = getTypeProfile(result.type)

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

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Result Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 bg-[#277f55]/20 border border-[#277f55]/30 rounded-full px-4 py-2 mb-6">
              <TrendingUp className="w-4 h-4 text-[#277f55]" />
              <span className="text-[#277f55] text-sm font-medium">
                置信度: {result.confidence}%
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">
              {result.type}
            </h1>

            <h2 className="text-2xl md:text-3xl font-semibold text-[#277f55] mb-4">
              {profile.nickname}
            </h2>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              {profile.description}
            </p>

            {/* Share Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button className="bg-[#277f55] hover:bg-[#1f6444] text-white">
                <Share2 className="w-4 h-4 mr-2" />
                分享结果
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" />
                下载报告
              </Button>
              <Link href="/test">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重新测试
                </Button>
              </Link>
            </div>
          </div>

          {/* Dimension Scores */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#277f55]" />
              维度得分
            </h3>

            <div className="space-y-6">
              {/* E/I */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-white font-medium">
                    外向 (E) vs 内向 (I)
                  </span>
                  <span className="text-[#277f55] font-bold">
                    {result.dimensionScores.EI.type} - {result.dimensionScores.EI.percentage}%
                  </span>
                </div>
                <div className="flex gap-0.5 h-3 rounded-full overflow-hidden bg-white/5">
                  <div
                    className="bg-blue-500"
                    style={{ width: `${result.polarityScores.E}%` }}
                  />
                  <div
                    className="bg-purple-500"
                    style={{ width: `${result.polarityScores.I}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>E: {result.polarityScores.E}%</span>
                  <span>I: {result.polarityScores.I}%</span>
                </div>
              </div>

              {/* S/N */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-white font-medium">
                    感觉 (S) vs 直觉 (N)
                  </span>
                  <span className="text-[#277f55] font-bold">
                    {result.dimensionScores.SN.type} - {result.dimensionScores.SN.percentage}%
                  </span>
                </div>
                <div className="flex gap-0.5 h-3 rounded-full overflow-hidden bg-white/5">
                  <div
                    className="bg-yellow-500"
                    style={{ width: `${result.polarityScores.S}%` }}
                  />
                  <div
                    className="bg-green-500"
                    style={{ width: `${result.polarityScores.N}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>S: {result.polarityScores.S}%</span>
                  <span>N: {result.polarityScores.N}%</span>
                </div>
              </div>

              {/* T/F */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-white font-medium">
                    思考 (T) vs 情感 (F)
                  </span>
                  <span className="text-[#277f55] font-bold">
                    {result.dimensionScores.TF.type} - {result.dimensionScores.TF.percentage}%
                  </span>
                </div>
                <div className="flex gap-0.5 h-3 rounded-full overflow-hidden bg-white/5">
                  <div
                    className="bg-cyan-500"
                    style={{ width: `${result.polarityScores.T}%` }}
                  />
                  <div
                    className="bg-pink-500"
                    style={{ width: `${result.polarityScores.F}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>T: {result.polarityScores.T}%</span>
                  <span>F: {result.polarityScores.F}%</span>
                </div>
              </div>

              {/* J/P */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-white font-medium">
                    判断 (J) vs 感知 (P)
                  </span>
                  <span className="text-[#277f55] font-bold">
                    {result.dimensionScores.JP.type} - {result.dimensionScores.JP.percentage}%
                  </span>
                </div>
                <div className="flex gap-0.5 h-3 rounded-full overflow-hidden bg-white/5">
                  <div
                    className="bg-orange-500"
                    style={{ width: `${result.polarityScores.J}%` }}
                  />
                  <div
                    className="bg-teal-500"
                    style={{ width: `${result.polarityScores.P}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>J: {result.polarityScores.J}%</span>
                  <span>P: {result.polarityScores.P}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                优势特质
              </h3>
              <ul className="space-y-2">
                {profile.strengths.map((strength, index) => (
                  <li key={index} className="text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                需要注意
              </h3>
              <ul className="space-y-2">
                {profile.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-gray-300 flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">!</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Career Suggestions */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-[#277f55]" />
              适合职业
            </h3>
            <div className="flex flex-wrap gap-3">
              {profile.careers.map((career, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-300 text-sm"
                >
                  {career}
                </span>
              ))}
            </div>
          </div>

          {/* Relationships */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#277f55]" />
              人际关系
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {profile.relationships}
            </p>
          </div>

          {/* Famous People */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-[#277f55]" />
              同类型名人
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profile.famous.map((person, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl text-center"
                >
                  <span className="text-gray-300">{person}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-8">
            <Link href="/">
              <Button
                size="lg"
                className="bg-[#277f55] hover:bg-[#1f6444] text-white"
              >
                返回首页
              </Button>
            </Link>
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
