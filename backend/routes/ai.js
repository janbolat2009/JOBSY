import express from 'express'
import {
  generateQuestionsWithAI as generateQuestions,
  evaluateAnswerWithAI as evaluateAnswer,
  generateFeedbackWithAI as generateFeedback
} from '../services/ai-interview.js'

const router = express.Router()

// Максимально простая функция для ИИ
async function generateJobWithGemini(brief) {
  const key = process.env.GEMINI_API_KEY
  if (!key) return generateLocalFallback(brief)

  try {
    // Используем v1beta и 1.5-flash (он самый быстрый и дешевый/бесплатный)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Напиши описание вакансии в JSON по брифу: "${brief}". 
            Верни ТОЛЬКО JSON объект: 
            {"title": "название", "description": "краткое описание с html", "skills": ["скилл1"], "experience_years": 2}`
          }]
        }]
      })
    })

    const data = await response.json()

    if (!response.ok || !data.candidates) {
      console.warn('Gemini API return error, using fallback')
      return generateLocalFallback(brief)
    }

    const text = data.candidates[0].content.parts[0].text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : generateLocalFallback(brief)

  } catch (e) {
    console.error('AI Error:', e)
    return generateLocalFallback(brief)
  }
}

// Запасной вариант, если ИИ недоступен или лимиты исчерпаны
function generateLocalFallback(brief) {
  return {
    title: brief.split(',')[0] || 'Новая вакансия',
    description: `<h3>Описание вакансии</h3><p>Требуется специалист: ${brief}</p><ul><li>Опыт работы обязателен</li><li>Локация: Астана или удаленно</li></ul>`,
    skills: ["Общие навыки"],
    experience_years: 2,
    city: 'Астана'
  }
}

// Эндпоинт для фронтенда
router.post('/generate-job-desc', async (req, res) => {
  try {
    const { brief } = req.body
    if (!brief) return res.status(400).json({ error: 'Brief is required' })
    const result = await generateJobWithGemini(brief)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Старые роуты для интервью (оставляем без изменений)
router.post('/generate-questions', async (req, res) => {
  const { jobId } = req.body
  const { data: job } = await req.supabase.from('jobs').select('*, job_skills(*)').eq('id', jobId).single()
  const questions = await generateQuestions(job)
  res.json({ questions })
})

router.post('/evaluate-answer', async (req, res) => {
  const { question, answer } = req.body
  const evaluation = await evaluateAnswer(question, answer)
  res.json(evaluation)
})

router.post('/complete-interview', async (req, res) => {
  const { interviewId, answers } = req.body
  const feedback = await generateFeedback(answers)
  await req.supabase.from('interviews').update({ ...feedback, status: 'completed' }).eq('id', interviewId)
  res.json({ feedback })
})

export default router