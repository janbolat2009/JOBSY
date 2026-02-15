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
              <p class="text-xs text-gray-400">{{ $t('dashboard.employer') }}</p>
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
      <div class="mb-8 animate-slide-up flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold mb-2">{{ $t('dashboard.title') }} <span class="text-gradient">JOBSY</span></h1>
          <p class="text-gray-400">Управляйте вакансиями и кандидатами в реальном времени</p>
        </div>
        <button @click="showCreateJob = true" class="btn-primary flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          <span>Создать вакансию</span>
        </button>
      </div>

      <div v-if="hotCandidates.length > 0" class="mb-8 animate-slide-up">
        <div class="flex items-center space-x-2 mb-4">
          <div class="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          <h2 class="text-xl font-bold text-red-400">Горячие кандидаты</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="hot in hotCandidates" :key="hot.id" class="glass-strong border border-red-500/20 p-4 rounded-2xl relative overflow-hidden group hover:bg-red-500/5 transition-all cursor-pointer" @click="$router.push('/employer/applications')">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold text-red-500 uppercase tracking-widest">Только что открыл вакансию</span>
              <span class="text-[10px] text-gray-500">{{ hot.time }}</span>
            </div>
            <h3 class="font-bold truncate">{{ hot.name }}</h3>
            <p class="text-xs text-gray-400 mb-3 truncate">{{ hot.job_title }}</p>
            <div class="flex items-center justify-between">
              <div class="text-lg font-black text-red-400">{{ hot.match }}% Match</div>
              <button class="text-[10px] bg-red-500 text-white px-2 py-1 rounded-lg">Срочно</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div v-for="stat in ['jobs', 'applications', 'approved', 'interviews']" :key="stat" class="card-glass animate-slide-up cursor-pointer hover:bg-white/5 transition-all">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-300 capitalize">{{ stat === 'jobs' ? 'Вакансий' : stat === 'applications' ? 'Откликов' : stat === 'approved' ? 'Одобрено' : 'Интервью' }}</h3>
            <div class="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gradient">{{ stats[stat] }}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6 text-white">
          <div class="card-glass h-full">
            <h2 class="text-xl font-bold mb-6">Топ-10 кандидатов по ML</h2>
            <div v-if="loadingCandidates" class="py-12 flex justify-center"><div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
            <div v-else class="space-y-4">
              <div v-for="(c, i) in topCandidates" :key="c.id" class="glass p-4 rounded-2xl flex items-center justify-between group hover:bg-white/5 cursor-pointer" @click="$router.push('/employer/applications')">
                <div class="flex items-center space-x-4">
                  <span class="text-xs font-bold text-gray-500">#{{ i+1 }}</span>
                  <div class="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-dark font-bold">{{ (c.name || 'K')[0] }}</div>
                  <div>
                    <h4 class="font-bold group-hover:text-primary transition-colors">{{ c.name }}</h4>
                    <p class="text-[10px] text-gray-500 uppercase">{{ c.position }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-primary font-bold">{{ c.matchScore }}%</div>
                  <div class="text-[8px] text-gray-500">Шанс: {{ c.hiringProbability }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="space-y-6">
          <div class="card-glass">
            <h3 class="font-semibold mb-4">Активные вакансии</h3>
            <div class="space-y-3">
              <div v-for="job in activeJobs" :key="job.id" class="glass p-3 rounded-2xl">
                <h4 class="font-semibold text-sm">{{ job.title }}</h4>
                <div class="flex justify-between text-[10px] text-gray-400 mt-2">
                  <span>{{ job.applicants }} откликов</span>
                  <span class="text-primary">{{ job.approved }} принято</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showCreateJob" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div class="glass-strong rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up border border-white/10">
        <h2 class="text-2xl font-bold mb-6">Новая вакансия</h2>
        <form @submit.prevent="createJob" class="space-y-4 text-white">
          <div class="glass p-4 rounded-2xl border border-primary/20 bg-primary/5 mb-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-primary flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                AI Ассистент
              </h3>
            </div>
            <div class="flex gap-2">
              <input v-model="aiBrief" type="text" class="input-glass text-sm" placeholder="Напиши кратко: 'Python разраб, удаленка, 300к'..." @keyup.enter.prevent="generateWithAI">
              <button @click.prevent="generateWithAI" :disabled="generating" class="btn-primary py-2 px-4 whitespace-nowrap text-sm">
                <span v-if="generating" class="animate-spin">⌛</span>
                <span v-else>✨ Авто-заполнение</span>
              </button>
            </div>
          </div>

          <input v-model="newJob.title" @input="updateSalaryEstimate" type="text" class="input-glass" placeholder="Название (например: Senior Python Developer)" required>
          <div class="grid grid-cols-2 gap-4">
            <input v-model="newJob.city" @input="updateSalaryEstimate" type="text" class="input-glass" placeholder="Город">
            <select v-model="newJob.type" class="input-glass">
              <option value="Full-time">Полная занятость</option>
              <option value="Part-time">Частичная занятость</option>
              <option value="Internship">Стажировка</option>
              <option value="Contract">Проектная работа</option>
            </select>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select v-model="newJob.experience_years" @change="updateSalaryEstimate" class="input-glass">
              <option :value="0">Без опыта</option>
              <option :value="2">1-3 года</option>
              <option :value="5">3-6 лет</option>
              <option :value="8">6+ лет</option>
            </select>
            <div v-if="newJob.city.toLowerCase().includes('удаленка') || newJob.city.toLowerCase().includes('удаленная')" class="flex items-center space-x-2 text-primary text-xs">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
               <span>Дистанционная работа</span>
            </div>
          </div>
          
          <div v-if="salaryEstimate && salaryEstimate.low" class="glass p-5 rounded-2xl border border-primary/20 bg-primary/5 transition-all">
            <div class="flex items-center justify-between mb-3">
              <p class="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Прогноз зарплаты по рынку</p>
              <div class="flex gap-2">
                <button v-if="!isEditingSalary" @click.prevent="isEditingSalary = true" class="text-[10px] text-primary hover:underline">Изменить</button>
                <button v-else @click.prevent="isEditingSalary = false" class="text-[10px] text-green-400 font-bold">ОК</button>
              </div>
            </div>
            
            <div v-if="!isEditingSalary" class="text-2xl font-black text-primary flex items-baseline gap-2">
              <span>{{ (salaryEstimate?.low || 0).toLocaleString() }}</span>
              <span class="text-sm font-normal text-gray-500">—</span>
              <span>{{ (salaryEstimate?.high || 0).toLocaleString() }}</span>
              <span class="text-sm font-bold ml-1">{{ salaryEstimate?.currency || '₸' }}</span>
            </div>
            
            <div v-else class="flex items-center gap-3 animate-fade-in">
              <input v-model.number="salaryEstimate.low" type="number" class="input-glass py-1 px-2 text-sm w-full" placeholder="От">
              <span class="text-gray-500">—</span>
              <input v-model.number="salaryEstimate.high" type="number" class="input-glass py-1 px-2 text-sm w-full" placeholder="До">
              <span class="font-bold text-primary">{{ salaryEstimate?.currency || '₸' }}</span>
            </div>
            
            <p v-if="!isEditingSalary" class="text-[8px] text-gray-500 mt-2">Основано на анализе данных по Казахстану</p>
          </div>

          <textarea v-model="newJob.description" rows="6" class="input-glass" placeholder="Описание вакансии"></textarea>
          <button type="submit" class="btn-primary w-full py-4 text-lg mt-4 shadow-xl shadow-primary/20">Опубликовать вакансию</button>
          <button @click="showCreateJob = false" type="button" class="w-full text-gray-500 py-2">Отмена</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const initials = computed(() => (user.value?.name || 'C').slice(0, 2).toUpperCase())

const loading = ref(true)
const loadingCandidates = ref(false)
const showCreateJob = ref(false)
const stats = ref({ jobs: 0, applications: 0, approved: 0, interviews: 0, rejected: 0 })
const topCandidates = ref([])
const activeJobs = ref([])
const hotCandidates = ref([])
const salaryEstimate = ref(null)

const newJob = ref({ title: '', city: 'Астана', experience_years: 2, description: '', salary: '', type: 'Full-time' })
const aiBrief = ref('')
const generating = ref(false)
const isEditingSalary = ref(false)

const generateWithAI = async () => {
  if (!aiBrief.value) return
  generating.value = true
  try {
    const res = await fetch(`${API_BASE}/ai/generate-job-desc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief: aiBrief.value })
    })
    const data = await res.json()
    if (data.title) {
      newJob.value.title = data.title
      newJob.value.description = data.description
      newJob.value.experience_years = data.experience_years || 2
      
      const lowerBrief = aiBrief.value.toLowerCase()
      if (lowerBrief.includes('удаленка') || lowerBrief.includes('удаленная')) {
        newJob.value.city = 'Удаленная работа'
      } else {
        newJob.value.city = data.city || 'Астана'
      }
      
      if (lowerBrief.includes('стажировка')) newJob.value.type = 'Internship'
      else if (lowerBrief.includes('парт тайм') || lowerBrief.includes('частичная')) newJob.value.type = 'Part-time'
      
      updateSalaryEstimate()
    }
  } catch (e) {
    console.error(e)
  } finally {
    generating.value = false
  }
}

let realtimeSubscription = null

const updateSalaryEstimate = async () => {
  if (newJob.value.title.length < 3) return
  try {
    const res = await fetch(`${API_BASE}/salary/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJob.value)
    })
    salaryEstimate.value = await res.json()
  } catch (e) { console.error(e) }
}

const loadDashboard = async () => {
  const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.value.id).single()
  if (!company) return
  
  const { data: jobs } = await supabase.from('jobs').select('id, title').eq('company_id', company.id)
  stats.value.jobs = jobs?.length || 0
  
  if (jobs?.length) {
    const ids = jobs.map(j => j.id)
    const { data: apps } = await supabase.from('applications').select('*').in('job_id', ids)
    stats.value.applications = apps?.length || 0
    stats.value.approved = apps?.filter(a => a.status === 'approved').length || 0
    stats.value.interviews = apps?.filter(a => a.status === 'interview' || a.status === 'completed').length || 0
    
    const { data: top } = await supabase.from('applications').select('*, candidate_profiles(users(name)), jobs(title)').in('job_id', ids).order('match_score', { ascending: false }).limit(10)
    topCandidates.value = top?.map(t => ({
      id: t.id,
      name: t.candidate_profiles?.users?.name,
      position: t.jobs?.title,
      matchScore: Math.round(t.match_score),
      hiringProbability: Math.round(t.hiring_probability)
    })) || []
    
    activeJobs.value = jobs.map(j => ({ id: j.id, title: j.title, applicants: apps?.filter(a => a.job_id === j.id).length || 0, approved: apps?.filter(a => a.job_id === j.id && (a.status === 'approved' || a.status === 'interview')).length || 0 }))
  }

  realtimeSubscription = supabase.channel('hot-candidates')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'applications' }, async (payload) => {
      const { data: appDetail } = await supabase.from('applications').select('*, candidate_profiles(users(name)), jobs(title)').eq('id', payload.new.id).single()
      if (appDetail && appDetail.match_score > 85) {
        hotCandidates.value.unshift({
          id: appDetail.id,
          name: appDetail.candidate_profiles.users.name,
          job_title: appDetail.jobs.title,
          match: Math.round(appDetail.match_score),
          time: '1 сек. назад'
        })
        if (hotCandidates.value.length > 5) hotCandidates.value.pop()
      }
    })
    .subscribe()
}

const createJob = async () => {
  try {
    const { data: company, error: companyError } = await supabase.from('companies').select('id').eq('owner_id', user.value.id).maybeSingle()
    
    if (companyError || !company) {
      alert('Ошибка: Компания не найдена. Убедитесь, что ваш профиль заполнен.')
      return
    }

    const { error: jobError } = await supabase.from('jobs').insert({
      company_id: company.id,
      title: newJob.value.title,
      description: newJob.value.description,
      salary: salaryEstimate.value ? `${salaryEstimate.value.low} - ${salaryEstimate.value.high} ${salaryEstimate.value.currency}` : '',
      location: newJob.value.city,
      type: newJob.value.type
    })

    if (jobError) {
      alert('Ошибка при сохранении вакансии: ' + jobError.message)
      return
    }

    showCreateJob.value = false
    loadDashboard()
  } catch (e) {
    console.error(e)
    alert('Произошла непредвиденная ошибка')
  }
}

const handleLogout = async () => { await authStore.logout(); router.push('/') }

onMounted(loadDashboard)
onUnmounted(() => { if (realtimeSubscription) supabase.removeChannel(realtimeSubscription) })
</script>