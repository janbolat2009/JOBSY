import express from 'express'
import * as careerService from '../services/career_service.js'

const router = express.Router()

// Analyze career profile
router.post('/analyze', async (req, res) => {
    try {
        const { user_profile, market_data } = req.body
        const result = await careerService.analyzeCareer(user_profile, market_data)
        res.json(result)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Get career roadmap
router.get('/roadmap', async (req, res) => {
    try {
        const userId = req.user.id // Assuming auth middleware
        const roadmap = await careerService.getRoadmap(userId)
        res.json(roadmap)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Complete milestone
router.post('/complete-milestone', async (req, res) => {
    try {
        const { milestoneId } = req.body
        const result = await careerService.completeMilestone(milestoneId)
        res.json(result)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router
