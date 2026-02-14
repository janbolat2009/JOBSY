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
              Мои <span class="text-gradient">вакансии</span>
            </h1>
            <p class="text-gray-400">Все активные и закрытые вакансии вашей компании</p>
          </div>
          <button @click="showCreateJob = true" class="btn-primary flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Создать вакансию</span>
          </button>
        </div>
  
        <div v-if="loading" class="text-center py-20">
          <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
  
        <div v-else-if="jobs.length === 0" class="text-center py-20 glass rounded-3xl">
          <h3 class="text-2xl font-semibold mb-4 text-gray-300">У вас пока нет вакансий</h3>
          <p class="text-gray-400 mb-6">Создайте первую вакансию и начните поиск кандидатов</p>
          <button @click="showCreateJob = true" class="btn-primary">
            Создать вакансию
          </button>
        </div>
  
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="job in jobs" :key="job.id"
               @click="openJobDetails(job)"
               class="glass p-6 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
            
            <div class="flex justify-between items-start mb-4 relative z-10">
              <h3 class="font-bold text-xl group-hover:text-primary transition-colors">{{ job.title }}</h3>
              <span :class="getStatusBadgeClass(job.status)" class="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                {{ getStatusText(job.status) }}
              </span>
            </div>
  
            <p class="text-gray-400 text-sm mb-6 line-clamp-2">{{ job.description }}</p>
  
            <div class="flex flex-wrap gap-2 mb-6">
              <span v-for="skill in job.skills?.slice(0, 3)" :key="skill" class="glass-light px-3 py-1 rounded-lg text-xs font-medium text-gray-300">
                {{ skill }}
              </span>
              <span v-if="job.skills?.length > 3" class="text-gray-500 text-xs flex items-center self-center">+{{ job.skills.length - 3 }}</span>
            </div>
  
            <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-500 border-t border-white/5 pt-4">
              <div class="flex items-center space-x-3">
                <span class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {{ job.location }}
                </span>
              </div>
              <div class="flex items-center space-x-4">
                <span class="text-primary">{{ job.applicants || 0 }} откликов</span>
              </div>
            </div>
          </div>
        </div>
      </main>
  
      <!-- Modal: Create/Edit Job -->
      <div v-if="showCreateJob || editingJob" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" @click.self="closeModals">
        <div class="glass-strong rounded-[2.5rem] p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up relative border border-white/10">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-3xl font-black text-gradient">{{ editingJob ? 'Редактировать вакансию' : 'Создать вакансию' }}</h2>
              <p class="text-gray-400 text-sm mt-1">Заполните детали для привлечения лучших талантов</p>
            </div>
            <button @click="closeModals" class="glass p-3 rounded-2xl hover:bg-white/10 transition-all text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
  
          <form @submit.prevent="saveJob" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Компания</label>
                <input v-model="jobForm.company_name" type="text" required class="input-glass py-4" placeholder="Название">
              </div>
              <div class="space-y-2">
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Название вакансии</label>
                <input v-model="jobForm.title" type="text" required class="input-glass py-4" placeholder="Напр: Senior Designer">
              </div>
            </div>
  
            <div class="space-y-2">
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Описание роли</label>
              <textarea v-model="jobForm.description" rows="4" required class="input-glass resize-none py-4" placeholder="Расскажите о позиции..."></textarea>
            </div>
  
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-2">
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Локация</label>
                <select v-model="jobForm.location" required class="input-glass py-4">
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
  
              <div class="space-y-2">
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Занятость</label>
                <select v-model="jobForm.type" required class="input-glass py-4">
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Статус</label>
                <select v-model="jobForm.status" required class="input-glass py-4">
                  <option value="active">Активна</option>
                  <option value="closed">Закрыта</option>
                  <option value="draft">Черновик</option>
                </select>
              </div>
            </div>
  
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div class="space-y-2">
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Зарплатная вилка</label>
                <input v-model="jobForm.salary" type="text" class="input-glass py-4" placeholder="Напр: $100k - $150k">
              </div>
              <div class="space-y-2">
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Навыки (через запятую)</label>
                <input v-model="jobForm.skills" type="text" class="input-glass py-4" placeholder="Vue, React, Node.js">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Обязанности</label>
                <textarea v-model="jobForm.responsibilities" rows="3" class="input-glass resize-none py-4" placeholder="Что нужно будет делать..."></textarea>
              </div>
              <div class="space-y-2">
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Требования</label>
                <textarea v-model="jobForm.requirements" rows="3" class="input-glass resize-none py-4" placeholder="Что мы ждем от кандидата..."></textarea>
              </div>
            </div>

            <!-- AI Instructions Section -->
            <div class="glass p-6 rounded-3xl border border-primary/20 bg-primary/5 space-y-4">
              <div class="flex items-center gap-3 text-primary">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <h3 class="font-bold text-sm uppercase tracking-widest">Инструкции для AI-интервьюера</h3>
              </div>
              <div class="space-y-2">
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-tighter ml-1">Настройте тон и фокус беседы</label>
                <textarea v-model="jobForm.ai_instructions" rows="3" class="input-glass resize-none py-4 bg-black/20" 
                          placeholder="Напр: Будь немного мягче, спроси про опыт работы с высоконагруженными системами и обязательно уточни про готовность к релокации..."></textarea>
              </div>
              <p class="text-[10px] text-gray-500 italic">Эти инструкции будут учтены ИИ при проведении интервью с кандидатами на эту вакансию.</p>
            </div>
  
            <div class="flex gap-4">
              <button v-if="editingJob" type="button" @click="confirmDelete" class="glass px-8 py-4 rounded-2xl hover:bg-red-500/20 text-red-500 transition-all font-bold">Удалить</button>
              <button type="submit" :disabled="saving" class="flex-1 btn-primary py-4 text-lg">
                <span v-if="!saving">{{ editingJob ? 'Сохранить изменения' : 'Опубликовать вакансию' }}</span>
                <span v-else class="flex items-center justify-center">
                  <div class="animate-spin h-5 w-5 border-2 border-dark border-t-transparent rounded-full mr-3"></div>
                  Загрузка...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
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
  
  const loading = ref(true)
  const showCreateJob = ref(false)
  const editingJob = ref(null)
  const saving = ref(false)
  const jobs = ref([])
  
  const jobForm = ref({
    company_name: '',
    title: '',
    description: '',
    location: 'Remote',
    type: 'Full-time',
    salary: '',
    skills: '',
    responsibilities: '',
    requirements: '',
    ai_instructions: '',
    status: 'active'
  })

  const resetForm = () => {
    jobForm.value = {
      company_name: '',
      title: '',
      description: '',
      location: 'Remote',
      type: 'Full-time',
      salary: '',
      skills: '',
      responsibilities: '',
      requirements: '',
      ai_instructions: '',
      status: 'active'
    }
  }
  
  const getStatusBadgeClass = (status) => {
    const classes = {
      active: 'bg-green-500/20 text-green-400',
      closed: 'bg-red-500/20 text-red-400',
      draft: 'bg-yellow-500/20 text-yellow-400'
    }
    return `px-3 py-1 rounded-full ${classes[status] || 'bg-gray-500/20 text-gray-400'}`
  }
  
  const getStatusText = (status) => {
    const texts = { active: 'Активна', closed: 'Закрыта', draft: 'Черновик' }
    return texts[status] || status
  }

  const openJobDetails = (job) => {
    editingJob.value = job
    jobForm.value = {
      ...job,
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills,
      company_name: job.companies?.name || ''
    }
  }

  const closeModals = () => {
    showCreateJob.value = false
    editingJob.value = null
    resetForm()
  }
  
  const getCompanyId = async (companyName) => {
    if (!user.value?.id) return null

    // If editing, use existing company association
    if (editingJob.value) {
      return editingJob.value.company_id
    }

    const { data: companies } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.value.id)
      .limit(1)

    if (companies?.[0]) return companies[0].id

    // Create new company if none exists
    const { data: newCompany, error } = await supabase
      .from('companies')
      .insert({ owner_id: user.value.id, name: companyName || 'My Company' })
      .select('id')
      .single()

    return newCompany?.id || null
  }
  
  const loadJobs = async () => {
    loading.value = true
    try {
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.value.id)

      if (!companies?.length) {
        jobs.value = []
        return
      }

      const companyIds = companies.map(c => c.id)
  
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (name),
          applications:applications (count)
        `)
        .in('company_id', companyIds)
        .order('created_at', { ascending: false })
  
      if (error) throw error
  
      jobs.value = data?.map(job => ({
        ...job,
        applicants: job.applications?.[0]?.count || 0
      })) || []
    } catch (err) {
      console.error('Jobs load error:', err)
    } finally {
      loading.value = false
    }
  }
  
  const saveJob = async () => {
    saving.value = true
    try {
      const companyId = await getCompanyId(jobForm.value.company_name)
      if (!companyId) throw new Error('Company not found')

      const jobData = {
        company_id: companyId,
        title: jobForm.value.title,
        description: jobForm.value.description,
        location: jobForm.value.location,
        type: jobForm.value.type,
        salary: jobForm.value.salary,
        responsibilities: jobForm.value.responsibilities,
        requirements: jobForm.value.requirements,
        ai_instructions: jobForm.value.ai_instructions,
        status: jobForm.value.status,
        skills: jobForm.value.skills ? jobForm.value.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      }

      let res;
      if (editingJob.value) {
        res = await supabase.from('jobs').update(jobData).eq('id', editingJob.value.id)
      } else {
        res = await supabase.from('jobs').insert(jobData)
      }

      if (res.error) throw res.error
      
      await loadJobs()
      closeModals()
    } catch (err) {
      alert('Ошибка при сохранении: ' + (err.message || err))
    } finally {
      saving.value = false
    }
  }

  const confirmDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту вакансию?')) return
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', editingJob.value.id)
      if (error) throw error
      await loadJobs()
      closeModals()
    } catch (err) {
      alert('Ошибка при удалении: ' + err.message)
    }
  }
  
  const handleLogout = async () => {
    await authStore.logout()
    router.push('/')
  }
  
  onMounted(loadJobs)
  </script>