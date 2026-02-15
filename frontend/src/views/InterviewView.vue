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
          
          <h1 class="text-xl font-bold">AI-Интервью</h1>
          
          <button v-if="interview?.status === 'in_progress'" @click="completeInterview" class="btn-primary px-4 py-2">
            Завершить интервью
          </button>
        </div>
      </div>
    </header>
    
    <main class="max-w-4xl mx-auto px-4 py-8">
      <div v-if="loading" class="text-center py-20">
        <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="mt-4 text-gray-400">Загрузка интервью...</p>
      </div>

      <div v-else-if="error" class="text-center py-20 glass rounded-3xl">
        <div class="text-red-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold mb-2">Ошибка загрузки</h2>
        <p class="text-gray-400 mb-6">{{ error }}</p>
        <button @click="loadInterview" class="btn-primary">Попробовать снова</button>
      </div>
      
      <div v-else-if="interview" class="space-y-6">
        <div class="glass p-6 rounded-3xl">
          <div class="flex items-start space-x-4 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold">{{ candidateName }}</h2>
              <p class="text-sm text-gray-400">{{ jobTitle }}</p>
              <div class="flex items-center space-x-2 mt-2">
                <span :class="getStatusClass(interview.status)">
                  {{ getStatusText(interview.status) }}
                </span>
                <span v-if="interview.score" class="glass px-3 py-1 rounded-full text-sm font-semibold text-primary">
                  Оценка: {{ interview.score }}/100
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="glass rounded-3xl overflow-hidden">
          <div class="p-6 border-b border-white/10">
            <h3 class="text-lg font-semibold flex items-center space-x-2">
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              <span>Диалог с AI</span>
            </h3>
          </div>
          
          <div class="h-96 overflow-y-auto p-6 space-y-4" ref="chatContainer">
            <div v-if="displayedMessages.length === 0 && !loading" class="text-center py-10">
              <p class="text-gray-400 mb-4">Интервью еще не началось.</p>
              <button @click="startNewInterview" :disabled="aiThinking" class="btn-primary px-8">
                Начать интервью
              </button>
            </div>

            <div v-for="(msg, index) in displayedMessages" :key="index" :class="msg.role === 'assistant' ? 'flex justify-start' : 'flex justify-end'">
              <div :class="msg.role === 'assistant' ? 'glass max-w-[80%] p-4 rounded-2xl rounded-tl-none' : 'bg-primary text-dark max-w-[80%] p-4 rounded-2xl rounded-tr-none'">
                <p class="whitespace-pre-wrap">{{ msg.content }}</p>
              </div>
            </div>
            
            <div v-if="aiThinking" class="flex justify-start">
              <div class="glass max-w-[80%] p-4 rounded-2xl rounded-tl-none">
                <div class="flex space-x-2">
                  <div class="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  <div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-6 border-t border-white/10">
            <form @submit.prevent="sendMessage" class="flex space-x-3">
              <input v-model="userMessage" type="text" placeholder="Введите ваш ответ..." class="input-glass flex-1" required :disabled="aiThinking">
              <button type="submit" :disabled="aiThinking" class="btn-primary px-6">
                Отправить
              </button>
            </form>
          </div>
        </div>

        <div v-if="evaluation && user?.role === 'employer'" class="glass p-6 rounded-3xl">
          <h3 class="text-xl font-bold mb-6 flex items-center space-x-2">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>Итоговая оценка (для работодателя)</span>
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="glass p-4 rounded-xl text-center">
              <p class="text-sm text-gray-400 mb-1">Общая оценка</p>
              <p class="text-3xl font-bold text-primary">{{ evaluation.overall_score || evaluation.result_score }}/100</p>
            </div>
            <div class="glass p-4 rounded-xl text-center">
              <p class="text-sm text-gray-400 mb-1">Коммуникация</p>
              <p class="text-3xl font-bold text-secondary">{{ evaluation.communication_skills || evaluation.communication_score }}/100</p>
            </div>
            <div class="glass p-4 rounded-xl text-center">
              <p class="text-sm text-gray-400 mb-1">Технические навыки</p>
              <p class="text-3xl font-bold text-yellow-400">{{ evaluation.technical_competence || evaluation.technical_score }}/100</p>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="glass p-4 rounded-xl">
              <h4 class="font-semibold mb-2">Мотивация и Soft Skills</h4>
              <div class="flex items-center space-x-3">
                <div class="flex-1 bg-dark rounded-full h-2">
                  <div class="bg-primary h-2 rounded-full" :style="{ width: (evaluation.motivation || evaluation.soft_skills_score || 0) + '%' }"></div>
                </div>
                <span class="font-bold">{{ evaluation.motivation || evaluation.soft_skills_score }}/100</span>
              </div>
            </div>
            
            <div v-if="evaluation.summary || evaluation.result_summary" class="glass p-4 rounded-xl">
              <h4 class="font-semibold mb-2">Резюме</h4>
              <p class="text-gray-300">{{ evaluation.summary || evaluation.result_summary }}</p>
            </div>
            
            <div v-if="evaluation.recommendation" class="glass p-4 rounded-xl">
              <h4 class="font-semibold mb-2">Рекомендация</h4>
              <span :class="getRecommendationClass(evaluation.recommendation)">
                {{ getRecommendationText(evaluation.recommendation) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="interview?.status === 'completed' && user?.role === 'candidate'" class="glass p-8 rounded-3xl text-center animate-slide-up">
          <div class="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold mb-4">Спасибо за интервью!</h3>
          <p class="text-gray-400 mb-8 max-w-md mx-auto">
            Ваши ответы и навыки были тщательно проанализированы нашей ML-моделью. Шанс успешного прохождения на эту роль составляет:
          </p>
          <div class="relative inline-block mb-8">
            <div class="text-6xl font-black text-gradient">{{ Math.round(interview.applications?.hiring_probability || interview.result_score || 0) }}%</div>
            <div class="text-xs text-gray-500 uppercase tracking-tighter mt-1 font-bold">Вероятность найма</div>
          </div>
          <p class="text-sm text-gray-500 max-w-sm mx-auto">
            Ожидайте ответа от работодателя. Результаты интервью будут доступны в вашей панели управления.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const loading = ref(true)
const error = ref(null)
const API_BASE = '/api'
const interview = ref(null)
const messages = ref([])
const displayedMessages = ref([])
const userMessage = ref('')
const aiThinking = ref(false)
const evaluation = ref(null)
const chatContainer = ref(null)

const candidateName = computed(() => interview.value?.applications?.candidate_profiles?.users?.name || 'Кандидат')
const jobTitle = computed(() => interview.value?.applications?.jobs?.title || 'Вакансия')

const getStatusClass = (status) => {
  const classes = {
    in_progress: 'bg-secondary/20 text-secondary',
    completed: 'bg-green-500/20 text-green-400',
    pending: 'bg-gray-500/20 text-gray-400'
  }
  return `px-4 py-1 rounded-full text-xs font-semibold ${classes[status] || 'bg-gray-500/20 text-gray-400'}`
}

const getStatusText = (status) => {
  const texts = {
    pending: 'Ожидает начала',
    in_progress: 'В процессе',
    completed: 'Завершено'
  }
  return texts[status] || status
}

const getRecommendationClass = (recommendation) => {
  const classes = {
    hire: 'px-4 py-2 bg-green-500/20 text-green-400 rounded-xl font-semibold',
    consider: 'px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl font-semibold',
    reject: 'px-4 py-2 bg-red-500/20 text-red-400 rounded-xl font-semibold'
  }
  return classes[recommendation] || classes.consider
}

const getRecommendationText = (recommendation) => {
  const texts = {
    hire: 'Рекомендуется нанять',
    consider: 'Рассмотреть дополнительно',
    reject: 'Не рекомендуется'
  }
  return texts[recommendation] || recommendation
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const loadInterview = async () => {
  loading.value = true
  
  try {
    const response = await fetch(`${API_BASE}/interview/${route.params.id}`)
    const data = await response.json()
    
    interview.value = data
    
    if (data.messages && Array.isArray(data.messages)) {
      messages.value = data.messages
      displayedMessages.value = [...messages.value]
    } else if (data.conversation_history && Array.isArray(data.conversation_history)) {
      messages.value = data.conversation_history.filter(msg => msg.role !== 'system' && msg.role !== 'system_prompt')
      displayedMessages.value = [...messages.value]
    }
    
    if (data.status === 'completed') {
      evaluation.value = {
        result_score: data.result_score,
        technical_score: data.technical_score,
        soft_skills_score: data.soft_skills_score,
        communication_score: data.communication_score,
        summary: data.summary,
        recommendation: data.recommendation,
        strengths: data.strengths,
        weaknesses: data.weaknesses
      }
    } else if (data.evaluation) {
      try {
        evaluation.value = typeof data.evaluation === 'string' ? JSON.parse(data.evaluation) : data.evaluation
      } catch (e) {
        console.error('Failed to parse evaluation:', e)
      }
    }
    
    // Auto-start if no messages
    if (displayedMessages.value.length === 0 && data.status !== 'completed' && user.value?.role === 'candidate') {
      await startNewInterview()
    }
    
    await scrollToBottom()
  } catch (err) {
    console.error('Load interview error:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const startNewInterview = async () => {
  aiThinking.value = true
  try {
    const response = await fetch(`${API_BASE}/interview/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interview_id: interview.value?.id || route.params.id })
    })
    const data = await response.json()
    if (data.success) {
      const aiMessage = { role: 'assistant', content: data.message }
      messages.value = [aiMessage]
      displayedMessages.value = [aiMessage]
    } else {
      throw new Error(data.error || 'Не удалось запустить интервью')
    }
  } catch (err) {
    console.error('Start interview error:', err)
    const fallbackMsg = { 
      role: 'assistant', 
      content: 'Привет! Я ваш AI-интервьюер. К сожалению, произошла небольшая техническая ошибка при инициализации, но мы можем начать. Расскажите, пожалуйста, о своем опыте работы.' 
    }
    messages.value = [fallbackMsg]
    displayedMessages.value = [fallbackMsg]
  } finally {
    aiThinking.value = false
  }
}

const sendMessage = async () => {
  if (!userMessage.value.trim()) return
  
  const message = userMessage.value
  userMessage.value = ''
  
  const newMessage = { role: 'user', content: message }
  messages.value.push(newMessage)
  displayedMessages.value.push(newMessage)
  await scrollToBottom()
  
  aiThinking.value = true
  
  try {
    const response = await fetch(`${API_BASE}/interview/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interview_id: interview.value?.id || route.params.id,
        message
      })
    })
    
    const data = await response.json()
    
    if (data.success && data.message) {
      const aiMessage = { role: 'assistant', content: data.message }
      messages.value.push(aiMessage)
      displayedMessages.value.push(aiMessage)
      await scrollToBottom()
    } else {
      alert('Ошибка: ' + (data.error || 'Не удалось получить ответ от AI'))
    }
  } catch (error) {
    console.error('Send message error:', error)
    alert('Ошибка отправки сообщения: ' + error.message)
  } finally {
    aiThinking.value = false
  }
}

const completeInterview = async () => {
  if (!confirm('Вы уверены, что хотите завершить интервью?')) return
  
  loading.value = true
  
  try {
    const response = await fetch(`${API_BASE}/interview/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interview_id: interview.value?.id || route.params.id })
    })
    
    const data = await response.json()
    
    if (data.success) {
      evaluation.value = typeof data.evaluation === 'string' ? JSON.parse(data.evaluation) : data.evaluation
      interview.value.status = 'completed'
      interview.value.score = data.evaluation.overall_score
      
      alert('Интервью успешно завершено!')
    }
  } catch (error) {
    console.error('Complete interview error:', error)
    alert('Ошибка завершения интервью: ' + error.message)
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, () => {
  loadInterview()
})

onMounted(() => {
  loadInterview()
})
</script>