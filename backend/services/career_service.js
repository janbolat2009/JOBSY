import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null


export async function analyzeCareer(userProfile, marketData) {
    // TODO: Call Python ML service at /ml/career/analyze
    // For now, return mock data based on the blueprint

    console.log('Analyzing career for:', userProfile)

    return {
        career_score: 72,
        skill_gaps: [
            { skill: "Docker", gap: 40 },
            { skill: "System Design", gap: 60 }
        ],
        salary_prediction: 1800000 // KZT
    }
}

export async function getRoadmap(userId) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data, error } = await supabase
        .from('career_roadmaps')
        .select('*')
        .eq('user_id', userId)
        .order('deadline', { ascending: true })

    if (error) throw error
    return data
}

export async function completeMilestone(milestoneId) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data, error } = await supabase
        .from('career_roadmaps')
        .update({ completed: true })
        .eq('id', milestoneId)
        .select()

    if (error) throw error
    return data
}
