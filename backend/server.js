import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import matchingRoutes from './routes/matching.js'
import aiRoutes from './routes/ai.js'
import resumeAnalysisRoutes from './routes/resume-analysis.js'
import applicationsRoutes from './routes/applications.js'
import predictRoutes from './routes/predict.js'
import interviewRoutes from './routes/interview.js'
import profileRoutes from './routes/profile.js'
import salaryRoutes from './routes/salary.js'
import careerRoutes from './routes/career.js'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Ошибка: SUPABASE_URL или SUPABASE_SERVICE_KEY не заданы в .env')
  process.exit(1)
}

if (!process.env.OPENAI_API_KEY) {
  console.error('Ошибка: OPENAI_API_KEY не задан в .env')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 3000

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  req.supabase = supabase
  next()
})

app.use('/api/matching', matchingRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/resume-analysis', resumeAnalysisRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/applications', applicationsRoutes)
app.use('/api/predict', predictRoutes)
app.use('/api/interview', interviewRoutes)
app.use('/api/career', careerRoutes)
app.use('/api/salary', salaryRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})