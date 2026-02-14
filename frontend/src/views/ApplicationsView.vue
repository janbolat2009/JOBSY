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
            
            <h1 class="text-xl font-bold">Мои отклики</h1>
            
            <div class="w-24"></div>
          </div>
        </div>
      </header>
      
      <main class="max-w-7xl mx-auto px-4 py-8">
        <div v-if="loading" class="text-center py-12">
          <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-gray-400 mt-4">Загрузка...</p>
        </div>
        
        <div v-else-if="applications.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p class="text-gray-400 mb-4">У вас пока нет откликов</p>
          <button @click="$router.push('/jobs')" class="btn-primary">Найти вакансии</button>
        </div>
        
        <div v-else class="space-y-4">
          <div v-for="app in applications" :key="app.id" class="card-glass animate-slide-up">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-xl font-semibold mb-1">{{ app.jobs.title }}</h3>
                <p class="text-gray-400">{{ app.jobs.company_name }}</p>
              </div>
              <div class="flex flex-col items-end space-y-2">
                <div :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  getStatusClass(app.status)
                ]">
                  {{ getStatusText(app.status) }}
                </div>
                <div v-if="app.match_score" class="glass px-3 py-1 rounded-full text-sm font-semibold text-primary">
                  {{ app.match_score }}% match
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between pt-4 border-t border-white/10">
              <div class="flex items-center space-x-4 text-sm text-gray-400">
                <span>{{ new Date(app.created_at).toLocaleDateString('ru-RU') }}</span>
                <span>{{ app.jobs.location }}</span>
              </div>
              
              <div class="flex items-center space-x-2">
                <button v-if="app.status === 'interview'" 
                        @click="startInterview(app)" 
                        class="btn-primary">
                  Пройти интервью
                </button>
                <button @click="$router.push(`/job/${app.job_id}`)" class="btn-secondary">
                  Посмотреть вакансию
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { useRouter } from 'vue-router'
  import { supabase } from '@/lib/supabase'
  
  const router = useRouter()
  const authStore = useAuthStore()
  const user = computed(() => authStore.user)
  
  const loading = ref(true)
  const applications = ref([])
  
  const getStatusClass = (status) => {
    const classes = {
      pending: 'bg-gray-500/20 text-gray-400',
      approved: 'bg-primary/20 text-primary',
      rejected: 'bg-red-500/20 text-red-400',
      interview: 'bg-secondary/20 text-secondary',
      completed: 'bg-primary/20 text-primary'
    }
    return classes[status] || classes.pending
  }
  
  const getStatusText = (status) => {
    const texts = {
      pending: 'На рассмотрении',
      approved: 'Одобрено',
      rejected: 'Отклонено',
      interview: 'Интервью',
      completed: 'Завершено'
    }
    return texts[status] || 'Неизвестно'
  }
  
  const startInterview = async (app) => {
    // If we have a pre-fetched interview ID, use it
    if (app.interviews && app.interviews.length > 0) {
      router.push(`/interview/${app.interviews[0].id}`)
      return
    }

    try {
      // Otherwise try to find it dynamically by application ID (this is the reliable fallback)
      const { data, error } = await supabase
        .from('interviews')
        .select('id')
        .eq('application_id', app.id)
        .maybeSingle()
      
      if (data) {
        router.push(`/interview/${data.id}`)
      } else {
        // Fallback: try navigating with application ID
        // Backend now supports finding interview by application_id
        console.warn('Interview lookup failed for app', app.id, 'trying app ID redirection')
        router.push(`/interview/${app.id}`)
      }
    } catch (e) {
      console.error('Error finding interview:', e)
      // Ultimate fallback
      router.push(`/interview/${app.id}`)
    }
  }

  const loadApplications = async () => {
    loading.value = true
    
    const { data: profile } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', user.value.id)
      .single()
    
    if (profile) {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (
            id,
            title,
            location,
            companies (name)
          ),
          interviews (id)
        `)
        .eq('candidate_id', profile.id)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        applications.value = data.map(app => ({
          ...app,
          jobs: {
            ...app.jobs,
            company_name: app.jobs.companies?.name || 'Company'
          }
        }))
      }
    }
    
    loading.value = false
  }
  
  onMounted(() => {
    loadApplications()
  })
  </script>