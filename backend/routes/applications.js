import express from 'express'
import supabaseAdmin from '../lib/supabaseAdmin.js'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

async function getPrediction(inputData) {
  return new Promise((resolve, reject) => {
    const predictScriptPath = path.join(__dirname, '..', 'predict.py')
    const py = spawn('python', [predictScriptPath], { cwd: path.join(__dirname, '..') })

    let output = ''
    let errorOutput = ''

    py.stdout.on('data', data => output += data.toString())
    py.stderr.on('data', data => errorOutput += data.toString())
    py.on('error', err => reject(err))

    py.stdin.write(JSON.stringify(inputData))
    py.stdin.end()

    py.on('close', code => {
      if (code !== 0) {
        console.warn('Python application prediction failed, using fallback')
        return resolve({ match_score: 75, hiring_probability: 70, company_reputation: 85 })
      }
      try {
        resolve(JSON.parse(output.trim()))
      } catch (e) {
        resolve({ match_score: 75, hiring_probability: 70, company_reputation: 85 })
      }
    })
  })
}

router.post('/submit', async (req, res) => {
  try {
    const { job_id, candidate_id, resume_url, resume_text, cover_letter, match_score } = req.body

    if (!job_id || !candidate_id) {
      return res.status(400).json({ error: 'job_id and candidate_id required' })
    }

    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert({
        job_id,
        candidate_id,
        resume_url: resume_url || null,
        resume_text: resume_text || null,
        cover_letter: cover_letter || null,
        match_score: match_score || 0,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, application: data })
  } catch (error) {
    console.error('Application submission error:', error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/employer/:employerId', async (req, res) => {
  try {
    const { employerId } = req.params

    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('owner_id', employerId)
      .single()

    if (!company) {
      return res.json([])
    }

    const { data: jobs } = await supabaseAdmin
      .from('jobs')
      .select('id')
      .eq('company_id', company.id)

    if (!jobs || jobs.length === 0) {
      return res.json([])
    }

    const jobIds = jobs.map(j => j.id)

    const { data: applications, error: appError } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        candidate_profiles (
          *,
          users (name, email),
          skills (name, level)
        ),
        jobs (
          *,
          companies (reputation_score),
          job_skills (skill_name)
        ),
        interviews (*)
      `)
      .in('job_id', jobIds)
      .order('created_at', { ascending: false })

    if (appError) throw appError

    const enrichedApps = await Promise.all((applications || []).map(async (app) => {
      const job = app.jobs
      const candidate = app.candidate_profiles
      const job_skills = job.job_skills?.map(s => s.skill_name).join(', ') || 'generic_job'
      const candidate_skills = candidate.skills?.map(s => `${s.name}:${s.level || 50}`).join(', ') || 'generic_skills'
      const reputation_score = job.companies?.reputation_score || 80

      try {
        const prediction = await getPrediction({
          candidate_skills,
          job_skills,
          experience_years: candidate.experience_years || 0,
          reputation_score
        })

        return {
          ...app,
          match_score: prediction.match_score,
          hiring_probability: prediction.hiring_probability
        }
      } catch (e) {
        return app
      }
    }))

    res.json(enrichedApps)
  } catch (error) {
    console.error('Fetch applications error:', error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/job/:jobId/ranked', async (req, res) => {
  try {
    const { jobId } = req.params

    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('*, companies (reputation_score), job_skills (skill_name)')
      .eq('id', jobId)
      .single()

    if (jobError || !job) return res.status(404).json({ error: 'Job not found' })

    const { data: applications, error: appError } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        candidate_profiles (
          *,
          users (name, email),
          skills (name, level)
        )
      `)
      .eq('job_id', jobId)

    if (appError) throw appError

    const job_skills = job.job_skills?.map(s => s.skill_name).join(', ') || 'generic_job'
    const reputation_score = job.companies?.reputation_score || 80

    const rankedApplications = await Promise.all(applications.map(async (app) => {
      const candidate = app.candidate_profiles
      const candidate_skills = candidate.skills?.map(s => `${s.name}:${s.level || 50}`).join(', ') || 'generic_skills'
      const experience_years = candidate.experience_years || 0

      try {
        const prediction = await getPrediction({
          candidate_skills,
          job_skills,
          experience_years,
          reputation_score
        })

        return {
          ...app,
          match_score: prediction.match_score,
          hiring_probability: prediction.hiring_probability,
          reputation_score: prediction.company_reputation
        }
      } catch (e) {
        console.error('Ranked prediction item error:', e)
        return {
          ...app,
          match_score: app.match_score || 0,
          hiring_probability: 0
        }
      }
    }))

    rankedApplications.sort((a, b) => {
      if (b.match_score !== a.match_score) return b.match_score - a.match_score
      return b.hiring_probability - a.hiring_probability
    })

    res.json(rankedApplications)
  } catch (error) {
    console.error('Ranked applications error:', error)
    res.status(500).json({ error: error.message })
  }
})

router.patch('/:applicationId/status', async (req, res) => {
  try {
    const { applicationId } = req.params
    const { status } = req.body

    const { data, error } = await supabaseAdmin
      .from('applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, application: data })
  } catch (error) {
    console.error('Update status error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router