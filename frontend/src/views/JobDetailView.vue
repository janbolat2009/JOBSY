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

    <main class="max-w-4xl mx-auto px-4 py-8">
      <button @click="$router.go(-1)" class="glass p-3 rounded-xl mb-8 hover:bg-white/10 transition-all flex items-center">
        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Назад
      </button>

      <div v-if="loading" class="text-center py-20">
        <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>

      <div v-else-if="job" class="space-y-8">
        <div class="glass p-6 rounded-3xl">
          <div class="flex items-start justify-between mb-6">
            <div class="flex-1">
              <h1 class="text-3xl font-bold mb-2">{{ job.title }}</h1>
              <p class="text-xl text-primary mb-2">{{ job.companies?.name || 'Company' }}</p>
              <div class="flex items-center space-x-4 text-sm text-gray-400">
                <span>{{ job.location }}</span>
                <span>{{ job.type }}</span>
                <span class="text-primary font-semibold">{{ job.salary }}</span>
              </div>
            </div>
            <div v-if="prediction" class="glass px-4 py-2 rounded-full text-sm font-semibold text-primary">
              {{ Math.round(prediction.match_score) }}% match
            </div>
          </div>

          <div v-if="prediction" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="glass p-4 rounded-xl text-center">
              <h3 class="font-semibold mb-1 text-sm text-gray-400">Мэтчинг</h3>
              <p class="text-3xl font-bold text-primary">{{ Math.round(prediction.match_score) }}%</p>
              <p class="text-xs text-gray-400 mt-1">Основано на навыках</p>
            </div>
            <div class="glass p-4 rounded-xl text-center">
              <h3 class="font-semibold mb-1 text-sm text-gray-400">Шанс найма</h3>
              <p class="text-3xl font-bold text-secondary">{{ Math.round(prediction.hiring_probability) }}%</p>
              <p class="text-xs text-gray-400 mt-1">Прогноз AI модели</p>
            </div>
            <div class="glass p-4 rounded-xl text-center">
              <h3 class="font-semibold mb-1 text-sm text-gray-400">Репутация Компании</h3>
              <p class="text-3xl font-bold text-yellow-500">{{ prediction.company_reputation }}</p>
              <p class="text-xs text-gray-400 mt-1">Скор доверия</p>
            </div>
          </div>

          <div class="space-y-6">
            <div>
              <h3 class="font-semibold mb-2">Описание</h3>
              <p class="text-gray-300 whitespace-pre-wrap">{{ job.description }}</p>
            </div>
            <div>
              <h3 class="font-semibold mb-2">Требуемые навыки</h3>
              <div class="flex flex-wrap gap-2">
                <span v-for="skill in job.skills" :key="skill" class="glass px-3 py-1 rounded-full text-sm">
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="user?.role === 'candidate'" class="glass p-6 rounded-3xl">
          <h3 class="text-xl font-bold mb-4">Откликнуться на вакансию</h3>
          <form @submit.prevent="submitApplication" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Сопроводительное письмо</label>
              <textarea v-model="coverLetter" rows="5" required class="input-glass resize-none" placeholder="Почему вы подходите?"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Текст резюме</label>
              <textarea v-model="resumeText" rows="10" required class="input-glass resize-none" placeholder="Вставьте текст резюме..."></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Ссылка на резюме (PDF/Cloud)</label>
              <input v-model="resumeUrl" type="url" class="input-glass" placeholder="https://...">
            </div>

            <button type="submit" :disabled="submitting || !candidateId" class="w-full btn-primary">
              <span v-if="!submitting">Отправить отклик</span>
              <span v-else>Отправка...</span>
            </button>
          </form>
        </div>
      </div>

      <div v-if="errorMessage" class="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-400 text-center">
        {{ errorMessage }}
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const loading = ref(true)
const job = ref(null)
const prediction = ref(null)
const coverLetter = ref('')
const resumeText = ref('')
const resumeUrl = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const candidateId = ref(null)

const initials = computed(() => {
  const name = user.value?.name || 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const loadJob = async () => {
  const { data, error } = await supabase.from('jobs').select(`*, companies (name, reputation_score), job_skills (skill_name)`).eq('id', route.params.id).single()
  if (error) errorMessage.value = 'Ошибка загрузки'
  else job.value = { ...data, skills: data.job_skills?.map(s => s.skill_name) || [] }
}

const loadPrediction = async () => {
  if (user.value?.role !== 'candidate') return
  try {
    let { data: profile } = await supabase.from('candidate_profiles').select('id').eq('user_id', user.value.id).single()
    if (!profile) {
      const resp = await fetch('http://localhost:3000/api/profile/candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.value.id })
      })
      profile = await resp.json()
    }
    if (profile?.id) {
      candidateId.value = profile.id
      const res = await fetch('http://localhost:3000/api/predict/candidate-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_id: profile.id, job_id: route.params.id })
      })
      const result = await res.json()
      if (!result.error) prediction.value = result
    }
  } catch (err) { console.error(err) }
}

const submitApplication = async () => {
  submitting.value = true
  try {
    const res = await fetch('http://localhost:3000/api/applications/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: route.params.id,
        candidate_id: candidateId.value,
        resume_url: resumeUrl.value,
        resume_text: resumeText.value,
        cover_letter: coverLetter.value,
        match_score: prediction.value?.match_score || 0
      })
    })
    if (!res.ok) throw new Error('Ошибка отправки')
    alert('Успешно!')
    router.push('/applications')
  } catch (err) { errorMessage.value = err.message }
  finally { submitting.value = false }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(async () => {
  loading.value = true
  await loadJob()
  await loadPrediction()
  loading.value = false
})
</script>