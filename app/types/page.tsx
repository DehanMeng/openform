import Link from 'next/link'
import { Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { typeProfiles } from '@/lib/mbti/type-profiles'
import { PERSONALITY_GROUPS } from '@/lib/mbti/types'

export default function TypesPage() {
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
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              16 种人格类型
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              每个人都属于16种人格类型中的一种，了解你的类型，发现真实的自己
            </p>
          </div>

          {/* Groups */}
          {Object.entries(PERSONALITY_GROUPS).map(([groupKey, group]) => (
            <div key={groupKey} className="mb-12">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {group.name}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {group.types.map((type) => {
                  const profile = typeProfiles[type]
                  return (
                    <div
                      key={type}
                      className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 transition group"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-2xl"
                        style={{ backgroundColor: `${profile.color}20`, color: profile.color }}
                      >
                        {profile.icon_emoji}
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-2">
                        {type}
                      </h3>

                      <p className="text-[#277f55] font-semibold mb-3">
                        {profile.nickname}
                      </p>

                      <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                        {profile.description.substring(0, 150)}...
                      </p>

                      <div className="pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-400">
                          {profile.category} 分组
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* CTA */}
          <div className="text-center mt-16">
            <Link href="/test">
              <Button
                size="lg"
                className="bg-[#277f55] hover:bg-[#1f6444] text-white h-14 px-8"
              >
                <Brain className="w-5 h-5 mr-2" />
                开始测试，发现你的类型
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
