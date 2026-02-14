import express from 'express'
import OpenAI from 'openai'
import axios from 'axios'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

const router = express.Router()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: 'org-твой-org-id',     // ← добавь
  project: 'proj_твой-project-id'      // ← обязательно!
});

router.post('/analyze-resume', async (req, res) => {
  try {
    const { resume_text, resume_url, target_job, experience_years } = req.body

    if (!resume_text && !resume_url) {
      return res.status(400).json({ error: 'resume_text or resume_url is required' })
    }

    let fullResumeText = resume_text || ''

    if (resume_url && !resume_text) {
      try {
        const response = await axios.get(resume_url, {
          responseType: 'arraybuffer',
          timeout: 30000,
          maxContentLength: 10 * 1024 * 1024
        })
        const buffer = Buffer.from(response.data)

        if (resume_url.toLowerCase().endsWith('.pdf')) {
          const pdfData = await pdfParse(buffer)
          fullResumeText = pdfData.text
        } else {
          fullResumeText = buffer.toString('utf-8')
        }
      } catch (axiosError) {
        console.error('Axios error:', axiosError.message)
        return res.status(400).json({ error: 'Не удалось загрузить файл. Попробуйте вставить текст напрямую.' })
      }
    }

    if (!fullResumeText.trim()) {
      return res.status(400).json({ error: 'Could not extract text from resume' })
    }

    const prompt = `Ты профессиональный HR-аналитик. Проанализируй резюме кандидата максимально объективно и подробно.
Резюме:
"${fullResumeText}"

Если указана вакансия: "${target_job || 'Вакансия не указана'}"
Опыт работы: ${experience_years || 0} лет

Верни ТОЛЬКО валидный JSON без markdown, комментариев и лишнего текста:
{
  "strengths": "Список сильных сторон (каждый пункт с новой строки)",
  "weaknesses": "Список слабых сторон (каждый пункт с новой строки)",
  "recommendations": "Конкретные рекомендации по улучшению (каждый пункт с новой строки)",
  "overall_score": 85,
  "match_score": 78
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Ты эксперт по анализу резюме. Отвечай только валидным JSON в указанном формате. Никаких других слов.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 800
    })

    const content = completion.choices[0].message.content.trim()
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to parse AI response' })
    }

    const analysis = JSON.parse(jsonMatch[0])

    const { application_id } = req.body
    if (application_id) {
      await req.supabase
        .from('resume_analyses')
        .upsert({
          application_id,
          analysis: JSON.stringify(analysis),
          overall_score: analysis.overall_score || 0,
          match_score: analysis.match_score || 0
        }, { onConflict: 'application_id' })
    }

    res.json({ analysis })
  } catch (error) {
    console.error('Resume analysis error:', error)
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
})

router.get('/application/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params

    const { data, error } = await req.supabase
      .from('resume_analyses')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    res.json({ analysis: data || null })
  } catch (error) {
    console.error('Get analysis error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router