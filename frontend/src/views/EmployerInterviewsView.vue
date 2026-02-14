<template>
    <div class="min-h-screen pb-20">
      <header class="glass-strong sticky top-0 z-50 border-b border-white/10">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <button @click="$router.back()" class="glass px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-white/10 transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              <span>Назад</span>
            </button>
            
            <h1 class="text-xl font-bold">Интервью</h1>
            
            <div class="w-24"></div>
          </div>
        </div>
      </header>
      
      <main class="max-w-7xl mx-auto px-4 py-8">
        <div v-if="loading" class="text-center py-12">
          <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        
        <div v-else-if="interviews.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <p class="text-gray-400">Нет интервью</p>
        </div>
        
        <div v-else class="space-y-4">
          <div v-for="interview in interviews" :key="interview.id" class="card-glass">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <span class="text-dark font-bold">{{ interview.initials }}</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold">{{ interview.candidateName }}</h3>
                  <p class="text-sm text-gray-400">{{ interview.jobTitle }}</p>
                </div>
              </div>
              
              <div :class="[
                'px-4 py-2 rounded-xl text-sm font-semibold',
                interview.status === 'completed' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
              ]">
                {{ interview.status === 'completed' ? 'Завершено' : 'В процессе' }}
              </div>
            </div>
            
            <div v-if="interview.status === 'completed'" class="grid grid-cols-4 gap-4 mb-4">
              <div class="glass p-3 rounded-xl text-center">
                <p class="text-2xl font-bold text-gradient">{{ interview.resultScore }}%</p>
                <p class="text-xs text-gray-400">Общий балл</p>
              </div>
              <div class="glass p-3 rounded-xl text-center">
                <p class="text-2xl font-bold text-primary">{{ interview.technicalScore }}%</p>
                <p class="text-xs text-gray-400">Технические</p>
              </div>
              <div class="glass p-3 rounded-xl text-center">
                <p class="text-2xl font-bold text-secondary">{{ interview.softSkillsScore }}%</p>
                <p class="text-xs text-gray-400">Soft Skills</p>
              </div>
              <div class="glass p-3 rounded-xl text-center">
                <p class="text-2xl font-bold text-primary">{{ interview.communicationScore }}%</p>
                <p class="text-xs text-gray-400">Коммуникация</p>
              </div>
            </div>
            
            <div class="flex items-center justify-between pt-4 border-t border-white/10">
              <span class="text-sm text-gray-400">{{ formatDate(interview.createdAt) }}</span>
              
              <div class="flex items-center space-x-2">
                <button v-if="interview.status === 'in_progress'" @click="startInterview(interview)" class="btn-primary text-sm">
                  Провести интервью
                </button>
                <button v-if="interview.status === 'completed'" @click="viewResults(interview)" class="btn-primary text-sm">
                  Посмотреть результаты
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { supabase } from '@/lib/supabase'
  
  const router = useRouter()
  const authStore = useAuthStore()
  
  const loading = ref(true)
  const interviews = ref([])
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const loadInterviews = async () => {
    loading.value = true
    
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', authStore.user.id)
      .single()
    
    if (company) {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('company_id', company.id)
      
      if (jobs && jobs.length > 0) {
        const jobIds = jobs.map(j => j.id)
        
        const { data: apps } = await supabase
          .from('applications')
          .select(`
            id,
            job_id,
            candidate_id,
            candidate_profiles (
              users (name)
            ),
            jobs (title)
          `)
          .in('job_id', jobIds)
          .in('status', ['interview', 'completed'])
        
        if (apps && apps.length > 0) {
          const appIds = apps.map(a => a.id)
          
          const { data } = await supabase
            .from('interviews')
            .select('*')
            .in('application_id', appIds)
            .order('created_at', { ascending: false })
          
          interviews.value = data?.map(interview => {
            const app = apps.find(a => a.id === interview.application_id)
            return {
              id: interview.id,
              candidateName: app?.candidate_profiles.users.name || 'Кандидат',
              initials: app?.candidate_profiles.users.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'К',
              jobTitle: app?.jobs.title || 'Вакансия',
              status: interview.status,
              resultScore: Math.round(interview.result_score || 0),
              technicalScore: Math.round(interview.technical_score || 0),
              softSkillsScore: Math.round(interview.soft_skills_score || 0),
              communicationScore: Math.round(interview.communication_score || 0),
              createdAt: interview.created_at,
              applicationId: interview.application_id
            }
          }) || []
        }
      }
    }
    
    loading.value = false
  }
  
  const startInterview = (interview) => {
    router.push(`/interview/${interview.id}`)
  }
  
  const viewResults = (interview) => {
    router.push(`/employer/interviews/${interview.applicationId}/results`)
  }
  
  onMounted(() => {
    loadInterviews()
  })
  </script>