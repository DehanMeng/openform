/**
 * MBTI 计算引擎
 *
 * 核心算法:
 * 1. 每道题采用1-7量表 (1=完全左倾向, 4=中立, 7=完全右倾向)
 * 2. 将答案映射到 -3 到 +3 的分数
 * 3. 累加每个维度的分数,归一化到 0-100%
 * 4. 超过50%的极性被选为该维度的类型
 */

import {
  MBTIQuestion,
  AnswerValue,
  DimensionScores,
  DimensionPolarity,
  MBTIType,
  MBTIResult,
  MBTIDimension
} from './types'

/**
 * 将 1-7 量表答案转换为 -3 到 +3 的分数
 * 1 -> -3 (强烈左倾向)
 * 4 -> 0  (中立)
 * 7 -> +3 (强烈右倾向)
 */
function convertAnswerToScore(answer: AnswerValue): number {
  return answer - 4
}

/**
 * 计算单个维度的得分
 * @param questions 该维度的所有问题
 * @param answers 用户答案
 * @returns 左极性和右极性的原始分数
 */
function calculateDimensionRawScores(
  questions: MBTIQuestion[],
  answers: Record<string, AnswerValue>
): { leftScore: number; rightScore: number } {
  let leftScore = 0
  let rightScore = 0

  for (const question of questions) {
    const answer = answers[question.id]
    if (answer === undefined) continue

    let score = convertAnswerToScore(answer)

    // 处理反向计分题
    if (question.reverse) {
      score = -score
    }

    // 根据题目的极性归类
    if (question.pole === 'left') {
      // 分数为正表示倾向左极性,为负表示倾向右极性
      if (score > 0) {
        leftScore += score
      } else {
        rightScore += Math.abs(score)
      }
    } else {
      // pole === 'right'
      if (score > 0) {
        rightScore += score
      } else {
        leftScore += Math.abs(score)
      }
    }
  }

  return { leftScore, rightScore }
}

/**
 * 将原始分数归一化为百分比 (0-100)
 */
function normalizeScores(leftScore: number, rightScore: number): { left: number; right: number } {
  const total = leftScore + rightScore

  if (total === 0) {
    // 如果都是0,返回50-50
    return { left: 50, right: 50 }
  }

  return {
    left: Math.round((leftScore / total) * 100),
    right: Math.round((rightScore / total) * 100)
  }
}

/**
 * 计算四个维度的得分
 * @param questions 所有问题
 * @param answers 用户答案
 * @returns 维度得分和极性分数
 */
export function calculateDimensionScores(
  questions: MBTIQuestion[],
  answers: Record<string, AnswerValue>
): { dimensionScores: DimensionScores; polarityScores: DimensionPolarity } {
  const dimensions: MBTIDimension[] = ['EI', 'SN', 'TF', 'JP']
  const dimensionScores = {} as DimensionScores
  const polarityScores = {} as DimensionPolarity

  for (const dimension of dimensions) {
    // 筛选该维度的所有问题
    const dimensionQuestions = questions.filter(q => q.dimension === dimension)

    // 计算原始分数
    const { leftScore, rightScore } = calculateDimensionRawScores(dimensionQuestions, answers)

    // 归一化为百分比
    const normalized = normalizeScores(leftScore, rightScore)

    // 确定该维度的类型
    const leftType = dimension[0] as 'E' | 'S' | 'T' | 'J'
    const rightType = dimension[1] as 'I' | 'N' | 'F' | 'P'
    const dominantType = normalized.left >= normalized.right ? leftType : rightType
    const dominantPercentage = Math.max(normalized.left, normalized.right)

    // 计算该维度的总体偏向分数 (-100 to 100)
    // 负数表示左倾向,正数表示右倾向
    const score = normalized.right - normalized.left

    dimensionScores[dimension] = {
      score,
      type: dominantType,
      percentage: dominantPercentage
    }

    // 保存极性分数
    polarityScores[leftType] = normalized.left
    polarityScores[rightType] = normalized.right
  }

  return { dimensionScores, polarityScores }
}

/**
 * 根据维度得分确定 MBTI 类型
 */
export function determineMBTIType(dimensionScores: DimensionScores): MBTIType {
  const type = `${dimensionScores.EI.type}${dimensionScores.SN.type}${dimensionScores.TF.type}${dimensionScores.JP.type}` as MBTIType
  return type
}

/**
 * 计算结果置信度
 * 基于各维度的明确程度 (离50%越远置信度越高)
 */
export function calculateConfidence(dimensionScores: DimensionScores): number {
  const scores = Object.values(dimensionScores)

  // 计算每个维度离50%的距离
  const distances = scores.map(s => Math.abs(s.percentage - 50))

  // 平均距离,归一化到0-100
  const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length

  // 转换为置信度 (50%距离 -> 100%置信度)
  const confidence = Math.round((avgDistance / 50) * 100)

  return Math.min(100, confidence)
}

/**
 * 完整的 MBTI 测试结果计算
 * @param questions 所有测试问题
 * @param answers 用户答案
 * @param userId 用户ID (可选,支持匿名)
 * @param testVersion 测试版本
 * @returns 完整的测试结果
 */
export function calculateMBTIResult(
  questions: MBTIQuestion[],
  answers: Record<string, AnswerValue>,
  testVersion: string = 'full',
  userId?: string
): MBTIResult {
  // 计算维度得分
  const { dimensionScores, polarityScores } = calculateDimensionScores(questions, answers)

  // 确定 MBTI 类型
  const type = determineMBTIType(dimensionScores)

  // 计算置信度
  const confidence = calculateConfidence(dimensionScores)

  return {
    id: crypto.randomUUID(),
    userId,
    type,
    dimensionScores,
    polarityScores,
    answers,
    testVersion,
    createdAt: new Date(),
    confidence
  }
}

/**
 * 计算两个 MBTI 类型的相似度 (0-100)
 * 基于共同字母的数量
 */
export function calculateTypeSimilarity(type1: MBTIType, type2: MBTIType): number {
  let matches = 0
  for (let i = 0; i < 4; i++) {
    if (type1[i] === type2[i]) {
      matches++
    }
  }
  return (matches / 4) * 100
}

/**
 * 获取与给定类型最兼容的类型列表
 * (这是一个简化版本,实际兼容性需要更复杂的逻辑)
 */
export function getCompatibleTypes(type: MBTIType): MBTIType[] {
  // MBTI 兼容性理论: 互补原则
  // 这里提供一个基础实现,实际应用中可以使用更精确的兼容性矩阵

  const typeArray = type.split('') as ('E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P')[]

  // 生成互补类型 (翻转某些维度)
  const complementary: MBTIType[] = []

  // 翻转 E/I 维度
  const flippedEI = `${typeArray[0] === 'E' ? 'I' : 'E'}${typeArray[1]}${typeArray[2]}${typeArray[3]}` as MBTIType
  complementary.push(flippedEI)

  // 翻转 S/N 维度
  const flippedSN = `${typeArray[0]}${typeArray[1] === 'S' ? 'N' : 'S'}${typeArray[2]}${typeArray[3]}` as MBTIType
  complementary.push(flippedSN)

  return complementary.slice(0, 3) // 返回前3个兼容类型
}

/**
 * 示例: 扩展维度计算 (AO - 果断/纠结)
 * 这是一个简化示例,实际实现需要专门的问题
 */
export function calculateAssertiveness(
  answers: Record<string, AnswerValue>,
  aoQuestionIds: string[]
): number {
  let totalScore = 0
  let count = 0

  for (const qid of aoQuestionIds) {
    if (answers[qid] !== undefined) {
      totalScore += convertAnswerToScore(answers[qid])
      count++
    }
  }

  if (count === 0) return 0

  // 归一化到 -100 (纠结) 到 +100 (果断)
  const avgScore = totalScore / count
  return Math.round((avgScore / 3) * 100)
}
