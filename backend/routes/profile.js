import express from 'express'
import supabaseAdmin from '../lib/supabaseAdmin.js'

const router = express.Router()

router.get('/candidate/:userId', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({
        error: 'Database client not initialized',
        details: 'Check SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables'
      })
    }

    const { userId } = req.params
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError) throw profileError
    if (!profile) return res.status(404).json({ error: 'Profile not found' })

    const { data: skills } = await supabaseAdmin
      .from('skills')
      .select('*')
      .eq('candidate_id', profile.id)
      .order('created_at', { ascending: false })

    const { data: experience } = await supabaseAdmin
      .from('work_experience')
      .select('*')
      .eq('candidate_id', profile.id)
      .order('created_at', { ascending: false })

    res.json({ ...profile, skills: skills || [], experience: experience || [] })
  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/candidate', async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ error: 'userId required' })

    const { data: existing, error: checkError } = await supabaseAdmin
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (checkError) throw checkError
    if (existing) return res.json(existing)

    const { data: newProfile, error: createError } = await supabaseAdmin
      .from('candidate_profiles')
      .insert({
        user_id: userId,
        position: '',
        location: '',
        experience_years: 0,
        projects_count: 0,
        about: ''
      })
      .select('id')
      .single()

    if (createError) throw createError
    res.json(newProfile)
  } catch (error) {
    console.error('Profile creation error:', error)
    res.status(500).json({ error: error.message })
  }
})

router.put('/candidate/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const updates = req.body
    const { data, error } = await supabaseAdmin
      .from('candidate_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/skills', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('skills')
      .insert([req.body])
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/skills/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('skills')
      .delete()
      .eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/experience', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('work_experience')
      .insert([req.body])
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/experience/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('work_experience')
      .delete()
      .eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router