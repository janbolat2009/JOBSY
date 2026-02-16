import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import matchingRoutes from '../backend/routes/matching.js'
import aiRoutes from '../backend/routes/ai.js'
import resumeAnalysisRoutes from '../backend/routes/resume-analysis.js'
import applicationsRoutes from '../backend/routes/applications.js'
// import predictRoutes from '../backend/routes/predict.js' // Disabled on Vercel (requires Python)
import recommendationsRoutes from '../backend/routes/recommendations.js'
import interviewRoutes from '../backend/routes/interview.js'
import profileRoutes from '../backend/routes/profile.js'
import salaryRoutes from '../backend/routes/salary.js'
import careerRoutes from '../backend/routes/career.js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null

const app = express()

app.use(cors())
app.use(express.json())

// Inject supabase to request if available
app.use((req, res, next) => {
    req.supabase = supabase
    next()
})


app.use('/api/matching', matchingRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/resume-analysis', resumeAnalysisRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/applications', applicationsRoutes)
// app.use('/api/predict', predictRoutes) // Disabled on Vercel
app.use('/api/predict', recommendationsRoutes) // Fallback recommendations
app.use('/api/interview', interviewRoutes)
app.use('/api/career', careerRoutes)
app.use('/api/salary', salaryRoutes)

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

export default app