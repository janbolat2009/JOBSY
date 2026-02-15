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
        supabase = createClient(supabaseUrl, supabaseKey)
    } catch (e) {
        console.error('Supabase init error:', e)
    }
}

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        supabase: !!supabase,
        env: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseKey,
            hasGemini: !!process.env.GEMINI_API_KEY
        }
    })
})

// === AI GENERATE JOB DESC (Inline to fix 500/404 errors) ===
app.post('/api/ai/generate-job-desc', async (req, res) => {
    try {
        const { brief } = req.body
        if (!brief) return res.status(400).json({ error: 'Brief is required' })

        const geminiKey = process.env.GEMINI_API_KEY
        if (!geminiKey) {
            console.warn('No GEMINI_API_KEY, using fallback')
            return res.json({
                title: brief.split(',')[0] || 'Новая вакансия',
                description: `<h3>Описание вакансии</h3><p>На основе вашего брифа: ${brief}</p><ul><li>Опыт работы: 2-3 года</li><li>Навыки: указанные в брифе</li></ul>`,
                experience_years: 2,
                city: 'Астана'
            })
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`
        const response = await axios.post(url, {
            contents: [{
                parts: [{
                    text: `Напиши описание вакансии в JSON по брифу: "${brief}". 
                    Ответь ТОЛЬКО чистым JSON объектом (без markdown разметки): 
                    {"title": "название", "description": "краткое описание с html", "skills": ["скилл1"], "experience_years": 2, "city": "Астана"}`
                }]
            }]
        }, { timeout: 10000 })

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
        const jsonMatch = text.match(/\{[\s\S]*\}/)

        if (jsonMatch) {
            res.json(JSON.parse(jsonMatch[0]))
        } else {
            throw new Error('Could not parse AI response')
        }

    } catch (error) {
        console.error('AI Route Error:', error.message)
        res.status(200).json({ // Return 200 with fallback to prevent UI crash
            title: req.body.brief?.split(',')[0] || 'Новая вакансия',
            description: `<h3>Описание</h3><p>${req.body.brief}</p>`,
            experience_years: 2,
            city: 'Астана',
            is_fallback: true
        })
    }
})

// === IMPORT OTHER ROUTES (Safe load) ===
import matchingRoutes from '../backend/routes/matching.js'
import resumeAnalysisRoutes from '../backend/routes/resume-analysis.js'
import applicationsRoutes from '../backend/routes/applications.js'
import predictRoutes from '../backend/routes/predict.js'
import interviewRoutes from '../backend/routes/interview.js'
import profileRoutes from '../backend/routes/profile.js'
import salaryRoutes from '../backend/routes/salary.js'

// Middleware to inject supabase client to sub-routers
app.use((req, res, next) => {
    req.supabase = supabase
    next()
})

app.use('/api/matching', matchingRoutes)
app.use('/api/resume-analysis', resumeAnalysisRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/applications', applicationsRoutes)
app.use('/api/predict', predictRoutes)
app.use('/api/interview', interviewRoutes)
app.use('/api/salary', salaryRoutes)

// Final fallback
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl })
})

export default app
