/**
 * MBTI 人格测试类型定义
 */

// MBTI 四个维度
export type MBTIDimension = 'EI' | 'SN' | 'TF' | 'JP'

// 维度极性
export type DimensionPolarity = {
  E: number // 外向分数 (0-100)
  I: number // 内向分数 (0-100)
  S: number // 感觉分数 (0-100)
  N: number // 直觉分数 (0-100)
  T: number // 思考分数 (0-100)
  F: number // 情感分数 (0-100)
  J: number // 判断分数 (0-100)
  P: number // 感知分数 (0-100)
}

// 16种MBTI人格类型
export type MBTIType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP' // NT 理性者
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP' // NF 理想主义者
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ' // SJ 守护者
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP' // SP 艺术家

// 扩展维度 (可选)
export type ExtendedDimensions = {
  AO?: number // Assertive(果断) vs Observant(纠结) -100 to 100
  HC?: number // High-cold(高冷) vs Warm(温暖) -100 to 100
}

// MBTI测试问题
export interface MBTIQuestion {
  id: string
  text: string
  dimension: MBTIDimension
  pole: 'left' | 'right' // left: E/S/T/J, right: I/N/F/P
  category?: 'behavioral' | 'preference' | 'situational'
  reverse?: boolean // 是否反向计分
}

// 用户答案 (1-7量表)
export type AnswerValue = 1 | 2 | 3 | 4 | 5 | 6 | 7

// 测试会话
export interface TestSession {
  questionIds: string[]
  answers: Record<string, AnswerValue>
  startedAt: Date
  completedAt?: Date
}

// 维度得分结果
export interface DimensionScores {
  EI: { score: number; type: 'E' | 'I'; percentage: number }
  SN: { score: number; type: 'S' | 'N'; percentage: number }
  TF: { score: number; type: 'T' | 'F'; percentage: number }
  JP: { score: number; type: 'J' | 'P'; percentage: number }
}

// 完整测试结果
export interface MBTIResult {
  id: string
  userId?: string // 可选，支持匿名测试
  type: MBTIType
  dimensionScores: DimensionScores
  polarityScores: DimensionPolarity
  extendedDimensions?: ExtendedDimensions
  answers: Record<string, AnswerValue>
  testVersion: string // 'full' | 'quick'
  createdAt: Date
  confidence: number // 结果置信度 0-100
}

// 人格类型详细信息
export interface TypeProfile {
  type: MBTIType
  nickname: string // 建筑师、逻辑学家等
  category: 'NT' | 'NF' | 'SJ' | 'SP'
  description: string
  strengths: string[]
  weaknesses: string[]
  careers: string[]
  relationships: string
  famous: string[] // 名人代表
  color: string // 主题色
}

// 维度常量
export const DIMENSIONS: Record<MBTIDimension, { left: string; right: string; description: string }> = {
  EI: {
    left: 'E',
    right: 'I',
    description: '外向(Extraversion) vs 内向(Introversion)'
  },
  SN: {
    left: 'S',
    right: 'N',
    description: '感觉(Sensing) vs 直觉(iNtuition)'
  },
  TF: {
    left: 'T',
    right: 'F',
    description: '思考(Thinking) vs 情感(Feeling)'
  },
  JP: {
    left: 'J',
    right: 'P',
    description: '判断(Judging) vs 感知(Perceiving)'
  }
}

// 人格分组
export const PERSONALITY_GROUPS = {
  NT: { name: '理性者', types: ['INTJ', 'INTP', 'ENTJ', 'ENTP'] as MBTIType[] },
  NF: { name: '理想主义者', types: ['INFJ', 'INFP', 'ENFJ', 'ENFP'] as MBTIType[] },
  SJ: { name: '守护者', types: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'] as MBTIType[] },
  SP: { name: '艺术家', types: ['ISTP', 'ISFP', 'ESTP', 'ESFP'] as MBTIType[] }
}
