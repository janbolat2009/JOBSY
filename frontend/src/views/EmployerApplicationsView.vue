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
          <h1 class="text-xl font-bold">Отклики на вакансии</h1>
          <div class="w-10"></div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8">
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex-1 max-w-md">
          <label class="block text-sm font-medium text-gray-400 mb-2">Фильтр по вакансии:</label>
          <select v-model="selectedJobId" @change="loadApplications" class="input-glass">
            <option value="">Все вакансии</option>
            <option v-for="job in employerJobs" :key="job.id" :value="job.id">{{ job.title }}</option>
          </select>
        </div>
        <div class="flex items-center space-x-2">
          <button @click="statusFilter = 'all'; loadApplications()" :class="statusFilter === 'all' ? 'bg-primary text-dark' : 'glass'" class="px-4 py-2 rounded-xl text-sm transition-all hover:bg-white/10">Все</button>
          <button @click="statusFilter = 'pending'; loadApplications()" :class="statusFilter === 'pending' ? 'bg-primary text-dark' : 'glass'" class="px-4 py-2 rounded-xl text-sm transition-all hover:bg-white/10">Новые</button>
          <button @click="statusFilter = 'approved'; loadApplications()" :class="statusFilter === 'approved' ? 'bg-primary text-dark' : 'glass'" class="px-4 py-2 rounded-xl text-sm transition-all hover:bg-white/10">Принятые</button>
        </div>
      </div>

      <div class="mb-6 flex items-center justify-between">
         <h2 class="text-xs font-bold uppercase tracking-widest text-gray-500">Авто-ранжирование (Топ-10 по ML)</h2>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>

      <div v-else-if="applications.length === 0" class="text-center py-20 glass rounded-3xl">
        <p class="text-gray-400">Откликов пока нет</p>
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="(app, index) in applications" 
          :key="app.id" 
          @click="openModal(app)"
          class="card-glass p-6 rounded-3xl cursor-pointer hover:bg-white/5 transition-all group relative overflow-hidden"
        >
          <div v-if="index < 3" class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary"></div>
          
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center space-x-4">
              <div class="relative">
                <div class="w-14 h-14 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center text-primary font-bold text-xl flex-shrink-0 border border-white/5">
                  {{ (app.candidate_profiles?.users?.name || 'K')[0] }}
                </div>
                <div v-if="index < 10" class="absolute -top-2 -left-2 w-6 h-6 bg-dark border border-white/10 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400">
                  #{{ index + 1 }}
                </div>
              </div>
              <div class="min-w-0">
                <h3 class="text-xl font-bold group-hover:text-primary transition-colors truncate">{{ app.candidate_profiles?.users?.name }}</h3>
                <p class="text-sm text-gray-400">{{ app.jobs?.title }}</p>
              </div>
            </div>

            <div class="flex items-center justify-between md:justify-end gap-4 lg:gap-8">
              <div class="text-center px-4 border-r border-white/10 hidden md:block">
                <p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Мэтчинг</p>
                <div class="text-xl font-bold text-primary">{{ Math.round(app.match_score || 0) }}%</div>
              </div>
              <div class="text-center px-4 border-r border-white/10 hidden md:block">
                <p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Шанс найма</p>
                <div class="text-xl font-bold text-secondary">{{ Math.round(app.hiring_probability || 0) }}%</div>
              </div>
              <div class="text-right">
                <div :class="getStatusClass(app.status)" class="mb-1 inline-block">
                  {{ getStatusText(app.status) }}
                </div>
                <p class="text-[10px] text-gray-500">{{ formatDate(app.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Section -->
    <div v-if="selectedApp" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="closeModal"></div>
      <div class="glass-strong w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl relative z-10 animate-slide-up">
        <div class="sticky top-0 glass-strong border-b border-white/10 p-6 flex items-center justify-between z-20">
          <div>
            <h2 class="text-2xl font-bold">{{ selectedApp.candidate_profiles?.users?.name }}</h2>
            <p class="text-gray-400">{{ selectedApp.jobs?.title }}</p>
          </div>
          <button @click="closeModal" class="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <p class="text-[10px] text-gray-500 uppercase font-bold mb-2">Точный Мэтчинг</p>
              <div class="text-4xl font-bold text-gradient">{{ Math.round(selectedApp.match_score || 0) }}%</div>
              <p class="text-[8px] text-gray-600 mt-2">Базируется на AI анализе опыта и навыков</p>
            </div>
            <div class="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <p class="text-[10px] text-gray-500 uppercase font-bold mb-2">Шанс Найма</p>
              <div class="text-4xl font-bold text-secondary">{{ Math.round(selectedApp.hiring_probability || 0) }}%</div>
              <p class="text-[8px] text-gray-600 mt-2">Прогноз на основе исторических данных</p>
            </div>
            <div class="glass p-6 rounded-2xl md:col-span-2">
              <h3 class="font-bold mb-4 text-xs uppercase text-gray-400">Заявленные Навыки</h3>
              <div class="flex flex-wrap gap-2">
                <div v-for="skill in selectedApp.candidate_profiles?.skills" :key="skill.name" class="glass px-3 py-1 rounded-full text-xs">
                  <span class="text-gray-300">{{ skill.name }}</span>
                  <span class="ml-2 text-primary font-bold">{{ skill.level }}%</span>
                </div>
              </div>
              <p v-if="!selectedApp.candidate_profiles?.skills?.length" class="text-sm text-gray-500">Навыки не указаны</p>
            </div>
          </div>

          <!-- Interview Details -->
          <div v-if="selectedApp.interviews?.length && selectedApp.interviews[0].status === 'completed'" class="glass p-6 rounded-2xl border border-primary/20 bg-primary/5">
            <h3 class="font-bold text-lg mb-6 flex items-center gap-2">Отчет AI-интервью</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div class="glass p-4 rounded-xl text-center bg-black/20">
                <p class="text-[10px] text-gray-500 uppercase mb-1">Итоговый балл</p>
                <p class="text-2xl font-black text-primary">{{ selectedApp.interviews[0].result_score }}</p>
              </div>
              <div class="glass p-4 rounded-xl text-center bg-black/20">
                <p class="text-[10px] text-gray-500 uppercase mb-1">Тех. знания</p>
                <p class="text-2xl font-black text-secondary">{{ selectedApp.interviews[0].technical_score }}</p>
              </div>
              <div class="glass p-4 rounded-xl text-center bg-black/20">
                <p class="text-[10px] text-gray-500 uppercase mb-1">Soft Skills</p>
                <p class="text-2xl font-black text-yellow-500">{{ selectedApp.interviews[0].soft_skills_score }}</p>
              </div>
              <div class="glass p-4 rounded-xl text-center bg-black/20">
                <p class="text-[10px] text-gray-500 uppercase mb-1">Коммуникация</p>
                <p class="text-2xl font-black text-blue-500">{{ selectedApp.interviews[0].communication_score }}</p>
              </div>
            </div>
            <p class="text-sm text-gray-300 leading-relaxed">{{ selectedApp.interviews[0].summary }}</p>
          </div>

          <!-- Resume analysis and other sections ... -->

          <div class="flex items-center space-x-4">
            <template v-if="selectedApp.status === 'pending'">
              <button @click="updateStatus(selectedApp, 'approved')" class="btn-primary flex-1 py-4">Принять кандидата</button>
              <button @click="updateStatus(selectedApp, 'rejected')" class="glass flex-1 py-4 rounded-2xl hover:bg-red-500/20 text-red-400 font-bold border border-red-500/10">Отклонить</button>
            </template>
            <template v-else-if="selectedApp.status === 'approved'">
              <button @click="inviteToInterview" class="btn-secondary flex-1 py-4">Назначить AI интервью</button>
              <div class="glass px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs border border-primary/20 text-primary">Кандидат принят</div>
            </template>
            <div v-else class="w-full text-center py-4 glass rounded-2xl font-bold uppercase tracking-widest text-sm" :class="getStatusClass(selectedApp.status)">
              Статус: {{ getStatusText(selectedApp.status) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const authStore = useAuthStore()
const loading = ref(false)
const employerJobs = ref([])
const selectedJobId = ref('')
const statusFilter = ref('all')
const applications = ref([])
const selectedApp = ref(null)

const API_BASE = 'http://localhost:3000/api'

const getStatusClass = (status) => {
  const classes = { pending: 'bg-gray-500/20 text-gray-400', approved: 'bg-primary/20 text-primary', rejected: 'bg-red-500/20 text-red-400', interview: 'bg-secondary/20 text-secondary' }
  return `px-4 py-1 rounded-full text-xs font-semibold ${classes[status] || 'bg-gray-500/20'}`
}

const getStatusText = (status) => {
  const texts = { pending: 'Новый', approved: 'Принят', rejected: 'Отклонен', interview: 'Интервью', completed: 'Завершено' }
  return texts[status] || status
}

const formatDate = (date) => new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })

const loadEmployerJobs = async () => {
  const { data: company } = await supabase.from('companies').select('id').eq('owner_id', authStore.user.id).single()
  if (company) {
    const { data: jobs } = await supabase.from('jobs').select('id, title').eq('company_id', company.id)
    employerJobs.value = jobs || []
  }
}

const loadApplications = async () => {
  if (!authStore.user?.id) return
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/applications/employer/${authStore.user.id}`)
    const data = await res.json()
    
    // Enrich with batch ML predictions
    const batchItems = data.map(app => ({
      candidate_skills: app.candidate_profiles?.skills?.map(s => `${s.name}:${s.level || 50}`).join(', ') || 'generic',
      job_skills: app.jobs?.job_skills?.map(s => s.skill_name).join(', ') || 'generic',
      experience_years: app.candidate_profiles?.experience_years || 0,
      reputation_score: app.jobs?.companies?.reputation_score || 80
    }))

    const mlRes = await fetch(`${API_BASE}/predict/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: batchItems })
    })
    const mlData = await mlRes.json()

    let enriched = data.map((app, i) => ({
      ...app,
      match_score: mlData[i].match_score,
      hiring_probability: mlData[i].hiring_probability
    }))

    // Auto-ranking Logic
    enriched.sort((a, b) => {
      if (b.match_score !== a.match_score) return b.match_score - a.match_score
      return b.hiring_probability - a.hiring_probability
    })

    if (selectedJobId.value) enriched = enriched.filter(app => app.job_id === selectedJobId.value)
    if (statusFilter.value !== 'all') enriched = enriched.filter(app => app.status === statusFilter.value)
    
    applications.value = enriched.slice(0, 10)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const openModal = (app) => selectedApp.value = app
const closeModal = () => selectedApp.value = null

const updateStatus = async (app, status) => {
  const res = await fetch(`${API_BASE}/applications/${app.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  if (res.ok) {
    app.status = status
    closeModal()
    loadApplications()
  }
}

onMounted(async () => {
  await loadEmployerJobs()
  await loadApplications()
})
</script>