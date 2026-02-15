import express from 'express'
import supabaseAdmin from '../lib/supabaseAdmin.js'

const router = express.Router()

// Get job recommendations for a candidate (without Python ML)
router.get('/recommendations/:candidateId', async (req, res) => {
    try {
        const { candidateId } = req.params

        // Get candidate profile with skills
        const { data: candidate, error: candidateError } = await supabaseAdmin
            .from('candidate_profiles')
            .select('*, skills(name, level)')
            .eq('id', candidateId)
            .single()

        if (candidateError || !candidate) {
            return res.status(404).json({ error: 'Candidate not found' })
        }

        // Get all active jobs
        const { data: jobs, error: jobsError } = await supabaseAdmin
            .from('jobs')
            .select(`
        *,
        companies(name),
        job_skills(skill_name)
      `)
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(20)

        if (jobsError) throw jobsError

        // Simple matching algorithm (fallback when Python ML is not available)
        const jobsWithScores = jobs.map(job => {
            const candidateSkills = candidate.skills?.map(s => s.name.toLowerCase()) || []
            const jobSkills = job.job_skills?.map(s => s.skill_name.toLowerCase()) || []

            // Calculate skills match
            const matchedSkills = candidateSkills.filter(cs =>
                jobSkills.some(js => js.includes(cs) || cs.includes(js))
            )
            const skillsMatch = jobSkills.length > 0
                ? (matchedSkills.length / jobSkills.length) * 100
                : 50

            // Calculate experience match
            const requiredExp = job.title?.toLowerCase().includes('senior') ? 5 :
                job.title?.toLowerCase().includes('mid') ? 3 : 1
            const expMatch = candidate.experience_years >= requiredExp ? 100 :
                candidate.experience_years >= (requiredExp * 0.7) ? 85 : 70

            // Calculate location match
            const locMatch = job.location?.toLowerCase().includes('remote') ? 100 :
                job.location?.toLowerCase() === candidate.location?.toLowerCase() ? 100 : 70

            // Overall match score
            const match_score = Math.round(skillsMatch * 0.5 + expMatch * 0.3 + locMatch * 0.2)
            const hiring_probability = Math.min(match_score + 10, 100)

            return {
                ...job,
                match_score,
                hiring_probability
            }
        })

        // Sort by match score
        jobsWithScores.sort((a, b) => b.match_score - a.match_score)

        // Return top 10
        res.json(jobsWithScores.slice(0, 10))

    } catch (error) {
        console.error('Recommendations error:', error)
        res.status(500).json({ error: error.message })
    }
})

export default router
