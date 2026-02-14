import express from 'express'
import { calculateMatchScore, predictSuccess } from '../services/ml.js'

const router = express.Router()

router.post('/calculate', async (req, res) => {
  try {
    const { candidateId, jobId } = req.body
    
    const { data: profile } = await req.supabase
      .from('candidate_profiles')
      .select(`
        *,
        skills (name, level)
      `)
      .eq('id', candidateId)
      .single()
    
    const { data: job } = await req.supabase
      .from('jobs')
      .select(`
        *,
        job_skills (skill_name)
      `)
      .eq('id', jobId)
      .single()
    
    if (!profile || !job) {
      return res.status(404).json({ error: 'Not found' })
    }
    
    const matchScore = calculateMatchScore(profile, job)
    const successPrediction = predictSuccess(profile, job, matchScore)
    
    res.json({
      matchScore,
      successPrediction,
      breakdown: {
        skillsMatch: matchScore.skills,
        experienceMatch: matchScore.experience,
        locationMatch: matchScore.location
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/apply', async (req, res) => {
  try {
    const { candidateId, jobId } = req.body
    
    const { data: profile } = await req.supabase
      .from('candidate_profiles')
      .select(`
        *,
        skills (name, level)
      `)
      .eq('id', candidateId)
      .single()
    
    const { data: job } = await req.supabase
      .from('jobs')
      .select(`
        *,
        job_skills (skill_name)
      `)
      .eq('id', jobId)
      .single()
    
    const matchScore = calculateMatchScore(profile, job)
    
    const status = matchScore.total >= 72 ? 'approved' : 'pending'
    
    const { data: application, error } = await req.supabase
      .from('applications')
      .insert([{
        candidate_id: candidateId,
        job_id: jobId,
        match_score: matchScore.total,
        status
      }])
      .select()
      .single()
    
    if (error) {
      return res.status(400).json({ error: error.message })
    }
    
    if (status === 'approved') {
      await req.supabase
        .from('interviews')
        .insert([{
          application_id: application.id,
          status: 'in_progress'
        }])
      
      await req.supabase
        .from('applications')
        .update({ status: 'interview' })
        .eq('id', application.id)
    }
    
    res.json({
      application,
      autoApproved: status === 'approved',
      matchScore: matchScore.total
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router