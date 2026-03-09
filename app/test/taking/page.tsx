'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown, Check, ArrowRight, Brain } from 'lucide-react'
import { sampleQuestions } from '@/lib/mbti/sample-questions'
import { calculateMBTIResult } from '@/lib/mbti/calculator'
import { AnswerValue } from '@/lib/mbti/types'

const SCALE_LABELS = [
  { value: 1, label: '完全不同意' },
  { value: 2, label: '比较不同意' },
  { value: 3, label: '略微不同意' },
  { value: 4, label: '中立' },
  { value: 5, label: '略微同意' },
  { value: 6, label: '比较同意' },
  { value: 7, label: '完全同意' }
]

function TakingTestContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const version = searchParams.get('version') || 'full'

  // 使用样例问题（实际应从数据库加载）
  const questions = sampleQuestions
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [direction, setDirection] = useState(0)
  const [startTime] = useState(new Date())

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const isFirstQuestion = currentIndex === 0
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0
  const currentAnswer = answers[currentQuestion.id]

  const goToNext = useCallback(() => {
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setDirection(1)
      setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1))
    }
  }, [isLastQuestion, questions.length])

  const goToPrevious = useCallback(() => {
    if (!isFirstQuestion) {
      setDirection(-1)
      setCurrentIndex(prev => Math.max(prev - 1, 0))
    }
  }, [isFirstQuestion])

  const handleAnswerSelect = (value: AnswerValue) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))
    // 自动跳转到下一题
    setTimeout(() => {
      goToNext()
    }, 300)
  }

  const handleSubmit = () => {
    // 计算结果
    const endTime = new Date()
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)

    const result = calculateMBTIResult(questions, answers, version)

    // 保存到 localStorage（实际应保存到数据库）
    const resultData = {
      ...result,
      duration_seconds: durationSeconds,
      completed_at: endTime.toISOString()
    }

    localStorage.setItem('mbti_latest_result', JSON.stringify(resultData))

    // 跳转到结果页
    router.push(`/test/result/${result.id}`)
  }

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        goToPrevious()
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        goToNext()
      }
      // 数字键 1-7 快速选择
      const num = parseInt(e.key)
      if (num >= 1 && num <= 7) {
        handleAnswerSelect(num as AnswerValue)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentQuestion, goToNext, goToPrevious])

  // 滚轮导航
  useEffect(() => {
    let lastScrollTime = 0
    const scrollThreshold = 500

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now()
      if (now - lastScrollTime < scrollThreshold) return

      if (Math.abs(e.deltaY) < 50) return

      if (e.deltaY > 0) {
        goToNext()
      } else {
        goToPrevious()
      }

      lastScrollTime = now
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [goToNext, goToPrevious])

  const slideVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      y: direction > 0 ? -100 : 100,
      opacity: 0,
    }),
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#02332f] via-[#024a3f] to-[#02332f]">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress
          value={progress}
          className="h-1 rounded-none bg-white/10"
          indicatorStyle={{
            backgroundColor: '#277f55',
          }}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6 pt-12">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Question number */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 flex items-center gap-2"
              >
                <span className="text-base font-medium text-[#277f55]">
                  {currentIndex + 1} / {questions.length}
                </span>
                <ArrowRight className="w-4 h-4 text-[#277f55]" />
              </motion.div>

              {/* Question */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-white"
              >
                {currentQuestion.text}
              </motion.h2>

              {/* Scale Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-3 mb-8"
              >
                {SCALE_LABELS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswerSelect(option.value as AnswerValue)}
                    className={`
                      w-full p-4 rounded-xl border-2 transition-all text-left
                      ${
                        currentAnswer === option.value
                          ? 'bg-[#277f55] border-[#277f55] text-white shadow-lg shadow-[#277f55]/20'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono opacity-60">{option.value}</span>
                        <span className="font-medium">{option.label}</span>
                      </div>
                      {currentAnswer === option.value && (
                        <Check className="w-5 h-5" />
                      )}
                    </div>
                  </button>
                ))}
              </motion.div>

              {/* Hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <span className="text-sm text-gray-400">
                  使用 <kbd className="px-2 py-1 bg-white/10 rounded text-xs">1-7</kbd> 键快速选择 ·
                  <kbd className="px-2 py-1 bg-white/10 rounded text-xs mx-1">↑↓</kbd> 切换题目
                </span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
            disabled={isFirstQuestion}
            className="h-10 w-10 p-0 text-white hover:bg-white/10"
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            className="h-10 w-10 p-0 text-white hover:bg-white/10"
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Brain className="w-4 h-4" />
          <span>16型人格测试</span>
        </div>
      </footer>
    </div>
  )
}

export default function TakingTestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#02332f] via-[#024a3f] to-[#02332f] flex items-center justify-center">
        <div className="text-white text-lg">加载中...</div>
      </div>
    }>
      <TakingTestContent />
    </Suspense>
  )
}
