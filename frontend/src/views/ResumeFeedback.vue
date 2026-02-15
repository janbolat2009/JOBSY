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
      <button @click="$router.go(-1)" class="glass p-3 rounded-xl mb-8 hover:bg-white/10 transition-all flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        <span>Назад</span>
      </button>

      <div class="mb-8 animate-slide-up">
        <h1 class="text-3xl md:text-4xl font-bold mb-2">
          AI анализ <span class="text-gradient">резюме</span>
        </h1>
        <p class="text-gray-400">Загрузите PDF/TXT или вставьте текст</p>
      </div>

      <div class="card-glass">
        <form @submit.prevent="analyzeResume" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Загрузить резюме (PDF или TXT)</label>
            <input 
              type="file" 
              @change="handleFileUpload" 
              accept=".pdf,.txt" 
              class="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-dark hover:file:bg-primary/90 cursor-pointer"
            />
            <p v-if="uploadedFileName" class="text-green-400 text-sm mt-2">✓ {{ uploadedFileName }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Текст резюме</label>
            <textarea v-model="resumeText" rows="10" class="input-glass resize-none" placeholder="Вставьте текст вашего резюме или загрузите файл выше..."></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Желаемая вакансия (опционально)</label>
              <input v-model="targetJob" type="text" class="input-glass" placeholder="Frontend Developer">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Ваш опыт (лет)</label>
              <input v-model.number="experienceYears" type="number" min="0" max="50" class="input-glass" placeholder="5">
            </div>
          </div>

          <button type="submit" :disabled="analyzing" class="w-full btn-primary">
            <span v-if="!analyzing">Анализировать резюме</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Анализ...
            </span>
          </button>
        </form>

        <div v-if="analysis" class="mt-10 space-y-8">
          <div class="glass p-6 rounded-2xl">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-bold">Общая оценка</h2>
              <span class="text-4xl font-bold text-gradient">{{ analysis.overall_score }}/100</span>
            </div>
            <div class="w-full bg-dark-lighter rounded-full h-3">
              <div class="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-1000" :style="{ width: analysis.overall_score + '%' }"></div>
            </div>
            <p class="text-sm text-gray-400 mt-2">Совпадение с вакансией: {{ analysis.match_score }}%</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="glass p-5 rounded-2xl">
              <h3 class="font-semibold text-lg mb-4 text-green-400">Сильные стороны</h3>
              <ul class="space-y-3 text-sm">
                <li v-for="(item, index) in analysis.strengths.split('\n').filter(Boolean)" :key="index" class="flex items-start">
                  <svg class="w-5 h-5 mr-3 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ item }}
                </li>
              </ul>
            </div>

            <div class="glass p-5 rounded-2xl">
              <h3 class="font-semibold text-lg mb-4 text-red-400">Слабые стороны</h3>
              <ul class="space-y-3 text-sm">
                <li v-for="(item, index) in analysis.weaknesses.split('\n').filter(Boolean)" :key="index" class="flex items-start">
                  <svg class="w-5 h-5 mr-3 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>

          <div class="glass p-6 rounded-2xl">
            <h3 class="font-semibold text-lg mb-4 text-blue-400">Рекомендации по улучшению</h3>
            <ol class="space-y-3 text-sm list-decimal pl-5">
              <li v-for="(item, index) in analysis.recommendations.split('\n').filter(Boolean)" :key="index">
                {{ item }}
              </li>
            </ol>
          </div>

          <button @click="saveAnalysis" class="w-full btn-primary">
            Сохранить анализ в профиль
          </button>
        </div>

        <div v-if="error" class="mt-6 glass p-4 border border-red-500/50 rounded-2xl text-red-400 text-center">
          {{ error }}
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const initials = computed(() => {
  const name = user.value?.name || 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const resumeText = ref('')
const targetJob = ref('')
const experienceYears = ref(0)
const uploadedFileName = ref('')
const analyzing = ref(false)
const analysis = ref(null)
const error = ref('')

const extractTextFromPDF = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const typedarray = new Uint8Array(e.target.result)
        const pdf = await pdfjsLib.getDocument(typedarray).promise
        let fullText = ''
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items.map(item => item.str).join(' ')
          fullText += pageText + '\n'
        }
        
        resolve(fullText)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.includes('pdf') && !file.type.includes('text')) {
    error.value = 'Поддерживаются только PDF и TXT файлы'
    return
  }

  analyzing.value = true
  error.value = ''

  try {
    uploadedFileName.value = file.name

    if (file.type.includes('pdf')) {
      resumeText.value = await extractTextFromPDF(file)
    } else {
      const text = await file.text()
      resumeText.value = text
    }
  } catch (err) {
    console.error('File processing error:', err)
    error.value = 'Ошибка обработки файла: ' + err.message
  } finally {
    analyzing.value = false
  }
}

const analyzeResume = async () => {
  if (!resumeText.value.trim()) {
    error.value = 'Введите текст резюме или загрузите файл'
    return
  }

  analyzing.value = true
  error.value = ''
  analysis.value = null

  try {
    const response = await fetch(`${API_BASE}/resume-analysis/analyze-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume_text: resumeText.value,
        target_job: targetJob.value || null,
        experience_years: experienceYears.value || 0
      })
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('Analysis fetch failed:', response.status, text)
      throw new Error(`Server returned ${response.status}: ${text.slice(0, 100)}`)
    }

    const result = await response.json()

    if (result.error) {
      throw new Error(result.error)
    }

    analysis.value = result.analysis
  } catch (err) {
    console.error('Ошибка анализа:', err)
    error.value = err.message || 'Не удалось проанализировать резюме'
  } finally {
    analyzing.value = false
  }
}

const saveAnalysis = async () => {
  if (!analysis.value) return

  try {
    const { error: updateError } = await supabase
      .from('candidate_profiles')
      .update({
        resume_feedback: analysis.value
      })
      .eq('user_id', user.value.id)

    if (updateError) throw updateError

    alert('Анализ сохранен в профиль')
  } catch (err) {
    console.error('Ошибка сохранения:', err)
    alert('Не удалось сохранить анализ')
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>