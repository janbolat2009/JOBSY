import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null


export async function generateQuestionsWithAI(job) {
  const prompt = `Ты опытный HR-специалист. Создай 5 вопросов для интервью на позицию "${job.title}".

Требования к вакансии:
${job.description}

Требуемые навыки: ${job.job_skills?.map(s => s.skill_name).join(', ')}

Создай 5 вопросов в следующих категориях:
1. Технические навыки
2. Проблемы и решения
3. Командная работа
4. Архитектура/Проектирование
5. Мотивация и карьерные цели

Верни ТОЛЬКО JSON массив в формате:
[
  {
    "id": 1,
    "category": "Технические навыки",
    "text": "вопрос здесь",
    "expectedKeywords": ["ключевое", "слово"],
    "weight": 0.3
  }
]`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Ты опытный HR-специалист. Всегда отвечай ТОЛЬКО валидным JSON без дополнительного текста.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    const content = response.choices[0].message.content
    const jsonMatch = content.match(/\[[\s\S]*\]/)

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return generateFallbackQuestions(job)
  } catch (error) {
    console.error('OpenAI error:', error)
    return generateFallbackQuestions(job)
  }
}

export async function evaluateAnswerWithAI(question, answer) {
  const prompt = `Оцени ответ кандидата на вопрос интервью.

Вопрос: ${question.text}
Категория: ${question.category}

Ответ кандидата: ${answer}

Оцени ответ по шкале от 0 до 100, учитывая:
- Полноту ответа
- Релевантность
- Конкретность примеров
- Структуру мысли

Верни ТОЛЬКО JSON:
{
  "score": 85,
  "quality": "excellent",
  "feedback": "краткий фидбек"
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Ты опытный HR-специалист, оценивающий ответы кандидатов. Всегда отвечай ТОЛЬКО валидным JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    })

    const content = response.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return evaluateFallback(question, answer)
  } catch (error) {
    console.error('OpenAI error:', error)
    return evaluateFallback(question, answer)
  }
}

export async function generateFeedbackWithAI(answers, jobTitle) {
  const answersText = answers.map((a, i) =>
    `Вопрос ${i + 1} (${a.category}): Score ${a.score}%`
  ).join('\n')

  const prompt = `Ты HR-специалист. Проанализируй результаты интервью кандидата на позицию "${jobTitle}".

Результаты ответов:
${answersText}

Создай итоговый фидбек в JSON формате:
{
  "totalScore": 85,
  "technicalScore": 90,
  "softSkillsScore": 80,
  "communicationScore": 85,
  "summary": "краткое резюме 2-3 предложения",
  "strengths": "сильные стороны",
  "weaknesses": "области для развития",
  "recommendation": "рекомендация (approve/review/reject) с обоснованием"
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Ты опытный HR-специалист. Всегда отвечай ТОЛЬКО валидным JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 800
    })

    const content = response.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return generateFallbackFeedback(answers)
  } catch (error) {
    console.error('OpenAI error:', error)
    return generateFallbackFeedback(answers)
  }
}

function generateFallbackQuestions(job) {
  const skills = job.job_skills?.map(s => s.skill_name) || []
  const title = job.title

  return [
    {
      id: 1,
      category: 'Технические навыки',
      text: `Расскажите о вашем опыте работы с ${skills[0] || 'основными технологиями'}. Какие проекты вы разрабатывали?`,
      expectedKeywords: skills.slice(0, 3),
      weight: 0.3
    },
    {
      id: 2,
      category: 'Проблемы и решения',
      text: 'Опишите самую сложную техническую проблему, с которой вы столкнулись. Как вы её решили?',
      expectedKeywords: ['проблема', 'решение', 'анализ'],
      weight: 0.25
    },
    {
      id: 3,
      category: 'Командная работа',
      text: 'Расскажите о ситуации, когда вам пришлось работать в команде над сложным проектом.',
      expectedKeywords: ['команда', 'коммуникация', 'роль'],
      weight: 0.2
    },
    {
      id: 4,
      category: 'Архитектура',
      text: `Как бы вы спроектировали систему для позиции ${title}? Какие технологии использовали бы?`,
      expectedKeywords: ['архитектура', 'паттерн', 'проектирование'],
      weight: 0.15
    },
    {
      id: 5,
      category: 'Мотивация',
      text: `Почему вы заинтересованы в позиции ${title}? Какие ваши карьерные цели?`,
      expectedKeywords: ['развитие', 'цель', 'интерес'],
      weight: 0.1
    }
  ]
}

function evaluateFallback(question, answer) {
  const answerLower = answer.toLowerCase()
  const keywords = question.expectedKeywords || []

  let keywordScore = 0
  keywords.forEach(keyword => {
    if (answerLower.includes(keyword.toLowerCase())) {
      keywordScore += 1
    }
  })

  const keywordPercentage = keywords.length > 0 ? (keywordScore / keywords.length) * 100 : 50
  const lengthScore = answer.length >= 150 ? 100 : (answer.length / 150) * 100

  const totalScore = (keywordPercentage * 0.6 + lengthScore * 0.4)

  return {
    score: Math.round(totalScore),
    quality: totalScore >= 80 ? 'excellent' : totalScore >= 60 ? 'good' : 'needs improvement',
    feedback: totalScore >= 80 ? 'Отличный ответ' : 'Хороший ответ, можно добавить деталей'
  }
}

function generateFallbackFeedback(answers) {
  let totalScore = 0
  let technicalScore = 0
  let softSkillsScore = 0
  let communicationScore = 0
  let techCount = 0
  let softCount = 0
  let commCount = 0

  answers.forEach(answer => {
    totalScore += answer.score || 0

    if (answer.category?.includes('Технические') || answer.category?.includes('Архитектура')) {
      technicalScore += answer.score || 0
      techCount++
    } else if (answer.category?.includes('Команд')) {
      softSkillsScore += answer.score || 0
      softCount++
    } else {
      communicationScore += answer.score || 0
      commCount++
    }
  })

  const avgScore = answers.length > 0 ? totalScore / answers.length : 0

  return {
    totalScore: Math.round(avgScore),
    technicalScore: Math.round(techCount > 0 ? technicalScore / techCount : avgScore),
    softSkillsScore: Math.round(softCount > 0 ? softSkillsScore / softCount : avgScore),
    communicationScore: Math.round(commCount > 0 ? communicationScore / commCount : avgScore),
    summary: `Кандидат показал ${avgScore >= 75 ? 'отличные' : avgScore >= 60 ? 'хорошие' : 'средние'} результаты в интервью.`,
    strengths: 'Четкая структура ответов, хорошее понимание технологий',
    weaknesses: 'Можно больше конкретных примеров из практики',
    recommendation: avgScore >= 75 ? 'Рекомендую к найму' : avgScore >= 60 ? 'Требует дополнительного рассмотрения' : 'Не рекомендую'
  }
}