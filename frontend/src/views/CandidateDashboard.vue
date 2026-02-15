<template>
  <div class="min-h-screen pb-20">
    <header class="glass-strong sticky top-0 z-50 border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div @click="$router.push('/profile')" class="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div class="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <span class="text-dark font-bold text-lg">{{ initials }}</span>
            </div>
            <div>
              <h2 class="font-semibold">{{ user?.name || 'User' }}</h2>
              <p class="text-xs text-gray-400">Кандидат</p>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <LanguageSwitcher />
            <button @click="handleLogout" class="glass p-2 rounded-xl hover:bg-white/10 transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <main class="max-w-7xl mx-auto px-4 py-8">
      <div class="mb-8 animate-slide-up">
        <h1 class="text-3xl md:text-4xl font-bold mb-2">
          {{ $t('dashboard.hello') }}, <span class="text-gradient">{{ firstName }}</span> 👋
        </h1>
        <p class="text-gray-400">{{ $t('dashboard.find_dream_job') }}</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card-glass animate-slide-up cursor-pointer hover:scale-105 transition-transform" style="animation-delay: 0.1s;" @click="$router.push('/jobs')">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-300">{{ $t('dashboard.jobs') }}</h3>
            <div class="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gradient">{{ stats.viewed }}</p>
        </div>
        
        <div class="card-glass animate-slide-up cursor-pointer hover:scale-105 transition-transform" style="animation-delay: 0.2s;" @click="$router.push('/applications')">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-300">Откликов</h3>
            <div class="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gradient">{{ applications.length }}</p>
        </div>
        
        <div class="card-glass animate-slide-up cursor-pointer hover:scale-105 transition-transform" style="animation-delay: 0.3s;" @click="viewInterviews">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-300">{{ $t('dashboard.interviews') }}</h3>
            <div class="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gradient">{{ stats.interviews }}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="card-glass animate-slide-up" style="animation-delay: 0.4s;">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold">{{ $t('dashboard.recommendations') }}</h2>
              <button @click="loadRecommendedJobs" class="glass p-2 rounded-xl hover:bg-white/10 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
            </div>
            
            <div v-if="loading" class="text-center py-12">
              <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p class="text-gray-400 mt-4">Загрузка вакансий...</p>
            </div>
            
            <div v-else-if="recommendedJobs.length === 0" class="text-center py-12">
              <p class="text-gray-400">Нет доступных вакансий</p>
              <button @click="$router.push('/jobs')" class="btn-primary mt-4">Посмотреть все</button>
            </div>
            
            <div v-else class="space-y-4">
              <div v-for="job in recommendedJobs" :key="job.id" 
                   @click="$router.push(`/job/${job.id}`)"
                   class="glass p-4 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h3 class="font-semibold text-lg group-hover:text-primary transition-colors">{{ job.title }}</h3>
                    <p class="text-sm text-gray-400">{{ job.company_name }}</p>
                  </div>
                  <div class="text-right">
                    <div class="glass px-3 py-1 rounded-full text-sm font-semibold text-primary">
                      {{ Math.round(job.match_score) }}% match
                    </div>
                    <div class="text-xs text-gray-500 mt-1">Шанс: {{ Math.round(job.hiring_probability) }}%</div>
                  </div>
                </div>
                
                <div class="flex flex-wrap gap-2 mb-3">
                  <span v-for="skill in job.skills" :key="skill" class="glass px-3 py-1 rounded-full text-xs">
                    {{ skill }}
                  </span>
                </div>
                
                <div class="flex items-center justify-between text-sm text-gray-400">
                  <span>{{ job.location }}</span>
                  <span>{{ job.salary }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="space-y-6">
          <div class="card-glass animate-slide-up" style="animation-delay: 0.5s;">
            <h3 class="font-semibold mb-4">Быстрые действия</h3>
            <div class="space-y-3">
              <button @click="$router.push('/jobs')" class="w-full glass p-4 rounded-2xl hover:bg-white/10 transition-all flex items-center space-x-3">
                <div class="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <div class="flex-1 text-left">
                  <p class="font-semibold">{{ $t('dashboard.find_jobs') }}</p>
                  <p class="text-xs text-gray-400">{{ $t('dashboard.view_all') }}</p>
                </div>
              </button>
              
              <button @click="$router.push('/career')" class="w-full glass p-4 rounded-2xl hover:bg-white/10 transition-all flex items-center space-x-3 border border-primary/30 relative overflow-hidden group">
                 <div class="absolute inset-0 bg-primary/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                 <div class="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center relative z-10">
                   <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                 </div>
                 <div class="flex-1 text-left relative z-10">
                   <p class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">{{ $t('dashboard.career_copilot') }}</p>
                   <p class="text-xs text-gray-400">{{ $t('dashboard.ai_career_plan') }}</p>
                 </div>
              </button>
              
              <button @click="$router.push('/profile')" class="w-full glass p-4 rounded-2xl hover:bg-white/10 transition-all flex items-center space-x-3">
                <div class="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div class="flex-1 text-left">
                  <p class="font-semibold">{{ $t('dashboard.my_profile') }}</p>
                  <p class="text-xs text-gray-400">{{ $t('dashboard.update_resume') }}</p>
                </div>
              </button>
              
              <button @click="$router.push('/notifications')" class="w-full glass p-4 rounded-2xl hover:bg-white/10 transition-all flex items-center space-x-3 relative">
                <div class="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div class="flex-1 text-left">
                  <p class="font-semibold">Сообщения</p>
                  <p class="text-xs text-gray-400">{{ unreadMessages }} новых</p>
                </div>
                <div v-if="unreadMessages > 0" class="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-dark">
                  {{ unreadMessages }}
                </div>
              </button>

              <button @click="$router.push('/resume-feedback')" class="w-full glass p-4 rounded-2xl hover:bg-white/10 transition-all flex items-center space-x-3">
                <div class="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div class="flex-1 text-left">
                  <p class="font-semibold">AI анализ резюме</p>
                  <p class="text-xs text-gray-400">Получить фидбек</p>
                </div>
              </button>
            </div>
          </div>
          
          <div class="card-glass animate-slide-up" style="animation-delay: 0.6s;">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold">{{ $t('dashboard.profile_completed') }}</h3>
              <span class="text-primary font-bold">{{ profileCompletion }}%</span>
            </div>
            <div class="w-full bg-dark-lighter rounded-full h-2 mb-4">
              <div class="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500" :style="{ width: profileCompletion + '%' }"></div>
            </div>
            <p class="text-sm text-gray-400">{{ $t('dashboard.fill_profile') }}</p>
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
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const firstName = computed(() => user.value?.name?.split(' ')[0] || 'User')
const initials = computed(() => {
  const name = user.value?.name || 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const stats = ref({
  viewed: 0,
  interviews: 0
})

const loading = ref(true)
const recommendedJobs = ref([])
const applications = ref([])
const profileCompletion = ref(0)
const unreadMessages = ref(0)

const API_BASE = '/api'

const loadApplications = async () => {
  if (!user.value?.id) return
  const { data: profile } = await supabase.from('candidate_profiles').select('id').eq('user_id', user.value.id).single()
  if (profile) {
    const { data } = await supabase.from('applications').select('*, jobs (title, location, salary), interviews (id, status)').eq('candidate_id', profile.id)
    applications.value = data || []
    stats.value.interviews = data?.filter(app => app.status === 'interview' || app.status === 'completed').length || 0
  }
}

const loadRecommendedJobs = async () => {
  if (!user.value?.id) return
  loading.value = true
  try {
    const resProfile = await fetch(`${API_BASE}/profile/candidate/${user.value.id}`)
    const profile = await resProfile.json()
    
    if (profile?.id) {
      const res = await fetch(`${API_BASE}/predict/recommendations/${profile.id}`)
      const data = await res.json()
      recommendedJobs.value = data.map(job => ({
        id: job.id,
        title: job.title,
        company_name: job.companies?.name || 'Company',
        match_score: job.match_score || 0,
        hiring_probability: job.hiring_probability || 0,
        skills: job.job_skills?.map(s => s.skill_name).slice(0, 4) || [],
        location: job.location,
        salary: job.salary
      }))
      stats.value.viewed = data.length
      calculateProfileCompletion(profile)
    }
  } catch (err) { console.error(err) }
  loading.value = false
}

const loadUnreadMessages = async () => {
  if (!user.value?.id) return
  const { data: profile } = await supabase.from('candidate_profiles').select('id').eq('user_id', user.value.id).single()
  if (profile) {
    const { data: apps } = await supabase.from('applications').select('id').eq('candidate_id', profile.id)
    if (apps?.length > 0) {
      const appIds = apps.map(a => a.id)
      const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).in('application_id', appIds).eq('is_read', false).neq('sender_id', user.value.id)
      unreadMessages.value = count || 0
    }
  }
}

const calculateProfileCompletion = (profile) => {
  if (!profile) return
  let completed = 0
  const fields = ['position', 'location', 'about', 'resume_url']
  fields.forEach(field => { if (profile[field]) completed += 20 })
  if (profile.skills?.length > 0) completed += 20
  profileCompletion.value = Math.min(completed, 100)
}

const viewInterviews = () => {
  const activeApp = applications.value.find(app => app.interviews && app.interviews.length > 0 && app.interviews[0].status === 'in_progress')
  if (activeApp) router.push(`/interview/${activeApp.interviews[0].id}`)
  else router.push('/applications')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(async () => {
  await loadApplications()
  await loadRecommendedJobs()
  await loadUnreadMessages()
})
</script>