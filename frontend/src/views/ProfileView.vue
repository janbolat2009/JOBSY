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
      <div class="mb-8 animate-slide-up">
        <h1 class="text-3xl md:text-4xl font-bold mb-2">Мой <span class="text-gradient">профиль</span></h1>
        <p class="text-gray-400">Заполните профиль для расчета вашей рыночной стоимости</p>
      </div>

      <div v-if="loading" class="text-center py-20">
        <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>

      <div v-else class="space-y-8">
        <!-- Market Value Card -->
        <div v-if="salaryEstimate" class="card-glass bg-primary/5 border-primary/20 animate-slide-up">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xs font-bold text-primary uppercase tracking-widest mb-2">Ваша рыночная стоимость</h3>
              <div class="text-3xl font-black text-white">{{ salaryEstimate.low.toLocaleString() }} — {{ salaryEstimate.high.toLocaleString() }} {{ salaryEstimate.currency }}</div>
              <p class="text-[10px] text-gray-500 mt-2">Оценка на основе {{ profile.position }} ({{ profile.experience_years }} лет опыта)</p>
            </div>
            <div class="hidden md:block">
              <div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div class="card-glass">
          <div class="flex items-center justify-between mb-8">
             <div class="flex items-center space-x-6">
                <div class="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-4xl font-bold text-dark">{{ initials }}</div>
                <div>
                  <h1 class="text-3xl font-bold mb-1">{{ user?.name }}</h1>
                  <p class="text-xl text-primary">{{ profile.position || 'Должность не указана' }}</p>
                </div>
             </div>
             <button @click="editingMain = !editingMain" class="glass px-4 py-2 rounded-xl text-sm">{{ editingMain ? 'Отмена' : 'Редактировать' }}</button>
          </div>

          <div v-if="editingMain" class="space-y-4 animate-slide-up">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input v-model="editedProfile.position" type="text" class="input-glass" placeholder="Должность">
              <input v-model="editedProfile.location" type="text" class="input-glass" placeholder="Город">
              <input v-model.number="editedProfile.experience_years" type="number" class="input-glass" placeholder="Лет опыта">
            </div>
            <button @click="saveProfile" class="btn-primary w-full">Сохранить</button>
          </div>
          
          <div v-else class="grid grid-cols-3 gap-4">
            <div class="glass p-4 rounded-xl text-center">
              <p class="text-2xl font-bold text-gradient">{{ profile.experience_years || 0 }}</p>
              <p class="text-[10px] text-gray-500 uppercase">Опыт</p>
            </div>
            <div class="glass p-4 rounded-xl text-center">
              <p class="text-2xl font-bold text-gradient">{{ skills.length }}</p>
              <p class="text-[10px] text-gray-500 uppercase">Навыков</p>
            </div>
            <div class="glass p-4 rounded-xl text-center">
              <p class="text-2xl font-bold text-gradient">{{ profile.projects_count || 0 }}</p>
              <p class="text-[10px] text-gray-500 uppercase">Проектов</p>
            </div>
          </div>
        </div>

        <!-- Recommendations Section -->
        <div class="card-glass">
          <h2 class="text-xl font-bold mb-6">Персональные рекомендации (ML)</h2>
          <div v-if="recommendations.length > 0" class="space-y-4">
            <div v-for="job in recommendations" :key="job.id" @click="$router.push(`/job/${job.id}`)" class="glass p-4 rounded-2xl cursor-pointer hover:bg-white/5 transition-all flex justify-between items-center group">
              <div>
                <h4 class="font-bold group-hover:text-primary transition-colors">{{ job.title }}</h4>
                <p class="text-xs text-gray-400">{{ job.companies?.name }} • {{ job.location }}</p>
              </div>
              <div class="text-right">
                <div class="text-primary font-bold">{{ Math.round(job.match_score) }}%</div>
                <div class="text-[10px] text-gray-500">Мэтчинг</div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500 text-sm">Нет данных для рекомендаций</div>
        </div>

        <!-- About Section -->
        <div class="card-glass">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">О себе</h2>
            <button @click="editingAbout = !editingAbout" class="text-sm text-primary">{{ editingAbout ? 'Отмена' : 'Изм.' }}</button>
          </div>
          <div v-if="!editingAbout" class="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{{ profile.about || 'Расскажите о своем опыте...' }}</div>
          <div v-else class="space-y-4">
            <textarea v-model="editedAbout" rows="5" class="input-glass"></textarea>
            <button @click="saveAbout" class="btn-primary w-full">Сохранить</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const initials = computed(() => (user.value?.name || 'U').slice(0, 2).toUpperCase())

const loading = ref(true)
const profile = ref({})
const editedProfile = ref({})
const skills = ref([])
const recommendations = ref([])
const salaryEstimate = ref(null)

const editingAbout = ref(false)
const editedAbout = ref('')
const editingMain = ref(false)

const API_BASE = 'http://localhost:3000/api'

const loadProfile = async () => {
  if (!user.value?.id) return
  try {
    const res = await fetch(`${API_BASE}/profile/candidate/${user.value.id}`)
    const data = await res.json()
    profile.value = data
    editedProfile.value = { ...data }
    editedAbout.value = data.about || ''
    skills.value = data.skills || []
    
    // Calculate Salary Estimate
    if (data.position) {
      const sRes = await fetch(`${API_BASE}/salary/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: data.position, city: data.location, experience_years: data.experience_years })
      })
      if (sRes.ok) salaryEstimate.value = await sRes.json()
    }

    // Load Recs
    const rRes = await fetch(`${API_BASE}/predict/recommendations/${data.id}`)
    if (rRes.ok) recommendations.value = await rRes.json()

  } catch (err) { console.error(err) }
  finally { loading.value = false }
}

const saveProfile = async () => {
  const res = await fetch(`${API_BASE}/profile/candidate/${user.value.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(editedProfile.value)
  })
  if (res.ok) {
    editingMain.value = false
    loadProfile()
  }
}

const saveAbout = async () => {
  const res = await fetch(`${API_BASE}/profile/candidate/${user.value.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ about: editedAbout.value })
  })
  if (res.ok) {
    editingAbout.value = false
    loadProfile()
  }
}

const handleLogout = async () => { await authStore.logout(); router.push('/') }

onMounted(loadProfile)
</script>