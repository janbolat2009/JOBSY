import express from 'express'
import OpenAI from 'openai'
import supabaseAdmin from '../lib/supabaseAdmin.js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

router.post('/invite', async (req, res) => {
  try {
    const { application_id } = req.body
    if (!application_id) return res.status(400).json({ error: 'application_id required' })

    const { data: application } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        jobs (title, description, requirements, skills),
        candidate_profiles (
          user_id,
          users (name, email)
        )
      `)
      .eq('id', application_id)
      .single()

    if (!application) return res.status(404).json({ error: 'Application not found' })

    const { data: existingInterview } = await supabaseAdmin
      .from('interviews')
      .select('id')
      .eq('application_id', application_id)
      .maybeSingle()

    let interviewId
    if (existingInterview) {
      interviewId = existingInterview.id
    } else {
      console.log('Inserting new interview for application:', application_id)
      const { data: interview, error } = await supabaseAdmin
        .from('interviews')
        .insert({
          application_id,
          status: 'in_progress',
          conversation_history: []
        })
        .select()
        .single()

      if (error) throw error
      interviewId = interview.id
    }

    await supabaseAdmin
      .from('applications')
      .update({ status: 'interview' })
      .eq('id', application_id)

    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: application.candidate_profiles.user_id,
        type: 'interview_invitation',
        title: 'Приглашение на AI-интервью',
        message: `Вы приглашены на AI-интервью по вакансии "${application.jobs.title}"`,
        data: { interview_id: interviewId, application_id },
        read: false
      })

    res.json({
      success: true,
      interview_id: interviewId,
      message: 'Приглашение отправлено кандидату'
    })
  } catch (error) {
    console.error('Invite error:', error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/start', async (req, res) => {
  try {
    const { interview_id } = req.body
    if (!interview_id) return res.status(400).json({ error: 'interview_id required' })

    const { data: interview, error: fetchError } = await supabaseAdmin
      .from('interviews')
      .select('*, applications!inner(*)')
      .eq('id', interview_id)
      .single()

    if (fetchError || !interview) return res.status(404).json({ error: 'Interview not found' })

    const { data: application } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        jobs (title, description, requirements, skills, ai_instructions),
        candidate_profiles (
          users (name)
        )
      `)
      .eq('id', interview.application_id)
      .single()

    if (!application) return res.status(404).json({ error: 'Application not found' })

    await supabaseAdmin
      .from('applications')
      .update({ status: 'interview' })
      .eq('id', interview.application_id)

    await supabaseAdmin
      .from('interviews')
      .update({ status: 'in_progress' })
      .eq('id', interview.id)

    if (interview.conversation_history?.length > 0) {
      const messages = interview.conversation_history.filter(msg => msg.role !== 'system')
      return res.json({
        success: true,
        interview_id: interview.id,
        message: messages.length > 0 ? messages[messages.length - 1].content : 'Продолжим интервью',
        existing: true
      })
    }

    const skillsArr = Array.isArray(application.jobs?.skills)
      ? application.jobs.skills
      : (typeof application.jobs?.skills === 'string' ? application.jobs.skills.split(',').map(s => s.trim()) : []);
    const skills = skillsArr.join(', ') || 'не указаны'

    const systemPrompt = `Ты — HR-специалист компании, проводящий собеседование с кандидатом на позицию "${application.jobs.title}".
Информация о вакансии:
Описание: ${application.jobs.description}
Требования: ${application.jobs.requirements}
Навыки: ${skills}
Резюме кандидата:
${application.resume_text || 'Не предоставлено'}
${application.jobs.ai_instructions ? `\n\nДОПОЛНИТЕЛЬНЫЕ ИНСТРУКЦИИ ОТ РАБОТОДАТЕЛЯ (ОБЯЗАТЕЛЬНО К ВЫПОЛНЕНИЮ):\n${application.jobs.ai_instructions}\n` : ''}

Твоя задача:
1. Задать кандидату 5-7 вопросов о его опыте, навыках и мотивации
2. Оценить его ответы
3. Быть дружелюбным и профессиональным
4. Если кандидат отвечает коротко, задавать уточняющие вопросы.
5. Не повторять одни и те же вопросы.
6. Анализировать ответы на предмет конкретных примеров (STAR метод).

Структура интервью:
1. Приветствие и краткий рассказ о вакансии (1 сообщение).
2. Вопросы по опыту работы и проектам (2-3 вопроса).
3. Технические вопросы по указанным навыкам (2-3 вопроса).
4. Ситуационные вопросы (soft skills) (1-2 вопроса).
5. Заключение и возможность кандидату задать вопрос.

Начни с приветствия, кратко упомяни компанию и позицию, и задай первый вопрос об опыте кандидата. Твоя цель — глубоко понять квалификацию кандидата. ${application.jobs.ai_instructions ? 'Придерживайся инструкций работодателя относительно твоего стиля общения и вопросов.' : 'Будь вежлив, но профессионален.'}`

    if (!openai) {
      return res.status(503).json({
        error: 'AI service unavailable',
        details: 'OpenAI API key not configured'
      })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Начни интервью' }
      ],
      temperature: 0.8,
      max_tokens: 500
    }).catch(err => {
      console.error('OpenAI Start Error:', err);
      return null;
    });

    const firstMessage = completion?.choices[0]?.message?.content || `Привет! Я AI-интервьюер. Давайте начнем наше собеседование на позицию "${application.jobs?.title}". Расскажите немного о себе и своем опыте.`;

    const conversationHistory = [
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: firstMessage }
    ]

    await supabaseAdmin
      .from('interviews')
      .update({ conversation_history: conversationHistory })
      .eq('id', interview.id)

    res.json({
      success: true,
      interview_id: interview.id,
      message: firstMessage
    })
  } catch (error) {
    console.error('Interview Start Error:', error)
    res.status(500).json({ error: error.message, details: error })
  }
})

router.post('/message', async (req, res) => {
  try {
    const { interview_id, message } = req.body
    if (!interview_id || !message) return res.status(400).json({ error: 'interview_id and message required' })

    const { data: interview, error: fetchError } = await supabaseAdmin
      .from('interviews')
      .select('*')
      .eq('id', interview_id)
      .single()

    if (fetchError || !interview) return res.status(404).json({ error: 'Interview not found' })

    const conversationHistory = interview.conversation_history || []
    conversationHistory.push({ role: 'user', content: message })

    if (!openai) {
      return res.status(503).json({
        error: 'AI service unavailable',
        details: 'OpenAI API key not configured'
      })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversationHistory,
      temperature: 0.8,
      max_tokens: 500
    }).catch(err => {
      console.error('OpenAI Message Error:', err);
      return null;
    });

    const aiResponse = completion?.choices[0]?.message?.content || "Извините, у меня возникли технические сложности. Пожалуйста, попробуйте отправить сообщение еще раз или перезагрузите страницу.";
    conversationHistory.push({ role: 'assistant', content: aiResponse })

    await supabaseAdmin
      .from('interviews')
      .update({ conversation_history: conversationHistory })
      .eq('id', interview_id)

    res.json({
      success: true,
      message: aiResponse
    })
  } catch (error) {
    console.error('Interview Message Error:', error)
    res.status(500).json({ error: error.message, details: error })
  }
})

router.post('/complete', async (req, res) => {
  try {
    const { interview_id } = req.body
    if (!interview_id) return res.status(400).json({ error: 'interview_id required' })

    const { data: interview, error: fetchError } = await supabaseAdmin
      .from('interviews')
      .select('*, applications!inner(id)')
      .eq('id', interview_id)
      .single()

    if (fetchError || !interview) return res.status(404).json({ error: 'Interview not found' })

    const conversationHistory = interview.conversation_history || []

    const evaluationPrompt = `На основе проведенного интервью предоставь итоговую оценку кандидата в формате JSON:
{
      "overall_score": (число от 0 до 100),
      "technical_score": (число от 0 до 100),
      "soft_skills_score": (число от 0 до 100),
      "communication_score": (число от 0 до 100),
      "summary": "краткое резюме по итогам интервью",
      "recommendation": "рекомендация (hire/consider/reject)",
      "strengths": "сильные стороны",
      "weaknesses": "зоны роста"
    }
    Отвечай только валидным JSON.`

    conversationHistory.push({ role: 'user', content: evaluationPrompt })

    if (!openai) {
      return res.status(503).json({
        error: 'AI service unavailable',
        details: 'OpenAI API key not configured'
      })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversationHistory,
      temperature: 0.7,
      max_tokens: 500
    })

    const evaluationText = completion.choices[0].message.content.trim()
    const evaluation = JSON.parse(evaluationText)

    await supabaseAdmin
      .from('interviews')
      .update({
        status: 'completed',
        result_score: evaluation.overall_score || 0,
        technical_score: evaluation.technical_score || 0,
        soft_skills_score: evaluation.soft_skills_score || 0,
        communication_score: evaluation.communication_score || 0,
        summary: evaluation.summary || '',
        recommendation: evaluation.recommendation || '',
        strengths: evaluation.strengths || '',
        weaknesses: evaluation.weaknesses || '',
        completed_at: new Date().toISOString()
      })
      .eq('id', interview_id)

    await supabaseAdmin
      .from('applications')
      .update({ status: 'completed' })
      .eq('id', interview.application_id)

    res.json({
      success: true,
      evaluation
    })
  } catch (error) {
    console.error('Complete error:', error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/:interviewId', async (req, res) => {
  try {
    const { interviewId } = req.params
    let result = await supabaseAdmin
      .from('interviews')
      .select(`
        *,
        applications (
          *,
          jobs (title),
          candidate_profiles (
            users (name)
          )
        )
      `)
      .eq('id', interviewId)
      .maybeSingle()

    // Fallback: try application_id if not found by id
    if (!result.data && !result.error) {
      // Try finding by application_id
      const fallbackResult = await supabaseAdmin
        .from('interviews')
        .select(`
           *,
           applications (
             *,
             jobs (title),
             candidate_profiles (
               users (name)
             )
           )
         `)
        .eq('application_id', interviewId)
        .maybeSingle()

      if (fallbackResult.data) {
        result = fallbackResult
      } else if (fallbackResult.error) {
        result.error = fallbackResult.error
      }
    }

    if (result.error) {
      console.error('Supabase Fetch Interview Error:', result.error);
      return res.status(500).json({ error: result.error.message })
    }

    if (!result.data) return res.status(404).json({ error: 'Interview not found' });

    res.json(result.data)

  } catch (error) {
    console.error('GET Interview Error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router