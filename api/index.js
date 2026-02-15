import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import axios from 'axios'

const app = express()

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

// Initialize Supabase
let supabase = null
if (supabaseUrl && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })
        console.log('✅ Supabase initialized')
    } catch (e) {
        console.error('❌ Supabase init error:', e)
    }
} else {
    console.error('❌ Missing Supabase credentials')
}

// Initialize OpenAI
let openai = null
if (process.env.OPENAI_API_KEY) {
    try {
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        console.log('✅ OpenAI initialized')
    } catch (e) {
        console.error('❌ OpenAI init error:', e)
    }
}

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        supabase: !!supabase,
        openai: !!openai,
        env: {
            hasSupabaseUrl: !!supabaseUrl,
            hasSupabaseKey: !!supabaseKey,
            hasOpenAI: !!process.env.OPENAI_API_KEY
        }
    })
})

// Profile routes
app.get('/api/profile/candidate/:userId', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(500).json({
                error: 'Database not initialized',
                details: 'Supabase client failed to initialize. Check environment variables.'
            })
        }

        const { userId } = req.params

        const { data: profile, error: profileError } = await supabase
            .from('candidate_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle()

        if (profileError) {
            console.error('Profile query error:', profileError)
            throw profileError
        }

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' })
        }

        const { data: skills } = await supabase
            .from('skills')
            .select('*')
            .eq('candidate_id', profile.id)
            .order('created_at', { ascending: false })

        const { data: experience } = await supabase
            .from('work_experience')
            .select('*')
            .eq('candidate_id', profile.id)
            .order('created_at', { ascending: false })

        res.json({ ...profile, skills: skills || [], experience: experience || [] })
    } catch (error) {
        console.error('Profile error:', error)
        res.status(500).json({ error: error.message })
    }
})

// Resume analysis route
app.post('/api/resume-analysis/analyze-resume', async (req, res) => {
    try {
        if (!openai) {
            return res.status(500).json({
                error: 'AI service not available',
                details: 'OpenAI API key not configured'
            })
        }

        const { resume_text, resume_url, target_job, experience_years } = req.body

        if (!resume_text && !resume_url) {
            return res.status(400).json({ error: 'resume_text or resume_url is required' })
        }

        let fullResumeText = resume_text || ''

        if (resume_url && !resume_text) {
            try {
                const response = await axios.get(resume_url, {
                    responseType: 'text',
                    timeout: 15000,
                    maxContentLength: 5 * 1024 * 1024
                })
                fullResumeText = response.data
            } catch (axiosError) {
                console.error('Resume fetch error:', axiosError.message)
                return res.status(400).json({
                    error: 'Не удалось загрузить файл. Попробуйте вставить текст напрямую.'
                })
            }
        }

        if (!fullResumeText.trim()) {
            return res.status(400).json({ error: 'Could not extract text from resume' })
        }

        const prompt = `Ты профессиональный HR-аналитик. Проанализируй резюме кандидата максимально объективно и подробно.
Резюме:
"${fullResumeText.substring(0, 2000)}"

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
        res.json({ analysis })

    } catch (error) {
        console.error('Resume analysis error:', error)
        res.status(500).json({ error: error.message || 'Internal server error' })
    }
})

// Job recommendations (simple JS-based matching)
app.get('/api/predict/recommendations/:candidateId', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(500).json({ error: 'Database not initialized' })
        }

        const { candidateId } = req.params

        const { data: candidate } = await supabase
            .from('candidate_profiles')
            .select('*, skills(name, level)')
            .eq('id', candidateId)
            .single()

        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' })
        }

        const { data: jobs } = await supabase
            .from('jobs')
            .select(`
                *,
                companies(name),
                job_skills(skill_name)
            `)
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(20)

        const jobsWithScores = (jobs || []).map(job => {
            const candidateSkills = candidate.skills?.map(s => s.name.toLowerCase()) || []
            const jobSkills = job.job_skills?.map(s => s.skill_name.toLowerCase()) || []

            const matchedSkills = candidateSkills.filter(cs =>
                jobSkills.some(js => js.includes(cs) || cs.includes(js))
            )
            const skillsMatch = jobSkills.length > 0
                ? (matchedSkills.length / jobSkills.length) * 100
                : 50

            const requiredExp = job.title?.toLowerCase().includes('senior') ? 5 :
                job.title?.toLowerCase().includes('mid') ? 3 : 1
            const expMatch = candidate.experience_years >= requiredExp ? 100 :
                candidate.experience_years >= (requiredExp * 0.7) ? 85 : 70

            const locMatch = job.location?.toLowerCase().includes('remote') ? 100 :
                job.location?.toLowerCase() === candidate.location?.toLowerCase() ? 100 : 70

            const match_score = Math.round(skillsMatch * 0.5 + expMatch * 0.3 + locMatch * 0.2)
            const hiring_probability = Math.min(match_score + 10, 100)

            return {
                ...job,
                match_score,
                hiring_probability
            }
        })

        jobsWithScores.sort((a, b) => b.match_score - a.match_score)
        res.json(jobsWithScores.slice(0, 10))

    } catch (error) {
        console.error('Recommendations error:', error)
        res.status(500).json({ error: error.message })
    }
})

// Catch-all for 404
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path,
        method: req.method
    })
})

export default app
