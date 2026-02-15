<template>
  <div class="min-h-screen pb-20">
    <header class="glass-strong sticky top-0 z-50 border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <span class="text-dark font-bold text-lg">{{ initials }}</span>
            </div>
            <div>
              <h2 class="font-semibold">{{ user?.name || 'User' }}</h2>
              <p class="text-xs text-gray-400">Кандидат</p>
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
            Вакансии <span class="text-gradient">от работодателей</span>
          </h1>
          <p class="text-gray-400">Найдите подходящую работу</p>
        </div>
        <div class="flex items-center space-x-4">
          <input v-model="searchQuery" type="text" placeholder="Поиск вакансий..." class="input-glass px-4 py-2 rounded-xl">
          <select v-model="locationFilter" class="input-glass px-4 py-2 rounded-xl">
            <option value="">Все локации</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="text-center py-20">
        <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>

      <div v-else-if="jobs.length === 0" class="text-center py-20 glass rounded-3xl">
        <h3 class="text-2xl font-semibold mb-4 text-gray-300">Вакансий пока нет</h3>
        <p class="text-gray-400 mb-6">Подождите, работодатели добавляют новые вакансии</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="job in filteredJobs" :key="job.id"
             @click="$router.push(`/job/${job.id}`)"
             class="glass p-6 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h3 class="font-semibold text-xl group-hover:text-primary transition-colors mb-1">{{ job.title }}</h3>
              <p class="text-sm text-gray-400 mb-2">{{ job.companies?.name || 'Company' }}</p>
            </div>
            <div class="text-right">
              <div v-if="job.match_score > 0" class="glass px-3 py-1 rounded-full text-sm font-semibold text-primary">
                {{ Math.round(job.match_score) }}% match
              </div>
              <div v-if="job.hiring_probability > 0" class="text-xs text-gray-500 mt-1">
                Шанс: {{ Math.round(job.hiring_probability) }}%
              </div>
            </div>
          </div>

          <p class="text-gray-400 text-sm mb-4 line-clamp-3">{{ job.description }}</p>

          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="skill in job.skills?.slice(0, 4)" :key="skill" class="glass px-3 py-1 rounded-full text-xs">
              {{ skill }}
            </span>
            <span v-if="job.skills?.length > 4" class="text-gray-500 text-xs">+{{ job.skills.length - 4 }}</span>
          </div>

          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center space-x-4">
              <span class="text-gray-400">{{ job.location }}</span>
              <span class="text-gray-400">{{ job.type }}</span>
            </div>
            <span class="text-primary font-semibold">{{ job.salary }}</span>
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
  const name = user.value?.name || 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const loading = ref(true)
const API_BASE = '/api'
const jobs = ref([])
const searchQuery = ref('')
const locationFilter = ref('')

const filteredJobs = computed(() => {
  let filtered = jobs.value
  if (searchQuery.value) {
    filtered = filtered.filter(job => 
      job.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      job.companies?.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (locationFilter.value) filtered = filtered.filter(job => job.location === locationFilter.value)
  return filtered
})

const loadJobs = async () => {
  loading.value = true
  try {
    const { data: profile } = await supabase.from('candidate_profiles').select('id').eq('user_id', user.value.id).single()
    if (profile) {
      const res = await fetch(`${API_BASE}/predict/recommendations/${profile.id}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        jobs.value = data.map(j => ({
          ...j,
          skills: j.job_skills?.map(s => s.skill_name) || [],
          match_score: j.match_score || 0,
          hiring_probability: j.hiring_probability || 0
        }))
      } else {
        await fallbackLoad()
      }
    } else {
      await fallbackLoad()
    }
  } catch (err) {
    await fallbackLoad()
  }
  loading.value = false
}

const fallbackLoad = async () => {
  const { data } = await supabase.from('jobs').select('*, companies (name), job_skills (skill_name)').eq('status', 'active').order('created_at', { ascending: false })
  jobs.value = data?.map(job => ({
    ...job,
    skills: job.job_skills?.map(s => s.skill_name) || [],
    match_score: 0,
    hiring_probability: 0
  })) || []
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(async () => {
  await loadJobs()
})
</script>