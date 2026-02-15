import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

// Import Routers
import matchingRoutes from '../backend/routes/matching.js'
import aiRoutes from '../backend/routes/ai.js'
import resumeAnalysisRoutes from '../backend/routes/resume-analysis.js'
import applicationsRoutes from '../backend/routes/applications.js'
import predictRoutes from '../backend/routes/predict.js'
import interviewRoutes from '../backend/routes/interview.js'
import profileRoutes from '../backend/routes/profile.js'
import salaryRoutes from '../backend/routes/salary.js'
import careerRoutes from '../backend/routes/career.js'

const app = express()

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

// Initialize Supabase for middleware
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

// Middleware to inject supabase client
app.use((req, res, next) => {
    req.supabase = supabase
    next()
})

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        supabase: !!supabase,
        env: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseKey
        }
    })
})

// Request logger for debugging
app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.path}`)
    next()
})

// Mount all routes
app.use('/api/matching', matchingRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/resume-analysis', resumeAnalysisRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/applications', applicationsRoutes)
app.use('/api/predict', predictRoutes)
app.use('/api/interview', interviewRoutes)
app.use('/api/career', careerRoutes)
app.use('/api/salary', salaryRoutes)

// Fallback for missing routes
app.use('/api/*', (req, res) => {
    console.warn(`[404] Route not found: ${req.method} ${req.originalUrl}`)
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    })
})

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[FATAL ERROR]', err)
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
})

export default app
