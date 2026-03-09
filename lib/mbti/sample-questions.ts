/**
 * MBTI 样例问题库
 * 这是一个演示用的小型问题集,实际应用需要完整的93题标准版
 */

import { MBTIQuestion } from './types'

/**
 * 演示问题集 (每个维度3题,共12题)
 * 生产环境需要扩展到93题或更多
 */
export const sampleQuestions: MBTIQuestion[] = [
  // ========== E/I 维度 (外向 vs 内向) ==========
  {
    id: 'ei-001',
    text: '在社交聚会上,我通常会:',
    dimension: 'EI',
    pole: 'left', // E倾向
    category: 'behavioral',
    reverse: false
  },
  {
    id: 'ei-002',
    text: '我更喜欢在安静的环境中独自思考',
    dimension: 'EI',
    pole: 'right', // I倾向
    category: 'preference',
    reverse: false
  },
  {
    id: 'ei-003',
    text: '与人交谈能让我感到精力充沛',
    dimension: 'EI',
    pole: 'left', // E倾向
    category: 'behavioral',
    reverse: false
  },

  // ========== S/N 维度 (感觉 vs 直觉) ==========
  {
    id: 'sn-001',
    text: '我更关注实际存在的事实和细节',
    dimension: 'SN',
    pole: 'left', // S倾向
    category: 'preference',
    reverse: false
  },
  {
    id: 'sn-002',
    text: '我喜欢思考未来的可能性和潜在意义',
    dimension: 'SN',
    pole: 'right', // N倾向
    category: 'preference',
    reverse: false
  },
  {
    id: 'sn-003',
    text: '在解决问题时,我倾向于使用已验证的方法',
    dimension: 'SN',
    pole: 'left', // S倾向
    category: 'situational',
    reverse: false
  },

  // ========== T/F 维度 (思考 vs 情感) ==========
  {
    id: 'tf-001',
    text: '做决定时,我主要依靠逻辑分析',
    dimension: 'TF',
    pole: 'left', // T倾向
    category: 'preference',
    reverse: false
  },
  {
    id: 'tf-002',
    text: '我在意决策对他人情感的影响',
    dimension: 'TF',
    pole: 'right', // F倾向
    category: 'preference',
    reverse: false
  },
  {
    id: 'tf-003',
    text: '批评他人时,我能做到客观公正而不顾虑感受',
    dimension: 'TF',
    pole: 'left', // T倾向
    category: 'situational',
    reverse: false
  },

  // ========== J/P 维度 (判断 vs 感知) ==========
  {
    id: 'jp-001',
    text: '我喜欢提前计划并按计划行事',
    dimension: 'JP',
    pole: 'left', // J倾向
    category: 'preference',
    reverse: false
  },
  {
    id: 'jp-002',
    text: '我喜欢保持选择的开放性,灵活应变',
    dimension: 'JP',
    pole: 'right', // P倾向
    category: 'preference',
    reverse: false
  },
  {
    id: 'jp-003',
    text: '截止日期临近时,我通常早已完成任务',
    dimension: 'JP',
    pole: 'left', // J倾向
    category: 'behavioral',
    reverse: false
  }
]

/**
 * 问题选项标签配置 (1-7量表)
 */
export const scaleLabels = {
  1: '完全不同意',
  2: '比较不同意',
  3: '略微不同意',
  4: '中立',
  5: '略微同意',
  6: '比较同意',
  7: '完全同意'
}

/**
 * 获取指定维度的问题
 */
export function getQuestionsByDimension(dimension: 'EI' | 'SN' | 'TF' | 'JP') {
  return sampleQuestions.filter(q => q.dimension === dimension)
}

/**
 * 随机打乱问题顺序 (避免答题模式)
 */
export function shuffleQuestions(questions: MBTIQuestion[]): MBTIQuestion[] {
  const shuffled = [...questions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * 生成完整问题集的模板 (供数据库种子文件使用)
 */
export function generateQuestionTemplate() {
  return {
    EI: {
      description: '外向(Extraversion) vs 内向(Introversion)',
      count: 23,
      examples: [
        '你更喜欢在团队中工作还是独自工作?',
        '社交活动后,你感到精力充沛还是疲惫?',
        '你倾向于先思考再行动,还是先行动再思考?'
      ]
    },
    SN: {
      description: '感觉(Sensing) vs 直觉(iNtuition)',
      count: 24,
      examples: [
        '你更关注当下的现实还是未来的可能?',
        '你喜欢遵循传统方法还是尝试新方法?',
        '你更擅长记住细节还是把握整体?'
      ]
    },
    TF: {
      description: '思考(Thinking) vs 情感(Feeling)',
      count: 23,
      examples: [
        '做决定时,你更看重公平还是和谐?',
        '你更容易被逻辑说服还是被情感打动?',
        '批评他人时,你能做到客观直接吗?'
      ]
    },
    JP: {
      description: '判断(Judging) vs 感知(Perceiving)',
      count: 23,
      examples: [
        '你喜欢明确的计划还是灵活的安排?',
        '你倾向于早完成任务还是临近截止才动手?',
        '你更喜欢有条理的生活还是随性的生活?'
      ]
    }
  }
}
