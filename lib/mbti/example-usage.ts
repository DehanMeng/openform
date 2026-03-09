/**
 * MBTI 计算引擎使用示例
 * 演示如何使用 calculator 和相关工具函数
 */

import {
  calculateMBTIResult,
  calculateDimensionScores,
  determineMBTIType,
  calculateConfidence,
  calculateTypeSimilarity,
  getCompatibleTypes
} from './calculator'
import { sampleQuestions } from './sample-questions'
import { AnswerValue, MBTIResult } from './types'

/**
 * 示例1: 完整测试流程
 */
export function exampleFullTest() {
  console.log('=== MBTI 完整测试示例 ===\n')

  // 模拟用户答案 (12道题)
  const mockAnswers: Record<string, AnswerValue> = {
    // E/I 维度: 倾向I (内向)
    'ei-001': 2, // 社交聚会 - 不太喜欢
    'ei-002': 6, // 安静思考 - 比较同意
    'ei-003': 3, // 交谈充电 - 略微不同意

    // S/N 维度: 倾向N (直觉)
    'sn-001': 3, // 关注细节 - 略微不同意
    'sn-002': 6, // 未来可能 - 比较同意
    'sn-003': 2, // 已验证方法 - 比较不同意

    // T/F 维度: 倾向T (思考)
    'tf-001': 6, // 逻辑分析 - 比较同意
    'tf-002': 4, // 情感影响 - 中立
    'tf-003': 5, // 客观批评 - 略微同意

    // J/P 维度: 倾向P (感知)
    'jp-001': 3, // 提前计划 - 略微不同意
    'jp-002': 6, // 灵活应变 - 比较同意
    'jp-003': 2  // 早完成 - 比较不同意
  }

  // 计算结果
  const result = calculateMBTIResult(
    sampleQuestions,
    mockAnswers,
    'demo',
    'user-123'
  )

  // 打印结果
  console.log('测试结果:')
  console.log(`人格类型: ${result.type}`)
  console.log(`置信度: ${result.confidence}%`)
  console.log('\n维度得分:')
  console.log(`E/I: ${result.dimensionScores.EI.type} (${result.dimensionScores.EI.percentage}%)`)
  console.log(`S/N: ${result.dimensionScores.SN.type} (${result.dimensionScores.SN.percentage}%)`)
  console.log(`T/F: ${result.dimensionScores.TF.type} (${result.dimensionScores.TF.percentage}%)`)
  console.log(`J/P: ${result.dimensionScores.JP.type} (${result.dimensionScores.JP.percentage}%)`)

  console.log('\n极性分数:')
  console.log(`外向(E): ${result.polarityScores.E}% | 内向(I): ${result.polarityScores.I}%`)
  console.log(`感觉(S): ${result.polarityScores.S}% | 直觉(N): ${result.polarityScores.N}%`)
  console.log(`思考(T): ${result.polarityScores.T}% | 情感(F): ${result.polarityScores.F}%`)
  console.log(`判断(J): ${result.polarityScores.J}% | 感知(P): ${result.polarityScores.P}%`)

  return result
}

/**
 * 示例2: 计算两个类型的相似度
 */
export function exampleTypeSimilarity() {
  console.log('\n=== 人格类型相似度计算 ===\n')

  const type1 = 'INTJ'
  const type2 = 'INTP'

  const similarity = calculateTypeSimilarity(type1, type2)
  console.log(`${type1} 和 ${type2} 的相似度: ${similarity}%`)
  // 输出: 75% (4个字母中有3个相同)

  const type3 = 'ESFP'
  const similarity2 = calculateTypeSimilarity(type1, type3)
  console.log(`${type1} 和 ${type3} 的相似度: ${similarity2}%`)
  // 输出: 0% (完全相反)
}

/**
 * 示例3: 获取兼容类型
 */
export function exampleCompatibleTypes() {
  console.log('\n=== 兼容人格类型推荐 ===\n')

  const myType = 'INTJ'
  const compatible = getCompatibleTypes(myType)

  console.log(`${myType} 的兼容类型:`)
  compatible.forEach(type => {
    console.log(`- ${type}`)
  })
}

/**
 * 示例4: 仅计算维度得分 (不生成完整结果)
 */
export function exampleDimensionScoresOnly() {
  console.log('\n=== 单独计算维度得分 ===\n')

  const mockAnswers: Record<string, AnswerValue> = {
    'ei-001': 5,
    'ei-002': 5,
    'ei-003': 5,
    'sn-001': 3,
    'sn-002': 7,
    'sn-003': 2,
    'tf-001': 6,
    'tf-002': 4,
    'tf-003': 6,
    'jp-001': 6,
    'jp-002': 3,
    'jp-003': 7
  }

  const { dimensionScores, polarityScores } = calculateDimensionScores(
    sampleQuestions,
    mockAnswers
  )

  console.log('维度得分:', dimensionScores)
  console.log('极性分数:', polarityScores)

  const type = determineMBTIType(dimensionScores)
  console.log(`最终类型: ${type}`)

  const confidence = calculateConfidence(dimensionScores)
  console.log(`置信度: ${confidence}%`)
}

/**
 * 示例5: 处理边界情况
 */
export function exampleEdgeCases() {
  console.log('\n=== 边界情况处理 ===\n')

  // 情况1: 所有答案都是中立(4)
  console.log('情况1: 所有答案中立')
  const neutralAnswers: Record<string, AnswerValue> = {}
  sampleQuestions.forEach(q => {
    neutralAnswers[q.id] = 4
  })

  const result1 = calculateMBTIResult(sampleQuestions, neutralAnswers, 'demo')
  console.log(`类型: ${result1.type}`)
  console.log(`置信度: ${result1.confidence}%`) // 应该很低
  console.log()

  // 情况2: 极端倾向 (所有答案都是1或7)
  console.log('情况2: 极端倾向')
  const extremeAnswers: Record<string, AnswerValue> = {
    'ei-001': 7, 'ei-002': 1, 'ei-003': 7, // 强烈E
    'sn-001': 1, 'sn-002': 7, 'sn-003': 1, // 强烈N
    'tf-001': 7, 'tf-002': 1, 'tf-003': 7, // 强烈T
    'jp-001': 1, 'jp-002': 7, 'jp-003': 1  // 强烈P
  }

  const result2 = calculateMBTIResult(sampleQuestions, extremeAnswers, 'demo')
  console.log(`类型: ${result2.type}`)
  console.log(`置信度: ${result2.confidence}%`) // 应该很高
  console.log()

  // 情况3: 部分问题未回答
  console.log('情况3: 部分问题未回答')
  const partialAnswers: Record<string, AnswerValue> = {
    'ei-001': 6,
    'sn-002': 5,
    'tf-001': 4,
    'jp-002': 3
    // 其他问题未回答
  }

  const result3 = calculateMBTIResult(sampleQuestions, partialAnswers, 'demo')
  console.log(`类型: ${result3.type}`)
  console.log(`置信度: ${result3.confidence}%`)
  console.log('注意: 未回答的问题不参与计算')
}

/**
 * 示例6: 结果序列化 (存入数据库)
 */
export function exampleResultSerialization() {
  console.log('\n=== 结果序列化示例 ===\n')

  const mockAnswers: Record<string, AnswerValue> = {
    'ei-001': 2, 'ei-002': 6, 'ei-003': 3,
    'sn-001': 3, 'sn-002': 6, 'sn-003': 2,
    'tf-001': 6, 'tf-002': 4, 'tf-003': 5,
    'jp-001': 3, 'jp-002': 6, 'jp-003': 2
  }

  const result = calculateMBTIResult(sampleQuestions, mockAnswers, 'full', 'user-456')

  // 准备插入数据库的数据
  const dbInsertData = {
    user_id: result.userId,
    mbti_type: result.type,
    dimension_scores: result.dimensionScores,
    polarity_scores: result.polarityScores,
    extended_dimensions: result.extendedDimensions || {},
    answers: result.answers,
    test_version: result.testVersion,
    confidence: result.confidence,
    completed_at: result.createdAt.toISOString()
  }

  console.log('数据库插入数据:')
  console.log(JSON.stringify(dbInsertData, null, 2))
}

/**
 * 运行所有示例
 */
export function runAllExamples() {
  exampleFullTest()
  exampleTypeSimilarity()
  exampleCompatibleTypes()
  exampleDimensionScoresOnly()
  exampleEdgeCases()
  exampleResultSerialization()
}

// 如果直接运行此文件
if (require.main === module) {
  runAllExamples()
}
