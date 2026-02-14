<template>
    <div class="min-h-screen pb-20">
      <header class="glass-strong sticky top-0 z-50 border-b border-white/10">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center">
                <span class="text-white font-bold text-lg">{{ initials }}</span>
              </div>
              <div>
                <h2 class="font-semibold">{{ user?.name || 'Company' }}</h2>
                <p class="text-xs text-gray-400">Работодатель</p>
              </div>
            </div>
            <button @click="handleLogout" class="glass p-2 rounded-xl hover:bg-white/10 transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      </header>
  
      <main class="max-w-7xl mx-auto px-4 py-8">
        <div class="mb-8 animate-slide-up flex items-center justify-between">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold mb-2">
              AI анализ <span class="text-gradient">откликов</span>
            </h1>
            <p class="text-gray-400">Автоматический анализ резюме кандидатов</p>
          </div>
          <button @click="analyzeAllResumes" :disabled="analyzing" class="btn-primary">
            <span v-if="!analyzing">Анализировать все</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Анализ...
            </span>
          </button>
        </div>
  
        <div v-if="analyzing" class="text-center py-20">
          <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-gray-400 mt-4">Анализ резюме кандидатов...</p>
        </div>
  
        <div v-else-if="analyses.length === 0" class="text-center py-20 glass rounded-3xl">
          <h3 class="text-2xl font-semibold mb-4 text-gray-300">Нет откликов для анализа</h3>
          <p class="text-gray-400 mb-6">Создайте вакансию и ждите откликов</p>
          <button @click="$router.push('/employerjobs')" class="btn-primary">
            Создать вакансию
          </button>
        </div>
  
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div v-for="analysis in analyses" :key="analysis.application_id" class="glass p-6 rounded-3xl">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="font-semibold">{{ analysis.candidate_name }}</h3>
                <p class="text-sm text-gray-400">Вакансия: {{ analysis.job_title }}</p>
              </div>
              <div class="glass px-3 py-1 rounded-full text-sm font-semibold" :class="analysis.analysis?.overall_score >= 80 ? 'text-primary' : 'text-secondary'">
                {{ analysis.analysis?.overall_score || 'N/A' }}/100
              </div>
            </div>
  
            <div v-if="analysis.analysis" class="space-y-4">
              <div>
                <h4 class="font-semibold mb-2">Сильные стороны</h4>
                <ul class="space-y-1 text-sm text-green-400">
                  <li v-for="(item, index) in analysis.analysis.strengths.split('\n')" :key="index">{{ item }}</li>
                </ul>
              </div>
  
              <div>
                <h4 class="font-semibold mb-2">Слабые стороны</h4>
                <ul class="space-y-1 text-sm text-red-400">
                  <li v-for="(item, index) in analysis.analysis.weaknesses.split('\n')" :key="index">{{ item }}</li>
                </ul>
              </div>
  
              <div>
                <h4 class="font-semibold mb-2">Рекомендации</h4>
                <ul class="space-y-1 text-sm text-blue-400">
                  <li v-for="(item, index) in analysis.analysis.recommendations.split('\n')" :key="index">{{ item }}</li>
                </ul>
              </div>
            </div>
  
            <div v-else class="text-center py-8 text-gray-400">
              Анализ не выполнен. <button @click="analyzeSingleResume(analysis.application_id)" class="text-primary hover:underline">Запустить анализ</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { supabase } from '@/lib/supabase'
  
  const router = useRouter()
  const authStore = useAuthStore()
  const user = computed(() => authStore.user)
  
  const initials = computed(() => {
    const name = user.value?.name || 'C'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  })
  
  const analyses = ref([])
  const analyzing = ref(false)
  const jobId = ref(null)
  
  const loadAnalyses = async (id) => {
    jobId.value = id
    analyzing.value = true
  
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        candidate_profiles (*),
        users (name),
        jobs (title)
      `)
      .eq('job_id', id)
  
    if (error) {
      console.error('Ошибка загрузки откликов:', error)
      return
    }
  
    analyses.value = data.map(app => ({
      application_id: app.id,
      candidate_name: app.users.name,
      candidate_profile: app.candidate_profiles,
      job_title: app.jobs.title,
      analysis: null
    }))
  
    analyzing.value = false
  }
  
  const analyzeAllResumes = async () => {
    if (!jobId.value) return
  
    analyzing.value = true
  
    try {
      const response = await fetch('/api/resume-analysis/applications/' + jobId.value + '/analysis', {
        method: 'GET'
      })
  
      const result = await response.json()
      if (result.error) throw new Error(result.error)
  
      analyses.value = result.analyses.map(a => ({
        ...a,
        analysis: a.analysis
      }))
    } catch (error) {
      console.error('Batch analysis error:', error)
      alert('Ошибка анализа')
    } finally {
      analyzing.value = false
    }
  }
  
  const analyzeSingleResume = async (applicationId) => {
    const app = analyses.value.find(a => a.application_id === applicationId)
    if (!app) return
  
    analyzing.value = true
  
    try {
      const response = await fetch('/api/resume-analysis/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: app.candidate_profile.about || 'No resume text',
          user_id: app.candidate_profile.user_id,
          job_id: jobId.value,
          application_id: applicationId
        })
      })
  
      const result = await response.json()
      if (result.error) throw new Error(result.error)
  
      const index = analyses.value.findIndex(a => a.application_id === applicationId)
      analyses.value[index].analysis = result.analysis
  
    } catch (error) {
      console.error('Single analysis error:', error)
      alert('Ошибка анализа')
    } finally {
      analyzing.value = false
    }
  }
  
  const handleLogout = async () => {
    await authStore.logout()
    router.push('/')
  }
  </script>