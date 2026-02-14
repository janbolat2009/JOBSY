import express from 'express'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

const getPrediction = (inputData) => {
  return new Promise((resolve, reject) => {
    const predictScriptPath = path.join(__dirname, '..', 'predict.py')
    const py = spawn('python', [predictScriptPath], { cwd: path.join(__dirname, '..') })
    let output = ''
    let errorOutput = ''
    py.stdout.on('data', data => { output += data.toString() })
    py.stderr.on('data', data => { errorOutput += data.toString() })
    py.on('error', err => reject(err))
    py.stdin.write(JSON.stringify(inputData))
    py.stdin.end()
    py.on('close', code => {
      if (code !== 0) return reject(new Error(errorOutput || 'Python process failed'))
      try {
        resolve(JSON.parse(output.trim()))
      } catch (e) {
        reject(e)
      }
    })
  })
}

router.post('/candidate-job', async (req, res) => {
  try {
    const { candidate_id, job_id } = req.body
    const { data: candidate } = await req.supabase.from('candidate_profiles').select('*, skills (name, level)').eq('id', candidate_id).single()
    const { data: job } = await req.supabase.from('jobs').select('*, companies (reputation_score), job_skills (skill_name)').eq('id', job_id).single()
    if (!candidate || !job) return res.status(404).json({ error: 'Candidate or job not found' })
    const prediction = await getPrediction({
      candidate_skills: candidate.skills?.map(s => `${s.name}:${s.level || 50}`).join(', ') || 'generic_skills',
      job_skills: job.job_skills?.map(s => s.skill_name).join(', ') || 'generic_job',
      experience_years: candidate.experience_years || 0,
      reputation_score: job.companies?.reputation_score || 80
    })
    res.json(prediction)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/recommendations/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params
    const { data: candidate } = await req.supabase.from('candidate_profiles').select('*, skills (name, level)').eq('id', candidateId).single()
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' })
    const { data: jobs } = await req.supabase.from('jobs').select('*, companies (reputation_score), job_skills (skill_name)')
    if (!jobs) return res.json([])
    const candidate_skills = candidate.skills?.map(s => `${s.name}:${s.level || 50}`).join(', ') || 'generic_skills'
    const experience_years = candidate.experience_years || 0
    const recommendations = await Promise.all(jobs.map(async (job) => {
      try {
        const prediction = await getPrediction({
          candidate_skills,
          job_skills: job.job_skills?.map(s => s.skill_name).join(', ') || 'generic_job',
          experience_years,
          reputation_score: job.companies?.reputation_score || 80
        })
        return { ...job, ...prediction }
      } catch (e) {
        return { ...job, match_score: 0, hiring_probability: 0 }
      }
    }))
    recommendations.sort((a, b) => b.match_score - a.match_score)
    res.json(recommendations.slice(0, 10))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router